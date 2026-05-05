"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

type NodeData = {
  name: string;
  color?: string;
  role?: string;
  company?: string;
};

export const EntityNode = memo(({ data, selected }: NodeProps) => {
  const d = data as NodeData;
  const subtitle = [d.role, d.company].filter(Boolean).join(" @ ");

  return (
    <div
      className="cursor-pointer transition-all duration-200"
      style={{
        filter: selected
          ? "drop-shadow(0 0 12px rgba(255,255,255,0.4))"
          : undefined,
      }}
    >
      <Handle type="source" position={Position.Top} className="!bg-white/30 !border-white/20 !w-2 !h-2" />
      <Handle type="target" position={Position.Bottom} className="!bg-white/30 !border-white/20 !w-2 !h-2" />
      <Handle type="source" position={Position.Left} className="!bg-white/30 !border-white/20 !w-2 !h-2" />
      <Handle type="target" position={Position.Right} className="!bg-white/30 !border-white/20 !w-2 !h-2" />

      <div
        className={`
          relative px-4 py-3 rounded-xl border-2 min-w-[110px] text-center
          ${selected ? "border-white/80 scale-105" : "border-white/20 hover:border-white/50"}
          transition-all duration-200
        `}
        style={{
          background: `linear-gradient(135deg, ${d.color ?? "#6366f1"}cc, ${d.color ?? "#6366f1"}88)`,
          boxShadow: selected
            ? `0 0 24px ${d.color ?? "#6366f1"}80`
            : `0 4px 20px ${d.color ?? "#6366f1"}40`,
        }}
      >
        <div className="text-white font-semibold text-sm tracking-wide">{d.name}</div>
        {subtitle && (
          <div className="text-white/60 text-xs mt-0.5 truncate max-w-[140px]">{subtitle}</div>
        )}
      </div>
    </div>
  );
});

EntityNode.displayName = "EntityNode";
