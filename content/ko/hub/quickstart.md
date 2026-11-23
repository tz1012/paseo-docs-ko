---
title: Hub quickstart
description: Run Hub locally and answer a Slack mention with an agent on your machine.
nav: Quickstart
order: 61
category: Hub
---

# Hub 빠른 시작

컴퓨터에서 Hub를 실행하고, 공용 서버 없이 소켓 모드를 통해 Slack을 연결하고, 저장소에 있는 에이전트를 통해 멘션에 응답하세요.

[Paseo가 설치되어 실행 중](/docs)이어야 하며, Node.js와 앱을 만들 수 있는 Slack 워크스페이스가 필요합니다.

## 1. Hub 시작

Hub를 로컬에서 실행합니다.

```sh
npx @getpaseo/hub
```

인쇄된 주소(보통 <http://localhost:3000>,)를 열고 운영자 계정을 생성하세요. 첫 번째 실행에는 외부 데이터베이스, Docker 또는 환경 변수가 필요하지 않습니다. Hub는 내장형 데이터베이스와 조직을 자동으로 생성합니다.

Hub는 통합 연결, 데몬 연결, 트리거 생성 및 실행의 4단계 설정 안내를 통해 **홈**을 엽니다.

## 2. Slack 연결

**앱 → Slack**을 열고 **소켓 모드**를 선택한 상태로 유지하세요. 소켓 모드는 Hub에서 연결되며 공개 HTTPS 주소가 필요하지 않습니다.

Hub의 단계에 따라 생성된 매니페스트에서 Slack 앱을 만들고, `connections:write`을 사용하여 앱 수준 토큰을 만들고, 앱을 설치합니다. 앱 수준 토큰과 봇 토큰을 Hub에 붙여넣은 다음 **Slack 연결**을 선택합니다.

언급할 Slack 채널에 봇을 초대하세요.

```text
/invite @Paseo
```

나중에 **앱**에서 GitHub, Linear 및 Discord를 설정할 수 있습니다.

## 3. 기기를 연결하세요

에이전트가 작동할 저장소를 연 다음 로컬 Hub에 로그인합니다.

```sh
paseo hub login http://localhost:3000
```

브라우저에서 로그인을 승인하세요. 터미널에서 이 데몬을 Paseo Hub에 연결하려면 **예**로 대답하고, Hub 자동화가 에이전트를 실행할 수 있도록 하려면 **예**로 대답하세요.

실행 권한의 기본값은 no입니다. 아니요라고 대답했다면 나중에 머신에서 승인하세요.

```sh
paseo hub permissions grant hub.execute
```

## 4. 시작용 트리거 만들기

절대 경로가 `/`으로 시작하는 저장소 디렉터리를 사용합니다. `paseo hub init`이 트리거의 유효성을 검사할 때 Hub는 `C:\work\project`과 같은 Windows 드라이브 경로를 거부합니다. [대상 및 작업 트리](/docs/hub/configuration/reference#target-and-worktree)를 참조하세요.

해당 저장소 디렉터리에서 시작 트리거를 생성하고 배포합니다.

```sh
paseo hub init
```

로컬 Hub 엔드포인트(`http://localhost:3000`)를 선택하고 메시지가 표시되면 Slack 연결을 선택합니다. 설치 프로그램에서는 세 가지 질문을 합니다.

| 프롬프트 | 제공할 가치 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 스타터 에이전트 제공자, 모델 및 모드 | 선택 가능한 모델과 하나 이상의 실행 모드(예: Claude, Codex 또는 OpenCode)가 있는 데몬에서 활성화된 공급자. |
| Slack 회원 ID | `U01234567`과 같은 Slack ID입니다. 나열된 사용자만 봇을 실행할 수 있습니다.                                                       |
| 지금 배포하시겠습니까?                             | 예, Hub에서 트리거를 검증하고 설치합니다.                                                                                 |

제로 실행 모드(예: Pi)를 광고하는 공급자는 `paseo hub init`으로 건너뛰지만 Hub 대시보드나 `.paseo/triggers/*.yml`에서 구성하고 `paseo hub deploy`을 사용하여 배포할 수 있습니다.

회원 ID를 복사하려면 [Slack ID 찾기](/docs/hub/triggers/slack#find-your-slack-ids)를 참조하세요.

설치 프로그램은 연결된 데몬에 대해 에이전트 구성의 유효성을 검사하고 `.paseo/triggers/slack-help.yml`을 쓴 후 배포합니다. 설정 중에 배포를 건너뛰는 경우 준비가 되면 저장소 루트에서 `paseo hub deploy`을 실행하세요.

Hub 대시보드의 **트리거**에서 직접 트리거를 생성하고 편집할 수도 있습니다.

## 5. 봇 멘션하기

봇을 초대한 Slack 채널에서 다음 멘션을 보내세요.

```text
@Paseo summarize this repository
```

Hub는 데몬에서 에이전트를 시작하고 Slack 스레드에 응답을 게시합니다. Hub에서 **활동**을 열어 실행 상태를 확인하세요. Hub가 HTTPS 뒤에서 실행되는 경우 응답에는 **Paseo**에서 열기 링크도 포함되어 조직 구성원이 라이브 세션으로 바로 이동할 수 있습니다.

아무 것도 실행되지 않으면 [활동](/docs/hub/activity)을 확인하여 라우팅되지 않은 이벤트에서 필터링된 멘션을 알려주세요.

## 다음

- [Hub 작동 방식](/docs/hub/concepts)에서는 통합, 데몬, 트리거 및 지속을 설명합니다.
- [트리거](/docs/hub/triggers)에는 GitHub, Linear, 일정, 웹훅을 포함한 모든 이벤트 소스가 나열됩니다.
- [생성된 스타터 트리거](/docs/hub/configuration#generated-starter-trigger)는 `.paseo/triggers/slack-help.yml`을 통과합니다.
- [Hub 보안](/docs/hub/security)에서는 사용자나 권한을 추가하기 전에 호스트 경계와 안전한 허용 목록을 설명합니다.

Hub는 기본적으로 `~/.local/share/paseo-hub` 아래에 로컬 데이터를 저장합니다. PostgreSQL 또는 공개 HTTPS 배포가 준비되면 [자체 호스팅](/docs/hub/self-hosting)을 참조하세요.
