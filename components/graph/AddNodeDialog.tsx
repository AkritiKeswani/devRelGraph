"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PersonNode } from "@/lib/types";

const COLORS = [
  "#6366f1", "#ec4899", "#8b5cf6", "#10b981",
  "#f59e0b", "#3b82f6", "#ef4444", "#14b8a6",
];

const NODE_TYPES = ["engineer", "investor", "founder", "product manager", "marketing", "customer success", "documentation"];

interface Props {
  addNode: (data: Omit<PersonNode, "id" | "user_id">) => Promise<PersonNode | null>;
}

export function AddNodeDialog({ addNode }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState("engineer");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setRole("");
    setCompany("");
    setType("engineer");
    setColor(COLORS[0]);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    await addNode({
      name: trimmed,
      role: role.trim() || undefined,
      company: company.trim() || undefined,
      type,
      tags: [],
      color,
      pos_x: 250 + Math.random() * 400,
      pos_y: 200 + Math.random() * 300,
    });
    setSaving(false);
    reset();
    setOpen(false);
  };

  const inputCls = `
    h-8 text-sm
    bg-white/5 border-white/15 text-white placeholder:text-white/25
    focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:border-white/30
    rounded-lg
  `;

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
              if (e.key === "Escape") { reset(); setOpen(false); }
            }}
            placeholder="Name *"
            className={`${inputCls} mb-2`}
          />

          <div className="flex gap-2 mb-2">
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") { reset(); setOpen(false); }
              }}
              placeholder="Role"
              className={inputCls}
            />
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
                if (e.key === "Escape") { reset(); setOpen(false); }
              }}
              placeholder="Company"
              className={inputCls}
            />
          </div>

          {/* Type select */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="
              w-full h-8 text-sm rounded-lg px-2 mb-3
              bg-white/5 border border-white/15 text-white/70
              focus:outline-none focus:ring-1 focus:ring-white/30
            "
          >
            {NODE_TYPES.map((t) => (
              <option key={t} value={t} className="bg-[#080810]">
                {t}
              </option>
            ))}
          </select>

          {/* Color swatches */}
          <div className="flex gap-1.5 mb-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-5 h-5 rounded-full transition-transform"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `2px solid white` : "none",
                  outlineOffset: 2,
                  transform: color === c ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || saving}
              className="
                flex-1 h-8 rounded-lg bg-indigo-500/80 hover:bg-indigo-500
                text-white text-sm font-medium
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-colors
              "
            >
              {saving ? "Adding…" : "Add node"}
            </button>
            <button
              onClick={() => { reset(); setOpen(false); }}
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
