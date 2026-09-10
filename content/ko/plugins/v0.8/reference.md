---
title: Plugin reference
description: Local plugin files, client and server runtimes, platform limits, contributions, RPCs, lifecycle, hosts, and CLI commands.
nav: Reference
order: 48
category: Plugins
---

# 플러그인 참조

> **Paseo v0.8 베타용 문서입니다.** [v0.8 빠른 시작](/docs/plugins/v0.8)으로 돌아가세요.

기존 플러그인을 마이그레이션하려면 별도의 [런타임 진입점 마이그레이션 가이드](/docs/plugins/v0.8/migration)를 따르세요.

로컬 플러그인은 하나의 Paseo 데몬에 설치되는 디렉토리 소스입니다. 플러그인은 다음 기능을 제공할 수 있습니다.

- Paseo 클라이언트의 React Native 표면과 사이드바 항목
- 작업공간 탭으로 열리는 작업공간 및 에이전트 패널
- Command Center의 전역, 작업공간 및 에이전트 작업
- 메시지 작성기의 슬래시 명령
- 변환하거나 데몬에서 푸시하는 에이전트 타임라인 행
- Settings → Appearance의 밝은 테마와 어두운 테마
- 데몬 옆에서 실행되는 스키마 검증 RPC 핸들러
- TypeScript SDK를 통한 일반 Paseo 작업
- 메시지 작성기에서 검색할 수 있는 외부 리소스

플러그인 코드는 신뢰된 코드로 취급되며 샌드박스 없이 실행됩니다. 클라이언트 표면은 Paseo 앱에서 실행됩니다. 백엔드 기여는 데몬 머신의 파일, 프로세스, 자격 증명, 네트워크에 접근할 수 있는 하위 프로세스에서 실행됩니다.

## 프로젝트 파일

`paseo plugin init /absolute/path/to/my-plugin`은 다음 파일을 생성합니다.

```text
my-plugin/
  paseo-plugin.json
  index.client.tsx
  index.server.ts
  client/greeting.tsx
  server/greeting.ts
  shared/greeting.ts
  package.json
  tsconfig.json
```

필수 루트 매니페스트는 `paseo-plugin.json`입니다. 여기에는 기본 플러그인 ID와 지원되는 Paseo 버전이 들어 있습니다.

```json
{ "id": "my-plugin", "requirements": { "paseo": ">=0.8.0" } }
```

### 요구 사항

`requirements`는 선택적 객체입니다. 현재 지원되는 키 `paseo`에는 npm semver 범위를 사용할 수 있습니다.
`requirements.paseo`를 생략하면 `<0.8.0`, 즉 최초로 호환성을 깨는 플러그인 릴리스보다 앞서 만들어진
플러그인을 의미합니다. Paseo 0.8 이상은 이를 거부하고 [마이그레이션 가이드](migration) 링크를 표시합니다.
빈 문자열, 잘못된 범위 및 알 수 없는 매니페스트 요구 사항 키는 거부됩니다.

| 범위 | 호환 릴리스 |
| ---------------- | ---------------------------------------------------------------------------- |
| `>=0.8.0` | 시험판과 이후 호환성을 깨는 릴리스를 포함한 0.8.0 이상 |
| `^0.8.0` | 시험판을 포함한 0.8.x 릴리스 |
| `>=0.8.3 <0.9.0` | 시험판을 포함한 0.8.3부터 마지막 0.8 패치까지 |

Paseo 시험판 버전은 안정화 핵심 버전(`major.minor.patch`)이 만족하는 범위도 만족합니다. 따라서
`0.8.0-beta.1`은 `>=0.8.0`을 만족하지만 `<0.8.0`은 만족하지 않습니다.

`paseo plugin init`은 현재 CLI 버전 앞에 `>=`를 붙여 기록하고 타입 검사를 위해 일치하는 SDK 버전을
고정합니다. 새 API를 채택할 때는 최소 버전을 올리세요. 새 릴리스가 호환되지 않으면 상한을 추가하세요.
최소 버전만으로는 향후 호환성을 깨는 변경으로부터 보호된다고 보장할 수 없습니다.

데몬은 플러그인을 설치하거나 Git 빌드 명령을 실행하거나 로드하기 전에 버전을 확인하며, 시작·활성화·다시
로드할 때도 확인합니다. 거부된 Git 업데이트에서는 설치된 리비전을 유지합니다. 연결된 각 앱은 클라이언트
코드를 평가하기 전에 자체 버전을 확인하고 **설정 → 플러그인**에 비호환 상태를 표시합니다. 데몬이 호환된다고
해서 오래된 앱도 호환되는 것은 아닙니다. 클라이언트 진입점이 없는 플러그인은 연결된 앱 버전과 일치하지 않아도 됩니다.

예: `Plugin "review" requires Paseo >=0.8.0. Your daemon is 0.7.2.` 호환되는 플러그인 리비전을
사용하거나 이름이 표시된 런타임을 업데이트하세요. 0.8 이전 릴리스는 이 매니페스트 필드를 이해하지 못하며
새 진단을 표시할 수 없습니다.

### 런타임 진입점

| 진입점 | 런타임 | 전달받는 값 | 필수 조건 |
| ------------------ | --------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `index.client.tsx` | Paseo 앱, 클라이언트별 실행 | `PluginClientContext` | 플러그인에 UI, 콜백, 테마 또는 첨부 소스가 있는 경우 |
| `index.server.ts` | 데몬 하위 프로세스 | `PluginServerContext` | 플러그인이 핸들러, 훅, 설정 지속성 또는 공급자를 제공하는 경우 |

진입점이 하나 이상 필요하며, 두 진입점 모두 `.ts` 또는 `.tsx`를 사용할 수 있습니다. 기존 `index.ts`만 있는 디렉토리는 로드에 실패하며 [마이그레이션 가이드](/docs/plugins/v0.8/migration)를 안내합니다.

플러그인, 표면, 사이드바 항목, 작업공간 패널, Command Center 항목, 첨부 소스, 슬래시 명령의 ID는 소문자로 시작하며 소문자, 숫자 또는 하이픈으로 구성됩니다.

생성된 `package.json`은 로컬 타입 검사와 테스트를 위해 `@getpaseo/plugin` 및 다른 호스트 모듈을 개발 종속성으로 설치합니다. Paseo가 해당 런타임 인스턴스를 제공합니다. 사용자가 플러그인을 추가할 때는 이러한 모듈을 설치하지 않습니다.

나머지 모듈은 모두 다음 세 디렉토리 중 하나에 위치해야 합니다. 디렉토리 내부에 하위 디렉토리를 만들어도 되지만, 플러그인 루트에 모듈을 두면 컴파일 오류가 발생합니다.

| 디렉토리 | 컴파일 대상 | 용도 |
| --------- | ------------------ | -------------------------------------------------------------------- |
| `client/` | 앱 번들만 | React, React Native, 훅, 스타일, 표면, 패널, 콜백. |
| `server/` | 데몬 번들만 | Node API, 로컬 리소스, 자격 증명, RPC 핸들러. |
| `shared/` | 두 번들 모두 | 두 런타임에서 가져오는 Zod RPC 계약과 일반 값. |

## 런타임 모듈

Paseo는 각 번들을 해당 진입점에서 빌드합니다. `client/`를 데몬 번들로 가져오거나, `server/`를 앱 번들로 가져오거나,
앱 번들 어디에서든 Node 모듈을 가져오면 컴파일 오류가 발생합니다. 서버에서 React, React Native 또는 클라이언트 SDK
진입점을 가져와도 실패합니다. 공유 코드는 공유 코드만 가져와야 하며 Node, React, 런타임별 SDK 진입점 또는
런타임별 타입을 가져오면 안 됩니다.

SDK 루트(`@getpaseo/plugin`)에는 공유 데이터, 스키마 및 런타임 중립적인 도우미만 있습니다. 클라이언트
컨텍스트와 훅은 `/client`, 서버 컨텍스트와 수명 주기 계약은 `/server`, UI는 `/client/react-native` 또는
`/client/ui`에서 가져오세요. 이러한 규칙은 타입 가져오기와 전이 종속성에도 적용됩니다. `/client/host`는
앱 호스트 전용이며 플러그인에서 가져올 수 없습니다.

### 클라이언트 런타임

Paseo는 클라이언트 코드에 다음 모듈을 제공합니다.

| 모듈 | 용도 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `@getpaseo/plugin` | 공유 데이터, `defineRpc`, `defineSettings`, `defineAttachmentSource`, `RpcInput`, `RpcOutput` |
| `@getpaseo/plugin/client/ui` | 이름이 지정된 조합 가능한 설정 구성 요소 |
| `@getpaseo/plugin/client/react-native` | Paseo UI 구성 요소와 UI 훅 |
| `@getpaseo/plugin/client` | 클라이언트 기여 컨텍스트, `usePaseo`, `useRpc`, `useSettings` 및 데이터 훅 |
| `@tanstack/react-query` | 요청 상태와 캐싱 |
| `react` | 구성 요소와 훅 |
| `react/jsx-runtime` | 컴파일된 JSX |
| `react-native` | 크로스 플랫폼 UI |
| `zod` | 공유 스키마 |

호스트가 함께 사용하는 React와 렌더러 버전을 소유합니다. SDK의 React 피어 범위는 도구와 Node 소비자를 위해
패치 버전을 허용하지만, 앱에 고정된 React 버전을 바꾸거나 다른 호스트 렌더러와의 호환성을 보장하지 않습니다.

위와 정확히 일치하는 모듈 지정자는 호스트의 런타임 인스턴스를 사용합니다. 다른 호스트 모듈을 요청하는 클라이언트 번들은 `Module "<name>" is not available in plugin client code` 오류와 함께 실패합니다.

`lucide-react-native`, `react-native-svg` 또는 DOM 라이브러리를 가져오지 마세요. 기여의 `icon` 필드에는 [Lucide 아이콘 이름](https://lucide.dev/icons/)을 설정하세요. Paseo가 이름을 검증하고 아이콘을 렌더링합니다.

### 크로스 플랫폼 규칙

클라이언트 코드는 iOS, Android에서 실행되며 브라우저에서는 React Native Web을 통해 실행됩니다. 브라우저에서 작동하는 구성 요소가 휴대폰에서 충돌하는 것이 가장 흔한 플러그인 버그입니다. 다음 규칙을 따르세요.

| 사용해야 할 것 | 사용하지 말아야 할 것 |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `react-native`의 `View`, `Text`, `Pressable`, `ScrollView`, `TextInput` | `<div>`, `<span>`, `<button>` 또는 모든 HTML 요소 |
| `theme.colors`와 `layout.compact`로 만든 `style` 객체 | `className`, CSS 문자열 또는 하드코딩한 색상 |
| `onPress` | `onClick`, `onMouseEnter` 또는 다른 DOM 핸들러 |
| `Linking`, `Clipboard` 방식의 React Native API | 구성 요소 내의 `window`, `document`, `localStorage`, `navigator`, `location` |

스캐폴드의 `tsconfig.json`은 DOM 라이브러리를 제외하므로 기본적으로 어디에서든 `document`와 `window`를 사용하면 타입 오류가 발생합니다. 브라우저 API가 허용되는 유일한 곳은 `client/web.ts`입니다. 이 모듈에서는 사용하는 전역 객체마다 필요한 부분만 타입으로 선언하고, 내보내는 모든 항목에 `Platform.OS` 조건을 적용하며, 네이티브용 대안을 제공합니다.

`client/web.ts`:

```ts
import { Linking, Platform } from "react-native";

// This plugin typechecks without the DOM library. Declare only what this module uses.
declare const window: { open(url: string, target: string, features: string): unknown };

export async function openExternal(url: string): Promise<void> {
  if (Platform.OS === "web") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  await Linking.openURL(url);
}
```

`/// <reference lib="dom" />`를 추가하거나 `lib`에 `"DOM"`을 추가하지 마세요. 어느 쪽이든 프로젝트 전체에서 DOM 타입을 다시 활성화해 다음 실수를 놓치게 만듭니다. 구성 요소는 `openExternal`을 가져오며 직접 `window`에 접근하지 않습니다. 표면과 패널 props의 `layout.platform`은 렌더링 결정에 사용할 수 있도록 `Platform.OS`와 같은 값을 전달합니다.

[설정 API](#settings-screens)를 사용하면 클라이언트 간에 타입이 지정된 호스트 범위 값을 유지할 수 있습니다. 직접 등록한 기여를 열 때는 `openSettings`, `openSurface`, `openPanel`을 사용하세요.

### 서버 런타임

Paseo는 서버 코드에 `@getpaseo/plugin`, `@getpaseo/plugin/server`, `@getpaseo/plugin/server/provider`, `@getpaseo/plugin/server/acp`, `zod`를 제공합니다. 백엔드 기여는 데몬 하위 프로세스에서 실행되며 Node를 통해 호스트 머신에 접근할 수 있습니다. 파일 시스템, 프로세스, 자격 증명 및 기타 머신 로컬 작업은 `server/` 아래에 두세요. `index.server.ts`가 없는 플러그인은 하위 프로세스를 시작하지 않습니다.

### 공급자

직접 구현과 ACP 구현, 세션 수명 주기, 작성기 설정, 타임라인 렌더러, 테스트, 배포는 [공급자 플러그인 만들기](/docs/plugins/v0.8/providers)를 따르세요.

`@getpaseo/plugin/server/provider`의 `ProviderRegistration`을 `server.registerProvider()`에 전달하세요. 연결은 `send()`로 입력을 받고 `onEvent()`를 통해 완전한 상태 스냅샷을 내보냅니다. `send()`는 수락 여부만 보고합니다. 프롬프트 처리 결과, 턴, 구성, 지속성, 권한, 실패는 이벤트로 전달됩니다.

메시지, 구조화된 명령, 방향 조정, 명령 부수 효과에는 하나의 `session.prompt` 입력을 사용하세요. 실시간 사용자 타임라인 항목에 `clientMessageId`를 반복하고 정확히 하나의 일치하는 `session.prompt_result`를 게시합니다. 공급자가 만든 하위 항목은 `parentSessionId`가 있는 세션으로 게시하세요.

공급자 설정은 Paseo가 작성기에 렌더링하는 토글/선택 설명자입니다. 공급자 전용 JSON은 `providerOptions`에 두세요. 호스트 도구는 전체 세션 구성의 MCP 서버로 전달됩니다.

Paseo는 현재 공급자 세션을 닫고 현재 구성과 지속성을 사용해 다시 여는 방식으로 에이전트를 새로 고칩니다. 공급자는 `session.open` 중에 외부 상태를 다시 읽습니다.

명령 기반 ACP를 연동하려면 `@getpaseo/plugin/server/acp`의 `runAcpProvider()`를 사용하세요. 공급업체별 검색, 구성, 알림 또는 도구 호출 차이에만 변환기 훅을 추가합니다.

`ProviderRegistration.icon`은 `icon.svg`처럼 플러그인 디렉터리를 기준으로 한 파일 경로입니다. 해당 디렉터리 안에 있는 64KiB 이하의 일반 SVG 파일이어야 합니다. SVG는 자체 완결형이어야 하며 스크립트, 스타일, `foreignObject`, 이벤트 핸들러 속성, JavaScript URL, 외부 `href` 또는 `xlink:href` 참조는 거부됩니다. `#mark` 같은 프래그먼트 참조는 허용됩니다. Paseo는 플러그인을 시작할 때 파일을 읽고 정제합니다. 문자열 자체를 인라인 SVG나 URL로 사용하지 않습니다.

## 진입점과 정리

각 진입점은 기여 함수 하나를 기본으로 내보내고 정리 함수를 반환합니다. 클라이언트 진입점은 `PluginClientContext`를, 서버 진입점은 `PluginServerContext`를 전달받습니다. 클라이언트 등록 메서드는 멱등성을 갖는 제거 함수를 반환하지만, 헤더 버튼과 작성기 필은 `{ update, remove }` 핸들을 반환합니다. 진입점의 정리 함수는 Paseo가 남아 있는 등록을 제거하기 전에 실행됩니다.

```ts
import type { PluginClientContext } from "@getpaseo/plugin/client";
import { Main } from "./client/main";

export default function contribute(client: PluginClientContext) {
  client.addSurface("main", Main);
  return () => {};
}
```

정리 함수는 비동기일 수 있습니다. 플러그인이 생성한 타이머, 감시자, 소켓 및 기타 리소스를 해제하세요. Paseo는 다시 로드, 비활성화, 제거, 연결 해제 또는 데몬 종료 시 등록을 제거하고, 표면을 마운트 해제하고, 대기 중인 RPC를 거부하고, 플러그인의 데몬 세션을 닫고, 하위 프로세스를 중지합니다.

## 수명 주기 훅

`index.server.ts`에서 다음과 같이 등록합니다.

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";

export default function contribute(server: PluginServerContext) {
  server.on("agent.turn_ended", (event) => {
    console.log(event.agent.id, event.outcome);
  });

  return () => {};
}
```

| 등록 | 콜백이 받는 값 | 반환 값 |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------------ |
| `server.on(name, callback)` | `(event, { paseo, signal })` | `void` 또는 `Promise<void>` |
| `server.before(name, callback)` | `({ request }, { paseo, signal })` | 변경된 요청, 또는 유지하려면 `undefined`; 비동기 지원 |

앱이 연결되어 있지 않아도 플러그인이 활성화된 동안 데몬에서 훅이 실행됩니다.

### 구성을 변경하고 MCP 서버 주입하기

다음 콜백을 `contribute(server)` 안에 추가하세요. 자리표시자 URL을 MCP 엔드포인트로 바꾸세요.

```ts
server.before("agent.create", ({ request }) => {
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
      mcpServers: {
        ...request.config.mcpServers,
        company: {
          type: "http",
          url: "https://tools.example.com/mcp",
        },
      },
    },
  };
});
```

| 입력 | 결과 |
| ------------------------------------------- | ----------------------------- |
| `providerOptions.sandbox_mode: "read-only"` | `"workspace-write"` |
| `providerOptions.web_search: "disabled"` | 전개 연산자로 보존 |
| 기존 `mcpServers.search` | 전개 연산자로 보존 |
| 기존 `mcpServers.company` | 위 항목으로 교체 |

선택한 공급자가 `providerOptions`를 검증하며, 구성된 MCP 서버를 지원해야 합니다. 명시적인 Codex 샌드박스 및 승인 옵션은 모드 프리셋보다 우선합니다.

### 세션을 열 때마다 환경 변수 주입하기

```ts
server.before("agent.session_open", ({ request }) => {
  return {
    ...request,
    env: {
      ...request.env,
      COMPANY_ENV: "development",
    },
  };
});
```

생성, 재개, 새로 고침 및 가져오기 때 실행됩니다. 생성할 때만 주입하려면 대신 `agent.create` 콜백에서 `env`를 설정하세요.

### 작업공간 격리 선택하기

```ts
server.before("workspace.create", ({ request }) => {
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

**결과:** 명시적인 디렉터리 생성 요청이 작업 트리 요청으로 바뀝니다. 기존 작업공간과 디렉터리 조회/가져오기 작업에는 영향을 주지 않습니다.

### 턴이 끝날 때 후속 작업 보내기

[server/inspect.ts](https://github.com/getpaseo/paseo/blob/main/plugin-examples/lifecycle-actions/server/inspect.ts)를 플러그인에 복사하세요. 이 도우미는 `@getpaseo/protocol/agent-types`에서 타입을 가져옵니다. 플러그인 SDK와 같은 버전의 `@getpaseo/protocol`을 개발 종속성에 추가하고 플러그인을 로드하기 전에 설치하세요. `latestOutputText`는 마지막 사용자 메시지 이후의 텍스트 조각을 합칩니다.

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { latestOutputText } from "./server/inspect";

export default function contribute(server: PluginServerContext) {
  server.on("agent.turn_ended", async (event, context) => {
    if (event.outcome.kind === "canceled") {
      return;
    }

    const text = latestOutputText(event.timeline);
    if (/out of credits/i.test(text)) {
      await context.paseo.agents.ref(event.agent.id).send("Try again.");
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

기존 SDK로 새 메시지를 보냅니다. 계속 일치하면 후속 작업도 계속 전송되므로 필요에 따라 플러그인에 제한이나 지연을 추가하세요. 첨부 파일과 도구 효과는 재실행되지 않습니다.

### 권한 요청에 응답하기

같은 [도우미 파일](https://github.com/getpaseo/paseo/blob/main/plugin-examples/lifecycle-actions/server/inspect.ts)의 `shellCommand`를 사용합니다.

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { shellCommand } from "./server/inspect";

export default function contribute(server: PluginServerContext) {
  server.on("agent.permission_requested", async (event, context) => {
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

| 요청 | 결과 |
| ------------------------ | ------------------------- |
| `rm -rf build` | 거부 |
| `git status` | 승인 |
| 그 밖의 명령 또는 요청 | 사용자의 응답을 기다림 |
| 이미 해결된 요청 | SDK 응답 실패 |

정규식은 예시 정책이지 셸 파서가 아닙니다. 권한 요청에는 질문, 계획 및 모드 변경도 포함될 수 있습니다. 권한을 요청해도 턴은 끝나지 않습니다.

### 이벤트

| 이름 | 이벤트 필드 | 트리거 |
| ---------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `agent.created` | `agent` | 일반 생성 완료; 가져오기/재개 제외 |
| `agent.turn_started` | `agent`, `turnId` | 실시간 턴 시작 |
| `agent.turn_ended` | `agent`, `turnId`, `outcome`, `timeline` | 실시간 턴 완료, 실패 또는 취소 |
| `agent.permission_requested` | `agent`, `request` | 권한 또는 질문이 대기 상태가 됨 |
| `agent.permission_resolved` | `agent`, `requestId`, `resolution` | 대기 중인 요청에 응답하거나 요청이 지워짐 |
| `agent.archived` | `agent`, `archivedAt` | 보관 상태 저장 |
| `workspace.created` | `workspace` | 레코드 생성 및 디렉터리 사용 가능 |
| `workspace.archived` | `workspace` | 보관 상태 저장 |

에이전트 이벤트는 내부 유틸리티 에이전트를 제외합니다. 보관 이벤트가 런타임/작업 트리 정리보다 먼저 발생할 수 있으며, `workspace.created`는 에이전트 시작 전 설정 장벽이 아닙니다.

**공유 페이로드 형태** (`@getpaseo/plugin/server`):

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

| 필드 | 형태/의미 |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| `turnId` | 공급자가 보고한 `string` 또는 `null`; 세션을 다시 연 뒤 반복될 수 있음 |
| `timeline` | `readonly AgentTimelineItem[]`; 이전 대화를 포함한 전체 스냅샷이며 텍스트가 여러 항목에 걸칠 수 있음 |
| `request` | SDK `AgentPermissionRequest`; `kind`는 `tool`, `plan`, `question`, `mode` 또는 `other` |
| `resolution` | SDK `AgentPermissionResponse` |
| `archivedAt` | 타임스탬프 문자열 |

### 사전 훅

| 이름 | 요청 필드 | 편집 가능 항목 |
| -------------------- | ----------------------------------------------------------------------- | --------------------------------------- |
| `agent.create` | `config`, 선택적 `env` | `cwd`를 제외한 공개 에이전트 구성, `env` |
| `agent.session_open` | `agentId`, `workspaceId`, `provider`, `cwd`, `reason`, `purpose`, `env` | `env`만 |
| `workspace.create` | `source`, 선택적 `title`, `firstAgentContext` | 명시적 생성 요청 전체 |

**`agent.create.config`**는 `AgentSessionConfig`를 사용합니다.

| 필드 | 제약 조건 |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| `provider`, `model` | 별도 필드; 공급자를 바꾸면 모델/모드/옵션도 바꿔야 할 수 있음 |
| `modeId`, `thinkingOptionId`, `featureValues` | 공급자별 선택 사항 |
| `title`, `systemPrompt` | 에이전트 구성 |
| `providerOptions` | 공급자별로 검증되는 옵션 |
| `mcpServers`, `toolPolicy` | MCP 구성과 정확한 도구 사전 승인 |
| `cwd` | 변경할 수 없음 |
| `internal` | 데몬 소유이며 이 훅에서 변경할 수 없음 |

**`agent.session_open` 요청 예시:**

```json
{
  "agentId": "agent-123",
  "workspaceId": "workspace-456",
  "provider": "codex",
  "cwd": "/projects/shop",
  "reason": "resume",
  "purpose": "interactive",
  "env": { "COMPANY_ENV": "development" }
}
```

| 필드 | 값 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `workspaceId` | 문자열 또는 `null` |
| `reason` | `create`, `resume`, `refresh`, `import` |
| `purpose` | `interactive`, `history` |
| `env` | 실행 재정의 맵이며 데몬에서 상속된 환경은 제외합니다. 맵을 교체해 재정의를 추가, 교체 또는 제거합니다. |

### 순서와 반환 값

```text
Creation request
  → agent.create hooks (plugin-ID order; registration order within each plugin)
  → resolve defaults and validate provider configuration
  → derive launch configuration with Paseo runtime tools and daemon prompt
  → agent.session_open hooks (same ordering; env only)
  → set PASEO_AGENT_ID and PASEO_AGENT_CWD
  → open provider session and save agent configuration
```

| 콜백 반환 값 | 다음 콜백이 받는 값 |
| ------------------------------------------------------- | --------------------------------------------------- |
| `{ ...request, env: { ...request.env, REGION: "eu" } }` | 이전 요청에 `REGION` 추가/교체 |
| `{ ...request, env: { REGION: "eu" } }` | 이전 요청에서 재정의 맵 전체가 교체됨 |
| `undefined` | 변경되지 않은 요청 |
| 예외 발생 또는 잘못된 데이터 반환 | 작업 실패, 이후 콜백은 실행하지 않음 |

자동 심층 병합은 없습니다. 뒤의 콜백이 앞의 값을 덮어쓸 수 있습니다. 에이전트 구성은 저장되지만 환경 재정의는 함께 지속되지 않습니다.

### 컨텍스트와 정리

| 계약 | 동작 |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `context.paseo` | 이 데몬에 연결된 기존 SDK |
| `context.signal` | 호출 시간 초과 또는 플러그인 중지 시 중단됨; 외부 요청에 전달 |
| 입력 데이터 | 분리된 스냅샷; 반환 요청 또는 SDK 명령으로 상태 변경 |
| 등록 결과 | 멱등성을 갖는 제거 함수. 예: `const remove = server.on(...); remove();` |
| 다시 로드, 비활성화, 제거, 종료 | 남은 등록 제거 |
| 알 수 없는 훅 이름 | 등록 실패 |
| 훅 시간 초과 | 30초, 신호 중단. 사전 훅은 대기 중인 작업을 실패시키고 이벤트 핸들러는 오류 기록 |
| 이벤트 핸들러 오류 | 플러그인에 기록되고 원래 작업은 계속됨 |
| 이벤트 전달 | 실시간 최선형; 재생, 지속성 또는 자동 재시도 없음 |
| 이벤트 동시성 | 서로 다른 이벤트가 겹칠 수 있으며 콜백 완료 순서는 보장되지 않음 |

### 전체 예제

| 플러그인 | 포함 내용 |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [lifecycle-logger](https://github.com/getpaseo/paseo/tree/main/plugin-examples/lifecycle-logger) | 11개 훅 전체, 환경 값을 가린 JSON 로그 |
| [lifecycle-actions](https://github.com/getpaseo/paseo/tree/main/plugin-examples/lifecycle-actions) | 후속 작업, 권한, 환경, 공급자 전환, 작업 트리 선택 |
| [agent-configuration](https://github.com/getpaseo/paseo/tree/main/plugin-examples/agent-configuration) | MCP 주입과 Codex 샌드박스/승인 옵션 |

로거 출력은 `paseo plugin logs lifecycle-logger` 또는 호스트의 `daemon.log`에서 확인하세요.

## 표면과 사이드바 항목

구성 요소를 등록한 뒤 사이드바 항목이 해당 표면 ID를 가리키도록 설정하세요.

`client/main.tsx`:

```tsx
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";
import { useMemo } from "react";
import { Text, View } from "react-native";

export function Main({ theme, host, layout }: PluginSurfaceProps) {
  const styles = useMemo(
    () => ({
      screen: {
        flex: 1,
        padding: layout.compact ? 16 : 24,
        backgroundColor: theme.colors.surface0,
      },
      title: { color: theme.colors.foreground },
      detail: { color: theme.colors.foregroundMuted },
    }),
    [theme, layout.compact],
  );
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{host.label}</Text>
      <Text style={styles.detail}>{layout.platform}</Text>
    </View>
  );
}
```

`index.client.tsx`:

```ts
import type { PluginClientContext } from "@getpaseo/plugin/client";
import { Main } from "./client/main";

export default function contribute(client: PluginClientContext) {
  client.addSurface("main", Main);
  client.addSidebarItem({
    id: "main",
    title: "My plugin",
    icon: "Blocks",
    surface: "main",
  });
  return () => {};
}
```

`PluginSurfaceProps`에는 다음 필드가 있습니다.

| 필드 | 의미 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `theme` | 활성 Paseo 테마의 타입이 지정된 `PluginTheme` 색상 토큰. |
| `host` | 선택한 호스트의 `id`와 표시용 `label`. |
| `layout` | `compact`와 `ios`, `android` 또는 `web` 플랫폼. |
| `navigation` | 선택적 클라이언트 탐색 기능. `openAgent({ agentId })`와 `openWorkspace({ workspaceId })`는 선택한 호스트에서 대상을 엽니다. |

Paseo는 경로, 헤더, 닫기 작업, 호스트 선택기, 오류 경계, 쿼리 클라이언트를 관리합니다. 플러그인은 표면 본문을 관리합니다.

## 호스트 UI

클라이언트 코드에서 `@getpaseo/plugin/client/react-native`를 통해 Paseo가 제공하는 UI를 가져오세요. 다음 예제는 제어형 모달을 열고, 호스트 아이콘을 렌더링하고, 토스트로 작업 결과를 알립니다.

```tsx
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";
import { Icon, Modal, useToast } from "@getpaseo/plugin/client/react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export function IssueActions({ theme }: PluginSurfaceProps) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  function saveIssue() {
    toast.show("Issue saved", { variant: "success" });
    setOpen(false);
  }

  return (
    <View>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="Pencil" size={18} color={theme.colors.foreground} />
          <Text style={{ color: theme.colors.foreground }}>Edit issue</Text>
        </View>
      </Pressable>

      <Modal
        title="Edit issue"
        icon={<Icon name="Pencil" size={18} color={theme.colors.foreground} />}
        open={open}
        onOpenChange={setOpen}
      >
        <Modal.Content>
          <Pressable accessibilityRole="button" onPress={saveIssue}>
            <Text style={{ color: theme.colors.foreground }}>Save</Text>
          </Pressable>
        </Modal.Content>
      </Modal>
    </View>
  );
}
```

### 모달

`Modal`은 좁은 레이아웃에서 하단 시트를 사용하고, 그 외에는 가운데 정렬된 대화상자를 사용합니다. 플러그인이 `open` 상태를 관리합니다.

| Prop | 타입 | 필수 | 동작 |
| -------------- | ------------------------- | -------- | -------------------------------------------- |
| `title` | `string` | 예 | 모달과 화면에 표시되는 헤더의 제목을 지정합니다. |
| `icon` | `ReactNode` | 아니요 | 헤더의 제목 앞에 렌더링됩니다. |
| `open` | `boolean` | 예 | `true`일 때 모달 내용을 표시합니다. |
| `onOpenChange` | `(open: boolean) => void` | 예 | 사용자가 모달을 닫으면 `false`를 전달받습니다. |
| `children` | `ReactNode` | 예 | `Modal.Content`를 포함합니다. |

`Modal.Content`는 호스트가 렌더링한 헤더 아래의 본문을 관리합니다.

| Prop | 타입 | 기본값 | 동작 |
| ----------------------- | ---------------------- | ------------------ | --------------------------------------------------------------------------------- |
| `children` | `ReactNode` | 필수 | 헤더 아래의 본문 콘텐츠입니다. |
| `style` | `StyleProp<ViewStyle>` | — | 빈 공간을 포함한 전체 본문 뷰포트의 스타일입니다. 배경에 사용하세요. |
| `contentContainerStyle` | `StyleProp<ViewStyle>` | 패딩 24, 간격 16 | 콘텐츠 레이아웃을 재정의합니다. 가장자리까지 이어지는 행에는 `padding: 0, gap: 0`을 설정하세요. |
| `scrollable` | `boolean` | `true` | 호스트가 본문을 스크롤합니다. 자체 스크롤러가 있는 제한된 본문에는 `false`를 설정하세요. |

일반 `Modal.Content`에는 이미 패딩과 스크롤 기능이 있습니다. 추가 여백을 원하지 않으면 패딩 래퍼를 하나 더 추가하지 마세요. 본문 스타일은 호스트 헤더, 드래그 핸들, 닫기 제어 항목을 그대로 유지합니다. 호스트는 좁은 네이티브 레이아웃에서 하단 안전 영역을 확보합니다. 콘텐츠 패딩을 0으로 설정해도 이 공간은 사라지지 않고 장식용 여백만 제거됩니다. 키보드 여유 공간은 별도로 처리됩니다.

`scrollable={false}`이면 본문이 사용 가능한 시트 높이를 채우고 가운데 대화상자는 사용 가능한 높이의 85%를 사용합니다. 목록에는 `flex: 1, minHeight: 0`을 사용하세요. 기본 스크롤 대화상자는 넓은 레이아웃에서 콘텐츠 크기에 맞춰집니다. 표시 방식은 좁은 데스크톱 창과 넓은 태블릿을 포함해 창 크기를 따릅니다.

닫기 버튼, 배경 영역, 플랫폼의 뒤로 가기 동작, 웹의 Escape 키, 좁은 레이아웃의 시트 제스처로 모달을 닫을 수 있습니다. 닫기 동작은 `onOpenChange(false)`를 호출합니다. 플러그인이 `open`을 갱신해야 모달이 닫힙니다.

모달의 자식 요소는 플러그인 런타임 컨텍스트를 유지합니다. 그 안에서도 `usePaseo`, `useRpc`, `useWorkspace`, `useAgent`가 작동합니다.

### 스크롤

Paseo 모달에 표시될 수 있는 콘텐츠에는 `@getpaseo/plugin/client/react-native`의 `ScrollView`와 `FlatList`를 가져오세요. React Native props와 ref를 받으며 시트 제스처와 연동됩니다. 시트 밖에서는 일반 React Native 스크롤을 사용합니다. 하단 시트 라이브러리를 직접 가져오지 마세요.

세로 스크롤 소유자는 기본 모달 본문 또는 `scrollable={false}`로 설정한 자체 목록 중 하나만 사용하세요. 기본 스크롤 본문 안에 고정 높이 세로 목록을 중첩하면 Android에서 시트와 제스처를 두고 충돌할 수 있습니다. 가로 스크롤은 호스트의 세로 본문과 함께 사용할 수 있습니다.

기본 본문과 SDK 목록은 네이티브 시트 제스처를 공유합니다. 스크롤하기 전에 위로 드래그해 확장하고, 목록 맨 위에서 아래로 드래그해 축소하거나 닫으세요. `scrollable={false}`는 제스처를 바꾸지 않고 호스트의 스크롤 컨테이너만 제거합니다. `scrollToEnd` 같은 목록 메서드를 사용하기 전에 시트를 확장하세요. 시트가 최대 높이보다 낮으면 목록 오프셋이 잠깁니다.

```tsx
import { FlatList, Modal } from "@getpaseo/plugin/client/react-native";
import { Text } from "react-native";

// Inside your controlled Modal:
<Modal.Content
  scrollable={false}
  style={{ backgroundColor: theme.colors.surface1 }}
  contentContainerStyle={{ padding: 0, gap: 0 }}
>
  <FlatList
    style={{ flex: 1, minHeight: 0 }}
    data={items}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <Text style={{ padding: 16, color: theme.colors.foreground }}>{item.title}</Text>
    )}
  />
</Modal.Content>;
```

가로 탭은 기본 `Modal.Content` 안에 `<ScrollView horizontal style={{ flexGrow: 0 }}>…</ScrollView>`를 배치하세요. 콘텐츠의 세로 스크롤은 호스트에 맡깁니다.

### 복사와 붙여넣기

`copyText(text): Promise<void>`는 앱이 실행되는 기기의 클립보드에 씁니다. 사용자 동작에서 호출하고 성공을 알리기 전에 완료를 기다리세요. 플랫폼에서 복사를 거부하거나 클립보드를 사용할 수 없으면 거부됩니다. 브라우저 권한과 보안 컨텍스트 요구 사항도 그대로 적용됩니다.

```tsx
import { copyText, useToast } from "@getpaseo/plugin/client/react-native";

// Inside your component:
const toast = useToast();
async function copyResult() {
  try {
    await copyText(result);
    toast.show("Copied", { variant: "success" });
  } catch {
    toast.error("Could not copy. Select the text and use Copy.");
  }
}
```

프로그래밍 방식 복사와 네이티브 텍스트 선택은 별개의 상호작용입니다. 길게 눌러 선택하고 OS 복사 기능을 사용하려면 `<Text selectable>`을 사용하세요. 모달 양식에는 `@getpaseo/plugin/client/react-native`의 `TextInput`을 가져오세요. React Native 입력 props와 ref를 받고 OS 붙여넣기를 지원하며, 네이티브 시트에 포커스를 등록하므로 키보드가 양식을 위로 올릴 수 있습니다. 시트 밖에서는 일반 입력을 사용합니다. 일반 React Native 입력도 붙여넣기를 지원하지만 시트에 포커스를 등록하지 않아 키보드가 입력을 가릴 수 있습니다. OS 붙여넣기에는 클립보드 읽기 API가 필요하지 않습니다. 네이티브 플러그인에서는 DOM 클립보드 코드와 `react-native`의 더 이상 사용되지 않는 `Clipboard` 내보내기를 피하세요.

실행 가능한 [모달 UI 예제](https://github.com/getpaseo/paseo/tree/main/plugin-examples/modal-ui)에는 패딩된 양식, 전체 너비 행, 가상 목록, 가로 탭, 복사/붙여넣기 입력이 포함되어 있습니다.

### 토스트

`useToast()`는 두 가지 메서드를 반환합니다.

| 메서드 | 동작 |
| ------------------------- | ----------------------------------------------------------- |
| `show(message, options?)` | `durationMs`를 지정하지 않으면 2,200ms 동안 토스트를 표시합니다. |
| `error(message)` | 3,200ms 동안 오류 토스트를 표시합니다. |

`show`는 다음 옵션을 받습니다.

| 옵션 | 타입 | 기본값 |
| ------------ | ---------------------------------------------------------- | ----------- |
| `variant` | `"default" \| "info" \| "success" \| "warning" \| "error"` | `"default"` |
| `durationMs` | `number` | `2200` |

다른 토스트를 표시하면 현재 표시 중인 토스트가 교체됩니다. 빈 메시지는 무시됩니다.

### 아이콘

`Icon`은 Paseo에 설치된 아이콘 집합에서 [Lucide 아이콘](https://lucide.dev/icons/)을 렌더링합니다. 플러그인 번들은 `lucide-react-native`나 `react-native-svg`를 가져오지 않습니다.

| Prop | 타입 | 필수 | 동작 |
| ------- | -------- | -------- | ----------------------------------------------- |
| `name` | `string` | 예 | Lucide 아이콘 이름. 알 수 없는 이름이면 아무것도 렌더링하지 않습니다. |
| `size` | `number` | 아니요 | 아이콘의 너비와 높이. |
| `color` | `string` | 아니요 | 아이콘 색상. 플러그인 테마 토큰을 사용하세요. |

## 타임라인 항목

플러그인은 에이전트 타임라인 항목을 자체 데이터와 React Native 렌더러로 대체할 수 있습니다. 두 등록 모두 클라이언트 기여입니다. Paseo는 실시간 스트리밍 갱신을 포함해 렌더링 모델을 구성할 때마다 변환기를 적용합니다.

```tsx
import type { PluginClientContext, PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { Text } from "react-native";
import { z } from "zod";

const schema = z.object({ label: z.string() });

function Card({ item, theme }: PluginTimelineItemProps<z.output<typeof schema>>) {
  return <Text style={{ color: theme.colors.foreground }}>{item.data.label}</Text>;
}

export default function contribute(client: PluginClientContext) {
  client.addTimelineTransformer({
    id: "command-card",
    query: { itemType: "tool_call" },
    transform({ item, phase }) {
      return {
        items: [
          {
            type: "plugin",
            kind: "command-card",
            version: 1,
            data: { label: item.name, phase },
          },
        ],
      };
    },
  });
  client.addTimelineRenderer({
    kind: "command-card",
    version: 1,
    schema,
    Component: Card,
  });
  return () => {};
}
```

`query.itemType`은 안정적인 대분류 선택자입니다. 제공자나 도구에 따른 세부 판별은 `transform` 안에서 선택한 항목을 살펴보며 수행하세요. `undefined`를 반환하면 원래 항목을 유지합니다. `items`를 반환하면 해당 항목을 대체하고, 빈 배열을 반환하면 제거합니다. 항목의 `data`는 JSON과 호환되어야 합니다. `phase` 입력은 실행 중인 도구 호출과 로드 중인 추론에 대해 `"streaming"`이며, 그 외에는 `"complete"`입니다. 각 대체 항목에 선택적으로 플러그인 로컬 `id`를 설정할 수 있습니다. 설정하지 않으면 Paseo는 원본 항목의 출력 내 인덱스를 사용합니다.

렌더러는 `agentId`, `item`, `timestamp`, `theme`, `host`, `layout`을 전달받습니다. Paseo는 렌더링 전에 등록된 스키마로 `item.data`를 검증합니다. 변환기는 동기적이고 결정적으로 동작하도록 작성하세요. Paseo는 원본 항목의 참조를 기준으로 결과를 메모이제이션하고 원본 행에서 대체 항목의 식별자를 도출하므로, 스트리밍 항목 하나가 갱신되어도 해당 렌더러를 다시 마운트하지 않습니다. 렌더러가 Paseo의 기본 어시스턴트 행처럼 스트리밍 텍스트의 표시 속도를 조절해야 한다면 내보내진 `useRevealedText(text, phase)` 훅을 사용하세요.

### 데몬에서 타임라인 행 추가

서버 핸들러는 정식 기록에 플러그인 소유의 행을 추가할 수 있습니다.

```ts
import type { PluginHandlerContext } from "@getpaseo/plugin/server";

async function publishReview(agentId: string, { paseo }: PluginHandlerContext) {
  await paseo.agents.ref(agentId).timeline.append({
    type: "plugin",
    id: "review",
    kind: "review-result",
    version: 1,
    data: { verdict: "ready" },
  });
}
```

| 필드 | 타입 | 필수 | 동작 |
| --------- | ---------------- | -------- | -------------------------------------------------------------- |
| `type` | `"plugin"` | 예 | 플러그인 타임라인 유형을 선택합니다. |
| `id` | `string` | 예 | 안정적인 플러그인 로컬 식별자. 재사용하면 기존 행을 대체합니다. |
| `kind` | `string` | 예 | 등록된 렌더러를 선택합니다. |
| `version` | 양의 정수 | 예 | 렌더러 계약 버전을 선택합니다. |
| `data` | JSON 호환 | 예 | 렌더러 페이로드. JSON 직렬화 후 최대 64 KiB입니다. |

데몬은 호출한 플러그인 세션에서 `pluginId`를 기록하며, 플러그인 세션이 아닌 곳에서 이 RPC를 호출하면 거부합니다. 행은 실시간으로 표시되고 타임라인을 다시 가져와도 유지되며, 같은 플러그인과 `id`에 대해서는 최신 값만 남습니다. 렌더러가 없으면 Paseo는 기존의 사용 불가 행을 표시합니다. 데몬은 한도를 초과한 `data`를 잘라내지 않고 거부합니다. 이 작업을 지원하는 데몬은 `server_info.features.pluginTimelineItems`로 지원 여부를 알립니다.

## 테마와 레이아웃

플러그인 UI는 데스크톱, 브라우저, iOS, Android에서 모든 Paseo 테마로 실행됩니다. `theme`은 활성 호스트 테마를 매핑한, 타입이 지정된 `PluginTheme`입니다. 색상과 간격은 해당 props에서 가져와야 합니다. 색상을 하드코딩하거나 `Text`에 스타일을 지정하지 않으면 호스트 테마가 바뀔 때 표시가 깨집니다.

`theme` 또는 `layout.compact`가 바뀌면 스타일을 다시 생성하세요.

| 키 | 필수 적용 대상 | 용도 |
| ------------------------------- | -------------------------- | ----------------------------------- |
| `theme.colors.foreground` | 모든 주요 `Text` | 제목과 본문 |
| `theme.colors.foregroundMuted` | 보조 `Text` | 레이블과 보충 설명 |
| `theme.colors.surface0` | 루트 뷰 | 패널 배경 |
| `theme.colors.surface1` | 돌출된 표면 | 카드와 패널 |
| `theme.colors.surface2` | 컨트롤 표면 | 입력과 보조 컨트롤 |
| `theme.colors.border` | 표면 경계 | 테두리와 구분선 |
| `theme.colors.accent` | 주요 작업의 채움색 | 버튼과 선택 상태 |
| `theme.colors.accentForeground` | 강조 채움색 위의 텍스트 | 버튼 레이블 |
| `theme.colors.statusSuccess` | 성공 피드백 | 성공 메시지와 표시기 |
| `theme.colors.statusWarning` | 경고 피드백 | 경고 메시지와 표시기 |
| `theme.colors.statusDanger` | 실패 안내 문구 | 오류 메시지와 파괴적 작업 문구 |
| `layout.compact` | 패딩과 쌓기 배치 | 모바일과 좁은 창에서 `true` |
| `layout.platform` | 플랫폼별 동작 | `ios`, `android` 또는 `web` |

`#000`, `#fff` 또는 React Native의 기본 텍스트 색상을 하드코딩하지 마세요. 주요 문구에는 `foreground`를 사용합니다. 레이블에는 `foregroundMuted`를 사용합니다. `layout.compact`가 참이면 패딩을 줄이세요.

작업공간 및 에이전트 패널은 동일한 `theme`, `layout`과 선택적인 `navigation` 필드를 전달받습니다.

## 테마 제공

`addTheme`는 Settings → Appearance에 밝은 테마나 어두운 테마를 추가하며, 기본 테마 아래에 `name`으로 표시됩니다. 테마는 데이터이므로 구성 요소 파일이 필요하지 않습니다.

```ts
import type { PluginClientContext } from "@getpaseo/plugin/client";

export default function contribute(client: PluginClientContext) {
  client.addTheme({
    id: "mocha",
    name: "Catppuccin Mocha",
    appearance: "dark",
    colors: {
      background: "#1e1e2e",
      foreground: "#cdd6f4",
      raised: "#313244",
      control: "#45475a",
      border: "#45475a",
      accent: "#cba6f7",
      mutedForeground: "#a6adc8",
      ring: "#6c7086",
    },
  });
  return () => {};
}
```

모든 색상은 16진수 문자열이어야 하며, 다른 형식은 로드에 실패합니다. Paseo가 팔레트를 기본 어두운 테마에서 사용하는 전체 토큰 집합으로 확장하므로, 플러그인이 제공하는 테마는 패널, 메뉴, diff, 상태 색상, 터미널을 별도로 나열하지 않아도 모두 지원합니다.

| 색상 | 적용 대상 |
| ----------------- | ----------------------------------------------------------------- |
| `background` | 앱, 작업공간, 터미널 배경 |
| `foreground` | 주요 텍스트, 터미널 전경색과 커서 |
| `raised` | 카드, 팝오버, 포인터를 올린 행 |
| `control` | 입력, 보조 채움색, 밝은 테마의 사이드바 |
| `border` | 테두리와 가장 높이 돌출된 표면의 색조 |
| `accent` | 버튼, 선택, 포커스. 선택 사항이며 생략하면 `foreground`를 사용합니다. |
| `mutedForeground` | 보조 텍스트 |
| `ring` | 포커스 링, 스크롤바, 터미널의 밝은 검정색 |

`appearance`는 `"light"` 또는 `"dark"`입니다. Paseo는 이 값을 사용해 해당하는 표면, 상태, diff, 구문, 터미널, 그림자의 파생 방식을 선택합니다.

플러그인이 제공하는 테마는 한 번에 하나만 활성화할 수 있습니다. 선택한 테마는 저장됩니다. 이후 플러그인을 비활성화하거나 제거하면 Paseo는 앱에 색상이 적용되지 않는 상태로 두지 않고 기본 테마로 돌아갑니다.

테마에는 이를 지원하는 호스트가 필요합니다. `addTheme` 도입 전에 출시된 클라이언트는 해당 클라이언트 진입점을 평가할 수 없으며 `client.addTheme is not a function` 오류를 보고합니다. 클라이언트를 업데이트하세요.

## 설정 화면

`index.client.tsx`에서 `client.addSettingsScreen({ id, title, icon, Component })`로 구성 요소를 등록하세요. 해당 호스트의 **설정 → 플러그인 → 플러그인 이름** 아래에 표시됩니다. `id`는 설치본 내에서 고유하고 `icon`은 Lucide 이름입니다. 등록 함수는 멱등성을 갖는 제거 함수를 반환하며 플러그인을 종료하면 남은 화면이 제거됩니다.

직접 만든 화면을 열려면 `client.openSettings(id)` 또는 Command Center 콜백의 `openSettings(id)`를 호출하세요. 여러 호스트에 같은 플러그인이 설치되어 있어도 각 설치본에는 자체 값과 경로가 있습니다.

구성 요소는 `PluginSurfaceProps`를 전달받습니다. Paseo는 헤더, 뒤로 가기, 안전 영역, 스크롤, 가운데 정렬된 설정 열을 관리합니다. 좁은 창에서는 전체 화면 세부 페이지를 밀어 넣고, 넓은 창에서는 설정 사이드바를 유지합니다. 이 프레임 안에 React Native 구성 요소로 콘텐츠를 렌더링하세요. 비활성화되거나 제거된 플러그인은 뒤로 가기가 작동하는 사용 불가 화면을 남깁니다.

### 이름이 지정된 UI 구성 요소

설정 구성 요소는 `@getpaseo/plugin/client/ui`에서 가져오세요. 자체 상태 및 RPC와 함께 작동하며 양식 래퍼나 저장소 바인딩은 필요하지 않습니다.

```tsx
import { useState } from "react";
import { SettingsCard, SettingsSection, SettingsSwitch } from "@getpaseo/plugin/client/ui";

export function DisplaySettings() {
  const [visible, setVisible] = useState(true);
  return (
    <SettingsSection title="Display">
      <SettingsCard>
        <SettingsSwitch label="Show metadata" value={visible} onValueChange={setVisible} />
      </SettingsCard>
    </SettingsSection>
  );
}
```

| 구성 요소 | Props와 동작 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `SettingsGroup`, `SettingsSection` | 필수 `title`, `children`; 선택적 `info` 도구 설명, `trailing` 콘텐츠, `testID`. 섹션 간격과 제목을 관리합니다. |
| `SettingsCard` | `children`, 선택적 `testID`. 카드 표면과 직접 자식 사이의 구분선을 관리합니다. 매핑한 행에는 안정적인 React 키를 지정하세요. |
| `SettingsRow` | 필수 `label`; 선택적 `hint`, `error`, `children`, `testID`. 사용자 지정 제어 항목이나 콘텐츠를 감쌉니다. |
| `SettingsSwitch` | 행 props와 필수 `value: boolean`, `onValueChange`; 선택적 `disabled`. |
| `SettingsSelect` | 행 props와 필수 문자열 `value`, `options: { label, value }[]`, `onValueChange`; 선택적 `disabled`. Paseo의 적응형 메뉴를 사용합니다. |
| `SettingsInput` | 행 props와 필수 `onChangeText`; 선택적 `initialValue`, `placeholder`, `disabled`, `secureTextEntry`, `ref`. |
| `SettingsAction` | 행 props와 필수 `actionLabel`, `onPress`; 선택적 `disabled`. |

`SettingsInput`은 입력 중인 텍스트를 자체 관리합니다. `initialValue`는 마운트될 때 초깃값을 설정합니다. ref는 명시적인 프로그래밍 방식 변경을 위한 `focus()`, `blur()`, `getText()`, `replaceText(text)`를 노출합니다. 사용자가 저장하기 전까지 초안 텍스트를 지속 값과 분리하세요. 사용자 지정 미리 보기와 제어 항목은 이 구성 요소 옆이나 안에 배치할 수 있습니다.

### 지속되는 값

`shared/`에 설정 문서를 정의합니다.

```ts
import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

export const preferences = defineSettings({
  id: "display",
  scope: "host",
  version: 1,
  schema: z.object({ showMetadata: z.boolean().default(true) }),
});
```

정리 함수를 반환하기 전에 `index.server.ts`에서 `server.registerSettings(preferences)`로 등록하세요. 내장 지속성을 사용하려면 이 서버 진입점이 필요합니다. 자체 데이터를 사용하는 화면은 클라이언트 전용으로 둘 수 있습니다.

| 정의 필드 | 계약 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `id` | `[a-z][a-z0-9_-]*`와 일치하는 소문자 식별자이며 설치본 내에서 고유합니다. |
| `scope` | 필수 값은 `"host"`입니다. 해당 호스트의 승인된 모든 클라이언트가 문서를 공유합니다. 사용자별, 기기 로컬 또는 호스트 간 동기화는 없습니다. |
| `version` | 쓰기 리비전과 별개로 스키마를 설명하는 필수 양의 정수입니다. |
| `schema` | JSON 값용 Zod 스키마입니다. `{}`를 파싱하면 완전한 문서가 되도록 기본값을 지정하세요. |
| `migrate(values, fromVersion)` | 이전에 저장된 버전을 동기 또는 비동기로 변환하는 선택적 함수입니다. 출력은 현재 스키마를 통과해야 합니다. |

기여한 구성 요소에서 `useSettings(preferences)`를 호출하세요. 판별 가능한 상태를 반환합니다.

| `status` | 사용할 수 있는 데이터 |
| --------- | ------------------------------------------------------------------------ |
| `loading` | 읽기가 진행 중입니다. 기본값을 저장된 값처럼 렌더링하지 마세요. |
| `ready` | 타입이 지정된 `values`와 불투명한 `revision`. |
| `invalid` | `error`와 `revision`. 저장된 데이터는 보존됩니다. |
| `error` | 읽기 또는 연결에서 발생한 `error`. |

모든 상태는 `saving`, `saveError`와 다음 동작도 노출합니다.

- `save(values, revision): Promise<boolean>`은 완전한 문서를 검증하고 저장합니다. 검증, 충돌 또는 전송 실패 시 예외를 던지지 않고 `false`를 반환하며 `saveError`를 설정합니다.
- `reset(): Promise<boolean>`은 훅에서 불러온 리비전을 사용해 문서를 스키마 기본값으로 명시적으로 교체합니다. 잘못 저장된 데이터를 복구할 수 있습니다.
- `reload(): Promise<void>`는 저장 오류를 지우고 다시 읽습니다. 구성 요소가 초안을 소유하므로 다시 불러와도 자동으로 초안을 버리지 않습니다.

즉시 적용하는 토글은 `{ ...settings.values, showMetadata }`와 `settings.revision`을 `save`에 전달하세요. 초안 편집기는 열 때 값과 리비전을 함께 캡처합니다. 저장에 성공하거나 사용자가 초안을 버릴 때까지 해당 리비전을 유지하세요. 오래된 리비전으로 저장하면 거부되며 초안과 더 새로운 저장 값이 모두 보존됩니다.

쓰기는 원자적으로 처리되고 호스트에서 검증됩니다. 연결된 클라이언트는 플러그인을 다시 불러오지 않아도 업데이트를 받습니다. 값은 데몬 재시작, 플러그인 다시 로드, 비활성화, 업데이트 후에도 유지됩니다. 설치본을 제거하면 설정이 삭제됩니다. 같은 ID를 다시 설치하면 기본값에서 시작합니다.

문서가 없으면 스키마 기본값을 사용합니다. 잘못된 데이터, 실패한 마이그레이션, 지원하지 않는 더 새로운 버전은 파일을 조용히 초기화하지 않고 `invalid`를 생성합니다. 성공한 마이그레이션은 새 버전을 한 번 저장합니다. 이 문서는 일반적인 호스트 측 JSON이며 자격 증명 보관소가 아닙니다. 설정 RPC는 플러그인 실행에 사용되는 기존 `daemon.manage` 권한을 사용합니다.

즉시 적용 제어 항목, 검증 기능이 있는 초안 편집기, 사용자 지정 콘텐츠, Command Center 탐색은 전체 [설정 예제](https://github.com/getpaseo/paseo/tree/main/plugin-examples/settings)를 확인하세요.

## 작업공간 패널

작업공간 또는 에이전트 컨텍스트의 패널을 등록하세요.

`client/review.tsx`:

```tsx
import { type PluginAgentPanelProps, useAgent, useWorkspace } from "@getpaseo/plugin/client";
import { useMemo } from "react";
import { Text, View } from "react-native";

export function ReviewPanel({ theme, layout, workspaceId, agentId }: PluginAgentPanelProps) {
  const workspaceName = useWorkspace(workspaceId, (workspace) => workspace.name);
  const agent = useAgent(agentId, ({ id, title }) => ({ id, title }));
  const styles = useMemo(
    () => ({
      screen: {
        flex: 1,
        padding: layout.compact ? 16 : 24,
        backgroundColor: theme.colors.surface0,
      },
      title: { color: theme.colors.foreground },
      detail: { color: theme.colors.foregroundMuted },
    }),
    [theme, layout.compact],
  );
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{workspaceName}</Text>
      <Text style={styles.detail}>{agent?.title ?? agent?.id}</Text>
    </View>
  );
}
```

`index.client.tsx`:

```ts
import type { PluginClientContext } from "@getpaseo/plugin/client";
import { ReviewPanel } from "./client/review";

export default function contribute(client: PluginClientContext) {
  client.addWorkspacePanel({
    id: "review",
    title: "Review",
    icon: "Scan",
    context: "agent",
    locations: ["workspace", "explorer"],
    Component: ReviewPanel,
  });
  return () => {};
}
```

`addWorkspacePanel` 필드:

| 필드 | 필수 | 의미 |
| ----------- | -------- | ------------------------------------------------------------- |
| `id` | 예 | 플러그인 로컬 패널 ID. |
| `title` | 예 | 작업공간 탭 제목. |
| `icon` | 예 | Lucide 아이콘 이름. |
| `context` | 예 | `workspace` 또는 `agent`. |
| `locations` | 아니요 | `workspace`, `explorer` 또는 둘 다. 기본값은 `workspace`입니다. |
| `Component` | 예 | 선택한 컨텍스트의 props에 맞는 React Native 구성 요소. |

작업공간 패널은 `PluginWorkspacePanelProps`를 전달받습니다. 여기에는 `context: "workspace"`, `theme`, `host`, `layout`, `workspaceId`가 있습니다. 에이전트 패널은 `PluginAgentPanelProps`를 전달받습니다. 여기에는 `context: "agent"`와 동일한 공통 필드 및 `workspaceId`에 더해 `agentId`가 있습니다.

`useWorkspace(workspaceId, selector)`와 `useAgent(agentId, selector)`로 캐시된 상태를 읽으세요. 선택자는 필수입니다. Paseo는 결과를 얕게 비교하므로, `{ name, status }`를 선택하면 관련 없는 필드가 바뀌어도 다시 렌더링하지 않습니다. 구성 요소가 렌더링하는 모든 필드를 한 번의 호출로 선택하세요. 전체 스냅샷을 선택하지 마세요.

두 훅 모두 레코드를 사용할 수 없으면 `null`을 반환합니다. 그 외에는 정규화된 클라이언트 상태를 대상으로 동기적으로 실행됩니다. 스냅샷 DTO와 그 안에 중첩된 값은 모두 읽기 전용이며 런타임에 동결됩니다. 현재 작업공간이나 에이전트를 알아내기 위해 플러그인 RPC를 호출하지 마세요. 선택적 정보나 공급업체별 보충 정보는 구성 요소를 렌더링한 뒤 가져오세요.

작업공간 스냅샷 필드:

| 필드 | 타입 |
| -------------------- | ----------------------------------------------------------------- |
| `id` | `string` |
| `projectId` | `string` |
| `projectDisplayName` | `string` |
| `projectRootPath` | `string` |
| `directory` | `string` |
| `projectKind` | `"git" \| "non_git" \| "directory"` |
| `kind` | `"directory" \| "local_checkout" \| "checkout" \| "worktree"` |
| `name` | `string` |
| `title` | `string \| null` |
| `status` | `"needs_input" \| "failed" \| "running" \| "attention" \| "done"` |
| `statusEnteredAt` | ISO 타임스탬프 또는 `null` |
| `archivingAt` | ISO 타임스탬프 또는 `null` |
| `diffStat` | `{ additions: number; deletions: number } \| null` |

에이전트 스냅샷 필드:

| 필드 | 타입 |
| ------------------- | -------------------------------------------------------------- |
| `id` | `string` |
| `workspaceId` | `string` |
| `provider` | `string` |
| `status` | `"initializing" \| "idle" \| "running" \| "error" \| "closed"` |
| `createdAt` | ISO 타임스탬프 |
| `updatedAt` | ISO 타임스탬프 |
| `lastActivityAt` | ISO 타임스탬프 |
| `title` | `string \| null` |
| `cwd` | `string` |
| `model` | `string \| null` |
| `currentModeId` | `string \| null` |
| `thinkingOptionId` | `string \| null` |
| `requiresAttention` | `boolean` |
| `attentionReason` | `"finished" \| "error" \| "permission" \| null` |
| `parentAgentId` | `string \| null` |
| `labels` | `Record<string, string>` |

Paseo는 탭 포커스, 분할, 닫기, 유지, 쿼리 상태, API/RPC 제공자, 렌더링 오류 경계를 관리합니다. 복원된 탭의 플러그인, 패널, 컨텍스트, 작업공간 또는 에이전트를 사용할 수 없으면 작업공간이 충돌하는 대신 사용 불가 메시지와 함께 탭이 열린 상태로 유지됩니다.

## Command Center 항목

macOS에서는 **⌘K**, Windows와 Linux에서는 **Ctrl+K**로 Command Center를 연 다음 항목 제목을 검색하세요.

작업을 등록하고 콜백에서 패널을 여세요.

```tsx
import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

const refreshReview = defineRpc({
  name: "review.refresh",
  input: z.object({ agentId: z.string(), scope: z.string().optional() }),
  output: z.object({ refreshed: z.boolean() }),
});

client.addCommandCenterItem({
  id: "open-review",
  title: "Open review",
  icon: "Scan",
  keywords: ["inspect"],
  context: "agent",
  async onSelect({ paseo, rpc, workspace, agent, openPanel }) {
    await paseo.workspaces.ref(workspace.id).setTitle(`Review ${agent.id}`);
    await rpc(refreshReview, { agentId: agent.id });
    openPanel("review");
  },
});
```

`addCommandCenterItem` 필드:

| 필드 | 필수 | 의미 |
| ---------- | -------- | ---------------------------------------------- |
| `id` | 예 | 플러그인 로컬 항목 ID. |
| `title` | 예 | 검색 결과 제목. |
| `icon` | 예 | Lucide 아이콘 이름. |
| `keywords` | 아니요 | 추가 Command Center 검색어. |
| `context` | 예 | `global`, `workspace` 또는 `agent`. |
| `onSelect` | 예 | 해당 컨텍스트의 클라이언트 측 콜백. |

전역 항목은 설치본의 선택된 호스트에 표시됩니다. 작업공간 항목은 해당 호스트에 캐시된 활성 작업공간이 있을 때만 표시됩니다. 에이전트 항목은 포커스된 작업공간 탭이 에이전트이거나 에이전트 컨텍스트의 플러그인 패널이고, 그 캐시된 레코드가 해당 작업공간에 속할 때만 표시됩니다. 컨텍스트가 없으면 이를 찾기 위해 플러그인을 호출하지 않고 항목을 제거합니다.

모든 콜백은 다음 값을 전달받습니다.

| 필드 | 컨텍스트 | 의미 |
| ------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `context` | 전체 | 해당 컨텍스트를 구분하는 값. |
| `paseo` | 전체 | 선택한 호스트의 기존 `PaseoApi`. |
| `rpc(contract, input)` | 전체 | 이 설치본의 데몬 측 플러그인 핸들러를 호출하는 타입 지정 함수. |
| `openSurface(id)` | 전체 | 이 플러그인이 등록한 전역 표면 중 하나를 엽니다. |
| `workspace` | 작업공간 및 에이전트 | 동기적 작업공간 스냅샷. |
| `agent` | 에이전트 | 해당 에이전트의 동기적 스냅샷. |
| `openPanel(id, options?)` | 작업공간 및 에이전트 | 콜백의 현재 컨텍스트에서 등록된 패널을 엽니다. Explorer를 대상으로 하려면 `{ location: "explorer" }`를 전달하세요. |

에이전트 콜백은 에이전트 패널이나 작업공간 패널을 열 수 있습니다. 작업공간 콜백은 작업공간 패널만 열 수 있습니다. 알 수 없는 표면 및 패널 ID는 사용자에게 보이는 오류로 실패합니다. 일반 작업공간, 에이전트, 제공자, 데몬 설정 작업에는 `paseo`를 사용하세요. 플러그인별 파일 시스템, 자격 증명, 공급업체 또는 데몬 로컬 작업에는 `rpc`를 사용하세요.

## 슬래시 명령

사용자가 메시지 작성기에서 `/name args`를 제출하면 Paseo 클라이언트에서 실행되는 명령을 등록하세요. 이 텍스트는 에이전트에 전송되지 않습니다.

```ts
client.addSlashCommand({
  name: "review",
  description: "Run the review bot",
  argumentHint: "[scope]",
  context: "agent",
  async onSubmit({ args, agent, rpc, openPanel }) {
    await rpc(refreshReview, { agentId: agent.id, scope: args });
    openPanel("review");
  },
});
```

| 필드 | 필수 | 의미 |
| -------------- | -------- | ---------------------------------------------- |
| `name` | 예 | 앞의 슬래시를 제외한 명령 이름. |
| `description` | 예 | 작성기 자동 완성 설명. |
| `argumentHint` | 예 | 명령 이름 뒤에 표시되는 짧은 사용법 힌트. |
| `context` | 예 | `"workspace"` 또는 `"agent"`. |
| `onSubmit` | 예 | 해당 컨텍스트의 클라이언트 콜백. |

`onSubmit`은 해당 Command Center 콜백 컨텍스트와 함께 `args`를 전달받습니다. `/review src`의 경우 `args`는 `"src"`입니다. Paseo는 명령 뒤에 남은 문자열의 앞뒤 공백만 제거하며 파싱은 플러그인에 맡깁니다. Paseo는 자동 완성 행, 입력 지우기, 오류 토스트를 관리합니다. `onSubmit`을 기다리거나 대기 상태를 표시하지는 않습니다. 이를 표시하려면 작성기 필이나 패널을 사용하세요.

우선순위는 기본 클라이언트 명령, 플러그인 명령, 제공자 명령 순입니다. 이름이 충돌하면 우선순위가 낮은 명령을 제외합니다. 기본 별칭도 이름을 예약합니다. 플러그인 간에 충돌하면 일정한 카탈로그 순서에서 먼저 나오는 플러그인이 우선합니다. 작성기에 첨부 파일이 있으면 명령이 실행되지 않습니다.

## 헤더 버튼

작업, 메뉴, 사용자 지정 아이콘과 콘텐츠, 헤더와 작성기의 표시 여부 업데이트는 [버튼 예제](https://github.com/getpaseo/paseo/tree/main/plugin-examples/buttons)에서 확인하세요. 이 예제는 헤더 버튼 하나를 여러 모드 사이에서 전환하며 추가 작업에는 이름이 지정된 Tools 메뉴를 사용합니다.

`client.addHeaderButton({ id, workspaceId, button })`은 작업공간 헤더 오른쪽에서 기본 제공 작업 앞에 버튼 하나를 추가합니다. `update(patch)`와 `remove()`가 있는 등록을 반환합니다.

```tsx
const review = client.addHeaderButton({
  id: "review",
  workspaceId,
  button: {
    title: "Open review",
    icon: "Scan",
    label: "Review",
    behavior: {
      kind: "action",
      onPress() {
        client.openPanel("review", { workspaceId });
      },
    },
  },
});

review.update({ label: "Review · 3" });
review.update({ visible: false });
review.update({ visible: true });
review.remove();
```

아이콘만 있는 헤더 버튼에는 `label`을 생략하세요. 넓은 레이아웃에서는 메뉴와 팝오버에 갈매기표가 표시됩니다. 컴팩트 헤더 버튼은 레이블이나 갈매기표 없이 아이콘을 사용합니다. Paseo는 공간을 초과한 기여를 공유 오버플로 메뉴로 옮깁니다. 배치와 오버플로는 호스트가 결정합니다.

## 작성기 필

`client.addComposerPill({ id, workspaceId, agentId, button })`은 같은 [버튼 설명자](#button-descriptor)를 사용하며 같은 등록을 반환합니다. 특정 에이전트의 작성기 트랙에서 Tasks 및 Subagents 옆을 대상으로 합니다. 작성기 필은 항상 아이콘과 `label`을 표시하며, `label`을 생략하면 `title`을 표시합니다. 메뉴와 팝오버를 포함해 갈매기표는 표시하지 않습니다.

```tsx
const pill = client.addComposerPill({
  id: "review",
  workspaceId,
  agentId,
  button: {
    title: "Open review",
    icon: "Scan",
    label: "Review",
    behavior: {
      kind: "action",
      onPress() {
        client.openPanel("review", { workspaceId, agentId });
      },
    },
  },
});
```

## 버튼 설명자

다음 계약은 `@getpaseo/plugin/client`에서 내보냅니다.

| 필드 | 필수 | 의미 |
| ---------- | -------- | ----------------------------------------------------------------------- |
| `title` | 예 | 비어 있지 않은 접근성 레이블, 툴팁, 시트 제목입니다. |
| `icon` | 예 | Lucide 이름 또는 `ComponentType<PluginButtonIconProps>`입니다. |
| `label` | 아니요 | 비어 있지 않은 표시 텍스트입니다. 배치의 기본값을 사용하려면 생략하세요. |
| `visible` | 아니요 | 기본값은 `true`입니다. false이면 트리거와 레이아웃 공간을 제거합니다. |
| `disabled` | 아니요 | 기본값은 `false`입니다. 버튼을 표시하되 상호 작용을 막습니다. |
| `behavior` | 예 | 아래 세 가지 형태 중 하나입니다. |

```tsx
type PluginButtonBehavior =
  | { kind: "action"; onPress(): void | Promise<void> }
  | { kind: "menu"; items: readonly PluginButtonMenuEntry[] }
  | { kind: "popover"; Content: React.ComponentType<PluginButtonContentProps> };
```

작업은 클라이언트에서 실행됩니다. Paseo는 프로미스가 완료될 때까지 버튼을 사용 중으로 표시하고 반복해서 누르지 못하게 하며 실패를 토스트로 보여줍니다. 실패한 작업은 다시 시도할 수 있습니다. 일반 작업에는 클라이언트의 `paseo`를, 플러그인 전용 백엔드 작업에는 `rpc`를 사용하세요.

메뉴와 팝오버는 넓은 레이아웃에서 고정된 표면으로, 컴팩트 레이아웃에서 하단 시트로 열립니다. 트리거 전체가 표면을 열며 분할 버튼 동작은 없습니다.

### 메뉴 항목

메뉴에는 항목과 구분선이 들어갑니다. ID는 소문자, 숫자, 하이픈을 사용하고 문자로 시작하며 해당 메뉴 안에서 고유해야 합니다.

```tsx
const behavior: PluginButtonBehavior = {
  kind: "menu",
  items: [
    {
      kind: "item",
      id: "refresh",
      title: "Refresh review",
      icon: "RefreshCw",
      behavior: { kind: "action", onPress: refreshReview },
    },
    { kind: "separator", id: "details-divider" },
    {
      kind: "item",
      id: "details",
      title: "Review details",
      behavior: { kind: "popover", Content: ReviewDetails },
    },
  ],
};
```

항목에는 `kind: "item"`, `id`, `title`, `behavior`가 필요합니다. 선택적 `icon`, `visible`, `disabled`는 버튼 규칙을 따릅니다. 구분선에는 `kind: "separator"`와 `id`만 포함됩니다. Paseo는 숨겨진 항목을 필터링한 뒤 앞쪽, 뒤쪽, 연속된 구분선을 제거합니다.

항목은 세 가지 동작을 모두 사용할 수 있습니다. 중첩 메뉴는 넓은 레이아웃에서 플라이아웃으로 열리고 컴팩트 시트에서는 같은 시트 안에서 뒤로 탐색할 수 있는 페이지로 열립니다. 사용자 지정 콘텐츠 페이지는 선택할 때만 열리며 마우스를 올려서는 열리지 않습니다. 작업을 선택하면 메뉴가 닫히고, 다른 페이지를 열면 메뉴가 열린 상태로 유지됩니다.

### 사용자 지정 아이콘과 팝오버 콘텐츠

`PluginButtonIconProps`에는 `theme`, `host`, `layout`, `size`, `color`, 대상 컨텍스트가 포함됩니다. 제공된 크기 안에서 React Native 아이콘이나 표시기를 렌더링하세요. Paseo는 아이콘 슬롯의 경계를 제한하고 모든 포인터 상호 작용을 소유합니다. 아이콘 구성 요소는 플러그인 훅을 사용할 수 있습니다.

`PluginButtonContentProps`에는 `theme`, `host`, `layout`, 대상 컨텍스트, `close()`가 포함됩니다. 본문만 렌더링하세요. Paseo는 고정 위치, 스크롤, 패딩, 시트 표시를 소유합니다. 콘텐츠는 `usePaseo`, `useRpc`, `useWorkspace`, `useAgent`와 설치본의 React Query 캐시를 사용할 수 있습니다.

대상 컨텍스트는 다음 중 하나입니다.

```ts
{ context: "workspace", workspaceId: string } // Header button
{ context: "agent", workspaceId: string, agentId: string } // Composer pill
```

### 업데이트와 수명 주기

각 등록은 하나의 플러그인 설치본, 배치, 작업공간, 필의 경우 에이전트에 속합니다. `id`는 해당 대상 안에서 플러그인 로컬 값이며 메뉴 ID와 같은 형식을 사용합니다. 같은 ID를 서로 다른 대상이나 배치에서 사용할 수 있습니다. 같은 대상에 중복 등록하면 오류가 발생합니다.

`update(patch: Partial<PluginButton>)`는 설명자를 제자리에서 변경해 ID와 순서를 유지합니다. `behavior`를 변경할 때는 완전한 새 동작 객체를 제공하세요. 유효하지 않은 업데이트는 기존 버튼을 변경하지 않고 오류를 발생시킵니다. 자체 모델 또는 클라이언트 API를 구독하고 `update`를 호출해 반응형 변경을 게시하세요. 원래 설명자를 변경해도 UI는 업데이트되지 않습니다.

버튼을 숨기거나 비활성화하면 표면이 닫힙니다. 동작을 업데이트해도 표면이 닫힙니다. 숨겨도 등록은 유지되므로 다시 표시하면 원래 위치로 돌아갑니다. 이미 진행 중인 작업은 취소하지 않습니다.

`remove()`는 멱등성을 갖습니다. 제거 후 업데이트는 아무 동작도 하지 않습니다. Paseo는 플러그인 설치본이나 호스트 연결이 정리될 때 남아 있는 버튼을 제거합니다. 구독, 타이머, 기타 리소스의 정리 함수는 클라이언트 진입점에서 반환하세요.

## Paseo SDK 사용

표면에서 일반 Paseo 작업을 수행하려면 `usePaseo()`를 사용하세요. 선택한 호스트의 기존 연결을 빌려 쓰므로 클라이언트를 새로 만들지 마세요.

```tsx
import { type PluginSurfaceProps, usePaseo } from "@getpaseo/plugin/client";
import { Pressable, Text } from "react-native";

function PullRequestAction({ theme }: PluginSurfaceProps) {
  const paseo = usePaseo();

  async function createReviewWorkspace() {
    const workspace = await paseo.workspaces.create({
      title: "Review PR 42",
      source: {
        kind: "worktree",
        cwd: "/absolute/path/to/repository",
        action: "checkout",
        checkoutSource: { kind: "change_request", forge: "github", number: 42 },
      },
    });
    await workspace.agents.create({
      config: { provider: "codex/gpt-5.5" },
      prompt: "Review PR #42.",
    });
  }

  return (
    <Pressable accessibilityRole="button" onPress={() => void createReviewWorkspace()}>
      <Text style={{ color: theme.colors.foreground }}>Create review workspace</Text>
    </Pressable>
  );
}
```

반환되는 API는 프로젝트, 작업공간, 에이전트, 터미널, 공급자, 데몬 설정을 다룹니다. 메서드는 [SDK API 참조](/docs/sdk/reference)를 확인하세요. Paseo가 연결을 관리하므로 연결 수명 주기 메서드는 의도적으로 제외되어 있습니다.

## 플러그인 전용 백엔드 동작 추가

플러그인 RPC는 공급업체 API 읽기, 데몬 로컬 리소스 접근, 자격 증명을 클라이언트에 두지 않도록 처리하는 작업 등 일반 Paseo 작업에 해당하지 않는 경우에만 사용하세요.

Zod로 계약 하나를 정의하고, 하위 프로세스에서 처리한 뒤 표면에서 호출하세요.

`shared/greeting.ts`:

```ts
import { defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const greeting = defineRpc({
  name: "greeting.create",
  input: z.object({ name: z.string() }),
  output: z.object({ message: z.string() }),
});
```

`client/greeting.tsx`:

```tsx
import { useRpc } from "@getpaseo/plugin/client";
import { greeting } from "../shared/greeting";

export function GreetingButton() {
  const createGreeting = useRpc(greeting);
  // Call createGreeting({ name: "Ada" }) from an event or query.
  return null;
}
```

`server/greeting.ts`:

```ts
import type { RpcInput } from "@getpaseo/plugin";
import { greeting } from "../shared/greeting";

export function createGreeting({ name }: RpcInput<typeof greeting>) {
  return { message: `Hello, ${name}` };
}
```

`index.client.tsx`:

```ts
import type { PluginClientContext } from "@getpaseo/plugin/client";
import { GreetingButton } from "./client/greeting";

export default function contribute(client: PluginClientContext) {
  client.addSurface("main", GreetingButton);
  return () => {};
}
```

`index.server.ts`:

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { createGreeting } from "./server/greeting";
import { greeting } from "./shared/greeting";

export default function contribute(server: PluginServerContext) {
  server.handle(greeting, createGreeting);
  return () => {};
}
```

입력과 출력은 양쪽 모두에서 검증됩니다. RPC 이름은 소문자로 시작하며 소문자, 숫자, 점, 하이픈 또는 밑줄로 구성됩니다. `useRpc()`는 타입이 지정된 비동기 함수를 반환합니다. 요청 상태, 캐싱, 변경 작업에는 TanStack Query를 사용하세요.

백엔드 핸들러는 동일한 `PaseoApi`를 `{ paseo }` 형태로 전달받습니다. 이 연결은 하위 프로세스에 속하며 플러그인이 중지되면 닫힙니다. 플러그인 코드가 구독하기 전에는 타임라인이나 카탈로그 이벤트를 구독하지 않습니다. 정리와 타임라인 교체는 [SDK 이벤트 계약](../../sdk/events.md)을 따르세요. 백엔드 코드는 Node API와 플러그인 디렉토리에 설치된 종속성을 사용할 수 있습니다.

## 백엔드 출력 디버깅

백엔드 기여는 일반 Node 로깅으로 stdout과 stderr에 출력할 수 있습니다.

```ts
console.log("Refreshing issues");
console.error("Issue refresh failed", error);
```

Paseo는 플러그인의 로드 시작, 준비 완료, 중지 시작, 중지 완료 시 `[paseo]` 항목을 추가합니다. 플러그인 하위 프로세스가 시작되기 전에 발생한 실패를 포함해 컴파일 및 로드 실패를 stderr 항목으로 기록합니다. 또한 초기화, RPC 핸들러, 정리, 프로세스 실패 중에 발생한 출력도 수집합니다. 프로토콜 트래픽은 별도의 채널을 사용하므로 `console.log()`가 플러그인 RPC를 손상시킬 수 없습니다.

플러그인의 **Settings → Plugins → Logs**를 열거나 데몬 CLI에서 동일한 최근 로그를 확인하세요.

```bash
paseo plugin logs my-plugin
paseo plugin logs my-plugin --json
paseo --host <url> plugin logs my-plugin
```

이 명령은 실시간 출력을 계속 따라가지 않고 스냅샷을 반환합니다. 더 최신 항목을 보려면 설정 화면을 새로 고치거나 명령을 다시 실행하세요. 각 항목에는 타임스탬프, stdout 또는 stderr 스트림, 순서, 메시지가 포함됩니다.

Paseo는 플러그인별로 최대 500개 항목, 256 KiB를 메모리에 보관합니다. 개별 행은 16 KiB로 제한됩니다. 다시 로드, 비활성화, 컴파일 실패, 초기화 실패, 프로세스 실패가 발생해도 최근 로그는 유지됩니다. 플러그인을 제거하면 로그가 지워지며, 데몬을 다시 시작하면 새로 기록을 시작합니다. 구조화된 사본은 `$PASEO_HOME/daemon.log`의 데몬 로그에도 기록됩니다.

데몬 측 출력만 수집합니다. 클라이언트 표면의 로그는 앱 런타임에 남습니다. 자격 증명, 액세스 토큰 또는 다른 비밀 정보를 로그에 기록하지 마세요. 연결된 사용자가 보관된 최근 로그를 읽을 수 있으며, 데몬 로그에도 해당 내용이 영구 저장됩니다.

## 작성기 첨부 소스 추가

첨부 소스는 외부 리소스를 검색하고 에이전트 프롬프트에 사용할 안정적인 텍스트 스냅샷을 반환합니다. 자격 증명과 공급업체 호출은 백엔드 핸들러에 두세요.

`shared/issues.ts`:

```ts
import { defineAttachmentSource, defineRpc } from "@getpaseo/plugin";
import { z } from "zod";

export const searchIssues = defineRpc({
  name: "issues.search",
  input: z.object({ query: z.string() }),
  output: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        identifier: z.string(),
        title: z.string(),
        subtitle: z.string().optional(),
        url: z.string().url(),
        text: z.string(),
        resourceType: z.string(),
      }),
    ),
  }),
});

export const issues = defineAttachmentSource({
  id: "issues",
  title: "Acme issue",
  icon: "CircleDot",
  pickerTitle: "Attach Acme issue",
  searchPlaceholder: "Search by identifier or title",
  search: searchIssues,
});
```

`server/issues.ts`:

```ts
import type { RpcInput } from "@getpaseo/plugin";
import { searchIssues } from "../shared/issues";

export function search({ query }: RpcInput<typeof searchIssues>) {
  return searchAcmeIssues(query);
}
```

`index.client.tsx`:

```ts
import type { PluginClientContext } from "@getpaseo/plugin/client";
import { issues } from "./shared/issues";

export default function contribute(client: PluginClientContext) {
  client.addAttachmentSource(issues);
  return () => {};
}
```

`index.server.ts`:

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { search } from "./server/issues";
import { searchIssues } from "./shared/issues";

export default function contribute(server: PluginServerContext) {
  server.handle(searchIssues, search);
  return () => {};
}
```

Paseo는 작성기 메뉴, 검색 선택기, 선택된 필, 초안 상태, 제출을 관리합니다. `text` 값은 에이전트에 전송되는 전체 스냅샷입니다.

## 호스트와 수명 주기

플러그인은 데몬별로 설치됩니다. 연결된 여러 호스트에 같은 기여가 있으면 Paseo는 사이드바 항목 하나를 표시하고 호스트 선택기를 추가합니다. 선택한 호스트가 번들, Paseo API, RPC 전송, 쿼리 캐시를 제공합니다. 선택한 호스트가 오프라인이어도 호출이 다른 호스트로 넘어가지 않습니다.

첨부 소스의 범위는 각 작성기의 호스트로 제한됩니다.

작업공간 패널과 Command Center 항목의 범위는 활성 호스트와 정확히 일치하는 캐시된 컨텍스트로 제한됩니다. 다시 로드하면 등록이 교체됩니다. 비활성화, 제거, 호스트 연결 해제, 평가 실패가 발생하면 Command Center 항목이 제거되고 설치본의 쿼리 상태가 지워집니다. 이미 복원된 패널 탭은 해당 기여가 다시 제공되거나 사용자가 닫을 때까지 사용 불가 상태로 남습니다. 패널 렌더링 실패는 플러그인 오류 경계 안에서 처리됩니다.

## CLI 참조

```bash
paseo plugin init /absolute/path/to/plugin
paseo plugin install /absolute/path/to/plugin
paseo plugin install /absolute/path/to/plugin --id another-runtime-id
paseo plugin add owner/repository
paseo plugin add https://git.example.com/owner/repository.git --ref main
paseo plugin add owner/monorepo:plugins/review
paseo plugin ls [id]
paseo plugin update <id>
paseo plugin update --all
paseo plugin reload my-plugin
paseo plugin logs my-plugin
paseo plugin disable my-plugin
paseo plugin enable my-plugin
paseo plugin remove my-plugin
```

`ls`는 원격에 연결하지 않고 런타임 상태, 소스 세부정보, 설치된 커밋을 보고합니다. Paseo가 추적 중인 Git 원격에 연결하여 사용 가능한 업데이트를 설치하게 하려면 `update`를 사용하세요.

대상이 CLI의 기본 데몬이 아니라면 관리 명령 앞에 `--host <url>`을 넣으세요. `remove`는 디렉토리 소스를 삭제하지 않으며, Git 소스의 경우 관리형 체크아웃을 삭제합니다. 설치 시 지정하는 `--id`는 런타임 ID이며, 같은 디렉토리나 저장소를 여러 번 설치할 수 있게 합니다.

> **추가하는 모든 플러그인을 신뢰할 수 있어야 합니다.** `paseo plugin add`와 `paseo plugin install`은 “이 코드베이스를 신뢰한다”는 뜻입니다. 서버 코드와 Git 준비 명령은 데몬 호스트에서 데몬 사용자의 접근 권한으로 샌드박스 없이 실행되며, 클라이언트 기여는 Paseo 내부에서 실행됩니다. 종속성과 향후 업데이트도 이 판단에 포함됩니다. 전역 `--host` 옵션을 사용하면 명령은 원격 데몬 호스트에서 실행됩니다.

기존 디렉토리는 `owner/repository` GitHub 축약 표기보다 우선합니다. 플러그인이 저장소 루트 아래에 있으면 `:relative/path`를 덧붙이세요. 기본 브랜치를 추적하려면 `--ref`를 생략하세요. 명시한 브랜치는 업데이트를 추적하며, 태그와 커밋은 고정된 상태로 유지됩니다.

대부분의 플러그인은 `build`를 생략해야 합니다. 준비 중인 체크아웃에서 Paseo가 제공하지 않는 종속성을 설치하거나, 소스 또는 자산을 생성하거나, 다른 필수 준비 단계를 수행해야 할 때만 사용하세요.

```json
{
  "id": "review",
  "requirements": { "paseo": ">=0.8.0" },
  "build": [
    ["npm", "ci"],
    ["npm", "run", "build"]
  ]
}
```

`build`는 비어 있지 않은 argv 배열의 목록입니다. Paseo는 정확한 커밋과 매니페스트를 확인한 뒤 준비 중인 플러그인 디렉토리에서 셸 없이 각 실행 파일을 직접 실행합니다. 잠금 파일에서 패키지 관리자나 명령을 추론하지 않습니다. 설치와 업데이트 모두 검증, 컴파일, 활성화 또는 교체 전에 `build`를 실행합니다. 명령이 실패하면 출력을 보고하고 후보 버전을 폐기하며, 설치되어 실행 중인 버전은 그대로 유지합니다. 데몬 로그에는 각 명령과 출력이 기록됩니다. 전역 `--host` 옵션을 사용하면 해당 데몬 호스트에서 실행됩니다.

설치하거나 다시 로드하기 전에 `npm run typecheck`를 실행하세요. 플러그인 소스 항목은 CLI 또는 설정에서 관리하세요.

데몬 전체에 적용되는 **Enable plugins** 스위치는 **Settings → Plugins**에 있습니다. 이 스위치와 플러그인 자체의 활성화 상태가 모두 켜지기 전까지 설정된 플러그인은 `disabled` 상태로 유지됩니다.

이 스위치는 `config.json`의 루트 `pluginsEnabled` 필드입니다. 변경한 뒤 `paseo reload --json`을 실행하세요. 활성화하면 자체 `enabled` 값이 `false`가 아닌 모든 설정된 플러그인이 시작되며, 비활성화하면 모든 플러그인이 정리됩니다. 데몬을 다시 시작할 필요는 없습니다. 플러그인 소스 항목을 수동으로 수정한 내용은 다시 로드되지 않으므로, 해당 변경에는 플러그인 수명 주기 명령을 사용하세요.

## 로드 실패

`paseo plugin ls`로 현재 상태와 오류를 확인하세요.

| 증상 | 확인 사항 |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `This plugin was made for an older version of Paseo` | 디렉토리에 `index.ts` 진입점만 있습니다. [마이그레이션 가이드](/docs/plugins/v0.8/migration)를 따르세요. |
| `Plugin entry points are missing` | `index.client.tsx`와 `index.server.ts` 중 정확히 해당 이름으로 존재하는 파일이 없습니다. |
| `server-only module cannot be imported into the plugin client bundle` | 클라이언트 코드가 `server/`를 가져옵니다. 해당 작업을 RPC 뒤로 옮기고 계약을 `shared/`에서 가져오세요. |
| `client-only module cannot be imported into the plugin server bundle` | 서버 코드가 `client/`를 가져옵니다. 해당 기여를 `index.client.tsx`에서 등록하세요. |
| `Node module cannot be imported into the plugin client bundle` | 클라이언트 코드가 `node:*`를 가져옵니다. 작업을 `server/`로 옮기고 RPC를 통해 호출하세요. |
| 사이드바 항목이 없음 | 플러그인이 `running` 상태인지, 항목이 기존 표면을 참조하는지, 아이콘 이름이 유효한지, 클라이언트가 설치본의 호스트에 연결되어 있는지 확인하세요. |
| 클라이언트 모듈을 사용할 수 없음 | 위에 나열된 호스트 제공 클라이언트 모듈만 가져오세요. |
| RPC가 거부됨 | 양쪽 Zod 스키마와 데몬 측 핸들러 오류를 확인하세요. |
| 편집한 코드가 표시되지 않음 | `npm run typecheck`를 실행한 다음 `paseo plugin reload <id>`를 실행하세요. |
| 다시 로드 실패 | `paseo plugin ls`와 `paseo plugin logs <id>`를 확인하고 소스 오류를 수정한 다음 다시 로드하세요. Paseo는 이전 번들을 복원하지 않습니다. |
| 플러그인이 예기치 않게 종료됨 | `paseo plugin logs <id>`에서 보관된 초기화, 정리, stderr, 최종 충돌 출력을 확인하세요. |
