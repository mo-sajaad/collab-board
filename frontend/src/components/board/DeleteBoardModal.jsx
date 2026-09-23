export default function DeleteBoardModal({
  isOpen,
  onClose,
  onConfirm,
  boardName,
  isDeleting,
  error,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        className="bg-card border-2 border-border rounded-xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-2 text-foreground">Delete Board</h2>
        <p className="text-sm text-muted mb-4">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">
            "{boardName || "this board"}"
          </span>
          ? All columns and tasks inside will be permanently removed.
        </p>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/20 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}