# AgentX 接口层目录结构说明

为了更好地区分前台和后台API，我们将接口层按以下结构组织：

## 目录结构

```
org.xhy.interfaces.api/
├── admin/           # 后台管理API
│   ├── agent/       # 管理员的Agent管理API
│   └── ...          # 其他后台管理API
├── portal/          # 前台用户API
│   ├── agent/       # 用户的Agent操作API
│   ├── conversation/# 用户的会话API
│   └── ...          # 其他前台用户API
├── common/          # 共用组件
└── base/            # 基础组件
```

## URL路径规范

- 前台API: `/portal/*`，例如：`/portal/agent`, `/portal/conversation/session`
- 后台API: `/admin/*`，例如：`/admin/agent/pending`

## 安全与权限

- 前台API（`/portal/*`）适用于普通用户
- 后台API（`/admin/*`）仅适用于管理员
- 通过URL路径前缀可以实现统一的权限控制

## 控制器命名规范

- 前台控制器: `Portal{Module}Controller`，例如：`PortalAgentController`
- 后台控制器: `Admin{Module}Controller`，例如：`AdminAgentController`

这种结构使得API组织更加清晰，并且便于实现统一的权限拦截和安全控制，更符合DDD的界限上下文划分。 