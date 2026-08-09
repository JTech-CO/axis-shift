# PROGRESS.md — AXIS//SHIFT 상태 인계

> 매 세션 갱신되는 라이브 문서다. 세션이 끊겨도 이 파일과 현재 phase만 읽으면 이어서 작업할 수 있어야 한다.

## 현재 상태

- **현재 phase**: M00 — Rule Proof & Scope Lock
- **상태**: 진행 중 — 내부 파일럿 2회·다단계 자동 검증 완료 / Easy 본 플레이테스트 게이트 대기
- **마지막 갱신**: 2026-08-09 / Easy·Normal·Hard 360×640 브라우저 스모크 통과
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
- [x] 폐기형 M00 난도 stage fixture 고정 — Easy Par 2, Normal Par 3, Hard Par 4
- [x] 다단계 360×640 브라우저 스모크 통과 — 140개 단언, Easy 2수·Normal 3수·Hard 4수·예비 3수, 콘솔 오류 0
- [x] M00 공개 플레이 링크 배포 — commit `68f7614`, GitHub Pages `built`, 공개 URL 브라우저 140개 단언 통과

## 다음 할 일

1. 파일럿 또는 자동 검증에서 발견한 P0 문제가 있으면 한 변수만 수정하고 verifier·browser smoke를 재실행한다.
2. 플레이 가능한 빌드를 기준으로 서로 다른 신규 사용자 5명 이상을 모집한다.
3. 참가자 구성과 비공개 원시 기록 위치·삭제 예정일을 확인한 뒤 Easy `M00-MAIN-v1` 본 플레이테스트 실행 게이트를 연다.
4. n≥5와 4/5 임계치를 그대로 적용해 본 테스트를 실행하고, M00 증거·Scope Lock을 기록한 뒤 마일스톤을 commit·push한다. Normal·Hard 탐색 결과는 이 표본에 합산하지 않는다.

## 현재 미결 질문 / 사용자 결정 대기

- 공개 저장소 라이선스: MIT를 권장하나 최종 결정 필요.
- 최종 프로덕션 URL: GitHub Pages 경로와 별도 도메인 사용 여부.
- 앱 표시 기본 언어: 브라우저 언어 자동 감지 후 한국어/영어 폴백 순서 확인.
- M00 본 테스트 실행 대기: 참가자 5명 이상 확정, 기기 구성 확인, 원시 기록 보관 위치와 삭제 예정일 확정. 내부 파일럿 2회는 본 표본에 포함하지 않는다.
- 기술 백서의 “10초 내 행·열 선택과 교차점 반전 관계 이해”를 M00 통과 게이트로 볼지 별도 관찰 지표로 볼지.
- Sprint의 정확한 점수식과 동점 처리 우선순위. 기술 백서는 지표만 정의하고 산식은 정의하지 않음.
- Daily Archive 공개 시작일 또는 표시 하한.

이 미결 항목은 M00·M01에서 필요한 시점에 결정한다. 결정 전 임의로 공개 계약을 고정하지 않는다.

## Phase 현황

| Phase | 이름 | 상태 | 핵심 출구 게이트 |
|---|---|---|---|
| M00 | Rule Proof & Scope Lock | 진행 중 — 내부 파일럿·다단계 E2 완료 / Easy 본 표본 대기 | 5명 중 4명 이상 90초 내 첫 성공 |
| M01 | Production Scaffolding | 미시작 | build/lint/type/test + 실제 경계 위반 차단 |
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
| 2026-08-09 | M00 | DOD-01 다단계 규칙 정확성 E2 | `node prototypes/rule-proof/verify-fixture.mjs` | stageSequence=easy:2>normal:3>hard:4, assertions=196708, failures=0 | `phases/M00_rule_proof.md` §10 |
| 2026-08-09 | M00 | 단일-stage 브라우저 스모크 기준선 E2 | `node prototypes/rule-proof/browser-smoke.cjs` | assertions=51, 360×640, main=2, backup=3, consoleErrors=0 | `evidence/M00/browser-smoke-solved-360x640.png` |
| 2026-08-09 | M00 | 다단계 브라우저 스모크 E2 | `node prototypes/rule-proof/browser-smoke.cjs` | assertions=140, 360×640, easy=2, normal=3, hard=4, backup=3, consoleErrors=0 | `evidence/M00/browser-smoke-stages-360x640.png` |
| 2026-08-09 | M00 | 공개 Pages 플레이 스모크 E2 | `git push -u origin main` → Pages built → 공개 URL browser smoke | commit=`68f7614`, HTTP 200, assertions=140, consoleErrors=0 | `https://jtech-co.github.io/axis-shift/` |
| 2026-08-09 | M00 | 내부 파일럿 관찰 | 폐기형 프로토타입 run 2회 | 본 표본 제외; 관측 최저=3 PULSE, 초기 오계산 흐름=4~5 PULSE; 시간·참가자 수·개입 미보고 | `docs/PLAYTEST_PROTOCOL.md` §13 |

### M00 최신 검증 출력

```text
command: node prototypes/rule-proof/verify-fixture.mjs
exit: 0
M00-MAIN-v1 rank=2 bfs=2
M00-NORMAL-v1 rank=3 bfs=3
M00-HARD-v1 rank=4 bfs=4
M00-BACKUP-v1 rank=3 bfs=3
stageSequence=easy:2>normal:3>hard:4
assertions=196708 bfsVisited=65536 legalPulseCount=225 failures=0

historical baseline server: node prototypes/rule-proof/serve.cjs
historical baseline command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
historical baseline exit: 0
browserAssertions=51 viewport=360x640 mainMoves=2 backupMoves=3 consoleErrors=0
current server: node prototypes/rule-proof/serve.cjs
current command: NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs
current exit: 0
browserAssertions=140 viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3 consoleErrors=0 screenshot=<PROJECT_ROOT>\AXIS_SHIFT_Harness_KR\evidence\M00\browser-smoke-stages-360x640.png

publish command: git push -u origin main
published commit: 68f7614659675171fbfbd3535e1d04b08bee931f
pages status: built
public URL: https://jtech-co.github.io/axis-shift/
public browserAssertions=140 viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3 consoleErrors=0
```

51개 단언 출력은 다단계 확장 전 단일-stage 역사 기준선으로 보존한다. 현재 140개 단언 스모크는 Easy→Normal→Hard 전환·각 canonical solve·예비 회귀를 포함해 통과했다. 자동 검증과 내부 파일럿은 DOD-02~04의 E1 본 표본을 대체하지 않는다.

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
- Workspace-2026-08-09: 부모 `AXIS SHIFT (Tensor)`를 Git·구현 루트로, `AXIS_SHIFT_Harness_KR`를 가이드·증거 폴더로 유지한다.
- 2026-08-09: 내부 파일럿 run 2회에서 Easy stage의 관측 최저는 3 PULSE였고, 초기 계산이 어긋난 흐름은 4~5 PULSE까지 이어질 수 있었다. 이는 수학적 Par 2를 바꾸지 않으며 참가자 수·시간·개입은 미보고로 둔다.
- 2026-08-09: M00 정식 조건은 `M00-MAIN-v1` Easy 하나로 유지하고 Normal·Hard는 폐기형 난도 탐색 stage로만 추가한다. 날짜당 한 문제 제한은 Daily 모드에만 적용하며, Wordle 유사성은 간결한 SNS 공유 결과 레이아웃에만 한정한다.
- 2026-08-09: 프로젝트 오너 결정으로 참가자 모집은 플레이 가능한 M00 프로토타입과 내부 파일럿 이후 진행한다. 본 테스트의 n≥5 및 4/5 통과 기준은 유지한다.
