"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Building2,
  AtSign,
  Link2,
  Calendar,
  FileText,
  UserCheck,
  Sparkles,
  Trash2,
  Plus,
} from "lucide-react";
import { useGraphStore } from "@/lib/store";
import { PersonNode, RelationshipEdge } from "@/lib/types";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

interface Props {
  addNode: (data: Omit<PersonNode, "id" | "user_id">) => Promise<PersonNode | null>;
  updateNode: (id: string, data: Partial<Omit<PersonNode, "id" | "user_id">>) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  addEdge: (data: { source_id: string; target_id: string; label?: string }) => Promise<RelationshipEdge | null>;
  deleteEdge: (id: string) => Promise<void>;
}

export function NodePanel({ addNode, updateNode, deleteNode, addEdge, deleteEdge }: Props) {
  const { nodes, edges, selectedNodeId, panelOpen, setSelectedNode, setPanelOpen } =
    useGraphStore();

  const editNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const isEditing = Boolean(editNode);
  const isOpen = panelOpen || Boolean(selectedNodeId);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [person, setPerson] = useState("");
  const [activity, setActivity] = useState("");
  const [lastInteracted, setLastInteracted] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  // Connect-to form state
  const [connectTargetId, setConnectTargetId] = useState("");
  const [connectLabel, setConnectLabel] = useState("");

  useEffect(() => {
    if (editNode) {
      setName(editNode.name);
      setRole(editNode.role ?? "");
      setCompany(editNode.company ?? "");
      setCompanyUrl(editNode.company_url ?? "");
      setLinkedinUrl(editNode.linkedin_url ?? "");
      setTwitterUrl(editNode.twitter_url ?? "");
      setPerson(editNode.person ?? "");
      setActivity(editNode.activity ?? "");
      setLastInteracted(editNode.last_interacted?.slice(0, 10) ?? "");
      setNotes(editNode.notes ?? "");
      setColor(editNode.color ?? COLORS[0]);
    } else {
      setName("");
      setRole("");
      setCompany("");
      setCompanyUrl("");
      setLinkedinUrl("");
      setTwitterUrl("");
      setPerson("");
      setActivity("");
      setLastInteracted("");
      setNotes("");
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    setConnectTargetId("");
    setConnectLabel("");
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
      company_url: companyUrl.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
      twitter_url: twitterUrl.trim() || undefined,
      person: person.trim() || undefined,
      activity: activity.trim() || undefined,
      last_interacted: lastInteracted || undefined,
      notes: notes.trim() || undefined,
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

  const handleDelete = async () => {
    if (!selectedNodeId || saving) return;
    if (!confirm(`Delete "${editNode?.name}" and all its connections?`)) return;
    setSaving(true);
    await deleteNode(selectedNodeId);
    setSaving(false);
    close();
  };

  const handleConnect = async () => {
    if (!selectedNodeId || !connectTargetId) return;
    await addEdge({
      source_id: selectedNodeId,
      target_id: connectTargetId,
      label: connectLabel.trim() || undefined,
    });
    setConnectTargetId("");
    setConnectLabel("");
  };

  // Edges touching the currently-selected node
  const connections = selectedNodeId
    ? edges
        .filter((e) => e.source_id === selectedNodeId || e.target_id === selectedNodeId)
        .map((e) => {
          const otherId = e.source_id === selectedNodeId ? e.target_id : e.source_id;
          const other = nodes.find((n) => n.id === otherId);
          return { edge: e, other };
        })
        .filter((c) => c.other)
    : [];

  const otherNodes = selectedNodeId
    ? nodes.filter(
        (n) =>
          n.id !== selectedNodeId &&
          !connections.some((c) => c.other?.id === n.id)
      )
    : [];

  const inputCls =
    "w-full h-9 px-3 text-sm rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-colors";

  const labelCls =
    "text-white/40 text-[10px] uppercase tracking-wider font-medium mb-1.5 flex items-center gap-1";

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
          <div>
            <label className={labelCls}>Name *</label>
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>
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
              <label className={labelCls}>
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

          <div>
            <label className={labelCls}>
              <Link2 size={9} /> Company URL
            </label>
            <input
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://stripe.com"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>
                <AtSign size={9} /> LinkedIn
              </label>
              <input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="linkedin.com/in/…"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                <AtSign size={9} /> Twitter / X
              </label>
              <input
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="x.com/…"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              <UserCheck size={9} /> Person (relationship owner)
            </label>
            <input
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="Akriti"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              <Sparkles size={9} /> Activity (where / how met)
            </label>
            <input
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Next.js Conf 2025"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              <Calendar size={9} /> Last interacted
            </label>
            <input
              type="date"
              value={lastInteracted}
              onChange={(e) => setLastInteracted(e.target.value)}
              className={`${inputCls} [color-scheme:dark]`}
            />
          </div>

          <div>
            <label className={labelCls}>
              <FileText size={9} /> Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How you know them, what to follow up on…"
              rows={3}
              className={`${inputCls} h-auto py-2 resize-none`}
            />
          </div>

          <div>
            <label className={labelCls}>Color</label>
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

          {isEditing && (
            <div className="border-t border-white/10 pt-4 mt-2">
              <label className={labelCls}>Connections</label>

              {connections.length > 0 ? (
                <ul className="flex flex-col gap-1.5 mb-3">
                  {connections.map(({ edge, other }) => (
                    <li
                      key={edge.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm truncate">{other!.name}</div>
                        {edge.label && (
                          <div className="text-white/40 text-[11px] truncate">{edge.label}</div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEdge(edge.id)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                        title="Remove connection"
                      >
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/30 text-xs mb-3">No connections yet.</p>
              )}

              {otherNodes.length > 0 && (
                <div className="flex flex-col gap-2">
                  <select
                    value={connectTargetId}
                    onChange={(e) => setConnectTargetId(e.target.value)}
                    className={`${inputCls} [color-scheme:dark]`}
                  >
                    <option value="" className="bg-[#0c0c18]">
                      Connect to…
                    </option>
                    {otherNodes.map((n) => (
                      <option key={n.id} value={n.id} className="bg-[#0c0c18]">
                        {n.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={connectLabel}
                    onChange={(e) => setConnectLabel(e.target.value)}
                    placeholder="Label (optional) — e.g. met at React Miami"
                    className={inputCls}
                  />
                  <button
                    onClick={handleConnect}
                    disabled={!connectTargetId}
                    className="
                      h-9 rounded-lg bg-indigo-500/80 hover:bg-indigo-500
                      text-white text-sm font-medium
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition-colors
                      flex items-center justify-center gap-1.5
                    "
                  >
                    <Plus size={14} /> Add connection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex-1 h-9 rounded-lg bg-indigo-500/80 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : isEditing ? "Save changes" : "Add to graph"}
          </button>
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="h-9 px-3 rounded-lg border border-red-500/30 text-red-400/80 hover:text-red-400 hover:border-red-500/60 text-sm transition-colors disabled:opacity-30"
              title="Delete node"
            >
              <Trash2 size={14} />
            </button>
          )}
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
