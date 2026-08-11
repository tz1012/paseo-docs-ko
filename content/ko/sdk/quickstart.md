---
title: SDK quickstart
description: Connect to a Paseo daemon, run one coding agent, and read its reply.
nav: Quickstart
order: 51
category: TypeScript SDK
---

# SDK 빠른 시작

```bash
npm install @getpaseo/client
```

Node.js 22 이상이 필요합니다.

## 연결

```ts
import { createPaseoClient } from "@getpaseo/client";

const client = createPaseoClient({ url: "ws://127.0.0.1:6767/ws" });
await client.connect();
```

`connect()`은 데몬이 자신을 식별하면 해결됩니다. 데몬에 비밀번호가 있으면 이를 전달합니다.

```ts
const client = createPaseoClient({
  url: "wss://devbox.example.com/ws",
  password: "my-secret",
});
```

## 에이전트 생성

```ts
const agent = await client.agents.create({
  config: { provider: "codex/gpt-5.5" },
  cwd: "/Users/me/dev/storefront",
  prompt: "Review the current diff and name the riskiest change.",
});
```

`config.provider`은 항상 `provider/model`입니다. [공급자](/docs/sdk/providers)에는 데몬이 사용할 수 있는 항목과 런타임 시 이를 검색하는 방법이 나열되어 있습니다.

`cwd`은 에이전트가 작업하는 디렉터리입니다. Paseo는 그 뒤에 작업 공간을 만듭니다. [Workspaces](/docs/sdk/workspaces)에서는 대신 작업 공간을 재사용하는 방법을 다룹니다.

`create()`은 세션이 존재하는 즉시 확인됩니다. 프롬프트가 계속 실행 중입니다.

## 답변을 기다려주세요

```ts
const result = await agent.waitForFinish();

if (result.status === "idle") {
  console.log(result.lastMessage);
}
```

`waitForFinish()`은 기본적으로 최대 10분 동안 대기합니다. 변경하려면 밀리초를 전달하세요. 다음 네 가지 상태 중 하나를 반환합니다.

| 상태 | 의미 |
| ------------ | ----------------------------------------------------------------- |
| `idle` | 차례가 완료되고 에이전트는 또 다른 프롬프트를 받을 수 있습니다.          |
| `permission` | 에이전트는 Paseo에서 권한 요청에 응답할 사람이 필요합니다. |
| `error` | 제공자가 오류로 인해 턴을 종료했습니다.                        |
| `timeout` | 마감일이 지났습니다. 에이전트가 아직 실행 중입니다.                 |

## 연결 끊기

```ts
await client.close();
```

에이전트는 데몬에서 계속 실행되고 Paseo에 계속 표시됩니다. 이후 프로그램은 ID로 다시 도달합니다.

```ts
const agent = client.agents.ref("agent_01H8X...");
await agent.refresh();
await agent.run("Now write the fix.");
```

## 다음

- [에이전트](/docs/sdk/agents), 후속 프롬프트, 기존 에이전트 찾기, 보관.
- [공급자](/docs/sdk/providers), 데몬에서 모델 및 모드 검색.
- [공급자 옵션](/docs/sdk/provider-options), 샌드박싱 및 공급자 기본 설정.
- [작업공간](/docs/sdk/workspaces), 작업공간을 재사용하거나 작업 트리를 생성합니다.
- [이벤트](/docs/sdk/events), 기다리는 대신 업데이트를 스트리밍합니다.