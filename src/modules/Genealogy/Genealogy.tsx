import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ASSOCIATE, DIAMOND, GOLD, INACTIVE, SILVER } from "@/config/data";

// 🎯 Get memberId from localStorage
const getLoggedInMemberId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.memberId || null;
  } catch {
    return null;
  }
};

// 🎯 Map backend response to tree structure
const mapApiDataToTree = (data) => {
  if (!data.rootMember) return null;

  return {
    label: `${data.rootMember.memberName} ( ${data.rootMember.memberUsername})`,
    status: data.rootMember.status,
    id: data.rootMember.id,
    left: data.leftMember
      ? {
          label: `${data.leftMember.memberName} ( ${data.leftMember.memberUsername})`,
          status: data.leftMember.status,
          id: data.leftMember.id,

          left: data.leftsLeftMember
            ? {
                label: `${data.leftsLeftMember.memberName} ( ${data.leftsLeftMember.memberUsername})`,
                status: data.leftsLeftMember.status,
                id: data.leftsLeftMember.id,
              }
            : null,
          right: data.leftsRightMember
            ? {
                label: `${data.leftsRightMember.memberName} ( ${data.leftsRightMember.memberUsername})`,
                status: data.leftsRightMember.status,
                id: data.leftsRightMember.id,
              }
            : null,
        }
      : null,
    right: data.rightMember
      ? {
          label: `${data.rightMember.memberName} ( ${data.rightMember.memberUsername})`,
          status: data.rightMember.status,
          id: data.rightMember.id,

          left: data.rightsLeftMember
            ? {
                label: `${data.rightsLeftMember.memberName} ( ${data.rightsLeftMember.memberUsername})`,
                status: data.rightsLeftMember.status,
                id: data.rightsLeftMember.id,
              }
            : null,
          right: data.rightsRightMember
            ? {
                label: `${data.rightsRightMember.memberName} ( ${data.rightsRightMember.memberUsername})`,
                status: data.rightsRightMember.status,
                id: data.rightsRightMember.id,
              }
            : null,
        }
      : null,
  };
};

// 📦 Main component
export default function OrgChartBinary() {
  const initialMemberId = getLoggedInMemberId();
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId);

  const { data, isLoading, isError, refetch } = useQuery({
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

  return (
    <div className="p-6 mt-2 ">
      <h2 className="text-xl font-semibold mb-4">My Genealogy</h2>
      <BinaryTreeChart tree={tree} onNodeClick={handleNodeClick} />
    </div>
  );
}

// 🎯 Node visual component
const NodeCard = ({ label, status, onClick }) => (
  <Card className="bg-white shadow-md border rounded-md w-full h-full">
    <CardContent className="p-2 h-full flex flex-col justify-center items-center text-center">
      <Button
        variant="ghost"
        className="text-xs font-medium whitespace-normal break-words w-full"
        onClick={onClick}
      >
        {label}
      </Button>
      <div
        className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full
    ${
      status === INACTIVE
        ? "bg-red-100 text-red-600"
        : status === ASSOCIATE
        ? "bg-blue-100 text-blue-600"
        : status === SILVER
        ? "bg-gray-200 text-gray-700"
        : status === GOLD
        ? "bg-yellow-200 text-yellow-800"
        : status === DIAMOND
        ? "bg-green-200 text-green-700"
        : "bg-gray-100 text-gray-500"
    }
  `}
      >
        {status}
      </div>
    </CardContent>
  </Card>
);

// 🎯 Line between nodes
const Line = ({ from, to }) => (
  <line
    x1={from.x}
    y1={from.y}
    x2={to.x}
    y2={to.y}
    stroke="black"
    strokeWidth="2"
  />
);

// 🎯 Recursive node rendering
const BinaryTreeNode = ({ node, onNodeClick, positions, parentPos }) => {
  const nodeKey = node.label;
  const currentPos = positions[nodeKey];

  const boxWidth = 200; // was 200
  const boxHeight = 100; // was 80

  const nodeX = currentPos.x - boxWidth / 2;
  const nodeY = currentPos.y;

  const lineStart = parentPos
    ? { x: parentPos.x, y: parentPos.y + boxHeight / 2 } // from bottom of parent box
    : null;

  const lineEnd = { x: currentPos.x, y: nodeY - boxHeight / 2 }; // to top of current box

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

// 🎯 Position calculator
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
      x: currentIndex * gap + 120, // assuming boxWidth = 250
      y: depth * 140 + 30,
    },
  };

  return [leftWidth + 1 + rightWidth, { ...leftPos, ...rightPos, ...pos }];
};

// 🎯 Chart renderer
const BinaryTreeChart = ({ tree, onNodeClick }) => {
  const [_, positions] = generatePositions(tree);
  const maxY = Math.max(...Object.values(positions).map((p) => p.y)) + 100;

  // Calculate total width based on max x position
  const maxX = Math.max(...Object.values(positions).map((p) => p.x)) + 120;

  return (
    <div className="relative w-full h-auto overflow-x-auto flex justify-center">
      {/* Container with fixed width and scaling on mobile */}
      <div
        className="origin-top-left sm:scale-100 scale-50"
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
