---
title: Codex
description: Run Codex in Paseo using the official Codex CLI and your existing OpenAI account.
nav: Codex
order: 25
category: Providers
---

# 코덱스

Paseo는 공식 `codex` CLI와 앱 서버 인터페이스를 통해 Codex를 실행합니다. 로컬 설치 및 기존 OpenAI 로그인을 사용합니다.

## 시작하기

Codex는 Paseo에 내장되어 있으며 기본적으로 활성화되어 있습니다.

1. 데몬 호스트에 [Codex CLI](https://developers.openai.com/codex/cli)를 설치합니다.

   ```bash
   npm install -g @openai/codex
   ```

2. 구독 액세스를 위해 ChatGPT로 로그인하세요.

   ```bash
   codex login
   ```

3. Paseo에서 에이전트 시작 시 **Codex**를 선택합니다.

대신 OpenAI Platform API 키를 통해 청구하려면 macOS 또는 Linux에서 `printenv OPENAI_API_KEY | codex login --with-api-key`을 실행하세요. Windows PowerShell에서 `$env:OPENAI_API_KEY | codex login --with-api-key`을 실행합니다. 자세한 로그인 정보는 [Codex 인증](https://learn.chatgpt.com/docs/auth)을 참조하세요.

`codex`이 데몬 PATH 외부에 있는 경우 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하세요.

## Paseo에서는 Codex 비용이 추가되나요?

아니요. Paseo는 Codex에 대한 요금을 추가하지 않습니다. ChatGPT 요금제에 포함된 액세스 권한을 사용하려면 ChatGPT로 로그인하세요. 또는 API 키로 로그인하여 OpenAI Platform 계정을 통해 요금을 청구하세요.

계획의 일반 Codex 한도와 OpenAI의 표준 API 가격이 계속 적용됩니다.

## Paseo에 Codex가 없습니다.

ChatGPT 데스크톱 앱과 Codex CLI는 별도로 설치됩니다. 데스크톱 앱을 설치해도 Paseo에 대한 `codex` 명령이 추가되지 않습니다.

`codex`이 `PATH`에 있는지 확인하세요.

```bash
# macOS or Linux
which -a codex

# Windows
where.exe codex
```

명령을 찾을 수 없는 경우:

1. [Codex CLI](https://developers.openai.com/codex/cli)를 설치합니다.
2. `codex login` 또는 API 키로 로그인하세요.
3. CLI를 설치할 때 Paseo 데몬이 이미 실행 중이면 Paseo를 다시 시작합니다.
4. Paseo에서 **설정 → 호스트 → 호스트 → 공급자 → Codex**를 열고 **새로 고침**을 선택합니다.

Paseo가 `codex` 명령을 찾아 시작할 수 있으면 Codex를 사용할 수 있게 됩니다.

## Paseo 터미널에서 Codex를 사용하세요

Codex는 Paseo 터미널 내부에서도 작동합니다. 작업 공간에서 터미널을 열고 표준 CLI 환경을 위해 `codex`을 실행하세요.

Paseo의 데스크톱, 웹, 모바일 앱에서 터미널을 사용할 수 있습니다. 작업 공간, Git 변경 사항 및 기타 Paseo 도구에 계속 액세스할 수 있습니다.

## 참고하세요

- [지원되는 공급자](/docs/supported-providers), 다른 에이전트의 경우 Codex와 함께 실행할 수 있습니다.
- [사용자 정의 공급자](/docs/custom-providers), 사용자 정의 바이너리, 타사 엔드포인트 또는 여러 Codex 프로필용.
- [Paseo vs Codex 앱](/alternatives/codex-app), 기능 비교.
