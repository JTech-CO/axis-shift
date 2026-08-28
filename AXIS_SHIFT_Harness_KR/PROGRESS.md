# PROGRESS.md — AXIS//SHIFT 상태 인계

> 매 세션 갱신되는 라이브 문서다. 세션이 끊겨도 이 파일과 현재 phase만 읽으면 이어서 작업할 수 있어야 한다.

## 현재 상태

- **현재 phase**: M05 — Design System & Shared Game UI 종료 후보; public Pages 검증 중
- **상태**: 자동 E2/E3 PASS·프로젝트 오너 visual baseline 9/9 승인; 수동 E1 0/4는 ADR-0012로 M10 이관; fixed commit·public submitted-URL smoke 대기
- **마지막 갱신**: 2026-08-29 / global 30파일 180테스트, axe 18/18, visual 18/18·diff 0, Pages 3브라우저 30/30, prototype browser 908단언 PASS
- **목표 릴리스**: `v0.1.0-hackathon` — OpenAI Game Builders Seoul Track 1 제출 슬라이스 완료
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
- [x] 2026-08-16 formal Easy `M00-R1` — 신규 인터넷 익명 사용자 5명, 동일 Pages `b0f935e`·`M00-MAIN-v1`, I0 5/5, 첫 PULSE≤30초 5/5, 첫 성공≤90초 5/5, 규칙 회상 5/5
- [x] M00 DOD-01~07 완료 — aggregate-only E1 제한과 비공개 로컬 증거를 실제 행사 제출 완료 확인 뒤에만 삭제하는 경계를 보존
- [x] ADR-0010 채택 — 정규 M02~M11과 분리된 H00 `v0.1.0-hackathon` lane, 3D·새 모드·대형 dependency 제외
- [x] H00 campaign 카탈로그 — 기존 6 profile × 고정 signal 3개, 총 18개·중복 0·canonical/Par/Hard gate 검증
- [x] H00 반복 UX — signal 1→18 순차 CTA, 18→1 wrap, 결과 패널 같은 구역 랜덤 재플레이, invalid signal=1 정규화
- [x] H00 AXIS 연출 — 선택 행·열 rail, PULSE 360ms 양축 charge·교차 impact, 완료 Signal Lock, reduced motion·forced colors 유지
- [x] H00 local E2/E1 — verifier 217, browser 891, 320/360/390/960, externalRequests=0, Pages 27/27, 360·390 완료 화면 육안 PASS
- [x] H00 clean release 검증 — release SHA `6690f5778f706e1875b452d552bd75ba1c06ee9a`, Node 24 `npm ci`, lock 동일·취약점 0, verify 10·E2E 12/12·Pages 27/27·a11y 0
- [x] H00 공개 E4 — CI run `32453169036`, Pages run `32453169029`, deployed SHA 일치, artifact digest `sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998`, 공개 browser 891·오류 0
- [x] H00 제출 준비 패키지 — final release SHA 실제 공개 빌드 썸네일·14.84초 영상, 독립 field check 2회, tag/pre-release `v0.1.0-hackathon`, manifest 14/14, 별도 경로의 15파일 backup 2곳·hash delta 0
- [x] M02 보드·PULSE·`GF(2)` 도메인 코어 — 크기 3~8 guard, 빈 축 no-op, exact-cell 반전, 차이·완료 판정, 결정적 rank·canonical factorization 공개 API 고정
- [x] M02 독립 수학 오라클 — 3×3 전체 512개 BFS 최소 수와 rank mismatch 0, 4×4~8×8 고정 시드 각 10,000개 포함 총 50,000개 round-trip·결정성 실패 0
- [x] M02 품질 계약 — domain 6파일/27테스트, 지정 runtime 5파일 statements/branches/functions/lines 각각 100%, validator self-check 2/2, boundary 위반 0, verify 10단계
- [x] M03 `v1` 생성기 자동 계약 — NFKC→SHA-256 상위 32비트 big-endian→Mulberry32/rejection sampling, 엄격 UTC 날짜, stable serialization, 20×100 PRNG golden과 Daily golden 20개
- [x] M03 정적 콘텐츠 객관 검증 — Tutorial 6 + Lab 48(4 chapter×12), 14 fallback, 54개 Par·canonical round-trip·태그·ID·title key 실패 0, catalog hash `c625d543…1738484`
- [x] M03 DOD-04 사람 큐레이션 — 프로젝트 오너가 2026-08-26 54개 패턴과 progression 5행을 전체 승인, metadata `프로젝트 오너` / `2026-08-26T00:20:42+09:00` / `APPROVED`, 교체·재분류 없음
- [x] M03 Daily 장기 감사 pre-close rehearsal — 변경 없는 미커밋 working tree에서 2026-01-01부터 3,650일 예외·invalid·wrong Par·fallback·인접 중복·분포 실패 0, 최대 시도 107, report SHA 2회 동일. DOD-10 fixed-SHA 증거는 아님
- [x] M03 환경 parity — PRNG 20 seed×100 출력과 Daily golden 20개를 Chromium·Firefox·WebKit 9/9로 확인, UTC·서울·LA 시간대별 프로세스 3개에서 각각 10회 해시 불일치 0
- [x] M03 DOD-10 fixed-SHA 종료 — candidate `1c313bd29e1d24c483749af90a8734542988be5d`, clean Node `v24.19.0`/npm `11.6.2`, verify 10/10·3브라우저 9/9, 서로 다른 출력 경로의 3,650일 감사 2회 report SHA `b1102aee…6d49` 동일
- [x] H00 공식 제출 — 프로젝트 오너가 공식 양식 제출 완료를 확인했다. 정확한 접수 시각·접수 ID·확인 화면은 제공되지 않아 생성하지 않으며 Codex는 인증·개인정보·동의·Submit을 수행하지 않았다.
- [x] M04 session reducer·selector — actionId append-only ledger, 원자 PULSE·완료 event, Undo·호출자 고유-ID Reset, Hint 1~3, `TIMER_TICK` high-water와 visibility pause
- [x] M04 ID service — issued ledger seed·reserve·invalid/duplicate retry·128회 exhaustion; M06 singleton·crypto source integration 경계 보존
- [x] M04 scoring·clock — `WeakSet` provenance completion→opaque record projection, S/A/B/C·Hint cap, `grade→PULSE→active elapsed` best tuple, 주입 Clock·year≥1 canonical UTC 변환
- [x] M04 persistence v1 — 네 root, pre-start canonical ready·started-unsolved paused snapshot, exact ledger/clock guard·null-prototype Lab map, quarantine backup-before-delete·collision retry·progress salvage 재저장·경고 dedupe
- [x] M04 품질 게이트 — focused 12파일 92테스트, migration 3테스트, aggregate S98.90/B98.79/F100/L98.95, per-file branch 11/11·최저 95.45%, global 23파일 147테스트, lint·format·typecheck·boundaries 통과
- [x] M04 build hardening — 기존 `dist`에서 발생한 Vite 8 Windows native cleanup crash 회피용 검증된 preclean + `emptyOutDir=false` canonical build
- [x] M04 원격 체크포인트 — commit `95fbff2b4bff261ff16784099dc2a02df7473069`를 `origin/codex/m04-session-persistence-scoring`에 push; PR 없음
- [x] M05 shared UI 자동 체크포인트 — dark/light/system token, Theme 기본 dark 순환 버튼, Motion 기본 system 토글, common/layout/game presentational component, 8개 상태+long-copy fixture, keyboard·axe·visual harness 구현
- [x] M05 ADR-0011 자동 품질 — focused 7파일 33테스트, global 30파일 180테스트, token 16파일·하드코드 0·예외 13, axe 18/18, visual update/no-update 18/18·full-fixture baseline 9·strict diff 0, keyboard 3브라우저 9/9, boundary·static a11y·build·Pages·verify PASS

## 다음 할 일

1. M05 후보를 commit·push하고 Pages workflow를 실행해 기존 제출 URL의 Theme/Motion·18-signal 플레이·stage/signal/seed/hash를 공개 smoke한다.
2. public smoke 뒤 M05를 닫고 M06 DoR를 확인한다. M06는 M04 `IdGenerator` singleton·crypto source, Page Visibility·tick, paused resume, Result/Lab best 저장과 reload E2E를 실제 feature controller에 연결한다.
3. M07은 UTC Daily·streak·Archive를 추가하고, Sprint 180초 절대 종료·총점·동점 규칙은 계속 M08까지 결정하지 않는다.
4. H00 비공개 playtest·submission 자료와 두 backup은 Git에 넣지 않는다. 제출 완료 조건은 충족됐지만 이번 작업에서는 삭제하지 않았으며, 프로젝트 오너의 명시적 정리 결정 전까지 보존한다.
5. H00의 권리 상태는 `UNLICENSED` / All Rights Reserved로 고정했다. 공개 OSS 라이선스 채택 여부는 M11 오너 결정으로 남긴다.

### Formal Easy 게이트 종료 경계

- 2026-08-16 서로 다른 신규 인터넷 익명 사용자 5명이 동일 Pages 배포 `b0f935e396805bab9c0847847068cb9a3522968f`의 루트 기본 Easy `M00-MAIN-v1`을 플레이했다.
- 진행자 개입 없음(I0 5/5), 30초 첫 PULSE 5/5, 90초 첫 성공 5/5, 핵심 규칙 회상 5/5로 4/5 기준을 모두 초과했다. 반복 P0 규칙 혼동 보고는 0건이다.
- 4명은 PC, 1명은 mobile Chrome을 사용했다. 참가자별 ID·정확한 초·PULSE 수·PC 환경·전문성 층화는 기록되지 않았다.
- 프로젝트 오너는 2026-08-21 aggregate-only E1 한계를 인지하고 M00 종료를 승인했다. 누락값을 생성하지 않으며 M06/M10 증거로 재사용하지 않는다.
- 비공개 집계는 `<PROJECT_ROOT>/.private/playtests/M00-R1-2026-08-16.md`에 Git 미추적으로 보관한다. 공식 제출 완료는 확인됐지만 삭제는 별도 명시적 정리 작업으로 남긴다.
- verifier 200,967개와 browser 573개는 E2, M00-R1은 E1로 분리해 유지한다.

## 현재 미결 질문 / 사용자 결정 대기

- M11 공개 OSS 라이선스: H00 v0.1은 `private: true`·`UNLICENSED` / All Rights Reserved로 확정했으며, 이후 라이선스 부여는 프로젝트 오너가 별도로 결정한다.
- 최종 프로덕션 URL: GitHub Pages 경로와 별도 도메인 사용 여부.
- 앱 표시 기본 언어: 브라우저 언어 자동 감지 후 한국어/영어 폴백 순서 확인.
- 기술 백서의 “10초 내 행·열 선택과 교차점 반전 관계 이해”를 M00 통과 게이트로 볼지 별도 관찰 지표로 볼지.
- Sprint의 정확한 점수식과 동점 처리 우선순위. 기술 백서는 지표만 정의하고 산식은 정의하지 않음.
- Daily Archive 공개 시작일 또는 표시 하한.

이 미결 항목은 M02~M11에서 필요한 시점에 결정한다. 결정 전 임의로 공개 계약을 고정하지 않는다.

## Phase 현황

| Phase | 이름 | 상태 | 핵심 출구 게이트 |
|---|---|---|---|
| M00 | Rule Proof & Scope Lock | 완료 — DOD-01~07, M00-R1 행동 기준 5/5 | aggregate-only E1 제한 보존, M06/M10 재사용 금지 |
| M01 | Production Scaffolding | 완료 — ADR-0008 제한 체크포인트, DOD-01~09·CI·Pages smoke 통과 | 완료 |
| H00 | Hackathon Submission Slice | 완료 — DOD-01~12, tag/pre-release `v0.1.0-hackathon`, 오너 공식 제출 확인 | clean checkout·public E4·릴리스 정직성·제출 패키지·2중 backup; 접수 시각/ID 미제공 경계 보존 |
| M02 | Board & GF(2) Core | 완료 — DOD-01~10 | 3×3 전수 512 mismatch 0, 4~8 총 50,000 round-trip·결정성 실패 0, core coverage 각 100% |
| M03 | Generator & Content Pipeline | 완료 — DOD-01~11 | 오너 전체 승인 + candidate `1c313bd…98be5d` exact-SHA 감사 2회 동일 + PR #7 CI PASS |
| M04 | Session, Persistence & Scoring | 완료 — DOD-01~13 | 12파일 92테스트, B98.79%, 11/11 per-file branch·네 v1 root·격리·재개 정규화 |
| M05 | Design System & Shared UI | 종료 후보 — 자동 PASS·오너 baseline 9/9 승인·수동 E1 0/4 M10 이관; public Pages 대기 | 30파일/180 unit·18 axe·18 visual diff 0·Pages 30/30·prototype 908단언 |
| M06 | Tutorial & Lab | 미시작 | 튜토리얼 6 + Lab 48 전체 플레이 가능 |
| M07 | Daily & Archive | 미시작 | 날짜 결정성·streak·archive 회귀 |
| M08 | Sprint | 미시작 | 180초 절대 종료·점수 재현 |
| M09 | Sharing, PWA, i18n & Feedback | 미시작 | 스포일러 없는 공유·오프라인·한영 |
| M10 | Integration QA & Deployment | 미시작 | 전체 CI·실제 URL·P0/P1 0건 |
| M11 | Release Freeze & Submission | 미시작 | 제출 패키지·태그·최종 링크 고정 |

## 최근 게이트 증거

| 일시 | Phase | Gate | 명령/절차 | 결과 | 증거 위치 |
|---|---|---|---|---|---|
| 2026-08-26 | M05 | ADR-0011 DOD-01~02·05·08~09·13 focused/token/axe E2/E3 | focused unit + `audit:design-tokens` + `npm run test:a11y -- --project=ui-fixtures` | **자동 PASS** — focused 6 files/30 tests; token files=16 hardcode=0 annotations=13; axe 18/18 serious/critical=0 externalRequests=0, matrix=8 states+long copy+system 3+light 3+reduced-motion 3 | `phases/M05_design_system.md` §10 |
| 2026-08-26 | M05 | ADR-0011 DOD-06~09·12 responsive/theme/motion/visual E3 | visual update → strict no-update rerun | **PASS** — visual 18/18, 5 viewport, dark/light/system, AA contrast, full-fixture baseline 9, `maxDiffPixels=0`, threshold 0, diff 0; Codex 새 mobile/tablet/desktop 3/3 육안 PASS | `tests/visual` |
| 2026-08-26 | M05 | ADR-0011 DOD-03~04 keyboard·입력 원자성 E3 | `npm run test:e2e -- tests/e2e/keyboard-core.spec.ts` | **PASS** — Chromium·Firefox·WebKit 9/9; Theme→Motion 버튼 focus 순서, pointer/shortcut/repeat coalescing, reset focus 복귀, result heading focus | `tests/e2e/keyboard-core.spec.ts` |
| 2026-08-29 | M05 | 제출 URL adapter 포함 최종 로컬 자동 회귀 | global unit + boundary/static a11y + lint/format/typecheck + build/Pages artifact + Pages 3브라우저 + prototype smoke + `npm run verify` | **PASS** — unit 30 files/180; boundary 83/150/0/0; static 36/8/0; build 46 modules CSS 10.49kB gzip 3.03, JS 234.56kB gzip 75.20; Pages 14 files/353631 bytes/prototype 10·30/30; prototype browser 908; verify required 22 missing 0 steps 12 | `phases/M05_design_system.md` §10 |
| 2026-08-29 | M05 | 수동 E1·오너 visual 승인 | Android 실기기·실제 SR·200% zoom·색각 시뮬레이션 + baseline 9종 검토 | **CHECKPOINT ACCEPTED** — 프로젝트 오너 9/9 승인; manual 0/4는 `NOT RUN`·`DEFERRED_TO_M10`이며 PASS/면제 아님 | `phases/M05_design_system.md` §9~10, ADR-0012 |
| 2026-08-09 | 문서 준비 | Harness completeness | 파일 구조·내부 참조 검증 | 생성 완료 | 이 패키지 `MANIFEST.sha256` |
| 2026-08-21 | M03 | DOD-01·07 PRNG/브라우저 parity E3 | generator unit + `npm run test:e2e -- tests/e2e/generator-parity.spec.ts` | generator 14/14; seed 20×100 + Daily golden 20, Chromium·Firefox·WebKit 9/9; UTC·서울·LA 시간대 프로세스 3개 × 프로세스별 반복 10, hash mismatch 0 | `src/domain/generator/*.test.ts`, `tests/e2e/generator-parity.spec.ts` |
| 2026-08-26 | M03 | DOD-02·03 정적 콘텐츠 E3 | 후보 생성 + fail-closed level validator | levels=54, tutorial=6, Lab=48, chapter별=12; rank/solution/tag checks=68/68/68; validatorSelfChecks=22; idChanges=0, failures=0; catalogHash=`c625d543…1738484`; approvalFingerprint=`5a60604a…b7e6a`; `curation=preserved` | `src/content/`, `scripts/lib/curation-evidence.ts`, `evidence/M03/content-curation-v1.md` |
| 2026-08-21 | M03 | DOD-05~09 Daily 3,650일 pre-close rehearsal E3 | 변경 없는 미커밋 working tree에서 `npm run audit:daily -- --version v1 --days 3650 --start 2026-01-01` 2회 | outputHash=`997df1…10b0`, reportSha=`b1102aee…6d49` 2회 동일; 예외·invalid·wrongPar·fallback·인접중복·분포실패 0; maxAttempt=107; **DOD-10 증거 아님** | Git 미추적 `outputs/m03/daily-audit-v1-2026-01-01-3650.*` |
| 2026-08-26 | M03 | DOD-04 사람 큐레이션 E1 | manifest 순서 54개 ASCII atlas + progression/completion 각 5행 체크리스트 검토 | **PASS / APPROVED** — 프로젝트 오너 전체 승인, progression 교체·재분류 없음; evidence SHA=`B81406D8…0214F` | `evidence/M03/content-curation-v1.md` |
| 2026-08-26 | M03 | DOD-03·11 단위·경계 회귀 E3 | focused unit + `npm run test` + `npm run check:boundaries` + `npm run verify` | focused generator+curation+catalog 3 files/23 tests; full unit 11 files/55 tests; boundary files=55, edges=81, violations=0, cycles=0, coreFiles=30; verify 10/10 | `src/domain/generator/`, `scripts/lib/curation-evidence.test.ts`, `scripts/check-boundaries.mjs` |
| 2026-08-26 | M03 | DOD-10 fixed-SHA 재현성 E3 | candidate `1c313bd29e1d24c483749af90a8734542988be5d` clean detached worktree, Node 24 `npm ci` → verify·3브라우저 parity → 서로 다른 경로의 3,650일 감사 2회 | **PASS** — verify 10/10, parity 9/9, report/json SHA `b1102aee…6d49`·MD SHA `3149a492…a036`·checksum-file SHA `8a827506…a893` 각각 2회 동일, worktree status 0 | `phases/M03_generator_content.md` §10 |
| 2026-08-26 | M03 | DOD-11 원격 폐쇄 E3 | closure commit `5050551796fde4c9255349775e685c932060c58e` push → PR #7 CI | **PASS** — Actions run `32870894868`, head SHA 일치, quality 1분 57초, 전체 step success | PR `#7`, Actions `32870894868` |
| 2026-08-26 | M04 | DOD-01~10 session·scoring·ID·storage E3 | focused unit + `npm run test:storage:migrations` | **PASS** — 12 files/92 tests, migration 3/3; ID seed/reserve/retry·ledger replay·timer high-water·WeakSet projection·4-root round-trip·10 fixture 오류 0 | `phases/M04_session_persistence_scoring.md` §10 |
| 2026-08-26 | M04 | DOD-11~13 경계·coverage·문서 E3 | lint·format check·typecheck·boundaries + M04/global coverage | **PASS** — M04 S98.90/B98.79/F100/L98.95, per-file branch 11/11·최저 95.45%; global 23 files/147 tests S93.06/B91.81/F97.61/L94.31; 정적 gate exit 0 | `vitest.m04.config.ts`, `phases/M04_session_persistence_scoring.md` §10 |
| 2026-08-26 | M04 | 최종 통합 품질 게이트 E3 | `npm run verify` | **PASS** — scriptContract 19/19, steps 10/10; unit 23파일/147테스트, boundaries files=67 edges=112 violations=0 cycles=0, levels 54 failures=0, Daily 3,650일 failures=0, secret files=234 findings=0, app·Pages build 2/2 | `phases/M04_session_persistence_scoring.md` §10 |
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
| 2026-08-21 | M00 | DOD-02~07 formal Easy 종료 판정 | 2026-08-16 동일 beta `b0f935e`의 M00-R1 오너 집계 대조 | n=5; I0=5/5; firstPulse≤30s=5/5; solve≤90s=5/5; recall=5/5; repeatedP0=0; aggregate-only 제한 | `phases/M00_rule_proof.md` §10, `docs/PLAYTEST_PROTOCOL.md` §13; 원자료 Git 미추적 |
| 2026-08-21 | H00 | DOD-02 campaign 콘텐츠 E3 | `node prototypes/rule-proof/verify-h00-campaign.mjs` | signals=18, perStage=3, uniquePairs=18, assertions=217, failures=0 | `phases/H00_hackathon_submission_slice.md` §10 |
| 2026-08-21 | H00 | DOD-03~07·10 browser/visual | `node prototypes/rule-proof/browser-smoke.cjs` + 360·390 캡처 육안 검토 | assertions=891; 320/360/390/960; replay·axis 360ms·Signal Lock; externalRequests=0; consoleErrors=0 | `evidence/H00/*.png` |
| 2026-08-21 | H00 | DOD-08 clean release checkout | release `6690f5778f706e1875b452d552bd75ba1c06ee9a`에서 Node 24 `npm ci` → 두 verifier → `verify` → E2E/Pages/a11y | lock 동일, vulnerabilities=0; verifier=200967/0·217/0; verify=10; E2E=12/12; artifact=14 files/336182 bytes; Pages=27/27; a11y=0 | `phases/H00_hackathon_submission_slice.md` §10 |
| 2026-08-21 | H00 | DOD-09 final CI·Pages 공개 E4 | release SHA push → CI/Pages Actions → 공개 URL 4 viewport browser smoke | CI `32453169036` success; Pages `32453169029` success; deployed SHA=`6690f5778f706e1875b452d552bd75ba1c06ee9a`; digest=`sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998`; public Pages=27/27·browser=891·errors=0 | `https://jtech-co.github.io/axis-shift/`, `phases/H00_hackathon_submission_slice.md` §10 |
| 2026-08-21~26 | H00 | DOD-11 실제 빌드 제출 자산·공식 제출 | release/tag SHA `6690f5778f706e1875b452d552bd75ba1c06ee9a` 공개 화면에서 자산 생성·field check 2회, 이후 오너가 공식 양식 제출 완료 확인 | 필수 필드·URL 200·크기·길이·해시·권리·H00-only claim 2/2 PASS; 정확한 접수 시각·ID·확인 화면 미제공 | Git 미추적 `.private/submission/H00/field-checks.txt`, `SUBMISSION_PACKAGE.md` |
| 2026-08-21 | H00 | DOD-12 tag·pre-release·동결 패키지·2중 backup | `v0.1.0-hackathon` tag/pre-release → source/Pages archive → manifest 검증 → 두 위치 대조 | source SHA256=`69d623eac50d186f52cb88e2dd451ebb4859fd475151dc76ad1a4e4c243b919a`; Pages=`34a0601312712a5d7fa20c544960975cdfe3e1b5a2795e65036bc38dae663f01`; manifest self SHA256=`ae37db3ed60b0c7a751865b3cc1e078a812fbc069335b02c6954cbd3043cd3b0`, entries=14 failures=0; 각 backup=15 files, hash delta=0 | `.private/submission/H00`, `C:/Users/MSI/Documents/AXIS_SHIFT_H00_Backup/v0.1.0-hackathon` |
| 2026-08-14 | M01 | DOD-02~05·07·09 로컬 품질·경계 | Node 24 `npm run verify` + `npm run test:a11y` | scripts=14/14; unit=5/5; boundaries files=37, violations=0, cycles=0, lintAssertions=7; secret findings=0; a11y targets=6 | `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | DOD-03 zero-target validator 안전성 | `validate:levels` + `audit:daily` | level files=0/selfChecks=2; Daily implementations=0/detectorSelfChecks=2; 무조건 통과 stub 아님 | `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | DOD-06 non-root route·AppShell target | Node 24 `npm run test:e2e` | Chromium·Firefox·WebKit 12/12; 3 routes HTTP 200; computed target ≥44px | `tests/e2e/routes.spec.ts`, `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | ADR-0009 Pages artifact 호환 E2 | final clean checkout `npm run build:pages` + `npm run test:pages` | files=14, bytes=327103, M00 runtime=10; Chromium·Firefox·WebKit 24/24; asset HTTP 200; 오류 0 | `tests/pages/pages-artifact.spec.ts`, `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | DOD-01 재현 설치 | commit `bf3d1fe` detached clean checkout, Node 24 `npm ci` → `npm run verify` | 261 packages, vulnerabilities=0, lock hash 동일, tracked changes=0, verify 10단계 통과 | `phases/M01_scaffolding.md` §10 |
| 2026-08-14 | M01 | CI·Pages artifact 공개 배포 | legacy backup → Pages workflow 전환 → `main` push → Actions → 공개 smoke | deployed=`93a4359`; CI run 31733232235 success; Pages run 31733232206 success; public M01 8/8; M00 573단언·오류 0 | `https://jtech-co.github.io/axis-shift/`, `phases/M01_scaffolding.md` §10 |
| 2026-08-21 | M02 | DOD-01~06 수학 코어 E3 | `npm run test -- src/domain` + `npm run test:math:exhaustive` | domain 6 files/27 tests; matrixCount=512, rankMismatch=0, factorizationMismatch=0, pulseInvariantFailures=0, randomMatrices=50000, determinismFailures=0 | `phases/M02_core_math.md` §10 |
| 2026-08-21 | M02 | DOD-09 core coverage E3 | `npm run test:coverage`; `npm run test:coverage:domain` | 공통 report 8 files/32 tests, S=99.38/B=100/F=97.5/L=99.32; 추가 domain gate는 board·pulse·gf2-rank·factorization·guards 각각 S/B/F/L=100%, total 131/59/26/117 | `phases/M02_core_math.md` §10 |
| 2026-08-21 | M02 | M00 fixture 호환 | `M00-MAIN-v1` 정규 분해 적용 | diff=`[11,6,13,6]`, rank=2, canonical 2 PULSE, solved=true | `phases/M02_core_math.md` §9~10 |
| 2026-08-21 | M02 | DOD-07~08·통합 검증 | `npm run check:boundaries` + `npm run verify` | boundary files=43, violations=0, cycles=0, named-duplicate self-check=5/5; occurrence review 병행; scriptContract=16/16, unit=32/32, secret findings=0, verify steps=10 | `phases/M02_core_math.md` §10 |
| 2026-08-21 | M02 | commit·PR·main CI·Pages E4 | implementation `55b0b55` + evidence `3fc095a` → PR `#5` merge | merge=`b38084e`; PR CI `32461938140` success; main CI `32462073073` success; Pages `32462073080` success | `phases/M02_core_math.md` §10, `https://github.com/JTech-CO/axis-shift/pull/5` |

### M05 최신 검증 출력

```text
status=READY_FOR_PUBLIC_CLOSE; automated E2/E3=PASS; manual E1=0/4 DEFERRED_TO_M10; projectOwnerFull9=APPROVED
candidate=codex/m05-design-system working tree; implementation commit/push/Pages run=pending this turn
focused component+fixture unit: files=7 tests=33 failures=0
global unit: files=30 tests=180 failures=0
design tokens: files=16 color=0 spacing=0 radius=0 duration=0 exceptionAnnotations=13
token annotations: calculation=2 transparency=2 mediaQueryBreakpoints=9
axe: tests=18/18 serious=0 critical=0 externalRequests=0 matrix=8states+longCopy+system3+light3+reducedMotion3
visual update+no-update: tests=18/18 baselines=9 fullFixture=true viewports=5 themes=dark/light/system contrastPairs=AA maxDiffPixels=0 threshold=0 actualDiff=0
visual review: Codex representative=3/3 PASS projectOwnerFull9=APPROVED on 2026-08-29
keyboard: chromium+firefox+webkit tests=9/9
boundaries: files=83 edges=150 violations=0 cycles=0
static a11y: files=36 interactiveTargets=8 failures=0
build: modules=46 CSS=10.49kB gzip=3.03kB JS=234.56kB gzip=75.20kB
lint=pass formatCheck=pass typecheck=pass diffCheck=pass
verify: scriptContract required=22 missing=0 passedSteps=12
Pages local: artifact files=14 bytes=353631 prototypeFiles=10; chromium+firefox+webkit=30/30; submitted URL adapter local browserAssertions=908 externalRequests=0 consoleErrors=0; remote pending
manual: Android Chrome=NOT RUN screenReader=NOT RUN zoom200=NOT RUN colorVision=NOT RUN; all DEFERRED_TO_M10
```

ADR-0011 변경분과 제출 URL appearance adapter의 local 자동 E2/E3는 PASS했다. M05 React UI는 아직 실제 feature controller가 아니므로 제출 URL은 기존 playable H00 game과 18개 신호를 보존한다. fixed-SHA·원격 Pages·공개 URL smoke 뒤 checkpoint를 닫는다. Playwright·axe·OS forced-colors는 이관된 수동 E1 4종을 대체하지 않는다.

### M04 최신 검증 출력

```text
status: COMPLETE; DOD-01~13 PASS
focused M04 unit: files=12 tests=92 failures=0
storage migrations: tests=3 failures=0
M04 aggregate coverage: statements=98.90% branches=98.79% functions=100% lines=98.95%
lint=pass formatCheck=pass typecheck=pass boundaries=pass
perFileBranches=11/11 minimum=95.45% bestRecord selectors=95.65% repository=97.67%
global coverage: files=23 tests=147 statements=93.06% branches=91.81% functions=97.61% lines=94.31%
storage roots=4 fixtures=10 quarantine=backup-before-delete+collision-retry salvage=persist-after-quarantine warningDedupe=keyKind+code
idGenerator=issued-ledger+seed+reserve+retry; M06=singleton+crypto-source
canonicalBuild=validated-dist-preclean+emptyOutDir-false
remoteCheckpoint=95fbff2b4bff261ff16784099dc2a02df7473069 branch=origin/codex/m04-session-persistence-scoring pr=none
handoff: M05 shared UI; M06 ID singleton/crypto+visibility/resume/result persistence; M07 UTC Daily/streak/archive; M08 Sprint scoring
```

실제 화면의 reload·visibility·Result 저장을 M04에서 통과했다고 주장하지 않는다. M05가 presentational keyboard fixture를 추가했지만 실제 route·session·storage 사용자 흐름과 reload·visibility·Result 저장 E2E는 M06에 남아 있다.

### M03 최종 검증 출력

```text
status: COMPLETE; DOD-01~11 PASS
candidateSha=1c313bd29e1d24c483749af90a8734542988be5d
environment: clean detached worktree; node=v24.19.0 npm=11.6.2 npmCiVulnerabilities=0 worktreeStatusEntries=0
focused generator+curation+catalog unit: files=3 tests=23 failures=0
full unit: files=11 tests=55 failures=0
boundaries: files=55 edges=81 violations=0 cycles=0 coreFiles=30
content: levels=54 tutorial=6 lab=48 pulse=12 echo=12 rank=12 noise=12 fallbacks=14
level validation: rankChecks=68 solutionChecks=68 tagChecks=68 idChanges=0 validatorSelfChecks=22 humanReview=APPROVED failures=0
candidate idempotence: jsonFiles=6 jsonHashChanges=0 curationEvidenceHashChanges=0 curation=preserved
catalogHash=c625d54327e5a6c3c6305a373d5199abd01c6fb69415161f9d4aee27c1738484
approvalFingerprint=5a60604a91b51c88ab294701b7a1eb286b00700101643807c80d5d10d59b7e6a
approvedEvidenceSha256=B81406D8DCEE7214692426B112BB5941DBC319CC3FADD070F43F5638D9B0214F
curationMetadata: reviewer=프로젝트 오너 reviewedAt=2026-08-26T00:20:42+09:00 overallDecision=APPROVED
verify: steps=10/10
PRNG/browser parity: seeds=20 outputsPerSeed=100 browsers=3 tests=9/9
dailyAudit: version=v1 startDate=2026-01-01 dayCount=3650
outputHash=997df1b01c8fee746168f6edebb2c549ad859da8f505e414e8eabdb918dd10b0
reportJsonSha256=b1102aee05f5e578894c13d36b0e14af9fb278d6e5af14efb9de49a480d96d49 fixedShaAuditReruns=2
markdownSha256=3149a492592e88ab7329c20343613bac051e7a0719abd744333855d9a7baa036
checksumFileSha256=8a827506ea0cb296fc0f125f65c08a03230bb67aa9454eaa6f3b5c646b98a893
exceptions=0 invalid=0 wrongPar=0 fallbackCount=0 adjacentDuplicates=0 distributionFailures=0
maxAttemptCount=107 goldenVectors=20 goldenMismatches=0
timezoneProcesses=3 repeatsPerProcess=10 processHashMismatches=0 diagnosticsHashMismatches=0
remoteClosure: sha=5050551796fde4c9255349775e685c932060c58e pr=7 ciRun=32870894868 quality=PASS duration=1m57s
remaining: M04 not started; PR #7 not merged
```

### M02 최신 검증 출력

```text
environment: Windows, node=v24.19.0, npm=11.6.2
typecheck: exit=0
Vitest domain: files=6 tests=27 failures=0
core coverage target files=5 each statements=100 branches=100 functions=100 lines=100
coverage totals: statements=131 branches=59 functions=26 lines=117
exhaustive: matrixCount=512 oracleUnvisited=0 rankMismatch=0 factorizationMismatch=0 pulseInvariantFailures=0 randomMatrices=50000 determinismFailures=0
M00-MAIN-v1: diff=[11,6,13,6] rank=2 canonical=[{colMask:13,rowMask:5},{colMask:6,rowMask:11}] solved=true
levelValidation: files=0 validatorSelfChecks=2 failures=0
boundaries: files=43 edges=40 violations=0 cycles=0 coreFiles=27 coreFixtureImplementations=5 coreFixtureAssertions=2
verify: scriptContract=16/16 unit=32/32 secretFindings=0 build=pass pagesArtifactFiles=14 steps=10
next phase: M03 pipeline and DOD-04 human curation complete; DOD-10 fixed-SHA audit pending
owner action preserved: official event form authentication, personal data/consents, final Submit
```

### H00 최신 local 검증 출력

```text
environment: Windows, node=v24.19.0, npm=11.6.2
release/tag commit: 6690f5778f706e1875b452d552bd75ba1c06ee9a
clean npm ci: lockBefore=lockAfter packages=261 vulnerabilities=0 trackedChanges=0
M00 core: assertions=200967 bfsVisited=65536 failures=0
H00 campaign: signals=18 perStage=3 uniqueBoardPairs=18 assertions=217 failures=0
H00 browser: assertions=891 viewport=320/360/390/960 externalRequests=0 consoleErrors=0
interaction: replay=result-cta axisChoreography=360ms+signal-lock reducedMotion=reduce
visual E1: 360×640 PASS, 390×844 PASS
verify: scriptContract=14/14 unit=5/5 boundaries=0 cycles=0 secretFindings=0 steps=10
production E2E: chromium+firefox+webkit tests=12 passed
Pages artifact: files=14 bytes=336182 prototypeFiles=10
Pages Playwright: chromium+firefox+webkit tests=27 passed
a11yTargetAudit: files=12 interactiveTargets=6 failures=0
remote: CI run=32453169036 success Pages run=32453169029 success deployedSha=6690f5778f706e1875b452d552bd75ba1c06ee9a
Pages artifact digest: sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998
public E4: pages=27/27 browserAssertions=891 externalRequests=0 consoleErrors=0
tag/prerelease: v0.1.0-hackathon exists
submission application capture: 6690f5778f706e1875b452d552bd75ba1c06ee9a (same as release/tag SHA)
package archives: source=69d623eac50d186f52cb88e2dd451ebb4859fd475151dc76ad1a4e4c243b919a pages=34a0601312712a5d7fa20c544960975cdfe3e1b5a2795e65036bc38dae663f01
manifest: selfSha256=ae37db3ed60b0c7a751865b3cc1e078a812fbc069335b02c6954cbd3043cd3b0 entries=14 failures=0
backups: .private/submission/H00=15 files C:/Users/MSI/Documents/AXIS_SHIFT_H00_Backup/v0.1.0-hackathon=15 files hashDelta=0
post-tag field checks: independent passes=2/2
scope: src/domain changes=0 dependencies=0 newModes=0
license: UNLICENSED / All Rights Reserved; M11 OSS decision=open
remaining H00 implementation/release work: none
owner action: official event form authentication, personal data/consents, and final Submit; submission not claimed
```

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

현재 M00 application 구현은 체크포인트 `5d57e09d250859b4eccdf64bca784f8ae527f6ce`에서 시작해 Pages artifact commit `b0f935e396805bab9c0847847068cb9a3522968f`로 배포됐다. 공개 URL Edge 573 단언·320/360/960px·콘솔 오류 0 E2와 2026-08-16 M00-R1 행동 기준 5/5 E1을 분리 기록하며, 2026-08-21 DOD-01~07과 M00을 완료했다.

## 활성 위험

| ID | 위험 | 가능성 | 영향 | 대응 | 담당 phase |
|---|---|---:|---:|---|---|
| R-01 | 텐서 소재가 첫 사용자에게 어렵게 느껴짐 | 중 | 매우 높음 | M00 이해도 게이트, 첫 플레이에서 수학 용어 제거 | M00·M06 |
| R-02 | generator/par 오답이 전체 신뢰를 훼손 | 낮음 | 매우 높음 | 전수·property test, 단일 도메인 코어 | M02·M03 |
| R-03 | 48개 Lab 콘텐츠 큐레이션 일정 부족 | 중 | 높음 | 자동 후보 생성 + 사람이 패턴·난도 검수 | M03·M06 |
| R-04 | PWA 캐시가 제출 직전 구버전을 제공 | 중 | 높음 | prompt update, 실제 URL cache reset·smoke | M09·M10 |
| R-05 | 모바일 6×6에서 축 타깃과 PULSE가 겹침 | 중 | 높음 | 5 viewport 자동 fixture는 PASS; Android Chrome 실기기는 `NOT RUN / DEFERRED_TO_M10` | M05·M10 |
| R-06 | 공유 서명이 정답/이동을 간접 노출 | 낮음 | 높음 | 금지 필드 invariant, payload snapshot, 수동 검토 | M09 |
| R-07 | 정규 v1 범위가 8/26 제출 일정 안에 과도함 | 낮음 | 매우 높음 | H00 v0.1 구현·tag·제출 준비 패키지는 동결 완료; 오너는 정규 범위를 추가하지 않고 공식 양식만 최종 제출 | H00·전역 |
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
- ADR-0010: 정규 M02~M11과 분리한 H00 `v0.1.0-hackathon` 제출 lane을 채택한다.
- [ADR-0011](decisions/0011-appearance-cycle-controls.md): Theme·Motion 단일 순환 버튼, dark 기본, custom high-contrast 제거와 legacy 설정 정규화를 채택한다.
- [ADR-0012](decisions/0012-m05-checkpoint-manual-evidence-deferral.md): M05 자동 E2/E3와 오너 baseline 9/9로 checkpoint 종료를 허용하되, 수동 E1 0/4를 PASS·면제 없이 M10의 release-blocking gate로 이관한다.
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
- 2026-08-21: M00-R1은 행동 기준 5/5로 DOD-02~05를 통과했다. 개별 ID·정확한 초·전문성 층화가 없는 aggregate-only E1 제한을 오너가 인지하고 DOD-06~07과 M00 종료를 승인했다. 누락값을 만들거나 M06/M10 증거로 재사용하지 않는다.
- 2026-08-21: 해커톤까지 5일인 STOP 일정 조건에 따라 ADR-0010과 H00을 채택했다. 우선순위는 18개 이상 campaign signal 가시화 → AXIS/PULSE/Signal Lock 연출 → 2D 표현 완성도이며, 3D·새 모드·대형 dependency는 제외한다. M02~M11은 미시작으로 남는다.
- 2026-08-21: H00 후보는 기존 수학·generator version을 바꾸지 않고 6×3 campaign, 결과 랜덤 재플레이, 정적 축 rail·360ms 교차 연출·Signal Lock을 구현했다. final release/tag SHA `6690f5778f706e1875b452d552bd75ba1c06ee9a`의 실제 공개 빌드에서 제출 자산을 만들었다.
- 2026-08-21: release/tag SHA `6690f5778f706e1875b452d552bd75ba1c06ee9a`의 clean checkout, CI `32453169036`, Pages `32453169029`, public E4, post-tag field check 2회, tag/pre-release `v0.1.0-hackathon`, 2중 backup을 통과해 H00 DOD-01~12를 완료했다.
- 2026-08-21: H00 v0.1에는 새 공개 라이선스를 부여하지 않고 `UNLICENSED` / All Rights Reserved를 유지한다. 공개 OSS 라이선스 여부는 M11 결정으로 남긴다.
- 2026-08-21: 프로젝트 오너 승인 아래 M02 원래 DoR를 충족하고 단일 TypeScript 보드/PULSE/rank/canonical factorization 코어를 고정했다. 독립 3×3 BFS 512개와 4~8 고정 시드 50,000개가 mismatch·round-trip·불변식·결정성 실패 0을 기록했고 지정 코어 5파일의 S/B/F/L은 각각 100%다.
- 2026-08-21: 오너 지시로 M03을 착수해 `v1` PRNG/Daily/version resource registry, Tutorial 6·Lab 48·fallback 14, candidate/validator/audit/3-browser parity를 구현했다. 변경 없는 미커밋 working tree에서 3,650일 감사 rehearsal 2회는 동일 hash와 실패 0을 냈지만 DOD-10 fixed-SHA 증거는 아니다.
- 2026-08-26: 프로젝트 오너가 공식 해커톤 양식 제출 완료를 확인했다. 정확한 접수 시각·접수 ID·확인 화면은 미제공이며 누락값을 생성하지 않는다. Codex는 인증·개인정보·동의·최종 Submit을 수행하지 않았다.
- 2026-08-26: 프로젝트 오너가 54개 패턴과 progression 5행을 전체 승인해 DOD-04를 통과했다. approval fingerprint가 full manifest·순서 있는 catalog·machine scaffold를 묶으며 변경 시 재승인하도록 fail-closed한다. candidate `1c313bd29e1d24c483749af90a8734542988be5d`의 clean Node 24 worktree에서 verify 10/10·3브라우저 9/9와 3,650일 감사 2회 동일 report SHA `b1102aee…6d49`를 확인해 DOD-10과 M03을 완료했다.
- 2026-08-26: closure evidence `5050551796fde4c9255349775e685c932060c58e`를 `codex/m03-generator-content`에 push하고 PR #7을 열었다. Actions run `32870894868`은 해당 head SHA에서 quality 전체 단계를 1분 57초에 통과했다. main 병합은 수행하지 않았다.
- 2026-08-26: M04에서 append-only action ledger, `TIMER_TICK` high-water, `WeakSet` completion provenance, Hint cap·best tuple, issued-ledger ID service, 네 v1 storage root와 canonical ready/paused normalization·격리·부분 복구를 고정했다. focused 12파일 92테스트와 migration 3테스트, aggregate B98.79%·per-file branch 11/11, global 23파일 147테스트, 정적 gate와 `npm run verify`(scriptContract 19/19, steps 10/10)를 통과해 DOD-01~13을 닫았다. commit `95fbff2b4bff261ff16784099dc2a02df7473069`는 `origin/codex/m04-session-persistence-scoring`에 push됐고 PR은 없다. M06은 ID singleton·crypto source와 실제 UI·visibility·reload, M07은 UTC Daily·streak·Archive, M08은 Sprint 산식을 맡는다.
- 2026-08-29: M05 자동 E2/E3와 오너 visual baseline 9/9를 checkpoint exit evidence로 승인했다. Android 실기기·실제 스크린리더·200% zoom·색각 시뮬레이션은 0/4 `NOT RUN`이며 ADR-0012에 따라 M10의 blocking gate로 이관한다. 제출 URL은 M05 React fixture로 대체하지 않고 playable H00에 Theme/Motion adapter를 이식한다.
- 2026-08-29: 프로젝트 오너는 [ADR-0011](decisions/0011-appearance-cycle-controls.md)의 Theme·Motion 계약과 full-fixture baseline 9/9를 승인했다. [ADR-0012](decisions/0012-m05-checkpoint-manual-evidence-deferral.md)는 수동 E1 0/4를 M10으로 이관하되 PASS나 면제로 재분류하지 않는다.
