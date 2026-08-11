---
title: GitHub triggers
description: Configure GitHub events with explicit step-scoped GitHub authority.
nav: GitHub
order: 67
category: Hub
---

# GitHub 트리거

| `on` | 이벤트 |
| ----------------------- | ----------------------- |
| `github.issue_comment` | 이슈나 풀 요청에 댓글을 달 수 있습니다. |
| `github.issues` | 이슈 이벤트.                         |
| `github.pull_request_review` | 풀 리퀘스트 검토.                 |
| `github.pull_request_review_comment` | 의견 차이.                        |

GitHub는 구독한 모든 작업을 보냅니다. 필터를 통과하는 각 배달은 실행을 시작합니다.

`.paseo/workflows/github-change.yml`:

```yaml
name: github-change
on: github.issue_comment
max_runtime: 2h
filters:
  repo: example/project
  contains: "@paseo"
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
        pull_requests: write
    prompt:
      - text: |
          Implement the request and open a pull request with gh.
          Call hub.finish_execution when done.
          ${{ paseo.prompt }}
```

`from_users`은 GitHub 로그인과 일치합니다. `contains`은 이벤트 텍스트를 확인하고 `pattern`은 시작을 확인합니다. 댓글 이벤트는 댓글 본문을 사용합니다. 이슈 이벤트는 제목과 본문을 사용합니다.

GitHub 트리거는 토큰을 부여하지 않습니다. 권한은 필요한 단계의 `github` 블록입니다. GitHub에는 `hub.reply` 기능이 없습니다. 에이전트는 선언된 연결, 저장소 및 권한 내에서 `gh`을 통해 작동합니다.

댓글 이벤트에서 허브는 수락 시 🙌, 에이전트가 시작될 때 🚀, 완료 시 👍, 실패 시 👎로 반응합니다. `${{ paseo.prompt }}`에는 이벤트 식별자가 아닌 정규화된 요청 텍스트가 포함되어 있습니다. 단계에 공급자 컨텍스트가 명시적으로 필요한 경우 프롬프트 텍스트에 `${{ paseo.context }}`을 사용하세요.