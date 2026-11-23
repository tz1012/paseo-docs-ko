---
title: Antigravity
description: Run Antigravity in Paseo through the official agy CLI over ACP.
nav: Antigravity
order: 23
category: Providers
---

# Antigravity

Paseo는 설치된 `agy` CLI에서 공식 에이전트 클라이언트 프로토콜(`agy acp`)을 통해 Antigravity를 실행합니다. Paseo는 Google 엔드포인트를 직접 호출하는 대신 기존 로그인으로 로컬 CLI를 구동합니다.

## 시작하기

Antigravity는 Paseo에 내장되어 있으며 기본적으로 활성화되어 있습니다. 플러그인이나 추가 구성이 필요하지 않습니다.

1. 데몬 호스트에 [Antgravity CLI](https://antigravity.google/docs/getting-started?tab=cli)(`agy`) 버전 1.5.0 이상을 설치합니다.
2. 터미널에서 `agy`를 실행하고 로그인합니다.
3. Paseo에서 에이전트를 시작할 때 **Antigravity**을 선택합니다.

`agy`가 데몬 PATH 외부에 있는 경우 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하고 인수에 `acp` 및 `--disable-telemetry`을 유지하세요.

## 권한

Paseo는 `agy acp`에 연결하고 CLI가 제공하는 권한 모드를 보여줍니다. **전체 액세스**가 기본 모드입니다.

| 모드 | 효과 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 전체 액세스 | Paseo는 단일 **한 번 허용** 작업을 제공하는 도구 요청을 승인합니다. Antigravity는 여전히 ​​자체 도구 정책을 시행합니다. |
| 기본값 | Paseo는 Antigravity 정책에서 승인을 요구하는 편집 및 명령에 대한 승인 요청을 표시합니다.                   |
| 수정사항 수락 | Antigravity는 작업 영역 편집을 자동으로 승인하고 승인이 필요한 명령에 대해 계속 묻습니다.                 |
| 계획 | Antigravity는 행동하기 전에 계획을 세웁니다.                                                                                       |

예약된 실행은 각 도구 호출을 승인하는 사람 없이 **전체 액세스**를 사용할 수 있습니다. **전체 액세스**로 전환하거나 전환하기 전에 현재 턴을 완료하거나 중지하세요.

## 세션과 도구

- Paseo는 CLI 세션을 가져오고 채팅을 다시 열 때 대화 기록을 복원할 수 있습니다.
- Antigravity는 슬래시 명령 및 기술을 게시하고 이미지 첨부 파일을 허용하며 에이전트에 대해 구성된 MCP 서버를 수신합니다.
- 현재 턴이 끝난 후 후속 조치를 보내거나 방향을 변경하기 위해 턴을 중단합니다.

업그레이드 후 이전 Hub 트리거는 Antigravity 모델을 사용할 수 없다고 보고할 수 있습니다. Hub에서 트리거를 열고 모델과 사고 수준을 다시 선택하세요.

## 문제 해결

Paseo에서 **설정 → 공급자 → Antigravity**을 열고 **진단 보고서**를 선택합니다. 보고서에는 Paseo가 실행되는 명령, 데몬이 `agy`를 발견한 위치, `agy` 버전, 모델 수, `agy`가 SSH 세션에서 실행되는지 여부가 표시됩니다.

### 새 모델이 누락되었습니다

Paseo는 데몬이 시작되고 **새로 고침**을 선택할 때 `agy`에서 모델 목록을 읽습니다. 그 후 계정에 새 모델이 추가되면 **설정 → 공급자 → Antigravity**을 열고 **새로 고침**을 선택하세요.

### Paseo는 `agy models`과 다른 모델을 보여줍니다.

`agy`는 한 컴퓨터에 두 개의 로그인을 유지합니다. SSH 세션에서 `agy`는 토큰 파일에서 로그인을 읽습니다. SSH 세션 외부에서 `agy`는 운영 체제의 키링에서 로그인을 읽습니다. 두 로그인에서 서로 다른 Google 계정을 사용하는 경우 단말기와 Paseo는 서로 다른 모델을 표시합니다. [Antigravity CLI 문제 1336](https://github.com/google-antigravity/antigravity-cli/issues/1336)은 이 동작을 추적합니다.

Paseo는 데몬 환경에서 `agy`를 실행합니다. SSH 세션에서 시작한 데몬은 SSH 세션에서 `agy`를 실행합니다. 데스크톱 세션이나 서비스 관리자가 시작한 데몬은 외부에서 `agy`를 실행합니다. 진단 보고서의 `SSH session` 행에는 어느 것이 적용되는지 표시됩니다.

행에 `SSH session: no`이 표시되면 데몬 호스트의 터미널에서 다음 단계를 수행합니다.

1. Paseo가 사용하는 로그인 모델을 나열합니다.

   ```bash
   env -u SSH_CONNECTION -u SSH_CLIENT -u SSH_TTY agy models
   ```

2. 목록이 예상한 목록이 아닌 경우 동일한 로그인으로 `agy`를 시작합니다.

   ```bash
   env -u SSH_CONNECTION -u SSH_CLIENT -u SSH_TTY agy
   ```

3. `/logout`을 실행한 다음, 계획이 있는 계정으로 로그인하세요.
4. Paseo에서 **설정 → 공급자 → Antigravity**을 열고 **새로 고침**을 선택합니다.

행에 `SSH session: yes`이 표시되면 SSH 세션이 아닌 터미널에서 동일한 단계를 수행합니다. 1단계에서는 `SSH_CONNECTION=1 agy models`을 사용하고 2단계에서는 `SSH_CONNECTION=1 agy`을 사용합니다.

두 로그인을 모두 유지하고 Paseo가 SSH 터미널의 로그인을 사용하도록 하려면 `~/.paseo/config.json`에서 공급자에 대한 SSH 변수를 설정하세요.

```json
{
  "agents": {
    "providers": {
      "antigravity": {
        "env": { "SSH_CONNECTION": "paseo" }
      }
    }
  }
}
```

`paseo reload`을 실행한 다음 **새로 고침**을 선택합니다. 그러면 행에 `SSH session: yes (SSH_CONNECTION)`이 표시됩니다.
