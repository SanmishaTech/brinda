import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui";
import CustomPagination from "@/components/common/custom-pagination";
import {
  Loader,
  ChevronUp,
  ChevronDown,
  Search,
  MoreHorizontal,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDateTime } from "@/lib/formatter";
import { useNavigate } from "react-router-dom";
import { PENDING } from "@/config/data";
import { Separator } from "@/components/ui/separator";

const fetchPendingTransactions = async (
  page: number,
  limit: number,
  search: string,
  sortBy: string,
  sortOrder: string
) => {
  const response = await get(
    `/members/pending-wallet-transactions?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`
  );
  return response;
};

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "/members/pending-wallet-transactions",
      currentPage,
      recordsPerPage,
      search,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchPendingTransactions(
        currentPage,
        recordsPerPage,
        search,
        sortBy,
        sortOrder
      ),
    onError: (error: any) => {
      toast.error(error?.message || "Failed to fetch members");
    },
  });

  const members = data?.members || [];
  const totalPages = data?.totalPages || 1;
  const totalMembers = data?.totalMembers || 0;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="mt-4 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        Members with Pending Transactions
      </h1>

      <Card>
        <CardContent className="p-4">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-grow">
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Action Buttons */}
            {/* <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={() => navigate("/members/create")}
                className="bg-primary hover:bg-primary/90 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Member
              </Button>
            </div> */}
          </div>

          <Separator className="mb-4" />
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="mr-2 h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">Failed to load data.</div>
          ) : members.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("memberUsername")}
                    >
                      <div className="flex items-center">
                        <span>Username</span>
                        {sortBy === "memberUsername" && (
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
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("memberName")}
                    >
                      <div className="flex items-center">
                        <span>Name</span>
                        {sortBy === "memberName" && (
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
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("memberEmail")}
                    >
                      <div className="flex items-center">
                        <span>Email</span>
                        {sortBy === "memberEmail" && (
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
                      className="cursor-pointer whitespace-nowrap"
                      onClick={() => handleSort("memberMobile")}
                    >
                      <div className="flex items-center">
                        <span>Mobile</span>
                        {sortBy === "memberMobile" && (
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

                    <TableHead className="whitespace-nowrap">
                      Pending Txns Count
                    </TableHead>

                    <TableHead className="whitespace-nowrap ">
                      Total Pending Amount
                    </TableHead>

                    <TableHead className="cursor-pointer whitespace-nowrap">
                      <div className="flex items-center">
                        <span>Actions</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-sm">
                  {members.map((member) => {
                    const pendingTxns = member.walletTransactions.filter(
                      (txn: any) => txn.status === PENDING
                    );
                    const totalPendingAmount = pendingTxns.reduce(
                      (sum: number, txn: any) => sum + Number(txn.amount),
                      0
                    );

                    return (
                      <TableRow key={member.id}>
                        <TableCell>{member.memberUsername || "N/A"}</TableCell>
                        <TableCell>{member.memberName || "N/A"}</TableCell>
                        <TableCell>{member.memberEmail || "N/A"}</TableCell>
                        <TableCell>{member.memberMobile || "N/A"}</TableCell>
                        <TableCell>{pendingTxns.length}</TableCell>
                        <TableCell className="">
                          {formatCurrency(totalPendingAmount)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/members/${member.id}/wallet`)
                                  }
                                >
                                  <Wallet className="h-4 w-4 mr-2" />
                                  Wallet
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalMembers}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage}
                onRecordsPerPageChange={(newLimit) => {
                  setRecordsPerPage(newLimit);
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : (
            <div className="text-center">
              No members with pending transactions found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
