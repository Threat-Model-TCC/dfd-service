CREATE TABLE projects (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(255),
    description NVARCHAR(MAX),
    context_diagram_id BIGINT,
    created_at DATETIME2 DEFAULT GETDATE()
);

ALTER TABLE dfds
ADD project_id BIGINT;

ALTER TABLE dfds
ADD CONSTRAINT fk_dfds_project_id
FOREIGN KEY (project_id)
REFERENCES projects(id)
ON DELETE CASCADE;