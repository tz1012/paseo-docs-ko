---
title: Hub FAQ
description: Common questions about triggers, providers, integrations, daemons, and replies in Paseo Hub.
nav: FAQ
order: 84
category: Hub
---

# 허브 FAQ

## Paseo를 사용하려면 허브가 필요한가요?

아니요. Paseo는 Hub 없이 컴퓨터에서 에이전트를 실행합니다. Hub는 데몬 위에 이벤트 트리거, 반복 일정, 인바운드 웹후크, 공유 실행 기록 및 팀 액세스를 추가합니다.

## 어떤 에이전트 공급자가 Hub를 실행할 수 있나요?

Hub는 Claude Code, Codex, OpenCode, Pi 및 사용자 정의 또는 플러그인 공급자를 포함하여 연결된 Paseo 데몬에 구성된 모든 공급자를 실행합니다. 트리거를 생성하거나 편집할 때 Hub는 해당 데몬에서 사용 가능한 공급자, 모델, 실행 모드 및 사고 옵션을 쿼리합니다.

## 트리거는 어디에 있나요?

Hub 대시보드의 **트리거**에서 직접 트리거를 생성 및 편집하거나 이를 저장소에 자체 포함된 `.paseo/triggers/*.yml` 파일로 유지하고 `paseo hub deploy`을 사용하여 배포할 수 있습니다. 두 경로 모두 동일한 YAML 스키마와 유효성 검사를 사용합니다.

## 한 조직이 여러 GitHub, Linear, Slack 또는 Discord 작업 공간을 연결할 수 있나요?

예. 통합은 **통합** 아래의 조직에 속하며, 연결된 각 작업 영역, 서버 또는 GitHub 설치는 자체 슬러그를 갖습니다. 하나의 특정 통합을 대상으로 하려면 트리거 이벤트에 `connection`을 설정하세요.

## 누가 에이전트를 트리거할 수 있나요?

GitHub, Slack 및 Discord 트리거는 대시보드가 ​​**대상 → 모든 사람**에 대해 저장하는 값인 `from_users: ["*"]`을 허용합니다. 실행을 트리거할 수 있는 사람을 제한하려면 `from_users`에 허용된 로그인 또는 사용자 ID를 나열하세요.

Linear 댓글 및 할당의 경우 **Everyone**은 일치하는 사용자가 없습니다. **특정 인물**을 선택하고 **사용자 ID**에 허용된 Linear 사용자 UUID를 입력합니다. [트리거 필터](/docs/hub/triggers#filters)를 참조하세요.

`linear.issue_entered_scope`은 `filters.project`이 필요하며 `from_users`을 생략할 수 있습니다. 인바운드 웹후크는 Bearer 비밀(`whsec_...`)을 사용하여 호출자를 인증하고 Hub 자체 시계에 실행을 예약합니다.

## 에이전트가 GitHub, Linear, Slack 또는 Discord에 답장을 보낼 수 있나요?

이벤트에 문제, 끌어오기 요청 또는 회신할 스레드가 있는 경우 Hub는 `reply` 도구를 부여합니다. `github.push` 이벤트에는 응답 대상이 없습니다.

`run.outputs`을 추가하여 `max` 또는 `required: true`을 설정하고 에이전트에게 `run.prompt`에서 `reply` 및 `finish_execution`을 호출하도록 지시합니다. Hub가 HTTPS를 통해 실행되면 응답에는 로그인한 조직 구성원을 위한 **Paseo**에서 열기 링크가 포함됩니다.

## 일정이나 웹훅을 Slack이나 Discord에 게시할 수 있나요?

예. [`run.tools`](/docs/hub/tools)을 추가하거나 대시보드에서 **통합 액세스**를 구성하여 명시적인 Slack 또는 Discord 채널 ID에 대한 트리거 범위 `read` 또는 `post` 도구를 부여하세요.

## 데몬이 오프라인이면 어떻게 되나요?

대상 데몬이 오프라인일 때 Hub가 공급자 이벤트나 인바운드 웹후크를 수락하면 Hub는 실행을 대기열에 유지하고 `max_runtime` 기한이 만료될 때까지 디스패치를 ​​재시도합니다. 데몬이 제 시간에 다시 연결되면 대기 중인 실행이 자동으로 시작되므로 이벤트를 다시 보내면 중복 실행이 시작될 수 있습니다.

새 이벤트를 보내기 전에 **Activity**에 터미널 오류가 표시될 때까지 기다리세요. 예약된 트리거는 향후 발생 시 계속 실행되며 이전 실행이 활성화된 동안 겹치는 틱을 건너뜁니다.

## 로그아웃하면 데몬 연결이 끊어지나요?

아니요. CLI 로그인은 `PASEO_HOME` 아래에 저장된 인간 자격 증명인 반면, 등록된 데몬은 자체 관계 자격 증명을 보유합니다.

대화형 `paseo hub logout`은 로그인을 삭제하기 전에 동일한 Hub에 연결된 데몬 연결을 끊도록 제안합니다. 비대화형 및 `--json` 로그아웃은 `--disconnect-daemon`을 전달하지 않는 한 데몬 연결을 끊지 않습니다.

## GitHub 없이 Hub를 사용할 수 있나요?

예. Hub는 GitHub를 연결하지 않고도 Linear, Slack, Discord, 일정 및 인바운드 웹후크와 작동합니다. GitHub는 GitHub 트리거 또는 [`run.github`](/docs/hub/github) 저장소 토큰에만 필요합니다.
