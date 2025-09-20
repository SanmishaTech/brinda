import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { ASSOCIATE, DIAMOND, GOLD, INACTIVE, SILVER } from "@/config/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Medal, Gem, Star, Users } from "lucide-react"; // You can choose better icons if needed
import { Badge } from "@/components/ui/badge";
// Get memberId from localStorage
const getLoggedInMemberId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.memberId || null;
  } catch {
    return null;
  }
};

// Format name: only first word of memberName
const formatLabel = (name, username) => {
  const firstName = name?.split(" ")[0] || name;
  return `${firstName} (${username})`;
};

function SummaryTable({ rootMember, leftMostMember, rightMostMember }) {
  const ranks = ["Associates", "Silver", "Gold", "Diamond"];

  const leftBalances = [
    rootMember.leftAssociateBalance,
    rootMember.leftSilverBalance,
    rootMember.leftGoldBalance,
    rootMember.leftDiamondBalance,
  ];

  const rightBalances = [
    rootMember.rightAssociateBalance,
    rootMember.rightSilverBalance,
    rootMember.rightGoldBalance,
    rootMember.rightDiamondBalance,
  ];

  const totalLeftBalances = [
    rootMember.totalLeftAssociateBalance,
    rootMember.totalLeftSilverBalance,
    rootMember.totalLeftGoldBalance,
    rootMember.totalLeftDiamondBalance,
  ];

  const totalRightBalances = [
    rootMember.totalRightAssociateBalance,
    rootMember.totalRightSilverBalance,
    rootMember.totalRightGoldBalance,
    rootMember.totalRightDiamondBalance,
  ];

  const totalMatched = [
    rootMember.totalAssociateMatched,
    rootMember.totalSilverMatched,
    rootMember.totalGoldMatched,
    rootMember.totalDiamondMatched,
  ];

  // Check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const commissionCounts = [
    isToday(rootMember.associateCommissionDate)
      ? rootMember.associateCommissionCount
      : 0,
    isToday(rootMember.silverCommissionDate)
      ? rootMember.silverCommissionCount
      : 0,
    isToday(rootMember.goldCommissionDate) ? rootMember.goldCommissionCount : 0,
    isToday(rootMember.diamondCommissionDate)
      ? rootMember.diamondCommissionCount
      : 0,
  ];

  return (
    <Card className="mb-6 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Member Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          {rootMember.memberName}, {rootMember.memberUsername}
        </p>
      </CardHeader>
      <CardContent>
        {/* New Total Balances Tables */}
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Total Left Table */}
          <div className="w-full border rounded-lg border-gray-300 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead colSpan={4} className="text-center font-semibold">
                    Total Left Side
                  </TableHead>
                </TableRow>
                <TableRow>
                  {ranks.map((rank, idx) => (
                    <TableHead key={idx} className="text-center">
                      {rank}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {totalLeftBalances.map((balance, idx) => (
                    <TableCell key={idx} className="text-center">
                      {balance}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Total Right Table */}
          <div className="w-full border rounded-lg border-gray-300 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead colSpan={4} className="text-center font-semibold">
                    Total Right Side
                  </TableHead>
                </TableRow>
                <TableRow>
                  {ranks.map((rank, idx) => (
                    <TableHead key={idx} className="text-center">
                      {rank}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {totalRightBalances.map((balance, idx) => (
                    <TableCell key={idx} className="text-center">
                      {balance}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 w-full mt-6">
          {/* Left Table */}
          <div className="w-full border rounded-lg border-gray-300 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead colSpan={4} className="text-center font-semibold">
                    Left Remaining
                  </TableHead>
                </TableRow>
                <TableRow>
                  {ranks.map((rank, idx) => (
                    <TableHead key={idx} className="text-center">
                      {rank}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {leftBalances.map((balance, idx) => (
                    <TableCell key={idx} className="text-center">
                      {balance}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Right Table */}
          <div className="w-full border rounded-lg border-gray-300 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead colSpan={4} className="text-center font-semibold">
                    Right Remaining
                  </TableHead>
                </TableRow>
                <TableRow>
                  {ranks.map((rank, idx) => (
                    <TableHead key={idx} className="text-center">
                      {rank}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {rightBalances.map((balance, idx) => (
                    <TableCell key={idx} className="text-center">
                      {balance}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 w-full mt-6">
          {/* Matched Table */}
          <div className="w-full border rounded-lg border-gray-300 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead colSpan={4} className="text-center font-semibold">
                    Total Matched
                  </TableHead>
                </TableRow>
                <TableRow>
                  {ranks.map((rank, idx) => (
                    <TableHead key={idx} className="text-center">
                      {rank}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {totalMatched.map((count, idx) => (
                    <TableCell key={idx} className="text-center">
                      {count}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Commission Count Table (with date check) */}
          <div className="w-full border rounded-lg border-gray-300 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead colSpan={4} className="text-center font-semibold">
                    Today's Commission Counts
                  </TableHead>
                </TableRow>
                <TableRow>
                  {ranks.map((rank, idx) => (
                    <TableHead key={idx} className="text-center">
                      {rank}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {commissionCounts.map((count, idx) => (
                    <TableCell key={idx} className="text-center">
                      {count}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Extreme Left and Right Member Cards */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 mt-6">
          {/* Leftmost Member Card */}
          {leftMostMember && (
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-green-400 to-blue-500 p-4 rounded-lg shadow-md text-white">
              <h3 className="text-xl font-bold mb-1">Extreme Left Member</h3>
              <p className="text-xl">{leftMostMember.memberName}</p>
              <p className="text-lg">{leftMostMember.memberUsername}</p>
            </div>
          )}

          {/* Rightmost Member Card */}
          {rightMostMember && (
            <div
              className={`w-full lg:w-1/2 bg-gradient-to-br from-pink-500 to-red-500 p-4 rounded-lg shadow-md text-white text-right ${
                !leftMostMember ? "lg:ml-auto" : ""
              }`}
            >
              <h3 className="text-xl font-bold mb-1">Extreme Right Member</h3>
              <p className="text-xl">{rightMostMember.memberName}</p>
              <p className="text-lg">{rightMostMember.memberUsername}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Map API response to tree structure
const mapApiDataToTree = (data) => {
  if (!data.rootMember) return null;

  return {
    label: formatLabel(
      data.rootMember.memberName,
      data.rootMember.memberUsername
    ),
    status: data.rootMember.status,
    id: data.rootMember.id,
    createdAt: data.rootMember.latestStatusLog?.createdAt || null,
    left: data.leftMember
      ? {
          label: formatLabel(
            data.leftMember.memberName,
            data.leftMember.memberUsername
          ),
          status: data.leftMember.status,
          id: data.leftMember.id,
          createdAt: data.leftMember.latestStatusLog?.createdAt || null,
          left: data.leftsLeftMember
            ? {
                label: formatLabel(
                  data.leftsLeftMember.memberName,
                  data.leftsLeftMember.memberUsername
                ),
                status: data.leftsLeftMember.status,
                id: data.leftsLeftMember.id,
                createdAt:
                  data.leftsLeftMember.latestStatusLog?.createdAt || null,
              }
            : null,
          right: data.leftsRightMember
            ? {
                label: formatLabel(
                  data.leftsRightMember.memberName,
                  data.leftsRightMember.memberUsername
                ),
                status: data.leftsRightMember.status,
                id: data.leftsRightMember.id,
                createdAt:
                  data.leftsRightMember.latestStatusLog?.createdAt || null,
              }
            : null,
        }
      : null,
    right: data.rightMember
      ? {
          label: formatLabel(
            data.rightMember.memberName,
            data.rightMember.memberUsername
          ),
          status: data.rightMember.status,
          id: data.rightMember.id,
          createdAt: data.rightMember.latestStatusLog?.createdAt || null,
          left: data.rightsLeftMember
            ? {
                label: formatLabel(
                  data.rightsLeftMember.memberName,
                  data.rightsLeftMember.memberUsername
                ),
                status: data.rightsLeftMember.status,
                id: data.rightsLeftMember.id,
                createdAt:
                  data.rightsLeftMember.latestStatusLog?.createdAt || null,
              }
            : null,
          right: data.rightsRightMember
            ? {
                label: formatLabel(
                  data.rightsRightMember.memberName,
                  data.rightsRightMember.memberUsername
                ),
                status: data.rightsRightMember.status,
                id: data.rightsRightMember.id,
                createdAt:
                  data.rightsRightMember.latestStatusLog?.createdAt || null,
              }
            : null,
        }
      : null,
  };
};

// Main Component
export default function OrgChartBinary() {
  const initialMemberId = getLoggedInMemberId();
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId);
  const [history, setHistory] = useState([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["genealogy", selectedMemberId],
    queryFn: () => get(`/members/genealogy/${selectedMemberId}`),
    enabled: !!selectedMemberId,
  });

  const handleNodeClick = (node) => {
    if (!node?.id || node.id === selectedMemberId) return;
    setHistory((prev) => [...prev, selectedMemberId]); // Save current to history
    setSelectedMemberId(node.id);
  };

  const handleBack = () => {
    setHistory((prev) => {
      const newHistory = [...prev];
      const lastId = newHistory.pop();
      if (lastId) {
        setSelectedMemberId(lastId);
      }
      return newHistory;
    });
  };

  const handleReset = () => {
    setHistory([]);
    setSelectedMemberId(initialMemberId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Error loading tree.</div>;

  const tree = mapApiDataToTree(data);
  const rootMember = data?.rootMember;
  const leftMostMember = data?.leftMostMember;
  const rightMostMember = data?.rightMostMember;

  return (
    <div className="p-6 mt-2">
      <SummaryTable
        rootMember={rootMember}
        rightMostMember={rightMostMember}
        leftMostMember={leftMostMember}
      />
      <Card className="mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4 px-6">
          <h2 className="text-xl font-semibold">
            {rootMember?.memberName?.split(" ")[0] || "Member"}'s Genealogy
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={handleBack}
              disabled={history.length === 0}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
            >
              Back
            </Button>
            <Button
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-600 to-gray-800 text-white hover:from-gray-700 hover:to-gray-900"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <BinaryTreeChart tree={tree} onNodeClick={handleNodeClick} />
    </div>
  );
}

// Node card
// const NodeCard = ({ label, status, onClick }) => {
//   const getGradientBorderClass = (status) => {
//     switch (status) {
//       case INACTIVE:
//         return "from-red-400 to-red-700";
//       case ASSOCIATE:
//         return "from-blue-400 to-blue-700";
//       case SILVER:
//         return "from-gray-400 to-gray-600";
//       case GOLD:
//         return "from-yellow-400 to-yellow-600";
//       case DIAMOND:
//         return "from-green-400 to-green-700";
//       default:
//         return "from-gray-300 to-gray-500";
//     }
//   };

//   const gradientBorder = getGradientBorderClass(status);

//   // Split label into two lines
//   const [line1, line2] = label.split(" ", 2);

//   return (
//     <div
//       onClick={onClick}
//       className="relative w-full h-full rounded-md p-0.5 cursor-pointer transition-all hover:scale-[1.02]"
//     >
//       <div
//         className={`absolute inset-0 rounded-md bg-gradient-to-br ${gradientBorder} z-0`}
//       ></div>
//       <Card className="relative z-10 bg-white dark:bg-card w-full h-full rounded-md overflow-hidden">
//         <CardContent className="p-2 h-full flex flex-col justify-center items-center text-center">
//           <div className="text-xs font-medium whitespace-normal break-words w-full text-foreground flex flex-col leading-tight">
//             <span>{line1}</span>
//             <span>{line2}</span>
//           </div>
//           <div
//             className={`text-[10px] mt-2 font-semibold px-2 py-0.5 rounded-full ${
//               {
//                 [INACTIVE]:
//                   "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
//                 [ASSOCIATE]:
//                   "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
//                 [SILVER]:
//                   "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
//                 [GOLD]:
//                   "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100",
//                 [DIAMOND]:
//                   "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-200",
//               }[status] || "bg-muted text-muted-foreground"
//             }`}
//           >
//             {status}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

const NodeCard = ({ label, status, onClick, createdAt }) => {
  const getGradientForStatus = (status) => {
    switch (status) {
      case INACTIVE:
        return "from-red-500 to-red-700";
      case ASSOCIATE:
        return "from-blue-500 to-blue-700";
      case SILVER:
        return "from-gray-400 to-gray-600";
      case GOLD:
        return "from-yellow-400 to-yellow-600";
      case DIAMOND:
        return "from-green-500 to-green-700";
      default:
        return "from-gray-300 to-gray-500";
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formattedDate = formatDate(createdAt);

  const [line1, line2] = label.split(" ", 2);
  const gradient = getGradientForStatus(status);

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center cursor-pointer transition-transform hover:scale-[1.02]"
    >
      {/* Card with label */}
      <div className="relative w-[140px] h-[150px] rounded-md p-0.5">
        <div
          className={`absolute inset-0 rounded-md bg-gradient-to-br ${gradient} z-0`}
        />
        <Card className="relative z-10 bg-white dark:bg-card w-full h-full rounded-md overflow-hidden">
          <CardContent className="flex flex-col justify-between items-center text-center h-full p-2">
            {/* Name (split into 2 lines) */}
            <div className="text-xs font-medium whitespace-normal break-words w-full text-foreground flex flex-col leading-tight">
              <span>{line1}</span>
              <span>{line2}</span>
            </div>

            {/* Status bar at bottom */}
            <div
              className={`w-full mt-1 text-sm text-white text-center font-semibold rounded-md bg-gradient-to-r ${gradient} px-2 py-1`}
            >
              {status}
            </div>
            {/* Date */}
            {createdAt && (
              <div className="text-[12px] text-muted-foreground mt-1">
                {formattedDate}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Draw line
const Line = ({ from, to }) => (
  <line
    x1={from.x}
    y1={from.y}
    x2={to.x}
    y2={to.y}
    strokeWidth="2"
    className="stroke-black dark:stroke-gray-200"
  />
);

// Recursive binary tree node
const BinaryTreeNode = ({ node, onNodeClick, positions, parentPos }) => {
  const nodeKey = node.label;
  const currentPos = positions[nodeKey];

  const boxWidth = 140; // Keep width reasonable
  const boxHeight = 180; // Make height taller (to display full card)

  const nodeX = currentPos.x - boxWidth / 2;
  const nodeY = currentPos.y;

  const lineStart = parentPos
    ? { x: parentPos.x, y: parentPos.y + boxHeight / 2 }
    : null;

  const lineEnd = { x: currentPos.x, y: nodeY - boxHeight / 2 };

  return (
    <>
      {lineStart && <Line from={lineStart} to={lineEnd} />}
      <foreignObject
        x={nodeX}
        y={nodeY - boxHeight / 2}
        width={boxWidth}
        height={boxHeight}
      >
        <NodeCard
          label={node.label}
          status={node.status}
          createdAt={node.createdAt} // 👈 Pass this
          onClick={() => onNodeClick(node)}
        />
      </foreignObject>

      {node.left && (
        <BinaryTreeNode
          node={node.left}
          onNodeClick={onNodeClick}
          positions={positions}
          parentPos={currentPos}
        />
      )}
      {node.right && (
        <BinaryTreeNode
          node={node.right}
          onNodeClick={onNodeClick}
          positions={positions}
          parentPos={currentPos}
        />
      )}
    </>
  );
};

// Generate positions
const generatePositions = (node, depth = 0, offset = 0, gap = 140) => {
  if (!node) return [0, {}];
  const [leftWidth, leftPos] = generatePositions(
    node.left,
    depth + 1,
    offset,
    gap
  );
  const [rightWidth, rightPos] = generatePositions(
    node.right,
    depth + 1,
    offset + leftWidth + 1,
    gap
  );

  const currentIndex = offset + leftWidth;
  const pos = {
    [node.label]: {
      x: currentIndex * gap + 120,
      y: depth * 220 + 90, // Increase spacing + initial Y
    },
  };

  return [leftWidth + 1 + rightWidth, { ...leftPos, ...rightPos, ...pos }];
};

// Binary tree chart
const BinaryTreeChart = ({ tree, onNodeClick }) => {
  const [_, positions] = generatePositions(tree);
  const maxY = Math.max(...Object.values(positions).map((p) => p.y)) + 100;
  const maxX = Math.max(...Object.values(positions).map((p) => p.x)) + 120;

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.innerWidth >= 640) {
      container.scrollLeft =
        (container.scrollWidth - container.clientWidth) / 2;
    } else {
      container.scrollLeft = 100; // tweak for mobile if needed
    }
  }, [tree]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-auto overflow-x-auto flex justify-start sm:justify-center"
      style={{ scrollBehavior: "smooth" }}
    >
      <div
        className="origin-top-center sm:scale-[0.85] scale-[0.95] pl-[200px] sm:pl-0"
        style={{ width: maxX, minWidth: maxX }}
      >
        <svg width={maxX} height={maxY}>
          <BinaryTreeNode
            node={tree}
            onNodeClick={onNodeClick}
            positions={positions}
          />
        </svg>
      </div>
    </div>
  );
};
