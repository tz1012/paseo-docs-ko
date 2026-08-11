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

## 현지 연설

로컬 음성의 기본값은 모델 ID `parakeet-tdt-0.6b-v2-int8`(STT) 및 `kokoro-en-v0_19`(TTS, 스피커 0 / 음성 00)입니다.

누락된 모델은 데몬 시작 시 `$PASEO_HOME/models/local-speech`으로 다운로드됩니다. 다운로드는 누락된 파일에 대해서만 발생합니다.

### 로컬 STT 모델 및 언어 지원

| 모델 ID | 언어 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `parakeet-tdt-0.6b-v2-int8` | 영어로만 제공됩니다(기본값). 구두점과 대문자를 포함합니다.                                                                                                                                                                                                             |
| `parakeet-tdt-0.6b-v3-int8` | 25개 유럽 언어, 자동 감지됨: 불가리아어, 크로아티아어, 체코어, 덴마크어, 네덜란드어, 영어, 에스토니아어, 핀란드어, 프랑스어, 독일어, 그리스어, 헝가리어, 이탈리아어, 라트비아어, 리투아니아어, 몰타어, 폴란드어, 포르투갈어, 루마니아어, 러시아어, 슬로바키아어, 슬로베니아어, 스페인어, 스웨덴어, 우크라이나어. |

**영어가 아닌 언어를 사용하려면 로컬 STT 모델을 `parakeet-tdt-0.6b-v3-int8`으로 전환하세요.** v3에서는 음성 언어를 자동으로 감지합니다. 언어별 설정은 없습니다. 아래의 `language` 필드는 로컬 앵무새 모델을 조종하지 **않습니다**(v2는 영어로만 제공되고 v3는 자동 감지됩니다). OpenAI STT 공급자에만 적용됩니다.

```json
{
  "version": 1,
  "features": {
    "dictation": {
      "stt": { "provider": "local", "model": "parakeet-tdt-0.6b-v2-int8", "language": "en" }
    },
    "voiceMode": {
      "llm": { "provider": "claude", "model": "haiku" },
      "stt": { "provider": "local", "model": "parakeet-tdt-0.6b-v2-int8", "language": "en" },
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

다국어 로컬 받아쓰기의 경우 모델을 v3으로 설정합니다. 그러면 언어가 자동으로 감지되므로 `language` 필드가 필요하지 않습니다.

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

`language` 필드는 OpenAI STT 공급자에만 적용됩니다. 받아쓰기의 경우 `features.dictation.stt.language`을 설정하고 음성 모드의 경우 `features.voiceMode.stt.language`을 설정합니다. 음성 언어가 생략되면 Paseo는 `en`으로 대체되기 전에 받아쓰기 언어를 사용합니다. 로컬 앵무새 모델에는 영향을 미치지 않습니다.

## OpenAI 음성 옵션

공급자 필드를 `openai`으로 설정하고 OpenAI 자격 증명을 제공하면 받아쓰기, 음성 STT, 음성 TTS를 OpenAI로 전환할 수 있습니다.

```json
{
  "version": 1,
  "features": {
    "dictation": { "stt": { "provider": "openai" } },
    "voiceMode": {
      "stt": { "provider": "openai" },
      "tts": { "provider": "openai" }
    }
  },
  "providers": {
    "openai": {
      "stt": {
        "apiKey": "...",
        "baseUrl": "https://api.openai.com/v1"
      },
      "tts": {
        "apiKey": "...",
        "baseUrl": "https://api.openai.com/v1"
      }
    }
  }
}
```

`providers.openai.stt`은 받아쓰기 및 음성 모드 음성-텍스트를 다루고, `providers.openai.tts`은 음성 모드 텍스트-음성을 다룹니다. 독립적으로 확인되므로 STT와 TTS가 서로 다른 끝점을 가리킬 수 있습니다. 설정이 해제되면 각각은 `providers.openai.apiKey`/`baseUrl`으로 대체된 다음 `OPENAI_API_KEY`/`OPENAI_BASE_URL`으로 대체됩니다. 이러한 설정은 Codex 또는 기타 OpenAI 지원 도구를 변경하지 않고 Paseo OpenAI 음성 트래픽만 구성합니다.

Paseo는 구성된 OpenAI 기본 URL에서 다음 경로를 사용합니다.

- 받아쓰기 STT: `/v1/audio/transcriptions`
- 음성 모드 STT: `/v1/audio/transcriptions`
- 음성 모드 TTS: `/v1/audio/speech`

## 환경 변수

- `PASEO_VOICE_LLM_PROVIDER`, 음성 에이전트 제공자 재정의
- `PASEO_DICTATION_STT_PROVIDER`, `PASEO_VOICE_STT_PROVIDER`, `PASEO_VOICE_TTS_PROVIDER`, 음성 제공자 선택(`local` 또는 `openai`)
- `OPENAI_STT_API_KEY`, `OPENAI_STT_BASE_URL`, OpenAI 음성-텍스트 엔드포인트(받아쓰기 + 음성 모드 STT)
- `OPENAI_TTS_API_KEY`, `OPENAI_TTS_BASE_URL`, OpenAI 텍스트 음성 변환 엔드포인트(음성 모드 TTS)
- `PASEO_LOCAL_MODELS_DIR`, 로컬 모델 저장 디렉터리
- `PASEO_DICTATION_LOCAL_STT_MODEL`, 로컬 받아쓰기 STT 모델 ID
- `PASEO_VOICE_LOCAL_STT_MODEL`, `PASEO_VOICE_LOCAL_TTS_MODEL`, 현지 음성 STT/TTS 모델 ID
- `PASEO_DICTATION_LANGUAGE`, 받아쓰기 STT 언어(OpenAI STT만 해당, 로컬 앵무새는 무시함)
- `PASEO_VOICE_LANGUAGE`, 음성 모드 STT 언어; 설정 해제 시 `PASEO_DICTATION_LANGUAGE`으로 대체됩니다(OpenAI STT만 해당, 로컬 앵무새는 무시됨).
- `PASEO_VOICE_LOCAL_TTS_SPEAKER_ID`, `PASEO_VOICE_LOCAL_TTS_SPEED`, 선택적으로 로컬 음성 TTS 튜닝

## 운영 참고 사항

음성 모드에서는 에이전트를 시작하고 제어할 수 있습니다. 특히 작업 디렉터리나 파괴적인 작업을 지정할 때 직접 상담원 지침과 마찬가지로 음성 프롬프트를 주의해서 다루십시오.