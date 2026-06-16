---
Status: needs-review
Phase: 01
Unblocks: 02
---

# Phase 01 — Workspace 基础（数据模型 + IPC）

## Problem Statement

Argo 目前是空壳 Electron 应用，没有本地持久化能力。要成为离线 Jira，必须先建立：**Workspace 磁盘格式**、**类型定义**、**Main Process 读写服务**、**Preload 桥接**，且 Renderer 无法直接碰文件系统。

## Solution

交付可测试的底层能力：给定一个文件夹路径，应用能创建或加载 `.argo/` 结构，并通过 `window.argo` 读写 `workspace.json` 与 Issue 文件。本阶段**不做 UI**（可用最小 dev 页面或单元测试验证）。

## User Stories

1. As a developer, I want a validated on-disk Workspace format, so that issues persist across app restarts.
2. As a developer, I want typed IPC between renderer and main, so that the UI layer stays sandboxed.
3. As a developer, I want `WorkspaceService` to create a new workspace in an empty folder, so that users can start from scratch.
4. As a developer, I want `WorkspaceService` to open an existing valid workspace, so that data is not corrupted on load.
5. As a developer, I want `IssueStore` to create/read/update/delete issue files, so that later phases can build UI on top.
6. As a developer, I want issue IDs auto-incremented (`ARG-1`, `ARG-2`), so that humans can reference issues unambiguously.
7. As a developer, I want invalid workspace folders rejected with clear errors, so that the app does not silently corrupt data.

## Implementation Decisions

- 磁盘格式严格遵循 [CONTEXT.md](../../CONTEXT.md)。
- 使用 `zod`（已在 `package.json`）校验 `workspace.json` 与 Issue frontmatter。
- Main process 新增服务模块，不把所有逻辑塞进 `main.ts`。
- Preload 暴露 `window.argo.workspace` 与 `window.argo.issues` 命名空间。
- Issue 正文解析：使用成熟 frontmatter 库（如 `gray-matter`）或轻量自研；选型由实现者决定，须在 Implementation Notes 说明。
- 本阶段可用 `app/.argo-dev/` 作为开发用 Workspace；将其加入 `.gitignore`。
- 错误类型应可区分：`WORKSPACE_NOT_FOUND`、`WORKSPACE_INVALID`、`ISSUE_NOT_FOUND`、`IO_ERROR`。

### 目标接口（契约，非路径）

```typescript
// Preload 暴露形状（示意）
type ArgoAPI = {
  workspace: {
    create(path: string, name: string): Promise<WorkspaceMeta>;
    open(path: string): Promise<WorkspaceMeta>;
    getCurrent(): Promise<WorkspaceMeta | null>;
  };
  issues: {
    list(): Promise<IssueSummary[]>;
    get(id: string): Promise<Issue>;
    create(input: CreateIssueInput): Promise<Issue>;
    update(id: string, patch: UpdateIssuePatch): Promise<Issue>;
    delete(id: string): Promise<void>;
  };
};
```

`IssueSummary` 至少含：`id`, `title`, `status`, `triage`, `labels`, `updatedAt`。

## Testing Decisions

- 优先 **Main process 集成测试** 或 **可脚本化调用**（若暂不引入测试框架，则在 Implementation Notes 提供可复现的 manual script / dev 验证步骤）。
- 测试外部行为：写入磁盘 → 重启逻辑（重新 `open`）→ 数据仍在。
- 不测 UI。
- 边界：`open` 无 `.argo/` 目录应失败（创建用 `create`）；`create` 在已有 `.argo/` 时应失败；frontmatter 缺字段应拒绝加载该 issue 并报告。

## Out of Scope

- 文件夹选择对话框（阶段 02）
- 任何正式 UI 布局
- 看板、搜索、拖拽
- 记住上次打开路径（阶段 02）
- Git 集成

## Agent Brief

**Category:** enhancement  
**Summary:** 建立 Workspace / Issue 磁盘持久化与 IPC API，无 UI

**Current behavior:**  
Electron 启动后仅显示静态 React 占位页；无文件读写；preload 未暴露业务 API。

**Desired behavior:**  
- `workspace.create(path, name)` 在 `path` 下创建 `.argo/workspace.json` 与 `.argo/issues/`。  
- `workspace.open(path)` 加载并校验已有 workspace，内存中持有「当前 workspace」。  
- `issues.*` 对当前 workspace 的 issue 文件做 CRUD。  
- Renderer 通过 `window.argo` 调用上述 API；`contextIsolation` 保持开启。  
- 非法数据返回可辨别的错误，不崩溃。

**Key interfaces:**

- `WorkspaceMeta` — 对应 `workspace.json` 字段
- `Issue` / `IssueSummary` — 对应 issue 文件 frontmatter + body
- `window.argo` — preload 桥接
- Zod schemas — `workspace.json` 与 issue frontmatter 校验

**Acceptance criteria:**

- [x] `workspace.create` 在空文件夹生成符合 CONTEXT.md 的 `.argo/` 结构
- [x] `workspace.open` 能加载该 workspace 且 `getCurrent()` 返回元数据
- [x] `issues.create` 生成 `ARG-1.md`，且 `nextIssueNumber` 递增
- [x] `issues.list` 返回所有 issue 摘要，按 id 数字排序
- [x] `issues.update` 修改 title/status 后文件内容与 `updatedAt` 更新
- [x] `issues.delete` 删除文件后 `list` 不再包含该 id
- [x] 重新 `open` 同一文件夹后数据仍在（持久化验证）
- [x] Renderer 无直接 `fs` / `path` 引用（仅 preload + main）
- [x] `app/.argo-dev/` 已加入 `.gitignore`

**Out of scope:**

- 见上文 Out of Scope

## Implementation Notes

### 模块

- `WorkspaceService` — 创建/打开 workspace，读写 `workspace.json`，内存中持有当前 workspace
- `IssueStore` — Issue 文件 CRUD，维护 `nextIssueNumber`
- `registerIpcHandlers` — IPC 通道 `argo:workspace:*` / `argo:issues:*`
- `window.argo` — preload 暴露给 Renderer 的类型安全 API
- `electron/shared/parsers.ts` — `workspace.json` 与 issue frontmatter 校验（手写 parser，避免 zod 在 NodeNext 下触发 CJS 输出）
- `electron/shared/issue-file.ts` — 使用 **gray-matter** 解析/序列化 issue Markdown

### 错误码

`ArgoError` 支持：`WORKSPACE_NOT_FOUND`、`WORKSPACE_INVALID`、`ISSUE_NOT_FOUND`、`IO_ERROR`、`NO_WORKSPACE_OPEN`。IPC 层将 `code` 附在 `Error` 上供 Renderer 读取。

### 验证

```bash
cd app
npm run test:phase01    # 自动化集成测试（临时目录，无需 Electron）
npm run dev             # 打开 Phase 01 Dev Panel，用按钮手动测 IPC
```

Dev Panel 默认路径为 `app/.argo-dev/`（通过 `argo.dev.getWorkspacePath()` 获取）。建议流程：Create workspace → Create issue → List → Update first → 退出重启 → Open → List 确认持久化。

### 已知限制

- 无文件夹选择对话框（阶段 02）
- Dev Panel 为临时测试 UI，非正式产品界面

## Review Checklist

- [ ] 已独立运行验证，不依赖 Implementer 的 Implementation Notes 描述
- [ ] 磁盘文件格式与 CONTEXT.md 一致
- [ ] 错误分支至少各验证一种（无效目录、重复 create）
- [ ] TypeScript 编译通过

## Review Record

<!-- Reviewer: 按 AI-REVIEW.md 填写 -->
