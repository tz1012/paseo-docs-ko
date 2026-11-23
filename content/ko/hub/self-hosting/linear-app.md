---
title: Linear for Hub
description: Create a Linear OAuth app and connect a Linear workspace to your self-hosted Hub.
nav: Linear app
order: 79
category: Hub
---

# Hub에 대한 Linear

Linear 웹훅에는 HTTPS가 필요합니다. Linear를 설정하기 전에 [공개 HTTPS 주소](/docs/hub/self-hosting#public-addresses)에서 자체 호스팅 Hub를 엽니다. Linear Workspace 관리자가 앱을 승인해야 합니다.

## Linear 앱 설정

1. Hub에서 **앱 → Linear**을 엽니다. **리디렉션 URL** 및 **웹훅 URL**을 복사합니다.
2. [Linear API 애플리케이션](https://linear.app/settings/api/applications)을 열고 OAuth 애플리케이션을 생성한 후 OAuth 설정에 **리디렉션 URL**을 추가합니다.
3. Hub에서 **웹훅 URL**을 사용하여 **문제** 및 **댓글** 이벤트에 대한 웹훅을 활성화하고 웹훅 서명 비밀을 복사합니다.
4. Hub로 돌아가서 **클라이언트 ID**, **클라이언트 비밀번호** 및 **웹훅 서명 비밀번호**를 붙여넣습니다.
5. **저장하고 Linear으로 계속**을 선택하고 Linear 작업 공간을 승인합니다.

Hub의 **통합** 아래에서 연결된 작업 공간을 확인하세요. 연결된 각 작업 영역은 참조를 트리거하는 `acme-linear`과 같은 연결 슬러그를 수신합니다.

Linear는 다음 Hub URL을 호출합니다.

| 설정 | Hub URL |
| ------------ | ------------------------------------------------------ |
| 리디렉션 URL | `<PASEO_HUB_APP_URL>/api/integrations/linear/callback` |
| 웹훅 URL | `<PASEO_HUB_APP_URL>/api/integrations/linear/events` |

Hub는 `read` 및 `comments:create` OAuth 범위를 요청하고 응답을 Linear 앱으로 게시합니다. 다음으로 [Linear 트리거](/docs/hub/triggers/linear)를 사용하여 워크플로를 만듭니다.

## 환경에서 구성

Hub 외부에서 앱 비밀을 유지하는 배포에서는 세 가지 환경 변수를 모두 설정할 수 있습니다.

```dotenv
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
LINEAR_WEBHOOK_SECRET=
```

Linear 애플리케이션에서 동일한 리디렉션 URL 및 웹후크 URL을 구성하고, Hub를 다시 시작한 다음, **통합**을 열고, **Linear 작업 영역 연결**을 선택하여 작업 영역을 인증합니다.

환경 구성은 저장된 Linear 앱보다 우선하며 **앱** 아래에 **환경에서 관리됨**으로 표시됩니다.
