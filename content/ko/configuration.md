---
title: Configuration
description: Configure Paseo via config.json, environment variables, and CLI overrides.
nav: Configuration
order: 40
category: Configuration
---

# 구성

Paseo는 선택적 환경 변수 및 CLI 재정의를 통해 Paseo 홈 디렉터리의 단일 JSON 파일에서 구성을 로드합니다.

## 구성이 존재하는 곳

기본적으로 Paseo는 `~/.paseo`을 홈 디렉터리로 사용합니다. 구성 파일은 다음과 같습니다.

```bash
~/.paseo/config.json
```

`PASEO_HOME`을 설정하거나 `--home`을 `paseo daemon start`에 전달하여 홈 디렉터리를 변경할 수 있습니다.

## 우선순위

Paseo는 다음 순서로 구성을 병합합니다.

1. 기본값
2. `config.json`
3. 환경변수
4. CLI 플래그

목록은 여러 소스에 걸쳐 추가됩니다(예: `hostnames` 및 `cors.allowedOrigins`).

## 예

수신 주소, 호스트 이름 및 MCP를 구성하는 최소 예:

```json
{
  "$schema": "https://paseo.sh/schemas/paseo.config.v1.json",
  "version": 1,
  "daemon": {
    "listen": "127.0.0.1:6767",
    "hostnames": ["localhost", ".localhost"],
    "mcp": { "enabled": true }
  }
}
```

`daemon.hostnames`이 기본 필드입니다. 이전 `daemon.allowedHosts` 이름은 이전 버전과의 호환성을 위해 더 이상 사용되지 않는 별칭으로 여전히 작동합니다.

## 에이전트 제공업체

Paseo가 제공하는 일류 서비스와 `agents.providers` 아래에 추가하는 사용자 정의 항목인 에이전트 제공업체는 자체 페이지에 문서화되어 있습니다.

멘탈 모델은 [제공자](/docs/providers)를 참조하고 Paseo가 시작할 수 있는 에이전트의 전체 목록은 [지원 제공자](/docs/supported-providers)를 참조하세요. Anthropic 호환 엔드포인트(Z.AI, Alibaba/Qwen), 여러 프로필, 사용자 정의 바이너리, ACP 에이전트 및 `additionalModels` 병합 동작에서 Claude를 지정하려면 [사용자 정의 공급자](/docs/custom-providers)를 참조하세요. 전체 필드 참조는 GitHub([docs/custom-providers.md](https://github.com/getpaseo/paseo/blob/main/docs/custom-providers.md))에 있습니다.

## 작업 트리

새 작업 트리는 기본적으로 `$PASEO_HOME/worktrees` 아래에 생성됩니다. 새 작업 트리를 다른 곳에 배치하려면 `worktrees.root`을 설정하세요.

```json
{
  "worktrees": {
    "root": "/mnt/fast/paseo-worktrees"
  }
}
```

상대 경로는 `PASEO_HOME`에 대해 확인됩니다. 기존 작업 트리는 그대로 유지됩니다. 이 설정을 변경하면 Paseo가 앞으로 Paseo 관리 작업 트리를 생성하고 검색하는 위치만 변경됩니다.

## 목소리

Voice는 `providers` 아래에 공급자 자격 증명을 사용하여 `features.dictation` 및 `features.voiceMode`을 통해 구성됩니다.

음성 철학, 아키텍처, 전체 로컬/OpenAI 설정 예시는 [음성 문서](/docs/voice)를 참조하세요.

## 번들로 제공되는 웹 UI

데몬은 동일한 HTTP 서버에서 브라우저 웹 클라이언트를 제공할 수 있습니다. 이는 공식 Docker 이미지에서 활성화되어 있으며 일반 CLI 및 데스크톱 관리 데몬에서는 기본적으로 비활성화되어 있습니다.

CLI에서 활성화합니다.

```bash
paseo daemon start --web-ui
```

또는 환경 변수를 설정하십시오.

```bash
PASEO_WEB_UI_ENABLED=true paseo daemon start
```

또는 `config.json`에 유지합니다.

```json
{
  "features": {
    "webUi": {
      "enabled": true
    }
  }
}
```

활성화되면 데몬 HTTP 원본(예: `http://localhost:6767/`)을 열어 웹 앱을 로드합니다. 데몬 인증 없이 정적 UI 파일이 로드됩니다. API 및 WebSocket 요청에는 여전히 구성된 비밀번호가 필요합니다.

## 로깅

데몬 로깅은 기본적으로 별도의 콘솔과 파일 싱크를 사용합니다.

- 콘솔: `info` 이상
- 파일(`$PASEO_HOME/daemon.log`): `trace` 이상
- 파일 회전: `10m` 최대 파일 크기, `2` 보유 파일 총계(활성 + 1 회전)

```json
{
  "log": {
    "console": {
      "level": "info",
      "format": "pretty"
    },
    "file": {
      "level": "trace",
      "path": "daemon.log",
      "rotate": {
        "maxSize": "10m",
        "maxFiles": 2
      }
    }
  }
}
```

기존 필드 `log.level` 및 `log.format`은 계속 지원되며 새 대상 설정에 매핑됩니다.

## 비밀번호 인증

데몬에 연결하려면 비밀번호를 요구할 수 있습니다. 설정되면 모든 HTTP 및 WebSocket 클라이언트가 인증되어야 합니다. `/api/health` 활성 엔드포인트만 면제되므로 프로세스 감독자와 로드 밸런서는 자격 증명 없이 프로브할 수 있습니다.

비밀번호를 설정하는 가장 쉬운 방법은 CLI를 사용하는 것입니다.

```bash
paseo daemon set-password
```

그러면 비밀번호를 묻는 메시지가 표시되고 bcrypt 해시가 `config.json`에 기록되며 데몬을 다시 시작하라는 메시지가 표시됩니다.

또는 `PASEO_PASSWORD` 환경 변수를 설정합니다(일반 텍스트, 시작 시 자동으로 해시됨).

```bash
PASEO_PASSWORD=my-secret paseo daemon start
```

또는 `config.json`에 직접 해시를 작성합니다.

```json
{
  "daemon": {
    "auth": {
      "password": "$2b$12$..."
    }
  }
}
```

비밀번호를 설정한 후 데몬을 다시 시작하면 변경 사항이 적용됩니다.

### 비밀번호로 연결하기

CLI는 다음 순서로 비밀번호를 선택합니다.

1. `tcp://` 호스트 URI의 `password` 쿼리 매개변수:

```bash
   paseo --host "tcp://192.168.1.10:6767?password=my-secret" ls
   ```

2. 호스트에 내장된 비밀번호가 없을 때 대체 수단으로 사용되는 `PASEO_PASSWORD` 환경 변수(`localhost:6767`, 베어 `host:port` 또는 `password=` 쿼리가 없는 `tcp://` 호스트에서 작동):

```bash
   PASEO_PASSWORD=my-secret paseo ls
   PASEO_PASSWORD=my-secret paseo --host 192.168.1.10:6767 ls
   ```

URI의 `password=`은 항상 env var보다 우선하므로 `PASEO_PASSWORD`을 전역적으로 설정하고 URI에 비밀번호를 입력하여 다른 데몬을 계속 대상으로 지정할 수 있습니다.

모바일 앱의 직접연결 설정 화면에서 비밀번호를 입력하세요.

## 릴레이

새 집에는 `daemon.relay.enabled: false`을 쓰세요. Paseo는 장치를 페어링할 때 릴레이를 활성화하기 전에 묻습니다. 기존 주택은 저장된 가치를 유지합니다. 연결 방법을 선택 및 구성하려면 [연결](/docs/connectivity)을 참조하고, 릴레이 암호화 모델은 [보안](/docs/security)을 참조하세요.

`config.json`에서 지속 값을 설정합니다.

```json
{
  "daemon": {
    "relay": {
      "enabled": true
    }
  }
}
```

`PASEO_RELAY_ENABLED=true|false`은 해당 데몬 실행에 대한 지속 값을 재정의합니다. 일치하는 `paseo daemon start --relay` 및 `--no-relay` 플래그는 동일한 권한을 갖습니다. Paseo Desktop 또는 `paseo daemon pair --relay`에서 릴레이를 변경하기 전에 실행 재정의를 제거하세요.

## 공통 환경 변수

- `PASEO_HOME`, Paseo 홈 디렉토리 설정
- `PASEO_PASSWORD`, 데몬에서 요구할 비밀번호(일반 텍스트, 시작 시 해시됨) CLI에서 호스트 URI에 비밀번호가 포함되어 있지 않을 때 연결하는 데 사용되는 비밀번호
- `PASEO_LISTEN`, `daemon.listen` 재정의
- `PASEO_RELAY_ENABLED`, 이 데몬 실행에 대한 아웃바운드 릴레이를 활성화 또는 비활성화합니다.
- `PASEO_HOSTNAMES`, `daemon.hostnames` 재정의/연장
- `PASEO_ALLOWED_HOSTS`, `PASEO_HOSTNAMES`에 대한 더 이상 사용되지 않는 별칭
- `PASEO_WEB_UI_ENABLED`, 데몬 제공 웹 UI 활성화 또는 비활성화
- `PASEO_WEB_UI_DIST_DIR`, 데몬 웹 UI 빌드 디렉터리 재정의
- `PASEO_TRUSTED_PROXIES`, `X-Forwarded-*` 헤더에 대해 신뢰할 수 있는 역방향 프록시 범위를 구성합니다.
- `PASEO_LOG_CONSOLE_LEVEL`, `log.console.level` 재정의
- `PASEO_LOG_FILE_LEVEL`, `log.file.level` 재정의
- `PASEO_LOG_FILE_PATH`, `log.file.path` 재정의
- `PASEO_LOG_FILE_ROTATE_SIZE`, `log.file.rotate.maxSize` 재정의
- `PASEO_LOG_FILE_ROTATE_COUNT`, `log.file.rotate.maxFiles` 재정의
- `PASEO_LOG`, `PASEO_LOG_FORMAT`, 레거시 로그 재정의(계속 지원됨)
- `OPENAI_API_KEY`, OpenAI 공급자 키 재정의
- `OPENAI_STT_API_KEY`, `OPENAI_STT_BASE_URL`, OpenAI 음성-텍스트 엔드포인트(받아쓰기 + 음성 모드 STT)
- `OPENAI_TTS_API_KEY`, `OPENAI_TTS_BASE_URL`, OpenAI 텍스트 음성 변환 엔드포인트(음성 모드 TTS)
- `PASEO_VOICE_LLM_PROVIDER`, 음성 LLM 제공업체 무시(`claude`, `codex`, `opencode`)
- `PASEO_DICTATION_STT_PROVIDER`, `PASEO_VOICE_STT_PROVIDER`, `PASEO_VOICE_TTS_PROVIDER`, 음성 공급자 선택 무시(`local` 또는 `openai`)
- `PASEO_LOCAL_MODELS_DIR`, 로컬 모델 디렉터리 제어
- `PASEO_DICTATION_LOCAL_STT_MODEL`, 로컬 받아쓰기 STT 모델 재정의
- `PASEO_VOICE_LOCAL_STT_MODEL`, `PASEO_VOICE_LOCAL_TTS_MODEL`, 로컬 음성 STT/TTS 모델 재정의
- `PASEO_DICTATION_LANGUAGE`, `PASEO_VOICE_LANGUAGE`, 받아쓰기 및 음성 STT 언어 무시
- `PASEO_VOICE_LOCAL_TTS_SPEAKER_ID`, `PASEO_VOICE_LOCAL_TTS_SPEED`, 선택적으로 로컬 음성 TTS 튜닝

## 스키마

편집기 자동 완성/검증을 위해 `$schema`을 다음과 같이 설정합니다.

```
https://paseo.sh/schemas/paseo.config.v1.json
```