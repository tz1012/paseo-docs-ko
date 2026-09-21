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

- [npm](#publish-on-npm): 공개 npm 레지스트리에 패키지를 게시합니다.
- [GitHub 또는 Git](#share-through-github-or-git): 사용자가 저장소에서 설치할 수 있게 합니다.

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

## GitHub 또는 Git을 통해 공유하기

플러그인 프로젝트를 저장소에 푸시하세요. 사용자는 다음 명령으로 설치할 수 있습니다.

```bash
paseo plugin install github:acme/paseo-review
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
