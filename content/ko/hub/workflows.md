---
title: Hub workflows
description: Build ordered Hub workflows with prompts, routing, outputs, and provider authority.
nav: Workflows
order: 64
category: Hub
---

# 허브 워크플로

워크플로 파일에는 하나의 트리거와 트리거가 시작되는 순서가 지정된 단계가 포함되어 있습니다. 파일은 `.paseo/workflows/*.yml`에서 검색됩니다.

## 첫 번째 작업 흐름

`.paseo/hub.yml`이 `dev`이라는 환경과 `codex`이라는 에이전트를 정의한다고 가정합니다. `.paseo/workflows/slack-help.yml` 추가:

```yaml
name: slack-help
on: slack.mention
max_runtime: 1h
filters:
  workspace: T01234567
  channels: [C01234567]
  from_users: [U01234567]
steps:
  - id: answer
    environment: dev
    max_runtime: 30m
    idle_timeout: 5m
    agent: codex
    prompt:
      - text: |
          Answer the request. Call hub.reply once, then call hub.finish_execution.

          <user-prompt>
          ${{ paseo.prompt }}
          </user-prompt>
    allow_outputs:
      - { type: slack.reply, max: 1, required: true }
```

Hub는 나머지 텍스트를 `${{ paseo.prompt }}`으로 노출하기 전에 멘션과 선언된 입력 헤더를 제거합니다. 응답 기능은 Slack 트리거 옆에 명시적으로 표시됩니다. Discord는 `discord.reply`을 사용합니다. GitHub는 `hub.reply`이 아닌 단계 범위 [`github` 블록](/docs/hub/github)을 사용합니다.

## 단계가 실행되는 위치 선택

리터럴은 명명된 환경 하나를 선택합니다.

```yaml
environment: dev
```

유한 입력은 완전한 명명된 환경 중에서 선택할 수 있습니다.

```yaml
name: route-repository
on: manual.run
max_runtime: 1h
filters:
  from_users: [automation]
inputs:
  repo:
    type: string
    required: true
    choices: [paseo, hub]
steps:
  - id: work
    environment: ${{ paseo.inputs.repo }}
    max_runtime: 30m
    idle_timeout: 5m
    agent: codex
    prompt:
      - text: ${{ paseo.prompt }}
```

활성화는 모든 `choices` 결과를 확인합니다. 환경 개체는 워크플로에 의해 병합되거나 재정의되지 않습니다.

## 에이전트를 선택하세요

단계에서는 명명된 에이전트를 선택할 수 있습니다.

```yaml
agent: codex-safe
```

또는 하나의 완전한 정적 인라인 구성을 제공하십시오.

```yaml
agent:
  provider: claude
  mode: full-access
```

동적 라우팅의 경우 유한 표현식에서 완전한 명명된 에이전트를 선택합니다.

```yaml
name: route-agent
on: manual.run
max_runtime: 1h
filters:
  from_users: [automation]
inputs:
  agent:
    type: string
    required: true
    choices: [codex-safe, claude]
steps:
  - id: work
    environment: paseo
    max_runtime: 30m
    idle_timeout: 5m
    agent: ${{ paseo.inputs.agent }}
    prompt:
      - text: ${{ paseo.prompt }}
```

`codex-safe`에 `hub.yml`에 구조화된 샌드박스 옵션이 포함된 경우 해당 옵션을 선택하면 해당 옵션이 변경되지 않습니다. `provider: ${{ paseo.inputs.agent }}`과 같은 동적 인라인 개체는 거부됩니다.

## 분류자로부터의 라우팅

이전 단계에서는 유한 구조화된 출력을 반환할 수 있습니다. 이후 권한은 해당 출력 스키마에서 `enum` 또는 `const`으로 제한되어야 합니다.

```yaml
name: classify-request
on: discord.mention
max_runtime: 2h
filters:
  guild: "123456789012345678"
  from_users: ["345678901234567890"]
values:
  selected_environment: ${{ steps.classify.outputs.environment }}
  selected_agent: ${{ steps.classify.outputs.agent }}
steps:
  - id: classify
    environment: hub
    max_runtime: 5m
    idle_timeout: 1m
    agent: claude
    prompt:
      - include: partials/classify.md
      - text: ${{ paseo.prompt }}
    output:
      schema:
        type: object
        required: [environment, agent]
        properties:
          environment: { enum: [paseo, hub] }
          agent: { enum: [codex-safe, claude] }
        additionalProperties: false
  - id: work
    environment: ${{ values.selected_environment }}
    max_runtime: 1h
    idle_timeout: 10m
    agent: ${{ values.selected_agent }}
    prompt:
      - text: |
          Complete the request. Call hub.reply once, then call hub.finish_execution.
      - text: ${{ paseo.prompt }}
    allow_outputs:
      - { type: discord.reply, max: 1, required: true }
```

`.paseo/workflows/partials/classify.md`:

```text
Choose one configured repository environment and one complete named agent configuration.
```

워크플로는 하나의 분류자 분기와 하나의 작업자 분기를 유지합니다. 모든 환경/공급자 쌍에 대해 작업자 단계를 복제하지 않습니다.

## 프롬프트 및 컨텍스트

프롬프트 블록은 순서대로 유지됩니다. 포함은 문자 그대로의 파일 내용입니다. Hub는 부분 텍스트를 재귀적으로 스캔하지 않습니다.

```yaml
prompt:
  - include: partials/instructions.md
  - text: |
      Provider evidence:
      ${{ paseo.context }}

      <user-prompt>
      ${{ paseo.prompt }}
      </user-prompt>
```

- `${{ paseo.prompt }}`은 정규화된 요청 텍스트입니다. 작성된 프롬프트에서는 항상 명시적입니다.
- `${{ paseo.context }}`은 이 단계를 공급자 컨텍스트 구체화에 선택하고 JSON을 삽입합니다. 해당 표현식이 없으면 Hub는 주변 컨텍스트를 가져오거나 주입하지 않습니다.

신뢰할 수 없는 요청 텍스트를 명확하게 구분된 블록에 보관하세요. 부분은 숨겨진 권한이 아닌 지침 텍스트입니다.

## 조건 및 정렬된 출력

단계는 파일 순서대로 실행됩니다. `if`은 입력, 값 및 이전 단계 출력을 읽을 수 있습니다.

```yaml
name: conditional-review
on: manual.run
max_runtime: 1h
filters:
  from_users: [automation]
steps:
  - id: inspect
    environment: paseo
    max_runtime: 10m
    idle_timeout: 2m
    agent: codex-safe
    prompt:
      - text: ${{ paseo.prompt }}
    output:
      schema:
        type: object
        required: [needs_review]
        properties:
          needs_review: { type: boolean }
        additionalProperties: false
  - id: review
    if: ${{ steps.inspect.outputs.needs_review == true }}
    environment: paseo
    max_runtime: 30m
    idle_timeout: 5m
    agent: claude
    prompt:
      - text: Review the prior result and call hub.finish_execution.
```

단계는 이후 단계를 읽을 수 없습니다. 단계 ID는 워크플로 내에서 고유합니다.

## 상담원에게 어떤 도구를 호출할지 알려주세요.

`allow_outputs`은 기능을 부여합니다. 프롬프트를 다시 작성하지 않습니다. 필요한 작업의 이름을 지정하세요.

```yaml
prompt:
  - text: |
      Send the final answer with hub.reply.
      Then call hub.finish_execution.
allow_outputs:
  - type: slack.reply
    max: 1
    required: true
```

`max`의 기본값은 `1`입니다. `required: true` 기능이 방출될 때까지 성공적인 완료를 방지합니다. Slack 및 Discord 응답 유형을 자체 공급자 워크플로 파일에 유지합니다.

## 마감일

`max_runtime` 워크플로는 전체 실행을 제한합니다. 모든 단계에는 고유한 `max_runtime` 및 `idle_timeout`이 있습니다. 남은 워크플로 시간은 둘 다 제한됩니다. 시간 초과로 인해 실행이 실패하고 이후 단계가 중지됩니다.

[구성 참조](/docs/hub/configuration/hub-yml)에는 모든 필드가 나열되어 있습니다. 공급자 필터 및 호출 텍스트는 [트리거](/docs/hub/triggers)에 있습니다.