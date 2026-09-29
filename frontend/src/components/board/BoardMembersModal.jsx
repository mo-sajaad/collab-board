import { useState, useEffect, useRef } from "react";
import { FaUserPlus, FaTrash, FaXmark, FaUser, FaCrown } from "react-icons/fa6";
import { addBoardMember, removeBoardMember, getBoardMembers } from "../../api/boards";
import { getCurrentUser } from "../../utils/auth";

export default function BoardMembersModal({
  isOpen,
  onClose,
  boardId,
}) {

  const emailInputRef = useRef(null);

  const [members, setMembers] = useState([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id
  const currentUserMember = members.find(
    (m) => String(m.user_id || m.id) === String(currentUserId)
  );
  const isOwner = currentUserMember?.role === "owner";

  // Fetch members whenever the modal opens
  useEffect(() => {
    if (!isOpen || !boardId) return;

    const timer = setTimeout(() => {
      emailInputRef?.current?.focus();
    }, 50)

    const fetchMembers = async () => {
      setFetchingMembers(true);
      setError(null);
      try {
        const data = await getBoardMembers(boardId);
        setMembers(data);
      } catch (err) {
        console.error("Failed to fetch board members", err);
        setError("Could not load board members.");
      } finally {
        setFetchingMembers(false);
      }
    };

    fetchMembers();

    return () => clearTimeout(timer)
  }, [isOpen, boardId]);

  if (!isOpen) return null;

  const refreshMembers = async () => {
    try {
      const data = await getBoardMembers(boardId);
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

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
      await refreshMembers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add member. Check email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    setRemovingId(userId);
    setError(null);
    try {
      await removeBoardMember(boardId, userId);
      await refreshMembers();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove member.");
    } finally {
      setRemovingId(null);
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
            className="text-muted hover:text-foreground transition-colors cursor-pointer p-1"
          >
            <FaXmark />
          </button>
        </div>

        {/* Invite Form */}
        {isOwner ? (
          <form onSubmit={handleAddMember} className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted">
              Invite Member by Email
            </label>
            <div className="flex gap-2">
              <input
                ref={emailInputRef}
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

        {/* Feedback Banners */}
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
            Current Members ({members.length})
          </span>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-1">
            {fetchingMembers ? (
              <p className="text-xs text-muted text-center py-4">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">No members found.</p>
            ) : (
              members.map((member) => {
                const targetId = member.user_id || member.id;
                const isMemberOwner = member.role === "owner";

                return (
                  <div
                    key={targetId}
                    className="flex items-center justify-between p-2.5 bg-background border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-muted/20 border border-border flex items-center justify-center text-xs font-bold text-foreground">
                        {isMemberOwner ? (
                          <FaCrown className="text-yellow-400 text-[10px]" />
                        ) : (
                          <FaUser className="text-[10px]" />
                        )}
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

                    {isOwner && !isMemberOwner && (
                      <button
                        type="button"
                        disabled={removingId === targetId}
                        onClick={() => handleRemoveMember(targetId)}
                        className="p-1.5 text-xs text-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove member"
                      >
                        {removingId === targetId ? "..." : <FaTrash />}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}