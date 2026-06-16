---
Status: needs-review
Phase: 04
Unblocks: 05
Depends-on: 03
---

# Phase 04 — 看板视图

## Problem Statement

列表视图适合浏览，但无法一眼看出各状态的 workload。Jira 用户习惯看板（Kanban）。

## Solution

增加看板视图：四列对应 `backlog`、`todo`、`in-progress`、`done`。Issue 以卡片展示；用户可改变 status 从而在列间移动。支持列表/看板 Tab 切换。

## User Stories

1. As a user, I want a board view grouped by status, so that I see work distribution at a glance.
2. As a user, I want to move an issue between columns, so that I can update status visually.
3. As a user, I want to open an issue from a card, so that I can edit details without leaving the board.
4. As a user, I want to switch between list and board, so that I use the right view for the task.
5. As a user, I want empty columns to still be visible, so that the workflow structure is clear.

## Implementation Decisions

- 列标题 humanize：`Backlog` / `To Do` / `In Progress` / `Done`（映射 CONTEXT 四态）。
- 列顺序读 `workspace.json` 的 `columns` 数组。
- 移动方式（二选一，实现 Notes 说明选型）：
  - **A（推荐 MVP）**：卡片上 status 下拉 / 右键菜单改列
  - **B**：拖拽 `@dnd-kit/core` 等库
- 卡片显示：id、title；可选 truncate 长标题。
- 点击卡片：打开与列表相同的详情面板（复用阶段 03 组件）。
- 视图切换：Tab 或 Segmented control，状态可存 URL hash 或 React state（无需持久化偏好）。

## Testing Decisions

- 手动：每列至少 1 张卡 → 移到另一列 → 切回列表确认 status → 重启确认。

## Out of Scope

- 自定义列名/列数
- WIP 限制、泳道（assignee）
- 拖拽排序同一列内优先级（无 `rank` 字段）

## Agent Brief

**Category:** enhancement  
**Summary:** 四列看板 + 列表/看板切换

**Current behavior:**  
仅有列表视图；status 仅在详情里修改。

**Desired behavior:**  
- 「看板」Tab 展示四列，每列含对应 status 的 issue 卡片。  
- 用户可改变 issue 的 status，卡片移动到正确列。  
- 与列表共用详情编辑；一处改 status 两处同步。  
- 列可为空但列头仍显示。

**Key interfaces:**

- `issues.list` + 客户端按 `status` 分组
- `issues.update` — 改 status
- 复用阶段 03 详情组件

**Acceptance criteria:**

- [x] 看板四列与 CONTEXT 四 status 一一对应
- [x] 每 issue 出现在且仅出现在其 status 对应列
- [x] 在看板改 status 后列表视图同步
- [x] 在列表改 status 后看板同步
- [x] 点击卡片可编辑 issue
- [x] 列表与看板可切换且无数据丢失

**Out of scope:**

- 拖拽（若实现拖拽可加分但非必须）
- 搜索筛选

## Implementation Notes

### 选型

- 移动方式：**卡片上 status 下拉**（未引入拖拽库）
- 列顺序：读 `workspace.meta.columns`
- 视图切换：React state（`list` | `board`），不持久化

### 组件

- `ViewModeToggle` — List / Board Tab
- `KanbanBoard` + `KanbanCard` — 四列看板
- `groupIssuesByColumn` — 客户端按 status 分组
- `useIssues.updateIssueById` — 看板改任意卡片 status 时复用

### 验证

```bash
cd app
npm run test:phase04
npm run dev   # 每列放卡 → 看板改 status → 切列表确认 → 详情改 status → 切回看板
```

## Review Checklist

- [ ] 四列均有/issue 分布正确
- [ ] 双向 status 同步验证
- [ ] 10+ issue 时滚动/布局不崩

## Review Record

<!-- Reviewer: 按 AI-REVIEW.md 填写 -->
