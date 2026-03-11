import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../constants/api';
import { styles } from '../../styles/commonStyles';

export default function Dashboard({ onOpenProject }) {
  const [paginatedData, setPaginatedData] = useState({ currentPage: 1, pages: 0, projects: [] });
  const [loading, setLoading] = useState(false);

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

  const handleEditProject = async (id, currentName, currentDesc) => {
    const newName = prompt("Edite o nome do projeto:", currentName);
    if (!newName) return;
    const newDesc = prompt("Edite a descrição do projeto:", currentDesc);

    try {
      const response = await fetch(`${BASE_URL}/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc || "Sem descrição" })
      });

      if (response.ok) {
        console.log(`Projeto ${id} editado com sucesso.`);
        await loadProjects();
      } else {
        alert("Erro ao editar o projeto.");
      }
    } catch (error) {
      console.error("Erro PUT:", error);
    }
  };

  const handleDeleteProject = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este projeto? Essa ação não pode ser desfeita.");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${BASE_URL}/projects/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        console.log(`Projeto ${id} excluído com sucesso.`);
        await loadProjects();
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
