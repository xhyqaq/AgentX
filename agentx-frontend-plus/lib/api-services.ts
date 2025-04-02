import type {
  ApiResponse,
  CreateSessionParams,
  GetSessionsParams,
  Session,
  UpdateSessionParams,
} from "@/types/conversation"
import { withToast } from "./toast-utils"
import { httpClient } from "@/lib/http-client"
import { API_CONFIG, API_ENDPOINTS } from "@/lib/api-config"

// 构建查询字符串
function buildQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (typeof value === "boolean") {
        // 如果是布尔值，只传递键名
        return value ? key : null
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .filter(Boolean)
    .join("&")

  return query ? `?${query}` : ""
}

// 创建会话
export async function createSession(params: CreateSessionParams): Promise<ApiResponse<Session>> {
  try {
    const queryString = buildQueryString(params)
    const url = `/api/proxy/sessions${queryString}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok && !data.code) {
      throw new Error(`创建会话失败: ${response.status}, ${data.error || "Unknown error"}`)
    }

    return data
  } catch (error) {
    console.error("创建会话错误:", error)
    // 返回格式化的错误响应
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null as unknown as Session, // 修复类型错误
      timestamp: Date.now(),
    }
  }
}

// 获取会话列表
export async function getSessions(params: GetSessionsParams): Promise<ApiResponse<Session[]>> {
  try {
    const queryString = buildQueryString(params)
    const url = `/api/proxy/sessions${queryString}`

    console.log(`Fetching sessions with URL: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok && !data.code) {
      throw new Error(`获取会话列表失败: ${response.status}, ${data.error || "Unknown error"}`)
    }

    return data
  } catch (error) {
    console.error("获取会话列表错误:", error)
    // 返回格式化的错误响应
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: [] as Session[],
      timestamp: Date.now(),
    }
  }
}

// 获取单个会话详情
export async function getSession(sessionId: string): Promise<ApiResponse<Session>> {
  try {
    const url = `/api/proxy/sessions/${sessionId}`

    console.log(`Fetching session with URL: ${url}`)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok && !data.code) {
      throw new Error(`获取会话详情失败: ${response.status}, ${data.error || "Unknown error"}`)
    }

    return data
  } catch (error) {
    console.error("获取会话详情错误:", error)
    // 返回格式化的错误响应，确保与API响应格式一致
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null as unknown as Session, // 类型转换以满足返回类型
      timestamp: Date.now(),
    }
  }
}

// 更新会话
export async function updateSession(sessionId: string, params: UpdateSessionParams): Promise<ApiResponse<Session>> {
  try {
    const queryString = buildQueryString(params)
    const url = `/api/proxy/sessions/${sessionId}${queryString}`

    console.log(`Updating session with URL: ${url}`)

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok && !data.code) {
      throw new Error(`更新会话失败: ${response.status}, ${data.error || "Unknown error"}`)
    }

    return data
  } catch (error) {
    console.error("更新会话错误:", error)
    // 返回格式化的错误响应
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null as unknown as Session,
      timestamp: Date.now(),
    }
  }
}

// 删除会话
export async function deleteSession(sessionId: string): Promise<ApiResponse<null>> {
  try {
    const url = `/api/proxy/sessions/${sessionId}`

    console.log(`Deleting session with URL: ${url}`)

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok && !data.code) {
      throw new Error(`删除会话失败: ${response.status}, ${data.error || "Unknown error"}`)
    }

    return data
  } catch (error) {
    console.error("删除会话错误:", error)
    // 返回格式化的错误响应
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// withToast包装的函数
export const createSessionWithToast = withToast(createSession, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "创建会话成功",
  errorTitle: "创建会话失败"
})

export const getSessionsWithToast = withToast(getSessions, {
  showSuccessToast: false,
  showErrorToast: true,
  errorTitle: "获取会话列表失败"
})

export const getSessionWithToast = withToast(getSession, {
  showSuccessToast: false,
  showErrorToast: true,
  errorTitle: "获取会话详情失败"
})

export const updateSessionWithToast = withToast(updateSession, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "更新会话成功",
  errorTitle: "更新会话失败"
})

export const deleteSessionWithToast = withToast(deleteSession, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "删除会话成功",
  errorTitle: "删除会话失败"
})

// 获取服务提供商列表
export async function getProviders(type?: string): Promise<ApiResponse<any[]>> {
  try {
    console.log(`Fetching providers, type: ${type || 'all'}`)
    
    const params = type ? { type } : undefined;
    const response = await httpClient.get<ApiResponse<any[]>>(API_ENDPOINTS.PROVIDERS, { params });
    
    return response;
  } catch (error) {
    console.error("获取服务提供商列表错误:", error)
    // 返回格式化的错误响应
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: [],
      timestamp: Date.now(),
    }
  }
}

// 获取服务提供商详情
export async function getProviderDetail(providerId: string): Promise<ApiResponse<any>> {
  try {
    console.log(`Fetching provider detail for: ${providerId}`)
    
    const response = await httpClient.get<ApiResponse<any>>(API_ENDPOINTS.PROVIDER_DETAIL(providerId));
    
    return response;
  } catch (error) {
    console.error("获取服务提供商详情错误:", error)
    // 返回格式化的错误响应
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// 获取服务提供商协议列表
export async function getProviderProtocols(): Promise<ApiResponse<string[]>> {
  try {
    console.log('Fetching provider protocols')
    
    const response = await httpClient.get<ApiResponse<string[]>>(API_ENDPOINTS.PROVIDER_PROTOCOLS);
    
    return response;
  } catch (error) {
    console.error("获取服务提供商协议列表错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: [],
      timestamp: Date.now(),
    }
  }
}

// 创建服务提供商
export async function createProvider(data: any): Promise<ApiResponse<any>> {
  try {
    console.log('Creating provider:', data)
    
    const response = await httpClient.post<ApiResponse<any>>(API_ENDPOINTS.CREATE_PROVIDER, data);
    
    return response;
  } catch (error) {
    console.error("创建服务提供商错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// 更新服务提供商
export async function updateProvider(data: any): Promise<ApiResponse<any>> {
  try {
    console.log('Updating provider:', data)
    
    const response = await httpClient.put<ApiResponse<any>>(API_ENDPOINTS.UPDATE_PROVIDER, data);
    
    return response;
  } catch (error) {
    console.error("更新服务提供商错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// 删除服务提供商
export async function deleteProvider(providerId: string): Promise<ApiResponse<null>> {
  try {
    console.log(`Deleting provider: ${providerId}`)
    
    const response = await httpClient.delete<ApiResponse<null>>(API_ENDPOINTS.DELETE_PROVIDER(providerId));
    
    return response;
  } catch (error) {
    console.error("删除服务提供商错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// 切换服务提供商状态
export async function toggleProviderStatus(providerId: string): Promise<ApiResponse<null>> {
  try {
    console.log(`Toggling provider status: ${providerId}`)
    
    const response = await httpClient.post<ApiResponse<null>>(API_ENDPOINTS.TOGGLE_PROVIDER_STATUS(providerId));
    
    return response;
  } catch (error) {
    console.error("切换服务提供商状态错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

export const getProvidersWithToast = withToast(getProviders, {
  showSuccessToast: false,
  showErrorToast: true,
  errorTitle: "获取服务提供商列表失败"
})

export const getProviderDetailWithToast = withToast(getProviderDetail, {
  showSuccessToast: false,
  showErrorToast: true,
  errorTitle: "获取服务提供商详情失败"
})

export const getProviderProtocolsWithToast = withToast(getProviderProtocols, {
  showSuccessToast: false,
  showErrorToast: true,
  errorTitle: "获取服务提供商协议列表失败"
})

export const createProviderWithToast = withToast(createProvider, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "创建服务提供商成功",
  errorTitle: "创建服务提供商失败"
})

export const updateProviderWithToast = withToast(updateProvider, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "更新服务提供商成功",
  errorTitle: "更新服务提供商失败"
})

export const deleteProviderWithToast = withToast(deleteProvider, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "删除服务提供商成功",
  errorTitle: "删除服务提供商失败"
})

export const toggleProviderStatusWithToast = withToast(toggleProviderStatus, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "切换服务提供商状态成功",
  errorTitle: "切换服务提供商状态失败"
})

// 模型管理相关API函数

// 获取模型列表
export async function getModels(type?: string): Promise<ApiResponse<any[]>> {
  try {
    console.log(`Fetching models, type: ${type || 'all'}`)
    
    // type参数值: all-所有(默认)，official-官方，custom-用户自定义
    // 注意: 不支持通过此参数过滤模型类型如"CHAT"，需要在前端过滤
    const params = type ? { type } : undefined;
    const response = await httpClient.get<ApiResponse<any[]>>('/llm/models', { params });
    
    return response;
  } catch (error) {
    console.error("获取模型列表错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: [],
      timestamp: Date.now(),
    }
  }
}

export const getModelsWithToast = withToast(getModels, {
  showSuccessToast: false,
  showErrorToast: true,
  errorTitle: "获取模型列表失败"
})

// 模型配置接口
interface ModelConfig {
  modelId: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  strategyType: string;
  reserveRatio: number;
  summaryThreshold: number;
}

// 获取Agent的模型配置
export async function getAgentModel(agentId: string): Promise<ApiResponse<ModelConfig>> {
  try {
    const response = await httpClient.get<ApiResponse<ModelConfig>>(API_ENDPOINTS.AGENT_MODEL_CONFIG(agentId));
    return response;
  } catch (error) {
    console.error("获取Agent模型配置错误:", error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null as unknown as ModelConfig,
      timestamp: Date.now(),
    };
  }
}

// 设置Agent的模型配置
export async function setAgentModel(agentId: string, config: ModelConfig): Promise<ApiResponse<void>> {
  try {
    const response = await httpClient.put<ApiResponse<void>>(
      API_ENDPOINTS.SET_AGENT_MODEL_CONFIG(agentId),
      config
    );
    return response;
  } catch (error) {
    console.error("设置Agent模型配置错误:", error);
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null as unknown as void,
      timestamp: Date.now(),
    };
  }
}

// 带Toast提示的设置模型配置
export const setAgentModelWithToast = withToast(setAgentModel, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "设置模型配置成功",
  errorTitle: "设置模型配置失败"
});

// 创建模型
export async function createModel(data: any): Promise<ApiResponse<any>> {
  try {
    console.log('Creating model:', data)
    
    const response = await httpClient.post<ApiResponse<any>>(API_ENDPOINTS.CREATE_MODEL, data);
    
    return response;
  } catch (error) {
    console.error("创建模型错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// 更新模型
export async function updateModel(data: any): Promise<ApiResponse<any>> {
  try {
    console.log('Updating model:', data)
    
    const response = await httpClient.put<ApiResponse<any>>(API_ENDPOINTS.UPDATE_MODEL, data);
    
    return response;
  } catch (error) {
    console.error("更新模型错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// 删除模型
export async function deleteModel(modelId: string): Promise<ApiResponse<null>> {
  try {
    console.log(`Deleting model: ${modelId}`)
    
    const response = await httpClient.delete<ApiResponse<null>>(API_ENDPOINTS.DELETE_MODEL(modelId));
    
    return response;
  } catch (error) {
    console.error("删除模型错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

// 切换模型状态
export async function toggleModelStatus(modelId: string): Promise<ApiResponse<null>> {
  try {
    console.log(`Toggling model status: ${modelId}`)
    
    const response = await httpClient.put<ApiResponse<null>>(API_ENDPOINTS.TOGGLE_MODEL_STATUS(modelId));
    
    return response;
  } catch (error) {
    console.error("切换模型状态错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: null,
      timestamp: Date.now(),
    }
  }
}

export const createModelWithToast = withToast(createModel, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "创建模型成功",
  errorTitle: "创建模型失败"
})

export const updateModelWithToast = withToast(updateModel, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "更新模型成功",
  errorTitle: "更新模型失败"
})

export const deleteModelWithToast = withToast(deleteModel, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "删除模型成功",
  errorTitle: "删除模型失败"
})

export const toggleModelStatusWithToast = withToast(toggleModelStatus, {
  showSuccessToast: true,
  showErrorToast: true,
  successTitle: "切换模型状态成功",
  errorTitle: "切换模型状态失败"
})

// 获取模型类型列表
export async function getModelTypes(): Promise<ApiResponse<string[]>> {
  try {
    console.log('Fetching model types')
    
    const response = await httpClient.get<ApiResponse<string[]>>(API_ENDPOINTS.MODEL_TYPES);
    
    return response;
  } catch (error) {
    console.error("获取模型类型列表错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: [],
      timestamp: Date.now(),
    }
  }
}

export const getModelTypesWithToast = withToast(getModelTypes, {
  showSuccessToast: false,
  showErrorToast: true,
  errorTitle: "获取模型类型列表失败"
})

// 获取工作区Agent列表
export async function getWorkspaceAgents(): Promise<ApiResponse<any[]>> {
  try {
    console.log('Fetching workspace agents')
    
    const response = await httpClient.get<ApiResponse<any[]>>('/agent/workspace/agents');
    
    return response;
  } catch (error) {
    console.error("获取工作区Agent列表错误:", error)
    return {
      code: 500,
      message: error instanceof Error ? error.message : "未知错误",
      data: [],
      timestamp: Date.now(),
    }
  }
}

export const getWorkspaceAgentsWithToast = withToast(getWorkspaceAgents, {
  showSuccessToast: false,
  showErrorToast: true,
  errorTitle: "获取工作区Agent列表失败"
})
