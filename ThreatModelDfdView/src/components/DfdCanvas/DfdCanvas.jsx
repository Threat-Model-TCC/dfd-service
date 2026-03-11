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

export default function DfdCanvas({ projectId, onBack }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [status, setStatus] = useState("Ready.");

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
    setStatus(`Loading diagram ${projectId} from DB...`);
    try {
      const response = await fetch(`${BASE_URL}/dfd/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Mapeando do padrão do backend para o padrão do ReactFlow
        const loadedNodes = data.elements.map(item => ({
          id: item.id.toString(),
          type: 'default',
          position: { x: item.xValue, y: item.yValue },
          data: { label: item.name, type: item.type },
          style: getStyleByType(item.type)
        }));
        
        setNodes(loadedNodes);
        setEdges([]); // Setas ainda não implementadas no backend
        setStatus(`Loaded ${data.elements.length} elements.`);
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
      const response = await fetch(`${BASE_URL}/dfd/${projectId}/elements`, {
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

  useEffect(() => { loadData(); }, [projectId]);

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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodesDelete={onNodesDelete} /* <-- Adicionado o gatilho de exclusão aqui */
        fitView
      >
        <Panel position="top-left">
          <div style={styles.toolbar}>
            <button style={{...styles.button, ...styles.btnBack}} onClick={onBack}>
              ⬅ Voltar
            </button>
            <div style={{width: '1px', height: '20px', background: '#ccc', margin: '0 5px'}}></div>

            <button style={{...styles.button, ...styles.btnProcess}} onClick={() => handleAddElement(DFD_TYPES.PROCESS, "New Process")}>⚙️ Process</button>
            <button style={{...styles.button, ...styles.btnActor}} onClick={() => handleAddElement(DFD_TYPES.ACTOR, "New Actor")}>👤 Actor</button>
            <button style={{...styles.button, ...styles.btnStore}} onClick={() => handleAddElement(DFD_TYPES.DATA_STORE, "Data Store")}>💾 Store</button>

            <div style={{width: '1px', height: '20px', background: '#ccc', margin: '0 5px'}}></div>

            <button style={{...styles.button, ...styles.btnLoad}} onClick={loadData}>📂 Load DB</button>
            <button style={{...styles.button, ...styles.btnSave}} onClick={saveAll}>💾 Save</button>
            <div style={styles.status}>{status} (Project ID: {projectId})</div>
          </div>
        </Panel>
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}