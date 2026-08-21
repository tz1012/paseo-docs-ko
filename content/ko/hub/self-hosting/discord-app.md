---
title: Discord for Hub
description: Create the Discord application your Hub uses and connect a server.
nav: Discord app
order: 77
category: Hub
---

# Hub용 Discord

Hub는 게이트웨이를 통해 Discord에 아웃바운드 연결을 엽니다. Discord는 이벤트 웹훅을 Hub로 보내지 않으므로 봇에 공개 인바운드 엔드포인트가 필요하지 않습니다.

**Apps → Discord**를 여세요. Hub는 리디렉션 URL과 함께 애플리케이션 생성, 봇 활성화, Application ID, Client Secret, Bot token 복사에 필요한 정확한 단계를 안내합니다.

**Bot → Privileged Gateway Intents**에서 **Message Content Intent**를 활성화하세요. 활성화하지 않으면 봇이 빈 메시지를 받아 어떤 트리거도 일치하지 않습니다. Server Members Intent는 필요하지 않습니다.

자격 증명을 Hub에 붙여 넣고 **Verify and save**를 선택하세요. 그런 다음 **Add to a Discord server**를 선택하고 서버를 승인합니다. 서버가 활성 Hub 조직에 연결되도록 Hub에서 승인을 시작하세요.

하나의 Discord 애플리케이션과 게이트웨이 연결이 이 Hub에 연결된 모든 조직과 서버를 지원합니다. Hub 프로세스를 계속 실행하세요. 중지된 동안 도착한 이벤트는 놓치게 됩니다.

이제 [Discord 트리거](/docs/hub/triggers/discord)를 작성하세요.

## 환경에서 구성

앱 비밀을 Hub 외부에 보관하는 배포에서는 다음을 설정할 수 있습니다.

```dotenv
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
```

`DISCORD_CLIENT_ID`는 **General Information**에 표시되는 Application ID입니다. 환경 구성은 저장된 Discord 애플리케이션보다 우선하며 **Apps**에 **Managed by environment**로 표시됩니다.
