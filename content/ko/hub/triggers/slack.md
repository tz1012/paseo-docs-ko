---
title: Slack triggers
description: Start Hub agents from Slack channel and thread mentions and reply in thread.
nav: Slack
order: 67
category: Hub
---

# Slack 트리거

`slack.mention`은 누군가 Slack 채널이나 봇이 있는 스레드에서 봇을 언급할 때 실행됩니다. 직접 메시지, 슬래시 명령 및 대화형 구성 요소는 이 이벤트를 실행하지 않습니다.

먼저 **통합**에서 Slack 작업 공간을 연결하고(또는 자체 호스팅 Hub에서 [Slack 앱](/docs/hub/self-hosting/slack-app) 구성) 봇이 시청하는 채널에 초대합니다.

`.paseo/triggers/slack-help.yml`:

```yaml
name: slack-help
on:
  slack.mention:
    connection: acme-slack
    filters:
      workspace: T01234567
      channels: [C01234567]
      from_users: [U01234567]
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    provider: codex
    mode: full-access
  continuation:
    mode: conversation
  max_runtime: 30m
  idle_timeout: 5m
  prompt: |
    Answer the request using reply, then call finish_execution.

    <user-prompt>
    ${{ paseo.prompt }}
    </user-prompt>
  outputs:
    slack.reply:
      max: 1
      required: true
```

## 필터 및 프롬프트 텍스트

Slack 필터는 표시 이름이나 연결 슬러그가 아닌 ID를 사용합니다. 모든 필터는 AND로 구성됩니다.

- `from_users`은 필수이며 보낸 사람의 Slack 회원 ID와 일치합니다.
- `workspace`은 Slack 팀 ID와 일치하고 `channels`은 실행을 트리거할 수 있는 채널을 제한합니다.
- `pattern`은 멘션 뒤에 접두사가 필요합니다(`contains`은 접두사 동작이 동일한 레거시 별칭입니다).

`${{ paseo.prompt }}`에는 전체 메시지가 포함되어 있습니다. Hub는 선언한 입력에 대한 언급 이후 주요 `key=value` 토큰을 구문 분석합니다. `inputs.repo`을 선언하는 경우 `run.prompt`에 `${{ paseo.inputs.repo }}`을 사용하여 해당 값을 삽입합니다.

```text
@Paseo repo=project investigate the failed sync
```

`${{ paseo.context }}`을 `run.prompt`에 포함하여 Slack 스레드 기록 및 실행 범위 첨부 설명자를 JSON으로 전달합니다.

## 답변 및 계속

Hub는 트리거하는 Slack 스레드에 응답을 게시합니다. 채널 메시지는 스레드를 시작하고 스레드 내부의 응답은 해당 스레드에 유지됩니다. 동일한 스레드의 후속 멘션은 기본적으로 동일한 에이전트를 계속합니다.

Slack 트리거는 자동으로 `reply` 도구(`slack.reply`)를 부여합니다. `max` 답변을 제한하거나 `required: true`을 설정하려면 `run.outputs.slack.reply`을 선언하세요. Hub가 HTTPS를 통해 실행되면 회신에는 **Paseo**에서 열기 링크가 포함됩니다.

일정, 웹훅 또는 다른 트리거에서 Slack 채널을 읽거나 게시하려면 [통합 도구](/docs/hub/tools)를 사용하세요. 에이전트 저장소 액세스 권한을 부여하려면 [`run.github` 블록](/docs/hub/github)을 추가하세요.

## Slack ID 찾기

| 필터 | 복사할 위치 |
| ------------ | ------------------------------------------------------------------------------------------ |
| `workspace` | 브라우저에서 Slack을 엽니다. 팀 ID는 URL의 `T...` 세그먼트입니다.                     |
| `from_users` | 아바타를 열고 **프로필**, **⋮**, **회원 ID 복사**(`U`으로 시작)를 엽니다. |
| `channels` | 채널 이름을 연 다음 **정보**를 엽니다. 채널 ID는 하단에 있습니다(`C`으로 시작).  |

`paseo hub init`은 Slack 연결을 자동으로 읽고 회원 ID만 묻는 메시지를 표시합니다.
