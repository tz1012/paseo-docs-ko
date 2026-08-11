---
title: TypeScript SDK
description: Run Paseo coding agents from a TypeScript program.
nav: Overview
order: 50
category: TypeScript SDK
---

# 타입스크립트 SDK

`@getpaseo/client`은 자신의 프로그램에서 Paseo 데몬을 구동하는 TypeScript 라이브러리입니다. 공급자와 모델을 선택하고 에이전트에게 프롬프트와 디렉토리를 제공한 후 답변을 기다립니다.

데몬은 작업을 수행합니다. 공급자 CLI를 시작하고 세션을 활성 상태로 유지하며 이를 Paseo 앱으로 스트리밍합니다. 귀하의 프로그램은 클라이언트입니다. 생성한 에이전트는 Paseo에서 직접 시작한 에이전트 옆에 표시되며 프로그램이 종료된 후에도 그대로 유지됩니다.

다음 용도로 사용하세요.

- 문제, 경고 또는 웹훅을 코딩 작업으로 전환합니다.
- 여러 에이전트를 병렬로 실행하고 답변을 수집합니다.
- 세션을 열어두고 후속 메시지를 보냅니다.
- 에이전트에 대한 대시보드를 구축하세요.

## 데몬 시작

```bash
npx @getpaseo/cli
```

`ws://127.0.0.1:6767/ws`에서 수신 대기합니다.

## 에이전트 실행

```ts
import { createPaseoClient } from "@getpaseo/client";

const client = createPaseoClient({ url: "ws://127.0.0.1:6767/ws" });
await client.connect();

const agent = await client.agents.create({
  config: { provider: "codex/gpt-5.5" },
  cwd: "/Users/me/dev/storefront",
  prompt: "Review the current diff and name the riskiest change.",
});

const result = await agent.waitForFinish();
console.log(result.lastMessage);

await client.close();
```

[빠른 시작](/docs/sdk/quickstart)은 이 내용을 한 줄씩 살펴보며 비밀번호와 원격 데몬을 다룹니다.