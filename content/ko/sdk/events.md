---
title: SDK events
description: Subscribe to agent status, timeline, workspace, and provider updates without maintaining a second state model.
nav: Events
order: 56
category: TypeScript SDK
---

# SDK 이벤트

소유된 구독을 사용하여 스냅샷을 가져오고 변경 사항을 추적하세요. 기능을 지원하는 데몬에서는 연결, 일반 읽기, 로컬 디렉터리 리스너가 관찰을 시작하지 않습니다. 필터가 다른 관찰과 일치하더라도 각 관찰에는 서버가 발급한 새 ID가 부여됩니다.

## 한 에이전트의 상태를 추적합니다.

```ts
const directory = await client.agents.list({
  filter: { includeArchived: false },
  subscribe: {},
});

directory.subscription.subscribe({
  snapshot({ entries }) {
    const entry = entries.find(({ agent }) => agent.id === agentId);
    console.log(entry?.agent.status);
  },
  update(message) {
    if (message.type !== "agent_update") return;
    const update = message.payload;
    if (update.kind === "upsert" && update.agent.id === agentId) {
      console.log(update.agent.status);
    } else if (update.kind === "remove" && update.agentId === agentId) {
      console.log("Agent removed from this directory");
    }
  },
});

// When this view closes:
await directory.subscription.release();
```

`list({ subscribe: {} })`는 스냅샷, `subscriptionId`, `subscription`을 반환합니다. `subscribe`를 생략하면 스냅샷만 반환합니다. 구독 ID를 제공하지 마세요. 구독은 업데이트보다 먼저 스냅샷을 전달하며 재연결 후 새 ID와 스냅샷을 받습니다. 구독을 해제해도 다른 관찰과 기본 에이전트는 그대로 유지됩니다.

`client.agents.subscribe()`와 에이전트 핸들의 `subscribe()`는 해당 API 인스턴스가 소유한 관찰에 로컬 리스너를 추가합니다. 데이터를 요청하지는 않습니다. 필터링된 뷰 여러 개에 별도의 업데이트가 필요하면 반환된 구독의 콜백을 사용하세요.

## 타임라인 이벤트 팔로우

```ts
const unsubscribe = agent.timeline.subscribe((update) => {
  const { event } = update;
  if (event.type === "subscription_restored") {
    // Live delivery has resumed. Choose whether to fetch missed history.
    console.log("Reconnected; events may have been missed");
    return;
  }
  if (event.type === "error") {
    console.error("Timeline observation stopped:", event.error);
    return;
  }
  if (event.type === "replacement") {
    // Previously fetched history belongs to an old epoch. Fetch the page your UI needs.
    void agent.timeline.refetch().then((page) => console.log(page.entries));
    return;
  }
  if (event.type === "timeline" && event.item.type === "assistant_message") {
    process.stdout.write(event.item.text);
  }

  if (event.type === "turn_completed") {
    console.log("\nTurn completed");
  }
});
```

관찰해야 하는 이벤트를 생성하는 작업을 시작하기 전에 `unsubscribe.ready`를 기다리세요. 초기 라이브 구독(브로드캐스트 전용 호스트에서는 로컬 리스너 연결)을 기다리며 초기 기록은 별도의 [읽기](#fetch-timeline-history)입니다. 수요를 해제하려면 `unsubscribe()`를 호출하고, 정리가 끝날 때까지 기다리려면 `unsubscribe.release()`를 기다리세요.

재연결 후에는 같은 핸들이 이후 라이브 업데이트 전에 `{ agentId, subscriptionId, event: { type: "subscription_restored" } }`를 받습니다. 이는 멤버십 확인(브로드캐스트 전용 호스트에서는 로컬 연결) 뒤의 로컬 SDK 알림입니다. 구독에는 새 ID가 부여됩니다. 기록을 자동으로 가져오지 않으며 놓친 이벤트도 재생하지 않습니다.

소비자에 맞는 복구 방법을 선택하세요. 라이브 상태를 계속 사용하거나 최근 페이지를 요청하거나 저장된 위치로 `timeline.refetch({ direction: "after", cursor: { epoch, seq } })`를 호출할 수 있습니다. 읽기가 진행 중이어도 라이브 전달은 계속됩니다. 해당 이벤트를 버퍼링하거나 반환된 페이지와 epoch 및 sequence 기준으로 조정하세요. 더 많은 페이지가 필요하면 `hasNewer`와 `endCursor`를 따르세요. 라이브 `replacement`는 이전 epoch를 무효화합니다. 명시적인 기록 읽기가 실패하면 해당 읽기만 거부되고 라이브 구독은 활성 상태로 유지됩니다.

구독 설정 실패는 `{ agentId, event: { type: "error", error } }`를 전달하고 관찰을 해제합니다. 다시 시도할 준비가 되면 새 구독을 설정하세요. 구독을 해제하면 콜백이 중지되고 재연결 후 복원되지 않습니다.

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
  console.log(entry.seqStart, entry.seqEnd, entry.item.type);
}
```

오프셋을 생성하지 않고 결과에서 `startCursor`, `endCursor`, `hasOlder` 및 `hasNewer`을 사용하여 페이지로 이동합니다.

## 작업공간 업데이트 따르기

```ts
const directory = await client.workspaces.list({ subscribe: {} });
directory.subscription.subscribe({
  snapshot({ entries }) {
    console.log(entries);
  },
  update(message) {
    if (message.type === "workspace_update") console.log(message.payload);
  },
});

// When this view closes:
await directory.subscription.release();
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
console.log(await client.providers.snapshot());

// When this view closes:
unsubscribe();
```

공급자와 프로젝트의 `subscribe()` 호출은 자체 업데이트를 요청하며 구독을 취소하면 해당 수요가 해제됩니다. 초기 프로젝트 캐시를 만들려면 `client.projects.list()`를 기다리는 동안 업데이트를 버퍼링한 다음 스냅샷 뒤에 적용하세요.

애플리케이션에 더 이상 연결이 필요하지 않으면 `client.close()`를 호출하세요.

## 이전 데몬

같은 메서드는 기존 연결과 레거시 전달 동작을 사용합니다. 이전 디렉터리 구독은 서버 슬롯을 공유합니다. 나중에 생성된 필터링 관찰이 해당 슬롯의 필터를 교체합니다. 핸들에는 로컬 ID와 별도의 콜백이 있지만 독립적인 서버 필터에는 업데이트된 데몬이 필요합니다. 핸들을 해제하면 해당 콜백이 분리되며 이전 데몬은 브로드캐스트를 계속 보낼 수 있습니다.
