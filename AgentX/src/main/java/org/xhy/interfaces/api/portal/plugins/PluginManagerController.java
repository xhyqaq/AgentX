package org.xhy.interfaces.api.portal.plugins;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.xhy.application.plugins.dto.PluginDTO;
import org.xhy.application.plugins.dto.PluginSubmissionCommand;
import org.xhy.application.plugins.service.PluginManagerAppService;
import org.xhy.interfaces.dto.plugins.GetListReq;

import jakarta.validation.Valid;

/**
 * 插件管理控制器
 * 用户管理插件
 */
@RestController
@RequestMapping("/api/manager/plugins")
public class PluginManagerController {
    private final PluginManagerAppService pluginManagerAppService;

    public PluginManagerController(PluginManagerAppService pluginManagerAppService) {
        this.pluginManagerAppService = pluginManagerAppService;
    }

    /**
     * 提交插件申请
     */
    @PostMapping
    public PluginDTO submitPlugin(@RequestBody @Valid PluginSubmissionCommand command) {
        return pluginManagerAppService.submitPlugin(command);
    }

    /**
     * 更新插件
     */
    @PutMapping("/{id}")
    public PluginDTO updatePlugin(@PathVariable("id") String id, @RequestBody @Valid PluginSubmissionCommand command) {
        return pluginManagerAppService.updatePlugin(id, command);
    }

    /**
     * 获取插件列表
     */
    @GetMapping
    public List<PluginDTO> listPlugins(@ModelAttribute @Valid GetListReq req) {
        return pluginManagerAppService.listPlugins(req.getName(), req.getStatus(), req.getPage(), req.getSize());
    }

    /**
     * 获取插件详情
     */
    @GetMapping("/{id}")
    public PluginDTO getPluginDetail(@PathVariable("id") String id) {
        return pluginManagerAppService.getPluginDetail(id);
    }
}
