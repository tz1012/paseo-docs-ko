---
title: Publish a plugin
description: Share a Paseo plugin on npm, through a private registry, or from a Git repository.
nav: Publishing
order: 45
category: Plugins
---

# 플러그인 게시하기

다른 사용자가 Paseo에서 플러그인을 설치하고 사용할 수 있도록 게시하세요. 작동하는
[플러그인 프로젝트](/docs/plugins)로 시작한 다음 공유할 위치를 선택하세요.

- [플러그인 레지스트리](#plugin-registry): 사용자가 `owner/slug`로 설치하는 검토된 아티팩트를 공유합니다.
- [npm](#publish-on-npm): 공개 npm 레지스트리에 패키지를 게시합니다.
- [GitHub 또는 Git](#share-through-github-or-git): 사용자가 저장소에서 설치할 수 있게 합니다.

## 플러그인 레지스트리

[paseo.sh/plugins](https://paseo.sh/plugins)에서 게시된 플러그인을 찾아볼 수 있습니다.
사용자는 다음 명령으로 검토된 아티팩트를 설치합니다.

```bash
paseo plugin add owner/slug
```

npm 또는 Git을 통해 아티팩트를 게시한 다음 [레지스트리 제출 가이드](https://github.com/getpaseo/plugins)에
따라 검토를 요청하세요. 레지스트리를 통한 설치 및 업데이트에는 승인된 리비전과 플러그인 경로가
사용됩니다. Git에서 직접 설치할 때는 명시적 `git:owner/repository` 단축 표기 또는 전체 Git URL을
사용합니다.

## npm에 게시하기

스캐폴드는 패키지 파일과 개발 종속성을 준비합니다. 패키지 이름과 릴리스 버전은 직접 선택합니다.

### 1. 패키지 이름과 버전 설정하기

플러그인 디렉터리에서 패키지 세부정보를 설정하고 게시를 허용하세요. `@acme`를 자신의 npm 범위로
바꾸세요.

```bash
npm pkg set name=@acme/paseo-review version=1.0.0
npm pkg delete private
```

### 2. 확인하고 게시하기

```bash
npm run typecheck
npm pack --dry-run
npm publish --access public
```

pack 출력에 프로젝트에 추가한 모든 자산이 포함되어 있는지 확인하세요.

### 3. 게시된 플러그인 테스트하기

npm을 사용할 수 있는 데몬 호스트에서 다음을 실행하세요.

```bash
paseo plugin install npm:@acme/paseo-review@1.0.0
```

사용자는 `npm:@acme/paseo-review`를 **설정 → 플러그인 → 플러그인 소스**에 붙여 넣을 수도 있습니다.

:::example[패키지 구성]

스캐폴드는 `package.json`에 다음 `files` 목록을 포함합니다.

```json
{
  "files": [
    "paseo-plugin.json",
    "OVERVIEW.md",
    "index.client.ts",
    "index.client.tsx",
    "index.server.ts",
    "index.server.tsx",
    "client/",
    "server/",
    "shared/"
  ]
}
```

- 이 디렉터리 외부에 저장한 자산은 `files`에 추가하세요.
- 스캐폴드의 SDK 및 호스트 라이브러리는 `devDependencies`에 유지하세요.
- 그 밖의 런타임 라이브러리는 `npm install <package>`로 추가하세요. Paseo는 해당 종속성도 설치합니다.
- npm 패키지 이름은 소스를 식별합니다. 매니페스트의 `id`는 설치된 플러그인을 식별합니다.

진입점과 런타임 경계는 [프로젝트 참조](/docs/plugins/reference#project-files)를 확인하세요.

:::

### 빌드 단계가 있는 플러그인

Paseo는 TypeScript를 컴파일합니다. 일반적인 플러그인은 게시 전에 별도 빌드가 필요하지 않습니다.
플러그인이 파일을 생성한다면 생성된 출력을 패키지에 포함하세요.

**설치 스크립트는 자동으로 실행되지 않습니다.** 종속성에 호스트별 설정이 필요하면
[준비 명령](/docs/plugins/reference#cli-reference)을 선언하세요.

:::example[생성된 파일과 종속성]

- `npm publish`를 실행하기 전에 코드와 자산을 생성하세요.
- 생성된 JavaScript는 해당 런타임 디렉터리에 유지하고 TypeScript 진입점에서 가져오세요.
- 생성된 자산을 `files`에 포함하세요.
- 자체 번들을 만들 때는 호스트 제공 모듈을 외부 모듈로 유지하세요.
- 게시된 매니페스트에서 Git 전용 종속성 설치 명령을 제거하세요. npm 설치는 이미 프로덕션 종속성을
  설치합니다.

Paseo는 설치할 때 종속성 스크립트를 포함한 npm 수명 주기 스크립트를 건너뜁니다. 예를 들어 다시
빌드해야 하는 네이티브 종속성에는 명시적인 준비 명령이 필요합니다.

:::

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

## 아이콘과 스크린샷

`paseo-plugin.json`에 표시 이름, 아이콘, 스크린샷, 데모 동영상을 선언하세요.

```json
{
  "id": "review-tools",
  "name": "Review tools",
  "description": "Reviews changes before merge",
  "icon": "assets/icon.png",
  "media": ["assets/screenshot.png", "https://example.com/review-demo.mp4"],
  "requirements": { "paseo": ">=0.11.0" }
}
```

세 필드는 모두 선택 사항입니다. `name`은 설치 ID를 변경하지 않고 레지스트리와 웹사이트에 표시 이름을
제공합니다. 생략하면 레지스트리는 ID를 사람이 읽기 쉬운 형태로 바꿔 사용합니다. 레지스트리와
웹사이트에 표시하려면 레지스트리 빌더가 고정된 매니페스트에서 이 필드를 읽도록 업데이트되어야 합니다.
이 업데이트는 별도 후속 작업이며, 완료되기 전까지 이 필드는 데몬의 설치된 플러그인 목록을 통해서만
노출됩니다. `icon`은 플러그인 패키지 안의 PNG를 가리켜야 합니다. `media`는 패키지 안의 이미지 및
동영상 경로나 HTTPS URL을 표시 순서대로 받습니다. 경로는 매니페스트를 기준으로 하며, 정방향 슬래시를
사용하고 패키지 내부에 있어야 합니다. 검증 규칙은 [매니페스트 참조](/docs/plugins/reference#project-files)를
확인하세요.

로컬 자산은 고정된 리비전의 매니페스트와 함께 커밋하세요. npm에서는 해당 디렉터리(예: `assets/`)를
`package.json`의 `files` 목록에 추가하고 `npm pack --dry-run`으로 확인하세요. 스캐폴드는 매니페스트의
`$comment`에 이 필드를 설명합니다. 게시하기 전에 표시 이름과 자산을 추가하세요.

이 필드를 사용하는 매니페스트는 0.11.0 이전 데몬에 설치되지 않습니다. `requirements.paseo`를
`>=0.11.0` 또는 더 좁은 지원 범위로 설정하세요.

## 플러그인 소개 페이지

Paseo 안의 플러그인 페이지에 사용할 `OVERVIEW.md`를 `paseo-plugin.json` 옆에 작성하세요. 이 파일은
사용자가 플러그인 설치 여부를 판단하도록 돕습니다. 설치 명령은 이미 페이지 맨 위에 있습니다. README는
GitHub 독자를 전제로 설치 안내, 기술 세부정보, 배지를 담습니다. 길고 AI로 생성한 README에서는 플러그인이
무엇을 하는지 이해하려고 이런 내용을 지나쳐 읽어야 합니다.

플러그인을 레지스트리에 등록하려면 `OVERVIEW.md`가 필요합니다. 소스 저장소에서 고정된 커밋의
`paseo-plugin.json` 옆에 커밋하세요. 모노레포에서는 레지스트리가 `pluginPath` 아래에서 매니페스트를
기준으로 이 파일을 찾습니다. 게시하는 npm 패키지에도 포함하세요. 스캐폴드의 `files` 목록에 이미
포함되어 있습니다. 게시하기 전에 스캐폴드의 안내 주석을 유용한 사실로 바꾸세요.

저장소의 소개 문서는 레지스트리 가져오기용 임시 문서보다 우선합니다. 고정된 커밋에 `OVERVIEW.md`가
없으면 온라인 검증이 실패합니다. 단, 레지스트리 저장소에 이미 `plugins/<owner>/<slug>.md`가 있는 변경되지
않은 가져오기 레코드는 예외입니다. 버전을 올릴 때마다 저장소 소개 문서가 필요하며 같은 PR에서 임시
문서가 제거됩니다. 저장소 소개 문서 없이 버전만 올리면 검증에 실패합니다. README는 소개 문서를
대체하지 않습니다.

작성자 소개 문서와 레지스트리 임시 문서는 다음 순서의 동일한 콘텐츠 계약을 따릅니다. 도움이 될 때만
제목을 사용하세요. 길이는 복잡도에 맞춥니다. 테마에는 문단 하나면 충분합니다.

1. 플러그인이 무엇이고 무엇을 하는지 쉬운 말로 먼저 설명합니다.
2. 작동 방식이 명확하지 않을 때만 이를 설명합니다.
3. 필요한 경우 설정을 설명합니다. 설정, 계정, 토큰, 공급자, 외부 도구 또는 다른 플러그인을 다루고,
   해당되는 데몬 버전과 운영 체제 요구 사항을 포함합니다. 설정 안내는 허용되지만 설치 안내는 허용되지
   않습니다.
4. 이해할 가치가 있는 기능과 설정, 각 옵션의 동작, 플러그인이 읽거나 전송하는 데이터와 전송 위치,
   권한 및 알려진 제한을 설명합니다.

문장형 대소문자와 평이하고 사실적인 표현을 사용하고 em dash는 쓰지 마세요. 설치 명령, 배지, 변경 로그,
기여 또는 라이선스 섹션, 마케팅 문구, 근거 없는 주장은 제외하세요. 빈 정리 함수, 테마 토큰 필드 목록,
제공하지 않는 기능 목록 같은 구현상의 군더더기는 피하세요. 사용자가 플러그인을 선택하는 데 도움이 되는
내용만 남기세요.

변경되지 않은 가져오기 레코드의 플러그인이라면 레지스트리 임시 문서를 대체할 작성자 소개 문서를 제안할
수 있습니다. 직접 작성한 `OVERVIEW.md`에는 가져오기 출처 표기를 추가하지 마세요.

## GitHub 또는 Git을 통해 공유하기

플러그인 프로젝트를 저장소에 푸시하세요. 사용자는 다음 명령으로 설치할 수 있습니다.

```bash
paseo plugin add git:acme/paseo-review
```

다른 Git 호스트에서는 다음을 사용하세요.

```bash
paseo plugin install git:https://git.example.com/acme/paseo-review.git
```

플러그인에 런타임 npm 종속성이 있다면 `package-lock.json`을 커밋하고 `paseo-plugin.json`에 준비
명령을 추가하세요.

```json
{
  "build": [["npm", "ci", "--omit=dev"]]
}
```

- `npm ci`는 커밋된 잠금 파일의 버전을 설치합니다.
- `--omit=dev`는 개발 도구를 제외합니다.
- 데몬 호스트에서 npm을 사용할 수 있어야 합니다.

Paseo의 호스트 라이브러리만 사용하는 플러그인에는 준비 명령이 필요하지 않습니다.
