"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseClient } from "./supabase";
import { useGraphStore } from "./store";
import { PersonNode, RelationshipEdge } from "./types";

const LS_NODES = "pplgraph_nodes";
const LS_EDGES = "pplgraph_edges";

// DB stores color as integer; UI uses hex strings
function colorToInt(hex: string | undefined): number | undefined {
  if (!hex) return undefined;
  return parseInt(hex.replace("#", ""), 16);
}

function intToColor(n: number | undefined | null): string | undefined {
  if (n == null) return undefined;
  return "#" + n.toString(16).padStart(6, "0");
}

function nodeFromDb(row: Record<string, unknown>): PersonNode {
  return { ...row, color: intToColor(row.color as number | undefined) } as PersonNode;
}

function nodeToDb(data: Partial<PersonNode>): Record<string, unknown> {
  const { color, ...rest } = data;
  return { ...rest, ...(color !== undefined ? { color: colorToInt(color) } : {}) };
}

export function useGraphData() {
  const supabase = useSupabaseClient();
  const supabaseRef = useRef(supabase);
  supabaseRef.current = supabase;

  const { userId, isLoaded } = useAuth();
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setLoading,
    upsertNode,
    updateNodePosition,
    upsertEdge,
    removeEdge,
  } = useGraphStore();

  // Load data once auth state is known
  useEffect(() => {
    if (!isLoaded) return;

    if (userId) {
      setLoading(true);
      Promise.all([
        supabaseRef.current.from("nodes").select("*").eq("user_id", userId),
        supabaseRef.current.from("edges").select("*").eq("user_id", userId),
      ]).then(([{ data: n, error: ne }, { data: e, error: ee }]) => {
        if (ne) console.error("nodes fetch:", ne.message, ne.code);
        if (ee) console.error("edges fetch:", ee.message, ee.code);
        if (n) setNodes(n.map(nodeFromDb));
        if (e) setEdges(e as RelationshipEdge[]);
        setLoading(false);
      });
    } else {
      try {
        const n = localStorage.getItem(LS_NODES);
        const e = localStorage.getItem(LS_EDGES);
        if (n) setNodes(JSON.parse(n));
        if (e) setEdges(JSON.parse(e));
      } catch {}
    }
  }, [isLoaded, userId, setNodes, setEdges, setLoading]);

  // Persist to localStorage when logged out
  useEffect(() => {
    if (!isLoaded || userId) return;
    try {
      localStorage.setItem(LS_NODES, JSON.stringify(nodes));
      localStorage.setItem(LS_EDGES, JSON.stringify(edges));
    } catch {}
  }, [nodes, edges, isLoaded, userId]);

  // Debounced position save
  const positionTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handlePositionChange = useCallback(
    (nodeId: string, x: number, y: number) => {
      updateNodePosition(nodeId, x, y);
      if (!userId) return; // localStorage sync handled by effect above
      clearTimeout(positionTimers.current[nodeId]);
      positionTimers.current[nodeId] = setTimeout(() => {
        supabaseRef.current
          .from("nodes")
          .update({ pos_x: x, pos_y: y })
          .eq("id", nodeId);
      }, 600);
    },
    [userId, updateNodePosition]
  );

  const addNode = useCallback(
    async (data: Omit<PersonNode, "id" | "user_id">) => {
      if (!userId) {
        const node: PersonNode = { ...data, id: crypto.randomUUID(), user_id: "local" };
        upsertNode(node);
        return node;
      }
      const { data: node, error } = await supabaseRef.current
        .from("nodes")
        .insert({ ...nodeToDb(data), user_id: userId })
        .select()
        .single();
      if (error) console.error("addNode:", error.message, error.code, error.details, error.hint);
      if (node && !error) upsertNode(nodeFromDb(node));
      return error ? null : nodeFromDb(node);
    },
    [userId, upsertNode]
  );

  const updateNode = useCallback(
    async (id: string, data: Partial<Omit<PersonNode, "id" | "user_id">>) => {
      if (!userId) {
        const existing = useGraphStore.getState().nodes.find((n) => n.id === id);
        if (existing) upsertNode({ ...existing, ...data });
        return;
      }
      const { data: node, error } = await supabaseRef.current
        .from("nodes")
        .update(nodeToDb(data))
        .eq("id", id)
        .select()
        .single();
      if (error) console.error("updateNode:", error.message, error.code, error.details);
      if (node && !error) upsertNode(nodeFromDb(node));
    },
    [userId, upsertNode]
  );

  const addEdge = useCallback(
    async (data: { source_id: string; target_id: string; label?: string }) => {
      if (data.source_id === data.target_id) return null;
      if (!userId) {
        const edge: RelationshipEdge = { ...data, id: crypto.randomUUID(), user_id: "local" };
        upsertEdge(edge);
        return edge;
      }
      const { data: edge, error } = await supabaseRef.current
        .from("edges")
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (error) console.error("addEdge:", error.message, error.code, error.details, error.hint);
      if (edge && !error) upsertEdge(edge as RelationshipEdge);
      return error ? null : (edge as RelationshipEdge);
    },
    [userId, upsertEdge]
  );

  const deleteEdge = useCallback(
    async (id: string) => {
      removeEdge(id);
      if (!userId) return;
      const { error } = await supabaseRef.current.from("edges").delete().eq("id", id);
      if (error) console.error("deleteEdge:", error.message, error.code);
    },
    [userId, removeEdge]
  );

  return { handlePositionChange, addNode, updateNode, addEdge, deleteEdge };
}
