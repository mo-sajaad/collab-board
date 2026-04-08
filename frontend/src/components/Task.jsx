import { useNavigate } from "react-router-dom";

export default function Task(props) {
    const navigate = useNavigate();

  const task = {
    title: `Task ${props.num}`,
    due_date: "05/04/2026",
    created_at: "05/04/2026",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe deleniti nihil, totam quam enim, laudantium excepturi ad dolor eveniet maiores suscipit rem pariatur iusto vel corrupti nemo animi, qui blanditiis?",
  };

  const handleClick = () => {
    navigate(`/task/${props.num}`)
  }

  return (
  <div className="task" onClick={handleClick}>
    <div className="title">
        {task.title}
    </div>
    <div className="task-info">
        <p>Due: {task.due_date}</p>
        <p>Description: {task.description.slice(0, (task.description.length > 10 ? 10 : null ))}...</p>
    </div>
  </div>

  );
}
