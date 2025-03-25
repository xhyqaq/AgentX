import { API_CONFIG, API_ENDPOINTS } from "./api-config"
import type { ApiResponse } from "@/types/agent"
import { withToast } from "./toast-utils"

// 消息类型定义
export interface MessageDTO {
  id: string
  sessionId: string
  role: string
  content: string
  createdAt?: string
  updatedAt?: string
}

// 获取会话消息列表
export async function getSessionMessages(sessionId: string): Promise<ApiResponse<MessageDTO[]>> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.SESSION_MESSAGES(sessionId)}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching session messages:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "获取会话消息失败",
      data: [] as MessageDTO[],
      timestamp: Date.now(),
    }
  }
}

export async function createSession(title: string, userId: string, description?: string): Promise<ApiResponse<any>> {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("title", title)
    queryParams.append("userId", userId)
    if (description) {
      queryParams.append("description", description)
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.SESSION}?${queryParams.toString()}`, {
      method: "POST",
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating session:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "创建会话失败",
      data: null,
      timestamp: Date.now(),
    }
  }
}

export async function updateSession(id: string, title: string, description?: string): Promise<ApiResponse<any>> {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("title", title)
    if (description) {
      queryParams.append("description", description)
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.SESSION_DETAIL(id)}?${queryParams.toString()}`, {
      method: "PUT",
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error updating session:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "更新会话失败",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// 删除会话
export async function deleteSession(sessionId: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.DELETE_SESSION(sessionId)}`, {
      method: "DELETE",
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error deleting session:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "删除会话失败",
      data: null,
      timestamp: Date.now(),
    }
  }
}

export async function getSessions(userId: string, archived?: boolean): Promise<ApiResponse<any>> {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append("userId", userId)
    if (archived !== undefined) {
      queryParams.append("archived", String(archived))
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.SESSION}?${queryParams.toString()}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "获取会话列表失败",
      data: [],
      timestamp: Date.now(),
    }
  }
}

// 使用toast包装的API函数
export const getSessionMessagesWithToast = withToast(getSessionMessages, {
  showSuccessToast: false,
  errorTitle: "获取会话消息失败"
})

export const createSessionWithToast = withToast(createSession, {
  successTitle: "创建会话成功",
  errorTitle: "创建会话失败"
})

export const updateSessionWithToast = withToast(updateSession, {
  successTitle: "更新会话成功",
  errorTitle: "更新会话失败"
})

export const deleteSessionWithToast = withToast(deleteSession, {
  successTitle: "删除会话成功",
  errorTitle: "删除会话失败"
})

export const getSessionsWithToast = withToast(getSessions, {
  showSuccessToast: false,
  errorTitle: "获取会话列表失败"
})

