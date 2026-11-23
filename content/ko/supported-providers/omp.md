---
title: Oh My Pi
description: Install and turn on Oh My Pi for Paseo.
nav: Oh My Pi
order: 30
category: Providers
---

# Oh My Pi

Paseo는 설치된 `omp` CLI를 통해 Oh My Pi(OMP)를 실행합니다. 기존 자격 증명과 설정을 사용합니다.

## 시작하기

Oh My Pi는 Paseo에 내장되어 있으며 기본적으로 꺼져 있습니다.

1. 데몬 호스트에 [오마이파이](https://github.com/can1357/oh-my-pi)를 설치하고, 터미널에서 `omp`이 실행되는지 확인하세요.
2. Paseo에서 **설정 → 호스트 → 호스트 → 공급자**를 열고 **Oh My Pi**를 켭니다.
3. 에이전트를 시작할 때 **Oh My Pi**를 선택하세요.

`omp`이 데몬 PATH 외부에 있는 경우 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하세요. `agents.providers.omp` 아래의 `~/.paseo/config.json`에서 `omp`을 활성화할 수도 있습니다. 자체 설정으로 두 번째 OMP 프로필을 실행하려면 GitHub의 [OMP 프로필](https://github.com/getpaseo/paseo/blob/main/docs/custom-providers.md#omp-profiles-and-pi-compatible-forks)을 참조하세요.

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
