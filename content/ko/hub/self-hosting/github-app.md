---
title: GitHub for Hub
description: Create the GitHub App your Hub uses for repository access and event triggers.
nav: GitHub App
order: 75
category: Hub
---

# Hub용 GitHub

Hub는 사용자가 만들고 소유하는 GitHub App을 통해 GitHub와 통신합니다. 하나의 App이 Hub 전체를 지원하며, App을 설치한 각 계정이나 조직이 하나의 연결이 됩니다.

**Apps → GitHub**를 여세요. Hub는 현재 콜백 URL, 필요한 저장소 권한, 구독 이벤트, GitHub에서 복사해 올 필드를 제공합니다. 저장하기 전에 App을 검증합니다.

## 공개 URL 요구 사항

저장소 액세스와 설치는 GitHub 웹훅 없이도 작동합니다. 하지만 GitHub 이벤트 트리거와 구성 동기화는 웹훅 없이는 작동하지 않습니다. GitHub가 공개 HTTPS URL로 이벤트를 전송할 수 있어야 합니다.

로컬 HTTP Hub에서는 Apps 안내에 따라 저장소 액세스를 구성할 수 있으며, 이벤트 설정을 사용할 수 없다는 안내가 표시됩니다. 웹훅 비밀과 이벤트를 추가하려면 `PASEO_HUB_APP_URL`을 설정한 뒤 Hub를 공개 주소에서 다시 여세요.

GitHub는 다음 Hub URL을 사용합니다.

| 설정         | Hub URL                                                |
| ------------ | ------------------------------------------------------ |
| 홈페이지 URL | `<PASEO_HUB_APP_URL>`                                  |
| 콜백 URL     | `<PASEO_HUB_APP_URL>/api/integrations/github/callback` |
| 설정 URL     | `<PASEO_HUB_APP_URL>/api/integrations/github/setup`    |
| 웹훅 URL     | `<PASEO_HUB_APP_URL>/webhook`                          |

GitHub의 SSL 검증을 활성화된 상태로 유지하세요.

## 저장소 연결

Hub가 App을 검증한 뒤 **Install on GitHub**를 선택하세요. App이 액세스할 수 있는 계정 또는 조직과 저장소를 선택합니다.

GitHub 자체 설치 버튼이 아니라 Hub에서 시작하세요. 왕복 설치 과정에서 설치 항목이 활성 Hub 조직에 연결됩니다.

연결은 계정에서 파생된 슬러그와 함께 표시됩니다. 예를 들어 `getpaseo`에 설치하면 `getpaseo-github`이 됩니다. Hub 조직에 필요한 만큼 설치를 연결할 수 있습니다.

## 연결이 제공하는 기능

- **이벤트:** 설치에서 볼 수 있는 저장소의 이슈, 댓글, 리뷰, 푸시입니다. [GitHub 트리거](/docs/hub/triggers/github)를 참조하세요.
- **구성 동기화:** 저장소에 정식 `.paseo` 번들을 보관할 수 있습니다. [구성](/docs/hub/configuration)을 참조하세요.
- **실행 자격 증명:** Hub는 GitHub 권한을 명시적으로 요청하는 워크플로 단계에 범위가 지정된 GitHub App 토큰을 발급합니다.

데몬에서 인증된 `gh` CLI는 Hub의 GitHub 통합을 구성하지 않습니다. 다만 데몬과 제공업체 자체의 환경 및 권한 정책에 따라, Hub에서 범위를 지정한 GitHub 권한 밖에서 에이전트에 서비스를 제공할 수는 있습니다.

## 환경에서 구성

앱 비밀을 Hub 외부에 보관하는 배포에서는 다음을 설정할 수 있습니다.

```dotenv
GITHUB_APP_ID=
GITHUB_APP_SLUG=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
```

개인 키는 GitHub에서 다운로드한 PEM 파일의 내용입니다. 배포에서 해당 파일을 마운트하는 경우에는 `GITHUB_APP_PRIVATE_KEY_PATH`를 사용하세요.

환경 구성은 저장된 GitHub App보다 우선하며 **Apps**에 **Managed by environment**로 표시됩니다. 완전한 환경 구성에는 웹훅 비밀이 포함되므로 공개 웹훅 원본이 필요합니다.
