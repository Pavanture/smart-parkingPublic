// He component check karto ki user login aahe ka

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // localStorage madhe login status check karto
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // Jar login nahi tar login page la redirect
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // Jar login asel tar actual page show hoil
  return children;
}

export default ProtectedRoute;
