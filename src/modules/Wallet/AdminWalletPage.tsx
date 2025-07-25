import { useState } from "react";
import { Button } from "@/components/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  ChevronsUpDown,
  Check,
  PlusCircle,
  Loader,
  ChevronUp,
  User,
  ArrowDownCircle,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import { Separator } from "@/components/ui/separator";
import CustomPagination from "@/components/common/custom-pagination";
import { formatCurrency } from "@/lib/formatter.js";
import Deposit from "./Admin/Deposit";
import Withdraw from "./Admin/Withdraw";
import ViewDetails from "./Admin/ViewDetails";
import dayjs from "dayjs";
import { APPROVED, CREDIT, DEBIT, PENDING, REJECTED } from "@/config/data";

const AdminWalletPage = () => {
  const { id: memberId } = useParams();
  const [openMember, setOpenMember] = useState(false);
  const [openViewDetailsDialog, setOpenViewDetailsDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("transactionDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchTransactions = async (
    page: number,
    sortBy: string,
    sortOrder: string,
    search: string,
    memberId: string,
    recordsPerPage: number
  ) => {
    const response = await get(
      `/wallet-transactions/member/${memberId}/?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
    );
    return response;
  };

  // Fetch transactions only when a member is selected
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "adminWalletTransactions",
      currentPage,
      sortBy,
      sortOrder,
      search,
      memberId,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchTransactions(
        currentPage,
        sortBy,
        sortOrder,
        search,
        memberId,
        recordsPerPage
      ),
    enabled: !!memberId, // Only fetch transactions when a member is selected
  });

  const walletTransactions = data?.walletTransactions || [];
  const memberData = data?.member || [];

  const totalPages = data?.totalPages || 1;
  const totalTransactions = data?.totalTransactions || 0;

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleOpenDepositDialog = () => {
    if (memberData?.memberName) {
      setSelectedMemberName(memberData?.memberName);
      setOpenDepositDialog(true);
    }
  };

  const handleOpenWithdrawDialog = () => {
    if (memberData?.memberName) {
      setSelectedMemberName(memberData.memberName);
      setOpenWithdrawDialog(true);
    }
  };

  const handleOpenViewDetailsDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setOpenViewDetailsDialog(true);
  };

  return (
    <div className="mt-2 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Wallet Management
      </h1>
      {/* <div className="bg-white mt-3 shadow-md rounded-lg p-6"> */}

      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Member Combobox */}
          <div className="flex justify-between items-center">
            {/* Wrap icon, label, and combobox in a flex container for horizontal alignment */}

            {/* Existing buttons remain unchanged */}
            {memberId && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleOpenDepositDialog}
                    className="bg-green-500 hover:bg-green-600 text-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Deposit
                  </Button>

                  <Button
                    onClick={handleOpenWithdrawDialog}
                    className="bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <TrendingDown className="mr-2 h-5 w-5" />
                    Withdraw
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      {/* end */}
      {memberId && (
        <>
          <Card className="mx-auto mt- sm:mt-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-4 text-green-700">
                <Wallet className="w-5 h-5" /> {/* Larger icon */}
                <span className=" font-bold">Wallet Balance</span>{" "}
                {/* Larger text */}
              </CardTitle>
              <CardDescription className=" text-gray-600">
                Current wallet balance
              </CardDescription>
              {isLoading ? (
                <p className=" font-bold text-green-700">Loading...</p>
              ) : (
                <p className=" font-extrabold text-lg text-green-700">
                  {formatCurrency(memberData.walletBalance) || "N/A"}
                </p>
              )}
            </CardHeader>
          </Card>
        </>
      )}
      {/* Show table and buttons only when a member is selected */}
      {memberId && (
        <Card className="mx-auto mt-6 sm:mt-10">
          <CardContent>
            <>
              {/* Table Section */}
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader className="mr-2 h-8 w-8 animate-spin" />
                </div>
              ) : isError ? (
                <div className="text-center text-red-500">
                  Failed to load Transactions.
                </div>
              ) : walletTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                          <div className="flex items-center">
                            <span>Date & Time</span>
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                          Narration
                        </TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead className="text-right">Debited</TableHead>
                        <TableHead className="text-right">Credited</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {walletTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {transaction.transactionDate
                              ? dayjs(transaction.transactionDate).format(
                                  "DD/MM/YYYY hh:mm:ss A"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell className="w-60 max-w-[240px] whitespace-normal break-words">
                            {transaction.notes || "N/A"}
                          </TableCell>{" "}
                          <TableCell>
                            {transaction.paymentMethod || "N/A"}
                            {transaction.referenceNumber
                              ? ` - ${transaction.referenceNumber}`
                              : ""}
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
                            <Button
                              size="sm"
                              disabled={transaction.status !== "Pending"}
                              onClick={() =>
                                handleOpenViewDetailsDialog(transaction)
                              }
                              className={
                                transaction.status !== "Pending"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            >
                              View details
                            </Button>
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
                      setCurrentPage(1);
                    }}
                  />
                </div>
              ) : (
                <div className="text-center">No Transactions Found.</div>
              )}
            </>
          </CardContent>
        </Card>
      )}
      {/* </div> */}
      <Deposit
        open={openDepositDialog}
        onClose={() => setOpenDepositDialog(false)}
        memberName={selectedMemberName}
        currentBalance={memberData.walletBalance}
        memberId={memberId} // Pass the selected member ID to Deposit component
      />

      <Withdraw
        open={openWithdrawDialog}
        onClose={() => setOpenWithdrawDialog(false)}
        memberName={selectedMemberName}
        currentBalance={memberData.walletBalance}
        memberId={memberId}
      />

      <ViewDetails
        open={openViewDetailsDialog}
        onClose={() => setOpenViewDetailsDialog(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default AdminWalletPage;
