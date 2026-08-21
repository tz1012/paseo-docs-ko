---
title: Hub quickstart
description: Run Hub locally and answer a Slack mention with an agent on your machine.
nav: Quickstart
order: 61
category: Hub
---

# Hub 빠른 시작

Hub를 로컬에서 실행하고 공개 서버 없이 Slack에 연결한 다음, 사용자의 머신에서 실행되는 에이전트로 멘션에 응답합니다.

[Paseo가 설치되어 실행 중](/docs)이어야 하며, Node.js와 앱을 만들 수 있는 Slack 워크스페이스가 필요합니다.

## 1. Hub 시작

```sh
npx @getpaseo/hub
```

<http://localhost:3000>을 여세요. Hub는 기본적으로 임베디드 데이터베이스를 사용하므로 처음 실행할 때 데이터베이스, 환경 변수 또는 Docker가 필요하지 않습니다.

Hub의 시작 화면이 나타나면 운영자 계정을 만드세요.

## 2. Slack 연결

다음 화면에서는 Slack 앱을 만드는 방법을 설명하고 Slack에 붙여 넣을 매니페스트를 제공합니다. **Socket Mode**를 선택한 상태로 두세요. Socket Mode는 Hub에서 외부로 연결하므로 공개 주소나 HTTPS가 필요하지 않습니다.

App-level token과 Bot token을 Hub에 붙여 넣은 뒤 **Connect Slack**을 선택하세요. 봇을 사용할 채널에 초대합니다.

```text
/invite @Paseo
```

지금은 GitHub와 Discord 설정을 건너뛸 수 있습니다. 설정은 나중에도 **Apps**에서 사용할 수 있습니다.

## 3. 프로젝트 초기화

에이전트가 작업할 저장소에서 다음을 실행합니다.

```sh
paseo hub init
```

**Custom endpoint…**를 선택하고 `http://localhost:3000`을 입력한 다음 Slack을 선택하세요. 안내형 설정 과정은 다음 작업을 수행합니다.

- 브라우저를 통해 로그인합니다.
- 로컬 Paseo 데몬을 연결합니다.
- 최초 설정에서 만든 기본 프로젝트를 사용합니다.
- 연결된 Slack 워크스페이스를 선택하고 Slack 사용자 이름을 묻습니다.
- `.paseo/hub.yml`과 `.paseo/workflows/slack-help.yml`을 작성합니다.
- 생성된 번들을 검증하고 배포 여부를 묻습니다.

기본값인 **Deploy now?**를 선택하세요. 생성된 워크플로는 입력한 사용자 이름의 멘션만 허용합니다.

## 4. 봇 멘션하기

채널에서 봇을 멘션합니다.

```text
@Paseo explain what this project does
```

Hub는 사용자의 데몬에서 에이전트를 시작하고 Slack 스레드에 응답을 게시합니다. 아무것도 실행되지 않으면 프로젝트의 **Activity** 탭을 여세요.

Hub는 로컬 상태를 사용자 데이터 디렉터리(일반적으로 `~/.local/share/paseo-hub`)에 보관합니다. [자체 호스팅](/docs/hub/self-hosting)은 PostgreSQL, 공개 URL, 환경에서 관리하는 앱, Docker, 클라우드 배포를 설명합니다. [구성](/docs/hub/configuration)은 생성된 파일과 수동 배포를 설명합니다.
