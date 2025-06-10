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

const fetchMembers = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number
) => {
  const response = await get(
    `/members?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}`
  );
  return response;
};

const MemberList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Add recordsPerPage state
  const [sortBy, setSortBy] = useState("memberName"); // Default sort column
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [search, setSearch] = useState(""); // Search query
  const [showConfirmation, setShowConfirmation] = useState(false); // State to show/hide confirmation dialog
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null); //
  //  Track the user ID to delete
  const navigate = useNavigate();

  // Fetch users using react-query
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "members",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
    ],
    queryFn: () =>
      fetchMembers(currentPage, sortBy, sortOrder, search, recordsPerPage),
  });

  const members = data?.members || [];
  const totalPages = data?.totalPages || 1;
  const totalMembers = data?.totalMembers || 0;

  // Mutation for deleting a user
  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/members/${id}`),
    onSuccess: () => {
      toast.success("Member deleted successfully");
      queryClient.invalidateQueries(["members"]);
    },
    onError: (error) => {
      if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete Member");
      }
    },
  });

  const confirmDelete = (id: number) => {
    setMemberToDelete(id);
    setShowConfirmation(true);
  };

  const handleDelete = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete);
      setShowConfirmation(false);
      setMemberToDelete(null);
    }
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
        Member Management
      </h1>
      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Search Input */}
            <div className="flex-grow">
              <Input
                placeholder="Search members..."
                value={search}
                onChange={handleSearchChange}
                className="w-full"
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

          {/* Table Section */}
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="mr-2 h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">
              Failed to load members.
            </div>
          ) : members.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                      onClick={() => handleSort("mrp")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>MRP</span>
                        {sortBy === "mrp" && (
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
                      onClick={() => handleSort("dspRate")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>DSP Rate</span>
                        {sortBy === "dspRate" && (
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
                      onClick={() => handleSort("mfgRate")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>MFG Rate</span>
                        {sortBy === "mfgRate" && (
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
                      onClick={() => handleSort("gst")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <span>GST (%)</span>
                        {sortBy === "gst" && (
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
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {product.productName}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {formatCurrency(product.mrp) || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {formatCurrency(product.dspRate) || "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(product.mfgRate) || "N/A"}
                      </TableCell>
                      <TableCell>{product.gst || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/products/${product.id}/edit`)
                            }
                          >
                            <Edit size={16} />
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete(product.id)}
                          >
                            <Trash2 size={16} />
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
                totalRecords={totalProducts}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage} // Pass setCurrentPage directly
                onRecordsPerPageChange={(newRecordsPerPage) => {
                  setRecordsPerPage(newRecordsPerPage);
                  setCurrentPage(1); // Reset to the first page when records per page changes
                }}
              />
            </div>
          ) : (
            <div className="text-center">No Products Found.</div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showConfirmation}
        title="Confirm Deletion"
        description="Are you sure you want to delete this Product? This action cannot be undone."
        onCancel={() => {
          setShowConfirmation(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default MemberList;
