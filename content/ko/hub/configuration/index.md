---
title: Hub configuration
description: Configuration bundles, GitHub sync, CLI deployment, and revisions.
nav: Configuration
order: 70
category: Hub
---

# 허브 구성

프로젝트 구성은 버전이 지정된 하나의 번들입니다.

```text
.paseo/
├── hub.yml
└── workflows/
    ├── <workflow>.yml
    └── partials/
        └── <partial>.md
```

`hub.yml`은 명명된 환경과 에이전트를 소유합니다. 각 직계 하위 워크플로 파일은 하나의 트리거와 정렬된 인라인 단계를 소유합니다. 해당 워크플로에서 참조하는 프롬프트 부분은 `workflows/partials/` 아래에 있습니다. 워크플로 검색은 규칙에 따라 수정됩니다. 매니페스트나 포함 목록이 없습니다.

[single-repo-team-bot](https://github.com/getpaseo/hub/tree/main/examples/single-repo-team-bot)은 공유 부분에 대한 분류자와 작업자를 실행하는 Discord, Slack 및 GitHub 워크플로와 같은 형태의 완전한 번들입니다. `.paseo/`을 저장소에 복사하고 README 목록의 자리 표시자를 바꿉니다.

## 소스

구성은 하나의 소스에서 제공됩니다.

- **GitHub 소스**: 저장소의 기본 브랜치에 있는 전체 `.paseo` 번들입니다.
- **수동 소스**: 대시보드에서 소스 파일을 편집하고 활성화합니다.
- **CLI/API 설치**: 조직 권한으로 전송되는 완전한 번들입니다.

**구성** 탭에는 활성 개정판, 소스 파일 및 최신 동기화 시도가 표시됩니다.

## CLI에서 배포

프로젝트 루트에서 실행합니다.

```sh
paseo hub login https://hub.example.com
paseo hub deploy -p my-project --dry-run
paseo hub deploy -p my-project
```

두 명령 모두 `.paseo/hub.yml`, 모든 직접 `.paseo/workflows/*.yml` 파일 및 `.paseo/workflows/partials/` 아래의 각 참조 파일을 검색합니다. 파일은 동일한 번들 요청을 통해 결정적인 경로 순서로 전송됩니다. 테스트 실행은 서버 측 유효성 검사를 호출하고 개정을 생성하거나 활성화하지 않습니다.

CLI는 Hub에 연결하기 전에 누락된 리소스 또는 워크플로 파일, `.yaml` 워크플로 확장, 중첩된 워크플로 파일, 안전하지 않은 부분 경로, 심볼릭 링크된 번들 경로 및 읽을 수 없는 파일을 거부합니다. 오류 이름 경로는 표시되지만 파일 내용이나 자격 증명은 인쇄되지 않습니다.

원산지 우선순위:

1. `--hub`
2. `PASEO_HUB_URL`
3. 활성 저장된 로그인
4. `https://hub.paseo.sh`

자격 증명 우선 순위:

1. `--api-key`
2. `PASEO_HUB_API_KEY`
3. 정확한 해결 출처에 대한 저장된 로그인

플래그와 환경 키는 저장되지 않습니다. 엔드포인트 및 자격 증명 동작은 배포와 테스트 실행 간에 변경되지 않습니다.

## GitHub 동기화

구성 저장소의 기본 분기에 푸시하면 동기화가 시작됩니다.

1. Hub는 정확한 커밋에서 표준 번들을 검색합니다.
2. 모든 소스 파일을 구문 분석하고 프롬프트 부분을 해결합니다.
3. 명명된 리소스, 표현식, 연결 및 데몬 가용성을 확인합니다.
4. 성공하면 변경할 수 없는 새 개정판이 활성화됩니다.

**지금 동기화**는 요청 시 동일한 작업을 수행합니다. 실패는 소스 경로와 작성된 필드를 유지합니다. 실패한 동기화는 활성 버전을 대체하지 않습니다.

## 개정 및 소스 변경

개정판은 검사 또는 재배포에 필요한 정확한 제작 파일을 유지합니다. 롤백하면 이전 버전이 활성화됩니다. 다음 유효한 GitHub 푸시는 새 개정판을 다시 활성화합니다.

GitHub 지원 구성은 대시보드에서 읽기 전용입니다. 수동으로 전환하면 소스 문서가 보존됩니다. 번들을 하나의 생성된 파일로 축소하지 않습니다.

구성 저장소는 `filters.repo`으로 명명된 저장소와 다를 수 있습니다. 번들을 변경하면 연결, 데몬, 작업 디렉터리, 에이전트 및 출력이 선택될 수 있으므로 보호하세요. [허브 보안](/docs/hub/security)을 참조하세요.

다음: [구성 참조](/docs/hub/configuration/hub-yml) 및 [워크플로 예](/docs/hub/workflows).