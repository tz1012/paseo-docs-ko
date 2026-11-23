---
title: Discord triggers
description: Start Hub agents from Discord mentions and reply in the channel or thread.
nav: Discord
order: 68
category: Hub
---

# Discord 트리거

`discord.mention` 누군가가 Discord 서버 채널이나 스레드에서 봇이나 관리되는 역할을 언급하면 ​​실행됩니다.

먼저 **통합**에서 Discord 서버를 연결하세요(또는 자체 호스팅 Hub에서 [Discord 앱](/docs/hub/self-hosting/discord-app)을 구성하세요).

`.paseo/triggers/discord-help.yml`:

```yaml
name: discord-help
on:
  discord.mention:
    connection: acme-discord
    filters:
      guild: "123456789012345678"
      channels: ["234567890123456789"]
      from_users: ["345678901234567890"]
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
    discord.reply:
      max: 1
      required: true
```

## 필터 및 프롬프트 텍스트

Discord 필터는 서버 이름, 표시 이름 또는 연결 슬러그가 아닌 숫자로 된 눈송이 ID를 사용합니다. YAML이 이를 문자열로 유지하도록 모든 눈송이 ID를 인용하세요.

`from_users`은 필수이며 보낸 사람과 일치하는 반면, `guild` 및 `channels`은 멘션이 도착한 위치를 제한합니다. `pattern`은 멘션 뒤에 접두사가 필요합니다(`contains`은 접두사 동작이 동일한 레거시 별칭입니다). 모든 필터는 AND로 구성됩니다.

`${{ paseo.prompt }}`에는 전체 메시지가 포함되어 있습니다. Hub는 선언한 입력에 대한 언급 이후 주요 `key=value` 토큰을 구문 분석합니다. `inputs.repo`을 선언하는 경우 `run.prompt`에 `${{ paseo.inputs.repo }}`을 사용하여 해당 값을 삽입합니다.

`${{ paseo.context }}`을 `run.prompt`에 포함하여 참조된 메시지, 스레드 기록 및 첨부 파일 설명자를 JSON으로 전달합니다.

## 답변 및 계속

Hub는 Discord 채널이나 스레드를 실행하여 답변을 게시합니다. 동일한 스레드의 후속 멘션은 기본적으로 동일한 에이전트를 계속합니다.

Discord 트리거는 자동으로 `reply` 도구(`discord.reply`)를 부여합니다. `run.outputs.discord.reply`을 선언하여 `max` 또는 `required: true`을 시행합니다. Hub가 HTTPS를 통해 실행되면 회신에는 **Paseo**에서 열기 링크가 포함됩니다.

일정, 웹훅 또는 다른 트리거에서 Discord 채널 및 포럼을 읽거나 게시하려면 [통합 도구](/docs/hub/tools)를 사용하세요. 에이전트 저장소 액세스 권한을 부여하려면 [`run.github` 블록](/docs/hub/github)을 추가하세요.

## Discord ID 찾기

Discord에서 **설정 → 고급 → 개발자 모드**를 켭니다. 서버를 마우스 오른쪽 버튼으로 클릭하고 `guild`에 대해 **서버 ID 복사**를 선택하고, 채널을 마우스 오른쪽 버튼으로 클릭하고 `channels`에 대해 **채널 ID 복사**를 선택한 다음, 사용자를 마우스 오른쪽 버튼으로 클릭하고 `from_users`에 대해 **사용자 ID 복사**를 선택합니다.

`paseo hub init`은 연결된 Discord 서버를 자동으로 선택하고 사용자 ID를 묻습니다.
