package org.xhy.interfaces.dto.conversation;

/**
 * 创建会话的请求对象
 */
public class CreateSessionRequest {
    
    private String title;
    private String description;
    
    // 构造方法
    public CreateSessionRequest() {
    }
    
    public CreateSessionRequest(String title, String userId, String description) {
        this.title = title;
        this.description = description;
    }
    
    // Getter和Setter
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
} 