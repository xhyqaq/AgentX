package org.xhy.domain.plugins.constant;

/**
 * 插件类型
 */
public enum PluginType {
    SSE(1, "SSE"),
    STDIO(2, "STDIO");

    private final int code;
    private final String description;

    PluginType(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static PluginType fromCode(int code) {
        for (PluginType type : PluginType.values()) {
            if (type.getCode() == code) {
                return type;
            }
        }
        return null;
    }
}
