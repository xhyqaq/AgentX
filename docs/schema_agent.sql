-- Agent 数据库表设计
-- 用于存储Agent的基本信息和配置

-- Agent表：核心表，存储Agent实体信息和当前编辑中的配置
CREATE TABLE agents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT 'Agent名称',
    avatar VARCHAR(255) COMMENT 'Agent头像URL',
    description TEXT COMMENT 'Agent描述',
    -- 当前编辑中的配置（未发布）
    system_prompt TEXT COMMENT 'Agent系统提示词',
    welcome_message TEXT COMMENT '欢迎消息',
    model_config JSON COMMENT '模型配置，包含模型类型、温度等参数',
    tools JSON COMMENT 'Agent可使用的工具列表',
    knowledge_base_ids JSON COMMENT '关联的知识库ID列表',
    -- 版本管理
    published_version VARCHAR(36) COMMENT '当前发布的版本ID',
    -- 状态管理
    status SMALLINT DEFAULT 0 COMMENT 'Agent状态：0-私有(仅创建者可见)，1-待审核(已提交待审核)，2-已上架(审核通过并公开)，3-被拒绝(审核未通过)，4-已下架(从市场移除)',
    user_id VARCHAR(36) NOT NULL COMMENT '创建者用户ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Agent版本表：存储Agent的已发布版本
CREATE TABLE agent_versions (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL COMMENT '关联的Agent ID',
    version_number VARCHAR(20) NOT NULL COMMENT '版本号，如1.0.0',
    system_prompt TEXT COMMENT 'Agent系统提示词',
    welcome_message TEXT COMMENT '欢迎消息',
    model_config JSON COMMENT '模型配置，包含模型类型、温度等参数',
    tools JSON COMMENT 'Agent可使用的工具列表',
    knowledge_base_ids JSON COMMENT '关联的知识库ID列表',
    change_log TEXT COMMENT '版本更新日志',
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Agent工作区表：用于记录用户添加到工作区的Agent
CREATE TABLE agent_workspace (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL COMMENT '添加到工作区的Agent ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    UNIQUE (agent_id, user_id) COMMENT '防止重复添加'
);

-- 创建索引
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX idx_agent_versions_version_number ON agent_versions(version_number);
CREATE INDEX idx_agent_versions_published_at ON agent_versions(published_at);
CREATE INDEX idx_agent_workspace_user_id ON agent_workspace(user_id);
CREATE INDEX idx_agent_workspace_agent_id ON agent_workspace(agent_id); 