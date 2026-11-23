---
title: Supported providers
description: Every coding agent Paseo can launch, with native support or through ACP.
nav: Supported providers
order: 21
category: Providers
---

# 지원되는 공급자

Paseo는 데몬 호스트에 설치하고 로그인한 코딩 에이전트를 실행합니다. Paseo가 공급자를 관리하는 방법은 [공급자](/docs/providers)를 참조하세요. 여기에 없는 에이전트를 추가하려면 [사용자 정의 공급자](/docs/custom-providers)를 참조하세요.

## 네이티브 지원

Paseo는 이러한 각 에이전트에 대한 통합을 제공합니다. 대부분은 CLI를 설치하고 로그인한 후 Paseo에 자동으로 나타납니다. 설정 단계 및 기본값을 보려면 공급자 페이지를 엽니다.

- [Antigravity](/docs/supported-providers/antigravity)은 ACP를 통해 설치된 `agy` CLI를 통해 실행됩니다.
- [Claude Code](/docs/supported-providers/claude-code), 앤트로픽의 코딩 에이전트.
- [Codex](/docs/supported-providers/codex), OpenAI의 작업공간 에이전트입니다.
- [fx](/docs/supported-providers/fx), Vercel Labs의 코딩 에이전트(설정에서 추가).
- [GitHub Copilot](/docs/supported-providers/github-copilot), GitHub의 AI 쌍 프로그래머.
- [Hoplite](/docs/supported-providers/hoplite), 클라우드 코딩 에이전트(설정에서 추가).
- [Muse Code](/docs/supported-providers/muse-code), 메타의 단말 코딩 에이전트.
- [오마이파이](/docs/supported-providers/omp), 다중 제공자 코딩 에이전트(기본적으로 꺼져 있음).
- [OpenCode](/docs/supported-providers/opencode), 오픈소스 코딩 도우미.
- [Pi](/docs/supported-providers/pi), 최소 단말 코딩 에이전트.

## ACP를 통한 추가 에이전트

Paseo는 [에이전트 클라이언트 프로토콜](https://agentclientprotocol.com)(ACP)을 사용하는 모든 에이전트를 실행합니다. 인앱 카탈로그에는 이러한 에이전트가 나열되어 있습니다.

카탈로그에서 하나를 추가하려면:

1. 에이전트가 `npx` 또는 `uvx`을 통해 시작되지 않으면 데몬 호스트에 해당 CLI를 설치합니다.
2. Paseo에서 **설정 → 호스트 → 호스트 → 공급자**를 엽니다.
3. **+ 공급자**를 선택하고 에이전트를 찾은 다음 **추가**를 선택합니다.

`npx` 또는 `uvx`을 통해 실행되는 항목에는 데몬 호스트에 해당 도구만 필요합니다. CLI가 누락된 경우 공급자 페이지에 **설치되지 않음**이 표시되고 **설치**에는 설치 지침이 열립니다.

- [Agoragentic](https://agoragentic.com), 174개 이상의 AI 기능을 갖춘 에이전트 마켓플레이스.
- [Amp](https://github.com/tao12345666333/amp-acp), 프론티어 코딩 에이전트.
- [Auggie CLI](https://www.augmentcode.com/), 컨텍스트 엔진의 지원을 받는 Augment Code 에이전트.
- [오토핸드코드](https://www.autohand.ai/cli/), 오토핸드 AI의 코딩 에이전트.
- [Cline](https://cline.bot/cli), 자율코딩 에이전트.
- [Codebuddy Code](https://www.codebuddy.cn/cli/), Tencent Cloud의 코딩 도구입니다.
- [CodeWhale](https://codewhale.net/), DeepSeek V4 및 오픈 모델용 터미널 코딩 에이전트.
- [Cortex Code](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code-cli), Snowflake의 코딩 에이전트.
- [Corust Agent](https://github.com/Corust-ai/corust-agent-release/releases), Rust 중심 코딩 파트너.
- [crow-cli](https://crow-ai.dev/), 최소 ACP 네이티브 코딩 에이전트입니다.
- [Cursor](https://cursor.com/docs/cli/overview), Cursor의 코딩 에이전트입니다.
- [DeepAgents](https://docs.langchain.com/oss/javascript/deepagents/overview), LangChain 기반 코딩 에이전트.
- [Devin CLI](https://cli.devin.ai/docs), 단말용 Cognition의 Devin입니다.
- [DimCode](https://dimcode.dev/docs/acp.html), 다중 모델 코딩 에이전트.
- [Dirac](https://dirac.run), 해시 앵커 병렬 편집 기능을 갖춘 오픈 소스 에이전트입니다.
- [Factory Droid](https://factory.ai/product/cli), Factory AI의 코딩 에이전트입니다.
- [fast-agent](https://fast-agent.ai/acp/), 다중 제공자 코딩 에이전트.
- [가재코드](https://gajae-code.com), 돌연변이 전 계획 워크플로를 갖춘 구독 기반 코딩 에이전트입니다.
- [Gemini CLI](https://geminicli.com), 구글의 공식 Gemini CLI입니다.
- [GLM 에이전트](https://github.com/stefandevo/glm-acp-agent), Zhipu AI의 GLM 코딩 에이전트.
- [goose](https://block.github.io/goose/), 블록의 로컬 오픈소스 AI 에이전트. Paseo는 goose가 모델 인벤토리 검색을 지원할 때 goose에 구성된 모든 공급자의 모델을 나열합니다.
- [Grok](https://docs.x.ai/build/overview), xAI의 Grok Build 에이전트 코딩 CLI.
- [Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/features/acp), Nous Research의 자기 개선 에이전트.
- [Junie](https://junie.jetbrains.com/docs/junie-cli-acp.html), JetBrains의 코딩 에이전트.
- [Kilo Code](https://kilo.ai/docs/code-with-ai/platforms/cli), 오픈소스 코딩 에이전트.
- [Kimi Code CLI](https://github.com/MoonshotAI/kimi-code), Moonshot AI의 코딩 도우미.
- [Kiro CLI](https://kiro.dev/docs/cli/acp/), 아마존 코딩 에이전트.
- [MiniMax Code](https://agent.minimax.io), 미니맥스의 단말코딩 에이전트.
- [미니온코드](https://github.com/femto/minion-code), 미니언 프레임워크 코딩 에이전트.
- [Mistral Vibe](https://github.com/mistralai/mistral-vibe), Mistral의 오픈소스 CLI 도우미.
- [Nova](https://www.compassap.ai/portfolio/nova.html), Compass AI의 소프트웨어 엔지니어.
- [Poolside](https://docs.poolside.ai/cli/pool), Poolside의 코딩 에이전트입니다.
- [Qoder](https://qoder.com), 에이전트 코딩 보조자.
- [Qwen Code](https://qwenlm.github.io/qwen-code-docs/en/users/overview), Alibaba의 Qwen 코딩 도우미.
- [siGit 코드](https://github.com/getsigit/sigit), 선택적 온디바이스 LLM이 포함된 로컬 우선 코딩 에이전트입니다.
- [Stakpak](https://stakpak.dev/), Rust 기반 DevOps 에이전트.
- [TRAE CLI](https://docs.trae.cn/cli_get-started-with-trae-cli), ByteDance의 공식 TRAE 코딩 에이전트입니다.
- [VT Code](https://github.com/vinhnx/VTCode/blob/main/docs/guides/zed-acp.md), 오픈소스 다중 공급자 코딩 에이전트.

인앱 카탈로그가 이 목록의 버전 고정 원본입니다. 카탈로그에 없는 에이전트를 추가하려면 [사용자 정의 공급자](/docs/custom-providers#acp-providers)를 참조하세요.
