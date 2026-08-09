# ADR-0007: v1.0은 로컬 전용 데이터와 런타임 AI API 없음 원칙을 유지한다

- **상태**: 채택
- **결정일**: 2026-08-09
- **최종 검토**: 2026-08-09
- **관련 phase**: 전역
- **관련 불변식**: INV-001, INV-011, INV-017, INV-019
- **관련 문서**: `docs/TECHNICAL_WHITEPAPER.md` §1.2 비목표, §3, §4.9

## 1. 맥락

행사 맥락상 AI를 게임 런타임에 넣고 싶은 유인이 있지만 코어 규칙에는 모델 추론이 필요하지 않다. 외부 API는 key, 비용, 지연, 장애, 개인정보, 오프라인 실패를 추가한다. 계정·분석도 v1의 짧은 개발 기간과 서버 없는 구조에 필수적이지 않다.

## 2. 결정

v1.0은 진행도·설정을 LocalStorage에만 저장한다. 계정, backend, 외부 AI/LLM API, 원격 analytics, 광고 SDK, 외부 font CDN, hotlink asset을 포함하지 않는다. Codex는 개발 도구로 사용하되 런타임 의존성이 아니다.

## 3. 세부 계약

- 수집하는 이름·이메일·위치·contact·식별자는 없다.
- cookie를 사용하지 않는다.
- sharing payload에 사용자 ID가 없다.
- storage key와 데이터 목적을 About/Privacy에 설명한다.
- optional Web API 실패 시 핵심 게임은 유지한다.
- 모든 runtime asset은 same-origin 또는 build bundle이다.
- 향후 analytics는 별도 ADR·동의·privacy review 없이는 도입하지 않는다.

## 4. 근거

게임 링크의 즉시성·오프라인·저비용·신뢰성이 높아지고 제출 환경의 외부 장애를 제거한다. Codex 협업 평가는 개발 과정과 검증 기록으로 충분히 증명할 수 있다.

## 5. 결과와 트레이드오프

### 이점

- API key·서버비·rate limit 없음
- 개인정보·약관 범위 단순
- 오프라인·정적 배포 가능
- 외부 서비스 장애가 게임을 막지 않음

### 비용·제약

- 기기 간 기록·streak 동기화 없음
- 글로벌 랭킹·친구 비교 없음
- 실제 사용량 분석이 없음
- LocalStorage 삭제 시 진행도 손실

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| OpenAI API 힌트·해설 | 행사 연계 | 규칙에 불필요, 비용·지연·키 위험 |
| Firebase 계정·랭킹 | 유지율·경쟁 | 일정·개인정보·offline 복잡성 |
| 익명 analytics | 제품 데이터 | v1 제출에 필수 아님, 동의·정책 추가 |
| 외부 font CDN | 디자인 편의 | offline·privacy·성능 계약 위반 |

## 7. 검증·집행

- production network request audit
- cookie·storage key inventory
- secret scan과 bundle 문자열 검사
- CSP self-origin 정책
- dependencies·asset license audit

## 8. 변경 조건

v1 출시 후 명확한 제품 질문과 최소 데이터 요구가 정의되고, 사용자 동의·보존 기간·옵트아웃·보안·비용을 포함한 별도 ADR이 승인될 때만 원격 기능을 검토한다.
