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

작업공간과 첫 번째 에이전트를 한 번의 호출로 만들려면 `agent`를 전달하세요. [결합된 백그라운드 작업공간 예제](./agents.md#run-work-in-a-background-workspace)를 참조하세요. 표시 여부는 작업공간 옵션에 설정하며 `agent.background`는 거부됩니다.

이미 소스가 있는 경우 두 소스 모두에서 `projectId`을 전달할 수 있습니다. 대부분의 통합에서는 이를 생략해야 합니다. 데몬은 디렉터리에서 프로젝트를 찾거나 생성합니다.

기본 검색에서 작업공간을 숨기려면 `background: true`를 전달하세요. 해당 에이전트와 터미널은 일반적인 기록, 수명 주기 훅, 보관, 정확한 ID 접근과 함께 계속 유지됩니다. 앱 사이드바의 **백그라운드 표시**는 복제된 상태를 버리지 않고 이를 표시합니다.

`background`는 생성할 때만 정할 수 있습니다. 생략하면 기본값은 false입니다. `callerAgentId`가 새 작업공간을 만드는 에이전트를 식별하면 생략 시 해당 에이전트 작업공간의 값을 상속합니다. false 또는 true를 명시하면 상속을 재정의합니다. `workspaceId`를 사용하는 에이전트 생성에서는 명시적인 백그라운드 생성 의도를 거부합니다. 작업공간을 만들 때 표시 여부를 구성하세요. SDK/RPC 암시적 에이전트 생성에서도 `background`는 에이전트 속성이 아니라 작업공간 생성 의도입니다.

생성 및 포함 검색에는 `features.backgroundWorkspaces`가 필요합니다. 지원하지 않는 호스트에서는 클라이언트가 호스트 업데이트 안내와 함께 요청을 거부합니다.

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

## 작업공간에서 터미널 시작하기

```ts
const terminal = await workspace.terminals.create({ name: "Development" });
terminal.write("echo ready");
terminal.sendKeys(["Enter"]);

const { lines } = await terminal.capture();
const { entries } = await workspace.terminals.list();
await terminal.kill();
```

두 작업공간이 하나의 디렉터리를 공유할 수 있습니다. 작업공간 핸들이 ID를 제공하므로 각 작업공간의 터미널을 구분할 수 있습니다. 이미 가진 ID를 사용하려면 `client.workspaces.ref(workspaceId).terminals.create()`를 호출하세요.

명령 인수, 작업 디렉터리 재정의, 입력 및 캡처 옵션은 [터미널 API 참조](/docs/sdk/reference#clientterminals)를 확인하세요.

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

`filter.includeBackground`가 true가 아니면 백그라운드 작업공간은 제외됩니다. `client.workspaces.list({ filter: { includeBackground: true } })` 또는 `client.agents.list({ filter: { includeBackground: true } })`를 사용하세요. 작업공간 설명자에는 `background`가 포함됩니다. 에이전트는 작업공간에서 표시 여부를 파생하며 별도의 설정이 없습니다.

## 핸들 새로 고침 및 보관

```ts
const workspace = client.workspaces.ref(savedWorkspaceId);
const snapshot = await workspace.refresh();

if (snapshot) {
  await workspace.archive();
}
```

작업공간 아카이브는 에이전트 아카이브와 별개입니다. 통합이 소유한 수명주기에 따라 각 리소스를 보관합니다.
