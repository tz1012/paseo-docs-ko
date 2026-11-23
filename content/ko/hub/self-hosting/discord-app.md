---
title: Discord for Hub
description: Create the Discord application your self-hosted Hub uses and connect a server.
nav: Discord app
order: 81
category: Hub
---

# Hub용 Discord

Hub는 Discord 게이트웨이를 통해 Discord에 연결됩니다. Discord는 이벤트 웹후크를 Hub에 보내지 않으므로 봇에는 공개 인바운드 HTTPS 엔드포인트가 필요하지 않습니다.

## Discord 앱 설정

1. Hub에서 **앱 → Discord**를 엽니다. 리디렉션 URL을 복사하고 단계에 따라 Discord 애플리케이션을 생성하고 해당 봇을 활성화하세요.
2. Discord의 **Bot → Privileged Gateway Intents**에서 **Message Content Intent**를 활성화합니다. 이것이 없으면 봇은 빈 메시지를 수신하고 트리거는 일치할 수 없습니다. **서버 구성원 의도**는 필요하지 않습니다.
3. **애플리케이션 ID**, **클라이언트 비밀번호** 및 **봇 토큰**을 Hub에 붙여넣고 **확인 및 저장**을 선택합니다.
4. Hub에서 **Discord 서버에 추가**를 선택하고 **통합** 아래의 활성 Hub 조직에 바인딩되도록 서버에 권한을 부여합니다.

하나의 Discord 애플리케이션과 게이트웨이 연결은 이 Hub에 연결된 모든 조직과 서버에 서비스를 제공합니다. 중지된 동안 도착하는 이벤트가 누락되므로 Hub 프로세스를 계속 실행하세요.

연결된 Discord 서버는 [Discord 트리거](/docs/hub/triggers/discord)와 [범위가 지정된 Discord 통합 도구](/docs/hub/tools)를 모두 지원합니다.

## 환경에서 구성

Hub 외부에서 앱 비밀을 관리하는 배포는 다음을 설정할 수 있습니다.

```dotenv
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
```

`DISCORD_CLIENT_ID`은 Discord의 **일반 정보**에 표시되는 **애플리케이션 ID**입니다. 환경 구성은 저장된 Discord 애플리케이션보다 우선하며 **앱** 아래에 **환경에서 관리됨**으로 표시됩니다.
