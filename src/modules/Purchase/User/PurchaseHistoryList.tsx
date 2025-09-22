import React, { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";
import path from "path-browserify";

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
import { get, del, patch } from "@/services/apiService";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import CustomPagination from "@/components/common/custom-pagination";
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
import dayjs from "dayjs";

const fetchProducts = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/purchases/history?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
  );
  return response;
};

const PurchaseHistoryList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Add recordsPerPage state
  const [sortBy, setSortBy] = useState("id"); // Default sort column
  const [sortOrder, setSortOrder] = useState("desc"); // Default sort order
  const [search, setSearch] = useState(""); // Search query
  const [showConfirmation, setShowConfirmation] = useState(false); // State to show/hide confirmation dialog
  //  Track the user ID to delete
  const navigate = useNavigate();

  // Fetch users using react-query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "purchases",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchProducts(currentPage, sortBy, sortOrder, search, recordsPerPage),
  });

  const purchases = data?.purchases || [];
  const totalPages = data?.totalPages || 1;
  const totalPurchases = data?.totalPurchases || 0;

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

  const handlePurchaseInvoice = async (purchaseId, invoicePath) => {
    const uuid = path.basename(path.dirname(invoicePath));
    const filename = path.basename(invoicePath);

    try {
      const response = await get(
        `/purchases/${uuid}/${filename}/${purchaseId}/generate-invoice`,
        {},
        { responseType: "blob" } // must be in config
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${purchaseId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to generate invoice");
        alert("Failed to generate invoice");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    }
  };

  return (
    <div className="mt-2 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        Purchase History
      </h1>
      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-grow">
              {/* <Input
                placeholder="Search Invoice Number..."
                value={search}
                onChange={handleSearchChange}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              /> */}
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
              Failed to load Purchase History.
            </div>
          ) : purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("purchaseDate")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Purchase Date</span>
                        {sortBy === "purchaseDate" && (
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
                      onClick={() => handleSort("invoiceNumber")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Invoice Number</span>
                        {sortBy === "invoiceNumber" && (
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
                      onClick={() => handleSort("totalAmountWithoutGst")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Total Amount (No Gst)</span>
                        {sortBy === "totalAmountWithoutGst" && (
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
                      onClick={() => handleSort("totalGstAmount")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Gst Amount</span>
                        {sortBy === "totalGstAmount" && (
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
                      onClick={() => handleSort("totalAmountWithGst")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>Total Amount</span>
                        {sortBy === "totalAmountWithGst" && (
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

                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {purchase.purchaseDate
                          ? dayjs(purchase.purchaseDate).format(
                              "DD/MM/YYYY hh:mm:ss A"
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {purchase.invoiceNumber || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {formatCurrency(purchase.totalAmountWithoutGst) ||
                          "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(purchase.totalGstAmount) || "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(purchase.totalAmountWithGst) || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            // variant="ghost"
                            size="sm"
                            onClick={() =>
                              handlePurchaseInvoice(
                                purchase.id,
                                purchase.invoicePath
                              )
                            }
                          >
                            invoice
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
                totalRecords={totalPurchases}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage} // Pass setCurrentPage directly
                onRecordsPerPageChange={(newRecordsPerPage) => {
                  setRecordsPerPage(newRecordsPerPage);
                  setCurrentPage(1); // Reset to the first page when records per page changes
                }}
              />
            </div>
          ) : (
            <div className="text-center">No Purchase Details Found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseHistoryList;
