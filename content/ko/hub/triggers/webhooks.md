---
title: Inbound webhooks
description: Start Hub agents from any external service, alert tool, or script with an authenticated HTTP POST.
nav: Webhooks
order: 70
category: Hub
---

# 인바운드 웹훅

인바운드 웹후크를 사용하면 인증된 HTTP `POST` 요청을 Hub에 보내 외부 서비스, CI 작업, 모니터링 경고 또는 스크립트가 데몬에서 에이전트를 시작할 수 있습니다.

자체 호스팅 Hub에서 외부 서비스가 웹훅 엔드포인트에 도달할 수 있도록 [공용 HTTPS 주소](/docs/hub/self-hosting#public-addresses)를 구성합니다.

## 웹훅 트리거 생성

Hub 대시보드 트리거 편집기에서 **Webhook received**를 선택하거나 `.paseo/triggers/alert-handler.yml`을 저장하고 `paseo hub deploy`을 실행합니다.

```yaml
name: alert-handler
enabled: true
on:
  webhook.received: {}
run:
  target:
    daemon: devbox
    cwd: /workspace/project
  agent:
    provider: codex
    mode: full-access
  continuation:
    mode: new
  max_runtime: 1h
  idle_timeout: 10m
  output:
    schema:
      type: object
      required: [summary]
      properties:
        summary:
          type: string
      additionalProperties: false
  prompt: |
    Investigate the alert and identify its root cause.
    Call finish_execution with a short summary in output.summary.
```

`webhook.received`은 `connection` 또는 `filters`을 허용하지 않습니다. 웹훅 트리거는 `required: true` 입력을 선언할 수 없습니다.

## 웹훅 비밀 생성 또는 순환

웹후크 트리거를 저장하면 Hub는 `/webhooks/wh_<32-char-id>` 형식의 임의 끝점 경로를 할당합니다.

다음 두 가지 방법 중 하나로 Bearer Secret을 생성합니다.

1. Hub 대시보드에서 저장된 트리거를 열고 **비밀 생성**(또는 나중에 **비밀 회전**)을 선택합니다. Hub에서는 비밀이 한 번만 표시되므로 즉시 비밀을 복사하세요.
2. 공개 API를 통해 `configuration:install`을 보유한 조직 자격 증명을 사용하여 `POST /api/v1/triggers/webhook-secret`을 `{"triggerId":"<trigger-id>"}`과 함께 보냅니다. Hub는 `{ "path": "/webhooks/wh_...", "secret": "whsec_..." }`을 반환합니다.

비밀을 교체하면 이전 비밀이 즉시 무효화됩니다. `paseo hub deploy`을 통해 동일한 트리거 `name`을 `webhook.received`과 함께 재배포하면 엔드포인트 경로와 활성 비밀이 모두 그대로 유지됩니다.

## 웹훅 요청 보내기

`Authorization: Bearer` 헤더에 비밀을 포함하여 HTTP `POST` 요청을 보냅니다.

```sh
curl -X POST "$WEBHOOK_URL" \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: alert-123" \
  -d '{"alert":"Disk usage over 95%","host":"prod-01"}'
```

성공하면 Hub는 영수증을 저장하고 실행을 대기열에 넣은 다음 HTTP `202`을 반환합니다.

```json
{
  "status": "accepted",
  "runId": "00000000-0000-4000-8000-000000000000"
}
```

실행은 소스 `webhook.received` 아래의 [활동](/docs/hub/activity)에 표시됩니다.

## 요청 제한 및 응답

- Hub는 최대 32KiB의 UTF-8 텍스트 본문을 허용하고 리터럴 NUL 문자가 포함된 요청을 거부합니다.
- `Content-Type`이 `application/json`이거나 `+json`으로 끝나면 Hub는 본문이 JSON으로 구문 분석되는지 확인합니다. `Content-Type`을 생략하면 기본값은 `text/plain`이 됩니다.
- 선택적인 `Idempotency-Key` 헤더(공백 없이 인쇄 가능한 최대 200개의 ASCII 문자)를 전달하여 재시도에서 중복 실행을 시작하는 대신 원래 `runId`을 반환합니다. 키의 범위는 엔드포인트별로 지정됩니다.
- 각 엔드포인트는 분당 최대 60개의 새로운 배달을 허용합니다.

| 상태 | 의미 |
| ------ | ----------------------------------------------------------------------- |
| `202` | 배달이 승인되고 대기열에서 실행됩니다(`{ "status": "accepted", "runId" }`). |
| `400` | 잘못된 본문, 잘못된 `Content-Type`, NUL 문자 또는 잘못된 키입니다.        |
| `401` | 알 수 없는 엔드포인트이거나 전달자 비밀번호가 누락되었거나 유효하지 않습니다.                   |
| `403` | 조직이 월별 실행 허용량에 도달했습니다.                   |
| `409` | 트리거가 비활성화되었습니다.                                                |
| `413` | 요청 본문이 32KiB를 초과합니다.                                            |
| `429` | 엔드포인트가 현재 분 동안 60개의 새로운 전달을 초과했습니다.       |

## 페이로드가 에이전트에 도달하는 방법

Hub는 웹훅 본문과 전달 메타데이터(`contentType` 및 `receivedAt`)를 신뢰할 수 없는 외부 데이터로 프레임합니다.

`run.prompt`이 `${{ paseo.prompt }}`을 생략하는 경우 Hub는 자동으로 지침 끝에 프레임된 웹후크 페이로드를 추가합니다. 프롬프트 내에서 페이로드가 표시되는 위치를 제어하려면 배치할 위치에 `${{ paseo.prompt }}`을 삽입하세요.

구조화된 `webhook` 메타데이터 개체(`contentType` 및 `receivedAt`)도 원하는 경우 `${{ paseo.context }}`을 포함합니다. 웹훅 실행에서 Slack 또는 Discord에 결과를 게시하려면 [통합 도구](/docs/hub/tools)를 추가하세요.
