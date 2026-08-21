---
title: Slack for Hub
description: Connect Slack over Socket Mode, or use webhooks from a public Hub.
nav: Slack app
order: 76
category: Hub
---

# Hub용 Slack

Slack은 두 가지 방식으로 Hub에 연결할 수 있습니다.

| 전송 방식   | 공개 HTTPS 필요 | 적합한 용도                         |
| ----------- | --------------- | ----------------------------------- |
| Socket Mode | 아니요          | 로컬, 개인용, 단일 프로세스 Hub     |
| Webhooks    | 예              | 공개 서버 배포                      |

브라우저 설정에서는 Socket Mode가 기본값입니다. 두 전송 방식 모두 같은 `slack.mention` 트리거와 스레드 응답을 생성합니다.

## Socket Mode 설정

Hub에서 **Apps → Slack**을 열고 **Socket Mode**를 선택한 상태로 두세요. Hub는 Slack 매니페스트와 다음 작업의 정확한 단계를 안내합니다.

1. 매니페스트에서 Slack 앱을 만듭니다.
2. `connections:write` 권한이 있는 App-level token을 생성합니다.
3. 앱을 설치하고 Bot User OAuth Token을 복사합니다.

두 토큰을 Hub에 붙여 넣고 **Connect Slack**을 선택하세요. Hub는 설치를 검증하고 활성 조직에 저장한 뒤 아웃바운드 Socket Mode 연결을 엽니다.

봇이 지켜볼 각 채널에 봇을 초대합니다.

```text
/invite @Paseo
```

이제 [Slack 트리거](/docs/hub/triggers/slack)를 작성하세요.

Socket Mode는 Hub 프로세스에 하나의 활성 연결을 유지합니다. 이 전송 방식을 사용할 때는 Hub 프로세스를 하나만 실행하고 계속 가동하세요. 중지된 동안 도착한 이벤트는 놓치게 됩니다.

## 웹훅 사용

Slack이 안정적인 공개 Hub로 이벤트를 보내게 하려면 **Webhooks**를 선택하세요. 생성되는 리디렉션 및 요청 URL이 정확하도록 설정하기 전에 Hub를 공개 HTTPS 주소에서 열어야 합니다.

Apps 안내에서는 웹훅 매니페스트를 제공하고 App ID, Client ID, Client Secret, Signing Secret을 입력하도록 요청합니다. 저장하면 Slack으로 이동하여 앱을 워크스페이스에 설치할 수 있습니다.

Slack은 다음 URL을 호출합니다.

| 제공업체 설정 | Hub URL                                               |
| ------------- | ----------------------------------------------------- |
| 리디렉션 URL  | `<PASEO_HUB_APP_URL>/api/integrations/slack/callback` |
| 요청 URL      | `<PASEO_HUB_APP_URL>/api/integrations/slack/events`   |

Hub에서 설치를 시작하세요. Slack에서만 시작한 설치는 Hub 조직에 연결되지 않습니다.

## 환경에서 구성

앱 비밀을 Hub 외부에 보관하는 배포에서는 하나의 완전한 전송 구성을 사용할 수 있습니다.

Socket Mode:

```dotenv
SLACK_TRANSPORT=socket
SLACK_APP_ID=A01234567
SLACK_APP_TOKEN=xapp-...
```

Bot User OAuth Token은 저장된 각 Slack 워크스페이스 연결에 계속 연결되어 있으며 Socket Mode 환경 구성에는 포함되지 않습니다.

Webhooks:

```dotenv
SLACK_TRANSPORT=webhook
SLACK_APP_ID=A01234567
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...
```

환경 구성은 저장된 Slack 앱보다 우선하며 **Apps**에 **Managed by environment**로 표시됩니다.
