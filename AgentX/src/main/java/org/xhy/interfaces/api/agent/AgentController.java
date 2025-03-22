package org.xhy.interfaces.api.agent;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.xhy.application.agent.service.AgentAppService;
import org.xhy.domain.agent.model.AgentDTO;
import org.xhy.domain.agent.model.AgentStatus;
import org.xhy.domain.agent.model.AgentVersionDTO;
import org.xhy.interfaces.api.common.Result;
import org.xhy.interfaces.dto.agent.*;

import java.util.List;

/**
 * Agent管理API控制器
 */
@RestController
@RequestMapping("/agent")
public class AgentController {

    private final AgentAppService agentAppService;

    public AgentController(AgentAppService agentAppService) {
        this.agentAppService = agentAppService;
    }

    /**
     * 创建新Agent
     */
    @PostMapping
    public Result<AgentDTO> createAgent(@RequestBody CreateAgentRequest request) {
        AgentDTO agent = agentAppService.createAgent(request);
        return Result.success(agent);
    }

    /**
     * 获取Agent详情
     */
    @GetMapping("/{agentId}")
    public Result<AgentDTO> getAgent(@PathVariable String agentId) {
        return Result.success(agentAppService.getAgent(agentId));
    }

    /**
     * 获取用户的Agent列表
     */
    @GetMapping("/user/{userId}")
    public Result<List<AgentDTO>> getUserAgents(@PathVariable String userId,
                                              @RequestParam(required = false) Integer statusCode) {
        if (statusCode != null) {
            AgentStatus status = AgentStatus.fromCode(statusCode);
            return Result.success(agentAppService.getUserAgentsByStatus(userId, status));
        } else {
            return Result.success(agentAppService.getUserAgents(userId));
        }
    }

    /**
     * 获取已上架的Agent列表
     */
    @GetMapping("/published")
    public Result<List<AgentDTO>> getPublishedAgents() {
        return Result.success(agentAppService.getPublishedAgents());
    }

    /**
     * 获取待审核的Agent列表
     */
    @GetMapping("/pending")
    public Result<List<AgentDTO>> getPendingReviewAgents() {
        return Result.success(agentAppService.getPendingReviewAgents());
    }

    /**
     * 更新Agent信息（基本信息和配置合并更新）
     */
    @PutMapping("/{agentId}")
    public Result<AgentDTO> updateAgent(@PathVariable String agentId,
                                      @RequestBody UpdateAgentRequest request) {
        return Result.success(agentAppService.updateAgent(agentId, request));
    }

    /**
     * 删除Agent
     */
    @DeleteMapping("/{agentId}")
    public Result<Void> deleteAgent(@PathVariable String agentId) {
        agentAppService.deleteAgent(agentId);
        return Result.success(null);
    }

    /**
     * 搜索Agent
     */
    @PostMapping("/search")
    public Result<List<AgentDTO>> searchAgents(@RequestBody SearchAgentsRequest request) {
        return Result.success(agentAppService.searchAgents(request.getUserId(), request.getKeyword()));
    }

    /**
     * 发布Agent版本
     */
    @PostMapping("/{agentId}/publish")
    public Result<AgentVersionDTO> publishAgentVersion(@PathVariable String agentId,
                                                    @RequestBody PublishAgentVersionRequest request) {
        return Result.success(agentAppService.publishAgentVersion(agentId, request));
    }
    
    /**
     * 获取Agent的所有版本
     */
    @GetMapping("/{agentId}/versions")
    public Result<List<AgentVersionDTO>> getAgentVersions(@PathVariable String agentId) {
        return Result.success(agentAppService.getAgentVersions(agentId));
    }
    
    /**
     * 获取Agent的特定版本
     */
    @GetMapping("/{agentId}/versions/{versionNumber}")
    public Result<AgentVersionDTO> getAgentVersion(@PathVariable String agentId,
                                                @PathVariable String versionNumber) {
        return Result.success(agentAppService.getAgentVersion(agentId, versionNumber));
    }
    
    /**
     * 获取Agent的最新版本
     */
    @GetMapping("/{agentId}/versions/latest")
    public Result<AgentVersionDTO> getLatestAgentVersion(@PathVariable String agentId) {
        return Result.success(agentAppService.getLatestAgentVersion(agentId));
    }
} 