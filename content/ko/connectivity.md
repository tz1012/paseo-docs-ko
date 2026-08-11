---
title: Connectivity
description: Connect a Paseo client to your daemon through the relay or Tailscale.
nav: Connectivity
order: 4
category: Getting started
---

# 연결성

Paseo 앱은 컴퓨터나 서버에서 실행되는 데몬에 연결됩니다. Paseo 릴레이를 통해 연결하거나 Tailscale을 통해 직접 연결할 수 있습니다.

이는 클라이언트에서 데몬으로의 전송입니다. GitHub, Slack, Discord 이벤트에서 에이전트를 시작하는 서비스를 찾고 있다면 바로 [Hub](/docs/hub)입니다.

- [파세오 릴레이](#paseo-relay)
- [테일스케일](#tailscale)

## 파세오 릴레이

릴레이는 Tailscale, 포트 전달 또는 네트워크 구성 없이 작동합니다. 트래픽은 엔드투엔드 암호화됩니다.

릴레이는 활성화할 때까지 비활성화됩니다.

### Paseo Desktop에서 릴레이 활성화

1. **설정 → 호스트 → 장치 페어링**을 엽니다.
2. **릴레이 활성화**를 선택합니다.
3. 휴대폰에서 Paseo로 QR 코드를 스캔하거나 페어링 링크를 복사하여 휴대폰 앱에 붙여넣으세요.

### CLI에서 릴레이 활성화

실행:

```bash
paseo daemon pair
```

메시지가 나타나면 확인하세요. Paseo는 QR 코드와 페어링 링크를 인쇄합니다. 휴대폰에서 Paseo로 QR 코드를 스캔하거나 휴대폰 앱에서 **페어링 링크 붙여넣기**를 선택하세요.

## 테일스케일

데몬 머신과 휴대폰에 [Tailscale](https://tailscale.com/download)을 설치하세요. 두 장치 모두에서 동일한 tailnet에 로그인합니다.

### 1. 데몬 머신의 Tailscale IP를 찾습니다.

데몬 머신에서 다음을 실행하세요:

```bash
tailscale ip -4
```

인쇄된 주소를 복사하세요. 아래 예에서는 `100.101.102.103`을 사용합니다.

### 2. 데몬 구성

`~/.paseo/config.json`을 열고 `daemon.listen`을 Tailscale IP로 설정합니다.

```json
{
  "$schema": "https://paseo.sh/schemas/paseo.config.v1.json",
  "version": 1,
  "daemon": {
    "listen": "100.101.102.103:6767"
  }
}
```

파일에 이미 있는 다른 설정을 유지합니다. `daemon` 개체가 있는 경우 해당 개체 안에 `listen`을 추가하세요.

비밀번호로 접근을 제한하려면 [비밀번호 인증](/docs/configuration#password-authentication)을 참조하세요.

데몬을 다시 시작합니다.

```bash
paseo daemon restart
```

Paseo Desktop이 데몬을 관리하는 경우 **설정 → 호스트 → 개요 → 데몬 다시 시작**을 사용하세요.

### 3. 전화 앱을 연결하세요

1. 휴대폰에 Tailscale을 연결합니다.
2. Paseo를 열고 **설정 → 호스트 추가 → 직접 연결**로 이동합니다.
3. **Host**에 Tailscale IP를 입력합니다.
4. **포트**에 `6767`을 입력합니다.
5. **SSL 사용**을 꺼진 상태로 두고 **연결**을 선택합니다.

호스트가 이미 릴레이를 통해 페어링된 경우 Paseo는 동일한 호스트에 직접 연결을 추가합니다.

## 문제 해결

- **연결 시간 초과:** Tailscale이 두 장치 모두에 연결되어 있고 데몬 머신의 Tailscale IP를 사용했는지 확인하세요.
- **연결 거부됨:** `paseo daemon status`을 실행하고 구성된 IP 및 포트에서 데몬이 실행되고 있는지 확인합니다.
- **구성 변경이 적용되지 않습니다.** `config.json`을 편집한 후 데몬을 다시 시작합니다.