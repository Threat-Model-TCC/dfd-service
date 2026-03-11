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
import { API_URL } from '../../constants/api';
import { DFD_TYPES } from '../../constants/dfdTypes';
import { styles } from '../../styles/commonStyles';
import { getStyleByType } from '../../utils/dfdUtils';

export default function DfdCanvas({ projectId, onBack }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [status, setStatus] = useState("Ready.");

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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
    setStatus(`Loading project ${projectId} from DB...`);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const dataList = await response.json();
        const loadedNodes = dataList.map(item => ({
          id: item.id.toString(),
          type: 'default',
          position: { x: parseFloat(item.positionX), y: parseFloat(item.positionY) },
          data: { label: item.elementName, type: item.type },
          style: getStyleByType(item.type)
        }));
        setNodes(loadedNodes);
        setEdges([]);
        setStatus(`Loaded ${dataList.length} elements.`);
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
    let successCount = 0;
    let failCount = 0;

    for (let node of nodes) {
      const payload = {
        elementName: node.data.label,
        positionX: node.position.x,
        positionY: node.position.y,
        width: parseFloat(node.style.width) || 150,
        height: parseFloat(node.style.height) || 80,
        type: node.data.type || DFD_TYPES.ACTOR
      };

      try {
        let response;
        if (node.id.toString().startsWith('temp_')) {
          response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            const savedItem = await response.json();
            setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, id: savedItem.id.toString() } : n));
            successCount++;
          } else {
            failCount++;
          }
        } else {
          const updateUrl = `${API_URL}/${node.id}`;
          const putPayload = { ...payload, id: parseInt(node.id) };
          response = await fetch(updateUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(putPayload)
          });
          if (response.ok) successCount++;
          else failCount++;
        }
      } catch (error) {
        console.error("Save error:", error);
        failCount++;
      }
    }
    setStatus(`Finished. Saved: ${successCount}. Failed: ${failCount}.`);
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
