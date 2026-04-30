export type NodeKind = "entity" | "keyword";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  keywords: string[];
  description?: string;
  color?: string;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}
