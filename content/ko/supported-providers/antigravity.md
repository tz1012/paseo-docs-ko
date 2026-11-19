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

데몬 호스트에 Antigravity CLI(`agy`)를 설치한 뒤 `agy`를 한 번 실행해 로그인하세요. Paseo에서 **Antigravity**를 선택하세요. 공급자는 Paseo와 함께 제공되므로 플러그인을 설치할 필요가 없습니다.

`agy`가 데몬의 PATH 밖에 있다면 `~/.paseo/config.json`에서 명령을 재정의하세요. 공급자별 환경 변수에는 `env`를 사용하세요.

```json
{
  "agents": {
    "providers": {
      "antigravity": {
        "command": ["/absolute/path/to/agy"],
        "env": { "EXAMPLE_VARIABLE": "value" }
      }
    }
  }
}
```

명령 및 환경 재정의는 [사용자 정의 공급자](/docs/custom-providers)를 참조하세요.

## 권한

**Full access**가 유일한 권한 모드입니다. 다른 앱이 Antigravity를 제어할 때는 권한을 요청할 수 없으므로 Paseo는 `--dangerously-skip-permissions`로 `agy`를 시작합니다. 셸 명령을 포함한 모든 도구 호출이 질문 없이 실행됩니다. 채팅을 다시 열 때를 포함해 각 세션은 이를 설명하는 경고로 시작합니다. Antigravity 자체 정책은 여전히 작업을 거부할 수 있습니다.

## 제한 사항

- Paseo MCP 도구와 스티어링은 사용할 수 없습니다. 사용자의 `agy` MCP 서버는 계속 작동합니다.
- 첨부한 이미지는 에이전트가 읽을 수 있도록 파일 참조로 전달됩니다.
- 데몬을 다시 시작한 뒤에도 Antigravity는 대화를 기억하지만, `agy`가 기록을 재생하지 않으므로 Paseo의 트랜스크립트는 새로 시작합니다.
