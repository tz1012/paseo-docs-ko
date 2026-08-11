---
title: Providers
description: How Paseo thinks about coding agents, wrapping existing CLIs, native vs ACP support, and where to go next.
nav: Providers
order: 20
category: Providers
---

# 제공자

Paseo는 자체 코딩 에이전트를 배송하지 않습니다. **이미 설치하고 인증한 기존 CLI**, Claude Code, Codex, OpenCode, Cursor, Gemini 등을 시작하고 감독합니다. 구독, 구성, 기술, MCP 서버는 모두 그대로 유지됩니다. Paseo는 UI, CLI, 릴레이 및 오케스트레이션을 제공합니다.

## 정신 모델

공급자는 Paseo와 하나의 외부 에이전트 CLI 간의 계약입니다. 이를 시작하는 방법, 출력을 스트리밍하는 방법, 입력을 다시 보내는 방법, 지원하는 모드 등이 있습니다. 실제 바이너리는 컴퓨터에 존재하며 일반 하위 프로세스로 실행됩니다.

## 2계층

- **기본 지원**, Paseo는 주요 에이전트(Claude Code, Codex, OpenCode, pi)용 번들 어댑터를 제공합니다. 해당되는 경우 모드 메타데이터 및 음성 지원과 함께 기본 CLI가 설치되면 자동으로 검색됩니다.
- **ACP 카탈로그**, [에이전트 클라이언트 프로토콜](https://agentclientprotocol.com)을 사용하는 모든 에이전트는 일반 어댑터를 통해 지원됩니다. Paseo는 원클릭 설치로 구성된 카탈로그(Cursor, Gemini, GitHub Copilot, Hermes, Kimi, Qwen Code 등 25개 이상)를 제공하며 다른 ACP 에이전트를 직접 추가할 수 있습니다.

어느 쪽이든 **기본 CLI를 설치**합니다. Paseo가 운영합니다.

## 다음은 어디로 갈까?

- [지원되는 공급자](/docs/supported-providers), 설치 링크가 포함된 전체 목록.
- [맞춤 공급자](/docs/custom-providers), 자체 공급자 추가, 다른 엔드포인트의 기존 공급자 지정, 여러 프로필 실행 또는 `~/.paseo/config.json`의 바이너리 재정의.
- [paseo.sh/agents](/agents), 지원되는 각 제공업체에 대한 에이전트별 랜딩 페이지입니다.