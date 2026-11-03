---
title: .worktreeinclude
description: Copy gitignored local files into new Paseo worktrees.
nav: .worktreeinclude
order: 12
category: Workspaces
---

# .worktreeinclude

소스 체크아웃 루트에 `.worktreeinclude`를 추가해 로컬 구성을 새 [Git 작업 트리](/docs/worktrees)로 복사하세요. Paseo는 설정, 터미널, 첫 에이전트 시작 전에 일치하는 gitignored 파일을 복사합니다.

## 로컬 구성 복사하기

`.gitignore`에 `.env`와 `config/*.local.json`이 포함된 프로젝트에서는 다음 `.worktreeinclude`를 만드세요.

```gitignore
.env
config/*.local.json
```

Paseo를 통해 작업 트리를 만들면 기존 `.env`와 `config/dev.local.json`같이 일치하는 파일이 새 작업 트리의 같은 상대 경로로 복사됩니다. 파일 내용은 Git에 들어가지 않습니다.

`.worktreeinclude`를 커밋해 팀과 패턴을 공유하세요. 각 팀원은 자신이 작업 트리를 만드는 체크아웃에 자신의 ignored 파일을 제공합니다.

## 패턴 구문

한 줄에 패턴 하나씩 gitignore 구문을 사용하세요. 주석은 `#`으로 시작합니다. 일치 항목을 제외하려면 패턴 앞에 `!`를 붙이세요.

```gitignore
# Local environment and configuration
.env
config/*.local.json
!config/production.local.json
```

패턴은 Git이 이미 무시하는 파일만 선택합니다. 여기에 경로를 추가해도 해당 파일이 무시되지는 않으므로 필요할 때는 `.gitignore`도 구성하세요. 추적되는 파일과 Git이 무시하지 않는 추적되지 않는 파일은 제외됩니다.

## 파일 복사 시점

내장 `worktree-include` 플러그인은 작업 트리를 만드는 체크아웃에서 파일을 읽습니다. 해당 소스 자체가 다른 작업 트리일 수도 있습니다. 복사가 실행되려면 플러그인을 활성화한 상태로 유지하세요.

- `.worktreeinclude`가 없으면 플러그인은 아무것도 복사하지 않습니다.
- 일치하는 파일은 소스 체크아웃에 존재해야 합니다.
- 기존 대상 파일은 내용을 보존하도록 건너뜁니다.
- 파일은 생성 중에 복사되며 체크아웃 간에 지속적으로 동기화되지 않습니다.
- 복사 오류가 발생하면 생성을 중단하고 새 작업 트리를 제거합니다. 파일로 복사할 수 없는 심볼릭 링크 디렉터리나 중첩 저장소는 포함하지 마세요.

## 설정 중 명령 실행하기

이미 로컬에 존재하는 파일에는 `.worktreeinclude`를 사용하세요. 종속성을 설치하거나 파일을 생성하거나 비밀을 가져오려면 [설정 훅](/docs/worktrees#setup-and-teardown)을 사용하세요.

```json
{
  "worktree": {
    "setup": "npm ci"
  }
}
```

새 작업 트리에 사용할 기본 분기의 `paseo.json`에 이 구성을 넣으세요. 복사된 파일은 설정을 실행할 때 사용할 수 있습니다.
