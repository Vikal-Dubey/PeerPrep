import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { loginUser } from "../utils/api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(DataContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginUser(form);
      setUser(result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 rounded-lg w-full max-w-sm">
        <h1 className="text-2xl font-display font-bold mb-6 text-center text-text">Welcome Back</h1>

        {error && (
          <p className="bg-red-500/10 text-red-400 text-sm p-2 rounded mb-4">{error}</p>
        )}

        <input
          type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required
          className="w-full bg-bg border border-border text-text rounded px-3 py-2 mb-3 focus:border-accent-cool outline-none"
        />
        <input
          type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required
          className="w-full bg-bg border border-border text-text rounded px-3 py-2 mb-4 focus:border-accent-cool outline-none"
        />

        <button type="submit" disabled={loading}
          className="w-full bg-accent text-bg font-semibold py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-sm text-center mt-4 text-muted">
          Don't have an account?{" "}
          <Link to="/signup" className="text-accent-cool hover:underline">Sign up</Link>
        </p>
      </form>
  </div>
  );
};

export default Login;