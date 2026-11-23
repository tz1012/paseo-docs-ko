---
title: Muse Code
description: Run Meta's Muse Code in Paseo with your installed muse CLI.
nav: Muse Code
order: 29
category: Providers
---

# Muse Code

Paseo는 Muse 세션 프로토콜(MSP)을 통해 설치된 `muse` CLI(`muse serve`)를 통해 Meta의 Muse 코드를 실행합니다. 기존 Muse 자격 증명 및 구성을 사용합니다.

## 시작하기

Muse Code는 Paseo에 내장되어 있으며 기본적으로 활성화되어 있습니다. Muse 1.3.0 이상(1.4.1에서 확인)을 사용하십시오.

1. 데몬 호스트에 Muse Code를 설치합니다.

   ```bash
   curl -fsSL https://dev.meta.ai/install.sh | sh
   ```

2. `muse login`으로 로그인하거나 데몬 환경에서 `META_API_KEY`을 설정합니다.
3. Paseo에서 에이전트 시작 시 **Muse Code**를 선택합니다.

Muse 구성에 따라 사용 가능한 모델이 결정됩니다. `muse`이 데몬 PATH 외부에 있거나 사용자 정의 환경 변수가 필요한 경우 [사용자 정의 공급자](/docs/custom-providers)를 참조하고 `agents.providers.muse`을 구성하세요.

## 모드 및 스킬

승인 모드는 공급자 옵션과 별도로 도구 결정을 제어합니다. **기본값**은 기본 모드입니다.

- 사용 가능한 모드는 **기본값**, **질문**, **엄격** 및 **전체 액세스**입니다.
- **전체 액세스**는 에스컬레이션된 승인 단계를 자동으로 승인하고 효과적인 제공업체 옵션을 유지합니다.
- 뮤즈 스킬은 `/compact`과 함께 슬래시 명령 메뉴에 나타납니다.

## 공급자 옵션

기본적으로 Paseo는 샌드박스가 비활성화되고(`--disable-sandbox`) 작업 공간 신뢰가 활성화된 상태(`--trust-workspace`)로 Muse를 시작합니다. Muse는 npm 캐시를 사용하여 패키지를 설치하고 프로젝트 규칙, 기술 및 구성을 로드할 수 있습니다.

| 옵션 | 기본값 | 효과 |
| ----------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox.enabled` | `false` | Muse의 파일 시스템 및 네트워크 샌드박스를 활성화합니다. 읽기 전용 홈 디렉터리 때문에 npm은 기본 캐시에 쓸 수 없습니다. |
| `sandbox.network` | `"proxy-only"` | 샌드박스 네트워크 정책: `"proxy-only"`, `"restricted"`, `"enabled"`. 샌드박스를 끄면 Muse는 전체 네트워크 액세스를 허용합니다. |
| `trustWorkspace` | `true` | Muse가 프로젝트 규칙, 스킬, 구성을 불러오도록 합니다. |

모든 Muse 에이전트의 기본값을 변경하려면 데몬 호스트의 `~/.paseo/config.json`에서 `agents.providers.muse.options`을 구성합니다.

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

에이전트를 생성할 때 에이전트별 `providerOptions`을 전달할 수도 있습니다. 데몬은 에이전트별 옵션을 저장하고 세션이 열릴 때 이를 현재 공급자 기본값과 병합합니다. 잘못된 값 또는 알 수 없는 키가 `providerOptions` 오류로 인해 세션 생성에 실패합니다. 자세한 내용은 [제공업체 옵션](/docs/sdk/provider-options)을 참조하세요.

## Muse 1.4.1의 제한 사항

- Paseo Muse가 MCP 호출을 일치시키기 전에 반환된 도구 네임스페이스를 삭제하므로 MCP 도구를 사용할 수 없습니다. Muse 에이전트가 Paseo 도구를 사용할 수 있으려면 먼저 Muse에서 이 업스트림 문제를 해결해야 합니다.
- 압축에는 모델 컨텍스트 제한이 필요합니다. 엔드포인트가 보고하지 않는 경우 Muse에서 선택한 모델에 대해 `context_compaction.provider_context_limit_tokens`을 구성합니다.
- 사용량 창은 Muse가 보고할 때만 나타납니다. 빈 `usage/read` 응답으로 인해 구독을 사용할 수 없게 됩니다.
- 기본 하위 에이전트 도구가 누락된 경우 공급자 환경에서 `MUSE_EXPERIMENTAL_SDK_ENABLED=on`을 설정합니다. 연결된 하위 세션은 Muse가 `childSessionId`을 제공하는 경우에만 나타납니다.
