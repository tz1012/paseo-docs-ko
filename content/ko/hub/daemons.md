---
title: Daemons in Hub
description: Enroll a Paseo daemon with Hub, grant execution permission, and target it from triggers.
nav: Daemons
order: 63
category: Hub
---

# 허브의 데몬

데몬은 Paseo 데몬을 실행하는 머신 중 하나입니다. Hub 조직에 한 번 등록하고, 실행 권한을 부여하고, 트리거에서 해당 슬러그를 참조하세요.

## 데몬 연결

먼저 컴퓨터에서 로그인하세요.

```sh
paseo hub login https://hub.example.com
```

CLI는 URL과 확인 코드를 인쇄하고 브라우저를 엽니다. 승인 후 Paseo는 조직 범위의 CLI 로그인을 `PASEO_HOME` 아래에 저장합니다.

대화형 터미널에서 `login`은 이 데몬 연결을 제안하고 Hub 자동화가 에이전트를 실행하도록 허용할지 여부를 별도로 묻습니다. 연결의 기본값은 yes이고 실행 권한의 기본값은 no입니다. `--json` 및 TTY 이외의 로그인에는 메시지가 표시되지 않습니다.

로그인 중에 연결을 건너뛴 경우 데몬을 별도로 등록하십시오.

```sh
paseo hub connect
```

`connect`은 활성 로그인을 사용하여 일회용 등록 토큰을 요청합니다. 데몬은 해당 토큰을 자체 관계 자격 증명으로 교환하므로 CLI 로그인은 데몬 권한으로 저장되지 않습니다.

Hub는 `build-studio`과 같이 하이픈으로 연결된 소문자 단어를 사용하여 호스트 이름에서 데몬의 초기 슬러그를 파생합니다. 해당 슬러그가 조직에서 이미 사용된 경우 Hub는 짧은 데몬 ID 접미사를 추가합니다.

나중에 변경할 수 없는 데몬 ID를 변경하지 않고 Hub에서 슬러그의 이름을 바꾼 다음 이전 슬러그를 참조하는 모든 트리거를 업데이트할 수 있습니다.

무인 설정의 경우 환경을 통해 조직 API 키를 전달합니다.

```sh
PASEO_HUB_URL=https://hub.example.com PASEO_HUB_API_KEY=paseo_pk_... paseo hub connect
```

원본 우선순위는 명시적 `[origin]` 또는 `--hub`, `PASEO_HUB_URL`, 활성 저장된 로그인, `https://hub.paseo.sh`입니다. 명시적인 `--api-key <secret>`은 환경 변수 및 저장된 로그인보다 우선합니다.

상태를 확인하거나 데몬 연결을 끊습니다.

```sh
paseo hub status
paseo hub disconnect
paseo hub disconnect --force   # drop local authority when Hub is unreachable
```

하나의 데몬은 한 번에 하나의 Hub 조직에 연결됩니다. 이미 Hub에 속한 데몬의 연결은 거부됩니다.

`paseo hub logout`은 저장된 CLI 로그인을 제거합니다. 대화형 터미널에서는 먼저 동일한 Hub에 연결된 데몬 연결을 끊도록 제안합니다. `--json` 또는 비대화형 모드에서 `logout`은 `--disconnect-daemon`을 전달하지 않는 한 데몬 연결을 끊지 않습니다.

```sh
paseo hub logout --disconnect-daemon
paseo hub logout --disconnect-daemon --force
```

## 실행 권한 부여

데몬을 등록해도 Hub가 해당 데몬에서 에이전트를 시작할 수 없습니다. 해당 머신에서 `hub.execute` 권한을 부여합니다.

```sh
paseo hub permissions list
paseo hub permissions grant hub.execute
paseo hub permissions revoke hub.execute
```

`hub.execute`이 부여될 때까지 Hub는 ID 및 존재 여부에 대해서만 데몬을 추적합니다. **데몬**은 이를 **연결된 전용**으로 표시하고 **홈**은 에이전트를 실행할 수 없다고 표시합니다. `hub.execute`에서 허용하는 내용은 [데몬 권한 선택](/docs/hub/security#choose-daemon-authority)을 참조하세요.

## 트리거에서 데몬을 대상으로 지정

`run.target` 아래의 데몬 슬러그와 기존 작업 디렉터리를 참조하세요.

```yaml
name: repo-triage
on:
  manual.run: {}
run:
  target:
    daemon: my-macbook
    cwd: /Users/you/code/your-repo
  agent:
    provider: codex
    mode: full-access
  prompt: Inspect the repository status and call hub.finish_execution.
```

`daemon`은 트리거를 저장하거나 배포할 때 변경할 수 없는 데몬 ID로 확인됩니다. `cwd`은 해당 머신에 이미 존재하는 절대 경로입니다. Hub는 저장소를 복제하지 않습니다.

작업 트리를 편집하는 대신 자체 git 분기에서 각 실행을 격리하려면 `worktree` 블록을 추가하세요.

```yaml
name: isolate-fix
on:
  manual.run: {}
run:
  target:
    daemon: build-server
    cwd: /workspace/project
    worktree:
      mode: branch-off
      newBranch: trigger-${{ paseo.execution.id }}
      base: origin/main
  agent:
    provider: codex
    mode: full-access
  prompt: Run tests and call hub.finish_execution.
```

`${{ paseo.execution.id }}`은 실행 UUID를 렌더링하여 각 실행에 재시도 및 복구 후에도 유지되는 `origin/main`의 고유한 분기를 제공합니다. [트리거 YAML 참조](/docs/hub/configuration/reference#target-and-worktree) 및 [Git 작업 트리](/docs/worktrees)를 참조하세요.

## 공급자 검색

Hub 트리거 편집기에서 데몬과 작업 디렉터리를 선택하면 Hub는 해당 데몬에게 구성된 공급자, 모델, 실행 모드 및 사고 옵션을 요청합니다.

Hub는 Claude Code, Codex, OpenCode, Pi 및 사용자 정의 또는 플러그인 공급자를 포함하여 Paseo 데몬에 구성된 모든 공급자와 작동합니다.

## 복구 및 소유권

디스패치한 에이전트의 경우 Hub는 생성, 재연결 복구, 출력 추적 및 완료를 소유합니다. 로컬로 시작한 에이전트는 그대로 유지됩니다.

Hub가 생성 응답을 잃거나 데몬이 실행 중에 다시 시작되면 Hub는 동일한 실행 ID를 사용하여 동일한 생성 인텐트를 다시 보냅니다. 데몬은 프롬프트를 두 번 실행하는 대신 기존 에이전트를 반환합니다. 에이전트가 닫히거나 충돌하는 경우 Hub는 실행이 중단된 것으로 표시하고 두 번째 에이전트를 자동으로 시작하지 않습니다.

## 데몬 상태

| 상태 | 의미 |
| ----------------- | ---------------------------------------- |
| 승인 필요 | CLI가 브라우저 승인을 기다리고 있습니다. |
| 연결됨 | 온라인이며 Hub에 연결되어 있습니다.             |
| 오프라인 | 등록되었지만 현재 연결되어 있지 않습니다.   |
| 취소됨 | Hub에서 액세스가 제거되었습니다.             |

데몬이 오프라인인 동안 프롬프트 변경과 같이 동일한 대상 및 에이전트 설정을 유지하는 대시보드 편집 내용을 저장할 수 있습니다. `paseo hub deploy` 및 직접 API 설치에는 해당 편집에도 연결된 대상 데몬이 필요합니다. [트리거 검증](/docs/hub/triggers#saving-checks-the-agent-against-the-daemon)을 참조하세요.

**데몬 → 데몬 취소**에서 취소하면 로컬 에이전트가 실행 중인 상태에서 Hub 측의 관계가 종료됩니다.
