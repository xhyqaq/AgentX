package org.xhy.interfaces.api.conversation;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.xhy.application.conversation.dto.StreamChatResponse;
import org.xhy.domain.conversation.model.MessageDTO;

/**
 * 用于测试不同接口的响应格式
 */
@Component
public class ResponseFormatTest implements CommandLineRunner {

    private final ObjectMapper objectMapper;

    public ResponseFormatTest(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("===== 响应格式测试 =====");

        // 演示 /chat/stream 接口的响应格式
        System.out.println("1. /chat/stream 响应格式：");
        StreamChatResponse streamResponse = new StreamChatResponse("帮助", false);
        streamResponse.setSessionId("");
        streamResponse.setProvider("SiliconFlow");
        streamResponse.setModel("Qwen/Qwen2.5-VL-72B-Instruct");
        streamResponse.setTimestamp(1742476259836L);
        System.out.println(objectMapper.writeValueAsString(streamResponse));

        // 演示结束消息
        StreamChatResponse doneResponse = new StreamChatResponse("", true);
        doneResponse.setSessionId("");
        doneResponse.setProvider("SiliconFlow");
        doneResponse.setModel("Qwen/Qwen2.5-VL-72B-Instruct");
        doneResponse.setTimestamp(1742476259971L);
        System.out.println(objectMapper.writeValueAsString(doneResponse));

        System.out.println("\n修改后的 /chat/{sessionId} 接口将输出相同格式的响应");
    }
}