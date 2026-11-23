---
title: GitHub access
description: Grant a Hub trigger a scoped GitHub installation token and isolated git configuration.
nav: GitHub access
order: 72
category: Hub
---

# GitHub 액세스

트리거는 기본적으로 `GH_TOKEN` 또는 git push 권한을 부여하지 않습니다. 에이전트가 분기 푸시, 풀 요청 열기 또는 문제 편집을 위해 `git` 또는 `gh` 액세스가 필요한 모든 트리거에 `run.github` 블록을 추가합니다.

```yaml
name: implement-request
on:
  github.issue_comment_created:
    connection: acme-github
    filters:
      repo: acme/project
      contains: "@paseo"
      from_users: [maintainer]
run:
  target:
    daemon: devbox
    cwd: /workspace/project
    worktree:
      mode: branch-off
      newBranch: trigger-${{ paseo.execution.id }}
      base: origin/main
  agent:
    provider: codex
    mode: full-access
  max_runtime: 90m
  idle_timeout: 10m
  github:
    connection: acme-github
    repositories: [acme/project]
    permissions:
      contents: write
      pull_requests: write
  prompt: |
    Implement the request, push a branch, and open a pull request with gh.
    Reply with the PR link using reply, then call finish_execution.

    <user-prompt>
    ${{ paseo.prompt }}
    </user-prompt>
```

`run.github`은 Linear, Slack, Discord, 일정 및 웹후크를 포함한 모든 트리거 소스에서 작동합니다.

## 필드

| 필드 | 메모 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `connection` | **Integrations**의 GitHub 통합 슬러그입니다.                                                                                                |
| `repositories` | 토큰이 도달할 수 있는 저장소. GitHub에서 트리거된 실행에서는 기본값이 트리거 리포지토리로 설정됩니다. 기타 이벤트에 필요합니다.           |
| `permissions` | `contents`, `pull_requests` 및 `issues`(`read`, `write` 또는 `admin`)과 같은 설치 토큰 권한입니다. 기본값은 `contents: read`입니다. |
| `duration` | `1h`까지의 긍정적인 토큰 수명. 기본값은 GitHub의 최대값인 `1h`입니다.                                                                       |

요청된 권한은 GitHub 앱 설치에서 허용하는 권한을 초과할 수 없습니다.

트리거를 저장하거나 배포하면 Hub는 `run.github` 스키마, GitHub 이벤트 필터(`on.github.*`) 및 에이전트 구성의 유효성을 검사합니다. Hub는 실행이 시작될 때 `run.github.connection`을 조회하고 설치 토큰을 생성하므로 존재하지 않는 슬러그, 연결할 수 없는 저장소 또는 초과 권한은 배포 시가 아닌 실행 시 실패합니다.

## 에이전트 환경

`run.github`이 있으면 Hub는 단기 GitHub 앱 설치 토큰을 생성하고 `GH_TOKEN`과 프로세스 범위 git 구성을 에이전트 환경에 주입합니다.

- `user.name`으로 앱 봇 로그인을 사용하고 `user.email`으로 `<app-id>+<bot-login>@users.noreply.github.com`을 사용하여 커밋합니다.
- `git@github.com:` 및 `ssh://git@github.com/` 원격이 HTTPS에 다시 작성됩니다.
- `gh auth git-credential`은 git 작업에 대한 자격 증명을 제공합니다.
- 사용자 전역 및 시스템 Git 구성이 무시되고 대화형 자격 증명 프롬프트가 비활성화됩니다.
- 데몬 호스트의 자체 git ID 및 SSH 자격 증명은 읽거나 변경되지 않습니다.

`GH_TOKEN` 및 Hub의 git 구성 변수는 `run.github`이 구성될 때 예약되므로 `run.env`이 이를 덮어쓸 수 없습니다.

## 지속성과 토큰 수명주기

`run.github` 또는 `run.env`의 연결 토큰을 사용하면 활성 지속 에이전트에 대한 후속 조치가 모든 활성 요청이 완료될 때까지 임대 토큰을 공유합니다. 그런 다음 Hub는 임대된 토큰을 취소하고 다음에 도착하면 새 토큰으로 새로운 에이전트를 시작합니다. 임시 GitHub 토큰을 사용하는 예약된 트리거 또는 웹후크 트리거의 경우 `continuation: { mode: new }`을 선호합니다.

## 기타 연결 값

`run.env`을 사용하여 명시적으로 다른 조직 연결의 값을 에이전트 환경으로 전달할 수 있습니다.

```yaml
run:
  env:
    SOME_TOKEN: "${{ paseo.connections.some-connection.token }}"
```

Hub는 에이전트 환경을 준비할 때 표현을 해결합니다. 호스트 및 권한 경계는 [Hub 보안](/docs/hub/security)을 참조하세요.
