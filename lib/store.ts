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
}));
