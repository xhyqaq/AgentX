package org.xhy.interfaces.api.base;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 健康检查控制器
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    @Value("${spring.application.name}")
    private String applicationName;

    /**
     * 健康检查接口
     * 
     * @return 系统状态信息
     */
    @GetMapping
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("service", applicationName);
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }
}
