# 사이드바 보기 만들기

사이드바 보기는 Paseo의 헤더와 푸터 사이 콘텐츠를 대체합니다. 테마 토큰, 활성 엔터티 ref 및 탐색 메서드를 받은 뒤 자체 React Native UI를 렌더링합니다. 프로젝트, 작업 기반 에이전트, 중첩 에이전트 및 라벨 폴더를 시험해 보려면 [sidebar-views 예제](https://github.com/getpaseo/paseo/tree/main/plugin-examples/sidebar-views)를 설치하세요.

## 보기 등록

```tsx
import type {
  PluginClientContext,
  PluginSidebarViewProps,
  WorkspaceRef,
} from "@getpaseo/plugin/client";
import { useWorkspaces, useWorkspace } from "@getpaseo/plugin/client";
import { Pressable, ScrollView, Text } from "react-native";

function WorkspaceRow({
  reference,
  navigation,
  theme,
}: {
  reference: WorkspaceRef;
  navigation: PluginSidebarViewProps["navigation"];
  theme: PluginSidebarViewProps["theme"];
}) {
  const workspace = useWorkspace(reference);
  if (!workspace) return null;
  return (
    <Pressable onPress={() => navigation.openWorkspace(reference)}>
      <Text style={{ color: theme.colors.foreground }}>{workspace.title ?? workspace.name}</Text>
    </Pressable>
  );
}
function Workspaces({ navigation, theme }: PluginSidebarViewProps) {
  const workspaces = useWorkspaces({ orderBy: "name" });
  return (
    <ScrollView>
      {workspaces.map((reference) => (
        <WorkspaceRow
          key={reference.key}
          reference={reference}
          navigation={navigation}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
}
export default function contribute(client: PluginClientContext) {
  return client.addSidebarView({ id: "workspaces", title: "My workspaces", Component: Workspaces });
}
```

등록하면 **설정 > 사이드바 > 사이드바 보기** 아래에 옵션이 추가됩니다. 사용자가 이를 선택하며, 플러그인을 설치해도 현재 선택된 보기는 그대로 유지됩니다. 헤더 탐색, 플러그인 헤더 항목, 콜아웃 및 푸터는 계속 표시됩니다. 보기가 없거나 비활성화되면 기본 보기로 대체됩니다. 보기에서 예외가 발생하면 **기본 보기 사용**이 있는 자리표시자가 표시됩니다.

보기는 연결된 호스트 전체에서 한 번 렌더링됩니다. `active.workspace`와 `active.agent`는 ref 또는 `null`입니다. ref와 함께 `navigation.openWorkspace`, `openAgent`, `openTerminal` 또는 `openProject`를 사용하세요. `openProject`는 새 작업공간 흐름을 시작합니다. 탐색하면 컴팩트 사이드바가 닫힙니다. 직접 구현한 탐색 뒤에는 `dismiss()`를 호출하세요.

## ref 쿼리 및 각 행 읽기

`useWorkspaces`, `useAgents`, `useProjects` 및 `useTerminals`는 변경 불가능한 ref 배열을 반환합니다. ref에는 `kind`, `hostId`, `id` 및 호스트 간 `key`가 있습니다. 같은 엔터티는 앱 세션 동안 동일하게 고정된 ref를 유지합니다. 행 안에서 이를 `useWorkspace`, `useAgent`, `useProject` 또는 `useTerminal`에 전달하세요. 삭제된 엔터티는 `null`을 반환합니다.

```tsx
const projects = useProjects({ orderBy: "displayName" }); // Includes empty projects.
const agents = useAgents({
  hosts: [hostId],
  where: (agent) => agent.workspace.key === workspaceRef.key,
  orderBy: ["lastActivityAt", "desc"],
});
const folders = useWorkspaces({
  groupBy: (workspace) => workspace.labels, // A workspace can appear in several folders.
});
```

모든 쿼리는 `hosts`(서버 ID), `where`, `orderBy` 및 `groupBy`를 받습니다. 연결된 모든 호스트를 쿼리하려면 `hosts`를 생략하세요. `orderBy`는 스냅샷 필드, `[field, "asc" | "desc"]` 또는 비교 함수를 받습니다. null 필드는 마지막에 정렬됩니다. 데이터가 변경될 때 실행되므로 비교 함수는 저렴하게 유지하세요. `groupBy`는 문자열, `{ key, title?, color? }` 또는 이러한 값의 배열을 반환합니다. 그룹화된 결과에는 `key`, `title`, `color` 및 `items`가 있습니다. 그룹은 정렬 후 처음 나타난 순서를 따르며, 중복 키는 첫 번째 제목을 사용합니다. 빈 배열을 반환하면 항목이 어느 그룹에도 포함되지 않습니다.

변경되지 않은 ref 시퀀스는 배열 정체성을 유지합니다. 그룹도 메타데이터와 항목 시퀀스가 같으면 정체성을 유지합니다. 작업공간 상태가 변경되면 목록을 다시 렌더링하지 않고 해당 행이 업데이트됩니다. 그룹화가 변경되면 영향받는 그룹이 업데이트됩니다. 인라인 쿼리 객체와 함수도 직접 구독을 관리하지 않고 사용할 수 있습니다.

엔터티 훅은 선택 함수와 선택적 동등성 함수를 받습니다.

```tsx
const workspace = useWorkspace(ref); // Interned snapshot, compared by identity.
const name = useWorkspace(ref, (item) => ({ title: item.title })); // Shallow equality.
const selected = useWorkspace(ref, selector, equals);
```

선택 함수가 없으면 사용자 지정 동등성 함수가 스냅샷을 받습니다. 선택 함수가 있으면 선택 결과를 받습니다. 기존 작업공간 패널은 호스트 로컬 문자열 ID를 `useWorkspace` 및 `useAgent`에 계속 전달할 수 있습니다. 여러 호스트에 걸친 보기에는 ref를 사용하세요. `useHosts()`는 기존 `serverId`, `label` 및 연결 `status` 필드를 유지합니다.

작업공간 스냅샷에는 `project`, `pinnedAt`, `labels`, `background`, `branch`, `lastPromptAt`, `parentAgent` 및 `createdAt`(이전 호스트에서는 null)이 포함됩니다. Paseo가 표시하는 상태를 나타내려면 `indicator`와 현지화된 `indicatorLabel`을 사용하세요. `status`는 원시 데몬 상태로 유지됩니다. 에이전트 스냅샷에는 해당 작업공간과 상위 ref, `background`, `backgroundWork.count`가 포함됩니다. 프로젝트 스냅샷은 `displayName`, `rootPath`, `kind` 및 `iconRevision`을 제공합니다.

## 터미널 나열

터미널 예제는 호스트를 선택하고, 해당 터미널을 나열하며, 터미널 탭에 포커스를 맞추고, 핸들을 통해 터미널을 닫습니다. `useTerminals({ hosts: [hostId] })`에는 `terminalCollection`을 알리는 호스트가 필요합니다. 지원하지 않는 쿼리 대상 호스트에서는 터미널 판독기가 호스트 업데이트 오류를 던지지만 다른 엔터티 훅은 계속 작동합니다. 사용자가 다른 호스트를 선택할 수 있도록 호스트 선택을 오류 경계 밖에 두세요. 연결된 모든 호스트에 기능이 있도록 요구하려면 `hosts`를 생략하세요.

터미널 스냅샷에는 `workspace`, `title`, `isScript` 및 `createdAt`이 포함됩니다. 타임스탬프 추적 이전부터 워커가 활성 상태로 유지한 터미널은 `createdAt: null`입니다. 스크립트 소유권은 작업공간 스크립트 런타임 항목을 따릅니다. 호스트 관찰은 터미널 생성, 종료, 제목 변경 및 재연결을 따르며 마지막 플러그인 구독자가 떠나면 해제됩니다.

## ref로 작업 수행

`usePaseo()`는 ref 기반 작업을 ref의 호스트로 라우팅합니다.

```tsx
const paseo = usePaseo();
await paseo.workspaces.ref(workspaceRef).setPinned(true);
await paseo.workspaces.ref(workspaceRef).setLabel("Later", { assigned: true });
await paseo.workspaces.ref(workspaceRef).setLabel("Inbox", { assigned: false });
paseo.projects.ref(projectRef).open();
await paseo.projects.ref(projectRef).createWorkspace();
paseo.terminals.ref(terminalRef).focus();
await paseo.terminals.ref(terminalRef).kill();
```

작업공간 및 에이전트 핸들은 기존 메서드를 유지합니다. 새 라벨을 할당하면 라벨이 생성되고, 기존 라벨을 할당하면 색상이 유지됩니다. 라벨 폴더 예제는 대상 라벨을 추가한 뒤 소스 라벨을 제거하므로 할당에 실패해도 원래 폴더가 보존됩니다. 이동 제스처와 오류 표시는 예제가 직접 소유합니다.

## 기기에 레이아웃 선택 사항 유지

접힌 폴더 또는 수동 순서에는 `scope: "device"`를 사용하는 [설정 문서](reference.md#settings-screens)를 정의하세요. `useSettings`는 호스트 설정과 동일한 리비전 기반 API를 통해 이를 읽고 씁니다. 기기 문서는 설치본과 설정 ID에 속하고 앱 실행 간에 지속되며 해당 설치본의 클라이언트 표면 전체에서 공유됩니다. 다른 기기에는 동기화되지 않습니다. 클라이언트가 데몬을 통해 공유해야 하는 데이터에는 `scope: "host"`를 사용하세요.

## 앱의 밀도 맞추기

React Native 기본 구성 요소로 렌더링하세요. SDK는 사이드바 보기 행, 섹션, 목록, 배지 또는 드래그 도우미를 내보내지 않습니다. 기존 헤더/푸터 항목 키트는 별도의 표면입니다.

조밀한 행에는 최소 높이 28, 가로 패딩 12, 줄 높이 16인 12포인트 기본 라벨과 11포인트 보조 라벨을 사용하세요. 다음 제공 토큰을 사용하세요.

| 행 요소 | 테마 토큰 |
| ------- | --------- |
| 기본 라벨 | `colors.foreground` |
| 보조 라벨, 섹션 제목 | `colors.foregroundMuted` |
| 선택된 행 채우기 | `colors.surface2` |
| 구분선 | `colors.border` |
| 작업 또는 포커스 강조 | `colors.accent` |
| 성공 표시기 | `colors.statusSuccess` |
| 입력 필요 표시기 | `colors.statusWarning` |
| 실패 표시기 | `colors.statusDanger` |

누를 수 있는 행에는 접근성 라벨을 지정하고 터치 레이아웃에서는 제어 항목을 표시하세요. 예제는 플러그인이 소유한 구성 요소와 보기에 전달된 토큰만 사용합니다.
