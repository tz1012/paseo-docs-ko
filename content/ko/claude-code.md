---
title: Claude Code
description: Run Claude Code in Paseo using your existing Claude plan.
nav: Claude Code
order: 23
category: Providers
---

# 클로드 코드

Paseo는 Claude Agent SDK를 사용하여 공식 `claude` CLI를 통해 Claude Code를 실행합니다.

## Claude Code는 Paseo에서 추가 비용이 듭니까?

아니요. Paseo의 Claude Code 사용량은 일반적인 Claude 플랜 한도에 포함됩니다. 별도의 Agent SDK 크레딧 풀이 필요하지 않습니다.

여전히 Claude Code가 포함된 Claude 플랜이 필요하며 플랜의 일반적인 사용량 한도가 적용됩니다.

## 시작하기

Paseo를 실행하는 머신에 Claude Code CLI를 설치하고 로그인합니다. Paseo는 Claude Code 에이전트를 시작할 때 기존 설치 및 계정을 사용합니다.

Claude 로그인이 만료되면 Claude Code CLI로 다시 인증한 다음 Paseo에서 새로운 Claude Code 세션을 시작하세요. 기존 Paseo 세션은 시작된 인증을 유지하므로 재인증해도 이미 실행 중인 세션이 업데이트되지 않습니다.

## Paseo 터미널에서 Claude Code 사용

Claude Code는 Paseo 터미널 내부에서도 훌륭하게 작동합니다. 표준 CLI 환경을 선호한다면 작업 공간에서 터미널을 열고 평소처럼 `claude`을 실행하세요.

작업 공간, Git 변경 사항 및 기타 Paseo 도구에 계속 액세스하면서 Paseo의 데스크탑, 웹 또는 모바일 앱에서 터미널을 사용할 수 있습니다.

## 참고하세요

- [지원되는 공급자](/docs/supported-providers), 다른 에이전트의 경우 Claude Code와 함께 실행할 수 있습니다.
- [사용자 정의 공급자](/docs/custom-providers) - 사용자 정의 바이너리, 타사 엔드포인트 또는 여러 Claude 프로필용.
- [Paseo 대 Claude Desktop](/alternatives/claude-desktop), 기능 비교.