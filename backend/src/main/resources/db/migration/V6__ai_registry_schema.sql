CREATE TABLE IF NOT EXISTS dataset_versions (
    id UUID PRIMARY KEY,
    dataset_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    row_count BIGINT,
    feature_count INT,
    schema_hash VARCHAR(255),
    data_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID,
    source VARCHAR(255),
    quality_status VARCHAR(50),
    UNIQUE(dataset_name, version)
);

CREATE TABLE IF NOT EXISTS ai_model_registry (
    id UUID PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    version VARCHAR(50) NOT NULL,
    artifact_uri VARCHAR(500),
    dataset_version VARCHAR(50),
    feature_version VARCHAR(50),
    algorithm VARCHAR(100),
    metrics_json TEXT,
    validation_status VARCHAR(50),
    deployment_status VARCHAR(50),
    checksum VARCHAR(255),
    created_by UUID,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    retired_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(model_name, version)
);

CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY,
    organization_id UUID,
    branch_id UUID,
    model_id UUID REFERENCES ai_model_registry(id),
    model_version VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    prediction_type VARCHAR(50),
    input_snapshot_hash VARCHAR(255),
    prediction_json TEXT,
    confidence VARCHAR(50),
    uncertainty_json TEXT,
    feature_version VARCHAR(50),
    data_freshness VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Index for quick lookup of predictions
CREATE INDEX IF NOT EXISTS idx_ai_predictions_org_entity ON ai_predictions(organization_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_registry_active ON ai_model_registry(model_name, deployment_status);
