---
title: Linear triggers
description: Start Hub agents from Linear issue comments, assignments, and project scope changes.
nav: Linear
order: 66
category: Hub
---

# Linear 트리거

Linear 문제 활동의 Paseo 데몬에서 에이전트를 시작하고 문제에 대한 답글을 다시 게시하세요. 먼저 **통합**에서 Linear 작업 공간을 연결합니다(또는 자체 호스팅 Hub에서 [Linear 앱](/docs/hub/self-hosting/linear-app)을 구성합니다).

## 지원되는 이벤트

| `on` | 다음 경우에 발생 |
| ---------------------------- | ------------------------------------------------------------------------- |
| `linear.comment_created` | 새 댓글은 허용된 작성자 및 텍스트 필터와 일치합니다.                |
| `linear.issue_assigned` | 업데이트는 문제를 사용자에게 할당하거나 재할당합니다.                       |
| `linear.issue_entered_scope` | 범위에서 문제가 생성되거나 범위 외부에서 내부로 전환됩니다. |

동일한 Linear 문제에 대한 이벤트는 기본적으로 동일한 에이전트 세션을 계속합니다(`continuation: { mode: conversation }`).

## 이슈 댓글에 응답하기

이 파일을 `.paseo/triggers/linear-help.yml`으로 저장하고 연결 슬러그와 사용자 UUID를 바꾼 다음 `run.target`을 [연결된 데몬](/docs/hub/daemons)으로 설정합니다.

```yaml
name: linear-help
on:
  linear.comment_created:
    connection: acme-linear
    filters:
      from_users: ["11111111-1111-4111-8111-111111111111"]
      pattern: "/paseo "
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    provider: codex
    mode: full-access
  max_runtime: 30m
  idle_timeout: 10m
  prompt: |
    Summarize the request and suggest a next step.
    Post one reply using reply, then call finish_execution.

    <user-prompt>
    ${{ paseo.prompt }}
    </user-prompt>
  outputs:
    linear.reply:
      max: 1
      required: true
```

저장소 루트에서 트리거를 배포합니다.

```sh
paseo hub deploy --dry-run
paseo hub deploy
```

허용된 Linear 계정에서 `/paseo summarize this request`과 같은 이슈 댓글을 게시하세요. Hub는 접두사와 일치하고 `devbox`에서 에이전트를 실행한 다음 해당 Linear 문제에 대한 댓글로 응답을 게시합니다.

Hub가 HTTPS를 통해 실행되는 경우 응답에는 **Paseo**에서 열기 링크가 포함됩니다. [활동](/docs/hub/activity)을 확인하여 실행을 검사하세요.

## 문제가 범위에 들어오면 작업 시작

`linear.issue_entered_scope`은 문제가 생성 시 또는 업데이트가 범위로 ​​이동할 때 구성된 필터 범위에 들어갈 때 한 번 실행됩니다. 이미 범위에 있는 문제를 나중에 편집해도 다른 실행이 트리거되지 않습니다.

이 이벤트에는 `filters.project`이 필요하며 자동화된 프로젝트 워크플로를 위해 `from_users`을 생략할 수 있습니다.

```yaml
name: linear-project-worker
on:
  linear.issue_entered_scope:
    connection: acme-linear
    filters:
      project: "22222222-2222-4222-8222-222222222222"
      states: ["33333333-3333-4333-8333-333333333333"]
      labels: ["44444444-4444-4444-8444-444444444444"]
      exclude_labels: ["55555555-5555-4555-8555-555555555555"]
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
    Implement the Linear issue, open a pull request with gh, and post the PR URL using reply.
    Issue context:
    ${{ paseo.context }}
    Call finish_execution when done.
```

대신 할당을 트리거하려면 `linear.issue_assigned`을 사용하고 `from_users`은 허용된 할당자의 이름을 지정하고 `assignees`은 대상 Linear 사용자 UUID의 이름을 지정합니다.

## 필터 및 Linear UUID

모든 Linear 필터는 AND로 구성되며 표시 이름 대신 Linear UUID를 사용합니다.

| 필터 | |에 필수 경기 |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------- |
| `from_users` | `linear.comment_created`, `linear.issue_assigned` | 허용된 댓글 작성자 또는 할당자의 사용자 UUID입니다.      |
| `project` | `linear.issue_entered_scope` | Linear 프로젝트 UUID.                                     |
| `states` | 선택사항 | 워크플로 상태 UUID를 발행합니다(나열된 모든 상태가 일치함).   |
| `assignees` | 선택사항 | 양수인 사용자 UUID를 발행합니다(나열된 양수인이 일치함). |
| `labels` | 선택사항 | 나열된 모든 라벨 UUID가 이슈에 있어야 합니다.    |
| `exclude_labels` | 선택사항 | 나열된 라벨 UUID는 일치를 방지합니다.                  |
| `pattern` | 선택사항(`linear.comment_created`) | 주석 본문 시작 부분에 필수 접두사입니다.        |
| `contains` | 선택사항(`linear.comment_created`) | 주석 본문의 어느 위치에서나 필수 하위 문자열입니다.         |

Linear에서 UUID를 찾으려면 이슈, 프로젝트 또는 레이블에서 명령 메뉴(`Cmd+K` 또는 `Ctrl+K`)를 열고 **모델 UUID 복사**를 선택하거나 [Linear GraphQL API](https://linear.app/developers/graphql)를 쿼리합니다.

## 컨텍스트 및 답변

`run.prompt`에 `${{ paseo.context }}`을 포함하여 문제 세부정보(식별자, 제목, 설명, URL, 프로젝트, 상태, 담당자, 레이블) 및 최대 49개의 이전 문제 설명을 JSON으로 전달합니다.

Linear 트리거는 트리거 문제에 대한 의견을 게시할 수 있도록 `reply` 도구(`linear.reply`)를 자동으로 부여합니다. `run.outputs.linear.reply`을 선언하여 `max` 또는 `required: true`을 시행합니다.
