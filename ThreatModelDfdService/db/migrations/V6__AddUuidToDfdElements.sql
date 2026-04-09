ALTER TABLE dfd_elements
ADD uuid_identifier VARCHAR(255);
GO

UPDATE dfd_elements 
SET uuid_identifier = NEWID() 
WHERE uuid_identifier IS NULL;
GO

ALTER TABLE dfd_elements
ADD CONSTRAINT UQ_dfd_elements_uuid UNIQUE (uuid_identifier);
GO

ALTER TABLE data_flows
ADD source_position DECIMAL(10,3);

ALTER TABLE data_flows
ADD target_position DECIMAL(10,3);
GO