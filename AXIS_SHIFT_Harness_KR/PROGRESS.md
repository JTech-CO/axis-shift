# PROGRESS.md — AXIS//SHIFT 상태 인계

> 매 세션 갱신되는 라이브 문서다. 세션이 끊겨도 이 파일과 현재 phase만 읽으면 이어서 작업할 수 있어야 한다.

## 현재 상태

- **현재 phase**: M01 — Production Scaffolding & Boundaries 완료 (ADR-0008 선행 체크포인트, M02 미착수)
- **상태**: M01 DOD-01~09·CI·Pages artifact 배포 완료 / M00 formal Easy E1·DOD-02~07은 출시 직전 playable beta까지 미완료 유지
- **마지막 갱신**: 2026-08-14 / deployed `93a4359`, CI·Pages success, 공개 M00 573단언·M01 smoke 8/8
- **목표 릴리스**: OpenAI Game Builders Seoul Track 1 제출 빌드
- **제출 접수 종료**: 2026-08-26

## 이미 끝낸 것

- [x] 게임 주제와 코어 규칙 결정
- [x] 기술 백서 v1.0.0-draft 작성
- [x] 디자인 백서 v1.0.0-draft 작성
- [x] KR Harness Expand Pack을 AXIS//SHIFT용으로 인스턴스화
- [x] 핵심 ADR 7건 초기 등록
- [x] M00~M11 phase와 추적 문서 작성
- [x] M00 주·예비 4×4 fixture 고정 및 독립 rank/BFS 준비 검증
- [x] 부모 `AXIS SHIFT (Tensor)`를 Git·구현 루트로 고정하고 `JTech-CO/axis-shift` origin 연결
- [x] `prototypes/rule-proof/` 최소 프로토타입·fixture verifier·MIME 안전 정적 서버 구현
- [x] M00 DOD-01 E2 확장 verifier 통과 — 196,708개 단언, 전체 65,536 상태, 225개 합법 PULSE
- [x] 단일-stage 360×640 브라우저 스모크 기준선 — 51개 단언, 주 2수·예비 3수, 콘솔 오류 0
- [x] M00 내부 파일럿 run 2회 완료 — 본 표본 제외, 관측 최저 3 PULSE·초기 오계산 흐름 4~5 PULSE
- [x] 초기 폐기형 M00 4×4 stage fixture 고정 — Easy Par 2, Normal Par 3, 당시 Hard Par 4
- [x] P0 발견 전 4×4 다단계 360×640 브라우저 스모크 — 140개 단언, Easy 2수·Normal 3수·당시 Hard 4수·예비 3수, 콘솔 오류 0
- [x] M00 공개 플레이 링크 배포 — commit `68f7614`, GitHub Pages `built`, 공개 URL 브라우저 140개 단언 통과
- [x] `P0-DIFF-001` 재현·판정 — 4×4 full-rank에서 행/열 단일 축 순회 4회가 Par 4 최적해가 되어 기존 Hard 난도 라벨의 구성 타당성이 무너짐
- [x] `m00-seeded-v1` 난도 검증기와 여섯 playable profile 구현 — Easy 4×4, Normal 4×4·5×5, Hard 4×4·5×5·6×6; Full Rank는 대조군으로 분리
- [x] 생성기·fixture 최종 verifier — 독립 minor·행 루프 oracle, 7 golden vectors, fallback·밀도·Hard 4×4 initial 노이즈 포함 200,967개 단언·실패 0
- [x] 반복 UX 구현 — URL seed 재현, 직전 target 최대 32회 제외, 진행 확인·실패 시 보드 보존, sweep 대안 안내, visibility-safe 스톱워치와 PULSE·0.1초 결과
- [x] 여섯 profile·대조군 최종 Edge 스모크 — 573개 단언, 320/360/960px, canonical 2·3·3·2·3·3수, 예비 3수, crypto+fallback·타이머·sweep·콘솔 오류 0
- [x] 사람 대상 폐기형 난도 비교 관찰 — 5×5·6×6 모두 4×4보다 생각할 거리가 있고 지나치게 쉽지 않다는 후기 확보; 표본 메타데이터 미보고로 Easy 본 표본·DOD 수치에는 미합산
- [x] 난도별 보드 크기 풀 결정 — Easy=4×4, Normal=4×4·5×5, Hard=4×4·5×5·6×6
- [x] formal Easy E1 실행 시점 결정 — 참가자·개별 기록을 확인할 수 없는 현재는 수집하지 않고 출시 직전 playable beta에서 n≥5로 실행
- [x] M01 React·TypeScript·Vite 최소 AppShell — Hash Router의 `/`, `/daily`, wildcard 복구 route와 Error Boundary, 한·영 키 골격
- [x] Node 24/npm 11 생산 도구 체인 — strict TypeScript, ESLint, Prettier, Vitest, Playwright, lockfile, non-root base 설정
- [x] 자동 경계·zero-target validator — 실제 source 37개 순환/경계 0건, 위반 7종·순환 1종 fixture, 레벨 해법 합성·Daily 구현 탐지 self-check
- [x] M01 로컬 E2 — verify 10단계, unit 5/5, 정적 접근성 target 6개, Chromium·Firefox·WebKit route/44px E2E 12/12
- [x] PR CI — Node 24 `npm ci`부터 동일 품질 명령·non-root build·Chromium core E2E까지 연결
- [x] Pages artifact 호환 배포 구현 — M00 루트·stage/seed·anchor·직접 경로와 M01 hash route를 한 artifact에 조립, 3엔진 24/24
- [x] Pages artifact 공개 전환 — legacy SHA `576e6db` 백업, `build_type=workflow`, commit `93a4359` 배포, CI·Pages Actions와 공개 M00/M01 smoke 통과

## 다음 할 일

1. M02는 별도 착수 지시 전 시작하지 않는다.
2. M01 완료를 M00 formal E1이나 DOD-02~07 통과로 해석하지 않는다.
3. 출시 직전 playable beta의 SHA·공개 URL이 고정되면 신규 사용자 n≥5, 표본 구성, 비공개 원시 기록 위치·삭제 예정일을 확정한다.

### Formal Easy 게이트 연기 경계

- 2026-08-10 프로젝트 오너 결정으로 참가자 수·개별 기록을 검증할 지표가 없는 현시점의 formal Easy 자료 수집을 출시 직전 playable beta까지 연기한다.
- 연기는 `PASS`, 면제, 표본 축소가 아니다. n≥5, 4/5, 30초 첫 PULSE, 90초 첫 성공, 규칙 회상 기준은 바꾸지 않는다.
- verifier 200,967개 단언과 Edge 573개 단언은 구현·구조 E2 완료 증거일 뿐 사람 대상 E1을 대체하지 않는다.
- DOD-02~05와 그 결론에 의존하는 DOD-06~07은 베타 증거가 기록될 때까지 미완료다. 별도 지시에 따른 구현 체크포인트 push와 M00 phase 완료·마일스톤 DoD push는 서로 다른 상태다.

## 현재 미결 질문 / 사용자 결정 대기

- 공개 저장소의 최종 라이선스: 결정 전 package는 `private: true`·`UNLICENSED`로 유지한다.
- 최종 프로덕션 URL: GitHub Pages 경로와 별도 도메인 사용 여부.
- 앱 표시 기본 언어: 브라우저 언어 자동 감지 후 한국어/영어 폴백 순서 확인.
- 기술 백서의 “10초 내 행·열 선택과 교차점 반전 관계 이해”를 M00 통과 게이트로 볼지 별도 관찰 지표로 볼지.
- Sprint의 정확한 점수식과 동점 처리 우선순위. 기술 백서는 지표만 정의하고 산식은 정의하지 않음.
- Daily Archive 공개 시작일 또는 표시 하한.

이 미결 항목은 M00·M01에서 필요한 시점에 결정한다. 결정 전 임의로 공개 계약을 고정하지 않는다.

## Phase 현황

| Phase | 이름 | 상태 | 핵심 출구 게이트 |
|---|---|---|---|
| M00 | Rule Proof & Scope Lock | 진행 중 — 구현·E2 완료 / formal E1은 출시 직전 베타로 연기 | 베타 n≥5에서 4/5 기준 판정; 현재 미완료 |
| M01 | Production Scaffolding | 완료 — ADR-0008 제한 체크포인트, DOD-01~09·CI·Pages smoke 통과 | 완료 |
| M02 | Board & GF(2) Core | 미시작 | 3×3 전수에서 brute-force = rank |
| M03 | Generator & Content Pipeline | 미시작 | 10년 Daily 감사, 54개 정적 레벨 검증 |
| M04 | Session, Persistence & Scoring | 미시작 | reducer·저장·시간·등급 정합 |
| M05 | Design System & Shared UI | 미시작 | 360px·테마·키보드·상태 fixture |
| M06 | Tutorial & Lab | 미시작 | 튜토리얼 6 + Lab 48 전체 플레이 가능 |
| M07 | Daily & Archive | 미시작 | 날짜 결정성·streak·archive 회귀 |
| M08 | Sprint | 미시작 | 180초 절대 종료·점수 재현 |
| M09 | Sharing, PWA, i18n & Feedback | 미시작 | 스포일러 없는 공유·오프라인·한영 |
| M10 | Integration QA & Deployment | 미시작 | 전체 CI·실제 URL·P0/P1 0건 |
| M11 | Release Freeze & Submission | 미시작 | 제출 패키지·태그·최종 링크 고정 |

## 최근 게이트 증거

| 일시 | Phase | Gate | 명령/절차 | 결과 | 증거 위치 |
|---|---|---|---|---|---|
| 2026-08-09 | 문서 준비 | Harness completeness | 파일 구조·내부 참조 검증 | 생성 완료 | 이 패키지 `MANIFEST.sha256` |
| 2026-08-09 | M00 | DoR fixture readiness | Node 4×4 전체 상태 BFS 준비 계산 | main rank/BFS=2/2, backup=3/3 | `AXIS_SHIFT_Harness_KR/phases/M00_rule_proof.md` §3.2 |
| 2026-08-09 | M00 | Workspace root contract | GitHub metadata + `git init -b main` + origin 연결 | root=`AXIS SHIFT (Tensor)`, remote public/main/empty, push 없음 | 루트 `AGENTS.md` |
| 2026-08-09 | M00 | DOD-01 초기 4×4 다단계 E2 | `node prototypes/rule-proof/verify-fixture.mjs` | stageSequence=easy:2>normal:3>hard:4, assertions=196708, failures=0 | `phases/M00_rule_proof.md` §10 역사 로그 |
| 2026-08-09 | M00 | 단일-stage 브라우저 스모크 기준선 E2 | `node prototypes/rule-proof/browser-smoke.cjs` | assertions=51, 360×640, main=2, backup=3, consoleErrors=0 | `evidence/M00/browser-smoke-solved-360x640.png` |
| 2026-08-09 | M00 | 초기 4×4 다단계 브라우저 스모크 E2 | `node prototypes/rule-proof/browser-smoke.cjs` | assertions=140, 360×640, easy=2, normal=3, hard=4, backup=3, consoleErrors=0 | `phases/M00_rule_proof.md` §10 역사 로그; 캡처는 최신 E2로 교체됨 |
| 2026-08-09 | M00 | 공개 Pages 플레이 스모크 E2 | `git push -u origin main` → Pages built → 공개 URL browser smoke | commit=`68f7614`, HTTP 200, assertions=140, consoleErrors=0 | `https://jtech-co.github.io/axis-shift/` |
| 2026-08-09 | M00 | 내부 파일럿 관찰 | 폐기형 프로토타입 run 2회 | 본 표본 제외; 관측 최저=3 PULSE, 초기 오계산 흐름=4~5 PULSE; 시간·참가자 수·개입 미보고 | `docs/PLAYTEST_PROTOCOL.md` §13 |
| 2026-08-09 | M00 | P0-DIFF-001 난도 진단 | 4×4 차이 행렬을 단일 행·열 외적의 합으로 분해 | Easy/Normal/Full Rank 대조군 `compressionGap=2/1/0`; 기존 Hard 라벨 무효, PULSE·Par 계약은 정상 | `phases/M00_rule_proof.md` §3.3, `docs/PUZZLE_MATH.md` §7.3 |
| 2026-08-09 | M00 | seed 생성기·여섯 profile 최종 E2 | `node prototypes/rule-proof/verify-fixture.mjs` | assertions=200967; profiles=6+control 1; golden=7; sequence=2·3·3·2·3·3; failures=0 | `phases/M00_rule_proof.md` §10 |
| 2026-08-09 | M00 | 반복 UX 최종 Edge E2 | `node prototypes/rule-proof/browser-smoke.cjs` | assertions=573; 320/360/960px; timer=visibility-safe; newTarget=crypto+fallback; sweepGuidance=column; consoleErrors=0 | `evidence/M00/browser-smoke-stages-360x640.png` |
| 2026-08-09 | M00 | 비게이트 난도 비교 관찰 | 사람 대상 5×5·6×6 비교 플레이 후기 | 둘 다 4×4보다 생각할 거리가 있고 지나치게 쉽지 않음; 난도별 크기 풀 채택; 참가자 수·시간·기기·개입 미보고로 DOD 미집계 | `docs/PLAYTEST_PROTOCOL.md` §13 |
| 2026-08-10 | M00 | formal Easy E1 일정 결정 | 프로젝트 오너 결정 | 출시 직전 playable beta까지 자료 수집·DOD-02~07 판정 연기; PASS·면제 아님 | `phases/M00_rule_proof.md` §3.1, `docs/PLAYTEST_PROTOCOL.md` §13 |
| 2026-08-11 | M00 | 구현 체크포인트 Pages 배포 | application=`5d57e09d250859b4eccdf64bca784f8ae527f6ce`, Pages `built` → 공개 URL Edge smoke | assertions=573; viewport=320/360/960; consoleErrors=0 | `https://jtech-co.github.io/axis-shift/`, `phases/M00_rule_proof.md` §10 |
| 2026-08-14 | M01 | DOD-02~05·07·09 로컬 품질·경계 | Node 24 `npm run verify` + `npm run test:a11y` | scripts=14/14; unit=5/5; boundaries files=37, violations=0, cycles=0, lintAssertions=7; secret findings=0; a11y targets=6 | `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | DOD-03 zero-target validator 안전성 | `validate:levels` + `audit:daily` | level files=0/selfChecks=2; Daily implementations=0/detectorSelfChecks=2; 무조건 통과 stub 아님 | `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | DOD-06 non-root route·AppShell target | Node 24 `npm run test:e2e` | Chromium·Firefox·WebKit 12/12; 3 routes HTTP 200; computed target ≥44px | `tests/e2e/routes.spec.ts`, `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | ADR-0009 Pages artifact 호환 E2 | final clean checkout `npm run build:pages` + `npm run test:pages` | files=14, bytes=327103, M00 runtime=10; Chromium·Firefox·WebKit 24/24; asset HTTP 200; 오류 0 | `tests/pages/pages-artifact.spec.ts`, `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | DOD-01 재현 설치 | commit `bf3d1fe` detached clean checkout, Node 24 `npm ci` → `npm run verify` | 261 packages, vulnerabilities=0, lock hash 동일, tracked changes=0, verify 10단계 통과 | `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | CI·Pages artifact 공개 배포 | legacy backup → Pages workflow 전환 → `main` push → Actions → 공개 smoke | deployed=`93a4359`; CI run 31733232235 success; Pages run 31733232206 success; public M01 8/8; M00 573단언·오류 0 | `https://jtech-co.github.io/axis-shift/`, `phases/M01_scaffolding.md` §10 |

### M01 최신 검증 출력

```text
environment: Windows, node=v24.19.0, npm=11.6.2
scriptContract required=14 missing=0
Vitest: files=2 tests=5 failures=0
boundaries files=37 edges=23 violations=0 cycles=0 lintFixtures=4 lintAssertions=7 cycleFixtures=1
levelValidation files=0 levels=0 rankChecks=0 solutionChecks=0 validatorSelfChecks=2 failures=0
dailyAudit sourceFiles=1 implementations=0 dates=0 puzzleChecks=0 detectorSelfChecks=2 failures=0
secretScan files=143 findings=0
a11yTargetAudit files=12 interactiveTargets=6 staticNames=true computedSizeChecks=0 failures=0
build modules=41 JS=233.88kB gzip=74.94kB CSS=2.73kB gzip=1.15kB
Playwright: chromium+firefox+webkit tests=12 passed
Pages artifact: files=14 bytes=327103 prototypeFiles=10
Pages Playwright: chromium+firefox+webkit tests=24 passed
package-lock SHA256 before=after=3D8ECB7F611A72BC815DE3A2F1A0189546A1B607E558E508C1A3E47DAD50915B
clean checkout: commit=bf3d1fe npmCiExit=0 lockBefore=lockAfter trackedChanges=0
remote: commit=93a4359 CI=success Pages=success buildType=workflow
public: M01 Chromium=8/8 M00 assertions=573 consoleErrors=0
remaining M01: none
```

### M00 최신 검증 출력

```text
current command: node prototypes/rule-proof/verify-fixture.mjs
exit: 0
fixture=M00-MAIN-v1 size=4 rank=2 bfs=2
difficulty=M00-MAIN-v1 rank=2 sweep=4 gap=2 density=0.6250 hardGate=pass
fixture=M00-NORMAL-v1 size=4 rank=3 bfs=3
difficulty=M00-NORMAL-v1 rank=3 sweep=4 gap=1 density=0.5000 hardGate=fail
fixture=M00-NORMAL-5X5-v1 size=5 rank=3 bfs=not-run
difficulty=M00-NORMAL-5X5-v1 rank=3 sweep=4 gap=1 density=0.5200 hardGate=fail
fixture=M00-CANDIDATE-4X4-v1 size=4 rank=2 bfs=2
difficulty=M00-CANDIDATE-4X4-v1 rank=2 sweep=4 gap=2 density=0.6250 hardGate=pass
fixture=M00-CANDIDATE-5X5-v1 size=5 rank=3 bfs=not-run
difficulty=M00-CANDIDATE-5X5-v1 rank=3 sweep=5 gap=2 density=0.6400 hardGate=pass
fixture=M00-CANDIDATE-6X6-v1 size=6 rank=3 bfs=not-run
difficulty=M00-CANDIDATE-6X6-v1 rank=3 sweep=6 gap=3 density=0.5556 hardGate=pass
fixture=M00-HARD-v1 size=4 rank=4 bfs=4
difficulty=M00-HARD-v1 rank=4 sweep=4 gap=0 density=0.5625 hardGate=fail
fixture=M00-BACKUP-v1 size=4 rank=3 bfs=3
difficulty=M00-BACKUP-v1 rank=3 sweep=4 gap=1 density=0.6250 hardGate=fail
generatorRegression=version:m00-seeded-v1 playableProfiles:6 controlProfiles:1 goldenVectors:7 seedsPerProfile:12 maxAttempts:512 density:0.22-0.68 hard4Initial:0.25-0.5
stageSequence=easy:2>normal:3>normal-5:3>hard-4:2>hard-5:3>hard-6:3
assertions=200967 bfsVisited=65536 legalPulseCount=225 failures=0

historical baseline server: node prototypes/rule-proof/serve.cjs
historical baseline command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
historical baseline exit: 0
browserAssertions=51 viewport=360x640 mainMoves=2 backupMoves=3 consoleErrors=0
current server: node prototypes/rule-proof/serve.cjs
current browser command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
current browser exit: 0
browserAssertions=573 viewport=320/360/960 easyMoves=2 normal4Moves=3 normal5Moves=3 hard4Moves=2 hard5Moves=3 hard6Moves=3 backupMoves=3 timer=visibility-safe newTarget=crypto+fallback sweepGuidance=column consoleErrors=0 screenshot=<PROJECT_ROOT>\AXIS_SHIFT_Harness_KR\evidence\M00\browser-smoke-stages-360x640.png

publish command: git push -u origin main
published commit: 68f7614659675171fbfbd3535e1d04b08bee931f
pages status: built
public URL: https://jtech-co.github.io/axis-shift/
public browserAssertions=140 viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3 consoleErrors=0

```

51개·140개 단언 출력은 단일-stage와 P0 발견 전 4×4 다단계의 역사 기준선으로 보존한다. 동일 캡처 경로는 현재 573개 단언 E2 이미지로 교체됐다. `hardGate`는 anti-sweep 구조 적격성만 뜻하며 Easy도 통과하므로 체감 Hard 승인이 아니다. 5×5·6×6의 `bfs=not-run`은 이동 거리 전수 BFS를 큰 보드에 적용하지 않았다는 범위 표기다. 자동 검증과 내부 파일럿은 DOD-02~04의 E1 본 표본을 대체하지 않는다.

현재 구현은 체크포인트 `5d57e09d250859b4eccdf64bca784f8ae527f6ce`로 `main`에 push됐고 GitHub Pages `built` 뒤 공개 URL Edge 573 단언·320/360/960px·콘솔 오류 0으로 통과했다. formal Easy E1과 DOD-02~07은 출시 직전 beta에서 별도 판정하며, 이 구현 체크포인트 push를 M00 phase 완료로 해석하지 않는다.

## 활성 위험

| ID | 위험 | 가능성 | 영향 | 대응 | 담당 phase |
|---|---|---:|---:|---|---|
| R-01 | 텐서 소재가 첫 사용자에게 어렵게 느껴짐 | 중 | 매우 높음 | M00 이해도 게이트, 첫 플레이에서 수학 용어 제거 | M00·M06 |
| R-02 | generator/par 오답이 전체 신뢰를 훼손 | 낮음 | 매우 높음 | 전수·property test, 단일 도메인 코어 | M02·M03 |
| R-03 | 48개 Lab 콘텐츠 큐레이션 일정 부족 | 중 | 높음 | 자동 후보 생성 + 사람이 패턴·난도 검수 | M03·M06 |
| R-04 | PWA 캐시가 제출 직전 구버전을 제공 | 중 | 높음 | prompt update, 실제 URL cache reset·smoke | M09·M10 |
| R-05 | 모바일 6×6에서 축 타깃과 PULSE가 겹침 | 중 | 높음 | 360×640 fixture와 실기기 테스트 | M05·M10 |
| R-06 | 공유 서명이 정답/이동을 간접 노출 | 낮음 | 높음 | 금지 필드 invariant, payload snapshot, 수동 검토 | M09 |
| R-07 | 기능 범위가 일정 안에 과도함 | 중 | 매우 높음 | phase gate, 8/21 scope freeze, P0/P1 우선 | 전역 |
| R-08 | rank/Par만으로 난도를 정하면 단일 축 순회가 최적 또는 준최적이 됨 | 높음 | 매우 높음 | `sweepBound`·`compressionGap` 검증, full-rank를 난도 stage가 아닌 대조군으로 분리, 사람 비교 | M00·M03·M06 |

해소된 위험: R-09는 ADR-0009 artifact workflow 전환, legacy backup branch, 공개 M00 573단언·M01 8/8 smoke로 2026-08-14 닫았다.
## 막힘 기록

현재 없음.

STOP 발동 시 아래 형식으로 추가한다.

```text
일시 / phase
증상:
재현:
기대 / 실제:
시도 1:
시도 2:
시도 3:
가설:
영향 INV·DoD:
필요 결정:
```

## 결정 로그

- ADR-0001: 도메인 코어를 단일 TypeScript 기준 구현으로 둔다.
- ADR-0002: `GF(2)` 랭크를 공식 Par로 사용한다.
- ADR-0003: Daily를 UTC·버전 기반 결정적 생성으로 만든다.
- ADR-0004: 정적 PWA·Hash Router·GitHub Pages를 채택한다.
- ADR-0005: DOM/CSS Grid 보드, Canvas 공유 카드만 사용한다.
- ADR-0006: Signal Signature 기반 스포일러 없는 공유를 채택한다.
- ADR-0007: 로컬 전용 데이터와 런타임 AI API 없음 원칙을 채택한다.
- ADR-0008: M00 formal E1을 통과 처리하지 않은 채 M01의 도구·경계·라우팅·CI 체크포인트만 선행 착수한다.
- Workspace-2026-08-09: 부모 `AXIS SHIFT (Tensor)`를 Git·구현 루트로, `AXIS_SHIFT_Harness_KR`를 가이드·증거 폴더로 유지한다.
- 2026-08-09: 내부 파일럿 run 2회에서 Easy stage의 관측 최저는 3 PULSE였고, 초기 계산이 어긋난 흐름은 4~5 PULSE까지 이어질 수 있었다. 이는 수학적 Par 2를 바꾸지 않으며 참가자 수·시간·개입은 미보고로 둔다.
- 2026-08-09: M00 정식 조건은 `M00-MAIN-v1` Easy 하나로 유지하고 Normal·당시 Hard는 폐기형 난도 탐색 stage로 추가했다. 이후 당시 Hard는 `P0-DIFF-001`에 따라 Full Rank 대조군으로 재분류했다. 날짜당 한 문제 제한은 Daily 모드에만 적용하며, Wordle 유사성은 간결한 SNS 공유 결과 레이아웃에만 한정한다.
- 2026-08-09: 프로젝트 오너 결정으로 참가자 모집은 플레이 가능한 M00 프로토타입과 내부 파일럿 이후 진행한다. 본 테스트의 n≥5 및 4/5 통과 기준은 유지한다.
- 2026-08-09: `P0-DIFF-001`을 난도 구성 타당성 결함으로 등록한다. 4×4 full-rank 차이 행렬은 단일 열 또는 행 순회 4회가 Par 4 최적해이므로 기존 Hard 라벨을 폐기하고 `4×4 Full Rank 대조군`으로 재분류한다. 코어 PULSE, INV-005·INV-006, ADR-0002의 `Par=rank_GF2` 계약은 변경하지 않는다.
- 2026-08-09: 난도 보조 지표를 `sweepBound=min(nonzeroRows, nonzeroCols)`, `compressionGap=sweepBound-rank`로 정의한다. Easy 본 테스트는 유지하되 5×5·6×6 난도 실험과 검증 증거가 끝날 때까지 DOD-06 Scope Lock과 M00 완료를 보류한다.
- 2026-08-09: 사람 대상 폐기형 비교에서 5×5·6×6 모두 4×4보다 생각할 거리가 있고 지나치게 쉽지 않다는 후기를 근거로 보드 크기 풀을 Easy=4×4, Normal=4×4·5×5, Hard=4×4·5×5·6×6으로 채택한다. 이는 크기 조합 결정이며 현재 4×4 Full Rank 대조군을 Hard fixture로 복귀시키는 결정이 아니다.
- 2026-08-09: `m00-seeded-v1` 여섯 profile과 URL seed 재현, 직전 target 최대 32회 제외, 실패 시 현재 보드 보존을 구현했다. 단일 행/열 sweep 완료는 성공으로 인정하되 다른 풀이를 권하고, visibility-safe 스톱워치와 완료 PULSE·0.1초를 제공한다. verifier 200,967개·Edge 573개 단언으로 회귀했으며 코어 PULSE와 Par 계약은 바꾸지 않는다.
- 2026-08-09: 위 난도 비교의 참가자 수·시간·기기·개입·DOD-02~04 지표는 보고되지 않았다. 이를 추정하거나 Easy 본 표본에 합산하지 않으며 M00 완료와 DOD-06 Scope Lock은 계속 보류한다.
- 2026-08-10: 참가자 수·개별 기록을 검증할 지표가 없는 현시점에는 formal Easy n≥5 자료를 수집하지 않는다. 출시 직전 동일 playable beta 빌드에서 §3.1 표본·보관 게이트를 먼저 충족한 뒤 DOD-02~05와 그 결론에 의존하는 DOD-06~07을 판정한다. 이는 PASS·면제·임계치 완화가 아니며, 별도 구현 체크포인트 push도 M00 phase 완료를 뜻하지 않는다.
- 2026-08-14: 프로젝트 오너가 M00 사람 대상 gate 전 M01 체크포인트 착수를 승인했다. ADR-0008에 따라 스캐폴딩·라우팅·경계·CI에만 한정하며 M00 DOD-02~07, M02 착수, 릴리스 승인을 대신하지 않는다.
