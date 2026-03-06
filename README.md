# DFD Service

Este projeto consiste em uma API desenvolvida em .NET 10 para a gestão de Diagramas de Fluxo de Dados (DFD), com suporte à modelagem de ameaças e persistência em SQL Server.

---

### Observação importante sobre essa versão

No momento, a tela (frontend) de modelagem do diagrama está desatualizada em relação ao backend atual. Dessa forma, ela não funcionará para desenhar ou modelar os diagramas.

Na próxima história de usuário esperamos resolver essa pendência e finalizar essa funcionalidade.

# 1. Instruções para Execução do Projeto

Esta seção detalha os procedimentos necessários para inicializar o ambiente completo, incluindo o banco de dados, o script de configuração inicial e o serviço de backend.

## 1.1. Pré-requisitos

Para a execução deste projeto, é indispensável a instalação prévia das seguintes ferramentas:

- Docker Compose: Orquestrador de múltiplos containers.
- Git: Sistema de controle de versão.

---

## 1.2. Procedimento de Instalação

### Clonagem do Repositório
    git clone https://github.com/Threat-Model-TCC/dfd-containter.git
    cd dfd-service

### Inicialização dos Serviços:
Certifique-se de que as portas 5000 (API), 1445 (SQL Server) e 3000 (front-end) não estejam sendo utilizadas por outros processos. Na raiz do diretório, execute:

    docker-compose up --build

Verificação de Inicialização:
O serviço dfd_backend possui uma dependência de integridade (healthcheck) em relação ao sqlserver. A API estará plenamente disponível para consumo assim que a mensagem Application started for exibida nos logs do console.

# 2. Documentação da API e Endpoints

## 2.1. Swagger
A interface de documentação e testes da API é provida pelo Swagger (OpenAPI), permitindo a interação direta com os recursos disponíveis.

    URL de Acesso: http://localhost:5000

## 2.2. Endpoints

| Recurso | Método | Endpoint | Descrição | Status | Auth |
|--------|--------|----------|-----------|--------|------|
| Projetos | GET | /api/v1/projects | Recupera uma lista paginada de projetos cadastrados. | 200 | No |
| Projetos | POST | /api/v1/projects | Cria um novo projeto e instancia automaticamente seu diagrama de contexto (Nível 0). | 201 | No |
| Projetos | GET | /api/v1/projects/{id} | Obtém os detalhes de um projeto específico pelo seu identificador. | 200 | No |
| Projetos | PUT | /api/v1/projects/{id} | Atualiza o título e a descrição de um projeto existente. | 200 | No |
| Projetos | DELETE | /api/v1/projects/{id} | Remove um projeto e todos os diagramas e elementos vinculados (deleção em cascata). | 204 | No |
| Diagramas (DFD) | GET | /api/v1/dfd/{id} | Recupera os metadados de um diagrama específico. | 200 | No |
| Diagramas (DFD) | POST | /api/v1/dfd/child | Cria um sub-diagrama (filho) a partir de um elemento do tipo Processo. | 201 | No |
| Diagramas (DFD) | PUT | /api/v1/dfd/{id}/elements | Sincroniza (cria ou atualiza) a lista de elementos (Atores, Processos, DataStores) de um DFD. | 200 | No |
| Elementos | DELETE | /api/v1/dfd-elements/{id} | Remove um elemento individual do diagrama. | 204 | No |

# 3 Banco de dados
Para acessar o banco de dados rode o comando:

    docker exec -it sql2022_db /opt/mssql-tools18/bin/sqlcmd    -S localhost -U sa -P 'SuaSenhaForte123!' -d dfd_db -C