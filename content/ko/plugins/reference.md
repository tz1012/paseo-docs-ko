---
title: Plugin reference
description: Local plugin files, client and server runtimes, platform limits, contributions, RPCs, lifecycle, hosts, and CLI commands.
nav: Reference
order: 46
category: Plugins
---

# 플러그인 참조

로컬 플러그인은 하나의 Paseo 데몬에 설치된 디렉토리 소스입니다. 플러그인은 다음 사항에 기여할 수 있습니다.

- Paseo 클라이언트의 React Native 표면과 사이드바 항목
- 작업공간 탭으로 열리는 작업공간 및 에이전트 패널
- Command Center의 전역, 작업공간 및 에이전트 작업
- Settings → Appearance의 어두운 테마
- 데몬 옆에서 실행되는 스키마 검증 RPC 핸들러
- TypeScript SDK를 통한 일반 Paseo 작업
- 메시지 작성기에서 검색할 수 있는 외부 리소스

플러그인 코드는 신뢰할 수 있으며 샌드박스 처리되지 않습니다. 클라이언트 표면은 Paseo 앱에서 실행됩니다. 백엔드 기여는 파일, 프로세스, 자격 증명 및 네트워크를 포함하여 데몬 머신에 대한 액세스 권한이 있는 하위 프로세스에서 실행됩니다.

## 프로젝트 파일

`paseo plugin init /absolute/path/to/my-plugin`이 생성합니다:

```text
my-plugin/
  paseo-plugin.json
  index.ts
  main.client.tsx
  paseo-plugin.d.ts
  package.json
  tsconfig.json
```

필수 루트 매니페스트는 `paseo-plugin.json`입니다. 여기에는 기본 플러그인 ID가 포함되어 있습니다.

```json
{ "id": "my-plugin" }
```

진입점은 플러그인 루트의 `index.ts`입니다. 플러그인, 표면, 사이드바 항목, 작업공간 패널, Command Center 항목 및 첨부 소스 ID는 소문자로 시작하고 소문자, 숫자 또는 하이픈을 포함합니다.

생성된 선언 파일은 로컬 유형 검사를 위한 `@getpaseo/plugin` 및 `@getpaseo/plugin/server` 유형을 제공합니다. Paseo는 런타임 모듈을 제공합니다. 플러그인 계약이 변경되면 일치하는 CLI를 사용하여 새 프로젝트를 다시 생성합니다.

플러그인이 성장함에 따라 런타임별 파일을 추가합니다.

```text
my-plugin/
  action.shared.ts
  action.server.ts
  panel.client.tsx
```

| 접미사 | 다음 용도로 사용 |
| -------------- | ------------------------------------------------------- |
| `*.client.tsx` | React, React Native, 후크, 스타일, 표면, 패널 및 콜백. |
| `*.server.ts` | 노드 API, 로컬 리소스, 자격 증명 및 RPC 처리기.           |
| `*.shared.ts` | 두 런타임 모두에서 가져온 Zod RPC 계약 및 일반 값입니다.        |

## 런타임 모듈

Paseo는 `index.ts`에서 클라이언트 번들과 서버 번들을 별도로 빌드합니다. `*.server` 파일에서 클라이언트 모듈로 가져오기와 `*.client` 파일에서 서버 모듈로 가져오기를 거부합니다. 공유 모듈에는 Node 및 React Native 런타임 코드를 넣지 마세요.

### 클라이언트 런타임

Paseo는 클라이언트 코드에 다음 모듈을 제공합니다.

| 모듈 | 용도 |
| ------------------------- | --------------------------------------- |
| `@getpaseo/plugin` | 호스트 UI 구성 요소, 후크 및 UI 유형 |
| `@getpaseo/plugin/server` | 공유 RPC 및 첨부 계약 |
| `@tanstack/react-query` | 요청 상태 및 캐싱 |
| `react` | 구성 요소 및 후크 |
| `react/jsx-runtime` | 컴파일된 JSX |
| `react-native` | 크로스 플랫폼 UI |
| `zod` | 공유 스키마 |

이 정확한 모듈 지정자는 호스트의 런타임 인스턴스를 사용합니다. 다른 호스트 모듈을 요청하는 클라이언트 번들은 `Module "<name>" is not available in plugin client code` 오류와 함께 실패합니다.

`lucide-react-native`, `react-native-svg` 또는 DOM 라이브러리를 가져오지 마세요. 기여의 `icon` 필드에는 [Lucide 아이콘 이름](https://lucide.dev/icons/)을 설정하세요. Paseo가 이름을 검증하고 아이콘을 렌더링합니다.

클라이언트 구성 요소는 Paseo가 렌더링하는 React Native 구성 요소입니다. 웹 클라이언트는 React Native Web을 통해 렌더링합니다. `localStorage` 및 `location` 같은 브라우저 전역은 `layout.platform === "web"`일 때만 존재하며 iOS와 Android에는 이에 대응하는 항목이 없습니다. 해당 필드를 기준으로 사용 여부를 제한하세요.

플러그인 스토리지 API는 없습니다. 브라우저 스토리지는 Paseo 클라이언트 간에 설정을 유지하지 않습니다. 범용 호스트 탐색 API도 없으므로 플러그인 코드에서 Paseo 네이티브 경로를 열 수 없습니다. Command Center 콜백은 같은 플러그인이 등록한 표면과 패널만 열 수 있습니다.

### 서버 런타임

Paseo는 서버 코드에 `@getpaseo/plugin`, `@getpaseo/plugin/server`, `zod`를 제공합니다. 백엔드 기여는 데몬 하위 프로세스에서 실행되며 호스트 머신에 대한 Node 액세스 권한이 있습니다. 파일 시스템, 프로세스, 자격 증명 및 기타 머신 로컬 작업은 `*.server.ts` 파일에 두세요.

## 진입점 및 정리

`index.ts`는 기여를 연결하고 하나의 기여 함수를 기본으로 내보냅니다. 정리할 것이 없어도 정리 함수를 반환해야 합니다.

```ts
import type { PluginContext } from "@getpaseo/plugin";
import { Main } from "./main.client";

export default function contribute(plugin: PluginContext) {
  plugin.addSurface("main", Main);
  return () => {};
}
```

정리는 비동기식일 수 있습니다. 플러그인에서 생성된 타이머, 감시자, 소켓 및 기타 리소스를 해제합니다. Paseo는 또한 등록을 제거하고, 표면을 마운트 해제하고, 보류 중인 RPC를 거부하고, 플러그인의 데몬 세션을 닫고, 다시 로드, 비활성화, 제거, 연결 해제 또는 데몬 종료 시 하위 프로세스를 중지합니다.

## 표면 및 사이드바 항목

구성 요소를 등록한 다음 해당 표면 ID에서 사이드바 항목을 가리킵니다.

`main.client.tsx`:

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

`index.ts`:

```ts
import type { PluginContext } from "@getpaseo/plugin";
import { Main } from "./main.client";

export default function contribute(plugin: PluginContext) {
  plugin.addSurface("main", Main);
  plugin.addSidebarItem({
    id: "main",
    title: "My plugin",
    icon: "Blocks",
    surface: "main",
  });
  return () => {};
}
```

`PluginSurfaceProps`에는 다음이 포함됩니다.

| 필드 | 의미 |
| -------- | ------------------------------------------------------------ |
| `theme` | 활성 Paseo 테마를 위한 형식화된 `PluginTheme` 색상 토큰. |
| `host` | 선택한 호스트의 `id`와 표시용 `label`. |
| `layout` | `compact` 및 `ios`, `android` 또는 `web` 플랫폼. |

Paseo는 경로, 헤더, 닫기 작업, 호스트 선택기, 오류 경계 및 쿼리 클라이언트를 소유합니다. 플러그인은 표면 본체를 소유합니다.

클라이언트 표면 내부의 Lucide 아이콘에는 호스트가 제공하는 `Icon` 구성 요소를 사용하세요. Paseo에 설치된 Lucide 버전의 아이콘을 렌더링하므로 플러그인 번들에서 `lucide-react-native` 또는 `react-native-svg`를 가져오지 않습니다. 알 수 없는 이름은 플러그인 표면을 실패시키는 대신 아무것도 렌더링하지 않습니다.

```tsx
import { Icon } from "@getpaseo/plugin";

<Icon name="Settings" size={18} color={theme.colors.foreground} />;
```

`Icon`은 `*.client.tsx` 모듈에 두세요.

## 타임라인 항목

플러그인은 투영된 타임라인 항목을 자체 데이터와 React Native 렌더러로 교체할 수 있습니다. 두 등록 모두 클라이언트 기여입니다. 일치하는 라이브 이벤트는 교체 전에 투영된 꼬리를 새로 고치므로 공급자 수명 주기 델타가 플러그인 항목으로 노출되지 않습니다.

```tsx
import type { PluginContext, PluginTimelineItemProps } from "@getpaseo/plugin";
import { Text } from "react-native";
import { z } from "zod";

const schema = z.object({ label: z.string() });

function Card({ item, theme }: PluginTimelineItemProps<z.output<typeof schema>>) {
  return <Text style={{ color: theme.colors.foreground }}>{item.data.label}</Text>;
}

export default function contribute(plugin: PluginContext) {
  plugin.addTimelineTransformer({
    id: "command-card",
    query: { itemType: "tool_call" },
    transform({ item }) {
      if (item.status === "running") return;
      return {
        items: [
          {
            type: "plugin",
            kind: "command-card",
            version: 1,
            data: { label: item.name },
          },
        ],
      };
    },
  });
  plugin.addTimelineRenderer({
    kind: "command-card",
    version: 1,
    schema,
    Component: Card,
  });
  return () => {};
}
```

`query.itemType`은 안정적이고 거친 선택자입니다. 공급자나 도구별 항목을 인식하려면 `transform` 안에서 선택된 항목을 검사하세요. `undefined`를 반환하면 원래 항목을 유지합니다. `items`를 반환하면 항목을 교체하고, 빈 배열을 반환하면 제거합니다. 항목의 `data`는 JSON과 호환되어야 합니다.

렌더러는 `agentId`, `item`, `timestamp`, `theme`, `host`, `layout`을 받습니다. Paseo는 렌더링 전에 등록된 스키마로 `item.data`를 검증합니다. Paseo가 투영된 기록을 조정하는 동안 변환기를 다시 실행하므로 변환기는 동기적이고 결정적으로 유지하세요.

## 테마 및 레이아웃

플러그인 UI는 모든 Paseo 테마에서 데스크톱, 브라우저, iOS, Android에서 실행됩니다. `theme`은 활성 호스트 테마에서 매핑된 형식화된 `PluginTheme`입니다. 색상과 간격은 반드시 이 props에서 가져와야 합니다. 하드코딩한 색상과 스타일이 지정되지 않은 `Text`는 호스트 테마가 변경될 때 제대로 표시되지 않습니다.

`theme` 또는 `layout.compact`가 변경되면 스타일을 다시 생성하세요.

| 키                               | 필수 적용 대상             | 용도                              |
| -------------------------------- | -------------------------- | --------------------------------- |
| `theme.colors.foreground`        | 모든 기본 `Text`           | 제목 및 본문                      |
| `theme.colors.foregroundMuted`   | 보조 `Text`                | 레이블 및 보조 문구               |
| `theme.colors.surface0`          | 루트 뷰                    | 패널 배경                         |
| `theme.colors.surface1`          | 돌출 표면                  | 카드와 패널                       |
| `theme.colors.surface2`          | 컨트롤 표면                | 입력 및 보조 컨트롤               |
| `theme.colors.border`            | 표면 경계                  | 테두리와 구분선                   |
| `theme.colors.accent`            | 기본 작업 채우기           | 버튼과 선택 상태                  |
| `theme.colors.accentForeground`  | 강조 채우기 위의 텍스트    | 버튼 레이블                       |
| `theme.colors.statusSuccess`     | 성공 피드백                | 성공 메시지와 표시기              |
| `theme.colors.statusWarning`     | 경고 피드백                | 경고 메시지와 표시기              |
| `theme.colors.statusDanger`      | 실패 문구                  | 오류 메시지와 파괴적 작업 텍스트  |
| `layout.compact`                 | 패딩 및 쌓기               | 모바일 및 좁은 창에서 `true`      |
| `layout.platform`                | 플랫폼별 동작              | `ios`, `android` 또는 `web`        |

`#000`, `#fff` 또는 React Native의 기본 텍스트 색상을 하드코딩하지 마세요. 기본 문구에는 `foreground`를, 레이블에는 `foregroundMuted`를 사용하세요. `layout.compact`가 true이면 패딩을 줄이세요.

작업공간 및 에이전트 패널도 동일한 `theme` 및 `layout` 필드를 받습니다.

## 테마 제공

`addTheme`은 Settings → Appearance에 밝은 테마 또는 어두운 테마를 추가하며, 기본 제공 테마 아래에 `name`으로 표시됩니다. 테마는 데이터이므로 클라이언트 파일이 필요하지 않습니다.

```ts
import type { PluginContext } from "@getpaseo/plugin";

export default function contribute(plugin: PluginContext) {
  plugin.addTheme({
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

모든 색상은 16진수 문자열이어야 하며 다른 형식은 로드에 실패합니다. Paseo는 팔레트를 기본 제공 어두운 테마가 사용하는 전체 토큰 집합으로 확장하므로, 제공된 테마는 패널, 메뉴, diff, 상태 색상, 터미널을 모두 별도 나열 없이 처리합니다.

| 색상              | 적용 대상                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `background`      | 앱, 작업공간, 터미널 배경                                                                 |
| `foreground`      | 기본 텍스트, 터미널 전경과 커서                                                          |
| `raised`          | 카드, 팝오버, 마우스를 올린 행                                                           |
| `control`         | 입력, 보조 채우기, 밝은 테마 사이드바                                                    |
| `border`          | 테두리와 가장 높은 돌출 표면 색조                                                        |
| `accent`          | 버튼, 선택, 포커스. 선택 사항이며 생략하면 `foreground`를 사용합니다.                    |
| `mutedForeground` | 보조 텍스트                                                                               |
| `ring`            | 포커스 링, 스크롤바, 터미널의 밝은 검정                                                   |

`appearance`는 `"light"` 또는 `"dark"`입니다. Paseo는 이를 사용해 일치하는 표면, 상태, diff, 구문, 터미널, 그림자 파생을 선택합니다.

제공된 테마는 한 번에 하나만 활성화됩니다. 하나를 선택하면 선택이 유지됩니다. 이후 플러그인이 비활성화되거나 제거되면 앱을 표시할 수 없는 상태로 두지 않고 기본 테마로 돌아갑니다.

테마를 사용하려면 이를 지원하는 호스트가 필요합니다. `addTheme` 이전에 출시된 데몬에서는 호출이 플러그인의 백엔드 번들로 컴파일되지만 해당 함수가 없으므로 플러그인이 `plugin.addTheme is not a function` 오류와 함께 시작되지 않습니다. 호스트를 업데이트하세요.

## 작업공간 패널

작업공간 또는 에이전트 컨텍스트에 패널을 등록합니다.

`review.client.tsx`:

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

`index.ts`:

```ts
import type { PluginContext } from "@getpaseo/plugin";
import { ReviewPanel } from "./review.client";

export default function contribute(plugin: PluginContext) {
  plugin.addWorkspacePanel({
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
| ----------- | -------- | ------------------------------------------------ |
| `id` | 예 | 플러그인-로컬 패널 ID.                                        |
| `title` | 예 | 작업공간 탭 제목.                                          |
| `icon` | 예 | Lucide 아이콘 이름입니다.                                             |
| `context` | 예 | `workspace` 또는 `agent`.                                       |
| `locations` | 아니요 | `workspace` 및/또는 `explorer`. 기본값은 `workspace`입니다. |
| `Component` | 예 | 선택한 컨텍스트의 소품과 일치하는 React Native 구성 요소입니다. |

작업 공간 패널은 `PluginWorkspacePanelProps`을 수신합니다: `context: "workspace"`, `theme`, `host`, `layout` 및 `workspaceId`. 에이전트 패널은 `PluginAgentPanelProps`: `context: "agent"`, 동일한 공통 필드, `workspaceId` 및 `agentId`을 수신합니다.

`useWorkspace(workspaceId, selector)` 및 `useAgent(agentId, selector)`을 사용하여 캐시된 상태를 읽습니다. 선택기가 필요합니다. Paseo는 결과를 얕게 비교하므로 `{ name, status }`을 선택하면 관련 없는 필드가 변경될 때 다시 렌더링되지 않습니다. 한 번의 호출로 구성 요소가 렌더링하는 모든 필드를 선택합니다. 전체 스냅샷을 선택하지 마십시오.

레코드를 사용할 수 없으면 두 후크 모두 `null`을 반환합니다. 그렇지 않으면 정규화된 클라이언트 상태에 대해 동기적으로 실행됩니다. 스냅샷 DTO 및 해당 중첩 값은 읽기 전용이며 런타임 시 고정됩니다. 현재 작업공간이나 에이전트를 검색하기 위해 플러그인 RPC를 호출하지 마세요. 구성 요소가 렌더링된 후 선택적 또는 공급업체별 보강을 가져옵니다.

작업공간 스냅샷 필드:

| 필드 | 유형 |
| ------- | ----------------------------------------------------------------- |
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

| 필드 | 유형 |
| ------ | ------------------------------------ |
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

Paseo는 탭 포커스, 분할, 닫기, 지속성, 쿼리 상태, API/RPC 공급자, 렌더링 오류 경계를 관리합니다. 플러그인, 패널, 컨텍스트, 작업공간 또는 에이전트를 사용할 수 없는 복원 탭은 작업공간을 중단시키지 않고 사용할 수 없다는 메시지를 표시한 채 열려 있습니다.

## 명령 센터 항목

macOS에서는 **⌘K**, Windows와 Linux에서는 **Ctrl+K**로 Command Center를 연 다음 항목 제목을 검색하세요.

작업을 등록하고 콜백에서 패널을 엽니다.

```tsx
import { defineRpc } from "@getpaseo/plugin/server";
import { z } from "zod";

const refreshReview = defineRpc({
  name: "review.refresh",
  input: z.object({ agentId: z.string() }),
  output: z.object({ refreshed: z.boolean() }),
});

plugin.addCommandCenterItem({
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
| ---------- | -------- | --------------------------------- |
| `id` | 예 | 플러그인 로컬 항목 ID입니다.                          |
| `title` | 예 | 검색결과 제목.                           |
| `icon` | 예 | Lucide 아이콘 이름입니다.                              |
| `keywords` | 아니요 | 추가 명령 센터 검색어입니다.        |
| `context` | 예 | `global`, `workspace` 또는 `agent`.             |
| `onSelect` | 예 | 일치하는 컨텍스트에 대한 클라이언트 측 콜백입니다. |

전역 항목은 설치에서 선택한 호스트에 나타납니다. 작업공간 항목은 해당 호스트에 캐시된 활성 작업공간이 있는 경우에만 나타납니다. 에이전트 항목은 초점이 맞춰진 작업 영역 탭이 에이전트이거나 캐시된 레코드가 해당 작업 영역에 속하는 에이전트 컨텍스트 플러그인 패널인 경우에만 나타납니다. 누락된 컨텍스트는 항목을 찾기 위해 플러그인을 호출하는 대신 항목을 제거합니다.

모든 콜백은 다음을 수신합니다.

| 필드 | 컨텍스트 | 의미 |
| --------- | ------ | ------------------------------------------------ |
| `context` | 모두 | 매칭 판별자.                                       |
| `paseo` | 모두 | 선택한 호스트의 기존 `PaseoApi`.                          |
| `rpc(contract, input)` | 모두 | 이 설치의 데몬 측 플러그인 핸들러를 형식에 맞게 호출합니다. |
| `openSurface(id)` | 모두 | 이 플러그인에 등록된 전역 표면 중 하나를 엽니다.        |
| `workspace` | 작업공간 및 에이전트 | 동기식 작업공간 스냅샷.                               |
| `agent` | 에이전트 | 동기식 일치 에이전트 스냅샷.                          |
| `openPanel(id, options?)` | 작업공간 및 에이전트 | 콜백의 현재 컨텍스트에서 등록된 패널을 엽니다. 탐색기를 대상으로 하려면 `{ location: "explorer" }`를 전달합니다. |

에이전트 콜백은 에이전트 패널이나 작업공간 패널을 열 수 있습니다. 작업공간 콜백은 작업공간 패널만 열 수 있습니다. 알 수 없는 표면 및 패널 ID는 명확한 오류를 냅니다. 일반 작업공간, 에이전트, 공급자 및 데몬 구성 작업에는 `paseo`를 사용하세요. 플러그인별 파일 시스템, 자격 증명, 공급업체 또는 데몬 로컬 작업에는 `rpc`를 사용하세요.

## Paseo SDK 사용

표면에서 일반 Paseo 작업을 수행할 때는 `usePaseo()`를 사용하세요. 선택한 호스트의 기존 연결을 빌려오며, 별도 클라이언트를 만들면 안 됩니다.

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

반환된 API에는 프로젝트, 작업공간, 에이전트, 공급자, 데몬 구성이 포함됩니다. 각 메서드는 [SDK API 참조](/docs/sdk/reference)를 확인하세요. Paseo가 연결을 관리하므로 연결 수명 주기 메서드는 의도적으로 제공하지 않습니다.

## 플러그인별 백엔드 동작 추가

일반적인 Paseo 작업이 아닌 작업(공급업체 API 읽기, 데몬 로컬 리소스 액세스 또는 클라이언트에서 자격 증명 유지)에만 플러그인 RPC를 사용하세요.

Zod와 하나의 계약을 정의하고, 하위 프로세스에서 처리하고, 표면에서 호출합니다.

`greeting.shared.ts`:

```ts
import { defineRpc } from "@getpaseo/plugin/server";
import { z } from "zod";

export const greeting = defineRpc({
  name: "greeting.create",
  input: z.object({ name: z.string() }),
  output: z.object({ message: z.string() }),
});
```

`greeting.client.tsx`:

```tsx
import { useRpc } from "@getpaseo/plugin";
import { greeting } from "./greeting.shared";

export function GreetingButton() {
  const createGreeting = useRpc(greeting);
  // Call createGreeting({ name: "Ada" }) from an event or query.
  return null;
}
```

`greeting.server.ts`:

```ts
import type { output as ZodOutput } from "zod";
import { greeting } from "./greeting.shared";

export function createGreeting({ name }: ZodOutput<typeof greeting.input>) {
  return { message: `Hello, ${name}` };
}
```

`index.ts`:

```ts
import type { PluginContext } from "@getpaseo/plugin";
import { GreetingButton } from "./greeting.client";
import { createGreeting } from "./greeting.server";
import { greeting } from "./greeting.shared";

export default function contribute(plugin: PluginContext) {
  plugin.handle(greeting, createGreeting);
  plugin.addSurface("main", GreetingButton);
  return () => {};
}
```

입력과 출력은 양쪽에서 검증됩니다. RPC 이름은 소문자로 시작하며 소문자, 숫자, 점, 하이픈 또는 밑줄을 포함합니다. `useRpc()`은 형식화된 비동기 함수를 반환합니다. 요청 상태, 캐싱 및 변형에는 TanStack 쿼리를 사용하세요.

백엔드 핸들러는 `{ paseo }`와 같은 `PaseoApi`를 받습니다. 해당 연결은 하위 프로세스에 속하며 플러그인이 중지되면 닫힙니다. 백엔드 코드는 Node API와 플러그인 디렉터리에 설치된 종속성을 사용할 수 있습니다.

## 디버그 백엔드 출력

백엔드 기여는 일반 노드 로깅을 통해 stdout 및 stderr에 쓸 수 있습니다.

```ts
console.log("Refreshing issues");
console.error("Issue refresh failed", error);
```

Paseo는 플러그인이 로드를 시작할 때, 준비됐을 때, 중지를 시작할 때, 중지됐을 때 `[paseo]` 항목을 추가합니다. 플러그인 하위 프로세스가 시작되기 전의 오류를 포함해 컴파일 및 로드 실패를 stderr 항목으로 기록합니다. 초기화, RPC 핸들러, 정리, 프로세스 실패 중에 출력된 내용도 캡처합니다. 프로토콜 트래픽은 별도 채널을 사용하므로 `console.log()`가 플러그인 RPC를 손상시키지 않습니다.

플러그인의 **설정 → 플러그인 → 로그**를 열거나 데몬 CLI에서 같은 최근 테일을 확인하세요.

```bash
paseo plugin logs my-plugin
paseo plugin logs my-plugin --json
paseo plugin logs my-plugin --host <url>
```

이 명령은 실시간 출력을 따라가지 않고 스냅샷을 반환합니다. 새 항목을 보려면 설정 화면을 새로 고치거나 명령을 다시 실행하세요. 각 항목에는 타임스탬프, stdout 또는 stderr 스트림, 순서, 메시지가 포함됩니다.

Paseo는 메모리에 플러그인당 최대 500개 항목과 256KiB를 유지합니다. 개별 줄은 16KiB로 제한됩니다. 다시 로드, 비활성화, 컴파일 실패, 초기화 실패, 프로세스 실패 후에도 테일은 유지됩니다. 플러그인을 제거하면 테일이 지워지고, 데몬을 다시 시작하면 새 테일이 시작됩니다. 구조화된 복사본은 `$PASEO_HOME/daemon.log`의 데몬 로그에도 기록됩니다.

데몬 측 출력만 캡처됩니다. 클라이언트 표면의 로그는 앱 런타임에 남습니다. 자격 증명, 액세스 토큰 또는 기타 비밀을 기록하지 마세요. 연결된 사용자는 보존된 테일을 읽을 수 있고 데몬 로그에도 내용이 남습니다.

## 작성기 첨부 소스 추가

첨부 파일 소스는 외부 리소스를 검색하고 에이전트 프롬프트에 대한 안정적인 텍스트 스냅샷을 반환합니다. 백엔드 처리기에서 자격 증명과 공급업체 호출을 유지합니다.

`issues.shared.ts`:

```ts
import { defineAttachmentSource, defineRpc } from "@getpaseo/plugin/server";
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

`issues.server.ts`:

```ts
import type { output as ZodOutput } from "zod";
import { searchIssues } from "./issues.shared";

export function search({ query }: ZodOutput<typeof searchIssues.input>) {
  return searchAcmeIssues(query);
}
```

`index.ts`:

```ts
import type { PluginContext } from "@getpaseo/plugin";
import { search } from "./issues.server";
import { issues, searchIssues } from "./issues.shared";

export default function contribute(plugin: PluginContext) {
  plugin.handle(searchIssues, search);
  plugin.addAttachmentSource(issues);
  return () => {};
}
```

Paseo는 작성기 메뉴, 검색 선택기, 선택한 알약, 초안 상태 및 제출물을 소유합니다. `text` 값은 에이전트에 전송된 전체 스냅샷입니다.

## 호스트 및 수명주기

플러그인은 데몬별로 설치됩니다. 연결된 여러 호스트에 동일한 기여가 있는 경우 Paseo는 하나의 사이드바 항목을 표시하고 호스트 선택기를 추가합니다. 선택한 호스트는 번들, Paseo API, RPC 전송 및 쿼리 캐시를 제공합니다. 선택한 호스트가 오프라인일 때 통화는 다른 호스트로 전달되지 않습니다.

첨부 소스의 범위는 각 작성기의 호스트로 유지됩니다.

작업공간 패널과 Command Center 항목의 범위는 활성 호스트 및 정확한 캐시 컨텍스트로 제한됩니다. 다시 로드하면 해당 등록이 교체됩니다. 비활성화, 제거, 호스트 연결 해제, 평가 실패가 발생하면 Command Center 항목을 제거하고 설치의 쿼리 상태를 지웁니다. 이미 복원된 패널 탭은 일치하는 기여가 돌아오거나 사용자가 닫을 때까지 사용할 수 없는 상태로 남습니다. 패널 렌더링 오류는 플러그인 오류 경계 안에 머뭅니다.

## CLI 참조

```bash
paseo plugin init /absolute/path/to/plugin
paseo plugin install /absolute/path/to/plugin
paseo plugin install /absolute/path/to/plugin --id another-runtime-id
paseo plugin add owner/repository
paseo plugin add https://git.example.com/owner/repository.git --ref main
paseo plugin add owner/monorepo --path plugins/review
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

대상이 CLI의 기본 데몬이 아니면 관리 명령에 `--host <url>`을 전달하세요. `remove`는 디렉터리 소스를 삭제하지 않으며 Git 소스의 관리형 체크아웃은 삭제합니다. 설치 시 지정하는 `--id`는 런타임 ID로, 같은 디렉터리나 저장소를 두 번 이상 설치할 수 있게 합니다.

기존 디렉터리는 `owner/repository` GitHub 단축 표기보다 우선합니다. 기본 브랜치를 추적하려면 `--ref`를 생략하세요. 명시한 브랜치는 업데이트를 추적하고, 태그와 커밋은 고정된 상태로 유지됩니다. Git 설치는 패키지 관리자나 설치 스크립트를 실행하지 않습니다. `update`는 활성화 전에 후보를 검증하고 컴파일하며, 시작에 실패하면 설치된 커밋을 복원합니다.

설치하거나 다시 로드하기 전에 `npm run typecheck`을 실행하세요. 데몬 구성을 직접 편집하지 마십시오.

데몬 전체 **플러그인 활성화** 스위치는 **설정 → 플러그인** 아래에 있습니다. 구성된 플러그인은 해당 스위치와 플러그인 자체 활성화 상태가 모두 켜질 때까지 `disabled`으로 유지됩니다.

스위치는 `config.json`의 루트 `pluginsEnabled` 필드입니다. 변경한 후 `paseo reload --json`을 실행하세요. 활성화하면 `enabled` 값이 `false`이 아닌 모든 구성된 플러그인이 시작됩니다. 비활성화하면 모든 플러그인이 중단됩니다. 데몬을 다시 시작할 필요가 없습니다. 플러그인 소스 항목에 대한 수동 편집은 다시 로드되지 않습니다. 해당 항목에 대해서는 플러그인 수명 주기 명령을 사용하십시오.

## 로드 실패

`paseo plugin ls`을 사용하여 현재 상태 및 오류를 읽으세요.

| 증상 | 확인 |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| 사이드바 항목이 누락되었습니다 | 플러그인은 `running`이고, 항목은 기존 표면을 참조하고, 아이콘 이름은 유효하며, 클라이언트는 설치 호스트에 있습니다. |
| 클라이언트 모듈을 사용할 수 없습니다 | 위에 나열된 호스트 제공 클라이언트 모듈만 가져옵니다.                                                                              |
| RPC 거부 | Zod 스키마와 데몬 측 핸들러 오류를 모두 확인하세요.                                                                               |
| 편집된 코드가 나타나지 않습니다 | `npm run typecheck`을 실행한 다음 `paseo plugin reload <id>`을 실행합니다.                                                                               |
| 다시 로드 실패 | `paseo plugin ls` 및 `paseo plugin logs <id>`을 읽고 소스 오류를 수정한 후 다시 로드하세요. Paseo는 이전 번들을 복원하지 않습니다.     |
| 플러그인이 예기치 않게 종료됩니다 | 유지된 초기화, 정리, stderr 및 최종 충돌 출력을 보려면 `paseo plugin logs <id>`을 읽어보세요.                                     |
