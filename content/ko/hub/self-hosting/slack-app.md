---
title: Slack for Hub
description: Create the Slack app your Hub uses, connect a workspace, and write Slack triggers.
nav: Slack app
order: 76
category: Hub
---

# 허브용 Slack

Hub는 Events API를 통해 Slack 멘션을 수신합니다. 소켓 모드는 사용되지 않으므로 허브에는 유효한 인증서를 사용하여 공개적으로 연결할 수 있는 HTTPS 원본이 필요합니다. [공급자 URL](/docs/hub/self-hosting#provider-urls)을 참조하세요.

## 앱 만들기

[api.slack.com/apps](https://api.slack.com/apps) → **새 앱 만들기 → 매니페스트에서**으로 이동하여 `hub.example.com`을 `PASEO_HUB_APP_URL`으로 바꾼 후 붙여넣습니다.

```yaml
display_information:
  name: Paseo
features:
  bot_user:
    display_name: Paseo
    always_online: false
oauth_config:
  redirect_urls:
    - https://hub.example.com/api/integrations/slack/callback
  scopes:
    bot:
      - app_mentions:read
      - chat:write
      - reactions:write
settings:
  event_subscriptions:
    request_url: https://hub.example.com/api/integrations/slack/events
    bot_events:
      - app_mention
  interactivity:
    is_enabled: false
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

## 허브 구성

**기본 정보 → 앱 자격 증명**에서 다음을 복사하세요.

| 가치 | 환경 변수 |
| -------------- | --------- |
| 앱 ID | `SLACK_APP_ID` |
| 클라이언트 ID | `SLACK_CLIENT_ID` |
| 클라이언트 비밀 | `SLACK_CLIENT_SECRET` |
| 서명 비밀 | `SLACK_SIGNING_SECRET` |

Slack이 요청 URL을 확인하기 전에 허브를 다시 시작하세요. 허브는 확인 문제에 응답하기 위해 서명 비밀이 필요합니다.

## 연결

**연결 → Slack → 연결**을 열고 작업공간을 선택한 후 허용하세요.

Slack의 **Install to Workspace**가 아닌 Hub의 버튼을 사용하세요. 작업 영역이 조직에 바인딩되도록 설치는 허브에서 시작되어야 합니다.

그런 다음 시청해야 하는 각 채널에 봇을 초대합니다.

```text
/invite @Paseo
```

이제 트리거를 작성합니다: [Slack 트리거](/docs/hub/triggers/slack).