---
title: Self-hosting Hub
description: Run Hub locally with its embedded database, or deploy it with PostgreSQL, Docker Compose, or Fly.
nav: Self-hosting
order: 77
category: Hub
---

# Hub 자체 호스팅

로컬 Hub에 대한 최단 경로는 다음 명령 중 하나입니다.

```sh
npx @getpaseo/hub
```

<http://localhost:3000>. 열기 새로운 Hub는 내장된 데이터베이스와 인증 비밀을 생성한 다음 운영자 계정을 생성하고 필요한 GitHub, Linear, Slack 또는 Discord 앱을 설정하는 과정을 안내합니다.

[빠른 시작](/docs/hub/quickstart)에 따라 소켓 모드를 통해 Slack을 연결하고 공개 서버 없이 첫 번째 트리거를 실행하세요.

## 로컬 데이터

`DATABASE_URL`이 없으면 Hub는 임베디드 PGlite 데이터베이스와 생성된 인증 비밀을 `$XDG_DATA_HOME/paseo-hub` 아래에 저장합니다. `XDG_DATA_HOME`이 절대 경로로 설정되지 않은 경우 Hub는 `~/.local/share/paseo-hub`를 사용합니다. 두 위치 모두 다시 시작한 뒤에도 유지됩니다.

`PASEO_HUB_DATA_DIR`을 사용하여 사용자 정의 디렉터리를 설정합니다.

```sh
PASEO_HUB_DATA_DIR=/path/to/paseo-hub-data npx @getpaseo/hub
```

임베디드 모드는 데이터 디렉터리당 하나의 Hub 프로세스를 지원하며 개인 또는 단일 프로세스 Hub에 적합합니다. 업그레이드하거나 이동하기 전에 전체 데이터 디렉터리를 백업하십시오.

## 공개 주소

Hub의 기본값은 `http://localhost:3000`입니다. 해당 주소는 대시보드, 데몬, Slack 소켓 모드, Discord 게이트웨이 및 일정에 충분합니다.

다음에는 공개 HTTPS 주소가 필요합니다.

- GitHub 이벤트 웹훅(GitHub 저장소 액세스는 웹훅 없이도 계속 작동함)
- Linear OAuth 콜백 및 웹후크
- Slack Webhooks 전송(소켓 모드에는 HTTPS가 필요하지 않음)
- 인바운드 웹훅 트리거(`/webhooks/wh_...`)
- **Paseo**에서 열기 대화 답글에 추가된 링크

Hub를 시작하기 전에 공개 HTTPS 원본을 설정하세요.

```sh
PASEO_HUB_APP_URL=https://hub.example.com npx @getpaseo/hub
```

나중에 공개 출처를 변경하는 경우 공급자 앱에서 콜백 및 웹훅 URL을 업데이트하세요. **앱** 페이지는 현재 사용 중인 원본 Hub에 대한 URL을 생성합니다.

## PostgreSQL

임베디드 데이터베이스 대신 PostgreSQL을 사용하려면 `DATABASE_URL`을 설정하세요.

```sh
DATABASE_URL=postgres://paseo:password@localhost:5432/paseo_hub \
  npx @getpaseo/hub
```

내구성 있는 서버 배포, 다중 Hub 프로세스 또는 표준 데이터베이스 백업을 위해 PostgreSQL을 사용하십시오. 마이그레이션은 시작 시 자동으로 실행되며 Hub는 마이그레이션이 실패할 경우 수신을 거부합니다.

데이터베이스는 Hub에서 생성된 인증 비밀도 저장합니다. 플랫폼이 외부 비밀 저장소에서 해당 비밀을 주입하는 경우에만 `PASEO_HUB_AUTH_SECRET`을 설정하세요.

설정된 동안 Hub는 저장된 암호를 바꾸지 않고 재정의를 사용합니다. 활성 비밀을 변경하면 대시보드 사용자가 로그아웃되고 실행이 종료될 때까지 기존 자격 증명이 유지됩니다.

## 앱 구성

인스턴스 운영자는 **앱**에서 GitHub, Linear, Slack 및 Discord를 구성합니다. Hub는 자격 증명을 데이터베이스에 저장하기 전에 확인하고 환경 구성 배포에 사용되는 것과 동일한 공급자 런타임을 시작합니다.

배포가 Hub 외부의 비밀을 관리하는 경우 환경 변수를 계속 사용할 수 있습니다. 전체 환경 구성은 저장된 애플리케이션보다 우선하며 **앱** 아래에 **환경에서 관리됨**으로 표시됩니다.

```sh
# GitHub
GITHUB_APP_SLUG=
GITHUB_APP_ID=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=          # or GITHUB_APP_PRIVATE_KEY_PATH
GITHUB_WEBHOOK_SECRET=

# Linear
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
LINEAR_WEBHOOK_SECRET=

# Slack Socket Mode
SLACK_TRANSPORT=socket
SLACK_APP_ID=
SLACK_APP_TOKEN=

# Slack Webhooks instead of Socket Mode
SLACK_TRANSPORT=webhook
SLACK_APP_ID=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=

# Discord
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
```

각 제공업체의 설정 가이드를 읽어보세요.

- [GitHub 앱](/docs/hub/self-hosting/github-app)
- [리니어 앱](/docs/hub/self-hosting/linear-app)
- [Slack 앱](/docs/hub/self-hosting/slack-app)
- [Discord 앱](/docs/hub/self-hosting/discord-app)

## 환경에서 부트스트랩

브라우저 설정은 새 데이터베이스의 기본값입니다. 무인 배포의 경우 대신 환경 변수에서 첫 번째 연산자를 만듭니다.

```dotenv
PASEO_BOOTSTRAP_ORGANIZATION=My organization
PASEO_BOOTSTRAP_OWNER_EMAIL=me@example.com
PASEO_BOOTSTRAP_OWNER_PASSWORD=replace-with-a-temporary-password
```

비밀번호는 12자 이상이어야 합니다. 한 번 로그인하고 대시보드에서 비밀번호를 교체한 후 `PASEO_BOOTSTRAP_OWNER_PASSWORD`을 제거하세요. Hub는 계정과 조직을 유지합니다.

## Docker Compose

Hub 저장소에는 Hub 및 PostgreSQL용 Compose 스택이 포함되어 있습니다.

```sh
git clone https://github.com/getpaseo/hub.git
cd hub
cp .env.example .env
docker compose up -d
```

<http://localhost:3000>을 열고 브라우저 설정을 완료하세요. 공개 배포에서는 `PASEO_HUB_APP_URL`과 필요한 리버스 프록시 설정을 스택을 시작하기 전에 `.env`에 지정하세요.

스택은 `3000` 포트에 Hub를 게시하고 PostgreSQL 데이터를 명명된 볼륨에 저장합니다. 게시된 컨테이너 이미지는 `ghcr.io/getpaseo/hub:latest`입니다.

### Caddy로 HTTPS 구성

Compose는 포트 `3000`에서 일반 HTTP를 제공합니다. TLS를 종료하려면 같은 호스트에서 Caddy를 실행하세요.

```caddyfile
hub.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

호스트에서 `hub.example.com`을 가리키고 `80` 및 `443` 포트를 엽니다. 캐디가 [인증서를 취득하고 갱신](https://caddyserver.com/docs/automatic-https)합니다.

`.env`에서 다음 값을 설정합니다.

```dotenv
PASEO_HUB_APP_URL=https://hub.example.com
PASEO_HUB_TRUSTED_CLIENT_IP_HEADER=x-forwarded-for
```

포트 `3000`이 공개 인터페이스에 노출되지 않도록 하려면 `hub` 포트를 `compose.yml`에서 `"127.0.0.1:3000:3000"`으로 변경하세요.

## Fly

저장소를 복제하고 직접 관리할 이름으로 앱과 데이터베이스를 만드세요.

```sh
git clone https://github.com/getpaseo/hub.git
cd hub
fly apps create your-hub
fly postgres create --name your-hub-db
fly postgres attach your-hub-db -a your-hub
```

Dockerfile을 배포하고 Hub에 공개 원본을 지정합니다.

```sh
fly deploy -a your-hub \
  -e PASEO_HUB_APP_URL=https://your-hub.fly.dev
```

Fly URL을 열고 브라우저 설정을 완료하거나 배포하기 전에 [부트스트랩 환경](#bootstrap-from-environment)을 설정하세요.

하나의 기계를 지속적으로 작동시키십시오. Hub는 Slack 소켓 모드 및 Discord 게이트웨이 연결을 유지하고 일정 시계를 실행하며 이벤트를 데몬에 전달하므로 중지된 시스템은 이벤트를 놓치게 됩니다.

## 업그레이드

새 이미지나 소스를 가져와 배포합니다. 데이터베이스 마이그레이션은 앞으로만 수행됩니다. 내장된 데이터 디렉터리 또는 PostgreSQL 데이터베이스는 계정, 앱 자격 증명, 트리거, 통합 및 실행 기록을 보관하므로 업그레이드하기 전에 백업하세요.
