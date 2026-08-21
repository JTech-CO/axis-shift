# M00 — Rule Proof & Scope Lock ★

- **상태**: 완료 — DOD-01~07 통과 / 2026-08-16 formal Easy 행동 기준 5/5, aggregate-only E1 제한 보존
- **담당 범위**: 코어 규칙 이해도, 최소 프로토타입, v1.0 범위 잠금
- **최종 갱신**: 2026-08-21
- **목표**: 코어 규칙 구현·E2 체크포인트와 출시 직전 beta의 사람 대상 학습 가능성 판정을 분리해 증명

## 1. 맥락과 목표

AXIS//SHIFT의 가장 큰 제품 위험은 수학 구현이 아니라 “행과 열을 선택해 교차점을 반전한다”는 규칙이 설명 없이도 재미로 읽히는지다. 이 phase는 생산 코드와 콘텐츠를 대량 작성하기 전에 최소 프로토타입과 사람 관찰로 규칙의 실효를 확인하고, 통과한 규칙만 v1.0 범위로 잠근다.

## 2. 범위

### 포함

- Easy 4×4, Normal 4×4·5×5, Hard 4×4·5×5·6×6의 여섯 playable profile과 숨은 4×4 Full Rank 대조군
- `m00-seeded-v1` 결정적 목표 생성, Hard 4×4 initial 노이즈, URL seed 재현과 직전 target 배제
- 행·열 선택, 교차점 미리보기, PULSE, Undo, Reset, 완료
- 반복 플레이용 새 목표 신호, sweep 풀이 후 대안 안내, 플레이 스톱워치와 완료 PULSE·초 표시의 폐기형 검증
- 최대 30초 분량의 중립적 인라인 안내
- 신규 사용자 최소 5명 플레이테스트
- 핵심 규칙·모드·비목표·출시 범위 잠금
- 관찰 결과에 따른 문구·시각 표식의 소규모 반복

### 제외

- React 생산 스캐폴딩과 최종 파일 구조
- 정식 디자인 시스템, 사운드, 햅틱, 공유, PWA
- Daily·Lab·Sprint 전체 구현
- 텐서·`GF(2)`·랭크 수학 설명을 첫 플레이에 노출
- 3D, 멀티플레이, 런타임 AI API

## 3. 진입조건 (DoR)

- [x] 기술 백서와 디자인 백서 초안이 존재한다.
- [x] 공개 게임 규칙과 최소 펄스 개념이 문서화됐다.
- [x] `<HARNESS_ROOT>/docs/PLAYTEST_PROTOCOL.md` 골격을 작성할 수 있다.
- [x] 참가자 모집 순서가 프로젝트 오너 결정으로 확정됐다. formal Easy 표본은 출시 직전 playable beta에서 모집하며, 시작 전 서로 다른 신규 사용자 5명 이상을 반드시 확정한다.
- [x] 테스트에 사용할 동일한 4×4 퍼즐 1개와 예비 퍼즐 1개를 고정한다.

### 3.1 formal Easy 실행 게이트와 종료 판정

- [x] 서로 다른 신규 사용자 5명 이상이 확정됐다.
- [x] 동일 공개 URL·beta SHA·Easy `M00-MAIN-v1` 조건과 무개입 집계가 확인됐다.
- [x] 비공개 집계 원자료 보관 위치와 삭제 예정일이 확정됐다.

2026-08-10 프로젝트 오너 결정으로 formal Easy 표본을 출시 직전 playable beta까지 연기했다. 이 결정은 `PASS`, 면제 또는 임계치 완화가 아니었으며 최소 표본 5명과 4/5, 30초 첫 PULSE, 90초 첫 성공, 규칙 회상 기준을 유지했다.

2026-08-14 오너는 ADR-0008에 따라 M00을 통과 처리하지 않은 채 M01의 도구 체인·모듈 경계·Hash Router·CI 체크포인트만 선행 착수하도록 승인했다. 당시 이 예외는 M00 DOD-02~07, M02 착수 또는 릴리스 승인을 대신하지 않았다.

2026-08-16 신규 인터넷 익명 사용자 5명이 GitHub Pages 루트의 동일 배포 `b0f935e396805bab9c0847847068cb9a3522968f`에서 기본 Easy `M00-MAIN-v1`을 플레이했다. 배포는 Pages run `31733835031` 성공 기록으로 대조했다. 전원 진행자 개입 없이 30초 안에 첫 PULSE, 90초 안에 첫 성공, 핵심 규칙 회상을 완료했다.

참가자별 익명 ID·정확한 초·PULSE 수·PC 환경·전문성 층화는 보존되지 않았다. 프로젝트 오너는 2026-08-21 이 aggregate-only E1 제한을 인지하고 M00 종료를 승인했다. 누락값을 사후 생성하지 않고 이 표본을 일반 사용자 대표성, M06 또는 M10의 세부 실기기·접근성 증거로 재사용하지 않는다. 비공개 집계는 `<PROJECT_ROOT>/.private/playtests/M00-R1-2026-08-16.md`에 Git 미추적으로 보관하며, 오너 문장의 “해커톤 출품 시”를 2026-08-26 제출 완료 후 삭제로 기록했다.

### 3.2 고정 M00 fixture

화면의 왼쪽 첫 열을 bit 0으로 두는 `<HARNESS_ROOT>/docs/PUZZLE_MATH.md` §3.1 관례를 따른다. 행은 `A`~`D`, 열은 `1`~`4`로 표시한다. 고정 fixture는 모든 축을 사용하고 해답 과정에 중첩 반전이 있다. 정식 M00 플레이테스트에서는 Easy 주 fixture만 직접 열어 사용하며, stage 선택 시간은 30초·90초 측정에 포함하지 않는다. 예비 fixture로 전환하면 별도 test run으로 기록한다.

#### 주 fixture — `M00-MAIN-v1`

- **stage / 난도**: `easy` / 쉬움
- **용도**: M00 정식 본 표본의 유일한 조건

```text
size: 4
initialRows: [0, 0, 0, 0]
targetRows:  [11, 6, 13, 6]
par: 2

P0: rowMask=0b0101 (A,C),   colMask=0b1101 (1,3,4)
    expectedRows=[13, 0, 13, 0]
P1: rowMask=0b1011 (A,B,D), colMask=0b0110 (2,3)
    expectedRows=[11, 6, 13, 6]
```

`par: 2`는 `GF(2)` rank와 독립 BFS가 증명한 수학적 최소값이다. 내부 파일럿의 `관측 최저 3 PULSE`와 초기 오계산 흐름의 `4~5 PULSE`는 사람의 실제 이동 관찰값이며 Par를 변경하지 않는다.

#### 예비 fixture — `M00-BACKUP-v1`

```text
size: 4
initialRows: [0, 0, 0, 0]
targetRows:  [15, 6, 5, 10]
par: 3

P0: rowMask=0b0101 (A,C),   colMask=0b1001 (1,4)
    expectedRows=[9, 0, 9, 0]
P1: rowMask=0b1011 (A,B,D), colMask=0b1010 (2,4)
    expectedRows=[3, 10, 9, 10]
P2: rowMask=0b0111 (A,B,C), colMask=0b1100 (3,4)
    expectedRows=[15, 6, 5, 10]
```

#### 폐기형 난도 탐색 stage와 대조군

| 순서 | Stage / fixture | 난도 | Par | M00 게이트 사용 |
|---:|---|---|---:|---|
| 1 | `easy` / `M00-MAIN-v1` | 쉬움 | 2 | 정식 본 표본 |
| 2 | `normal` / `M00-NORMAL-v1` | 보통 | 3 | 탐색만, 본 표본 미포함 |
| 3 | `full-rank` / `M00-HARD-v1` | 4×4 Full Rank 대조군 | 4 | 대조만, 본 표본 미포함 |

Normal과 4×4 Full Rank 대조군은 난도 차이와 다음 stage 흐름을 살피기 위한 폐기형 프로토타입 콘텐츠다. canonical stage ID는 `full-rank`이고 이전 `?stage=hard` URL만 대조군으로 해석하는 alias로 유지한다. fixture ID `M00-HARD-v1`도 역사 호환용이며 사용자에게 어려움 난도로 주장하지 않는다. 전체 Lab 구현, 프로덕션 레벨 카탈로그 또는 M00 통과 증거로 간주하지 않는다.

P0 발견 전인 2026-08-09 `<PROJECT_ROOT>/prototypes/rule-proof/verify-fixture.mjs`로 4×4 전체 상태 65,536개와 비영 축 조합 225개를 사용하는 독립 BFS를 실행했다. 당시 Easy·Normal·Hard·예비 fixture의 rank와 BFS minimum은 각각 2·3·4·3으로 일치했고 196,708개 단언이 통과했다. 이어진 360×640 다단계 브라우저 스모크 140개 단언도 Easy 2수·Normal 3수·당시 Hard 4수·예비 3수와 콘솔 오류 0으로 통과했다. 이 둘과 기존 51개 단일-stage 실행은 §10에 역사 기준선으로 보존하고, 현재 E2는 별도로 기록한다.

### 3.3 P0-DIFF-001과 난도 비교 계약

2026-08-09 내부 파일럿 후속 제보를 재현했다. 4×4 차이 행렬 `D`의 각 비영 열 `d_j`는 `d_j e_j^T` 한 번의 합법 PULSE로 맞출 수 있으므로 모든 4×4 퍼즐은 비영 열 수 이하, 대칭적으로 비영 행 수 이하에 해결된다. full-rank 4×4는 모든 행·열이 비영이고 rank가 4이므로 단일 축 순회 4회가 Par 4 최적해다. 따라서 fixture만 다른 rank 4 보드로 교체해도 기존 Hard 난도 라벨을 복구할 수 없다.

이 판정은 콘텐츠 난도 구성의 P0이며 코어 수학의 실패가 아니다. PULSE 정의, INV-005·INV-006, ADR-0002의 `Par=rank_GF2(D)`는 정상이고 변경하지 않는다. Easy `M00-MAIN-v1` 정식 이해도 테스트도 그대로 유지했고, 2026-08-16 formal Easy 결과와 함께 DOD-02~07을 닫았다.

```text
nonzeroRows = D에서 1을 하나 이상 포함한 행 수
nonzeroCols = D에서 1을 하나 이상 포함한 열 수
sweepBound = min(nonzeroRows, nonzeroCols)
compressionGap = sweepBound - rank_GF2(D)
```

| 분류 / fixture | size | targetRows | rank | sweepBound | compressionGap | 상태 |
|---|---:|---|---:|---:|---:|---|
| Easy / `M00-MAIN-v1` | 4 | `[11, 6, 13, 6]` | 2 | 4 | 2 | 정식 조건 유지 |
| Normal / `M00-NORMAL-v1` | 4 | `[5, 9, 6, 3]` | 3 | 4 | 1 | 폐기형 탐색 |
| Full Rank 대조군 / `M00-HARD-v1` | 4 | `[6, 9, 10, 13]` | 4 | 4 | 0 | 기존 Hard에서 재분류 |
| `M00-CANDIDATE-5X5-v1` | 5 | `[25, 19, 13, 30, 7]` | 3 | 5 | 2 | 구조 통과·크기 풀 근거, 개별 난도 미승인 |
| `M00-CANDIDATE-6X6-v1` | 6 | `[7, 25, 42, 7, 30, 45]` | 3 | 6 | 3 | 구조 통과·크기 풀 근거, 개별 난도 미승인 |

`compressionGap>0`은 단일 행/열 순회가 Par 최적해가 아님을 보장할 뿐 체감 난도를 단독으로 증명하지 않는다. 두 후보는 같은 Par 3에서 보드 크기와 gap 차이를 비교하는 `difficulty: candidate` 조건이다. `hardGate=pass`는 anti-sweep 구조 적격성만 뜻하고 Easy도 통과하므로, 사람 비교는 크기 풀 채택 근거를 제공했지만 표본 메타데이터가 없는 현재 후보를 정식 Hard로 승인하지 않는다.

### 3.4 사람 난도 비교 관찰과 채택 범위

2026-08-09 사람 대상 비교 플레이 후기로 5×5·6×6 모두 4×4보다 생각할 거리가 있고 지나치게 쉽지 않다는 정성 관찰을 확보했다. 이 관찰을 근거로 프로덕션 콘텐츠가 사용할 수 있는 보드 크기 풀을 다음처럼 채택한다.

| 난도 | 허용 보드 크기 | 현재 M00 fixture 승인 범위 |
|---|---|---|
| Easy | 4×4 | `M00-MAIN-v1`만 정식 Easy 본 표본에 사용 |
| Normal | 4×4·5×5 | 크기 조합 채택, 개별 목표는 후속 검증 |
| Hard | 4×4·5×5·6×6 | 크기 조합 채택, 개별 목표는 후속 구조·사람 검증 |

이 표는 크기 풀 결정이지 현재 후보를 정식 Hard fixture로 승격한 결과가 아니다. 특히 `M00-HARD-v1`은 gap 0의 4×4 Full Rank 대조군으로 남으며 Hard에 복귀하지 않는다. 향후 4×4 Hard 목표도 rank만으로 승인하지 않고 anti-sweep 구조 게이트와 사람 관찰을 통과해야 한다.

같은 난도×크기 조합에서 목표 하나만 반복하면 다양성이 부족하다는 후기에 따라 완료 후 새로운 목표 신호를 계속 제공하는 재설정 흐름을 채택한다. 단일 행 또는 열을 차례로 맞추는 sweep 전략은 코어 규칙상 제거하지 않고, 그 방식으로 완료했을 때 성공을 인정하면서 “다른 방법으로도 풀어 보세요”라는 비강제 안내를 제공한다. 플레이 화면에는 스톱워치를 표시하고 완료 결과에는 사용 PULSE와 경과 초를 함께 표시한다.

참가자 수·완료시간·기기·개입 코드·개별 이동·DOD-02~04 지표는 보고되지 않았다. 따라서 이 비교는 크기 조합과 UX 요구를 채택하는 비게이트 정성 관찰로만 사용하며 Easy 본 표본이나 M00 통과 수치에 합산하지 않는다. 새 목표·sweep 안내·visibility-safe 스톱워치는 E2 회귀를 통과했지만 사람 대상 게이트 증거가 아니다.

## 4. 입력·산출물 계약

### 입력

- `<HARNESS_ROOT>/docs/TECHNICAL_WHITEPAPER.md` §1, §2.2, §12 Phase 0
- `<HARNESS_ROOT>/docs/DESIGN_WHITEPAPER.md`의 첫 사용자·보드·축 선택 명세
- `<HARNESS_ROOT>/INVARIANTS.md` INV-004~006, INV-015

### 산출물

- `<PROJECT_ROOT>/prototypes/rule-proof/`의 폐기 가능한 독립 프로토타입
- 고정 테스트 퍼즐과 정답 펄스 fixture
- `<HARNESS_ROOT>/docs/PLAYTEST_PROTOCOL.md`의 M00 절차·집계 결과
- 반복되는 혼동과 수정 사항 요약
- v1.0 Scope Lock 목록과 필요 시 ADR

## 5. 작업 순서

1. 4×4 초기·목표 보드와 검증된 2~4 PULSE Easy·Normal·Full Rank 대조군 해답 및 예비 fixture를 고정한다.
2. stage 전환, 행·열 레일, 미리보기, PULSE, Undo, Reset, 완료를 포함한 최소 화면과 fixture verifier를 만든다.
3. “행과 열을 고르고 교차점을 뒤집으세요” 수준의 중립 안내를 작성한다.
4. 내부 파일럿 run 2회로 조작 흐름을 점검했다. 시간·참가자 수·개입은 미보고이며 파일럿을 본 표본에 포함하지 않는다.
5. Easy→Normal→4×4 Full Rank 대조군 흐름의 자동 브라우저 스모크를 완료하고 역사 기준선으로 보존한다.
6. 난도 검증기에 `sweepBound`·`compressionGap`을 추가하고 5×5·6×6 비교 후보를 구현해 verifier·browser smoke를 재실행했다.
7. 사람 대상 폐기형 비교로 난도별 보드 크기 풀을 정하고 후속 UX 요구를 수집했다. 표본 메타데이터가 없어 Easy 본 표본에는 합산하지 않는다.
8. 새 목표 재설정, sweep 풀이 후 대안 안내, 플레이 스톱워치와 완료 PULSE·초 표시를 구현하고 verifier·browser smoke를 다시 실행했다.
9. 검증된 난도 크기 풀·새 목표·sweep 안내·시간 피드백 계약을 기술·디자인 백서에 반영했다.
10. 신규 사용자 5명 이상에게 Easy `M00-MAIN-v1`과 같은 안내를 제공한다.
11. 첫 합법 입력, 첫 PULSE, 첫 성공, 개입, 규칙 재설명 가능 여부를 기록한다.
12. Easy 게이트와 후속 UX 검증이 모두 끝나면 규칙과 v1.0 범위를 잠근다. 실패하면 혼동 원인별로 한 변수만 수정해 재시험한다.

## 6. 참조

- **불변식**: INV-004, INV-005, INV-006, INV-015, INV-018
- **ADR**: `<HARNESS_ROOT>/decisions/0002-gf2-rank-as-par.md`
- **기술 백서**: §1.2 제품 목표, §2.2 기본 규칙, §12 Phase 0
- **디자인 백서**: 첫 사용자 흐름, TensorGrid·AxisToggle·PULSE 상태
- **프로토콜**: `<HARNESS_ROOT>/docs/PLAYTEST_PROTOCOL.md`

## 7. DoD — 완료 게이트

- [x] **DOD-01 — 규칙 정확성**: 고정 fixture에서 PULSE, Undo, Reset, 완료 결과가 수동 계산과 모두 일치한다. 동일 PULSE 두 번이 원상 복구된다. 증거 수준 E2. (INV-004~006)
- [x] **DOD-02 — 첫 조작 이해**: 5/5가 진행자 개입 없이 30초 안에 첫 유효 PULSE를 실행했다. 증거 수준 E1.
- [x] **DOD-03 — 첫 성공**: 5/5가 진행자 개입 없이 90초 안에 Easy `M00-MAIN-v1`을 해결했다. 증거 수준 E1.
- [x] **DOD-04 — 규칙 회상**: 5/5가 교차점 반전과 재반전의 핵심을 자기 말로 설명했다. 증거 수준 E1.
- [x] **DOD-05 — 중대한 혼동 없음**: 보고된 5개 의견은 콘텐츠량·경쟁 포지셔닝·축 연출·2D 표현에 관한 것이며, 반복 P0급 규칙 혼동은 0건이었다.
- [x] **DOD-06 — Scope Lock**: Tutorial 6, Lab 48, Daily, Archive, Sprint 180초, 공유, 한·영, PWA의 장기 v1 범위와 비목표를 유지한다. 해커톤 제출 슬라이스는 ADR-0010에서 별도 임시 범위로 관리하며 3D 전환은 채택하지 않는다.
- [x] **DOD-07 — 상태 인계**: 집계 수치, 증거 제한, 5개 피드백, 채택 우선순위와 보류 대안을 프로토콜·`PROGRESS.md`·협업 기록에 남겼다.

행동 기준은 5/5로 통과했다. 개별 기록과 전문성 층화가 없는 aggregate-only E1이라는 증거 제한은 유지하며, 이 완료를 M06/M10의 별도 사람·실기기 게이트로 환산하지 않는다.

## 8. 검증 명령

프로토타입 기술에 맞춰 최소 재현 명령을 문서에 고정한다. 아래 명령은 하네스 폴더가 아니라 `<PROJECT_ROOT>`에서 실행한다. 생산 npm 명령은 M01에서 확정한다.

```powershell
# cwd: <PROJECT_ROOT>
node prototypes/rule-proof/verify-fixture.mjs

# terminal A — .mjs MIME을 보장하는 외부 의존성 없는 서버
node prototypes/rule-proof/serve.cjs

# terminal B — Playwright가 있는 환경에서
$env:NODE_PATH = "<Playwright node_modules>"
$env:BROWSER_EXECUTABLE = "<Chromium executable>"
node prototypes/rule-proof/browser-smoke.cjs
```

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 단일-stage 브라우저 기준선 | 360×640 주·예비 fixture 완주 → Undo → Reset → rapid input | 51개 단언·콘솔 오류 0 | `evidence/M00/browser-smoke-solved-360x640.png` |
| 다단계 브라우저 역사 기준선 | Easy→Normal→기존 Hard canonical 완주·다음 stage·당시 난도 표기 | 140개 단언·easy=2·normal=3·hard=4·backup=3·콘솔 오류 0 | §10 역사 로그; 동일 캡처 경로는 최신 E2로 교체됨 |
| 난도·seed 검증 | 여섯 profile·대조군의 rank·density·fallback·golden·Hard 4×4 noise 재계산 | 독립 minor·행 루프 oracle 포함 200,967개 단언, 실패 0 | §10 현재 verifier 출력 |
| 최종 브라우저 회귀 | 320/360/960px에서 여섯 profile·대조군·예비 완주와 반복 UX | 573개 단언, 무가로스크롤·44px·콘솔 오류 0 | `evidence/M00/browser-smoke-stages-360x640.png` |
| 새 목표 재설정 | 같은 난도×크기에서 seed 목표 요청 반복·직전 target 최대 32회 제외 | URL 재현, 진행 확인, 실패 시 현재 보드 보존 | 573개 브라우저 단언 |
| sweep 대안 안내 | 단일 행/열 sweep으로 완료하고 혼합 축 풀이와 비교 | 완료 유지, sweep 완료에만 비강제 안내 | 573개 브라우저 단언 |
| 시간·결과 피드백 | 시작·숨김·재개·완료·Reset·stage·새 목표 전환 | visibility-safe 스톱워치, 완료 PULSE·0.1초 표시 | 573개 브라우저 단언 |
| formal beta 신규 사용자 5명 | 동일 beta SHA·Easy 안내 → 4×4 플레이 → 종료 질문 | 5/5 첫 PULSE·첫 성공·규칙 회상, 반복 P0 0 | §10 E1 집계와 Git 미추적 로컬 원자료 |
| 360px 모바일 | 터치로 행·열 선택·PULSE | 컨트롤 가림·오입력 없음 | 캡처/녹화 |
| 키보드 사용자 | Tab·Enter/Space로 1회 해결 | 포인터 없이 완료 | 관찰 기록 |

## 10. 증거

### E2 — DOD-01 초기 4×4 규칙·세션 역사 기준선

```text
command: node prototypes/rule-proof/verify-fixture.mjs
exit: 0
M00-MAIN-v1 rank=2 bfs=2
M00-NORMAL-v1 rank=3 bfs=3
M00-HARD-v1 rank=4 bfs=4
M00-BACKUP-v1 rank=3 bfs=3
stageSequence=easy:2>normal:3>hard:4
assertions=196708 bfsVisited=65536 legalPulseCount=225 failures=0
```

검증 범위는 고정 중간 상태, canonical factorization, 전체 상태 BFS/rank 패리티, PULSE involution·commutativity·입력 불변, rapid input, Undo, Reset, solved와 completion 1회 기록이다.

### E2 — 현재 난도 구조·가변 fixture 검증

```text
command: node prototypes/rule-proof/verify-fixture.mjs
exit: 0
difficulty=M00-MAIN-v1 rank=2 sweep=4 gap=2 density=0.6250 hardGate=pass
difficulty=M00-NORMAL-v1 rank=3 sweep=4 gap=1 density=0.5000 hardGate=fail
difficulty=M00-NORMAL-5X5-v1 rank=3 sweep=4 gap=1 density=0.5200 hardGate=fail
difficulty=M00-CANDIDATE-4X4-v1 rank=2 sweep=4 gap=2 density=0.6250 hardGate=pass
difficulty=M00-CANDIDATE-5X5-v1 rank=3 sweep=5 gap=2 density=0.6400 hardGate=pass
difficulty=M00-CANDIDATE-6X6-v1 rank=3 sweep=6 gap=3 density=0.5556 hardGate=pass
difficulty=M00-HARD-v1 rank=4 sweep=4 gap=0 density=0.5625 hardGate=fail
difficulty=M00-BACKUP-v1 rank=3 sweep=4 gap=1 density=0.6250 hardGate=fail
generatorRegression=version:m00-seeded-v1 playableProfiles:6 controlProfiles:1 goldenVectors:7 seedsPerProfile:12 maxAttempts:512 density:0.22-0.68 hard4Initial:0.25-0.5
stageSequence=easy:2>normal:3>normal-5:3>hard-4:2>hard-5:3>hard-6:3
assertions=200967 bfsVisited=65536 legalPulseCount=225 failures=0
```

5×5·6×6에는 상태 공간 크기 때문에 이동 거리 전수 BFS를 실행하지 않았고 출력은 `bfs=not-run`으로 범위를 구분한다. 두 후보의 exact rank 3은 rank/factorization 구현과 독립인 조합×순열 Leibniz minor oracle로 order 3 비영 minor와 order 4 비영 minor 부재를 확인했다. canonical 합성·중간 상태도 검증됐다. `hardGate`는 모든 행·열 비영, Par 일치, `compressionGap>=2`라는 anti-sweep 구조 게이트이며 체감 난도 승인이 아니다.

### E2 — 단일-stage 실제 브라우저 스모크 기준선

```text
server: node prototypes/rule-proof/serve.cjs
command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
exit: 0
browserAssertions=51 viewport=360x640 mainMoves=2 backupMoves=3 consoleErrors=0 screenshot=<PROJECT_ROOT>\AXIS_SHIFT_Harness_KR\evidence\M00\browser-smoke-solved-360x640.png
```

이 기준선은 360×640 무가로스크롤, 44px 이상 타깃, 열→행 키보드 순서, disabled 이유, Preview ON/OFF 기호, 주 fixture 2수·예비 fixture 3수 완주, 중복 PULSE 단일 커밋, Undo, 확인형 Reset, 완료 잠금·포커스·live 상태를 포함한다. 첫 실행에서 Windows 기본 정적 서버가 `.mjs`를 `text/plain`으로 반환한 실패를 재현했고, `serve.cjs`의 `application/javascript` 응답으로 수정한 뒤 통과했다.

### E2 — P0 발견 전 4×4 다단계 브라우저 역사 기준선

```text
server: node prototypes/rule-proof/serve.cjs
command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
exit: 0
browserAssertions=140 viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3 consoleErrors=0
screenshot=<PROJECT_ROOT>\AXIS_SHIFT_Harness_KR\evidence\M00\browser-smoke-stages-360x640.png
```

Easy·Normal·당시 Hard의 canonical move 수 2·3·4, 예비 회귀 3을 확인했던 역사 로그다. 동일한 screenshot 경로는 아래 현재 여섯 profile E2로 교체됐으므로 이 140개 실행의 이미지 증거로 주장하지 않는다.

### E2 — 현재 여섯 profile 반복 UX 실제 브라우저 스모크

```text
server: node prototypes/rule-proof/serve.cjs
command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
exit: 0
browserAssertions=573 viewport=320/360/960 easyMoves=2 normal4Moves=3 normal5Moves=3 hard4Moves=2 hard5Moves=3 hard6Moves=3 backupMoves=3 timer=visibility-safe newTarget=crypto+fallback sweepGuidance=column consoleErrors=0
screenshot=<PROJECT_ROOT>\AXIS_SHIFT_Harness_KR\evidence\M00\browser-smoke-stages-360x640.png
```

여섯 profile·Full Rank 대조군·예비 fixture의 canonical 완주, seed URL 재현·직전 target 제외, Hard 4×4 initial 노이즈, visibility-safe 타이머, sweep 안내, 320/360/960px 무가로스크롤, 44px 축 타깃, 키보드·Reset·Undo·Preview와 콘솔 오류 0을 확인했다. 이 E2는 구현·구조 계약 증거이며 정식 Easy E1 표본이나 체감 Hard 승인을 대체하지 않는다.

### E2 — 공개 GitHub Pages 플레이 스모크 (`68f7614` 역사 로그)

```text
publish command: git push -u origin main
application commit: 68f7614659675171fbfbd3535e1d04b08bee931f
pages source: main /
pages status: built
root URL: https://jtech-co.github.io/axis-shift/ (HTTP 200, prototype redirect 확인)
game URL: https://jtech-co.github.io/axis-shift/prototypes/rule-proof/ (HTTP 200)
game.mjs: HTTP 200, text/javascript; charset=utf-8
remote browser smoke exit: 0
browserAssertions=140 viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3 consoleErrors=0
```

공개 URL에서도 로컬과 동일한 세 단계 canonical 풀이, 단계 전환, 예비 fixture 회귀와 콘솔 오류 0을 확인했다. 이 배포는 신규 사용자 모집을 위한 M00 프로토타입 공개이며 M01 프로덕션 스캐폴딩 시작이나 DOD-02~07 통과를 뜻하지 않는다.

### E2 — 현재 구현 체크포인트 공개 GitHub Pages 스모크

```text
application commit: 5d57e09d250859b4eccdf64bca784f8ae527f6ce
pages source: main /
pages status: built
pages duration: 16043ms
root URL: https://jtech-co.github.io/axis-shift/ (HTTP 200)
game URL: https://jtech-co.github.io/axis-shift/prototypes/rule-proof/ (HTTP 200)
game.mjs: HTTP 200, text/javascript; charset=utf-8
remote browser smoke exit: 0
browserAssertions=573 viewport=320/360/960 easyMoves=2 normal4Moves=3 normal5Moves=3 hard4Moves=2 hard5Moves=3 hard6Moves=3 backupMoves=3 timer=visibility-safe newTarget=crypto+fallback sweepGuidance=column consoleErrors=0
```

공개 체크포인트에서도 여섯 profile·반복 목표·visibility-safe 타이머·sweep 안내와 320/360/960px 회귀가 로컬 E2와 일치했다. 이 push는 플레이 가능한 구현 체크포인트이며 formal Easy E1, DOD-02~07 또는 M00 phase 완료를 뜻하지 않는다.

### E2 — M01 artifact 전환 후 M00 공개 호환 스모크

```text
deployed commit: 93a4359b5cbe1b45f8ed1fe0ee4a984003e8191c
pages build_type: workflow
pages status: built
legacy backup: backup/pages-legacy-20260814
legacy backup SHA: 576e6dbac1938652ba892539c91a1fa07f4d2cf7
root URL: https://jtech-co.github.io/axis-shift/
remote browser smoke exit: 0
browserAssertions=573 viewport=320/360/960 easyMoves=2 normal4Moves=3 normal5Moves=3 hard4Moves=2 hard5Moves=3 hard6Moves=3 backupMoves=3 timer=visibility-safe newTarget=crypto+fallback sweepGuidance=column consoleErrors=0
```

Pages source를 artifact workflow로 전환한 뒤에도 공개 루트·stage/seed·anchor는 M00 프로토타입으로 연결되고 기존 전체 회귀가 그대로 통과했다. M01 AppShell은 `/#/`로 분리됐다. 이 호환 배포는 M00의 플레이 가능성을 보존하지만 formal Easy E1이나 DOD-02~07을 대신하지 않는다.

### E1 준비 관찰 — 내부 파일럿

- run: 2회, 본 표본 미포함
- 정식 조건: `M00-MAIN-v1` / Easy / 수학적 Par 2
- 관측 최저: 3 PULSE
- 초기 계산이 어긋난 흐름: 4~5 PULSE까지 이어질 수 있음
- 미보고: 참가자 수, 각 run의 시간, 개입 코드, 규칙 회상, 기기 구성
- 게이트 영향: 없음. DOD-02~04 및 §3.1 실행 게이트는 미충족 상태를 유지한다.

### 비게이트 관찰 — 5×5·6×6 난도 비교

- 보고된 결과: 5×5·6×6 모두 4×4보다 생각할 거리가 있으며 지나치게 쉽지 않음
- 채택한 크기 풀: Easy=4×4, Normal=4×4·5×5, Hard=4×4·5×5·6×6
- 다양성 관찰: 조합당 한 목표만 있으면 반복 다양성이 부족하므로 완료 후 새 목표 신호가 필요함
- sweep 관찰: 단일 행/열 순회 전략은 규칙상 남으므로 해당 방식 완료 시 다른 풀이를 권하는 비강제 안내가 필요함
- 피드백 관찰: 플레이 중 스톱워치와 완료 시 사용 PULSE·경과 초 표시가 필요함
- 미보고: 참가자 수, 각 run의 완료시간·PULSE, 기기, 입력, 순서 균형, 개입 코드, 규칙 회상
- Gate result: NOT COUNTED — 상대적 크기 비교의 정성 근거일 뿐 §3.1과 DOD-02~04의 E1 표본이 아님

### E1 — Formal Easy beta 본 표본 `M00-R1`

```text
testDate=2026-08-16
reportDate=2026-08-21
build=b0f935e396805bab9c0847847068cb9a3522968f
pagesRun=31733835031 success
url=https://jtech-co.github.io/axis-shift/
fixture=M00-MAIN-v1 stage=easy seed=none
sample=5 new anonymous internet users
devices=PC:4,mobileChrome:1
intervention=I0:5/5
firstPulseWithin30s=5/5
firstSolveWithin90s=5/5
coreRuleRecall=5/5
repeatedP0Confusion=0
gate=PASS
privateEvidence=<PROJECT_ROOT>/.private/playtests/M00-R1-2026-08-16.md
deleteAfter=2026-08-26 submission complete
```

참가자별 ID·정확한 시간·PULSE 수·PC 브라우저/OS·전문성 층화는 기록되지 않았다. 중앙값이나 개인별 행을 추정하지 않으며, 오너가 이 제한을 인지하고 M00 종료를 승인했다. Normal·Full Rank 대조군·5×5·6×6 후보 run은 본 표본과 합산하지 않았다.

### P0-DIFF-001 — 사람 비교 관찰·후속 UX E2 완료

- 재현: 4×4 full-rank 차이 행렬을 왼쪽부터 단일 열 PULSE 네 번 또는 위에서부터 단일 행 PULSE 네 번으로 해결
- 기대 / 실제: 기존 Hard가 Par 4이면서 축 관계 추론을 요구 / 기계적 축 순회가 Par 4 최적해
- 판정: 기존 Hard 난도 라벨 폐기, `4×4 Full Rank 대조군`으로 재분류
- 영향 없음: 코어 PULSE, INV-005, INV-006, ADR-0002, Easy 정식 조건
- 채택: `sweepBound`·`compressionGap` 분석기, 5×5 gap 2·6×6 gap 3 비교 후보, 가변 4×4·5×5·6×6 UI
- E2: 독립 minor·행 루프 oracle을 포함한 verifier 200,967개 단언·실패 0, 실제 Edge browser smoke 573개 단언·콘솔 오류 0
- 사람 관찰: 5×5·6×6이 4×4보다 생각할 거리가 있고 지나치게 쉽지 않다는 후기로 난도별 크기 풀을 채택했으나, 표본 메타데이터가 없어 개별 fixture의 정식 Hard 승인은 아님
- 후속 구현: 반복 새 목표, sweep 완료 후 대안 안내, visibility-safe 스톱워치, 완료 PULSE·0.1초 표시까지 E2 완료
- 종료: 2026-08-16 Easy n=5 행동 기준 5/5와 2026-08-21 오너 판정으로 DOD-02~07 및 M00을 완료했다. 개별 난도 fixture의 정식 승인과 M06/M10 증거는 별도다.

## 11. 롤백 계획

- 프로토타입은 생산 코드와 분리해 언제든 폐기한다.
- 규칙 이해도 실패 시 시각 표식·안내 순서만 먼저 수정한다.
- PULSE 자체를 바꿔야 한다면 ADR을 작성하고 기술·디자인 백서를 갱신한 뒤 M00을 처음부터 재실행한다.

## 12. 리스크·미지수

- 개발자·AI 친숙 사용자만 모집하면 이해도가 과대평가될 수 있다.
- 관찰자가 무의식적으로 축이나 정답을 가리킬 수 있다.
- 지나치게 쉬운 fixture는 규칙 이해가 아니라 우연 성공을 측정할 수 있다.
- rank/Par만으로 난도를 정하면 full-rank 정방행렬에서 단일 축 순회가 최적해가 되어 높은 Par가 오히려 기계적인 풀이를 허용할 수 있다.
- 난도×크기 조합마다 목표가 하나뿐이면 패턴을 외우게 되어 반복 플레이의 다양성이 사라질 수 있다.

## 13. STOP 트리거

- 두 번의 문구·표식 개선 후에도 4/5 성공 기준 미달.
- 성공은 하지만 핵심 규칙을 설명하지 못하는 참가자가 2명 이상.
- 규칙을 통과시키기 위해 별도 수학 강의나 긴 튜토리얼이 필요함.
- 코어 PULSE 규칙 변경 필요.
- 난도 검증 후에도 정식 난도 라벨과 대조군을 구분할 수 없음.

## 14. 다음 phase 인계

M00 완료 결과와 이미 완료된 M01 기반을 ADR-0010의 H00 해커톤 제출 슬라이스에 전달한다. 정규 M02~M11의 완료를 의미하지 않는다.

- 잠긴 공개 규칙과 입력 흐름
- 검증된 fixture와 예상 보드 결과
- 검증된 난도 보조 지표와 5×5·6×6 비교 결론
- Easy·Normal·Hard의 허용 보드 크기 풀과 개별 fixture 승인 경계
- 반복 새 목표·sweep 대안 안내·플레이 시간·완료 PULSE/초 표시 요구
- 첫 사용자에게 사용하지 말아야 할 용어·문구
- 360px·키보드에서 확인된 최소 인터랙션 요구
