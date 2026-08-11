---
title: Self-hosting Hub
description: Deploy Paseo Hub with PostgreSQL and a public HTTPS origin, using Docker Compose or Fly.
nav: Self-hosting
order: 74
category: Hub
---

# 자체 호스팅 허브

Hub는 PostgreSQL이 지원하는 노드 서비스입니다. 외부 공급자를 연결하려면 콜백 및 웹훅을 위한 공개 HTTPS URL이 필요합니다.

1. [Docker Compose](#docker-compose) 또는 [Fly](#fly)를 사용하여 허브를 배포합니다.
2. 원하는 [GitHub 앱](/docs/hub/self-hosting/github-app), [Slack 앱](/docs/hub/self-hosting/slack-app), [Discord 앱](/docs/hub/self-hosting/discord-app)을 만듭니다.
3. [빠른 시작](/docs/hub/quickstart)을 따르세요.

마이그레이션은 시작 시 자동으로 실행됩니다. 마이그레이션이 실패하면 허브가 수신 대기를 시작하지 않습니다.

## 구성

허브에는 하나의 공개 URL과 하나의 영구 애플리케이션 비밀이 있습니다.

| 변수 | 목적 |
| ---------- | -------------------------------------------------- |
| `PASEO_HUB_APP_URL` | 대시보드, 인증, 콜백 및 웹후크에서 사용되는 공개 원본 |
| `PASEO_HUB_AUTH_SECRET` | 브라우저 세션을 보호하고 실행 자격 증명을 파생합니다 |
| `DATABASE_URL` | PostgreSQL 연결 문자열 |

`PASEO_HUB_AUTH_SECRET`을 한 번 생성하고 다시 시작해도 유지합니다.

```sh
openssl rand -hex 32
```

이를 변경하면 모든 사람이 로그아웃되고 아직 실행 중인 실행에 대한 완료 자격 증명이 무효화됩니다.

다음을 사용하여 첫 번째 소유자를 부트스트랩합니다.

```dotenv
PASEO_BOOTSTRAP_ORGANIZATION=My organization
PASEO_BOOTSTRAP_OWNER_EMAIL=me@example.com
PASEO_BOOTSTRAP_OWNER_PASSWORD=replace-with-a-temporary-password
```

비밀번호는 12자 이상이어야 합니다. 한 번 로그인하고 대시보드에서 교체한 다음 배포에서 `PASEO_BOOTSTRAP_OWNER_PASSWORD`을 제거하세요. Hub는 계정과 조직을 유지합니다.

### 제공업체

연결하려는 각 공급자에 대한 그룹을 설정합니다. 자격 증명이 누락된 공급자는 Connections에 **설정 필요**로 표시됩니다.

```sh
# GitHub
GITHUB_APP_SLUG=
GITHUB_APP_ID=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=          # or GITHUB_APP_PRIVATE_KEY_PATH
GITHUB_WEBHOOK_SECRET=

# Slack
SLACK_APP_ID=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
```

각 값의 출처는 [GitHub](/docs/hub/self-hosting/github-app), [Slack](/docs/hub/self-hosting/slack-app) 및 [Discord](/docs/hub/self-hosting/discord-app)를 참조하세요.

## 도커 작성

저장소에는 Hub와 PostgreSQL이 하나의 Compose 스택으로 포함되어 있습니다.

```sh
git clone https://github.com/getpaseo/hub.git
cd hub
cp .env.example .env
```

`PASEO_HUB_APP_URL`, `PASEO_HUB_AUTH_SECRET` 및 `.env`의 세 가지 부트스트랩 값을 설정한 후 다음을 실행합니다.

```sh
docker compose up -d
```

스택은 `3000` 포트에 Hub를 게시하고 PostgreSQL 데이터를 명명된 볼륨에 저장합니다. 허브 이미지는 `ghcr.io/getpaseo/hub:latest`입니다.

### 캐디를 사용한 HTTPS

Compose는 `3000` 포트에서 일반 HTTP를 제공합니다. TLS를 종료하려면 동일한 호스트에서 Caddy를 실행하십시오.

```caddyfile
hub.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

호스트에서 `hub.example.com`을 지정하고 포트 80 및 443을 엽니다. 캐디가 [인증서를 획득하고 갱신](https://caddyserver.com/docs/automatic-https)합니다.

그런 다음 `.env`에 설정합니다.

```dotenv
PASEO_HUB_APP_URL=https://hub.example.com
PASEO_HUB_TRUSTED_CLIENT_IP_HEADER=x-forwarded-for
```

`3000` 포트를 공용 인터페이스에서 분리하려면 `compose.yml`의 `hub` 포트를 `"127.0.0.1:3000:3000"`으로 변경하세요.

## 날다

저장소를 복제하고 귀하가 제어하는 이름으로 앱과 데이터베이스를 만듭니다.

```sh
git clone https://github.com/getpaseo/hub.git
cd hub
fly apps create your-hub
fly postgres create --name your-hub-db
fly postgres attach your-hub-db -a your-hub
```

사용하는 공급자에 대한 자격 증명과 함께 애플리케이션 비밀 및 부트스트랩 계정을 설정합니다.

```sh
fly secrets set -a your-hub \
  PASEO_HUB_AUTH_SECRET="$(openssl rand -hex 32)" \
  PASEO_BOOTSTRAP_ORGANIZATION="My organization" \
  PASEO_BOOTSTRAP_OWNER_EMAIL=me@example.com \
  PASEO_BOOTSTRAP_OWNER_PASSWORD=replace-with-a-temporary-password
```

저장소에서 Dockerfile을 배포합니다.

```sh
fly deploy -a your-hub \
  -e PASEO_HUB_APP_URL=https://your-hub.fly.dev
```

하나의 기계를 계속 실행하십시오. Hub는 Discord 게이트웨이 연결을 유지하고 이벤트를 데몬에 전달하므로 중지된 시스템은 이벤트를 놓칩니다.

## 제공자 URL

Slack과 GitHub는 허브(`PASEO_HUB_APP_URL`)에 전화합니다.

| 공급자 설정 | URL |
| --------------- | ----------------------------------------- |
| GitHub 웹훅 | `<PASEO_HUB_APP_URL>/webhook` |
| GitHub OAuth 콜백 | `<PASEO_HUB_APP_URL>/api/integrations/github/callback` |
| Slack 이벤트 API 요청 URL | `<PASEO_HUB_APP_URL>/api/integrations/slack/events` |
| Slack OAuth 콜백 | `<PASEO_HUB_APP_URL>/api/integrations/slack/callback` |

Slack에서는 유효한 인증서를 사용하여 HTTPS를 통해 공개적으로 연결할 수 있는 Events API 요청 URL이 필요하며 [OAuth 리디렉션 URL](https://docs.slack.dev/authentication/installing-with-oauth/)은 HTTPS를 사용해야 합니다. Slack의 [HTTP 요청 URL](https://docs.slack.dev/apis/events-api/using-http-request-urls/) 요구 사항을 참조하세요.

GitHub는 기본적으로 웹훅 URL에 접속하고 [SSL 인증서를 확인](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks#use-https-and-ssl-verification)해야 합니다.

`localhost`의 허브 또는 LAN 주소는 여전히 수동 및 데몬 워크플로를 실행하지만 Slack과 GitHub는 이에 연결할 수 없습니다. 공급자 설정을 로컬에서 테스트하려면 허브를 시작하기 전에 HTTPS 터널에서 `PASEO_HUB_APP_URL`을 지정하세요. 터널 원본이 변경되면 공급자 설정을 업데이트하고 허브를 다시 시작해야 합니다.

## 업그레이드

새 이미지나 소스를 가져와 배포합니다. 마이그레이션은 앞으로만 수행됩니다. 먼저 PostgreSQL을 백업하세요. 여기에는 구성 개정, 연결 및 실행 기록이 포함됩니다.