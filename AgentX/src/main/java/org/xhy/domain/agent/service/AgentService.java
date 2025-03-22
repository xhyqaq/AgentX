package org.xhy.domain.agent.service;

import org.xhy.domain.agent.model.AgentDTO;
import org.xhy.domain.agent.model.AgentEntity;
import org.xhy.domain.agent.model.AgentStatus;
import org.xhy.domain.agent.model.AgentVersionDTO;
import org.xhy.domain.agent.model.AgentVersionEntity;
import org.xhy.interfaces.dto.agent.CreateAgentRequest;
import org.xhy.interfaces.dto.agent.PublishAgentVersionRequest;
import org.xhy.interfaces.dto.agent.UpdateAgentBasicInfoRequest;
import org.xhy.interfaces.dto.agent.UpdateAgentConfigRequest;
import org.xhy.interfaces.dto.agent.UpdateAgentRequest;

import java.util.List;

/**
 * Agent服务接口
 */
public interface AgentService {

    /**
     * 创建新Agent
     * @param entity Agent实体对象
     * @return 创建的Agent信息
     */
    AgentDTO createAgent(AgentEntity entity);

    /**
     * 获取单个Agent信息
     * @param agentId Agent ID，不能为空
     * @return Agent信息
     */
    AgentDTO getAgent(String agentId);

    /**
     * 获取用户的所有Agent
     * @param userId 用户ID，不能为空
     * @return 用户的Agent列表
     */
    List<AgentDTO> getUserAgents(String userId);

    /**
     * 获取用户特定状态的Agent
     * @param userId 用户ID，不能为空
     * @param status Agent状态，不能为空
     * @return 符合条件的Agent列表
     */
    List<AgentDTO> getUserAgentsByStatus(String userId, AgentStatus status);

    /**
     * 获取已上架的Agent列表
     * @return 已上架的Agent列表
     */
    List<AgentDTO> getPublishedAgents();

    /**
     * 获取待审核的Agent列表
     * @return 待审核的Agent列表
     */
    List<AgentDTO> getPendingReviewAgents();

    /**
     * 更新Agent信息
     * @param agentId Agent ID，不能为空
     * @param entity 更新的Agent实体对象
     * @return 更新后的Agent信息
     */
    AgentDTO updateAgent(String agentId, AgentEntity entity);

    /**
     * 更新Agent状态
     * @param agentId Agent ID，不能为空
     * @param status Agent状态，不能为空
     * @return 更新后的Agent信息
     */
    AgentDTO updateAgentStatus(String agentId, AgentStatus status);

    /**
     * 删除Agent
     * @param agentId Agent ID，不能为空
     */
    void deleteAgent(String agentId);

    /**
     * 搜索Agent
     * @param userId 用户ID，不能为空
     * @param keyword 搜索关键词，不能为空
     * @return 搜索结果Agent列表
     */
    List<AgentDTO> searchAgents(String userId, String keyword);
    
    /**
     * 发布Agent版本
     * @param agentId Agent ID，不能为空
     * @param versionEntity 版本实体对象
     * @return 发布的版本信息
     */
    AgentVersionDTO publishAgentVersion(String agentId, AgentVersionEntity versionEntity);
    
    /**
     * 获取Agent的所有版本
     * @param agentId Agent ID，不能为空
     * @return 版本列表
     */
    List<AgentVersionDTO> getAgentVersions(String agentId);
    
    /**
     * 获取Agent的特定版本
     * @param agentId Agent ID，不能为空
     * @param versionNumber 版本号，不能为空
     * @return 版本信息
     */
    AgentVersionDTO getAgentVersion(String agentId, String versionNumber);
    
    /**
     * 获取Agent的最新版本
     * @param agentId Agent ID，不能为空
     * @return 最新版本信息
     */
    AgentVersionDTO getLatestAgentVersion(String agentId);
} 