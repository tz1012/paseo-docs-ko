---
title: Plugin quickstart
description: Build, install, and reload a trusted local Paseo plugin with a workspace panel.
nav: Quickstart
order: 45
category: Plugins
---

# 플러그인 빠른 시작

Paseo 플러그인은 기본 작업 공간 패널, Command Center 항목, 전역 표면, 데몬 동작 및 작성기 첨부 소스를 추가합니다. 모바일을 포함하여 호스트에 연결된 모든 Paseo 클라이언트에서 실행됩니다.

플러그인은 신뢰할 수 있는 로컬 코드입니다. 신뢰할 수 있는 코드만 설치하세요. 백엔드 코드는 데몬 머신에 액세스하여 샌드박스 처리되지 않은 상태로 실행되며, 클라이언트 기여는 Paseo 앱 내에서 실행됩니다.

대상 호스트에서 **설정 → 플러그인**을 열고 **플러그인 활성화**를 켭니다. 이는 해당 데몬에 구성된 모든 플러그인에 대한 전역 스위치입니다.

데몬의 `config.json`에서 루트 `pluginsEnabled` 필드를 변경한 다음 다시 시작하지 않고 적용할 수도 있습니다.

```bash
paseo reload --json
```

활성화하면 구성된 플러그인이 시작되고, 비활성화하면 모두 중지됩니다. 자동화는 비활성화되거나 생략된 값을 `true`로 바꾸기 전에 현재 값을 확인하고 명시적인 권한을 받아야 합니다.

## 플러그인 만들기

데몬 머신에서 절대 경로를 사용하십시오.

```bash
paseo plugin init /absolute/path/to/workspace-plugin
cd /absolute/path/to/workspace-plugin
npm install
```

`init`은 엄격한 TypeScript 프로젝트를 생성하지만 패키지 관리자는 실행하지 않습니다. `index.ts`는 기여를 등록하고, 클라이언트 UI는 `*.client.tsx` 파일에 둡니다.

`main.client.tsx`를 다음으로 바꾸세요.

```tsx
import { type PluginWorkspacePanelProps, useWorkspace } from "@paseo/plugin";
import { StyleSheet, Text, View } from "react-native";

export function WorkspaceOverview({ workspaceId }: PluginWorkspacePanelProps) {
  const workspace = useWorkspace(workspaceId, ({ name, directory }) => ({
    name,
    directory,
  }));
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{workspace?.name}</Text>
      <Text>{workspace?.directory}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 24 },
});
```

`index.ts`를 다음으로 바꾸세요.

```ts
import type { PluginContext } from "@paseo/plugin";
import { WorkspaceOverview } from "./main.client";

export default function contribute(plugin: PluginContext) {
  plugin.addWorkspacePanel({
    id: "overview",
    title: "Workspace overview",
    icon: "PanelsTopLeft",
    context: "workspace",
    Component: WorkspaceOverview,
  });
  plugin.addCommandCenterItem({
    id: "open-overview",
    title: "Open workspace overview",
    icon: "PanelsTopLeft",
    context: "workspace",
    onSelect({ openPanel }) {
      openPanel("overview");
    },
  });
  return () => {};
}
```

아이콘에는 [Lucide](https://lucide.dev/icons/) 아이콘 이름을 사용합니다. `*.client.tsx` 파일에서는 `StyleSheet.create` 같은 React Native 런타임 API를 사용할 수 있으며, Paseo는 이를 데몬 번들에서 제외합니다. 패널은 데스크톱, 브라우저, iOS, Android 클라이언트에서 작동합니다. 패널 props에는 안정적인 ID가 포함됩니다. `useWorkspace`는 RPC로 다시 가져오거나 관련 없는 작업공간 변경에 다시 렌더링하지 않고 구성 요소에 필요한 캐시 필드만 선택합니다.

## 확인 및 설치

```bash
npm run typecheck
paseo plugin install /absolute/path/to/workspace-plugin
paseo plugin ls
```

작업공간을 열고 Command Center에서 **작업공간 개요 열기**를 선택하세요. 일반 작업공간 탭으로 열립니다. 항목이 표시되지 않으면 **플러그인 활성화**가 켜져 있는지, `paseo plugin ls`에서 플러그인 상태가 `running`인지, 클라이언트가 플러그인을 설치한 호스트를 보고 있는지 확인하세요.

## 편집하고 다시 로드

소스 변경은 명시적으로 다시 로드해야 적용됩니다.

```bash
npm run typecheck
paseo plugin reload workspace-plugin
```

다시 로드하면 이전 플러그인을 중지하고 정리를 실행한 다음 현재 소스를 컴파일해 다시 시작합니다. 다시 로드가 실패하면 실패 상태를 유지하며 로드 오류를 보고합니다. 소스를 수정하고 다시 로드하세요.

## 디버그 백엔드 출력

데몬 측 핸들러와 정리 코드에서는 일반 Node 로깅을 사용하세요.

```ts
console.log("Refreshing issues");
console.error("Issue refresh failed", error);
```

**설정 → 플러그인 → 로그** 또는 CLI에서 최근 stdout과 stderr을 확인합니다.

```bash
paseo plugin logs workspace-plugin
paseo plugin logs workspace-plugin --json
```

로그 테일에는 `[paseo]` 로드, 준비, 중지 시작, 중지 항목과 컴파일 및 로드 실패가 포함됩니다. 다시 로드하거나 충돌해도 유지됩니다. 플러그인이 시작되지 않거나 RPC가 거부될 때 확인하세요. 보존 및 보안 동작은 [백엔드 출력 디버깅](/docs/plugins/reference#debug-backend-output)을 참조하세요.

## 다음

- [플러그인 참조](/docs/plugins/reference), 데몬 동작 추가, Paseo SDK 사용, 첨부 파일 제공, 수명 주기 관리.
- [TypeScript SDK](/docs/sdk), 플러그인 내부에 노출되는 작업공간, 에이전트, 공급자, 구성 API.
