---
title: Plugin quickstart
description: Build, install, share, and update a trusted Paseo plugin.
nav: Quickstart
order: 45
category: Plugins
---

# 플러그인 빠른 시작

> **실험적 기능:** 플러그인 API는 계속 발전 중이므로 Paseo가 발전함에 따라 호환성을 깨는 변경 사항이 생기고
> 플러그인을 업데이트해야 할 수 있습니다.

예정된 기여 영역과 현재 상태는 [플러그인 로드맵](https://github.com/getpaseo/paseo/labels/plugins)을 참조하세요.

Paseo 플러그인은 기본 작업공간 패널, Command Center 항목, 전역 표면, 앱 테마, 데몬 동작, 작성기 첨부 소스를 추가합니다. 모바일을 포함해 호스트에 연결된 모든 Paseo 클라이언트에서 실행됩니다.

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

플러그인은 데스크톱, 브라우저, iOS, Android에서 실행되며 Paseo는 여러 테마를 제공합니다. 모든 `Text` 색상은 `theme.colors.foreground` 또는 `theme.colors.foregroundMuted`에서 가져오고, 레이아웃 크기는 `layout.compact`에 맞추세요. 텍스트 색상을 검은색으로 하드코딩하면 어두운 테마에서 제대로 표시되지 않습니다.

`main.client.tsx`를 다음으로 바꾸세요.

```tsx
import { type PluginWorkspacePanelProps, useWorkspace } from "@getpaseo/plugin";
import { useMemo } from "react";
import { Text, View } from "react-native";

export function WorkspaceOverview({ theme, layout, workspaceId }: PluginWorkspacePanelProps) {
  const workspace = useWorkspace(workspaceId, ({ name, directory }) => ({
    name,
    directory,
  }));
  const styles = useMemo(
    () => ({
      screen: {
        flex: 1,
        padding: layout.compact ? 16 : 24,
        gap: layout.compact ? 8 : 12,
        backgroundColor: theme.colors.surface0,
      },
      title: { color: theme.colors.foreground, fontSize: layout.compact ? 20 : 24 },
      label: { color: theme.colors.foregroundMuted },
      detail: { color: theme.colors.foreground },
    }),
    [theme, layout.compact],
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{workspace?.name}</Text>
      <Text style={styles.label}>Directory</Text>
      <Text style={styles.detail}>{workspace?.directory}</Text>
    </View>
  );
}
```

`index.ts`를 다음으로 바꾸세요.

```ts
import type { PluginContext } from "@getpaseo/plugin";
import { WorkspaceOverview } from "./main.client";

export default function contribute(plugin: PluginContext) {
  plugin.addWorkspacePanel({
    id: "overview",
    title: "Workspace overview",
    icon: "PanelsTopLeft",
    context: "workspace",
    locations: ["workspace", "explorer"],
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

아이콘에는 [Lucide](https://lucide.dev/icons/) 아이콘 이름을 사용합니다. `*.client.tsx` 파일에서는 React Native 런타임 API를 사용할 수 있으며, Paseo는 이를 데몬 번들에서 제외합니다. 패널 props에는 안정적인 ID가 포함됩니다. `useWorkspace`는 RPC로 다시 가져오거나 관련 없는 작업공간 변경에 다시 렌더링하지 않고 구성 요소에 필요한 캐시 필드만 선택합니다. 필수 토큰은 [테마 및 레이아웃](/docs/plugins/reference#theme-and-layout)을 참조하세요.

## 확인 및 설치

```bash
npm run typecheck
paseo plugin install /absolute/path/to/workspace-plugin
paseo plugin ls
```

작업공간을 열고 macOS에서는 **⌘K**, Windows와 Linux에서는 **Ctrl+K**를 누른 다음 **작업공간 개요 열기**를 선택하세요. 일반 작업공간 탭으로 열립니다. 항목이 표시되지 않으면 **플러그인 활성화**가 켜져 있는지, `paseo plugin ls`에서 플러그인 상태가 `running`인지, 클라이언트가 플러그인을 설치한 호스트를 보고 있는지 확인하세요.

GitHub 또는 다른 Git 호스트를 통해 게시된 플러그인을 설치하려면 다음을 실행하세요.

```bash
paseo plugin add owner/repository
paseo plugin add https://git.example.com/owner/repository.git
paseo plugin add owner/monorepo --path plugins/workspace
paseo plugin add owner/repository --ref main
```

`--ref`를 생략하면 기본 브랜치를 추적합니다. 명시한 브랜치는 업데이트를 추적하고, 태그와 커밋은 고정됩니다. 다음 명령으로 업데이트를 확인하고 적용하세요.

```bash
paseo plugin status
paseo plugin update workspace-plugin
paseo plugin update --all
```

Paseo는 실행 중인 버전을 교체하기 전에 새 커밋을 검증하고 컴파일합니다. 시작에 실패하면 이전 버전을 복원합니다. Git 설치는 패키지 관리자나 설치 스크립트를 실행하지 않으므로, 게시된 플러그인은 Paseo가 호스트에서 제공하는 모듈을 사용하거나 번들에 포함할 소스를 함께 제공해야 합니다.

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

- [플러그인 참조](/docs/plugins/reference), 데몬 동작 추가, Paseo SDK 사용, 테마와 첨부 파일 제공, 수명 주기 관리.
- [TypeScript SDK](/docs/sdk), 플러그인 내부에 노출되는 작업공간, 에이전트, 공급자, 구성 API.
