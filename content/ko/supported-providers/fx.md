---
title: fx
description: Install and configure fx for Paseo.
nav: fx
order: 26
category: Providers
---

# fx

기존 fx 설치와 자격 증명을 사용해 Vercel Labs의 코딩 에이전트 fx를 Paseo에서 실행합니다.

## 시작하기

1. 데몬 호스트에 [fx를 설치](https://fx.sh/docs/getting-started/installation)합니다.
2. 예를 들어 `fx login`으로 [fx를 모델 공급자에 연결](https://fx.sh/docs/getting-started/authentication)합니다.
3. Paseo에서 **설정 → 호스트 → 해당 호스트 → 공급자**를 열고 카탈로그에서 **fx**를 찾아 **추가**를 선택하세요.

Paseo는 `fx acp`를 실행하고 사용자의 fx 자격 증명과 설정을 사용합니다. fx에 자격 증명이 없으면 공급자는 fx의 로그인 메시지를 보고합니다.

`fx`가 데몬의 PATH 밖에 있다면 [명령 재정의](/docs/custom-providers)를 사용하고 인수에는 `acp`를 유지하세요.

## 모델과 권한

모델 목록은 fx에서 활성화된 모델 공급자로부터 가져옵니다. 새 에이전트가 시작할 때 사용할 목록을 변경하려면 `fx provider`를 실행하세요.

Paseo에서 에이전트의 권한 모드를 변경하면 fx에 저장된 권한 모드도 변경됩니다.

fx가 지원하는 기능은 [fx의 ACP 가이드](https://fx.sh/docs/using-fx/acp)를 참조하세요.
