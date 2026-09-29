import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { FaPlus } from "react-icons/fa6";
import Task from "../Task";

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

export default function BoardColumn({ stage, tasks, onAddTask }) {
  const navigate = useNavigate();
  const [inputTitle, setInputTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;
    onAddTask(stage, inputTitle.trim());
    setInputTitle("");
  };

  return (
    <div className="flex flex-col gap-3 bg-card border-2 border-border rounded-xl p-4 shadow-sm">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground">{stage}</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted/20 text-muted">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="New task..."
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg outline-none 
            focus:ring-2 focus:ring-green-400 transition-all text-foreground"
        />
        <button
          type="submit"
          aria-label={`Add task to ${stage}`}
          className="px-3 py-1.5 bg-linear-to-r from-green-400 to-cyan-400 text-black font-semibold 
            rounded-lg text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <FaPlus className="text-xs" />
        </button>
      </form>

      {/* Droppable Area */}
      <DroppableColumn id={stage}>
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 && (
            <div className="text-xs text-muted text-center py-8 border-2 border-dashed border-border rounded-lg">
              No tasks yet. Drop or add one above.
            </div>
          )}

          {tasks.map((task) => (
            <div
              key={task.id}
              className="cursor-pointer"
            >
              <Task id={task.id} task={task} />
            </div>
          ))}
        </SortableContext>
      </DroppableColumn>
    </div>
  );
}