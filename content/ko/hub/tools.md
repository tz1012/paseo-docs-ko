---
title: Integration tools
description: Grant any Hub trigger scoped Slack and Discord read and post tools through Hub MCP.
nav: Integration tools
order: 71
category: Hub
---

# 통합 도구

모든 Hub 트리거는 Hub MCP 서버를 통해 에이전트에 범위가 지정된 Slack 및 Discord 도구를 부여할 수 있습니다. 일일 일정은 CI 요약을 Slack에 게시할 수 있고, 웹후크 핸들러는 업데이트를 게시하기 전에 최근 Discord 컨텍스트를 읽을 수 있으며, GitHub 트리거는 외부 CLI를 설치하거나 데몬에 채팅 토큰을 넣지 않고도 Slack 채널에 알릴 수 있습니다.

Hub는 서버에 공급자 토큰을 유지하고 모든 도구 호출에 연결, 작업 및 채널 허용 목록을 적용합니다.

## 대시보드 또는 YAML에서 구성

1. Hub 트리거 편집기에서 **통합 액세스**를 엽니다.
2. **통합 추가**를 선택한 다음 **Slack** 또는 **Discord**를 선택합니다.
3. **연결**에서 통합을 선택합니다.
4. **채널 ID**에 허용되는 채널 ID를 입력하세요.
5. **메시지 읽기**, **메시지 게시** 또는 둘 다를 선택합니다.

`.paseo/triggers/*.yml`에 `run.tools`을 추가합니다.

```yaml
name: nightly-digest
on:
  schedule.tick:
    recurrence:
      start: "2026-09-09T08:00:00"
      rule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
      timezone: America/New_York
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    provider: codex
    mode: full-access
  continuation:
    mode: new
  tools:
    slack:
      connection: engineering-slack
      actions: [post]
      channels: [C012AB3CD]
    discord:
      connection: community-discord
      actions: [read, post]
      channels: ["123456789012345678"]
  prompt: |
    Scan recent Discord messages with discord_latest, summarize open bugs,
    and post the digest to Slack channel C012AB3CD with slack_post.
    Call finish_execution when done.
```

## 부여 필드

| 필드 | 필수 | 메모 |
| ------------ | -------- | ---------------------------------------------------------------------------------- |
| `connection` | 예 | `engineering-slack`과 같은 **Integrations**의 통합 슬러그입니다.               |
| `actions` | 예 | `read`, `post` 또는 둘 다를 포함하는 비어 있지 않은 목록입니다.                                 |
| `channels` | 예 | 1~50개의 채널 ID로 구성된 명시적 허용 목록입니다. Discord 눈송이 ID를 문자열로 인용하세요. |

채널 ID를 복사하려면 [Slack ID 찾기](/docs/hub/triggers/slack#find-your-slack-ids) 및 [Discord ID 찾기](/docs/hub/triggers/discord#find-your-discord-ids)를 참조하세요.

## 사용 가능한 Hub MCP 도구

| 그랜트 | 에이전트에 노출되는 도구 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slack 읽기 | `slack_list_channels`은 부여된 채널 ID를 나열합니다. `slack_read`은 채널 또는 스레드 메시지를 읽습니다(`nextCursor`에서 `limit`, `thread_ts`, `cursor`).                                                                                                                           |
| Slack 포스트 | `slack_post`은 부여된 채널에 게시하거나 시작 `thread_ts`을 사용하여 스레드에 응답합니다.                                                                                                                                                                                |
| 불화 읽기 | `discord_list_channels`은 부여된 채널과 포럼을 나열합니다. `discord_read`은 채널, 포럼, 스레드 또는 정확한 메시지 URL(`before` `nextBefore`)을 읽습니다. `discord_latest`은 활성 스레드와 최근 보관된 스레드를 포함하여 부여된 채널 전체에서 최근 메시지를 검색합니다. |
| Discord 포스트 | `discord_post`은 부여된 채널에 게시하고, 스레드로 응답하거나, 채널 메시지에서 상황별 스레드를 엽니다.                                                                                                                                                           |

## 시행 및 행동

- Hub는 선언된 `connection`, `actions` 및 `channels`에 대해 모든 도구 호출을 확인합니다. Discord 스레드 및 포럼 게시물 액세스는 스레드의 상위 채널이 `channels`에 있는 경우에만 허용됩니다.
- Hub에 HTTPS 원본과 기록된 데몬 에이전트가 있는 경우 `post` 액세스 권한이 있는 에이전트는 요청 컨텍스트에서 실행의 **Paseo**에서 열기 URL을 수신하므로 다이제스트 및 보고서가 세션에 직접 링크될 수 있습니다.
- 도구 계약이 활성 세션에 속하기 때문에 계속되는 트리거에서 `run.tools`을 변경하려면 **새 에이전트**(`continuation: { mode: new }`) 또는 다음 실행 시 새 연속 키가 필요합니다.
- `run.tools` 블록이 YAML 앵커 또는 별칭을 사용하는 경우 Hub가 해당 참조를 유지하도록 YAML 보기에서 트리거를 편집합니다.
