// He top navigation bar aahe

import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // login remove
    navigate("/login"); // login page la redirect
  };

  return (
    <div className="bg-blue-600 text-white flex justify-between items-center px-8 py-4">
      {/* Logo */}
      <h1 className="text-xl font-bold">Smart Parking 🚗</h1>

      {/* Navigation Links */}
      <div className="space-x-6">
        <Link to="/home" className="hover:underline">
          Dashboard
        </Link>
        <Link to="/booking" className="hover:underline">
          Book Slot
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
