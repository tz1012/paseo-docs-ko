---
title: fx
description: Install and add fx for Paseo.
nav: fx
order: 26
category: Providers
---

# fx

Paseo는 설치된 `fx` CLI에서 에이전트 클라이언트 프로토콜(`fx acp`)을 통해 Vercel Labs의 코딩 에이전트인 fx를 실행합니다. 기존 fx 자격 증명 및 설정을 사용합니다.

## 시작하기

에이전트를 시작하기 전에 Paseo의 설정에서 fx를 추가하세요.

1. 데몬 호스트에 [fx를 설치](https://fx.sh/docs/getting-started/installation)합니다.
2. `fx login`과 같은 [fx를 모델 제공자에 연결](https://fx.sh/docs/getting-started/authentication).
3. Paseo에서 **설정 → 호스트 → 호스트 → 공급자**를 열고 **+ 공급자**를 선택한 다음 **fx**를 찾아 **추가**를 선택합니다.

fx에 자격 증명이 있을 때까지 Paseo는 fx의 로그인 메시지를 표시합니다. `fx`이 데몬 PATH 외부에 있는 경우 [명령 재정의](/docs/custom-providers#custom-binary)를 사용하고 인수에 `acp`을 유지하세요.

## 모델과 권한

모델 목록은 fx의 활성 모델 공급자로부터 제공됩니다. 새 에이전트가 시작되는 목록을 변경하려면 `fx provider`을 실행하세요.

Paseo에서 에이전트의 권한 모드를 변경하면 fx는 저장된 권한 모드도 업데이트합니다.

지원되는 기능은 [fx의 ACP 가이드](https://fx.sh/docs/using-fx/acp)를 참조하세요.
