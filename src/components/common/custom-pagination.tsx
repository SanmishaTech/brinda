import * as React from "react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
  onRecordsPerPageChange: (recordsPerPage: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  recordsPerPage,
  onPageChange,
  onRecordsPerPageChange,
}) => {
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);

  // Calculate visible page numbers
  const visiblePages = () => {
    const pages = [];
    const maxVisible = 3;

    if (totalPages <= maxVisible + 2) {
      // Show all if few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const start = Math.max(2, currentPage);
      const end = Math.min(currentPage + 2, totalPages - 1);

      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push("...");

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
      {/* Number of Records */}
      <div className="text-sm text-gray-600">
        Showing {startRecord} to {endRecord} of {totalRecords} records
      </div>

      {/* Records Per Page Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Records per page:</span>
        <Select
          value={recordsPerPage.toString()}
          onValueChange={(value) => onRecordsPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder={`${recordsPerPage}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pagination */}
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              isActive={currentPage !== 1}
            >
              Previous
            </PaginationPrevious>
          </PaginationItem>

          {/* Dynamic Page Links */}
          {visiblePages().map((page, idx) => (
            <PaginationItem key={idx}>
              {page === "..." ? (
                <span className="px-2 text-gray-400">...</span>
              ) : (
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => onPageChange(Number(page))}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages && onPageChange(currentPage + 1)
              }
              isActive={currentPage !== totalPages}
            >
              Next
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CustomPagination;
