---
title: Discord triggers
description: Configure Discord mentions and replies in one workflow file.
nav: Discord
order: 69
category: Hub
---

# Discord 트리거

`discord.mention`은 길드 채널이나 스레드에서 봇이나 관리 역할이 언급될 때 실행됩니다.

`.paseo/workflows/discord-help.yml`:

```yaml
name: discord-help
on: discord.mention
max_runtime: 1h
filters:
  guild: "123456789012345678"
  channels: ["234567890123456789"]
  from_users: ["345678901234567890"]
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
      - { type: discord.reply, max: 1, required: true }
```

Discord 필터는 서버 이름, 표시 이름, Hub 연결 슬러그가 아닌 ID를 사용합니다. `from_users`는 작성자와 일치하고, `guild`와 `channels`는 멘션이 도착한 위치를 제한합니다. `pattern`은 멘션 뒤의 필수 접두사입니다. `contains`는 레거시 별칭이며 같은 접두사 동작을 갖습니다. 모든 필터가 통과해야 합니다.

응답은 트리거 스레드 또는 채널에 게시됩니다. `discord.reply`은 `hub.reply`을 부여하지만 프롬프트를 다시 작성하지는 않습니다. Discord 트리거는 GitHub 자격 증명을 부여하지 않습니다. 필요한 단계에 [`github` 블록](/docs/hub/github)을 추가하세요.

주요 선언 입력은 언급을 따릅니다. Hub는 나머지 텍스트를 `${{ paseo.prompt }}`으로 노출합니다. [워크플로](/docs/hub/workflows)를 참조하세요.

## Discord ID 찾기

**Settings → Advanced → Developer Mode**를 켠 다음 마우스 오른쪽 버튼을 클릭해 `guild`에는 **Copy Server ID**, `channels`에는 **Copy Channel ID**, `from_users`에는 **Copy User ID**를 사용하세요. 세 값 모두 숫자 snowflake이므로 YAML에서 문자열로 유지되도록 따옴표로 묶으세요.

[안내형 설정](/docs/hub/quickstart)은 연결한 Discord 앱에서 `guild`를 채우고 사용자 ID를 묻습니다.
