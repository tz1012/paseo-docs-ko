---
title: Hoplite
description: Install and configure Hoplite for Paseo.
nav: Hoplite
order: 28
category: Providers
---

# Hoplite

데몬 호스트의 Hoplite CLI를 통해 Paseo에서 Hoplite의 클라우드 코딩 에이전트를 실행합니다.

## 시작하기

1. 데몬 호스트에 [Hoplite CLI](https://hoplite.sh/docs/cli)를 설치합니다.
2. `hoplite login`을 실행합니다.
3. Paseo에서 **설정 → 호스트 → 해당 호스트 → 공급자**를 열고 카탈로그에서 **Hoplite**를 찾아 **추가**를 선택하세요.

Paseo는 `hoplite acp`를 실행합니다. 인증과 프로젝트 설정은 [Hoplite의 ACP 가이드](https://hoplite.sh/docs/cli/acp)를 참조하세요.

`hoplite`가 데몬의 PATH 밖에 있다면 [명령 재정의](/docs/custom-providers)를 사용하고 인수에는 `acp`를 유지하세요.

## 프로젝트와 클라우드 작업공간

Hoplite는 클라우드 작업공간에서 에이전트를 실행합니다. 해당 클라우드 작업공간에서는 로컬 파일과 Paseo의 루프백 MCP 도구를 사용할 수 없습니다.

Hoplite 프로젝트에 연결된 저장소를 열거나, 모든 곳에서 하나의 프로젝트를 사용하도록 `agents.providers.hoplite.env.HOPLITE_PROJECT_ID`를 설정하세요. 연결된 저장소나 고정된 프로젝트가 없으면 검색 결과에 `No Hoplite project`가 표시됩니다.
