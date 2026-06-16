---
Status: needs-review
Phase: 03
Unblocks: 04
Depends-on: 02
---

# Phase 03 — Issue CRUD

## Problem Statement

工作区已能打开，但用户无法创建或管理 Issue。离线 Jira 的核心价值尚未交付。

## Solution

在主界面提供 Issue **列表视图**与**详情/编辑**：新建、查看、编辑标题/描述/状态、删除。所有变更即时持久化到 `.argo/issues/`。

## User Stories

1. As a user, I want to see all issues in a list, so that I know what work exists.
2. As a user, I want to create an issue with a title, so that I can capture tasks quickly.
3. As a user, I want to open an issue and edit its description, so that I can add context.
4. As a user, I want to change an issue's status, so that I can track progress.
5. As a user, I want to delete an issue, so that I can remove mistakes or duplicates.
6. As a user, I want changes saved automatically to disk, so that I do not lose work on quit.
7. As a user, I want issues sorted predictably, so that the list stays stable across sessions.

## Implementation Decisions

- 布局：左侧列表 + 右侧详情（或主从单栏，实现者自选，保持简洁）。
- 列表默认按 id 数字**降序**（最新在上）。
- 新建 issue：默认 `status: backlog`，`triage: needs-triage`，正文含空 `## Description` 与占位 `## Agent Brief`（为阶段 06 预留）。
- 描述与 Agent Brief 用**纯文本 Markdown  textarea** 即可；MVP 不做 WYSIWYG。
- 状态变更：下拉选择四态（`backlog` | `todo` | `in-progress` | `done`）。
- 删除需确认（原生 `confirm` 或简单 modal）。
- 列表项展示：id、title、status（徽章）、相对或短格式 `updatedAt`。

## Testing Decisions

- 手动：创建 3 条 issue → 编辑 → 删 1 条 → 重启 → 数据一致。
- 可选：对 `IssueStore` 的自动化测试若阶段 01 已引入则补充 UI 集成测试。

## Out of Scope

- 看板拖拽（阶段 04）
- 搜索筛选（阶段 05）
- 标签编辑 UI（labels 字段只读或隐藏）
- Triage 状态编辑（阶段 06）
- 评论、附件、@提及

## Agent Brief

**Category:** enhancement  
**Summary:** Issue 列表 + 详情 CRUD UI

**Current behavior:**  
工作区可打开，主界面无 issue 相关 UI。

**Desired behavior:**  
- 列表展示当前 workspace 全部 issue。  
- 「新建 Issue」创建并选中；右侧可编辑 title、description、status。  
- 保存即调用 `issues.update`（可 debounce 或 blur 保存，须在 Notes 说明）。  
- 删除从磁盘移除并在列表消失。  
- 无 issue 时列表区显示引导文案。

**Key interfaces:**

- `window.argo.issues.*` — 阶段 01 API
- 列表/详情 React 组件 — 仅通过 argo API 访问数据

**Acceptance criteria:**

- [x] 可新建 issue，列表出现且磁盘有对应 `.md` 文件
- [x] 选中 issue 可查看并编辑 title、description
- [x] 修改 status 后列表徽章更新且 frontmatter 持久化
- [x] 删除 issue 有确认且文件从 `.argo/issues/` 移除
- [x] 重启应用后列表与编辑内容一致
- [x] 未打开 workspace 时不显示 CRUD（或禁用并提示）

**Out of scope:**

- 看板、搜索、triage 编辑

## Implementation Notes

### UI 结构

- `IssuePanel` — 主从布局容器
- `IssueList` — 左侧列表（id、title、status 徽章、相对时间）
- `IssueDetail` — 右侧编辑（title、status 下拉、description textarea）
- `useIssues` — 列表/选中/CRUD 状态管理

### 保存策略

- **title / description**：输入时 500ms debounce 自动保存；`blur` 时立即 flush
- **status**：变更后立即保存
- description 存于 issue body 的 `## Description` 节，保留 `## Agent Brief` 不动

### 其他

- 列表按 id 数字**降序**（`IssueStore.list` + 客户端 `sortIssuesDescending`）
- 新建 issue 默认标题 `Untitled issue`，status `backlog`，triage `needs-triage`
- 删除使用 `window.confirm`
- 无 workspace 时仍显示欢迎页，不暴露 CRUD

### 验证

```bash
cd app
npm run test:phase03
npm run dev   # 新建 3 条 → 编辑 → 删除 → 重启确认持久化
```

## Review Checklist

- [ ] 至少 3 个 issue 的增删改查全流程
- [ ] 磁盘文件内容与 UI 一致
- [ ] 空 workspace 与有数据 workspace 均体验合理

## Review Record

<!-- Reviewer: 按 AI-REVIEW.md 填写 -->
