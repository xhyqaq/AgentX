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
  // 打字机效果相关变量
  let fullContent = ''  // 完整的消息内容
  let typewriterTimer = null
  const TYPEWRITER_SPEED = 15  // 打字速度（毫秒/字）
  // 消息超时定时器
  let messageTimeoutTimer = null
  // 超时时间（增加到3分钟）
  const MESSAGE_TIMEOUT = 180000
  
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
  
  // 应用打字机效果
  const applyTypewriterEffect = (assistantMessage) => {
    // 清除现有计时器
    if (typewriterTimer) {
      clearInterval(typewriterTimer)
    }
    
    // 获取完整内容
    const targetContent = fullContent
    
    // 如果没有内容，直接返回
    if (!targetContent) return
    
    // 当前显示的字符数
    let displayedChars = assistantMessage.content.length
    
    // 创建定时器，逐字显示内容
    typewriterTimer = setInterval(() => {
      // 如果已经显示完全部内容，停止定时器
      if (displayedChars >= targetContent.length) {
        clearInterval(typewriterTimer)
        typewriterTimer = null
        return
      }
      
      // 计算本次要显示的字符数量，一次显示1-3个字符以平衡速度和流畅性
      // 通过随机数量可以让打字效果看起来更自然
      const charsToAdd = Math.min(
        targetContent.length - displayedChars,
        Math.floor(Math.random() * 2) + 1
      )
      
      // 添加字符
      displayedChars += charsToAdd
      
      // 更新消息内容
      assistantMessage.content = targetContent.substring(0, displayedChars)
      
      // 强制更新引用，确保Vue检测到变化
      messages.value = [...messages.value]
    }, TYPEWRITER_SPEED)
  }
  
  // 应用批量更新
  const applyBatchUpdate = (assistantMessage) => {
    if (accumulatedContent) {
      console.log('应用批量更新:', accumulatedContent.length, '个字符')
      
      // 更新完整内容
      fullContent += accumulatedContent
      
      // 直接更新消息内容，不使用打字机效果
      assistantMessage.content = fullContent
      
      // 清空累积缓冲区
      accumulatedContent = ''
      
      // 强制更新引用，确保Vue检测到变化
      messages.value = [...messages.value]
    }
  }
  
  // 清除所有计时器和批处理
  const clearBatchUpdates = () => {
    accumulatedContent = ''
    if (typewriterTimer) {
      clearInterval(typewriterTimer)
      typewriterTimer = null
    }
    fullContent = ''
  }
  
  // 关闭当前SSE连接
  const closeEventSource = () => {
    if (eventSource) {
      console.log('关闭现有SSE连接')
      eventSource.close()
      eventSource = null
      reconnectAttempts = 0
      clearBatchUpdates()
      
      // 清除消息超时定时器
      clearAllTimers()
    }
  }
  
  // 清除所有定时器
  const clearAllTimers = () => {
    if (messageTimeoutTimer) {
      clearTimeout(messageTimeoutTimer)
      messageTimeoutTimer = null
    }
    
    if (typewriterTimer) {
      clearInterval(typewriterTimer)
      typewriterTimer = null
    }
  }
  
  // 发送流式消息 (SSE)
  const sendStreamMessage = (messageText, provider = 'siliconflow', model = '') => {
    return new Promise((resolve) => {
      // 首先关闭可能存在的之前的连接
      closeEventSource()
      
      // 清除所有定时器
      clearAllTimers()
      
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
      
      // 清空累积内容和完整内容
      accumulatedContent = ''
      fullContent = ''
      
      // 准备AI助手回复消息
      const assistantMessage = {
        role: 'assistant',
        content: '',
        time: new Date().toLocaleTimeString(),
        provider: provider,
        model: model
      }
      messages.value.push(assistantMessage)
      
      // 集中处理流式传输结束的逻辑
      const finishStreaming = (assistantMessage, resolve, isTimeout = false, isError = false) => {
        // 如果已经完成，不重复处理
        if (!loading.value) {
          return
        }
        
        console.log(`流式传输${isTimeout ? '超时' : (isError ? '错误' : '正常')}结束`)
        
        // 应用最后的批量更新
        if (accumulatedContent) {
          // 直接应用，不通过applyBatchUpdate以确保一定会显示
          fullContent += accumulatedContent
          accumulatedContent = ''
        }
        
        // 确保显示完整内容
        if (fullContent) {
          assistantMessage.content = fullContent
        } else if (isTimeout) {
          assistantMessage.content = '响应超时，请重试'
        } else if (isError) {
          assistantMessage.content = '连接出错，请重试'
        }
        
        // 强制更新Vue引用
        messages.value = [...messages.value]
        
        // 修改状态
        loading.value = false
        
        // 关闭连接
        closeEventSource()
        
        // 完成Promise
        resolve(assistantMessage)
      }
      
      // 设置消息超时处理
      messageTimeoutTimer = setTimeout(() => {
        if (loading.value) {
          console.log('消息接收超时，自动关闭连接')
          finishStreaming(assistantMessage, resolve, true)
        }
      }, MESSAGE_TIMEOUT)
      
      // 处理SSE连接错误与重连 - 本次会话专用的错误处理
      const handleSSEErrorLocal = (error) => {
        console.error(`SSE连接错误 (尝试 ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`, error)
        
        // 如果已经有内容，不再尝试重连，直接显示已接收的内容
        if (fullContent.length > 0) {
          console.log('已有内容，放弃重连，显示现有内容')
          finishStreaming(assistantMessage, resolve, false, true)
          return
        }
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++
          
          // 如果还没有内容，显示正在重连提示
          if (!assistantMessage.content) {
            assistantMessage.content = `正在重新连接 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
            fullContent = assistantMessage.content
          }
          
          // 关闭现有连接并重新创建连接
          if (eventSource) {
            eventSource.close()
            eventSource = null
          }
          
          // 重新创建连接
          setTimeout(createSSEConnection, RECONNECT_DELAY)
          
        } else {
          // 超过最大重试次数
          const errorMessage = '连接失败，请重试'
          
          if (!assistantMessage.content) {
            assistantMessage.content = errorMessage
            fullContent = errorMessage
          } else {
            const errorText = '\n\n[连接中断，请刷新页面或重试]'
            fullContent += errorText
            assistantMessage.content += errorText
          }
          
          finishStreaming(assistantMessage, resolve, false, true)
        }
      }
      
      // 创建SSE连接函数
      const createSSEConnection = () => {
        try {
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
              fullContent = ''
            }
          }
          
          // 接收消息事件
          eventSource.onmessage = (event) => {
            try {
              console.log('收到消息数据:', event.data)
              
              // 处理结束信号或空数据
              if (!event.data || event.data === '[DONE]' || event.data.trim() === '') {
                console.log('收到流结束标记或空数据')
                finishStreaming(assistantMessage, resolve, false)
                return
              }
              
              // 尝试解析JSON
              let data
              try {
                data = JSON.parse(event.data)
              } catch (jsonError) {
                console.error('解析JSON失败:', jsonError, '原始数据:', event.data)
                // 如果不是JSON，当作纯文本内容处理
                data = { content: event.data }
              }
              
              // 追加内容
              if (data.content !== undefined && data.content !== '') {
                console.log('收到内容片段:', data.content)
                
                // 将内容添加到累积缓冲区
                accumulatedContent += data.content
                
                // 立即应用每个内容块，提高响应速度
                applyBatchUpdate(assistantMessage)
              }
              
              // 更新其他元数据
              if (data.provider) assistantMessage.provider = data.provider
              if (data.model) assistantMessage.model = data.model
              
              // 只检查明确的done===true信号，不再基于标点推测消息结束
              if (data.done === true) {
                console.log('收到完成标志，done = true')
                
                // 对于明确的done:true信号，立即结束
                finishStreaming(assistantMessage, resolve, false)
              }
              
              // 重置重连尝试次数（因为成功接收了数据）
              reconnectAttempts = 0
              
              // 每次收到消息时重置全局超时计时器
              if (messageTimeoutTimer) {
                clearTimeout(messageTimeoutTimer)
              }
              
              messageTimeoutTimer = setTimeout(() => {
                if (loading.value) {
                  console.log('长时间没有新消息，自动关闭连接')
                  finishStreaming(assistantMessage, resolve, true)
                }
              }, MESSAGE_TIMEOUT)
            } catch (error) {
              console.error('处理SSE消息出错:', error, '原始数据:', event.data)
            }
          }
          
          // 错误处理
          eventSource.onerror = (error) => {
            handleSSEErrorLocal(error)
          }
        } catch (error) {
          console.error('创建SSE连接失败:', error)
          assistantMessage.content = `请求失败: ${error.message}`
          fullContent = assistantMessage.content
          finishStreaming(assistantMessage, resolve, false, true)
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