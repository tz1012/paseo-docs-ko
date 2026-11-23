---
title: Hub
description: Automate coding agents on your Paseo daemons from GitHub, Linear, Slack, Discord, schedules, and webhooks.
nav: Overview
order: 60
category: Hub
---

# Hub

Paseo 데몬은 한 컴퓨터에서 코딩 에이전트를 실행합니다. Paseo Hub는 데몬 위에 위치하므로 외부 이벤트, 일정 및 웹후크가 해당 시스템에서 에이전트를 시작하고 팀과 기록을 공유할 수 있습니다.

```text
GitHub · Linear · Slack · Discord · Schedules · Webhooks
                           │
                           ▼
                          Hub
               ┌───────────┼───────────┐
               ▼           ▼           ▼
            laptop       devbox   build server
```

Hub는 팀에게 다음 네 가지 기능을 제공합니다.

- GitHub, Linear, Slack, Discord, 반복 일정 및 인바운드 웹후크에서 시작되는 이벤트 기반 에이전트입니다.
- 트리거는 브라우저에서 편집하거나 `.paseo/triggers/*.yml`에 저장하고 CLI에서 배포할 수 있습니다.
- 모든 트리거가 Slack 및 Discord를 읽거나 게시하거나 GitHub에서 작동할 수 있도록 하는 범위가 지정된 통합 도구입니다.
- 최근 실행의 경우 [활동](/docs/hub/activity), 실행을 시작하지 않은 전송의 경우 **통합 → 알려진 라우팅되지 않은 이벤트**입니다.

데몬은 기존 구독, 모델 및 기술을 사용하여 머신에서 에이전트를 계속 실행합니다. Hub는 언제 호출할지 결정합니다.

## 저장소에 포함되는 항목

Hub 대시보드에서 트리거를 관리하거나 각 트리거를 리포지토리에 하나의 YAML 파일로 저장할 수 있습니다.

```text
.paseo/
└── triggers/
    └── slack-help.yml
```

각 파일은 독립적입니다. 이벤트, 허용된 보낸 사람, 대상 데몬, 작업 디렉터리, 에이전트 구성, 프롬프트 및 도구나 응답 범위의 이름을 지정합니다. `paseo hub init`을 실행하여 시작 파일을 생성하거나 `paseo hub deploy`을 실행하여 트리거를 검증하고 설치합니다.

## 읽는 순서

1. [빠른 시작](/docs/hub/quickstart)
2. [작동 원리](/docs/hub/concepts)
3. [데몬](/docs/hub/daemons)
4. [트리거](/docs/hub/triggers)
5. [통합 도구](/docs/hub/tools)
6. [GitHub 접속](/docs/hub/github)
7. [구성](/docs/hub/configuration)
8. [보안](/docs/hub/security)

작업 디렉터리, GitHub 권한 또는 채팅 채널에 대한 트리거 액세스 권한을 부여하기 전에 [Hub 보안](/docs/hub/security)을 읽어보세요.

## 호스팅 또는 자체 호스팅

[호스팅 Hub](/docs/hub/hosted)는 귀하를 위해 서버 및 공급자 앱을 관리합니다. [hub.paseo.sh](https://hub.paseo.sh)에서 카드나 만료 기한이 없는 무료 계정을 만드세요.

자체 머신이나 서버에서 Hub를 실행하려면 `npx @getpaseo/hub` 및 내장형 데이터베이스로 시작한 다음 필요할 때 PostgreSQL 또는 공용 HTTPS 배포를 추가하세요. [셀프 호스팅](/docs/hub/self-hosting)을 참조하세요.
