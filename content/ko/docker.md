---
title: Docker
description: Run the Paseo daemon and bundled web UI with the official Docker image.
nav: Docker
order: 6
category: Getting started
---

# 도커

공식 Paseo Docker 이미지는 데몬을 실행하고 동일한 HTTP 원본에서 번들 브라우저 UI를 제공합니다. 서버, 개발 박스, NAS 장치, 홈랩 호스트 및 데스크탑 앱 없이 Paseo를 실행하려는 기타 장소를 위한 것입니다.

Docker 이미지는 안정적인 Paseo 릴리스 흐름을 따릅니다. `ghcr.io/getpaseo/paseo:latest`은 임의의 `main` 빌드가 아닌 최신 안정 릴리스를 가리킵니다.

```bash
docker run -d --name paseo \
  -p 6767:6767 \
  -e PASEO_PASSWORD=change-me \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest
```

그런 다음 다음을 엽니다.

```text
http://localhost:6767
```

`PASEO_PASSWORD`을 설정한 경우 웹 UI, 모바일 앱 또는 CLI에서 직접 데몬 연결을 추가할 때 동일한 비밀번호를 사용하세요.

## 이미지에 포함된 내용

이미지:

- Paseo 데몬과 CLI를 설치합니다.
- 번들 웹 UI를 제공합니다.
- 컨테이너 내부의 `0.0.0.0:6767`을 수신합니다.
- `/home/paseo/.paseo`에 데몬 상태를 저장합니다.
- 루트가 아닌 `paseo` 사용자로 데몬을 실행하고 에이전트를 시작합니다.

이미지는 Claude Code, Codex, OpenCode, Copilot 또는 Pi와 같은 에이전트 CLI를 번들로 제공하지 않습니다. 작은 하위 이미지와 함께 사용하는 에이전트를 추가하세요.

## 도커 작성

```yaml
services:
  paseo:
    image: ghcr.io/getpaseo/paseo:latest
    container_name: paseo
    restart: unless-stopped
    ports:
      - "6767:6767"
    environment:
      PASEO_PASSWORD: "change-me"
      # PASEO_HOSTNAMES: "paseo.example.com,.lan"
    volumes:
      - ./paseo-home:/home/paseo
      - ./workspace:/workspace
```

시작하세요:

```bash
docker compose up -d
```

## 에이전트 CLI 설치

사용하려는 공급자에 대한 하위 이미지를 만듭니다.

```Dockerfile
FROM ghcr.io/getpaseo/paseo:latest

USER root
RUN npm install -g @openai/codex @anthropic-ai/claude-code opencode-ai
```

빌드하세요:

```bash
docker build -t paseo-with-agents .
```

그런 다음 Compose에서 `image: paseo-with-agents`을 사용하세요.

하위 이미지 사용자를 루트로 둡니다. 기본 진입점은 처음 실행되는 마운트된 볼륨 설정에만 루트를 사용한 다음 데몬과 시작된 에이전트를 루트가 아닌 `paseo` 사용자 권한으로 전환합니다.

공급자 환경 변수를 전달하거나 컨테이너 내에서 공급자 로그인 흐름을 실행하여 에이전트를 인증할 수 있습니다.

```bash
docker exec -it --user paseo paseo codex
docker exec -it --user paseo paseo claude
```

에이전트 자격 증명은 `/home/paseo`에 유지됩니다.

## 볼륨

대부분의 배포에는 두 가지 경로를 마운트합니다.

| 마운트 | 목적 |
| ------------- | ------------------------------------------------------------ |
| `/home/paseo` | Paseo 상태와 에이전트 구성 및 `.codex`, `.claude`과 같은 자격 증명 |
| `/workspace` | Paseo 및 출시된 에이전트가 읽고 쓸 수 있는 코드 |

Linux에서 기본 제공 `paseo` 사용자는 uid/gid `1000:1000`입니다. 해당 사용자가 쓸 수 있는 마운트된 디렉터리를 만들거나 Docker의 `--user` / Compose `user:` 옵션을 사용하여 컨테이너를 실행하세요.

## 역방향 프록시

일반 HTTP 트래픽과 WebSocket 업그레이드를 컨테이너로 전달합니다.

캐디:

```caddy
paseo.example.com {
  reverse_proxy 127.0.0.1:6767
}
```

엔진엑스:

```nginx
server {
    listen 443 ssl;
    server_name paseo.example.com;

    location / {
        proxy_pass http://127.0.0.1:6767;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

DNS 이름으로 Paseo에 연결하는 경우 해당 호스트를 허용하십시오.

```yaml
environment:
  PASEO_HOSTNAMES: "paseo.example.com,.lan"
```

IP 및 `localhost`은 기본적으로 허용됩니다.

## 보안

게시된 포트 또는 네트워크 연결 가능 배포에 대해 `PASEO_PASSWORD`을 설정합니다. localhost 외부에서 브라우저에 액세스하려면 역방향 프록시에서 HTTPS를 사용하세요.

정적 웹 UI는 데몬 원본에서 공개됩니다. 데몬 API와 WebSocket은 구성 시 비밀번호 인증으로 보호됩니다.

에이전트는 `/workspace`에 마운트한 모든 항목과 `/home/paseo`에 배치한 모든 자격 증명에 액세스할 수 있습니다. 해당 마운트 범위를 에이전트가 사용할 수 있는 범위로 유지하세요.

전체 데몬 신뢰 모델은 [보안](/docs/security)을 참조하세요.

## 문제 해결

- **UI가 로드되지만 연결할 수 없습니다.** `PASEO_PASSWORD`이 설정된 경우 동일한 비밀번호로 직접 연결을 추가합니다.
- **403 호스트가 허용되지 않음:** `PASEO_HOSTNAMES`을 사용하는 DNS 이름으로 설정하세요.
- **제공자를 사용할 수 없음:** 해당 에이전트 CLI를 하위 이미지에 설치하거나 바이너리가 `PATH`에 있는지 확인하세요.
- **`/workspace`의 권한 오류:** 마운트된 디렉터리를 uid/gid `1000:1000`으로 쓸 수 있게 만들거나 컨테이너를 호스트 uid/gid로 실행합니다.
- **로그:** `docker logs paseo`을 실행하거나 컨테이너 내부에서 `/home/paseo/.paseo/daemon.log`을 검사합니다.
