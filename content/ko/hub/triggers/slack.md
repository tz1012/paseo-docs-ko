---
title: Slack triggers
description: Configure Slack mentions and thread replies in one workflow file.
nav: Slack
order: 68
category: Hub
---

# 슬랙 트리거

`slack.mention` 봇이 존재하는 채널에서 봇이 언급되면 실행됩니다. 직접 메시지, 슬래시 명령 및 대화형 구성 요소는 이 트리거를 생성하지 않습니다.

`.paseo/workflows/slack-help.yml`:

```yaml
name: slack-help
on: slack.mention
max_runtime: 1h
filters:
  workspace: T01234567
  channels: [C01234567]
  from_users: [U01234567]
steps:
  - id: answer
    environment: dev
    max_runtime: 30m
    idle_timeout: 5m
    agent: codex
    prompt:
      - text: |
          Answer with hub.reply, then call hub.finish_execution.
          ${{ paseo.prompt }}
    allow_outputs:
      - { type: slack.reply, max: 1, required: true }
```

Slack 필터는 표시 이름이 아닌 ID를 사용합니다. `from_users`은 작성자, `workspace` 팀, `channels` 채널과 일치합니다. `pattern`은 멘션 뒤에 필수 접두사입니다. `contains`은 레거시 별칭이며 동일한 접두사 동작을 갖습니다. 모든 필터는 통과해야 합니다.

응답은 트리거 스레드에 게시됩니다. 루트 메시지는 스레드를 얻습니다. 스레드된 메시지가 그대로 유지됩니다. `slack.reply`은 `hub.reply`을 부여하지만 프롬프트에 응답 지침을 추가하지 않습니다.

주요 선언 입력은 다음과 같습니다.

```text
@Paseo repo=project agent=claude investigate the failed sync
```

허브는 연속적으로 선언된 헤더를 사용하고 나머지를 `${{ paseo.prompt }}`으로 노출합니다. [워크플로](/docs/hub/workflows)를 참조하세요.