import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CenterNode from './CenterNode.jsx';
import OrbitNode from './OrbitNode.jsx';
import SubtopicNode from './SubtopicNode.jsx';
import CurvedEdge from './CurvedEdge.jsx';

const nodeTypes = {
  center: CenterNode,
  orbit: OrbitNode,
  subtopic: SubtopicNode,
};

const edgeTypes = {
  curved: CurvedEdge,
};

const MindMapContainer = ({ initialNodes = [], initialEdges = [], onNodeClick, className = 'h-[800px]' }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  React.useEffect(() => {
    setNodes((currNodes) => {
      if (!currNodes || currNodes.length === 0) return initialNodes;
      const posMap = new Map(currNodes.map((n) => [n.id, n.position]));
      return initialNodes.map((node) => ({
        ...node,
        position: posMap.has(node.id) ? posMap.get(node.id) : node.position,
      }));
    });
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (event, node) => {
      if (onNodeClick && node.type !== 'center') {
        onNodeClick(node.data);
      }
    },
    [onNodeClick]
  );

  const onNodeMouseEnter = useCallback((event, node) => {
    if (node.type === 'center') return;
    
    setNodes((nds) => {
      const relatedNodeIds = new Set([node.id, 'center-psychiatry']);
      if (node.parentId) relatedNodeIds.add(node.parentId);
      
      nds.forEach(n => {
        if (n.parentId === node.id) relatedNodeIds.add(n.id);
      });
      
      setEdges((eds) => eds.map(e => ({
        ...e,
        style: { ...e.style, opacity: (relatedNodeIds.has(e.source) && relatedNodeIds.has(e.target)) ? 1 : 0.1, transition: 'opacity 0.3s ease' }
      })));
      
      return nds.map(n => ({
        ...n,
        style: { ...n.style, opacity: relatedNodeIds.has(n.id) ? 1 : 0.2, transition: 'opacity 0.3s ease' },
        className: (n.className || '').replace(' !z-50', '') + (relatedNodeIds.has(n.id) ? ' !z-50' : '')
      }));
    });
  }, [setNodes, setEdges]);

  const onNodeMouseLeave = useCallback(() => {
    setNodes((nds) => nds.map(n => ({
      ...n,
      style: { ...n.style, opacity: 1 },
      className: (n.className || '').replace(' !z-50', '')
    })));
    
    setEdges((eds) => eds.map(e => ({
      ...e,
      style: { ...e.style, opacity: 1 }
    })));
  }, [setNodes, setEdges]);

  return (
    <div className={`w-full ${className} bg-[#FAFAFC] border border-borderLine rounded-xl shadow-soft overflow-hidden relative select-none`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.15 }}
        minZoom={0.2}
        maxZoom={2.0}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'default',
          style: { strokeWidth: 2.5 },
        }}
      >
        <Background gap={24} size={1} color="#E2E8F0" />
        <Controls className="!bg-white !border !border-borderLine !rounded-xl !shadow-md !overflow-hidden" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'center') return '#126BEE';
            return node.data?.color || '#21A447';
          }}
          style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E7ECF5' }}
        />
      </ReactFlow>
    </div>
  );
};

export default MindMapContainer;
