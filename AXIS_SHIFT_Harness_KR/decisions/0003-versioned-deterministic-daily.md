# ADR-0003: Daily를 UTC·버전 기반 결정적 생성으로 운영한다

- **상태**: 채택
- **결정일**: 2026-08-09
- **최종 검토**: 2026-08-09
- **관련 phase**: M03, M07, M09~M11
- **관련 불변식**: INV-007, INV-008, INV-009, INV-012
- **관련 문서**: `docs/TECHNICAL_WHITEPAPER.md` §1.3, §4.4, §4.8

## 1. 맥락

백엔드 없이 모든 사용자가 같은 일일 퍼즐을 받아야 하며, 생성 알고리즘이 개선돼도 과거 Archive가 바뀌면 안 된다. 로컬 타임존과 `Math.random()`은 환경별 결과를 만들 수 있다.

## 2. 결정

Daily seed는 정규화한 UTC 날짜, generator version, 고정 domain string을 결합해 만든다. version registry는 날짜 구간이 사용할 generator version을 명시하며, 공개된 version 구현 또는 frozen fallback을 보존한다.

```text
seedInput = "axis-shift|daily|" + generatorVersion + "|" + YYYY-MM-DD
```

## 3. 세부 계약

- 기준 경계는 UTC 00:00이다.
- strict `YYYY-MM-DD`만 허용한다.
- 해시·PRNG는 자체 golden vector로 고정한다.
- object key iteration처럼 구현체 순서에 의존하지 않는다.
- 최대 시도 실패 시 같은 seed가 같은 검증된 fallback을 선택한다.
- default algorithm 변경은 새 version 추가이며 과거 version을 덮어쓰지 않는다.
- 오프라인에서는 기기 clock을 사용하며 조작 방지는 비목표다.

## 4. 근거

정적 사이트에서도 Daily·Archive·SNS 비교가 가능하고, 서버 비용·개인정보·장애 의존성이 없다. versioning은 코드 개선과 과거 재현성을 분리한다.

## 5. 결과와 트레이드오프

### 이점

- 네트워크 없이 동일 Daily
- 날짜 route만으로 Archive 재생성
- 테스트·재현·버그 보고가 쉬움
- 서버 운영 부담 없음

### 비용·제약

- 기기 clock 조작을 막지 못함
- 알고리즘 version을 장기간 보존해야 함
- UTC “오늘”이 현지 날짜 기대와 다를 수 있음
- 생성기 변경 관리가 엄격해짐

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| 서버에서 오늘 JSON 제공 | 시간 신뢰·교체 쉬움 | static-first·offline 위반, 운영 비용 |
| 모든 Daily를 정적 JSON으로 체크인 | 완전 고정 | 무한 Archive에 데이터 증가, 큐레이션 비용 |
| 현지 날짜 사용 | 사용자 직관 | 시간대별 서로 다른 Daily로 공유성 저하 |
| `Math.random()` | 간단 | 결정성 없음 |

## 7. 검증·집행

- seed/PRNG golden vectors
- 3,650일 audit
- timezone browser matrix
- version snapshot과 Archive regression
- adjacent target duplicate 검사

## 8. 변경 조건

온라인 경쟁·서버 계정이 도입되어 신뢰 시간과 부정행위 대응이 제품 요구가 될 때 새 ADR로 서버 보조를 검토한다. v1 공개 날짜의 결과는 유지한다.
