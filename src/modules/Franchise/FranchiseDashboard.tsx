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
import {
  Wallet,
  TrendingUp,
  UserCheck,
  ShoppingCart,
  Gift,
  Users,
  Loader,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatter";
import { toast } from "sonner";
import { DIAMOND } from "@/config/data";

const fetchDashboardData = async () => {
  const response = await get("/franchise/dashboard");
  return response;
};

const FranchiseDashboard = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["franchiseDashboard"],
    queryFn: fetchDashboardData,
    onError: (error: any) => {
      toast.error(error?.message || "Failed to fetch franchise dashboard data");
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

  const {
    securityDepositAmount,
    securityDepositPending,
    franchiseCommission,
    securityDepositReturn,
    franchiseWalletBalance,
  } = data;

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Welcome to Your Franchise Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's a complete overview of your account
        </p>
      </div>

      {/* Section 1: Wallets */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wallet className="text-white" />
                Franchise Wallet
              </CardTitle>
              <CardDescription className="text-white">
                Franchise Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(franchiseWalletBalance)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-tr from-blue-500 to-cyan-400 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <TrendingUp />
                Security Deposit Amount
              </CardTitle>
              <CardDescription className="text-white">
                Security Deposit Amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(securityDepositAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-400 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Gift />
                Franchise Commission
              </CardTitle>
              <CardDescription className="text-white">
                Franchise Commission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(franchiseCommission)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wallet className="text-white" />
                Security Deposit Return
              </CardTitle>
              <CardDescription className="text-white">
                Security Deposit Return
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(securityDepositReturn)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default FranchiseDashboard;
