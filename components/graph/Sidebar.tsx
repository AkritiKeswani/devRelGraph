"use client";

import { X, Tag, Building2, Briefcase, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGraphStore } from "@/lib/store";
import { PersonNode } from "@/lib/types";

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Sidebar() {
  const { nodes, edges, selectedNodeId, setSelectedNode } = useGraphStore();
  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) return null;

  const connectedEdges = edges.filter(
    (e) => e.source_id === node.id || e.target_id === node.id
  );
  const connectedNodes = connectedEdges
    .map((e) => {
      const otherId = e.source_id === node.id ? e.target_id : e.source_id;
      return { node: nodes.find((n) => n.id === otherId), label: e.label };
    })
    .filter(
      (c): c is { node: PersonNode; label: string | undefined } =>
        c.node !== undefined
    );

  return (
    <div
      className="
        absolute top-4 right-4 z-10 w-72
        bg-black/60 backdrop-blur-xl
        border border-white/10 rounded-2xl
        flex flex-col overflow-hidden
        shadow-2xl
      "
      style={{ maxHeight: "calc(100vh - 2rem)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: node.color ?? "#a78bfa" }}
            />
            <span className="text-white font-semibold text-base truncate">
              {node.name}
            </span>
          </div>
          <span className="ml-4.5 text-[10px] uppercase tracking-wider font-medium text-white/30 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
            {node.type}
          </span>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-white/30 hover:text-white/70 transition-colors ml-2 mt-0.5 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <Separator className="bg-white/10" />

      <ScrollArea className="flex-1">
        <div className="p-4 flex flex-col gap-4">
          {/* Role / Company */}
          {(node.role || node.company) && (
            <div className="flex flex-col gap-1.5">
              {node.role && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Briefcase size={12} className="text-white/30 flex-shrink-0" />
                  {node.role}
                </div>
              )}
              {node.company && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Building2 size={12} className="text-white/30 flex-shrink-0" />
                  {node.company}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {node.tags && node.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Tag size={11} className="text-white/30" />
                <span className="text-white/30 text-xs uppercase tracking-wider font-medium">
                  Tags
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {node.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-white/10 text-white/70 border-white/10 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {node.notes && (
            <div>
              <p className="text-white/30 text-xs uppercase tracking-wider font-medium mb-1.5">
                Notes
              </p>
              <p className="text-white/60 text-sm leading-relaxed">{node.notes}</p>
            </div>
          )}

          {/* Dates */}
          {(node.met_at || node.last_contacted) && (
            <div className="flex flex-col gap-1.5">
              {node.met_at && (
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Calendar size={11} className="flex-shrink-0" />
                  <span>Met {formatDate(node.met_at)}</span>
                </div>
              )}
              {node.last_contacted && (
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Clock size={11} className="flex-shrink-0" />
                  <span>Last contact {formatDate(node.last_contacted)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connections */}
        {connectedNodes.length > 0 && (
          <>
            <Separator className="bg-white/10" />
            <div className="p-4">
              <p className="text-white/30 text-xs uppercase tracking-wider mb-2 font-medium">
                Connections
              </p>
              <div className="flex flex-col gap-1">
                {connectedNodes.map(({ node: other, label }) => (
                  <button
                    key={other.id}
                    onClick={() => setSelectedNode(other.id)}
                    className="
                      flex items-center gap-2 px-2 py-1.5 rounded-lg
                      hover:bg-white/10 transition-colors text-left w-full
                    "
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: other.color ?? "#a78bfa" }}
                    />
                    <span className="text-white/70 text-xs flex-1">
                      {other.name}
                    </span>
                    {label && (
                      <span className="text-white/25 text-xs">{label}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}
