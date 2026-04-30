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
import { KeywordNode } from "@/components/nodes/KeywordNode";
import { Sidebar } from "./Sidebar";
import { AddNodeDialog } from "./AddNodeDialog";
import { useGraphStore } from "@/lib/store";

// React 19 + React Flow 12 JSX type mismatch — cast to any to unblock build
const RF = ReactFlow as any;

const nodeTypes = {
  entity: EntityNode,
  keyword: KeywordNode,
};

function GraphInner() {
  const {
    nodes: graphNodes,
    edges: graphEdges,
    selectedNodeId,
    setSelectedNode,
    updateNodePosition,
  } = useGraphStore();

  const rfNodes = useMemo(
    () =>
      graphNodes.map((n) => ({
        id: n.id,
        type: n.kind,
        position: n.position,
        selected: n.id === selectedNodeId,
        data: {
          label: n.label,
          color: n.color,
          keywords: n.keywords,
          description: n.description,
        },
      })),
    [graphNodes, selectedNodeId]
  );

  const rfEdges = useMemo(
    () =>
      graphEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        style: {
          stroke: "rgba(255,255,255,0.15)",
          strokeWidth: 1.5,
        },
        animated: false,
      })),
    [graphEdges]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          updateNodePosition(change.id, change.position.x, change.position.y);
        }
      });
    },
    [updateNodePosition]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="relative w-full h-full">
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
          nodeColor={(node: any) => {
            if (node.type === "keyword") return "rgba(255,255,255,0.15)";
            return (node.data as { color?: string }).color ?? "#6366f1";
          }}
          maskColor="rgba(0,0,0,0.4)"
        />
      </RF>

      <Sidebar />
      <AddNodeDialog />
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
