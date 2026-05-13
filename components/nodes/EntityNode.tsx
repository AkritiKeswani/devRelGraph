"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";

type NodeData = {
  name: string;
  color?: string;
  role?: string;
  company?: string;
};

export const EntityNode = memo(({ data, selected }: NodeProps) => {
  const d = data as NodeData;

  return (
    <div
      className="cursor-pointer transition-all duration-200 w-full h-full"
      style={{
        filter: selected
          ? "drop-shadow(0 0 12px rgba(255,255,255,0.4))"
          : undefined,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={60}
        lineClassName="!border-white/40"
        handleClassName="!bg-white !w-2 !h-2 !border-0"
      />
      <Handle type="source" position={Position.Top} className="!bg-white/30 !border-white/20 !w-2 !h-2" />
      <Handle type="target" position={Position.Bottom} className="!bg-white/30 !border-white/20 !w-2 !h-2" />
      <Handle type="source" position={Position.Left} className="!bg-white/30 !border-white/20 !w-2 !h-2" />
      <Handle type="target" position={Position.Right} className="!bg-white/30 !border-white/20 !w-2 !h-2" />

      <div
        className={`
          relative px-4 py-3 rounded-xl border-2 w-full h-full flex flex-col justify-center text-center
          ${selected ? "border-white/80" : "border-white/20 hover:border-white/50"}
          transition-all duration-200
        `}
        style={{
          background: `linear-gradient(135deg, ${d.color ?? "#6366f1"}cc, ${d.color ?? "#6366f1"}88)`,
          boxShadow: selected
            ? `0 0 24px ${d.color ?? "#6366f1"}80`
            : `0 4px 20px ${d.color ?? "#6366f1"}40`,
        }}
      >
        <div className="text-white font-bold text-sm tracking-wide truncate">{d.name}</div>
        {d.company && (
          <div className="text-white/85 text-xs mt-0.5 truncate">{d.company}</div>
        )}
        {d.role && (
          <div className="text-white/60 text-[11px] mt-0.5 truncate">{d.role}</div>
        )}
      </div>
    </div>
  );
});

EntityNode.displayName = "EntityNode";
