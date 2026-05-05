"use client";

import { useState, useEffect } from "react";
import { X, User, Building2, Tag, FileText, Calendar, Clock } from "lucide-react";
import { useGraphStore } from "@/lib/store";
import { PersonNode } from "@/lib/types";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

interface Props {
  addNode: (data: Omit<PersonNode, "id" | "user_id">) => Promise<PersonNode | null>;
  updateNode: (id: string, data: Partial<Omit<PersonNode, "id" | "user_id">>) => Promise<void>;
}

export function NodePanel({ addNode, updateNode }: Props) {
  const { nodes, selectedNodeId, panelOpen, setSelectedNode, setPanelOpen } =
    useGraphStore();

  const editNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const isEditing = Boolean(editNode);
  const isOpen = panelOpen || Boolean(selectedNodeId);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState("person");
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");
  const [metAt, setMetAt] = useState("");
  const [lastContacted, setLastContacted] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editNode) {
      setName(editNode.name);
      setRole(editNode.role ?? "");
      setCompany(editNode.company ?? "");
      setType(editNode.type);
      setTagsInput(editNode.tags.join(", "));
      setNotes(editNode.notes ?? "");
      setMetAt(editNode.met_at?.slice(0, 10) ?? "");
      setLastContacted(editNode.last_contacted?.slice(0, 10) ?? "");
      setColor(editNode.color ?? COLORS[0]);
    } else {
      setName("");
      setRole("");
      setCompany("");
      setType("person");
      setTagsInput("");
      setNotes("");
      setMetAt("");
      setLastContacted("");
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
  }, [editNode, selectedNodeId]);

  const close = () => {
    setPanelOpen(false);
    setSelectedNode(null);
  };

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);

    const data: Omit<PersonNode, "id" | "user_id"> = {
      name: name.trim(),
      role: role.trim() || undefined,
      company: company.trim() || undefined,
      type,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: notes.trim() || undefined,
      met_at: metAt || undefined,
      last_contacted: lastContacted || undefined,
      color,
      pos_x: editNode?.pos_x ?? 250 + Math.random() * 400,
      pos_y: editNode?.pos_y ?? 200 + Math.random() * 300,
    };

    if (isEditing && selectedNodeId) {
      await updateNode(selectedNodeId, data);
    } else {
      await addNode(data);
    }

    setSaving(false);
    close();
  };

  const inputCls =
    "w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-colors";

  return (
    <>
      {isOpen && (
        <div className="absolute inset-0 z-10" onClick={close} />
      )}

      <div
        className={`
          absolute top-0 right-0 h-full z-20 w-80
          bg-[#0c0c18]/95 backdrop-blur-xl border-l border-white/10
          flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-white font-semibold text-sm">
            {isEditing ? "Edit node" : "New node"}
          </h2>
          <button
            onClick={close}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-1.5">
              Name *
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") close();
              }}
              placeholder="e.g. Sarah Chen"
              className={inputCls}
            />
          </div>

          {/* Role + Company */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5 flex items-center gap-1">
                <User size={9} /> Role
              </label>
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Engineer"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5 flex items-center gap-1">
                <Building2 size={9} /> Company
              </label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Stripe"
                className={inputCls}
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-1.5">
              Type
            </label>
            <div className="flex gap-2">
              {["person", "company"].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${
                    type === t
                      ? "bg-indigo-500/30 border border-indigo-500/60 text-indigo-300"
                      : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5 flex items-center gap-1">
              <Tag size={9} /> Tags
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="YC, fintech, B2B"
              className={inputCls}
            />
            <p className="text-white/20 text-[10px] mt-1">Comma-separated</p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5 flex items-center gap-1">
              <FileText size={9} /> Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How you know them…"
              rows={3}
              className={`${inputCls} h-auto py-2 resize-none`}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5 flex items-center gap-1">
                <Calendar size={9} /> Met at
              </label>
              <input
                type="date"
                value={metAt}
                onChange={(e) => setMetAt(e.target.value)}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5 flex items-center gap-1">
                <Clock size={9} /> Last contact
              </label>
              <input
                type="date"
                value={lastContacted}
                onChange={(e) => setLastContacted(e.target.value)}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-transform"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? "2px solid white" : "none",
                    outlineOffset: 2,
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 h-9 rounded-lg bg-indigo-500/80 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : isEditing ? "Save changes" : "Add to graph"}
          </button>
          <button
            onClick={close}
            className="h-9 px-3 rounded-lg border border-white/15 text-white/50 hover:text-white/80 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
