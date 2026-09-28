import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrash,
  FaFloppyDisk,
  FaClock,
  FaCalendarDays,
  FaTag,
} from "react-icons/fa6";
import { getTask, updateTask, deleteTask } from "../../api/tasks";
import DeleteModal from "../../components/DeleteModal";

export default function TaskOverview() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Task data state
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("To Do");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // UI / Async lifecycle states
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const descRef = useRef(null);

  // Helper to format ISO strings to YYYY-MM-DD for <input type="date" />
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Fetch task by ID on mount
  useEffect(() => {
    const fetchTaskData = async () => {
      setInitialLoading(true);
      setFetchError(null);
      try {
        const data = await getTask(id);
        setTitle(data.title || `Task ${id}`);
        setStatus(data.status || "To Do");
        setDescription(data.description || "");
        setDueDate(formatDateForInput(data.due_date || data.dueDate));
        setCreatedAt(
          data.created_at || data.createdAt || new Date().toISOString()
        );
      } catch (err) {
        console.error(err);
        setFetchError(
          "Failed to load task details. Please check your connection."
        );
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchTaskData();
    }
  }, [id]);

  // Auto-resize description textarea based on content
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  }, [description, initialLoading]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateTask(id, {
        title,
        status,
        description,
        due_date: dueDate || null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // FIXED: Reset modal states before calling navigate(-1)
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteTask(id);
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
      navigate(-1);
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to delete task. Please try again.");
      setIsDeleting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-8 flex justify-center text-muted">
        <p>Loading task details...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 flex flex-col items-center gap-4 text-center">
        <p className="text-red-500 font-medium">{fetchError}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted/20"
        >
          Return to Board
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {/* Top Header Card */}
        <div className="flex items-center justify-between p-4 bg-card border-2 border-border rounded-xl shadow-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted rounded-lg 
              border border-border hover:bg-muted/20 hover:text-foreground transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <FaArrowLeft className="text-xs" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 rounded-lg 
                border border-red-500/20 hover:bg-red-500/10 transition-colors active:scale-95 cursor-pointer"
            >
              <FaTrash className="text-xs" />
              Delete
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg 
                bg-linear-to-r from-green-400 to-cyan-400 text-black hover:opacity-90 
                disabled:opacity-50 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <FaFloppyDisk className="text-xs" />
              {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {saveError && (
          <div className="px-4 py-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
            {saveError}
          </div>
        )}

        {/* Gradient Separator */}
        <hr className="h-1 rounded border-0 bg-linear-to-r from-green-400 to-cyan-400 my-1" />

        {/* Main Task Editor Card */}
        <div className="bg-card border-2 border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">
          {/* Task Title Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title..."
              className="text-2xl sm:text-3xl font-bold bg-transparent border border-transparent 
                hover:border-border focus:border-border rounded-lg px-2 py-1 outline-none 
                focus:ring-2 focus:ring-green-400 transition-all duration-200 text-foreground"
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-muted/10 border-2 border-border rounded-xl">
            {/* Status Field */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <FaTag className="text-xs" /> Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-sm font-medium 
                  outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 cursor-pointer text-foreground"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Due Date Field */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <FaCalendarDays className="text-xs" /> Due Date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-card border border-border rounded-lg px-2.5 py-1.5 text-sm font-medium 
                  outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 text-foreground"
              />
            </div>

            {/* Created At (Read-only) */}
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                <FaClock className="text-xs" /> Created
              </span>
              <div className="bg-card/50 border border-border/60 rounded-lg px-2.5 py-1.5 text-sm text-muted">
                {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Description
            </label>
            <div className="p-4 bg-muted/10 border-2 border-border rounded-xl">
              <textarea
                ref={descRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add a detailed description for this task..."
                className="w-full font-normal text-foreground bg-transparent border-0 outline-none 
                  resize-none overflow-hidden leading-relaxed placeholder:text-muted/60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${title || "this task"}"? This action cannot be undone.`}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}