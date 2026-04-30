"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGraphStore } from "@/lib/store";

export function AddNodeDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const { addEntityNode } = useGraphStore();

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addEntityNode(trimmed, desc.trim() || undefined);
    setName("");
    setDesc("");
    setOpen(false);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      {open ? (
        <div className="bg-black/70 backdrop-blur-xl border border-white/15 rounded-2xl p-4 w-72 shadow-2xl">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-3 font-medium">
            New node
          </p>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Name (e.g. Moda)"
            className="
              h-8 text-sm mb-2
              bg-white/5 border-white/15 text-white placeholder:text-white/25
              focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30
              rounded-lg
            "
          />
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Description (optional)"
            className="
              h-8 text-sm mb-3
              bg-white/5 border-white/15 text-white placeholder:text-white/25
              focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30
              rounded-lg
            "
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="
                flex-1 h-8 rounded-lg bg-indigo-500/80 hover:bg-indigo-500
                text-white text-sm font-medium
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Add node
            </button>
            <button
              onClick={() => setOpen(false)}
              className="
                h-8 px-3 rounded-lg border border-white/15
                text-white/50 hover:text-white/80 text-sm
                transition-colors
              "
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="
            flex items-center gap-2 px-4 py-2 rounded-full
            bg-black/50 backdrop-blur-xl border border-white/15
            text-white/60 hover:text-white hover:border-white/30
            text-sm font-medium transition-all duration-200
            shadow-xl hover:shadow-2xl
          "
        >
          <Plus size={14} />
          Add node
        </button>
      )}
    </div>
  );
}
