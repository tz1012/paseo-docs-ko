---
title: Hub configuration
description: Author, validate, and deploy self-contained triggers from your repository with the Paseo CLI.
nav: Configuration
order: 73
category: Hub
---

# 허브 구성

각 Hub 트리거는 하나의 독립형 YAML 파일입니다. Hub 대시보드의 **트리거**에서 트리거를 편집하거나 리포지토리에 보관하고 `paseo hub deploy`을 사용하여 배포합니다.

```text
.paseo/
└── triggers/
    └── <trigger>.yml
```

지원되는 모든 필드는 [트리거 YAML 참조](/docs/hub/configuration/reference)를 확인하세요.

## 생성된 시작용 트리거

에이전트가 작동할 저장소에서 `paseo hub init`을 실행합니다. 설치 프로그램은 필요한 경우 데몬을 연결하고, 해당 데몬에서 준비된 통합과 사용 가능한 에이전트 런타임을 선택할 수 있도록 하며, 봇을 트리거할 수 있는 사용자를 묻고, 결과를 검증하고, 시작 파일 하나를 작성합니다. 그런 다음 배포 여부를 묻습니다.

`my-team`이라는 Slack 통합의 경우 설정에서 다음을 생성합니다.

```yaml
# .paseo/triggers/slack-help.yml
name: slack-help
enabled: true
on:
  slack.mention:
    connection: my-team
    filters:
      from_users: [U01234567]
max_runtime: 2h
run:
  target:
    daemon: my-macbook
    cwd: /Users/you/code/your-repo
  agent:
    provider: codex
    model: gpt-5
    mode: full-access
  continuation:
    mode: conversation
  max_runtime: 90m
  idle_timeout: 10m
  prompt: |
    Answer with hub.reply, then complete this request and call hub.finish_execution when done.

    <user-prompt>
    ${{ paseo.prompt }}
    </user-prompt>
  outputs:
    slack.reply:
      max: 1
      required: true
```

`connection`은 조직의 통합 슬러그입니다. `target.daemon`은 연결된 데몬의 슬러그이고 `target.cwd`은 절대 저장소 경로입니다. `agent`은 해당 데몬에서 선택된 공급자, 모델 및 모드를 전달합니다.

`continuation.mode: conversation`은 동일한 에이전트의 동일한 스레드에 후속 언급을 유지합니다. 응답만으로는 실행이 종료되지 않으므로 메시지는 에이전트에게 응답하고 `finish_execution`을 호출하도록 지시합니다.

Discord 스타터는 `discord.mention`, Discord 사용자 ID 및 `discord.reply`을 사용합니다. GitHub 스타터는 `github.issue_comment`을 사용하고, `repo`을 현재 GitHub 원격으로 범위 지정하며, `@paseo`과 GitHub 사용자 이름이 모두 필요합니다.

설치 프로그램은 기존 시작 파일을 바꾸기 전에 묻고 다른 트리거 파일은 그대로 둡니다. `from_users` 또는 에이전트 권한을 확대하기 전에 [Hub 보안](/docs/hub/security)을 읽어보세요.

## 시작 시간 제한

Hub는 작업 트리 생성, 공급자 시작 및 초기 프롬프트 수락을 포함하여 에이전트가 시작될 때까지 기본적으로 최대 2분을 기다립니다. 느린 머신이나 대규모 저장소에서는 `run.startup_timeout`을 설정합니다.

```yaml
name: inspect
on:
  manual.run: {}
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    provider: codex
    mode: full-access
  startup_timeout: 5m
  prompt: Inspect this repository and summarize its current state. Call finish_execution when done.
```

`ms`, `s`, `m` 또는 `h`에서 최대 `24h`까지 양수 기간을 사용하세요. `max_runtime` 및 `idle_timeout`은 시작 중에 계속 적용되며 더 빨리 만료될 수 있습니다.

## CLI에서 배포

저장소 루트에서 실행합니다.

```sh
paseo hub login https://hub.example.com
paseo hub deploy --dry-run
paseo hub deploy
```

두 명령 모두 결정적 경로 순서로 모든 직접 `.paseo/triggers/*.yml` 파일을 읽습니다. CLI는 중첩된 디렉터리, `.yaml` 확장명, 심볼릭 링크 및 읽을 수 없는 파일을 거부하고 상위 디렉터리를 검색하지 않습니다.

`--dry-run`은 개정판을 작성하지 않고도 Hub 및 연결된 데몬에 대해 모든 파일의 유효성을 검사합니다. `paseo hub deploy`은 먼저 모든 파일의 유효성을 검사한 다음 YAML `name`을 통해 각 트리거를 설치합니다.

이후 트리거 설치에 실패하면 오류에 이미 설치된 파일이 나열됩니다. 기존 웹훅 트리거 이름을 재배포하면 해당 웹훅 URL과 비밀이 유지됩니다.

원산지 우선순위:

1. 명시적 명령 출처 또는 `--hub`
2. `PASEO_HUB_URL`
3. 활성 저장된 CLI 로그인
4. `https://hub.paseo.sh`

자격 증명 우선 순위:

1. `--api-key`
2. `PASEO_HUB_API_KEY`
3. 정확한 해결 원본에 대한 저장된 CLI 로그인

플래그 및 환경 API 키는 디스크에 기록되지 않습니다.

다음: [YAML 참조 트리거](/docs/hub/configuration/reference).
