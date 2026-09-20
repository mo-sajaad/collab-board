import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import { useEffect, useState } from "react";
import { getUserBoards, createBoard } from "../../api/boards";

export default function Home() {
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [creating, setCreating] = useState(false);


  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await getUserBoards();
        setBoards(data);
      } catch (err) {
        console.error("Failed to fetch boards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  // =====================
  // Create Board
  // =====================
  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    setCreating(true);

    try {
      const newBoard = await createBoard({
        name: newBoardName,
        description: newBoardDesc,
      });

      // add new board to UI
      setBoards((prev) => [newBoard, ...prev]);

      // reset modal
      setShowCreateModal(false);
      setNewBoardName("");
      setNewBoardDesc("");
    } catch (err) {
      console.error("Failed to create board:", err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-2">
      {/* Header */}
      <div className="mb-3 border-2 border-border rounded-xl bg-card">
        <h1 className="flex justify-center text-4xl p-3">
          Welcome User
        </h1>
        <p className="flex justify-center p-2 text-muted text-md">
          Pick up where you left off.
        </p>
      </div>

      <hr className="h-1 rounded border-0 my-4 bg-linear-to-r from-green-400 to-cyan-400" />

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Loading */}
        {loading && (
          <p className="text-muted col-span-2 text-center">
            Loading boards...
          </p>
        )}

        {/* Boards */}
        {!loading &&
          boards.map((board) => (
            <div
              key={board.board_id}
              onClick={() => navigate(`/board/${board.board_id}`)}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-card
                border-2 border-border rounded-xl
                cursor-pointer
                transition-all duration-300 ease-out
                hover:border-muted hover:bg-muted/20 
                hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
            >
              <h3 className="text-lg pb-1.5 font-semibold">
                {board.name}
              </h3>

              <p className="text-sm italic">
                Description:{" "}
                <span className="text-muted">
                  {board.description || "No description"}
                </span>
              </p>

              <p className="text-sm italic">
                Created:{" "}
                <span className="text-muted">
                  {new Date(board.created_at).toLocaleDateString()}
                </span>
              </p>

              <ProgressBar progress={58} />
            </div>
          ))}

        {/* Create Board Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-card
            border-2 border-dashed border-border rounded-xl
            cursor-pointer
            transition-all duration-300 ease-out
            hover:border-muted hover:bg-muted/20 
            hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
        >
          <div className="flex items-center justify-center w-12 h-12 
            rounded-full bg-muted/30 transition-all duration-300
            hover:bg-muted/50"
          >
            <FaPlus className="text-xl text-muted" />
          </div>

          <p className="text-base font-medium text-muted">
            Create new board
          </p>
        </div>
      </div>

      {/* =====================
          Create Board Modal
         ===================== */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-card p-6 rounded-xl w-[90%] max-w-md space-y-4 shadow-lg">

            <h2 className="text-xl font-semibold">Create Board</h2>

            <input
              placeholder="Board name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="w-full p-2 border rounded bg-transparent"
            />

            <textarea
              placeholder="Description (optional)"
              value={newBoardDesc}
              onChange={(e) => setNewBoardDesc(e.target.value)}
              className="w-full p-2 border rounded bg-transparent"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateBoard}
                disabled={creating}
                className="bg-primary text-white px-4 py-1 rounded"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}