package org.xhy.domain.agent.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import org.apache.ibatis.type.JdbcType;
import org.xhy.infrastructure.typehandler.JsonTypeHandler;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Agent版本实体类，代表一个Agent的发布版本
 */
@TableName(value = "agent_versions", autoResultMap = true)
public class AgentVersionEntity extends Model<AgentVersionEntity> {

    /**
     * 版本唯一ID
     */
    @TableId(value = "id", type = IdType.ASSIGN_UUID)
    private String id;

    /**
     * 关联的Agent ID
     */
    @TableField("agent_id")
    private String agentId;

    /**
     * 版本号，如1.0.0
     */
    @TableField("version_number")
    private String versionNumber;

    /**
     * Agent系统提示词
     */
    @TableField("system_prompt")
    private String systemPrompt;

    /**
     * 欢迎消息
     */
    @TableField("welcome_message")
    private String welcomeMessage;

    /**
     * 模型配置，包含模型类型、温度等参数
     */
    @TableField(value = "model_config", typeHandler = JsonTypeHandler.class, jdbcType = JdbcType.OTHER)
    private ModelConfig modelConfig;

    /**
     * Agent可使用的工具列表
     */
    @TableField(value = "tools", typeHandler = JsonTypeHandler.class, jdbcType = JdbcType.OTHER)
    private List<AgentTool> tools;

    /**
     * 关联的知识库ID列表
     */
    @TableField(value = "knowledge_base_ids", typeHandler = JsonTypeHandler.class, jdbcType = JdbcType.OTHER)
    private List<String> knowledgeBaseIds;

    /**
     * 版本更新日志
     */
    @TableField("change_log")
    private String changeLog;

    /**
     * Agent类型：1-聊天助手, 2-功能性Agent
     */
    @TableField("agent_type")
    private Integer agentType;

    /**
     * 发布时间
     */
    @TableField("published_at")
    private LocalDateTime publishedAt;

    /**
     * 无参构造函数
     */
    public AgentVersionEntity() {
        this.modelConfig = ModelConfig.createDefault();
        this.tools = new ArrayList<>();
        this.knowledgeBaseIds = new ArrayList<>();
    }

    /**
     * 全参构造函数
     */
    public AgentVersionEntity(String id, String agentId, String versionNumber, String systemPrompt, 
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

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    /**
     * 从Agent创建新版本
     */
    public static AgentVersionEntity createFromAgent(AgentEntity agent, String versionNumber, String changeLog) {
        AgentVersionEntity version = new AgentVersionEntity();
        version.setAgentId(agent.getId());
        version.setVersionNumber(versionNumber);
        version.setSystemPrompt(agent.getSystemPrompt());
        version.setWelcomeMessage(agent.getWelcomeMessage());
        version.setModelConfig(agent.getModelConfig());
        version.setTools(agent.getTools());
        version.setKnowledgeBaseIds(agent.getKnowledgeBaseIds());
        version.setAgentType(agent.getAgentType());
        version.setChangeLog(changeLog);
        version.setPublishedAt(LocalDateTime.now());
        return version;
    }

    /**
     * 转换为DTO对象
     */
    public AgentVersionDTO toDTO() {
        AgentVersionDTO dto = new AgentVersionDTO();
        dto.setId(this.id);
        dto.setAgentId(this.agentId);
        dto.setVersionNumber(this.versionNumber);
        dto.setSystemPrompt(this.systemPrompt);
        dto.setWelcomeMessage(this.welcomeMessage);
        dto.setModelConfig(this.modelConfig);
        dto.setTools(this.tools);
        dto.setKnowledgeBaseIds(this.knowledgeBaseIds);
        dto.setChangeLog(this.changeLog);
        dto.setAgentType(this.agentType);
        dto.setPublishedAt(this.publishedAt);
        return dto;
    }
} 