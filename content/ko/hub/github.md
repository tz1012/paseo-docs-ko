---
title: GitHub access
description: Grant one workflow step a scoped GitHub token and git setup.
nav: GitHub access
order: 65
category: Hub
---

# GitHub 액세스

트리거는 GitHub 자격 증명을 부여하지 않습니다. 저장소 권한이 필요한 단계에 `github` 블록을 추가합니다.

```yaml
name: implement-request
on: github.issue_comment
max_runtime: 2h
filters:
  repo: example/project
  contains: "@paseo"
  from_users: [maintainer]
steps:
  - id: implement
    environment: development
    max_runtime: 90m
    idle_timeout: 10m
    agent: codex
    github:
      connection: example-github
      repositories: [example/project]
      permissions:
        contents: write
        pull_requests: write
    prompt:
      - text: |
          Implement the request, push a branch, and open a pull request with gh.
          Call hub.finish_execution when done.
          ${{ paseo.prompt }}
```

에이전트는 선언된 저장소 및 권한 내에서 `git` 및 `gh`을 사용할 수 있습니다. Hub는 단계가 시작될 때 토큰을 생성하고 실행이 끝나면 취소합니다.

## 필드

| 필드 | 메모 |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `connection` | 프로젝트 GitHub 연결 슬러그.                                                                                                        |
| `repositories` | 토큰이 도달할 수 있는 저장소. GitHub에서 트리거된 실행에서는 기본값이 트리거 리포지토리로 설정됩니다. 다른 제공업체의 경우 필수입니다. |
| `permissions` | `contents`, `pull_requests` 및 `issues`과 같은 설치 토큰 권한. 기본값은 `contents: read`입니다.                        |
| `duration` | 최대 `1h`의 긍정적인 토큰 수명. 기본값은 GitHub의 최대값인 `1h`입니다.                                                                |

요청하는 권한은 GitHub 앱 설치량을 초과할 수 없습니다. 연결, 저장소 또는 권한을 확인할 수 없으면 활성화 및 디스패치가 명확하게 실패합니다.

## 에이전트 환경

Hub는 환경 변수를 통해 `GH_TOKEN` 및 프로세스 범위 git 구성을 제공합니다.

- 커밋은 `user.name`으로 앱 봇 로그인을 사용하고 `user.email`으로 `<app-id>+<bot-login>@users.noreply.github.com`을 사용합니다.
- `git@github.com:` 및 `ssh://git@github.com/` 원격이 HTTPS로 다시 작성됩니다.
- `gh auth git-credential`은 단계에 대한 GitHub 자격 증명을 처리합니다.
- 사용자 전역 및 시스템 Git 구성이 무시되고 터미널 자격 증명 프롬프트가 비활성화됩니다.
- 데몬 호스트의 git ID 및 자격 증명은 읽혀지거나 변경되지 않습니다.

`GH_TOKEN` 및 Hub의 git 구성 변수는 단계에 `github` 블록이 있는 경우 예약됩니다. 워크플로 `env`은 이를 대체할 수 없습니다.

## 작업자에 대한 권한 유지

분류자는 GitHub 권한 없이 신뢰할 수 없는 요청 텍스트를 읽을 수 있습니다. 변경을 수행하는 이후 분기에만 `github` 블록을 배치하세요. [워크플로 라우팅](/docs/hub/workflows#route-from-a-classifier)은 정렬된 분류자/작업자 형태를 보여줍니다.

다른 통합에 대한 연결 값은 명시적인 단계 환경 값으로 유지됩니다.

```yaml
env:
  SOME_TOKEN: "${{ paseo.connections.some-connection.token }}"
```

Hub는 단계의 값을 확인하고 이를 유지하지 않습니다. 공급자 및 호스트 경계는 [허브 보안](/docs/hub/security)을 참조하세요.