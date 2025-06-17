import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const NodeCard = ({ label, onClick }) => (
  <Card className="text-center px-4 py-2 bg-white shadow-md rounded-2xl border w-32">
    <CardContent className="p-2">
      <Button variant="ghost" className="text-sm font-medium" onClick={onClick}>
        {label}
      </Button>
    </CardContent>
  </Card>
);

const Line = ({ from, to }) => {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="black"
      strokeWidth="2"
    />
  );
};

const BinaryTreeNode = ({ node, onClick, positions, parentPos }) => {
  const nodeKey = node.label;
  const currentPos = positions[nodeKey];
  const left = node.left;
  const right = node.right;

  return (
    <>
      {parentPos && (
        <Line from={parentPos} to={currentPos} />
      )}
      <foreignObject x={currentPos.x - 64} y={currentPos.y - 30} width="128" height="60">
        <NodeCard label={node.label} onClick={() => onClick(node)} />
      </foreignObject>
      {left && (
        <BinaryTreeNode node={left} onClick={onClick} positions={positions} parentPos={currentPos} />
      )}
      {right && (
        <BinaryTreeNode node={right} onClick={onClick} positions={positions} parentPos={currentPos} />
      )}
    </>
  );
};

const generatePositions = (node, depth = 0, offset = 0, gap = 140) => {
  if (!node) return [0, {}];
  const [leftWidth, leftPos] = generatePositions(node.left, depth + 1, offset, gap);
  const [rightWidth, rightPos] = generatePositions(node.right, depth + 1, offset + leftWidth + 1, gap);

  const currentIndex = offset + leftWidth;
  const pos = {
    [node.label]: {
      x: currentIndex * gap + 64,
      y: depth * 100 + 30,
    },
  };
  return [leftWidth + 1 + rightWidth, { ...leftPos, ...rightPos, ...pos }];
};

const BinaryTreeChart = ({ tree }) => {
  const [_, positions] = generatePositions(tree);

  const handleClick = (node) => {
    alert(`Clicked: ${node.label}`);
  };

  return (
    <div className="relative w-full h-auto">
      <svg width="100%" height="600">
        <BinaryTreeNode node={tree} onClick={handleClick} positions={positions} />
      </svg>
    </div>
  );
};

// Example tree
const treeData = {
  label: 'Root',
  left: {
    label: 'L1',
    left: { label: 'L2' },
    right: { label: 'R2' },
  },
  right: {
    label: 'R1',
    left: { label: 'L3' },
    right: { label: 'R3' },
  },
};

export default function OrgChartBinary() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Binary System Org Chart</h2>
      <BinaryTreeChart tree={treeData} />
    </div>
  );
}
