<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useChatStore } from '@/stores/chat'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 获取聊天状态
const chatStore = useChatStore()
// 输入消息
const inputMessage = ref('')
// 消息容器ref
const messagesContainer = ref(null)
// 是否使用流式响应
const useStream = ref(true)

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return
  
  const message = inputMessage.value
  inputMessage.value = ''
  
  if (useStream.value) {
    // 使用流式响应
    await chatStore.sendStreamMessage(message)
  } else {
    // 使用普通响应
    await chatStore.sendMessage(message)
  }
  
  // 滚动到底部
  scrollToBottom()
}

// 处理按键事件
const handleKeyDown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 监视聊天内容变化，自动滚动
const watchChatContent = () => {
  if (chatStore.messages.length > 0) {
    const lastMessage = chatStore.messages[chatStore.messages.length - 1]
    // 使用Vue的watch API监视内容变化
    watch(() => lastMessage.content, (newContent, oldContent) => {
      console.log('内容更新:', oldContent, '->', newContent)
      scrollToBottom()
    }, { flush: 'post' }) // 使用post确保DOM更新后再滚动
  }
}

// 滚动到底部
const scrollToBottom = () => {
  console.log('滚动到底部')
  // 使用nextTick确保DOM已更新
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 切换流式响应
const toggleStreamMode = () => {
  useStream.value = !useStream.value
  localStorage.setItem('useStream', useStream.value.toString())
}

// 组件挂载时执行
onMounted(() => {
  console.log('组件挂载，初始化流式设置')
  // 恢复上次的流式设置
  const savedStreamMode = localStorage.getItem('useStream')
  if (savedStreamMode !== null) {
    useStream.value = savedStreamMode === 'true'
  }
  
  console.log('流式响应模式:', useStream.value ? '开启' : '关闭')
  
  // 初始化滚动和监听
  nextTick(() => {
    scrollToBottom()
    watchChatContent()
  })
})

// 格式化消息内容，支持Markdown和代码块
const formatMessage = (content) => {
  if (!content) return ''
  
  try {
    // 简单的HTML转义作为备选方案
    if (chatStore.loading && content.length < 100) {
      console.log('使用简单格式化短消息:', content)
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
    }
    
    console.log('使用Marked解析内容')
    // 配置marked选项
    marked.setOptions({
      breaks: true,         // 支持换行
      gfm: true,            // 支持GitHub风格的Markdown
      headerIds: false,     // 避免自动添加header ID
      mangle: false         // 不混淆链接
    })
    
    // 使用marked解析Markdown
    const html = marked(content)
    
    // 使用DOMPurify清理HTML以防止XSS攻击
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ADD_ATTR: ['target'], // 允许target属性用于链接
      FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'script'] // 禁止这些标签
    })
    
    return sanitizedHtml
  } catch (error) {
    console.error('解析Markdown出错:', error)
    
    // 如果解析失败，使用简单的HTML转义和换行处理作为回退
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  }
}

// 监听消息列表长度变化，自动滚动到底部和设置监听
watch(() => chatStore.messages.length, (newLength) => {
  scrollToBottom()
  if (newLength > 0) {
    watchChatContent()
  }
})
</script>

<template>
  <main class="chat-main">
    <div class="chat-container">
      <div class="chat-header">
        <h1>AgentX 智能助手</h1>
        <div class="stream-toggle">
          <label class="toggle-label">
            <span>流式响应</span>
            <input 
              type="checkbox" 
              v-model="useStream" 
              @change="toggleStreamMode"
              class="toggle-checkbox"
            />
            <span class="toggle-switch"></span>
          </label>
        </div>
      </div>
      
      <div class="messages-container" ref="messagesContainer">
        <div v-if="chatStore.messages.length === 0" class="empty-chat">
          <p>开始与AI助手对话吧</p>
        </div>
        <div v-else class="messages">
          <div 
            v-for="(message, index) in chatStore.messages" 
            :key="index" 
            :class="['message', message.role, message.role === 'assistant' && chatStore.loading && index === chatStore.messages.length - 1 ? 'streaming' : '']"
          >
            <div class="message-content" :class="{'message-content-updated': message.role === 'assistant' && message.content}">
              <template v-if="message.role === 'assistant' && chatStore.loading && index === chatStore.messages.length - 1">
                <span>{{ message.content }}</span>
                <span class="typing-cursor"></span>
              </template>
              <span v-else v-html="formatMessage(message.content)"></span>
            </div>
            <div class="message-meta">
              <span class="time">{{ message.time }}</span>
              <span v-if="message.provider" class="provider">{{ message.provider }}</span>
              <span v-if="message.model" class="model">{{ message.model }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="input-container">
        <InputText 
          v-model="inputMessage" 
          placeholder="输入消息..." 
          class="message-input"
          @keydown="handleKeyDown"
        />
        <Button 
          :disabled="chatStore.loading || !inputMessage.trim()" 
          icon="pi pi-send" 
          class="send-button p-button-rounded" 
          @click="sendMessage"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.chat-main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  height: 100vh;
  background-color: var(--color-bg);
  position: relative;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.chat-container {
  width: 100%;
  max-width: 500px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 0 auto;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header h1 {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin: 0;
}

.stream-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  background-color: #ccc;
  border-radius: 20px;
  transition: all 0.3s;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: all 0.3s;
}

.toggle-checkbox:checked + .toggle-switch {
  background-color: var(--color-primary);
}

.toggle-checkbox:checked + .toggle-switch::after {
  left: 18px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f7f9fc;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-size: 1.1rem;
  text-align: center;
  padding: 0 20px;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 0;
}

.message {
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 85%;
}

.user {
  align-self: flex-end;
  background-color: var(--color-primary);
  color: white;
}

.assistant {
  align-self: flex-start;
  background-color: white;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.system {
  align-self: center;
  background-color: #f8d7da;
  color: #721c24;
  font-size: 0.9rem;
  padding: 8px 12px;
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

/* Markdown样式 */
.message-content ul, 
.message-content ol {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.message-content li {
  margin-bottom: 0.25em;
}

.message-content p {
  margin: 0.5em 0;
}

.message-content h1, 
.message-content h2, 
.message-content h3, 
.message-content h4, 
.message-content h5, 
.message-content h6 {
  margin: 0.8em 0 0.4em 0;
  font-weight: 600;
  line-height: 1.25;
}

.message-content h1 { font-size: 1.5em; }
.message-content h2 { font-size: 1.3em; }
.message-content h3 { font-size: 1.2em; }
.message-content h4 { font-size: 1.1em; }
.message-content h5 { font-size: 1em; }
.message-content h6 { font-size: 0.9em; }

.message-content table {
  border-collapse: collapse;
  margin: 0.5em 0;
  overflow-x: auto;
  display: block;
  width: 100%;
}

.message-content thead {
  background-color: rgba(0, 0, 0, 0.05);
}

.message-content th, 
.message-content td {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 6px 12px;
  text-align: left;
}

.message-content blockquote {
  padding-left: 1em;
  margin: 0.5em 0;
  border-left: 4px solid rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.7);
}

.message-content img {
  max-width: 100%;
  border-radius: 4px;
}

.message-content a {
  color: #0366d6;
  text-decoration: none;
}

.message-content a:hover {
  text-decoration: underline;
}

.message-content code {
  background-color: rgba(0, 0, 0, 0.07);
  border-radius: 3px;
  padding: 2px 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.message-content pre {
  margin: 0.5em 0;
  padding: 0;
  overflow: auto;
  background-color: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #e1e4e8;
}

.message-content pre code {
  display: block;
  padding: 12px;
  overflow-x: auto;
  background-color: transparent;
  white-space: pre;
  line-height: 1.5;
  font-size: 0.9em;
}

/* 用户消息中的Markdown样式 */
.user .message-content blockquote {
  border-left-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.user .message-content code {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.user .message-content pre {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.user .message-content pre code {
  color: white;
}

.user .message-content a {
  color: #79b8ff;
}

.user .message-content th, 
.user .message-content td {
  border-color: rgba(255, 255, 255, 0.2);
}

.user .message-content thead {
  background-color: rgba(255, 255, 255, 0.1);
}

.message-content .code-block {
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f6f8fa;
  border: 1px solid #e1e4e8;
}

.message-meta {
  display: flex;
  font-size: 0.7rem;
  margin-top: 8px;
  opacity: 0.7;
  gap: 8px;
}

.typing-cursor {
  display: inline-block;
  width: 3px;
  height: 15px;
  background-color: currentColor;
  margin-left: 1px;
  animation: blink 0.8s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.input-container {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  background-color: white;
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 10px 16px;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  font-size: 1rem;
}

.send-button {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 适配深色主题的消息 */
.user .message-content code {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.user .message-content .code-block {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.user .message-content .code-header {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.user .message-content pre code {
  color: rgba(255, 255, 255, 0.9);
}

/* 打字动画效果增强 */
.typing-cursor {
  display: inline-block;
  width: 3px;
  height: 15px;
  background-color: currentColor;
  margin-left: 1px;
  animation: blink 0.8s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 流式输出中的消息特殊处理 */
.assistant.streaming .message-content {
  transition: none; /* 禁用过渡效果 */
}

/* 为当前更新的消息添加闪烁效果 */
@keyframes highlight {
  0% { background-color: rgba(0, 100, 255, 0.1); }
  100% { background-color: transparent; }
}

.message-content-updated {
  animation: highlight 1s ease-out;
}
</style>
