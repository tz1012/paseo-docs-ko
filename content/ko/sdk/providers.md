---
title: Providers with the SDK
description: Select a provider and model, discover available configurations, and configure an agent session.
nav: Providers
order: 54
category: TypeScript SDK
---

# SDK를 사용하는 공급자

모든 에이전트 구성에는 공급자와 모델 이름이 모두 지정됩니다.

```ts
config: {
  provider: "codex/gpt-5.5",
}
```

첫 번째 `/`은 공급자를 모델에서 분리합니다. 모델 ID에는 추가 슬래시가 포함될 수 있습니다.

## 세션 구성

```ts
const agent = await client.agents.create({
  config: {
    provider: "codex/gpt-5.5",
    modeId: "full-access",
    thinkingOptionId: "high",
    featureValues: {
      web_search: false,
    },
  },
  cwd: process.cwd(),
  prompt: "Implement the accepted plan and run focused tests.",
});
```

| 필드 | 의미 |
| ------------------ | ------------------------------------ |
| `provider` | `provider/model` 선택이 필요합니다.                           |
| `modeId` | 공급자 작동 또는 권한 모드.                         |
| `thinkingOptionId` | 공급자 추론 수준.                                      |
| `featureValues` | `providers.listFeatures()`에서 반환된 기능의 값입니다.    |
| `options` | 샌드박스 및 권한 규칙과 같은 공급자 기본 설정. |
| `systemPrompt` | 추가 시스템 또는 개발자 지침.                   |
| `mcpServers` | 세션 범위 MCP 서버.                                    |
| `toolPolicy` | MCP 도구에 대한 정확한 사전 승인 규칙.                         |

[공급자 옵션](/docs/sdk/provider-options)에는 허용되는 샌드박스 및 권한 설정이 나열되어 있습니다.

## 설치된 공급자 및 모델 검색

```ts
const snapshot = await client.providers.waitForReady({
  cwd: process.cwd(),
  timeoutMs: 60_000,
});

for (const entry of snapshot.entries) {
  if (entry.status !== "ready") continue;

  for (const model of entry.models ?? []) {
    console.log(`${entry.provider}/${model.id}`);
  }
}
```

항목은 `ready`, `unavailable` 또는 `error`으로 끝납니다. `snapshot()`은 즉시 반환되며 `loading` 항목을 포함할 수 있습니다.

## 검색된 모델을 선택하세요

```ts
const snapshot = await client.providers.waitForReady({ cwd: process.cwd() });
const entry = snapshot.entries.find((candidate) => candidate.status === "ready");
const model = entry?.models?.find((candidate) => candidate.isDefault) ?? entry?.models?.[0];

if (!entry || !model) throw new Error("No provider model is ready");

const agent = await client.agents.create({
  config: {
    provider: `${entry.provider}/${model.id}`,
  },
  cwd: process.cwd(),
  prompt: "Summarize this repository.",
});
```

## 모드, 사고 수준 및 기능을 살펴보세요.

```ts
const models = await client.providers.listModels("codex", { cwd: process.cwd() });
const modes = await client.providers.listModes("codex", { cwd: process.cwd() });

const selectedModel = models.models[0]?.id;
const selectedMode = modes.modes[0]?.id;
if (!selectedModel) throw new Error("No Codex model is available");

const features = await client.providers.listFeatures({
  provider: `codex/${selectedModel}`,
  cwd: process.cwd(),
  modeId: selectedMode,
});
```

데몬에서 반환된 ID를 사용합니다. 공급자 설치 및 구성된 모델은 호스트마다 다릅니다.

## 사용할 수 없는 공급자 진단

```ts
const result = await client.providers.diagnostic("codex");
console.error(result.diagnostic);
```

호스트 수준 프로필, 바이너리, 자격 증명 및 사용자 지정 공급자는 [사용자 지정 공급자](/docs/custom-providers)에 속합니다.