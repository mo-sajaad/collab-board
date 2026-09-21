import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa6";

import Task from "../../components/Task";
import ProgressBar from "../../components/ProgressBar";
import { getBoard, deleteBoard, getBoardTasks } from "../../api/boards";
import { updateTask, createTask } from "../../api/tasks";

// Droppable Column Wrapper
function DroppableColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 min-h-[220px] p-2 rounded-xl transition-all duration-200 ${
        isOver
          ? "bg-green-400/10 border-2 border-dashed border-green-400"
          : "border-2 border-transparent"
      }`}
    >
      {children}
    </div>
  );
}

export default function Board() {
  const { id: boardId } = useParams();
  const navigate = useNavigate();

  const stages = useMemo(() => ["To Do", "In Progress", "Done"], []);

  const [board, setBoard] = useState(null);
  const [tasksByStage, setTasksByStage] = useState({
    "To Do": [],
    "In Progress": [],
    Done: [],
  });

  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskInputs, setNewTaskInputs] = useState({});

  // Board deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Helper to calculate fractional position
  const calculateNewPosition = (items, targetIndex) => {
    if (items.length === 0) {
      return 1000;
    }
    // Placed at the very top
    if (targetIndex === 0) {
      return (Number(items[0].position) || 1000) / 2;
    }
    // Placed at the very bottom
    if (targetIndex >= items.length) {
      return (Number(items[items.length - 1].position) || 0) + 1000;
    }
    // Placed between two existing tasks
    const prevPos = Number(items[targetIndex - 1].position) || 0;
    const nextPos = Number(items[targetIndex].position) || prevPos + 1000;
    return (prevPos + nextPos) / 2;
  };

  // Load Board Info & Tasks
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [boardData, allTasks] = await Promise.all([
          getBoard(boardId),
          getBoardTasks(boardId),
        ]);

        setBoard(boardData);

        const grouped = {
          "To Do": [],
          "In Progress": [],
          Done: [],
        };

        allTasks.forEach((task) => {
          if (boardId && Number(task.board_id) !== Number(boardId)) return;

          const status = stages.includes(task.status) ? task.status : "To Do";

          grouped[status]?.push({
            id: String(task.task_id),
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            position:
              task.position !== null && task.position !== undefined
                ? Number(task.position)
                : 1000,
          });
        });

        // Ensure tasks inside each stage are sorted by position ascending
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

    if (boardId) {
      fetchData();
    }
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

  // Add Task
  const handleAddTask = async (stage) => {
    const title = newTaskInputs[stage]?.trim();
    if (!title) return;

    const columnTasks = tasksByStage[stage];
    // Put newly added task at the top
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
        id: String(newTask.task_id),
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

      setNewTaskInputs((prev) => ({
        ...prev,
        [stage]: "",
      }));
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  // Delete Board
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

  // Drag Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const findContainer = (id) => {
    if (tasksByStage[id]) return id;
    for (const stage of stages) {
      if (tasksByStage[stage].some((task) => task.id === id)) {
        return stage;
      }
    }
    return null;
  };

  const findTaskIndex = (stage, id) => {
    return tasksByStage[stage].findIndex((t) => t.id === id);
  };

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

    if (stages.includes(overId)) {
      toStage = overId;
    }

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

        reordered[toIndex] = {
          ...movedTask,
          position: computedPosition,
        };

        return {
          ...prev,
          [fromStage]: reordered,
        };
      }

      const destination = [...prev[toStage]];
      const targetIndex = isDroppingOnColumn ? destination.length : toIndex;

      computedPosition = calculateNewPosition(destination, targetIndex);

      destination.splice(targetIndex, 0, {
        ...movedTask,
        position: computedPosition,
      });

      return {
        ...prev,
        [fromStage]: source,
        [toStage]: destination,
      };
    });

    try {
      await updateTask(activeId, {
        status: toStage,
        position: computedPosition,
      });
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
      {/* Top Board Overview Card */}
      <div className="bg-card border-2 border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted rounded-lg 
              border border-border hover:bg-muted/20 hover:text-foreground transition-all duration-200 active:scale-95"
          >
            <FaArrowLeft className="text-xs" />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 rounded-lg 
              border border-red-500/20 hover:bg-red-500/10 transition-colors active:scale-95"
          >
            <FaTrash className="text-xs" />
            Delete Board
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {board?.name || "Board"}
            </h1>
            <p className="text-sm text-muted mt-1">
              {board?.description || "No description provided."}
            </p>
          </div>

          <div className="w-full md:w-64 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted">
              <span>Overall Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <ProgressBar progress={progressPercent} />
          </div>
        </div>
      </div>

      {/* Brand Gradient Rule */}
      <hr className="h-1 rounded border-0 bg-linear-to-r from-green-400 to-cyan-400 my-1" />

      {/* Board Columns Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {stages.map((stage) => (
            <div
              key={stage}
              className="flex flex-col gap-3 bg-card border-2 border-border rounded-xl p-4 shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    {stage}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted/20 text-muted">
                    {tasksByStage[stage].length}
                  </span>
                </div>
              </div>

              {/* Add Task Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTask(stage);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="New task..."
                  value={newTaskInputs[stage] || ""}
                  onChange={(e) =>
                    setNewTaskInputs((prev) => ({
                      ...prev,
                      [stage]: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg outline-none 
                    focus:ring-2 focus:ring-green-400 transition-all text-foreground"
                />
                <button
                  type="submit"
                  aria-label={`Add task to ${stage}`}
                  className="px-3 py-1.5 bg-linear-to-r from-green-400 to-cyan-400 text-black font-semibold 
                    rounded-lg text-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  <FaPlus className="text-xs" />
                </button>
              </form>

              {/* Droppable Area */}
              <DroppableColumn id={stage}>
                <SortableContext
                  items={tasksByStage[stage].map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tasksByStage[stage].length === 0 && (
                    <div className="text-xs text-muted text-center py-8 border-2 border-dashed border-border rounded-lg">
                      No tasks yet. Drop or add one above.
                    </div>
                  )}

                  {tasksByStage[stage].map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/task/${task.id}`)}
                      className="cursor-pointer"
                    >
                      <Task id={task.id} task={task} />
                    </div>
                  ))}
                </SortableContext>
              </DroppableColumn>
            </div>
          ))}
        </div>

        {/* Drag Overlay Preview */}
        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 scale-105 opacity-90 pointer-events-none shadow-2xl">
              <Task id={activeTask.id} task={activeTask} isOverlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Delete Board Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-card border-2 border-border rounded-xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2 text-foreground">
              Delete Board
            </h2>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{board?.name || "this board"}"
              </span>
              ? All columns and tasks inside will be permanently removed.
            </p>

            {deleteError && (
              <p className="text-xs text-red-500 mb-3">{deleteError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/20 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteBoard}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}