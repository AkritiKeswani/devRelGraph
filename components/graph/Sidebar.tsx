"use client";

import { useState, KeyboardEvent } from "react";
import { X, Tag, Plus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGraphStore } from "@/lib/store";

const KEYWORD_LIMIT = 20;

export function Sidebar() {
  const { nodes, selectedNodeId, setSelectedNode, addKeywordToNode, removeKeywordFromNode } =
    useGraphStore();
  const [input, setInput] = useState("");

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const isEntity = selectedNode.kind === "entity";
  const remaining = KEYWORD_LIMIT - (selectedNode.keywords?.length ?? 0);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed || !isEntity) return;
    addKeywordToNode(selectedNode.id, trimmed);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setSelectedNode(null);
  };

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
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedNode.color ?? "#a78bfa" }}
            />
            <span className="text-white font-semibold text-base truncate">
              {selectedNode.label}
            </span>
          </div>
          {selectedNode.description && (
            <p className="text-white/50 text-xs ml-4.5 leading-relaxed">
              {selectedNode.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-white/30 hover:text-white/70 transition-colors ml-2 mt-0.5 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <Separator className="bg-white/10" />

      {isEntity ? (
        <>
          {/* Keyword input */}
          <div className="p-4 pb-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Tag size={12} className="text-white/40" />
              <span className="text-white/40 text-xs font-medium uppercase tracking-wider">
                Keywords
              </span>
              <span className="text-white/20 text-xs ml-auto">
                {selectedNode.keywords.length}/{KEYWORD_LIMIT}
              </span>
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a keyword…"
                disabled={remaining === 0}
                className="
                  flex-1 h-8 text-sm
                  bg-white/5 border-white/15 text-white placeholder:text-white/25
                  focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30
                  rounded-lg
                "
              />
              <button
                onClick={handleAdd}
                disabled={!input.trim() || remaining === 0}
                className="
                  w-8 h-8 flex-shrink-0 rounded-lg
                  bg-white/10 hover:bg-white/20
                  disabled:opacity-30 disabled:cursor-not-allowed
                  text-white transition-colors
                  flex items-center justify-center
                "
              >
                <Plus size={14} />
              </button>
            </div>

            {remaining === 0 && (
              <p className="text-amber-400/70 text-xs mt-1.5 flex items-center gap-1">
                <Info size={10} />
                Keyword limit reached
              </p>
            )}
          </div>

          {/* Keywords list */}
          <ScrollArea className="flex-1 px-4 pb-4">
            {selectedNode.keywords.length === 0 ? (
              <p className="text-white/20 text-xs text-center py-4">
                No keywords yet — add one above
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.keywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="
                      group cursor-pointer
                      bg-white/10 hover:bg-red-500/30
                      text-white/70 hover:text-red-300
                      border-white/10 hover:border-red-500/30
                      transition-all duration-150 pr-1.5
                    "
                    onClick={() => removeKeywordFromNode(selectedNode.id, kw)}
                  >
                    {kw}
                    <X size={10} className="ml-1 opacity-50 group-hover:opacity-100" />
                  </Badge>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Connected nodes hint */}
          {selectedNode.keywords.length > 0 && (
            <>
              <Separator className="bg-white/10" />
              <ConnectedSection nodeId={selectedNode.id} keywords={selectedNode.keywords} />
            </>
          )}
        </>
      ) : (
        <KeywordInfo label={selectedNode.label} />
      )}
    </div>
  );
}

function ConnectedSection({ nodeId, keywords }: { nodeId: string; keywords: string[] }) {
  const { nodes, setSelectedNode } = useGraphStore();

  const connected = nodes.filter(
    (n) =>
      n.id !== nodeId &&
      n.kind === "entity" &&
      n.keywords.some((k) =>
        keywords.some((kw) => kw.toLowerCase() === k.toLowerCase())
      )
  );

  if (connected.length === 0) return null;

  return (
    <div className="p-4 pt-3">
      <p className="text-white/30 text-xs uppercase tracking-wider mb-2 font-medium">
        Connected nodes
      </p>
      <div className="flex flex-col gap-1">
        {connected.map((n) => {
          const shared = n.keywords.filter((k) =>
            keywords.some((kw) => kw.toLowerCase() === k.toLowerCase())
          );
          return (
            <button
              key={n.id}
              onClick={() => setSelectedNode(n.id)}
              className="
                flex items-center gap-2 px-2 py-1.5 rounded-lg
                hover:bg-white/10 transition-colors text-left w-full
              "
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: n.color ?? "#a78bfa" }}
              />
              <span className="text-white/70 text-xs flex-1">{n.label}</span>
              <span className="text-white/25 text-xs">via {shared.slice(0, 2).join(", ")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KeywordInfo({ label }: { label: string }) {
  const { nodes, setSelectedNode } = useGraphStore();

  const connected = nodes.filter(
    (n) =>
      n.kind === "entity" &&
      n.keywords.some((k) => k.toLowerCase() === label.toLowerCase())
  );

  return (
    <div className="p-4">
      <p className="text-white/30 text-xs uppercase tracking-wider mb-2 font-medium">
        Tagged entities
      </p>
      {connected.length === 0 ? (
        <p className="text-white/20 text-xs">No entities tagged with this keyword</p>
      ) : (
        <div className="flex flex-col gap-1">
          {connected.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNode(n.id)}
              className="
                flex items-center gap-2 px-2 py-1.5 rounded-lg
                hover:bg-white/10 transition-colors text-left
              "
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: n.color ?? "#a78bfa" }}
              />
              <span className="text-white/70 text-xs">{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
