---
title: Hub configuration
description: Generate, edit, and deploy organization triggers from your repository.
nav: Configuration
order: 70
category: Hub
---

# 허브 구성

각 조직 트리거는 자체 완결형 YAML 파일 하나입니다. 트리거를 저장소에 보관하고 `paseo hub deploy`로 배포하세요.

```text
.paseo/
└── triggers/
    └── <trigger>.yml
```

## 생성된 시작용 트리거

에이전트가 작업할 저장소에서 `paseo hub init`을 실행하세요. 설정은 앱 연결과 사용 가능한 에이전트 런타임을 선택하고, 트리거할 수 있는 사용자를 물은 다음 결과를 검증해 파일 하나에 씁니다. 이어서 배포할지 묻습니다. 대화형 `paseo hub login`은 데몬을 연결하고 이 명령을 안내하지만 트리거 파일을 쓰지는 않습니다.

이름이 `my-team`인 Slack 연결의 경우 생성되는 문서는 다음과 같습니다.

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

`connection`은 조직에 있는 앱 연결의 슬러그입니다. `target.daemon`은 연결된 데몬의 슬러그이고 `target.cwd`는 설정을 실행한 절대 디렉터리입니다. `agent`에는 데몬에서 선택한 공급자, 모델, 실행 모드가 들어갑니다. 모드는 필수입니다.

`continuation.mode: conversation`은 동일한 에이전트의 같은 공급자 대화에서 후속 작업을 이어갑니다. 프롬프트는 에이전트에게 응답한 다음 `hub.finish_execution`을 호출하도록 요청합니다. 응답만 해서는 실행이 완료되지 않습니다.

Discord 시작용 트리거는 `discord.mention`, 사용자의 Discord 사용자 ID, `discord.reply`를 사용합니다. GitHub 시작용 트리거는 `github.issue_comment`를 사용하고 현재 GitHub 원격 저장소로 제한하며, `@paseo`와 사용자의 GitHub 사용자 이름을 모두 요구합니다. GitHub 시작용 트리거에는 명시적인 응답 출력 선언이 없습니다.

설정은 선택한 트리거 파일을 교체하기 전에 확인합니다. 다른 트리거와 기존 레거시 번들은 보존합니다. `from_users` 또는 에이전트의 권한을 확대하기 전에 [Hub 보안](/docs/hub/security)을 읽으세요.

## 시작 시간 제한

Hub는 작업 트리 생성, 공급자 시작, 초기 프롬프트 수락을 포함해 에이전트가 시작할 때까지 최대 **2분** 기다립니다. 더 느린 머신에서는 트리거 YAML에 `run.startup_timeout`을 설정하세요.

```yaml
name: inspect
on:
  manual.run: {}
run:
  target: { daemon: devbox, cwd: /workspace/project }
  agent: { provider: codex, mode: full-access }
  startup_timeout: 5m
  prompt: Inspect this repository and summarize its current state.
```

`ms`, `s`, `m`, `h` 단위의 양수 기간을 사용하며 최대값은 `24h`입니다. 이 필드를 생략하면 `2m`을 사용합니다. 기존 `max_runtime` 및 `idle_timeout` 제한은 시작 중에도 적용되며 더 먼저 만료될 수 있습니다. 이 설정은 Hub의 대기 예산을 변경하며, 공급자별 시간 제한은 계속 적용됩니다.

## CLI에서 배포

저장소 루트에서 실행합니다.

```sh
paseo hub login https://hub.example.com
paseo hub deploy --dry-run
paseo hub deploy
```

두 배포 명령 모두 직접 위치한 `.paseo/triggers/*.yml` 파일을 결정적인 경로 순서로 찾습니다. CLI는 중첩 파일, `.yaml` 확장자, 심볼릭 링크로 연결된 트리거 경로, 읽을 수 없는 파일을 거부합니다. 상위 디렉터리는 검색하지 않습니다.

테스트 실행은 문서를 각각 Hub에서 검증하되 개정을 저장하지 않습니다. 배포는 모든 문서를 먼저 검증한 다음 조직 트리거 API를 통해 한 번에 하나씩 설치합니다. 설치는 YAML의 `name`을 기준으로 트리거를 생성하거나 업데이트합니다. 뒤의 설치가 실패하면 오류에 이미 설치된 파일이 나열되며 해당 개정은 활성 상태로 유지됩니다. 오류에는 경로가 표시되지만 파일 내용이나 자격 증명은 출력되지 않습니다.

원산지 우선순위:

1. `--hub`
2. `PASEO_HUB_URL`
3. 활성 저장된 로그인
4. `https://hub.paseo.sh`

자격 증명 우선 순위:

1. `--api-key`
2. `PASEO_HUB_API_KEY`
3. 정확한 해결 출처에 대한 저장된 로그인

플래그와 환경 키는 저장되지 않습니다. 엔드포인트 및 자격 증명 동작은 배포와 테스트 실행 간에 변경되지 않습니다.

## 레거시 프로젝트 번들

기존 프로젝트 번들은 `.paseo/hub.yml`, 직접 위치한 `.paseo/workflows/*.yml` 파일, `.paseo/workflows/partials/` 아래에서 참조하는 파일로 구성됩니다. `hub.yml`은 명명된 환경과 에이전트를 소유하며, 각 워크플로는 자체 트리거와 순서가 지정된 단계를 소유합니다.

레거시 배포 경로를 명시적으로 선택하세요.

```sh
paseo hub deploy --project my-project --dry-run
paseo hub deploy --project my-project
```

이 명령은 프로젝트 구성 API를 통해 전체 번들을 전송합니다. 테스트 실행은 개정을 기록하거나 활성화하지 않고 검증합니다. `paseo hub init`은 이러한 번들을 생성하거나 마이그레이션하지 않습니다.

다음 소스 및 개정 동작은 레거시 프로젝트 번들에 적용됩니다.

## GitHub 동기화

구성 저장소의 기본 분기에 푸시하면 동기화가 시작됩니다.

1. Hub는 정확한 커밋에서 표준 번들을 검색합니다.
2. 모든 소스 파일을 구문 분석하고 프롬프트 부분을 해결합니다.
3. 명명된 리소스, 표현식, 연결 및 데몬 가용성을 확인합니다.
4. 성공하면 변경할 수 없는 새 개정판이 활성화됩니다.

**지금 동기화**는 요청 시 동일한 작업을 수행합니다. 실패는 소스 경로와 작성된 필드를 유지합니다. 실패한 동기화는 활성 버전을 대체하지 않습니다.

## 개정 및 소스 변경

개정판은 검사 또는 재배포에 필요한 정확한 제작 파일을 유지합니다. 롤백하면 이전 버전이 활성화됩니다. 다음 유효한 GitHub 푸시는 새 개정판을 다시 활성화합니다.

GitHub 지원 구성은 대시보드에서 읽기 전용입니다. 수동으로 전환하면 소스 문서가 보존됩니다. 번들을 하나의 생성된 파일로 축소하지 않습니다.

구성 저장소는 `filters.repo`으로 명명된 저장소와 다를 수 있습니다. 번들을 변경하면 연결, 데몬, 작업 디렉터리, 에이전트 및 출력이 선택될 수 있으므로 보호하세요. [허브 보안](/docs/hub/security)을 참조하세요.

다음: [구성 참조](/docs/hub/configuration/hub-yml) 및 [워크플로 예](/docs/hub/workflows).
