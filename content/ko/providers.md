---
title: Providers
description: How Paseo thinks about coding agents, wrapping existing CLIs, native support and ACP agents, and where to go next.
nav: Providers
order: 20
category: Providers
---

# 제공자

Paseo는 **설치하고 인증한 기존 코딩 에이전트**를 편집기, 터미널, 차이점, 데스크톱의 경우 브라우저가 포함된 작업공간에서 실행합니다. 여러 에이전트를 병렬로 실행하고, 작업마다 공급자를 선택하고, 같은 앱에서 결과를 검토하세요. 구독, 구성, 스킬 및 MCP 서버는 그대로 유지됩니다.

이 워크플로를 사용해 보려면 [별도 작업 트리에서 병렬 작업을 실행하세요](/docs/parallel-development).

## 정신 모델

공급자는 Paseo와 하나의 외부 에이전트 CLI 간의 계약입니다. 이를 시작하는 방법, 출력을 스트리밍하는 방법, 입력을 다시 보내는 방법, 지원하는 모드 등이 있습니다. 실제 바이너리는 컴퓨터에 존재하며 일반 하위 프로세스로 실행됩니다.

## 네이티브 지원과 ACP 에이전트

- **네이티브 지원.** Paseo는 다음 각 에이전트의 통합을 제공합니다. [Antigravity](/docs/supported-providers/antigravity), [Claude Code](/docs/supported-providers/claude-code), [Codex](/docs/supported-providers/codex), [fx](/docs/supported-providers/fx), [GitHub Copilot](/docs/supported-providers/github-copilot), [Hoplite](/docs/supported-providers/hoplite), [Muse Code](/docs/supported-providers/muse-code), [Oh My Pi](/docs/supported-providers/omp), [OpenCode](/docs/supported-providers/opencode), [Pi](/docs/supported-providers/pi). 대부분은 CLI를 설치하면 Paseo에 표시되며, 해당되는 경우 모드 메타데이터와 음성 지원도 제공됩니다.
- **ACP 에이전트.** Paseo는 [Agent Client Protocol](https://agentclientprotocol.com)을 사용하는 모든 에이전트를 범용 어댑터로 실행합니다. 인앱 카탈로그에는 Cursor, Gemini CLI, Hermes, Kimi, Qwen Code를 비롯해 30개 이상의 에이전트가 나열되며, 다른 ACP 에이전트를 직접 추가할 수도 있습니다.

어느 쪽이든 **기본 CLI를 설치**합니다. Paseo가 운영합니다.

## 다음은 어디로 갈까?

- [지원되는 공급자](/docs/supported-providers), 설치 링크가 포함된 전체 목록.
- [에이전트 프로필](/docs/agent-profiles), 모델, 모드 및 사고 설정을 함께 저장하고 메모로 위임을 안내합니다.
- [맞춤 공급자](/docs/custom-providers), 자체 공급자 추가, 다른 엔드포인트의 기존 공급자 지정, 여러 공급자 별칭 구성 또는 `~/.paseo/config.json`의 바이너리 재정의.
- [paseo.sh/agents](/agents), 지원되는 각 제공업체에 대한 에이전트별 랜딩 페이지입니다.
