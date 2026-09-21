---
title: Plugin quickstart
description: Build, install, share, and update a trusted Paseo plugin.
nav: Quickstart
order: 44
category: Plugins
---

# 플러그인 빠른 시작

플러그인은 하나의 Paseo 데몬에 설치되는 TypeScript 프로젝트입니다.
[표면 및 사이드바 항목](/docs/plugins/reference#surfaces-and-sidebar-items),
[작업공간 패널](/docs/plugins/reference#workspace-panels),
[Command Center 항목](/docs/plugins/reference#command-center-items),
[슬래시 명령](/docs/plugins/reference#slash-commands),
[작성기 필](/docs/plugins/reference#composer-pills),
[타임라인 항목](/docs/plugins/reference#timeline-items),
[테마](/docs/plugins/reference#contribute-a-theme),
[첨부 소스](/docs/plugins/reference#add-a-composer-attachment-source),
[데몬 측 RPC](/docs/plugins/reference#add-plugin-specific-backend-behavior)를 추가할 수 있습니다. 또한 [코딩 에이전트를 공급자로 연결](/docs/plugins/providers)할 수 있습니다. 클라이언트
기여는 모바일을 포함해 해당 데몬에 연결된 모든 Paseo 클라이언트에서 실행됩니다.

이 가이드에서는 플러그인의 기본 구조를 생성하고 실행한 다음 작업공간 패널을 추가합니다.

## 플러그인 만들기

데몬 머신에서 절대 경로를 사용하세요.

```bash
paseo plugin init /absolute/path/to/workspace-plugin
cd /absolute/path/to/workspace-plugin
npm install
```

`init`은 엄격한 TypeScript 프로젝트를 생성하며 패키지 관리자는 실행하지 않습니다. `npm install`은
유형 검사와 테스트에만 필요한 개발 종속성을 추가합니다. Paseo는 플러그인 SDK, React,
React Native, TanStack Query, Zod를 런타임에 제공합니다.

생성된 기본 구조는 바로 작동하는 플러그인입니다. 사이드바 표면에 있는 버튼을 누르면
RPC를 통해 데몬에 인사 메시지를 요청합니다.

```text
workspace-plugin/
  paseo-plugin.json      # plugin ID and supported Paseo versions
  index.client.tsx       # runs in the Paseo app
  index.server.ts        # runs in a daemon subprocess
  client/greeting.tsx    # the surface component
  client/web.ts          # the only file allowed to touch browser APIs
  server/greeting.ts     # the RPC handler
  shared/greeting.ts     # the RPC contract, imported by both
  package.json
  tsconfig.json
```

각 진입점은 기여를 등록하고 정리 함수를 반환하는 함수 하나를 기본 내보내기합니다.
`index.client.tsx`는 표면과 이를 여는 사이드바 항목을 등록합니다.

```tsx
import type { PluginClientContext } from "@getpaseo/plugin/client";
import { GreetingSurface } from "./client/greeting";

export default function contribute(client: PluginClientContext) {
  client.addSurface("greeting", GreetingSurface);
  client.addSidebarItem({
    id: "greeting",
    title: "Greeting",
    icon: "MessageCircle",
    surface: "greeting",
  });
  return () => {};
}
```

`index.server.ts`는 `shared/greeting.ts`에 있는 계약의 핸들러를 등록합니다.

```ts
import type { PluginServerContext } from "@getpaseo/plugin/server";
import { createGreeting } from "./server/greeting";
import { greetingRpc } from "./shared/greeting";

export default function contribute(server: PluginServerContext) {
  server.handle(greetingRpc, createGreeting);
  return () => {};
}
```

디렉터리가 경계를 결정합니다. `client/` 아래 코드는 앱 번들에만, `server/` 아래 코드는 데몬
번들에만, `shared/` 아래 코드는 양쪽 모두에 컴파일됩니다. 이 경계를 넘는 가져오기, 루트에
코드 파일 추가, 클라이언트 코드에서 `node:` 모듈 가져오기는 컴파일 오류를 일으킵니다.
데몬 측 작업이 없는 플러그인은 `index.server.ts`를 생략할 수 있으며, UI가 없는 플러그인은
`index.client.tsx`를 생략할 수 있습니다.

클라이언트 코드는 브라우저뿐 아니라 휴대폰에서도 실행됩니다. 프로젝트는 DOM 라이브러리 없이 유형 검사를 수행하므로
`client/web.ts` 밖에서는 `document`와 `window`가 오류를 일으킵니다. 이 파일은 `Platform.OS`로 브라우저
API 사용을 제한하고 네이티브 대체 동작을 제공하는 방법을 보여줍니다. UI를 작성하기 전에
[크로스 플랫폼 규칙](/docs/plugins/reference#cross-platform-rules)을 참조하세요.

## 설치하고 사용해 보기

플러그인은 신뢰를 전제로 샌드박스 없이 실행되는 코드입니다. 서버 코드와 준비 명령은 데몬 머신에서
데몬 사용자의 권한으로 실행되고, 클라이언트 코드는 Paseo 앱 안에서 실행됩니다. 플러그인을 설치한다는 것은
해당 코드베이스와 종속성, 향후 업데이트를 신뢰한다는 의미입니다.

플러그인을 설치할 데몬의 **설정 → 플러그인**에서 **플러그인 활성화**를 켜세요. 이는
해당 데몬의 모든 플러그인에 적용되는 전역 스위치입니다. 데몬의 `config.json`에 있는 루트
`pluginsEnabled` 필드이기도 합니다. 파일을 편집한 뒤 `paseo reload --json`으로 적용하세요. 자동화
도구는 이를 켜기 전에 현재 값을 읽고 사용자의 명시적인 허가를 받아야 합니다.

그런 다음 유형 검사를 수행하고 설치하세요.

```bash
npm run typecheck
paseo plugin install /absolute/path/to/workspace-plugin
paseo plugin ls
```

앱에서 디렉터리를 설치할 수도 있습니다.

1. 대상 호스트에서 **설정 → 플러그인**을 엽니다.
2. **플러그인 소스**에 `/absolute/path/to/workspace-plugin`을 붙여 넣습니다.
3. **플러그인 설치**를 선택합니다. 앱은 `paseo-plugin.json`의 플러그인 ID를 사용합니다.

소스 필드에는 Git 저장소, npm 패키지, 플러그인 하위 디렉터리도 사용할 수 있습니다. 허용되는 구문과
해석 규칙은 [플러그인 소스](/docs/plugins/reference#plugin-sources)를 참조하세요. 폼에서 호스트를
업데이트하라고 요청하면 설치하기 전에 해당 호스트를 업데이트하세요. 기존 관리 작업은 계속 사용할 수 있습니다.

설치된 각 플러그인 행에는 상태와 설명이 표시됩니다. 스위치로 플러그인을 활성화하거나 비활성화하고,
점 3개 메뉴에서 설정, 로그, 다시 로드, 제거를 사용할 수 있습니다.

`paseo plugin ls`에서 플러그인 상태가 `running`으로 표시되어야 합니다. Paseo를 열고 사이드바에서
**인사**를 선택한 다음 **인사 만들기**를 누르세요. 데몬 하위 프로세스에서 RPC를 통해
메시지가 반환됩니다.

사이드바 항목이 보이지 않으면 **플러그인 활성화**가 켜져 있는지, 플러그인이 `running` 상태인지,
클라이언트가 플러그인을 설치한 호스트를 보고 있는지 확인하세요. `paseo plugin logs workspace-plugin`은
로드 오류를 포함한 데몬 측 출력을 보여줍니다.

## 작업공간 패널 추가하기

작업공간 패널은 에이전트, 터미널, 파일 옆에 탭으로 열립니다. `client/overview.tsx`를 만드세요.

```tsx
import { type PluginWorkspacePanelProps, useWorkspace } from "@getpaseo/plugin/client";
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

`useWorkspace`는 RPC 없이 앱의 캐시된 상태에서 패널이 렌더링하는 필드를 읽으며,
관련 없는 필드가 변경되어도 다시 렌더링하지 않습니다. 모든 `Text`는 `theme.colors`에서
색상을 가져오고 `layout.compact`에 따라 간격이 결정되므로 모든 Paseo 테마와 휴대폰에서
패널이 작동합니다. 토큰 목록은 [테마 및 레이아웃](/docs/plugins/reference#theme-and-layout)을 참조하세요.

`index.client.tsx`에 다음을 추가하여 패널과 이를 여는 Command Center 항목을 등록하세요.

```tsx
import { WorkspaceOverview } from "./client/overview";

// Inside contribute(client), after the existing registrations:
client.addWorkspacePanel({
  id: "overview",
  title: "Workspace overview",
  icon: "PanelsTopLeft",
  context: "workspace",
  locations: ["workspace", "explorer"],
  Component: WorkspaceOverview,
});
client.addCommandCenterItem({
  id: "open-overview",
  title: "Open workspace overview",
  icon: "PanelsTopLeft",
  context: "workspace",
  onSelect({ openPanel }) {
    openPanel("overview");
  },
});
```

`icon`은 [Lucide](https://lucide.dev/icons/) 아이콘 이름입니다.

## 편집하고 다시 로드하기

소스 변경은 플러그인을 다시 로드해야 적용됩니다.

```bash
npm run typecheck
paseo plugin reload workspace-plugin
```

다시 로드하면 이전 플러그인을 중지하고 정리를 실행한 다음 현재 소스를 컴파일하여 다시 시작합니다.
다시 로드에 실패하면 실패 상태를 유지하고 `paseo plugin ls`에 오류가 표시됩니다. 소스를 수정하고
다시 로드하세요.

작업공간을 열고 macOS에서는 **⌘K**, Windows와 Linux에서는 **Ctrl+K**를 누른 다음 **작업공간
개요 열기**를 선택하세요. 패널이 작업공간 탭으로 열립니다.

## 게시된 플러그인 설치하기

데몬 호스트에서 npm으로 신뢰할 수 있는 npm 플러그인을 설치하세요.

```bash
paseo plugin install npm:@acme/paseo-review@1.2.0
```

또는 같은 식별자를 **설정 → 플러그인 → 플러그인 소스**에 붙여 넣고 **플러그인 설치**를 선택하세요.
설치된 행은 매니페스트 ID를 사용하며 디렉터리 플러그인과 동일한 활성화 스위치, 로그, 다시 로드, 제거
작업을 제공합니다. 가져올 때는 npm이 필요하지만, 이후 로드 및 다시 로드는 설치된 파일을 사용합니다.

식별자 구문은 [플러그인 소스](/docs/plugins/reference#plugin-sources)를 참조하세요. 자체 플러그인을
공유하려면 [플러그인 게시하기](/docs/plugins/publishing)를 따르세요.

Git 저장소에 게시된 플러그인은 단축 표기 또는 URL로 설치합니다.

```bash
paseo plugin add owner/repository
paseo plugin add https://gitlab.com/group/repository.git
paseo plugin add owner/monorepo:plugins/workspace
paseo plugin add owner/repository --ref main
```

플러그인이 저장소 루트 아래에 있으면 `:relative/path`를 덧붙이세요. `--ref`는 처음 설치할 Git
콘텐츠를 한 번 선택하며, 생략하면 기본 HEAD를 설치합니다. 정확한 구문은
[소스 참조](/docs/plugins/reference#plugin-sources)를 확인하세요.

```bash
paseo plugin ls
paseo plugin update workspace-plugin
paseo plugin update --all
```

`ls`는 원격에 연결하지 않고 소스 식별 정보와 현재 설치된 리비전을 보고합니다. `update`는 제안된
npm 또는 Git 리비전을 보여주고 승인을 요청합니다. npm은 더 최신인 latest 릴리스를 제안하고, Git은
처음 설치할 때 선택한 값과 관계없이 현재 기본 HEAD를 제안합니다. 미리 보기만 하려면 `--check`, 질문
없이 승인하려면 `--yes`를 사용하세요. 명시적 대상과 일괄 업데이트는
[CLI 참조](/docs/plugins/reference#cli-reference)를 확인하세요.

## 백엔드 로그 읽기

데몬 측 핸들러와 정리 코드에서는 일반 Node 로깅을 사용할 수 있습니다.

```ts
console.log("Refreshing issues");
console.error("Issue refresh failed", error);
```

**설정 → 플러그인**에서 플러그인의 점 3개 메뉴를 열고 **로그**를 선택하거나 CLI에서 최근 출력을
읽으세요.

```bash
paseo plugin logs workspace-plugin
paseo plugin logs workspace-plugin --json
```

로그 테일에는 `[paseo]` 로드 중, 준비, 중지 중, 중지됨 항목과 컴파일 및 로드 실패가
포함되며, 다시 로드하거나 충돌해도 유지됩니다. 클라이언트 측 출력은 앱에 남습니다. 보존 정책과
로그에 기록하지 말아야 할 내용은 [백엔드 출력 디버깅](/docs/plugins/reference#debug-backend-output)을
참조하세요.

## 다음

- [플러그인 게시하기](/docs/plugins/publishing): npm, 비공개 레지스트리 또는 Git을 통해 공유합니다.
- [공급자 플러그인 만들기](/docs/plugins/providers): 에이전트를 직접 또는 ACP를 통해 연결하고, 공급자 소유 타임라인 항목을 렌더링하고, 테스트하고, 게시합니다.
- [플러그인 참조](/docs/plugins/reference): 모든 기여 유형과 해당 필드, 런타임
  모듈, 호스트, CLI를 설명합니다.
- [플러그인을 런타임 진입점으로 마이그레이션하기](/docs/plugins/migration): 단일 `index.ts`
  진입점을 사용해 작성한 플러그인을 단계별로 이전합니다.
- [TypeScript SDK](/docs/sdk): 클라이언트 및 서버 코드에서 `paseo`로 사용할 수 있는 작업공간,
  에이전트, 공급자, 구성 API를 설명합니다.
