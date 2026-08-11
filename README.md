# Paseo 한국어 문서

Paseo 공식 문서의 비공식 한국어 미러입니다. 원문과 이미지의 권리는 각 권리자에게 있으며, 내용이 다르면 [paseo.sh/docs](https://paseo.sh/docs)가 우선합니다.

## 갱신 및 배포

`npm run sync`는 공개 Paseo 저장소의 `public-docs`를 한국어 Markdown으로 갱신합니다. 기본 입력 경로는 로컬 체크아웃의 `.upstream/public-docs`이며, `PASEO_DOCS_SOURCE` 환경 변수로 변경할 수 있습니다.

`npm run build`는 GitHub Pages용 정적 파일을 `dist`에 생성합니다.
