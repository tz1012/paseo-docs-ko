---
title: Slack for Hub
description: Connect Slack to your self-hosted Hub over Socket Mode or webhooks.
nav: Slack app
order: 80
category: Hub
---

# Hub용 Slack

Slack은 두 가지 방법으로 자체 호스팅 Hub에 연결할 수 있습니다.

| 전송 방식   | 공개 HTTPS 필요 | 적합한 용도                         |
| ----------- | --------------- | ----------------------------------- |
| Socket Mode | 아니요          | 로컬, 개인용, 단일 프로세스 Hub     |
| Webhooks    | 예              | 공개 서버 배포                      |

소켓 모드는 브라우저 설정의 기본값입니다. 두 전송 모두 `slack.mention` 트리거, 스레드 응답 및 [범위가 지정된 Slack 통합 도구](/docs/hub/tools)를 지원합니다.

## Socket Mode 설정

Hub에서 **앱 → Slack**을 열고 **소켓 모드**를 선택한 상태로 유지하세요. Hub는 Slack 매니페스트를 생성하고 다음 단계를 안내합니다.

1. 생성된 매니페스트에서 Slack 앱을 생성합니다.
2. `connections:write` 범위로 앱 수준 토큰을 생성합니다.
3. 앱을 설치하고 Bot User OAuth 토큰을 복사합니다.
4. 두 토큰을 모두 Hub에 붙여넣고 **Connect Slack**을 선택합니다.

Hub는 설치를 확인하고 이를 **통합**에 저장한 후 아웃바운드 소켓 모드 연결을 엽니다.

시청하거나 게시하는 각 채널에 봇을 초대합니다.

```text
/invite @Paseo
```

소켓 모드는 Hub 프로세스에서 하나의 라이브 연결을 유지합니다. Hub가 중지된 동안 도착하는 이벤트가 누락되므로 소켓 모드에 대해 하나의 Hub 프로세스를 실행하고 계속 실행하세요.

다음으로 [Slack 트리거](/docs/hub/triggers/slack)를 생성합니다.

## 웹훅 사용

Slack이 공개 Hub에 이벤트를 보낼 때 **웹후크**를 선택하세요. 생성된 매니페스트가 올바른 URL을 사용하도록 설정하기 전에 [공개 HTTPS 주소](/docs/hub/self-hosting#public-addresses)에서 Hub를 엽니다.

**앱 → Slack**은 웹훅 매니페스트를 제공하고 **앱 ID**, **클라이언트 ID**, **클라이언트 비밀번호** 및 **서명 비밀번호**를 요청합니다. 작업 공간을 승인할 수 있도록 Slack에 계속 저장됩니다. 작업 영역이 활성 Hub 조직에 바인딩되도록 항상 Hub에서 작업 영역 설치를 시작하십시오.

Slack은 다음 Hub URL을 호출합니다.

| 제공업체 설정 | Hub URL                                               |
| ------------- | ----------------------------------------------------- |
| 리디렉션 URL  | `<PASEO_HUB_APP_URL>/api/integrations/slack/callback` |
| 요청 URL      | `<PASEO_HUB_APP_URL>/api/integrations/slack/events`   |

## 환경에서 구성

Hub 외부에서 비밀을 관리하는 배포는 환경 변수를 통해 하나의 완전한 전송을 구성할 수 있습니다.

Socket Mode:

```dotenv
SLACK_TRANSPORT=socket
SLACK_APP_ID=A01234567
SLACK_APP_TOKEN=xapp-...
```

봇 사용자 OAuth 토큰은 소켓 모드 환경 변수가 아닌 **통합** 아래에 저장된 각 Slack 작업 영역에 연결된 상태로 유지됩니다.

Webhooks:

```dotenv
SLACK_TRANSPORT=webhook
SLACK_APP_ID=A01234567
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...
```

환경 구성은 저장된 Slack 앱보다 우선하며 **Apps**에 **Managed by environment**로 표시됩니다.
