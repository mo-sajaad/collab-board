import { useParams } from "react-router-dom";
import "./TaskOverview.css";
import { useNavigate } from "react-router-dom";

export default function TaskOverview() {
  const navigate = useNavigate();
  const { id } = useParams();

  const task = {
    title: `Task ${id}`,
    due_date: "05/04/2026",
    created_at: "05/04/2026",
    status: "In Progress",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe deleniti nihil, totam quam enim...",
  };

  return (
    <div className="task-overview-container">
      <div className="task-overview-card">
        <button
          onClick={() => {
            navigate(-1);
          }}
        >
          ← Back
        </button>
        <h1 className="task-title">{task.title}</h1>

        <div className="task-meta">
          <p>
            <strong>Status:</strong> {task.status}
          </p>
          <p>
            <strong>Due:</strong> {task.due_date}
          </p>
          <p>
            <strong>Created:</strong> {task.created_at}
          </p>
        </div>

        <div className="task-description">
          <h3>Description</h3>
          <p>{task.description}</p>
        </div>
      </div>
    </div>
  );
}
