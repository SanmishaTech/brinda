import React, { useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CustomPagination from "@/components/common/custom-pagination";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import { toast } from "sonner";
import { Loader, ChevronUp, ChevronDown, Download, Search } from "lucide-react";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/formatter.js";

// Fetch function
const fetchData = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/members/walletList?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
  );
  return response;
};

const WalletListExport = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "walletList",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchData(currentPage, sortBy, sortOrder, search, recordsPerPage),
  });

  const members = data?.members || [];
  const totalPages = data?.totalPages || 1;
  const totalMembers = data?.totalMembers || 0;

  // Sorting handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Export handler
  const handleExport = async () => {
    try {
      const queryParts = [
        `page=${currentPage}`,
        `sortBy=${encodeURIComponent(sortBy)}`,
        `sortOrder=${encodeURIComponent(sortOrder)}`,
        `search=${encodeURIComponent(search)}`,
        `limit=${recordsPerPage}`,
        `export=true`,
      ];
      const queryString = queryParts.join("&");
      const url = `/members/walletList?${queryString}`;

      const response = await get(url, null, { responseType: "blob" });

      let fileName = `MemberWalletDetails_${dayjs().format("DD_MM_YYYY")}.xlsx`;
      const disposition = response.headers["content-disposition"];
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?(.+?)"?$/);
        if (match && match[1]) fileName = match[1];
      }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);
      toast.success("Export successful");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error("Export failed");
    }
  };

  return (
    <div className="mt-2 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Member Wallet Details
      </h1>
      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <div className="flex-grow">
              <Input
                placeholder="Search by Member Id..."
                value={search}
                onChange={handleSearchChange}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Export */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExport}
                variant="outline"
                disabled={isLoading || members.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Table Section */}
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="mr-2 h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">
              Failed to load records.
            </div>
          ) : members.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("memberUsername")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Member ID</span>
                        {sortBy === "memberUsername" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("memberName")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Member Name</span>
                        {sortBy === "memberName" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("walletBalance")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Fund Wallet</span>
                        {sortBy === "walletBalance" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("matchingIncomeWalletBalance")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Matching Income Wallet</span>
                        {sortBy === "matchingIncomeWalletBalance" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>{" "}
                    <TableHead
                      onClick={() => handleSort("upgradeWalletBalance")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Upgrade Wallet</span>
                        {sortBy === "upgradeWalletBalance" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>{" "}
                    <TableHead
                      onClick={() => handleSort("holdWalletBalance")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Hold Wallet</span>
                        {sortBy === "holdWalletBalance" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("franchiseWalletBalance")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Franchise Wallet</span>
                        {sortBy === "franchiseWalletBalance" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell className="p-2">{member.memberUsername}</TableCell>
                      <TableCell>{member.memberName}</TableCell>
                      <TableCell>
                        {formatCurrency(member.walletBalance)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(member.matchingIncomeWalletBalance)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(member.upgradeWalletBalance)}
                      </TableCell>{" "}
                      <TableCell>
                        {formatCurrency(member.holdWalletBalance)}
                      </TableCell>{" "}
                      <TableCell>
                        {formatCurrency(member.franchiseWalletBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalMembers}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage}
                onRecordsPerPageChange={(newRecordsPerPage) => {
                  setRecordsPerPage(newRecordsPerPage);
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : (
            <div className="text-center">No Records Found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletListExport;
