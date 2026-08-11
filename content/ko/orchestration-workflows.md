---
title: Common orchestration workflows
description: Copyable prompts for delegating, parallelizing, reviewing, and continuing agent work with Paseo.
nav: Common workflows
order: 31
category: Orchestration
---

# 일반적인 오케스트레이션 워크플로

이 예는 주 에이전트를 위한 프롬프트입니다. 작업에 맞게 공급자, 모델, 작업 및 분기 이름을 변경하세요.

## 다른 모델에게 작업 보내기

기본 채팅에서 강력한 계획을 유지하고 구현을 주력으로 보냅니다.

```text
Stay as the orchestrator. Use Paseo to find the available Codex 5.6 model, then
create a worktree-isolated workspace and launch a subagent there. Ask it to
implement the parser change and run the focused tests.
```

정확한 모델 ID가 확실하지 않은 경우 오케스트레이터에게 먼저 공급자를 검사하도록 요청하세요. 사용 가능한 모델은 자체 설치 및 인증된 CLI에서 제공됩니다.

## 팬아웃 연구

읽기 전용 작업은 하나의 작업 공간을 안전하게 공유할 수 있습니다.

```text
Create three Paseo subagents in this workspace. Have one trace the request path,
one inspect the tests, and one look for related regressions. Do not edit files.
Synthesize their findings when all three report back.
```

각 작업자는 하위 에이전트 트랙에 표시되며 오케스트레이터는 실행되는 동안 계속 작업할 수 있습니다.

## 충돌 없이 편집 병렬화

각 독립적 구현에 고유한 작업 트리 격리 작업 공간을 제공합니다.

```text
Split these two issues between two Paseo subagents. Create a separate workspace
with worktree isolation from main for each issue, use the best available
implementation model, and have each agent run the focused checks for its change.
Summarize both diffs when done.
```

동일한 파일에 대한 공동작업을 위해 현재 작업공간을 사용하세요. 에이전트가 독립적으로 편집할 수 있는 경우 작업 트리를 사용하십시오.

## 구현 후 검토

변화를 만들고 판단하기 위해 다양한 모델을 사용하십시오.

```text
Create a worktree-isolated workspace and launch a worker there to implement this
feature. When it finishes, create a second subagent in the same workspace to
review the diff for correctness, missing tests, and unnecessary complexity.
Bring the review back here.
```

두 번째 에이전트는 대화 컨텍스트를 공유하지 않고 작업자의 파일을 볼 수 있으므로 검토가 더욱 독립적이 됩니다.

## 작업 확인, 리디렉션 또는 계속하기

오케스트레이터는 작업자를 검사하고 다시 시작하지 않고도 후속 조치를 보낼 수 있습니다.

```text
Summarize what the subagents are doing and flag anything blocked.
```

```text
Tell the parser worker to add the malformed-input case and rerun its test file.
```

```text
Cancel the UI worker's current turn, but keep the agent so I can redirect it.
```

## 에이전트의 지속적인 작업 유지

현재 에이전트가 스스로 깨어나 작업을 재평가하고 작업을 계속해야 할 때 하트비트를 사용합니다.

```text
Use Paseo to create a heartbeat every 10 minutes. Continue this migration in
small steps, run the focused checks after each step, and stop when the migration
is complete or after two hours.
```

```text
Create a heartbeat every 5 minutes to check this deployment. Investigate any
failure and report meaningful changes in this conversation. Stop after one hour.
```

하트비트가 동일한 대화로 돌아옵니다. 일일 분류와 같은 cron 스타일 반복 작업의 경우 [일정](/docs/schedules)을 사용하세요. 핸드오프, 위원회, 자문, 제한된 루프 등 재사용 가능한 워크플로는 [오케스트레이션 기술](/docs/skills)을 참조하세요.