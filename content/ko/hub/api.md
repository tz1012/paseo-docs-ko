---
title: Hub public API
description: Use organization credentials to list projects, validate or install configuration, dispatch runs, and enroll daemons.
nav: Public API
order: 79
category: Hub
---

# 허브 공개 API

Hub 공개 API를 사용하면 프로젝트와 데몬을 하나로 자동화할 수 있습니다.
조직. 예를 들어 아래 `PASEO_HUB_URL`에 허브 원본을 설정합니다.
`https://hub.example.com`.

## API 참조

- [인터랙티브 API 참고](https://hub.paseo.sh/api/reference)
- [OpenAPI 3.1 문서](https://hub.paseo.sh/api/openapi.json)

이는 호스팅된 Paseo Hub에 대한 표준 참조 엔드포인트입니다. 자체 호스팅 허브는 자체 원본에서 동일한 `/api/reference` 및 `/api/openapi.json` 경로를 노출합니다.

## 인증

대화형 CLI 액세스를 위해 `paseo hub login [origin]`을 실행하세요. 브라우저 승인 후 Paseo는 정확한 출처에 대해 `PASEO_HOME` 아래에 지속적이고 취소 가능한 조직 자격 증명을 저장합니다. 명시적인 출처가 없으면 CLI는 `PASEO_HUB_URL`, 활성 저장된 로그인, `https://hub.paseo.sh`을 차례로 사용합니다.

자동화를 위해 허브 대시보드의 **API 키** 아래에서 조직 API 키를 생성하세요. 두 자격 증명 유형 모두 무기명 토큰입니다.

```http
Authorization: Bearer paseo_pk_...
Content-Type: application/json
```

API 키는 조직 범위입니다. 키를 소유한 조직이 결정합니다.
도달할 수 있는 프로젝트 및 데몬 등록 토큰 없다
이러한 요청에 추가할 조직 ID입니다. 다른 프로젝트 슬러그
키를 통해 조직에 액세스할 수 없습니다.

각 키에는 하나 이상의 선택 가능한 범위가 있습니다.

| 범위 | 운영 |
| ------------------------ | -------------------------------------- |
| `projects:read` | 조직의 활성 프로젝트를 나열합니다.           |
| `configuration:validate` | 허브 상태를 변경하지 않고 구성을 검증합니다.  |
| `configuration:install` | 프로젝트 구성을 교체하고 활성화합니다.     |
| `runs:dispatch` | 프로젝트에 대해 구성된 수동 트리거를 전달합니다. |
| `daemons:enroll` | 단기 데몬 등록 토큰을 발행합니다.        |

API 키는 대시보드 액세스 권한을 부여하지 않습니다. 연결을 관리할 수 없습니다.
프로젝트 또는 조직 구성원.

CLI 자격 증명은 현재 CLI 작업 범위를 가지며 데몬 관계와 관계없이 취소 가능한 상태로 유지됩니다. `paseo hub logout`은 활성 로컬 CLI 자격 증명을 삭제합니다. 데몬 ID를 취소하거나 연결을 끊지 않습니다.

API 오류에는 RFC 9457 문제 세부 정보가 사용됩니다. 누락되거나 유효하지 않거나 취소된 자격 증명은 `application/problem+json`과 함께 `401`을 반환합니다.

```json
{
  "type": "https://paseo.sh/problems/unauthorized",
  "title": "Authentication required",
  "status": 401,
  "detail": "Provide an active Paseo organization credential in the Authorization: Bearer header.",
  "code": "unauthorized",
  "requestId": "5e967c44-fc22-4f6d-8fc5-1bbff33121af"
}
```

엔드포인트에 필요한 범위가 없는 유효한 키는 동일한 형식으로 `403`을 반환합니다.

## 프로젝트 목록

`GET /api/v1/projects`은 보유자 자격 증명 조직의 활성 프로젝트를 반환합니다. `paseo hub projects`은 프로젝트를 테이블로 렌더링합니다. `--json`을 사용하면 `{ "origin": "...", "projects": [...] }`을 반환하므로 빈 결과라도 해결된 허브를 기록합니다.

```json
{
  "projects": [
    {
      "id": "00000000-0000-4000-8000-000000000000",
      "slug": "my-project",
      "name": "My project"
    }
  ]
}
```

## 구성 유효성 검사

`POST /api/v1/configurations/validate`은 동일한 `projectSlug`을 허용하고 구성 설치로 `files` 번들을 완료합니다. 개정판을 기록하거나 활성 구성을 변경하지 않고 동일한 컴파일 및 리소스 확인을 수행합니다.

성공하면 Hub는 `200`을 반환합니다.

```json
{
  "projectSlug": "my-project",
  "valid": true
}
```

`paseo hub deploy --dry-run`은 배포에서 보낼 것과 동일한 로컬로 확인된 페이로드를 사용하여 이 끝점을 호출합니다.

## 구성 설치

`configuration:install`은 제공된 정식 번들의 유효성을 검사하고, 정확하게 작성된 파일을 저장하고, 새 개정판을 활성화합니다.

```http
POST /api/v1/configurations/install
```

요청 본문:

```json
{
  "projectSlug": "my-project",
  "files": [
    {
      "path": ".paseo/hub.yml",
      "content": "environments:\n  production:\n    kind: daemon\n    daemon: build-server\n    cwd: /workspace\nagents:\n  codex:\n    provider: codex\n"
    },
    {
      "path": ".paseo/workflows/deploy.yml",
      "content": "name: deploy\non: manual.run\nmax_runtime: 2h\nfilters:\n  from_users: [automation]\nsteps:\n  - id: deploy\n    environment: production\n    max_runtime: 90m\n    idle_timeout: 10m\n    agent: codex\n    prompt:\n      - include: partials/safety.md\n"
    },
    {
      "path": ".paseo/workflows/partials/safety.md",
      "content": "Follow the safety checklist."
    }
  ]
}
```

`projectSlug`은 대상 프로젝트를 선택합니다. 무기명 자격 증명은 조직을 수정합니다. `files`에는 `.paseo/hub.yml`, 모든 직접 워크플로 `.yml` 및 참조된 각 워크플로 부분이 포함됩니다. 허브는 누락, 추가, 중복, 안전하지 않거나 비표준 경로를 거부합니다.

한도:

- 번들: 최대 100개 파일.
- 파일 경로: 최대 512자.
- 파일 내용: 최대 1,000,000자.
- 프롬프트 부분: 각각 최대 1,000,000바이트, 총 5,000,000바이트입니다.

성공하면 Hub는 `201`을 반환합니다.

```json
{
  "projectSlug": "my-project",
  "versionId": "00000000-0000-4000-8000-000000000000",
  "version": 3,
  "active": true
}
```

일반적인 응답은 누락되거나 잘못된 본문의 경우 `400`, 키 조직의 비활성 또는 알 수 없는 프로젝트의 경우 `404`, 유효하지 않은 YAML 또는 유효하지 않은 구성의 경우 `422`입니다. 검증 문제 세부정보에는 필드 문제가 포함됩니다. 실패한 설치는 활성 버전을 대체하지 않습니다.

예:

```bash
curl --fail-with-body -sS -X POST "$PASEO_HUB_URL/api/v1/configurations/install" \
  -H "Authorization: Bearer $PASEO_HUB_API_KEY" \
  -H "Content-Type: application/json" \
  --data @configuration-install.json
```

`paseo hub deploy -p <project>`은 검색된 로컬 번들을 사용하여 이 엔드포인트를 호출합니다. 이 명령은 플래그와 환경 자격 증명이 없는 경우 정확한 출처에 저장된 로그인을 사용합니다. [CLI에서 배포](/docs/hub/configuration#deploy-from-the-cli)를 참조하세요.

## 수동 실행 파견

`runs:dispatch`은 프로젝트에 대해 구성된 `manual.run` 트리거를 전달합니다.
트리거는 활성 구성에 존재해야 하며 `actor`이 나열되어야 합니다.
해당 트리거의 `filters.from_users` 허용 목록에 있습니다.

```http
POST /api/v1/manual-runs
```

요청 본문:

```json
{
  "projectSlug": "my-project",
  "expectedVersionId": "00000000-0000-4000-8000-000000000000",
  "trigger": "deploy",
  "actor": "automation",
  "deliveryKey": "deploy-2026-08-04-001",
  "input": "repo=project investigate the failed sync"
}
```

- `expectedVersionId`은 선택사항입니다. 제공된 경우 Hub는 해당 개정이 더 이상 활성화되지 않은 경우 디스패치를 ​​거부합니다.
- `input`은 공급자 메시지에서 사용하는 것과 동일한 문자열입니다. 선행 `key=value` 토큰은 선언된 입력으로 구문 분석되고 나머지는 `${{ paseo.prompt }}`이 됩니다.
- `deliveryKey`은 디스패치별로 고유하고 안정적이어야 합니다. Hub는 내구성 있는 중복 제거를 위해 이를 사용하지만 이전 응답을 정확히 한 번 전달하거나 재생한다고 약속하지는 않습니다.

성공하면 Hub는 `200`을 반환합니다.

```json
{
  "deliveryKey": "deploy-2026-08-04-001",
  "providerEventReceiptId": "00000000-0000-4000-8000-000000000000",
  "triggerRunId": "00000000-0000-4000-8000-000000000000",
  "configuredTriggerName": "deploy",
  "workflowStatus": "running"
}
```

일반적인 응답은 잘못된 요청의 경우 `400`, 트리거에서 행위자를 허용하지 않는 경우 `403`, 알 수 없는 프로젝트, 구성 또는 트리거의 경우 `404`, 데몬이 오프라인이거나 예상되는 구성이 더 이상 최신이 아니거나 디스패치 충돌인 경우 `409`입니다. 각각은 위의 문제 세부정보 모양을 사용합니다.

예:

```bash
curl --fail-with-body -sS -X POST "$PASEO_HUB_URL/api/v1/manual-runs" \
  -H "Authorization: Bearer $PASEO_HUB_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "projectSlug": "my-project",
    "trigger": "deploy",
    "actor": "automation",
    "deliveryKey": "deploy-2026-08-04-001",
    "input": "repo=project investigate the failed sync"
  }'
```

입력 유형, 기본값, 선택 항목은 [허브 워크플로](/docs/hub/workflows)를 참조하세요.
거부된 입력 및 수동 호출 예시.

## 데몬 등록

`daemons:enroll`은 데몬에 대한 단기 등록 토큰을 발급합니다. API
키는 이 토큰을 발행합니다. 이는 데몬의 오래 지속되는 자격 증명이 아니므로
하나로 사용됩니다.

```http
POST /api/v1/daemons/enrollment-tokens
```

요청 본문이 필요하지 않습니다. 성공하면 Hub는 `201`을 반환합니다.

```json
{
  "token": "short-lived-enrollment-token",
  "expiresAt": "2026-08-04T12:10:00.000Z"
}
```

토큰은 10분 후에 만료되며 데몬이 등록될 때 사용됩니다.

`paseo hub connect [origin]`은 `--api-key`, `PASEO_HUB_API_KEY` 또는 일치하는 저장된 로그인을 사용하여 이 요청을 수행한 다음 일회성 토큰을 데몬의 등록 작업에 전달합니다. 데몬은 자체 관계 자격 증명을 생성하고 유지합니다.

```bash
curl --fail-with-body -sS -X POST \
  "$PASEO_HUB_URL/api/v1/daemons/enrollment-tokens" \
  -H "Authorization: Bearer $PASEO_HUB_API_KEY"
```

Direct API 소비자는 반환된 토큰을 데몬 등록 프로토콜에 전달할 수 있습니다. Paseo CLI는 의도적으로 원시 등록 토큰을 허용하지 않습니다. `connect`은 인증된 단일 흐름 교환을 소유합니다.

등록 토큰은 재사용할 수 없습니다. API 키를 취소하면 즉시 거부됩니다.
향후 API를 요청하고 사용되지 않은 등록 토큰을 만료시킵니다.
발행. 폐지와 발급 사이의 경합은 새로운 계약이 체결되기 전에 허브에 의해 해결됩니다.
토큰이 저장됩니다.

## 키, 범위 및 감사 정보

전체 API 키 비밀은 생성 직후 한 번 표시됩니다. 저장하세요
배포의 비밀 관리자에서 허브에 다시 표시되지 않습니다. 대시보드
키의 접두사만 유지하고 선택한 범위, 생성 시간,
마지막으로 사용한 시간 및 상태.

범위가 지정된 API에 대해 키가 성공적으로 인증된 후 허브가 `last used`을 업데이트합니다.
운영. API 작업은 Hub 감사 증거의 주요 속성을 유지합니다.
따라서 구성 개정, 수동 디스패치 및 데몬 등록 토큰
이를 생성한 조직 키를 추적할 수 있습니다.