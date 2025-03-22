package org.xhy.domain.agent.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Agent版本数据传输对象，用于表示层和应用层之间传递Agent版本数据
 */
public class AgentVersionDTO {

    /**
     * 版本唯一ID
     */
    private String id;

    /**
     * 关联的Agent ID
     */
    private String agentId;

    /**
     * 版本号，如1.0.0
     */
    private String versionNumber;

    /**
     * Agent系统提示词
     */
    private String systemPrompt;

    /**
     * 欢迎消息
     */
    private String welcomeMessage;

    /**
     * 模型配置，包含模型类型、温度等参数
     */
    private ModelConfig modelConfig;

    /**
     * Agent可使用的工具列表
     */
    private List<AgentTool> tools;

    /**
     * 关联的知识库ID列表
     */
    private List<String> knowledgeBaseIds;

    /**
     * 版本更新日志
     */
    private String changeLog;

    /**
     * Agent类型：1-聊天助手, 2-功能性Agent
     */
    private Integer agentType;

    /**
     * 发布时间
     */
    private LocalDateTime publishedAt;

    /**
     * 无参构造函数
     */
    public AgentVersionDTO() {
        this.modelConfig = ModelConfig.createDefault();
        this.tools = new ArrayList<>();
        this.knowledgeBaseIds = new ArrayList<>();
    }

    /**
     * 全参构造函数
     */
    public AgentVersionDTO(String id, String agentId, String versionNumber, String systemPrompt, 
                      String welcomeMessage, ModelConfig modelConfig, List<AgentTool> tools, 
                      List<String> knowledgeBaseIds, String changeLog, Integer agentType, LocalDateTime publishedAt) {
        this.id = id;
        this.agentId = agentId;
        this.versionNumber = versionNumber;
        this.systemPrompt = systemPrompt;
        this.welcomeMessage = welcomeMessage;
        this.modelConfig = modelConfig;
        this.tools = tools;
        this.knowledgeBaseIds = knowledgeBaseIds;
        this.changeLog = changeLog;
        this.agentType = agentType;
        this.publishedAt = publishedAt;
    }

    // Getter和Setter方法
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public String getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(String versionNumber) {
        this.versionNumber = versionNumber;
    }

    public String getSystemPrompt() {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt) {
        this.systemPrompt = systemPrompt;
    }

    public String getWelcomeMessage() {
        return welcomeMessage;
    }

    public void setWelcomeMessage(String welcomeMessage) {
        this.welcomeMessage = welcomeMessage;
    }

    public ModelConfig getModelConfig() {
        return modelConfig != null ? modelConfig : ModelConfig.createDefault();
    }

    public void setModelConfig(ModelConfig modelConfig) {
        this.modelConfig = modelConfig;
    }

    public List<AgentTool> getTools() {
        return tools != null ? tools : new ArrayList<>();
    }

    public void setTools(List<AgentTool> tools) {
        this.tools = tools;
    }

    public List<String> getKnowledgeBaseIds() {
        return knowledgeBaseIds != null ? knowledgeBaseIds : new ArrayList<>();
    }

    public void setKnowledgeBaseIds(List<String> knowledgeBaseIds) {
        this.knowledgeBaseIds = knowledgeBaseIds;
    }

    public String getChangeLog() {
        return changeLog;
    }

    public void setChangeLog(String changeLog) {
        this.changeLog = changeLog;
    }

    public Integer getAgentType() {
        return agentType;
    }

    public void setAgentType(Integer agentType) {
        this.agentType = agentType;
    }

    /**
     * 获取类型文本描述
     */
    public String getAgentTypeText() {
        return AgentType.fromCode(agentType).getDescription();
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }
} 