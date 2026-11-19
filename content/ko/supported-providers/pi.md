---
title: Pi
description: Install Pi and run it in Paseo.
nav: Pi
order: 32
category: Providers
---

# Pi

기존 `pi` 설치, 자격 증명, 설정을 사용해 Paseo에서 Pi를 실행합니다.

## 시작하기

1. 데몬 호스트에 [Pi](https://pi.dev)를 설치합니다.
2. Pi를 모델 공급자에 연결하고 터미널에서 `pi`가 실행되는지 확인합니다.
3. Paseo에서 에이전트를 시작할 때 **Pi**를 선택하세요.

데몬이 `pi`를 실행할 수 있으면 Pi가 Paseo에 표시됩니다. `pi`가 데몬의 PATH 밖에 있다면 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하세요.

## 모드와 세션

- Pi에는 권한 모드가 없으므로 Paseo는 Pi 에이전트에 모드 선택기를 표시하지 않습니다.
- Paseo는 터미널에서 시작한 세션을 가져올 수 있습니다. `~/.pi/agent/sessions` 또는 Pi에서 구성한 세션 디렉터리에서 세션을 읽습니다.

## 시간 초과

Paseo는 모델 목록 요청과 같은 제어 요청에 Pi가 응답할 때까지 60초를 기다립니다. 호스트에서 Pi에 시간이 더 필요하다면 [공급자 옵션](/docs/custom-providers#provider-options)에서 `rpcTimeoutMs`를 늘리세요.

## 참고 항목

- [Oh My Pi](/docs/supported-providers/omp)는 자체 권한 모드가 있는 별도의 공급자입니다.
- 다른 명령에서 Pi의 RPC 모드를 유지하는 공급자를 구성하려면 GitHub의 [Pi 호환 포크](https://github.com/getpaseo/paseo/blob/main/docs/custom-providers.md#omp-profiles-and-pi-compatible-forks)를 참조하세요.
