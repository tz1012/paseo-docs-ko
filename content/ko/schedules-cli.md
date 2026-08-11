---
title: Schedules from the CLI
description: Create and manage Paseo schedules with paseo schedule.
nav: CLI
order: 27
category: Schedules
---

# CLI의 일정

`paseo schedule`은 헤드리스 박스 및 스크립트에 유용한 new-agent [일정](/docs/schedules)을 터미널에서 생성하고 관리합니다. 실행될 때마다 새로운 에이전트가 시작됩니다.

## 만들기

Codex의 하룻밤 리팩터링:

```bash
paseo schedule create \
  --every 30m \
  --name overnight-refactor \
  --provider codex/gpt-5.5 \
  --cwd ~/dev/my-app \
  --max-runs 16 \
  --expires-in 10h \
  "Continue the refactor. Run the focused checks. Leave a short status note."
```

Claude의 장기 베이비시터:

```bash
paseo schedule create \
  --every 5m \
  --name build-watch \
  --provider claude/opus-4.7 \
  --cwd ~/dev/my-app \
  --max-runs 24 \
  "Check the release build. If it failed, inspect logs, fix the cause, and rerun."
```

OpenCode를 통한 GLM의 일일 GitHub 분류:

```bash
paseo schedule create \
  --cron "0 14 * * 1-5" \
  --timezone UTC \
  --run-now \
  --name github-triage \
  --provider opencode/openrouter/glm-5.1 \
  --cwd ~/dev/my-app \
  "Triage GitHub issues, PRs, and failing checks. Summarize what needs attention."
```

일광 절약 시간제 변경을 포함하여 뉴욕 오전 9시 아침 분류:

```bash
paseo schedule create \
  --cron "0 9 * * 1-5" \
  --timezone America/New_York \
  --name morning-triage \
  --provider codex/gpt-5.5 \
  --cwd ~/dev/my-app \
  "Review overnight CI failures and summarize anything urgent."
```

## 심장박동

실행 중인 Paseo 에이전트 내에서 동일한 대화에 대한 하트비트를 생성합니다.

```bash
paseo heartbeat create \
  --cron "*/20 * * * *" \
  --name heartbeat \
  "Check the current task state and continue with the next useful step."
```

하트비트 인터페이스는 의도적으로 작습니다.

```bash
paseo heartbeat update <id> --cron "*/10 * * * *"
paseo heartbeat delete <id>
```

하트비트를 업데이트하면 크론 케이던스와 선택적 시간대만 변경됩니다. 목표와 프롬프트는 고정되어 있습니다. 하트비트 명령에는 Paseo가 에이전트 세션 내에 설정하는 `PASEO_AGENT_ID`이 필요합니다.

하트비트에는 원시 `--cron` 표현식이 필요합니다. 아래의 `--every` 사전 설정은 신규 에이전트 일정에만 사용할 수 있습니다.

## 관리

```bash
paseo schedule ls
paseo schedule inspect <id>
paseo schedule logs <id>
paseo schedule pause <id>
paseo schedule resume <id>
paseo schedule run-once <id>
paseo schedule update <id> --every 10m --max-runs 6
paseo schedule delete <id>
```

## 케이던스

5필드 크론 표현식에는 `--cron "<expr>"`을 사용하세요. 일반적인 cron 호환 케이던스의 경우 `--every <duration>`은 `5m` 또는 `1h`과 같은 사전 설정을 허용하고 이를 cron으로 컴파일합니다. 생성 시간에 고정된 롤링 간격을 생성하지 않습니다.

일정은 기본적으로 UTC로 설정됩니다. 현지 벽시계 시간대의 크론 필드를 해석하려면 `--timezone <IANA>`을 전달합니다(예: `--timezone America/New_York`). 지속된 `nextRunAt`은 여전히 ​​UTC 순간이지만 해당 현지 시간대를 기준으로 계산되므로 일광 절약 시간이 변경되더라도 반복 작업은 동일한 현지 시간으로 유지됩니다.

일정은 기본적으로 일치하는 다음 크론 시간을 기다립니다. 생성 시 즉시 한 번의 실행을 시작하려면 `--run-now`을 전달하세요.

`--host`을 사용하여 원격 데몬을 대상으로 하는 경우 `--cwd`을 전달합니다. 로컬 작업 디렉터리가 원격 컴퓨터에 없을 수도 있습니다.