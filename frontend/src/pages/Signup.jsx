import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { registerUser } from "../utils/api";

const Signup = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
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
      const result = await registerUser(form);
      setUser(result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg p-6 selection:bg-accent/20 selection:text-accent font-display">
      <div className="w-full max-w-sm flex flex-col gap-6 animate-fadeIn">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-accent to-accent-cool bg-clip-text text-transparent">
            PeerPrep
          </span>
          <p className="text-xs text-muted font-mono tracking-wide">Developer Technical Workspace</p>
        </div>

        {/* Auth form container */}
        <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 rounded-xl shadow-xl flex flex-col gap-4">
          <h1 className="text-xl font-bold text-text text-center tracking-tight mb-2">Create Account</h1>

          {error && (
            <div className="bg-error/10 text-error border border-error/20 text-xs p-3 rounded-lg leading-relaxed">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-muted/80">Username</label>
            <input
              type="text"
              name="username"
              placeholder="developer"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full bg-bg border border-border text-text text-sm rounded-lg px-3.5 py-2.5 outline-none focus:border-accent/60 transition-all placeholder:text-muted/40 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-muted/80">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-bg border border-border text-text text-sm rounded-lg px-3.5 py-2.5 outline-none focus:border-accent/60 transition-all placeholder:text-muted/40 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-muted/80">Password (min 6 chars)</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full bg-bg border border-border text-text text-sm rounded-lg px-3.5 py-2.5 outline-none focus:border-accent/60 transition-all placeholder:text-muted/40 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-text-light font-bold text-sm py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 shadow-lg shadow-accent/10"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-text-light border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          <p className="text-xs text-center mt-3 text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-accent hover:underline font-semibold font-mono">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;