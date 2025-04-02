package org.xhy.domain.plugins.model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.Map;

/**
 * 插件配置
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "configType")
@JsonSubTypes({
    @JsonSubTypes.Type(value = SsePluginConfig.class, name = "SSE"),
    @JsonSubTypes.Type(value = StdioPluginConfig.class, name = "STDIO")
})
public abstract class PluginConfig {
    
    /**
     * 验证配置是否有效
     * @return true 如果配置有效
     */
    public abstract boolean validate();
}

/**
 * SSE插件配置
 */
class SsePluginConfig extends PluginConfig {
    private String url;
    
    public SsePluginConfig(String url) {
        this.url = url;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    @Override
    public boolean validate() {
        return url != null && !url.trim().isEmpty();
    }
}

/**
 * STDIO插件配置
 */
class StdioPluginConfig extends PluginConfig {
    private String command;
    private String[] args;
    private Map<String, String> env;
    
    public StdioPluginConfig(String command, String[] args, Map<String, String> env) {
        this.command = command;
        this.args = args;
        this.env = env;
    }
    
    public String getCommand() {
        return command;
    }
    
    public void setCommand(String command) {
        this.command = command;
    }
    
    public String[] getArgs() {
        return args;
    }
    
    public void setArgs(String[] args) {
        this.args = args;
    }
    
    public Map<String, String> getEnv() {
        return env;
    }
    
    public void setEnv(Map<String, String> env) {
        this.env = env;
    }
    
    @Override
    public boolean validate() {
        return command != null && !command.trim().isEmpty();
    }
}
