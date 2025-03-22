package org.xhy.interfaces.dto.agent;

/**
 * 搜索Agent的请求对象
 */
public class SearchAgentsRequest {
    
    private String userId;
    private String keyword;
    
    // 构造方法
    public SearchAgentsRequest() {
    }
    
    public SearchAgentsRequest(String userId, String keyword) {
        this.userId = userId;
        this.keyword = keyword;
    }
    
    // Getter和Setter
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getKeyword() {
        return keyword;
    }
    
    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
} 