---
title: Voice
description: Paseo voice architecture, local-first model execution, and provider configuration.
nav: Voice
order: 41
category: Configuration
---

# 목소리

Paseo는 코딩 환경에서 받아쓰기 및 음성 모드 대화를 위한 최고 수준의 음성 지원을 제공합니다.

## 철학

음성은 로컬 우선입니다. 음성을 기기에서 완전히 실행하거나 음성 기능을 위해 OpenAI를 선택할 수 있습니다. 음성 추론/조정을 위해 Paseo는 컴퓨터에 이미 설치되고 인증된 에이전트 공급자를 재사용합니다.

이렇게 하면 환경에서 자격 증명과 실행이 유지되고 별도의 클라우드 전용 음성 스택이 도입되는 것을 방지할 수 있습니다.

## 아키텍처

- 음성 I/O: 기능별 STT 및 TTS 제공자(`local` 또는 `openai`)
- 로컬 음성 런타임: 기본적으로 CPU에서 실행되는 ONNX 모델
- 음성 LLM 오케스트레이션: 구성된 공급자(`claude`, `codex` 또는 `opencode`)를 사용하는 숨겨진 에이전트 세션
- 도구 경로: 음성 도구 및 에이전트 제어를 위한 MCP stdio 브리지

## 로컬 음성

로컬 음성의 기본 모델 ID는 `parakeet-tdt-0.6b-v2-int8`(STT)과 `kokoro-en-v0_19`(TTS, 스피커 0 / 음성 00)입니다.

받아쓰기는 기본적으로 켜져 있습니다. 음성 모드는 **설정 > 음성**에서 켜거나 `features.voiceMode.enabled: true`를 설정하기 전까지 꺼져 있습니다.

활성화된 기능에 필요한 모델이 없으면 데몬 시작 시 `$PASEO_HOME/models/local-speech`에 다운로드합니다. 누락된 파일만 다운로드합니다. **설정 > 음성**에는 모든 로컬 모델과 각 모델의 크기 및 지원 언어가 표시되며, 모델별로 다운로드하거나 삭제할 수 있습니다.

### 로컬 STT 모델 및 언어 지원

**설정 > 음성**에는 모든 로컬 STT 모델과 지원 언어가 표시됩니다. 기본 모델인 `parakeet-tdt-0.6b-v2-int8`은 영어만 지원합니다. 다른 언어에는 `parakeet-tdt-0.6b-v3-int8`(유럽 25개 언어)이나 `whisper-base`(99개 언어) 같은 다국어 모델을 선택하세요. `language` 필드는 두 제공자의 STT 세션에 모두 전달됩니다. 현재 로컬 인식기는 음성 언어를 자체적으로 감지하므로 `language`을 설정해도 모델이 지원하는 언어가 늘어나지는 않습니다.

```json
{
  "version": 1,
  "features": {
    "dictation": {
      "stt": { "provider": "local", "model": "parakeet-tdt-0.6b-v2-int8" }
    },
    "voiceMode": {
      "llm": { "provider": "claude", "model": "haiku" },
      "stt": { "provider": "local", "model": "parakeet-tdt-0.6b-v2-int8" },
      "tts": { "provider": "local", "model": "kokoro-en-v0_19", "speakerId": 0 }
    }
  },
  "providers": {
    "local": {
      "modelsDir": "~/.paseo/models/local-speech"
    }
  }
}
```

다국어 로컬 받아쓰기에는 다국어 모델을 설정하세요. `language` 필드는 필요하지 않습니다.

```json
{
  "version": 1,
  "features": {
    "dictation": {
      "stt": { "provider": "local", "model": "parakeet-tdt-0.6b-v3-int8" }
    }
  }
}
```

어느 STT 제공자든 받아쓰기에는 `features.dictation.stt.language`, 음성 모드에는 `features.voiceMode.stt.language`을 설정하세요. 음성 언어를 생략하면 Paseo는 받아쓰기 언어를 사용한 뒤 `en`으로 대체합니다.

## OpenAI 음성 옵션

`provider`를 `openai`으로 설정하고 자격 증명을 필요한 각 사용 위치에 입력하세요. 받아쓰기, 듣기, 말하기는 각각 자체 키, 기본 URL, 모델을 사용합니다.

```json
{
  "version": 1,
  "features": {
    "dictation": {
      "stt": { "provider": "openai", "apiKey": "sk-...", "model": "gpt-4o-mini-transcribe" }
    },
    "voiceMode": {
      "enabled": true,
      "stt": {
        "provider": "openai",
        "apiKey": "sk-...",
        "baseUrl": "https://api.openai.com/v1",
        "model": "gpt-4o-transcribe",
        "language": "en"
      },
      "tts": { "provider": "openai", "apiKey": "sk-...", "model": "tts-1", "voice": "alloy" }
    }
  }
}
```

| 제공자 | 음성-텍스트 필드 | 텍스트-음성 필드 |
| -------- | --------------------------------------------------------------- | ------------------------------------- |
| `local` | `model`, `language` | `model`, `speakerId`, `speed` |
| `openai` | `apiKey`, `baseUrl`, `model`, `language`, `confidenceThreshold` | `apiKey`, `baseUrl`, `model`, `voice` |

`provider` 이외의 필드는 선택 사항입니다. 제공자의 기본값을 사용하려면 `model`을 생략하세요. OpenAI 모델과 음성 이름에는 호환 서버의 사용자 지정 ID를 사용할 수 있습니다. 호스트에 저장한 키는 앱에서 쓰기 전용입니다.

저장된 `apiKey` 또는 `baseUrl`은 환경 설정보다 우선합니다. 저장된 값이 없으면 STT는 `OPENAI_STT_API_KEY` / `OPENAI_STT_BASE_URL`, TTS는 `OPENAI_TTS_API_KEY` / `OPENAI_TTS_BASE_URL`을 사용하고, 둘 다 `OPENAI_API_KEY` / `OPENAI_BASE_URL`로 대체됩니다. 이러한 설정은 Paseo 음성 트래픽에 영향을 줍니다.

기존 `providers.openai` 설정은 인라인 값이 없는 OpenAI 사용 위치에 자동으로 로드됩니다. 엔드포인트 설정은 이전 공유 설정보다 우선합니다. 다음에 저장할 때 인라인 형태로 기록됩니다. 받을 OpenAI 사용 위치가 없는 레거시 키는 경고와 함께 삭제됩니다. 나중에 OpenAI를 선택할 때 키를 입력하세요.

Paseo는 구성된 OpenAI 기본 URL 아래의 다음 경로를 사용합니다.

- 받아쓰기 STT: `/v1/audio/transcriptions`
- 음성 모드 STT: `/v1/audio/transcriptions`
- 음성 모드 TTS: `/v1/audio/speech`

## 환경 변수

제공자, 활성화, 모델, 언어, 음성, 튜닝 환경 변수는 구성을 재정의합니다. 키와 기본 URL에는 위의 대체 규칙이 적용됩니다.

- `PASEO_DICTATION_ENABLED`, `PASEO_VOICE_MODE_ENABLED`, 기능 활성화
- `STT_MODEL`, 두 OpenAI STT 위치의 모델 재정의
- `STT_CONFIDENCE_THRESHOLD`, 두 OpenAI STT 위치의 신뢰도 임계값
- `TTS_MODEL`, `TTS_VOICE`, OpenAI 말하기 모델과 음성

- `PASEO_VOICE_LLM_PROVIDER`, 음성 에이전트 제공자 재정의
- `PASEO_DICTATION_STT_PROVIDER`, `PASEO_VOICE_STT_PROVIDER`, `PASEO_VOICE_TTS_PROVIDER`, 음성 제공자 선택(`local` 또는 `openai`)
- `OPENAI_STT_API_KEY`, `OPENAI_STT_BASE_URL`, OpenAI 음성-텍스트 엔드포인트(받아쓰기 + 음성 모드 STT)
- `OPENAI_TTS_API_KEY`, `OPENAI_TTS_BASE_URL`, OpenAI 텍스트-음성 엔드포인트(음성 모드 TTS)
- `PASEO_LOCAL_MODELS_DIR`, 로컬 모델 저장 디렉터리
- `PASEO_DICTATION_LOCAL_STT_MODEL`, 로컬 받아쓰기 STT 모델 ID
- `PASEO_VOICE_LOCAL_STT_MODEL`, `PASEO_VOICE_LOCAL_TTS_MODEL`, 로컬 음성 STT/TTS 모델 ID
- `PASEO_DICTATION_LANGUAGE`, 받아쓰기 STT 언어
- `PASEO_VOICE_LANGUAGE`, 음성 모드 STT 언어. 설정하지 않으면 `PASEO_DICTATION_LANGUAGE`으로 대체됩니다.
- `PASEO_VOICE_LOCAL_TTS_SPEAKER_ID`, `PASEO_VOICE_LOCAL_TTS_SPEED`, 선택적 로컬 음성 TTS 튜닝

## 운영 참고 사항

음성 모드에서는 에이전트를 시작하고 제어할 수 있습니다. 특히 작업 디렉터리나 파괴적인 작업을 지정할 때 직접 에이전트 지침과 마찬가지로 음성 프롬프트를 주의해서 다루십시오.
