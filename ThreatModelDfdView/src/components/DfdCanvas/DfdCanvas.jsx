import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BASE_URL } from '../../constants/api';
import { DFD_TYPES } from '../../constants/dfdTypes';
import { styles } from '../../styles/commonStyles';
import { getStyleByType } from '../../utils/dfdUtils';
import api from '../../services/api';

export default function DfdCanvas({ 
  dfdId, 
  levelNumber = 0,
  parentDfdId = null,
  onDecompose,
  onReturnToParent,
  canReturn = false,
  onBackToDashboard
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [status, setStatus] = useState("Ready.");
  const [currentDfdData, setCurrentDfdData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // SUPPRESS REACT FLOW WARNING (Error 002)
  const nodeTypes = useMemo(() => ({}), []);
  const edgeTypes = useMemo(() => ({}), []);

  const onConnect = useCallback((params) => {
    const edgeWithArrow = {
      ...params,
      markerEnd: {
        type: MarkerType.ArrowClosed, 
        width: 20,
        height: 20,
        color: '#000000',
      },
      style: {
        strokeWidth: 2,
        stroke: '#000000', 
      },
    };
    
    setEdges((eds) => addEdge(edgeWithArrow, eds));
  }, [setEdges]);

  const onNodesDelete = useCallback(async (deletedNodes) => {
    for (let node of deletedNodes) {
      if (!node.id.startsWith('temp_')) {
        try {
          // Axios automatically throws to the catch block on failure
          await api.delete(`/dfd-elements/${node.id}`);
        } catch (err) {
          console.error(`Falha ao excluir o nó ${node.id} no backend:`, err);
        }
      }
    }
  }, []);

  const handleDecompose = async (processNode) => {
    if (processNode.data.type !== DFD_TYPES.PROCESS) {
      setStatus("Somente Process pode ser decomposto.");
      return;
    }

    setStatus("Decompondo processo...");
    setSelectedNode(null);

    try {
      let dfdData;
      const processElement = currentDfdData?.elements.find(el => el.id.toString() === processNode.id);
      
      if (processElement?.dfdChildId && processElement.dfdChildId > 0) {
        // AXIOS FIX: Get response.data directly
        const response = await api.get(`/dfd/${processElement.dfdChildId}`);
        dfdData = response.data;
      } else {
        const payload = {
          processParentId: parseInt(processNode.id),
          levelNumber: levelNumber
        };
        // AXIOS FIX: Get response.data directly, no response.json() needed
        const response = await api.post(`/dfd/child`, payload);
        dfdData = response.data;
      }

      onDecompose(dfdData.id, dfdData.levelNumber, dfdData.dfdParentId);
      setStatus(`Decomposto! Entrando no nível ${dfdData.levelNumber}...`);
    } catch (error) {
      console.error("Erro na decomposição:", error);
      setStatus(`Erro na decomposição: ${error.message}`);
    }
  };

  const handleAddElement = (typeString, labelDefault) => {
    const name = prompt(`Enter name for ${labelDefault}:`, labelDefault);
    if (!name) return;

    const generatedUuid = crypto.randomUUID();

    const newNode = {
      id: `temp_${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 300 + 50, y: Math.random() * 300 + 50 },
      data: { 
        label: name, 
        type: typeString,
        uuid: generatedUuid
      },
      style: getStyleByType(typeString)
    };

    setNodes((nds) => nds.concat(newNode));
    setStatus(`Created local ${labelDefault}.`);
  };

  const loadData = async () => {
    setStatus(`Loading diagram ${dfdId} from DB...`);
    try {
      // AXIOS FIX: No "response.ok" check needed. If it fails, it goes to catch.
      const response = await api.get(`/dfd/${dfdId}`);
      const data = response.data; // Data is already parsed!
      setCurrentDfdData(data);
      
      const loadedNodes = data.elements.map(item => ({
        id: item.id.toString(),
        type: 'default',
        position: { x: item.xValue, y: item.yValue },
        data: { 
          label: item.name, 
          type: item.type, 
          dfdChildId: item.dfdChildId,
          uuid: item.uuid || crypto.randomUUID() 
        },
        style: getStyleByType(item.type)
      }));
      
      setNodes(loadedNodes);

      const getHandleStr = (posInt, defaultHandle) => {
        switch(posInt) {
          case 0: return 'top';
          case 1: return 'right';
          case 2: return 'bottom';
          case 3: return 'left';
          default: return defaultHandle;
        }
      };

      const incomingFlows = data.flows || data.dataFlows; 

      if (incomingFlows && incomingFlows.length > 0) {
        const loadedEdges = incomingFlows.map(flow => {
          const sourceNode = loadedNodes.find(n => n.data.uuid === flow.sourceElementIdentifier);
          const targetNode = loadedNodes.find(n => n.data.uuid === flow.targetElementIdentifier);

          if (sourceNode && targetNode) {
            return {
              id: `flow_${flow.id}`,
              source: sourceNode.id,
              target: targetNode.id,
              sourceHandle: getHandleStr(flow.sourcePosition, 'bottom'),
              targetHandle: getHandleStr(flow.targetPosition, 'top'),
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#000000', 
              },
              style: {
                strokeWidth: 2,
                stroke: '#000000', 
              },
              data: { 
                backendId: flow.id,
                name: flow.name,
                description: flow.description
              }
            };
          }
          return null;
        }).filter(edge => edge !== null);

        setEdges(loadedEdges);
      } else {
        setEdges([]); 
      }

      setStatus(`Loaded ${data.elements.length} elements. Level: ${data.levelNumber}`);
    } catch (error) {
      console.error(error);
      setStatus("Error: Could not connect to Backend.");
    }
  };

  const saveAll = async () => {
    setStatus("Saving changes...");

    const mappedElements = nodes.map(node => ({
      id: node.id.startsWith('temp_') ? 0 : parseInt(node.id),
      name: node.data.label,
      type: node.data.type || DFD_TYPES.ACTOR,
      xValue: node.position.x,
      yValue: node.position.y,
      width: parseFloat(node.style?.width) || 150,
      height: parseFloat(node.style?.height) || 80,
      uuid: node.data.uuid
    }));

    const getPosInt = (handleId, defaultPos) => {
      if (!handleId) return defaultPos;
      if (handleId.includes('top')) return 0;
      if (handleId.includes('right')) return 1;
      if (handleId.includes('bottom')) return 2;
      if (handleId.includes('left')) return 3;
      return defaultPos;
    };

    const mappedDataFlows = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      return {
        id: edge.data?.backendId || 0,
        name: edge.data?.name || "Novo Fluxo",
        description: edge.data?.description || "",
        sourceElementIdentifier: sourceNode ? sourceNode.data.uuid : "",
        targetElementIdentifier: targetNode ? targetNode.data.uuid : "",
        sourcePosition: getPosInt(edge.sourceHandle, 2), 
        targetPosition: getPosInt(edge.targetHandle, 0)
      };
    }).filter(flow => flow.sourceElementIdentifier && flow.targetElementIdentifier);

    const payload = {
      elements: mappedElements,
      dataFlows: mappedDataFlows
    };

    try {
      // AXIOS FIX: Removed the undefined "response" variable check. 
      await api.put(`/dfd/${dfdId}/elements`, payload);
      setStatus(`Saved successfully.`);
      await loadData(); 
    } catch (error) {
      console.error("Save error:", error);
      setStatus("Error: Could not save to Backend.");
    }
  };

  const onNodeClick = useCallback((e, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  useEffect(() => { loadData(); }, [dfdId]);

  const onNodeDoubleClick = (e, node) => {
    const newName = prompt("Edit Name:", node.data.label);
    if (newName) {
      setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, label: newName } } : n));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes} // Added to suppress warning
        edgeTypes={edgeTypes} // Added to suppress warning
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onNodeClick} 
        onPaneClick={onPaneClick} 
        onNodesDelete={onNodesDelete}
        fitView
      >
        {/* ... Rest of your component (Panel, Controls, MiniMap, Background) remains identical ... */}
        <Panel position="top-left">
          <div style={styles.toolbar}>
            <button style={{...styles.button, ...styles.btnBack}} onClick={onBackToDashboard}>
              ⬅ Dashboard
            </button>
            
            {canReturn && (
              <button 
                style={{...styles.button, ...styles.btnBack}} 
                onClick={onReturnToParent}
                title="Voltar para o nível anterior"
              >
                ⬆ Nível Anterior
              </button>
            )}
            
            <div style={{width: '1px', height: '20px', background: '#ccc', margin: '0 5px'}}></div>

            <button style={{...styles.button, ...styles.btnProcess}} onClick={() => handleAddElement(DFD_TYPES.PROCESS, "New Process")}>⚙️ Process</button>
            <button style={{...styles.button, ...styles.btnActor}} onClick={() => handleAddElement(DFD_TYPES.ACTOR, "New Actor")}>👤 Actor</button>
            <button style={{...styles.button, ...styles.btnStore}} onClick={() => handleAddElement(DFD_TYPES.DATA_STORE, "Data Store")}>💾 Store</button>

            <div style={{width: '1px', height: '20px', background: '#ccc', margin: '0 5px'}}></div>

            <button style={{...styles.button, ...styles.btnLoad}} onClick={loadData}>📂 Load DB</button>
            <button style={{...styles.button, ...styles.btnSave}} onClick={saveAll}>💾 Save</button>

            {selectedNode && selectedNode.data.type === DFD_TYPES.PROCESS && (
              <>
                <div style={{width: '1px', height: '20px', background: '#ccc', margin: '0 5px'}}></div>
                <button 
                  style={{
                    ...styles.button, 
                    backgroundColor: selectedNode.id.startsWith('temp_') ? '#9e9e9e' : '#4CAF50', 
                    color: 'white', 
                    fontWeight: 'bold',
                    cursor: selectedNode.id.startsWith('temp_') ? 'not-allowed' : 'pointer',
                    boxShadow: selectedNode.id.startsWith('temp_') ? 'none' : '0 0 5px rgba(76, 175, 80, 0.5)'
                  }} 
                  onClick={() => {
                    if (selectedNode.id.startsWith('temp_')) {
                      setStatus("⚠️ Salve o diagrama (Save) antes de decompor um novo processo!");
                      return;
                    }
                    handleDecompose(selectedNode);
                  }}
                  title={selectedNode.id.startsWith('temp_') ? "Salve no banco antes de decompor" : `Decompor o processo: ${selectedNode.data.label}`}
                >
                  🔍 {selectedNode.id.startsWith('temp_') ? "Salve para Decompor" : "Decompor Processo"}
                </button>
              </>
            )}

            <div style={styles.status}>{status} (DFD ID: {dfdId} | Level: {levelNumber})</div>
          </div>
        </Panel>

        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}