# AXIS//SHIFT Codex 협업 기록

**버전**: 1.0.0  
**상태**: 기록 중  
**최종 갱신**: 2026-08-14

## 1. 목적

OpenAI Game Builders Seoul에서 Codex 활용은 “코드 대부분을 AI가 작성했다”는 주장보다, 어떤 문제를 Codex와 해결했고 사람이 어떤 결정을 유지했으며 결과를 어떻게 검증했는지를 보여주는 것이 중요하다. 이 문서는 프롬프트 원문 보관소가 아니라 **결정·변경·검증의 감사 로그**다.

## 2. 역할 경계

| 주체 | 주 책임 | 하지 않는 주장 |
|---|---|---|
| 사용자/프로젝트 오너 | 게임 선택, 공개 규칙, 범위, 난도 철학, 큐레이션, 출시 승인, 라이선스 | 검증 없이 AI 제안을 자동 승인하지 않음 |
| ChatGPT 기획 세션 | 시장 조사, 규칙 구체화, 기술·디자인 백서, 하네스·문서 설계 | Codex가 작성하지 않은 코드를 Codex 기여로 표기하지 않음 |
| Codex | 저장소 코드 탐색, 구현, 리팩터링, 테스트 생성, 버그 재현·수정, CI·배포 자동화 | 제품 결정권·최종 QA 승인·자산 권리를 대체하지 않음 |
| 자동 도구/CI | 재현 가능한 통과·실패 판정과 artifact 생성 | 사람의 플레이 재미·시각 승인까지 대신하지 않음 |

## 3. Codex에 우선 맡길 작업

- `GF(2)` rank·factorization의 순수 구현과 property test
- 3×3 BFS 오라클·전수 패리티
- 결정적 PRNG·Daily generator·3,650일 감사 script
- level validator와 candidate generator
- session reducer·storage migration fixture
- 접근성 속성·keyboard E2E·viewport regression
- Canvas share renderer와 spoiler payload test
- GitHub Actions·Pages·post-deploy smoke
- 버그 재현 test를 먼저 추가한 뒤 최소 수정

## 4. 사람이 반드시 승인할 작업

- PULSE 공개 규칙과 Par 의미
- Tutorial 문구와 학습 순서
- Lab 48개 최종 큐레이션
- Sprint의 정확한 점수식
- Signal Signature에 허용할 정보
- 브랜드·모션·사운드 강도
- P2 waiver와 출시 차단 판단
- LICENSE·외부 자산 사용 권리
- 제출 설명·영상의 사실성

## 5. 작업 로그 작성 규칙

한 개 로그는 하나의 검증 가능한 작업 묶음 또는 PR을 나타낸다.

필수 필드:

```text
Entry ID
날짜·phase
목표와 시작 상태
Codex 요청 요약
Codex가 제안·생성·수정한 항목
사람이 채택·수정·거절한 결정과 이유
변경 파일·commit/PR
실행한 명령과 핵심 결과
발견된 오류·남은 위험
관련 INV·DoD·ADR
```

### 금지

- 전체 채팅 로그를 검토 없이 그대로 붙이기
- “Codex가 다 만들었다”처럼 검증 불가능한 비율 주장
- 실패한 시도·사람의 수정·거절을 숨기기
- 테스트가 없는데 “검증 완료”로 표기
- 다른 AI 도구의 기여를 Codex로 표기
- 비밀키·개인정보·참가자 원문 입력 저장

## 6. 준비 단계 기록

### PREP-0001 — 게임 기획·백서·하네스

- **날짜**: 2026-08-09
- **Phase**: Pre-Production / M00 준비
- **주체**: 사용자 + ChatGPT 기획 세션
- **목표**: 세 후보에서 AXIS//SHIFT를 선택하고 개발 전 계약을 문서화
- **결과**:
  - 사용자가 `AXIS//SHIFT — A Daily Tensor Puzzle`을 최종 선택
  - 행×열 교차점 XOR, `GF(2)` rank Par, Daily·Lab·Sprint·공유 범위 수립
  - 기술·디자인 백서 작성
  - Schema-Hub KR Harness Expand Pack을 프로젝트별 12 phase로 확장
- **Codex 기여**: 아직 없음
- **사람 결정**: 게임 선택, 상용 수준 완성도, ChatGPT는 기획·자료조사, Codex는 본 개발
- **검증**: 문서 내부 경로·placeholder·manifest 검사는 하네스 생성 단계에서 수행 예정
- **남은 위험**: M00 실제 플레이테스트 전 규칙 이해도 미검증

## 7. Codex 작업 로그

실제 Codex 작업은 아래 표와 상세 항목에 누적한다.

| ID | 날짜 | Phase | 목표 | 변경/PR | 핵심 검증 | 사람 결정 | 상태 |
|---|---|---|---|---|---|---|---|
| CX-M00-001 | 2026-08-09 | M00 | DoR 감사와 fixture 고정 | phase·protocol·progress 문서 | main 2/2, backup 3/3 rank/BFS 일치 | 모집 근거·원시 기록 위치 확인 대기 | 준비 완료 |
| CX-M00-002 | 2026-08-09 | M00 | 실제 저장소·구현 루트 정정 | root/harness 계약·Git origin | root/branch/origin 확인, push 없음 | 부모 루트·하네스 분리 | 완료 |
| CX-M00-003 | 2026-08-09 | M00 | 규칙 증명 프로토타입·E2 검증 | `prototypes/rule-proof/`·M00 증거 | core 196,674 + browser 51 단언, 오류 0 | 프로토타입 이후 모집·임계치 유지 | E2 완료 / E1 대기 |
| CX-M00-004 | 2026-08-09 | M00 | 파일럿 관찰·다단계 난도 범위 정리 | 폐기형 stage·하네스 문서 | verifier 196,708 + browser 140 단언, 오류 0 | Easy 정식 조건·Daily 비독점·공유 레이아웃 한정 | E2 완료 / E1 대기 |
| CX-M01-001 | 2026-08-14 | M01 | 제한 스캐폴딩·Pages artifact 전환 | ADR-0008·0009·생산 기반 | clean verify, 경계 0, route 12/12, Pages 24/24, 공개 M00 573 | 오너가 예외 범위와 artifact 전환 승인, M00 미완료 유지 | 완료 |
| CX-M00-005 | 2026-08-21 | M00 | Formal Easy E1 판정과 phase 종료 | M00·protocol·progress | n=5, I0·first PULSE·solve·recall 모두 5/5, 반복 P0 0 | 오너가 aggregate-only 제한을 인지하고 종료 승인 | 완료 |
| CX-H00-001 | 2026-08-21 | H00 | 5일 제출 슬라이스 범위 고정 | ADR-0010·H00 phase·traceability | DoR 6/6, 구현 검증 대기 | 콘텐츠→AXIS 연출 우선, 3D·새 모드 제외 | 진행 중 |
| CX-H00-002 | 2026-08-21 | H00 | 18신호·AXIS 연출 local vertical slice | prototype·Pages test·H00 증거 | campaign 217, browser 891, Pages 27/27, 오류 0 | 3D 대신 콘텐츠·축 인과·모바일 완성도 채택 | local 완료 / E4 대기 |

## 8. 상세 로그 템플릿

### CX-M00-005 — Formal Easy E1 판정과 M00 종료

- 날짜: 2026-08-21 (테스트 실행 2026-08-16)
- Phase / DoD: M00 / DOD-02~07
- 관련 INV / ADR: INV-004~006, INV-015, INV-018 / ADR-0002, ADR-0008
- 사람 결정: 오너가 신규 인터넷 익명 사용자 5명, 동일 Pages URL·beta SHA, 4 PC·1 mobile Chrome, 진행자 개입 없음과 3개 행동 지표 5/5를 제공했다. 참가자별 ID·정확한 초·전문성 층화가 없는 제한을 인지하고 M00 종료를 승인했다.
- Codex 역할: 8월 16일 실제 Pages deployment run과 SHA를 대조하고, 누락된 개인별 행·중앙값을 만들지 않은 aggregate E1로 phase·protocol·progress를 갱신했다. 원자료를 `.private/` Git 제외 경로에 보관했다.
- 검증: Pages run `31733835031` / `b0f935e` success; firstPulse≤30s=5/5; solve≤90s=5/5; recall=5/5; I0=5/5; repeatedP0=0.
- 남은 위험: 표본의 전문성 구성·정확한 시간·개별 환경은 검증할 수 없으며 M06/M10 증거로 재사용하지 않는다.

### CX-H00-001 — 해커톤 제출 슬라이스 범위 고정

- 날짜: 2026-08-21
- Phase / DoD: H00 / DoR 01~06
- 관련 INV / ADR: INV-001~002, 004~006, 014~015, 017~020 / ADR-0010
- 사람 결정: 8월 26일 마감과 베타 피드백을 근거로 M00을 닫고 콘텐츠량, AXIS 연출, 2D 표현 순으로 작업하도록 승인했다.
- Codex 역할: 정규 M02~M11 완료를 주장하지 않는 `v0.1.0-hackathon` lane, allowlist, 18+ signal·연출·접근성·Pages E4·제출 DoD를 정의했다.
- 상태: 구현과 E2/E4 증거 대기. 완료 수치는 실제 실행 후 갱신한다.

### CX-H00-002 — 18신호 캠페인과 AXIS 인과 연출

- 날짜: 2026-08-21
- Phase / DoD: H00 / DOD-01~07·10 local
- 관련 INV / ADR: INV-001~002, 004~006, 014~015, 017~020 / ADR-0010
- 사람 결정: 베타 의견의 우선순위를 단계 부족 → AXIS 표현 부족 → 2D 완성도로 두고, 3D 전환 없이 5일 제출 슬라이스를 진행했다.
- Codex 역할: 기존 6 profile과 `m00-seeded-v1`을 재사용해 18개 고정 signal을 만들고, 순차/랜덤 CTA와 URL 재현을 추가했다. 선택 mask에서 axis rail·intersection 상태를 파생하고 PULSE 360ms·Signal Lock CSS를 논리 상태와 분리했다.
- 발견한 실패와 수정: invalid `signal`이 앱을 중단하던 경로, control fixture의 실패하는 replay/불일치 CTA, forced-colors 셀 상태 가림, 전역 seed 결합을 정적 리뷰에서 발견해 수정했다. Pages title 기대값 실패 3건은 H00 제목·signal route 계약으로 테스트를 갱신해 27/27로 복구했다.
- 검증: M00 verifier 200,967/0; H00 campaign 217/0; browser 891/0, 320/360/390/960, 외부 요청·콘솔 오류 0; Node 24 verify 10단계; Pages 3엔진 27/27; a11y failures=0; 360·390 완료 캡처 육안 PASS.
- 사람이 확인할 남은 일: commit/push와 공개 E4, LICENSE, tag, 실제 제출 양식·썸네일·영상·2중 백업. H00은 M02~M11을 완료시키지 않는다.

### CX-M01-001 — M00 formal gate 전 제한 스캐폴딩 착수

- 날짜: 2026-08-14
- Phase / DoD: M01 / DoR 예외와 DOD-01~09
- 관련 INV / ADR: INV-001~003, INV-014, INV-017~019 / ADR-0001, ADR-0004, ADR-0007, ADR-0008, ADR-0009
- 시작 상태·실패: M00 자동 E2와 공개 프로토타입은 완료됐지만 formal Easy n≥5 E1과 DOD-02~07은 출시 직전 beta까지 연기돼 M01의 원래 DoR와 순환 대기가 생겼다.
- 사람 결정: 프로젝트 오너가 M00을 통과·면제 처리하지 않은 채 M01의 도구 체인·경계·라우팅·CI 체크포인트만 선행 착수하도록 직접 승인했다. 최종 라이선스 결정 전에는 `UNLICENSED`를 유지한다.
- Codex 요청 요약: React·TypeScript·Vite 생산 기반과 자동 경계를 M01 DoD 순서로 구현하고, 퍼즐 수학·콘텐츠·대규모 UI는 포함하지 않는다.
- Codex 제안·변경:
  - React 19·TypeScript 6·Vite 8 기반과 Node 24/npm 11 lock, strict typecheck, ESLint·Prettier·Vitest·Playwright를 루트에 구성했다.
  - Hash Router의 `/`, `/daily`, wildcard 복구 route, 최소 AppShell·Error Boundary·i18n·CSS를 구현했다. 퍼즐 수학·콘텐츠·대규모 게임 UI는 만들지 않았다.
  - source 37개의 계층·public entrypoint·순환을 검사하고 React·DOM·services·feature 교차·직접 browser service 접근 위반 7종과 순환 1종 fixture가 실제 실패한 뒤 자동 정리되게 했다.
  - 레벨 0건과 Daily 구현 0건을 숨기지 않되, 향후 canonical solution 합성·필수 version·Daily 구현 탐지·퍼즐 스키마를 검사하는 self-check validator로 연결했다.
  - CI에 Node 24 `npm ci`, 동일 품질 명령, `/axis-shift/` build, Chromium core E2E를 연결했다.
  - 공개 루트·stage/seed는 M00으로, `/#/` 경로는 M01로 제공하는 artifact 전용 bridge와 whitelist 복사 빌더를 만들고 공식 Pages upload/deploy workflow에 연결했다.
- 사람이 수정·거절한 것과 이유: 자동 E2를 사람 gate로 환산하거나 M00 DOD를 체크하는 방안은 채택하지 않았다.
- 발견한 실패와 수정:
  - 최초 full E2E에서 Firefox·WebKit 실행 파일이 없어 6건이 실행 전 실패했다. 브라우저를 설치한 뒤 route 9건이 통과했다.
  - 44px 검사를 추가하자 Firefox가 44px를 `43.99993896484375px`로 계산했고 8-worker teardown이 timeout됐다. CSS 최소값을 45px로 올리고 worker를 3으로 제한한 뒤 12/12 통과했다.
  - Pages Playwright spec가 최초 `npm run verify`에서 Vitest에 함께 수집돼 1 suite가 실패했다. `tests/pages/**`와 생성 artifact를 Vitest 수집에서 명시적으로 제외한 뒤 unit 5/5와 전체 verify가 다시 통과했다.
  - 최종 읽기 전용 감사에서 Pages workflow가 별도 품질 CI와 독립 실행되고 upload 기본값이 `.nojekyll`을 제외하는 문제를 찾았다. 배포 workflow 자체에 a11y·core Chromium E2E를 추가하고 `include-hidden-files: true`로 artifact 동일성을 고정했다.
  - 최초 commit의 Windows clean checkout에서 `npm ci`는 성공했지만 Git 자동 CRLF checkout으로 Prettier가 65개 파일을 실패시켰다. `.gitattributes`로 text LF를 고정한 final commit을 새 clean worktree에서 다시 검증하도록 수정했다.
- 변경 파일: 루트 package·tool config·CI·Pages workflow, `scripts/`, 최소 `src/`, `tests/e2e/`, `tests/pages/`, ADR-0008·0009, M00/M01·PROGRESS·FILE_TREE·ENVIRONMENT·협업 기록
- Commit / PR: implementation `bf3d1fe1fe37f101718d21df9ca8c020e97fd5b1`, deployed head `93a4359b5cbe1b45f8ed1fe0ee4a984003e8191c`
- 검증:
  - Node v24.19.0, npm 11.6.2; `npm ci` exit 0, package-lock SHA-256 전후 동일
  - `npm run verify` exit 0; script 14/14, unit 5/5, boundary violations=0, cycles=0, lintAssertions=7
  - level files=0/selfChecks=2, Daily implementations=0/detectorSelfChecks=2, secret findings=0
  - static a11y targets=6/failures=0, Chromium·Firefox·WebKit E2E 12/12
  - final commit detached clean checkout: `npm ci` exit 0, lock SHA-256 전후 동일, tracked changes=0, `npm run verify` exit 0
  - Pages artifact files=14/bytes=327103/M00 runtime=10, Chromium·Firefox·WebKit 24/24, asset HTTP 200, console/page 오류 0
  - CI run 31733232235 success, Pages run 31733232206 success, deployment SHA=`93a4359`
  - public URL: M01 Chromium 8/8, M00 573단언·320/360/960px·console 오류 0
- 남은 위험: M01 범위에는 없음. M00 formal E1과 M02 착수 판단은 별도로 남는다.

### CX-M00-001 — DoR 감사와 4×4 fixture 고정

- 날짜: 2026-08-09
- Phase / DoD: M00 / DoR 준비, DOD-01 선행 fixture
- 관련 INV / ADR: INV-004~006, INV-015, INV-018 / ADR-0002
- 시작 상태·실패: 신규 사용자 모집 가능성과 주·예비 fixture가 모두 미체크였고, 저장소에 4×4 fixture나 프로토타입이 없었다.
- Codex 요청 요약: `AGENTS.md` → `PROGRESS.md` → M00 순으로 계약을 확인하고 M00 게이트 전 작업을 시작한다.
- Codex 제안·변경:
  - 상위 하네스, 불변식, ADR, 기술·디자인 백서, 플레이테스트 프로토콜을 대조했다.
  - 모든 축과 중첩 반전을 사용하는 rank 2 주 fixture와 rank 3 예비 fixture를 고정했다.
  - DoR 미충족 상태를 `진입 대기`로 바로잡고 개인정보 없는 기록 경계를 명시했다.
- 사람이 채택한 것: 기존 PULSE 규칙, Par 정의, 4/5·30초·90초 게이트는 변경하지 않았다. fixture와 기록 위치의 최종 검토는 프로젝트 오너에게 남아 있다.
- 사람이 수정·거절한 것과 이유: 아직 없음. 모집 가능 여부와 비공개 원시 기록 위치는 사람 확인 없이는 Codex가 충족으로 주장하지 않았다.
- 변경 파일: `phases/M00_rule_proof.md`, `docs/PLAYTEST_PROTOCOL.md`, `PROGRESS.md`, `docs/CODEX_COLLABORATION.md`
- Commit / PR: 없음
- 검증:
  - Node v25.2.0 인라인 준비 계산
  - 4×4 states=65,536, legal nonempty pulses=225
  - `M00-MAIN-v1`: rank=2, BFS minimum=2, expected intermediates 일치
  - `M00-BACKUP-v1`: rank=3, BFS minimum=3, expected intermediates 일치
- 남은 위험:
  - 신규 사용자 5명 이상 모집 근거와 비공개 기록 위치가 없어 M00 구현 DoR는 아직 미충족이다.
  - 기술 백서의 “10초 내 관계 이해” 목표는 현재 M00의 30초 내 첫 PULSE 게이트와 별도 관찰 지표로 정리할 필요가 있다.
  - 최초 감사 시 부모 디렉터리가 Git 저장소가 아니었으며, CX-M00-002에서 부모 루트 초기화와 origin 연결로 해소했다.
- 다음 작업: 프로젝트 오너가 남은 DoR를 확인하면 독립 정적 프로토타입과 영구 fixture verifier를 구현한다.

### CX-M00-002 — 실제 저장소·구현 루트 정정

- 날짜: 2026-08-09
- Phase / DoD: M00 / 작업공간 준비
- 관련 INV / ADR: INV-002, INV-003, INV-018 / 구조 ADR 불필요
- 시작 상태·실패: 하네스 문서의 상대 경로와 기존 README가 `AXIS_SHIFT_Harness_KR`를 구현 루트로 오해시킬 수 있었고 부모 디렉터리는 Git 저장소가 아니었다.
- 사람 결정: 부모 `AXIS SHIFT (Tensor)`를 실제 Git·구현 루트로 사용하고, `AXIS_SHIFT_Harness_KR`는 가이드/증거 폴더로 유지한 뒤 최종 배포 준비에서 제거한다. 원격은 `JTech-CO/axis-shift`이며 마일스톤 단위로 commit·push한다.
- Codex 제안·변경:
  - 부모 루트에 하네스 진입용 `AGENTS.md`를 추가했다.
  - 하네스 AGENTS·README·M00·파일 트리·PROGRESS의 경로 계약을 실제 배치에 맞췄다.
  - 부모 루트에서 `main` Git 저장소를 초기화하고 지정된 `origin`을 연결했다.
  - M00 미완료 상태이므로 commit·push는 수행하지 않았다.
- 변경 파일: `AGENTS.md`, `AXIS_SHIFT_Harness_KR/AGENTS.md`, `AXIS_SHIFT_Harness_KR/README.md`, `AXIS_SHIFT_Harness_KR/docs/FILE_TREE.md`, `AXIS_SHIFT_Harness_KR/phases/M00_rule_proof.md`, `AXIS_SHIFT_Harness_KR/docs/PLAYTEST_PROTOCOL.md`, `AXIS_SHIFT_Harness_KR/PROGRESS.md`, `AXIS_SHIFT_Harness_KR/docs/CODEX_COLLABORATION.md`
- Commit / PR: 없음
- 검증:
  - local Git root=`AXIS SHIFT (Tensor)`, branch=`main`
  - origin=`https://github.com/JTech-CO/axis-shift.git`
  - GitHub metadata: visibility=public, defaultBranch=main, size=0
  - 제품 경로 하네스 내부 오기 검색=0건
- 남은 위험: M00 구현 DoR의 신규 사용자 5명 모집 근거는 여전히 미충족이다.
- 다음 작업: 모집 근거 확인 후 `PROJECT_ROOT/prototypes/rule-proof/`에서 M00 프로토타입을 구현한다.

### CX-M00-003 — 규칙 증명 프로토타입과 E2 검증

- 날짜: 2026-08-09
- Phase / DoD: M00 / DOD-01 E2
- 관련 INV / ADR: INV-004~006, INV-015, INV-018 / ADR-0002
- 시작 상태·실패: 참가자 모집은 아직 불가능했고, 구현 루트에는 플레이 가능한 보드·규칙 코어·영구 verifier가 없었다. 프로젝트 오너는 플레이 가능한 프로토타입과 내부 파일럿 이후 모집하되 본 테스트 n≥5 및 4/5 임계치는 유지하기로 결정했다.
- Codex 요청 요약: 생산 스캐폴딩으로 넘어가지 않고 M00 고정 fixture를 실제로 플레이할 수 있는 최소 웹 퍼즐과 재현 가능한 E2 검증을 구현한다.
- Codex 제안·변경:
  - 순수 PULSE·GF(2) rank·canonical factorization과 세션 경계를 외부 의존성 없는 module로 구현했다.
  - 구현 전에 verifier를 먼저 실행해 `ERR_MODULE_NOT_FOUND: core.mjs` 실패를 확인한 뒤 코어·세션을 추가했다.
  - 복수 축, Preview ON/OFF, PULSE 잠금, Undo, 확인형 Reset, 완료 포커스와 live 보드 요약을 포함한 정적 프로토타입을 만들었다.
  - 360×640·키보드·rapid input·주/예비 fixture 완주를 자동 조작하는 Playwright 스모크를 추가했다.
  - Windows 기본 `python -m http.server`가 `.mjs`를 `text/plain`으로 보내 브라우저 실행이 실패한 문제를 재현하고, 올바른 MIME을 제공하는 `serve.cjs`로 수정했다.
- 사람이 채택한 것: 참가자 모집을 플레이 가능한 빌드 이후로 미루되 내부 파일럿과 본 테스트를 생략하지 않는다. M00 게이트 전에는 React/Vite·대규모 UI·M01 생산 구조를 만들지 않고, 마일스톤 완료 전 commit·push도 하지 않는다.
- 사람이 수정·거절한 것과 이유: 모집 부재를 표본 축소나 자동 테스트 대체로 처리하지 않았다. DOD-02~07은 사람 관찰 전까지 미완료로 유지한다.
- 변경 파일: `prototypes/rule-proof/{core,session,fixtures,verify-fixture,game}.mjs`, `index.html`, `styles.css`, `serve.cjs`, `browser-smoke.cjs`, `README.md`, `phases/M00_rule_proof.md`, `PROGRESS.md`, `docs/PLAYTEST_PROTOCOL.md`, `docs/CODEX_COLLABORATION.md`, `evidence/M00/browser-smoke-solved-360x640.png`
- Commit / PR: 없음 — M00 사람 플레이테스트·Scope Lock 미완료
- 검증:
  - `node prototypes/rule-proof/verify-fixture.mjs` → exit 0
  - `M00-MAIN-v1 rank=2 bfs=2`, `M00-BACKUP-v1 rank=3 bfs=3`
  - `assertions=196674 bfsVisited=65536 legalPulseCount=225 failures=0`
  - `node prototypes/rule-proof/browser-smoke.cjs` → exit 0
  - `browserAssertions=51 viewport=360x640 mainMoves=2 backupMoves=3 consoleErrors=0`
- 발견된 오류·수정: 전용 브라우저 스킬 런타임은 Windows ACL 적용 오류로 시작되지 않아 번들 Playwright+로컬 Edge로 같은 자동 조작 범위를 검증했다. 첫 정적 서버의 잘못된 `.mjs` MIME과 자동 favicon 404를 각각 전용 서버·빈 favicon으로 수정했다.
- 남은 위험: 자동화는 사람의 규칙 이해·재미·30초/90초 행동을 증명하지 않는다. 내부 파일럿, 신규 사용자 5명 이상, 원시 기록 보관 게이트와 DOD-02~07이 남아 있다.
- 다음 작업: 사람 대상 내부 파일럿 1회를 실행하고 P0 문제가 없으면 참가자 모집과 본 플레이테스트 실행 게이트로 이동한다.

### CX-M00-004 — 내부 파일럿 관찰과 폐기형 다단계 난도 확장

- 날짜: 2026-08-09
- Phase / DoD: M00 / DOD-01 E2 확장, E1 준비 관찰
- 관련 INV / ADR: INV-004~006, INV-007, INV-015, INV-018 / 공개 규칙 변경 없음
- 시작 상태·실패: 단일 Easy 프로토타입의 내부 파일럿은 완료됐지만 다단계 난도 차이가 없었고, “Daily”·Wordle 참고가 제품 전체의 하루 한 문제 제한으로 오해될 여지가 있었다.
- Codex 요청 요약: Easy를 정식 M00 조건으로 유지하면서 Normal·Hard 폐기형 stage를 추가하고, 사람 관찰과 수학적 Par 및 본 표본 게이트를 분리해 기록한다.
- 사람 결정:
  - 내부 파일럿은 run 2회이며 관측 최저 3 PULSE, 초기 계산이 어긋난 흐름은 4~5 PULSE까지 이어질 수 있었다. 참가자 수·시간·개입은 미보고로 둔다.
  - `M00-MAIN-v1`은 Easy 정식 조건이고 수학적 Par는 2로 유지한다. Normal·Hard는 난도 탐색용 폐기형 프로토타입이며 정식 M00 표본에 포함하지 않는다.
  - 제품 전체는 하루 한 문제로 제한하지 않는다. 날짜 제한은 Daily 모드에만 적용하고, Wordle 유사성은 간결한 SNS 공유 결과 레이아웃에만 한정한다.
- Codex 제안·변경:
  - Easy·Normal·Hard를 Par 2·3·4 순서의 명시적 stage fixture로 분리하고 예비 fixture를 회귀용으로 유지했다.
  - phase·protocol·progress에서 내부 파일럿과 Normal/Hard 탐색을 DOD-02~04의 E1 표본과 분리했다.
  - 기술·디자인 백서에 Daily 모드 경계, 중립적 난도 배지, 공유 레이아웃의 Wordle 참고 범위를 명시했다.
  - 기존 단일-stage 51개 단언은 역사 기준선으로 보존하고, Easy→Normal→Hard와 예비 회귀를 포함한 다단계 브라우저 스모크를 140개 단언으로 확장했다.
- 사람이 수정·거절한 것과 이유: 관측 최저 3을 최단해나 Par 3으로 해석하지 않았고, 파일럿 2회를 n=2 또는 정식 성공 표본으로 환산하지 않았다. n≥5·4/5·30초·90초 게이트는 변경하지 않았다.
- 변경 파일: `prototypes/rule-proof/`의 폐기형 stage 작업, `AGENTS.md`, `PROGRESS.md`, `phases/M00_rule_proof.md`, `docs/PLAYTEST_PROTOCOL.md`, `docs/TECHNICAL_WHITEPAPER.md`, `docs/DESIGN_WHITEPAPER.md`, `docs/CODEX_COLLABORATION.md`
- Commit / PR: 없음 — M00 DOD-02~07 미완료
- 검증:
  - `node prototypes/rule-proof/verify-fixture.mjs` → exit 0
  - `M00-MAIN-v1 rank=2`, `M00-NORMAL-v1 rank=3`, `M00-HARD-v1 rank=4`, `M00-BACKUP-v1 rank=3`; 각 BFS minimum 일치
  - `stageSequence=easy:2>normal:3>hard:4`
  - `assertions=196708 bfsVisited=65536 legalPulseCount=225 failures=0`
  - 기존 단일-stage 브라우저 기준선: `browserAssertions=51 viewport=360x640 mainMoves=2 backupMoves=3 consoleErrors=0`
  - 다단계 브라우저 명령: `NODE_PATH=<bundled Playwright node_modules> BROWSER_EXECUTABLE=<Edge executable> node prototypes/rule-proof/browser-smoke.cjs` → exit 0
  - `browserAssertions=140 viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3 consoleErrors=0`
  - 증거: `AXIS_SHIFT_Harness_KR/evidence/M00/browser-smoke-stages-360x640.png`
- 남은 위험: 사람 관찰은 run 수와 PULSE 범위만 보고돼 시간·개입·회상·기기 구성을 판단할 수 없다. 정식 n≥5 표본과 DOD-02~07은 여전히 미충족이다.
- 다음 작업: Easy 직접 진입 조건으로 신규 사용자 n≥5를 모집하고 표본 구성·비공개 기록 위치·삭제 예정일을 확정한 뒤 본 플레이테스트를 실행한다.

---

```markdown
### CX-M02-001 — GF(2) rank와 독립 오라클

- 날짜:
- Phase / DoD:
- 관련 INV / ADR:
- 시작 상태·실패:
- Codex 요청 요약:
- Codex 제안·변경:
- 사람이 채택한 것:
- 사람이 수정·거절한 것과 이유:
- 변경 파일:
- Commit / PR:
- 검증:
  - `npm run test:math:exhaustive`
  - matrixCount=512, mismatch=0
- 남은 위험:
- 다음 작업:
```

## 9. 품질 분류

Codex 산출물은 다음 중 하나로 분류한다.

| 분류 | 정의 | 요구 행동 |
|---|---|---|
| Accepted | 사람 검토·게이트 통과 후 그대로 채택 | 증거·commit 연결 |
| Modified | 아이디어/초안을 사람이 수정 후 채택 | 수정 이유 기록 |
| Rejected | 부정확·범위 밖·과도한 복잡성 | 기각 이유 기록 |
| Experimental | branch/fixture에서만 검토 | production 미포함 명시 |
| Reverted | 채택 후 회귀로 되돌림 | 원인·revert commit·새 gate 기록 |

## 10. 제출용 협업 요약 골격

M11에서 실제 로그만으로 다음을 작성한다.

```text
Codex는 순수 GF(2) 게임 코어, 결정적 Daily 생성기, 자동 검증과
브라우저 E2E 구현에 사용했다. 사람은 코어 규칙, 난도 철학,
48개 Lab 큐레이션, 시각 방향과 릴리스 승인을 유지했다.

대표 사례 1: [문제] → [Codex 변경] → [사람 수정] → [테스트 수치]
대표 사례 2: [문제] → [Codex 변경] → [사람 수정] → [배포 증거]
```

커밋·CI·리포트가 없는 사례를 대표 사례로 사용하지 않는다.

## 11. 최종 검토 체크

- [ ] 각 대표 Codex 사례에 commit/PR이 있다.
- [ ] 최소 하나는 실패 재현 → 수정 → 회귀 테스트 흐름이다.
- [ ] 최소 하나는 generator/수학의 대량 자동 검증이다.
- [ ] 최소 하나는 접근성·배포 품질 개선이다.
- [ ] 사람의 거절·수정 사례가 포함되어 맹목적 사용처럼 보이지 않는다.
- [ ] ChatGPT 기획과 Codex 구현 기여가 구분된다.
- [ ] 프롬프트·로그에 secret·개인정보가 없다.
- [ ] 영상·소개문의 수치가 이 문서 증거와 일치한다.
