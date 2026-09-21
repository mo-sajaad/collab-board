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

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });

      if (res?.token) {
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
        }
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-sm mx-auto p-4">
      <div className="flex flex-col justify-center items-center mb-4 text-center">
        <h3 className="text-2xl font-bold text-foreground">Welcome Back</h3>
        <p className="text-sm text-muted">
          Please enter your details to log in.
        </p>
      </div>

      <hr className="h-1 rounded border-0 my-4 bg-linear-to-r from-green-400 to-cyan-400 w-full" />

      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="john@example.com"
          type="email"
          autoComplete="email"
          required
        />

        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          required
        />

        {error && (
          <div className="p-2 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="my-2 border-2 border-accent-hover bg-border rounded-xl py-2 text-sm font-semibold 
            w-full cursor-pointer hover:bg-card/90 transition-all duration-200 ease-in-out 
            disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          type="submit"
        >
          {loading ? "Signing in..." : "SUBMIT"}
        </button>

        <p className="text-sm text-center text-muted mt-2">
          Don't have an account?{" "}
          <Link
            className="text-accent-hover font-medium transition-all hover:text-accent-hover/60 hover:underline"
            to="/auth/signup"
          >
            Sign up now
          </Link>
        </p>
      </form>
    </div>
  );
}