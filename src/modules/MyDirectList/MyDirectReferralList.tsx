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
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Loader,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import CustomPagination from "@/components/common/custom-pagination";
import {
  LEFT,
  RIGHT,
  GOLD,
  SILVER,
  DIAMOND,
  ASSOCIATE,
  INACTIVE,
} from "../../config/data";

const fetchReferrals = async (
  page: number,
  sortBy: string,
  sortOrder: string,
  search: string,
  recordsPerPage: number,
  currentMemberId: number | null = null
) => {
  const memberId = currentMemberId ? `&currentMemberId=${currentMemberId}` : "";
  const response = await get(
    `/members/direct-referrals?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&limit=${recordsPerPage}${memberId}`
  );
  return response;
};

const MyDirectReferralList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("memberUsername");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "direct-referrals",
      currentPage,
      sortBy,
      sortOrder,
      search,
      recordsPerPage,
      currentMemberId,
    ],
    queryFn: () =>
      fetchReferrals(
        currentPage,
        sortBy,
        sortOrder,
        search,
        recordsPerPage,
        currentMemberId
      ),
  });

  const referrals = data?.referrals || [];
  const totalPages = data?.totalPages || 1;
  const totalReferrals = data?.totalReferrals || 0;
  const currentMemberName = data?.currentMemberName || "User";

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="mt-2 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-2">
        {currentMemberName}'s Direct Referrals
      </h1>

      <Card className="mx-auto mt-6 sm:mt-10">
        <CardContent>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <div className="flex-grow">
              <Input
                placeholder="Search..."
                value={search}
                onChange={handleSearchChange}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {currentMemberId && (
              <div>
                <Button onClick={() => setCurrentMemberId(null)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              </div>
            )}
          </div>

          <Separator className="mb-4" />

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">
              Failed to load referrals.
            </div>
          ) : referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("memberUsername")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Member ID
                        {sortBy === "memberUsername" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} className="ml-1" />
                          ) : (
                            <ChevronDown size={16} className="ml-1" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("memberName")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Member Name
                        {sortBy === "memberName" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} className="ml-1" />
                          ) : (
                            <ChevronDown size={16} className="ml-1" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("status")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Member Status
                        {sortBy === "status" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} className="ml-1" />
                          ) : (
                            <ChevronDown size={16} className="ml-1" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("positionToParent")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Position
                        {sortBy === "positionToParent" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} className="ml-1" />
                          ) : (
                            <ChevronDown size={16} className="ml-1" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("pvBalance")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        PV Balance
                        {sortBy === "pvBalance" &&
                          (sortOrder === "asc" ? (
                            <ChevronUp size={16} className="ml-1" />
                          ) : (
                            <ChevronDown size={16} className="ml-1" />
                          ))}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50 transition"
                      onClick={() => setCurrentMemberId(referral.id)}
                      key={referral.id}
                    >
                      <TableCell className="max-w-[250px] p-4 break-words whitespace-normal">
                        {referral?.memberUsername
                          ? referral.memberUsername
                          : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {referral?.memberName ? referral.memberName : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {referral?.status ? (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full  ${
                              referral.status === INACTIVE
                                ? "bg-red-100 text-red-600"
                                : referral.status === ASSOCIATE
                                ? "bg-blue-100 text-blue-600"
                                : referral.status === SILVER
                                ? "bg-gray-200 text-gray-700"
                                : referral.status === GOLD
                                ? "bg-yellow-200 text-yellow-800"
                                : referral.status === DIAMOND
                                ? "bg-green-200 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {referral.status ? referral.status : "N/A"}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {referral?.positionToParent
                          ? referral.positionToParent
                          : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[250px] break-words whitespace-normal">
                        {referral?.pvBalance != null
                          ? parseFloat(referral.pvBalance).toFixed(2)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={totalReferrals}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage}
                onRecordsPerPageChange={(newLimit) => {
                  setRecordsPerPage(newLimit);
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : (
            <div className="text-center">No Referrals Found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyDirectReferralList;
