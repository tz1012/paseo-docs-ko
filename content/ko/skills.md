---
title: Orchestration skills
description: "Paseo orchestration skills: teach coding agents to spawn, coordinate, and manage other agents using slash commands."
nav: Skills
order: 32
category: Orchestration
---

# 오케스트레이션 기술

Paseo는 코딩 에이전트에게 Paseo 도구 및 CLI를 사용하여 다른 에이전트를 생성, 조정 및 관리하는 방법을 가르치는 오케스트레이션 기술을 제공합니다. Skills는 일반적인 워크플로를 슬래시 명령으로 패키지하므로 에이전트는 매번 브리핑 및 안전 레일을 작성하지 않고도 조정 방법을 알 수 있습니다.

멘탈 모델을 원하면 [오케스트레이션](/docs/orchestration)으로 시작하고, 기술을 설치하지 않고도 사용할 수 있는 프롬프트를 원하면 [공통 워크플로](/docs/orchestration-workflows)로 시작하세요.

## 설치

설치하는 두 가지 방법:

- **Paseo 앱:** 호스트에 연결한 다음 설정 → 호스트 → 에이전트 → 오케스트레이션 스킬을 엽니다. 선택한 호스트가 자체 머신에 스킬을 설치합니다.
- **수동:** `npx skills add getpaseo/paseo`, `~/.agents/skills/`에 설치되고 각 에이전트에 대한 심볼릭 링크를 설정합니다.

데몬이 설치된 Paseo 스킬을 찾으면 선택 해제된 디렉터리를 제거하지 않고 시작 시 선택한 번들 스킬을 최신 상태로 유지합니다. 호스트의 오케스트레이션 스킬 카드에서 스킬을 설치, 업데이트, 선택 또는 제거하세요. 제거할 때는 항상 확인을 요청합니다.

## `/paseo`, Paseo 참조

기초 스킬. 프로젝트, 작업공간 및 에이전트 관리를 위한 Paseo 참조입니다. 에이전트가 프로젝트를 등록하거나, 에이전트를 생성하거나, 메시지를 보내거나, 작업공간 격리를 관리해야 할 때 로드하세요.

일반적으로 사용자가 직접 호출하지 않으며 다른 기술이 의존하는 참조입니다.

```
/paseo show me the Paseo CLI surface for creating an agent in a worktree-isolated workspace
```

## `/paseo-handoff`, 작업 전달

전체 컨텍스트를 통해 현재 작업을 다른 에이전트에게 전달합니다. "handoff", "handoff", "hand this to"라고 말하거나 작업을 다른 에이전트에게 전달하고 싶을 때 사용하세요.

수신 에이전트는 작업, 컨텍스트, 관련 파일, 현재 상태, 시도한 내용, 결정, 승인 기준 및 제약 조건이 포함된 자체 브리핑을 받습니다. 공급자는 이름을 지정하지 않는 한 오케스트레이션 기본 설정에서 제공됩니다. 요청 시 작업 트리 격리 작업 공간을 지원합니다.

```
/paseo-handoff hand off the auth fix to codex in a worktree-isolated workspace
/paseo-handoff hand this to claude opus for review
```

## `/paseo-committee`, 위원회 기획

한발 물러서서 근본 원인을 분석하고 계획을 수립하기 위해 두 명의 고논리 대리인으로 구성된 위원회를 구성합니다. 막혔거나, 반복되거나, 터널 비전을 보거나, 어려운 계획 문제에 직면할 때 사용하세요.

위원회 구성원은 분석만 수행합니다. 파일을 편집, 생성 또는 삭제하지 않습니다. 오케스트레이션 에이전트는 계획을 종합하고 구현한 다음 검토를 위해 차이점을 다시 보냅니다.

```
/paseo-committee why are the websocket connections dropping under load?
/paseo-committee plan the auth system migration
```

## `/paseo-advisor`, 고문

단일 에이전트를 현재 작업에 대한 두 번째 의견인 고문으로 구성합니다. "고문", "2차 의견", "X는 어떻게 생각하는가"라고 말하거나 작업 자체를 위임하지 않고 외부 의견을 듣고 싶을 때 사용하세요.

조언자는 판단을 내린다. 당신은 무엇을 해야할지 결정합니다. Advisor 프롬프트는 분석 전용이며 편집할 수 없는 지침으로 끝납니다.

```
/paseo-advisor did I miss anything in this migration plan?
/paseo-advisor --provider claude/opus what is the UX risk in this flow?
```
