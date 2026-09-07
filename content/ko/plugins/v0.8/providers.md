---
title: Build a provider plugin
description: Add a coding agent to Paseo directly or adapt an ACP agent.
nav: Provider plugins
order: 47
category: Plugins
---

# 공급자 플러그인 만들기

> **출시 예정인 Paseo v0.8용 문서입니다.** Paseo 플러그인을 만들어 본 적이 없다면
> [플러그인 빠른 시작](/docs/plugins/v0.8)부터 확인하세요.

공급자 플러그인은 코딩 에이전트를 Paseo 코어에 추가하지 않고 Paseo에 연결합니다. 플러그인을 Git 저장소에 게시하면 사용자가 `paseo plugin add`와 `paseo plugin update`로 설치하고 업데이트할 수 있습니다.

구현 경로 하나를 선택하세요.

| 에이전트 | 경로 |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 이미 ACP를 구현함 | `runAcpProvider()`로 등록하고 공급업체별 변환기는 필요한 범위로만 추가합니다. |
| TypeScript SDK, JSON-RPC API 또는 사용자 지정 프로세스 프로토콜이 있음 | `ProviderRegistration`을 직접 구현합니다. |

전체 예제는 다음과 같습니다.

- [`provider-direct`](https://github.com/getpaseo/paseo/tree/main/plugin-examples/provider-direct): 세션, 설정, 프롬프트, 지속성, 하위 세션, 공급자 소유 타임라인 렌더러
- [`provider-acp-transformer`](https://github.com/getpaseo/paseo/tree/main/plugin-examples/provider-acp-transformer): Zod로 검증하는 공급업체 편집 변환기가 포함된 ACP 명령
- [`inline-thinking`](https://github.com/getpaseo/paseo/tree/main/plugin-examples/inline-thinking): 공급자를 구현하지 않는 렌더러 전용 플러그인

## 직접 공급자 등록하기

서버 진입점을 추가합니다.

```ts
// index.server.ts
import type { PluginServerContext } from "@getpaseo/plugin";
import { createProvider } from "./server/provider";

export default function contribute(server: PluginServerContext) {
  server.registerProvider(createProvider());
  return () => {};
}
```

`createProvider()`는 하나의 `ProviderRegistration`을 반환합니다.

```ts
import {
  negotiateProviderCapabilities,
  type ProviderRegistration,
} from "@getpaseo/plugin/provider";

const supported = ["prompt.message"] as const;

export function createProvider(): ProviderRegistration {
  return {
    id: "my-agent",
    label: "My agent",
    icon: "icon.svg",
    async connect(request) {
      const capabilities = negotiateProviderCapabilities(request.capabilities, supported);
      return createConnection(capabilities);
    },
  };
}
```

연결에는 세 가지 작업이 있습니다.

- `send(input)`은 작업을 받아들이고 반환합니다. 결과는 반환값이 아니라 이벤트입니다.
- `onEvent(listener)`는 세션 상태와 완전한 타임라인 스냅샷을 게시합니다.
- `close()`는 모든 세션을 중지하고 프로세스, 구독, 대기 중인 작업을 해제합니다.

네이티브 SDK, 프로세스, 스트림은 연결 구현 내부에 유지하세요. 출력을 게시하기 전에 `ProviderEvent` 객체로 변환합니다.

## 모델, 모드, 사고 옵션 반환하기

Paseo는 세션을 만들기 전에 카탈로그를 요청합니다. 에이전트 양식에 필요한 선택 항목을 반환하세요.

```ts
if (input.type === "catalog") {
  emit({
    type: "catalog",
    requestId: input.requestId,
    catalog: {
      models: [
        { id: "agent-large", label: "Agent Large" },
        { id: "agent-small", label: "Agent Small" },
      ],
      modes: [
        { id: "build", label: "Build" },
        { id: "plan", label: "Plan" },
      ],
      thinkingOptions: [
        { id: "standard", label: "Standard" },
        { id: "extended", label: "Extended" },
      ],
      defaultModel: "agent-large",
      defaultMode: "build",
      defaultThinkingOption: "standard",
    },
  });
}
```

에이전트가 노출하지 않는 범주에는 빈 배열을 반환하세요. 선택한 `model`, `mode`, `thinkingOption`은 세션 구성으로 전달됩니다.

카탈로그는 세션이 생기기 전에 사용할 수 있는 선택 항목을 설명합니다. 세션별 제어 항목은 나중에 `session.config`를 통해 제공됩니다.

## 세션 열기

`session.open`에는 전체 시작 구성인 작업 디렉터리, 환경, 시스템 프롬프트, MCP 서버, 도구 정책, 모델, 모드, 설정, 불투명한 공급자 옵션, 지속성 기본 설정이 포함됩니다.

선택된 카탈로그 값으로 네이티브 세션을 만든 다음 실제 적용된 상태를 게시하세요.

```ts
const nativeSession = await sdk.createSession({
  cwd: input.config.cwd,
  model: input.config.model,
  mode: input.config.mode,
  thinking: input.config.thinkingOption,
  systemPrompt: input.config.systemPrompt,
  env: input.config.env,
  mcpServers: input.config.mcpServers,
});

emit({
  type: "session.opened",
  requestId: input.requestId,
  sessionId: input.sessionId,
  capabilities: ["prompt.message"],
  restoration: "core",
  cwd: input.config.cwd,
});
emit({
  type: "session.config",
  sessionId: input.sessionId,
  config: {
    model: nativeSession.model,
    mode: nativeSession.mode,
    thinkingOption: nativeSession.thinking,
    models,
    modes,
    thinkingOptions,
    settings: [],
  },
});
emit({ type: "session.ready", requestId: input.requestId, sessionId: input.sessionId });
```

`session.config`에는 확정된 값이 들어갑니다. 요청을 복사하지 말고 네이티브 에이전트가 정규화 후 선택한 값을 게시하세요.

## 첫 프롬프트 완료하기

메시지 프롬프트부터 시작하세요. `prompt.message`를 알리고, 콘텐츠를 네이티브 에이전트에 전달한 뒤 결과 수명 주기를 게시합니다.

```ts
const turnId = crypto.randomUUID();

emit({
  type: "timeline.item",
  sessionId,
  item: {
    type: "user_message",
    id: `user:${turnId}`,
    text,
    clientMessageId: prompt.clientMessageId,
  },
});
emit({
  type: "session.prompt_result",
  sessionId,
  clientMessageId: prompt.clientMessageId,
  result: { type: "turn", turnId },
});
emit({ type: "session.turn", sessionId, turnId, state: "started" });

// Publish complete snapshots as native output changes.
emit({
  type: "timeline.item",
  sessionId,
  item: { type: "assistant_message", id: `assistant:${turnId}`, text: completeText },
});

emit({ type: "session.turn", sessionId, turnId, state: "completed" });
```

각 `clientMessageId`마다 정확히 하나의 `session.prompt_result`를 게시하세요. Paseo가 낙관적으로 표시한 메시지를 교체할 수 있도록 사용자 타임라인 항목에 `clientMessageId`를 복사합니다. 시작된 모든 턴에는 `completed`, `failed`, `canceled` 중 하나의 종료 이벤트가 필요합니다.

이제 공급자를 사용할 수 있습니다. 사용자는 모델을 선택하고, 세션을 열고, 메시지를 보낸 뒤 응답을 볼 수 있습니다.

## 세션별 작성기 제어 항목 추가하기

네이티브 에이전트에 세션을 연 뒤 사용자가 바꿔야 하는 설정이 있을 때만 `session.configure`를 추가하세요. 해당 설정을 `session.config`에 토글 또는 선택 제어 항목으로 게시합니다.

```ts
emit({
  type: "session.config",
  sessionId,
  config: {
    model: "agent-large",
    models: [{ id: "agent-large", label: "Agent Large" }],
    modes: [],
    thinkingOptions: [],
    settings: [
      {
        type: "toggle",
        id: "fast",
        label: "Fast mode",
        value: nativeSession.fast,
      },
      {
        type: "select",
        id: "approval",
        label: "Approvals",
        value: nativeSession.approval,
        options: [
          { label: "Ask", value: "ask" },
          { label: "Auto accept", value: "auto" },
        ],
      },
    ],
  },
});
```

Paseo는 이 제어 항목을 작성기에 렌더링합니다. 사용자의 변경은 `session.configure`로 전달됩니다. 변경을 적용하고 확정된 `session.config`를 `request.completed`보다 먼저 게시하세요. 공급자는 모델이 바뀐 뒤를 포함해 런타임에 사용 가능한 제어 항목을 변경할 수 있습니다.

`settings`는 사용자에게 보이는 제어 항목입니다. `providerOptions`는 Paseo가 렌더링하지 않는 공급자별 구성을 위해 세션 생성 시 제공되는 불투명한 JSON입니다. 공급자별 토큰 예산은 전용 프롬프트 필드가 아니라 이 둘 중 하나에 속합니다.

## 지속성과 재생 추가하기

네이티브 세션을 다시 열 수 있으면 `session.persistence`를 알리세요. `session.open.persistence`가 없으면 새 네이티브 세션을 열고, 값이 있으면 식별된 네이티브 세션을 재개합니다. `session.opened` 또는 `session.persistence`에서 불투명한 지속성 값을 반환하세요. Paseo는 값을 검사하지 않고 저장합니다.

`history`가 `"replay"`이면 `session.ready`보다 먼저 네이티브 세션의 기존 `timeline.item` 스냅샷을 게시하세요. 이전 행을 재생하지 않고 열려면 `history: "skip"`을 사용합니다.

Paseo는 현재 공급자 세션을 닫고 현재 구성과 지속성을 사용해 다시 여는 방식으로 에이전트를 새로 고칩니다. `session.open` 중에 자격 증명, 환경, 전역 구성, MCP 서버를 다시 읽으세요. 별도의 다시 로드 작업은 없습니다.

Paseo가 지속성에서 세션을 다시 열 수 있으면 `restoration: "core"`를 사용하세요. 공급자가 소유한 하위 세션은 `restoration: "parent"`를 사용합니다. `parentSessionId`가 있는 또 다른 `session.opened` 이벤트로 내보내고 상위를 복원할 때 다시 만드세요.

## 명령과 방향 조정 추가하기

모든 사용자 입력은 `session.prompt`를 통해 전달됩니다.

- `input.type: "message"`에는 텍스트, 이미지, 첨부 파일이 들어갑니다.
- `input.type: "command"`에는 선택한 명령과 인수가 들어갑니다.
- `delivery: "steer"`는 활성 턴에 입력을 추가하라는 요청입니다.
- `delivery: "auto"`는 턴을 시작하거나 턴 없이 명령을 완료할 수 있게 합니다.

작성기에 구조화된 명령을 추가하려면 `session.commands`를 게시하세요. 명령은 일반 턴을 시작하거나 부수 효과를 실행한 뒤 `completed` 프롬프트 결과로 끝날 수 있습니다.

구현한 기능만 알리세요. 방향 조정을 지원하지 않으면 `prompt.steer`를 생략합니다. 그러면 Paseo가 활성 턴을 교체할 수 있습니다.

## 타임라인 항목 게시하기

`timeline.item`을 통해 완전한 스냅샷을 게시하세요. 스트리밍 텍스트, 실행 중인 도구 또는 할 일 목록을 업데이트할 때는 같은 항목 `id`를 재사용합니다. Paseo는 실시간 델타를 산출하고 일반 타임라인을 유지합니다.

내장 항목 유형은 사용자 및 어시스턴트 메시지, 추론, 도구, 할 일, 오류, 알림, 압축을 포함합니다. 공급자의 표현을 이런 유형으로 나타낼 수 없을 때는 플러그인 항목을 사용하세요.

```ts
emit({
  type: "timeline.item",
  sessionId,
  item: {
    type: "plugin",
    id: "review-42",
    pluginId: "my-provider-plugin",
    kind: "review-verdict",
    version: 1,
    data: { verdict: "ship", summary: "All checks passed" },
  },
});
```

렌더러는 `index.client.tsx`에 별도로 등록합니다.

```tsx
import type { PluginClientContext } from "@getpaseo/plugin";
import { z } from "zod";
import { ReviewVerdict } from "./client/review-verdict";

const reviewVerdictSchema = z.object({
  verdict: z.enum(["ship", "hold"]),
  summary: z.string(),
});

export default function contribute(client: PluginClientContext) {
  client.addTimelineRenderer({
    kind: "review-verdict",
    version: 1,
    schema: reviewVerdictSchema,
    Component: ReviewVerdict,
  });
  return () => {};
}
```

같은 렌더러로 공급자, 클라이언트 타임라인 변환기 또는 데몬 타임라인 추가 작업에서 내보낸 항목을 표시할 수 있습니다. 렌더러에는 공급자 구현이 필요하지 않습니다.

## ACP 에이전트 연동하기

에이전트가 이미 ACP를 사용하면 ACP shim을 사용하세요.

```ts
import type { PluginServerContext } from "@getpaseo/plugin";
import { runAcpProvider } from "@getpaseo/plugin/acp";

export default function contribute(server: PluginServerContext) {
  server.registerProvider(
    runAcpProvider({
      id: "vendor-agent",
      label: "Vendor agent",
      icon: "icon.svg",
      command: ["vendor-agent", "acp"],
    }),
  );
  return () => {};
}
```

shim이 ACP 프로세스, 기능 매핑, 세션 수명 주기, 프롬프트, 권한, 타임라인 변환을 맡습니다. 이 기능을 플러그인에 복사하지 마세요.

ACP로 표현할 수 없는 공급업체별 차이에만 `transformers`를 사용하세요. 공급업체 페이로드는 Zod로 검증하고, 형식이 잘못되었거나 관련 없는 값은 변경하지 않습니다.

```ts
import type { AcpTransformer } from "@getpaseo/plugin/acp";
import { z } from "zod";

const editSchema = z.object({
  path: z.string(),
  before: z.string(),
  after: z.string(),
});

export const vendorEdits: AcpTransformer = {
  toolCall(toolCall) {
    if (toolCall.name !== "vendor_file_edit") return toolCall;
    const input = editSchema.safeParse(toolCall.input);
    if (!input.success) return toolCall;
    return {
      ...toolCall,
      kind: "edit",
      input: {
        filePath: input.data.path,
        oldString: input.data.before,
        newString: input.data.after,
      },
    };
  },
};
```

## 테스트하고 게시하기

모의 프레임만 사용하지 말고 실제 에이전트에 공급자를 연결해 테스트하세요.

1. 플러그인을 디렉터리 소스로 설치합니다.
2. SVG, 모델, 모드, 설정이 표시되는지 확인합니다.
3. 세션을 만들고 실제 프롬프트 하나를 완료합니다.
4. 지원하는 경우 권한, 방향 조정, 취소, 지속성, 재생을 실행해 봅니다.
5. 모든 사용자 지정 타임라인 항목을 데스크톱 및 모바일 너비 레이아웃에서 렌더링합니다.
6. 세션이 활성 상태일 때 플러그인을 다시 로드하고 제거하여 세션이 종료되는지 확인합니다.

플러그인을 Git 저장소에 푸시하세요. 사용자는 다음 명령으로 설치합니다.

```bash
paseo plugin add owner/repository
paseo plugin update my-provider-plugin
```

공급업체 호환성과 릴리스는 해당 저장소에서 유지하세요. Paseo 코어는 둘 이상의 공급자가 공유하는 사용자 대상 기능을 공급자 경계로 표현할 수 없을 때만 변경해야 합니다.

정확한 런타임 및 SVG 규칙은 [플러그인 참조](/docs/plugins/v0.8/reference#providers)를 확인하세요.
