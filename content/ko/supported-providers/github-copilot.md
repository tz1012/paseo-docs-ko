---
title: GitHub Copilot
description: Install the GitHub Copilot CLI and run it in Paseo.
nav: GitHub Copilot
order: 27
category: Providers
---

# GitHub Copilot

기존 `copilot` CLI와 GitHub 계정을 사용해 Paseo에서 GitHub Copilot을 실행합니다.

## 시작하기

1. 데몬 호스트에 [GitHub Copilot CLI](https://github.com/features/copilot/cli/)를 설치합니다.
2. 터미널에서 `copilot`을 실행하고 GitHub에 로그인합니다.
3. Paseo에서 에이전트를 시작할 때 **Copilot**을 선택하세요.

Paseo는 `copilot --acp`를 실행하고 CLI의 기존 로그인을 사용합니다. `copilot`이 데몬의 PATH 밖에 있다면 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하고 인수에는 `--acp`를 유지하세요.

## 모드

**Agent**가 기본 모드입니다.

| 모드 | 효과 |
| --------- | ------------------------------------------------------------- |
| Agent | 대화형 작업을 위한 기본 모드입니다. |
| Plan | Copilot이 여러 단계의 계획을 만들고 실행합니다. |
| Allow All | Copilot이 모든 도구, 경로, URL 요청을 스스로 승인합니다. |
