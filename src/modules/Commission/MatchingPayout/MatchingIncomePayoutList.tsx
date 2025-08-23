import React, { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import MultipleSelector, {
  Option,
} from "@/components/common/multiple-selector"; // Import MultipleSelector from common folder
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatter.js";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, del, patch, post } from "@/services/apiService";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import CustomPagination from "@/components/common/custom-pagination";
import dayjs from "dayjs";

import {
  Loader,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Filter,
  Download,
  ShieldEllipsis,
  Search,
  PlusCircle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import ConfirmDialog from "@/components/common/confirm-dialog";
import { saveAs } from "file-saver";
import { Badge } from "@/components/ui/badge"; // Ensure Badge is imported
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const fetchList = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/commissions/matching-income-payout?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
  );
  return response;
};

const MatchingIncomePayoutList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Add recordsPerPage state
  const [sortBy, setSortBy] = useState("id"); // Default sort column
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [search, setSearch] = useState(""); // Search query
  //  Track the user ID to delete
  const navigate = useNavigate();

  // Fetch users using react-query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "matching-income-payout-list",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchList(currentPage, sortBy, sortOrder, search, recordsPerPage),
  });

  const payoutList = data?.payoutList || [];
  const totalPages = data?.totalPages || 1;
  const totalRecords = data?.totalRecords || 0;

  // Mutation for deleting a user
  const payMatchingIncomeMutate = useMutation({
    mutationFn: (commissionId: number) =>
      post(`/commissions/matching-income-payout/${commissionId}`),
    onSuccess: () => {
      toast.success("Matching income commission paid successfully.");
      queryClient.invalidateQueries([
        "matching-income-payout-list",
        currentPage,
        sortBy,
        sortOrder,
        search,
        recordsPerPage,
      ]);
    },
    onError: (error) => {
      if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to Pay Matching Income Commission.");
      }
    },
  });

  const payMatchingIncomeAmount = (CommissionId) => {
    payMatchingIncomeMutate.mutate(CommissionId);
  };

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if the same column is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending order
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  return (
    <div className="mt-2 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Matching Income Commission Management
      </h1>
      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-grow">
              <Input
                placeholder="Search..."
                value={search}
                onChange={handleSearchChange}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Action Buttons */}
          </div>

          <Separator className="mb-4" />
          {/* Table Section */}
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="mr-2 h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">
              Failed to load commission list.
            </div>
          ) : payoutList.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("memberUsername")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Id</span>
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
                      onClick={() => handleSort("createdAt")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Created At</span>
                        {sortBy === "createdAt" && (
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
                      onClick={() => handleSort("memberName")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
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
                      onClick={() => handleSort("panNumber")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Pan Number</span>
                        {sortBy === "panNumber" && (
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
                      onClick={() => handleSort("bankName")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Bank Name</span>
                        {sortBy === "bankName" && (
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
                      onClick={() => handleSort("bankAccountNumber")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Account Number</span>
                        {sortBy === "bankAccountNumber" && (
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
                      onClick={() => handleSort("bankIfscCode")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>IFSC Number</span>
                        {sortBy === "bankIfscCode" && (
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
                      onClick={() => handleSort("memberMobile")}
                      className="cursor-pointer"
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
                    <TableHead
                      onClick={() => handleSort("matchingIncomeCommission")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Total Payable</span>
                        {sortBy === "matchingIncomeCommission" && (
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
                    <TableHead>Give Withdrawal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutList.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {list?.member?.memberUsername}
                      </TableCell>
                      <TableCell className="max-w-[250px] p-4 break-words whitespace-normal">
                        {list?.createdAt
                          ? dayjs(list?.createdAt).format(
                              "DD/MM/YYYY hh:mm:ss A"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {list?.member?.memberName}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {list?.member?.panNumber || "-"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {list?.member?.bankName || "-"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {list?.member?.bankAccountNumber || "-"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {list?.member?.bankIfscCode || "-"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {list?.member?.memberMobile || "-"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {list.matchingIncomeCommission || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => payMatchingIncomeAmount(list.id)}
                          >
                            Give Withdrawal
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalRecords}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage} // Pass setCurrentPage directly
                onRecordsPerPageChange={(newRecordsPerPage) => {
                  setRecordsPerPage(newRecordsPerPage);
                  setCurrentPage(1); // Reset to the first page when records per page changes
                }}
              />
            </div>
          ) : (
            <div className="text-center">No records Found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchingIncomePayoutList;
