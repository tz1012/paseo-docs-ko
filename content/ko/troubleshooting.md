---
title: Troubleshooting
description: Why Paseo can't find a provider you've installed, and how to fix the PATH and environment mismatches behind most setup issues.
nav: Common problems
order: 90
category: Troubleshooting
---

# 문제 해결

거의 모든 "내 터미널에서는 작동하지만 Paseo에서는 작동하지 않습니다" 문제는 동일합니다. Paseo와 터미널이 동일한 `PATH`을 검색하지 않습니다. 이 페이지에서는 이를 발견하고 수정하는 방법을 다룹니다.

## Paseo가 내 제공업체를 찾을 수 없습니다.

설치한 공급자는 **설치되지 않음**으로 표시됩니다.

Paseo는 이미 설치한 에이전트 CLI를 실행하지만 이를 번들로 묶지는 않습니다([공급자](/docs/providers) 참조). 따라서 `PATH` 자체적으로 명령을 찾아야 합니다. 쉘이 특정 조건 하에서 `PATH`에만 해당 위치를 추가하는 경우 Paseo는 이를 놓칠 수 있습니다.

### Paseo가 보는 것을 보세요

**설정 → 호스트 → 제공업체**를 열고 제공업체를 탭한 다음 **진단**을 탭하세요. 중요한 행:

- **확인된 경로** — Paseo가 바이너리 또는 `not found`를 찾은 곳입니다.
- **데몬 경로** — `PATH` Paseo가 검색 중입니다. 새로운 터미널에서 `echo $PATH`과 비교해 보세요.
- **버전** — 바이너리가 실제로 실행되는지 여부입니다.

터미널이나 에이전트에서 문제가 발생한 데몬에 동일한 진단을 요청하세요.

```bash
paseo provider diagnostic <provider>
paseo --host <host:port> provider diagnostic <provider> --json
```

문제가 발생한 데몬이 CLI의 기본 로컬 데몬이 아니면 전역 `--host` 옵션을 사용하세요.

`not found`과 바이너리 디렉터리가 누락된 **데몬 경로**가 일반적인 경우입니다. 해당 디렉터리는 터미널의 `PATH`에 있지만 Paseo의 디렉터리에는 없습니다.

### 고치세요

지속적인 수정은 명령이 일반 로그인 셸에 대해 `PATH`에 있는지 확인한 다음 Paseo를 다시 시작하는 것입니다. 이것이 중요한 테스트인 이유는 [Paseo의 환경이 다를 수 있는 이유](#why-paseos-environment-can-differ-from-your-terminal)를 참조하세요.

직접 고정하려면 `~/.paseo/config.json`에 바이너리 경로를 설정하세요.

```json
{
  "agents": {
    "providers": {
      "claude": {
        "command": ["/absolute/path/to/claude"]
      }
    }
  }
}
```

`command`은 `[binary, ...args]`이며 해당 공급자의 기본 시작 명령을 완전히 대체합니다. `which -a claude`으로 실제 경로를 찾으세요. `type -a claude`은 또한 `claude`이 쉘 별명 또는 함수일 뿐이라면 작동하지 않는다는 것을 알려줍니다. Paseo는 바이너리를 직접 실행하므로 그것이 가리키는 경로를 사용합니다. 편집 후 구성을 다시 로드합니다([아래](#i-changed-configjson-but-nothing-happened) 참조).

대체 엔드포인트, 다중 프로필, 사용자 정의 바이너리 및 ACP 에이전트에 대해서는 [사용자 정의 공급자](/docs/custom-providers)를 참조하세요. 에이전트별 설치 링크는 [지원되는 공급자](/docs/supported-providers)를 참조하세요.

## Paseo의 환경이 귀하의 단말기와 다를 수 있는 이유

Paseo가 도구, 에이전트 또는 터미널을 실행하는 모든 곳에서 동일한 불일치가 나타나 매일 사용하는 항목에 대해 `command not found`을 보고합니다.

Dock 또는 Finder에서 **데스크톱 앱**을 열면 OS는 터미널의 `PATH`이 아닌 간단한 환경을 앱에 전달합니다. 이를 보완하기 위해 Paseo는 시작 시 로그인 셸(`$SHELL -i -l -c`)을 한 번 실행하고 환경을 캡처한 다음 이를 데몬과 데몬이 생성하는 모든 것에 전달합니다. 경험 법칙: **새 터미널에서 명령을 실행할 수 있다면 Paseo도 마찬가지입니다.** 그것도 테스트입니다. 새 터미널을 열고 거기에서 시도해 보세요.

터미널(`paseo`)에서 직접 데몬을 시작하면 로그인 셸 단계가 없으며 단순히 해당 터미널의 환경을 상속합니다.

어느 쪽이든 누락된 도구에 대한 수정 사항은 Paseo가 아닌 셸 구성(`.zshrc`, `.zprofile`, …)에 있습니다. 버전 관리자를 통해 설치된 도구(asdf, mise, nvm 등)는 일반적인 위반자이므로 이미 연 로그인 셸 내부뿐만 아니라 깨끗한 로그인 셸을 위해 초기화해야 합니다.

이 로그인 셸 단계는 macOS 및 Linux에서 실행됩니다. Windows에서 Paseo는 실행된 환경을 사용합니다.

## 로그 읽기

- **데스크톱 앱** — 로그인-셸 확인이 여기에 기록됩니다. `[login-shell-env]`을 찾으세요. `applied`는 작동했음을 의미합니다(전후에 `PATH`을 기록합니다). `failed; keeping inherited env`은 `reason`(시간 초과, 셸 구성에서 0이 아닌 종료, 출력 없음 등)을 사용하여 제거된 환경으로 돌아갔다는 것을 의미합니다. 느리거나 오류가 발생하는 `.zshrc`/`.zprofile`이 일반적인 원인입니다.
- **데몬** — `~/.paseo/daemon.log`(사용자 정의 홈을 설정한 경우 `$PASEO_HOME/daemon.log`).

데스크톱 앱 로그 위치:

| 플랫폼 | 경로 |
| -------- | ------------------ |
| macOS | `~/Library/Logs/Paseo/main.log` |
| 리눅스 | `~/.config/Paseo/logs/main.log` |
| 윈도우 | `%APPDATA%\Paseo\logs\main.log` |

## config.json을 변경했지만 아무 일도 일어나지 않았습니다

파일을 편집한 후 다시 로드합니다.

```bash
paseo reload
```

Paseo는 런타임에 안전한 설정을 적용하고 재시작이 필요한 경로를 알려줍니다. 잘못된 JSON이나 스키마 오류가 있으면 아무것도 적용하지 않습니다. 보고된 오류를 수정하고 명령을 다시 실행하세요. 시작 환경 변수나 플래그가 변경된 설정을 제어하면 다시 로드 결과에 별도로 표시됩니다.

다시 로드에서 요청할 때만 `paseo daemon restart`를 실행하세요. 앱에서는 **설정 → 호스트 → 개요**를 열고 **데몬 다시 시작**을 사용합니다. 실행 중인 에이전트는 계속 진행되고 클라이언트는 자동으로 다시 연결됩니다.

## 아직도 막혔나요?

- [사용자 정의 공급자](/docs/custom-providers) — 엔드포인트, 프로필, 바이너리, ACP 에이전트.
- [구성](/docs/configuration) — `config.json`, 환경 변수, 로깅.
- [Paseo가 로그인 셸을 해결하는 방법](https://github.com/getpaseo/paseo/blob/main/packages/desktop/src/login-shell-env.ts) — 셸 환경을 로드하는 정확한 코드입니다.
- [문제 신고](https://github.com/getpaseo/paseo/issues).
