CREATE TABLE dfds(
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    level_number INT
);

ALTER TABLE dfd_elements
ADD dfd_id BIGINT;

ALTER TABLE dfd_elements
ADD CONSTRAINT fk_dfd_elements_dfd_id
FOREIGN KEY (dfd_id)
REFERENCES dfds(id)
ON DELETE CASCADE;

CREATE TABLE actors (
    id BIGINT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES dfd_elements(id) ON DELETE CASCADE
);

CREATE TABLE processes (
    id BIGINT PRIMARY KEY,
    dfd_child_id BIGINT,
    FOREIGN KEY (id) REFERENCES dfd_elements(id) ON DELETE CASCADE
);

CREATE TABLE data_stores (
    id BIGINT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES dfd_elements(id) ON DELETE CASCADE
);

CREATE TABLE data_flows (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(500),
    source_element_id BIGINT,
    target_element_id BIGINT,
    dfd_id BIGINT,
    FOREIGN KEY (source_element_id) REFERENCES dfd_elements(id),
    FOREIGN KEY (target_element_id) REFERENCES dfd_elements(id),
    FOREIGN KEY (dfd_id) REFERENCES dfds(id) ON DELETE CASCADE
);