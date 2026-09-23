import { useState } from "react";
import { FaUserPlus, FaTrash, FaXmark, FaUser } from "react-icons/fa6";
import { addBoardMember, removeBoardMember } from "../../api/boards";

export default function BoardMembersModal({
  isOpen,
  onClose,
  boardId,
  currentMembers = [],
  onMembersUpdated,
  isOwner = false,
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await addBoardMember(boardId, { email: email.trim(), role: "member" });
      setSuccess(`Added ${email} to board!`);
      setEmail("");
      if (onMembersUpdated) onMembersUpdated();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add member. Check email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeBoardMember(boardId, { user_id: userId });
      if (onMembersUpdated) onMembersUpdated();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove member.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border-2 border-border rounded-xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-foreground">
            <FaUserPlus className="text-green-400" />
            <h2 className="text-lg font-bold">Board Members</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <FaXmark />
          </button>
        </div>

        {/* Add Member Form (Owner only) */}
        {isOwner ? (
          <form onSubmit={handleAddMember} className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted">
              Invite Member by Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-green-400 text-foreground placeholder:text-muted"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 bg-linear-to-r from-green-400 to-cyan-400 text-black font-semibold text-sm rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Adding..." : "Invite"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-muted">
            Only the board owner can invite new members.
          </p>
        )}

        {error && (
          <div className="p-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="p-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg">
            {success}
          </div>
        )}

        {/* Member List */}
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-xs font-semibold text-muted">
            Current Members ({currentMembers.length})
          </span>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-1">
            {currentMembers.map((member) => (
              <div
                key={member.user_id || member.id}
                className="flex items-center justify-between p-2.5 bg-background border border-border rounded-lg"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-muted/20 border border-border flex items-center justify-center text-xs font-bold text-foreground">
                    <FaUser className="text-[10px]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {member.username || member.email}
                    </span>
                    <span className="text-[10px] text-muted capitalize">
                      {member.role || "member"}
                    </span>
                  </div>
                </div>

                {isOwner && member.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="p-1.5 text-xs text-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                    title="Remove member"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
