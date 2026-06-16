# Argo 离线 Jira MVP 规划

将 Argo 发展为**离线版 Jira**：用户选择一个本地文件夹作为 **Workspace（工作区）**，在其中用纯文件管理 Issue，无需服务器或账号。

## 当前状态

| 阶段 | 名称 | 状态 | PRD |
|------|------|------|-----|
| 01 | Workspace 基础（数据模型 + IPC） | `needs-review` | [PRD](./phases/01-workspace-foundation/PRD.md) |
| 02 | 打开工作区 | `needs-review` | [PRD](./phases/02-open-workspace/PRD.md) |
| 03 | Issue CRUD | `needs-review` | [PRD](./phases/03-issue-crud/PRD.md) |
| 04 | 看板视图 | `needs-review` | [PRD](./phases/04-kanban-board/PRD.md) |
| 05 | 搜索与筛选 | `needs-review` | [PRD](./phases/05-search-and-filter/PRD.md) |
| 06 | AI Agent 工作流 | `needs-review` | [PRD](./phases/06-ai-agent-workflow/PRD.md) |

**状态词汇**（与 [AI-REVIEW.md](./AI-REVIEW.md) 一致）：

- `draft` — PRD 未就绪，不可交给 Agent
- `ready-for-agent` — 规格完整，可立即实现
- `in-progress` — Agent 或开发者正在实现
- `needs-review` — 实现完成，等待 AI Review
- `done` — Review 通过，本阶段关闭
- `blocked` — 依赖的前序阶段未完成

## 如何使用本目录

### 给 AI Agent（实现）

1. 阅读 [CONTEXT.md](./CONTEXT.md) 掌握领域词汇与磁盘格式。
2. 在 README 表格中找到第一个 `ready-for-agent` 阶段。
3. 打开该阶段 `PRD.md`，按 **Agent Brief** 实现。
4. 实现完成后，将 PRD 顶部 `Status:` 改为 `needs-review`，并填写 **Implementation Notes**。
5. 触发 AI Review（见 [AI-REVIEW.md](./AI-REVIEW.md)）。

### 给 AI Agent（Review）

1. 打开状态为 `needs-review` 的 PRD。
2. 严格按 [AI-REVIEW.md](./AI-REVIEW.md) 执行 Review 清单。
3. 全部通过后：PRD `Status:` → `done`，README 表格同步更新，**解锁下一阶段**（将其改为 `ready-for-agent`）。

### 给人类

- 一次只推进一个阶段，保证每次交付都可运行、可演示。
- 不要跳过阶段；后续 PRD 假设前序能力已存在。
- 产品方向变更时，先改 `CONTEXT.md` 和受影响 PRD，再实现。

## MVP 范围（总览）

**In scope（MVP）**

- 本地文件夹 = 一个 Workspace
- Issue 以文件存储（人类可读、Git 友好）
- 列表 + 看板两种视图
- 基础搜索与按状态/标签筛选
- Issue 格式兼容 Agent Brief + 验收清单（供 Cursor 等 AI 读写）

**Out of scope（MVP 之后）**

- 多用户协作、冲突合并
- 云端同步
- 富文本 / 附件 / 评论线程
- 自定义工作流引擎
- 与 GitHub Issues 双向同步

## 目录结构

```
docs/mvp-offline-jira/
├── README.md              ← 本文件（路线图 + 状态表）
├── CONTEXT.md             ← 领域词汇 + 磁盘格式契约
├── AI-REVIEW.md           ← AI Review 规范与完成标识
└── phases/
    ├── 01-workspace-foundation/PRD.md
    ├── 02-open-workspace/PRD.md
    ├── 03-issue-crud/PRD.md
    ├── 04-kanban-board/PRD.md
    ├── 05-search-and-filter/PRD.md
    └── 06-ai-agent-workflow/PRD.md
```

## 技术栈（不变）

沿用 `app/` 现有栈：Electron + React + TypeScript + Vite。新增能力通过 **Main Process IPC + Preload** 访问文件系统，Renderer 不直接读写磁盘。
