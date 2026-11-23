---
title: Trigger YAML reference
description: Complete field reference for Hub self-contained trigger documents in .paseo/triggers/*.yml.
nav: Trigger YAML reference
order: 74
category: Hub
---

# YAML 참조 트리거

각 `.paseo/triggers/<name>.yml` 파일은 하나의 자체 포함 Hub 트리거를 정의합니다. Hub 대시보드 YAML 보기와 `POST /api/v1/triggers/install`은 동일한 형식을 허용합니다.

## 최상위 필드

| 필드 | 필수 | 기본값 | 메모 |
| ------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| `name` | 예 | 없음 | 고유한 트리거 식별자(`^[a-z][a-z0-9_-]*$`). 같은 `name`으로 다시 배포하면 업데이트됩니다. |
| `enabled` | 아니요 | `true` | 비활성화된 트리거는 구성을 유지하고 새 실행 수락을 중지합니다. |
| `on` | 예 | 없음 | 이벤트 이름을 이벤트 정의(`connection`, `filters`, `recurrence`)에 매핑하는 비어 있지 않은 맵입니다. |
| `inputs` | 아니요 | 없음 | 형식이 지정된 호출 헤더(`type: string \| number \| boolean`, `required`, `default`, `choices`)입니다. |
| `max_runtime` | 아니요 | `run.max_runtime` | 전체 트리거 실행의 하드 제한이며 최대 `24h`입니다. |
| `run` | 예 | 없음 | 대상 데몬, 에이전트 구성, 연속성, 프롬프트, 제한, 도구 및 출력입니다. |

## 이벤트 정의(`on`)

`on` 아래의 각 키는 이벤트 이름입니다.

- 공급자 이벤트(`github.*`, `linear.*`, `slack.mention`, `discord.mention`)는 선택적인 `connection`(통합 슬러그) 및 `filters`을 허용합니다. 전체 이벤트 및 필터 표는 [트리거](/docs/hub/triggers#events)를 참조하세요.
- `schedule.tick`은 `recurrence`(`start`, `rule`, `timezone`)을 요구하고 `connection` 및 `filters`을 거부합니다. [예약된 트리거](/docs/hub/triggers/schedules)를 참조하세요.
- `webhook.received`은 빈 개체 `{}`을 허용하고 `connection` 및 `filters`을 거부합니다. [인바운드 웹훅](/docs/hub/triggers/webhooks)을 참조하세요.
- `manual.run`은 API 발송을 위해 `{}` 또는 `filters.from_users`을 허용합니다. [Hub 공개 API](/docs/hub/api#manual-run-dispatch)를 참조하세요.

하나의 트리거 문서는 `on` 아래에 둘 이상의 이벤트를 나열할 수 있습니다. 대시보드 시각적 양식은 단일 이벤트 트리거를 편집하고 다중 이벤트 트리거는 YAML 보기에서 편집 가능한 상태로 유지됩니다.

## 대상 및 작업 트리

`run.target`은 에이전트가 실행되는 데몬과 디렉터리를 선택합니다.

| 필드 | 필수 | 메모 |
| ---------- | -------- | ------------------------------------------------------------------------------ |
| `daemon` | 예 | `hub.execute` 권한으로 데몬 슬러그를 연결했습니다.                           |
| `cwd` | 예 | `/`으로 시작하는 절대 경로를 사용하는 해당 데몬의 기존 디렉터리입니다. |
| `worktree` | 아니 | 선택적 git 작업 트리 모드: `branch-off`, `checkout-branch` 또는 `checkout-pr`. |

예를 들어 `/home/me/project`은 필수 경로 형식을 사용합니다. Hub는 `C:\work\project`과 같은 Windows 드라이브 경로를 거부합니다.

작업 트리 모드:

- `branch-off`: `newBranch`이 필요하고 `base`은 선택사항입니다. `${{ paseo.execution.id }}`을 `newBranch`(예: `trigger-${{ paseo.execution.id }}`)에 포함하면 각 실행이 재시도 후에도 유지되는 고유한 분기를 얻게 됩니다. `${{ paseo.execution.id }}`은 `newBranch`에서 허용되는 유일한 표현식입니다.
- `checkout-branch`: 리터럴 `branch`이 필요합니다.
- `checkout-pr`: 양의 정수 `prNumber`이 필요합니다.

## 에이전트 선택

`run.agent`은 하나의 정적 에이전트 구성 또는 입력에서 선택된 유한 선택을 정의합니다.

| 필드 | 필수 | 메모 |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `provider` | 예 | 대상 데몬에 구성된 모든 공급자(예: `codex`, `claude`, `opencode`, `pi` 또는 사용자 정의/플러그인 공급자). |
| `model` | 아니 | 공급자 모델 ID.                                                                                                           |
| `mode` | 아니 | 공급자 실행 모드 ID입니다. 공급자가 모드를 제공할 때 대시보드 양식에 필요합니다.                                   |
| `thinkingOptionId` | 아니 | 제공자 사고 옵션 ID.                                                                                                 |
| `options` | 아니 | 이름을 바꾸지 않고 전달되는 JSON 안전 공급자 기본 옵션 개체입니다.                                                   |

Hub는 저장하거나 배포할 때마다 연결된 데몬에게 `provider`, `model`, `mode`, `thinkingOptionId` 및 `options`의 유효성을 검사하도록 요청합니다.

호출 입력이 사전 정의된 완전한 에이전트 구성 중에서 선택하도록 하려면 `select` 및 `choices`을 사용하십시오.

```yaml
name: choose-agent
on:
  manual.run: {}
inputs:
  agent:
    type: string
    required: true
    choices: [codex-read, claude-work]
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    select: ${{ paseo.inputs.agent }}
    choices:
      codex-read:
        provider: codex
        mode: read-only
      claude-work:
        provider: claude
        mode: bypassPermissions
  prompt: Handle this request and call finish_execution.
```

인라인 에이전트 개체 내부의 동적 필드는 거부됩니다. 가능한 모든 `select` 결과는 `choices`의 키와 일치해야 합니다.

## 에이전트 계속

`run.continuation`은 새로 도착한 에이전트가 기존 에이전트를 재사용할지 아니면 새 에이전트를 시작할지 여부를 제어합니다.

| 가치 | 행동 |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ mode: conversation }` | 기본. 동일한 Slack 또는 Discord 스레드, GitHub 문제 또는 PR, Linear 문제에 대해 에이전트를 재사용합니다. 대화가 없을 때 새 에이전트를 시작합니다. |
| `{ mode: key, key: "ticket-${{ paseo.inputs.ticket }}" }` | 평가된 키에 대해 에이전트를 재사용합니다(비어 있지 않은 문자열 최대 512자).                                                                      |
| `{ mode: new }` | 도착할 때마다 새 에이전트를 시작합니다.                                                                                                                |

계속되는 에이전트는 원래 데몬, 작업 디렉터리, 작업 트리 분기, 에이전트 구성, `background` 플래그 및 도구 부여를 유지합니다. `{ mode: new }`으로 전환하거나 새 키를 선택할 때까지 동일한 연속 키에 대한 설정을 변경하면 실패합니다.

에이전트가 바쁜 동안 후속 작업이 도착하면 Hub는 원래 런타임 기한을 연장하지 않고 실행 중인 에이전트를 조정합니다. 프롬프트의 `executionId`을 `reply` 및 `finish_execution`에 전달하여 출력이 올바른 도착에 바인딩되도록 합니다.

## 프롬프트, 컨텍스트, 제목

| 필드 | 필수 | 기본값 | 메모 |
| ----------------- | -------- | ------- | -------------------------------------------------------------------------------------------------- |
| `prompt` | 예 | 없음 | 에이전트에게 전송된 안내 텍스트입니다.                                                                |
| `title` | 아니 | 없음 | 선택적 Paseo 작업 영역 제목 템플릿(리터럴 텍스트 + `${{ paseo.execution.id }}`).           |
| `max_runtime` | 아니 | `2h` | 엄격한 런타임 제한(최대 `24h`).                                                                   |
| `idle_timeout` | 아니 | `10m` | 유휴 시간 제한은 `max_runtime`보다 길지 않습니다.                                                        |
| `startup_timeout` | 아니 | `2m` | 작업 트리 생성 및 공급자 시작을 위한 대기 예산(최대 `24h`).                            |
| `auto_archive` | 아니 | `true` | 실행이 완료된 후 작업공간을 보관합니다.                                                   |
| `background` | 아니 | `false` | 기본 작업공간 목록에서 숨겨진 배경 Paseo 작업공간을 생성합니다. 이전 데몬은 이를 무시합니다. |

프롬프트 표현:

- `${{ paseo.prompt }}`은 공급자 이벤트에 대해 수신된 전체 메시지 텍스트를 삽입하거나 `webhook.received`에 대해 프레임된 웹훅 본문을 삽입합니다. `webhook.received`의 경우 `${{ paseo.prompt }}`을 생략하면 프레임 본문이 자동으로 추가됩니다.
- `${{ paseo.context }}`은 JSON으로 렌더링된 공급자 컨텍스트 구체화(스레드 기록, 문제 메타데이터, 일정 메타데이터 또는 첨부 파일 설명자) 실행을 선택합니다. `${{ paseo.context }}`을 작성하지 않는 한 Hub는 주변 컨텍스트를 주입하지 않습니다.
- `${{ paseo.inputs.<name> }}`은 선언된 입력 값을 삽입합니다.

신뢰할 수 없는 외부 텍스트를 `<user-prompt>...</user-prompt>`과 같은 명확한 구분 기호로 묶습니다.

## 출력 기능

Hub는 실행 MCP 서버를 모든 실행에 연결하고 항상 `finish_execution`을 노출합니다.

이벤트에 문제, 끌어오기 요청 또는 회신할 스레드가 있는 경우 Hub는 `reply` 도구를 부여합니다. 답변은 선택 사항이며 기본적으로 무제한입니다.

`github.push` 이벤트에는 응답 대상이 없습니다. 푸시에 `run.outputs.github.reply.required: true`을 설정하면 Hub는 에이전트를 시작하기 전에 실행에 실패합니다.

`run.outputs`을 설정하여 `max`으로 답장을 제한하거나 `finish_execution` 전에 답장을 요구하도록 설정합니다.

```yaml
run:
  outputs:
    slack.reply:
      max: 1
      required: true
```

지원되는 응답 기능 키는 `github.reply`, `linear.reply`, `slack.reply` 및 `discord.reply`입니다. Hub는 프롬프트를 다시 작성하지 않으므로 `reply` 및 `finish_execution`을 호출해야 할 시기를 에이전트에게 알려주세요.

`finish_execution`에서 구조화된 JSON 출력을 요구하려면 `run.output.schema`을 JSON 스키마 개체로 설정합니다.

## 도구, GitHub 및 환경

- `run.tools`은 범위가 지정된 Slack 및 Discord MCP 도구(명시적 채널 ID의 `read` 및 `post`)를 부여합니다. [통합 도구](/docs/hub/tools)를 참조하세요.
- `run.github`은 범위가 지정된 `GH_TOKEN` 및 격리된 Git 구성을 생성합니다. [GitHub 액세스](/docs/hub/github)를 참조하세요.
- `run.env`은 `${{ paseo.connections.<slug>.token }}`을 포함한 환경 변수를 주입합니다.
