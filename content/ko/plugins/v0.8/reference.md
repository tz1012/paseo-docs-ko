---
title: Plugin reference
description: Local plugin files, client and server runtimes, platform limits, contributions, RPCs, lifecycle, hosts, and CLI commands.
nav: Reference
order: 47
category: Plugins
---

# 플러그인 참조

> **출시 예정인 Paseo v0.8용 문서입니다.** [v0.8 빠른 시작](/docs/plugins/v0.8)으로 돌아가세요.

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

필수 루트 매니페스트는 `paseo-plugin.json`입니다. 여기에는 기본 플러그인 ID가 들어 있습니다.

```json
{ "id": "my-plugin" }
```

| 진입점 | 런타임 | 전달받는 값 | 필수 조건 |
| ------------------ | --------------------- | --------------------- | ----------------------------------------------------------------- |
| `index.client.tsx` | Paseo 앱, 클라이언트별 실행 | `PluginClientContext` | 플러그인에 UI, 콜백, 테마 또는 첨부 소스가 있는 경우 |
| `index.server.ts` | 데몬 하위 프로세스 | `PluginServerContext` | 플러그인이 RPC를 처리하는 경우 |

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

Paseo는 각 번들을 해당 진입점에서 빌드합니다. `client/`를 데몬 번들로 가져오거나, `server/`를 앱 번들로 가져오거나, 앱 번들 어디에서든 `node:` 모듈을 가져오면 컴파일 오류가 발생합니다. `shared/`에는 Node 및 React Native 런타임 코드를 넣지 마세요.

### 클라이언트 런타임

Paseo는 클라이언트 코드에 다음 모듈을 제공합니다.

| 모듈 | 용도 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `@getpaseo/plugin` | 기여 계약, `defineRpc`, `defineAttachmentSource`, `RpcInput`, `RpcOutput`, 데이터 훅 |
| `@getpaseo/plugin/react-native` | Paseo UI 구성 요소와 UI 훅 |
| `@getpaseo/plugin/server` | `PluginHandlerContext` 같은 핸들러 전용 타입 |
| `@tanstack/react-query` | 요청 상태와 캐싱 |
| `react` | 구성 요소와 훅 |
| `react/jsx-runtime` | 컴파일된 JSX |
| `react-native` | 크로스 플랫폼 UI |
| `zod` | 공유 스키마 |

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

플러그인 스토리지 API는 없습니다. 브라우저 스토리지는 Paseo 클라이언트 간에 설정을 유지하지 않습니다. 범용 호스트 탐색 API도 없으므로 플러그인 코드에서 Paseo 네이티브 경로를 열 수 없습니다. Command Center 콜백은 같은 플러그인이 등록한 표면과 패널만 열 수 있습니다.

### 서버 런타임

Paseo는 서버 코드에 `@getpaseo/plugin`, `@getpaseo/plugin/server`, `zod`를 제공합니다. 백엔드 기여는 데몬 하위 프로세스에서 실행되며 Node를 통해 호스트 머신에 접근할 수 있습니다. 파일 시스템, 프로세스, 자격 증명 및 기타 머신 로컬 작업은 `server/` 아래에 두세요. `index.server.ts`가 없는 플러그인은 하위 프로세스를 시작하지 않습니다.

## 진입점과 정리

각 진입점은 기여 함수 하나를 기본으로 내보내고 정리 함수를 반환합니다. 클라이언트 진입점은 `PluginClientContext`를, 서버 진입점은 `PluginServerContext`를 전달받습니다. 모든 클라이언트 `add*`는 여러 번 호출해도 같은 결과를 내는 제거 함수를 반환합니다. 진입점의 정리 함수는 Paseo가 남아 있는 등록을 제거하기 전에 실행됩니다.

```ts
import type { PluginClientContext } from "@getpaseo/plugin";
import { Main } from "./client/main";

export default function contribute(client: PluginClientContext) {
  client.addSurface("main", Main);
  return () => {};
}
```

정리 함수는 비동기일 수 있습니다. 플러그인이 생성한 타이머, 감시자, 소켓 및 기타 리소스를 해제하세요. Paseo는 다시 로드, 비활성화, 제거, 연결 해제 또는 데몬 종료 시 등록을 제거하고, 표면을 마운트 해제하고, 대기 중인 RPC를 거부하고, 플러그인의 데몬 세션을 닫고, 하위 프로세스를 중지합니다.

## 표면과 사이드바 항목

구성 요소를 등록한 뒤 사이드바 항목이 해당 표면 ID를 가리키도록 설정하세요.

`client/main.tsx`:

```tsx
import type { PluginSurfaceProps } from "@getpaseo/plugin";
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
import type { PluginClientContext } from "@getpaseo/plugin";
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

클라이언트 코드에서 `@getpaseo/plugin/react-native`를 통해 Paseo가 제공하는 UI를 가져오세요. 다음 예제는 제어형 모달을 열고, 호스트 아이콘을 렌더링하고, 토스트로 작업 결과를 알립니다.

```tsx
import type { PluginSurfaceProps } from "@getpaseo/plugin";
import { Icon, Modal, useToast } from "@getpaseo/plugin/react-native";
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

| Prop | 타입 | 필수 | 동작 |
| ---------- | ----------- | -------- | --------------------------------------------- |
| `children` | `ReactNode` | 예 | 플러그인의 React Native UI 내용을 렌더링합니다. |

닫기 버튼, 배경 영역, 플랫폼의 뒤로 가기 동작, 웹의 Escape 키, 좁은 레이아웃의 시트 제스처로 모달을 닫을 수 있습니다. 닫기 동작은 `onOpenChange(false)`를 호출합니다. 플러그인이 `open`을 갱신해야 모달이 닫힙니다.

모달의 자식 요소는 플러그인 런타임 컨텍스트를 유지합니다. 그 안에서도 `usePaseo`, `useRpc`, `useWorkspace`, `useAgent`가 작동합니다.

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
import type { PluginClientContext, PluginTimelineItemProps } from "@getpaseo/plugin";
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
import type { PluginHandlerContext } from "@getpaseo/plugin";

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
import type { PluginClientContext } from "@getpaseo/plugin";

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

## 작업공간 패널

작업공간 또는 에이전트 컨텍스트의 패널을 등록하세요.

`client/review.tsx`:

```tsx
import { type PluginAgentPanelProps, useAgent, useWorkspace } from "@getpaseo/plugin";
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
import type { PluginClientContext } from "@getpaseo/plugin";
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
  input: z.object({ agentId: z.string() }),
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

## 작성기 필

클라이언트 진입점은 필의 생성과 제거를 관리합니다. 이 로직은 `index.client.tsx`에 직접 두거나 `client/`에서 가져오는 함수 안에 둘 수 있습니다.

```tsx
import {
  Icon,
  type PluginClientContext,
  type PluginComposerPillProps,
  useAgent,
} from "@getpaseo/plugin";
import { Text } from "react-native";

function ReviewPill({ theme, agentId }: PluginComposerPillProps) {
  const agent = useAgent(agentId, ({ title }) => ({ title }));
  return (
    <>
      <Icon name="Scan" size={14} color={theme.colors.foregroundMuted} />
      <Text numberOfLines={1} style={{ color: theme.colors.foregroundMuted, flexShrink: 1 }}>
        {agent?.title ?? "Review"}
      </Text>
    </>
  );
}

export default function contribute(client: PluginClientContext) {
  const pills = new Map<string, () => void>();
  const unsubscribe = client.paseo.agents.subscribe((update) => {
    if (update.kind !== "upsert" || !update.agent.workspaceId) return;
    const { id: agentId, workspaceId } = update.agent;
    pills.get(agentId)?.();
    pills.set(
      agentId,
      client.addComposerPill({
        id: "review",
        title: "Open review",
        workspaceId,
        agentId,
        Component: ReviewPill,
        async onPress() {
          await client.rpc(refreshReview, { agentId });
          client.openPanel("review", { workspaceId, agentId });
        },
      }),
    );
  });
  return () => {
    unsubscribe();
    for (const remove of pills.values()) remove();
  };
}
```

`addComposerPill` 필드:

| 필드 | 필수 | 의미 |
| ------------- | -------- | ---------------------------------------------------------- |
| `id` | 예 | 대상 에이전트 내의 플러그인 로컬 ID. |
| `title` | 예 | 접근성을 위한 버튼 레이블. |
| `workspaceId` | 예 | 필이 속하는 작성기 트랙의 작업공간. |
| `agentId` | 예 | 필이 속하는 작성기 트랙의 에이전트. |
| `Component` | 예 | 필의 아이콘과 텍스트를 렌더링하는 React Native 구성 요소. |
| `onPress` | 예 | 클라이언트 측 콜백. |

클라이언트 진입점은 연결된 각 앱에서 플러그인 설치본마다 한 번 실행됩니다. 이 컨텍스트는 `paseo`, 타입이 지정된 `rpc`, `openSurface`, 컨텍스트를 명시하는 `openPanel`, 모든 클라이언트 등록 기능을 제공합니다. `addComposerPill`은 여러 번 호출해도 같은 결과를 내는 제거 함수를 반환합니다. Paseo는 플러그인 설치본이나 호스트 연결이 정리될 때 남아 있는 필도 모두 제거합니다.

Paseo는 누를 수 있는 영역, 필의 공통 외형, 대기 상태, 오류 보고, 트랙 바 배치를 관리합니다. 구성 요소는 `theme`, `host`, `layout`, `workspaceId`, `agentId`를 전달받습니다. 현재 값은 `useWorkspace`와 `useAgent`로 읽으세요. 플러그인은 필의 표시 시점, 아이콘과 텍스트, 콜백을 관리합니다. `openPanel(id, { workspaceId, agentId? })`는 같은 플러그인이 등록한 패널을 열거나 해당 패널에 포커스를 맞춥니다.

## Paseo SDK 사용

표면에서 일반 Paseo 작업을 수행하려면 `usePaseo()`를 사용하세요. 선택한 호스트의 기존 연결을 빌려 쓰므로 클라이언트를 새로 만들지 마세요.

```tsx
import { usePaseo } from "@getpaseo/plugin";
import { Pressable, Text } from "react-native";

function PullRequestAction() {
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
      <Text>Create review workspace</Text>
    </Pressable>
  );
}
```

반환되는 API는 프로젝트, 작업공간, 에이전트, 제공자, 데몬 설정을 다룹니다. 메서드는 [SDK API 참조](/docs/sdk/reference)를 확인하세요. Paseo가 연결을 관리하므로 연결 수명 주기 메서드는 의도적으로 제외되어 있습니다.

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
import { useRpc } from "@getpaseo/plugin";
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
import type { PluginClientContext } from "@getpaseo/plugin";
import { GreetingButton } from "./client/greeting";

export default function contribute(client: PluginClientContext) {
  client.addSurface("main", GreetingButton);
  return () => {};
}
```

`index.server.ts`:

```ts
import type { PluginServerContext } from "@getpaseo/plugin";
import { createGreeting } from "./server/greeting";
import { greeting } from "./shared/greeting";

export default function contribute(server: PluginServerContext) {
  server.handle(greeting, createGreeting);
  return () => {};
}
```

입력과 출력은 양쪽 모두에서 검증됩니다. RPC 이름은 소문자로 시작하며 소문자, 숫자, 점, 하이픈 또는 밑줄로 구성됩니다. `useRpc()`는 타입이 지정된 비동기 함수를 반환합니다. 요청 상태, 캐싱, 변경 작업에는 TanStack Query를 사용하세요.

백엔드 핸들러는 동일한 `PaseoApi`를 `{ paseo }` 형태로 전달받습니다. 이 연결은 하위 프로세스에 속하며 플러그인이 중지되면 닫힙니다. 백엔드 코드는 Node API와 플러그인 디렉토리에 설치된 종속성을 사용할 수 있습니다.

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
import type { PluginClientContext } from "@getpaseo/plugin";
import { issues } from "./shared/issues";

export default function contribute(client: PluginClientContext) {
  client.addAttachmentSource(issues);
  return () => {};
}
```

`index.server.ts`:

```ts
import type { PluginServerContext } from "@getpaseo/plugin";
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
paseo plugin status [id]
paseo plugin update <id>
paseo plugin update --all
paseo plugin ls
paseo plugin reload my-plugin
paseo plugin logs my-plugin
paseo plugin disable my-plugin
paseo plugin enable my-plugin
paseo plugin remove my-plugin
```

대상이 CLI의 기본 데몬이 아니라면 관리 명령 앞에 `--host <url>`을 넣으세요. `remove`는 디렉토리 소스를 삭제하지 않으며, Git 소스의 경우 관리형 체크아웃을 삭제합니다. 설치 시 지정하는 `--id`는 런타임 ID이며, 같은 디렉토리나 저장소를 여러 번 설치할 수 있게 합니다.

> **추가하는 모든 플러그인을 신뢰할 수 있어야 합니다.** `paseo plugin add`와 `paseo plugin install`은 “이 코드베이스를 신뢰한다”는 뜻입니다. 서버 코드와 Git 준비 명령은 데몬 호스트에서 데몬 사용자의 접근 권한으로 샌드박스 없이 실행되며, 클라이언트 기여는 Paseo 내부에서 실행됩니다. 종속성과 향후 업데이트도 이 판단에 포함됩니다. 전역 `--host` 옵션을 사용하면 명령은 원격 데몬 호스트에서 실행됩니다.

기존 디렉토리는 `owner/repository` GitHub 축약 표기보다 우선합니다. 플러그인이 저장소 루트 아래에 있으면 `:relative/path`를 덧붙이세요. 기본 브랜치를 추적하려면 `--ref`를 생략하세요. 명시한 브랜치는 업데이트를 추적하며, 태그와 커밋은 고정된 상태로 유지됩니다.

대부분의 플러그인은 `build`를 생략해야 합니다. 준비 중인 체크아웃에서 Paseo가 제공하지 않는 종속성을 설치하거나, 소스 또는 자산을 생성하거나, 다른 필수 준비 단계를 수행해야 할 때만 사용하세요.

```json
{
  "id": "review",
  "build": [
    ["npm", "ci"],
    ["npm", "run", "build"]
  ]
}
```

`build`는 비어 있지 않은 argv 배열의 목록입니다. Paseo는 정확한 커밋과 매니페스트를 확인한 뒤 준비 중인 플러그인 디렉토리에서 셸 없이 각 실행 파일을 직접 실행합니다. 잠금 파일에서 패키지 관리자나 명령을 추론하지 않습니다. 설치와 업데이트 모두 검증, 컴파일, 활성화 또는 교체 전에 `build`를 실행합니다. 명령이 실패하면 출력을 보고하고 후보 버전을 폐기하며, 설치되어 실행 중인 버전은 그대로 유지합니다. 데몬 로그에는 각 명령과 출력이 기록됩니다. 전역 `--host` 옵션을 사용하면 해당 데몬 호스트에서 실행됩니다.

설치하거나 다시 로드하기 전에 `npm run typecheck`를 실행하세요. 데몬 설정을 직접 편집하지 마세요.

데몬 전체에 적용되는 **Enable plugins** 스위치는 **Settings → Plugins**에 있습니다. 이 스위치와 플러그인 자체의 활성화 상태가 모두 켜지기 전까지 설정된 플러그인은 `disabled` 상태로 유지됩니다.

이 스위치는 `config.json`의 루트 `pluginsEnabled` 필드입니다. 변경한 뒤 `paseo reload --json`을 실행하세요. 활성화하면 자체 `enabled` 값이 `false`가 아닌 모든 설정된 플러그인이 시작되며, 비활성화하면 모든 플러그인이 정리됩니다. 데몬을 다시 시작할 필요는 없습니다. 플러그인 소스 항목을 수동으로 수정한 내용은 다시 로드되지 않으므로, 해당 변경에는 플러그인 수명 주기 명령을 사용하세요.

## 로드 실패

`paseo plugin ls`로 현재 상태와 오류를 확인하세요.

| 증상 | 확인 사항 |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Plugin entry split is required` | 디렉토리에 `index.ts` 진입점만 있습니다. [마이그레이션 가이드](/docs/plugins/v0.8/migration)를 따르세요. |
| `Plugin entry points are missing` | `index.client.tsx`와 `index.server.ts` 중 정확히 해당 이름으로 존재하는 파일이 없습니다. |
| `server-only module cannot be imported into the plugin client bundle` | 클라이언트 코드가 `server/` 또는 `*.server.*` 파일을 가져옵니다. 해당 작업을 RPC 뒤로 옮기고 계약을 `shared/`에서 가져오세요. |
| `client-only module cannot be imported into the plugin server bundle` | 서버 코드가 `client/` 또는 `*.client.*` 파일을 가져옵니다. 해당 기여를 `index.client.tsx`에서 등록하세요. |
| `Node module cannot be imported into the plugin client bundle` | 클라이언트 코드가 `node:*`를 가져옵니다. 작업을 `server/`로 옮기고 RPC를 통해 호출하세요. |
| 사이드바 항목이 없음 | 플러그인이 `running` 상태인지, 항목이 기존 표면을 참조하는지, 아이콘 이름이 유효한지, 클라이언트가 설치본의 호스트에 연결되어 있는지 확인하세요. |
| 클라이언트 모듈을 사용할 수 없음 | 위에 나열된 호스트 제공 클라이언트 모듈만 가져오세요. |
| RPC가 거부됨 | 양쪽 Zod 스키마와 데몬 측 핸들러 오류를 확인하세요. |
| 편집한 코드가 표시되지 않음 | `npm run typecheck`를 실행한 다음 `paseo plugin reload <id>`를 실행하세요. |
| 다시 로드 실패 | `paseo plugin ls`와 `paseo plugin logs <id>`를 확인하고 소스 오류를 수정한 다음 다시 로드하세요. Paseo는 이전 번들을 복원하지 않습니다. |
| 플러그인이 예기치 않게 종료됨 | `paseo plugin logs <id>`에서 보관된 초기화, 정리, stderr, 최종 충돌 출력을 확인하세요. |
