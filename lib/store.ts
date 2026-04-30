import { create } from "zustand";
import { GraphNode, GraphEdge } from "./types";

const KEYWORD_LIMIT = 20;

// Seed data
const initialNodes: GraphNode[] = [
  {
    id: "moda",
    label: "Moda",
    kind: "entity",
    keywords: ["YC", "fashion", "ecommerce"],
    description: "YC-backed fashion brand platform",
    color: "#6366f1",
    position: { x: 300, y: 250 },
  },
  {
    id: "airbnb",
    label: "Airbnb",
    kind: "entity",
    keywords: ["YC", "marketplace", "travel"],
    description: "Home-sharing marketplace",
    color: "#ec4899",
    position: { x: 600, y: 150 },
  },
  {
    id: "stripe",
    label: "Stripe",
    kind: "entity",
    keywords: ["YC", "payments", "fintech"],
    description: "Payments infrastructure",
    color: "#8b5cf6",
    position: { x: 150, y: 400 },
  },
  {
    id: "shopify",
    label: "Shopify",
    kind: "entity",
    keywords: ["ecommerce", "marketplace"],
    description: "E-commerce platform",
    color: "#10b981",
    position: { x: 500, y: 420 },
  },
  {
    id: "kw-yc",
    label: "YC",
    kind: "keyword",
    keywords: [],
    position: { x: 380, y: 60 },
  },
  {
    id: "kw-ecommerce",
    label: "ecommerce",
    kind: "keyword",
    keywords: [],
    position: { x: 700, y: 350 },
  },
  {
    id: "kw-marketplace",
    label: "marketplace",
    kind: "keyword",
    keywords: [],
    position: { x: 750, y: 500 },
  },
  {
    id: "kw-payments",
    label: "payments",
    kind: "keyword",
    keywords: [],
    position: { x: 50, y: 550 },
  },
  {
    id: "kw-fashion",
    label: "fashion",
    kind: "keyword",
    keywords: [],
    position: { x: 100, y: 200 },
  },
];

function buildEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const entityNodes = nodes.filter((n) => n.kind === "entity");
  const keywordNodes = nodes.filter((n) => n.kind === "keyword");

  entityNodes.forEach((entity) => {
    entity.keywords.forEach((kw) => {
      const kwNode = keywordNodes.find(
        (k) => k.label.toLowerCase() === kw.toLowerCase()
      );
      if (kwNode) {
        edges.push({
          id: `${entity.id}--${kwNode.id}`,
          source: entity.id,
          target: kwNode.id,
        });
      }
    });
  });
  return edges;
}

interface GraphStore {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  suggestions: string[];
  suggestionsNodeId: string | null;
  isSuggesting: boolean;

  setSelectedNode: (id: string | null) => void;
  addKeywordToNode: (nodeId: string, keyword: string) => void;
  removeKeywordFromNode: (nodeId: string, keyword: string) => void;
  addEntityNode: (label: string, description?: string) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  fetchSuggestions: (nodeId: string, newKeyword: string) => Promise<void>;
  clearSuggestions: () => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: initialNodes,
  edges: buildEdges(initialNodes),
  selectedNodeId: null,
  suggestions: [],
  suggestionsNodeId: null,
  isSuggesting: false,

  setSelectedNode: (id) =>
    set({ selectedNodeId: id, suggestions: [], suggestionsNodeId: null }),

  clearSuggestions: () =>
    set({ suggestions: [], suggestionsNodeId: null, isSuggesting: false }),

  updateNodePosition: (nodeId, x, y) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, position: { x, y } } : n
      ),
    }));
  },

  addKeywordToNode: (nodeId, keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    set((state) => {
      let nodes = [...state.nodes];
      const targetNode = nodes.find((n) => n.id === nodeId);
      if (!targetNode || targetNode.kind !== "entity") return state;
      if (targetNode.keywords.length >= KEYWORD_LIMIT) return state;
      if (
        targetNode.keywords.some(
          (k) => k.toLowerCase() === trimmed.toLowerCase()
        )
      )
        return state;

      nodes = nodes.map((n) =>
        n.id === nodeId
          ? { ...n, keywords: [...n.keywords, trimmed] }
          : n
      );

      const kwId = `kw-${trimmed.toLowerCase().replace(/\s+/g, "-")}`;
      if (!nodes.find((n) => n.id === kwId)) {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 200 + Math.random() * 150;
        const anchor = nodes.find((n) => n.id === nodeId)!;
        nodes.push({
          id: kwId,
          label: trimmed,
          kind: "keyword",
          keywords: [],
          position: {
            x: anchor.position.x + Math.cos(angle) * radius,
            y: anchor.position.y + Math.sin(angle) * radius,
          },
        });
      }

      return { nodes, edges: buildEdges(nodes) };
    });
  },

  removeKeywordFromNode: (nodeId, keyword) => {
    set((state) => {
      const nodes = state.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, keywords: n.keywords.filter((k) => k !== keyword) }
          : n
      );

      const entityNodes = nodes.filter((n) => n.kind === "entity");
      const usedKeywords = new Set(
        entityNodes.flatMap((e) => e.keywords.map((k) => k.toLowerCase()))
      );
      const cleaned = nodes.filter(
        (n) => n.kind === "entity" || usedKeywords.has(n.label.toLowerCase())
      );

      return { nodes: cleaned, edges: buildEdges(cleaned) };
    });
  },

  addEntityNode: (label, description) => {
    const id = `entity-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const colors = [
      "#6366f1", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b",
      "#3b82f6", "#ef4444", "#14b8a6",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newNode: GraphNode = {
      id,
      label,
      kind: "entity",
      keywords: [],
      description,
      color,
      position: {
        x: 200 + Math.random() * 400,
        y: 200 + Math.random() * 300,
      },
    };
    set((state) => {
      const nodes = [...state.nodes, newNode];
      return { nodes, edges: buildEdges(nodes), selectedNodeId: id };
    });
  },

  fetchSuggestions: async (nodeId, newKeyword) => {
    const { nodes } = get();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.kind !== "entity") return;

    const allGraphKeywords = nodes
      .filter((n) => n.kind === "keyword")
      .map((n) => n.label);

    set({ isSuggesting: true, suggestions: [], suggestionsNodeId: nodeId });

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeLabel: node.label,
          nodeDescription: node.description,
          existingKeywords: node.keywords,
          newKeyword,
          allGraphKeywords,
        }),
      });
      const data = await res.json();
      if (data.suggestions) {
        set({ suggestions: data.suggestions, suggestionsNodeId: nodeId });
      }
    } catch {
      // silently fail — suggestions are a nice-to-have
    } finally {
      set({ isSuggesting: false });
    }
  },
}));
