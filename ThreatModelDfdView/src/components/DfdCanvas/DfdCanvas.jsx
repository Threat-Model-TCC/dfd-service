import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BASE_URL } from '../../constants/api'; // Mudamos para BASE_URL
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

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Função para lidar com a exclusão de elementos (quando o usuário aperta Delete ou Backspace)
  const onNodesDelete = useCallback(async (deletedNodes) => {
    for (let node of deletedNodes) {
      // Se não for um elemento temporário, mandamos o backend excluir
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
        // Se já tem um dfdChildId preenchido, fazer GET /dfd/{id}
        const response = await fetch(`${BASE_URL}/dfd/${processElement.dfdChildId}`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar DFD filho: ${response.status}`);
        }
        dfdData = await response.json();
      } else {
        // Se não tem dfdChildId, fazer POST /dfd/child
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

      // Redirecionar para o novo DFD
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

    const newNode = {
      id: `temp_${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 300 + 50, y: Math.random() * 300 + 50 },
      data: { label: name, type: typeString },
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
        
        // Armazenar dados completos do DFD
        setCurrentDfdData(data);
        
        // Mapeando do padrão do backend para o padrão do ReactFlow
        const loadedNodes = data.elements.map(item => ({
          id: item.id.toString(),
          type: 'default',
          position: { x: item.xValue, y: item.yValue },
          data: { label: item.name, type: item.type, dfdChildId: item.dfdChildId },
          style: getStyleByType(item.type)
        }));
        
        setNodes(loadedNodes);
        setEdges([]); // Setas ainda não implementadas no backend
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

    // Mapeando do padrão do ReactFlow para o padrão que o PUT do backend espera
    const payload = nodes.map(node => ({
      id: node.id.startsWith('temp_') ? 0 : parseInt(node.id),
      name: node.data.label,
      type: node.data.type || DFD_TYPES.ACTOR,
      xValue: node.position.x,
      yValue: node.position.y,
      width: parseFloat(node.style?.width) || 150,
      height: parseFloat(node.style?.height) || 80
    }));

    try {
      const response = await fetch(`${BASE_URL}/dfd/${dfdId}/elements`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatus(`Saved successfully.`);
        // Recarregamos a tela logo após salvar para o ReactFlow substituir os 
        // IDs temporários (temp_123) pelos IDs reais gerados pelo banco de dados.
        await loadData(); 
      } else {
        setStatus(`Error saving: ${response.status}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      setStatus("Error: Could not save to Backend.");
    }
  };

  // Listener para menu de contexto ao clicar com botão direito em um nó
  const onNodeContextMenu = useCallback((e, node) => {
    e.preventDefault();
    
    if (node.data.type === DFD_TYPES.PROCESS) {
      setSelectedNode(node);
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  }, []);

  // Fechar menu de contexto ao clicar em outro lugar
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
        onNodesDelete={onNodesDelete} /* <-- Adicionado o gatilho de exclusão aqui */
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

        {/* Menu de Contexto para Decomposição */}
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