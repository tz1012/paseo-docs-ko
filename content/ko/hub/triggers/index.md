---
title: Hub triggers
description: How Hub matches an inbound event to a trigger: events, filters, and the allowlist that gates every execution.
nav: Triggers
order: 66
category: Hub
---

# 트리거

트리거는 워크플로를 시작할 수 있는 공급자 이벤트를 알려줍니다. [허브 워크플로](/docs/hub/workflows) 페이지에서는 일치 후 실행되는 단계, 입력, 라우팅, 프롬프트 및 기한을 다룹니다.

`.paseo/workflows/github-mention.yml`:

```yaml
name: mention
on: github.issue_comment
filters:
  repo: acme/api
  contains: "@paseo"
  from_users: [alice]
max_runtime: 2h
steps:
  - id: work
    environment: dev
    max_runtime: 90m
    idle_timeout: 10m
    agent: codex
    prompt:
      - text: Call hub.finish_execution when the step is complete.
      - text: ${{ paseo.prompt }}
```

필드별 세부정보는 [구성 참조](/docs/hub/configuration/hub-yml)에 있습니다.

## 이벤트

| `on` | 다음과 같은 경우에 발생 |
| ----------------------- | ------------------------ |
| `github.issue_comment` | 문제 또는 끌어오기 요청에 대한 의견 |
| `github.issues` | 이슈가 열리거나 편집되었습니다 |
| `github.pull_request_review` | 리뷰가 제출되었습니다 |
| `github.pull_request_review_comment` | 차이점에 대한 의견 |
| `slack.mention` | 봇이 채널에서 언급됨 |
| `discord.mention` | 봇이 길드에서 언급됨 |
| `manual.run` | API에서 시작된 실행 |

각 공급자 페이지는 해당 이벤트와 노출되는 데이터를 문서화합니다.

- [GitHub 트리거](/docs/hub/triggers/github)
- [Slack 트리거](/docs/hub/triggers/slack)
- [Discord 트리거](/docs/hub/triggers/discord)

## 필터

`filters`이 필요하며, `from_users`이 있어야 하며 비어 있지 않아야 합니다. 이것이 없는 트리거는 검증 시 거부됩니다.

허용 목록은 공개 문제에 대한 낯선 사람의 의견이 귀하의 컴퓨터에서 에이전트를 시작하지 못하게 하는 것입니다. 안전한 기본값은 저장소마다 다르기 때문에 기본값은 없습니다.

허용 목록은 하나의 방어 계층입니다. 침해 후 허용된 계정을 신뢰할 수 있게 만들거나 즉각적인 주입을 무해하게 만들지는 않습니다. 외부 트리거에 대한 데몬, 작업 디렉터리, 공급자 정책 및 출력을 선택하기 전에 [허브 보안](/docs/hub/security)을 참조하세요.

| 필터 | 적용 대상 | 경기 |
| ------------ | -------------- | -------------------------------------------------- |
| `from_users` | 모두 | GitHub: 로그인. Slack 및 Discord: **사용자 ID**, 표시 이름 아님 |
| `repo` | GitHub | `owner/name` |
| `workspace` | 슬랙 | 팀 ID, `T01234567` |
| `guild` | 불화 | 길드 아이디 |
| `channels` | 슬랙, 디스코드 | 채널 ID |
| `contains` | 모두 | GitHub 하위 문자열; Slack 및 Discord 호출 접두사 |
| `pattern` | 모두 | 호출 접두사 |
| `connection` | 모두 | 조직에 여러 개의 연결 슬러그가 있는 경우 |

모든 조건이 통과되어야 합니다. `any` 모드가 없습니다.

## 이벤트가 발생하는 연결

`repo`, `workspace` 및 `guild`은 구성이 활성화될 때 이를 소유한 연결과 함께 불변 ID로 확인됩니다. 조직이 활성화 실패에 대한 연결이 없는 리소스의 이름을 지정하면 누군가 댓글을 달 때가 아니라 푸시를 통해 알 수 있습니다.

리소스 필터를 생략하면 트리거가 조직에서 해당 공급자의 모든 연결을 수신합니다. 하나에 고정하려면:

```yaml
filters:
  connection: acme-github
  from_users: [alice]
```

어떤 활성화가 컴파일되는지는 [허브 작동 방식](/docs/hub/concepts)을 참조하세요.

## 두 개의 트리거가 일치하는 경우

둘 다 실행됩니다. 트리거는 순서가 지정되지 않으며 하나의 구성에서 또는 프로젝트 전체에서 서로 그림자를 드리우지 않습니다.

## 답장

응답해야 하는 단계에 `allow_outputs`을 입력하세요. 응답 기능은 `slack.reply` 및 `discord.reply`입니다.

- 단계에 둘 이상의 업데이트가 필요한 경우 `max`을 설정합니다.
- 단계가 완료되기 전에 적어도 하나의 응답을 내보내야 하는 경우 `required: true`을 설정합니다. 필수 유형이 등록되어 실행 컨텍스트에 사용 가능해야 합니다.

GitHub에는 응답 기능이 없습니다. 대신 [`github` 블록](/docs/hub/github)이 있는 단계에서는 `gh`을 통해 주석을 달았습니다. [출력 기능 참조](/docs/hub/configuration/hub-yml#output-capability)에 계약이 있습니다.

선언은 `hub.reply` 도구를 부여합니다. 프롬프트는 상담원에게 전화하라고 알려야 합니다. [에이전트에게 호출할 도구 알려주기](/docs/hub/workflows#tell-the-agent-which-tool-to-call)를 참조하세요.