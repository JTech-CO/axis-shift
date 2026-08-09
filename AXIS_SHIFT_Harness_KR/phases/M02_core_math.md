# M02 — Board & GF(2) Domain Core ★

- **상태**: 미시작
- **담당 범위**: 보드 모델, PULSE, `GF(2)` 랭크, 정규 분해, 수학 오라클
- **최종 갱신**: 2026-08-09

## 1. 맥락과 목표

퍼즐 생성, Hint, Par, 등급, 결과 공유는 모두 같은 수학 코어에 의존한다. 이 phase에서 UI·저장·시간과 무관한 단일 TypeScript 기준 구현을 만들고, 전체 3×3 상태 공간과 대량 property test로 최소 펄스 정리를 검증한다.

## 2. 범위

### 포함

- `BoardRows`, `EncodedPulse`, 보드 guard·직렬화
- 셀·마스크·보드 변환 유틸리티
- `applyPulse`, 차이 행렬, 완료 판정
- `rankGF2`, canonical factorization
- brute-force 독립 오라클
- 3×3 전수, 4×4~8×8 property test
- 도메인 오류 타입과 공개 API

### 제외

- React reducer, 애니메이션, 입력 처리
- 난도 점수·퍼즐 생성
- 저장·공유·Daily 날짜
- 실제 Hint UI

## 3. 진입조건 (DoR)

- [ ] M01 DoD 통과.
- [ ] ADR-0001과 ADR-0002가 채택 상태.
- [ ] `docs/PUZZLE_MATH.md`의 용어·피벗·분해 계약 확인.
- [ ] 보드 지원 범위 3~8과 v1 콘텐츠 범위 3~6 확정.
- [ ] INV-003~007, INV-018 확인.

## 4. 입력·산출물 계약

### 입력

- `PuzzleDefinition`, `BoardRows`, `EncodedPulse` 스키마
- M00 고정 fixture
- `docs/PUZZLE_MATH.md`의 정리와 canonical 규칙

### 산출물

```text
src/domain/types.ts
src/domain/board/board.ts
src/domain/board/pulse.ts
src/domain/board/guards.ts
src/domain/algebra/gf2-rank.ts
src/domain/algebra/factorization.ts
src/domain/algebra/bruteforce-oracle.test.ts
src/domain/**.test.ts
```

- core math coverage 리포트
- 3×3 전수 패리티 결과
- 공개 함수 계약 문서

## 5. 작업 순서

1. 보드 불변식 guard와 bit masking 테스트를 먼저 작성한다.
2. PULSE exact-cell, involution, commutativity 테스트와 구현을 만든다.
3. 결정적 pivot 순서를 가진 `rankGF2`를 구현한다.
4. 같은 pivot 정책으로 canonical factorization을 구현한다.
5. `GF(2)` 정리와 독립적인 3×3 BFS 오라클을 작성한다.
6. 512개 모든 차이 행렬에서 `oracleMinMoves === rankGF2`를 검사한다.
7. 4×4~8×8 무작위 유효 행렬에서 분해 round-trip·rank bounds를 검사한다.
8. 도메인 공개 API를 고정하고 중복 구현 검색을 추가한다.

## 6. 참조

- **불변식**: INV-003, INV-004, INV-005, INV-006, INV-007, INV-018
- **ADR**: `0001-single-source-domain-core.md`, `0002-gf2-rank-as-par.md`
- **기술 백서**: §2.2, §2.3.1~2, §4.3, §7.3, §8.1
- **수학 명세**: `docs/PUZZLE_MATH.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — 유효 보드**: 3~8 크기의 정상 입력만 통과하고 길이·범위·보드 밖 비트·비자명성 오류를 구분한다. property test 통과. E3. (INV-004)
- [ ] **DOD-02 — PULSE 정확성**: 선택 교차점만 반전되고 빈 축은 no-op이며 UI가 아닌 코어에서도 안전하게 처리된다. 모든 크기 property test 통과. E3. (INV-005)
- [ ] **DOD-03 — 대수 성질**: 동일 PULSE 두 번은 원상 복구되고 임의 두 PULSE의 적용 순서가 최종 보드에 영향을 주지 않는다. E3. (INV-005)
- [ ] **DOD-04 — 전수 최소해 패리티**: 3×3 차이 행렬 512개 전부에서 독립 BFS 오라클의 최소 PULSE 수와 `rankGF2`가 일치한다. mismatch=0. E3. (INV-006)
- [ ] **DOD-05 — 분해 round-trip**: canonical factorization의 펄스 수가 rank와 같고 합성 결과가 원본 차이 행렬과 비트 단위 일치한다. 3×3 전수 + 크기별 고정 시드 10,000건에서 실패 0. E3. (INV-006)
- [ ] **DOD-06 — 결정성**: 같은 입력은 반복 실행·배열 복제·테스트 순서와 무관하게 동일 rank와 동일 canonical pulse 순서를 반환한다.
- [ ] **DOD-07 — 프레임워크 독립**: `src/domain/`의 React, DOM, Date, LocalStorage, navigator, network import가 0건이다. (INV-003)
- [ ] **DOD-08 — 단일 기준 구현**: rank·pulse·factorization의 별도 구현이 `features`, `components`, `services`, `scripts`에 존재하지 않는다. script는 domain 공개 API를 import한다. (INV-006)
- [ ] **DOD-09 — 커버리지**: `board`, `pulse`, `gf2-rank`, `factorization`, `guards`의 statements/branches/functions/lines가 각각 100%다. 임계치 완화 금지. (INV-018)
- [ ] **DOD-10 — 문서 정합성**: 공개 함수·canonical 규칙·테스트 오라클을 `docs/PUZZLE_MATH.md`, 추적표, `PROGRESS.md`에 반영한다.

## 8. 검증 명령

```bash
npm run typecheck
npm run test -- src/domain
npm run test:coverage -- src/domain
npm run test:math:exhaustive
npm run check:boundaries
npm run verify
```

`test:math:exhaustive` 출력은 최소 다음을 포함한다.

```text
matrixCount=512
rankMismatch=0
factorizationMismatch=0
pulseInvariantFailures=0
```

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| M00 fixture | 정규 분해를 손으로 적용 | 목표와 정확히 일치, 펄스 수=Par | fixture 기록 |
| 디버그 출력 | 3×3 단일 행렬의 elimination 단계 확인 | 문서의 pivot 규칙과 동일 | 로그 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- board, rank, factorization을 분리 커밋한다.
- 최적화가 정합성을 깨면 검증된 단순 구현으로 즉시 롤백한다.
- 공개 타입 변경이 필요하면 후속 코드 작성 전에 ADR과 백서를 갱신한다.

## 12. 리스크·미지수

- brute-force 오라클이 rank 구현을 재사용하면 독립 검증이 무효가 된다.
- JavaScript bitwise 연산의 32비트 signed 특성. v1 최대 8비트로 제한한다.
- canonical 순서가 명시되지 않으면 Hint·snapshot이 환경별로 표류할 수 있다.

## 13. STOP 트리거

- 3×3 전수에서 mismatch 1건 이상.
- 분해를 맞추기 위해 rank 또는 fixture를 하드코딩해야 함.
- 8비트 범위를 넘어야만 후속 요구를 충족함.
- core coverage를 낮춰야 통과 가능함.

## 14. 다음 phase 인계

- 안정된 domain 공개 API와 타입
- 512개 golden vector 또는 생성 가능한 오라클
- canonical factorization fixture
- 생성기·Hint·등급이 참조할 단일 Par 계산 함수
