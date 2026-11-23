---
title: GitHub Copilot
description: Install the GitHub Copilot CLI and run it in Paseo.
nav: GitHub Copilot
order: 27
category: Providers
---

# GitHub Copilot

Paseo는 설치된 `copilot` CLI에서 공식 에이전트 클라이언트 프로토콜(`copilot --acp`)을 통해 GitHub Copilot을 실행합니다. 로컬 CLI와 기존 GitHub 로그인을 사용합니다.

## 시작하기

GitHub Copilot은 Paseo에 내장되어 있으며 기본적으로 활성화되어 있습니다.

1. 데몬 호스트에 [GitHub Copilot CLI](https://github.com/features/copilot/cli/)를 설치합니다.
2. 터미널에서 `copilot`을 실행하고 GitHub에 로그인합니다.
3. Paseo에서 에이전트를 시작할 때 **Copilot**을 선택하세요.

`copilot`이 데몬 PATH 외부에 있는 경우 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하고 인수에 `--acp`을 유지하세요.

## 모드

**Agent**가 기본 모드입니다.

| 모드 | 효과 |
| --------- | ------------------------------------------------------------------ |
| 에이전트 | 대화 작업의 기본 모드입니다.                          |
| 계획 | Copilot은 다단계 계획을 생성하고 실행합니다.                         |
| 모두 허용 | Copilot은 묻지 않고 모든 도구, 경로 및 URL 요청을 승인합니다. |
