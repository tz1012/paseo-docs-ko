---
title: Oh My Pi
description: Install and turn on Oh My Pi for Paseo.
nav: Oh My Pi
order: 30
category: Providers
---

# Oh My Pi

기존 `omp` 설치와 설정을 사용해 Paseo에서 Oh My Pi(OMP)를 실행합니다.

## 시작하기

1. 데몬 호스트에 [Oh My Pi](https://github.com/can1357/oh-my-pi)를 설치하고 터미널에서 `omp`가 실행되는지 확인합니다.
2. Paseo에서 **설정 → 호스트 → 해당 호스트 → 공급자**를 열고 **Oh My Pi**를 켭니다.

Oh My Pi는 기본적으로 꺼져 있습니다. `~/.paseo/config.json`에서 켤 수도 있습니다.

```json
{
  "agents": {
    "providers": {
      "omp": { "enabled": true }
    }
  }
}
```

`omp`가 데몬의 PATH 밖에 있다면 [명령 재정의](/docs/custom-providers)를 사용하세요. 자체 설정을 사용하는 두 번째 OMP 프로필을 실행하려면 GitHub의 [OMP 프로필](https://github.com/getpaseo/paseo/blob/main/docs/custom-providers.md#omp-profiles-and-pi-compatible-forks)을 참조하세요.

## 권한 모드

**Full Access**가 기본 모드입니다.

| 모드 | 효과 |
| -------------- | -------------------------------------------------------- |
| Full Access | 도구가 프롬프트 없이 실행됩니다. |
| Write Approval | 읽기는 프롬프트 없이 실행되고 쓰기에는 승인이 필요합니다. |
| Always Ask | 파일을 쓰거나 명령을 실행하는 도구에는 승인이 필요합니다. |

## 도구, 하위 에이전트, 세션

- Oh My Pi 에이전트는 다른 에이전트를 만들고 메시지를 보내는 도구 등 Paseo 도구를 사용할 수 있습니다.
- Oh My Pi가 시작한 하위 에이전트는 Paseo에서 하위 에이전트로 표시됩니다.
- Paseo는 터미널에서 시작한 세션을 가져올 수 있습니다. `~/.omp/agent/sessions`에서 세션을 읽습니다.
