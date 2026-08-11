# AXIS//SHIFT 퍼즐 수학·구현 오라클

**버전**: 1.0.0  
**상태**: M02 계약 초안  
**최종 갱신**: 2026-08-09  
**관련 결정**: ADR-0001, ADR-0002  
**관련 불변식**: INV-004, INV-005, INV-006, INV-007

## 1. 목적

이 문서는 다음 다섯 항목의 단일 기준이다.

1. PULSE가 어떤 셀을 바꾸는가.
2. 왜 차이 행렬의 `GF(2)` 랭크가 최소 PULSE 수인가.
3. rank개 PULSE로 실제 해답을 어떻게 결정적으로 구성하는가.
4. 구현이 정리를 잘못 사용하지 않았는지 독립 오라클로 어떻게 검증하는가.
5. Par와 별개로 단일 축 순회 전략을 어떻게 탐지하는가.

사용자에게 첫 플레이부터 이 수학을 설명하지 않는다. 게임 화면에서는 “행과 열을 고르면 교차점이 반전된다”와 “Par는 증명된 최소 PULSE 수”만 사용한다. 상세 설명은 About 또는 기술 문서에서 제공한다.

## 2. 기호와 상태 공간

보드 크기를 `N`이라 하고 v1.0 콘텐츠는 `3 <= N <= 6`, 내부 엔진은 `3 <= N <= 8`을 지원한다.

```text
B ∈ GF(2)^(N×N)   현재 보드
T ∈ GF(2)^(N×N)   목표 보드
D = B + T          차이 행렬
```

`GF(2)`의 원소는 0과 1이고 덧셈·뺄셈은 모두 XOR다.

```text
0 + 0 = 0
0 + 1 = 1
1 + 0 = 1
1 + 1 = 0
```

따라서 `D = B XOR T`이며, `D_ij = 1`인 셀만 현재와 목표가 다르다.

## 3. 비트 표현 계약

```ts
export type BoardRows = readonly number[];
```

`BoardRows[i]`는 i번째 행의 N개 셀을 N비트 정수로 저장한다.

### 3.1 Harness 구현 관례

원문 백서는 각 행을 비트 정수로 표현한다고 정의하지만 화면 열과 비트 방향까지 고정하지 않았다. 이 하네스는 M02 구현 관례를 다음처럼 고정한다.

```text
행 index i → BoardRows[i]
열 index j → bit j
왼쪽 첫 열 → bit 0
```

즉 셀 읽기는 다음과 같다.

```ts
const cell = (rows[i] >> j) & 1;
```

이 선택은 수학 결과에 영향을 주지 않지만 직렬화·golden vector·Canvas·signature의 결정성에는 영향을 준다. 방향을 바꾸려면 이 문서, 모든 golden vector, renderer adapter를 같은 변경에서 갱신하고 ADR을 남긴다. `number.toString(2)`의 표시 순서를 UI 열 순서로 직접 사용하지 않는다.

### 3.2 유효 범위

```ts
const boardMask = (1 << size) - 1;
```

유효 보드 조건:

```text
rows.length = size
3 <= size <= 8
0 <= rows[i] <= boardMask
```

유효 축 마스크 조건:

```text
0 <= rowMask <= boardMask
0 <= colMask <= boardMask
```

UI는 `rowMask=0` 또는 `colMask=0`일 때 PULSE를 비활성화한다. domain의 `applyPulse`는 방어적으로 이를 no-op으로 처리하거나 명시적 result를 반환하되, throw/no-op 정책을 public API에서 하나로 고정한다.

## 4. PULSE의 정의

선택 행을 N차원 열벡터 `r`, 선택 열을 N차원 행벡터 `c^T`로 나타낸다.

```text
r_i = 1  ⇔  i번째 행 선택
c_j = 1  ⇔  j번째 열 선택
```

한 PULSE가 만드는 행렬은 외적이다.

```text
P = r c^T
P_ij = r_i · c_j
```

`GF(2)`에서 곱셈은 일반 0/1 곱셈이므로, `P_ij=1`인 곳은 선택한 행과 열의 교차점뿐이다.

다음 보드:

```text
B' = B + P = B XOR P
```

비트 행 표현에서는 선택된 각 행에 `colMask`를 XOR한다.

```ts
function applyPulse(
  rows: BoardRows,
  size: number,
  rowMask: number,
  colMask: number,
): BoardRows {
  const limit = (1 << size) - 1;
  const safeRows = rowMask & limit;
  const safeCols = colMask & limit;

  if (safeRows === 0 || safeCols === 0) return rows.slice();

  return rows.map((row, i) =>
    ((safeRows >> i) & 1) === 1 ? (row ^ safeCols) & limit : row,
  );
}
```

실제 구현은 guard와 immutable policy를 별도 함수로 둘 수 있으나 결과는 위 식과 같아야 한다.

## 5. PULSE의 기본 불변식

### 5.1 정확한 영향 범위

```text
B'_ij ≠ B_ij  ⇔  r_i=1 AND c_j=1
```

선택 교차점 밖의 셀은 바뀌지 않는다.

### 5.2 Involution

같은 PULSE를 두 번 적용하면 원상 복구된다.

```text
(B + P) + P = B + (P + P) = B
```

### 5.3 Commutativity

PULSE A와 Q의 순서를 바꿔도 최종 보드는 같다.

```text
(B + P) + Q = B + P + Q = (B + Q) + P
```

이 성질로 Undo는 직전 PULSE를 다시 XOR하는 것과 같다. UI의 move history는 사용자 흐름을 위해 순서를 보존하지만 최종 보드 계산 자체는 순서에 의존하지 않는다.

## 6. 해결 문제

k개의 PULSE `P_1, ..., P_k`로 목표에 도달한다는 것은 다음과 같다.

```text
T = B + P_1 + ... + P_k
D = B + T = P_1 + ... + P_k
```

따라서 퍼즐 해결은 차이 행렬 D를 가능한 적은 외적 행렬의 XOR 합으로 표현하는 문제다.

각 PULSE는 다음 형식이다.

```text
P_l = r_l c_l^T
```

`r_l`과 `c_l`이 모두 비영이면 rank 1, 어느 한쪽이 0이면 rank 0이다. UI는 rank 0 이동을 허용하지 않는다.

## 7. 최소 PULSE 수 정리

### 정리

```text
minimumPulses(B, T) = rank_GF2(B + T)
```

차이 행렬 `D`의 rank를 `r`이라 하자.

### 7.1 하한

rank의 subadditivity에 의해:

```text
rank(D)
= rank(P_1 + ... + P_k)
<= rank(P_1) + ... + rank(P_k)
<= k
```

따라서 D를 만드는 어떤 해답도 최소 r개 이상의 PULSE가 필요하다.

```text
minimumPulses >= r
```

### 7.2 상한

rank r인 모든 행렬은 full-rank factorization을 가진다.

```text
D = U V
U ∈ GF(2)^(N×r)
V ∈ GF(2)^(r×N)
```

U의 k번째 열을 `u_k`, V의 k번째 행을 `v_k^T`라 하면 행렬 곱을 외적의 합으로 전개할 수 있다.

```text
D = u_1 v_1^T + ... + u_r v_r^T
```

각 항은 하나의 유효 PULSE다. 따라서 r개 PULSE로 D를 만들 수 있다.

```text
minimumPulses <= r
```

하한과 상한이 같으므로:

```text
minimumPulses = r
```

### 7.3 축 순회 상한과 난도 보조 지표

차이 행렬 `D`의 j번째 열을 `d_j`, j번째 단위벡터를 `e_j`라 하면 다음 분해는 항상 성립한다.

```text
D = Σ_j d_j e_j^T
```

비영 열마다 `rowMask=d_j`, `colMask=e_j`인 PULSE를 한 번 실행하면 그 열을 목표와 맞출 수 있다. 따라서 왼쪽부터 열을 하나씩 처리하는 해법은 비영 열 수 이하에 끝난다. 전치한 논리로 위에서부터 행을 하나씩 처리하는 해법은 비영 행 수 이하에 끝난다.

```text
nonzeroRows(D) = 1을 하나 이상 포함한 행 수
nonzeroCols(D) = 1을 하나 이상 포함한 열 수
sweepBound(D) = min(nonzeroRows(D), nonzeroCols(D))

rank_GF2(D) <= sweepBound(D) <= N
```

Par보다 축 순회가 얼마나 더 비효율적인지를 다음처럼 기록한다.

```text
compressionGap(D) = sweepBound(D) - rank_GF2(D)
```

`compressionGap=0`이면 단일 행 또는 열 순회가 최적해다. 특히 정방 N×N full-rank 행렬은 모든 행과 열이 비영이고 rank가 N이므로 `sweepBound=N`, `compressionGap=0`이다. 즉 N=4에서 다른 rank 4 fixture로 교체해도 단일 축 4회 최적해는 사라지지 않는다.

이 지표는 ADR-0002의 Par를 대체하지 않는 콘텐츠 진단값이다. `compressionGap>0`은 단일 축 순회가 최적이 아님만 보장하며, 겹침 추론의 복잡도나 최적해 수처럼 사람이 느끼는 난도를 단독으로 증명하지 않는다. 난도 라벨은 최소 gap 기준, 추가 구조 지표, 사람 플레이 관찰을 함께 사용한다.

## 8. Canonical factorization 계약

최적해가 여러 개일 수 있으므로 Hint와 snapshot이 환경별로 달라지지 않게 하나의 결정적 해답을 선택한다.

### 8.1 개요

D의 열벡터를 `d_0 ... d_(N-1)`라 한다. 열 `j`의 N개 비트를 하나의 `rowMask` 정수로 표현할 수 있다.

1. 열 index `0 → N-1` 순으로 스캔한다.
2. 현재 선택한 열 basis에 새 열을 추가했을 때 rank가 증가하면 basis로 채택한다.
3. 채택된 r개 열을 U의 열로 둔다.
4. 각 원본 열 `d_j`에 대해 `U x_j = d_j`를 `GF(2)`에서 결정적으로 푼다.
5. 해 `x_j`를 V의 j번째 열로 둔다.
6. 각 k에 대해 `U[:,k]`를 rowMask, `V[k,:]`를 colMask로 하는 PULSE를 출력한다.

U의 열은 독립이므로 각 `d_j`의 coefficient `x_j`는 유일하다. basis 열 순서와 solver pivot 순서를 고정하면 결과도 결정적이다.

### 8.2 고정 순서

- basis 후보 열: 화면 기준 왼쪽에서 오른쪽, 즉 bit index 0부터.
- elimination pivot row: index 0부터 증가.
- 동일 조건에서 최초 가능한 pivot을 선택.
- 출력 PULSE: basis에 채택된 열 순서.

성능 최적화로 순서를 바꾸지 않는다. 순서를 바꾸는 것은 수학적 Par는 유지해도 Hint·signature fixture를 바꾸므로 공개 계약 변경이다.

### 8.3 출력 불변식

`factorizeGF2(D)`가 pulses를 반환할 때:

```text
pulses.length = rankGF2(D)
XOR(outer(pulse[k])) = D
pulse[k].rowMask != 0
pulse[k].colMask != 0
```

D가 영행렬이면 빈 배열을 반환한다.

## 9. 3×3 예시

차이 행렬을 다음처럼 두자. 열 index 0이 표의 왼쪽이다.

```text
D =
1 1 0
1 0 1
0 1 1
```

세 번째 열은 첫 번째와 두 번째 열의 XOR다.

```text
d2 = d0 + d1
rank(D) = 2
```

왼쪽부터 독립 열을 고르면:

```text
U = [d0 d1]

U =
1 1
1 0
0 1
```

각 D 열의 coefficient는:

```text
d0 = 1·d0 + 0·d1
d1 = 0·d0 + 1·d1
d2 = 1·d0 + 1·d1
```

따라서:

```text
V =
1 0 1
0 1 1
```

두 PULSE:

```text
P0: rows {0,1}, cols {0,2}
    rowMask = 0b011
    colMask = 0b101

P1: rows {0,2}, cols {1,2}
    rowMask = 0b101
    colMask = 0b110
```

`P0 XOR P1 = D`이며 Par는 2다.

## 10. `rankGF2` 기준 알고리즘

아래는 개념 의사코드다. 실제 구현은 allocation을 줄일 수 있으나 pivot 의미를 바꾸지 않는다.

```text
rankGF2(rows, size):
  a = masked copy of rows
  pivotRow = 0

  for col from 0 to size-1:
    find first row i >= pivotRow where bit(a[i], col) = 1
    if none: continue

    swap a[pivotRow], a[i]

    for row from 0 to size-1:
      if row != pivotRow and bit(a[row], col) = 1:
        a[row] = a[row] XOR a[pivotRow]

    pivotRow += 1
    if pivotRow == size: break

  return pivotRow
```

RREF까지 제거하는 것은 canonical debugging에 유리하다. rank만 필요하면 아래 행만 제거할 수 있으나 두 경로를 별도 구현하지 않는 것을 권장한다.

## 11. 독립 brute-force 오라클

rank 구현을 rank 자체로 검증하면 공통 버그를 놓친다. 3×3에서는 전체 상태가 512개뿐이므로 rank를 전혀 사용하지 않는 BFS 오라클을 만든다.

### 11.1 상태 인코딩

3×3 행렬을 9비트 정수로 인코딩한다.

```text
state bit (i*3 + j) = D_ij
state count = 2^9 = 512
```

### 11.2 가능한 한 번의 PULSE

비어 있지 않은 rowMask 7개와 colMask 7개 조합:

```text
pulse count = 7 × 7 = 49
```

각 pulse matrix를 9비트 상태로 미리 변환한다.

### 11.3 BFS

영행렬 state 0에서 시작해 모든 pulse와 XOR한 상태로 이동한다.

```text
distance[0] = 0
queue = [0]
while queue not empty:
  s = pop
  for p in 49 pulses:
    n = s XOR p
    if unvisited:
      distance[n] = distance[s] + 1
      push n
```

512개 모두 방문한 뒤 각 state에 대해 다음을 검사한다.

```text
distance[state] === rankGF2(decode(state))
```

오라클은 `rankGF2`, factorization, generator를 import하지 않는다.

## 12. 필수 테스트 집합

### 12.1 보드 guard

- size 2·9 거부, 3·8 허용
- 행 길이 부족·초과 거부
- 음수·소수·NaN·보드 밖 비트 거부
- 입력 배열 mutation 없음

### 12.2 PULSE

- 정확한 affected cells
- empty row/col policy
- involution
- commutativity
- board mask 유지
- input immutability

### 12.3 Rank

- zero matrix rank 0
- nonzero outer product rank 1
- identity rank N
- duplicate row·zero row
- `0 <= rank <= N`
- row operation invariant

### 12.4 Factorization

- zero → no pulse
- pulse count = rank
- every mask nonzero and in range
- round-trip exact
- repeat output exact
- 3×3 전수
- 크기 4~8 고정 seed 최소 10,000개

### 12.5 Par 패리티

필수 출력:

```text
matrixCount=512
oracleUnvisited=0
rankMismatch=0
factorizationMismatch=0
```

### 12.6 큰 보드 fixture의 독립 minor 오라클

4×4보다 큰 고정 fixture는 이동 거리 전수 BFS가 비현실적이므로 rank 구현과 독립인 minor 오라클을 함께 사용한다. 행·열 조합을 고르고 모든 순열의 곱을 XOR하는 Leibniz parity로 determinant를 계산한다. `GF(2)`에서는 부호가 사라지므로 Gaussian elimination을 재사용하지 않는다.

```text
existsNonzeroMinor(D, declaredPar) == true
existsNonzeroMinor(D, declaredPar + 1) == false  # declaredPar < N
canonicalSolution.length == declaredPar
applyAll(initial, canonicalSolution) == target
```

첫 두 조건은 exact rank를 독립 확인하고, 뒤의 두 조건은 실제 Par회 해법 상한을 확인한다. M00 5×5·6×6 후보의 `bfs=not-run`은 이동 거리 전수 BFS 범위만 뜻하며 exact rank 3은 이 minor 오라클로 검증한다.

## 13. Hint와 현재 상태

Hint는 최초 퍼즐의 Par를 재사용하지 않고 현재 보드에서 다시 계산한다.

```text
remaining = current XOR target
Hint 1 = rankGF2(remaining)
Hint 2 = factorizeGF2(remaining)[0]의 한 축
Hint 3 = factorizeGF2(remaining)[0] 전체
```

Hint 3 PULSE를 적용하면 remaining rank가 정확히 1 감소해야 한다.

## 14. Generator·콘텐츠와의 계약

각 `PuzzleDefinition`에 대해 validator는 다음을 재계산한다.

```text
D = initialRows XOR targetRows
rank = rankGF2(D)
solution = factorizeGF2(D)
```

필수 조건:

```text
initial != target
optimalPulseCount == rank
solution.length == rank
applyAll(initial, solution) == target
```

JSON의 `canonicalSolution`은 신뢰 원본이 아니라 검증·캐시 가능한 산출물이다.

난도 후보에 대해서는 정답 계약과 별도로 다음 진단값도 재계산한다.

```text
nonzeroRows = count(rows of D containing at least one 1)
nonzeroCols = count(columns of D containing at least one 1)
sweepBound = min(nonzeroRows, nonzeroCols)
compressionGap = sweepBound - rank
density = popcount(D) / (N * N)
parMatchesRank = declaredPar == rank
hardCandidatePassed = parMatchesRank
                      && nonzeroRows == N
                      && nonzeroCols == N
                      && compressionGap >= 2
```

validator는 `0 <= compressionGap <= N-rank`, `0 < density <= 1`, Par 일치와 난도별 구조 정책을 확인한다. `hardCandidatePassed`는 단일 축 순회를 최적해에서 배제할 구조 적격성일 뿐 체감 Hard 승인이 아니며 Easy도 통과할 수 있다. rank나 이 불리언 하나로 쉬움·보통·어려움 라벨을 자동 결정하지 않고 사람 플레이테스트로 최종 분류한다.

## 15. 성능과 수치 안전성

- N<=8이므로 행·열 마스크는 8비트다.
- JavaScript bitwise 연산은 signed 32비트지만 이 범위에서는 안전하다.
- floating-point tolerance가 필요한 연산이 없다.
- rank·factorization 시간복잡도는 작은 N에서 사실상 상수이며 목표 10ms 이하를 충분히 만족해야 한다.
- 성능을 위해 lookup table을 도입하더라도 기준 알고리즘과 패리티를 유지한다.

## 16. 경계 사례

| 사례 | 정책 |
|---|---|
| `B == T` | Par 0, 이미 solved. 일반 콘텐츠 validator는 비자명성 때문에 제외 |
| 빈 row/col 선택 | UI PULSE disabled; domain은 고정된 안전 정책 사용 |
| mask 범위 초과 | public guard에서 거부 또는 명시적으로 실패 result. 조용한 truncation 금지 |
| 여러 최적해 | canonical factorization 한 개만 Hint 기준으로 선택 |
| 사용자가 Par보다 적게 해결 | 수학/구현 버그. P0로 처리 |
| 저장된 Par 불일치 | 콘텐츠/저장 거부, 런타임에 잘못된 등급 표시 금지 |
| 비정사각 행렬 | v1 비목표. 후속 ADR 필요 |
| 다중 상태 셀 | `GF(2)` 정리 범위 밖. 별도 모드로 분리 |
| full-rank 정방행렬을 높은 난도로 사용 | Par는 정확하지만 단일 축 순회가 최적이다. 난도 stage가 아닌 규칙·성능 대조군으로 분류 |

## 17. 변경 관리

다음 변경은 ADR-0002를 대체하는 새 ADR과 M02 전수 재검증이 필요하다.

- PULSE가 교차점 외 셀에 영향을 줌
- 행·열마다 비용이 다름
- 셀이 0/1 외 상태를 가짐
- 장애물·잠긴 셀·가중치 추가
- 한 이동에서 여러 외적을 묶어 비용 1로 취급
- Par를 rank 외 다른 값으로 표시

기존 v1 규칙과 결과는 유지하고 새 실험은 별도 mode/version으로 구현한다.

`sweepBound`·`compressionGap`처럼 기존 PULSE와 `Par=rank`를 바꾸지 않는 파생 진단값의 추가는 ADR-0002 대체 사유가 아니다. 다만 이 지표로 공개 난도 라벨이나 콘텐츠 수용 기준을 변경하면 해당 phase 문서와 콘텐츠 검증 증거를 함께 갱신한다.
