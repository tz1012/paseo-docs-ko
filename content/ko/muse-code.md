---
title: Muse Code
description: Install and configure Muse Code for Paseo.
nav: Muse Code
order: 25
category: Providers
---

# Muse Code

기존 Muse 설치 및 자격 증명을 사용해 Meta의 터미널 코딩 에이전트를 Paseo에서 실행합니다.

## 시작하기

Paseo 데몬이 실행 중인 머신에 Muse Code를 설치하세요.

```bash
curl -fsSL https://dev.meta.ai/install.sh | sh
muse login
```

Muse 1.3.0 이상을 사용하세요. 이 통합은 1.4.1에서 검증했습니다. API 액세스에는 로그인 대신 데몬의 환경에 `META_API_KEY`를 설정하세요. [공급자 환경 재정의](/docs/custom-providers)를 참조하세요.

Paseo에서 **Muse Code**를 선택한 뒤 모델, 승인 모드, 추론 강도를 선택하세요. Paseo는 `muse serve`를 실행하고 Muse Session Protocol(MSP)로 통신합니다. 사용 가능한 모델은 Muse 구성에서 결정됩니다.

## 공급자 옵션

Paseo는 샌드박스를 끄고(`--disable-sandbox`) 작업공간 신뢰를 켠 상태로(`--trust-workspace`) Muse를 시작합니다. Muse는 npm 캐시를 사용해 패키지를 설치하고 프로젝트 규칙, 스킬, 구성을 불러올 수 있습니다.

데몬 머신의 `config.json`에서 `agents.providers.muse.options` 아래에 모든 Muse 에이전트의 기본값을 설정하세요.

```json
{
  "agents": {
    "providers": {
      "muse": {
        "options": {
          "sandbox": { "enabled": true, "network": "proxy-only" },
          "trustWorkspace": false
        }
      }
    }
  }
}
```

에이전트를 만들 때 에이전트별 `providerOptions`를 제공할 수도 있습니다. 데몬은 공급자 기본값과 에이전트별 옵션을 병합한 효과적 `providerOptions`를 Muse에 전달합니다. 구성 및 생성 방법은 [공급자 옵션](/docs/sdk/provider-options)을 참조하세요.

에이전트별 옵션은 에이전트와 함께 저장되며 새로 고침하거나 다시 시작할 때 Muse 호스트가 열리면 다시 적용됩니다. 잘못된 값과 알 수 없는 키는 `providerOptions` 오류와 함께 세션 생성에 실패합니다.

| 옵션 | 기본값 | 효과 |
| ----------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox.enabled` | `false` | Muse의 파일 시스템 및 네트워크 샌드박스를 활성화합니다. 읽기 전용 홈 디렉터리 때문에 npm은 기본 캐시에 쓸 수 없습니다. |
| `sandbox.network` | `"proxy-only"` | 샌드박스 네트워크 정책: `"proxy-only"`, `"restricted"`, `"enabled"`. 샌드박스를 끄면 Muse는 전체 네트워크 액세스를 허용합니다. |
| `trustWorkspace` | `true` | Muse가 프로젝트 규칙, 스킬, 구성을 불러오도록 합니다. |

승인 모드는 도구 결정을 별도로 제어합니다. **Default**, **Ask**, **Strict**, **Full access**가 있습니다. Full access는 권한 상승 승인 단계를 자동으로 허용하며 효과적 공급자 옵션을 유지합니다. 스킬은 `/compact`와 함께 슬래시 명령 메뉴에 표시됩니다.

## Muse 1.4.1의 제한 사항

- **Paseo MCP 도구를 사용할 수 없습니다.** Muse는 MCP 호출을 일치시키기 전에 반환된 도구 네임스페이스를 삭제합니다. Muse 에이전트가 Paseo 도구를 사용하려면 이 upstream 문제가 Muse에서 해결되어야 합니다.
- **컴팩션에는 모델 컨텍스트 한도가 필요합니다.** 엔드포인트가 한도를 보고하지 않는 경우 선택한 모델에 대해 Muse의 `context_compaction.provider_context_limit_tokens`를 구성하세요.
- **사용량 창은 Muse가 보고할 때만 표시됩니다.** `usage/read` 응답이 비어 있으면 구독 사용량을 표시할 수 없습니다.
- **네이티브 하위 에이전트에는 Muse의 실험적 SDK 플래그가 필요할 수 있습니다.** 네이티브 하위 에이전트 도구가 없다면 공급자 환경에 `MUSE_EXPERIMENTAL_SDK_ENABLED=on`을 설정하세요. 연결된 하위 세션은 Muse가 `childSessionId`를 제공할 때만 표시됩니다.

`agents.providers.muse` 아래에서 바이너리나 환경을 재정의하려면 [사용자 정의 공급자](/docs/custom-providers)를 참조하세요.
