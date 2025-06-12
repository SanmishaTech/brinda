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
  ChevronsUpDown,
  Check,
  PlusCircle,
  Loader,
  ChevronUp,
  ArrowDownCircle,
  ChevronDown,
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
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import { Separator } from "@/components/ui/separator";
import CustomPagination from "@/components/common/custom-pagination";
import { formatCurrency } from "@/lib/formatter.js";
import Deposit from "./Admin/Deposit";
import Withdraw from "./Admin/Withdraw";
import ViewDetails from "./Admin/ViewDetails";
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

const AdminWalletPage = () => {
  const [openMember, setOpenMember] = useState(false);
  const [openViewDetailsDialog, setOpenViewDetailsDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);

  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [memberId, setMemberId] = useState(""); // Track selected member ID
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("status");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Fetch members for the combobox
  const { data: members } = useQuery({
    queryKey: ["allMembers"],
    queryFn: async () => {
      const response = await get(`/members/all`);
      return response;
    },
  });

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
    const selectedMember = members?.find((m) => m.id === parseInt(memberId));
    if (selectedMember) {
      setSelectedMemberName(selectedMember.memberName);
      setOpenDepositDialog(true);
    }
  };

  const handleOpenWithdrawDialog = () => {
    const selectedMember = members?.find((m) => m.id === parseInt(memberId));
    if (selectedMember) {
      setSelectedMemberName(selectedMember.memberName);
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
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Member Combobox */}
        <div className="relative mb-6">
          <Popover open={openMember} onOpenChange={setOpenMember}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openMember}
                className="w-[250px] justify-between mt-1"
              >
                {memberId
                  ? members?.find((m) => m.id === parseInt(memberId))
                      ?.memberName
                  : "Select Member..."}
                <ChevronsUpDown className="opacity-50 ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput placeholder="Search member..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No member found.</CommandEmpty>
                  <CommandGroup>
                    {members?.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.memberName}
                        onSelect={() => {
                          setMemberId(String(member.id));
                          setCurrentPage(1);
                          setOpenMember(false);
                        }}
                      >
                        {member.memberName}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            String(member.id) === memberId
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Show table and buttons only when a member is selected */}
        {memberId && (
          <>
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Button
                onClick={handleOpenDepositDialog}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Deposit
              </Button>

              <Button
                onClick={handleOpenWithdrawDialog}
                className="bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <ArrowDownCircle className="mr-2 h-5 w-5" />
                Withdraw
              </Button>
            </div>

            <Separator className="mb-4" />

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
                          <span>Amount</span>
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>Type</span>
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference Number</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {walletTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {formatCurrency(transaction.amount) || "N/A"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.type === "Debit"
                                ? "bg-red-100 text-red-700"
                                : transaction.type === "Credit"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {transaction.type || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : transaction.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : transaction.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {transaction.status || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {transaction.paymentMethod || "N/A"}
                        </TableCell>
                        <TableCell>
                          {transaction.referenceNumber || "N/A"}
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
        )}
      </div>
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
