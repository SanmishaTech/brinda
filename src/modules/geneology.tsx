import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon } from "lucide-react";
import { motion } from "framer-motion";

import React, { useState, useEffect } from "react";

export default function OrgChartBinary() {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial load for root member (you can change memberId as needed)
  useEffect(() => {
    fetchMemberTree(1); // e.g. root member id 1
  }, []);

  const fetchMemberTree = async (memberId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/myGeneology/${memberId}`); // Your backend API endpoint
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      // Map backend response to tree format your component needs:
      const mappedTree = mapApiDataToTree(data);
      setTree(mappedTree);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: map your API response to your BinaryTreeChart node structure
  const mapApiDataToTree = (data) => {
    if (!data.rootMember) return null;

    // Recursive helper to map member and children
    const buildNode = (member, left, right) => {
      if (!member) return null;
      return {
        label: member.memberName || member.memberUsername || `ID: ${member.id}`,
        id: member.id,
        left: buildNode(left?.member, leftsLeftMember, leftsRightMember),
        right: buildNode(right?.member, rightsLeftMember, rightsRightMember),
      };
    };

    // Your API data has rootMember and 6 others — adapt here:
    return {
      label: data.rootMember.memberName || data.rootMember.memberUsername,
      id: data.rootMember.id,
      left: data.leftMember
        ? {
            label: data.leftMember.memberName || data.leftMember.memberUsername,
            id: data.leftMember.id,
            left: data.leftsLeftMember,
            right: data.leftsRightMember,
          }
        : null,
      right: data.rightMember
        ? {
            label:
              data.rightMember.memberName || data.rightMember.memberUsername,
            id: data.rightMember.id,
            left: data.rightsLeftMember,
            right: data.rightsRightMember,
          }
        : null,
    };
  };

  // Click handler passed down to nodes:
  const handleNodeClick = (node) => {
    if (!node || !node.id) return;
    fetchMemberTree(node.id);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tree) return <div>No data</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Binary System Org Chart</h2>
      <BinaryTreeChart tree={tree} onNodeClick={handleNodeClick} />
    </div>
  );
}

const BinaryTreeNode = ({ node, onNodeClick, positions, parentPos }) => {
  const nodeKey = node.label;
  const currentPos = positions[nodeKey];
  const left = node.left;
  const right = node.right;

  const NodeCard = ({ label, onClick }) => (
    <Card className="text-center px-4 py-2 bg-white shadow-md rounded-2xl border w-32">
      <CardContent className="p-2">
        <Button
          variant="ghost"
          className="text-sm font-medium"
          onClick={onClick}
        >
          {label}
        </Button>
      </CardContent>
    </Card>
  );

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
      {left && (
        <BinaryTreeNode
          node={left}
          onNodeClick={onNodeClick}
          positions={positions}
          parentPos={currentPos}
        />
      )}
      {right && (
        <BinaryTreeNode
          node={right}
          onNodeClick={onNodeClick}
          positions={positions}
          parentPos={currentPos}
        />
      )}
    </>
  );
};

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
