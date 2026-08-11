---
title: Agents with the SDK
description: Create, run, find, reuse, parent, and archive coding agents from TypeScript.
nav: Agents
order: 52
category: TypeScript SDK
---

# SDK를 사용하는 에이전트

에이전트 핸들은 안정적인 에이전트 ID를 유지하고 데몬 RPC를 노출하지 않고 턴 수명 주기를 노출합니다.

## 초기 프롬프트 실행

```ts
const agent = await client.agents.create({
  config: {
    provider: "claude/claude-sonnet-5",
  },
  cwd: "/Users/me/dev/storefront",
  prompt: "Review the checkout flow and propose one focused fix.",
  labels: { source: "checkout-review" },
});

const result = await agent.waitForFinish();
console.log(result.status, result.lastMessage);
```

`waitForFinish()`은 다음 네 가지 상태 중 하나를 반환합니다.

| 상태 | 의미 |
| ------------ | ----------------------------------------------------------------- |
| `idle` | 차례가 완료되고 에이전트는 또 다른 프롬프트를 수락할 수 있습니다.       |
| `permission` | 에이전트는 Paseo에서 권한 요청에 응답할 사람이 필요합니다. |
| `error` | 제공자가 오류로 인해 턴을 종료했습니다.                        |
| `timeout` | 대기 기한이 지났습니다. 에이전트가 아직 실행 중일 수 있습니다.        |

시간 초과는 에이전트를 취소하지 않습니다.

## 후속 작업을 위해 세션을 활성 상태로 유지

나중에 메시지가 도착하면 유휴 세션을 만듭니다.

```ts
const reviewer = await client.agents.create({
  config: {
    provider: "codex/gpt-5.5",
  },
  cwd: "/Users/me/dev/storefront",
  title: "Checkout reviewer",
});

const first = await reviewer.run("Review the current diff.");

if (first.status === "idle") {
  const second = await reviewer.run("Now focus on failure recovery.");
  console.log(second.lastMessage);
}
```

실행 후 잊어버리는 전달에는 `send()`을 사용하세요. 호출자가 해당 턴의 결과를 필요로 할 때 `run()`을 사용하세요.

## 라벨로 상담원 찾기

생성 시 `labels`을 설정한 후 필터링하세요. 데몬은 일치를 수행합니다.

```ts
const page = await client.agents.list({
  filter: { labels: { "issue-provider": "my-tracker" } },
});

for (const { agent } of page.entries) {
  console.log(agent.id, agent.title, agent.status);
}
```

## ID로 에이전트 계속하기

```ts
const agent = client.agents.ref("agent_01H8X...");

const result = await agent.run("Now write the fix.");
console.log(result.lastMessage);
```

`ref()`은 데몬에 접속하지 않습니다. 에이전트가 아직 존재하는지 확인하려면 먼저 `refresh()`에 전화하세요. 그렇지 않은 경우 `null`을 반환합니다.

## 하위 에이전트 만들기

작업 공간을 통해 자식을 만듭니다. 핸들은 배치를 소유하므로 호출자는 해당 디렉터리를 반복하지 않습니다.

```ts
if (!parent.workspaceId) throw new Error("Parent has no workspace");

const workspace = client.workspaces.ref(parent.workspaceId);
const child = await workspace.agents.create({
  config: {
    provider: "codex/gpt-5.5",
  },
  parent,
  title: "Implement checkout fix",
  prompt: "Implement the accepted checkout plan and run focused tests.",
});
```

`parent`은 친자 관계를 설정합니다. 상위 항목을 보관하면 해당 하위 항목도 계단식으로 보관됩니다. 자녀가 독립적으로 계속해야 할 경우 먼저 `detach()`에 전화하세요.

## 구조화된 출력 요청

```ts
const schema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    risk: { type: "string", enum: ["low", "medium", "high"] },
  },
  required: ["summary", "risk"],
  additionalProperties: false,
};

const agent = await client.agents.create({
  config: {
    provider: "codex/gpt-5.5",
  },
  cwd: "/Users/me/dev/storefront",
  outputSchema: schema,
  prompt: "Assess the release risk of the current diff.",
});

const result = await agent.waitForFinish();
if (result.status !== "idle" || !result.lastMessage) {
  throw new Error(result.error ?? "Agent returned no structured output");
}

const assessment = JSON.parse(result.lastMessage) as {
  summary: string;
  risk: "low" | "medium" | "high";
};
```

신뢰할 수 있는 입력으로 사용하기 전에 애플리케이션에서 구문 분석된 값을 검증하십시오.

## 보관 또는 분리

```ts
await agent.archive(); // Soft-deletes the agent and closes its runtime.
await child.detach(); // Keeps the child alive but removes its parent relationship.
```

SDK 연결을 닫아도 에이전트는 보관되지 않습니다. 임시 에이전트를 명시적으로 보관하십시오(`finally`에 보관하는 것이 좋습니다).