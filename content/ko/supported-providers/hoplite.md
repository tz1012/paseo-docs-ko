---
title: Hoplite
description: Install and add Hoplite for Paseo.
nav: Hoplite
order: 28
category: Providers
---

# Hoplite

Paseo는 설치된 `hoplite` CLI에서 에이전트 클라이언트 프로토콜(`hoplite acp`)을 통해 Hoplite의 클라우드 코딩 에이전트를 실행합니다.

## 시작하기

에이전트를 시작하기 전에 Paseo의 설정에서 Hoplite를 추가하세요.

1. 데몬 호스트에 [Hoplite CLI](https://hoplite.sh/docs/cli)를 설치합니다.
2. 터미널에서 `hoplite login`을 실행합니다.
3. Paseo에서 **설정 → 호스트 → 호스트 → 공급자**를 열고 **+ 공급자**를 선택한 다음 **Hoplite**를 찾아 **추가**를 선택합니다.

인증 및 프로젝트 설정은 [Hoplite의 ACP 가이드](https://hoplite.sh/docs/cli/acp)를 참조하세요. `hoplite`이 데몬 PATH 외부에 있는 경우 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하고 인수에 `acp`을 유지하세요.

## 프로젝트와 클라우드 작업공간

Hoplite는 클라우드 작업 공간에서 에이전트를 실행합니다. 로컬 파일과 Paseo의 루프백 MCP 도구를 사용할 수 없습니다.

Hoplite 프로젝트에 연결된 저장소를 열거나, 모든 곳에서 하나의 프로젝트를 사용하도록 `agents.providers.hoplite.env.HOPLITE_PROJECT_ID`를 설정하세요. 연결된 저장소나 고정된 프로젝트가 없으면 검색 결과에 `No Hoplite project`가 표시됩니다.
