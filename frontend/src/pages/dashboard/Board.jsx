import { useState } from "react";
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

function DroppableColumn({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 min-h-[200px] p-2 rounded-xl transition-all
        ${isOver ? "bg-primary/10 border-2 border-primary" : "border-2 border-transparent"}
      `}
    >
      {children}
    </div>
  );
}

export default function Board() {
  const stages = ["Not Started", "In Progress", "Complete"];

  const initialTasks = {
    "Not Started": [
      {
        id: "1",
        title: "Task 1",
        due_date: "05/04/26",
        description: "Design login page",
      },
      {
        id: "2",
        title: "Task 2",
        due_date: "06/04/26",
        description: "Set up auth",
      },
    ],
    "In Progress": [
      {
        id: "3",
        title: "Task 3",
        due_date: "07/04/26",
        description: "Create dashboard",
      },
    ],
    Complete: [
      {
        id: "4",
        title: "Task 4",
        due_date: "08/04/26",
        description: "Deploy project",
      },
    ],
  };

  const [tasksByStage, setTasksByStage] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState(null);

  // Prevent accidental drag on click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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

  const handleDragEnd = ({ active, over }) => {
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

    // Invalid drop
    if (!isDroppingOnColumn && !isDroppingOnTask) return;

    setTasksByStage((prev) => {
      const source = prev[fromStage];
      const destination = prev[toStage];

      if (!source || !destination) return prev;

      // clone separately
      const newSource = [...source];
      const newDestination = [...destination];

      const [movedTask] = newSource.splice(fromIndex, 1);
      if (!movedTask) return prev;

      // same column
      if (fromStage === toStage) {
        if (toIndex === -1) return prev;

        return {
          ...prev,
          [fromStage]: arrayMove([...source], fromIndex, toIndex),
        };
      }

      // diff column
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
  };
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
            <h2 className="text-foreground text-xl font-semibold">{stage}</h2>

            <DroppableColumn id={stage}>
              <SortableContext
                items={tasksByStage[stage].filter(Boolean).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasksByStage[stage].length === 0 && (
                  <div className="text-sm text-muted text-center py-6 border-2 border-dashed rounded-lg">
                    Drop tasks here
                  </div>
                )}

                {tasksByStage[stage].filter(Boolean).map((task) => (
                  <Task key={task.id} id={task.id} task={task} />
                ))}
              </SortableContext>
            </DroppableColumn>
          </div>
        ))}
      </div>

      
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105 opacity-90">
            <Task id={activeTask.id} task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
