import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType // 1. Importação obrigatória para a seta
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BASE_URL } from '../../constants/api';
import { DFD_TYPES } from '../../constants/dfdTypes';
import { styles } from '../../styles/commonStyles';
import { getStyleByType } from '../../utils/dfdUtils';

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
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // 2. FORÇANDO a seta diretamente no momento em que os nós se conectam
  const onConnect = useCallback((params) => {
    const edgeWithArrow = {
      ...params,
      markerEnd: {
        type: MarkerType.ArrowClosed, // Define a ponta como seta
        width: 20,
        height: 20,
        color: '#222', 
      },
      style: {
        strokeWidth: 2,
        stroke: '#222', 
      },
    };
    
    setEdges((eds) => addEdge(edgeWithArrow, eds));
  }, [setEdges]);

  // Função para lidar com a exclusão de elementos
  const onNodesDelete = useCallback(async (deletedNodes) => {
    for (let node of deletedNodes) {
      if (!node.id.startsWith('temp_')) {
        try {
          const response = await fetch(`${BASE_URL}/dfd-elements/${node.id}`, {
            method: 'DELETE'
          });
          if (!response.ok) {
            console.error(`Falha ao excluir o nó ${node.id} no backend.`);
          }
        } catch (err) {
          console.error("Erro ao tentar excluir:", err);
        }
      }
    }
  }, []);

  // Função para decomposição de processos
  const handleDecompose = async (processNode) => {
    if (processNode.data.type !== DFD_TYPES.PROCESS) {
      setStatus("Somente Process pode ser decomposto.");
      return;
    }

    setStatus("Decompondo processo...");
    setContextMenu(null);

    try {
      let dfdData;

      const processElement = currentDfdData?.elements.find(el => el.id.toString() === processNode.id);
      
      if (processElement?.dfdChildId && processElement.dfdChildId > 0) {
        const response = await fetch(`${BASE_URL}/dfd/${processElement.dfdChildId}`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar DFD filho: ${response.status}`);
        }
        dfdData = await response.json();
      } else {
        const payload = {
          processParentId: parseInt(processNode.id),
          levelNumber: levelNumber
        };

        const response = await fetch(`${BASE_URL}/dfd/child`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Erro ao criar DFD filho: ${response.status}`);
        }
        dfdData = await response.json();
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
      const response = await fetch(`${BASE_URL}/dfd/${dfdId}`);
      if (response.ok) {
        const data = await response.json();
        
        console.log("📥 RECEBIDO DO BACKEND (GET):", data);
        
        setCurrentDfdData(data);
        
        // 1. Reconstruir os NÓS (Elements)
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

        // Função auxiliar para converter número do backend de volta para o texto do ReactFlow
        const getHandleStr = (posInt, defaultHandle) => {
          switch(posInt) {
            case 0: return 'top';
            case 1: return 'right';
            case 2: return 'bottom';
            case 3: return 'left';
            default: return defaultHandle;
          }
        };

        // 2. Reconstruir as SETAS (Flows)
        // Pega o array, não importa se o backend mandou como 'flows' ou 'dataFlows'
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
                // Injetando a regra dos conectores de acordo com os números salvos
                sourceHandle: getHandleStr(flow.sourcePosition, 'bottom'),
                targetHandle: getHandleStr(flow.targetPosition, 'top'),
                // Forçando o estilo e a ponta da seta novamente
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 20,
                  height: 20,
                  color: '#222', 
                },
                style: {
                  strokeWidth: 2,
                  stroke: '#222', 
                },
                data: { 
                  backendId: flow.id,
                  name: flow.name,
                  description: flow.description
                }
              };
            } else {
              console.warn(`Não foi possível conectar a seta ${flow.id}. Nós não encontrados.`);
              return null;
            }
          }).filter(edge => edge !== null);

          setEdges(loadedEdges);
        } else {
          setEdges([]); 
        }

        setStatus(`Loaded ${data.elements.length} elements. Level: ${data.levelNumber}`);
      } else {
        setStatus(`Error loading: ${response.status}`);
      }
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

    // Função auxiliar para converter o nome do conector em número para o Backend
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
        // Salvando: Origem = Bottom (2) | Destino = Top (0)
        sourcePosition: getPosInt(edge.sourceHandle, 2), 
        targetPosition: getPosInt(edge.targetHandle, 0)
      };
    }).filter(flow => flow.sourceElementIdentifier && flow.targetElementIdentifier);

    const payload = {
      elements: mappedElements,
      dataFlows: mappedDataFlows
    };

    console.log("📤 ENVIANDO PARA O BACKEND (PUT):", payload);

    try {
      const response = await fetch(`${BASE_URL}/dfd/${dfdId}/elements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatus(`Saved successfully.`);
        await loadData(); 
      } else {
        setStatus(`Error saving: ${response.status}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      setStatus("Error: Could not save to Backend.");
    }
  };

  const onNodeContextMenu = useCallback((e, node) => {
    e.preventDefault();
    if (node.data.type === DFD_TYPES.PROCESS) {
      setSelectedNode(node);
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleCanvasClick = () => {
    setContextMenu(null);
  };

  useEffect(() => { loadData(); }, [dfdId]);

  const onNodeDoubleClick = (e, node) => {
    const newName = prompt("Edit Name:", node.data.label);
    if (newName) {
      setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, label: newName } } : n));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }} onClick={handleCanvasClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onNodesDelete={onNodesDelete}
        fitView
      >
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
            <div style={styles.status}>{status} (DFD ID: {dfdId} | Level: {levelNumber})</div>
          </div>
        </Panel>

        {contextMenu && selectedNode && (
          <div
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 1000,
              padding: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleDecompose(selectedNode)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 15px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              🔍 Decompor
            </button>
          </div>
        )}

        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}