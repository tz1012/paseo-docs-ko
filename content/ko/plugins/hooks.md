---
title: Plugin hooks
description: Register hooks to change requests or observe agent and workspace operations.
nav: Hooks
order: 48
category: Plugins
---

# 플러그인 훅

`index.server.ts`에서 `server.addHook(name, handler)`를 사용합니다. 훅은 앱이 연결되어 있지 않아도 플러그인이 활성화된 동안 실행됩니다. `addHook`은 Paseo 0.14부터 사용할 수 있습니다. `requirements.paseo`를 빌드 대상으로 삼는 릴리스로 설정하세요.

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";

export default function contribute(server: PluginServerContext) {
  const remove = server.addHook("agent.open.before", async ({ request }) => ({
    ...request,
    env: { ...request.env, REGION: "eu" },
  }));
  return remove;
}
```

## 이름과 실행 시점

이름은 `subject.operation.position` 형식을 따릅니다. 주체, 작업, `before` 또는 `after`가 차례로 옵니다. 이름은 수명 주기의 위치를 식별합니다. Paseo가 기다리는지는 아래 표에 나온 훅별 속성입니다. `workspace`는 모든 작업공간을, `worktree`는 Git 작업 트리만 포함합니다.

- 대기 훅은 Paseo가 계속 진행하기 전에 끝납니다. 예외를 던지거나, 유효하지 않은 데이터를 반환하거나, 30초를 초과하면 작업이 `Plugin <id> <hook> failed: …` 오류로 실패합니다. 요청 변경 훅은 `{ request }`를 받고 완전한 대체 요청 또는 `undefined`를 반환할 수 있습니다.
- 알림은 이벤트 객체를 받고 `Promise<void>`를 반환합니다. Paseo는 기다리지 않습니다. 오류는 플러그인에 기록되고 작업은 계속됩니다. `agent.turn.before`와 `agent.permission.before`는 턴이 시작되거나 권한 요청이 대기 상태가 될 때 발생하는 알림입니다.

모든 핸들러는 비동기여야 합니다. 턴 완료에는 성공, 실패, 취소가 포함되므로 `outcome`을 확인하세요. 권한 완료에는 모든 해결 방식이 포함되므로 `resolution`을 확인하세요.

에이전트 생성은 한 번만 일어나며 `agent.create.before`는 저장되는 구성을 변경합니다. 열기는 공급자 프로세스를 시작합니다. 첫 실행, 데몬 재시작 후 재개, 기록 읽기, 외부 세션 가져오기 또는 다시 로드할 때 발생합니다. `agent.open.before`는 매번 실행 시에만 쓰이는 환경, 도구 및 MCP 서버를 제공합니다. 생성하면 에이전트가 열리지만, 기존 에이전트를 여는 것은 에이전트를 생성하지 않습니다. 닫기는 실행 중인 인스턴스를 종료합니다. 앱에서 탭을 여는 것은 별도의 작업입니다.

`worktree.create.after`는 작업공간이 등록되기 전에 실행됩니다. 이 훅은 `workspace.create.after`보다 먼저 실행되며, 둘 다 첫 에이전트의 `agent.create.before` / `agent.open.before`보다 먼저 실행됩니다.

### 대기 훅에서 일찍 반환하기

작업이 즉시 계속되어야 한다면 분리된 작업을 시작하고 반환하세요.

```ts
server.addHook("worktree.create.after", async ({ worktree }) => {
  void warmCaches(worktree.path);
});
```

Paseo에는 반환된 프로미스만 보이므로 분리된 작업에는 오류 보고도, 취소 `signal`도 없습니다.

## 훅

| 훅                        | 대기 | payload                                | 핸들러가 변경할 수 있는 항목                   |
| ------------------------- | ---- | -------------------------------------- | ---------------------------------------------- |
| `workspace.create.before` | 예   | `{ request }`                          | 전체 생성 요청                                 |
| `workspace.create.after`  | 아니요 | `{ workspace }`                      |                                                |
| `workspace.archive.after` | 아니요 | `{ workspace }`                      |                                                |
| `worktree.create.before`  | 예   | `{ request }`                          | 생성 옵션과 대상                               |
| `worktree.create.after`   | 예   | `{ worktree }`                         | 작업 트리의 파일. 생성 중단은 예외를 던짐      |
| `agent.create.before`     | 예   | `{ request: { config, env? } }`        | `cwd`를 제외한 저장 구성, `env`                |
| `agent.create.after`      | 아니요 | `{ agent }`                          |                                                |
| `agent.open.before`       | 예   | `{ request }`                          | 실행 시에만 쓰이는 `env`, `tools`, `mcpServers` |
| `agent.close.after`       | 아니요 | `{ agent }`                          |                                                |
| `agent.archive.after`     | 아니요 | `{ agent, archivedAt }`              |                                                |
| `agent.turn.before`       | 아니요 | `{ agent, turnId }`                  |                                                |
| `agent.turn.after`        | 아니요 | `{ agent, turnId, outcome, timeline }` |                                              |
| `agent.permission.before` | 아니요 | `{ agent, request }`                 |                                                |
| `agent.permission.after`  | 아니요 | `{ agent, requestId, resolution }`   |                                                |

## 공유 payload

```ts
interface PluginHookAgent {
  id: string;
  workspaceId: string | null;
  parentAgentId: string | null;
  provider: string;
  cwd: string;
  title: string | null;
}

interface PluginHookWorkspace {
  id: string;
  projectId: string;
  cwd: string;
  name: string | null;
  archivedAt: string | null;
}

type PluginTurnOutcome =
  | { kind: "completed" }
  | { kind: "failed"; error: { message: string; code?: string } }
  | { kind: "canceled"; reason: string };
```

| 필드         | 형태 / 의미                                                                             |
| ------------ | --------------------------------------------------------------------------------------- |
| `turnId`     | 공급자가 보고한 `string` 또는 `null`. 세션을 다시 연 뒤 반복될 수 있음                 |
| `timeline`   | 사용 중단됨. 항상 `[]`이며 기록은 SDK로 가져옴                                         |
| `request`    | SDK `AgentPermissionRequest`. `kind`는 `tool`, `plan`, `question`, `mode` 또는 `other` |
| `resolution` | SDK `AgentPermissionResponse`                                                           |
| `archivedAt` | 타임스탬프 문자열                                                                       |

## workspace.create.before

`source`, 선택적 `title`, `firstAgentContext`가 있는 `{ request }`를 받습니다. 명시적 생성 요청 전체를 대체할 수 있습니다. 예외, 유효하지 않은 결과 또는 시간 초과는 생성을 실패시킵니다. 기존 작업공간과 디렉터리 조회/가져오기는 영향을 받지 않습니다.

### 작업공간 격리 선택하기

```ts
server.addHook("workspace.create.before", async ({ request }) => {
  if (request.source.kind !== "directory") {
    return request;
  }

  return {
    ...request,
    source: {
      kind: "worktree",
      cwd: request.source.path,
      action: "branch-off",
    },
  };
});
```

**결과:** 명시적 디렉터리 생성 요청이 작업 트리 요청이 됩니다. 기존 작업공간과
디렉터리 조회/가져오기 작업은 영향을 받지 않습니다.

## workspace.create.after

작업공간 레코드가 생성되고 디렉터리를 사용할 수 있게 된 뒤 발생합니다. `{ workspace }`를 받습니다.

```ts
server.addHook("workspace.create.after", async ({ workspace }) => {
  console.log(workspace);
});
```

## workspace.archive.after

보관 상태가 저장된 뒤 발생합니다. `{ workspace }`를 받으며 작업 트리 정리는 아직 대기 중일 수 있습니다.

```ts
server.addHook("workspace.archive.after", async ({ workspace }) => {
  console.log(workspace);
});
```

## worktree.create.before {#worktreecreatebefore}

새 작업 트리의 위치와 생성 옵션을 선택합니다. 앱, CLI, MCP 및 에이전트 생성에서 작업 트리를 만들 때 Paseo는 `git worktree add` 전에 이 훅을 기다립니다. `{ request }`를 받습니다. 완전한 대체 요청을 반환하거나 그대로 유지하려면 `undefined`를 반환하세요. 예외, 유효하지 않은 반환 데이터 또는 30초 시간 초과는 오류에 플러그인과 훅 이름을 포함하여 생성을 중단합니다.

```ts
import { basename, dirname, join } from "node:path";

server.addHook("worktree.create.before", async ({ request }) => ({
  ...request,
  path: join(
    dirname(request.sourceCheckout),
    `${basename(request.sourceCheckout)}.${request.branch.replaceAll("/", "-")}`,
  ),
}));
```

소스가 `/home/me/src/paseo`이고 브랜치가 `feature/x`이면 `/home/me/src/paseo.feature-x`를 생성합니다. 전체 [worktree-placement 예제](https://github.com/getpaseo/paseo/tree/main/plugin-examples/worktree-placement)를 참고하세요.

| 요청 필드                                 | 의미                                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                                    | `branch-off`, `checkout-branch`, `checkout-change-request` 또는 `checkout-github-pr`                                                              |
| `branch`                                  | 요청한 로컬 브랜치 이름                                                                                                                           |
| `baseRef`                                 | branch-off의 시작 ref, 변경 요청의 비교 기준. `checkout-branch`에는 없음. ref에서 분기하려면 `kind: "branch-off"`를 반환                         |
| `slug`                                    | 정규화된 작업 트리 이름                                                                                                                           |
| `path`                                    | 절대 대상 경로. 처음에는 기존 경로의 접미사를 해결한 기본 위치                                                                                    |
| `repoRoot`                                | 읽기 전용 기본 저장소 루트                                                                                                                        |
| `sourceCheckout`                          | 다른 작업 트리에서 생성을 시작한 경우까지 포함하는 읽기 전용 소스 체크아웃 루트                                                                   |
| `forge`, `changeRequestNumber`, `headRef` | 변경 요청 체크아웃 식별 정보. GitHub 레거시 체크아웃은 `forge`와 `changeRequestNumber` 대신 `githubPrNumber`를 사용                                |
| `headRepositoryOwner`, `headRepository`   | 선택적 소스 저장소 정보. `headRepository`는 변경 요청 체크아웃에만 있음                                                                           |
| `checkoutRefs`                            | 선택적 fetch 소스: `{ remoteName?: string, remoteRef: string }[]`                                                                                 |
| `pushRemoteUrl`, `trackOriginHead`        | 선택적 push 대상과 추적 정책                                                                                                                      |

`path`가 반환되면 `slug`는 branch-off 이름 지정에만 사용됩니다. CLI는 경로의 basename으로 작업 트리를 찾습니다.

`repoRoot`와 `sourceCheckout`을 제외한 모든 필드를 변환할 수 있습니다. 선택한 `kind`에 필요한 모든 정보를 반환하세요. Paseo는 이 훅 뒤에 Git 소스 계획을 해석하므로 핸들러는 ref를 가져오기 전에 브랜치와 기준을 바꿀 수 있고, 이후에도 Git이 고유한 최종 브랜치 이름을 선택할 수 있습니다.

Paseo는 심볼릭 링크로 된 상위 경로를 해석하고 반환된 경로를 검증합니다. 경로는 절대 경로여야 하고 존재해서는 안 되며, 파일 시스템 루트, 홈 디렉터리, 저장소 루트, `.git` 디렉터리 내부 또는 저장소의 상위 디렉터리여서는 안 됩니다. 대상이 이미 존재하면 생성이 실패합니다. Paseo는 플러그인이 선택한 경로에 접미사를 추가하지 않습니다. 플러그인은 디렉터리 생성을 Paseo에 맡겨야 합니다.

순서는 `worktree.create.before` → `git worktree add` → `worktree.create.after` → 작업공간 등록입니다. 사라진 작업 트리를 복원할 때는 두 작업 트리 생성 훅을 실행하지 않고 기록된 경로에 다시 만듭니다.

## worktree.create.after

Paseo는 새 Git 작업 트리가 생긴 뒤 작업공간 등록, 설정, 터미널 또는 에이전트보다 먼저 이 훅을 기다립니다. 절대 작업 트리 경로, 브랜치 이름 및 소스 체크아웃 디렉터리인 `{ worktree: { path, branch, sourceCheckout } }`를 받습니다. 아직 작업공간 ID는 없습니다. 아무것도 반환하지 말고 작업 트리에 파일을 직접 쓰세요. 예외를 던지거나 30초를 초과하면 생성을 중단하고 새 작업 트리를 제거합니다.

branch-off, 브랜치 체크아웃 및 PR 체크아웃 생성에 적용됩니다. 사라진 보관 작업 트리를 복원할 때는 별도의 복구 경로를 사용하며 이 훅을 발생시키지 않습니다.

```ts
import { copyFile } from "node:fs/promises";

server.addHook("worktree.create.after", async ({ worktree }) => {
  await copyFile(`${worktree.sourceCheckout}/.env`, `${worktree.path}/.env`);
});
```

## agent.create.before

`{ request: { config, env? } }`를 받습니다. 구성 변경은 저장되어 플러그인이 비활성화되거나 제거된 뒤에도 남습니다. `env`는 첫 실행에 적용되며 저장되지 않습니다. `config.cwd`는 변경할 수 없습니다. 예외, 유효하지 않은 결과 또는 시간 초과는 생성을 실패시킵니다.

**`agent.create.before.config`**는 `AgentSessionConfig`를 사용합니다.

| 필드                                          | 제약 조건                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| `provider`, `model`                           | 별도 필드. 공급자 변경 시 모델/모드/옵션도 변경해야 할 수 있음             |
| `modeId`, `thinkingOptionId`, `featureValues` | 공급자별 선택 항목                                                         |
| `title`, `systemPrompt`                       | 에이전트 구성                                                              |
| `providerOptions`                             | 내부가 공개되지 않은 공급자별 옵션                                         |
| `mcpServers`, `toolPolicy`                    | MCP 구성과 정확한 도구 사전 승인                                           |
| `cwd`                                         | 변경할 수 없음                                                             |

### 저장된 구성 변경하기

새 Codex 에이전트에 저장할 옵션을 설정하려면 `contribute(server)` 안에 이 콜백을 추가하세요.

```ts
server.addHook("agent.create.before", async ({ request }) => {
  if (request.config.provider !== "codex") {
    return request;
  }

  return {
    ...request,
    config: {
      ...request.config,
      providerOptions: {
        ...request.config.providerOptions,
        sandbox_mode: "workspace-write",
        approval_policy: "on-request",
      },
    },
  };
});
```

| 입력                                        | 결과                    |
| ------------------------------------------- | ----------------------- |
| `providerOptions.sandbox_mode: "read-only"` | `"workspace-write"`     |
| `providerOptions.web_search: "disabled"`    | 스프레드로 보존됨        |

선택한 공급자가 `providerOptions`를 검증합니다. 명시적 Codex 샌드박스 및 승인 옵션은
모드 프리셋보다 우선합니다.

## agent.create.after

일반 생성이 끝나면 발생합니다. `{ agent }`를 받으며 가져오기와 재개는 이 훅을 발생시키지 않습니다.

```ts
server.addHook("agent.create.after", async ({ agent }) => {
  console.log(agent);
});
```

## agent.open.before

`{ request }`를 받습니다. 이번 실행에서는 `env`, `tools`, `mcpServers`만 변경할 수 있습니다. 다른 모든 필드는 읽기 전용입니다. 예외, 유효하지 않은 결과 또는 시간 초과는 열기를 실패시킵니다.

**`agent.open.before` 요청 예제:**

```json
{
  "agentId": "agent-123",
  "workspaceId": "workspace-456",
  "provider": "codex",
  "cwd": "/projects/shop",
  "title": "Workspace notes",
  "labels": { "notes/enabled": "true" },
  "tools": [],
  "mcpServers": {},
  "reason": "resume",
  "purpose": "interactive",
  "env": { "COMPANY_ENV": "development" }
}
```

| 필드          | 값                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `workspaceId` | 문자열 또는 `null`                                                                                                     |
| `title`       | 읽기 전용 문자열 또는 `null`. 생성 시에는 생성 제목, 재개 시에는 저장된 제목                                           |
| `labels`      | 읽기 전용 문자열 맵. 생성 시에는 생성 레이블, 재개 시에는 저장된 레이블                                                |
| `tools`       | 이 플러그인 로컬의 편집 가능한 `AgentToolDefinition[]`. [에이전트에 도구 연결하기](#attach-tools-to-agents) 참고       |
| `mcpServers`  | 이 플러그인 로컬의 편집 가능한 실행 전용 서버 맵. [MCP 서버 주입하기](#inject-mcp-servers) 참고                         |
| `reason`      | `create`, `resume`, `refresh`, `import`                                                                                 |
| `purpose`     | `interactive`, `history`                                                                                                |
| `env`         | 실행 재정의 맵. 데몬이 상속한 환경은 제외함. 재정의를 추가, 대체 또는 제거하려면 맵을 대체                              |

### 세션을 열 때마다 환경 변수 주입하기

```ts
server.addHook("agent.open.before", async ({ request }) => {
  return {
    ...request,
    env: {
      ...request.env,
      COMPANY_ENV: "development",
    },
  };
});
```

세션 열기 재정의는 열 때마다 다시 파생됩니다. `agent.create.before.env`는 첫 실행에만 적용되며
에이전트 구성에 저장되지 않습니다.

### MCP 서버 주입하기

서버가 에이전트의 저장된 구성에 포함되어야 한다면 `agent.create.before.config.mcpServers`를 사용하세요.
플러그인 소유 서버에는 이 콜백을 `contribute(server)` 안에 추가하고 자리표시자 URL을
MCP 엔드포인트로 바꾸세요.

```ts
server.addHook("agent.open.before", async ({ request }) => {
  if (request.provider !== "codex") return;

  return {
    ...request,
    mcpServers: {
      ...request.mcpServers,
      company: { type: "http", url: "https://tools.example.com/mcp" },
    },
  };
});
```

`request.mcpServers`는 `AgentSessionConfig.mcpServers`와 같은 서버 구성을 사용합니다.
맵은 각 플러그인에서 빈 상태로 시작하여 해당 플러그인 자체 콜백을 거치며 누적됩니다. 에이전트의
저장된 서버나 다른 플러그인의 서버는 절대 포함하지 않습니다. 이 플러그인의 항목을 추가, 대체 또는
제거하려면 맵을 대체하세요. `undefined`를 반환하면 그대로 유지됩니다. Paseo는 플러그인의 최종 맵을
플러그인 ID 순서로 병합합니다.

이름이 저장된 서버, Paseo의 내부 `paseo` 서버 또는 다른 플러그인의 서버와 충돌하면 세션 열기가
실패하며 서버와 두 소스의 이름이 표시됩니다. MCP를 지원하지 않는 공급자는 플러그인 이름과 함께
`does not support MCP servers` 오류로 실패합니다. `purpose: "history"`로 열 때는 이 서버들을
무시합니다. 설치, 비활성화 및 다시 로드 변경 사항은
[세션 다시 열기 동작](#attach-tools-to-agents)을 통해 기존 에이전트에 적용됩니다.

### 에이전트에 도구 연결하기

`index.server.ts`에서 도구를 정의하고 `server.addHook("agent.open.before", async handler)`에서 연결하세요.
이 예제는 `notes/enabled: "true"` 레이블이 있는 에이전트에만 `append_workspace_note`를 제공합니다.

```ts
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { defineAgentTool, type PluginServerContext } from "@getpaseo/plugin/server";

const appendWorkspaceNote = defineAgentTool({
  name: "append_workspace_note",
  description: "Append a note to AGENT_NOTES.md in this agent's working directory.",
  input: z.object({ note: z.string().min(1).describe("Note to append") }),
  async execute({ note }, { agent, signal }) {
    const notePath = path.join(agent.cwd, "AGENT_NOTES.md");
    await writeFile(notePath, `${note}\n`, { encoding: "utf8", flag: "a", signal });
    return {
      text: `Saved note to ${notePath}`,
      structuredContent: { path: notePath },
    };
  },
});

export default function contribute(server: PluginServerContext) {
  server.addHook("agent.open.before", async ({ request }) => {
    if (request.labels["notes/enabled"] !== "true") return;
    return { ...request, tools: [...request.tools, appendWorkspaceNote] };
  });
  return () => {};
}
```

SDK로 에이전트를 생성할 때 레이블을 설정하세요.

```ts
const agent = await paseo.agents.create({
  config: { provider: "codex/gpt-5.4" },
  cwd: "/projects/shop",
  labels: { "notes/enabled": "true" },
});
```

세션 열기 요청 필드 중 하나를 사용해 에이전트를 선택하세요.

| 선택 기준        | 콜백의 조건                                  |
| ---------------- | -------------------------------------------- |
| 레이블           | `request.labels["notes/enabled"] === "true"` |
| 공급자           | `request.provider === "codex"`               |
| 작업공간         | `request.workspaceId === "workspace-456"`    |
| 개별 에이전트    | `request.agentId === chosenAgentId`          |

`request.tools`는 각 플러그인에서 빈 상태로 시작합니다. 각 콜백에는 해당 플러그인의 이전 콜백이
반환한 도구가 보입니다. 도구를 추가하거나 제거하려면 배열을 대체하세요. `undefined`를 반환하면
요청이 그대로 유지됩니다. `purpose: "history"`일 때는 도구를 무시합니다.

`defineAgentTool`, `AgentToolDefinition`, `AgentToolContext`, `AgentToolResult`를
`@getpaseo/plugin/server`에서 가져오세요. 도우미는 Zod 스키마에서 검증된 입력을 추론합니다.

```ts
declare function defineAgentTool<Input extends z.ZodType>(tool: {
  name: string;
  title?: string;
  description: string;
  input: Input;
  execute(
    input: z.output<Input>,
    context: AgentToolContext,
  ): AgentToolResult | Promise<AgentToolResult>;
}): AgentToolDefinition;

interface AgentToolResult {
  text?: string;
  structuredContent?: unknown;
  isError?: boolean;
}
```

| 실행 컨텍스트     | 값                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `agent`           | `id`, `workspaceId`, `provider`, `cwd`, `title`을 포함한 `PluginHookAgent` 형태의 호출 에이전트       |
| `paseo`           | 이 데몬에 연결된 SDK                                                                                |
| `signal`          | 이 도구 호출의 중단 신호. 파일 작업이나 외부 요청에 전달                                            |

`execute`는 플러그인 프로세스에서 실행됩니다. 클로저와 원본 Zod 스키마는 그곳에 남고 도구
메타데이터와 호출 입력/결과만 프로세스 경계를 넘습니다. Paseo는 `execute`를 호출하기 전에 입력을
검증합니다. 유효하지 않은 입력은 스키마 문제를 에이전트에 반환합니다. 던져진 오류는
`{ isError: true, text: message }`가 되고 플러그인은 계속 실행됩니다. 호출을 취소하거나 전송을 닫으면
`signal`을 중단하고 결과를 폐기합니다. 도구 호출의 상한은 훅의 30초 시간 초과와 별개인 10분입니다.
에이전트 세션을 닫거나 다시 열면 이전 정의를 버립니다.

모델에 보일 텍스트는 `text`로 반환하세요. `structuredContent`는 JSON으로 직렬화할 수 있어야 합니다.
`text`를 생략하면 Paseo가 해당 값을 모델용 텍스트로 서식 지정합니다. 도구 오류를 보고하려면 `isError: true`를 설정하세요.

Paseo는 공급자가 지원하는 MCP 또는 네이티브 등록을 사용해 에이전트 도구 전송 경로로 연결된 도구를
전달합니다. 같은 정의와 콜백이 어느 방식에서든 작동합니다. 연결된 도구는
[Paseo 도구와 같은 게이트](/docs/mcp#limit-paseo-tools-by-provider)를 따릅니다. 해당 에이전트에만 보입니다.

이름은 `/^[a-z][a-z0-9_]*$/`와 일치하고 64자 이하여야 합니다. 같은 에이전트의 Paseo 도구 또는
다른 플러그인 도구와 이름이 충돌하면 세션 열기가 실패하고 두 소유자 이름이 표시됩니다.
플러그인 하나 안에서 이름이 중복되어도 세션 열기가 실패합니다. 콜백의 대상이 아닌 에이전트는
영향을 받지 않습니다.

| 변경 사항                                                     | 에이전트가 변경을 받는 시점                                                                                                                                                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent.open.before`를 선언한 플러그인 시작, 중지 또는 다시 로드 | 열린 세션이 오래된 상태가 됨. 다음 유휴 프롬프트 전에 각 세션을 다시 열며, 실행 중인 턴은 중단 없이 계속됨. 다시 연 뒤의 다음 프롬프트는 세션을 재사용 |
| 콜백 대상 에이전트 변경                                      | 이 예제를 편집한 뒤 `paseo plugin reload agent-tools`를 실행하고, 에이전트가 유휴 상태일 때 프롬프트를 보냄                                                                                                |
| 즉시 적용                                                     | `await paseo.agents.ref(id).reload({ requestId: "reload-notes" })`를 호출. `requestId`는 선택 사항. 공급자 세션을 다시 열고 `reason: "refresh"`로 훅을 다시 실행하며 실행 중인 턴을 중단                   |
| 현재 스냅숏 읽기                                              | `await paseo.agents.ref(id).refresh()`를 호출. 세션을 다시 열지 않고 상태를 읽음                                                                                                                           |

자동 다시 열기가 실패하면 이를 유발한 프롬프트가 해당 오류로 실패합니다.
[전체 agent-tools 예제](https://github.com/getpaseo/paseo/tree/main/plugin-examples/agent-tools)를 참고하세요.

## agent.close.after

실행 중인 에이전트 런타임이 닫히면 발생합니다. `{ agent }`를 받습니다.

```ts
server.addHook("agent.close.after", async ({ agent }) => {
  console.log(agent);
});
```

## agent.archive.after

보관 상태가 저장되면 발생합니다. `{ agent, archivedAt }`를 받으며 런타임 정리는 아직 대기 중일 수 있습니다.

```ts
server.addHook("agent.archive.after", async ({ agent, archivedAt }) => {
  console.log(agent, archivedAt);
});
```

## agent.turn.before

실시간 턴이 시작되면 발생합니다. `{ agent, turnId }`를 받습니다. 기록 재생은 이 훅을 발생시키지 않습니다.

```ts
server.addHook("agent.turn.before", async ({ agent, turnId }) => {
  console.log(agent, turnId);
});
```

## agent.turn.after

실시간 턴이 완료, 실패 또는 취소되면 발생합니다. `{ agent, turnId, outcome, timeline }`을 받습니다. `outcome.kind`는 `completed`, `failed` 또는 `canceled`입니다. `timeline`은 사용 중단되었으며 항상 비어 있습니다. 아래와 같이 SDK를 통해 기록을 가져오세요.

### 턴이 끝날 때 후속 작업 보내기

[server/inspect.ts](https://github.com/getpaseo/paseo/blob/main/plugin-examples/lifecycle-actions/server/inspect.ts)를
플러그인에 복사하세요. 도우미는 `@getpaseo/protocol/agent-types`에서 타입을 가져옵니다. 데몬과 일치하는 버전의
`@getpaseo/protocol`을 개발 의존성에 추가하고 플러그인을 로드하기 전에 설치하세요. `latestOutputText`는 최신 사용자 메시지 뒤의 텍스트 조각을 합칩니다.

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { latestOutputText } from "./server/inspect";

export default function contribute(server: PluginServerContext) {
  server.addHook("agent.turn.after", async (event, context) => {
    if (event.outcome.kind === "canceled") {
      return;
    }

    const agent = context.paseo.agents.ref(event.agent.id);
    const page = await agent.timeline.refetch({ direction: "tail", limit: 20 });
    const text = latestOutputText(page.entries.map(({ item }) => item));
    if (/out of credits/i.test(text)) {
      await agent.send("Try again.");
    }
  });

  return () => {};
}
```

```text
Turn ends: "out of credits"
  → plugin sends "Try again."
  → a new turn starts
```

핸들러는 마지막 20개 타임라인 항목만 가져옵니다. 해당 페이지 이전의 출력은 검사하지 않습니다.
플러그인에 더 많은 기록이 필요하면 `cursor`와 `direction`을 사용해 페이지를 더 탐색하세요.

기존 SDK로 새 메시지를 보냅니다. 계속 일치하면 후속 작업을 계속 보내므로 필요할 때 플러그인에
제한이나 지연을 추가하세요. 첨부 파일과 도구 효과는 재생되지 않습니다.

## agent.permission.before

권한 또는 질문이 대기 상태가 되면 발생합니다. `{ agent, request }`를 받으며 `request`는 `AgentPermissionRequest`입니다. SDK를 통해 답변을 보내세요.

### 권한 요청에 응답하기

같은 [도우미 파일](https://github.com/getpaseo/paseo/blob/main/plugin-examples/lifecycle-actions/server/inspect.ts)의 `shellCommand`를 사용합니다.

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { shellCommand } from "./server/inspect";

export default function contribute(server: PluginServerContext) {
  server.addHook("agent.permission.before", async (event, context) => {
    const command = shellCommand(event.request);
    if (command === null) {
      return;
    }

    const agent = context.paseo.agents.ref(event.agent.id);
    if (/\brm\s+-rf\b/.test(command)) {
      await agent.respondToPermission({
        requestId: event.request.id,
        response: { behavior: "deny", message: "Recursive deletion is blocked." },
      });
      return;
    }

    if (command.trim() === "git status") {
      await agent.respondToPermission({
        requestId: event.request.id,
        response: { behavior: "allow" },
      });
    }
  });

  return () => {};
}
```

| 요청                     | 결과                       |
| ------------------------ | -------------------------- |
| `rm -rf build`           | 거부됨                     |
| `git status`             | 승인됨                     |
| 다른 명령 또는 요청      | 사용자가 처리하도록 대기   |
| 이미 해결된 요청         | SDK 응답 실패              |

정규식은 예제 정책이지 셸 파서가 아닙니다. 권한 요청은 질문, 계획 및 모드 변경일 수도 있습니다.
권한을 요청해도 턴은 끝나지 않습니다.

## agent.permission.after

대기 중인 요청에 응답하거나 요청을 지우면 발생합니다. `{ agent, requestId, resolution }`을 받으며 `resolution`은 `AgentPermissionResponse`입니다.

```ts
server.addHook("agent.permission.after", async ({ agent, requestId, resolution }) => {
  console.log(agent, requestId, resolution);
});
```

에이전트 훅은 데몬의 비공개 일회용 도우미를 제외합니다. 공개 백그라운드 작업공간과 그 안의 일반 에이전트에는 같은 훅이 적용됩니다.

## 순서와 반환 값

```text
Creation request
  → agent.create.before hooks (plugin-ID order; registration order within each plugin)
  → resolve defaults and validate provider configuration
  → derive launch configuration with Paseo runtime tools and daemon prompt
  → agent.open.before hooks (same ordering; env and plugin-local tools and MCP servers)
  → set PASEO_AGENT_ID and PASEO_AGENT_CWD
  → open provider session and save agent configuration
```

| 콜백 반환 값                                            | 다음 콜백이 받는 값                                 |
| ------------------------------------------------------- | --------------------------------------------------- |
| `{ ...request, env: { ...request.env, REGION: "eu" } }` | `REGION`이 추가/대체된 이전 요청                    |
| `{ ...request, env: { REGION: "eu" } }`                 | 전체 재정의 맵이 대체된 이전 요청                   |
| `undefined`                                             | 변경되지 않은 요청                                  |
| 예외를 던지거나 유효하지 않은 데이터 반환               | 작업이 실패하고 이후 콜백은 실행되지 않음           |

자동 깊은 병합은 없습니다. `env`는 플러그인 전반에 걸쳐 누적됩니다. `tools`와 `mcpServers`는
같은 플러그인 안의 콜백에 걸쳐서만 누적됩니다. 대체 맵이나 배열을 반환하면 해당 범위의 이전 값을
대체합니다.

## 컨텍스트와 정리

| 계약                               | 동작                                                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `context.paseo`                    | 이 데몬에 연결된 기존 SDK                                                                                        |
| `context.signal`                   | 호출 시간 초과 또는 플러그인 중지 시 중단됨. 외부 요청에 전달                                                   |
| 입력 데이터                        | 분리된 스냅숏. 반환 요청 또는 SDK 명령으로 상태 변경                                                              |
| 등록 결과                          | 멱등 제거 함수. 예: `const remove = server.addHook(...); remove();`                                              |
| 다시 로드, 비활성화, 제거, 종료    | 남은 등록 항목 제거                                                                                              |
| 알 수 없는 훅 이름                 | 등록 실패                                                                                                        |
| 훅 시간 초과                       | 30초. 신호를 중단함. 대기 훅은 대기 중인 작업을 실패시키고 알림 핸들러는 오류를 기록                             |
| 이벤트 핸들러 오류                 | 플러그인에 기록되고 원래 작업은 계속됨                                                                           |
| 이벤트 전달                        | 실시간 최선형. 재생, 영속화 또는 자동 재시도 없음                                                                |
| 이벤트 동시성                      | 서로 다른 이벤트가 겹칠 수 있으며 콜백 완료 순서는 보장되지 않음                                                |

## 전체 예제

| 플러그인                                                                                               | 포함 항목                                                                        |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| [lifecycle-logger](https://github.com/getpaseo/paseo/tree/main/plugin-examples/lifecycle-logger)       | 에이전트, 작업공간, 작업 트리 훅과 환경 값을 가린 JSON 로그                       |
| [lifecycle-actions](https://github.com/getpaseo/paseo/tree/main/plugin-examples/lifecycle-actions)     | 후속 작업, 권한, 환경, 공급자 전환, 작업 트리 선택                                |
| [agent-configuration](https://github.com/getpaseo/paseo/tree/main/plugin-examples/agent-configuration) | MCP 주입과 Codex 샌드박스/승인 옵션                                               |
| [agent-tools](https://github.com/getpaseo/paseo/tree/main/plugin-examples/agent-tools)                 | 레이블 대상 도구와 플러그인 프로세스의 파일 작업                                  |

로거 출력은 `paseo plugin logs lifecycle-logger` 또는 호스트의 `daemon.log`에서 읽으세요.

## 이름이 변경된 훅

이전 등록 메서드는 2027-04-30 이후 제거할 예정으로 사용 중단되었습니다. 기존 플러그인은 동작을 유지합니다. 플러그인 안에서 이전 등록과 새 등록을 함께 사용하면 등록 순서로 실행됩니다. `addHook`은 새 이름만 받습니다.

| 이전 등록                                           | 새 등록                                                    |
| -------------------------------------------------- | --------------------------------------------------------- |
| `server.before("workspace.create", handler)`       | `server.addHook("workspace.create.before", asyncHandler)` |
| `server.on("workspace.created", handler)`          | `server.addHook("workspace.create.after", asyncHandler)`  |
| `server.on("workspace.archived", handler)`         | `server.addHook("workspace.archive.after", asyncHandler)` |
| `server.before("agent.create", handler)`           | `server.addHook("agent.create.before", asyncHandler)`     |
| `server.on("agent.created", handler)`              | `server.addHook("agent.create.after", asyncHandler)`      |
| `server.before("agent.session_open", handler)`     | `server.addHook("agent.open.before", asyncHandler)`       |
| `server.on("agent.closed", handler)`               | `server.addHook("agent.close.after", asyncHandler)`       |
| `server.on("agent.archived", handler)`             | `server.addHook("agent.archive.after", asyncHandler)`     |
| `server.on("agent.turn_started", handler)`         | `server.addHook("agent.turn.before", asyncHandler)`       |
| `server.on("agent.turn_ended", handler)`           | `server.addHook("agent.turn.after", asyncHandler)`        |
| `server.on("agent.permission_requested", handler)` | `server.addHook("agent.permission.before", asyncHandler)` |
| `server.on("agent.permission_resolved", handler)`  | `server.addHook("agent.permission.after", asyncHandler)`  |
