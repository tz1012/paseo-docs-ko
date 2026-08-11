---
title: SDK events
description: Subscribe to agent status, timeline, workspace, and provider updates without maintaining a second state model.
nav: Events
order: 56
category: TypeScript SDK
---

# SDK 이벤트

구독은 변경사항이 발생한 후 보고합니다. 먼저 초기 스냅샷을 가져온 다음 업데이트를 적용하세요.

모든 `subscribe()` 메소드는 로컬 구독 취소 기능을 반환합니다. 콜백을 제거합니다. 기본 리소스를 중지하거나 보관하지 않습니다.

## 한 에이전트의 상태를 추적합니다.

데몬은 연결이 에이전트 목록 구독을 연 후에만 에이전트 디렉터리 업데이트를 보냅니다.

```ts
await client.agents.list({
  filter: { includeArchived: false },
  subscribe: { subscriptionId: "issue-board-agents" },
});

const agent = client.agents.ref(agentId);
await agent.refresh();

const unsubscribe = agent.subscribe((update) => {
  if (update.kind === "upsert") {
    console.log(update.agent.status);
  } else {
    console.log("Agent removed from the active directory");
  }
});
```

핸들은 핸들러를 호출하기 전에 해당 속성과 `current()` 값을 업데이트합니다.

## 타임라인 이벤트 팔로우

```ts
const unsubscribe = agent.timeline.subscribe(({ event, timestamp }) => {
  if (event.type === "timeline" && event.item.type === "assistant_message") {
    process.stdout.write(event.item.text);
  }

  if (event.type === "turn_completed") {
    console.log(`\nCompleted at ${timestamp}`);
  }
});
```

어시스턴트 메시지는 여러 개로 나누어 도착할 수 있습니다. 완전한 메시지가 필요한 경우 텍스트를 연결하거나, 최종 응답만 필요한 경우 `run()`을 사용하고 `lastMessage`을 읽으세요.

턴 완료는 `turn_completed`, `turn_failed` 또는 `turn_canceled`에서 이루어집니다. `agent_update` 전환에서 `idle`으로의 차례 완료를 추론하지 마세요.

## 타임라인 기록 가져오기

```ts
const page = await agent.timeline.refetch({
  direction: "before",
  limit: 100,
  projection: "projected",
});

for (const entry of page.entries) {
  console.log(entry.seq, entry.event.type);
}
```

오프셋을 생성하지 않고 결과에서 `startCursor`, `endCursor`, `hasOlder` 및 `hasNewer`을 사용하여 페이지로 이동합니다.

## 작업공간 업데이트 따르기

Workspace 업데이트에는 디렉터리 구독도 필요합니다.

```ts
await client.workspaces.list({
  subscribe: { subscriptionId: "issue-board-workspaces" },
});

const workspace = client.workspaces.ref(workspaceId);
const unsubscribe = workspace.subscribe((update) => {
  if (update.kind === "upsert") {
    console.log(update.workspace.status);
  }
});
```

## 공급자 카탈로그 변경 사항 따르기

```ts
const unsubscribe = client.providers.subscribe((update) => {
  const ready = update.entries.filter((entry) => entry.status === "ready");
  console.log(
    "Ready providers:",
    ready.map((entry) => entry.provider),
  );
});
```

소유 객체를 삭제하기 전에 항상 반환된 구독 취소 함수를 호출하세요. 애플리케이션에 더 이상 데몬 연결이 필요하지 않으면 `client.close()`을 호출하세요.