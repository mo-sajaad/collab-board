import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/auth";
import Input from "../../components/Input";
import { validateEmail } from "../../utils/helper";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validateEmail(email)) {
        setError("Invalid email.");
        return;
      }

      if (!password) {
        setError("Please enter a password.");
        return;
      }

      setError("");

      const res = await loginUser({
        email,
        password,
      });

      if (res?.token) {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center mb-4">
        <h3 className="text-2xl font-bold text-foreground">Welcome Back</h3>
        <p className="text-sm text-muted">
          Please enter your details to log in.
        </p>
      </div>
      <hr className="h-1 rounded border-0 my-4 bg-linear-to-r from-green-400 to-cyan-400 w-full" />
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="john@example.com"
          type="text"
          className=""
        />
        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="my-3 border-2 border-accent-hover bg-border rounded-2xl py-1 text-sm font-semibold leading-relaxed w-full cursor-pointer hover:bg-card/90 transition duration-300 ease-in-out"
          type="submit"
        >
          {loading ? "Loading..." : "SUBMIT"}
        </button>
        <p>
          Don't have an account?{" "}
          <Link
            className="text-accent-hover transition-all hover:text-accent-hover/60 hover:-translate-y-0.5 duration-200 ease-in-out"
            to="/auth/signup"
          >
            Sign up now
          </Link>
        </p>{" "}
      </form>
    </div>
  );
}
