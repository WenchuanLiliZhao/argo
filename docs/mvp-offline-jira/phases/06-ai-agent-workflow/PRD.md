---
Status: needs-review
Phase: 06
Unblocks: null
Depends-on: 05
---

# Phase 06 — AI Agent 工作流

## Problem Statement

离线 Jira 不仅要给人用，还要让 **Cursor 等 AI Agent** 能读 issue 规格、实现功能、勾选验收项并进入 Review。需要 triage 状态、Agent Brief 编辑、验收清单与 Review 状态在 UI 与磁盘格式中对齐。

## Solution

1. Issue 详情可编辑 **triage** 与完整 **Agent Brief**（结构化 textarea 或分段表单）。  
2. 列表/看板可筛 `triage: ready-for-agent`。  
3. 提供 **「复制 Agent 上下文」** 按钮：导出适合粘贴给 AI 的 Markdown bundle。  
4. 验收清单 checkbox 在 UI 可切换，写回 issue 文件 `[x]` / `[ ]`。  
5. 文档化：本仓库 `docs/mvp-offline-jira/AI-REVIEW.md` 即为规范；应用内 About/Help 可链到该文档路径说明。

## User Stories

1. As a PM, I want to set triage status on an issue, so that agents know what is ready to implement.
2. As a PM, I want to write an Agent Brief with acceptance criteria, so that implementers have a contract.
3. As a developer using Cursor, I want to copy issue context in one click, so that I can paste it into chat.
4. As an AI agent, I want acceptance checkboxes persisted in the markdown file, so that review is traceable in Git.
5. As a reviewer, I want to see which criteria are checked, so that I know what was claimed done.
6. As a user, I want a filter for `ready-for-agent` issues, so that I pick work for AFK agents.

## Implementation Decisions

- Triage 下拉五值：见 CONTEXT.md（`needs-triage` … `wontfix`）。
- Agent Brief：整块 Markdown 编辑区，放在 `## Agent Brief` 标题下；保存时写回 body，保持章节结构。
- **Acceptance criteria 解析**：识别 `## Agent Brief` 下 `- [ ]` / `- [x]` 行；UI 用 checkbox 列表渲染，切换时更新 markdown 文本而非单独字段。
- 「复制 Agent 上下文」内容模板：

```markdown
# {id}: {title}
Status: {status} | Triage: {triage}

{full body}
```

- 列表增加 triage 徽章；筛选栏增加 triage 多选。
- 新建 issue 默认模板含空 Agent Brief 与 3 条空 acceptance criteria（`- [ ]`）。
- 不实现应用内自动调用 LLM；Agent 工作流在 Cursor 外进行，Argo 管**规格与状态**。

## Testing Decisions

- 手动：改 triage → 复制上下文 → 在编辑器打开 `.md` 确认 checkbox 同步。
- 用 Cursor 打开 workspace 文件夹，验证 AI 可直接读 `ARG-x.md`。

## Out of Scope

- 应用内嵌 AI 聊天
- 自动 `ready-for-agent` → `done` 状态机
- GitHub Issues 同步
- Review Record 自动写入 PRD（Review 仍走 `docs/` 下 PRD；issue 级 Review 可写在 `## Review Record` 节）

## Agent Brief

**Category:** enhancement  
**Summary:** Triage + Agent Brief 编辑 + 验收 checkbox + Agent 上下文导出

**Current behavior:**  
Issue 有 description 与 status；triage 与 Agent Brief 仅在磁盘默认值，UI 不可见或不可编辑。

**Desired behavior:**  
- 详情页编辑 triage 与 Agent Brief（含 acceptance criteria checkboxes）。  
- Checkbox 切换持久化到 issue `.md` 文件。  
- 筛选 `triage` 与既有搜索/status/label 组合。  
- 「复制 Agent 上下文」到剪贴板。  
- 新建 issue 带标准 Agent Brief 模板。

**Key interfaces:**

- Issue body 解析/序列化 — `## Agent Brief` 与 checkbox 行
- `issues.update` — 写回完整 body
- 剪贴板 API — `navigator.clipboard.writeText`（Electron 需权限时走 IPC）

**Acceptance criteria:**

- [x] 详情可编辑 triage 五种状态并持久化到 frontmatter
- [x] Agent Brief 文本可编辑并保存到 `## Agent Brief` 节
- [x] Acceptance criteria 在 UI 显示为 checkbox，勾选后文件为 `- [x]`
- [x] 取消勾选写回 `- [ ]`
- [x] 「复制 Agent 上下文」包含 id、title、status、triage、全文 body
- [x] 可按 `ready-for-agent` 筛选 issue
- [x] 新建 issue 含默认 Agent Brief 模板与 3 条空 criteria
- [x] README 或应用 Help 提及 `docs/mvp-offline-jira/AI-REVIEW.md` 作为 Review 规范

**Out of scope:**

- 自动调用 AI
- PRD 阶段状态与 issue 状态双向同步

## Implementation Notes

### 模块

- `src/lib/agent-brief.ts` — Agent Brief 解析、验收 checkbox 切换、`formatAgentContext`
- `electron/shared/issue-template.ts` — 新建 issue 默认 body（含 3 条空 criteria）
- `AcceptanceCriteria` — checkbox UI，写回 markdown
- `IssueDetail` — triage 下拉、Agent Brief textarea、Copy Agent Context
- 筛选栏新增 **Triage** 多选 chip；列表项显示 triage 徽章

### 行为

- 验收清单解析 `## Agent Brief` 下 `- [ ]` / `- [x]` 行
- Agent Brief / Description 均 500ms debounce + blur flush
- Triage / checkbox / status 立即保存
- 复制模板：`# {id}: {title}\nStatus: ... | Triage: ...\n\n{body}`

### 验证

```bash
cd app
npm run test:phase06
npm run dev
```

## Review Checklist

- [ ] 磁盘 `.md` 与 UI checkbox 双向一致
- [ ] 复制内容可在 Cursor chat 中作为实现规格使用
- [ ] `ready-for-agent` 筛选准确
- [ ] MVP 全流程演示：建 issue → 写 brief → 标 ready → 复制 → 模拟勾选验收

## Review Record

<!-- Reviewer: 按 AI-REVIEW.md 填写 -->

## MVP 完成定义

当本阶段 `Status: done` 时，**离线 Jira MVP** 视为交付，具备：

- 打开本地 Workspace
- Issue CRUD + 看板 + 搜索筛选
- AI 可读写的 Agent Brief 与验收清单
- 仓库内完整 PRD + AI Review 规范

后续版本（非 MVP）从新建 `docs/mvp-offline-jira/phases/07-*/` 或 `docs/post-mvp/` 开始规划。
