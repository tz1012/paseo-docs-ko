---
title: Scheduled triggers
description: Run Hub agents on a recurring calendar schedule in your timezone.
nav: Schedules
order: 69
category: Hub
---

# 예약된 트리거

예약된 트리거는 선택한 시간대의 반복 달력 일정에 따라 데몬에서 에이전트를 시작합니다. 이를 [`run.github`](/docs/hub/github) 또는 [통합 도구](/docs/hub/tools)와 결합하여 일일 CI 보고서, 분류 대기열 또는 릴리스 확인을 실행하고 Slack 또는 Discord에 요약을 게시합니다.

## 대시보드에서 일정을 생성하세요

Hub에서 **트리거**를 열고 **새 트리거**를 선택한 다음 **이러한 상황**에서 **일정**을 선택합니다. **분마다**, **시간마다**, **매일** 또는 **매주**를 선택하고 현지 시간과 시간대를 설정하고 데몬, 작업 디렉터리 및 에이전트를 선택합니다.

트리거가 사전 설정과 일치하지 않는 맞춤 RFC 5545 RRULE을 사용하는 경우 양식에 **맞춤 일정** 필드가 표시되고 다른 설정을 편집할 때 규칙이 유지됩니다.

## YAML에서 일정 작성

이를 `.paseo/triggers/daily-ci-digest.yml`으로 저장하고 `paseo hub deploy`을 사용하여 배포합니다.

```yaml
name: daily-ci-digest
enabled: true
on:
  schedule.tick:
    recurrence:
      start: "2026-09-09T07:00:00"
      rule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
      timezone: America/New_York
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
  auto_archive: true
  background: true
  tools:
    slack:
      connection: acme-slack
      actions: [post]
      channels: [C01234567]
  prompt: |
    Analyze the last 24 hours of CI failures, post a short digest to C01234567 with slack_post,
    and call finish_execution.
    Schedule context: ${{ paseo.context }}
```

`schedule.tick`은 `connection` 또는 `filters`을 허용하지 않습니다. 예약된 틱은 호출 인수를 제공하지 않으므로 `schedule.tick`을 포함하는 트리거는 `required: true` 입력을 선언할 수 없습니다.

기본 작업 영역 목록에서 숨겨진 상태로 유지되는 배경 Paseo 작업 영역을 만들려면 `run.background: true`을 설정하세요. 실행이 완료되면 작업 영역을 보관하려면 `run.auto_archive: true`(기본값)을 설정합니다.

## 반복 규칙

`recurrence`에는 세 가지 필수 필드가 있습니다.

- `start`은 `"2026-09-09T09:00:00"`과 같이 오프셋 없이 초가 포함된 인용된 현지 날짜-시간입니다. 이는 간격 정렬을 고정하고 하한 역할을 합니다.
- `timezone`은 `America/New_York` 또는 `Europe/Berlin`과 같은 IANA 시간대 이름입니다.
- `rule`은 `RRULE:` 접두사가 없는 하나의 RFC 5545 RRULE 문자열입니다.

| 케이던스 | `rule` | 예 `start` |
| ----------------------------- | ------------------------------------ | --------------------- |
| 매시간 | `FREQ=HOURLY` | `2026-09-09T09:00:00` |
| 90분마다 | `FREQ=MINUTELY;INTERVAL=90` | `2026-09-09T09:00:00` |
| 매일 09:00, 17:00 | `FREQ=DAILY;BYHOUR=9,17` | `2026-09-09T09:00:00` |
| 격주 월요일, 금요일 | `FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,FR` | `2026-09-07T09:00:00` |
| 지난 금요일 17:00 | `FREQ=MONTHLY;BYDAY=-1FR` | `2026-09-25T17:00:00` |
| 매월 마지막 날 | `FREQ=MONTHLY;BYMONTHDAY=-1` | `2026-09-30T09:00:00` |
| 10시간마다 실행 | `FREQ=HOURLY;COUNT=10` | `2026-09-09T09:00:00` |

`COUNT` 및 `INTERVAL`은 최대 `10000`의 값을 허용하고, `rule`은 최대 `2048` 문자를 허용합니다. `UNTIL`은 `UNTIL=20261231T235959Z`과 같은 포괄적인 UTC 타임스탬프를 사용합니다.

## 타이밍, 오버랩 및 복구

- Hub는 선택한 시간대의 현지 벽시계를 기준으로 일정을 평가하여 일광 절약 시간제에 따라 건너뛴 시간을 건너뛰고 이전 발생 시 한 번 반복 실행합니다. 일광 절약 시간제 기간 동안 고정 경과 시간 간격을 지정하려면 `UTC`을 사용하세요.
- 예약된 실행이 여전히 활성 상태인 동안 Hub는 병렬 실행을 누적하는 대신 해당 트리거에 대해 새로 발생하는 발생을 건너뜁니다. 활성 실행이 완료되거나 실패하면 다음 번 발생이 재개됩니다. 동일한 데몬에서 별도의 트리거가 동시에 실행될 수 있습니다.
- Hub 가동 중지 시간이 지나면 Hub는 가장 먼저 놓친 발생에 대해 한 번의 만회 실행을 파견한 후 다음 발생으로 진행합니다. 놓친 모든 틱을 재생하지는 않습니다.
- `run.prompt`에 `${{ paseo.context }}`을 포함하여 `schedule.trigger_id`, `schedule.scheduled_at`(UTC) 및 `schedule.timezone`을 전달합니다.
- Hub 일정은 Paseo에 구성된 데몬 기본 일정과 독립적입니다.
