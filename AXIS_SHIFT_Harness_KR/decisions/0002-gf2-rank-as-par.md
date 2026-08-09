# ADR-0002: 차이 행렬의 `GF(2)` 랭크를 공식 Par로 사용한다

- **상태**: 채택
- **결정일**: 2026-08-09
- **최종 검토**: 2026-08-09
- **관련 phase**: M00, M02~M08
- **관련 불변식**: INV-005, INV-006, INV-007
- **관련 문서**: `docs/PUZZLE_MATH.md`, `docs/TECHNICAL_WHITEPAPER.md` §4.3

## 1. 맥락

각 이동은 선택 행 벡터와 열 벡터의 외적, 즉 rank 1 이하 행렬을 현재 보드에 XOR로 더한다. 퍼즐이 “최소 몇 번”인지 generator·Hint·등급이 모두 같은 정확한 기준을 가져야 한다.

## 2. 결정

현재 보드 `B`와 목표 `T`의 차이 `D = B XOR T`에 대해 다음을 공식 규칙으로 사용한다.

```text
Par(B, T) = rank_GF2(D)
```

canonical Gaussian elimination/factorization으로 정확히 rank개 PULSE를 생성한다.

## 3. 세부 계약

- rank는 `GF(2)`에서 XOR elimination으로 계산한다.
- pivot 탐색·행 교환 순서를 고정해 canonical solution을 결정적으로 만든다.
- 저장된 `optimalPulseCount`는 개발·validator에서 재계산 값과 대조한다.
- Hint 1은 현재 차이 행렬 rank, Hint 2·3은 같은 canonical factorization을 사용한다.
- 등급 S의 기준은 사용 PULSE가 Par와 같은지다.

## 4. 근거

rank는 하한이다. rank 1 이하 PULSE k개의 합은 rank가 k를 넘을 수 없으므로 k는 `rank(D)` 이상이다. 동시에 elimination에서 rank개 외적으로 D를 구성할 수 있어 상한도 rank다. 따라서 최소 PULSE와 정확히 같다.

## 5. 결과와 트레이드오프

### 이점

- 추정이 아닌 증명 가능한 최소해
- 빠른 계산과 작은 상태
- generator·Hint·등급 통일
- 테스트 가능한 독창적 게임 설명

### 비용·제약

- 공개 PULSE 규칙을 유지해야 정리가 성립한다.
- 장애물·가중 이동·축 비용 같은 예외를 바로 추가할 수 없다.
- canonical 해답은 유일한 최적해가 아니라 결정적으로 선택한 한 해답이다.

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| BFS로 매 퍼즐 최소해 검색 | 규칙 일반화 가능 | 6×6 상태 공간에 불필요, 수학적 구조를 버림 |
| generator가 사용한 이동 수를 Par로 저장 | 구현 단순 | 더 짧은 해답 존재 가능, 등급 오답 |
| 인간 추정 난도만 사용 | 체감 반영 | Hint·S 등급 최소해 기준을 제공하지 못함 |

## 7. 검증·집행

- 3×3 512개 차이 행렬 BFS 오라클 패리티
- 크기 4~8 고정 seed property test
- factorization round-trip
- level validator와 Daily audit의 Par 재계산

## 8. 변경 조건

PULSE 규칙 자체를 바꾸거나 비용이 이동별로 달라지는 별도 모드를 설계할 때만 새로운 최적화 모델을 검토한다. 기존 v1 모드의 Par 정의는 유지한다.
