import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import { searchGlobal } from "../api/search";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ boards: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Debounced API call with AbortController
  useEffect(() => {
    if (!query.trim()) {
      setResults({ boards: [], tasks: [] });
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchGlobal(query, controller.signal);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (boardId) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/boards/${boardId}`);
  };

  const hasResults = results.boards.length > 0 || results.tasks.length > 0;

  return (
    <div
      className="hidden sm:flex items-center flex-1 max-w-md mx-6 relative"
      ref={searchRef}
    >
      <FaMagnifyingGlass className="absolute left-3.5 text-muted text-sm pointer-events-none" />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(true)}
        placeholder="Search boards or tasks..."
        className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg bg-card border border-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
      />

      {query && (
        <button
          onClick={() => {
            setQuery("");
            setResults({ boards: [], tasks: [] });
            setIsOpen(false);
          }}
          className="absolute right-3 text-muted hover:text-foreground text-xs transition-colors"
        >
          <FaXmark className="cursor-pointer"/>
        </button>
      )}

      {/* Results Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="p-3 text-center text-xs text-muted">
              Searching...
            </div>
          )}

          {!loading && !hasResults && (
            <div className="p-3 text-center text-xs text-muted">
              No matching boards or tasks found
            </div>
          )}

          {/* Boards Section */}
          {!loading && results.boards.length > 0 && (
            <div className="mb-2">
              <div className="text-[10px] font-semibold text-muted uppercase tracking-wider px-2 py-1">
                Boards ({results.boards.length})
              </div>
              {results.boards.map((board) => (
                <div
                  key={board.board_id}
                  onClick={() => handleSelect(board.board_id)}
                  className="flex items-center gap-2 p-2 hover:bg-border/40 rounded-md cursor-pointer transition-colors"
                >
                  <span className="text-sm">📋</span>
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium text-foreground truncate">
                      {board.name}
                    </div>
                    {board.description && (
                      <div className="text-xs text-muted truncate">
                        {board.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tasks Section */}
          {!loading && results.tasks.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-muted uppercase tracking-wider px-2 py-1">
                Tasks ({results.tasks.length})
              </div>
              {results.tasks.map((task) => (
                <div
                  key={task.task_id}
                  onClick={() => handleSelect(task.board_id)}
                  className="flex items-center justify-between p-2 hover:bg-border/40 rounded-md cursor-pointer transition-colors"
                >
                  <div className="overflow-hidden pr-2">
                    <div className="text-sm font-medium text-foreground truncate">
                      ☑ {task.title}
                    </div>
                    <div className="text-xs text-muted truncate">
                      in <span className="text-green-400">{task.board_name}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-border/60 text-foreground whitespace-nowrap">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}