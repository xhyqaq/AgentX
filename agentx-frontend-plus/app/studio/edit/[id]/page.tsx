"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Bot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AgentAPI, { AgentDTO, UpdateAgentRequest } from "../../../api/agent"

// 模型选项
const modelOptions = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "llama-3-70b", label: "Llama 3 70B" },
]

// 工具选项
const toolOptions = [
  { id: "web-search", name: "网页搜索", description: "允许搜索互联网获取信息" },
  { id: "file-reader", name: "文件读取", description: "允许读取和分析上传的文件" },
  { id: "code-interpreter", name: "代码解释器", description: "允许执行代码并返回结果" },
  { id: "image-generation", name: "图像生成", description: "允许生成和编辑图像" },
  { id: "calculator", name: "计算器", description: "允许执行数学计算" },
]

// 知识库选项
const knowledgeBaseOptions = [
  { id: "kb-1", name: "产品文档", description: "包含产品说明、使用指南等" },
  { id: "kb-2", name: "常见问题", description: "常见问题及解答集合" },
  { id: "kb-3", name: "技术文档", description: "技术规范和API文档" },
  { id: "kb-4", name: "营销资料", description: "营销内容和宣传材料" },
]

interface AgentFormData {
  name: string
  avatar: string | null
  description: string
  systemPrompt: string
  welcomeMessage: string
  modelConfig: {
    model: string
    temperature: number
    maxTokens: number
  }
  tools: string[]
  knowledgeBaseIds: string[]
}

export default function EditAgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agent, setAgent] = useState<AgentDTO | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 表单数据
  const [formData, setFormData] = useState<AgentFormData>({
    name: "",
    avatar: null,
    description: "",
    systemPrompt: "",
    welcomeMessage: "",
    modelConfig: {
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 2000,
    },
    tools: [],
    knowledgeBaseIds: [],
  })

  // 加载Agent数据
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setIsLoading(true)
        const agentData = await AgentAPI.getAgent(agentId)
        setAgent(agentData)
        
        // 从配置中提取数据
        const config = agentData.configuration || {}
        setFormData({
          name: agentData.name,
          avatar: agentData.avatarUrl || null,
          description: agentData.description,
          systemPrompt: config.systemPrompt || "你是一个有用的AI助手。",
          welcomeMessage: config.welcomeMessage || "你好！我是你的AI助手，有什么可以帮助你的吗？",
          modelConfig: config.modelConfig || {
            model: "gpt-4o",
            temperature: 0.7,
            maxTokens: 2000,
          },
          tools: config.tools || [],
          knowledgeBaseIds: config.knowledgeBaseIds || [],
        })
      } catch (error) {
        console.error("获取Agent数据失败:", error)
        toast({
          title: "加载失败",
          description: "无法加载Agent数据",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (agentId) {
      fetchAgentData()
    }
  }, [agentId])

  // 更新表单字段
  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 更新模型配置
  const updateModelConfig = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      modelConfig: {
        ...prev.modelConfig,
        [field]: value,
      },
    }))
  }

  // 切换工具
  const toggleTool = (toolId: string) => {
    setFormData((prev) => {
      const tools = [...prev.tools]
      if (tools.includes(toolId)) {
        return { ...prev, tools: tools.filter((id) => id !== toolId) }
      } else {
        return { ...prev, tools: [...tools, toolId] }
      }
    })
  }

  // 切换知识库
  const toggleKnowledgeBase = (kbId: string) => {
    setFormData((prev) => {
      const knowledgeBaseIds = [...prev.knowledgeBaseIds]
      if (knowledgeBaseIds.includes(kbId)) {
        return { ...prev, knowledgeBaseIds: knowledgeBaseIds.filter((id) => id !== kbId) }
      } else {
        return { ...prev, knowledgeBaseIds: [...knowledgeBaseIds, kbId] }
      }
    })
  }

  // 处理头像上传
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请上传图片文件",
        variant: "destructive",
      })
      return
    }

    // 检查文件大小 (限制为2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "头像图片不能超过2MB",
        variant: "destructive",
      })
      return
    }

    // 创建文件预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      updateFormField("avatar", e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 移除头像
  const removeAvatar = () => {
    updateFormField("avatar", null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 触发文件选择
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // 保存Agent
  const handleSaveAgent = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "请输入名称",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // 准备更新请求
      const updateRequest: UpdateAgentRequest = {
        name: formData.name,
        description: formData.description,
        avatarUrl: formData.avatar || undefined,
        configuration: {
          systemPrompt: formData.systemPrompt,
          welcomeMessage: formData.welcomeMessage,
          modelConfig: formData.modelConfig,
          tools: formData.tools,
          knowledgeBaseIds: formData.knowledgeBaseIds,
          type: agent?.configuration?.type || "chat"
        }
      }
      
      // 调用API更新Agent
      const updatedAgent = await AgentAPI.updateAgent(agentId, updateRequest)

      toast({
        title: "保存成功",
        description: `已更新Agent: ${formData.name}`
      })

      // 跳转回列表页
      router.push("/studio")
    } catch (error) {
      console.error("保存失败:", error)
      toast({
        title: "保存失败",
        description: "请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 获取可用的标签页
  const getAvailableTabs = () => {
    if (!agent || !agent.configuration) return []
    
    const type = agent.configuration.type
    if (type === "chat") {
      return [
        { id: "basic", label: "基本信息" },
        { id: "prompt", label: "提示词配置" },
        { id: "model", label: "模型配置" },
        { id: "tools", label: "工具与知识库" },
      ]
    } else {
      return [
        { id: "basic", label: "基本信息" },
        { id: "model", label: "模型配置" },
        { id: "tools", label: "工具" },
      ]
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>加载中...</p>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">未找到Agent</p>
        <Button asChild>
          <Link href="/studio">返回工作室</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/studio">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">返回</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">编辑 Agent</h1>
            <p className="text-muted-foreground">更新Agent的配置和设置</p>
          </div>
        </div>
        <Button onClick={handleSaveAgent} disabled={isSaving}>
          {isSaving ? "保存中..." : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {getAvailableTabs().map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">基本信息</h2>
              <p className="text-sm text-muted-foreground mb-4">设置Agent的基本信息和外观</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-avatar">头像</Label>
                <div className="flex items-center mt-2">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      {formData.avatar ? (
                        <AvatarImage src={formData.avatar} alt={formData.name} />
                      ) : (
                        <AvatarFallback>
                          <Bot className="h-8 w-8" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                  <div className="ml-4 space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
                      上传
                    </Button>
                    {formData.avatar && (
                      <Button type="button" variant="outline" size="sm" onClick={removeAvatar}>
                        移除
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="agent-name">名称</Label>
                <Input
                  id="agent-name"
                  value={formData.name}
                  onChange={(e) => updateFormField("name", e.target.value)}
                  placeholder="输入Agent名称"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="agent-description">描述</Label>
                <Textarea
                  id="agent-description"
                  value={formData.description}
                  onChange={(e) => updateFormField("description", e.target.value)}
                  placeholder="描述这个Agent的功能和用途"
                  className="mt-1 h-24"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">提示词配置</h2>
              <p className="text-sm text-muted-foreground mb-4">设置系统提示词和欢迎消息</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="system-prompt">系统提示词</Label>
                <Textarea
                  id="system-prompt"
                  value={formData.systemPrompt}
                  onChange={(e) => updateFormField("systemPrompt", e.target.value)}
                  placeholder="输入系统提示词，定义AI的角色和行为"
                  className="mt-1 h-32"
                />
              </div>

              <div>
                <Label htmlFor="welcome-message">欢迎消息</Label>
                <Textarea
                  id="welcome-message"
                  value={formData.welcomeMessage}
                  onChange={(e) => updateFormField("welcomeMessage", e.target.value)}
                  placeholder="设置对话开始时的欢迎消息"
                  className="mt-1 h-24"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="model" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">模型配置</h2>
              <p className="text-sm text-muted-foreground mb-4">调整AI模型的参数</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="model-select">模型</Label>
                <Select
                  value={formData.modelConfig.model}
                  onValueChange={(value) => updateModelConfig("model", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between">
                  <Label htmlFor="temperature">温度 ({formData.modelConfig.temperature})</Label>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[formData.modelConfig.temperature]}
                  onValueChange={(values) => updateModelConfig("temperature", values[0])}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  较低的值使输出更确定性，较高的值使输出更随机创造性
                </p>
              </div>

              <div>
                <div className="flex justify-between">
                  <Label htmlFor="max-tokens">最大令牌数 ({formData.modelConfig.maxTokens})</Label>
                </div>
                <Slider
                  id="max-tokens"
                  min={100}
                  max={4000}
                  step={100}
                  value={[formData.modelConfig.maxTokens]}
                  onValueChange={(values) => updateModelConfig("maxTokens", values[0])}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">设置响应的最大长度</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div>
              <h2 className="text-lg font-medium mb-2">工具与知识库</h2>
              <p className="text-sm text-muted-foreground mb-4">启用Agent可以使用的工具和知识库</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-2">可用工具</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {toolOptions.map((tool) => (
                    <div
                      key={tool.id}
                      className={`p-3 rounded-lg border cursor-pointer ${
                        formData.tools.includes(tool.id) ? "border-primary bg-secondary" : "border-border"
                      }`}
                      onClick={() => toggleTool(tool.id)}
                    >
                      <div className="flex items-center">
                        <Switch checked={formData.tools.includes(tool.id)} />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium">{tool.name}</h4>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">可用知识库</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {knowledgeBaseOptions.map((kb) => (
                    <div
                      key={kb.id}
                      className={`p-3 rounded-lg border cursor-pointer ${
                        formData.knowledgeBaseIds.includes(kb.id) ? "border-primary bg-secondary" : "border-border"
                      }`}
                      onClick={() => toggleKnowledgeBase(kb.id)}
                    >
                      <div className="flex items-center">
                        <Switch checked={formData.knowledgeBaseIds.includes(kb.id)} />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium">{kb.name}</h4>
                          <p className="text-xs text-muted-foreground">{kb.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 