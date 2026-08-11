---
title: Browser tools
description: The browser_* MCP tools agents use to drive Paseo browser tabs.
nav: Tools reference
order: 37
category: Browser
---

# 브라우저 도구

`browser_*` 도구는 [브라우저 자동화](/docs/browser)가 활성화되면 다른 [Paseo MCP 도구](/docs/mcp)와 함께 에이전트에 주입됩니다.

공유 개념:

- **`browserId`** 탭을 식별합니다. `browser_new_tab` 또는 `browser_list_tabs`에서 제공되며 모든 탭 범위 도구에 필요합니다.
- **`ref`**는 요소를 식별합니다. `@e3`. 참조는 동일한 탭의 최신 `browser_snapshot`에서 제공되며 페이지가 변경되면 만료됩니다. 오래된 참조는 잘못된 요소에 대해 작동하는 대신 오류를 반환합니다.
- 모든 결과는 명령 중에 열린 페이지를 **대화 상자**로 보고합니다(경고는 허용됨, 로드 전 확인/프롬프트/해제됨).

`?`으로 표시된 인수는 선택 사항입니다.

## 탭

| 도구 | 인수 | 목적 |
| ------ | ------------- | ------------------------------------------------------------ |
| `browser_list_tabs` | — | 연결된 호스트 전체의 에이전트 작업 영역에 열려 있는 탭을 나열합니다.           |
| `browser_new_tab` | `url?` | 백그라운드에서 탭을 열고 `browserId`을 반환합니다.                  |
| `browser_close_tab` | `browserId` | 탭을 닫고 웹뷰를 정리하세요.                                     |
| `browser_resize` | `browserId, width, height` | 탭의 뷰포트 크기를 조정합니다. 휴대폰이나 태블릿 크기에서 레이아웃을 확인하세요. |

## 페이지 읽기

| 도구 | 인수 | 목적 |
| ------- | ------------------------- | ------------------------------------------------------------------------ |
| `browser_snapshot` | `browserId` | 페이지를 요소 참조가 있는 접근성 트리로 반환합니다.                           |
| `browser_screenshot` | `browserId, fullPage?` | `fullPage`을 사용하여 뷰포트의 PNG 또는 전체 페이지를 캡처합니다.                      |
| `browser_logs` | `browserId, maxEntries?` | 최근 콘솔 메시지와 네트워크 타이밍 항목을 읽습니다.                              |
| `browser_wait` | `browserId, text? \| url?, timeoutMs?` | 페이지에 텍스트가 포함되거나 URL 조각(정확히 둘 중 하나)에 도달할 때까지 기다립니다. |

## 상호작용

| 도구 | 인수 | 목적 |
| ------------------ | -------------------------------------- | ---------------------------------------------------------- |
| `browser_click` | `browserId, ref, button?, doubleClick?, modifiers?` | 요소 클릭 - 왼쪽/오른쪽/가운데, 두 번 클릭, 키보드 수정자.              |
| `browser_fill` | `browserId, ref, value` | 입력과 유사한 요소의 값을 설정합니다.                                              |
| `browser_type` | `browserId, text, ref?` | 요소에 텍스트를 입력하거나 `ref`이 생략된 경우 포커스가 있는 요소에 텍스트를 입력하세요.        |
| `browser_keypress` | `browserId, key, ref?` | 요소 또는 초점이 맞춰진 요소에서 키(`Enter`, `Escape`, `Tab`, `Space`, …)를 누릅니다. |
| `browser_hover` | `browserId, ref` | 요소에 마우스를 올리면 실제 CSS `:hover`이 실행됩니다.                                       |
| `browser_select` | `browserId, ref, value` | `<select>`에서 옵션을 선택하세요.                                                    |
| `browser_drag` | `browserId, sourceRef, targetRef` | 한 요소를 다른 요소로 드래그합니다.                                                       |
| `browser_upload` | `browserId, ref, filePaths` | 파일 입력 시 파일을 설정합니다. 경로는 에이전트의 작업공간 내부에 있어야 합니다.               |
| `browser_scroll` | `browserId, deltaX, deltaY, ref?` | 페이지를 스크롤하거나 `ref`을 사용하여 요소 위에 휠 입력을 중앙에 배치합니다.               |

## 탐색

| 도구 | 인수 | 목적 |
| ------------------ | ---------------- | -------------------------------------- |
| `browser_navigate` | `browserId, url` | `http(s)` URL로 이동합니다.                             |
| `browser_back` | `browserId` | 돌아가기 — 이동할 기록이 없을 때 오류가 발생합니다. |
| `browser_forward` | `browserId` | 앞으로 이동 - 앞으로 항목이 없을 때 오류가 발생합니다. |
| `browser_reload` | `browserId` | 페이지를 새로고침하세요.                                    |

## 스크립팅

| 도구 | 인수 | 목적 |
| ------------------ | -------------- | -------------------------------------------------------------------------------------------------------------- |
| `browser_evaluate` | `browserId, function, ref?` | 페이지에서 JavaScript 기능을 실행합니다. `ref`을 사용하면 확인된 요소가 첫 번째 인수로 전달됩니다. 결과는 제한된 JSON으로 반환됩니다. |

## 오류

도구는 자동으로 실패하는 대신 구조화된 오류를 반환합니다. 상담원이 가장 많이 보는 항목은 다음과 같습니다.

| 코드 | 의미 |
| ------ | ------------------------------------------------------------------ |
| `browser_disabled` | 이 호스트에서는 브라우저 도구가 꺼져 있습니다.                                      |
| `browser_no_host` | 연결된 브라우저 호스트(데스크톱 앱)가 없습니다. 재시도 가능.                          |
| `browser_stale_ref` | 심판이 더 이상 페이지와 일치하지 않습니다. 새 스냅샷을 찍으세요.                       |
| `browser_timeout` | 요소가 실행 가능해지지 않았거나 대기 조건이 유지되지 않았습니다.          |
| `browser_denied` | 작업이 허용되지 않습니다. `http(s)`이 아닌 URL이거나 탐색할 기록이 없습니다. |