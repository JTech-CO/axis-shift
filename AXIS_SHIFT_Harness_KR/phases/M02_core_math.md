# M02 — Board & GF(2) Domain Core ★

- **상태**: 완료
- **담당 범위**: 보드 모델, PULSE, `GF(2)` 랭크, 정규 분해, 수학 오라클
- **최종 갱신**: 2026-08-21

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

- [x] M01 DoD 통과.
- [x] ADR-0001과 ADR-0002가 채택 상태.
- [x] `docs/PUZZLE_MATH.md`의 용어·피벗·분해 계약 확인.
- [x] 보드 지원 범위 3~8과 v1 콘텐츠 범위 3~6 확정.
- [x] INV-003~007, INV-018 확인.

프로젝트 오너가 2026-08-21 M02 진행과 완료 후 commit·push를 명시적으로 승인했다. 위 선행 문서와 M01 완료 상태를 재확인한 뒤 구현을 시작했다.

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

- [x] **DOD-01 — 유효 보드**: 3~8 크기의 정상 입력만 통과하고 길이·범위·보드 밖 비트·비자명성 오류를 구분한다. property test 통과. E3. (INV-004)
- [x] **DOD-02 — PULSE 정확성**: 선택 교차점만 반전되고 빈 축은 no-op이며 UI가 아닌 코어에서도 안전하게 처리된다. 모든 크기 property test 통과. E3. (INV-005)
- [x] **DOD-03 — 대수 성질**: 동일 PULSE 두 번은 원상 복구되고 임의 두 PULSE의 적용 순서가 최종 보드에 영향을 주지 않는다. E3. (INV-005)
- [x] **DOD-04 — 전수 최소해 패리티**: 3×3 차이 행렬 512개 전부에서 독립 BFS 오라클의 최소 PULSE 수와 `rankGF2`가 일치한다. mismatch=0. E3. (INV-006)
- [x] **DOD-05 — 분해 round-trip**: canonical factorization의 펄스 수가 rank와 같고 합성 결과가 원본 차이 행렬과 비트 단위 일치한다. 3×3 전수 + 크기별 고정 시드 10,000건에서 실패 0. E3. (INV-006)
- [x] **DOD-06 — 결정성**: 같은 입력은 반복 실행·배열 복제·테스트 순서와 무관하게 동일 rank와 동일 canonical pulse 순서를 반환한다.
- [x] **DOD-07 — 프레임워크 독립**: `src/domain/`의 React, DOM, Date, LocalStorage, navigator, network import가 0건이다. (INV-003)
- [x] **DOD-08 — 단일 기준 구현**: rank·pulse·factorization의 별도 구현이 `features`, `components`, `services`, `scripts`에 존재하지 않는다. script는 domain 공개 API를 import한다. (INV-006)
- [x] **DOD-09 — 커버리지**: `board`, `pulse`, `gf2-rank`, `factorization`, `guards`의 statements/branches/functions/lines가 각각 100%다. 임계치 완화 금지. (INV-018)
- [x] **DOD-10 — 문서 정합성**: 공개 함수·canonical 규칙·테스트 오라클을 `docs/PUZZLE_MATH.md`, 추적표, `PROGRESS.md`에 반영한다.

## 8. 검증 명령

```bash
npm run typecheck
npm run test -- src/domain
npm run test:coverage
npm run test:coverage:domain
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
| M00 fixture | 정규 분해를 손으로 적용 | 목표와 정확히 일치, 펄스 수=Par | `M00-MAIN-v1`: diff=`[11,6,13,6]`, rank=2, canonical=`[{colMask:13,rowMask:5},{colMask:6,rowMask:11}]`, solved=true |
| pivot 구조 계약 | production source를 `?raw`로 읽어 outer column loop가 0부터 증가하고, `pivotRow=rank`에서 시작해 한 행씩 탐색하는 순서를 고정 | bit 0부터 증가, 현재 pivot row 이상의 첫 행 선택 | `gf2-rank.test.ts` source-structure contract + 구현 review; 수치 정확성은 3×3 `rankMismatch=0` |

## 10. 증거

```text
environment: Windows, node=v24.19.0, npm=11.6.2
npm run typecheck: exit=0
npm run test -- src/domain: files=6 tests=27 failures=0
npm run test:coverage:
  files=8 tests=32 failures=0
  statements=99.38 branches=100 functions=97.5 lines=99.32
npm run test:coverage:domain:
  targetFiles=board,pulse,gf2-rank,factorization,guards
  each statements=100 branches=100 functions=100 lines=100
  total statements=131 branches=59 functions=26 lines=117
npm run test:math:exhaustive:
  matrixCount=512 oracleUnvisited=0 rankMismatch=0 factorizationMismatch=0
  pulseInvariantFailures=0 randomMatrices=50000 determinismFailures=0
M00-MAIN-v1:
  diff=[11,6,13,6] rank=2
  canonical=[{colMask:13,rowMask:5},{colMask:6,rowMask:11}]
  solved=true
npm run validate:levels:
  files=0 validatorSelfChecks=2 failures=0
npm run check:boundaries:
  files=43 edges=40 violations=0 cycles=0 lintFixtures=4 lintAssertions=7
  cycleFixtures=1 coreFiles=27 coreFixtureImplementations=5 coreFixtureAssertions=2
npm run verify:
  scriptContract required=16 missing=0; test files=8 tests=32 failures=0
  secretFindings=0; build=pass; pagesArtifact files=14; passed steps=10
```

전역 `npm run test:coverage`는 기존 공개 명령과 실행된 전체 제품 source 보고 범위를 그대로 유지하며 임계치를 좁히지 않는다. M02의 지정 5파일 per-file 100% 검증은 이를 대체하지 않는 추가 gate로서 `vitest.domain.config.ts`와 `npm run test:coverage:domain`에 분리한다. 두 명령 모두 로컬 최종 검증과 CI에 연결한다.

프레임워크 금지 import는 boundary checker가 담당한다. 코어 중복 AST 검사는 production 경로에서 `applyPulse`·`applyPulses`·`rankGF2`·`gf2Rank`·`factorizeGF2`라는 이름의 함수 선언·함수값·메서드를 찾는 보조 gate이며, 의미적으로 같은 이름 변경 구현까지 증명하는 검사가 아니다. DOD-08은 이 자동 gate와 전체 occurrence 검색·diff code review를 함께 적용해 닫았다. 역사적 H00/M00 proof prototype은 production 단일 기준 구현 검사 대상에서 제외하고 동결 보존한다.

## 11. 롤백 계획

- board, rank, factorization을 분리 커밋한다.
- 최적화가 정합성을 깨면 검증된 단순 구현으로 즉시 롤백한다.
- 공개 타입 변경이 필요하면 후속 코드 작성 전에 ADR과 백서를 갱신한다.

## 12. 리스크·미지수

- 독립 BFS 오라클은 `rankGF2`와 factorization을 재사용하지 않으며 3×3 전체 512개 상태를 방문했다.
- JavaScript bitwise 연산의 32비트 signed 특성은 엔진 guard를 3~8로 제한해 격리했다. v1 콘텐츠 범위는 3~6을 유지한다.
- canonical 순서는 낮은 열·행 우선 pivot과 basis 채택 순서로 고정했고 50,000개 고정 시드 행렬에서 결정성 실패가 없었다.
- M02는 수학 코어만 고정한다. 생성·난도·콘텐츠 유효성은 M03 gate에서 별도로 검증한다.

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
- M03는 `phases/M03_generator_content.md`의 DoR를 별도로 확인한 뒤 착수한다. M02 완료는 생성기·54개 콘텐츠·10년 Daily 감사를 선완료 처리하지 않는다.
