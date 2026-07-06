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
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">PeerPrep</h1>
      {user ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg">
            Logged in as <span className="font-semibold">{user.username}</span>
          </p>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline mt-2"
          >
            Log Out
          </button>
        </div>
      ) : (
        <div className="space-x-4">
          <Link to="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;