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

// Fetch function
const fetchPurchases = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/purchases?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
  );
  return response;
};

const PurchaseList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "purchases",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchPurchases(currentPage, sortBy, sortOrder, search, recordsPerPage),
  });

  const purchases = data?.purchases || [];
  const totalPages = data?.totalPages || 1;
  const totalPurchases = data?.totalPurchases || 0;

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
      const url = `/purchases?${queryString}`;

      const response = await get(url, null, { responseType: "blob" });

      let fileName = `Purchases_${dayjs().format("DD_MM_YYYY")}.xlsx`;
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
        Purchase Management
      </h1>
      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search */}
            <div className="flex-grow">
              <Input
                placeholder="Search by Invoice Number..."
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
                disabled={isLoading || purchases.length === 0}
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
              Failed to load purchase records.
            </div>
          ) : purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("invoiceNumber")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Invoice Number</span>
                        {sortBy === "invoiceNumber" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("invoiceDate")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Invoice Date</span>
                        {sortBy === "invoiceDate" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead
                      onClick={() => handleSort("status")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortBy === "status" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          ))}
                      </div>
                    </TableHead>{" "}
                    <TableHead>Delivered By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase: any) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{purchase.invoiceNumber}</TableCell>
                      <TableCell>
                        {purchase?.invoiceDate
                          ? dayjs(purchase.invoiceDate).format("DD/MM/YYYY")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{purchase.totalAmountWithGst}</TableCell>
                      <TableCell>{purchase.status}</TableCell>
                      <TableCell>
                        {purchase.deliveredByMember?.memberName || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalPurchases}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage}
                onRecordsPerPageChange={(newRecordsPerPage) => {
                  setRecordsPerPage(newRecordsPerPage);
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : (
            <div className="text-center">No Purchase Records Found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseList;
