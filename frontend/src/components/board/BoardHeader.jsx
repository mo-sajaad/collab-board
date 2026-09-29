import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaUserPlus } from "react-icons/fa6";
import ProgressBar from "../ProgressBar";
import { getCurrentUser } from "../../utils/auth";

export default function BoardHeader({
  board,
  progressPercent,
  onOpenMembers,
  onOpenDelete,
}) {
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const isOwner = Number(board?.owner_id) === Number(currentUser?.id)

  return (
    <div className="bg-card border-2 border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted rounded-lg 
              border border-border hover:bg-muted/20 hover:text-foreground transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <FaArrowLeft className="text-xs" />
            Dashboard
          </button>

          <button
            type="button"
            onClick={onOpenMembers}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground rounded-lg border border-border hover:bg-muted/20 transition-all active:scale-95 cursor-pointer"
          >
            <FaUserPlus className="text-xs text-green-400" />
            Members
          </button>
        </div>
        
        {isOwner && <button
          type="button"
          onClick={onOpenDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 rounded-lg 
            border border-red-500/20 hover:bg-red-500/10 transition-colors active:scale-95 cursor-pointer"
        >
          <FaTrash className="text-xs" />
          Delete Board
        </button>
        }
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {board?.name || "Board"}
          </h1>
          <p className="text-sm text-muted mt-1">
            {board?.description || "No description provided."}
          </p>
        </div>

        <div className="w-full md:w-64 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-muted">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <ProgressBar progress={progressPercent} />
        </div>
      </div>
    </div>
  );
}