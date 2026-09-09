---
title: Orchestration
description: Coordinate agents across providers and machines, delegate work, and keep tasks moving with schedules and heartbeats.
nav: Overview
order: 30
category: Orchestration
---

# 오케스트레이션

Paseo를 사용하면 코딩 에이전트가 다른 에이전트를 조율하고, 공급자와 머신에 걸쳐 작업을 나누며, 작업을 자동으로 계속 진행할 수 있습니다.

## 에이전트가 할 수 있는 일

- **공급자와 모델 선택:** 호스트에 구성된 모든 공급자와 모델을 사용해 다른 에이전트를 시작합니다.
- **위임 및 병렬화:** 서로 다른 공급자의 에이전트를 포함해 조사, 구현 및 검토를 여러 에이전트에 나눕니다.
- **서로 통신:** 에이전트가 [ID로 다른 에이전트에 프롬프트를 보내](/docs/orchestration-workflows#send-a-prompt-to-another-agent) 질문하고 조사 결과를 공유하거나 작업을 요청할 수 있습니다.
- **진행 중인 작업 조율:** 진행 상황을 확인하고, 작업을 중지하고, 결과를 수집합니다.
- **작업공간과 작업 트리 만들기:** 독립적인 변경에 별도 [작업 디렉터리](/docs/worktrees)를 제공합니다.
- **여러 머신에서 작업:** [CLI](/docs/cli#connecting-to-a-remote-daemon)를 사용해 연결 가능한 다른 Paseo 호스트에서 에이전트를 시작하고 관리합니다.
- **전문 분야로 선택:** [에이전트 프로필](/docs/agent-profiles)과 메모를 사용해 UI 작업, 계획 또는 검토에 사용할 설정을 선택합니다.
- **일정 만들기:** [지정된 시간](/docs/schedules)에 새 에이전트에서 프롬프트를 실행합니다.
- **하트비트 만들기:** 같은 에이전트에 주기적으로 프롬프트를 보내 [작업을 계속](/docs/orchestration-workflows#keep-an-agent-working-with-a-heartbeat)하게 합니다.

## 시작하기

내장 Paseo 도구 또는 CLI를 사용하세요. 둘 다 에이전트가 작업자를 시작하고 조율할 수 있게 합니다.

### 내장 Paseo 도구(MCP)

Paseo 도구를 활성화하면 Paseo 안에서 실행되는 에이전트가 해당 호스트의 에이전트와 작업공간을 직접 관리할 수 있습니다.

1. **설정 → 호스트 → 에이전트**를 엽니다.
2. **Paseo 도구 활성화**를 켭니다. 도구 주입은 기본적으로 꺼져 있습니다.
3. 새 에이전트를 시작하거나 기존 에이전트를 다시 로드해 도구를 받게 합니다.
4. 다음과 같이 요청합니다.

> Paseo를 사용해 이 브랜치를 검토할 두 번째 에이전트를 시작하세요. 파일을 변경하지 않고 잠재적인 버그를 보고하게 한 뒤, 조사 결과를 요약하세요.

작업자는 작성기 근처의 **하위 에이전트 트랙**에 표시됩니다. 대화를 따라가려면 작업자를 여세요. 주 에이전트는 작업자가 완료되면 알림을 받으며, 작업 중에도 계속 대화할 수 있습니다.

도구 구성과 전체 카탈로그는 [MCP 참조](/docs/mcp)를 확인하세요. [오케스트레이션 스킬](/docs/skills)은 선택 가능한 재사용 워크플로입니다.

### CLI

셸에 접근할 수 있는 에이전트는 Paseo CLI도 사용할 수 있습니다. 이 방법에는 도구 주입 활성화가 필요하지 않습니다. Paseo가 설치되어 있고 호스트가 실행 중이며 Codex가 구성된 상태에서 다음을 실행하세요.

```bash
paseo run --provider codex --background \
  "Review this branch without changing files"
paseo ls -a
```

첫 번째 명령은 작업자를 시작하고 즉시 반환하며, 두 번째 명령은 활성 작업공간의 에이전트를 보관된 에이전트까지 포함해 나열합니다. Paseo 에이전트가 이 명령을 실행하면 작업자가 같은 작업공간의 하위 에이전트가 됩니다. 사용자가 자신의 터미널에서 실행하면 새 로컬 작업공간에서 시작됩니다.

후속 작업, 출력, 작업 트리 및 원격 호스트는 [CLI 참조](/docs/cli)를 확인하세요.

## 프로필로 설정을 한 번만 선택하기

공급자, 모델, 사고 수준, 모드 및 사용 가능한 기능 설정을 **에이전트 프로필**로 저장한 뒤 에이전트를 만들 때 한 번의 선택으로 적용하세요.

오케스트레이션 에이전트가 작업에 맞는 프로필을 선택할 수 있도록 **사용 시점** 메모를 추가하세요. 예를 들어 UI 작업, 계획 또는 독립적인 검토가 있습니다. [프로필 생성 및 위임 메모 작성 방법](/docs/agent-profiles)을 확인하세요.

## 더 알아보기

- [구현을 위임하고 독립적인 검토 받기](/docs/orchestration-workflows#implement-then-review)
- [별도 작업 트리에서 변경 사항 병렬 실행하기](/docs/orchestration-workflows#parallelize-edits-without-collisions)
- [다른 머신에서 작업 조율하기](/docs/orchestration-workflows#work-on-another-machine)
- [반복 작업 만들기](/docs/schedules) 또는 [하트비트로 작업 계속하기](/docs/orchestration-workflows#keep-an-agent-working-with-a-heartbeat)
- [재사용 가능한 오케스트레이션 스킬 설치하기](/docs/skills)
