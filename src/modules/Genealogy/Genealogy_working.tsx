import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/services/apiService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    id: data.rootMember.id,
    left: data.leftMember
      ? {
          label: data.leftMember.memberName || data.leftMember.memberUsername,
          id: data.leftMember.id,
          left: data.leftsLeftMember
            ? {
                label:
                  data.leftsLeftMember.memberName ||
                  data.leftsLeftMember.memberUsername,
                id: data.leftsLeftMember.id,
              }
            : null,
          right: data.leftsRightMember
            ? {
                label:
                  data.leftsRightMember.memberName ||
                  data.leftsRightMember.memberUsername,
                id: data.leftsRightMember.id,
              }
            : null,
        }
      : null,
    right: data.rightMember
      ? {
          label: data.rightMember.memberName || data.rightMember.memberUsername,
          id: data.rightMember.id,
          left: data.rightsLeftMember
            ? {
                label:
                  data.rightsLeftMember.memberName ||
                  data.rightsLeftMember.memberUsername,
                id: data.rightsLeftMember.id,
              }
            : null,
          right: data.rightsRightMember
            ? {
                label:
                  data.rightsRightMember.memberName ||
                  data.rightsRightMember.memberUsername,
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
      <h2 className="text-xl font-semibold mb-4">Binary System Org Chart</h2>
      <BinaryTreeChart tree={tree} onNodeClick={handleNodeClick} />
    </div>
  );
}

// 🎯 Node visual component
const NodeCard = ({ label, onClick }) => (
  <Card className="text-center px-4 py-2 bg-white shadow-md rounded-2xl border w-32">
    <CardContent className="p-2">
      <Button variant="ghost" className="text-sm font-medium" onClick={onClick}>
        {label}
      </Button>
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

  return (
    <>
      {parentPos && <Line from={parentPos} to={currentPos} />}
      <foreignObject
        x={currentPos.x - 64}
        y={currentPos.y - 30}
        width="128"
        height="60"
      >
        <NodeCard label={node.label} onClick={() => onNodeClick(node)} />
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
      x: currentIndex * gap + 64,
      y: depth * 100 + 30,
    },
  };

  return [leftWidth + 1 + rightWidth, { ...leftPos, ...rightPos, ...pos }];
};

// 🎯 Chart renderer
const BinaryTreeChart = ({ tree, onNodeClick }) => {
  const [_, positions] = generatePositions(tree);

  return (
    <div className="relative w-full h-auto">
      <svg width="100%" height="600">
        <BinaryTreeNode
          node={tree}
          onNodeClick={onNodeClick}
          positions={positions}
        />
      </svg>
    </div>
  );
};
