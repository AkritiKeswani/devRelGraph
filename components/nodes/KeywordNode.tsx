"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

export const KeywordNode = memo(({ data }: NodeProps) => {
  const nodeData = data as { label: string };

  return (
    <div className="relative">
      <Handle type="source" position={Position.Top} className="!bg-white/20 !border-white/10 !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Bottom} className="!bg-white/20 !border-white/10 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Left} className="!bg-white/20 !border-white/10 !w-1.5 !h-1.5" />
      <Handle type="target" position={Position.Right} className="!bg-white/20 !border-white/10 !w-1.5 !h-1.5" />

      <div
        className="
          px-3 py-1.5 rounded-full border border-white/20
          bg-white/5 backdrop-blur-sm
          text-white/70 text-xs font-medium tracking-wider uppercase
          hover:bg-white/10 hover:border-white/40 hover:text-white/90
          transition-all duration-200 cursor-default
        "
      >
        {nodeData.label}
      </div>
    </div>
  );
});

KeywordNode.displayName = "KeywordNode";
