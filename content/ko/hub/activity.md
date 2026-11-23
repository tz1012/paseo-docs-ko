---
title: Hub activity
description: Inspect trigger runs, distinguish filtered events from unrouted ones, and debug a trigger that did not run.
nav: Activity
order: 75
category: Hub
---

# 허브 활동

Hub는 실행 시작 여부에 관계없이 허용된 모든 이벤트를 기록합니다. **활동** 및 **통합**을 사용하여 게재를 검사하고 트리거를 디버그하세요.

## 어디를 봐야할지

**활동**에는 조직의 최근 트리거 실행이 나열됩니다. 각 행에는 트리거, 공급자, 소스, 상태 및 Hub가 이벤트를 수신한 시기가 표시됩니다.

**통합 → 알려진 라우팅되지 않은 이벤트**에는 실행을 시작하지 않았지만 가장 최근에 허용된 50개의 공급자 이벤트가 표시됩니다. Hub는 다음 네 가지 이유 중 하나를 기록합니다.

| 이유 | 의미 |
| --------------------------- | ------------------------------------------------------------ |
| `no_project_route` | 이벤트의 통합 또는 리소스와 일치하는 활성화된 경로가 없습니다 |
| `no_trigger_for_source` | 활성화된 트리거가 해당 이벤트 소스를 처리하지 않습니다 |
| `trigger_filters_rejected` | 트리거가 소스와 일치했지만 해당 필터가 이를 거부했습니다 |
| `configuration_unavailable` | 참조된 트리거 또는 통합을 해결할 수 없습니다. |

## 이벤트가 도착했을 때 아무 일도 일어나지 않았습니다

다음 항목을 순서대로 확인하세요.

1. **활동**을 엽니다. 이벤트가 누락된 경우 **통합 → 알려진 라우팅되지 않은 이벤트**를 확인하고 기록된 이유를 읽어보세요.
2. 두 보기 모두에서 이벤트가 누락된 경우 공급자 배달 로그를 사용하여 Hub가 이벤트를 수락했는지 확인합니다. GitHub의 경우 **앱 → 고급 → 최근 배달**을 엽니다. 공급자가 전송을 보내지 않은 경우 통합이 이벤트 유형을 구독하는지 확인하세요.
3. `from_users`을(를) 확인하세요. GitHub는 로그인 이름을 사용하고, Linear, Slack, Discord는 사용자 ID([Linear](/docs/hub/triggers/linear#filters-and-linear-uuids), [Slack](/docs/hub/triggers/slack#find-your-slack-ids), [Discord](/docs/hub/triggers/discord#find-your-discord-ids))를 사용합니다.
4. 텍스트 필터(`contains`, `pattern` 및 GitHub `exclude_contains`)를 확인합니다. Slack 및 Discord에서는 메시지에 봇이 언급되어야 하며 `pattern`이 언급 뒤에 와야 합니다.
5. **트리거**에서 트리거가 활성화되어 있는지 확인합니다.
6. 대상 데몬이 **Daemons** 아래에 연결되어 있고 `hub.execute` 권한을 보유하고 있는지 확인합니다.
7. 실행이 일찍 시작되고 중지된 경우 해당 기간을 `max_runtime`, `idle_timeout` 및 `startup_timeout`과 비교합니다.
8. 다시 게시하지 않고 실행이 완료된 경우 `run.prompt`을 확인합니다. 프롬프트는 에이전트에게 `reply`(또는 `slack_post` / `discord_post`) 및 `finish_execution`을 호출하라고 지시해야 합니다.

## 웹훅 및 일정 실행

인바운드 웹훅으로 시작된 실행은 `webhook.received` 아래의 **활동**에 표시됩니다. HTTP `POST`가 오류 상태(`400`, `401`, `403`, `409`, `413` 또는 `429`)를 반환하면 [인바운드 웹훅](/docs/hub/triggers/webhooks#request-limits-and-responses)을 참조하세요.

예약된 실행은 `schedule.tick` 아래 **활동**에 표시됩니다. 예약된 실행이 여전히 활성 상태인 동안 Hub는 활성 실행이 완료되거나 실패할 때까지 해당 트리거에 대해 새로 발생하는 발생을 건너뜁니다.
