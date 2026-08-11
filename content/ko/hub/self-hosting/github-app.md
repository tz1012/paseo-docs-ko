---
title: GitHub for Hub
description: Create the GitHub App your Hub uses, install it, and connect it to an organization.
nav: GitHub App
order: 75
category: Hub
---

# 허브용 GitHub

Hub는 귀하가 소유한 GitHub 앱을 통해 GitHub와 통신합니다. 하나의 앱이 전체 허브에 서비스를 제공합니다. 이를 설치하는 각 계정이나 조직은 연결이 됩니다.

## 앱 만들기

해당 앱을 소유해야 하는 계정에서 **설정 → 개발자 설정 → GitHub 앱 → 새 GitHub 앱**으로 이동하세요.

`hub.example.com`을 `PASEO_HUB_APP_URL`으로 바꾸세요.

웹훅 URL은 GitHub에서 연결할 수 있어야 합니다. GitHub의 기본 SSL 확인을 활성화된 상태로 유지하세요. [공급자 URL](/docs/hub/self-hosting#provider-urls)을 참조하세요.

| 설정 | 가치 |
| ------------------ | -------------------------------- |
| 홈페이지 URL | `https://hub.example.com` |
| 콜백 URL | `https://hub.example.com/api/integrations/github/callback` |
| 설정 URL | `https://hub.example.com/api/integrations/github/setup` |
| 업데이트 시 리디렉션 | 에 |
| 웹훅 URL | `https://hub.example.com/webhook` |
| 웹훅 비밀 | 귀하가 생성하는 가치 |

저장소 권한:

| 허가 | 액세스 | 왜 |
| ------------- | ------------ | ---------------------------- |
| 내용 | 읽기 및 쓰기 | `.paseo` 번들을 읽고 에이전트가 푸시하도록 허용 |
| 이슈 | 읽기 및 쓰기 | 댓글 읽기, 반응 추가 |
| 풀 요청 | 읽기 및 쓰기 | 리뷰 댓글을 읽고 에이전트가 PR을 열 수 있도록 허용 |
| 메타데이터 | 읽기 | GitHub에서 필요 |

이벤트를 구독하세요:

- 이슈 코멘트
- 이슈
- 풀 리퀘스트 검토
- Pull request 리뷰 코멘트
- 푸시

푸시는 구성 동기화를 작동시키는 것입니다. 이것이 없으면 Hub는 `.paseo` 번들이 변경되었음을 결코 알 수 없습니다.

## 허브 구성

앱 설정 페이지에서 다음을 수집합니다.

| 가치 | 환경 변수 |
| ------------ | ------------- |
| 앱 ID | `GITHUB_APP_ID` |
| 앱 URL의 슬러그 | `GITHUB_APP_SLUG` |
| 클라이언트 ID | `GITHUB_APP_CLIENT_ID` |
| 생성된 클라이언트 비밀번호 | `GITHUB_APP_CLIENT_SECRET` |
| 생성된 개인 키 | `GITHUB_APP_PRIVATE_KEY` |
| 웹훅 비밀 | `GITHUB_WEBHOOK_SECRET` |

개인 키는 PEM 파일로 다운로드됩니다. `GITHUB_APP_PRIVATE_KEY`에 해당 콘텐츠를 전달하거나 `GITHUB_APP_PRIVATE_KEY_PATH`에 해당 경로를 전달합니다.

허브를 다시 시작하세요. 이제 GitHub는 Connections에서 **Ready**로 표시됩니다.

## 연결

**연결 → GitHub → 연결**을 엽니다. Hub는 앱을 설치하기 위해 GitHub로 보낸 다음 설치를 조직에 바인딩합니다.

GitHub의 자체 설치 버튼이 아닌 Hub에서 시작하세요. GitHub는 설치가 생성되거나 변경될 때만 설정 URL을 호출하므로 직접 설치하면 아무것도 바인딩되지 않은 설정 페이지로 이동하게 됩니다.

계정에서 파생된 슬러그와 함께 연결이 나타납니다. `getpaseo`에 설치하면 `getpaseo-github`이 됩니다. 해당 슬러그는 구성이 이 연결의 이름을 지정하는 방법입니다.

필요한 만큼 많은 설치를 연결하세요. 개인 계정과 여러 조직이 하나의 허브 조직에 공존할 수 있습니다.

## 연결이 제공하는 것

- **이벤트.** 설치 시 볼 수 있는 모든 저장소의 의견, 문제 및 리뷰입니다. [GitHub 트리거](/docs/hub/triggers/github)를 참조하세요.
- **구성 동기화.** 설치의 모든 저장소는 정식 `.paseo` 번들을 보유할 수 있습니다. [구성](/docs/hub/configuration)을 참조하세요.
- **토큰.** 범위가 지정된 실행별 GitHub 자격 증명입니다.

설치에 포함되는 리포지토리는 GitHub 설정입니다. Paseo가 아닌 GitHub에서 변경하세요.