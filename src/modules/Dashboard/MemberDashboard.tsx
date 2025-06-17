import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatter.js";

import {
  Loader,
  Wallet,
  ShoppingCart,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

const fetchDashboardData = async () => {
  const response = await get("/dashboards");
  return response;
};

const MemberDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
    onError: (error: any) => {
      toast.error(error?.message || "Failed to fetch dashboard data");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="w-10 h-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { walletBalance, pvBalance, status, totalPurchase } = data;

  return (
    <div className="p-4 sm:p-6">
      {/* Welcome Message */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-600">Here is an overview of your account</p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <Card className="bg-green-100 border border-green-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-green-700">
              <Wallet className="w-10 h-10" />
              Wallet Balance
            </CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-700">
              {formatCurrency(walletBalance)}
            </p>
          </CardContent>
        </Card>

        {/* PV Balance */}
        <Card className="bg-blue-100 border border-blue-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-blue-700">
              <TrendingUp className="w-10 h-10" />
              PV Balance
            </CardTitle>
            <CardDescription>Your current PV balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-700">
              {Number(pvBalance).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="bg-yellow-100 border border-yellow-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-yellow-700">
              <UserCheck className="w-10 h-10" />
              Status
            </CardTitle>
            <CardDescription>Your current membership status</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-700">{status}</p>
          </CardContent>
        </Card>

        {/* Total Purchase */}
        <Card className="bg-purple-100 border border-purple-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-purple-700">
              <ShoppingCart className="w-10 h-10" />
              Total Purchase
            </CardTitle>
            <CardDescription>Total amount spent on purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-700">
              ₹{totalPurchase.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
