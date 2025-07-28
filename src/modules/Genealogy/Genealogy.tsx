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

// function SummaryTable({ rootMember }) {
//   const ranks = [
//     { label: "Associates", icon: <Users className="h-4 w-4 text-gray-500" /> },
//     { label: "Silver", icon: <Medal className="h-4 w-4 text-silver-500" /> },
//     { label: "Gold", icon: <Star className="h-4 w-4 text-yellow-500" /> },
//     { label: "Diamond", icon: <Gem className="h-4 w-4 text-blue-500" /> },
//   ];

//   const leftBalances = [
//     rootMember.leftAssociateBalance,
//     rootMember.leftSilverBalance,
//     rootMember.leftGoldBalance,
//     rootMember.leftDiamondBalance,
//   ];

//   const rightBalances = [
//     rootMember.rightAssociateBalance,
//     rootMember.rightSilverBalance,
//     rootMember.rightGoldBalance,
//     rootMember.rightDiamondBalance,
//   ];

//   return (
//     <Card className="mb-6 shadow-md">
//       <CardHeader>
//         <CardTitle className="text-lg font-semibold">Member Details</CardTitle>
//         <p className="text-sm text-muted-foreground">
//           {rootMember.memberName}, {rootMember.memberUsername}
//         </p>
//       </CardHeader>
//       <CardContent>
//         <div className="flex w-full flex-col justify-between items-center lg:flex-row gap-6">
//           {/* Left Table */}
//           <Table className="w-full">
//             <TableHeader>
//               <TableRow>
//                 <TableHead colSpan={4} className="text-center">
//                   Left Side
//                 </TableHead>
//               </TableRow>
//               <TableRow>
//                 {ranks.map((rank) => (
//                   <TableHead key={`left-header-${rank.label}`}>
//                     {/* Flex container here */}
//                     <div className="flex items-center gap-1 whitespace-nowrap justify-center">
//                       {rank.icon}
//                       <span>{rank.label}</span>
//                     </div>
//                   </TableHead>
//                 ))}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               <TableRow>
//                 {leftBalances.map((balance, idx) => (
//                   <TableCell
//                     key={`left-balance-${idx}`}
//                     className="text-center"
//                   >
//                     <div className="inline-flex items-center justify-center rounded-md px-3 py-1 bg-muted">
//                       {balance}
//                     </div>
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableBody>
//           </Table>

//           {/* Right Table */}
//           <Table className="w-full ">
//             <TableHeader>
//               <TableRow>
//                 <TableHead colSpan={4} className="text-center">
//                   Right Side
//                 </TableHead>
//               </TableRow>
//               <TableRow>
//                 {ranks.map((rank) => (
//                   <TableHead key={`right-header-${rank.label}`}>
//                     {/* Flex container here */}
//                     <div className="flex items-center gap-1 whitespace-nowrap justify-center">
//                       {rank.icon}
//                       <span>{rank.label}</span>
//                     </div>
//                   </TableHead>
//                 ))}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               <TableRow>
//                 {rightBalances.map((balance, idx) => (
//                   <TableCell
//                     key={`right-balance-${idx}`}
//                     className="text-center"
//                   >
//                     <div className="inline-flex items-center justify-center rounded-md px-3 py-1 bg-muted">
//                       {balance}
//                     </div>
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
function SummaryTable({ rootMember }) {
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

  return (
    <Card className="mb-6 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Member Details</CardTitle>
        <p className="text-sm text-muted-foreground">
          {rootMember.memberName}, {rootMember.memberUsername}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Left Table */}
          <div className="w-full border rounded-lg border-gray-300 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead colSpan={4} className="text-center font-semibold">
                    Left Side
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
                    Right Side
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
    left: data.leftMember
      ? {
          label: formatLabel(
            data.leftMember.memberName,
            data.leftMember.memberUsername
          ),
          status: data.leftMember.status,
          id: data.leftMember.id,
          left: data.leftsLeftMember
            ? {
                label: formatLabel(
                  data.leftsLeftMember.memberName,
                  data.leftsLeftMember.memberUsername
                ),
                status: data.leftsLeftMember.status,
                id: data.leftsLeftMember.id,
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
          left: data.rightsLeftMember
            ? {
                label: formatLabel(
                  data.rightsLeftMember.memberName,
                  data.rightsLeftMember.memberUsername
                ),
                status: data.rightsLeftMember.status,
                id: data.rightsLeftMember.id,
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["genealogy", selectedMemberId],
    queryFn: () => get(`/members/genealogy/${selectedMemberId}`),
    enabled: !!selectedMemberId,
  });

  const handleNodeClick = (node) => {
    if (node?.id) setSelectedMemberId(node.id);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Error loading tree.</div>;

  const tree = mapApiDataToTree(data);
  const rootMember = data?.rootMember;
  return (
    <div className="p-6 mt-2">
      <SummaryTable rootMember={rootMember} />
      <h2 className="text-xl font-semibold mb-4">My Genealogy</h2>

      <BinaryTreeChart tree={tree} onNodeClick={handleNodeClick} />
    </div>
  );
}

// Node card
const NodeCard = ({ label, status, onClick }) => (
  <Card className="bg-white dark:bg-card shadow-md border border-border rounded-md w-full h-full">
    <CardContent className="p-2 h-full flex flex-col justify-center items-center text-center">
      <Button
        variant="ghost"
        className="text-xs font-medium whitespace-normal break-words w-full text-foreground"
        onClick={onClick}
      >
        {label}
      </Button>
      <div
        className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full
        ${
          status === INACTIVE
            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
            : status === ASSOCIATE
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
            : status === SILVER
            ? "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
            : status === GOLD
            ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100"
            : status === DIAMOND
            ? "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-200"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {status}
      </div>
    </CardContent>
  </Card>
);

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

  const boxWidth = 200;
  const boxHeight = 100;

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
      y: depth * 140 + 30,
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
