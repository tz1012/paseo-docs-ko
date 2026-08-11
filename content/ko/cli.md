---
title: CLI
description: "Paseo CLI reference: manage agents, workspaces, scripts, schedules, daemons, and permissions from your terminal."
nav: CLI
order: 3
category: Getting started
---

# CLI

Paseo CLI를 사용하면 터미널에서 에이전트를 관리할 수 있습니다. 이는 데몬의 API에 의해 노출되는 것과 동일한 인터페이스이므로 앱에서 수행할 수 있는 모든 작업을 명령줄에서 수행할 수 있습니다.

> **에이전트 오케스트레이션:** 코딩 에이전트에 Paseo CLI를 사용하여 다른 에이전트를 생성하고 관리하도록 지시할 수 있습니다. Paseo는 호출 에이전트를 인식하므로 CLI에서 생성된 작업자는 MCP에서 생성된 작업자와 동일한 작업 영역 및 상위 기본값을 얻습니다.

## 빠른 참조

```bash
paseo run "fix the tests"            # Start an agent
paseo ls                             # List running agents
paseo attach <id>                    # Stream agent output
paseo send <id> "also fix linting"   # Send follow-up task
paseo logs <id>                      # View agent timeline
paseo stop <id>                      # Stop an agent
```

## 에이전트 실행 중

작업으로 새 에이전트를 시작하려면 `paseo run`을 사용하세요.

```bash
paseo run "implement user authentication"
paseo run --provider codex "refactor the API layer"
paseo run --background "run the focused test suite"
paseo run --new-workspace worktree --worktree-mode branch-off --new-branch feature/x --base origin/main "implement feature X"
paseo run --workspace <workspace-id> "review the current diff"
paseo run --output-schema schema.json "extract release notes"
paseo run --output-schema '{"type":"object","properties":{"summary":{"type":"string"}},"required":["summary"]}' "summarize release notes"
```

휴먼 셸에서 `paseo run`은 현재 디렉터리에 대한 새 로컬 작업 공간을 만듭니다. 기존 작업 영역에 에이전트를 추가하려면 `--workspace <id>`을 사용하고, 실행을 위한 별도의 작업 영역을 명시적으로 생성하려면 `--new-workspace local|worktree`을 사용하세요.

작업 트리 생성에는 `--worktree-mode branch-off|checkout-branch|checkout-pr`과 일치하는 `--new-branch`/`--base`, `--branch` 또는 `--pr-number`/`--forge` 옵션이 허용됩니다. 관리되는 디렉터리 슬러그를 선택하려면 `--worktree-slug`을 사용하세요.

기존 Paseo 에이전트가 동일한 명령을 실행하면 Paseo는 `PASEO_AGENT_ID`을 통해 이를 인식합니다. 명시적인 배치가 없으면 새 에이전트는 동일한 작업 영역에서 하위 에이전트가 됩니다. `--workspace`은 상위를 변경하지 않고 해당 하위 에이전트를 다른 곳에 배치할 수 있습니다.

일치하는 JSON 출력만 반환하려면 `--output-schema`을 사용하세요. 스키마 파일 경로 또는 인라인 JSON 스키마 개체를 전달할 수 있습니다. 이 모드는 `--background`과 함께 사용할 수 없습니다.

기본적으로 `paseo run`은 완료될 때까지 기다립니다. 에이전트가 계속 실행되는 동안 즉시 반환하려면 `--background`을 사용하세요.

## 작업공간

에이전트를 시작하기 전에 파일을 준비하려면 독립적으로 작업공간을 만드세요.

```bash
paseo workspace create --isolation local --path ~/dev/my-app --title main

paseo workspace create \
  --isolation worktree \
  --path ~/dev/my-app \
  --mode branch-off \
  --new-branch feature/auth \
  --worktree-slug feature-auth \
  --base origin/main

paseo workspace create \
  --isolation worktree \
  --path ~/dev/my-app \
  --mode checkout-branch \
  --branch feature/existing \
  --worktree-slug existing-copy

paseo workspace create \
  --isolation worktree \
  --path ~/dev/my-app \
  --mode checkout-pr \
  --pr-number 2186
```

그런 다음 이를 나열, 사용 또는 보관하십시오.

```bash
paseo workspace ls
paseo run --workspace <workspace-id> "implement authentication"
paseo workspace archive <workspace-id>
```

Paseo가 소스 체크아웃에서 위조품을 추론할 수 없는 경우 PR 체크아웃에 `--forge <name>`을 추가하세요. 설정 후크 및 서비스는 [Git 작업 트리](/docs/worktrees)를 참조하세요.

## 작업공간 스크립트

작업공간의 `paseo.json`에 구성된 스크립트를 나열하고 시작하고 중지합니다.

```bash
paseo script ls
paseo script start web
paseo script stop web
```

기본적으로 Paseo는 현재 디렉토리가 있는 작업공간을 선택합니다. `--cwd <path>`을 전달하여 다른 디렉터리를 선택하거나, 디렉터리에 여러 작업 공간이 있는 경우 `--workspace <workspace-id>`을 전달합니다. 이러한 명령은 `--host` 및 `--json`과 같은 표준 출력 옵션도 허용합니다.

출력에는 각 스크립트의 수명 주기와 감독되는 터미널 ID가 포함됩니다. 서비스에는 할당된 포트, 프록시 URL 및 상태도 포함됩니다. `paseo.json` 구성은 [Git 작업 트리](/docs/worktrees#scripts-and-services)를 참조하세요.

## 리스팅 에이전트

```bash
paseo ls                    # Running agents in current directory
paseo ls -a                 # Include completed/stopped agents
paseo ls -g                 # All directories
paseo ls -a -g --json       # Full list as JSON
```

## 스트리밍 출력

에이전트의 출력을 실시간으로 스트리밍하려면 `paseo attach`을 사용하세요.

```bash
paseo attach abc123   # Attach to agent (Ctrl+C to detach)
```

에이전트 ID는 단축할 수 있으며, `abc`이 명확하면 작동합니다.

## 메시지 보내기

실행 중이거나 유휴 상태인 에이전트에 후속 작업을 보냅니다.

```bash
paseo send <id> "now run the tests"
paseo send <id> --image screenshot.png "what's wrong here?"
paseo send <id> --no-wait "queue this task"
```

## 로그 보기

```bash
paseo logs <id>                  # Full timeline
paseo logs <id> -f               # Follow (streaming)
paseo logs <id> --tail 10        # Last 10 entries
paseo logs <id> --filter tools   # Only tool calls
```

## 상담원을 기다리는 중

에이전트가 현재 작업을 완료할 때까지 차단합니다.

```bash
paseo wait <id>
paseo wait <id> --timeout 60   # 60 second timeout
```

스크립트에서 또는 한 에이전트가 다른 에이전트를 기다려야 할 때 유용합니다.

## 일정

크론 일정에 따라 에이전트를 실행합니다. CLI는 또한 간단한 케이던스 사전 설정을 허용하고 이를 cron으로 컴파일합니다. 전체 참조는 [CLI의 일정](/docs/schedules-cli)을 참조하세요.

```bash
paseo schedule create --every 30m --cwd ~/dev/my-app "Continue the refactor and leave a note."
paseo schedule ls
paseo schedule pause <id>
```

## 권한

에이전트는 특정 작업에 대한 권한을 요청할 수 있습니다. CLI에서 다음을 관리하세요.

```bash
paseo permit ls                # List pending requests
paseo permit allow <id>        # Allow all pending for agent
paseo permit deny <id> --all   # Deny all pending
```

## 에이전트 모드

에이전트의 작동 모드를 변경합니다(공급업체별).

```bash
paseo agent mode <id> --list   # Show available modes
paseo agent mode <id> bypass   # Set bypass mode
paseo agent mode <id> plan     # Set plan mode
paseo agent detach <id>        # Make a subagent top-level
```

분리는 생성 플래그가 아닌 명시적인 수명 주기 작업입니다. 에이전트는 계속 실행됩니다. 상위와의 관계만 변경됩니다.

## 데몬 관리

```bash
paseo daemon start             # Start the daemon
paseo daemon start --web-ui    # Start and serve the bundled web UI
paseo daemon status            # Check status
paseo daemon stop              # Stop the daemon
```

여러 개의 격리된 데몬 인스턴스를 실행하려면 `PASEO_HOME`을 사용하세요.

## 허브

```bash
paseo hub login [url]          # Approve and store organization-scoped CLI access
paseo hub connect [url]        # Enroll this daemon using CLI access
paseo hub projects             # List projects in the authenticated organization
paseo hub status               # Show the current Hub relationship
paseo hub disconnect           # End it
paseo hub deploy -p <project>  # Discover, validate, and activate a Hub bundle
paseo hub deploy -p <project> --dry-run # Validate without activating
paseo hub logout               # Remove the active stored CLI login
```

프로젝트 루트에서 배포를 실행하세요. `.paseo/hub.yml`, 모든 직접 `.paseo/workflows/*.yml` 파일을 읽고 결정적 경로 순서로 참조된 `.paseo/workflows/partials/*` 파일을 읽습니다. 상위 항목을 검색하거나, 대체 리소스 경로를 허용하거나, 번들을 모놀리식 YAML로 평면화하지 않습니다.

`-p, --project <slug>`을 전달하여 대상 프로젝트를 선택하세요. `--dry-run`은 개정판을 기록하거나 활성화하지 않고 동일한 검색 및 서버 유효성 검사를 수행합니다. 두 출력 모두 해결된 허브, 프로젝트 및 검색된 워크플로 개수를 포함합니다.

`login`은 허브 승인 페이지를 열고 `PASEO_HOME` 아래에 내구성 있는 조직 범위의 CLI 자격 증명을 저장합니다. 저장된 로그인은 `connect`이 생성한 데몬 관계와 별개입니다. 대화형 로그아웃은 동일 출처 데몬 관계를 확인하고 로그인을 삭제하기 전에 연결을 끊을지 여부를 묻습니다. 거부하면 로그인만 제거됩니다. JSON 및 비대화형 로그아웃은 암시적으로 메시지를 표시하거나 연결을 끊지 않습니다. `--disconnect-daemon`은 명시적 자동화 경로이고 `--force`은 해당 데몬 연결 해제에 적용됩니다. 요청된 연결 해제가 실패하면 로그인이 유지됩니다.

모든 명령은 허브 또는 데몬이 작동하기 전에 대상을 확인하고 정규화합니다. 오리진 우선순위는 명시적 명령 오리진 또는 `--hub`, `PASEO_HUB_URL`, 활성 저장된 로그인 오리진, 호스팅된 기본 `https://hub.paseo.sh` 순입니다. 호스팅된 기본값은 활성 로그인을 재정의하지 않습니다. 자격 증명 우선 순위는 `--api-key <secret>`, `PASEO_HUB_API_KEY`, 정확한 확인 원본에 대한 저장된 로그인 순입니다. 저장된 자격 증명은 다른 원본으로 전송되지 않습니다. 플래그나 환경을 통해 전달된 API 키는 저장되지 않습니다.

인간의 출력은 각 작업 전에 해결된 목적지를 보고합니다. JSON 출력은 stdout을 기계에서 읽을 수 있는 상태로 유지하고 정규화된 Hub 원본을 포함합니다. 번들 진단은 구성 내용이나 자격 증명을 인쇄하지 않고도 경로를 식별합니다.

[허브의 데몬](/docs/hub/daemons), [허브 구성](/docs/hub/configuration) 및 [허브 공개 API](/docs/hub/api)를 참조하세요.

## 원격 데몬에 연결

`--host`은 로컬 대상(`host:port`, Unix 소켓 또는 Windows 파이프) 또는 페어링 제안 URL(모바일 앱이 QR 페어링에 사용하는 것과 동일한 `https://app.paseo.sh/#offer=...` 링크)을 허용합니다. 제안 URL을 사용하면 CLI가 종단 간 암호화를 사용하는 Paseo 릴레이를 통해 연결되므로 네트워크에 노출하지 않고도 다른 시스템에서 데몬을 구동할 수 있습니다.

제어하려는 데몬으로부터 제안 URL을 얻으세요:

```bash
paseo daemon pair          # asks before enabling relay, then prints the QR and link
paseo daemon pair --relay  # enables relay without prompting
paseo daemon pair --json   # structured output; never prompts
```

새로운 설치를 위해 릴레이가 꺼졌습니다. 비대화형 또는 JSON 모드에서 비활성화된 릴레이는 `RELAY_DISABLED` 오류를 반환합니다. 명시적인 동의를 제공하려면 `--relay`을 전달하세요. 릴레이 페어링은 종단 간 암호화됩니다. [보안](/docs/security)을 참조하세요.

어디서나 사용하세요:

```bash
paseo ls --host 'https://app.paseo.sh/#offer=eyJ2IjoyLC...'
paseo run --host "$OFFER_URL" "fix the failing tests"
```

모든 명령에 `--host`을 전달하는 대신 `PASEO_HOST`을 통해 한 번 설정할 수도 있습니다.

## 다중 에이전트 워크플로

CLI는 에이전트 자체에서 사용하도록 설계되었습니다. 병렬 작업을 위해 하위 에이전트를 생성하도록 에이전트에 지시할 수 있습니다.

```bash
# Agent A spawns Agent B and waits for it
agent_id=$(paseo run --background --quiet --title api-agent "implement the API")
paseo wait "$agent_id"
paseo logs "$agent_id" --tail 5
```

에이전트 A의 ID가 환경에 존재하므로 `--workspace`을 지정하지 않는 한 에이전트 B는 동일한 작업 영역에 하위 에이전트로 생성됩니다.

간단한 구현 + 루프 확인:

```bash
# Requires jq
while true; do
  paseo run --provider codex "make the tests pass" >/dev/null

  verdict=$(paseo run --provider claude --output-schema '{"type":"object","properties":{"criteria_met":{"type":"boolean"}},"required":["criteria_met"],"additionalProperties":false}' "ensure tests all pass")
  if echo "$verdict" | jq -e '.criteria_met == true' >/dev/null; then
    echo "criteria met"
    break
  fi
done
```

이 패턴을 사용하면 계층적 작업 분해가 가능하며, 수석 에이전트는 작업을 세분화하고 전문가에게 위임하고 결과를 종합할 수 있습니다.

## 출력 형식

대부분의 명령은 스크립팅을 위한 여러 출력 형식을 지원합니다.

```bash
paseo ls --json                # JSON output
paseo ls --format yaml         # YAML output
paseo ls -q                    # IDs only (quiet)
```

## 글로벌 옵션

- `--host <target>`, 다른 데몬(`host:port`, Unix 소켓 또는 릴레이의 경우 `https://app.paseo.sh/#offer=...`)에 연결합니다. [원격 데몬에 연결](#connecting-to-a-remote-daemon)을 참조하세요.
- `--json`, JSON 출력
- `-q, --quiet`, 최소 출력
- `--no-color`, 색상 비활성화