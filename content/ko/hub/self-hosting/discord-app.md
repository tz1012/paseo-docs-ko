---
title: Discord for Hub
description: Create the Discord application your Hub uses, connect a guild, and write Discord triggers.
nav: Discord app
order: 77
category: Hub
---

# 허브에 대한 불일치

Hub는 귀하가 소유한 봇을 사용하여 게이트웨이를 통해 Discord에 연결됩니다. GitHub 및 Slack과 달리 Discord는 허브에 게시하지 않습니다. Hub는 아웃바운드 연결을 보유하므로 OAuth 콜백 외에는 공개 웹후크가 필요하지 않습니다.

## 애플리케이션 생성

[Discord 개발자 포털](https://discord.com/developers/applications) → **새 애플리케이션**으로 이동하세요.

**봇** 아래:

- 봇을 추가하고 해당 토큰을 복사합니다.
- **메시지 콘텐츠 의도**를 활성화합니다. 이것이 없으면 봇은 빈 메시지를 수신하며 일치하는 트리거가 없습니다.
- 서버 구성원 의도가 필요하지 않습니다.

**OAuth2** 아래에 리디렉션 URL을 추가합니다.

```text
https://hub.example.com/api/integrations/discord/callback
```

`hub.example.com`을 `PASEO_HUB_APP_URL`으로 바꾸세요.

## 허브 구성

| 가치 | 환경 변수 |
| -------------- | ---------- |
| 애플리케이션 ID | `DISCORD_CLIENT_ID` |
| 클라이언트 비밀 | `DISCORD_CLIENT_SECRET` |
| 봇 토큰 | `DISCORD_BOT_TOKEN` |

허브를 다시 시작하세요. Discord는 연결에서 **준비**로 표시됩니다.

## 연결

**연결 → Discord → 연결**을 열고 서버를 선택한 후 인증하세요. Hub는 봇에 필요한 권한으로 초대를 생성하므로 사용자가 직접 초대 URL을 생성하지 않습니다.

길드 이름에서 파생된 슬러그와 함께 연결이 나타납니다.

Hub는 전체 배포에 대해 하나의 게이트웨이 연결을 보유하므로 하나의 봇이 연결하는 모든 조직과 길드에 서비스를 제공합니다.

이제 트리거를 작성하세요: [Discord 트리거](/docs/hub/triggers/discord).