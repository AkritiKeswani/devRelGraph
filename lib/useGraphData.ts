"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseClient } from "./supabase";
import { useGraphStore } from "./store";
import { PersonNode, RelationshipEdge } from "./types";

export function useGraphData() {
  const supabase = useSupabaseClient();
  const supabaseRef = useRef(supabase);
  supabaseRef.current = supabase;

  const { userId } = useAuth();
  const { setNodes, setEdges, setLoading, upsertNode, updateNodePosition } =
    useGraphStore();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      supabaseRef.current.from("nodes").select("*").eq("user_id", userId),
      supabaseRef.current.from("edges").select("*").eq("user_id", userId),
    ]).then(([{ data: nodes }, { data: edges }]) => {
      if (nodes) setNodes(nodes as PersonNode[]);
      if (edges) setEdges(edges as RelationshipEdge[]);
      setLoading(false);
    });
  }, [userId, setNodes, setEdges, setLoading]);

  const positionTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  const handlePositionChange = useCallback(
    (nodeId: string, x: number, y: number) => {
      updateNodePosition(nodeId, x, y);
      clearTimeout(positionTimers.current[nodeId]);
      positionTimers.current[nodeId] = setTimeout(() => {
        supabaseRef.current
          .from("nodes")
          .update({ pos_x: x, pos_y: y })
          .eq("id", nodeId);
      }, 600);
    },
    [updateNodePosition]
  );

  const addNode = useCallback(
    async (data: Omit<PersonNode, "id" | "user_id">) => {
      if (!userId) return null;
      const { data: node, error } = await supabaseRef.current
        .from("nodes")
        .insert({ ...data, user_id: userId })
        .select()
        .single();
      if (node && !error) upsertNode(node as PersonNode);
      return error ? null : (node as PersonNode);
    },
    [userId, upsertNode]
  );

  return { handlePositionChange, addNode };
}
