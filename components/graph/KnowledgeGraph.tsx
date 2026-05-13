"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  NodeChange,
  EdgeChange,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAuth } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { EntityNode } from "@/components/nodes/EntityNode";
import { NodePanel } from "./NodePanel";
import { useGraphStore } from "@/lib/store";
import { useGraphData } from "@/lib/useGraphData";
import { PersonNode } from "@/lib/types";

// React 19 + React Flow 12 JSX type mismatch — cast to any to unblock build
const RF = ReactFlow as any;

const nodeTypes = { entity: EntityNode };

function GraphInner() {
  const { userId } = useAuth();
  const { nodes, edges, selectedNodeId, loading, setSelectedNode, setPanelOpen, updateNodeDimensions } =
    useGraphStore();
  const { handlePositionChange, addNode, updateNode, deleteNode, addEdge, deleteEdge } = useGraphData();

  const rfNodes = useMemo(
    () =>
      nodes.map((n: PersonNode) => ({
        id: n.id,
        type: "entity",
        position: { x: n.pos_x, y: n.pos_y },
        selected: n.id === selectedNodeId,
        style: { width: n.width ?? 160, height: n.height ?? 90 },
        data: {
          name: n.name,
          color: n.color,
          role: n.role,
          company: n.company,
        },
      })),
    [nodes, selectedNodeId]
  );

  const rfEdges = useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source_id,
        target: e.target_id,
        label: e.label,
        style: { stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 },
        labelStyle: { fill: "rgba(255,255,255,0.45)", fontSize: 10 },
        labelBgStyle: { fill: "rgba(0,0,0,0.5)", borderRadius: 4 },
        labelBgPadding: [4, 2] as [number, number],
      })),
    [edges]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          handlePositionChange(change.id, change.position.x, change.position.y);
        } else if (change.type === "dimensions" && change.dimensions && change.resizing) {
          updateNodeDimensions(change.id, change.dimensions.width, change.dimensions.height);
        } else if (change.type === "remove") {
          deleteNode(change.id);
        }
      });
    },
    [handlePositionChange, updateNodeDimensions, deleteNode]
  );

  const onNodeClick = useCallback(
    (_: unknown, node: { id: string }) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onNodeDoubleClick = useCallback(
    (_: unknown, node: { id: string }) => {
      setSelectedNode(node.id);
      setPanelOpen(true);
    },
    [setSelectedNode, setPanelOpen]
  );

  const onConnect = useCallback(
    (c: Connection) => {
      if (c.source && c.target) addEdge({ source_id: c.source, target_id: c.target });
    },
    [addEdge]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "remove") deleteEdge(change.id);
      });
    },
    [deleteEdge]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setPanelOpen(false);
  }, [setSelectedNode, setPanelOpen]);

  return (
    <div className="relative w-full h-full">
      {/* Logged-out banner */}
      {!userId && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-indigo-600/20 border-b border-indigo-500/20 text-center py-1.5 text-xs text-indigo-300 pointer-events-none">
          Sign in to save your graph
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      <RF
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls
          className="!bg-black/40 !backdrop-blur-xl !border-white/10 !rounded-xl !shadow-xl"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-black/40 !backdrop-blur-xl !border-white/10 !rounded-xl !shadow-xl"
          nodeColor={(node: any) =>
            (node.data as { color?: string }).color ?? "#6366f1"
          }
          maskColor="rgba(0,0,0,0.4)"
        />
      </RF>

      {/* Add node button */}
      <button
        onClick={() => {
          setSelectedNode(null);
          setPanelOpen(true);
        }}
        className="
          absolute bottom-6 left-1/2 -translate-x-1/2 z-10
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

      <NodePanel
        addNode={addNode}
        updateNode={updateNode}
        deleteNode={deleteNode}
        addEdge={addEdge}
        deleteEdge={deleteEdge}
      />
    </div>
  );
}

export function KnowledgeGraph() {
  return (
    <ReactFlowProvider>
      <GraphInner />
    </ReactFlowProvider>
  );
}
