---
title: GitHub triggers
description: Start Hub agents from GitHub issues, pull requests, comments, pushes, and labels.
nav: GitHub
order: 65
category: Hub
---

# GitHub 트리거

의미 체계 GitHub 이벤트를 사용하여 하나의 GitHub 작업에서 에이전트를 시작합니다. 먼저 **통합**에서 GitHub 계정을 연결하세요(또는 자체 호스팅 Hub에서 [GitHub 앱](/docs/hub/self-hosting/github-app)을 구성하세요).

## 새 이슈 분류

`.paseo/triggers/triage-issue.yml`:

```yaml
name: triage-issue
on:
  github.issue_created:
    connection: acme-github
    filters:
      repo: acme/project
      from_users: [maintainer]
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    provider: codex
    mode: full-access
  max_runtime: 30m
  idle_timeout: 5m
  github:
    connection: acme-github
    repositories: [acme/project]
    permissions:
      issues: write
  prompt: |
    Triage the new issue, apply appropriate labels with gh, and post a short summary using reply.
    Event context:
    ${{ paseo.context }}
    Call finish_execution when done.
```

`github.issue_created`은 이슈가 공개된 경우에만 실행됩니다. `from_users`은 필수이며 이벤트를 발생시킨 GitHub 로그인과 일치합니다.

## 풀 요청 검토

`.paseo/triggers/review-pr.yml`:

```yaml
name: review-pr
on:
  github.pull_request_ready_for_review:
    connection: acme-github
    filters:
      repo: acme/project
      from_users: [maintainer]
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    provider: codex
    mode: full-access
  max_runtime: 90m
  idle_timeout: 10m
  github:
    connection: acme-github
    repositories: [acme/project]
    permissions:
      contents: read
      pull_requests: write
  prompt: |
    Review the pull request and submit your findings with gh.
    Fetch live PR state with gh pr view before reviewing and before posting.
    Skip posting if the PR is draft or its head SHA changed.
    Event context:
    ${{ paseo.context }}
    Call finish_execution when done.
```

풀 요청이 열릴 때 실행하려면 `github.pull_request_created`을 사용하고, 초안이 준비로 표시될 때까지 기다리려면 `github.pull_request_ready_for_review`을 사용하고, 공개 풀 요청에 새 커밋이 푸시될 때 실행하려면 `github.pull_request_synchronized`을 사용합니다.

풀 요청 컨텍스트에는 `github.pull_request.draft` 및 `github.pull_request.head_sha`이 포함됩니다. 끌어오기 요청을 초안으로 다시 변환해도 이미 진행 중인 실행은 취소되지 않으므로 게시하기 전에 `gh pr view`으로 실시간 상태를 확인하세요.

## 댓글에 응답

`.paseo/triggers/respond-issue-comment.yml`:

```yaml
name: respond-issue-comment
on:
  github.issue_comment_created:
    connection: acme-github
    filters:
      repo: acme/project
      contains: "@paseo"
      exclude_contains: "@paseo-deploy"
      from_users: [maintainer]
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    provider: codex
    mode: full-access
  max_runtime: 30m
  idle_timeout: 5m
  prompt: |
    Answer the issue comment using reply, then call finish_execution.

    <user-prompt>
    ${{ paseo.prompt }}
    </user-prompt>
    Event context:
    ${{ paseo.context }}
  outputs:
    github.reply:
      max: 1
      required: true
```

이슈에 대한 댓글에는 `github.issue_comment_created`을 사용하고 풀 요청에 대한 대화 댓글에는 `github.pull_request_comment_created`을 사용하세요. GitHub는 두 가지를 모두 문제 설명으로 보내고 Hub는 이를 분리합니다.

`exclude_contains`은 별도의 명령 접두사와 같이 다른 트리거에서 주장하는 텍스트가 포함된 주석을 건너뜁니다.

`github.issue_comment_created`, `github.pull_request_comment_created`, `github.issue_comment` 및 `github.pull_request_review_comment`에서 Hub는 실행이 진행됨에 따라 반응을 추가합니다. 즉, 수락 시 🙌, 시작 시 🚀, 완료 시 👍, 실패 시 👎입니다.

## 레이블 작업 시작

`.paseo/triggers/implement-ready-issue.yml`:

```yaml
name: implement-ready-issue
on:
  github.issue_label_added:
    connection: acme-github
    filters:
      repo: acme/project
      label: ready-for-agent
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
      issues: write
      pull_requests: write
  prompt: |
    Implement the labeled issue on this worktree branch, push it, and open a pull request with gh.
    Post the PR link to the issue using reply, then call finish_execution.
    Event context:
    ${{ paseo.context }}
```

`label`은 이 이벤트에 의해 추가된 정확한 라벨과 대소문자를 구분하지 않고 일치합니다. 풀 요청에 추가된 레이블에는 `github.pull_request_label_added`을 사용하세요.

## 지원되는 이벤트

| `on` | 다음 경우에 발생 |
| -------------------------------------- | --------------------------------------------------- |
| `github.issue_created` | 문제가 열렸습니다.                                 |
| `github.pull_request_created` | 끌어오기 요청이 열립니다.                           |
| `github.pull_request_ready_for_review` | 풀 요청 초안은 검토 준비가 완료된 것으로 표시됩니다.    |
| `github.pull_request_synchronized` | 새로운 커밋은 공개 풀 요청으로 푸시됩니다.     |
| `github.issue_comment_created` | 이슈에 댓글이 게시되었습니다.                    |
| `github.pull_request_comment_created` | 풀 리퀘스트에는 대화 댓글이 게시됩니다. |
| `github.issue_label_added` | 이슈에 라벨이 추가됩니다.                       |
| `github.pull_request_label_added` | 풀 요청에 레이블이 추가됩니다.                 |

또한 Hub는 diff 검토 댓글이나 푸시 이벤트가 필요할 때 원시 웹훅 이벤트 이름(`github.issues`, `github.issue_comment`, `github.pull_request`, `github.pull_request_review`, `github.pull_request_review_comment`, `github.push`)을 허용합니다. 새로운 트리거에 대해 의미론적 이벤트를 선호합니다.

## 필터

모든 GitHub 트리거에는 비어 있지 않은 `from_users` 허용 목록이 필요합니다. 제공된 모든 필터는 AND로 구성됩니다.

모든 발신자의 푸시를 수락하려면 `from_users: ["*"]`을 사용하세요. Hub는 푸시 이벤트에서 보낸 사람 로그인을 추출하지 않으므로 명명된 로그인 목록이 일치하지 않습니다.

| 필터 | 적용 대상 | 의미 |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `from_users` | 모든 GitHub 이벤트 | 실행을 트리거하는 데 허용되는 GitHub 로그인입니다.                                  |
| `repo` | 모든 GitHub 이벤트 | `owner/name` 형식의 저장소입니다.                                           |
| `contains` | 이슈, 풀 요청 및 댓글 이벤트 | 이슈 또는 PR 제목과 본문 또는 댓글 본문의 하위 문자열입니다.      |
| `exclude_contains` | 이슈, 풀 요청 및 댓글 이벤트 | 이벤트 일치를 방지하는 하위 문자열입니다.                           |
| `pattern` | 이슈, 풀 요청 및 댓글 이벤트 | 동일한 텍스트의 시작 부분에 접두사를 붙입니다.                                     |
| `label` | `github.issue_label_added`, `github.pull_request_label_added` | 필수의. 이 전달에 의해 추가된 라벨은 대소문자를 구분하지 않습니다.            |
| `labels` | 이슈, 풀 요청 및 댓글 이벤트 | 나열된 모든 라벨은 이슈나 PR에 있어야 하며 대소문자를 구분하지 않습니다. |

## 응답 및 GitHub 토큰

문제 또는 풀 요청에 대한 GitHub 트리거는 `reply` 도구(`github.reply`)를 자동으로 부여합니다. 이 도구는 해당 문제 또는 풀 요청에 대한 댓글을 게시하고 Hub가 HTTPS를 통해 실행될 때 **Paseo**에서 열기 링크를 추가합니다. `max` 답변을 제한하려면 `run.outputs.github.reply`을 추가하거나 `required: true`을 설정하세요.

GitHub 트리거는 기본적으로 `GH_TOKEN`을 부여하지 않습니다. 에이전트가 분기 푸시, 풀 요청 열기 또는 레이블 편집을 위해 `git` 또는 `gh` 액세스가 필요한 경우 [`run.github` 블록](/docs/hub/github)을 추가하세요.
