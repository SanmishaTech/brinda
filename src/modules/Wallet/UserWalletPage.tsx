import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomPagination from "@/components/common/custom-pagination";
import dayjs from "dayjs";

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
import { Separator } from "@/components/ui/separator";
import { APPROVED, PENDING, REJECTED, CREDIT, DEBIT } from "@/config/data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatter.js";

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
  const [recipientUsername, setRecipientUsername] = useState<string | null>(
    null
  );
  const [recipientEmail, setRecipientEmail] = useState<string | null>(null);
  const [recipientMobile, setRecipientMobile] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Add recordsPerPage state
  const [sortBy, setSortBy] = useState(""); // Default sort column
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [search, setSearch] = useState(""); // Search query
  const [username, setUsername] = useState("");
  const [amountToTransfer, setAmountToTransfer] = useState<number | string>("");
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [recipientMemberId, setRecipientMemberId] = useState("");

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

  // Fetch recipient details when username is entered
  const fetchRecipientMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await get(
        `/wallet-transactions/member-username/${username}`
      );
      return response;
    },
    onSuccess: (data) => {
      setRecipientName(data.memberName); // Assuming API returns { name: "Recipient Name" }
      setRecipientUsername(data.memberUsername);
      setRecipientEmail(data.memberEmail ?? null);
      setRecipientMemberId(data.id);

      setRecipientMobile(data.memberMobile ?? null);
      toast.success(`Recipient found: ${data.memberName}`);
    },
    onError: (err: any) => {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch recipient details";
      toast.error("Invalid Username. Please try again.");
      setRecipientName(null); // Reset recipient name if error occurs
    },
  });

  // Transfer money mutation
  const transferMoneyMutation = useMutation({
    mutationFn: async () => {
      await post("/wallet-transactions/transfer", {
        amount: Number(amountToTransfer),
        memberId: recipientMemberId, // Assuming recipientName is the memberId
      });
    },
    onSuccess: () => {
      setUsername("");
      setAmountToTransfer("");
      setRecipientName(null);
      setRecipientMemberId("");

      queryClient.invalidateQueries(["walletBalance"]); // Refetch wallet balance
      toast.success("Money transferred successfully!");
    },
    onError: (err: any) => {
      console.log(err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to transfer money";
      toast.error(errorMessage);
    },
  });

  const handleFetchRecipient = () => {
    if (!username) {
      toast.error("Please enter a username.");
      return;
    }
    fetchRecipientMutation.mutate(username);
  };

  const handleTransferMoney = () => {
    if (
      !amountToTransfer ||
      isNaN(Number(amountToTransfer)) ||
      Number(amountToTransfer) <= 0
    ) {
      toast.error("Please enter a valid amount.");
      return;
    }
    transferMoneyMutation.mutate();
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
        <Card className="bg-green-100 border border-green-300 shadow-md dark:bg-card dark:border-border">
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
        <Card className="bg-gray-100 dark:bg-card border border-gray-300 dark:border-border shadow-md">
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
              className="w-full bg-green-500 hover:bg-green-600 text-white dark:bg-primary dark:hover:bg-primary/90"
              onClick={handleAddBalance}
              disabled={addBalanceMutation.isLoading || amount === ""} // Disable if loading or amount is empty
            >
              {addBalanceMutation.isLoading ? "Adding..." : "Add"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Money Box */}
      <Card className="mt-6 bg-gray-100 border border-gray-300 shadow-md dark:bg-card dark:border-border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            Transfer Money To Member
          </CardTitle>
          <CardDescription>
            Enter the username and amount to transfer money securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            {/* Recipient Name Display */}
            {/* <div className="flex flex-col items-start">
              {recipientName ? (
                <p className="text-green-700 font-medium">
                  Recipient: <span className="font-bold">{recipientName}</span>
                </p>
              ) : (
                <p className="text-gray-500">
                  Enter a username to find the recipient.
                </p>
              )}
            </div> */}
            <div className="flex flex-col items-end space-y-4">
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full md:w-64"
              />
              <Button
                variant="outline"
                className="w-full md:w-64 text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={handleFetchRecipient}
                disabled={fetchRecipientMutation.isLoading}
              >
                {fetchRecipientMutation.isLoading
                  ? "Fetching..."
                  : "Find Recipient"}
              </Button>
            </div>
            <div className="flex flex-col items-start space-y-1 mt-2">
              {recipientName ? (
                <>
                  <p className="text-base text-gray-800">
                    <span className="font-semibold">Name:</span> {recipientName}
                  </p>
                  <p className="text-base text-gray-800">
                    <span className="font-semibold">Username:</span>{" "}
                    {recipientUsername}
                  </p>
                  {recipientEmail && (
                    <p className="text-base text-gray-800">
                      <span className="font-semibold">Email:</span>{" "}
                      {recipientEmail}
                    </p>
                  )}
                  {recipientMobile && (
                    <p className="text-base text-gray-800">
                      <span className="font-semibold">Mobile:</span>{" "}
                      {recipientMobile}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Enter a username to find the recipient.
                </p>
              )}
            </div>

            {/* Username Input */}
          </div>

          <Separator className="my-4" />

          {/* Amount Input and Transfer Button */}
          <div className="flex justify-between items-center">
            <Button
              className="w-full md:w-64 bg-green-500 hover:bg-green-600 text-white dark:bg-primary dark:hover:bg-primary/90"
              onClick={handleTransferMoney}
              disabled={
                !recipientName ||
                transferMoneyMutation.isLoading ||
                !amountToTransfer
              }
            >
              {transferMoneyMutation.isLoading ? "Transferring..." : "Transfer"}
            </Button>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amountToTransfer}
              onChange={(e) => setAmountToTransfer(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <div className="mt-6">
        <Card className="mt-6 bg-gray-100 border border-gray-300 shadow-md dark:bg-card dark:border-border">
          <CardContent>
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
                      <TableHead>Date</TableHead>

                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>Type</span>
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>Status</span>
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>Amount</span>
                        </div>
                      </TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction.transactionDate
                            ? dayjs(transaction.transactionDate).format(
                                "DD/MM/YYYY"
                              )
                            : "N/A"}{" "}
                        </TableCell>
                        {/* <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {transaction.type}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === APPROVED
                              ? "bg-green-100 text-green-700"
                              : transaction.status === PENDING
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </TableCell> */}
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.type === DEBIT
                                ? "bg-red-100 text-red-700"
                                : transaction.type === CREDIT
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {transaction.type
                              ? transaction.type.toUpperCase()
                              : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.status === PENDING
                                ? "bg-yellow-100 text-yellow-800"
                                : transaction.status === APPROVED
                                ? "bg-green-100 text-green-700"
                                : transaction.status === REJECTED
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {transaction.status
                              ? transaction.status.toUpperCase()
                              : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {transaction.paymentMethod || "N/A"}
                        </TableCell>
                        <TableCell>
                          {transaction.referenceNumber || "N/A"}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserWalletPage;
