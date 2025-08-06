import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomPagination from "@/components/common/custom-pagination";
import dayjs from "dayjs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FUND_WALLET, MATCHING_INCOME_WALLET } from "@/config/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Wallet,
  Loader2,
  PlusCircle,
  CheckCircle,
  CheckCircle2,
  AtSign,
  User,
  Phone,
} from "lucide-react";
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
import TransactionPinDialog from "./User/TransactionPinDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const fetchTransactions = async (page: number, recordsPerPage: number) => {
  const response = await get(
    `/wallet-transactions/member/?page=${page}&limit=${recordsPerPage}`
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
  const [tPinDialogOpen, setTPinDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Add recordsPerPage state
  const [username, setUsername] = useState("");
  const [amountToTransfer, setAmountToTransfer] = useState<number | string>("");
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [recipientMemberId, setRecipientMemberId] = useState("");
  const [transferSource, setTransferSource] = useState<
    typeof FUND_WALLET | typeof MATCHING_INCOME_WALLET
  >(FUND_WALLET);

  // Fetch wallet balance using React Query
  const { data: walletData, isLoading } = useQuery({
    queryKey: ["walletData"],
    queryFn: async () => {
      const response = await get("/wallet-transactions/wallet-amount");
      return response;
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
    queryKey: ["memberWalletTransactions", currentPage, recordsPerPage],
    queryFn: () => fetchTransactions(currentPage, recordsPerPage),
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
      queryClient.invalidateQueries(["memberWalletTransactions"]);
      // toast.success("Request has been send to Add Amount to your Wallet!");
      toast.success(
        `Top-up request for ${formatCurrency(
          amount
        )} submitted. It will reflect in your balance after approval.`,
        {
          duration: 7000, // Slightly longer for more text
          icon: <CheckCircle2 className="h-4 w-4" />,
        }
      );
      setAmount("");
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
    mutationFn: async (tPin: string) => {
      await post("/wallet-transactions/transfer", {
        amount: Number(amountToTransfer),
        memberId: recipientMemberId, // Assuming recipientName is the memberId
        tPin,
        walletType:
          transferSource === FUND_WALLET ? FUND_WALLET : MATCHING_INCOME_WALLET, // <-- Here
      });
    },
    onSuccess: () => {
      setUsername("");
      setAmountToTransfer("");
      setRecipientName(null);
      setRecipientMemberId("");

      queryClient.invalidateQueries(["walletData"]); // Refetch wallet balance
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

    const selectedBalance =
      transferSource === FUND_WALLET
        ? walletData?.walletBalance
        : walletData?.matchingIncomeWalletBalance;
    const selectedWalletName =
      transferSource === FUND_WALLET ? "Fund Wallet" : "Matching Income Wallet";

    if (
      parseFloat(selectedBalance) === undefined ||
      parseFloat(selectedBalance) === null
    ) {
      toast.error(
        `${selectedWalletName} balance is not available. Please try again.`
      );
      return;
    }

    if (Number(amountToTransfer) > parseFloat(selectedBalance)) {
      toast.error(
        `Insufficient balance in ${selectedWalletName} for this transfer.`
      );
      return;
    }

    if (!recipientName || !recipientMemberId) {
      toast.error("Please select a valid recipient before transferring.");
      return;
    }
    setTPinDialogOpen(true);
  };

  const handleResetForm = () => {
    setAmountToTransfer("");
    setUsername("");
    setAmountToTransfer("");
    setRecipientName(null);
    setRecipientMemberId("");
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
      <div className=" grid grid-cols-1 mb-4 md:grid-cols-2 gap-6">
        {/* Wallet Balance Box */}
        <Card className="bg-green-100 h-52 border border-green-300 shadow-md dark:bg-card dark:border-border">
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
                {formatCurrency(walletData?.walletBalance)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Matching income wallet balance box */}
        <Card className="bg-green-100 border border-green-300 shadow-md dark:bg-card dark:border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              Matching Income Wallet Balance
            </CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-lg font-bold text-green-700">Loading...</p>
            ) : (
              <p className="text-4xl font-bold text-green-700">
                {formatCurrency(walletData?.matchingIncomeWalletBalance)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
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
                    {formatCurrency(value)}
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
            <div className="flex flex-col items-center gap-5 lg:flex-row lg:justify-between lg:items-center">
              <div>Transfer Money To Member</div>
              <div>
                <ToggleGroup
                  type="single"
                  value={transferSource}
                  onValueChange={(value) => {
                    if (value) setTransferSource(value);
                  }}
                  className="flex space-x-2"
                >
                  <ToggleGroupItem
                    value={FUND_WALLET}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      transferSource === FUND_WALLET
                        ? "!bg-primary !text-white border-primary dark:bg-primary dark:text-white"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    Fund Wallet
                  </ToggleGroupItem>

                  <ToggleGroupItem
                    value={MATCHING_INCOME_WALLET}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      transferSource === MATCHING_INCOME_WALLET
                        ? "!bg-primary !text-white border-primary dark:bg-primary dark:text-white"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    Matching Wallet
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardTitle>

          <CardDescription>
            Enter the username and amount to transfer money securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="lg:flex lg:flex-row-reverse lg:justify-between items-center">
            <div className="w-full mb-4 lg:mb-0 max-w-[500px]">
              <Card className="shadow-md bg-gray-100 dark:bg-gray-900 border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg mb-0 pb-0 font-semibold">
                    Recipient Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recipientName ? (
                    <div className="flex flex-col space-y-">
                      <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <strong>Name:</strong> {recipientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <strong>Username:</strong> {recipientUsername}
                        </span>
                      </div>
                      {recipientEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                          <AtSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <strong>Email:</strong> {recipientEmail}
                          </span>
                        </div>
                      )}
                      {recipientMobile && (
                        <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <strong>Mobile:</strong> {recipientMobile}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter a username to find the recipient.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
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
            {/* Username Input */}
          </div>

          <Separator className="my-4" />

          {/* Amount Input and Transfer Button */}
          <div className="lg:flex lg:flex-row-reverse  justify-between items-center">
            <Input
              type="number"
              placeholder="Enter amount"
              value={amountToTransfer}
              onChange={(e) => setAmountToTransfer(e.target.value)}
              className="w-full md:w-64"
            />
            <Button
              className="w-full mt-4 md:w-64 bg-green-500 hover:bg-green-600 text-white dark:bg-primary dark:hover:bg-primary/90"
              onClick={handleTransferMoney}
              disabled={
                !recipientName ||
                transferMoneyMutation.isLoading ||
                !amountToTransfer
              }
            >
              {transferMoneyMutation.isLoading ? "Transferring..." : "Transfer"}
            </Button>
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
                      <TableHead>Date & Time</TableHead>

                      <TableHead className="text-right">Credited</TableHead>
                      <TableHead className="text-right">Debited</TableHead>
                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>Status</span>
                        </div>
                      </TableHead>

                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference Number</TableHead>
                      <TableHead>Narration</TableHead>
                      {/* <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        Note
                      </TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="py-4">
                          {transaction.transactionDate
                            ? dayjs(transaction.transactionDate).format(
                                "DD/MM/YYYY hh:mm:ss A"
                              )
                            : "N/A"}
                        </TableCell>
                        {/* <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.type === DEBIT
                                ? "bg-green-100 text-green-700"
                                : transaction.type === CREDIT
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {transaction.type
                              ? transaction.type.toUpperCase()
                              : "N/A"}
                          </span>
                        </TableCell> */}
                        <TableCell
                          className={`text-right ${
                            transaction.type === CREDIT
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {transaction.type === CREDIT ? (
                            formatCurrency(transaction.amount)
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            transaction.type === DEBIT
                              ? "text-green-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {transaction.type === DEBIT ? (
                            formatCurrency(transaction.amount)
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
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
                        <TableCell>
                          {transaction.paymentMethod || "N/A"}
                        </TableCell>
                        <TableCell>
                          {transaction.referenceNumber || "N/A"}
                        </TableCell>
                        <TableCell className="w-60 max-w-[240px] whitespace-normal break-words">
                          {transaction.notes || "N/A"}
                        </TableCell>{" "}
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
      <TransactionPinDialog
        open={tPinDialogOpen}
        onOpenChange={setTPinDialogOpen}
        mutation={(tPin) => transferMoneyMutation.mutateAsync(tPin)}
        isLoading={transferMoneyMutation.isLoading}
        onCancel={handleResetForm} // <-- reset parent form fields on cancel
      />
    </div>
  );
};

export default UserWalletPage;
