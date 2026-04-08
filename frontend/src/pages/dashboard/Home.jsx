import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
    const navigate = useNavigate();


  const boards = ["board-1", "board-2", "board-3", "board-4", "board-5"];

  return (
    <>
      <div className="home-header">
        <h1>Welcome User</h1>
        <p>Pick up where you left off.</p>
      </div>
      <hr />

      <div className="boards-container">
        {boards.map((board, id) => (
          <div className="board-card" key={board} onClick={() => {navigate(`/board/${id+1}`)}}>
            <h3 className="board-name">{board}</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex hic
              atque sunt non consequatur exercitationem in, minus odio illum
              officiis esse tempore necessitatibus id cum assumenda sint! Dolor,
              unde provident?
            </p>
          </div>
        ))}

        {/* Create Board card */}
        <div className="board-card create-board">
          <span className="plus-sign">+</span>
          <p>Create new board</p>
        </div>
      </div>
    </>
  );
}
