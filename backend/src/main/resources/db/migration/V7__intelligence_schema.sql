CREATE TABLE model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    training_dataset TEXT,
    metrics JSONB,
    deployed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE intelligence_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    priority VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    evidence JSONB,
    data_freshness TIMESTAMP WITH TIME ZONE,
    confidence DECIMAL(5,4),
    uncertainty JSONB,
    suggested_action TEXT,
    required_approval VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    model_id UUID REFERENCES model_registry(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE human_decision_traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    recommendation_id UUID NOT NULL REFERENCES intelligence_recommendations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    decision VARCHAR(50) NOT NULL,
    reason TEXT,
    action_taken TEXT,
    outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE what_if_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    creator_id UUID NOT NULL REFERENCES users(id),
    input_data_snapshot JSONB,
    assumptions JSONB,
    model_version VARCHAR(100),
    rules_version VARCHAR(100),
    outputs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendations_org ON intelligence_recommendations(organization_id);
CREATE INDEX idx_recommendations_status ON intelligence_recommendations(status);
CREATE INDEX idx_recommendations_entity ON intelligence_recommendations(entity_type, entity_id);
