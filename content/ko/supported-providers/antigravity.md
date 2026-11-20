---
title: Antigravity
description: Install and configure Antigravity for Paseo.
nav: Antigravity
order: 23
category: Providers
---

# Antigravity

설치된 `agy` CLI와 로그인을 사용해 Paseo에서 Antigravity를 실행합니다. 이 통합은 Google의 승인을 받은 것이 아닙니다.

## 시작하기

데몬 호스트에 Antigravity CLI(`agy`) 1.5.0 이상을 설치한 뒤 `agy`를 한 번 실행해 로그인하세요. Paseo에서 **Antigravity**를 선택하세요. 공급자는 Paseo와 함께 제공되므로 플러그인을 설치할 필요가 없습니다.

`agy`가 데몬의 PATH 밖에 있다면 `~/.paseo/config.json`에서 명령을 재정의하세요. 공급자별 환경 변수에는 `env`를 사용하세요.

```json
{
  "agents": {
    "providers": {
      "antigravity": {
        "command": ["/absolute/path/to/agy", "acp", "--disable-telemetry"],
        "env": { "EXAMPLE_VARIABLE": "value" }
      }
    }
  }
}
```

이미 명령을 재정의했다면 명령 인수에 `acp`를 추가하세요. 명령 및 환경 재정의는 [사용자 정의 공급자](/docs/custom-providers)를 참조하세요.

## 권한

Paseo는 `agy acp`에 연결하고 CLI가 제공하는 권한 모드를 표시합니다. **기본값**에서는 Antigravity 정책에 따라 승인이 필요한 편집과 명령의 승인 요청을 Paseo가 표시합니다. **편집 허용**에서는 작업공간 편집을 Antigravity가 승인하고, 승인이 필요한 명령은 계속 묻습니다. **계획**에서는 Antigravity가 작업 전에 계획을 세울 수 있습니다.

**전체 액세스**가 기본값입니다. Paseo는 하나의 **한 번 허용** 작업만 제공하는 도구 요청을 승인합니다. Antigravity는 자체 도구 정책을 계속 적용합니다. **전체 액세스**로 저장된 기존 채팅은 해당 모드를 유지하며, 예약 실행도 사람이 각 도구 호출을 승인하지 않고 이 모드를 사용할 수 있습니다.

**전체 액세스**로 전환하거나 해제하기 전에 현재 턴을 완료하거나 중지하세요.

## 세션과 도구

Paseo는 CLI 세션을 가져오고 채팅을 다시 열 때 대화 기록을 복원할 수 있습니다. Antigravity는 ACP를 통해 슬래시 명령을 게시하고 이미지 첨부를 받습니다. 에이전트에 구성된 MCP 서버도 전달받습니다.

방향을 바꾸려면 현재 턴이 끝난 뒤 후속 메시지를 보내거나 턴을 중단하세요.
