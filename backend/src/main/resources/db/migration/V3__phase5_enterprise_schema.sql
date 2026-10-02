CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    address TEXT,
    contact VARCHAR(100),
    timezone VARCHAR(100) DEFAULT 'UTC',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    plan_name VARCHAR(50) NOT NULL, -- STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE
    status VARCHAR(50) NOT NULL, -- TRIAL, ACTIVE, PAST_DUE, CANCELLED
    user_limit INTEGER NOT NULL,
    branch_limit INTEGER NOT NULL,
    api_request_limit INTEGER,
    storage_limit_mb INTEGER,
    renewal_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    prefix VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    endpoint VARCHAR(255) NOT NULL,
    secret VARCHAR(255),
    events TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL, -- PURCHASE, ADJUSTMENT, TRANSFER, RECALL
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    decision VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_branch_org ON branches(organization_id);
CREATE INDEX idx_subscription_org ON subscriptions(organization_id);
CREATE INDEX idx_apikey_org ON api_keys(organization_id);
CREATE INDEX idx_approval_org ON approval_requests(organization_id, decision);
