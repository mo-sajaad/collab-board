import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

import Task from "../../components/Task";
import { getUserTasks, updateTask, createTask } from "../../api/tasks";

// =====================
// Droppable Column
// =====================
function DroppableColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 min-h-[200px] p-2 rounded-xl transition-all
        ${
          isOver
            ? "bg-primary/10 border-2 border-primary"
            : "border-2 border-transparent"
        }`}
    >
      {children}
    </div>
  );
}

// =====================
// Main Board
// =====================
export default function Board() {
  const { id: boardId } = useParams();

  const stages = ["Not Completed", "Pending", "Complete"];

  const [tasksByStage, setTasksByStage] = useState({
    "Not Completed": [],
    Pending: [],
    Complete: [],
  });

  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW: input state per column
  const [newTaskInputs, setNewTaskInputs] = useState({});

  // =====================
  // Fetch Tasks
  // =====================
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await getUserTasks();

        const grouped = {
          "Not Completed": [],
          Pending: [],
          Complete: [],
        };

        tasks.forEach((task) => {
          if (boardId && task.board_id !== Number(boardId)) return;

          const status = task.status || "Not Completed";

          grouped[status]?.push({
            id: String(task.task_id),
            title: task.title,
            description: task.description,
            due_date: task.due_date,
          });
        });

        setTasksByStage(grouped);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [boardId]);

  // =====================
  // Add Task
  // =====================
  const handleAddTask = async (stage) => {
    const title = newTaskInputs[stage]?.trim();
    if (!title) return;

    try {
      const newTask = await createTask({
        title,
        status: stage,
        board_id: Number(boardId),
      });

      // optimistic UI
      setTasksByStage((prev) => ({
        ...prev,
        [stage]: [
          {
            id: String(newTask.task_id),
            title: newTask.title,
            description: newTask.description,
            due_date: newTask.due_date,
          },
          ...prev[stage],
        ],
      }));

      // clear input
      setNewTaskInputs((prev) => ({
        ...prev,
        [stage]: "",
      }));
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  // =====================
  // Drag sensors
  // =====================
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // =====================
  // Helpers
  // =====================
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

  // =====================
  // Drag Start
  // =====================
  const handleDragStart = ({ active }) => {
    const stage = findContainer(active.id);
    if (!stage) return;

    const task = tasksByStage[stage].find((t) => t.id === active.id);
    setActiveTask(task);
  };

  // =====================
  // Drag End
  // =====================
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

    setTasksByStage((prev) => {
      const source = prev[fromStage];
      const destination = prev[toStage];

      const newSource = [...source];
      const newDestination = [...destination];

      const [movedTask] = newSource.splice(fromIndex, 1);

      if (fromStage === toStage) {
        return {
          ...prev,
          [fromStage]: arrayMove([...source], fromIndex, toIndex),
        };
      }

      if (isDroppingOnColumn) {
        newDestination.push(movedTask);
      } else {
        newDestination.splice(toIndex, 0, movedTask);
      }

      return {
        ...prev,
        [fromStage]: newSource,
        [toStage]: newDestination,
      };
    });

    if (fromStage !== toStage) {
      try {
        await updateTask(activeId, { status: toStage });
      } catch (err) {
        console.error("Failed to update task status", err);
      }
    }
  };

  // =====================
  // UI
  // =====================
  if (loading) {
    return <p className="text-center mt-10 text-muted">Loading board...</p>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <div
            key={stage}
            className="flex flex-col gap-4 bg-muted/30 p-4 rounded-xl min-h-[300px]"
          >
            <h2 className="text-foreground text-xl font-semibold">
              {stage}
            </h2>

            {/* Add Task Input */}
            <div className="flex gap-2">
              <input
                placeholder="Add task..."
                value={newTaskInputs[stage] || ""}
                onChange={(e) =>
                  setNewTaskInputs((prev) => ({
                    ...prev,
                    [stage]: e.target.value,
                  }))
                }
                className="flex-1 p-1 text-sm border rounded bg-transparent"
              />
              <button
                onClick={() => handleAddTask(stage)}
                className="px-2 bg-primary text-white rounded"
              >
                +
              </button>
            </div>

            <DroppableColumn id={stage}>
              <SortableContext
                items={tasksByStage[stage].map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasksByStage[stage].length === 0 && (
                  <div className="text-sm text-muted text-center py-6 border-2 border-dashed rounded-lg">
                    Drop tasks here
                  </div>
                )}

                {tasksByStage[stage].map((task) => (
                  <Task key={task.id} id={task.id} task={task} />
                ))}
              </SortableContext>
            </DroppableColumn>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 scale-105 opacity-90">
            <Task id={activeTask.id} task={activeTask} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}