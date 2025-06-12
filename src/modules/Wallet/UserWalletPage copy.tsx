import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomPagination from "@/components/common/custom-pagination";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Wallet, Loader2, PlusCircle, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/services/apiService";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fetchTransactions = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/wallet-transactions/member/?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
  );
  return response;
};

const UserWalletPage = () => {
  const [amount, setAmount] = useState<number | string>("");
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Add recordsPerPage state
  const [sortBy, setSortBy] = useState(""); // Default sort column
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [search, setSearch] = useState(""); // Search query
  const [showConfirmation, setShowConfirmation] = useState(false); // State to show/hide confirmation dialog
  const [productToDelete, setProductToDelete] = useState<number | null>(null); //
  // Fetch wallet balance using React Query
  const { data: walletBalance, isLoading } = useQuery({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const response = await get("/wallet-transactions/wallet-amount");
      return response.walletBalance;
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch wallet balance";
      toast.error(errorMessage);
    },
  });

  // Fetch wallet transactions using React Query
  const {
    data: transactionData,
    isLoading: isLoadingTransactions,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "memberWalletTransactions",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchTransactions(currentPage, sortBy, sortOrder, search, recordsPerPage),
  });

  const transactions = transactionData?.walletTransactions || [];
  const totalPages = transactionData?.totalPages || 1;
  const totalTransactions = transactionData?.totalTransactions || 0;

  // Mutation for adding balance
  const addBalanceMutation = useMutation({
    mutationFn: async (amount: number) => {
      await post("/wallet-transactions", { amount });
    },
    onSuccess: () => {
      setAmount("");
      queryClient.invalidateQueries(["memberWalletTransactions"]);
      toast.success("Request has been send to Add Amount to your Wallet!");
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add balance";
      toast.error(errorMessage);
    },
  });

  const handleQuickAdd = (value: number) => {
    setAmount(value);
  };

  const handleAddBalance = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    addBalanceMutation.mutate(Number(amount));
  };

  return (
    <div className="p-6">
      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Wallet className="w-8 h-8 text-green-500" />
          My Wallet
        </h1>
        <p className="text-gray-600">
          Manage your wallet balance and add funds securely.
        </p>
      </div>

      {/* Wallet and Add Balance Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Balance Box */}
        <Card className="bg-green-100 border border-green-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              Wallet Balance
            </CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-lg font-bold text-green-700">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-green-700">
                ₹
                {typeof walletBalance === "number" && !isNaN(walletBalance)
                  ? walletBalance.toFixed(2)
                  : "N/A"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Add Balance Box */}
        <Card className="bg-gray-100 border border-gray-300 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <PlusCircle className="w-6 h-6" />
              Add Balance
            </CardTitle>
            <CardDescription>Add balance to your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Input Field */}
            <div className="mb-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Quick Add Section */}
            <div className="mb-4">
              <p className="text-gray-700 font-medium mb-2">Quick Add</p>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 250].map((value) => (
                  <Button
                    key={value}
                    variant="outline"
                    className="w-full"
                    onClick={() => handleQuickAdd(value)}
                  >
                    ₹{value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add Button */}
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={handleAddBalance}
              disabled={addBalanceMutation.isLoading || amount === ""} // Disable if loading or amount is empty
            >
              {addBalanceMutation.isLoading ? "Adding..." : "Add"}
            </Button>
          </CardContent>
        </Card>
      </div>
      {/* Transaction History */}
      {/* <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        {isLoadingTransactions ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : transactions?.length > 0 ? (
          <Table className="border border-gray-300 shadow-md">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-left">Type</TableHead>
                <TableHead className="text-left">Status</TableHead>
                <TableHead className="text-left">Amount</TableHead>
                <TableHead className="text-left">Payment Method</TableHead>
                <TableHead className="text-left">Reference Number</TableHead>
                <TableHead className="text-left">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-gray-700">
                    ₹{transaction.amount}
                  </TableCell>
                  <TableCell>{transaction.paymentMethod || "N/A"}</TableCell>
                  <TableCell>{transaction.referenceNumber || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-gray-500">No transactions found.</p>
        )}
      </div> */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        {isLoadingTransactions ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : transactions?.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => handleSort("type")}
                    className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                  >
                    <div className="flex items-center">
                      <span>Type</span>
                      {sortBy === "type" && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("status")}
                    className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {sortBy === "status" && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("amount")}
                    className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                  >
                    <div className="flex items-center">
                      <span>Amount</span>
                      {sortBy === "amount" && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference Number</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="max-w-[250px] break-words whitespace-normal">
                      {transaction.type}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : transaction.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-gray-700">
                      ₹{transaction.amount}
                    </TableCell>
                    <TableCell>{transaction.paymentMethod || "N/A"}</TableCell>
                    <TableCell>
                      {transaction.referenceNumber || "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalTransactions}
              recordsPerPage={recordsPerPage}
              onPageChange={setCurrentPage}
              onRecordsPerPageChange={(newRecordsPerPage) => {
                setRecordsPerPage(newRecordsPerPage);
                setCurrentPage(1); // Reset to the first page when records per page changes
              }}
            />
          </div>
        ) : (
          <div className="text-center">No Transactions Found.</div>
        )}
      </div>
    </div>
  );
};

export default UserWalletPage;
