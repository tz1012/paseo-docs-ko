---
title: Getting started
description: Install Paseo and start running coding agents from anywhere.
nav: Getting started
order: 1
category: Getting started
---

# 시작하기

Paseo는 귀하의 컴퓨터에서 코딩 에이전트를 실행하고 모바일, 데스크탑, 웹 및 CLI 클라이언트를 제공하여 어디에서나 이를 구동할 수 있습니다. 세 가지 일반적인 설치 방법.

## 데스크톱 앱(권장)

[paseo.sh/download](https://paseo.sh/download) 또는 [GitHub 릴리스 페이지](https://github.com/getpaseo/paseo/releases)에서 다운로드하세요. 그것을 열면 완료됩니다.

데스크톱 앱은 자체 데몬을 번들로 묶어 자동으로 시작하므로 별도의 설치가 필요하지 않습니다. 처음 실행하면 간단한 시작 화면이 표시되고 **설정 → 호스트 → 장치 페어링**을 사용하여 휴대폰에서 연결합니다.

## 서버/CLI

헤드리스 머신, 개발 박스 또는 데스크톱 UI 없이 데몬을 실행하려는 모든 설정의 경우:

```bash
npm install -g @getpaseo/cli
paseo
```

Paseo는 로컬에서 데몬을 시작한 다음 종단 간 암호화 릴레이를 활성화하고 페어링 QR 코드를 인쇄할지 묻습니다. 거절하는 경우 TCP, Tailscale 또는 다른 VPN을 통해 수동으로 데몬 주소를 입력하세요.

데몬은 브라우저 웹 앱 자체를 제공할 수도 있으므로 호스팅된 앱 없이 전체 UI를 사용할 수 있습니다. [웹 UI 자체 호스팅](/docs/web-ui)을 참조하세요.

구성 및 로컬 상태는 `PASEO_HOME` 아래에 있습니다(기본값은 `~/.paseo`).

## 도커

서버, 개발 박스, NAS 장치 또는 홈랩 호스트의 경우 공식 이미지를 실행하세요.

```bash
docker run -d --name paseo \
  -p 6767:6767 \
  -e PASEO_PASSWORD=change-me \
  -v "$PWD/paseo-home:/home/paseo" \
  -v "$PWD:/workspace" \
  ghcr.io/getpaseo/paseo:latest
```

그런 다음 `http://localhost:6767`을 엽니다.

이미지는 데몬을 실행하고 번들 웹 UI를 제공합니다. 에이전트 CLI를 번들로 제공하지 않으므로 사용하는 에이전트로 확장하세요. Compose, 역방향 프록시, 에이전트 설치 및 보안 예제는 [Docker](/docs/docker)를 참조하세요.

## 다음은 어디로

- [연결](/docs/connectivity), 릴레이 또는 Tailscale을 통해 연결합니다.
- [Docker](/docs/docker), 컨테이너에서 데몬과 번들 웹 UI를 실행합니다.
- [Workspaces](/docs/workspaces), 프로젝트, 작업공간 및 세션 모델 Paseo는 이를 중심으로 구축되었습니다.
- [공급자](/docs/providers), 공급자가 무엇인지, Paseo가 기존 CLI를 래핑하는 방법.
- [오케스트레이션](/docs/orchestration): 한 에이전트가 작업을 다른 공급자 및 모델에 위임할 수 있습니다.
- [CLI 참조](/docs/cli), 모든 명령.
- [웹 UI 자체 호스팅](/docs/web-ui), 자체 데몬에서 브라우저 앱을 제공합니다.
- [GitHub 저장소](https://github.com/getpaseo/paseo)
- [문제 신고](https://github.com/getpaseo/paseo/issues)

## 전제조건

Paseo는 다른 에이전트를 관리하지만 배송하지는 않습니다. 유용하게 사용하려면 공급자 CLI를 하나 이상 직접 설치하고 자격 증명과 작동하는지 확인하세요. 전체 목록은 [지원되는 제공업체](/docs/supported-providers)를 참조하세요.

또한 [GitHub CLI](https://cli.github.com/)(`gh`)를 설치하고 인증해야 하며 Paseo는 이를 PR 인식 작업 트리 및 몇 가지 오케스트레이션 기능에 사용합니다.