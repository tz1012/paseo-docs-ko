---
title: Hub
description: The layer above your daemons. Register them, give them capabilities, and share them with your team.
nav: Overview
order: 60
category: Hub
---

# 허브

데몬은 사용자를 위해 한 시스템에서 에이전트를 실행합니다. Paseo Hub는 데몬 위의 레이어입니다. 여기에 데몬을 등록하면 자체적으로는 갖고 있지 않은 기능을 제공합니다.

```text
             Hub
    ┌─────────┼─────────┐
    ▼         ▼         ▼
 laptop    devbox    build server
```

오늘 당신에게 주는 것:

- GitHub, Slack 및 Discord의 활동을 통해 자체적으로 시작되는 에이전트입니다.
- 저장소에 상주하며 푸시할 때 배포되는 구성입니다.
- 도착한 모든 것, 일치한 것, 실행된 것에 대한 기록입니다.
- 팀이 모든 것을 한 곳에서 볼 수 있습니다.

데몬은 항상 그랬던 것처럼 에이전트를 계속 실행합니다. 허브는 언제 요청할지 결정합니다.

## 당신이 쓰는 것

하나의 프로젝트 리소스 파일 이름 환경 및 전체 에이전트 구성. 검색된 각 워크플로 파일은 순서가 지정된 단계 옆에 하나의 트리거를 유지합니다.

```text
.paseo/
├── hub.yml
└── workflows/
    ├── slack-help.yml
    └── partials/
        └── answer.md
```

번들을 푸시하고 봇을 언급하면 에이전트가 컴퓨터에서 시작됩니다. [빠른 시작](/docs/hub/quickstart)은 첫 번째 번들을 빌드합니다. [워크플로](/docs/hub/workflows)에서는 라우팅 및 제공업체별 응답을 다룹니다.

## 읽는 순서

1. [작동 방식](/docs/hub/concepts)
2. [데몬](/docs/hub/daemons)
3. [트리거](/docs/hub/triggers)
4. [워크플로](/docs/hub/workflows)
5. [GitHub 접속](/docs/hub/github)
6. [설정](/docs/hub/configuration)
7. [보안](/docs/hub/security)

[빠른 시작](/docs/hub/quickstart)은 수행으로 시작하려는 경우 끝까지 진행됩니다.

워크플로가 GitHub, Slack, Discord 또는 API의 요청을 수락하는 경우 에이전트에게 작업 디렉터리 또는 출력 기능에 대한 액세스 권한을 부여하기 전에 [허브 보안](/docs/hub/security)을 읽어보세요.

## 실행되는 곳

이 페이지와 이 페이지에 링크된 페이지의 모든 내용은 [호스팅된 허브](/docs/hub/hosted)와 [자체 호스팅](/docs/hub/self-hosting)에서 직접 실행하는 허브에서 동일한 방식으로 작동합니다.