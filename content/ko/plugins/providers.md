---
title: Build a provider plugin
description: Add a coding agent to Paseo directly or adapt an ACP agent.
nav: Provider plugins
order: 46
category: Plugins
---

# 공급자 플러그인 만들기

Paseo 플러그인을 만들어 본 적이 없다면 [플러그인 빠른 시작](/docs/plugins)부터 확인하세요.

공급자 플러그인은 코딩 에이전트를 Paseo 코어에 추가하지 않고 Paseo에 연결합니다.
[플러그인을 게시](/docs/plugins/publishing)하여 npm 또는 Git 저장소에서 공유하면 사용자가
`paseo plugin install`로 설치할 수 있습니다.

구현 경로 하나를 선택하세요.

| 에이전트 | 경로 |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 이미 ACP를 구현함 | `runAcpProvider()`로 등록하고 공급업체별 변환기는 필요한 범위로만 추가합니다. |
| TypeScript SDK, JSON-RPC API 또는 사용자 지정 프로세스 프로토콜이 있음 | `ProviderRegistration`을 직접 구현합니다. |

예제는 다음과 같습니다.

- [`provider-direct`](https://github.com/getpaseo/paseo/tree/main/plugin-examples/provider-direct): 세션, 옵션 제어 항목, 프롬프트, 지속성, 하위 세션, 공급자 소유 타임라인 렌더러
- [`provider-acp-transformer`](https://github.com/getpaseo/paseo/tree/main/plugin-examples/provider-acp-transformer): Zod로 검증하는 공급업체 편집 변환기가 포함된 ACP 명령 템플릿입니다. 플러그인을 로드하기 전에 `example-acp --stdio`를 설치된 ACP 에이전트로 바꾸세요.
- [`inline-thinking`](https://github.com/getpaseo/paseo/tree/main/plugin-examples/inline-thinking): 공급자를 구현하지 않는 렌더러 전용 플러그인

## 직접 공급자 등록하기

서버 진입점을 추가합니다.

```ts
// index.server.ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
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
} from "@getpaseo/plugin/server/provider";

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

## 공급자 CLI 실행하기

프로세스 기반 전송과 CLI 확인에는 `@getpaseo/plugin/server`의 `spawnProcess`와 `execCommand`를
사용하세요. 둘 다 Windows의 `.cmd`/`.bat` 실행기를 처리하고 셸 인수를 따옴표 처리합니다.
Node의 원시 `spawn`과 `execFile`은 Windows에서 이러한 실행기를 거부합니다.

데몬은 확인된 명령, 인수 접두사, 전체 환경을 `request.launch`로 제공합니다. 이 환경을 명시적으로
전달하세요. 도우미는 데몬 환경 정책을 적용하지 않습니다. 프로세스 수명 주기와 프로토콜 제한 시간은
공급자 내부에서 관리하세요. 정상 종료할 때는 stdin을 닫고, 강제 종료에는
`terminateProcess(child)`를 사용합니다. 이 함수는 Windows에서 명령 스크립트 실행기 뒤의 CLI까지
포함해 프로세스 트리를 종료합니다. 스트림이 닫히기를 마지막으로 기다리는 시간에도 제한을 두세요.

```ts
import { spawnProcess, execCommand } from "@getpaseo/plugin/server";

const child = spawnProcess(launch.command, [...launch.args, "serve"], {
  env: launch.env,
  cwd,
  stdio: "pipe",
});
const { stdout } = await execCommand(launch.command, [...launch.args, "--version"], {
  env: launch.env,
  timeout: 5000,
});
```

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

`session.open`에는 전체 시작 구성인 작업 디렉터리, 환경, 시스템 프롬프트, MCP 서버, 도구 정책, 모델, 모드, `providerOptions`, 지속성 기본 설정이 포함됩니다.

호스트 범위 플러그인 설정을 지속하려면 `server.registerSettings()`가 반환한 핸들을 사용하세요. 카탈로그와 세션 콜백에서 설정을 읽고, 공급자가 구성을 메모리에 유지할 때는 변경 사항을 구독하세요. `read()`와 `subscribe()` 계약은 [설정](./reference.md#persisted-values)을 확인하세요.

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
    controls: [],
    providerOptions: {},
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

## 공급자 옵션용 작성기 제어 항목 추가하기

`providerOptions`는 공급자 자체의 구성입니다. Paseo가 에이전트별로 저장하고 `session.open`에
전달하는 하나의 JSON 값 레코드입니다. 사용자가 `config.json`에서 공급자에 설정한 기본값도
포함됩니다. 읽는 모든 키를 검증하세요.

사용자가 작성기에서 일부 옵션을 보고 변경해야 할 때만 `controls`를 추가하세요. 제어 항목은
`providerOptions`의 최상위 키 하나를 토글 또는 선택 항목으로 표시합니다. 제어 항목 자체에는 값이
없으며 Paseo가 `providerOptions`에서 값을 읽습니다. 제어 항목과 실제 실행에 사용하는 값을
`session.config`에 게시하세요.

```ts
emit({
  type: "session.config",
  sessionId,
  config: {
    model: "agent-large",
    models: [{ id: "agent-large", label: "Agent Large" }],
    modes: [],
    thinkingOptions: [],
    controls: [
      { type: "toggle", key: "fast", label: "Fast mode", icon: "Zap", defaultValue: false },
      {
        type: "select",
        key: "approval",
        label: "Approvals",
        icon: "Shield",
        defaultValue: "ask",
        choices: [
          { value: "ask", label: "Ask" },
          { value: "auto", label: "Auto accept" },
        ],
      },
    ],
    providerOptions: { fast: nativeSession.fast, approval: nativeSession.approval },
  },
});
```

`icon`은 Lucide 아이콘 이름입니다. `defaultValue`는 키에 값이 없을 때 제어 항목이 표시하는
값입니다. Paseo는 세션을 열거나 변경을 적용할 때 공급자가 보고한 모든 값을 저장합니다. 기본값과
같은 값이나 아무도 설정하지 않은 값도 포함됩니다. 같은 제어 항목은 새 작업공간 화면, 초안 탭,
실행 중인 에이전트에 표시됩니다. 실행 중인 세션에서 변경할 수 있는 키에만 제어 항목을 제공하세요.
공급자는 모델 변경 뒤를 포함해 런타임에 제어 항목을 바꿀 수 있습니다.

변경은 `session.configure`로 전달되며 `changes.providerOptions`에는 제어 항목 유무와 관계없이 변경된
키만 들어갑니다. 모든 키를 적용하고 확정된 `session.config`를 `request.completed`보다 먼저
게시하세요. 세션을 열 때만 읽는 키처럼 하나라도 적용할 수 없다면 `request.failed`로 요청을
실패시키고 모든 키를 기존 값으로 유지하세요. 값이 `null`이면 해당 키를 공급자의 기본값으로
되돌립니다. 요청을 그대로 복사하지 말고 세션에 실제로 적용된 값을 게시하세요. Paseo는 게시된 값을
저장하므로 저장된 옵션과 실제 실행 상태가 일치합니다.

예를 들어 모델을 바꾸면서 Fast가 꺼지는 것처럼 공급자가 자체적으로 옵션을 변경하면 새 값이 담긴
`session.config`를 게시하세요. Paseo는 해당 값을 저장하며 이전 값을 다시 설정하지 않습니다.

모든 옵션에 제어 항목이 필요한 것은 아닙니다. 예를 들어 공급자별 토큰 예산은 전용 프롬프트 필드가
아니라 `providerOptions`에 속합니다. `session.open`으로 전달되고, 호출자는 실행 중인 에이전트에서
이를 변경할 수 있으며, `session.configure` 핸들러가 실시간 적용 가능 여부를 결정합니다. Paseo가
실행 중인 값을 저장하도록 `providerOptions`에 보고하세요.

## 지속성과 재생 추가하기

네이티브 세션을 다시 열 수 있으면 `session.persistence`를 알리세요. `session.open.persistence`가 없으면 새 네이티브 세션을 열고, 값이 있으면 식별된 네이티브 세션을 재개합니다. `session.opened` 또는 `session.persistence`에서 불투명한 지속성 값을 반환하세요. Paseo는 값을 검사하지 않고 저장합니다.

`history`가 `"replay"`이면 `session.ready`보다 먼저 네이티브 세션의 기존 `timeline.item` 스냅샷을 게시하세요. 이전 행을 재생하지 않고 열려면 `history: "skip"`을 사용합니다.

Paseo는 현재 공급자 세션을 닫고 현재 구성과 지속성을 사용해 다시 여는 방식으로 에이전트를 새로 고칩니다. `session.open` 중에 자격 증명, 환경, 전역 구성, MCP 서버를 다시 읽으세요. 별도의 다시 로드 작업은 없습니다.

대화 및 결합 되감기를 수행하려면 지속성을 사용해 코어가 복원하는 세션이 필요합니다. 되감기가 성공하면 Paseo는 세션을 닫고 최신 지속성 값을 `history: "replay"`와 함께 다시 엽니다. `session.ready` 전에 유지된 네이티브 분기와 해당 하위 항목을 포함해 게시하세요. 파일 전용 되감기는 현재 세션과 대화 기록을 유지합니다.

Paseo가 지속성에서 세션을 다시 열 수 있으면 `restoration: "core"`를 사용하세요. 공급자가 소유한 하위 세션은 `restoration: "parent"`를 사용합니다. `parentSessionId`가 있는 또 다른 `session.opened` 이벤트로 내보내고 상위를 복원할 때 다시 만드세요.

## 명령과 방향 조정 추가하기

모든 사용자 입력은 `session.prompt`를 통해 전달됩니다.

- `input.type: "message"`에는 텍스트, 이미지, 첨부 파일이 들어갑니다.
- `input.type: "command"`에는 선택한 명령과 인수가 들어갑니다.
- `delivery: "steer"`는 활성 턴에 입력을 추가하라는 요청입니다.
- `delivery: "auto"`는 턴을 시작하거나 턴 없이 명령을 완료할 수 있게 합니다.

작성기에 구조화된 명령을 추가하려면 `session.commands`를 게시하세요. 명령은 일반 턴을 시작하거나 부수 효과를 실행한 뒤 `completed` 프롬프트 결과로 끝날 수 있습니다.

구현한 기능만 알리세요. 방향 조정을 지원하지 않으면 `prompt.steer`를 생략합니다. 그러면 Paseo가 활성 턴을 교체할 수 있습니다.

## 유휴 런타임 정리 허용하기

Paseo는 데몬 기준선에서 정리를 허용할 때 한 시간 동안 유휴 상태인 재개 가능한 세션을 해제할 수 있습니다. 연결과 세션의 `session.opened` 기능에 `session.can_stop_runtime`을 알리면 제공자가 소유하는 거부권을 추가할 수 있습니다. 이 기능이 없으면 같은 기준선과 한 시간의 유휴 기간이 적용되며 플러그인은 안전 요청을 받지 않습니다.

기존 `send(input)` 핸들러에서 안전 질의를 처리하세요. 하나의 연결이 여러 세션을 제공하는 경우에도 제공자 자체 세션 ID를 대상으로 합니다.

```ts
case "session.can_stop_runtime": {
  try {
    const session = sessions.get(input.sessionId);
    if (!session) throw new Error("Session not found");
    emit({
      type: "session.can_stop_runtime",
      requestId: input.requestId,
      sessionId: input.sessionId,
      canStop: await session.canStopRuntime(),
    });
  } catch (error) {
    emit({
      type: "request.failed",
      requestId: input.requestId,
      error: { message: error instanceof Error ? error.message : String(error) },
    });
  }
  return;
}
```

`canStopRuntime(): Promise<boolean>`은 제공자의 세션 구현에 속합니다. 런타임을 해제해도 백그라운드 셸, 모니터, 네이티브 하위 프로세스, 대기 중인 완료 보고, 대기 중인 자율 응답을 잃지 않을 때만 `true`를 반환하세요. 이 질의는 세션을 중지하거나 변경해서는 안 됩니다. 작업이 남아 있는 동안은 `false`를 반환하세요. 거부된 질의, 잘못된 응답, 시간 초과도 런타임을 유지합니다. 이 질의에는 절대로 `request.completed`로 응답하지 마세요.

Paseo는 항상 포그라운드 작업, 권한, 대기 중인 전달, 수명 주기 작업, 작동 중인 관리/네이티브 하위 에이전트, 호출자에 대한 미처리 로컬 또는 원격 완료 구독을 확인합니다. 구독 보호는 등록, 복구, 알림 전달 승인까지 지속됩니다. 제공자가 긍정적으로 응답해도 이러한 차단 조건보다 우선하지 않습니다. Paseo는 기존 `session.close` 작업 전에 활동을 다시 확인합니다. 보호된 작업이 끝나면 한 시간의 새로운 유휴 기간이 시작됩니다. 저장된 제공자 지속성은 같은 대화를 재개할 수 있어야 합니다. 호스트 설정 `agents.idleRuntimeCleanup: false`는 모든 제공자의 정리를 비활성화합니다.

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
import type { PluginClientContext } from "@getpaseo/plugin/client";
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

## 보고서 측정항목

공급자가 측정한 값을 `label` 및 `value` 쌍으로 보고하세요. Paseo는 각 값을 받은 그대로 표시하므로 `12431` 대신 `12.4s`처럼 읽기 쉬운 형식을 사용하세요. 에이전트에 적합한 측정항목은 직접 선택할 수 있습니다.

`completed` 턴 이벤트에 `metrics`를 추가하세요. Paseo는 해당 턴의 바닥글에 이를 표시합니다.

```ts
emit({
  type: "session.turn",
  sessionId,
  turnId,
  state: "completed",
  metrics: [
    { label: "Model", value: "example-1" },
    { label: "Elapsed", value: "12.4s" },
    { label: "Tokens", value: "18.9K ↑ · 2.3K ↓" },
    { label: "Cache", value: "82%", tone: "ok" },
  ],
});
```

전체 세션의 합계를 표시하려면 `session.metrics`를 게시하세요. Paseo는 이를 컨텍스트 창 세부 정보에 표시합니다. 각 이벤트는 이전 목록을 대체하며, 빈 목록은 값을 지웁니다. `session.metrics`를 지원 기능에 추가하고 해당 기능이 협상된 경우에만 이벤트를 게시하세요.

```ts
if (capabilities.includes("session.metrics")) {
  emit({
    type: "session.metrics",
    sessionId,
    metrics: [
      { label: "Turns", value: "7" },
      { label: "Cost", value: "$0.42" },
    ],
  });
}
```

세션 측정항목 기능이 추가되기 전 버전의 Paseo는 이 기능을 제공하지 않으며, 해당 이벤트를 보내는 연결을 닫습니다. 턴의 `metrics`는 무시하므로 턴 측정항목에는 별도 기능 확인이 필요하지 않습니다.

값에 색상을 지정하려면 `tone`을 `"ok"`, `"warning"` 또는 `"danger"`로 설정하세요. 완료된 턴에 `Model` 측정항목이 없으면 Paseo가 세션 모델을 추가합니다.

`history`가 `"replay"`이면 각 이전 턴의 항목 뒤에 해당 턴의 `completed` 이벤트를 게시하세요. Paseo는 측정항목을 턴 바닥글에 다시 표시합니다.

## 설치 및 업데이트 보고하기

등록에 `installation`을 추가하면 공급자 설정에 **설치** 섹션이 표시됩니다. 사용자는 CLI가 설치되어 있는지와 버전, 사용 가능한 업데이트가 있는지 확인할 수 있으며, **업데이트** 버튼으로 업데이터를 실행하고 출력을 볼 수 있습니다. 모든 멤버는 선택 사항이므로 CLI가 지원하는 항목만 선언하세요.

| 멤버 | 사용자에게 표시되는 항목 | 선언할 때 |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| `installUrl` | **설치 지침**, 설치되지 않았을 때는 **설치** | 사용자가 CLI를 설치해야 할 때 |
| `updateUrl` | 설치된 상태에서 `update`를 선언하지 않았을 때 **업데이트 지침** | 문서에 업데이트 방법이 있을 때 |
| `inspect` | **버전** 또는 **설치되지 않음** | CLI가 버전을 보고할 때 |
| `checkForUpdates` | **최신 상태**, **업데이트 가능** 또는 **업데이트를 확인할 수 없음** | CLI 업데이터가 사용하는 릴리스 소스에 조회할 수 있을 때 |
| `update` | 설치된 상태에서 **업데이트**, 이어서 업데이터 출력 | CLI가 명령으로 자체 업데이트할 때 |

다음 `example-agent`는 버전을 출력하고, `self-update --check --json`으로 업데이터가 설치할 릴리스를 조회한 다음 `self-update`로 업데이트합니다.

```ts
import { execCommand, spawnProcess, terminateProcess } from "@getpaseo/plugin/server";
import type {
  ProviderInstallation,
  ProviderInstallationLaunch,
} from "@getpaseo/plugin/server/provider";

async function run(launch: ProviderInstallationLaunch, args: string[], signal: AbortSignal) {
  const { stdout } = await execCommand(launch.command, [...launch.args, ...args], {
    env: launch.env,
    timeout: 20_000,
    signal,
  });
  return stdout.trim();
}

export const installation: ProviderInstallation = {
  installUrl: "https://example.com/docs/install",
  updateUrl: "https://example.com/docs/update",

  async inspect({ launch, signal }) {
    if (!launch?.resolved) return { status: "not_installed" };
    // `example-agent --version` prints `1.4.2`.
    return { status: "installed", version: await run(launch, ["--version"], signal) };
  },

  async checkForUpdates({ launch, installedVersion, signal }) {
    if (!launch) return { status: "unknown" };
    // Prints `{"latest":"1.5.0"}`; `self-update` installs any release that differs.
    const { latest } = JSON.parse(
      await run(launch, ["self-update", "--check", "--json"], signal),
    ) as { latest: string };
    return latest === installedVersion
      ? { status: "current" }
      : { status: "available", versions: [latest] };
  },

  async update({ launch, signal, report }) {
    if (!launch?.resolved) return { status: "failed", message: "example-agent is not installed" };
    const child = spawnProcess(launch.command, [...launch.args, "self-update"], {
      env: launch.env,
      stdio: "pipe",
    });
    child.stdin.end();
    child.stdout.on("data", (chunk: Buffer) => report({ type: "stdout", text: chunk.toString() }));
    child.stderr.on("data", (chunk: Buffer) => report({ type: "stderr", text: chunk.toString() }));
    const stop = () => void terminateProcess(child);
    signal.addEventListener("abort", stop, { once: true });
    const code = await new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    }).finally(() => signal.removeEventListener("abort", stop));
    if (code !== 0) return { status: "failed", message: `self-update exited with code ${code}` };
    return { status: "succeeded", message: "New sessions use the new version." };
  },
};
```

`command` 옆의 등록에 추가하세요.

```ts
export function createProvider(): ProviderRegistration {
  return {
    id: "example-agent",
    label: "Example Agent",
    command: ["example-agent"],
    installation,
    async connect(request) {
      // ...
    },
  };
}
```

각 콜백은 세션이 사용할 실행 정보를 받습니다. `launch.resolved`가 `false`이면 Paseo가 실행 파일을 찾지 못한 것이며 `command`는 구성된 이름입니다. 이때는 실행하지 말고 `not_installed`를 보고하세요. 등록에 `command`가 없으면 `launch`도 없습니다. `checkForUpdates`는 `inspect`가 CLI 설치 상태를 보고한 뒤에만 실행되며, 보고된 `version`을 `installedVersion`으로 받습니다. 버전을 다시 읽지 말고 이 값을 비교하세요. ACP 공급자는 `runAcpProvider()`를 등록에 펼친 뒤 옆에 `installation`을 추가하세요. 버전 및 업데이트 검사는 세션 하위 명령 앞에 실행 인수를 붙여 실행하세요. 예를 들어 `hoplite
--version`을 사용하는 공급자는 `hoplite acp`를 실행합니다.

Paseo는 버전을 텍스트로 취급합니다. `version`과 `versions`를 작성된 그대로 표시하고 파싱하지 않으므로 무엇이 더 최신인지 검사에서 결정해야 합니다. CLI 자체 업데이터가 조회하는 소스를 사용하고, 조회할 수 없다면 `checkForUpdates`를 생략하세요. `unknown`을 반환하거나 예외가 발생하거나 제한 시간을 넘기면 메시지와 함께 **업데이트를 확인할 수 없음**이 표시되고 **최신 상태**는 표시되지 않습니다.

`update`는 사용자가 **업데이트**를 선택할 때만 실행되며 Paseo는 공급자마다 한 번에 하나의 업데이트를 실행합니다. 업데이터 출력을 변경하지 말고 `report`에 전달하세요. Paseo는 마지막 65,536자를 보관합니다. Paseo 자체 검증은 추가되지 않으므로 업데이트는 터미널에서 명령을 실행할 때와 같은 작업을 수행합니다. `succeeded`에는 새 버전이 언제 적용되는지 설명하는 메시지를, `failed`에는 이유를 반환하세요. 실패한 업데이트는 사용자가 공급자를 새로 고칠 때까지 표시됩니다. `update`가 없으면 **업데이트 지침**이 `updateUrl`을 엽니다.

**업데이트**와 **업데이트 지침**은 `inspect`가 CLI 설치 상태를 보고할 때마다 표시됩니다. 업데이트 검사는 옆에 알고 있는 상태만 보여 주므로 검사할 수 없더라도 `update`를 선언하세요.

Paseo는 설정을 열 때 `inspect`를 호출하고 결과를 30초 동안 보관합니다. `inspect`가 같은 버전을 보고하는 동안 `checkForUpdates`의 `current` 또는 `available` 결과는 한 시간 동안 보관하므로 Paseo 밖에서 CLI를 업데이트하면 검사 결과가 만료된 뒤 다시 확인합니다. `inspect`는 20초, `checkForUpdates`는 25초 안에 응답해야 합니다. `update`에는 제한 시간이 없습니다. Paseo가 대기를 중단하거나 데몬이 멈추면 `signal`이 중단됩니다. 모든 필드는 [`installation` 참조](/docs/plugins/reference#provider-installation)를 확인하세요.

## 사용자가 문제를 해결하도록 돕습니다.

잘못된 결과를 얻은 사용자는 도움을 요청하기 전에 공급자의 설정을 엽니다. 그거 줘
필요한 페이지: `docsUrl`을 선언하고 잘못된 결과를 설명하는 사실을 반환합니다.
`status`.

```ts
export function createProvider(): ProviderRegistration {
  return {
    id: "example-agent",
    label: "Example Agent",
    command: ["example-agent"],
    docsUrl: "https://example.com/docs/paseo#troubleshooting",
    async status({ launch }) {
      if (!launch) return { available: false, diagnostic: "example-agent has no command" };
      return { available: true, diagnostic: `Profile: ${launch.env.EXAMPLE_PROFILE ?? "default"}` };
    },
    async connect(request) {
      // ...
    },
  };
}
```

**문서**는 `docsUrl`을 엽니다. **진단 보고서**에는 명령, 실행 파일 경로 및
Paseo가 찾은 버전과 `Profile` 행이 표시됩니다. CLI가 읽은 내용을 보고합니다.
사용 중인 계정, 프로필, 구성 파일 등의 환경. 그것들은 다르다
데몬과 사용자 터미널 사이에 존재하며 사용자는 앱에서 이를 볼 수 없습니다.
행에 대해서는 [문제 해결 참조](/docs/plugins/reference#provider-troubleshooting)를 확인하세요.
Paseo가 작성하고 `status`의 규칙을 따릅니다.

## ACP 에이전트 연동하기

에이전트가 이미 ACP를 사용하면 ACP shim을 사용하세요.

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { runAcpProvider } from "@getpaseo/plugin/server/acp";

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

ACP가 설명할 수 없는 공급업체 차이점이 있는 경우 `transformers`을 사용하세요. 는
[구스 모델 트랜스포머](https://github.com/getpaseo/paseo/blob/main/plugins/goose-provider/server/models.ts)
`context.request`을 사용하여 에이전트의 모델 인벤토리를 읽고 `config`을 사용하여 세션 모델 ID 앞에 붙습니다.
활성 공급자와 함께. [ACP 어댑터 참조](/docs/plugins/reference#providers)를 확인하세요.

공급업체 페이로드를 검증합니다.
Zod를 사용하고 형식이 잘못되었거나 관련되지 않은 값을 변경하지 않고 그대로 둡니다.

```ts
import type { AcpTransformer } from "@getpaseo/plugin/server/acp";
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

Paseo는 각 호출의 ACP `kind`로 표준 도구 카드를 만듭니다. `execute`에는 Shell, `read`에는 Read,
`edit`와 `delete`에는 Edit, `search`에는 Search, `fetch`에는 Fetch를 사용합니다. 카드는 호출의
`input`(ACP `rawInput`), `output`(`rawOutput`), `content`, `locations`를 읽습니다. 다른 종류의 호출은
원시 입력과 출력을 표시하며, 에이전트가 둘 다 보내지 않으면 텍스트 콘텐츠를 표시합니다.

표준 카드를 대체하려면 반환된 도구 호출의 `detail`을 설정하세요. 예를 들어 에이전트가 새 파일을
ACP 편집으로 보고하더라도 플러그인은 파일 경로와 내용이 있는 `write` 상세 정보를 반환할 수 있습니다.
원시 값을 표시하려면 `{ type: "unknown", input, output }`을 반환하세요.

`toolCall`은 호출의 업데이트가 누적될 때마다 실행됩니다. ACP 정의에 따라 `content`를 보내는 업데이트는
이전 콘텐츠를 대체합니다. 에이전트가 값을 초기 업데이트에만 보내는 경우 Paseo가 마지막으로 표시한
호출인 `context.previous`에서 값을 읽으세요.
[Hermes 터미널 변환기](https://github.com/getpaseo/paseo/blob/main/plugins/hermes-provider/server/terminal-command.ts)는
이 방식으로 Hermes의 첫 업데이트에 담긴 명령을 유지합니다.

ACP 에이전트가 `session/new` 또는 `session/load`에 확장 메타데이터를 필요로 하면 `sessionOpen`을 사용하세요. 훅은 시스템 프롬프트와 `initialize`에서 받은 에이전트 기능의 `_meta`를 받습니다. 세션 요청의 `_meta`에 필드를 추가하려면 `metadata`를 반환하세요. 플러그인이 이전에 다른 지속성 형식을 저장했다면 해당 형식의 기본 `sessionId`를 반환하세요. Paseo 자체에 저장된 세션 ID가 우선하며, 세션을 연 뒤 ACP 지속성 형식을 기록합니다.

`configure` 변환기는 `catalog()`으로 에이전트의 현재 선택을 확인하고 변환된 변경 사항을 `apply(change)`에 전달할 수 있습니다. 이 방식으로 변경을 적용하면 공유 ACP 구성 매핑을 사용하며 해당 변경에 대한 변환기를 건너뜁니다.

`session/load` 이후 기록을 스트리밍하는 에이전트에 대해 `acpOptions.loadReplayQuietPeriodMs`을 설정합니다.
응답. Paseo는 기록 업데이트 없이 해당 간격이 지나면 세션을 준비된 것으로 게시합니다.
비기록 상태 및 메타데이터 업데이트(예: 명령, 구성, 모드, 사용법, 세션)
정보) 대기 시간을 연장하지 마세요.

특정 네이티브 모드를 기반으로 하는 무인 모드를 제공하려면 `acpOptions.autoAcceptMode`를 설정하세요. 어댑터는 Paseo 승인 화면을 열지 않고 명확한 ACP `allow_once` 작업 하나를 선택합니다. 새 세션의 기본값으로 사용하려면 `default: true`를 설정하세요. 이 모드로 전환하거나 해제하려면 보류 중인 승인이 없는 유휴 세션이어야 합니다.

다음에 대해서만 `thought_level` 선택 사항을 나열하는 에이전트에 대해 `acpOptions.perModelThinkingOptions`을 설정합니다.
선택한 모델. 카탈로그 검색은 각 모델을 차례로 선택하고 사고 옵션을 제공합니다.
에이전트가 목록을 작성합니다. `thought_level` 옵션이 없는 모델은 사고 선택자가 없습니다.

## 테스트하고 게시하기

모의 프레임만 사용하지 말고 실제 에이전트에 공급자를 연결해 테스트하세요.

1. 플러그인을 디렉터리 소스로 설치합니다.
2. SVG, 모델, 모드, 옵션 제어 항목이 표시되는지 확인합니다.
3. 세션을 만들고 실제 프롬프트 하나를 완료합니다.
4. 지원하는 경우 권한, 방향 조정, 취소, 지속성, 재생을 실행해 봅니다.
5. 모든 사용자 지정 타임라인 항목을 데스크톱 및 모바일 너비 레이아웃에서 렌더링합니다.
6. 세션이 활성 상태일 때 플러그인을 다시 로드하고 제거하여 세션이 종료되는지 확인합니다.

[플러그인 게시하기](/docs/plugins/publishing)에 따라 npm 또는 Git을 통해 공급자를 배포하세요.
에이전트 호환성과 릴리스는 플러그인 프로젝트에서 유지하세요.

정확한 런타임 및 SVG 규칙은 [플러그인 참조](/docs/plugins/reference#providers)를 확인하세요.
