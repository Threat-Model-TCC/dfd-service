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

const API_URL = "http://localhost:5019/api/v1/elements";

const DFD_TYPES = {
  PROCESS: 'Process',
  ACTOR: 'Actor',
  DATA_STORE: 'DataStore'
};

const styles = {
  toolbar: { padding: '10px', backgroundColor: '#fff', display: 'flex', gap: '10px', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '10px', flexWrap: 'wrap' },
  button: { padding: '8px 12px', fontSize: '12px', cursor: 'pointer', border: 'none', borderRadius: '4px', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' },
  btnProcess: { backgroundColor: '#17a2b8' }, 
  btnActor: { backgroundColor: '#28a745' },
  btnStore: { backgroundColor: '#ffc107', color: '#000' }, 
  btnSave: { backgroundColor: '#007bff', marginLeft: 'auto' },
  btnLoad: { backgroundColor: '#6c757d', color: '#fff' },
  btnBack: { backgroundColor: '#dc3545', marginRight: 'auto' }, 
  status: { fontSize: '11px', color: '#666', width: '100%', marginTop: '5px' },
  dashboardContainer: { padding: '40px', fontFamily: 'sans-serif', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
  th: { borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' },
  td: { borderBottom: '1px solid #ddd', padding: '10px' },
  btnCreate: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  // Botões da tabela
  actionsContainer: { display: 'flex', gap: '8px' },
  btnOpen: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  btnEdit: { backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnDelete: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }
};

const getStyleByType = (typeString) => {
  let baseStyle = { background: '#fff', padding: 10, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' };
  if (typeString === DFD_TYPES.PROCESS) return { ...baseStyle, border: '1px solid black', borderRadius: '50%', width: 100, height: 100 };
  else if (typeString === DFD_TYPES.ACTOR) return { ...baseStyle, border: '1px solid black', borderRadius: '4px', width: 150, height: 60 };
  else if (typeString === DFD_TYPES.DATA_STORE) return { ...baseStyle, width: 150, height: 60, border: 'none', borderTop: '2px solid black', borderBottom: '2px solid black', borderRadius: 0 };
  return { ...baseStyle, border: '1px solid black', width: 150 };
};

// ==========================================
// COMPONENTE 1: TELA INICIAL (DASHBOARD)
// ==========================================
function Dashboard({ onOpenProject }) {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [paginatedData, setPaginatedData] = useState({ currentPage: 1, pages: 0, projects: [] });
  const [loading, setLoading] = useState(false);

  // --- REQUISIÇÃO GET ---
  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/projects?page=1&size=10`);
      if (response.ok) {
        const data = await response.json();
        setPaginatedData(data);
      }
    } catch (error) {
      console.error("Erro GET:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  // --- REQUISIÇÃO POST ---
  const handleCreateNewProject = async () => {
    const projectName = prompt("Digite o nome do novo projeto:");
    if (!projectName) return; 
    const projectDesc = prompt("Digite a descrição do projeto:");

    try {
      const response = await fetch(`${BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, description: projectDesc || "Sem descrição" })
      });
      if (response.ok) {
        await loadProjects();
      }
    } catch (error) {
      console.error("Erro POST:", error);
    }
  };

  // --- REQUISIÇÃO PUT (Editar) ---
  const handleEditProject = async (id, currentName, currentDesc) => {
    const newName = prompt("Edite o nome do projeto:", currentName);
    if (!newName) return; // Cancela se deixar em branco
    const newDesc = prompt("Edite a descrição do projeto:", currentDesc);

    try {
      const response = await fetch(`${BASE_URL}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc || "Sem descrição" })
      });

      if (response.ok) {
        console.log(`Projeto ${id} editado com sucesso.`);
        await loadProjects(); // Recarrega a tabela para mostrar o dado atualizado
      } else {
        alert("Erro ao editar o projeto.");
      }
    } catch (error) {
      console.error("Erro PUT:", error);
    }
  };

  // --- REQUISIÇÃO DELETE (Excluir) ---
  const handleDeleteProject = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este projeto? Essa ação não pode ser desfeita.");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${BASE_URL}/projects/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        console.log(`Projeto ${id} excluído com sucesso.`);
        await loadProjects(); // Recarrega a tabela para sumir com a linha
      } else {
        alert("Erro ao excluir o projeto.");
      }
    } catch (error) {
      console.error("Erro DELETE:", error);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  return (
    <div style={styles.dashboardContainer}>
      <h1>Meus Projetos DFD</h1>
      <p>Gerencie suas modelagens de ameaças.</p>
      
      <button style={styles.btnCreate} onClick={handleCreateNewProject}>
        + Criar Novo Projeto
      </button>

      {loading ? (
        <p>Carregando projetos do banco de dados...</p>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nome do Projeto</th>
                <th style={styles.th}>Descrição</th>
                <th style={styles.th}>Criado em</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.projects && paginatedData.projects.length === 0 ? (
                <tr><td colSpan="5" style={{...styles.td, textAlign: 'center'}}>Nenhum projeto encontrado.</td></tr>
              ) : (
                paginatedData.projects && paginatedData.projects.map(proj => (
                  <tr key={proj.id}>
                    <td style={styles.td}>{proj.id}</td>
                    <td style={styles.td}><strong>{proj.name}</strong></td>
                    <td style={styles.td}>{proj.description}</td>
                    <td style={styles.td}>{formatDate(proj.createdAt)}</td>
                    <td style={styles.td}>
                      <div style={styles.actionsContainer}>
                        <button style={styles.btnOpen} onClick={() => onOpenProject(proj.contextDiagramId)}>
                          📂 Abrir
                        </button>
                        <button style={styles.btnEdit} onClick={() => handleEditProject(proj.id, proj.name, proj.description)}>
                          ✏️ Editar
                        </button>
                        <button style={styles.btnDelete} onClick={() => handleDeleteProject(proj.id)}>
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{marginTop: '10px', fontSize: '12px', color: '#666'}}>
            Página {paginatedData.currentPage} de {paginatedData.pages || 1}
          </div>
        </>
      )}
    </div>
  );
}
// ==========================================
// COMPONENTE 2: O SEU CANVAS (Modificado levemente)
// ==========================================
function DfdCanvas({ projectId, onBack }) {
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
    setStatus(`Loading project ${projectId} from DB...`); // <-- Simula carregar o projeto específico
    try {
      const response = await fetch(API_URL); // Futuramente: fetch(`${API_URL}/project/${projectId}`)
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
    // ... (Seu código de save mantido intacto)
    setStatus("Saving changes...");
    let successCount = 0; let failCount = 0;

    for (let node of nodes) {
      const payload = {
        elementName: node.data.label, positionX: node.position.x, positionY: node.position.y,
        width: parseFloat(node.style.width) || 150, height: parseFloat(node.style.height) || 80,
        type: node.data.type || DFD_TYPES.ACTOR 
      };

      try {
        let response;
        if (node.id.toString().startsWith('temp_')) {
          response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          if (response.ok) {
            const savedItem = await response.json();
            setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, id: savedItem.id.toString() } : n));
            successCount++;
          } else { failCount++; }
        } else {
          const updateUrl = `${API_URL}/${node.id}`; 
          const putPayload = { ...payload, id: parseInt(node.id) };
          response = await fetch(updateUrl, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(putPayload) });
          if (response.ok) successCount++; else failCount++; 
        }
      } catch (error) { console.error("Save error:", error); failCount++; }
    }
    setStatus(`Finished. Saved: ${successCount}. Failed: ${failCount}.`);
  };

  useEffect(() => { loadData(); }, [projectId]); // Recarrega se o ID do projeto mudar

  const onNodeDoubleClick = (e, node) => {
    const newName = prompt("Edit Name:", node.data.label);
    if(newName) {
      setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, label: newName } } : n));
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeDoubleClick={onNodeDoubleClick} fitView>
        <Panel position="top-left">
          <div style={styles.toolbar}>
            {/* NOVO: Botão Voltar */}
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

// ==========================================
// COMPONENTE PRINCIPAL (Roteador)
// ==========================================
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedDiagramId, setSelectedDiagramId] = useState(null);

  const handleOpenCanvas = (diagramId) => {
    console.log(`Abrindo Canvas para o contextDiagramId: ${diagramId}`);
    setSelectedDiagramId(diagramId);
    setCurrentScreen('canvas');
  };

  if (currentScreen === 'dashboard') {
    return <Dashboard onOpenProject={handleOpenCanvas} />;
  }

  // Se não for dashboard, renderiza o canvas
  return (
    <DfdCanvas 
      projectId={selectedDiagramId} 
      onBack={() => setCurrentScreen('dashboard')} 
    />
  );
}