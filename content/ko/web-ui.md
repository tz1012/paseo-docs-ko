---
title: Self-hosting the web UI
description: Serve the Paseo web app from your own daemon and reach it over your own LAN, VPN, reverse proxy, or tunnel.
nav: Web UI
order: 6
category: Getting started
---

# 웹 UI 자체 호스팅

Paseo의 데몬은 이미 API에 사용하는 것과 동일한 주소에서 브라우저 웹 앱 자체를 제공할 수 있습니다. [app.paseo.sh](https://app.paseo.sh)에서 호스팅된 앱이 필요하지 않습니다. 브라우저를 자신의 데몬에 지정하면 자신이 제어하는 ​​인프라에서 자체 에이전트에 연결된 전체 UI를 얻을 수 있습니다.

이는 다음과 같은 경우에 유용합니다.

- 자신의 컴퓨터나 서버에서 전체 UI를 실행합니다.
- 자신의 역방향 프록시, HTTPS 또는 터널 뒤에 배치하세요.
- 호스팅된 웹 앱에 종속되지 않고 자체 호스팅 설정을 엔드 투 엔드로 유지합니다.

웹 앱은 데몬 패키지 내에 제공되므로 제공하는 UI는 항상 데몬 버전과 일치합니다. 동기화를 유지해야 하는 별도의 빌드가 없으며 관리해야 할 UI 대 데몬 버전 차이도 없습니다.

## 활성화

번들 웹 UI는 기본적으로 꺼져 있습니다. 데몬을 시작할 때 켜십시오.

```bash
paseo daemon start --web-ui
```

또는 환경 변수를 사용하여:

```bash
PASEO_WEB_UI_ENABLED=true paseo daemon start
```

또는 `config.json`에 유지하여 다시 시작해도 유지됩니다.

```json
{
  "features": {
    "webUi": {
      "enabled": true
    }
  }
}
```

그런 다음 브라우저에서 데몬의 주소를 엽니다.

```
http://localhost:6767/
```

데몬이 `--web-ui`을 인식하지 못하는 경우 업데이트하세요. 플래그는 번들 웹 UI에 추가되었습니다.

## 연결 작동 방식

페이지는 데몬의 API 및 WebSocket과 동일한 출처에서 제공됩니다. 앱을 열면 앱이 자동으로 동일한 원본에 다시 연결되므로 일반적으로 "호스트 추가" 단계를 완전히 건너뛰고 `http://localhost:6767/`을 열면 에이전트가 표시됩니다.

동일한 HTTP 서버가 API(`/api/*`), MCP(`/mcp/*`), 서비스 프록시 경로 및 WebSocket 업그레이드를 계속 제공합니다. 정적 파일만 새로운 것입니다. 제공된 UI가 _다른_ 데몬을 가리키도록 하려면 평소와 같이 해당 데몬을 UI에서 호스트로 추가하세요.

## 토폴로지

노출 순서에 따라 실행하는 세 가지 일반적인 방법은 다음과 같습니다.

- **동일한 머신입니다.** 데몬과 브라우저가 하나의 상자에 있습니다. `http://localhost:6767/`을 엽니다. 더 이상 구성할 것이 없습니다.
- **개인 네트워크(LAN 또는 VPN).** 신뢰할 수 있는 네트워크, 홈 LAN 또는 [Tailscale](https://tailscale.com) tailnet의 다른 장치에서 데몬에 연결하세요. 완전한 직접 설정을 위해서는 [연결 가이드](/docs/connectivity#tailscale)를 따르세요.
- **공용 역방향 프록시 또는 터널.** HTTPS를 통해 도메인에 UI를 노출하여 역방향 프록시 또는 터널에서 TLS를 종료합니다. 이는 전체 자체 호스팅 설정입니다.

이 페이지의 나머지 부분은 로컬에서 공개로 빌드됩니다. **프록시를 추가하기 전에 직접 연결이 작동하는지 확인하세요**, 프록시 문제에서 데몬 문제를 분리합니다.

## 로컬호스트 이상으로 노출

기본적으로 데몬은 동일한 시스템에서만 연결할 수 있는 `127.0.0.1:6767`을 수신합니다. 다른 장치에서 연결하려면 네트워크 인터페이스에 바인딩하세요.

```bash
paseo daemon start --web-ui --listen 0.0.0.0:6767
```

> **수신 주소에 도달할 수 있는 사람은 누구나 에이전트를 사용할 수 있습니다.** localhost를 넘어 바인딩하기 전에 비밀번호를 설정하고 호스트 허용 목록을 검토하세요. 릴레이 페어링 경로는 데몬을 로컬 호스트에 바인딩하여 이를 완전히 방지합니다. [보안](/docs/security)을 참조하세요.

데몬을 직접 노출할 때 구성해야 할 두 가지 사항은 다음과 같습니다.

1. 인증된 클라이언트만 연결할 수 있도록 **비밀번호를 설정**하세요.

```bash
   PASEO_PASSWORD=my-secret paseo daemon start --web-ui --listen 0.0.0.0:6767
   ```

영구 설정은 [비밀번호 인증](/docs/configuration#password-authentication)을 참조하세요. 비밀번호 인증은 액세스를 제어합니다. 트래픽을 암호화하지 않으므로 신뢰할 수 없는 네트워크의 앞에(아래) TLS를 배치합니다.

2. **호스트 이름을 허용**하여 데몬의 DNS 리바인딩 보호가 도메인에 대한 요청을 수락하도록 합니다.

```bash
   paseo daemon start --web-ui --listen 0.0.0.0:6767 --hostnames ".example.com"
   ```

호스트 허용 목록 작동 방식은 [DNS 리바인딩 보호](/docs/security#dns-rebound-protection)를 참조하세요.

> **웹 앱은 인증 전에 로드되도록 설계되었습니다.** 로그인 화면이 렌더링될 수 있도록 정적 UI 파일은 데몬 비밀번호 없이 제공됩니다. API 및 WebSocket에는 에이전트 데이터가 반환되거나 명령이 실행되기 전에 여전히 비밀번호가 필요합니다. "로드된 페이지"를 "데몬이 열려 있음"으로 처리하지 말고 네트워크에 바인딩하기 전에 비밀번호를 설정하여 페이지 뒤의 데이터를 보호하세요.

## 역방향 프록시

HTTPS를 통해 도메인에서 UI를 제공하려면 역방향 프록시에서 TLS를 종료하고 모든 것을 데몬으로 전달하세요. 데몬을 localhost에 유지하고 프록시만 노출되게 하세요.

작동 중인 프록시는 다음을 수행해야 합니다.

- **WebSocket 업그레이드를 전달합니다.** 앱은 `/ws`의 WebSocket을 통해 에이전트 출력을 스트리밍합니다. 업그레이드 지원이 없으면 UI가 로드되지만 연결되지는 않습니다.
- **버퍼 응답이 아닙니다.** 터미널 출력 및 기타 라이브 스트림은 오래 지속됩니다. 버퍼링으로 인해 UI가 정지된 것처럼 보입니다.
- **긴 읽기 시간 초과를 사용합니다.** 해당 스트림은 세션이 끝날 때까지 열려 있습니다.
- **대규모 요청 본문을 허용합니다.** 프롬프트 및 파일 업로드가 클 수 있습니다.
- **`Host` 헤더를 유지하고 `X-Forwarded-Proto`을 전달합니다.** 데몬은 이를 사용하여 앱에 다시 연결할 원본과 구성표(`wss://` 대 `ws://`)를 알려줍니다. 이를 삭제하면 잘못된 위치에 포인트가 자동 연결됩니다.

### 엔진엑스

```nginx
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
  listen 443 ssl;
  server_name paseo.example.com;

  ssl_certificate     /etc/letsencrypt/live/paseo.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/paseo.example.com/privkey.pem;

  client_max_body_size 100m;

  location / {
    proxy_pass http://127.0.0.1:6767;
    proxy_http_version 1.1;

    # WebSocket upgrade
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    # Preserve origin + scheme so the UI connects back over wss://
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # Long-lived, unbuffered streams
    proxy_buffering off;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }
}
```

### 캐디

Caddy는 TLS, WebSocket 업그레이드, 헤더 전달 및 스트리밍을 처리합니다.

```caddy
paseo.example.com {
  reverse_proxy 127.0.0.1:6767
}
```

이것이 전체 구성입니다. 캐디는 자동으로 인증서를 프로비저닝하고 기본적으로 `Host` 및 `X-Forwarded-Proto`을 유지합니다.

## HTTPS 및 TLS

프록시(또는 터널)에서 TLS를 종료하고 로컬 호스트의 일반 HTTP를 통해 데몬으로 전달하는 것이 위의 구성에서 수행하는 작업입니다. 페이지가 HTTPS를 통해 제공되고 프록시가 `X-Forwarded-Proto: https`을 전달하면 앱이 자동으로 `wss://`을 통해 다시 연결됩니다. 어디서든 구성표를 구성할 수 없습니다. 가장자리를 따라갑니다.

데몬은 기본적으로 루프백 프록시에서 전달된 헤더를 신뢰합니다. 이는 위의 모든 설정이 수행하는 작업이며 프록시 또는 터널은 `127.0.0.1:6767`으로 전달됩니다.

일부 Docker, LAN 또는 로드 밸런서 설정에서와 같이 프록시가 다른 주소에서 데몬에 도달하는 경우 신뢰할 수 있는 프록시 범위를 구성합니다.

```json
{
  "daemon": {
    "trustedProxies": ["loopback", "172.16.0.0/12"]
  }
}
```

`PASEO_TRUSTED_PROXIES`은 동일한 쉼표로 구분된 값을 허용합니다.

```bash
PASEO_TRUSTED_PROXIES=loopback,172.16.0.0/12 paseo daemon start --web-ui
```

신뢰할 수 있는 최종 프록시가 클라이언트 제공 `X-Forwarded-*` 헤더를 덮어쓰는 경우에만 `trustedProxies: true`을 사용하세요. 그렇지 않으면 클라이언트가 전달된 헤더 값을 스푸핑할 수 있습니다.

HTTPS를 통해 UI를 제공하지만 앱이 `ws://`을 통해 연결을 시도하고 브라우저가 이를 혼합 콘텐츠로 차단하는 경우 프록시가 `X-Forwarded-Proto`을 전달하지 않거나 데몬이 프록시 주소를 신뢰하지 않는 것입니다. 해당하는 항목을 수정하세요.

원격/릴레이 경로(역방향 프록시가 아닌 Paseo 릴레이를 통해 데몬 구동)의 경우 릴레이에는 자체 공개 대 내부 TLS 설정이 있습니다. [보안](/docs/security)을 참조하세요.

## 터널

역방향 프록시를 관리하거나 포트를 열지 않으려는 경우 터널은 로컬 데몬으로 전달되는 HTTPS URL을 제공합니다.

- **Tailscale Serve**는 이를 tailnet 내부에 유지하고 공개적으로 노출되지 않으며 TLS가 자동으로 처리됩니다.

```bash
  tailscale serve https / http://127.0.0.1:6767
  ```

`https://<your-machine>.<tailnet>.ts.net/`으로 연락하세요. Tailnet에 있는 장치만 연결할 수 있습니다.

- **Cloudflare Tunnel**은 TLS 및 WebSocket 지원을 통해 공개 호스트 이름에 이를 노출합니다.

```bash
  cloudflared tunnel --url http://localhost:6767
  ```

Cloudflare는 TLS를 종료하고 `X-Forwarded-Proto: https`을 설정하므로 자동 연결이 작동합니다. 공개 URL이므로 **데몬 비밀번호를 설정하세요.**

## 보안

웹 UI를 자체 호스팅하면 데몬에 접근할 수 있는 사람을 담당하게 됩니다. 필수사항:

- **localhost를 넘어 바인딩하기 전에 비밀번호를 설정하세요.** 정적 페이지는 비밀번호 없이 로드되지만 에이전트 데이터와 명령은 비밀번호 뒤에 남아 있습니다. [보안](/docs/security#password-authentication)을 참조하세요.
- **신뢰할 수 없는 네트워크 앞에 TLS를 배치합니다.** 비밀번호 인증은 기밀이 아닌 액세스를 보호합니다.
- **가능한 경우 데몬을 로컬 호스트에 유지하고** 역방향 프록시나 터널이 노출된 유일한 표면이 되도록 합니다.
- 맞춤 도메인에서 서비스를 제공할 때 **호스트 허용 목록을 검토**하세요.

전체 위협 모델, 릴레이 암호화 및 DNS 리바인딩 세부정보는 [보안](/docs/security) 및 [SECURITY.md](https://github.com/getpaseo/paseo/blob/main/SECURITY.md)를 참조하세요.

## 문제 해결

- **`/`의 빈 페이지 또는 404.** 웹 UI가 활성화되어 있지 않습니다. `--web-ui`으로 데몬을 시작하고 `paseo daemon status`으로 해당 데몬이 맞는지 확인하세요.
- **페이지가 로드되지만 연결되지 않습니다.** 프록시가 WebSocket 업그레이드를 전달하지 않거나 `Host` 헤더를 제거합니다. 프록시 구성에서 업그레이드 헤더를 확인하세요.
- **연결된 후 출력이 멈춥니다.** 응답 버퍼링이 켜져 있거나 읽기 시간 초과가 너무 짧습니다. 버퍼링을 비활성화하고 시간 제한을 늘립니다.
- **"혼합 콘텐츠" / HTTPS를 통한 연결이 차단되었습니다.** 앱이 `ws://`으로 대체되었습니다. 프록시가 `X-Forwarded-Proto: https`을 보내지 않거나 데몬이 프록시 주소를 신뢰하지 않습니다. 프록시가 루프백이 아닌 경우 헤더를 전달하고 `daemon.trustedProxies`을 구성합니다.
- **`403 Invalid Host header`.** 귀하의 도메인이 허용 목록에 없습니다. `--hostnames` 또는 `daemon.hostnames`을 사용하여 추가하세요. [DNS 리바인딩 보호](/docs/security#dns-rebound-protection)를 참조하세요.
- **큰 메시지 또는 업로드가 실패합니다.** 프록시의 최대 본문 크기(Nginx의 `client_max_body_size`)를 늘리세요.

## 참고하세요

- [보안](/docs/security), 연결 방법, 릴레이 암호화, 비밀번호 인증, 호스트 허용 목록.
- [구성](/docs/configuration), `config.json`, 환경 변수 및 CLI 재정의.
- [CLI](/docs/cli), `paseo daemon` 명령.
- [커뮤니티 프로젝트](/docs/community), 커뮤니티에서 구축한 자체 호스팅 도구입니다.