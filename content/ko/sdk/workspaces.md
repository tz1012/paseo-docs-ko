---
title: Workspaces with the SDK
description: Open directories as Paseo workspaces, place agents in them, follow changes, and archive them.
nav: Workspaces
order: 53
category: TypeScript SDK
---

# SDK가 포함된 작업공간

통합을 위해 Paseo 앱에서 하나의 작업과 관련된 에이전트, 터미널, 브라우저 및 파일을 위한 지속적인 장소가 필요한 경우 작업 영역을 사용하세요.

## 디렉토리 열기

```ts
const workspace = await client.workspaces.open("/Users/me/dev/storefront");

console.log(workspace.id);
console.log(workspace.directory);
```

`open()`은 필요할 때 프로젝트를 생성하고 해당 디렉터리에 대한 활성 작업 공간을 재사용합니다. 디렉터리가 관심 있는 ID일 때 사용하세요.

## 새로운 작업 공간 만들기

`create()`은 다른 작업공간이 이미 해당 디렉토리를 사용하고 있는 경우에도 항상 새 작업공간을 생성합니다.

```ts
const workspace = await client.workspaces.create({
  source: {
    kind: "directory",
    path: "/Users/me/dev/storefront",
  },
  title: "Checkout issue 42",
});
```

동시 작업에 격리된 체크아웃이 필요한 경우 Paseo 소유 작업 트리를 만듭니다.

```ts
const workspace = await client.workspaces.create({
  source: {
    kind: "worktree",
    cwd: "/Users/me/dev/storefront",
    action: "branch-off",
    refName: "main",
    branchName: "fix/checkout-42",
  },
  title: "Checkout issue 42",
});
```

이미 소스가 있는 경우 두 소스 모두에서 `projectId`을 전달할 수 있습니다. 대부분의 통합에서는 이를 생략해야 합니다. 데몬은 디렉터리에서 프로젝트를 찾거나 생성합니다.

## 작업공간에서 에이전트 시작

작업공간 핸들을 통해 생성합니다.

```ts
const agent = await workspace.agents.create({
  config: {
    provider: "claude/claude-sonnet-5",
  },
  prompt: "Map the checkout flow before changing anything.",
});
```

핸들은 작업공간 ID와 실제 디렉토리를 모두 제공합니다. 이는 일치하지 않는 배치 인수를 방지합니다.

일회성 에이전트의 경우 작업공간 호출을 건너뛸 수 있습니다.

```ts
const agent = await client.agents.create({
  config: {
    provider: "claude/claude-sonnet-5",
  },
  cwd: "/Users/me/dev/storefront",
  prompt: "Map the checkout flow before changing anything.",
});
```

데몬은 여전히 프로젝트와 새로운 작업공간을 생성합니다. 생성된 워크스페이스 ID가 필요한 경우 `agent.workspaceId`을 읽어보세요.

## 작업공간 나열

```ts
let cursor: string | undefined;

do {
  const page = await client.workspaces.list({
    filter: { query: "storefront" },
    page: { limit: 50, cursor },
  });

  for (const workspace of page.entries) {
    console.log(workspace.id, workspace.name, workspace.status);
  }

  cursor = page.pageInfo.nextCursor ?? undefined;
} while (cursor);
```

## 핸들 새로 고침 및 보관

```ts
const workspace = client.workspaces.ref(savedWorkspaceId);
const snapshot = await workspace.refresh();

if (snapshot) {
  await workspace.archive();
}
```

작업공간 아카이브는 에이전트 아카이브와 별개입니다. 통합이 소유한 수명주기에 따라 각 리소스를 보관합니다.