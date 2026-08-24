---
title: GitHub triggers
description: Start Hub workflows from specific GitHub issues, pull requests, comments, and labels.
nav: GitHub
order: 67
category: Hub
---

# GitHub 트리거

의미 기반 GitHub 이벤트를 사용해 하나의 특정 GitHub 동작에서 워크플로를 시작하세요. `.paseo/hub.yml`에 `dev` 환경과 `codex` 에이전트가 정의된 저장소에 아래 워크플로를 추가한 뒤 번들을 활성화합니다.

## 새 이슈 분류

`.paseo/workflows/triage-issue.yml`:

```yaml
name: triage-issue
on: github.issue_created
max_runtime: 2h
filters:
  repo: example/project
  from_users: [maintainer]
steps:
  - id: triage
    environment: dev
    max_runtime: 30m
    idle_timeout: 5m
    agent: codex
    github:
      connection: example-github
      repositories: [example/project]
      permissions:
        issues: write
    prompt:
      - text: |
          Triage the new issue. Add the appropriate labels and leave a short comment
          explaining the result with gh. Use this event context:
          ${{ paseo.context }}
          Call hub.finish_execution when done.
```

`github.issue_created`는 누군가 이슈를 열 때만 실행됩니다. `from_users`는 필수이며 이벤트를 발생시킨 GitHub 로그인과 일치합니다.

## 새 끌어오기 요청 검토

`.paseo/workflows/review-pull-request.yml`:

```yaml
name: review-pull-request
on: github.pull_request_created
max_runtime: 2h
filters:
  repo: example/project
  from_users: [maintainer]
steps:
  - id: review
    environment: dev
    max_runtime: 90m
    idle_timeout: 10m
    agent: codex
    github:
      connection: example-github
      repositories: [example/project]
      permissions:
        contents: read
        pull_requests: write
    prompt:
      - text: |
          Review the new pull request and submit your findings with gh. Use this event context:
          ${{ paseo.context }}
          Call hub.finish_execution when done.
```

`github.pull_request_created`는 누군가 끌어오기 요청을 열 때만 실행됩니다.

## 새 댓글에 응답

`.paseo/workflows/respond-to-issue-comment.yml`:

```yaml
name: respond-to-issue-comment
on: github.issue_comment_created
max_runtime: 2h
filters:
  repo: example/project
  contains: "@paseo"
  from_users: [maintainer]
steps:
  - id: respond
    environment: dev
    max_runtime: 30m
    idle_timeout: 5m
    agent: codex
    github:
      connection: example-github
      repositories: [example/project]
      permissions:
        issues: write
    prompt:
      - text: |
          Respond to the new issue comment with gh. Address this request:
          ${{ paseo.prompt }}
          Use this event context:
          ${{ paseo.context }}
          Call hub.finish_execution when done.
```

`.paseo/workflows/respond-to-pull-request-comment.yml`:

```yaml
name: respond-to-pull-request-comment
on: github.pull_request_comment_created
max_runtime: 2h
filters:
  repo: example/project
  contains: "@paseo"
  from_users: [maintainer]
steps:
  - id: respond
    environment: dev
    max_runtime: 30m
    idle_timeout: 5m
    agent: codex
    github:
      connection: example-github
      repositories: [example/project]
      permissions:
        pull_requests: write
    prompt:
      - text: |
          Respond to the new pull-request conversation comment with gh. Address this request:
          ${{ paseo.prompt }}
          Use this event context:
          ${{ paseo.context }}
          Call hub.finish_execution when done.
```

이슈 토론의 댓글에는 `github.issue_comment_created`를, 끌어오기 요청 대화의 댓글에는 `github.pull_request_comment_created`를 사용하세요. GitHub는 둘 다 이슈 댓글로 전달하지만 Hub가 구분해 줍니다. 변경된 줄의 댓글은 diff 댓글이며 레거시 `github.pull_request_review_comment` 이벤트에서 다룹니다.

`github.issue_comment_created`, `github.pull_request_comment_created`, `github.issue_comment`, `github.pull_request_review_comment`에서 Hub는 전달을 수락하면 👀, 에이전트가 시작하면 🚀, 완료되면 👍, 실패하면 👎 반응을 추가합니다.

## 이슈가 준비되면 작업 시작

`.paseo/workflows/implement-ready-issue.yml`:

```yaml
name: implement-ready-issue
on: github.issue_label_added
max_runtime: 2h
filters:
  repo: example/project
  label: ready-for-agent
  from_users: [maintainer]
steps:
  - id: implement
    environment: dev
    max_runtime: 90m
    idle_timeout: 10m
    agent: codex
    github:
      connection: example-github
      repositories: [example/project]
      permissions:
        contents: write
        issues: write
        pull_requests: write
    prompt:
      - text: |
          Implement the issue that was marked ready for an agent. Create a branch,
          push it, and open a pull request with gh. Use this event context:
          ${{ paseo.context }}
          Call hub.finish_execution when done.
```

`label`은 이 이벤트에서 추가된 레이블과 일치합니다. 대소문자를 구분하지 않으므로 `ready-for-agent`는 `Ready-For-Agent`와도 일치합니다.

## 이벤트 선택

| `on`                                  | 다음 경우에 발생                                      |
| ------------------------------------- | ----------------------------------------------------- |
| `github.issue_created`                | 이슈가 열릴 때.                                       |
| `github.pull_request_created`         | 끌어오기 요청이 열릴 때.                              |
| `github.issue_comment_created`        | 이슈에 댓글이 작성될 때.                              |
| `github.pull_request_comment_created` | 끌어오기 요청의 대화 댓글이 작성될 때.                |
| `github.issue_label_added`            | 이슈에 레이블이 추가될 때.                            |
| `github.pull_request_label_added`     | 끌어오기 요청에 레이블이 추가될 때.                   |

이슈 댓글에는 `github.issue_comment_created`를, 끌어오기 요청의 대화 댓글에는 `github.pull_request_comment_created`를 선택하세요. GitHub는 둘 다 이슈 댓글로 전달하지만 Hub가 구분해 줍니다. 변경된 줄의 댓글은 diff 댓글이며 레거시 `github.pull_request_review_comment` 이벤트에서 다룹니다.

## GitHub 이벤트 필터링

외부 소스의 모든 워크플로에는 비어 있지 않은 `from_users` 허용 목록이 필요합니다. GitHub 필터는 AND로 결합되므로 저장소, 연결, 발신자, 콘텐츠, 변경된 레이블, 필수 현재 레이블이 모두 일치해야 합니다.

`contains`와 `pattern`은 이슈 및 끌어오기 요청 이벤트에서 제목과 본문을 함께 검사합니다. 댓글 이벤트에서는 댓글 본문을 검사합니다. `contains`는 부분 문자열 일치이고 `pattern`은 시작 부분과 일치합니다.

추가된 레이블 자체가 중요할 때는 `github.issue_label_added` 또는 `github.pull_request_label_added`와 함께 `label`을 사용하세요. 항목에 나열한 모든 레이블이 현재 있어야 한다면 `labels`를 사용하세요. 둘 다 대소문자를 구분하지 않습니다. 예를 들어 `labels: [bug, backend]`에는 두 레이블이 모두 필요하며 둘 중 하나를 의미하지 않습니다.

모든 GitHub 이벤트와 필터는 [구성 참조](/docs/hub/configuration/hub-yml#github-events-and-filters)에 나와 있습니다.

## 레거시 이벤트 호환성

기존 워크플로는 `github.issues`, `github.issue_comment`, `github.pull_request_review`, `github.pull_request_review_comment`, `github.push`를 사용해도 기존 동작을 유지합니다. 새 워크플로에는 위의 의미 기반 이벤트를 사용하세요. 의미 기반 워크플로와 레거시 워크플로가 같은 전달에 모두 일치하면 별도의 실행이 시작됩니다.

GitHub 트리거는 토큰을 부여하지 않습니다. 권한은 필요한 단계의 `github` 블록에서 지정합니다. GitHub에는 `hub.reply` 기능이 없으며, 에이전트는 선언된 연결, 저장소, 권한 범위 안에서 `gh`를 통해 작업합니다.
