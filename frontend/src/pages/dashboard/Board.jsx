import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import Task from "../../components/Task";
import BoardHeader from "../../components/board/BoardHeader";
import BoardColumn from "../../components/board/BoardColumn";
import BoardMembersModal from "../../components/board/BoardMembersModal";
import DeleteModal from "../../components/DeleteModal";

import { getBoard, deleteBoard, getBoardTasks } from "../../api/boards";
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from "../../api/tasks";

export default function Board() {
  const { id: boardId } = useParams();
  const navigate = useNavigate();

  const stages = useMemo(() => ["To Do", "In Progress", "Done"], []);

  const [board, setBoard] = useState(null);
  const [tasksByStage, setTasksByStage] = useState({
    "To Do": [],
    "In Progress": [],
    "Done": [],
  });

  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Fractional Position Helper
  const calculateNewPosition = (items, targetIndex) => {
    if (items.length === 0) return 1000;
    if (targetIndex === 0) return (Number(items[0].position) || 1000) / 2;
    if (targetIndex >= items.length)
      return (Number(items[items.length - 1].position) || 0) + 1000;

    const prevPos = Number(items[targetIndex - 1].position) || 0;
    const nextPos = Number(items[targetIndex].position) || prevPos + 1000;
    return (prevPos + nextPos) / 2;
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Execute board metadata and board task requests in parallel
        const [boardData, allTasks] = await Promise.all([
          getBoard(boardId),
          getBoardTasks(boardId),
        ]);

        setBoard(boardData);

        // Initialize columns matching the defined stages
        const grouped = { "To Do": [], "In Progress": [], "Done": [] };

        allTasks.forEach((task) => {
          // Guard against mismatched board IDs if backend returns extra tasks
          if (boardId && Number(task.board_id) !== Number(boardId)) return;

          // Fallback to "To Do" if task status is unknown/missing
          const status = stages.includes(task.status) ? task.status : "To Do";

          grouped[status]?.push({
            id: String(task.task_id || task.id),
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            position:
              task.position !== null && task.position !== undefined
                ? Number(task.position)
                : 1000,
          });
        });

        // Sort tasks within each column by fractional position value
        stages.forEach((stage) => {
          grouped[stage].sort((a, b) => a.position - b.position);
        });

        setTasksByStage(grouped);
      } catch (err) {
        console.error("Failed to load board data", err);
      } finally {
        setLoading(false);
      }
    };

    if (boardId) fetchData();
  }, [boardId, stages]);

  // Compute live progress percentage
  const progressPercent = useMemo(() => {
    const total =
      tasksByStage["To Do"].length +
      tasksByStage["In Progress"].length +
      tasksByStage["Done"].length;
    if (total === 0) return 0;
    return Math.round((tasksByStage["Done"].length / total) * 100);
  }, [tasksByStage]);

  // Create Task API
  const handleAddTask = async (stage, title) => {
    const columnTasks = tasksByStage[stage];
    const newPosition =
      columnTasks.length > 0
        ? (Number(columnTasks[0].position) || 1000) / 2
        : 1000;

    try {
      const newTask = await createTask({
        title,
        status: stage,
        board_id: Number(boardId),
        position: newPosition,
      });

      const formattedTask = {
        id: String(newTask.task_id || newTask.id),
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.due_date,
        position:
          newTask.position !== undefined && newTask.position !== null
            ? Number(newTask.position)
            : newPosition,
      };

      setTasksByStage((prev) => ({
        ...prev,
        [stage]: [formattedTask, ...prev[stage]],
      }));
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  // Get Single Task API
  const handleFetchTask = async (taskId) => {
    try {
      const taskData = await getTask(taskId);
      return taskData;
    } catch (err) {
      console.error(`Failed to fetch details for task ${taskId}`, err);
      throw err;
    }
  };

  // Update Task API (Title, Description, Due Date, etc.)
  const handleUpdateTask = async (taskId, stage, updatedPayload) => {
    try {
      const updatedTask = await updateTask(taskId, updatedPayload);

      setTasksByStage((prev) => ({
        ...prev,
        [stage]: prev[stage].map((task) =>
          task.id === String(taskId)
            ? {
                ...task,
                ...updatedTask,
                id: String(updatedTask.task_id || updatedTask.id || taskId),
              }
            : task
        ),
      }));
    } catch (err) {
      console.error(`Failed to update task ${taskId}`, err);
    }
  };

  // Delete Task API
  const handleDeleteTask = async (taskId, stage) => {
    try {
      await deleteTask(taskId);
      setTasksByStage((prev) => ({
        ...prev,
        [stage]: prev[stage].filter((t) => t.id !== String(taskId)),
      }));
    } catch (err) {
      console.error(`Failed to delete task ${taskId}`, err);
    }
  };

  // Delete Board API
  const handleDeleteBoard = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBoard(boardId);
      navigate("/");
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to delete board. Please try again.");
      setIsDeleting(false);
    }
  };

  // DnD Sensors & Logic
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const findContainer = (id) => {
    if (tasksByStage[id]) return id;
    for (const stage of stages) {
      if (tasksByStage[stage].some((task) => task.id === id)) return stage;
    }
    return null;
  };

  const findTaskIndex = (stage, id) =>
    tasksByStage[stage].findIndex((t) => t.id === id);

  const handleDragStart = ({ active }) => {
    const stage = findContainer(active.id);
    if (!stage) return;
    const task = tasksByStage[stage].find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const fromStage = findContainer(activeId);
    let toStage = findContainer(overId);

    if (stages.includes(overId)) toStage = overId;
    if (!fromStage || !toStage) return;

    const fromIndex = findTaskIndex(fromStage, activeId);
    const toIndex = findTaskIndex(toStage, overId);

    if (fromIndex === -1) return;

    const isDroppingOnColumn = stages.includes(overId);
    const isDroppingOnTask = toIndex !== -1;

    if (!isDroppingOnColumn && !isDroppingOnTask) return;

    let computedPosition = 1000;

    setTasksByStage((prev) => {
      const source = [...prev[fromStage]];
      const [movedTask] = source.splice(fromIndex, 1);

      if (fromStage === toStage) {
        const reordered = arrayMove([...prev[fromStage]], fromIndex, toIndex);
        const remaining = prev[fromStage].filter((t) => t.id !== activeId);
        computedPosition = calculateNewPosition(remaining, toIndex);

        reordered[toIndex] = { ...movedTask, position: computedPosition };
        return { ...prev, [fromStage]: reordered };
      }

      const destination = [...prev[toStage]];
      const targetIndex = isDroppingOnColumn ? destination.length : toIndex;

      computedPosition = calculateNewPosition(destination, targetIndex);
      destination.splice(targetIndex, 0, { ...movedTask, position: computedPosition });

      return { ...prev, [fromStage]: source, [toStage]: destination };
    });

    try {
      await updateTask(activeId, { status: toStage, position: computedPosition });
    } catch (err) {
      console.error("Failed to persist task movement", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted">
        <p>Loading board...</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 flex flex-col gap-4">
      {/* Top Header */}
      <BoardHeader
        board={board}
        progressPercent={progressPercent}
        onOpenMembers={() => setIsMembersModalOpen(true)}
        onOpenDelete={() => {
          setDeleteError(null);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Brand Divider */}
      <hr className="h-1 rounded border-0 bg-linear-to-r from-green-400 to-cyan-400 my-1" />

      {/* DnD Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {stages.map((stage) => (
            <BoardColumn
              key={stage}
              stage={stage}
              tasks={tasksByStage[stage]}
              onAddTask={handleAddTask}
              onDeleteTask={(taskId) => handleDeleteTask(taskId, stage)}
              onUpdateTask={(taskId, payload) =>
                handleUpdateTask(taskId, stage, payload)
              }
              onFetchTask={handleFetchTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 scale-105 opacity-90 pointer-events-none shadow-2xl">
              <Task id={activeTask.id} task={activeTask} isOverlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBoard}
        title="Delete Board"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{board?.name || "this board"}"
            </span>
            ? All columns and tasks inside will be permanently removed.
          </>
        }
        isDeleting={isDeleting}
        error={deleteError}
      />

      <BoardMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        boardId={boardId}
        currentMembers={board?.members || []}
        onMembersUpdated={() => {
          getBoard(boardId).then((data) => setBoard(data));
        }}
      />
    </div>
  );
}