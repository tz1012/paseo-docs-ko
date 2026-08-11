---
title: When to use the Paseo browser
description: When to reach for Paseo's built-in browser instead of Playwright or agent-browser.
nav: When to use
order: 36
category: Browser
---

# 언제 사용하는가

Paseo는 에이전트에게 [Paseo 내부의 실제 브라우저](/docs/browser)를 제공합니다. Playwright 또는 에이전트 브라우저와 같은 독립형 도구는 에이전트에게 별도의 프로세스로 자체 브라우저를 제공합니다. 겹치는데, 어느 것인가요?

다음과 같은 경우 Paseo 브라우저를 사용하세요.

- **원격으로 에이전트를 실행하고 있으며 보고 싶습니다.** 보이지 않는 상자에 있는 헤드리스 브라우저가 아니라 에이전트가 구동하는 것과 동일한 브라우저가 Paseo 데스크톱 앱에서 실시간으로 표시됩니다.
- **Paseo 내부에 브라우저가 필요합니다.** 관리할 별도의 에이전트 창이 아닌 동일한 세션의 탭입니다.
- **추가 도구를 설정할 필요가 없습니다.** 내장되어 있으므로 설치하고 연결할 별도의 MCP 서버나 CLI가 없습니다.

헤드리스 CI 실행, 기존 테스트 모음 또는 Paseo의 에이전트 세션에 연결되지 않은 자동화 등 브라우저 작업이 자체적으로 실행되는 경우 Playwright 또는 에이전트 브라우저에 도달하세요.

Paseo 브라우저는 [현재 데스크톱 전용](/docs/browser)입니다.