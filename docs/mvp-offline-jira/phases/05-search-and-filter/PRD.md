---
Status: needs-review
Phase: 05
Unblocks: 06
Depends-on: 04
---

# Phase 05 — 搜索与筛选

## Problem Statement

Issue 增多后，列表与看板难以定位。需要轻量搜索与按状态/标签筛选。

## Solution

在列表与看板共用顶栏工具区：按标题/描述**全文搜索**；按 **status** 多选筛选；按 **labels** 多选筛选（只读标签，来自 frontmatter）。

## User Stories

1. As a user, I want to search issues by keyword, so that I find relevant work quickly.
2. As a user, I want to filter by one or more statuses, so that I focus on e.g. only `in-progress`.
3. As a user, I want to filter by labels, so that I can narrow enhancement vs bug.
4. As a user, I want filters to apply to both list and board views, so that behavior is consistent.
5. As a user, I want to clear filters in one action, so that I recover the full backlog.

## Implementation Decisions

- 搜索范围：`title` + body（description 与 agent brief 全文），大小写不敏感。
- 筛选在**客户端**对 `issues.list` 结果过滤（MVP 无索引文件）。
- UI：搜索框 + status 多选（checkbox 或 chip）+ labels 多选（labels 从当前 issue 集合动态聚合）。
- 无匹配时显示「无结果」空状态。
- 筛选状态在视图切换时保持；刷新应用不持久化筛选条件。

## Testing Decisions

- 准备 issue：不同 status、label、`title` 含唯一关键词；验证组合筛选。

## Out of Scope

- 正则、高级查询语法（JQL）
- 保存筛选器
- 按日期范围筛选
- 新建/编辑 labels UI

## Agent Brief

**Category:** enhancement  
**Summary:** 关键词搜索 + status/label 筛选

**Current behavior:**  
列表/看板展示全部 issue，无过滤。

**Desired behavior:**  
- 输入关键词实时过滤（可 debounce 200ms）。  
- 可选多个 status；未选 status 表示「全部」。  
- 可选多个 label；未选表示「全部」。  
- 搜索与筛选为 AND 关系。  
- 「清除筛选」恢复全量。

**Key interfaces:**

- 纯 UI 层过滤函数 `(issues, { query, statuses, labels }) => issues`
- 列表与看板均消费过滤后数据

**Acceptance criteria:**

- [x] 搜索 title 子串可命中
- [x] 搜索 description 正文可命中
- [x] 单 status 筛选后列表与看板只显示该 status
- [x] 多 status 筛选为 OR
- [x] label 筛选仅显示含任一选中 label 的 issue
- [x] 搜索 + status 同时生效
- [x] 清除筛选恢复全部 issue
- [x] 无匹配时有明确空状态

**Out of scope:**

- labels 编辑
- 服务端/磁盘索引

## Implementation Notes

### 实现

- `filterIssues` / `collectLabels` — 纯客户端过滤（`src/lib/filter-issues.ts`）
- `useIssueFilters` — 200ms debounce 搜索词；status/label 多选 chip
- `IssueFilters` — 列表与看板共用顶栏筛选区
- `issues.list` 现返回 `body` 字段以支持 description / Agent Brief 全文搜索（无额外磁盘读取）

### 行为

- 搜索 + status + label 为 **AND** 关系；多 status / 多 label 各自为 **OR**
- 未选 status 或 label 表示「全部」
- 筛选在 List / Board 切换时保持；不持久化到磁盘
- 当前选中 issue 被滤掉时，自动选中过滤结果第一条

### 验证

```bash
cd app
npm run test:phase05
npm run dev
```

## Review Checklist

- [ ] 至少 5 个 issue 覆盖多 status/label 的筛选场景
- [ ] 列表与看板过滤结果一致

## Review Record

<!-- Reviewer: 按 AI-REVIEW.md 填写 -->
