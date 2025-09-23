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
import {
  Loader,
  ChevronUp,
  ChevronDown,
  Edit,
  HandCoins,
  Trash2,
  Wallet,
  Filter,
  Download,
  SquarePen,
  ShieldEllipsis,
  Search,
  PlusCircle,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ShieldCheck,
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
import { ASSOCIATE, DIAMOND, GOLD, INACTIVE, SILVER } from "@/config/data";
import AddVirtualPower from "../VirtualPower/AddVirtualPower";
import MakeFranchise from "./MakeFranchise";
import AddSecurityDepositDialog from "./AddSecurityDepositDialog";
import AddLoanDialog from "./AddLoanDialog";

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
  const [recordsPerPage, setRecordsPerPage] = useState(50); // Add recordsPerPage state
  const [sortBy, setSortBy] = useState("memberUsername"); // Default sort column
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order
  const [search, setSearch] = useState(""); // Search query
  const [showConfirmation, setShowConfirmation] = useState(false); // State to show/hide confirmation dialog
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null); //
  const [virtualDialogOpen, setVirtualDialogOpen] = useState(false); // State to show/hide confirmation dialog
  const [selectedVirtualMember, setSelectedVirtualMember] = useState(null); // State to show/hide confirmation dialog
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to show/hide confirmation dialog
  const [franchiseDialogOpen, setFranchiseDialogOpen] = useState(false);
  const [selectedFranchiseMember, setSelectedFranchiseMember] = useState<{
    id: number;
    memberUsername: string;
    memberName: string;
  } | null>(null);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [selectedDepositMember, setSelectedDepositMember] = useState(null);

  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [selectedLoanMember, setSelectedLoanMember] = useState(null);

  //  Track the user ID to delete
  const navigate = useNavigate();
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});
  const [visibleTPins, setVisibleTPins] = useState<Record<string, boolean>>({});

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

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleTPinVisibility = (id: string) => {
    setVisibleTPins((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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

  const impersonateMutation = useMutation({
    mutationFn: (userId: number) => post(`/auth/impersonate/${userId}`), // Ensure this returns JSON

    onSuccess: (data) => {
      console.log("✅ Impersonation data:", data);

      // Clear existing tokens first (optional but safer)
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      // Save impersonated user info
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isImpersonating", "true");
      window.location.href = "/dashboard"; // ← Full reload ensures state refresh

      toast.success("Impersonation started");
      navigate("/dashboard"); // Or wherever you want
    },

    onError: (error: any) => {
      toast.error(error?.message || "Failed to impersonate user");
      console.error("❌ Impersonation error:", error);
    },
  });

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
            <div className=" w-full overflow-x-auto">
              <div className="min-w-[1200px]">
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
                        onClick={() => handleSort("memberUsername")}
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
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
                        onClick={() => handleSort("sponsor")}
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                      >
                        <div className="flex items-center">
                          <span>Sponsor</span>
                          {sortBy === "sponsor" && (
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
                        onClick={() => handleSort("parent")}
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                      >
                        <div className="flex items-center">
                          <span>Parent</span>
                          {sortBy === "parent" && (
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
                        onClick={() => handleSort("positionToParent")}
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                      >
                        <div className="flex items-center">
                          <span>Position</span>
                          {sortBy === "positionToParent" && (
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
                        onClick={() => handleSort("leftCount")}
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                      >
                        <div className="flex items-center">
                          <span>LC</span>
                          {sortBy === "leftCount" && (
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
                      {/* <TableHead
                      onClick={() => handleSort("leftDirectCount")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>LDC</span>
                        {sortBy === "leftDirectCount" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead> */}
                      <TableHead
                        onClick={() => handleSort("rightCount")}
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                      >
                        <div className="flex items-center">
                          <span>RC</span>
                          {sortBy === "rightCount" && (
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

                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>Left ASGD</span>
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>Right ASGD</span>
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>C ASGD</span>
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>L1</span>
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                        <div className="flex items-center">
                          <span>L2</span>
                        </div>
                      </TableHead>
                      <TableHead
                        onClick={() =>
                          handleSort("matchingIncomeWalletBalance")
                        }
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                      >
                        <div className="flex items-center">
                          <span>matching Income</span>
                          {sortBy === "matchingIncomeWalletBalance" && (
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
                        onClick={() => handleSort("")}
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                      >
                        <div className="flex items-center">
                          <span>2:1</span>
                          {sortBy === "" && (
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
                      {/* <TableHead
                      onClick={() => handleSort("rightDirectCount")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                    >
                      <div className="flex items-center">
                        <span>RDC</span>
                        {sortBy === "rightDirectCount" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead> */}
                      {/* <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                      <div className="flex items-center">
                        <span>Password</span>
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer max-w-[250px] break-words whitespace-normal">
                      <div className="flex items-center">
                        <span>T Pin</span>
                      </div>
                    </TableHead> */}

                      {/* <TableHead
                      onClick={() => handleSort("memberEmail")}
                      className="cursor-pointer max-w-[200px] break-words whitespace-normal"
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
                      onClick={() => handleSort("memberMobile")}
                      className="cursor-pointer max-w-[250px] break-words whitespace-normal"
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
                    </TableHead> */}
                      <TableHead
                        onClick={() => handleSort("status")}
                        className="cursor-pointer max-w-[250px] break-words whitespace-normal"
                      >
                        <div className="flex items-center">
                          <span>Status</span>
                          {sortBy === "status" && (
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
                  <TableBody className="text-xs">
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member.memberName || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member.memberUsername || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.sponsor?.memberUsername || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.parent?.memberUsername || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.positionToParent || "N/A"}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.leftDirectCount}+ {member?.leftCount}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.rightDirectCount}+ {member?.rightCount}
                        </TableCell>

                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.leftAssociateBalance},
                          {member?.leftSilverBalance},{member?.leftGoldBalance},
                          {member?.leftDiamondBalance}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.rightAssociateBalance},
                          {member?.rightSilverBalance},
                          {member?.rightGoldBalance},
                          {member?.rightDiamondBalance}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.associateCommissionCount},
                          {member?.silverCommissionCount},
                          {member?.goldCommissionCount},
                          {member?.diamondCommissionCount}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.matchingMentorIncomeL1}
                        </TableCell>
                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {member?.matchingMentorIncomeL2}
                        </TableCell>

                        <TableCell className="max-w-[250px] break-words whitespace-normal">
                          {formatCurrency(member?.matchingIncomeWalletBalance)}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full  ${
                              member.is2_1Pass === false
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {member.is2_1Pass ? "TRUE" : "FALSE"}
                          </span>
                        </TableCell>
                        {/* <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {member?.leftDirectCount}
                      </TableCell> */}

                        {/* <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {member?.rightDirectCount}
                      </TableCell> */}
                        {/* <TableCell className="max-w-[250px] break-words whitespace-normal">
                        <span>
                          {visiblePasswords[member.id]
                            ? member?.user?.password || "N/A"
                            : "********"}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(member.id)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          {visiblePasswords[member.id] ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </TableCell> */}
                        {/* <TableCell className="max-w-[250px] break-words whitespace-normal">
                        <span>
                          {visibleTPins[member.id]
                            ? member?.tPin || "N/A"
                            : "********"}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleTPinVisibility(member.id)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          {visibleTPins[member.id] ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </TableCell> */}
                        {/* <TableCell className="max-w-[200px] break-words whitespace-normal">
                        {member.memberEmail || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {member.memberMobile || "N/A"}
                      </TableCell> */}
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full  ${
                              member.status === INACTIVE
                                ? "bg-red-100 text-red-600"
                                : member.status === ASSOCIATE
                                ? "bg-blue-100 text-blue-600"
                                : member.status === SILVER
                                ? "bg-gray-200 text-gray-700"
                                : member.status === GOLD
                                ? "bg-yellow-200 text-yellow-800"
                                : member.status === DIAMOND
                                ? "bg-green-200 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {member.status ? member.status : "N/A"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/members/${member.id}/edit`)
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <SquarePen className="h-4 w-4" />
                                    <span>Edit</span>
                                  </div>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    impersonateMutation.mutate(
                                      member?.user?.id
                                    ); // or member.user?.id
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <ShieldEllipsis className="h-4 w-4" />
                                    <span>Visit Account</span>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTimeout(() => {
                                      setSelectedVirtualMember(member);
                                      setVirtualDialogOpen(true);
                                    }, 0); // 50ms is usually enough
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <SquarePen className="h-4 w-4" />
                                    <span>Virtual Power</span>
                                  </div>
                                </DropdownMenuItem>
                                {!member.isFranchise && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setTimeout(() => {
                                        setSelectedFranchiseMember(member);
                                        setFranchiseDialogOpen(true);
                                      }, 0); // 50ms is usually enough
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="h-4 w-4" />
                                      <span>Make Franchise</span>
                                    </div>
                                  </DropdownMenuItem>
                                )}
                                {member.isFranchise && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setTimeout(() => {
                                        setSelectedDepositMember(member);
                                        setDepositDialogOpen(true);
                                      }, 0); // 50ms is usually enough
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Wallet className="h-4 w-4" />
                                      <span>Security Deposit</span>
                                    </div>
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  onClick={() => {
                                    setTimeout(() => {
                                      setSelectedLoanMember(member);
                                      setLoanDialogOpen(true);
                                    }, 0); // 50ms is usually enough
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <HandCoins className="h-4 w-4" />
                                    <span>Add Loan</span>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/members/${member.id}/wallet`)
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4" />
                                    <span>Wallet</span>
                                  </div>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                  onPageChange={setCurrentPage} // Pass setCurrentPage directly
                  onRecordsPerPageChange={(newRecordsPerPage) => {
                    setRecordsPerPage(newRecordsPerPage);
                    setCurrentPage(1); // Reset to the first page when records per page changes
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center">No Members Found.</div>
          )}
        </CardContent>
      </Card>

      {virtualDialogOpen && selectedVirtualMember && (
        <AddVirtualPower
          open={virtualDialogOpen}
          onClose={() => setVirtualDialogOpen(false)}
          member={selectedVirtualMember}
        />
      )}

      {franchiseDialogOpen && selectedFranchiseMember && (
        <MakeFranchise
          open={franchiseDialogOpen}
          onClose={() => setFranchiseDialogOpen(false)}
          member={selectedFranchiseMember}
        />
      )}

      {depositDialogOpen && selectedDepositMember && (
        <AddSecurityDepositDialog
          open={depositDialogOpen}
          onClose={() => setDepositDialogOpen(false)}
          member={selectedDepositMember}
        />
      )}

      {loanDialogOpen && selectedLoanMember && (
        <AddLoanDialog
          open={loanDialogOpen}
          onClose={() => setLoanDialogOpen(false)}
          member={selectedLoanMember}
        />
      )}
    </div>
  );
};

export default MemberList;
