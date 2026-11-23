---
title: Claude Code
description: Run Claude Code in Paseo using your existing Claude plan.
nav: Claude Code
order: 24
category: Providers
---

# 클로드 코드

Paseo 공식 `claude` CLI 및 Claude Agent SDK를 통해 Claude Code를 실행합니다. 로컬 설치 및 기존 Claude 계정을 사용합니다.

## 시작하기

Claude Code는 Paseo에 내장되어 있으며 기본적으로 활성화되어 있습니다.

1. 데몬 호스트에 [Claude Code CLI](https://code.claude.com/docs/en/setup#install-claude-code)를 설치합니다.
2. 터미널에서 `claude`을 실행하고 로그인합니다.
3. Paseo에서 에이전트 시작 시 **Claude**를 선택합니다.

`claude`이 데몬 PATH 외부에 있는 경우 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하세요.

Claude 로그인이 만료되면 Claude Code CLI에 다시 로그인하고 Paseo에서 새 세션을 시작하세요. 실행 중인 세션은 시작된 인증을 유지하므로 다시 로그인해도 활성 세션이 업데이트되지 않습니다.

## Claude Code는 Paseo에서 추가 비용이 듭니까?

아니요. Paseo의 Claude Code 사용량은 일반적인 Claude 플랜 한도에 포함됩니다. 별도의 Agent SDK 크레딧 풀이 필요하지 않습니다.

여전히 Claude Code가 포함된 Claude 플랜이 필요하며 플랜의 일반 사용량 한도가 적용됩니다.

## Paseo 터미널에서 Claude Code 사용

Claude Code는 Paseo 터미널 내부에서도 작동합니다. 작업 공간에서 터미널을 열고 표준 CLI 환경을 위해 `claude`을 실행하세요.

Paseo의 데스크톱, 웹, 모바일 앱에서 터미널을 사용할 수 있습니다. 작업 공간, Git 변경 사항 및 기타 Paseo 도구에 계속 액세스할 수 있습니다.

## 참고하세요

- [지원되는 공급자](/docs/supported-providers), 다른 에이전트의 경우 Claude Code와 함께 실행할 수 있습니다.
- [사용자 정의 공급자](/docs/custom-providers) - 사용자 정의 바이너리, 타사 엔드포인트 또는 여러 Claude 프로필용.
- [Paseo 대 Claude Desktop](/alternatives/claude-desktop), 기능 비교.
