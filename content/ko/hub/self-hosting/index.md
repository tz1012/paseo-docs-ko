---
title: Self-hosting Hub
description: Run Hub locally with its embedded database, or deploy it with PostgreSQL.
nav: Self-hosting
order: 74
category: Hub
---

# Hub 자체 호스팅

가장 빠른 방법은 명령 하나를 실행하는 것입니다.

```sh
npx @getpaseo/hub
```

<http://localhost:3000>을 여세요. 새 Hub는 임베디드 데이터베이스와 인증 비밀을 만든 뒤 운영자 계정과 원하는 GitHub, Slack 또는 Discord 앱을 만드는 과정을 안내합니다.

[빠른 시작](/docs/hub/quickstart)에 따라 Socket Mode로 Slack을 연결하고 공개 서버 없이 첫 번째 워크플로를 실행하세요.

## 로컬 데이터

`DATABASE_URL`이 없으면 Hub는 임베디드 PGlite 데이터베이스와 생성된 인증 비밀을 `$XDG_DATA_HOME/paseo-hub` 아래에 저장합니다. `XDG_DATA_HOME`이 절대 경로로 설정되지 않은 경우 Hub는 `~/.local/share/paseo-hub`를 사용합니다. 두 위치 모두 다시 시작한 뒤에도 유지됩니다.

다른 위치를 명시적으로 설정하려면 다음을 사용하세요.

```sh
PASEO_HUB_DATA_DIR=/path/to/paseo-hub-data npx @getpaseo/hub
```

임베디드 모드는 데이터 디렉터리마다 Hub 프로세스 하나를 지원합니다. 개인용 또는 단일 프로세스 Hub에 적합합니다. 업그레이드하거나 이동하기 전에 데이터 디렉터리 전체를 백업하세요.

## 공개 주소

Hub의 기본 주소는 `http://localhost:3000`입니다. 대시보드, 데몬, Slack Socket Mode, Hub에서 외부로 연결하는 제공업체에는 이 주소로 충분합니다.

GitHub 이벤트 트리거는 웹훅을 사용하므로 공개 HTTPS 주소가 필요합니다. 웹훅이 없어도 저장소 액세스는 작동할 수 있습니다. Slack의 선택적 Webhooks 전송 방식에도 공개 HTTPS가 필요하지만 Socket Mode에는 필요하지 않습니다.

안정적인 공개 원본에서 Hub를 사용할 수 있다면 시작 전에 다음을 설정하세요.

```sh
PASEO_HUB_APP_URL=https://hub.example.com npx @getpaseo/hub
```

공개 원본을 변경하면 제공업체 앱의 콜백 및 웹훅 설정도 갱신해야 합니다. **Apps** 페이지는 Hub가 현재 사용하는 원본에 맞는 URL을 생성합니다.

## PostgreSQL

임베디드 데이터베이스 대신 PostgreSQL을 사용하려면 `DATABASE_URL`을 설정하세요.

```sh
DATABASE_URL=postgres://paseo:password@localhost:5432/paseo_hub \
  npx @getpaseo/hub
```

내구성 있는 서버 배포, 둘 이상의 Hub 프로세스, 기존 데이터베이스 백업 및 운영 환경에는 PostgreSQL을 사용하세요. 마이그레이션은 시작할 때 자동으로 실행됩니다. 마이그레이션이 실패하면 Hub는 수신 대기를 시작하지 않습니다.

데이터베이스에는 Hub가 생성한 인증 비밀도 저장됩니다. 배포 플랫폼의 비밀 저장소에서 인증 비밀을 제공해야 할 때만 `PASEO_HUB_AUTH_SECRET`을 설정하세요. 재정의 값이 설정된 동안 Hub는 저장된 비밀을 교체하지 않고 해당 값을 사용합니다. 유효한 비밀을 변경하면 모든 사용자가 대시보드에서 로그아웃됩니다. 이미 발급된 실행 자격 증명은 해당 실행이 끝날 때까지 유효합니다.

## 앱 구성

운영자는 **Apps**에서 GitHub, Slack, Discord를 구성합니다. Hub는 자격 증명을 데이터베이스에 저장하기 전에 검증하고, 환경에서 구성한 배포와 동일한 제공업체 런타임을 시작합니다.

Hub 외부에서 비밀을 관리하는 배포에서는 계속 환경 변수를 사용할 수 있습니다. 완전한 환경 구성은 저장된 애플리케이션보다 우선하며 대시보드에 **Managed by environment**로 표시됩니다.

```sh
# GitHub
GITHUB_APP_SLUG=
GITHUB_APP_ID=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=          # or GITHUB_APP_PRIVATE_KEY_PATH
GITHUB_WEBHOOK_SECRET=

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

제공업체 동작과 연결 단계는 [GitHub](/docs/hub/self-hosting/github-app), [Slack](/docs/hub/self-hosting/slack-app), [Discord](/docs/hub/self-hosting/discord-app)를 참조하세요.

## 환경에서 부트스트랩

새 데이터베이스에서는 브라우저 설정이 기본입니다. 무인 배포에서는 환경 변수로 첫 운영자를 만들 수 있습니다.

```dotenv
PASEO_BOOTSTRAP_ORGANIZATION=My organization
PASEO_BOOTSTRAP_OWNER_EMAIL=me@example.com
PASEO_BOOTSTRAP_OWNER_PASSWORD=replace-with-a-temporary-password
```

비밀번호는 12자 이상이어야 합니다. 한 번 로그인하여 대시보드에서 비밀번호를 바꾼 뒤 `PASEO_BOOTSTRAP_OWNER_PASSWORD`를 제거하세요. Hub는 계정과 조직을 유지합니다.

## Docker Compose

저장소에는 Hub와 PostgreSQL을 하나의 Compose 스택으로 구성한 파일이 있습니다.

```sh
git clone https://github.com/getpaseo/hub.git
cd hub
cp .env.example .env
docker compose up -d
```

<http://localhost:3000>을 열고 브라우저 설정을 완료하세요. 공개 배포에서는 `PASEO_HUB_APP_URL`과 필요한 리버스 프록시 설정을 스택을 시작하기 전에 `.env`에 지정하세요.

스택은 포트 `3000`에 Hub를 게시하고 PostgreSQL 데이터를 명명된 볼륨에 저장합니다. Hub 이미지는 `ghcr.io/getpaseo/hub:latest`입니다.

### Caddy로 HTTPS 구성

Compose는 포트 `3000`에서 일반 HTTP를 제공합니다. TLS를 종료하려면 같은 호스트에서 Caddy를 실행하세요.

```caddyfile
hub.example.com {
  reverse_proxy 127.0.0.1:3000
}
```

`hub.example.com`이 호스트를 가리키도록 하고 포트 80과 443을 여세요. Caddy가 [인증서를 발급하고 갱신](https://caddyserver.com/docs/automatic-https)합니다.

그런 다음 `.env`에 다음을 설정하세요.

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

해당 주소를 열고 브라우저 설정을 완료하거나, 배포 전에 [부트스트랩 환경](#bootstrap-from-environment)을 설정하세요.

머신 하나를 계속 실행하세요. Hub는 Slack Socket Mode와 Discord 게이트웨이 연결을 유지하고 이벤트를 데몬에 전달하므로 머신이 중지되어 있으면 이벤트를 놓치게 됩니다.

## 업그레이드

새 이미지나 소스를 가져와 배포합니다. 마이그레이션은 이전 버전으로 되돌릴 수 없습니다. 먼저 임베디드 데이터 디렉터리 또는 PostgreSQL 데이터베이스를 백업하세요. 여기에는 계정, 앱 자격 증명, 구성 개정, 연결, 실행 기록이 포함됩니다.
