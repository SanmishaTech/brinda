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

  const {
    walletBalance,
    holdWalletBalance,
    pvBalance,
    status,
    totalPurchase,
    matchingIncomeEarned,
    repurchaseIncome,
    repurchaseCashbackIncome,
    repurchaseMentorIncomeL1,
    repurchaseMentorIncomeL2,
    repurchaseMentorIncomeL3,
    matchingMentorIncomeL1,
    matchingMentorIncomeL2,
    matchingIncomeWalletBalance,
    upgradeWalletBalance,
    repurchaseIncomeEarned,
  } = data;

  const totalIncomeEarned =
    parseFloat(matchingIncomeEarned || 0) +
    parseFloat(repurchaseIncomeEarned || 0);

  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Welcome to Your Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's a complete overview of your account
        </p>
      </div>

      {/* Section 1: Wallets */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Wallets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wallet className="text-white" />
                Fund Wallet
              </CardTitle>
              <CardDescription className="text-white">
                Main wallet for purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(walletBalance)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-tr from-blue-500 to-cyan-400 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <TrendingUp />
                Matching Income Wallet
              </CardTitle>
              <CardDescription className="text-white">
                Earned from team matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(matchingIncomeWalletBalance)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-400 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Gift />
                Upgrade Wallet
              </CardTitle>
              <CardDescription className="text-white">
                Used for upgrades or re-entry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(upgradeWalletBalance)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wallet className="text-white" />
                Hold Wallet
              </CardTitle>
              <CardDescription className="text-white">
                Stores the generated Incomes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(holdWalletBalance)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 2: Incomes */}
      {/* Incomes Earned */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Incomes Earned
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Wallet />
                Matching Income Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(matchingIncomeEarned)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600 to-green-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Wallet />
                Repurchase Income Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(repurchaseIncomeEarned)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Wallet />
                Total Income Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(totalIncomeEarned)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Income Collected This Month (Pending) */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Income Collected This Month (Pending)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Wallet />
                Repurchase Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(repurchaseIncome)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-400 to-red-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Wallet />
                Cashback Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(repurchaseCashbackIncome)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-lime-400 to-green-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Users />
                Repurchase Mentor Income (L1)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(repurchaseMentorIncomeL1)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-green-400 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Users />
                Repurchase Mentor Income (L2)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(repurchaseMentorIncomeL2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Users />
                Repurchase Mentor Income (L3)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(repurchaseMentorIncomeL3)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Users />
                Matching Mentor Income (L1)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(matchingMentorIncomeL1)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-sky-500 to-blue-400 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Users />
                Matching Mentor Income (L2)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(matchingMentorIncomeL2)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Section 4: Purchase + Status */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Profile Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 ">
                <ShoppingCart />
                Total Purchase
              </CardTitle>
              <CardDescription className="text-white">
                Total spent on platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹{totalPurchase.toFixed(2)}</p>
            </CardContent>
          </Card>

          {status !== DIAMOND && (
            <Card className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
              {" "}
              <CardHeader>
                <CardTitle className="flex items-center gap-3 ">
                  <TrendingUp />
                  PV Balance
                </CardTitle>
                <CardDescription className="text-white">
                  Points Volume available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold ">
                  {parseFloat(pvBalance).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
            {" "}
            <CardHeader>
              <CardTitle className="flex items-center gap-3 ">
                <UserCheck />
                Status
              </CardTitle>
              <CardDescription className="text-white">
                Your membership tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold ">{status}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default MemberDashboard;
