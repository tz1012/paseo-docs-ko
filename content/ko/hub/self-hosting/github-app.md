---
title: GitHub for Hub
description: Create the GitHub App your self-hosted Hub uses for repository access and event triggers.
nav: GitHub App
order: 78
category: Hub
---

# Hub용 GitHub

자체 호스팅 Hub는 사용자가 만들고 소유한 GitHub 앱을 통해 GitHub와 통신합니다. 하나의 앱은 Hub 인스턴스를 제공하며, 이를 설치하는 각 계정이나 조직은 **통합** 아래에서 연결이 됩니다.

**앱 → GitHub**를 엽니다. Hub에는 정확한 콜백 URL, 필요한 저장소 권한, 구독한 이벤트 및 GitHub에서 다시 복사할 필드가 표시됩니다. Hub는 앱을 저장하기 전에 앱을 확인합니다.

## 공개 URL 요구 사항

리포지토리 액세스 및 앱 설치는 웹훅 없이 작동합니다. GitHub 이벤트 트리거에는 GitHub가 웹후크를 전달할 수 있도록 [공개 HTTPS 주소](/docs/hub/self-hosting#public-addresses)가 필요합니다.

로컬 HTTP Hub에서 **앱 → GitHub**를 사용하면 저장소 액세스를 구성하고 이벤트 웹후크를 사용할 수 없도록 표시할 수 있습니다. 웹훅 비밀 및 이벤트를 추가하려면 `PASEO_HUB_APP_URL`을 설정한 후 공개 HTTPS 원본에서 Hub를 다시 엽니다.

GitHub는 다음 Hub URL을 호출합니다.

| 설정         | Hub URL                                                |
| ------------ | ------------------------------------------------------ |
| 홈페이지 URL | `<PASEO_HUB_APP_URL>`                                  |
| 콜백 URL     | `<PASEO_HUB_APP_URL>/api/integrations/github/callback` |
| 설정 URL     | `<PASEO_HUB_APP_URL>/api/integrations/github/setup`    |
| 웹훅 URL     | `<PASEO_HUB_APP_URL>/webhook`                          |

GitHub SSL 확인을 활성화된 상태로 유지하세요.

## GitHub 이벤트 구독

**이벤트 구독**에서 **이슈 댓글**, **이슈**, **풀 요청**, **풀 요청 검토**, **풀 요청 검토 댓글** 및 **푸시**를 선택합니다. `github.pull_request_created`, `github.pull_request_ready_for_review`, `github.pull_request_synchronized` 및 `github.pull_request_label_added`에는 **풀 요청**이 필요합니다.

## 저장소 연결

Hub가 앱을 확인한 후 **Connect GitHub**를 선택하고 앱이 액세스할 수 있는 계정이나 조직 및 리포지토리를 선택합니다. 왕복이 설치를 활성 Hub 조직에 바인딩하도록 GitHub가 아닌 Hub에서 설치를 시작합니다.

연결은 `acme-github`과 같은 계정 이름에서 파생된 슬러그와 함께 **통합** 아래에 나타납니다. 여러 GitHub 설치를 하나의 Hub 조직에 연결할 수 있습니다.

연결된 GitHub 설치는 다음 두 가지를 제공합니다.

- 이슈, 풀 요청, 댓글, 리뷰 및 푸시에 대한 이벤트 트리거. [GitHub 트리거](/docs/hub/triggers/github)를 참조하세요.
- [`run.github` 블록](/docs/hub/github)을 선언하는 트리거에 대한 범위가 지정된 설치 토큰입니다.

데몬의 인증된 `gh` CLI는 Hub의 GitHub 통합을 구성하지 않습니다.

## 환경에서 구성

Hub 외부에서 앱 비밀을 유지하는 배포에서는 다음 환경 변수를 설정할 수 있습니다.

```dotenv
GITHUB_APP_ID=
GITHUB_APP_SLUG=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
```

`GITHUB_APP_PRIVATE_KEY`은 다운로드된 PEM 콘텐츠를 보유합니다. 배포에서 PEM 파일을 마운트하는 경우 대신 `GITHUB_APP_PRIVATE_KEY_PATH`을 사용하세요.

환경 구성은 저장된 GitHub 앱보다 우선하며 **앱** 아래에 **환경에서 관리됨**으로 표시됩니다. `GITHUB_WEBHOOK_SECRET`을 포함하기 때문에 공개 HTTPS 원본이 필요합니다.
