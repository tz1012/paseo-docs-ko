---
title: Metadata generation
description: How Paseo uses providers to generate branch names, commit messages, and pull request text, and how to configure them.
nav: Metadata generation
order: 42
category: Configuration
---

# 메타데이터 생성

Paseo는 언어 모델에게 짧은 텍스트를 작성해 달라고 요청하므로 사용자는 그럴 필요가 없습니다. 이는 대화 중인 에이전트와는 별개입니다. 백그라운드에서 이루어지는 소규모 일회성 모델 호출입니다.

Paseo는 다음과 같은 종류의 메타데이터를 생성합니다.

- **작업 공간 제목** — 사이드바에 표시되는 작업 공간에 대한 짧은 작업 모양 레이블입니다.
- **작업 트리 분기 이름** — 새로운 작업 트리 격리 작업 공간 분기에 대한 슬러그입니다.
- **커밋 메시지** — 커밋 중인 변경 사항에 대한 간결한 메시지입니다.
- **풀 요청 제목 및 본문** — PR을 열 때 diff에서 초안이 작성됩니다.

작업 공간 제목과 해당 분기 이름은 동일한 프롬프트에서 함께 생성되지만 해당 문구는 독립적으로 구성합니다(아래 참조).

## 모델을 선택하는 방법

아무것도 구성할 필요가 없습니다. Paseo는 자동으로 모델을 선택합니다. 순서가 지정된 후보 목록을 작성하고 한 세대가 성공할 때까지 각 후보를 시도하므로 느리거나 사용할 수 없는 모델이 다음 세대로 넘어갑니다.

후보자 목록은 다음 순서로 구성됩니다.

1. **귀하가 구성한 공급자**(나열한 순서대로)(아래 참조).
2. **내장된 기본값**은 활성화한 공급자 모델과 일치합니다.
   1. `haiku` 모델
   2. `gpt-5.4-mini`(낮은 추론)
   3. `minimax-m3`
   4. `nemotron-3-super`
3. 최후의 수단으로 해당 에이전트 또는 초안에 대해 **현재 선택된 모델**.

각 기본값은 모델 ID 또는 이름과 일치하므로 일치하는 모델을 제공하는 첫 번째 활성화된 공급자가 승리합니다. 활성화된 공급자에 대해 해결할 수 없는 모든 항목은 건너뜁니다. 중복 항목이 제거된 다음 생성 시 목록을 위에서 아래로 시도합니다.

기본 순서의 의도는 선택한 항목으로 돌아가기 전에 이러한 짧은 작업에 대해 작고 빠르며 저렴한 모델을 선호하는 것입니다.

## 공급자 구성

Paseo가 사용하는 모델을 제어하려면(예: 모든 메타데이터 생성을 하나의 공급자에 유지하거나 로컬 모델을 선호하는 경우) `agents.metadataGeneration.providers`을 `~/.paseo/config.json`에 설정하세요. 기본 제공 기본값보다 먼저 항목이 시도됩니다.

```json
{
  "agents": {
    "metadataGeneration": {
      "providers": [
        { "provider": "claude", "model": "claude-haiku-4-5-20251001", "thinkingOptionId": "low" },
        { "provider": "opencode" }
      ]
    }
  }
}
```

각 항목에는 다음이 허용됩니다.

- `provider` (필수) — 공급자 ID입니다. 내장 ID는 `claude`, `codex`, `copilot`, `opencode` 및 `pi`입니다. 맞춤 공급자는 귀하가 제공한 ID를 사용합니다.
- `model` (선택 사항) — 특정 모델 ID입니다. 해당 공급자의 기본 모델을 사용하려면 생략하세요.
- `thinkingOptionId` (선택 사항) — 이를 지원하는 모델의 추론/사고 수준입니다. 값이 해당 모델에 유효하지 않은 경우 모델의 기본값으로 돌아갑니다.

파일을 편집한 후 데몬을 다시 시작하십시오.

## 프로젝트별 지침

저장소 루트에 있는 `paseo.json` 파일을 사용하여 저장소별로 각 종류의 메타데이터의 표현을 조정할 수 있습니다. Paseo는 작업 트리 구성을 읽는 것과 같은 방식으로 기본 분기의 커밋된 버전에서 이를 읽습니다.

```json
{
  "metadataGeneration": {
    "title": { "instructions": "Keep titles to a few words, no leading verb." },
    "branchName": { "instructions": "Use the format <type>/<scope>-<short-desc>." },
    "commitMessage": { "instructions": "Follow Conventional Commits." },
    "pullRequest": { "instructions": "Include a Testing section in the body." }
  }
}
```

각 키는 선택 사항입니다. 귀하가 설정한 항목만 영향을 받습니다. 귀하의 지침은 해당 메타데이터 유형의 기본 스타일을 **교체**하므로 여기에 추가되지 않으므로 귀하의 문구가 Paseo의 기본값과 경쟁하지 않습니다. 기능적 요구 사항(생성 대상 및 출력 형식)은 항상 적용되며 재정의될 수 없습니다.
