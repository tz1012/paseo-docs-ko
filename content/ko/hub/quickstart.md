---
title: Hub quickstart
description: Connect Hub, create a project, and run a workflow from a GitHub comment.
nav: Quickstart
order: 61
category: Hub
---

# 허브 빠른 시작

## 1. 프로젝트 생성

Hub에서 **연결**을 열고 GitHub 계정이나 리포지토리를 사용하는 조직을 연결하세요. 그런 다음 **프로젝트 → 새 프로젝트**를 열고 프로젝트를 만듭니다.

## 2. 로그인 후 데몬 연결

에이전트를 실행할 머신에서:

```sh
paseo hub login https://your-hub.example.com
paseo hub projects
paseo hub connect
```

브라우저 로그인을 승인합니다. `projects`은 `deploy`에 필요한 슬러그를 보여줍니다. CLI 로그인과 데몬 관계 간의 구분은 [데몬](/docs/hub/daemons)을 참조하세요.

## 3. 번들 추가

다음 파일을 만듭니다.

```text
.paseo/
├── hub.yml
└── workflows/
    └── github-help.yml
```

`.paseo/hub.yml`은 프로젝트 전체 리소스의 이름을 지정합니다.

```yaml
environments:
  dev:
    kind: daemon
    daemon: my-daemon
    cwd: /Users/you/code/your-repo
agents:
  codex:
    provider: codex
    mode: full-access
```

`.paseo/workflows/github-help.yml`에는 하나의 트리거와 순서가 지정된 단계가 포함되어 있습니다.

```yaml
name: github-help
on: github.issue_comment
max_runtime: 2h
filters:
  repo: yourname/your-repo
  contains: "@paseo"
  from_users: [your-github-login]
steps:
  - id: work
    environment: dev
    max_runtime: 90m
    idle_timeout: 10m
    agent: codex
    prompt:
      - text: |
          Complete this request and call hub.finish_execution when done.

          <user-prompt>
          ${{ paseo.prompt }}
          </user-prompt>
```

`daemon`은 Hub가 표시하는 데몬 슬러그입니다. `cwd`은 해당 머신의 디렉터리입니다. `${{ paseo.prompt }}`은 공급자 표시와 선언된 입력 헤더가 제거된 후 정규화된 요청 텍스트입니다.

워크플로 파일은 `.paseo/workflows/`의 직접 `.yml` 하위 항목으로 검색됩니다. `hub.yml`에 나열되지 않습니다.

## 4. 검증 및 배포

프로젝트 루트에서:

```sh
paseo hub deploy -p your-project --dry-run
paseo hub deploy -p your-project
```

테스트 실행은 개정판을 기록하거나 활성화하지 않고 동일한 검색 및 서버측 검증을 수행합니다. 자격 증명, 진단 및 GitHub 동기화는 [구성](/docs/hub/configuration)을 참조하세요.

## 5. 트리거

`from_users` 계정의 댓글:

```text
@paseo have a look at this
```

라우팅 및 실행을 보려면 프로젝트의 **활동** 탭을 엽니다. 아무것도 실행되지 않으면 [활동 체크리스트](/docs/hub/activity)를 사용하세요.

허용 목록을 확대하거나 쓰기 권한을 부여하기 전에 [허브 보안](/docs/hub/security)을 읽어보세요.

더 이상 로컬 CLI 로그인이 필요하지 않은 경우:

```sh
paseo hub logout
```

로그아웃해도 데몬 연결이 끊어지지 않습니다. 데몬이 활성 CLI 로그인과 동일한 허브에 연결된 경우 `paseo hub logout --disconnect-daemon`을 사용하여 두 관계를 모두 제거합니다.

## 다음

[single-repo-team-bot](https://github.com/getpaseo/hub/tree/main/examples/single-repo-team-bot)은 분류자, 작업자 및 공유 프롬프트 부분을 포함하여 세 제공자를 모두 포괄하는 완전한 번들입니다.