import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";

export default function Home() {
  const navigate = useNavigate();

  const boards = ["Board-1", "Board-2", "Board-3", "Board-4", "Board-5"];

  return (
    <div className="p-2">
      <div className="mb-3 border-2 border-border rounded-xl bg-card">
        <h1 className="flex justify-center align-middle text-4xl p-3">
          Welcome User
        </h1>
        <p className="flex justify-center align-middle p-2 text-muted text-md">
          Pick up where you left off.
        </p>
      </div>
      <hr className="h-1 rounded border-0 my-4 bg-linear-to-r from-green-400 to-cyan-400" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boards.map((board, id) => (
          <div
            className="flex flex-col items-center justify-center gap-3 p-6 bg-card
                border-2 border-border rounded-xl
                cursor-pointer
                transition-all duration-300 ease-out
                hover:border-muted hover:bg-muted/20 
                hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
            key={board}
            onClick={() => {
              navigate(`/board/${id + 1}`);
            }}
          >
            <h3 className="text-lg pb-1.5 font-semibold">{board}</h3>
            <p className="text-sm italic">
              Description:{" "}
              <span className="text-muted">
                Description of this board is ...
              </span>
            </p>
            <p className="text-sm italic">
              Edited: <span className="text-muted">12/2/26</span>
            </p>
            <ProgressBar progress={58} />
          </div>
        ))}

        {/* Create Board card */}
        <div
          className="flex flex-col items-center justify-center gap-3 p-6 bg-card
                border-2 border-dashed border-border rounded-xl
                cursor-pointer
                transition-all duration-300 ease-out
                hover:border-muted hover:bg-muted/20 
                hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
        >
          <div
            className="flex items-center justify-center w-12 h-12 
                  rounded-full bg-muted/30
                  transition-all duration-300
                  hover:bg-muted/50"
          >
            <FaPlus className="text-xl text-muted" />
          </div>

          <p className="text-base font-medium text-muted">Create new board</p>
        </div>
      </div>
    </div>
  );
}
