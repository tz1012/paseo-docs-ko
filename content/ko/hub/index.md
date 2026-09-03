---
title: Hub
description: The layer above your daemons. Register them, give them capabilities, and share them with your team.
nav: Overview
order: 60
category: Hub
---

# Hub

데몬은 한 머신에서 사용자를 위해 에이전트를 실행합니다. Paseo Hub는 데몬 위의 계층입니다. 데몬을 Hub에 등록하면 데몬만으로는 제공할 수 없는 기능을 사용할 수 있습니다.

```text
             Hub
    ┌─────────┼─────────┐
    ▼         ▼         ▼
 laptop    devbox    build server
```

현재 제공되는 기능은 다음과 같습니다.

- GitHub, Slack, Discord의 활동을 계기로 자동 시작되는 에이전트
- 저장소에 보관되고 푸시할 때 배포되는 구성
- 도착한 모든 요청과 일치 결과, 실행 내역을 담은 기록
- 팀이 모든 정보를 한곳에서 볼 수 있는 공간

데몬은 늘 실행되던 곳에서 계속 에이전트를 실행합니다. Hub는 언제 데몬에 작업을 요청할지 결정합니다.

## 저장소에 포함되는 항목

안내형 설정은 환경과 에이전트를 정의하는 프로젝트 리소스 파일과 안전한 시작용 워크플로 하나를 만듭니다.

```text
.paseo/
├── hub.yml
└── workflows/
    └── slack-help.yml
```

안내형 설정이 번들을 배포하고, 봇을 멘션하면 사용자의 머신에서 에이전트가 시작됩니다. [빠른 시작](/docs/hub/quickstart)은 전체 과정을 안내하고, [생성된 시작용 번들](/docs/hub/configuration#generated-starter-bundle)은 작성된 내용을 보여주며, [워크플로](/docs/hub/workflows)는 라우팅, 프롬프트 부분, 공급자별 응답을 설명합니다.

## 읽는 순서

1. [빠른 시작](/docs/hub/quickstart)
2. [작동 방식](/docs/hub/concepts)
3. [데몬](/docs/hub/daemons)
4. [트리거](/docs/hub/triggers)
5. [워크플로](/docs/hub/workflows)
6. [GitHub 액세스](/docs/hub/github)
7. [구성](/docs/hub/configuration)
8. [보안](/docs/hub/security)

워크플로가 GitHub, Slack, Discord 또는 API의 요청을 받는다면 에이전트에 작업 디렉터리나 출력 기능에 대한 액세스 권한을 부여하기 전에 [Hub 보안](/docs/hub/security)을 읽으세요.

## Hub 직접 실행하기

먼저 임베디드 데이터베이스를 사용해 로컬 머신에서 시작하고, 필요할 때만 PostgreSQL이나 공개 배포를 추가하세요. [자체 호스팅](/docs/hub/self-hosting)에서 각 단계를 설명합니다.

[호스팅 Hub](/docs/hub/hosted)도 같은 프로젝트, 워크플로, 데몬, 활동 모델을 사용합니다. [로그인하여 무료 체험을 시작하세요](https://hub.paseo.sh).
