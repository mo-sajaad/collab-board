import { useNavigate, useParams } from "react-router-dom";
import Task from "../../components/Task";
import "./Board.css";

export default function Board() {
  const navigate = useNavigate();

  const { id } = useParams();

  const board = {
    title: `Board ${id}`,
    members: ["mem1, mem2, mem3"],
    created: "01/01/26",
    progress: 74,
  };
  return (
    <>
      <div className="board-header">
        <button
          onClick={() => {
            navigate(-1);
          }}
        >
          ← Back
        </button>
        <h1 className="board-title">{board.title}</h1>
        <h3>Members:</h3>
        <p>{board.members}</p>

        <p>Created: {board.created}</p>
        <p>Progress: {board.progress}%</p>
      </div>
      <div className="board-container">
        <div className="stage-container">
          <h2 className="stage-title">Not Started</h2>
          <div className="tasks-list">
            <Task num={1} />
            <Task num={2} />
            <Task num={5} />
          </div>
        </div>
        <div className="stage-container">
          <h2 className="stage-title">In Progress</h2>
          <div className="tasks-list">
            <Task num={3} />
            <Task num={6} />
          </div>
        </div>
        <div className="stage-container">
          <h2 className="stage-title">Complete</h2>
          <div className="tasks-list">
            <Task num={4} />
          </div>
        </div>
      </div>
    </>
  );
}
