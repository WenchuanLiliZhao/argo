# AI Review 规范

每个 MVP 阶段实现完成后，由 AI（或人类）按本规范 Review。**全部清单项通过后**，方可将阶段标为 `done` 并解锁下一阶段。

## 触发条件

- PRD 顶部 `Status: needs-review`
- 实现者已填写 PRD 中的 **Implementation Notes**
- `npm run dev` 可启动，无 TypeScript 编译错误

## Review 角色

| 角色 | 职责 |
|------|------|
| **Implementer** | 按 Agent Brief 实现，填写 Implementation Notes，改 Status → `needs-review` |
| **Reviewer** | 独立上下文下的 AI（或他人），按本规范核对，填写 Review Record |

Reviewer **不应**假设自己写过实现代码；应通过运行应用、读 diff、执行验收标准来验证。

## 完成标识体系

### 1. PRD 级状态（文件顶部 frontmatter）

```yaml
---
Status: needs-review   # draft | ready-for-agent | in-progress | needs-review | done
Phase: 01
Unblocks: 02
---
```

状态流转：

```
draft → ready-for-agent → in-progress → needs-review → done
                              ↑                              |
                              └──────── 返工 ────────────────┘
```

### 2. Agent Brief 验收清单（PRD 内）

实现阶段：Implementer 在 PRD 的 Agent Brief 里将已完成项标为 `[x]`。

Review 阶段：Reviewer **独立**勾选 **Review Checklist**（见各 PRD 底部），不得只复制 Implementer 的勾选。

### 3. Issue 文件中的验收清单（阶段 06 起）

Issue 正文 `Acceptance criteria` 使用 GitHub 风格 checkbox：

```markdown
- [ ] 未完成
- [x] 已完成
```

Agent 实现功能时勾选；Reviewer 核对每一项是否有测试或手动步骤支撑。

### 4. Review Record（写在 PRD 底部）

Review 结束时，Reviewer 追加：

```markdown
## Review Record

**Reviewer:** <agent 或人名>
**Date:** <ISO 8601>
**Verdict:** pass | fail

### Findings

- [pass] <检查项> — <一句证据>
- [fail] <检查项> — <问题描述与建议>

### Checklist

- [x] 全部 Agent Brief 验收标准已独立验证
- [x] 无超出 PRD Out of Scope 的改动
- [x] CONTEXT.md 术语使用一致
- [x] `npm run dev` 启动成功
- [x] 无新增 linter / TS 错误（对改动文件执行诊断）

### Unlock

- [x] README 状态表已更新：本阶段 → `done`，阶段 <Unblocks> → `ready-for-agent`
```

`Verdict: fail` 时：Status 改回 `in-progress`，Implementer 修复后再次提交 Review。

## Review 步骤（Reviewer 执行顺序）

1. **读 CONTEXT.md** — 确认磁盘格式与术语。
2. **读 PRD 全文** — 理解 Agent Brief 与 Out of Scope。
3. **读 Implementation Notes** — 了解实现者声称做了什么。
4. **看 diff** — 范围是否与 PRD 一致。
5. **运行验证** — `cd app && npm run dev`，按验收标准手动或自动测试。
6. **独立勾选 Review Checklist**（各 PRD 底部）。
7. **写 Review Record** — 每项 finding 标注 pass/fail。
8. **更新状态** — 见下方「通过后必做」。

## 通过后必做（Reviewer）

1. PRD frontmatter：`Status: done`
2. [README.md](./README.md) 表格：本阶段 → `done`
3. 若存在 `Unblocks` 字段：下一阶段 `blocked` → `ready-for-agent`
4. 若实现产生了架构决策：在 PRD 的 Implementation Notes 中记录，必要时提议新增 ADR（本 MVP 暂不强制 `docs/adr/`）

## 返工规则

以下任一情况 = `fail`：

- 任一验收标准无法演示或验证
- 改动侵入 Out of Scope
- 破坏前序阶段已交付的能力
- Renderer 直接访问 Node `fs`（必须用 IPC）
- 用户 Workspace 内非 `.argo/` 文件被修改或删除

## 给 Implementer 的提示

在 PRD **Implementation Notes** 中写明：

- 新增/修改的主要模块名（不写易过期的路径清单）
- 如何手动验证（逐步操作）
- 已知限制或刻意砍掉的边角
- 对下一阶段的建议（可选）

这样 Reviewer 不必猜。
