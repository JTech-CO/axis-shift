# ADR-0001: 퍼즐 규칙을 단일 TypeScript 도메인 코어로 유지한다

- **상태**: 채택
- **결정일**: 2026-08-09
- **최종 검토**: 2026-08-09
- **관련 phase**: M01~M10
- **관련 불변식**: INV-003, INV-005, INV-006, INV-018
- **관련 문서**: `docs/TECHNICAL_WHITEPAPER.md` §1.3, §4.1, §6

## 1. 맥락

PULSE, 랭크, 분해, 생성, Hint, 등급을 UI·script·feature마다 다시 구현하면 미세한 차이가 전체 퍼즐 정합성을 깨뜨린다. 정적 웹 게임이므로 서버와 클라이언트 사이의 복제 구현도 필요하지 않다.

## 2. 결정

보드 규칙, `GF(2)` 대수, generator, scoring의 기준 구현을 `src/domain/`의 순수 TypeScript 모듈에 한 번만 둔다. UI, build script, validator, E2E helper는 공개 API를 호출하며 알고리즘을 복사하지 않는다.

## 3. 세부 계약

- domain은 React, DOM, LocalStorage, Date, navigator, network를 import하지 않는다.
- 시간·저장·seed source는 port로 주입한다.
- public export는 의도된 entrypoint에서만 제공한다.
- script가 성능상 별도 구현을 요구해도 먼저 domain API 재사용·batching을 검토한다.
- 다른 언어 재구현이 추가되면 golden vector parity gate를 만든다.

## 4. 근거

단일 기준은 Codex가 리팩터링한 뒤에도 테스트 오라클과 제품이 같은 규칙을 쓰게 하고, 버그 수정 위치를 하나로 제한한다. 작은 보드이므로 브라우저 TypeScript 성능도 충분하다.

## 5. 결과와 트레이드오프

### 이점

- 규칙 표류와 중복 버그 감소
- UI 없는 빠른 전수·property test
- generator·Hint·grade의 Par 일치
- 동일 코어를 scripts와 runtime에서 재사용

### 비용·제약

- UI 편의를 위해 domain 타입을 임의 변형할 수 없다.
- port·adapter 경계를 초기에 설계해야 한다.
- domain 공개 API 변경이 많은 consumer에 영향을 준다.

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| feature별 독립 구현 | 초기 연결이 빠름 | 장기 정합성 위험이 INV-005·006과 충돌 |
| WebAssembly 별도 코어 | 이론상 성능 | 3~8 보드에 과도한 복잡성, 접근·빌드 비용 |
| 서버 기준 계산 | 중앙 통제 | 오프라인·정적 배포 원칙 위반 |

## 7. 검증·집행

- ESLint import boundary와 순환 의존성 검사
- 중복 핵심 함수명·연산 패턴 코드 검색
- M02 전수 테스트와 M03 script parity
- 구조 변경 시 ADR과 `docs/FILE_TREE.md` 갱신

## 8. 변경 조건

실측 성능이 제품 예산을 충족하지 못하고 최적화 후에도 병목이 domain 계산임이 profile로 증명될 때만 대체 구현을 검토한다. 그 경우 동일 golden vector 100% parity가 선행 조건이다.
