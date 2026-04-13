import { useNavigate } from "react-router-dom";
import { FaGripLines } from "react-icons/fa6";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Task({ id, task, isOverlay = false }) {
  const navigate = useNavigate();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e) => {
    if (isDragging) {
      e.preventDefault();
      return;
    }
    navigate(`/task/${id}`);
  };

  return (
    <div
      ref={!isOverlay ? setNodeRef : null}
      style={!isOverlay ? style : undefined}
      {...(!isOverlay ? attributes : {})}
      className={`flex justify-between items-start bg-card border-2 border-border
        rounded-xl p-4 shadow-sm transition-all duration-300 cursor-pointer
        ${isDragging ? "opacity-50" : "hover:shadow-md hover:bg-muted-hover"}
      `}
      onClick={handleClick}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-foreground font-semibold text-lg">
          {task.title}
        </h3>

        <p className="text-muted text-sm">
          Due:{" "}
          <span className="font-medium text-foreground">
            {task.due_date}
          </span>
        </p>

        <p className="text-muted text-sm">
          {task.description.length > 50
            ? task.description.slice(0, 50) + "..."
            : task.description}
        </p>
      </div>

      
      <div
        {...(!isOverlay ? listeners : {})}
        className="p-2 cursor-grab active:cursor-grabbing text-muted hover:text-foreground transition-colors duration-200"
      >
        <FaGripLines className="text-xl" />
      </div>
    </div>
  );
}