import { FaPlus, FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../../components/ProgressBar";
import { useEffect, useState } from "react";
import { getUserBoards, createBoard, deleteBoard } from "../../api/boards";

export default function Home() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creation modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Deletion modal state
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await getUserBoards();
        if (Array.isArray(data)) {
        setBoards(data);          
        }
        else if (Array.isArray(data?.data)) {
          setBoards(data.data);
        } else {
          setBoards([])
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  // Create Handlers
  const handleOpenCreateModal = () => {
    setName("");
    setDescription("");
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (isCreating) return;
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const newBoard = await createBoard({ name, description });
      setBoards((prev) => [newBoard, ...prev]);
      handleCloseCreateModal();
    } catch (err) {
      console.error(err);
      setCreateError("Failed to create board. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete Handlers 
  const handleOpenDeleteModal = (e, board) => {
    e.stopPropagation(); // Prevent navigating to /board/:id
    setDeleteError(null);
    setBoardToDelete(board);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setBoardToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!boardToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteBoard(boardToDelete.board_id);
      setBoards((prev) =>
        prev.filter((b) => b.board_id !== boardToDelete.board_id)
      );
      setBoardToDelete(null);
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to delete board. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-2">
      <div className="mb-3 border-2 border-border rounded-xl bg-card">
        <h1 className="flex justify-center text-4xl p-3">Welcome User</h1>
        <p className="flex justify-center p-2 text-muted text-md">
          Pick up where you left off.
        </p>
      </div>

      <hr className="h-1 rounded border-0 my-4 bg-linear-to-r from-green-400 to-cyan-400" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loading state */}
        {loading && (
          <p className="text-muted col-span-2 text-center">Loading boards...</p>
        )}

        {/* Boards */}
        {!loading && Array.isArray(boards) &&
          boards.map((board) => (
            <div
              key={board.board_id}
              className="relative flex flex-col items-center justify-center gap-3 p-6 bg-card
                border-2 border-border rounded-xl
                cursor-pointer group
                transition-all duration-300 ease-out
                hover:border-muted hover:bg-muted/20 
                hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
              onClick={() => navigate(`/board/${board.board_id}`)}
            >
              {/* Delete trigger button */}
              <button
                type="button"
                aria-label={`Delete ${board.name}`}
                className="absolute top-3 right-3 p-2 rounded-lg text-muted/60 
                  hover:text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={(e) => handleOpenDeleteModal(e, board)}
              >
                <FaTrash className="text-sm" />
              </button>

              <h3 className="text-lg pb-1.5 font-semibold pr-6">
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

              <ProgressBar progress={Number(board.progress) || 0} />
            </div>
          ))}

        {/* Create Board Card Button */}
        <div
          onClick={handleOpenCreateModal}
          className="flex flex-col items-center justify-center gap-3 p-6 bg-card
                border-2 border-dashed border-border rounded-xl
                cursor-pointer
                transition-all duration-300 ease-out
                hover:border-muted hover:bg-muted/20 
                hover:shadow-md hover:-translate-y-1 active:scale-[0.98]"
        >
          <div
            className="flex items-center justify-center w-12 h-12 
            rounded-full bg-muted/30 transition-all duration-300
            hover:bg-muted/50"
          >
            <FaPlus className="text-xl text-muted" />
          </div>

          <p className="text-base font-medium text-muted">Create new board</p>
        </div>
      </div>

      {/* Create Board Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={handleCloseCreateModal}
        >
          <div
            className="bg-card border-2 border-border rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Create New Board</h2>

            {createError && (
              <p className="text-xs text-red-500 mb-3">{createError}</p>
            )}

            <form onSubmit={handleCreateBoard} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Board Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sprint Roadmap"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this board for?"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/20 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-400 to-cyan-400 text-black hover:opacity-90 disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Board Modal */}
      {boardToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={handleCloseDeleteModal}
        >
          <div
            className="bg-card border-2 border-border rounded-xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">Delete Board</h2>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{boardToDelete.name}"
              </span>
              ? All columns and tasks inside this board will be permanently
              removed.
            </p>

            {deleteError && (
              <p className="text-xs text-red-500 mb-3">{deleteError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/20 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}