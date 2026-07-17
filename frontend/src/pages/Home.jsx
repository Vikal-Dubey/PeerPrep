import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { logoutUser } from "../utils/api";

const Home = () => {
  const { user, setUser, authChecked } = useContext(DataContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/");
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <p className="text-muted font-mono text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg">
      <h1 className="text-3xl font-display font-bold text-text mb-1">PeerPrep</h1>
      <p className="text-muted text-sm mb-8 font-mono">interview prep, together</p>

      {user ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-text">
            Logged in as{" "}
            <span className="font-semibold text-accent">{user.username}</span>
          </p>
          <Link
            to="/dashboard"
            className="bg-accent text-bg font-semibold px-5 py-2 rounded-md hover:opacity-90 transition-opacity mt-2"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-muted hover:text-accent transition-colors mt-2"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            to="/login"
            className="text-accent-cool hover:underline"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="text-accent-cool hover:underline"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;