---
title: Git worktrees
description: Run agents in isolated git worktrees with setup hooks, scripts, and long-running services.
nav: Git worktrees
order: 11
category: Workspaces
---

# Git 작업 트리

Git 작업 트리는 일종의 작업 공간입니다.

[작업공간](/docs/workspaces)은 작업이 이루어지는 장소입니다. 해당 작업 공간이 git 작업 트리로 지원되면 Paseo는 별도의 분기에 별도의 디렉터리를 생성하므로 병렬 에이전트가 서로 밟지 않습니다.

이 페이지에서는 작업 트리가 있는 위치, 분기 선택 방법, `paseo.json`을 통해 설정 후크, 스크립트, 터미널 및 장기 실행 서비스를 구성하는 방법 등 Git 관련 세부 정보를 다룹니다.

## 레이아웃 및 작업 흐름

작업 트리는 기본적으로 `$PASEO_HOME/worktrees/` 아래에 있으며 소스 체크아웃 경로의 해시로 그룹화됩니다. `config.json`에서 `worktrees.root`을 사용하여 기본 디렉터리를 변경할 수 있습니다. 각 작업 트리는 작업 공간이 생성될 때 슬러그와 분기를 얻습니다.

```
~/.paseo/worktrees/
└── 1vnnm9k3/               # hash of source checkout path
    ├── tidy-fox/           # worktree slug
    └── bold-owl/
```

사용자 정의 루트를 사용하면 Paseo는 해당 디렉토리 아래에 동일한 해시 레이아웃을 유지합니다.

```json
{
  "worktrees": {
    "root": "/mnt/fast/paseo-worktrees"
  }
}
```

1. 작업 트리 격리를 사용하여 작업 공간을 생성하고 Paseo는 작업 트리를 생성하고 설정 후크를 실행합니다.
2. 해당 작업 영역에서 하나 이상의 에이전트를 시작합니다.
3. 기본 분기와의 차이점을 검토합니다.
4. 작업공간을 병합하거나 보관합니다. 이를 사용하는 마지막 작업 공간이 보관된 후 Paseo는 분해를 실행하고 작업 트리를 제거합니다.

## 작업 트리 기반 작업 공간 만들기

아래 예에서는 현재 디렉터리를 소스 체크아웃으로 사용합니다. `--path ~/dev/my-app`을 전달하여 다른 체크아웃에서 작업공간을 생성하세요.

기본 분기에서 분기합니다.

```bash
paseo workspace create \
  --isolation worktree \
  --mode branch-off \
  --new-branch feature/auth \
  --worktree-slug feature-auth \
  --base origin/main
```

`main` 대신 `origin/main`을 사용하세요. Paseo는 백그라운드에서 원격 참조를 가져오므로 원격 추적 분기는 최신이고 로컬 `main`은 마지막으로 가져온 것입니다. 정규화되지 않은 `main`은 먼저 해당 로컬 분기로 확인되고 작업 트리는 오래된 기록에서 시작됩니다. 가져온 참조의 원격 이름을 명시적으로 접두사로 지정합니다.

기존 지점을 확인하세요.

```bash
paseo workspace create \
  --isolation worktree \
  --mode checkout-branch \
  --branch feature/existing \
  --worktree-slug existing-copy
```

또는 자체 작업공간에서 풀 요청을 엽니다.

```bash
paseo workspace create \
  --isolation worktree \
  --mode checkout-pr \
  --pr-number 2186
```

Paseo가 소스 체크아웃에서 위조품을 추론할 수 없는 경우 `--forge <name>`을 추가하세요.

## paseo.json

저장소 루트에 `paseo.json`을 삭제하세요. Paseo는 선택한 기본 브랜치의 커밋된 버전에서 이를 읽으므로 다른 브랜치의 커밋되지 않은 변경 사항은 적용되지 않습니다.

```json
{
  "worktree": {
    "setup": "npm ci",
    "teardown": "rm -rf .cache"
  },
  "scripts": {
    "test": { "command": "npm test" },
    "web": { "command": "npm run dev", "type": "service", "port": 3000 }
  }
}
```

## 설정 및 해제

`setup`은 작업 트리가 생성된 후 한 번 실행됩니다. 새로운 작업 트리에는 설치된 종속성이 없고 무시되는 파일(예: `.env`)이 없으므로 설정을 사용하여 필요한 것을 설치하고 복사하세요. `teardown`은 디렉터리가 제거되기 전에 보관 중에 실행됩니다.

```json
{
  "worktree": {
    "setup": "npm ci\ncp \"$PASEO_SOURCE_CHECKOUT_PATH/.env\" .env\nnpm run db:migrate",
    "teardown": "npm run db:drop || true"
  }
}
```

두 필드 모두 여러 줄의 쉘 스크립트 또는 명령 배열을 허용합니다. 명령은 어느 쪽이든 순차적으로 실행됩니다.

명령은 작업 트리에서 `cwd`으로 실행됩니다. 원래 체크아웃의 파일(추적되지 않는 구성, 로컬 캐시 등)에 접근하려면 `$PASEO_SOURCE_CHECKOUT_PATH`을 사용하세요.

## 스크립트 및 서비스

`scripts`은 요청 시 작업 트리 내에서 실행할 수 있는 명명된 명령입니다. 하나를 _service_로 표시하면 Paseo는 이를 장기 실행 프로세스로 감독하고 포트를 할당하며 데몬의 역방향 프록시를 통해 HTTP 트래픽을 라우팅합니다.

앱에서 실행하거나 [`paseo script`](/docs/cli#workspace-scripts) 및 [workspace-script MCP 도구](/docs/mcp#workspace-scripts)를 사용하여 자동화에서 관리하세요.

### 일반 스크립트

```json
{
  "scripts": {
    "test": { "command": "npm test" },
    "lint": { "command": "npm run lint" },
    "generate": { "command": "npm run codegen" }
  }
}
```

### 서비스

```json
{
  "scripts": {
    "web": {
      "type": "service",
      "command": "npm run dev -- --port $PASEO_PORT",
      "port": 3000
    },
    "api": {
      "type": "service",
      "command": "npm run api -- --port $PASEO_PORT"
    }
  }
}
```

Paseo가 토큰을 자동 할당하도록 하려면 `port`을 생략하세요. 하드 코딩하는 대신 프로세스를 `$PASEO_PORT`에 바인딩하면 각 작업 트리에 고유한 포트가 부여되므로 동일한 서비스의 여러 복사본이 공존할 수 있습니다.

### 동적 포트 할당

기본적으로 Paseo는 OS에 사용 가능한 임시 포트를 요청합니다. 전역적으로 범위를 구성합니다.
`~/.paseo/config.json` 또는 `paseo.json`의 프로젝트별:

```json
// ~/.paseo/config.json
{
  "worktrees": {
    "servicePorts": { "range": "3000-4000" }
  }
}
```

```json
// paseo.json
{
  "worktree": {
    "servicePorts": { "range": "3000-4000" }
  }
}
```

범위는 포함됩니다. 프로젝트 `servicePorts` 블록이 전역 블록을 대체합니다. 명시적인
서비스 `port`는 항상 두 설정 중 하나보다 우선합니다.

외부 할당자의 경우 대신 `portScript`을 구성합니다.

```json
{
  "worktree": {
    "servicePorts": { "portScript": "/usr/bin/portmake" }
  }
}
```

Paseo는 서비스 이름, 작업 공간이라는 네 가지 인수를 사용하여 작업 공간 디렉터리에서 실행 파일을 실행합니다.
ID, 분기 이름, 작업 트리 경로입니다. 스크립트는 셸 없이 직접 실행되므로 `portScript`은 인라인 셸 명령이나 파이프라인이 아닌 실제 실행 파일(예: 컴파일된 바이너리 또는 `#!/bin/bash`과 같은 적절한 shebang 줄이 있는 스크립트)을 가리켜야 합니다. 셸 평가 또는 파이프라인이 필요한 경우 작은 실행 가능 스크립트로 래핑하세요. 누락된 분기는 빈 문자열로 전달됩니다. 동일한 값
`PASEO_SCRIPTNAME`, `PASEO_WORKSPACE_ID`, `PASEO_BRANCH_NAME`으로 사용 가능하며
`PASEO_WORKTREE_PATH`. 하나의 유효한 TCP 포트를 stdout으로 인쇄해야 합니다. `portScript`이(가) `range`을(를) 이겼습니다.
같은 블록. Paseo는 외부 할당자를 신뢰하므로 반환된 포트가 이미 사용 중일 수 있습니다.
Paseo가 연결할 서비스의 예입니다.

### 역방향 프록시

모든 서비스는 결정적 호스트 이름에서 데몬을 통해 접근할 수 있습니다.

```
http://<script>--<branch>--<project>.localhost:<daemon-port>

# on the default branch, the branch label is dropped:
http://<script>--<project>.localhost:<daemon-port>
```

`*.localhost`은 최신 시스템에서 `127.0.0.1`으로 확인되므로 이러한 URL은 기본적으로 작동합니다. 프록시는 WebSocket 업그레이드를 지원합니다.

### 서비스 간

동일한 작업 영역에서 시작된 서비스는 서로의 포트와 프록시 URL을 확인합니다. 위의 `web` 및 `api`이 주어지면 각 프로세스는 다음을 얻습니다.

```
PASEO_PORT=3000                         # this service's port
PASEO_URL=http://web--my-app.localhost:6767  # this service's proxy URL
PASEO_SERVICE_API_PORT=51732
PASEO_SERVICE_API_URL=http://api--my-app.localhost:6767
PASEO_SERVICE_WEB_PORT=3000
PASEO_SERVICE_WEB_URL=http://web--my-app.localhost:6767
```

스크립트 이름은 대문자이고 영숫자가 아닌 이름은 `_`이 됩니다. 포트를 하드 코딩하는 대신 프런트엔드를 `$PASEO_SERVICE_API_URL`으로 지정하세요.

## 터미널

작업 트리가 생성되면 자동으로 터미널을 엽니다. 로그를 추적하거나 REPL을 준비된 상태로 두는 데 유용합니다.

```json
{
  "worktree": {
    "terminals": [
      { "name": "logs", "command": "tail -f dev.log" },
      { "name": "shell", "command": "bash" }
    ]
  }
}
```

## 환경 변수

설정, 해체, 스크립트 및 서비스는 모두 다음을 참조하십시오.

- `$PASEO_SOURCE_CHECKOUT_PATH`, 원래 저장소 루트
- `$PASEO_WORKTREE_PATH`, 작업 트리 디렉터리
- `$PASEO_BRANCH_NAME`, 작업 트리의 분기
- `$PASEO_WORKTREE_PORT`, 기존 작업 트리별 포트(`$PASEO_PORT` 내부 서비스 선호)

서비스는 추가로 다음을 제공합니다.

- `$PASEO_PORT`, 본 서비스에 할당된 포트
- `$PASEO_URL`, 본 서비스의 프록시 URL
- `$PASEO_SERVICE_<NAME>_PORT` / `_URL`, 피어 서비스 포트 및 URL
- 로컬 전용 데몬의 경우 `$HOST`, `127.0.0.1`, 데몬이 모든 인터페이스를 바인딩하는 경우 `0.0.0.0`

## 작업공간 관리

```bash
paseo workspace ls
paseo run --workspace <workspace-id> "implement auth"
paseo workspace archive <workspace-id>
```

일반적인 경우 `paseo run --new-workspace worktree --worktree-mode branch-off --new-branch feature/auth --base origin/main "implement auth"`은 작업공간과 첫 번째 에이전트를 모두 생성합니다.