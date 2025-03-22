package org.xhy.domain.agent.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.xhy.domain.agent.model.*;
import org.xhy.domain.agent.repository.AgentRepository;
import org.xhy.domain.agent.repository.AgentVersionRepository;
import org.xhy.domain.agent.service.AgentService;
import org.xhy.domain.common.exception.BusinessException;
import org.xhy.domain.common.util.ValidationUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Agent服务实现类
 */
@Service
public class AgentServiceImpl implements AgentService {

    private final AgentRepository agentRepository;
    private final AgentVersionRepository agentVersionRepository;

    public AgentServiceImpl(AgentRepository agentRepository, AgentVersionRepository agentVersionRepository) {
        this.agentRepository = agentRepository;
        this.agentVersionRepository = agentVersionRepository;
    }

    /**
     * 创建新Agent
     */
    @Override
    @Transactional
    public AgentDTO createAgent(AgentEntity agent) {
        // 参数校验
        ValidationUtils.notNull(agent, "agent");
        ValidationUtils.notEmpty(agent.getName(), "name");
        ValidationUtils.notEmpty(agent.getUserId(), "userId");
        
        // 保存到数据库
        agentRepository.insert(agent);
        return agent.toDTO();
    }

    /**
     * 获取单个Agent信息
     */
    @Override
    public AgentDTO getAgent(String agentId) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        
        AgentEntity agent = agentRepository.selectById(agentId);
        if (agent == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }
        return agent.toDTO();
    }

    /**
     * 获取用户的所有Agent
     */
    @Override
    public List<AgentDTO> getUserAgents(String userId) {
        // 参数校验
        ValidationUtils.notEmpty(userId, "userId");
        
        // 使用LambdaQueryWrapper替代原来的findByUserIdOrderByUpdatedAtDesc
        LambdaQueryWrapper<AgentEntity> queryWrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getUserId, userId)
                .orderByDesc(AgentEntity::getUpdatedAt);
        
        List<AgentEntity> agents = agentRepository.selectList(queryWrapper);
        return agents.stream().map(AgentEntity::toDTO).collect(Collectors.toList());
    }

    /**
     * 获取用户特定状态的Agent
     */
    @Override
    public List<AgentDTO> getUserAgentsByStatus(String userId, AgentStatus status) {
        // 参数校验
        ValidationUtils.notEmpty(userId, "userId");
        ValidationUtils.notNull(status, "status");
        
        // 使用LambdaQueryWrapper替代原来的findByUserIdAndStatusOrderByUpdatedAtDesc
        LambdaQueryWrapper<AgentEntity> queryWrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getUserId, userId)
                .eq(AgentEntity::getStatus, status)
                .orderByDesc(AgentEntity::getUpdatedAt);
        
        List<AgentEntity> agents = agentRepository.selectList(queryWrapper);
        return agents.stream().map(AgentEntity::toDTO).collect(Collectors.toList());
    }

    /**
     * 获取已上架的Agent列表
     */
    @Override
    public List<AgentDTO> getPublishedAgents() {
        LambdaQueryWrapper<AgentEntity> queryWrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getStatus, AgentStatus.PUBLISHED)
                .orderByDesc(AgentEntity::getUpdatedAt);
        
        List<AgentEntity> agents = agentRepository.selectList(queryWrapper);
        return agents.stream().map(AgentEntity::toDTO).collect(Collectors.toList());
    }

    /**
     * 获取待审核的Agent列表
     */
    @Override
    public List<AgentDTO> getPendingReviewAgents() {
        LambdaQueryWrapper<AgentEntity> queryWrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getStatus, AgentStatus.PENDING_REVIEW)
                .orderByDesc(AgentEntity::getUpdatedAt);
        
        List<AgentEntity> agents = agentRepository.selectList(queryWrapper);
        return agents.stream().map(AgentEntity::toDTO).collect(Collectors.toList());
    }

    /**
     * 更新Agent信息（基本信息和配置合并更新）
     */
    @Override
    @Transactional
    public AgentDTO updateAgent(String agentId, AgentEntity updateEntity) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notNull(updateEntity, "updateEntity");
        ValidationUtils.notEmpty(updateEntity.getName(), "name");
        
        AgentEntity agent = agentRepository.selectById(agentId);
        if (agent == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }

        // 更新基本信息和配置信息
        agent.setName(updateEntity.getName());
        agent.setDescription(updateEntity.getDescription());
        agent.setAvatar(updateEntity.getAvatar());
        agent.setSystemPrompt(updateEntity.getSystemPrompt());
        agent.setWelcomeMessage(updateEntity.getWelcomeMessage());
        agent.setModelConfig(updateEntity.getModelConfig());
        agent.setTools(updateEntity.getTools());
        agent.setKnowledgeBaseIds(updateEntity.getKnowledgeBaseIds());
        agent.setUpdatedAt(LocalDateTime.now());
        
        agentRepository.updateById(agent);
        return agent.toDTO();
    }

    /**
     * 更新Agent状态
     */
    @Override
    @Transactional
    public AgentDTO updateAgentStatus(String agentId, AgentStatus status) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notNull(status, "status");
        
        AgentEntity agent = agentRepository.selectById(agentId);
        if (agent == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }
        agent.updateStatus(status);
        agentRepository.updateById(agent);
        return agent.toDTO();
    }

    /**
     * 删除Agent
     */
    @Override
    @Transactional
    public void deleteAgent(String agentId) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        
        AgentEntity agent = agentRepository.selectById(agentId);
        if (agent == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }
        agent.delete();
        agentRepository.updateById(agent);
    }

    /**
     * 搜索Agent
     */
    @Override
    public List<AgentDTO> searchAgents(String userId, String keyword) {
        // 参数校验
        ValidationUtils.notEmpty(userId, "userId");
        ValidationUtils.notNull(keyword, "keyword");
        
        // 使用LambdaQueryWrapper替代原来的findByUserIdAndNameContainingOrderByUpdatedAtDesc
        LambdaQueryWrapper<AgentEntity> queryWrapper = Wrappers.<AgentEntity>lambdaQuery()
                .eq(AgentEntity::getUserId, userId)
                .like(AgentEntity::getName, keyword)
                
                .orderByDesc(AgentEntity::getUpdatedAt);
        
        List<AgentEntity> agents = agentRepository.selectList(queryWrapper);
        return agents.stream().map(AgentEntity::toDTO).collect(Collectors.toList());
    }

    /**
     * 发布Agent版本
     */
    @Override
    @Transactional
    public AgentVersionDTO publishAgentVersion(String agentId, AgentVersionEntity versionEntity) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notNull(versionEntity, "versionEntity");
        ValidationUtils.notEmpty(versionEntity.getVersionNumber(), "versionNumber");
        
        AgentEntity agent = agentRepository.selectById(agentId);
        if (agent == null) {
            throw new BusinessException("Agent不存在: " + agentId);
        }
        
        // 查询最新版本号进行比较
        LambdaQueryWrapper<AgentVersionEntity> latestVersionQuery = Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId)
                .orderByDesc(AgentVersionEntity::getPublishedAt)
                .last("LIMIT 1");
        
        AgentVersionEntity latestVersion = agentVersionRepository.selectOne(latestVersionQuery);
        
        if (latestVersion != null) {
            // 版本号比较
            String newVersion = versionEntity.getVersionNumber();
            String oldVersion = latestVersion.getVersionNumber();
            
            // 检查是否为相同版本号
            if (newVersion.equals(oldVersion)) {
                throw new BusinessException("版本号已存在: " + newVersion);
            }
            
            // 检查新版本号是否大于旧版本号
            if (!isVersionGreaterThan(newVersion, oldVersion)) {
                throw new BusinessException("新版本号(" + newVersion + ")必须大于当前最新版本号(" + oldVersion + ")");
            }
        }
        
        // 设置版本关联的Agent ID
        versionEntity.setAgentId(agentId);
        
        // 保存版本
        agentVersionRepository.insert(versionEntity);
        
        // 更新Agent的已发布版本
        agent.publishVersion(versionEntity.getId());
        agent.updateStatus(AgentStatus.PENDING_REVIEW); // 设置为待审核状态
        agentRepository.updateById(agent);
        
        return versionEntity.toDTO();
    }
    
    /**
     * 比较版本号大小
     * @param newVersion 新版本号
     * @param oldVersion 旧版本号
     * @return 如果新版本大于旧版本返回true，否则返回false
     */
    private boolean isVersionGreaterThan(String newVersion, String oldVersion) {
        if (oldVersion == null || oldVersion.trim().isEmpty()) {
            return true; // 如果没有旧版本，新版本肯定更大
        }
        
        // 分割版本号
        String[] current = newVersion.split("\\.");
        String[] last = oldVersion.split("\\.");
        
        // 确保版本号格式正确
        if (current.length != 3 || last.length != 3) {
            throw new BusinessException("版本号必须遵循 x.y.z 格式");
        }
        
        try {
            // 比较主版本号
            int currentMajor = Integer.parseInt(current[0]);
            int lastMajor = Integer.parseInt(last[0]);
            if (currentMajor > lastMajor) return true;
            if (currentMajor < lastMajor) return false;
            
            // 主版本号相同，比较次版本号
            int currentMinor = Integer.parseInt(current[1]);
            int lastMinor = Integer.parseInt(last[1]);
            if (currentMinor > lastMinor) return true;
            if (currentMinor < lastMinor) return false;
            
            // 主版本号和次版本号都相同，比较修订版本号
            int currentPatch = Integer.parseInt(current[2]);
            int lastPatch = Integer.parseInt(last[2]);
            
            return currentPatch > lastPatch;
        } catch (NumberFormatException e) {
            throw new BusinessException("版本号格式错误，必须是数字: " + e.getMessage());
        }
    }
    
    /**
     * 获取Agent的所有版本
     */
    @Override
    public List<AgentVersionDTO> getAgentVersions(String agentId) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        
        LambdaQueryWrapper<AgentVersionEntity> queryWrapper = Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId)
                .orderByDesc(AgentVersionEntity::getPublishedAt);
        
        List<AgentVersionEntity> versions = agentVersionRepository.selectList(queryWrapper);
        return versions.stream().map(AgentVersionEntity::toDTO).collect(Collectors.toList());
    }
    
    /**
     * 获取Agent的特定版本
     */
    @Override
    public AgentVersionDTO getAgentVersion(String agentId, String versionNumber) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        ValidationUtils.notEmpty(versionNumber, "versionNumber");
        
        LambdaQueryWrapper<AgentVersionEntity> queryWrapper = Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId)
                .eq(AgentVersionEntity::getVersionNumber, versionNumber);
        
        AgentVersionEntity version = agentVersionRepository.selectOne(queryWrapper);
        if (version == null) {
            throw new BusinessException("版本不存在: " + versionNumber);
        }
        
        return version.toDTO();
    }
    
    /**
     * 获取Agent的最新版本
     */
    @Override
    public AgentVersionDTO getLatestAgentVersion(String agentId) {
        // 参数校验
        ValidationUtils.notEmpty(agentId, "agentId");
        
        LambdaQueryWrapper<AgentVersionEntity> queryWrapper = Wrappers.<AgentVersionEntity>lambdaQuery()
                .eq(AgentVersionEntity::getAgentId, agentId)
                .orderByDesc(AgentVersionEntity::getPublishedAt)
                .last("LIMIT 1");
        
        AgentVersionEntity version = agentVersionRepository.selectOne(queryWrapper);
        if (version == null) {
            return null; // 第一次发布时没有版本，返回null而不是抛出异常
        }
        
        return version.toDTO();
    }
}