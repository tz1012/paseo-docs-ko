---
title: OpenCode
description: Install OpenCode and run it in Paseo.
nav: OpenCode
order: 31
category: Providers
---

# OpenCode

Paseo는 설치된 `opencode` CLI를 통해 OpenCode를 실행합니다. 기존 자격 증명과 구성을 사용합니다.

## 시작하기

OpenCode는 Paseo에 내장되어 있으며 기본적으로 활성화되어 있습니다.

1. 데몬 호스트에 [OpenCode](https://opencode.ai/)를 설치합니다.

   ```bash
   npm install -g opencode-ai
   ```

2. OpenCode를 모델 공급자에 연결하고 터미널에서 `opencode`가 실행되는지 확인합니다.
3. Paseo에서 에이전트를 시작할 때 **OpenCode**를 선택하세요.

OpenCode v2를 사용하는 경우 버전 2.0.10 이상을 설치하세요. Paseo는 이전 v2 버전을 거부합니다.

`opencode`이 데몬 PATH 외부에 있는 경우 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하세요.

## 모드

Paseo는 OpenCode 에이전트를 모드로 표시합니다.

| 모드 | 효과 |
| ----- | ----------------------------------------------- |
| Build | 편집과 도구 실행을 허용합니다. |
| Plan | 읽기 전용 계획입니다. OpenCode는 파일 편집을 피합니다. |

OpenCode에서 정의한 기본 에이전트도 같은 목록에 표시됩니다.

## 참고 항목

- Paseo가 이미 실행 중인 OpenCode 서버를 사용하게 하려면 GitHub의 [기존 v2 서버와 함께 OpenCode 사용](https://github.com/getpaseo/paseo/blob/main/docs/custom-providers.md#opencode-with-an-existing-v2-server)을 참조하세요.
- SDK에서 만든 에이전트의 OpenCode 권한 규칙을 설정하려면 [공급자 옵션](/docs/sdk/provider-options#opencode)을 참조하세요.
