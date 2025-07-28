import React, { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface GuestRouteProps {
  children: JSX.Element;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const authToken = localStorage.getItem("authToken"); // Check for auth token in localStorage
  const location = useLocation();

  if (authToken) {
    // Pass a state to the Navigate component
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ from: location, unauthorized: true }}
      />
    );
  }

  return children; // Render the protected component if authenticated
};

export default GuestRoute;
