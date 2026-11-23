---
title: Hub triggers
description: Connect events, schedules, and webhooks to agents running on your Paseo daemons.
nav: Triggers
order: 64
category: Hub
---

# 트리거

트리거는 데몬에서 에이전트를 시작하는 대상, 이를 호출할 수 있는 사람, 실행되는 에이전트, 사용할 수 있는 도구 또는 응답을 정의합니다.

Hub 대시보드의 **트리거**(양식 또는 YAML 보기)에서 트리거를 작성하거나 `.paseo/triggers/*.yml`에 저장하고 `paseo hub deploy`을 사용하여 배포할 수 있습니다.

`.paseo/triggers/github-issue.yml`:

```yaml
name: triage-issue
on:
  github.issue_created:
    connection: acme-github
    filters:
      repo: acme/api
      from_users: [alice]
run:
  target:
    daemon: devbox
    cwd: /workspace/api
  agent:
    provider: codex
    mode: full-access
  max_runtime: 90m
  idle_timeout: 10m
  prompt: |
    Triage this issue, reply with your summary using reply, then call finish_execution.
    ${{ paseo.context }}
```

지원되는 모든 필드는 [트리거 YAML 참조](/docs/hub/configuration/reference)를 확인하세요.

## Hub에서 에이전트 선택

Hub 대시보드에서 트리거를 생성하거나 편집할 때 데몬을 선택하고 해당 작업 디렉터리를 먼저 입력하세요. Hub는 해당 데몬에게 사용 가능한 공급자, 모델, 실행 모드 및 사고 옵션을 요청합니다.

`hub.execute`이 부여된 데몬만 대상으로 나타납니다. Hub는 Claude Code, Codex, OpenCode, Pi 및 사용자 정의 또는 플러그인 공급자를 포함하여 Paseo 데몬에 구성된 모든 공급자를 지원합니다. 공급자가 사전 승인을 지원할 경우 Hub는 자체 MCP 도구를 자동으로 사전 승인합니다.

데몬이나 작업 디렉터리를 변경하면 사용 가능한 선택 항목이 다시 로드됩니다. 기존 트리거가 데몬이 더 이상 보고하지 않는 모델, 모드 또는 사고 옵션의 이름을 지정하는 경우 Hub는 해당 값을 덮어쓰지 않고 사용할 수 없는 값으로 표시합니다. 작성된 값을 유지하거나, 현재 값을 선택하거나, YAML을 직접 편집할 수 있습니다.

데몬이 오프라인이거나 최신 Paseo 버전이 필요한 경우 에이전트 선택기는 나머지 트리거를 편집 가능한 상태로 유지하면서 재시도 작업과 함께 오류를 표시합니다.

## 저장 시 데몬을 통해 에이전트 검사

데몬 검증 중에 Hub는 공급자, 모델, 모드, 사고 옵션, 공급자 고유 `options` 및 `choices`이라는 이름을 대상 데몬으로 보냅니다. 값을 사용할 수 없으면 Hub는 이를 거부하고 필드 이름을 지정합니다.

```text
run.agent.mode: Mode 'default' is not available for provider 'opencode'
```

대상 및 에이전트 설정이 동일하게 유지되면 데몬이 오프라인인 동안 대시보드를 통해 편집 내용을 저장할 수 있습니다. 예를 들어 프롬프트, 필터 또는 제한만 편집할 수 있습니다. 트리거를 생성하거나 해당 데몬, 작업 디렉터리 또는 에이전트 설정을 변경하려면 연결된 대상 데몬이 필요합니다.

Hub는 항상 `paseo hub deploy` 및 직접 API 설치(`POST /api/v1/triggers/install`)에 대해 연결된 대상 데몬에 대해 에이전트 설정의 유효성을 검사합니다. 이는 프롬프트만 변경한 경우에도 적용됩니다. `paseo hub init`이 트리거의 유효성을 검사할 때 연결된 대상 데몬도 필요합니다.

## 같은 에이전트 이어서 사용하기

트리거는 기본적으로 **동일한 대화**(`continuation: { mode: conversation }`)로 설정됩니다. 동일한 Slack 또는 Discord 스레드의 후속 메시지, 동일한 GitHub 문제 또는 풀 요청에 대한 이벤트, 동일한 Linear 문제에 대한 이벤트는 새 세션을 시작하는 대신 기존 에이전트 세션을 계속합니다. 대화가 없는 이벤트는 새 에이전트를 시작합니다.

에이전트가 아직 작업 중이면 새 프롬프트가 현재 작업을 조정합니다. 각 도착은 자체 응답 대상, 출력 제한 및 완료 계약을 유지합니다. 재사용 가능한 작업 영역이 보관된 경우 Hub는 후속 프롬프트를 전달하기 전에 이를 복원합니다.

입력 표현식으로 도착을 그룹화하려면 **사용자 정의 키**(`{ mode: key, key: "..." }`)를 선택하고, 매번 새로운 에이전트를 시작하려면 **새 에이전트**(`{ mode: new }`)를 선택하세요.

```yaml
name: support
on:
  slack.mention:
    connection: acme-slack
    filters:
      from_users: [U01234567]
run:
  target:
    daemon: laptop
    cwd: /Users/you/code/support
  agent:
    provider: codex
    mode: full-access
  continuation:
    mode: conversation
  max_runtime: 30m
  idle_timeout: 5m
  prompt: Handle this request, answer with reply, and call finish_execution when complete.
```

Hub에는 각 프롬프트에 `executionId`이 포함되어 있습니다. 계속되는 에이전트에서 `reply` 및 `finish_execution`을 호출할 때 `executionId`을 전달하여 Hub가 출력을 올바른 도착으로 라우팅하도록 합니다. [에이전트 계속](/docs/hub/configuration/reference#agent-continuation)을 참조하세요.

## 이벤트

| `on` | 다음과 같은 경우에 발생 |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `github.issue_created` | GitHub 문제가 열렸습니다.                                               |
| `github.pull_request_created` | GitHub 풀 요청이 열립니다.                                        |
| `github.pull_request_ready_for_review` | 풀 요청 초안은 검토 준비가 완료된 것으로 표시됩니다.                        |
| `github.pull_request_synchronized` | 새로운 커밋은 공개 풀 요청으로 푸시됩니다.                         |
| `github.issue_comment_created` | GitHub 문제에 댓글이 게시되었습니다.                                  |
| `github.pull_request_comment_created` | 풀 리퀘스트에는 대화 댓글이 게시됩니다.                     |
| `github.issue_label_added` | GitHub 문제에 라벨이 추가됩니다.                                     |
| `github.pull_request_label_added` | 풀 요청에 레이블이 추가됩니다.                                     |
| `linear.comment_created` | Linear 이슈에 댓글이 게시되었습니다.                                  |
| `linear.issue_assigned` | Linear 문제가 할당되거나 재할당됩니다.                               |
| `linear.issue_entered_scope` | 범위 내에서 Linear 문제가 생성되거나 범위로 전환됩니다.           |
| `slack.mention` | 봇은 Slack 채널이나 스레드에서 언급됩니다.                      |
| `discord.mention` | 봇이 Discord 채널이나 스레드에서 언급되었습니다.                    |
| `schedule.tick` | 반복되는 캘린더 일정은 해당 시간대에 실행됩니다.                   |
| `webhook.received` | 인증된 HTTP `POST`이 트리거의 웹훅 엔드포인트에 도착합니다. |
| `manual.run` | 실행은 Hub API를 통해 전달됩니다.                                |

각 트리거 소스에 대한 가이드를 읽어보세요.

- [GitHub 트리거](/docs/hub/triggers/github)
- [Linear 트리거](/docs/hub/triggers/linear)
- [Slack 트리거](/docs/hub/triggers/slack)
- [Discord 유발](/docs/hub/triggers/discord)
- [예약된 트리거](/docs/hub/triggers/schedules)
- [인바운드 웹훅](/docs/hub/triggers/webhooks)

## 필터

외부 공급자 트리거에는 비어 있지 않은 `from_users` 허용 목록이 필요합니다. 세 가지 예외가 있습니다.

- `linear.issue_entered_scope`은 `filters.project`이 필요하며 `from_users`을 생략할 수 있습니다.
- `schedule.tick`은 `recurrence`을 사용하고 `connection` 또는 `filters`을 허용하지 않습니다.
- `webhook.received`은 전달자 비밀로 발신자를 인증하고 `connection` 또는 `filters`을 허용하지 않습니다.

대시보드는 기본적으로 **대상**을 **모든 사람**으로 설정하고 `from_users: ["*"]`을 저장합니다. GitHub, Slack 및 Discord는 이 와일드카드를 허용합니다. 실행을 실행할 수 있는 사람을 제한하려면 **특정 사용자**를 선택하거나 `from_users`에 허용된 로그인 또는 사용자 ID를 나열하세요.

Linear 댓글 및 할당의 경우 **Everyone**은 일치하는 사용자가 없습니다. **특정 사용자**를 선택하고 **사용자 ID**에 허용된 Linear 사용자 UUID를 입력하거나 YAML의 `from_users`에 나열합니다.

허용 목록은 에이전트를 샌드박싱하거나 신뢰할 수 없는 텍스트를 삭제하지 않으므로 쓰기 액세스 권한을 부여하거나 대상을 확대하기 전에 [Hub 보안](/docs/hub/security)을 읽어보세요.

| 필터 | 적용 대상 | 경기 |
| ------------------ | ------------------------------ | ---------------------------------------------------------------------------------- |
| `from_users` | GitHub, Linear, Slack, Discord | GitHub 로그인 또는 Linear, Slack 및 Discord 사용자 ID |
| `repo` | GitHub | `owner/name` 형식의 저장소 |
| `workspace` | Slack | Workspace 팀 ID(`T01234567`) |
| `guild` | 불화 | 서버 길드 ID(인용 문자열) |
| `channels` | Slack, Discord | 채널 ID |
| `project` | Linear | Linear 프로젝트 UUID |
| `states` | Linear | Linear 워크플로 상태 UUID |
| `assignees` | Linear | Linear 담당자 사용자 UUID |
| `contains` | GitHub, Linear, Slack, Discord | GitHub 및 Linear 주석의 하위 문자열 또는 Slack 및 Discord의 호출 접두사 |
| `exclude_contains` | GitHub | 이벤트를 부적격하게 하는 하위 문자열 |
| `pattern` | GitHub, Linear, Slack, Discord | 텍스트 시작 부분이나 언급 뒤의 접두사 |
| `label` | GitHub 라벨 추가 이벤트 | 이 이벤트에 의해 추가된 정확한 라벨(대소문자 구분 없음) |
| `labels` | GitHub, Linear | 나열된 모든 레이블이 있어야 합니다(GitHub의 이름, Linear의 UUID) |
| `exclude_labels` | Linear | 나열된 라벨 UUID는 문제의 자격을 상실합니다 |

모든 조건은 AND로 구성됩니다. `any` 모드가 없습니다.

## 연결 고정

하나의 조직 통합 슬러그에 트리거를 고정하려면 이벤트 개체에 `connection`을 설정하세요. `connection` 또는 리소스 필터(`repo`, `workspace`, `guild`)가 없으면 트리거는 조직에서 해당 공급자의 모든 통합을 수신합니다.

```yaml
on:
  github.issue_comment_created:
    connection: acme-github
    filters:
      from_users: [alice]
```

## 두 개의 트리거가 일치하는 경우

둘 다 실행됩니다. 트리거는 독립적이고 순서가 없으며 서로 그림자를 드리우지 않습니다.

## 회신하고 Paseo 링크에서 열기

이벤트에 문제, 끌어오기 요청 또는 회신할 스레드가 있는 경우 Hub는 `reply` 도구를 부여합니다.

`github.push` 이벤트에는 응답 대상이 없습니다. 푸시에 `github.reply`이 필요한 경우 Hub는 에이전트를 시작하기 전에 실행에 실패합니다.

에이전트가 보낼 수 있는 응답 수를 제한하거나 `finish_execution`이 성공하기 전에 최소한 하나의 응답을 요구하려면 `run.outputs`을 선언하세요.

```yaml
run:
  outputs:
    slack.reply:
      max: 1
      required: true
```

`github.reply`, `linear.reply`, `slack.reply` 또는 `discord.reply`을 사용하여 트리거 소스를 일치시킵니다. Hub는 도구 지침을 추가하기 위해 프롬프트를 다시 작성하지 않으므로 프롬프트는 에이전트에게 `reply` 및 `finish_execution`을 호출하라고 알려야 합니다. [출력 기능](/docs/hub/configuration/reference#output-capabilities)을 참조하세요.

Hub에 구성된 HTTPS 원본이 있고 실행에 기록된 데몬 에이전트가 있는 경우 Hub는 로그인한 조직 구성원이 Paseo에서 라이브 세션을 열거나 Hub에서 실행을 검사할 수 있도록 대화 응답에 **Open in Paseo** 링크를 추가합니다.

모든 트리거(일정, 웹훅, GitHub 및 Linear 포함)에서 Slack 또는 Discord 채널을 읽거나 게시하려면 [통합 도구](/docs/hub/tools)를 부여하세요.
