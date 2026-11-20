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

Paseo는 다음 각 에이전트의 통합을 제공합니다.

- [Antigravity](/docs/supported-providers/antigravity), 설치된 `agy` CLI를 통해 실행됩니다.
- [Claude Code](/docs/supported-providers/claude-code), Anthropic의 코딩 에이전트입니다.
- [Codex](/docs/supported-providers/codex), OpenAI의 작업공간 에이전트입니다.
- [fx](/docs/supported-providers/fx), Vercel Labs의 코딩 에이전트입니다.
- [GitHub Copilot](/docs/supported-providers/github-copilot), GitHub의 AI 페어 프로그래머입니다.
- [Hoplite](/docs/supported-providers/hoplite), 클라우드 코딩 에이전트입니다.
- [Muse Code](/docs/supported-providers/muse-code), Meta의 터미널 코딩 에이전트입니다.
- [Oh My Pi](/docs/supported-providers/omp), 다중 공급자 코딩 에이전트입니다.
- [OpenCode](/docs/supported-providers/opencode), 오픈 소스 코딩 도우미입니다.
- [Pi](/docs/supported-providers/pi), 최소형 터미널 코딩 에이전트입니다.

## ACP를 통한 추가 에이전트

Paseo는 [Agent Client Protocol](https://agentclientprotocol.com)(ACP)을 사용하는 모든 에이전트를 실행합니다. 인앱 카탈로그에는 아래 에이전트가 나열됩니다.

에이전트를 추가하려면 **설정 → 호스트 → 해당 호스트 → 공급자**를 열고 **+ 공급자**를 선택한 다음 에이전트를 찾아 **추가**를 선택하세요. `npx`나 `uvx`를 통해 실행되는 항목은 데몬 호스트에 해당 도구만 있으면 됩니다. 다른 항목은 먼저 에이전트의 CLI를 설치하세요. CLI가 없으면 공급자 페이지에 **설치되지 않음**이 표시되고, **설치**를 누르면 설치 지침이 열립니다.

- [Agoragentic](https://agoragentic.com), 174개 이상의 AI 기능을 갖춘 에이전트 마켓플레이스입니다.
- [Amp](https://github.com/tao12345666333/amp-acp), 프런티어 코딩 에이전트입니다.
- [Auggie CLI](https://www.augmentcode.com/), 컨텍스트 엔진을 기반으로 하는 Augment Code의 에이전트입니다.
- [Autohand Code](https://www.autohand.ai/cli/), Autohand AI의 코딩 에이전트입니다.
- [Cline](https://cline.bot/cli), 자율 코딩 에이전트입니다.
- [Codebuddy Code](https://www.codebuddy.cn/cli/), Tencent Cloud의 코딩 도구입니다.
- [CodeWhale](https://codewhale.net/), DeepSeek V4 및 오픈 모델용 터미널 코딩 에이전트입니다.
- [Cortex Code](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code-cli), Snowflake의 코딩 에이전트입니다.
- [Corust Agent](https://github.com/Corust-ai/corust-agent-release/releases), Rust 중심의 코딩 파트너입니다.
- [crow-cli](https://crow-ai.dev/), 최소형 ACP 네이티브 코딩 에이전트입니다.
- [Cursor](https://cursor.com/docs/cli/overview), Cursor의 코딩 에이전트입니다.
- [DeepAgents](https://docs.langchain.com/oss/javascript/deepagents/overview), LangChain 기반 코딩 에이전트입니다.
- [Devin CLI](https://cli.devin.ai/docs), Cognition의 터미널용 Devin입니다.
- [DimCode](https://dimcode.dev/docs/acp.html), 다중 모델 코딩 에이전트입니다.
- [Dirac](https://dirac.run), 해시 앵커 병렬 편집 기능을 갖춘 오픈 소스 에이전트입니다.
- [Factory Droid](https://factory.ai/product/cli), Factory AI의 코딩 에이전트입니다.
- [fast-agent](https://fast-agent.ai/acp/), 다중 공급자 코딩 에이전트입니다.
- [Gajae Code](https://gajae-code.com), 변경 전에 계획을 세우는 워크플로를 사용하는 구독 기반 코딩 에이전트입니다.
- [Gemini CLI](https://geminicli.com), Google의 공식 Gemini CLI입니다.
- [GLM Agent](https://github.com/stefandevo/glm-acp-agent), Zhipu AI의 GLM 코딩 에이전트입니다.
- [goose](https://block.github.io/goose/), Block의 로컬 오픈 소스 AI 에이전트입니다.
- [Grok](https://docs.x.ai/build/overview), xAI의 Grok Build 에이전트형 코딩 CLI입니다.
- [Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/features/acp), Nous Research의 자기 개선 에이전트입니다.
- [Junie](https://junie.jetbrains.com/docs/junie-cli-acp.html), JetBrains의 코딩 에이전트입니다.
- [Kilo Code](https://kilo.ai/docs/code-with-ai/platforms/cli), 오픈 소스 코딩 에이전트입니다.
- [Kimi Code CLI](https://github.com/MoonshotAI/kimi-code), Moonshot AI의 코딩 도우미입니다.
- [Kiro CLI](https://kiro.dev/docs/cli/acp/), Amazon의 코딩 에이전트입니다.
- [MiniMax Code](https://agent.minimax.io), MiniMax의 터미널 코딩 에이전트입니다.
- [Minion Code](https://github.com/femto/minion-code), Minion 프레임워크 코딩 에이전트입니다.
- [Mistral Vibe](https://github.com/mistralai/mistral-vibe), Mistral의 오픈 소스 CLI 도우미입니다.
- [Nova](https://www.compassap.ai/portfolio/nova.html), Compass AI의 소프트웨어 엔지니어입니다.
- [Poolside](https://docs.poolside.ai/cli/pool), Poolside의 코딩 에이전트입니다.
- [Qoder](https://qoder.com), 에이전트형 코딩 도우미입니다.
- [Qwen Code](https://qwenlm.github.io/qwen-code-docs/en/users/overview), Alibaba의 Qwen 코딩 도우미입니다.
- [siGit Code](https://github.com/getsigit/sigit), 선택적 온디바이스 LLM을 갖춘 로컬 우선 코딩 에이전트입니다.
- [Stakpak](https://stakpak.dev/), Rust 기반 DevOps 에이전트입니다.
- [TRAE CLI](https://docs.trae.cn/cli_get-started-with-trae-cli), ByteDance의 공식 TRAE 코딩 에이전트입니다.
- [VT Code](https://github.com/vinhnx/VTCode/blob/main/docs/guides/zed-acp.md), 오픈 소스 다중 공급자 코딩 에이전트입니다.

인앱 카탈로그가 이 목록의 버전 고정 원본입니다. 카탈로그에 없는 에이전트를 추가하려면 [사용자 정의 공급자](/docs/custom-providers#acp-providers)를 참조하세요.
