---
title: Hub public API
description: Authenticate with organization credentials to validate and install triggers, rotate webhook secrets, dispatch manual runs, and enroll daemons.
nav: Public API
order: 83
category: Hub
---

# 허브 공개 API

Hub 공개 API를 사용하면 스크립트와 CI 파이프라인을 통해 한 조직의 트리거, 웹훅 비밀, 수동 실행 및 데몬 등록을 관리할 수 있습니다. `PASEO_HUB_URL`을 Hub 원본(예: `https://hub.example.com`)으로 설정합니다.

## API 참조

- [인터랙티브 API 참고](https://hub.paseo.sh/api/reference)
- [OpenAPI 3.1 문서](https://hub.paseo.sh/api/openapi.json)

자체 호스팅 Hub는 자체 원본에서 동일한 `/api/reference` 및 `/api/openapi.json` 엔드포인트를 제공합니다.

## 인증

대화형 CLI 액세스를 위해서는 `paseo hub login [origin]`을 실행하세요. Paseo는 정확한 출처에 대해 `PASEO_HOME` 아래에 취소 가능한 조직 자격 증명을 저장합니다.

자동화를 위해 Hub의 **설정 → API 키** 아래에서 조직 API 키를 생성하세요. 두 가지 자격 증명 중 하나를 Bearer 토큰으로 보냅니다.

```http
Authorization: Bearer paseo_pk_...
Content-Type: application/json
```

API 키의 범위는 하나의 조직과 하나 이상의 선택된 범위로 지정됩니다.

| 범위 | 허용되는 작업 |
| ------------------------ | ---------------------------------------------------------------- |
| `configuration:validate` | 트리거를 나열하고, 확인 가능한 리소스를 나열하고, 트리거를 검증합니다. |
| `configuration:install` | 트리거를 설치하고 트리거 웹훅 비밀을 생성하거나 순환합니다.   |
| `runs:dispatch` | 구성된 `manual.run` 트리거를 디스패치합니다.                      |
| `daemons:enroll` | 단기 데몬 등록 토큰을 발행합니다.                     |
| `projects:read` | 조직의 프로젝트를 나열합니다.                               |

API 키는 대시보드 로그인을 허용하지 않으며 통합 또는 조직 구성원을 관리할 수 없습니다.

API 오류는 `X-Request-ID` 헤더와 함께 RFC 9457 `application/problem+json`을 반환합니다. 누락되거나 유효하지 않거나 취소된 자격 증명은 `WWW-Authenticate: Bearer`과 함께 `401`을 반환합니다.

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

필수 범위가 누락된 유효한 자격 증명은 동일한 형식으로 `403`을 반환합니다.

## 트리거 목록, 검증 및 설치

- `GET /api/v1/triggers`(`configuration:validate`)은 활성 조직 트리거와 배포 가능한 YAML 문서를 나열합니다.
- `POST /api/v1/triggers/validate`(`configuration:validate`)은 Hub 상태를 변경하지 않고 하나의 자체 포함 트리거 YAML 문서의 유효성을 검사합니다.
- `POST /api/v1/triggers/install`(`configuration:install`)은 하나의 트리거를 검증하고 설치하여 YAML `name`으로 생성하거나 업데이트합니다.

`POST /api/v1/triggers/validate` 및 `POST /api/v1/triggers/install`은 동일한 JSON 요청 본문을 허용합니다.

```json
{
  "yaml": "name: manual-task\nenabled: true\non:\n  manual.run: {}\nrun:\n  target: { daemon: my-macbook, cwd: /workspace }\n  agent: { provider: codex, mode: full-access }\n  prompt: |\n    Complete the task and call finish_execution.\n    ${{ paseo.prompt }}\n  max_runtime: 1h\n  idle_timeout: 5m\n"
}
```

두 끝점 모두 대상 데몬에게 `run.agent`의 유효성을 검사하도록 요청하므로 데몬이 연결되고 `hub.execute`을 보유해야 합니다. 유효성 검사에서는 `{ "name": "manual-task", "valid": true }`과 함께 `200`을 반환합니다. 설치가 `201`을 반환합니다.

```json
{
  "triggerId": "00000000-0000-4000-8000-000000000001",
  "name": "manual-task",
  "revisionId": "00000000-0000-4000-8000-000000000002",
  "version": 1,
  "active": true
}
```

잘못된 YAML, 알 수 없는 통합 또는 거부된 에이전트 설정으로 인해 필드 문제와 함께 `422`이 반환됩니다. `paseo hub deploy --dry-run` 및 `paseo hub deploy`은 `.paseo/triggers/*.yml`에 대해 이러한 엔드포인트를 호출합니다.

## 웹훅 비밀

`POST /api/v1/triggers/webhook-secret`(`configuration:install`)은 저장된 `webhook.received` 트리거에 대한 Bearer 비밀을 생성하거나 순환합니다.

요청 본문:

```json
{
  "triggerId": "00000000-0000-4000-8000-000000000001"
}
```

성공하면 Hub는 `Cache-Control: no-store`과 함께 `200`을 반환합니다.

```json
{
  "path": "/webhooks/wh_0123456789abcdef0123456789abcdef",
  "secret": "whsec_..."
}
```

각 호출은 이전 비밀을 즉시 대체하고 새 비밀을 한 번만 표시합니다. `/webhooks/wh_...`으로 배송을 보내는 방법은 [인바운드 웹후크](/docs/hub/triggers/webhooks)를 참조하세요.

## 수동 실행 파견

`POST /api/v1/manual-runs`(`runs:dispatch`)은 구성된 `manual.run` 트리거를 시작합니다. `actor`은 해당 트리거의 `filters.from_users` 허용 목록(또는 생략된 경우 `*`)과 일치해야 합니다.

```json
{
  "projectSlug": "default",
  "trigger": "manual-task",
  "actor": "automation",
  "deliveryKey": "manual-task-2026-09-09-001",
  "input": "repo=project investigate the failed sync"
}
```

- `deliveryKey`은 조직 및 프로젝트 범위에서 내구성 있는 중복 제거 기능을 제공합니다.
- `input`은 선언된 `inputs`에 대한 선행 `key=value` 토큰과 프롬프트 텍스트를 허용합니다.

독립형 트리거의 경우 `expectedVersionId`을 생략합니다. 트리거 설치에서 `revisionId`을 전달하면 트리거가 변경되지 않은 경우에도 HTTP `409`(`configuration_changed`)이 반환됩니다.

레거시 프로젝트 번들의 경우 `expectedVersionId`은 선택 사항입니다. 구성이 변경되면 발송을 거부하려면 활성 프로젝트 구성 개정 ID로 설정하세요.

성공하면 Hub는 `200`을 반환합니다.

```json
{
  "deliveryKey": "manual-task-2026-09-09-001",
  "providerEventReceiptId": "00000000-0000-4000-8000-000000000000",
  "triggerRunId": "00000000-0000-4000-8000-000000000000",
  "configuredTriggerName": "manual-task",
  "workflowStatus": "running"
}
```

예:

```bash
curl --fail-with-body -sS -X POST "$PASEO_HUB_URL/api/v1/manual-runs" \
  -H "Authorization: Bearer $PASEO_HUB_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "projectSlug": "default",
    "trigger": "manual-task",
    "actor": "automation",
    "deliveryKey": "manual-task-2026-09-09-001",
    "input": "investigate the failed sync"
  }'
```

## 데몬 등록

`POST /api/v1/daemons/enrollment-tokens`(`daemons:enroll`)은 10분 후에 만료되는 일회용 등록 토큰을 발급합니다. 요청 본문이 필요하지 않습니다.

```bash
curl --fail-with-body -sS -X POST \
  "$PASEO_HUB_URL/api/v1/daemons/enrollment-tokens" \
  -H "Authorization: Bearer $PASEO_HUB_API_KEY"
```

응답(`201`):

```json
{
  "token": "short-lived-enrollment-token",
  "expiresAt": "2026-09-09T12:10:00.000Z"
}
```

`paseo hub connect [origin]`은 이 끝점을 자동으로 호출하고 토큰을 데몬의 장기 관계 자격 증명으로 교환합니다. API 키를 취소하면 새로운 API 호출이 즉시 차단되고 발급된 사용되지 않은 등록 토큰이 만료됩니다.

## 키 및 감사 추적

Hub는 생성 시 API 키 비밀을 한 번 표시합니다. 대시보드는 키 접두사, 범위, 생성 시간, 마지막으로 사용된 타임스탬프 및 해지 상태만 유지합니다. Hub는 트리거 설치, 웹훅 순환, 수동 디스패치 및 데몬 등록 토큰에 대한 주요 속성을 기록합니다.
