---
title: Codex
description: Run Codex in Paseo using the official Codex CLI and your existing OpenAI account.
nav: Codex
order: 24
category: Providers
---

# 코덱스

Paseo는 공식 `codex` CLI와 앱 서버 인터페이스를 통해 Codex를 실행합니다.

## Paseo에서는 Codex 비용이 추가되나요?

아니요. Paseo는 Codex에 요금을 추가하지 않습니다. ChatGPT로 Codex CLI에 로그인하여 ChatGPT 계획에 포함된 액세스 권한을 사용하거나 OpenAI Platform 계정을 통해 청구되는 사용량을 위해 API 키로 로그인하세요.

계획의 일반 Codex 한도와 OpenAI의 표준 API 가격이 계속 적용됩니다.

## 시작하기

Paseo를 실행하는 머신에 [Codex CLI](https://learn.chatgpt.com/docs/codex/cli)를 설치합니다.

```bash
npm install -g @openai/codex
```

구독 액세스를 위해 ChatGPT로 로그인하세요:

```bash
codex login
```

또는 OpenAI Platform 계정을 통해 청구되는 사용량을 확인하려면 API 키로 로그인하세요.

```bash
# macOS or Linux
printenv OPENAI_API_KEY | codex login --with-api-key
```

```powershell
# Windows PowerShell
$env:OPENAI_API_KEY | codex login --with-api-key
```

그런 다음 CLI가 시작되는지 확인합니다.

```bash
codex
```

Paseo는 Codex 에이전트를 시작할 때 이 설치와 기존 인증을 사용합니다.

## Paseo에 Codex가 없습니다.

ChatGPT 데스크톱 앱과 Codex CLI는 별도로 설치됩니다. 데스크톱 앱을 설치해도 `codex` 명령을 Paseo에서 사용할 수 없습니다.

`PATH`에 CLI가 있는지 확인하세요.

```bash
# macOS or Linux
which -a codex

# Windows
where.exe codex
```

명령을 찾을 수 없는 경우:

1. [Codex CLI](https://learn.chatgpt.com/docs/codex/cli)를 설치합니다.
2. 위의 명령을 사용하여 ChatGPT 또는 API 키로 로그인합니다. [코덱스 인증](https://learn.chatgpt.com/docs/auth)을 참고하세요.
3. CLI를 설치할 때 데몬이 이미 실행 중이었다면 Paseo를 다시 시작합니다.
4. Paseo에서 **설정 → 공급자 → Codex**를 열고 **새로 고침**을 선택합니다.

Paseo가 `codex` 명령을 찾아 시작할 수 있게 되면 공급자를 사용할 수 있게 됩니다.

## Paseo 터미널에서 Codex를 사용하세요

Codex는 Paseo 터미널 내부에서도 작동합니다. 작업 공간에서 터미널을 열고 표준 CLI 환경을 위해 `codex`을 실행하는 동시에 작업 공간, git 변경 사항 및 기타 Paseo 도구에 대한 액세스를 유지하세요.

## 참고하세요

- [지원되는 공급자](/docs/supported-providers), 다른 에이전트의 경우 Codex와 함께 실행할 수 있습니다.
- [사용자 정의 공급자](/docs/custom-providers), 사용자 정의 바이너리, 타사 엔드포인트 또는 여러 Codex 프로필용.
- [Paseo vs Codex 앱](/alternatives/codex-app), 기능 비교.