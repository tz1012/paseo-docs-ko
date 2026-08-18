---
title: Custom providers
description: Configure custom providers, alternative endpoints, profiles, custom binaries, and ACP agents in ~/.paseo/config.json.
nav: Custom providers
order: 22
category: Providers
---

# 맞춤 공급자

[지원되는 제공업체](/docs/supported-providers) 이외의 모든 항목은 `~/.paseo/config.json`의 `agents.providers`에 속합니다. 다음을 수행할 수 있습니다.

- 다른 API(Z.AI, Alibaba/Qwen, 프록시, 자체 호스팅 엔드포인트)를 가리키도록 일류 공급자를 **확장**합니다.
- **프로필 추가**, 다양한 자격 증명 또는 선별된 모델 목록을 사용하여 동일한 기본 공급자에 대한 여러 항목을 추가합니다.
- **바이너리를 재정의**하고 설치된 CLI 대신 야간 빌드, 래퍼 스크립트 또는 Docker 이미지를 실행합니다.
- **ACP 에이전트**, Gemini CLI, Hermes 또는 stdio를 통해 에이전트 클라이언트 프로토콜을 사용하는 에이전트를 추가하세요.
- 사용하지 않는 공급자를 **비활성화**합니다.

파일을 편집한 후 `paseo reload`를 실행하세요. 공급자 변경은 데몬을 다시 시작하지 않아도 이후 실행에 적용됩니다.

공급자 ID는 하이픈이 포함된 소문자 영숫자(`/^[a-z][a-z0-9-]*$/`)여야 합니다. 모든 사용자 정의 항목에는 `extends`(1급 공급자 ID 또는 `"acp"`) 및 `label`이 필요합니다.

아래 예는 간략한 둘러보기입니다. 전체 최신 참조는 GitHub: [docs/custom-providers.md](https://github.com/getpaseo/paseo/blob/main/docs/custom-providers.md)에 있습니다.

## 일류 공급자 확장

```json
{
  "agents": {
    "providers": {
      "my-claude": {
        "extends": "claude",
        "label": "My Claude",
        "env": {
          "ANTHROPIC_API_KEY": "sk-ant-...",
          "ANTHROPIC_BASE_URL": "https://my-proxy.example.com/v1"
        }
      }
    }
  }
}
```

## Z.AI(GLM) 코딩 계획

Z.AI는 Anthropic 호환 엔드포인트를 통해 GLM 모델을 노출합니다. API에서 `ANTHROPIC_BASE_URL`을 가리키고 키로 `ANTHROPIC_AUTH_TOKEN`을 사용합니다. 타사 엔드포인트는 Anthropic의 서버 측 도구를 지원하지 않으므로 `WebSearch`을 비활성화합니다.

```json
{
  "agents": {
    "providers": {
      "zai": {
        "extends": "claude",
        "label": "ZAI",
        "env": {
          "ANTHROPIC_AUTH_TOKEN": "<your-zai-api-key>",
          "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
          "API_TIMEOUT_MS": "3000000"
        },
        "disallowedTools": ["WebSearch"],
        "models": [
          { "id": "glm-5-turbo", "label": "GLM 5 Turbo", "isDefault": true },
          { "id": "glm-5.1", "label": "GLM 5.1" }
        ]
      }
    }
  }
}
```

## 알리바바 클라우드(Qwen) 코딩 계획

Alibaba의 코딩 계획은 Anthropic 호환 API를 통해 Claude Code를 Qwen 모델로 라우팅합니다. 구독 키는 `sk-sp-...`과 유사하며 싱가포르 지역에서 생성되어야 합니다.

```json
{
  "agents": {
    "providers": {
      "qwen": {
        "extends": "claude",
        "label": "Qwen (Alibaba)",
        "env": {
          "ANTHROPIC_AUTH_TOKEN": "sk-sp-<coding-plan-key>",
          "ANTHROPIC_BASE_URL": "https://coding-intl.dashscope.aliyuncs.com/apps/anthropic"
        },
        "disallowedTools": ["WebSearch"],
        "models": [
          { "id": "qwen3.5-plus", "label": "Qwen 3.5 Plus", "isDefault": true },
          { "id": "qwen3-coder-next", "label": "Qwen 3 Coder Next" }
        ]
      }
    }
  }
}
```

## 여러 프로필

동일한 일류 공급자에 대해 원하는 만큼 항목을 만듭니다. 각각은 자체 자격 증명 및 모델과 함께 앱에 별도의 옵션으로 표시됩니다.

```json
{
  "agents": {
    "providers": {
      "claude-work": {
        "extends": "claude",
        "label": "Claude (Work)",
        "env": { "ANTHROPIC_API_KEY": "sk-ant-work-..." }
      },
      "claude-personal": {
        "extends": "claude",
        "label": "Claude (Personal)",
        "env": { "ANTHROPIC_API_KEY": "sk-ant-personal-..." }
      }
    }
  }
}
```

## 사용자 정의 바이너리

`command`은 배열이고 첫 번째 요소는 바이너리이고 나머지는 인수입니다. 이는 해당 공급자의 기본 시작 명령을 완전히 대체합니다.

```json
{
  "agents": {
    "providers": {
      "claude": {
        "command": ["/opt/claude-nightly/claude"]
      }
    }
  }
}
```

## ACP 제공업체

stdio를 통해 [ACP](https://agentclientprotocol.com)를 사용하는 에이전트는 `extends: "acp"` 및 `command`을 사용하여 추가할 수 있습니다. Paseo는 프로세스를 생성하고 `initialize` JSON-RPC 요청을 보내고 에이전트는 런타임에 해당 기능, 모드 및 모델을 보고합니다.

```json
{
  "agents": {
    "providers": {
      "gemini": {
        "extends": "acp",
        "label": "Google Gemini",
        "command": ["gemini", "--acp"]
      },
      "hermes": {
        "extends": "acp",
        "label": "Hermes",
        "command": ["hermes", "acp"]
      }
    }
  }
}
```

## 모델 추가 또는 라벨 재지정

`models`은 모델 목록을 완전히 대체합니다. `additionalModels`은 런타임 검색 모델(ACP) 또는 `models`과 병합하여 이를 사용하여 전체 목록을 다시 선언하지 않고 추가 항목을 추가하거나 검색된 모델의 레이블을 다시 지정합니다. 검색된 모델과 동일한 `id` 항목이 해당 위치에서 업데이트됩니다.

```json
{
  "agents": {
    "providers": {
      "gemini": {
        "extends": "acp",
        "label": "Google Gemini",
        "command": ["gemini", "--acp"],
        "additionalModels": [
          { "id": "experimental-model", "label": "Experimental", "isDefault": true },
          { "id": "gemini-2.5-pro", "label": "Gemini 2.5 Pro (preferred)" }
        ]
      }
    }
  }
}
```

## 공급자 비활성화

```json
{
  "agents": {
    "providers": {
      "copilot": { "enabled": false }
    }
  }
}
```

## 전체 참조

전체 필드 참조(`extends`, `label`, `command`, `env`, `models`, `additionalModels`, `disallowedTools`, `enabled`, `order`), 모델 및 사고 옵션 스키마 및 심층 각 계획에 대한 예는 GitHub의 [docs/custom-providers.md](https://github.com/getpaseo/paseo/blob/main/docs/custom-providers.md)를 참조하세요.
