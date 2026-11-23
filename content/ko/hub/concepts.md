---
title: How Hub works
description: How events, schedules, and webhooks match a trigger and start an agent on your Paseo daemon.
nav: How it works
order: 62
category: Hub
---

# 허브 작동 방식

Hub는 외부 이벤트, 일정 및 웹후크를 Paseo 데몬에서 실행되는 코딩 에이전트에 연결합니다.

```text
GitHub / Linear / Slack / Discord / Schedule / Webhook
                          │
                          ▼
                         Hub
         verifies input and matches triggers
                          │
                          ▼
                     Paseo daemon
             starts or continues an agent
```

## 핵심 개념

- **앱**은 **앱**(GitHub 앱, Linear OAuth 앱, Slack 앱 또는 Discord 앱) 아래의 자체 호스팅 Hub용으로 구성된 공급자 애플리케이션입니다. Hosted Hub는 자체 앱을 운영합니다.
- **통합**은 **통합** 아래의 Hub 조직에 연결된 작업 영역, 계정 또는 서버입니다. 연결된 각 계정에는 참조를 트리거하는 `acme-github` 또는 `acme-slack`과 같은 고유한 연결 슬러그가 있습니다.
- **데몬**은 Paseo 데몬을 실행하고 **데몬** 아래 Hub 조직에 등록된 머신입니다. 데몬은 해당 머신에서 `hub.execute`을 부여한 후에만 에이전트 시작을 허용합니다.
- **트리거**는 이벤트, 일정 또는 웹후크를 대상 데몬, 작업 디렉터리, 에이전트 구성, 프롬프트 및 선택적 도구나 출력에 매핑하는 하나의 독립적인 규칙입니다.
- [**활동**](/docs/hub/activity)은 최근 트리거 실행 및 해당 상태를 보여줍니다.

## 이벤트부터 에이전트까지

1. 이벤트는 HTTPS 웹훅(GitHub, Linear, Slack 웹훅 또는 인바운드 웹훅), 아웃바운드 연결(Slack 소켓 모드 또는 Discord 게이트웨이) 또는 Hub의 일정 시계를 통해 도착합니다.
2. Hub는 보낸 사람이나 서명을 확인하고 일치하는 활성화된 트리거를 찾습니다.
3. 외부 공급자 이벤트의 경우 Hub는 트리거의 연결, 리소스 필터 및 보낸 사람 허용 목록(`from_users`)을 평가합니다.
4. 일치하는 각 트리거에 대해 Hub는 실행을 생성하고 Paseo 앱 및 CLI에서 사용하는 동일한 RPC 프로토콜을 통해 대상 데몬에 시작 의도를 보냅니다.
5. 기본적으로 동일한 Slack 스레드, Discord 스레드, GitHub 문제 또는 끌어오기 요청 또는 Linear 문제의 이벤트는 새 에이전트 세션을 시작하는 대신 기존 에이전트 세션을 계속합니다.
6. 에이전트는 Hub MCP 서버가 연결된 시스템에서 실행됩니다. 대화에 응답하기 위해 `reply`을 호출하고, 부여된 통합 도구를 호출하고, 완료되면 `finish_execution`을 호출합니다.

## 작성 및 검증

다음 두 가지 방법으로 트리거를 만들고 편집할 수 있습니다.

- Hub 대시보드의 **트리거** 아래에서 시각적 양식 또는 YAML 편집기를 사용합니다.
- 저장소의 `.paseo/triggers/*.yml` 파일로 `paseo hub deploy`을 사용하여 배포됩니다.

두 경로 모두 동일한 YAML 스키마를 사용합니다. 저장하거나 배포할 때 Hub는 YAML의 유효성을 검사하고 이벤트 라우팅 및 대상 데몬에 대한 연결을 찾습니다.

대상 및 에이전트 설정이 동일하게 유지되면 데몬이 오프라인인 동안 대시보드 편집 내용을 저장할 수 있습니다. CLI 배포 및 직접 API 설치에는 항상 연결된 대상 데몬이 필요합니다. [트리거 검증](/docs/hub/triggers#saving-checks-the-agent-against-the-daemon)을 참조하세요.

Hub는 실행을 시작할 때 `run.github.connection`을 확인합니다. 연결을 사용할 수 없거나 GitHub가 토큰 요청을 거부하면 시작이 실패합니다. [에이전트를 위한 GitHub 액세스](/docs/hub/github)를 참조하세요.

## Paseo 링크에서 열기

Hub에 공용 HTTPS 원본이 있고 실행에 기록된 데몬 에이전트가 있는 경우 Hub는 GitHub, Linear, Slack 및 Discord의 대화 응답에 **Open in Paseo** 링크를 추가합니다.

링크를 클릭하면 Paseo에서 정확한 에이전트를 열거나 Hub에서 실행을 보거나 Paseo를 설치하기 전에 방문자가 해당 Hub 조직에 로그인한 구성원인지 확인합니다. 로그아웃한 방문자와 조직 외부 사용자는 실행 세부 정보를 받지 못합니다.

범위가 지정된 게시 도구(`run.tools.slack` 또는 `run.tools.discord`)를 사용하는 에이전트도 요청 컨텍스트에서 동일한 URL을 수신하므로 다이제스트 및 보고서가 실행에 다시 링크될 수 있습니다.

## 보안 경계

Hub는 인바운드 요청을 확인하고, 발신자 허용 목록을 시행하고, 범위가 지정된 GitHub 토큰을 발행하고, 서버에서 모든 Hub MCP 도구 호출을 승인합니다. 귀하의 컴퓨터에서 코딩 에이전트 프로세스를 샌드박싱하지 않습니다.

Hub 조직과 `.paseo/triggers/*.yml`을 배포하는 모든 저장소에 대한 액세스를 보호하세요. 허용 목록을 확대하거나 저장소 쓰기 권한을 부여하기 전에 [Hub 보안](/docs/hub/security)을 읽어보세요.
