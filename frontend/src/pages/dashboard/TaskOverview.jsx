import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function TaskOverview() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState(`Task ${id}`);
  const [status, setStatus] = useState("In Progress");
  const [description, setDescription] = useState(
    "Task Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe deleniti nihil, totam quam enim..."
  );
  const [dueDate, setDueDate] = useState("05/04/2026");
  const [createdAt, setCreatedAtDate] = useState("05/04/2026");

  const descRef = useRef(null);


  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = descRef.current.scrollHeight + "px";
    }
  }, [description]);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div className="flex min-h-screen items-start bg-background justify-center m-5">
      <div className="flex flex-col gap-4 m-2 bg-card border-2 border-border rounded-xl p-6 w-full max-w-3xl shadow-sm">


        <button
          onClick={() => navigate(-1)}
          className="text-muted font-bold w-fit hover:text-foreground transition"
        >
          ← Back
        </button>


        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-center font-bold text-4xl w-full bg-transparent border-0 outline-none focus:ring-0"
        />


        <div className="p-5 bg-border border-2 border-muted-hover rounded-2xl w-full space-y-2">
          
          <div className="flex items-center gap-2">
            <p className="text-muted">Status:</p>
            <input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="font-medium bg-transparent border-0 outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <p className="text-muted">Due:</p>
            <input
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="font-medium bg-transparent border-0 outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <p className="text-muted">Created:</p>
            <input
              value={createdAt}
              onChange={(e) => setCreatedAtDate(e.target.value)}
              className="font-medium bg-transparent border-0 outline-none focus:ring-0"
            />
          </div>
        </div>


        <div className="p-5 bg-border border-2 border-muted-hover rounded-2xl w-full space-y-2">
          <h3 className="text-muted text-sm">Description</h3>

          <textarea
            ref={descRef}
            value={description}
            onChange={handleDescriptionChange}
            rows={1}
            placeholder="Add a more detailed description..."
            className="w-full font-medium text-foreground bg-transparent border-0 outline-none focus:ring-0 resize-none overflow-hidden leading-relaxed"
          />
        </div>

      </div>
    </div>
  );
}