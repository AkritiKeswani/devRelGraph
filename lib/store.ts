import { create } from "zustand";
import { PersonNode, RelationshipEdge } from "./types";

interface GraphStore {
  nodes: PersonNode[];
  edges: RelationshipEdge[];
  selectedNodeId: string | null;
  panelOpen: boolean;
  loading: boolean;

  setNodes: (nodes: PersonNode[]) => void;
  setEdges: (edges: RelationshipEdge[]) => void;
  setLoading: (v: boolean) => void;
  setSelectedNode: (id: string | null) => void;
  setPanelOpen: (v: boolean) => void;
  upsertNode: (node: PersonNode) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  updateNodeDimensions: (nodeId: string, width: number, height: number) => void;
  removeNode: (id: string) => void;
  upsertEdge: (edge: RelationshipEdge) => void;
  removeEdge: (id: string) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  panelOpen: false,
  loading: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setLoading: (loading) => set({ loading }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),

  upsertNode: (node) =>
    set((state) => {
      const exists = state.nodes.some((n) => n.id === node.id);
      return {
        nodes: exists
          ? state.nodes.map((n) => (n.id === node.id ? node : n))
          : [...state.nodes, node],
      };
    }),

  updateNodePosition: (nodeId, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, pos_x: x, pos_y: y } : n
      ),
    })),

  updateNodeDimensions: (nodeId, width, height) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, width, height } : n
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source_id !== id && e.target_id !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  upsertEdge: (edge) =>
    set((state) => {
      const exists = state.edges.some((e) => e.id === edge.id);
      return {
        edges: exists
          ? state.edges.map((e) => (e.id === edge.id ? edge : e))
          : [...state.edges, edge],
      };
    }),

  removeEdge: (id) =>
    set((state) => ({ edges: state.edges.filter((e) => e.id !== id) })),
}));
