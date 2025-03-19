import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// 创建一个简单的防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

export const useChatStore = defineStore('chat', () => {
  // 消息历史
  const messages = ref([])
  // 加载状态
  const loading = ref(false)
  // 当前的SSE事件源
  let eventSource = null
  // 重连尝试次数
  let reconnectAttempts = 0
  // 最大重连尝试次数
  const MAX_RECONNECT_ATTEMPTS = 3
  // 重连延迟（毫秒）
  const RECONNECT_DELAY = 1000
  // 累积的内容
  let accumulatedContent = ''
  // 批量更新计时器
  let batchUpdateTimer = null
  // 批量更新延迟
  const BATCH_UPDATE_DELAY = 50
  
  // 发送消息
  const sendMessage = async (messageText, provider = 'siliconflow', model = '') => {
    // 添加用户消息
    const userMessage = {
      role: 'user',
      content: messageText,
      time: new Date().toLocaleTimeString()
    }
    messages.value.push(userMessage)
    
    // 设置加载状态
    loading.value = true
    
    try {
      // 准备请求数据
      const requestData = {
        message: messageText,
        provider: provider
      }
      
      // 如果指定了模型，添加到请求
      if (model) {
        requestData.model = model
      }
      
      // 发送请求到后端
      const response = await axios.post('/api/conversation/chat', requestData)
      
      // 处理响应
      if (response.data && response.data.code === 200) {
        // 添加AI回复
        const assistantMessage = {
          role: 'assistant',
          content: response.data.data.content,
          time: new Date().toLocaleTimeString(),
          provider: response.data.data.provider,
          model: response.data.data.model
        }
        messages.value.push(assistantMessage)
        return assistantMessage
      } else {
        // 处理错误响应
        const errorMessage = {
          role: 'system',
          content: '请求出错: ' + (response.data.message || '未知错误'),
          time: new Date().toLocaleTimeString()
        }
        messages.value.push(errorMessage)
        return errorMessage
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      // 添加错误消息
      const errorMessage = {
        role: 'system',
        content: '发送消息失败: ' + (error.message || '未知错误'),
        time: new Date().toLocaleTimeString()
      }
      messages.value.push(errorMessage)
      return errorMessage
    } finally {
      loading.value = false
    }
  }
  
  // 应用批量更新
  const applyBatchUpdate = (assistantMessage) => {
    if (accumulatedContent) {
      console.log('应用批量更新:', accumulatedContent.length, '个字符')
      assistantMessage.content += accumulatedContent
      accumulatedContent = ''
      
      // 强制更新引用，确保Vue检测到变化
      messages.value = [...messages.value]
    }
  }
  
  // 批量更新消息内容的防抖版本
  const debouncedUpdate = debounce((assistantMessage) => {
    applyBatchUpdate(assistantMessage)
  }, BATCH_UPDATE_DELAY)
  
  // 清除所有计时器和批处理
  const clearBatchUpdates = () => {
    if (batchUpdateTimer) {
      clearTimeout(batchUpdateTimer)
      batchUpdateTimer = null
    }
    accumulatedContent = ''
  }
  
  // 关闭当前SSE连接
  const closeEventSource = () => {
    if (eventSource) {
      console.log('关闭现有SSE连接')
      eventSource.close()
      eventSource = null
      reconnectAttempts = 0
      clearBatchUpdates()
    }
  }
  
  // 处理SSE连接错误与重连
  const handleSSEError = (assistantMessage, resolve) => {
    console.error(`SSE连接错误 (尝试 ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`)
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++
      
      // 如果还没有内容，显示正在重连提示
      if (!assistantMessage.content) {
        assistantMessage.content = `正在重新连接 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
      }
      
      // 关闭现有连接
      closeEventSource()
      
    } else {
      // 超过最大重试次数
      loading.value = false
      
      if (!assistantMessage.content) {
        assistantMessage.content = '连接失败，请重试'
      } else {
        assistantMessage.content += '\n\n[连接中断，请刷新页面或重试]'
      }
      
      closeEventSource()
      resolve(assistantMessage)
    }
  }
  
  // 发送流式消息 (SSE)
  const sendStreamMessage = (messageText, provider = 'siliconflow', model = '') => {
    return new Promise((resolve) => {
      // 添加用户消息
      const userMessage = {
        role: 'user',
        content: messageText,
        time: new Date().toLocaleTimeString()
      }
      messages.value.push(userMessage)
      
      // 设置加载状态
      loading.value = true
      
      // 重置重连计数
      reconnectAttempts = 0
      
      // 清空累积内容
      accumulatedContent = ''
      
      // 准备AI助手回复消息
      const assistantMessage = {
        role: 'assistant',
        content: '',
        time: new Date().toLocaleTimeString(),
        provider: provider,
        model: model
      }
      messages.value.push(assistantMessage)
      
      // 创建SSE连接函数
      const createSSEConnection = () => {
        try {
          // 关闭已有的EventSource连接
          closeEventSource()
          
          // 准备查询参数
          const params = new URLSearchParams({
            message: messageText,
            provider: provider,
            stream: true
          })
          
          if (model) {
            params.append('model', model)
          }
          
          // 使用标准EventSource API连接SSE端点
          const sourceUrl = `/api/conversation/chat/stream?${params.toString()}`
          console.log('连接SSE端点:', sourceUrl)
          
          eventSource = new EventSource(sourceUrl)
          
          // SSE连接成功
          eventSource.onopen = (event) => {
            console.log('SSE连接已建立')
            // 如果是重连且有"正在重连"提示，则清除
            if (assistantMessage.content.includes('正在重新连接')) {
              assistantMessage.content = ''
            }
          }
          
          // 接收消息事件
          eventSource.onmessage = (event) => {
            try {
              if (!event.data || event.data === '[DONE]') {
                console.log('收到流结束标记')
                // 应用最后的批量更新
                applyBatchUpdate(assistantMessage)
                loading.value = false
                closeEventSource()
                resolve(assistantMessage)
                return
              }
              
              console.log('收到消息:', event.data)
              const data = JSON.parse(event.data)
              
              // 追加内容
              if (data.content !== undefined && data.content !== '') {
                console.log('收到内容片段:', data.content)
                
                // 将内容添加到累积缓冲区
                accumulatedContent += data.content
                
                // 使用防抖函数延迟更新
                debouncedUpdate(assistantMessage)
                
                // 如果累积了足够多的内容或收到了句号、换行等，立即更新
                if (accumulatedContent.length > 10 || 
                    accumulatedContent.includes('。') || 
                    accumulatedContent.includes('\n')) {
                  console.log('内容达到更新条件，立即更新')
                  applyBatchUpdate(assistantMessage)
                }
              }
              
              // 更新其他元数据
              if (data.provider) assistantMessage.provider = data.provider
              if (data.model) assistantMessage.model = data.model
              
              // 检查是否完成
              if (data.done === true) {
                console.log('收到完成标志')
                // 应用最后的批量更新
                applyBatchUpdate(assistantMessage)
                loading.value = false
                closeEventSource()
                resolve(assistantMessage)
              }
              
              // 重置重连尝试次数（因为成功接收了数据）
              reconnectAttempts = 0
            } catch (error) {
              console.error('处理SSE消息出错:', error, event.data)
            }
          }
          
          // 错误处理
          eventSource.onerror = (error) => {
            handleSSEError(assistantMessage, resolve)
          }
        } catch (error) {
          console.error('创建SSE连接失败:', error)
          loading.value = false
          assistantMessage.content = `请求失败: ${error.message}`
          resolve(assistantMessage)
        }
      }
      
      // 建立初始连接
      createSSEConnection()
    })
  }
  
  // 清空历史消息
  const clearMessages = () => {
    messages.value = []
    // 关闭现有的EventSource
    closeEventSource()
  }
  
  return { 
    messages, 
    loading, 
    sendMessage,
    sendStreamMessage,
    clearMessages
  }
}) 