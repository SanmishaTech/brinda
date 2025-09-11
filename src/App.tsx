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

import ProductList from "./modules/Product/ProductList";
import CreateProduct from "./modules/Product/CreateProduct";
import EditProduct from "./modules/Product/EditProduct";
import MemberList from "./modules/Member/MemberList";
import CreateMember from "./modules/Member/CreateMember";
import EditMember from "./modules/Member/EditMember";
import UserWalletPage from "./modules/Wallet/UserWalletPage"; // Adjust the import path as needed
import AdminWalletPage from "./modules/Wallet/AdminWalletPage";
import Purchase from "./modules/Purchase/User/Purchase";
import Genealogy from "./modules/Genealogy/Genealogy";

import PurchaseHistoryList from "./modules/Purchase/User/PurchaseHistoryList";
import MemberLogList from "./modules/Member/MemberLogList";
import MyDirectReferralList from "./modules/MyDirectList/MyDirectReferralList";
import Repurchase from "./modules/Repurchase/User/Repurchase";
import RepurchaseHistoryList from "./modules/Repurchase/User/RepurchaseHistoryList";
import MatchingIncomePayoutList from "./modules/Commission/MatchingPayout/MatchingIncomePayoutList";
import AdminPaidCommissionList from "./modules/Commission/MatchingPayout/AdminPaidCommissionList";
import GuestRoute from "./components/common/guest-route";
import RepurchaseIncomePayoutList from "./modules/Commission/RepurchasePayout/RepurchaseIncomePayoutList";
import AdminPaidRepurchaseList from "./modules/Commission/RepurchasePayout/AdminPaidRepurchaseList";
import VirtualPowerList from "./modules/VirtualPower/VirtualPowerList";
import RewardList from "./modules/Reward/RewardList";
import RewardIncomePayoutList from "./modules/Commission/RewardPayout/RewardIncomePayoutList";
import AdminPaidRewardList from "./modules/Commission/RewardPayout/AdminPaidRewardList";

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
            <Route
              path="/"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestRoute>
                  <ForgotPassword />
                </GuestRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <GuestRoute>
                  <ResetPassword />
                </GuestRoute>
              }
            />
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
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <MemberList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/genealogy"
              element={
                <ProtectedRoute>
                  <Genealogy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/logs"
              element={
                <ProtectedRoute>
                  <MemberLogList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/members/create"
              element={
                <ProtectedRoute>
                  <CreateMember />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id/edit"
              element={
                <ProtectedRoute>
                  <EditMember />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members/:id/wallet"
              element={
                <ProtectedRoute>
                  <AdminWalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/wallet"
              element={
                <ProtectedRoute>
                  <UserWalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/directReferrals"
              element={
                <ProtectedRoute>
                  <MyDirectReferralList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase"
              element={
                <ProtectedRoute>
                  <Purchase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase/history"
              element={
                <ProtectedRoute>
                  <PurchaseHistoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repurchase"
              element={
                <ProtectedRoute>
                  <Repurchase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repurchase/history"
              element={
                <ProtectedRoute>
                  <RepurchaseHistoryList />
                </ProtectedRoute>
              }
            />

            {/* commission start */}
            <Route
              path="/commissions/matchingIncomePayout"
              element={
                <ProtectedRoute>
                  <MatchingIncomePayoutList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commissions/adminPaidCommissions"
              element={
                <ProtectedRoute>
                  <AdminPaidCommissionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commissions/repurchaseIncomePayout"
              element={
                <ProtectedRoute>
                  <RepurchaseIncomePayoutList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commissions/adminPaidRepurchaseCommissions"
              element={
                <ProtectedRoute>
                  <AdminPaidRepurchaseList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commissions/rewardIncomePayout"
              element={
                <ProtectedRoute>
                  <RewardIncomePayoutList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commissions/adminPaidRewardCommissions"
              element={
                <ProtectedRoute>
                  <AdminPaidRewardList />
                </ProtectedRoute>
              }
            />
            {/* commission end */}
            {/* Virtual Power start */}
            <Route
              path="/virtual-power/history"
              element={
                <ProtectedRoute>
                  <VirtualPowerList />
                </ProtectedRoute>
              }
            />
            {/* Virtual Power end */}
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <RewardList />
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
