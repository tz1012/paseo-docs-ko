---
title: Hub quickstart
description: Run Hub locally and answer a Slack mention with an agent on your machine.
nav: Quickstart
order: 61
category: Hub
---

# Hub 빠른 시작

Hub를 사용자의 머신에서 실행하고 공개 서버 없이 Slack에 연결한 뒤, 저장소의 에이전트로 멘션에 응답합니다. Hub의 브라우저 설정이 터미널로 이어지고, 안내형 설정이 워크플로를 작성해 배포합니다.

[Paseo가 설치되어 실행 중](/docs)이어야 하며, Node.js와 앱을 만들 수 있는 Slack 워크스페이스가 필요합니다.

## 1. Hub 시작

```sh
npx @getpaseo/hub
```

출력된 주소(일반적으로 <http://localhost:3000>)를 열고 Hub가 요청하는 운영자 계정을 만드세요.

처음 실행할 때 데이터베이스, Docker, 환경 변수, API 키가 필요하지 않습니다. Hub가 임베디드 데이터베이스와 조직, **Default** 프로젝트를 만듭니다. 프로젝트를 직접 만들 필요가 없습니다.

## 2. Slack 연결

**Set up your apps**에서 Slack 앱을 만드는 방법을 설명하고 Slack에 붙여 넣을 매니페스트를 제공합니다. **Socket Mode**를 선택한 상태로 두세요. Hub에서 외부로 연결하므로 공개 주소나 HTTPS가 필요하지 않습니다.

App-level token과 Bot token을 Hub에 붙여 넣은 뒤 **Connect Slack**을 선택하세요. 봇을 사용할 채널에 초대합니다.

```text
/invite @Paseo
```

GitHub와 Discord는 나중에 설정해도 됩니다. 설정은 **Apps**에서 계속 사용할 수 있습니다.

## 3. 코드가 있는 머신 연결

**Connect a daemon**에 이 Hub의 주소가 이미 포함된 명령 하나가 표시됩니다.

```sh
paseo hub login http://localhost:3000
```

코드가 있는 머신에서 에이전트가 작업할 저장소를 현재 디렉터리로 두고 실행하세요. 안내형 설정이 이 디렉터리를 워크플로의 작업 디렉터리로 기록합니다.

열린 브라우저 탭에서 로그인을 승인하세요. Hub 탭은 열어 두세요. 데몬을 감시하다가 자동으로 **Daemon connected**를 표시합니다. **Continue**와 **Do this later** 모두 Default 프로젝트로 이동합니다.

## 4. 설정 질문에 답하기

터미널에서 로그인을 확인한 뒤 브라우저가 멈춘 지점부터 이어집니다. 대부분의 질문에는 기본값이나 제안 답변이 있고, 직접 입력해야 하는 것은 Slack 멤버 ID뿐입니다.

| 질문                                      | 필요한 답변                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| Connect this daemon to this Hub?          | 예. 현재 머신을 등록합니다.                                                                 |
| Initialize and deploy a starter workflow? | 예.                                                                                         |
| Starter agent provider, model, and mode   | 데몬이 실행할 수 있다고 보고한 항목입니다. 제안되는 모델과 모드는 데몬의 기본값입니다.       |
| Your Slack member ID                      | `U01234567`, 봇을 트리거하도록 허용할 유일한 계정입니다.                                     |

설정은 이 워크플로에 사용할 준비가 된 앱 연결을 나열합니다. 2단계에서 Slack 워크스페이스 하나를 연결했으므로 Slack 선택을 묻지 않고 해당 연결을 자동으로 선택합니다. 사용할 수 있는 연결이 여러 개면 **Trigger connection**을 묻습니다. 준비된 연결이 없으면 **Hub → Apps**로 안내하고 에이전트를 묻거나 파일을 쓰기 전에 중지합니다.

에이전트 공급자 목록에는 데몬에서 사용할 수 있는 런타임만 포함되며 임의로 하나를 제안하지 않습니다. 제안되는 모델과 모드는 데몬이 보고한 기본값입니다. 모드는 있지만 기본 모드가 없는 공급자도 제시되며, 추측하는 대신 모드를 선택하도록 묻습니다.

[Slack ID 찾기](/docs/hub/triggers/slack#find-your-slack-ids)에서 멤버 ID를 복사하는 두 번의 클릭을 확인할 수 있습니다. Slack 워크스페이스는 2단계에서 연결한 앱에서 가져오므로 별도로 묻지 않습니다.

그런 다음 설정이 번들을 검증하고 작성해 배포합니다.

```text
.paseo/
├── hub.yml
└── workflows/
    └── slack-help.yml
```

`.paseo/`가 이미 있으면 교체하기 전에 묻습니다. 데몬 연결을 거부하면 `paseo hub connect <hub>; then paseo hub init`을 출력합니다. 연결만으로는 워크플로가 생기지 않으므로 두 명령이 모두 필요합니다. 시작용 워크플로만 거부하면 `paseo hub init`을 출력합니다.

## 5. 봇 멘션하기

봇을 초대한 채널에서 다음과 같이 입력합니다.

```text
@Paseo have a look
```

Hub는 사용자의 데몬에서 에이전트를 시작하고 Slack 스레드에 응답을 게시합니다. 터미널에는 실행이 표시되는 프로젝트 Activity URL이 출력됩니다. 아무것도 실행되지 않으면 [Activity](/docs/hub/activity)에서 필터링된 멘션과 워크플로에 일치하지 않은 멘션을 구분하는 방법을 확인하세요.

## 다음

- [Hub 작동 방식](/docs/hub/concepts) — 이벤트가 데몬의 워크플로 실행이 되는 과정입니다.
- [생성된 시작용 번들](/docs/hub/configuration#generated-starter-bundle) — 설정이 작성한 두 파일을 필드별로 설명합니다.
- [워크플로](/docs/hub/workflows) — 라우팅, 프롬프트, 공급자 응답을 설명합니다.
- [Hub 보안](/docs/hub/security) — `from_users` 범위를 넓히거나 에이전트에 GitHub 권한을 주기 전에 읽으세요.

Hub는 로컬 상태를 사용자 데이터 디렉터리(일반적으로 `~/.local/share/paseo-hub`)에 보관합니다. 로컬 실행이 부족해졌을 때 필요한 배포와 고급 구성은 [자체 호스팅](/docs/hub/self-hosting)을 참조하세요.
