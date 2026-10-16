---
title: Publish a plugin
description: Prepare, publish and submit a Paseo plugin to the reviewed registry.
nav: Publishing
order: 45
category: Plugins
---

# 플러그인 게시하기

작동하는 [플러그인 프로젝트](/docs/plugins)로 시작하세요. 목록을 준비하고 npm에 게시하거나 GitHub에
푸시한 다음 레지스트리에 제출합니다. 승인되면 사용자는 검토된 버전을
`paseo plugin add owner/slug`로 설치합니다.

1. [목록 페이지](#your-listing-page)를 준비하고, 시각적 플러그인이라면
   [인터페이스 이미지](#icons-and-screenshots)도 준비합니다.
2. [npm에 게시](#publish-on-npm)하거나 [Git을 통해 공유](#share-through-github-or-git)합니다.
3. [플러그인 레지스트리에 제출](#plugin-registry)합니다.

비공개 플러그인에는 [Git 직접 설치](#share-through-github-or-git) 또는
[비공개 npm 패키지](#private-npm-packages)를 사용하세요.

## 목록 페이지

`OVERVIEW.md` 없이도 제출할 수 있습니다. 검토자가 README와 검증된 동작을 바탕으로 목록 페이지를
만듭니다. 페이지를 직접 관리하려면 `OVERVIEW.md`를 `paseo-plugin.json` 옆에 두고 게시하는 패키지에
포함하세요. 스캐폴드의 `files`에는 이미 이 파일이 포함되어 있습니다. 패키지에 포함된 소개 문서는
검토자가 작성한 페이지를 대체합니다.

다음 항목을 순서대로 설명하고, 도움이 될 때만 제목을 사용하세요.

1. 플러그인이 무엇을 하는지.
2. 작동 방식이 명확하지 않을 때는 어떻게 작동하는지.
3. 설정: 설정값, 계정, 토큰, 외부 도구, 지원 운영 체제와 Paseo 버전.
4. 알아둘 만한 기능, 설정값, 데이터 접근, 권한과 제한.

에이전트 공급자에게 보내는 프롬프트와 도구 결과를 포함해 데이터가 어디로 가는지 설명하세요. 로컬에
저장한다고 해서 데이터가 호스트를 벗어나지 않는 것은 아닙니다. 플러그인이 실행 중 소프트웨어를
다운로드하거나 설치한다면 무엇을 어디에서 설치하는지 설명하고, 다운로드 전에 사용자의 명시적 확인을
받아야 합니다. 활성화 및 연결 테스트에도 이 규칙이 적용되며, 사용자가 거절하면 소프트웨어를 설치하지
않아야 합니다.

평이하고 사실적인 표현과 문장형 대소문자를 사용하세요. 마케팅, 근거 없는 주장, 배지, 변경 로그, 기여 및
라이선스 섹션과 사용자가 플러그인을 선택하는 데 도움이 되지 않는 구현 세부정보는 제외하세요. 플러그인
설치 안내는 목록에 이미 제공됩니다.

게시 검증기는 개발 또는 설정 예시를 포함해 소개 문서 어디에서든 `paseo plugin add`, `npm install`,
`npm i`를 발견하면 거부합니다. 해당 명령은 README로 링크하세요.

한 문장짜리 설명도 제공하세요. npm에서는 `package.json`의 `description`을, Git에서는 매니페스트의
`description`을 사용합니다. 설명이 빠졌다면 검토자가 레지스트리에서 채울 수 있습니다.

## 아이콘과 스크린샷

테마, 패널 및 그 밖의 시각적 플러그인 인터페이스에는 현재 인터페이스를 보여주는 이미지가 하나 이상
필요합니다. 샘플 데이터를 사용하고 비공개 세부정보는 숨기세요. 아이콘만으로는 이 요건을 충족하지
않으며, 자체 시각적 인터페이스가 없는 플러그인에는 스크린샷이 필요하지 않습니다.

게시하기 전에 `paseo-plugin.json`에 로컬 이미지를 선언하세요.

```json
{
  "id": "review-tools",
  "name": "Review tools",
  "description": "Reviews changes before merge",
  "icon": "assets/icon.png",
  "media": ["assets/screenshot.png"],
  "requirements": { "paseo": ">=0.11.0" }
}
```

참조하는 파일을 만들고, npm용 `package.json`의 `files` 목록에 `assets/`를 포함하세요. 경로는
매니페스트를 기준으로 하며 정방향 슬래시를 사용하고 플러그인 디렉터리 안에 있어야 합니다. 이 메타데이터
필드에는 Paseo 0.11.0 이상이 필요합니다.

| 필드    | 목록에서의 동작                                                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`  | 선택적 표시 이름입니다. 생략하면 플러그인 ID를 사람이 읽기 쉬운 형태로 바꿔 사용합니다.                                                                             |
| `icon`  | 패키지를 기준으로 한 선택적 PNG입니다. 공급자 등록 아이콘에는 별도의 [SVG 계약](/docs/plugins/reference#providers)이 적용됩니다.                                    |
| `media` | 패키지 기준 경로나 공개 HTTPS URL입니다. 이미지: PNG, JPG, JPEG, WebP 또는 GIF. 동영상: MP4 또는 WebM. 첫 이미지가 카드 썸네일이며 동영상은 이를 보완합니다. |

공개 미디어 URL에는 대소문자를 구분하지 않고 일치하는 지원 파일 확장자가 있어야 하며, 해당 이미지 또는
동영상 콘텐츠 유형과 함께 HTTP 200을 반환해야 합니다. SVG와 확장자 없는 첨부 파일 URL은 레지스트리
미디어로 허용되지 않습니다.

`media`를 선언하는 대신 제출 이슈나 검토 PR에 적절한 공개 이미지 URL을 제공할 수 있습니다. 검토자는
새 플러그인 릴리스 없이도 해당 이미지를 목록에 추가할 수 있습니다.

## npm에 게시하기

### 1. 패키지 식별 정보 설정하기

게시 권한이 있는 npm 범위를 사용하고 `npm login`으로 인증하세요. 플러그인 디렉터리에서 아래의
`@acme`와 저장소를 자신의 값으로 바꾸세요.

```bash
npm pkg set name=@acme/paseo-review version=1.0.0
npm pkg delete private
npm pkg set repository.type=git repository.url=git+https://github.com/acme/paseo-review.git
```

현재 레지스트리 도구에서 npm 목록 소유권을 확인하려면 `package.json` 또는 npm provenance로 제공되는
GitHub 저장소가 필요합니다. 고정 작업에서 목록 소유자를 판별할 수 있도록 `repository`를 공개 소스
저장소로 설정하세요. provenance 자체는 선택 사항이지만, 제공한다면 해당 저장소가 패키지의 저장소와
일치해야 합니다. 아티팩트 검토에는 일치하는 소스 체크아웃이 필요하지 않습니다.

### 2. 설치 종속성 잠그기

Paseo의 호스트 라이브러리와 타입 전용 종속성은 `devDependencies`에 유지하세요. 그 밖의 런타임
라이브러리는 `dependencies`에 추가하세요. 레지스트리에 제출하려면 설치되는 모든 종속성 트리에 전이
종속성을 포함한 정확한 버전, 확인된 소스와 무결성 정보가 담긴 잠금 파일이 필요합니다.

런타임 종속성이 설치되는 npm 패키지는 수명 주기 스크립트를 실행하지 않고 잠금 파일을 갱신한 다음,
게시 가능한 잠금 파일을 만드세요.

```bash
npm install --package-lock-only --ignore-scripts
npm shrinkwrap
```

`npm shrinkwrap`은 `package-lock.json`을 `npm-shrinkwrap.json`으로 변환합니다. npm은 패키지 루트의
shrinkwrap을 게시하지만 `package-lock.json`은 게시하지 않습니다. 저장소에만 있는 잠금 파일이나 정확한
직접 종속성 버전만으로는 사용자에게 설치되는 종속성 트리가 잠기지 않습니다.

호스트 라이브러리와 개발 종속성만 사용하는 플러그인은 준비 명령이 해당 종속성을 설치하지 않는 한
런타임 잠금 파일이 필요하지 않습니다. 라이브러리를 번들로 묶고 런타임 종속성 선언을 제거할 수도
있습니다. 플러그인이 별도 트리를 설치한다면 [준비 및 추가 설정](#plugins-with-a-build-step)을 참조하세요.

### 3. 패키지 확인하고 게시하기

패키지를 확인하기 전에 필요한 파일을 생성하세요. 시험 실행에서는 패킹 스크립트를 건너뜁니다.

```bash
npm run typecheck
npm pack --dry-run --ignore-scripts
```

파일 목록에 `paseo-plugin.json`, 런타임 진입점 하나 이상, 가져오는 모든 로컬 모듈, 선언한 소개 문서와
자산, 필요한 경우 shrinkwrap이 포함되어 있는지 확인하세요. 저장소에서만 작동하는 import 별칭과 패키지
밖의 파일은 사용자에게 전달되지 않습니다. 스캐폴드는 진입점과 `client/`, `server/`, `shared/`를
포함합니다. 그 밖의 자산 디렉터리는 `files`에 추가하세요.

선언한 준비 명령이 지원하는 Node/npm 버전에서 성공하는지 확인하세요. 잠금 파일이 동기화되지 않았거나
호환되지 않으면 여전히 설치가 차단됩니다.

확인한 버전을 게시하세요.

```bash
npm publish --access public
```

테스트 데몬에서 게시한 정확한 버전을 설치하고 기여 기능을 실행해 보세요.

```bash
paseo plugin install npm:@acme/paseo-review@1.0.0
paseo plugin ls
```

오류 없이 `running` 상태인지 확인한 다음 [패키지를 제출](#plugin-registry)하세요.

## GitHub 또는 Git을 통해 공유하기

공개 레지스트리에 등록하려면 플러그인을 공개 GitHub 저장소에 푸시하세요. 매니페스트, 런타임 진입점,
가져오는 파일과 목록 자산을 포함해야 합니다. 제출할 때 Git 태그와 커밋은 선택 사항입니다. 특정
리비전을 선택하려면 이를 제공하고, 그렇지 않으면 검토자가 `main`을 확인합니다.

준비 작업에서 런타임 npm 종속성을 설치한다면 동기화된 `package-lock.json`을 커밋하고
`paseo-plugin.json`에 다음 명령을 추가하세요.

```json
{
  "build": [["npm", "ci", "--omit=dev", "--ignore-scripts"]]
}
```

`npm ci`는 커밋된 잠금 파일을 사용하며 `package.json`과 일치하지 않으면 실패합니다. `--omit=dev`는
개발 도구를 제외하고 `--ignore-scripts`는 종속성의 수명 주기 스크립트를 억제합니다. 데몬의 명령
경로에서 npm을 사용할 수 있어야 합니다. 호스트 라이브러리만 사용하는 플러그인에는 준비 명령이
필요하지 않습니다. 생성 파일이나 명시적 스크립트는 [준비 작업](#plugins-with-a-build-step)을 참조하세요.

사용자는 레지스트리 목록 없이 Git에서 직접 설치할 수 있습니다.

```bash
paseo plugin add git:acme/paseo-review
paseo plugin add git:acme/monorepo:plugins/review
```

최초 설치에서 브랜치, 태그 또는 커밋을 선택하려면 `--ref`를 사용하세요. 데몬에 접근 권한이 있다면
직접 설치는 비공개 저장소와 다른 Git 호스트도 지원합니다. [플러그인 소스](/docs/plugins/reference#plugin-sources)를
참조하세요. 레지스트리에는 공개 GitHub 소스와 공개 npm 패키지를 제출할 수 있습니다.

## 플러그인 레지스트리

[제출 양식](https://github.com/getpaseo/plugins/issues/new?template=submit-plugin.yml)을 여세요. 이슈에
접수 절차를 시작하는 제출 레이블이 붙도록 반드시 양식을 사용하세요.

1. 플러그인 이름을 제목으로 사용합니다.
2. **Source**에 공개 npm 패키지 이름이나 페이지 또는 GitHub 저장소/폴더 URL을 입력합니다. 특정 릴리스를
   검토받으려면 버전이나 Git 참조를 포함하세요. npm은 기본적으로 `latest`를 사용합니다. 레지스트리 ID와
   로컬 디렉터리는 제출 소스로 사용할 수 없습니다.
3. 알맞은 카테고리를 선택합니다. 인터페이스 이미지 URL이 있다면 이슈 설명에 포함합니다.

봇이 검토 PR을 엽니다. 검토자는 플러그인 코드를 실행하지 않고 아티팩트와 종속성을 검사하고, 목록을
완성하며 승인된 정확한 버전 또는 커밋을 기록합니다. 자동 검증을 통과하더라도 게시하려면 잠긴 설치 입력과
적절한 데이터 접근을 포함한 [검토 정책](https://github.com/getpaseo/plugins/blob/main/REVIEW.md)을 충족해야
합니다.

변경 요청을 받으면 수정한 버전/리비전 또는 요청한 이미지 URL을 검토 PR에 답글로 남기세요. 검토자가
고정 값과 목록을 갱신합니다. 접수 서비스 오류는 자동으로 재시도되며, 이미지나 소개 문서가 없어도 검토
PR은 열립니다.

승인 및 게시 후 사용자는 다음 명령으로 목록을 설치합니다.

```bash
paseo plugin add owner/slug
```

npm 릴리스에는 업데이트 PR이 자동으로 생성됩니다. Git 업데이트는 원하는 리비전과 함께 직접 제출하세요.
기존 레지스트리 설치는 승인된 고정 값을 사용하고, npm/Git 직접 설치에는
[소스 참조](/docs/plugins/reference#plugin-sources)의 자체 업데이트 규칙이 적용됩니다.

## 빌드 단계가 있는 플러그인

Paseo가 TypeScript를 컴파일하므로 일반적인 플러그인은 별도의 게시 빌드가 필요하지 않습니다. 생성된
모듈은 해당 런타임 디렉터리에 유지하고 호스트 제공 모듈은 외부 모듈로 유지하세요.

Paseo는 패키지를 가져오는 동안 npm 수명 주기 스크립트를 억제합니다. 매니페스트의 `build`에 명시적으로
선언한 명령은 그 명령이 호출하는 스크립트를 포함해 계속 실행됩니다. 해당 명령의 목적을 설명하고 입력은
잠겨 있고 검사할 수 있는 상태로 유지하세요. npm이 이미 프로덕션 종속성을 설치한다면 npm 매니페스트에서
Git 전용 종속성 설치 명령을 제거하세요.

나중 설정에서 다른 종속성 트리를 설치한다면 플러그인에 개발 잠금 파일이 있더라도 해당 트리 자체의
완전한 잠금 파일이 필요합니다. npm 설정에서는 런타임 매니페스트와 잠금 파일을 함께 제공하고 `npm ci`를
사용하세요. Python 설정에서는 모든 전이 패키지의 정확한 버전과 SHA-256 해시를 담은 requirements 파일을
제공한 다음 다음 명령으로 설치하세요.

```bash
python -m pip install --require-hashes -r requirements-documents.txt
```

이 명령은 고정되지 않았거나 해시가 없는 종속성을 거부합니다. 런타임 설치에도 위에서 설명한
[확인과 고지](#your-listing-page)가 필요합니다.

## 비공개 npm 패키지

:::example[GitHub Packages에 비공개 패키지 게시하기]

회사 플러그인을 GitHub Packages에 게시할 수 있습니다. 위의 npm 단계를 따르되 조직의 범위를 사용하고
게시 명령을 다음과 같이 바꾸세요.

```bash
npm publish --registry=https://npm.pkg.github.com
```

게시하기 전에 [GitHub 인증 및 패키지 접근을 구성](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)하세요.

플러그인을 설치하려면 **Paseo를 실행하는 사용자로 데몬 호스트에서** npm을 구성하세요.

1. `~/.npmrc`에 조직의 레지스트리를 추가합니다.

   ```ini
   @acme:registry=https://npm.pkg.github.com
   ```

2. GitHub 사용자 이름과 개인용 액세스 토큰(classic)을 비밀번호로 사용해 로그인합니다.
   토큰에는 `read:packages`와 해당 패키지에 대한 접근 권한이 필요합니다.

   ```bash
   npm login --scope=@acme --auth-type=legacy --registry=https://npm.pkg.github.com
   ```

3. 플러그인을 설치합니다.

   ```bash
   paseo plugin install npm:@acme/paseo-review
   ```

Paseo는 설치 및 업데이트에 호스트의 npm 레지스트리 설정과 자격 증명을 사용합니다.
앱에는 소스 식별자만 입력하세요.

:::
