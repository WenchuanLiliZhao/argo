# Argo 离线 Jira — 领域上下文

本文件是 MVP 各阶段 PRD 的**唯一领域词汇表**。实现与 Review 时必须使用此处定义的术语，避免同义词漂移。

## 核心概念

| 术语 | 定义 |
|------|------|
| **Workspace** | 用户选中的本地文件夹。Argo 在其中读写所有数据。 |
| **Argo 元数据目录** | Workspace 根下的 `.argo/` 隐藏目录，存放配置与 Issue 索引。用户不应手动编辑，但可以在 Git 中提交。 |
| **Issue** | 一条工作项，对应磁盘上的一个文件。有唯一 `id`、标题、状态、正文等字段。 |
| **Board** | 按状态列展示 Issue 的看板视图。MVP 列固定为四列（见下）。 |
| **Triage Status** | Issue 在 AI 工作流中的就绪程度，与实现状态（如 `in-progress`）正交。 |
| **Agent Brief** | Issue 正文中结构化的一段，描述 AI Agent 的实现契约与验收标准。 |

## 磁盘格式契约

### 目录布局

```
<用户选择的文件夹>/          ← Workspace 根
├── .argo/
│   ├── workspace.json       ← 工作区元数据
│   └── issues/
│       ├── ARG-1.md
│       ├── ARG-2.md
│       └── ...
└── ...                      ← 用户自己的项目文件（Argo 不触碰）
```

### `workspace.json`

```json
{
  "version": 1,
  "name": "My Project",
  "issuePrefix": "ARG",
  "nextIssueNumber": 3,
  "columns": ["backlog", "todo", "in-progress", "done"],
  "createdAt": "2026-06-16T00:00:00.000Z",
  "openedAt": "2026-06-16T12:00:00.000Z"
}
```

- `issuePrefix` + `nextIssueNumber` 共同生成新 Issue 的 `id`（如 `ARG-3`）。
- `columns` 顺序即看板列顺序；MVP 不允许用户改列名，只允许改顺序（阶段 04 之后）。

### Issue 文件（`ARG-<n>.md`）

每个 Issue 是一个 Markdown 文件，**YAML frontmatter + Markdown 正文**：

```markdown
---
id: ARG-1
title: "实现文件夹选择对话框"
status: todo
triage: ready-for-agent
labels: [enhancement]
createdAt: 2026-06-16T10:00:00.000Z
updatedAt: 2026-06-16T10:00:00.000Z
---

## Description

用户故事与背景说明。

## Agent Brief

**Category:** enhancement
**Summary:** 一行摘要

**Current behavior:**
...

**Desired behavior:**
...

**Key interfaces:**
- `WorkspaceService.open()` — ...

**Acceptance criteria:**
- [ ] 可验证的标准 1
- [ ] 可验证的标准 2

**Out of scope:**
- ...

## Implementation Notes

（实现者填写，Review 时核对）

## Review Record

（AI Review 填写，格式见 AI-REVIEW.md）
```

### 字段枚举

**`status`**（看板列 / 实现进度）：

| 值 | 含义 |
|----|------|
| `backlog` | 已记录，未排期 |
| `todo` | 待做 |
| `in-progress` | 进行中 |
| `done` | 已完成 |

**`triage`**（AI 工作流就绪度）：

| 值 | 含义 |
|----|------|
| `needs-triage` | 需人工分类 |
| `needs-info` | 信息不足 |
| `ready-for-agent` | 规格完整，可交给 Agent 实现 |
| `ready-for-human` | 需人工实现 |
| `wontfix` | 不做 |

**`labels`**：字符串数组，MVP 不做标签管理 UI，仅在 frontmatter 中存储。

## 模块边界（目标架构）

| 模块 | 职责 |
|------|------|
| `WorkspaceService`（Main） | 打开/创建/校验 Workspace；读写 `workspace.json` |
| `IssueStore`（Main） | Issue 文件 CRUD；分配 id；维护 `nextIssueNumber` |
| `ArgoAPI`（Preload） | 暴露类型安全的 `window.argo.*` 给 Renderer |
| UI 层（Renderer） | 纯展示与交互，通过 `ArgoAPI` 调用，不 import `fs` |

## 与现有仓库的关系

- `app/` 是唯一的应用代码目录。
- `docs/mvp-offline-jira/` 是产品规划，**不是** Workspace 数据。
- 开发时可用 `app/.argo-dev/` 作为测试 Workspace（应加入 `.gitignore`）。
