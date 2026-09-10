---
title: Hub configuration reference
description: Canonical Hub resource, workflow, agent, expression, and prompt fields.
nav: Configuration reference
order: 71
category: Hub
---

# 허브 구성 참조

Hub는 다음 레이아웃에서 YAML을 허용합니다.

```text
.paseo/
├── hub.yml
└── workflows/
    ├── <workflow>.yml
    └── partials/
        └── <partial>.md
```

`.paseo/workflows/`의 직접 `.yml` 하위 항목만 워크플로입니다. 각 파일에는 하나의 트리거와 순서가 지정된 단계가 포함되어 있습니다. 매니페스트, `includes`, `uses`, 재사용 가능한 단계, 워크플로 호출 또는 상속이 없습니다.

## `hub.yml`

`.paseo/hub.yml`에는 명명된 프로젝트 리소스가 포함되어 있습니다. 이름은 맵 키이며 각 객체 내에서 반복되지 않습니다.

```yaml
environments:
  paseo:
    kind: daemon
    daemon: laptop
    cwd: /Users/you/code/paseo
  hub:
    kind: daemon
    daemon: devbox
    cwd: /workspace/hub

agents:
  codex-safe:
    provider: codex
    model: gpt-5.5
    thinkingOptionId: xhigh
    options:
      sandbox_workspace_write:
        writable_roots: [/var/cache/npm]
        network_access: false
  claude:
    provider: claude
    mode: bypassPermissions
```

유일한 최상위 키는 `environments` 및 `agents`입니다. `triggers` 키가 마이그레이션 오류로 인해 거부되었습니다.

### 환경

| 필드 | 필수 | 메모 |
| ---------- | ----------- | ---------------------------------------------------- |
| `kind` | 예 | `daemon`, `fly` 또는 `docker`; 워크플로 단계에서는 데몬 환경을 선택해야 합니다. |
| `daemon` | 데몬만 | 등록된 데몬 슬러그, 개정판이 활성화되면 해결됩니다.                  |
| `cwd` | 데몬만 | 데몬의 절대 작업 디렉터리입니다.                                      |
| `image` | 플라이/도커 | 이미지 이름.                                                                    |
| `worktree` | 아니 | `branch-off`, `checkout-branch` 또는 `checkout-pr` 대상입니다.                      |

`worktree`의 경우 `newBranch`을 사용하고 선택 사항인 `base`을 `branch-off`과 함께, `branch`과 `checkout-branch`을 사용하거나 양수 `prNumber`을 `checkout-pr`과 함께 사용합니다.

```yaml
environments:
  review:
    kind: daemon
    daemon: build-server
    cwd: /workspace/project
    worktree:
      mode: branch-off
      newBranch: trigger-${{ paseo.execution.id }}
      base: origin/main
```

`newBranch`는 브랜치 이름 문자열입니다. `${{ paseo.execution.id }}`를 삽입하면 실행의 UUID로 렌더링됩니다. 따라서 각 실행은 자체 브랜치로 `base`에서 분기하고, Hub가 해당 실행을 재시도하거나 복구할 때도 그 브랜치를 유지합니다.

하나의 실행은 단일 단계 실행에 해당하므로, 동일한 환경을 선택하는 두 단계에는 각각 별도의 브랜치가 생성됩니다.

`newBranch`가 허용하는 유일한 표현식은 `${{ paseo.execution.id }}`입니다. `paseo.prompt`, `paseo.context`, `paseo.inputs.*`, `values.*`, `steps.<id>.outputs.*` 및 제공자 이벤트 필드는 여기에서 사용할 수 없습니다. 허용되지 않은 표현식을 사용하면 `.paseo/hub.yml.environments.review.worktree.newBranch`처럼 표현식이 작성된 필드에서 번들 활성화에 실패합니다.

`${{ paseo.execution.id }}`를 번들의 다른 위치에서 사용해도 같은 방식으로 활성화에 실패합니다. `branch`와 `prNumber`는 리터럴 값을 사용합니다.

환경은 완전한 명명된 개체입니다. 단계는 이름을 선택합니다. 객체는 상속되거나 병합되거나 부분적으로 재정의되지 않습니다.

### 지정 에이전트

각 에이전트는 하나의 완전한 공급자 구성입니다.

| 필드 | 필수 | 메모 |
| ------------------ | -------- | ---------------------------------------------------------------- |
| `provider` | 예 | 제공자 ID.                                                     |
| `model` | 아니 | 공급자 모델 ID.                                               |
| `mode` | 아니 | Paseo 모드 ID.                                                   |
| `thinkingOptionId` | 아니 | 공급자 사고 옵션.                                        |
| `options` | 아니 | 이름과 중첩을 유지하는 JSON 안전 공급자 기본 옵션입니다. |

명명된 선택은 구조화된 옵션을 포함하여 전체 개체를 유지합니다. 명명된 에이전트에는 상위, 패치 또는 단계별 재정의가 없습니다.

Hub는 공급자 필드의 이름을 바꾸거나 평면화하지 않고 `model`, `mode`, `thinkingOptionId` 및 `options`을 Paseo 데몬에 전달합니다. 선택한 데몬은 현재 공급자 스키마에 대해 유효성을 검사합니다. 허브는 공급자 기본 옵션을 번역하지 않습니다.

## 워크플로 파일

`.paseo/workflows/review.yml`:

```yaml
name: review
on: manual.run
max_runtime: 2h
filters:
  from_users: [automation]
inputs:
  repo:
    type: string
    required: true
    choices: [paseo, hub]
steps:
  - id: inspect
    environment: ${{ paseo.inputs.repo }}
    max_runtime: 30m
    idle_timeout: 5m
    agent: codex-safe
    prompt:
      - text: ${{ paseo.prompt }}
```

| 필드 | 필수 | 메모 |
| ------------- | -------- | -------------------------------------------- |
| `name` | 예 | 번들 전체에서 고유한 워크플로 이름입니다.                  |
| `on` | 예 | `manual.run` 또는 `discord.mention`과 같은 공급자 이벤트입니다. |
| `max_runtime` | 예 | 전체 실행에 대한 하드 제한은 최대 24시간입니다.               |
| `filters` | 예 | 제공자 리소스 필터 및 발신자 허용 목록.       |
| `inputs` | 아니 | 입력된 호출 헤더.                                 |
| `values` | 아니 | 명명된 표현식.                                        |
| `steps` | 예 | 하나 이상의 정렬된 인라인 단계입니다.                         |

### GitHub 이벤트 및 필터

새 GitHub 워크플로에는 다음 의미 기반 이벤트 이름 중 하나를 사용하세요.

| `on`                                  | 일치 대상                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `github.issue_created`                | 동작이 `opened`인 `issues` 전달입니다.                                             |
| `github.pull_request_created`         | 동작이 `opened`인 `pull_request` 전달입니다.                                       |
| `github.issue_comment_created`        | 이슈에서 동작이 `created`인 `issue_comment` 전달입니다.                            |
| `github.pull_request_comment_created` | 끌어오기 요청에서 동작이 `created`인 `issue_comment` 전달입니다.                   |
| `github.issue_label_added`            | 동작이 `labeled`인 `issues` 전달입니다.                                            |
| `github.pull_request_label_added`     | 동작이 `labeled`인 `pull_request` 전달입니다.                                      |

기존 구성에서는 `github.issues`, `github.issue_comment`, `github.pull_request_review`, `github.pull_request_review_comment`, `github.push`를 계속 사용할 수 있습니다. 이러한 레거시 이벤트는 기존 동작을 유지합니다.

`filters`는 다음 GitHub 필드를 지원합니다. 외부 소스의 모든 워크플로에서 `from_users`는 비어 있지 않아야 합니다. 제공된 모든 필터는 AND로 결합됩니다.

| 필드         | 유형                                | 적용 대상                                                    | 의미                                                                                          |
| ------------ | ----------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `from_users` | 비어 있지 않은 문자열 목록          | 모든 GitHub 이벤트                                           | 워크플로를 시작하도록 허용된 GitHub 로그인입니다.                                             |
| `repo`       | 비어 있지 않은 문자열               | 모든 GitHub 이벤트                                           | `owner/name` 형식의 저장소입니다.                                                              |
| `connection` | 문자열                              | 모든 GitHub 이벤트                                           | GitHub 연결 슬러그입니다.                                                                      |
| `contains`   | 문자열                              | 이슈, 끌어오기 요청, 댓글 이벤트                             | 이슈 또는 끌어오기 요청의 제목과 본문, 혹은 댓글 본문에 포함된 부분 문자열입니다.              |
| `pattern`    | 문자열                              | 이슈, 끌어오기 요청, 댓글 이벤트                             | 같은 텍스트의 시작 부분입니다.                                                                 |
| `label`      | 비어 있지 않은 문자열               | `github.issue_label_added`, `github.pull_request_label_added` | 전달에서 추가된 레이블입니다.                                                                  |
| `labels`     | 비어 있지 않은 문자열의 비어 있지 않은 목록 | 이슈, 끌어오기 요청, 댓글 이벤트                    | 나열한 모든 레이블이 현재 이슈 또는 끌어오기 요청에 있어야 합니다.                             |

`label`과 `labels`는 GitHub 레이블의 대소문자를 구분하지 않습니다. `label`은 변경된 레이블 하나를 확인하고, `labels`는 현재 전체 레이블 집합을 확인해 모든 항목을 요구합니다. 예를 들어 `labels: [bug, backend]`에는 `bug`와 `backend`가 모두 필요합니다.

`label`은 레이블 추가 이벤트에서만 사용하세요. 다른 이벤트에서는 일치하지 않습니다. 댓글로 워크플로를 시작하는 경우를 포함해 항목의 현재 상태를 요구하려면 `labels`를 사용하세요.

전체 분류, 끌어오기 요청 검토, 에이전트 실행 준비 워크플로는 [GitHub 트리거](/docs/hub/triggers/github)를 참조하세요.

### 입력 및 값

입력에는 `type: string | number | boolean`과 선택적 `required`, `default` 및 `choices`이 있습니다. `required`과 `default`은 결합될 수 없습니다. 유한한 `choices`은 입력이 환경이나 명명된 에이전트와 같은 권한을 선택할 수 있는 경우 필요합니다.

값 바인드 표현식:

```yaml
values:
  selected_environment: ${{ steps.classify.outputs.environment }}
  selected_agent: ${{ steps.classify.outputs.agent }}
```

표현식은 선언된 `paseo.inputs`, 이전 `steps.<id>.outputs` 및 `values`을 읽을 수 있습니다. 문법은 경로, JSON 리터럴, 괄호, `!`, `==`, `!=`, `&&`, `||` 및 `??`을 지원합니다.

환경 또는 동적 명명된 에이전트 표현식에는 활성화 시 가능한 문자열 결과의 한정된 집합이 있어야 합니다. 모든 결과에는 구성된 리소스의 이름이 지정되어야 합니다. 런타임 선택은 결코 다른 환경이나 에이전트로 대체되지 않습니다.

### 단계

| 필드 | 필수 | 메모 |
| ----------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `id` | 예 | 워크플로 내에서 고유합니다. |
| `environment` | 예 | 리터럴 환경 이름 또는 하나로 해석되는 유한 표현식입니다. |
| `max_runtime` | 예 | 단계의 하드 제한입니다. |
| `idle_timeout` | 예 | `max_runtime`보다 길지 않은 유휴 제한입니다. |
| `startup_timeout` | 아니요 | 단계 시작 대기 예산입니다. 기본값과 제한은 [시작 시간 제한](/docs/hub/configuration#startup-timeout)을 참조하세요. |
| `agent` | 예 | 명명된 에이전트, 명명된 에이전트를 선택하는 유한 표현식 또는 완전한 정적 인라인 에이전트입니다. |
| `prompt` | 예 | 순서가 지정된 `text` 및 `include` 블록입니다. |
| `if` | 아니요 | 단계 실행 여부를 결정하는 표현식입니다. |
| `env` | 아니요 | 연결 값에서 가져온 환경 변수입니다. |
| `output.schema` | 아니요 | 구조화된 단계 출력을 위한 JSON 스키마입니다. |
| `allow_outputs` | 아니요 | 선택적 `max` 및 `required`가 있는 공급자 출력 기능입니다. |
| `auto_archive` | 아니요 | 단계가 끝난 후 에이전트를 보관합니다. |
| `github` | 아니요 | 이 단계에 대한 명시적인 GitHub 권한입니다. |

인라인 에이전트는 정적이고 완전합니다.

```yaml
agent:
  provider: codex
  model: gpt-5.5
  options:
    approval_policy: never
    sandbox_mode: read-only
```

표현식 값 `agent`은 명명된 에이전트를 선택합니다. 인라인 개체 내의 동적 공급자 필드는 거부됩니다.

### 프롬프트 의미론

```yaml
prompt:
  - include: partials/review.md
  - text: |
      <user-prompt>
      ${{ paseo.prompt }}
      </user-prompt>
```

`${{ paseo.prompt }}`은 공급자 표시와 선언된 선행 `key=value` 입력이 제거된 후 정규화된 요청입니다. 이벤트 컨텍스트로 다시 작성되거나 확장되지 않습니다.

`${{ paseo.context }}`은 해당 단계를 공급자 컨텍스트 구체화로 선택하고 프롬프트에서 결과를 JSON으로 렌더링합니다. 프롬프트 텍스트에서만 사용할 수 있습니다. 워크플로가 해당 표현식을 작성하지 않는 한 Hub는 이를 삽입하지 않습니다.

`.paseo/workflows/`과 관련된 해결을 포함하므로 공유 부분은 `partials/<name>.md`을 사용합니다. 누락된 파일, 절대 경로 또는 순회 경로, 심볼릭 링크, 콘텐츠 불일치, 부분 트리 외부의 파일은 거부됩니다.

### 출력 기능

권한은 이를 사용하는 단계에 유지됩니다.

```yaml
allow_outputs:
  - type: discord.reply
    max: 1
    required: true
```

Slack 워크플로는 `slack.reply`을 사용합니다. Discord 워크플로는 `discord.reply`을 사용합니다. 선언은 `hub.reply`을 부여하고 프롬프트는 에이전트에게 이를 호출하도록 지시해야 합니다. GitHub에는 응답 출력이 없습니다. 명시적인 [`github` 블록](/docs/hub/github)을 사용하세요.

모든 단계는 `hub.finish_execution`을 받습니다. 프롬프트는 에이전트에게 호출할 시기를 알려주어야 합니다. 허브는 완료 또는 응답 지침을 추가하지 않습니다. `output.schema`이 있는 경우 `hub.finish_execution`에는 스키마와 일치하는 `output` 값이 필요합니다. `allow_outputs` 항목이 `required: true`인 경우 에이전트는 완료하기 전에 해당 출력을 내보내야 합니다. `max`의 기본값은 `1`입니다.

## 모놀리식 파일 마이그레이션

`hub.yml`에 `environments`을 유지하고, 환경 목록을 명명된 맵으로 변환하고, 이전의 각 트리거를 자체 `.paseo/workflows/<name>.yml` 파일로 이동합니다. 공유 프롬프트 파일을 `.paseo/workflows/partials/`으로 이동합니다. `agents` 아래에서 전체 명명된 에이전트 구성을 정의하고 동적 공급자 필드를 유한한 명명된 에이전트 선택으로 바꿉니다.

허브는 TOML 또는 모놀리식 `triggers` 섹션을 읽지 않으며 CLI는 두 형식 중 하나를 다시 작성하지 않습니다.

전체 라우팅 예시는 [워크플로](/docs/hub/workflows)를 참조하세요.

## 에이전트 연속 실행

자체 완결형 대시보드 트리거 문서는 `run.continuation`을 사용할 수 있습니다.

| 값 | 동작 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `{mode: conversation}` | 기본값. 이벤트 대화에 해당하는 프로젝트의 에이전트를 재사용하며, 이벤트에 대화가 없으면 새 에이전트를 만듭니다. |
| `{mode: key, key: "support-${{ paseo.inputs.ticket }}"}` | 평가된 사용자 지정 키에 해당하는 프로젝트의 에이전트를 재사용합니다. |
| `{mode: new}` | 도착 이벤트마다 새 에이전트를 만듭니다. |

키는 기존 표현식 문법을 사용하며 비어 있지 않은 512자 이하 문자열로 해석되어야 합니다. 사용자 지정 키와 공급자 대화 ID는 별도의 네임스페이스를 사용합니다. 서로 다른 프로젝트에서 같은 키를 사용해도 에이전트를 공유하지 않습니다.

기존 세션은 데몬, 에이전트 구성, 대상, 환경, 도구 계약을 유지합니다. 같은 키에 대해 이 설정을 바꾸면 설명과 함께 실패합니다. 다른 키 또는 **새 에이전트**를 선택하세요. 프롬프트와 출력 대상은 각 도착 이벤트에 속하며 변경할 수 있습니다. 작업 트리 브랜치는 세션을 처음 만들 때 선택되어 이후 도착 이벤트에서 재사용됩니다.

`run.github` 권한 부여 또는 `run.env`의 연결 토큰처럼 임시 환경 자격 증명을 발급하는 트리거는 이벤트에 대화가 있거나 사용자 지정 키를 사용할 때 **새 에이전트**를 선택해야 합니다. 이러한 자격 증명은 실행과 함께 만료되며 기존 에이전트의 환경은 새로 고칠 수 없습니다. 연속 실행에서도 Hub 관리 응답 도구를 사용할 수 있습니다.

### 업그레이드

새 Hub 버전을 활성화하기 전에 연결된 Paseo 데몬을 업그레이드하세요. Hub에는 데몬의 일반 에이전트 RPC와 요청 수신 기능이 필요하며, 오래된 호스트에서는 조치 가능한 파견 오류가 발생합니다.

Hub 데이터베이스 마이그레이션은 세션과 nullable 실행 연결을 추가합니다. 기존 실행은 완료될 때까지 저장된 시작 계약과 실행별 MCP 엔드포인트를 유지합니다. 기존 자체 완결형 트리거 문서에 새 이벤트가 도착하면 대화 기본값을 사용합니다. 과거 에이전트를 세션에 소급 입력하지는 않습니다.

기존 다단계 워크플로 번들은 현재 동작을 유지합니다. 이를 자체 완결형 트리거로 변환하면 `mode: new`가 명시적으로 기록됩니다. 에이전트를 재사용할 준비가 되면 편집기에서 변경하세요.
