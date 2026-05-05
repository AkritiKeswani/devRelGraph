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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { EntityNode } from "@/components/nodes/EntityNode";
import { Sidebar } from "./Sidebar";
import { AddNodeDialog } from "./AddNodeDialog";
import { useGraphStore } from "@/lib/store";
import { useGraphData } from "@/lib/useGraphData";
import { PersonNode } from "@/lib/types";

// React 19 + React Flow 12 JSX type mismatch — cast to any to unblock build
const RF = ReactFlow as any;

const nodeTypes = { entity: EntityNode };

function GraphInner() {
  const { nodes, edges, selectedNodeId, setSelectedNode, loading } =
    useGraphStore();
  const { handlePositionChange, addNode } = useGraphData();

  const rfNodes = useMemo(
    () =>
      nodes.map((n: PersonNode) => ({
        id: n.id,
        type: "entity",
        position: { x: n.pos_x, y: n.pos_y },
        selected: n.id === selectedNodeId,
        data: {
          name: n.name,
          color: n.color,
          role: n.role,
          company: n.company,
          type: n.type,
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
        }
      });
    },
    [handlePositionChange]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="relative w-full h-full">
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

      <Sidebar />
      <AddNodeDialog addNode={addNode} />
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
