---
title: Migrate a plugin to runtime entries
description: Mechanical migration from a mixed plugin entry to explicit client and server entries.
nav: Migration
order: 48
category: Plugins
---

# 플러그인을 런타임 진입점으로 마이그레이션하기

> **출시 예정인 Paseo v0.8용 문서입니다.** Paseo v0.7에서는 이 마이그레이션이 필요하지 않습니다.

플러그인 디렉터리를 작업 디렉터리로 사용하는 코딩 에이전트에게 이 페이지를 전달하세요. 단계를
순서대로 실행하세요. 호환성 진입점은 남겨 두지 마세요.

## 1. 기존 코드 분류하기

기존 구조에서 시작합니다.

```text
my-plugin/
  paseo-plugin.json
  package.json
  tsconfig.json
  index.ts
  greeting.client.tsx
  greeting.server.ts
  greeting.shared.ts
```

완성된 구조는 다음과 같습니다.

```text
my-plugin/
  paseo-plugin.json
  package.json
  tsconfig.json
  index.client.tsx
  index.server.ts
  client/greeting.tsx
  server/greeting.ts
  shared/greeting.ts
```

플러그인에 필요한 진입점만 만드세요. 적어도 하나는 필요합니다. 구성 요소와 클라이언트 콜백에는
클라이언트 진입점이 필요합니다. RPC 핸들러와 Node API에는 서버 진입점이 필요합니다.

## 2. 파일과 디렉터리 이름 바꾸기

다음 규칙을 정확히 적용하세요.

1. 혼합된 루트 진입점을 `index.client.tsx`, `index.server.ts` 또는 둘 다로 교체하세요.
2. 모든 `name.client.ts` 또는 `name.client.tsx`를 `client/name.ts` 또는 `client/name.tsx`로 옮기세요.
3. 모든 `name.server.ts` 또는 `name.server.tsx`를 `server/name.ts` 또는 `server/name.tsx`로 옮기세요.
4. 모든 `name.shared.ts` 또는 `name.shared.tsx`를 `shared/name.ts` 또는 `shared/name.tsx`로 옮기세요.
5. 중첩된 기능 디렉터리는 해당 런타임 디렉터리 아래에 유지하세요.
6. 파일을 옮길 때마다 상대 가져오기 경로를 갱신하세요.
7. `paseo-plugin.json`, `package.json`, `tsconfig.json`은 루트에 유지하세요.
8. 기존 루트 진입점을 삭제하세요. Paseo는 이를 로드하지 않습니다.

디렉터리가 컴파일러 경계를 결정합니다. `client/` 아래 파일은 앱 번들에만, `server/` 아래 파일은
데몬 번들에만, `shared/` 아래 파일은 양쪽 모두에 컴파일됩니다. `*.client.tsx` 같은 파일 이름
접미사는 더 이상 의미가 없으며, 플러그인 루트에 코드 모듈이 남아 있으면
컴파일 오류가 발생합니다.

## 3. 모든 등록 옮기기

이 표를 전체 등록 체크리스트로 사용하세요.

| 기존 등록 및 위치                                                                 | 새 등록 및 위치                                                              |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 기존 루트 진입점의 `plugin.handle(contract, handler)`                                      | `index.server.ts`의 `server.handle(contract, handler)`                                    |
| 기존 루트 진입점의 `plugin.addSurface(id, Component)`                                      | `index.client.tsx`의 `client.addSurface(id, Component)`                                   |
| 기존 루트 진입점의 `plugin.addSidebarItem(item)`                                           | `index.client.tsx`의 `client.addSidebarItem(item)`                                        |
| 기존 루트 진입점의 `plugin.addWorkspacePanel(panel)`                                       | `index.client.tsx`의 `client.addWorkspacePanel(panel)`                                    |
| 기존 루트 진입점의 `plugin.addCommandCenterItem(item)`                                     | `index.client.tsx`의 `client.addCommandCenterItem(item)`                                  |
| 기존 루트 진입점의 `plugin.addClientSlashCommand(command)`                                 | `index.client.tsx`의 `client.addSlashCommand(command)`                                    |
| 기존 루트 진입점의 `plugin.addClientSide(fn)`                                              | 래퍼를 삭제하고 `fn`의 본문을 기본 클라이언트 진입점 함수로 옮기세요        |
| 기존 클라이언트 콜백 안의 `client.addComposerPill(pill)`                                 | `index.client.tsx` 또는 가져온 `client/` 함수 안의 `client.addComposerPill(pill)` |
| 기존 루트 진입점의 `plugin.addAttachmentSource(source)`                                    | `index.client.tsx`의 `client.addAttachmentSource(source)`                                 |
| 기존 루트 진입점의 `plugin.addTheme(theme)`                                                | `index.client.tsx`의 `client.addTheme(theme)`                                             |
| 기존 루트 진입점의 `plugin.addTimelineTransformer(transformer)`                            | `index.client.tsx`의 `client.addTimelineTransformer(transformer)`                         |
| 기존 루트 진입점의 `plugin.addTimelineRenderer(renderer)`                                  | `index.client.tsx`의 `client.addTimelineRenderer(renderer)`                               |
| 공유 파일의 `import { defineRpc, defineAttachmentSource } from "@getpaseo/plugin/server"` | `import { defineRpc, defineAttachmentSource } from "@getpaseo/plugin"`                     |
| `ZodOutput<typeof contract.input>` 핸들러 매개변수 유형                                    | `@getpaseo/plugin`의 `RpcInput<typeof contract>`, 반환 유형에는 `RpcOutput` 사용          |

클라이언트 진입점에서는 `PluginClientContext`를, 서버 진입점에서는 `PluginServerContext`를 가져오세요.
기존 컨텍스트 유형의 가져오기는 제거하세요. 이제 `@getpaseo/plugin/server`는 `PluginHandlerContext`와 같은
핸들러 측 유형만 내보냅니다. 이제 클라이언트의 모든 `add*`는 멱등성을 갖는 제거 함수를
반환합니다. 플러그인이 종료 정리 전에 호출하는 제거 함수는 유지하세요. Paseo는 진입점의 정리 함수가
실행된 후 남아 있는 등록을 제거합니다.

## 4. 가져오기 분리하기

클라이언트 진입점은 `client/`, `shared/` 및 클라이언트에서 안전하게 사용할 수 있는 패키지만 가져옵니다. 서버 진입점은
`server/`, `shared/` 및 서버에서 안전하게 사용할 수 있는 패키지만 가져옵니다. 클라이언트 진입점이나 그 진입점에서
도달할 수 있는 코드에 `node:` 가져오기가 있으면 컴파일 오류가 발생합니다. 등록을 연결하려는 목적으로만 구성 요소를
서버 진입점에 가져오지 마세요. 해당 등록은 클라이언트 진입점에 있어야 합니다.

## 5. 불완전한 마이그레이션 오류 알아보기

| 컴파일 또는 로드 오류                                                                                                     | 의미와 해결 방법                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Plugin entry split is required`                                                                                           | 디렉터리에 여전히 기존 루트 진입점만 있습니다. 런타임 진입점을 만들고 등록을 옮긴 다음 기존 파일을 삭제하세요.    |
| `Plugin entry points are missing: expected index.client.ts or index.client.tsx and/or index.server.ts or index.server.tsx` | 지원되는 진입점이 없습니다. 정확한 파일 이름으로 적어도 하나를 추가하세요.                                                               |
| `server-only module cannot be imported into the plugin client bundle: <file>`                                              | 클라이언트 가져오기가 `server/`에 도달합니다. 호출을 RPC 뒤로 옮기고 해당 계약을 `shared/`에서 가져오세요.                    |
| `client-only module cannot be imported into the plugin server bundle: <file>`                                              | 서버 가져오기가 `client/`에 도달합니다. 해당 등록과 가져오기를 클라이언트 진입점으로 옮기세요.                                 |
| `Plugin modules belong in client/, server/, or shared/: <file>`                                                            | 코드 모듈이 여전히 플러그인 루트에 있습니다. 해당 디렉터리로 옮기고 가져오기 경로를 수정하세요.                       |
| `Node module cannot be imported into the plugin client bundle: node:<name> imported by <file>`                             | 클라이언트 코드가 Node API를 가져옵니다. 작업을 `server/`로 옮기고 `shared/`에서 RPC를 노출한 다음 클라이언트에서 호출하세요. |
| TypeScript에서 `PluginContext`, `addClientSide` 또는 `addClientSlashCommand`가 없다고 보고함                        | 위 표에 따라 기존 컨텍스트 유형과 등록을 교체하세요.                                                    |

## 6. 실제 예제: `plugin-examples/local-plugin`

진입점 파일과 가져오기 경로만 변경합니다. 구성 요소와 핸들러 본문은 수정 없이 옮깁니다.

변경 전:

```text
local-plugin/
  index.ts
  main.client.tsx
  increment.server.ts
  increment.shared.ts
```

```ts
// index.ts
import type { PluginContext } from "@getpaseo/plugin";
import { contributeClient, ExamplePanel } from "./main.client";
import { increment } from "./increment.server";
import { incrementRpc } from "./increment.shared";

export default function contribute(plugin: PluginContext) {
  plugin.handle(incrementRpc, increment);
  plugin.addWorkspacePanel({
    id: "counter",
    title: "Plugin counter",
    icon: "Blocks",
    context: "workspace",
    locations: ["workspace", "explorer"],
    Component: ExamplePanel,
  });
  plugin.addCommandCenterItem({
    id: "open-counter",
    title: "Open plugin counter",
    icon: "Blocks",
    context: "workspace",
    onSelect({ openPanel }) {
      openPanel("counter");
    },
  });
  plugin.addClientSide(contributeClient);
  return () => {};
}
```

변경 후:

```text
local-plugin/
  index.client.tsx
  index.server.ts
  client/main.tsx        # was main.client.tsx
  server/increment.ts    # was increment.server.ts
  shared/increment.ts    # was increment.shared.ts
```

```tsx
// index.client.tsx
import type { PluginClientContext } from "@getpaseo/plugin";
import { contributeClient, ExamplePanel } from "./client/main";

export default function contribute(client: PluginClientContext) {
  client.addWorkspacePanel({
    id: "counter",
    title: "Plugin counter",
    icon: "Blocks",
    context: "workspace",
    locations: ["workspace", "explorer"],
    Component: ExamplePanel,
  });
  client.addCommandCenterItem({
    id: "open-counter",
    title: "Open plugin counter",
    icon: "Blocks",
    context: "workspace",
    onSelect({ openPanel }) {
      openPanel("counter");
    },
  });
  return contributeClient(client);
}
```

```ts
// index.server.ts
import type { PluginServerContext } from "@getpaseo/plugin";
import { increment } from "./server/increment";
import { incrementRpc } from "./shared/increment";

export default function contribute(server: PluginServerContext) {
  server.handle(incrementRpc, increment);
  return () => {};
}
```

옮긴 파일 내부의 가져오기 경로 변경:

```diff
 // client/main.tsx
-import { incrementRpc } from "./increment.shared";
+import { incrementRpc } from "../shared/increment";

 // server/increment.ts
-import { incrementRpc } from "./increment.shared";
+import { incrementRpc } from "../shared/increment";
```

`contributeClient`는 이미 `PluginClientContext`를 받아 정리 함수를 반환했으므로, 클라이언트 진입점은
이를 직접 호출하고 그 정리 함수를 반환합니다. `addClientSide` 콜백에서 필이나 구독도 등록했던
플러그인은 해당 코드를 유지합니다. 래퍼만 제거됩니다.

## 7. 마이그레이션 검증하기

다음을 실행하세요.

```bash
npm run typecheck
paseo plugin reload <plugin-id>
paseo plugin ls
```

오류 없이 `running` 상태여야 합니다. 모든 기여를 실행해 보세요. RPC가 있는 플러그인은 클라이언트
동작을 호출하고 서버 결과를 확인하세요. 클라이언트 전용 플러그인은 서버 프로세스 없이 기여가
로드되는지 확인하세요. 저장해 둔 등록 제거 함수를 두 번 호출하고 두 번째 호출은 아무 작업도 하지 않는지 확인하세요.
