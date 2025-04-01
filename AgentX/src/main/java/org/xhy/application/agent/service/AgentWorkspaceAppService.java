package org.xhy.application.agent.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.xhy.application.agent.assembler.AgentAssembler;
import org.xhy.application.agent.dto.AgentDTO;
import org.xhy.domain.agent.model.AgentEntity;
import org.xhy.domain.agent.model.AgentWorkspaceEntity;
import org.xhy.domain.agent.service.AgentDomainService;
import org.xhy.domain.agent.service.AgentWorkspaceDomainService;
import org.xhy.domain.conversation.model.SessionEntity;
import org.xhy.domain.conversation.service.ConversationDomainService;
import org.xhy.domain.conversation.service.SessionDomainService;
import org.xhy.domain.llm.model.ModelEntity;
import org.xhy.domain.llm.service.LlmDomainService;
import org.xhy.infrastructure.exception.BusinessException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Agent应用服务，用于适配领域层的Agent服务
 * 职责：
 * 1. 接收和验证来自接口层的请求
 * 2. 将请求转换为领域对象或参数
 * 3. 调用领域服务执行业务逻辑
 * 4. 转换和返回结果给接口层
 */
@Service
public class AgentWorkspaceAppService {

    private final AgentWorkspaceDomainService agentWorkspaceDomainService;

    private final AgentDomainService agentServiceDomainService;

    private final SessionDomainService sessionDomainService;

    private final ConversationDomainService conversationDomainService;
    private final LlmDomainService llmDomainService;

    public AgentWorkspaceAppService(AgentWorkspaceDomainService agentWorkspaceDomainService,
                                    AgentDomainService agentServiceDomainService, SessionDomainService sessionDomainService, ConversationDomainService conversationDomainService, LlmDomainService llmDomainService) {
        this.agentWorkspaceDomainService = agentWorkspaceDomainService;
        this.agentServiceDomainService = agentServiceDomainService;
        this.sessionDomainService = sessionDomainService;
        this.conversationDomainService = conversationDomainService;
        this.llmDomainService = llmDomainService;
    }

    /**
     * 获取工作区下的助理
     * 
     * @param  userId 用户id
     * @return AgentDTO
     */
    public List<AgentDTO> getAgents(String userId) {
        List<AgentEntity> workspaceAgents = agentWorkspaceDomainService.getWorkspaceAgents(userId);
        return AgentAssembler.toDTOs(workspaceAgents);
    }

    /**
     * 删除工作区中的助理
     * @param agentId 助理id
     * @param userId 用户id
     */
    @Transactional
    public void deleteAgent(String agentId, String userId) {

        // agent如果是自己的则不允许删除
        AgentEntity agent = agentServiceDomainService.getAgentById(agentId);
        if (agent.getUserId().equals(userId)){
            throw new BusinessException("该助理属于自己，不允许删除");
        }

        boolean deleteAgent = agentWorkspaceDomainService.deleteAgent(agentId, userId);
        if (!deleteAgent){
            throw new BusinessException("删除助理失败");
        }
        List<String> sessionIds = sessionDomainService.getSessionsByAgentId(agentId).stream().map(SessionEntity::getId).collect(Collectors.toList());
        if (sessionIds.isEmpty()){
            return;
        }
        sessionDomainService.deleteSessions(sessionIds);
        conversationDomainService.deleteConversationMessages(sessionIds);
    }

    /**
     * 保存模型
     * @param agentId agentId
     * @param userId 用户id
     * @param modelId 模型id
     */
    public void saveModel(String agentId, String userId, String modelId) {

        // 模型是否是自己的 or 官方的
        ModelEntity model = llmDomainService.getModelById(modelId);
        if (!model.getOfficial() && !model.getUserId().equals(userId)) {
            throw new BusinessException("模型不存在");
        }

        AgentWorkspaceEntity workspace = agentWorkspaceDomainService.findWorkspace(agentId, userId);
        if (workspace == null){
            workspace = new AgentWorkspaceEntity();
            workspace.setAgentId(agentId);
            workspace.setUserId(userId);
        }
        workspace.setModelId(modelId);
        agentWorkspaceDomainService.save(workspace);
    }

    public String getConfiguredModelId(String agentId, String userId) {
        return agentWorkspaceDomainService.getWorkspace(agentId,userId).getModelId();
    }
}