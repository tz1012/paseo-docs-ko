---
title: SDK API reference
description: Public configuration, methods, handles, results, defaults, and lifecycle behavior for @getpaseo/client.
nav: API reference
order: 58
category: TypeScript SDK
---

# SDK API 참조

`@getpaseo/client`에서 지원되는 모든 런타임 값과 TypeScript 유형을 가져옵니다.

## `createPaseoClient(config)`

연결을 열지 않고 클라이언트를 생성합니다.

필수 구성:

| 필드 | 유형 | 의미 |
| ----- | -------- | ------------------------------ |
| `url` | `string` | `/ws`을 포함한 데몬 WebSocket 엔드포인트. |

일반적인 선택적 구성:

| 필드 | 유형 | 기본값 | 의미 |
| ---------- | ------------- | -------------- | ------------------------------------------------ |
| `clientId` | `string` | 생성됨 | 로그 및 구독에 대한 안정적인 식별자입니다.    |
| `password` | `string` | 설정되지 않음 | 데몬 비밀번호.                                 |
| `authHeader` | `string` | 설정되지 않음 | 프록시에 대한 인증 헤더 값을 완료하세요. |
| `connectTimeoutMs` | `number` | 클라이언트 기본값 | 연결 마감일.                             |
| `reconnect.enabled` | `boolean` | 클라이언트 기본값 | 예상치 못한 연결 끊김 후 다시 연결하세요.        |
| `reconnect.baseDelayMs` | `number` | 클라이언트 기본값 | 초기 재연결 지연.                         |
| `reconnect.maxDelayMs` | `number` | 클라이언트 기본값 | 최대 재연결 지연.                         |
| `logger` | `PaseoLogger` | 설정되지 않음 | 디버그, 정보, 경고 및 오류 싱크.            |

Relay E2EE 클라이언트는 `e2ee.enabled` 및 `e2ee.daemonPublicKeyB64`을 전달할 수도 있습니다. `appVersion`, `runtimeGeneration` 및 런타임 메트릭 옵션은 Paseo 클라이언트 표면에 존재합니다. 일반적인 통합에서는 이를 생략할 수 있습니다.

## 클라이언트 수명주기

| 방법 | 결과 | 행동 |
| --------- | ----------------- | ------------------------------------------------------------ |
| `connect()` | `Promise<void>` | 데몬이 서버 정보를 보낸 후 확인됩니다.                   |
| `close()` | `Promise<void>` | 연결을 닫고 이 클라이언트를 삭제합니다.                           |
| `ensureConnected()` | `void` | 클라이언트가 연결되어 있지 않으면 발생합니다.                                    |
| `getConnectionState()` | `ConnectionState` | `idle`, `connecting`, `connected`, `disconnected` 또는 `disposed`을 반환합니다. |

`close()` 뒤에 새 클라이언트를 만듭니다.

## `client.agents`

| 방법 | 결과 | 행동 |
| ------- | --------- | ---------------------------------------------------------------------------------- |
| `list(options?)` | `PaseoAgentListResult` | 에이전트 페이지를 나열합니다. `scope`, `filter`, `sort`, `page` 및 `subscribe`은 데몬 디렉터리 쿼리와 일치합니다. |
| `create(options)` | `PaseoAgentHandle` | `cwd`에 대한 에이전트와 새로운 작업 영역을 만듭니다. `config`이 필요합니다.                                         |
| `ref(agentOrId)` | `PaseoAgentHandle` | 가져오지 않고 로컬 핸들을 만듭니다.                                                                     |
| `subscribe(handler)` | 구독 취소 기능 | 연결-로컬 에이전트 디렉터리 업데이트를 수신합니다. 먼저 `list({ subscribe })`에 전화하세요.                      |

생성 옵션에는 `config`, `cwd`, `parent`, `title`, `prompt`, `env`, `outputSchema`, `images`, `attachments`, `git`, `worktree`, `autoArchive` 및 `labels`.

`config` 수락:

| 필드 | 유형 | 의미 |
| ------------------ | ------------ | ------------------------------------------------------------------------------------------------- |
| `provider` | `string` | `provider/model` 선택이 필요합니다.                                                              |
| `modeId` | `string` | 공급자 작동 또는 권한 모드.                                                            |
| `thinkingOptionId` | `string` | 공급자 추론 수준.                                                                         |
| `featureValues` | `Record<string, unknown>` | `providers.listFeatures`을 통해 발견된 기능의 값입니다.                                  |
| `options` | JSON 객체 | 엄격하게 검증된 공급자 기본 설정입니다. [공급자 옵션](/docs/sdk/provider-options)을 참조하세요. |
| `systemPrompt` | `string` | 추가 시스템 또는 개발자 지침.                                                      |
| `mcpServers` | MCP 서버 맵 | 세션 범위 MCP 서버.                                                                       |
| `toolPolicy` | MCP 도구 정책 | MCP 도구에 대한 정확한 사전 승인 규칙.                                                            |

### 에이전트 핸들

| 회원 | 결과 | 행동 |
| -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `id` | `string` | 안정적인 데몬 에이전트 ID입니다.                                                                           |
| `workspaceId` | `string \| null` | 현재 작업공간 배치.                                                                      |
| `cwd` | `string \| null` | 현재 작업 디렉토리.                                                                        |
| `status` | 에이전트 상태 또는 `null` | 현재 수명주기 상태.                                                                         |
| `current()` | `PaseoAgent \| null` | 이 핸들에서 관찰된 현재 세부 값입니다. 절대 가져오지 않습니다.                                    |
| `refresh(requestId?)` | `PaseoAgentRefetchResult \| null` | 현재 에이전트 및 프로젝트 배치를 가져옵니다.                                                  |
| `send(text, options?)` | `Promise<void>` | 데몬이 프롬프트를 수락하면 해결됩니다.                                                      |
| `run(text, options?)` | `PaseoAgentRunResult` | 프롬프트를 보내고 해당 차례를 기다립니다. `timeoutMs`은 대기 시간을 제어합니다. 기본값은 10분입니다. |
| `waitForFinish(timeoutMs?)` | `PaseoAgentRunResult` | 초기 프롬프트를 포함하여 활성 차례를 기다립니다. 기본 시간 초과: 10분.              |
| `subscribe(handler)` | 구독 취소 기능 | 이 ID에 대한 에이전트 디렉터리 업데이트를 필터링하고 핸들 속성을 새로 고칩니다.                   |
| `archive()` | `{ archivedAt }` | 에이전트를 일시 삭제하고 해당 런타임을 닫습니다.                                                    |
| `detach()` | `Promise<void>` | 에이전트를 중지하지 않고 상위 관계를 제거합니다.                                       |

`PaseoAgentRunResult`에는 `status`, `final`, `error` 및 `lastMessage`이 포함됩니다. `final`은 핸들이 있는 경우 핸들을 새로 고칩니다.

### 타임라인 핸들

`agent.timeline.refetch(options?)`이 페이지를 가져옵니다. 옵션은 `direction`, `cursor`, `limit`, `projection` 및 `requestId`입니다.

`agent.timeline.subscribe(handler)`은 에이전트에 속한 스트림 이벤트를 수신하고 로컬 구독 취소 기능을 반환합니다.

## `client.workspaces`

| 방법 | 결과 | 행동 |
| ------------------------ | ---------------- | --------------------------------------------------------------------------------- |
| `list(options?)` | `PaseoWorkspaceListResult` | 작업공간 디렉토리를 나열, 필터, 페이징하거나 구독합니다.                  |
| `open(cwd)` | `PaseoWorkspaceHandle` | 디렉토리에 대한 활성 작업공간을 재사용하거나 디렉토리를 생성합니다.                       |
| `create(options)` | `PaseoWorkspaceHandle` | 항상 새로운 디렉터리 지원 또는 Paseo-worktree 작업 공간을 만듭니다.              |
| `ref(workspaceOrId)` | `PaseoWorkspaceHandle` | 로컬 핸들을 만듭니다.                                                           |
| `archive(workspaceOrId)` | `PaseoWorkspaceArchiveResult` | 먼저 핸들을 만들지 않고 보관합니다.                                         |
| `subscribe(handler)` | 구독 취소 기능 | 연결-로컬 작업공간 업데이트를 수신합니다. `list({ subscribe })`에 먼저 전화하세요. |

작업 영역 핸들은 `id`, `projectId`, `directory`, `name`, `status`, `current()`, `refresh()`, `archive()` 및 `subscribe()`을 노출합니다. 작업공간 ID나 디렉터리를 반복하지 않고 에이전트를 생성하려면 `workspace.agents.create(options)`을 사용하세요.

## `client.providers`

| 방법 | 결과 | 행동 |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `waitForReady(options?)` | `PaseoProviderSnapshotResult` | 로드되는 공급자가 없을 때까지 기다립니다. 기본 시간 초과: 60초. 데몬이 작업공간 스냅샷을 상호 연관시킬 수 없는 경우 업데이트 호스트 오류로 거부됩니다. |
| `snapshot(options?)` | `PaseoProviderSnapshotResult` | 현재 카탈로그를 즉시 반환합니다.                                                                                                                 |
| `refresh(options?)` | 승인 | 모든 공급자 또는 선택한 공급자에 대해 카탈로그를 강제로 새로 고칩니다.                                                                                                    |
| `listAvailable()` | 가용성 결과 | 설치된 공급자 가용성을 보고합니다.                                                                                                                 |
| `listModels(provider, options?)` | 모델 결과 | 하나의 공급자 및 디렉터리에 대한 모델을 검색합니다.                                                                                                         |
| `listModes(provider, options?)` | 모드 결과 | 권한 또는 작동 모드를 검색합니다.                                                                                                                 |
| `listFeatures(draftConfig)` | 기능 결과 | 현재 초안 공급자 구성의 기능을 검색합니다.                                                                                         |
| `diagnostic(provider)` | 진단 결과 | 사람이 읽을 수 있는 설정 진단을 반환합니다.                                                                                                                |
| `subscribe(handler)` | 구독 취소 기능 | 카탈로그 업데이트를 수신합니다.                                                                                                                             |

## `client.config`

`config.get(requestId?)`은 데몬의 변경 가능한 구성을 반환합니다.

`config.patch(patch, requestId?)`은 업데이트된 구성을 검증하고 유지하며 반환합니다. 에이전트별 선택이 아닌 호스트 구성을 위해 이 관리 화면을 사용하십시오. 패치는 해당 데몬을 사용하는 모든 클라이언트와 향후 에이전트에 영향을 미칩니다.

## 오류 및 정리

연결, 검증, 거부 및 시간 초과 실패는 해당 약속을 거부합니다. 권한 및 공급자 오류는 예상되는 에이전트 상태이므로 차례 결과는 `PaseoAgentRunResult.status`을 통해 반환됩니다.

항상 `finally`에서 클라이언트를 닫으세요. 클라이언트를 닫으면 로컬 수신기와 네트워크 연결이 제거됩니다. 에이전트를 중지하거나 작업 영역을 보관하지 않습니다.