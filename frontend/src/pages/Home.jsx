import { useContext } from "react";
import { Link } from "react-router-dom";
import { DataContext } from "../context/DataContext";

const Home = () => {
  const { user } = useContext(DataContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">PeerPrep</h1>
      {user ? (
        <p className="text-lg">
          Logged in as <span className="font-semibold">{user.username}</span>
        </p>
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