---
title: Daemons in Hub
description: Enroll a machine with Hub, reference it from configuration, and understand what Hub owns once it is connected.
nav: Daemons
order: 63
category: Hub
---

# 허브의 데몬

데몬은 Paseo 데몬을 실행하는 머신 중 하나입니다. 허브 조직에 한 번 등록하면 모든 프로젝트에서 이를 참조할 수 있습니다.

## 연결

먼저 컴퓨터에서 로그인하세요.

```sh
paseo hub login https://hub.example.com
```

CLI는 URL과 확인 코드를 인쇄하고 브라우저를 엽니다. 승인된 로그인은 `PASEO_HOME` 아래에 저장됩니다.

대화형 터미널에서는 이어서 설정을 마칠지 묻습니다. 이 데몬을 연결할지, 시작용 워크플로를 초기화해 배포할지 선택하며 둘 다 기본값은 예입니다. 연결을 거부하면 연결만으로는 프로젝트에 워크플로가 생기지 않으므로 `paseo hub connect <origin>; then paseo hub init`을 출력합니다. 시작용 워크플로만 거부하면 `paseo hub init`을 출력합니다. `--json` 또는 비 TTY 로그인은 로그인만 수행합니다. [빠른 시작](/docs/hub/quickstart)에서 각 질문을 설명합니다.

거부했거나 머신에 이미 로그인한 경우 데몬을 별도로 등록합니다.

```sh
paseo hub connect
```

`connect`은 활성 로그인을 사용하여 일회용 등록 토큰을 요청합니다. 데몬은 이를 자신의 관계 자격 증명으로 교환합니다. CLI 로그인은 데몬 권한으로 저장되지 않습니다.

Hub는 호스트 이름에서 데몬의 초기 슬러그를 파생합니다. 해당 슬러그가 조직에서 이미 사용되고 있는 경우 Hub는 짧은 데몬 ID 접미사를 추가합니다. 나중에 Hub에서 데몬의 이름을 바꿀 수 있습니다.

각 데몬에는 변경할 수 없는 생성 ID와 친숙한 슬러그라는 두 가지 식별자가 있습니다. Hub는 하이픈으로 결합된 소문자 단어로 슬러그를 정규화하므로 `Build Studio`은 `build-studio`이 됩니다. 슬러그는 대시보드에 표시되는 내용과 구성 참조 내용입니다.

나중에 데몬 ID를 변경하지 않고도 슬러그 이름을 바꿀 수 있습니다. 구성이 활성화된 후 이름을 바꾸는 것은 해당 구성을 업데이트하는 것을 의미합니다.

무인 설정의 경우 조직 API 키를 저장하지 않고 전달하세요.

```sh
PASEO_HUB_URL=https://hub.example.com PASEO_HUB_API_KEY=paseo_pk_... paseo hub connect
```

원본 우선 순위는 명시적 `[origin]`, `PASEO_HUB_URL`, 활성 저장된 로그인, `https://hub.paseo.sh` 순입니다. 명시적인 `--api-key <secret>`은 환경 및 정확한 출처에 저장된 로그인보다 우선합니다.

확인하고 실행 취소하세요.

```sh
paseo hub status
paseo hub disconnect
paseo hub disconnect --force   # drop local authority when Hub is unreachable
```

하나의 데몬에는 하나의 허브 관계가 있습니다. 이미 데몬이 있는 데몬의 연결은 거부됩니다.

`paseo hub logout`은 활성 CLI 로그인을 제거합니다. 데몬의 관계는 별도의 ID이며 연결된 상태를 유지합니다.

대화형 터미널에서 로그아웃은 동일한 허브에 등록된 데몬의 연결을 끊도록 제안합니다. 수락하면 먼저 연결이 끊어진 다음 로그인이 삭제되므로 연결 끊기가 실패해도 자격 증명이 유지됩니다. 거부하면 로그인만 제거됩니다.

비대화형 및 `--json` 로그아웃은 암시적으로 연결을 끊지 않습니다.

```sh
paseo hub logout --disconnect-daemon           # remove both identities
paseo hub logout --disconnect-daemon --force   # drop local authority when Hub is unreachable
```

## 구성에서 참조하세요.

```yaml
environments:
  dev:
    kind: daemon
    daemon: my-macbook
    cwd: /Users/you/code/your-repo
```

`daemon`은 친근한 슬러그입니다. 구성이 활성화되면 변경할 수 없는 데몬 ID로 확인되므로 더 이상 존재하지 않는 데몬은 디스패치 시 실패하는 대신 활성화에 실패합니다.

`cwd`은 해당 머신의 경로입니다. Hub는 사용자를 위해 어떤 것도 복제하지 않습니다. 디렉터리가 이미 존재해야 합니다.

작업 트리에서 실행을 유지하려면 작업 트리를 추가하세요.

```yaml
worktree:
  mode: branch-off
  newBranch: trigger-${{ paseo.execution.id }}
  base: origin/main
```

`${{ paseo.execution.id }}`는 실행의 UUID로 렌더링되므로, 각 실행에는 `origin/main`에서 분기한 고유한 브랜치가 생성됩니다.

`newBranch`가 허용하는 값은 [환경 필드](/docs/hub/configuration/hub-yml#environments)를 참조하세요. 설정 후크 및 스크립트는 [Git 작업 트리](/docs/worktrees)를 참조하세요.

## 허브가 소유한 것

파견된 에이전트의 경우 허브는 생성, 재연결 복구, 출력 관찰 및 완료를 소유합니다. 직접 시작한 에이전트는 그대로 유지됩니다.

Hub가 생성 응답을 잃거나 데몬이 실행 중에 다시 시작되면 Hub는 동일한 실행 ID를 사용하여 동일한 생성 인텐트를 다시 보냅니다. 데몬은 프롬프트를 다시 실행하는 대신 기존 에이전트를 반환합니다. 닫혔거나 오류가 발생한 에이전트는 중단된 것으로 기록됩니다. Hub는 자동으로 두 번째 작업을 시작하지 않습니다.

## 상태

| 상태 | 의미 |
| ----------------- | --------------------------------- |
| 승인 필요 | CLI가 코드 승인을 기다리고 있습니다 |
| 연결됨 | 온라인 및 파견접수 |
| 오프라인 | 등록되었지만 현재 연결되어 있지 않음 |
| 취소됨 | 허브에서 액세스가 제거됨 |

데몬이 오프라인일 때 도착하는 이벤트는 `daemon_not_connected`을 사용하여 전달에 실패합니다. 나중에 대기할 항목이 없습니다. 이벤트가 프로젝트 활동에 있으며 트리거가 다시 실행되어야 합니다.

**데몬 → 데몬 취소**에서 취소하면 허브 측의 관계가 종료됩니다. 데몬은 로컬 에이전트를 계속 실행합니다.
