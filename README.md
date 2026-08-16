# MicroFlow

This project consists of an API built with React (front-end), Java & Spring Boot (back-end), and PostgreSQL (database) for managing Data Flow Diagrams (DFD).

---

# 1. Instructions for Running the Project

This section details the procedures required to initialize the complete environment, including the database, the initial setup script, and the backend service.

## 1.1. Environment setting

To run this project, you must have the following tools installed beforehand:

- Docker Compose: Multi-container orchestrator.
- Git: Version control system.

---

## 1.2. Installation Procedure

### Cloning the Repository
Option 1: Via SSH

    git clone git@github.com:Threat-Model-TCC/dfd-service.git
    cd dfd-service

Option 2: Via HTTP

    git clone https://github.com/Threat-Model-TCC/dfd-service.git
    cd dfd-service

### Starting the Services:
Make sure ports 5000 (API), 1445 (SQL Server), and 3000 (front-end) are not being used by other processes. From the root directory, run:

    docker-compose up --build

Access the tool locally at:

    localhost:3000/

# 2. API Documentation and Endpoints

## 2.1. Swagger
The API's documentation and testing interface is provided by Swagger (OpenAPI), allowing direct interaction with the available resources.

    Access URL: http://localhost:5000

## 2.2. Endpoints

| Resource | Method | Endpoint | Description | Status | Auth |
|--------|--------|----------|-----------|--------|------|
| Projects | GET | /api/v1/projects | Retrieves a paginated list of registered projects. | 200 | No |
| Projects | POST | /api/v1/projects | Creates a new project and automatically instantiates its context diagram (Level 0). | 201 | No |
| Projects | GET | /api/v1/projects/{id} | Retrieves the details of a specific project by its identifier. | 200 | No |
| Projects | PUT | /api/v1/projects/{id} | Updates the title and description of an existing project. | 200 | No |
| Projects | DELETE | /api/v1/projects/{id} | Removes a project and all linked diagrams and elements (cascading deletion). | 204 | No |
| Diagrams (DFD) | GET | /api/v1/dfd/{id} | Retrieves the metadata of a specific diagram. | 200 | No |
| Diagrams (DFD) | POST | /api/v1/dfd/child | Creates a sub-diagram (child) from a Process-type element. | 201 | No |
| Diagrams (DFD) | PUT | /api/v1/dfd/{id}/elements | Synchronizes (creates or updates) the list of elements (Actors, Processes, DataStores) of a DFD. | 200 | No |
| Elements | DELETE | /api/v1/dfd-elements/{id} | Removes an individual element from the diagram. | 204 | No |

# 3. Database
To access the database, run the command:

    docker exec -it dfd_db psql -U postgres -d dfd_db

# 4. Usability

This section describes how to interact with the tool and use its main features for Data Flow Diagram (DFD) modeling.

---

## 4.1. Projects Page

The projects page is the application's initial interface. Here, the user can:

- View existing projects;
- Create new projects;
- Edit project information;
- Delete projects.

![Projects Screen](assets/images/projects-page.png)

When accessing a project, the user is automatically redirected to the canvas containing the level 0 DFD (context diagram).

---

## 4.2. Canvas Screen

The canvas screen is responsible for modeling the DFD diagrams.

### 4.2.1. Creating Elements

To create an element (`Actor`, `Process`, or `DataStore`), simply select the desired type. The element will be automatically added to the canvas, and the user will be prompted for a name to identify it.

![Create element](assets/images/create-element.png)

---

### 4.2.2. Removing Elements

To remove an element from the diagram, click on it and press the `Backspace` key.

![Delete element](assets/images/element-removal.png)

---

### 4.2.3. Creating Data Flows (Arrows)

To create a data flow between two elements, click on the connection point of the source element and drag the mouse to the connection point of the target element.

![Delete element](assets/images/data-flow.png)

---

### 4.2.4. Saving Canvas Changes

Changes made on the canvas are only persisted to the database when clicking the `Save to DB` button.

This button is responsible for saving the current state of the diagram.

![Save canvas](assets/images/save-canva.png)

---

### 4.2.5. Accessing the Next DFD Level

When clicking on a `Process`-type element, the `Decompose` option will be displayed. Selecting it will redirect the user to the next level of the diagram, allowing the selected process to be detailed further.

![Decompose process](assets/images/decompose-process.png)

> **Important note:** it is only possible to decompose a process if the current DFD has already been saved.

---

### 4.2.6. Returning to the Previous DFD Level

When the user is on a diagram other than level 0 (context), the `Return to Previous Level` button will be displayed.

Clicking this button will redirect the user to the previous diagram.

![Previous level](assets/images/last-level.png)

> **Important note:** it is only possible to return to the previous level if the current DFD has been saved.

## 5. Microservices Architecture

The system was designed with a distributed architecture and currently consists of 4 main services:

*   **`auth-service`**: Responsible for identity management, access control, and secure user authentication. Has its own database, **`auth_db`**.
*   **`dfd-service`**: The application's core domain. Manages the entire lifecycle of projects and operations related to Data Flow Diagrams (DFDs). Has its own database, **`dfd_db`**.
*   **`api-gateway`**: Acts as the system's Single Point of Entry. It abstracts internal complexity, receiving external requests and performing reverse routing to the appropriate microservice.
*   **`service-registry`**: Acts as the Service Discovery mechanism. Maintains a dynamic registry of the instances and ports of running microservices, allowing them to communicate internally in a transparent way, without the need for coupling to static IPs.

![Microservices architecture](assets/images/microservices-architecture.png)
