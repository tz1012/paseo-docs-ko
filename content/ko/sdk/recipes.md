---
title: SDK recipes
description: Complete patterns for issue integrations, parallel review, resident agents, and safe temporary-agent cleanup.
nav: Recipes
order: 57
category: TypeScript SDK
---

# SDK 레시피

예에서는 공개 패키지 루트에서 가져온 연결된 `client`을 사용합니다.

## 문제를 눈에 보이는 작업으로 전환

문제를 선택한 후:

```ts
type Issue = {
  id: string;
  title: string;
  description: string;
  repositoryPath: string;
};

async function startIssue(issue: Issue) {
  const workspace = await client.workspaces.open(issue.repositoryPath);
  const agent = await workspace.agents.create({
    config: {
      provider: "codex/gpt-5.5",
    },
    title: issue.title,
    labels: {
      "issue-provider": "my-tracker",
      "issue-id": issue.id,
    },
    prompt: [
      `Implement issue ${issue.id}: ${issue.title}`,
      "",
      issue.description,
      "",
      "Run focused tests and summarize the result.",
    ].join("\n"),
  });

  return { workspaceId: workspace.id, agentId: agent.id };
}
```

통합에서 반환된 ID를 유지합니다. 다음 웹훅 또는 페이지 로드 시 중복을 생성하는 대신 `workspaces.ref()` 및 `agents.ref()`을 사용하여 핸들을 복구합니다.

## 병렬 리뷰어 실행

```ts
const prompts = [
  "Review the diff for correctness and missed edge cases.",
  "Review the diff for security and unsafe input handling.",
  "Review the diff for unnecessary complexity.",
];

const reviewers = await Promise.all(
  prompts.map((prompt, index) =>
    client.agents.create({
      config: {
        provider: index === 1 ? "claude/claude-sonnet-5" : "codex/gpt-5.5",
      },
      cwd: process.cwd(),
      title: `Review ${index + 1}`,
      prompt,
    }),
  ),
);

const results = await Promise.all(reviewers.map((reviewer) => reviewer.waitForFinish()));

for (const result of results) {
  console.log(result.status, result.lastMessage);
}
```

## 프로세스를 다시 시작해도 상주 역할을 유지합니다.

```ts
async function getPlanner() {
  const listed = await client.agents.list({
    filter: { includeArchived: false },
    page: { limit: 100 },
  });

  const existing = listed.entries.find(({ agent }) => agent.labels["my-app-role"] === "planner");

  if (existing) return client.agents.ref(existing.agent);

  return client.agents.create({
    config: {
      provider: "claude/claude-sonnet-5",
    },
    cwd: process.cwd(),
    title: "Planner",
    labels: { "my-app-role": "planner" },
  });
}

const planner = await getPlanner();
const plan = await planner.run("Plan the next small, shippable improvement.");
```

라벨은 애플리케이션 소유의 메타데이터입니다. 여러 도구가 동일한 데몬에서 에이전트를 관리할 수 있는 경우 네임스페이스 키입니다.

## 임시 에이전트 정리

```ts
const temporaryAgents = [];

try {
  const agent = await client.agents.create({
    config: {
      provider: "codex/gpt-5.5",
    },
    cwd: process.cwd(),
    title: "Temporary smoke test",
  });
  temporaryAgents.push(agent);

  const result = await agent.run("Reply with READY and nothing else.", {
    timeoutMs: 2 * 60_000,
  });

  if (result.status !== "idle") {
    throw new Error(result.error ?? result.status);
  }
} finally {
  await Promise.allSettled(temporaryAgents.map((agent) => agent.archive()));
}
```

통합으로 생성되지 않은 에이전트는 보관하지 마세요.