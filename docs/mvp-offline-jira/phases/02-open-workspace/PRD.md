---
Status: needs-review
Phase: 02
Unblocks: 03
Depends-on: 01
---

# Phase 02 — 打开工作区

## Problem Statement

底层 IPC 已就绪，但用户无法通过图形界面选择文件夹。没有「打开工作区」体验，产品无法使用。

## Solution

提供首次启动与日常使用的 Workspace 打开流程：选择文件夹 → 创建或打开 `.argo/` → 主界面展示当前工作区名称与路径。记住上次打开的路径，下次启动自动恢复。

## User Stories

1. As a user, I want to pick a local folder as my workspace, so that my issues live alongside my project files.
2. As a user, I want Argo to initialize a new workspace when the folder has no `.argo/` yet, so that I do not manually create config files.
3. As a user, I want the app to reopen my last workspace on launch, so that I resume work quickly.
4. As a user, I want to see which workspace is open, so that I do not edit the wrong project by mistake.
5. As a user, I want to switch to a different workspace, so that I can manage multiple projects.
6. As a user, I want clear error messages when a folder cannot be used, so that I know what to fix.

## Implementation Decisions

- 使用 Electron `dialog.showOpenDialog`（Main），通过 IPC 暴露 `workspace.pickAndOpen()` 或等价 API。
- 若所选文件夹无 `.argo/`：提示「将创建新工作区」并调用 `workspace.create`；默认 name 取文件夹名。
- 若已有 `.argo/`：调用 `workspace.open`。
- 「最近工作区」存于应用级设置（如 `electron-store` 或 `app.getPath('userData')` 下 JSON）；**不**写入用户 Workspace 内。
- 主界面布局：顶栏显示 workspace 名 + 路径；无 issue 时显示空状态文案。
- 菜单或按钮：「打开工作区…」「新建工作区…」（新建 = 选空文件夹并 create）。

## Testing Decisions

- 手动测试为主：选文件夹、重启应用、切换工作区。
- 验证最近路径保存在 userData，而非 workspace 内。

## Out of Scope

- Issue 列表 UI（阶段 03）
- 工作区重命名 UI（可改 `workspace.json` 的 `name` 字段预留，但无编辑器）
- 多窗口同时打开不同 workspace

## Agent Brief

**Category:** enhancement  
**Summary:** 文件夹选择与工作区打开/恢复 UI

**Current behavior:**  
Phase 01 仅能通过 API 操作 workspace；启动后仍是占位页，用户无法选择文件夹。

**Desired behavior:**  
- 首次启动（无最近记录）：显示欢迎页，引导「打开文件夹」。  
- 选择文件夹后：无 `.argo/` 则创建；有则打开。  
- 成功后进入主壳：顶栏展示 workspace 名称与路径。  
- 再次启动：自动 open 最近 workspace；失败则回退欢迎页并提示。  
- 提供「切换工作区」入口。

**Key interfaces:**

- `window.argo.workspace.pickAndOpen()` — 打开对话框并 create/open
- `window.argo.workspace.getRecent()` / 内部持久化 — 最近路径
- 主布局组件 — 承载后续 phase 的 outlet

**Acceptance criteria:**

- [x] 点击「打开工作区」可选择文件夹并成功进入主界面
- [x] 空文件夹首次打开会创建 `.argo/` 且顶栏显示正确名称
- [x] 已有 `.argo/` 的文件夹打开不覆盖数据
- [x] 完全退出并重启后自动打开上次工作区
- [x] 切换工作区后顶栏信息更新
- [x] 用户取消对话框时不崩溃、不改变当前 workspace
- [x] 无效/不可读文件夹有可见错误提示

**Out of scope:**

- Issue CRUD UI
- 看板

## Implementation Notes

### 模块

- `RecentWorkspaceStore` — 在 `app.getPath('userData')/argo-settings.json` 持久化 `lastWorkspacePath`（不写入用户 Workspace）
- `WorkspacePicker` — 文件夹对话框 + create/open 编排 + `restoreRecent`
- `useWorkspaceSession` — Renderer 启动恢复、欢迎页/主壳切换
- `WelcomeView` / `WorkspaceShell` — 欢迎页与顶栏主界面

### 新增 IPC

- `workspace.pickAndOpen()` — 选文件夹；无 `.argo/` 则创建，有则打开
- `workspace.pickAndCreate()` — 选文件夹；仅允许无 `.argo/` 的目录
- `workspace.restoreRecent()` — 启动时恢复最近工作区
- `workspace.getRecent()` / `getCurrentPath()`

### 验证

```bash
cd app
npm run test:phase02    # RecentWorkspaceStore 自动化测试
npm run dev             # 手动：欢迎页 → Open/New → 顶栏 → 重启恢复 → Switch
```

### 已知限制

- Issue 列表仍为占位空状态（阶段 03）
- 无工作区重命名 UI

## Review Checklist

- [ ] 冷启动 → 选文件夹 → 看到顶栏 全流程通过
- [ ] 重启恢复最近 workspace 通过
- [ ] `.argo/` 仅通过 API 创建，无手写文件

## Review Record

<!-- Reviewer: 按 AI-REVIEW.md 填写 -->
