# M00 — Rule Proof & Scope Lock ★

- **상태**: 진행 중 — 내부 파일럿 2회·다단계 E2 완료 / Easy 본 플레이테스트 게이트 대기
- **담당 범위**: 코어 규칙 이해도, 최소 프로토타입, v1.0 범위 잠금
- **최종 갱신**: 2026-08-09
- **목표**: 코어 규칙이 일반 사용자에게 90초 안에 학습 가능한지 코드베이스 확장 전에 증명

## 1. 맥락과 목표

AXIS//SHIFT의 가장 큰 제품 위험은 수학 구현이 아니라 “행과 열을 선택해 교차점을 반전한다”는 규칙이 설명 없이도 재미로 읽히는지다. 이 phase는 생산 코드와 콘텐츠를 대량 작성하기 전에 최소 프로토타입과 사람 관찰로 규칙의 실효를 확인하고, 통과한 규칙만 v1.0 범위로 잠근다.

## 2. 범위

### 포함

- Easy 정식 조건 1개와 Normal·Hard 난도 탐색 조건을 가진 4×4 폐기형 다단계 프로토타입
- 행·열 선택, 교차점 미리보기, PULSE, Undo, Reset, 완료
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
- [x] 참가자 모집 순서가 프로젝트 오너 결정으로 확정됐다. 플레이 가능한 프로토타입과 내부 파일럿을 준비한 뒤 모집하며, 본 플레이테스트 시작 전에는 서로 다른 신규 사용자 5명 이상을 반드시 확정한다.
- [x] 테스트에 사용할 동일한 4×4 퍼즐 1개와 예비 퍼즐 1개를 고정한다.

### 3.1 본 플레이테스트 실행 게이트

- [ ] 서로 다른 신규 사용자 5명 이상이 확정됐다.
- [ ] `<HARNESS_ROOT>/docs/PLAYTEST_PROTOCOL.md`의 표본 구성 조건을 만족한다.
- [ ] 비공개 원시 기록 보관 위치와 삭제 예정일이 확정됐다.

이 게이트 전에는 프로토타입 구현, fixture 자동 검증, 내부 파일럿만 허용한다. 본 표본 테스트는 시작하지 않으며, 최소 표본 5명과 DOD-02~04의 4/5 임계치는 변경하지 않는다.

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

#### 폐기형 난도 탐색 stage

| 순서 | Stage / fixture | 난도 | Par | M00 게이트 사용 |
|---:|---|---|---:|---|
| 1 | `easy` / `M00-MAIN-v1` | 쉬움 | 2 | 정식 본 표본 |
| 2 | `normal` / `M00-NORMAL-v1` | 보통 | 3 | 탐색만, 본 표본 미포함 |
| 3 | `hard` / `M00-HARD-v1` | 어려움 | 4 | 탐색만, 본 표본 미포함 |

Normal·Hard는 난도 차이와 다음 stage 흐름을 살피기 위한 폐기형 프로토타입 콘텐츠다. 전체 Lab 구현, 프로덕션 레벨 카탈로그 또는 M00 통과 증거로 간주하지 않으며, 각 fixture는 canonical solution·중간 상태·rank/BFS 일치를 독립 검증한다.

2026-08-09 `<PROJECT_ROOT>/prototypes/rule-proof/verify-fixture.mjs`로 4×4 전체 상태 65,536개와 비영 축 조합 225개를 사용하는 독립 BFS를 실행했다. Easy·Normal·Hard·예비 fixture의 rank와 BFS minimum은 각각 2·3·4·3으로 일치했고, canonical factorization·중간 상태·PULSE involution·commutativity·입력 불변·rapid input·Undo·Reset·완료 단일 기록을 포함한 196,708개 단언이 모두 통과했다. 이어서 360×640 다단계 브라우저 스모크 140개 단언이 Easy 2수·Normal 3수·Hard 4수·예비 3수와 콘솔 오류 0으로 통과했다. 기존 51개 단일-stage 브라우저 기준선은 §10에 역사 증거로 보존한다.

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

1. 4×4 초기·목표 보드와 검증된 2~4 PULSE Easy·Normal·Hard 해답 및 예비 fixture를 고정한다.
2. stage 전환, 행·열 레일, 미리보기, PULSE, Undo, Reset, 완료를 포함한 최소 화면과 fixture verifier를 만든다.
3. “행과 열을 고르고 교차점을 뒤집으세요” 수준의 중립 안내를 작성한다.
4. 내부 파일럿 run 2회로 조작 흐름을 점검했다. 시간·참가자 수·개입은 미보고이며 파일럿을 본 표본에 포함하지 않는다.
5. Easy→Normal→Hard 흐름의 자동 브라우저 스모크를 완료하되 Normal·Hard 결과는 난도 탐색으로만 기록한다.
6. 신규 사용자 5명 이상에게 Easy `M00-MAIN-v1`과 같은 안내를 제공한다.
7. 첫 합법 입력, 첫 PULSE, 첫 성공, 개입, 규칙 재설명 가능 여부를 기록한다.
8. 통과하면 규칙과 v1.0 범위를 잠근다. 실패하면 혼동 원인별로 한 변수만 수정해 재시험한다.

## 6. 참조

- **불변식**: INV-004, INV-005, INV-006, INV-015, INV-018
- **ADR**: `<HARNESS_ROOT>/decisions/0002-gf2-rank-as-par.md`
- **기술 백서**: §1.2 제품 목표, §2.2 기본 규칙, §12 Phase 0
- **디자인 백서**: 첫 사용자 흐름, TensorGrid·AxisToggle·PULSE 상태
- **프로토콜**: `<HARNESS_ROOT>/docs/PLAYTEST_PROTOCOL.md`

## 7. DoD — 완료 게이트

- [x] **DOD-01 — 규칙 정확성**: 고정 fixture에서 PULSE, Undo, Reset, 완료 결과가 수동 계산과 모두 일치한다. 동일 PULSE 두 번이 원상 복구된다. 증거 수준 E2. (INV-004~006)
- [ ] **DOD-02 — 첫 조작 이해**: 참가자 5명 이상 중 4명 이상이 안내 시작 후 30초 안에 사람의 절차 개입 없이 유효한 행·열을 선택하고 첫 PULSE를 실행한다. 증거 수준 E1.
- [ ] **DOD-03 — 첫 성공**: 참가자 5명 이상 중 4명 이상이 안내 시작 후 90초 안에 지정 퍼즐을 해결한다. 힌트 문구 재읽기는 허용하지만 정답 축 지시는 개입으로 기록한다. 증거 수준 E1.
- [ ] **DOD-04 — 규칙 회상**: 5명 중 4명 이상이 종료 후 “선택한 행과 열의 교차점이 반전되고 겹치면 다시 꺼질 수 있다”는 핵심을 자기 말로 설명한다. 수학 용어는 요구하지 않는다. 증거 수준 E1.
- [ ] **DOD-05 — 중대한 혼동 없음**: 동일한 P0급 혼동—PULSE 결과를 예측할 수 없음, 목표를 인식하지 못함, 핵심 컨트롤 발견 실패—이 참가자 2명 이상에게 반복되지 않는다.
- [ ] **DOD-06 — Scope Lock**: Tutorial 6, Lab 48, Daily, Archive, Sprint 180초, 공유, 한·영, PWA 범위와 비목표가 기술 백서·`<HARNESS_ROOT>/PROGRESS.md`에 일치한다. 규칙 변경이 있다면 ADR이 작성됐다.
- [ ] **DOD-07 — 상태 인계**: 집계 수치, 혼동, 채택한 수정, 폐기한 대안을 `<HARNESS_ROOT>/docs/PLAYTEST_PROTOCOL.md`와 `<HARNESS_ROOT>/PROGRESS.md`에 남긴다.

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
| 다단계 브라우저 스모크 | Easy→Normal→Hard canonical 완주·다음 stage·난도 표기 | 140개 단언·easy=2·normal=3·hard=4·backup=3·콘솔 오류 0 | `evidence/M00/browser-smoke-stages-360x640.png` |
| 신규 사용자 5명+ | 동일 안내 → 4×4 플레이 → 종료 질문 | DOD-02~04 기준 달성 | 익명 집계표·관찰 메모 |
| 360px 모바일 | 터치로 행·열 선택·PULSE | 컨트롤 가림·오입력 없음 | 캡처/녹화 |
| 키보드 사용자 | Tab·Enter/Space로 1회 해결 | 포인터 없이 완료 | 관찰 기록 |

## 10. 증거

### E2 — DOD-01 규칙·세션 검증

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

### E2 — 단일-stage 실제 브라우저 스모크 기준선

```text
server: node prototypes/rule-proof/serve.cjs
command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
exit: 0
browserAssertions=51 viewport=360x640 mainMoves=2 backupMoves=3 consoleErrors=0 screenshot=<PROJECT_ROOT>\AXIS_SHIFT_Harness_KR\evidence\M00\browser-smoke-solved-360x640.png
```

이 기준선은 360×640 무가로스크롤, 44px 이상 타깃, 열→행 키보드 순서, disabled 이유, Preview ON/OFF 기호, 주 fixture 2수·예비 fixture 3수 완주, 중복 PULSE 단일 커밋, Undo, 확인형 Reset, 완료 잠금·포커스·live 상태를 포함한다. 첫 실행에서 Windows 기본 정적 서버가 `.mjs`를 `text/plain`으로 반환한 실패를 재현했고, `serve.cjs`의 `application/javascript` 응답으로 수정한 뒤 통과했다.

### E2 — 최종 다단계 실제 브라우저 스모크

```text
server: node prototypes/rule-proof/serve.cjs
command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
exit: 0
browserAssertions=140 viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3 consoleErrors=0
screenshot=<PROJECT_ROOT>\AXIS_SHIFT_Harness_KR\evidence\M00\browser-smoke-stages-360x640.png
```

Easy·Normal·Hard의 canonical move 수 2·3·4, 예비 회귀 3, 360×640 viewport와 콘솔 오류 0을 함께 확인했다. 이 E2 자동 증거는 난도 stage 구현을 검증하지만 정식 Easy E1 표본을 대체하지 않는다.

### E1 준비 관찰 — 내부 파일럿

- run: 2회, 본 표본 미포함
- 정식 조건: `M00-MAIN-v1` / Easy / 수학적 Par 2
- 관측 최저: 3 PULSE
- 초기 계산이 어긋난 흐름: 4~5 PULSE까지 이어질 수 있음
- 미보고: 참가자 수, 각 run의 시간, 개입 코드, 규칙 회상, 기기 구성
- 게이트 영향: 없음. DOD-02~04 및 §3.1 실행 게이트는 미충족 상태를 유지한다.

### 남은 E1 증거

내부 파일럿 run 2회는 완료했지만 정식 본 플레이테스트는 실행하지 않았다. DOD-02~07은 체크하지 않으며, §3.1의 n≥5·표본 구성·비공개 기록 게이트를 연 뒤에만 Easy 조건의 본 표본을 집계한다. Normal·Hard 탐색 run은 본 표본과 합산하지 않는다.

## 11. 롤백 계획

- 프로토타입은 생산 코드와 분리해 언제든 폐기한다.
- 규칙 이해도 실패 시 시각 표식·안내 순서만 먼저 수정한다.
- PULSE 자체를 바꿔야 한다면 ADR을 작성하고 기술·디자인 백서를 갱신한 뒤 M00을 처음부터 재실행한다.

## 12. 리스크·미지수

- 개발자·AI 친숙 사용자만 모집하면 이해도가 과대평가될 수 있다.
- 관찰자가 무의식적으로 축이나 정답을 가리킬 수 있다.
- 지나치게 쉬운 fixture는 규칙 이해가 아니라 우연 성공을 측정할 수 있다.

## 13. STOP 트리거

- 두 번의 문구·표식 개선 후에도 4/5 성공 기준 미달.
- 성공은 하지만 핵심 규칙을 설명하지 못하는 참가자가 2명 이상.
- 규칙을 통과시키기 위해 별도 수학 강의나 긴 튜토리얼이 필요함.
- 코어 PULSE 규칙 변경 필요.

## 14. 다음 phase 인계

M01에 다음을 전달한다.

- 잠긴 공개 규칙과 입력 흐름
- 검증된 fixture와 예상 보드 결과
- 첫 사용자에게 사용하지 말아야 할 용어·문구
- 360px·키보드에서 확인된 최소 인터랙션 요구
