import { useEffect } from "react";
import { appName } from "./config"; // Import appName from config
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

import Login from "./modules/Auth/Login";
import Register from "./modules/Auth/Register";
import ForgotPassword from "./modules/Auth/ForgotPassword";
import ResetPassword from "./modules/Auth/ResetPassword";

import ProtectedRoute from "./components/common/protected-route"; // Correct path

import Dashboard from "./modules/Dashboard/DashboardPage";

import ProfilePage from "./modules/Profile/ProfilePage";

import UserList from "@/modules/User/UserList";

import { Toaster } from "sonner";
import "./App.css";

import AirlineList from "@/modules/Airline/AirlineList";
import ProductList from "./modules/Product/ProductList";
import CreateProduct from "./modules/Product/CreateProduct";
import EditProduct from "./modules/Product/EditProduct";
const App = () => {
  useEffect(() => {
    document.title = appName; // Set the document title
  }, []);

  return (
    <>
      <Toaster richColors position="top-center" />
      <Router>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* Add other auth routes here */}
          </Route>
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/airlines"
              element={
                <ProtectedRoute>
                  <AirlineList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/create"
              element={
                <ProtectedRoute>
                  <CreateProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
