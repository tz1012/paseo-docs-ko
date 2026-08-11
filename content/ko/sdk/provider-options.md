---
title: Provider options
description: Sandboxing, permissions, and network rules for Codex, Claude, and OpenCode agents created from the SDK.
nav: Provider options
order: 55
category: TypeScript SDK
---

# 제공자 옵션

`config.options`은 설정을 공급자 CLI에 직접 전달합니다. Paseo는 에이전트를 시작하기 전에 해당 공급자의 엄격한 스키마에 대해 개체의 유효성을 검사하므로 알 수 없거나 철자가 틀린 키는 자동으로 아무것도 하지 않는 대신 에이전트 생성에 실패합니다.

옵션은 공급자 고유입니다. Codex 샌드박스 키는 Claude 샌드박스 키가 아닙니다. Codex, Claude 및 OpenCode는 옵션을 허용합니다. 다른 모든 공급자는 비어 있지 않은 `options`을 거부합니다.

공급자 옵션은 호스트 경계가 아닙니다. 이는 머신에서 사용자로 실행되는 에이전트 CLI를 제한합니다. 신뢰할 수 없는 작업의 경우 컨테이너나 별도의 머신에서 데몬을 실행하세요. [보안](/docs/security)을 참조하세요.

## 코덱스

쓰기를 하나의 디렉터리로 제한하고, 네트워크 액세스를 차단하고, 승인 메시지를 중지하여 무인 실행이 이루어지도록 합니다.

```ts
import { createPaseoClient } from "@getpaseo/client";

const client = createPaseoClient({ url: "ws://127.0.0.1:6767/ws" });
await client.connect();

const agent = await client.agents.create({
  config: {
    provider: "codex/gpt-5.5",
    options: {
      approval_policy: "never",
      sandbox_mode: "workspace-write",
      sandbox_workspace_write: {
        writable_roots: ["/Users/me/dev/storefront"],
        network_access: false,
        exclude_slash_tmp: true,
      },
      web_search: "disabled",
    },
  },
  cwd: "/Users/me/dev/storefront",
  prompt: "Fix the failing checkout test.",
});

const result = await agent.waitForFinish();
console.log(result.status, result.lastMessage);

await client.close();
```

| 옵션 | 가치 |
| ------------ | --------------------------------------------------------------------------------- |
| `approval_policy` | `untrusted`, `on-request`, `never` 또는 `{ granular: { … } }` |
| `sandbox_mode` | `read-only`, `workspace-write`, `danger-full-access` |
| `sandbox_workspace_write` | `writable_roots`, `network_access`, `exclude_slash_tmp`, `exclude_tmpdir_env_var` |
| `web_search` | `disabled`, `cached`, `indexed`, `live` |
| `features` | `multi_agent_v2`, `network_proxy`(부울 또는 프록시/도메인 정책 개체) |

`approval_policy: "never"`은 프롬프트만 제거합니다. 에이전트가 터치할 수 있는 항목은 `sandbox_mode`입니다. 샌드박스 모드 없이 `never`을 설정하면 무인 에이전트에 전체 액세스 권한이 부여됩니다.

## 클로드

Claude의 자체 샌드박스를 활성화하고, 프로젝트에 대한 쓰기를 제한하고, 자격 증명 디렉터리 읽기를 거부하고, 두 개의 도메인만 허용합니다.

```ts
import { createPaseoClient } from "@getpaseo/client";

const client = createPaseoClient({ url: "ws://127.0.0.1:6767/ws" });
await client.connect();

const agent = await client.agents.create({
  config: {
    provider: "claude/claude-sonnet-5",
    options: {
      disallowedTools: ["WebFetch"],
      sandbox: {
        enabled: true,
        failIfUnavailable: true,
        allowUnsandboxedCommands: false,
        filesystem: {
          allowWrite: ["/Users/me/dev/storefront"],
          denyRead: ["/Users/me/.ssh", "/Users/me/.aws"],
        },
        network: {
          allowedDomains: ["registry.npmjs.org", "github.com"],
          strictAllowlist: true,
        },
      },
    },
  },
  cwd: "/Users/me/dev/storefront",
  prompt: "Install dependencies and run the focused test.",
});

const result = await agent.waitForFinish();
console.log(result.status, result.lastMessage);

await client.close();
```

| 옵션 | 가치 |
| ---------- | ----------------------------------------------------------------------------- |
| `allowedTools` | 에이전트가 묻지 않고 사용할 수 있는 도구 이름 |
| `disallowedTools` | 에이전트가 절대 사용할 수 없는 도구 이름 |
| `additionalDirectories` | 에이전트가 액세스할 수 있는 추가 디렉터리 |
| `sandbox` | `enabled`, `failIfUnavailable`, `allowUnsandboxedCommands`, `excludedCommands`, `filesystem`, `network` |
| `settings` | `permissions`(`allow`/`ask`/`deny` 규칙 목록) 및 중첩된 `sandbox` |

`failIfUnavailable: true`은 샌드박스를 설정할 수 없을 때 에이전트 시작을 실패하게 만듭니다. 그대로 두면 Claude가 샌드박스 처리되지 않은 상태로 실행됩니다.

`sandbox.filesystem`은 `allowWrite`, `denyWrite`, `allowRead` 및 `denyRead`을 취합니다. `sandbox.network`은 `allowedDomains`, `deniedDomains`, `strictAllowlist` 및 프록시 설정을 사용합니다.

## 오픈코드

읽기 및 편집을 허용하고, 프로젝트 외부에 도달하는 모든 것을 거부하고, 패턴별로 셸 명령을 게이트합니다.

```ts
import { createPaseoClient } from "@getpaseo/client";

const client = createPaseoClient({ url: "ws://127.0.0.1:6767/ws" });
await client.connect();

const agent = await client.agents.create({
  config: {
    provider: "opencode/opencode/gpt-5.5",
    options: {
      permission: {
        read: "allow",
        edit: "allow",
        webfetch: "deny",
        external_directory: "deny",
        bash: {
          "git status": "allow",
          "git diff*": "allow",
          "git push*": "deny",
          "*": "ask",
        },
      },
    },
  },
  cwd: "/Users/me/dev/storefront",
  prompt: "Implement the requested change and show me the diff.",
});

const result = await agent.waitForFinish();
console.log(result.status, result.lastMessage);

await client.close();
```

모든 권한은 `ask`, `allow` 또는 `deny`입니다. 대상을 취하는 도구 — `read`, `edit`, `glob`, `grep`, `list`, `bash`, `task`, `external_directory`, `repo_clone`, `repo_overview`, `lsp`, `skill` — 또한 나중 키가 대체 역할을 하는 패턴 맵을 허용합니다. 대상이 없는 도구 — `todowrite`, `question`, `webfetch`, `websearch`, `codesearch`, `doom_loop` — 단순한 조치를 취합니다.

`permission: "deny"` 문자열은 모든 항목에 동시에 적용됩니다.

`ask`은 Paseo의 권한 요청을 확인하고 `waitForFinish()`은 보류 중인 동안 `permission`을 반환합니다. 무인 실행에는 `allow` 및 `deny`을 사용하세요. 보류 중인 요청에 응답하려면 [이벤트](/docs/sdk/events)를 참조하세요.

## 모드 및 옵션

`modeId`은 공급자의 게시 목록에서 Paseo 모드를 선택합니다. 이 모드는 데몬이 앱에 표시하고 [공급자 검색](/docs/sdk/providers)을 통해 보고합니다. `options`은 공급자 자체 구성입니다. 이는 별도의 컨트롤이며 다음을 모두 설정할 수 있습니다.

```ts
config: {
  provider: "codex/gpt-5.5",
  modeId: "full-access",
  options: {
    approval_policy: "never",
    sandbox_mode: "read-only",
  },
}
```

둘이 겹치는 경우 `options`이 승리합니다. 위의 Codex는 `full-access`이 더 많은 권한을 부여하더라도 읽기 전용으로 실행됩니다.