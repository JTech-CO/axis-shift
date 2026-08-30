# M06 — Tutorial & Lab Product Flow ★

- **상태**: 구현 체크포인트 — DOD-01~02·04~13 자동 PASS, DOD-03 신규 사용자 E1 대기
- **담당 범위**: 홈, 최초 사용자, Tutorial 6, Lab 48, Hint·Result 통합
- **최종 갱신**: 2026-08-30

## 1. 맥락과 목표

수학 코어·세션·UI를 실제 제품의 첫 완결 플로우로 통합한다. 신규 사용자가 규칙을 배우고 첫 Lab을 완료하며, 기존 사용자는 48개 큐레이션 퍼즐을 탐색·재개·기록할 수 있어야 한다.

## 2. 범위

### 포함

- 홈의 Daily/Lab/Sprint 진입 카드 골격과 Continue
- first-run 감지와 Tutorial 6단계
- inline coachmark·목표·오류 복구
- Lab 4개 챕터 × 12레벨 탐색
- GameScreen에 session·UI·저장 연결
- Undo, Reset confirm, Hint 1~3, 결과·다시 보기·다음 레벨
- 최고 등급·최소 펄스·최단 시간 기록
- 완료 후 focus와 route 이동
- 최종 UI로 신규 사용자 플레이테스트

### 제외

- 실제 Daily·Archive 데이터 연결
- Sprint timer·score
- 공유·PWA·한영 완성
- 온라인 잠금·계정 기반 진행


### 3.1 구현 전 정책 동결

- Tutorial은 승인된 `TUTORIAL_LEVELS` 순서의 6개 퍼즐이며, 각 단계는 해당 학습 selector와 실제 해결을 모두 만족해야 다음 단계로 이동한다.
- selector는 순서대로 행 선택 경험, 열 선택 경험, 양 축 교차 미리보기, 유효 PULSE, 2행×2열 이상 PULSE, 겹치는 셀이 있는 2회 이상 PULSE 해결을 증명한다.
- Skip은 언제든 허용한다. 이는 온보딩을 확인한 것으로 `tutorialCompleted=true`를 저장하고 현재 Tutorial session을 지운 뒤 `/lab`으로 이동하지만, 미해결 Tutorial 레벨 기록을 만들지는 않는다.
- Back은 1단계에서 홈으로, 2~6단계에서 직전 단계의 새 시도로 이동한다. 브라우저 Back은 막지 않는다.
- 마지막 Tutorial의 성공 CTA는 첫 Lab으로 이동한다. 중간 성공 CTA는 데이터 순서의 다음 Tutorial을 새 session으로 시작한다.
- Lab 4개 챕터×12레벨은 계정·온라인 잠금 없이 모두 자유 접근한다. invalid level ID는 안전한 복구 화면으로 보낸다.

DoR 증거(2026-08-29): `validate:levels`는 files=5, levels=54, tutorial=6, lab=48, rank/solution/tag=68/68/68, validatorSelfChecks=22, failures=0; M04/M05 focused API는 15 files/107 tests PASS; locale draft 계약은 1 file/2 tests PASS; `typecheck`와 `check:boundaries`는 PASS(83 files, 150 edges, violations=0, cycles=0).
## 3. 진입조건 (DoR)

- [x] M05 DoD 통과.
- [x] Tutorial 6·Lab 48 validator 통과 상태.
- [x] M04 storage·session API와 M05 component API가 안정됨.
- [x] Tutorial 카피의 ko/en key가 초안 상태로 존재.
- [x] INV-004~007, INV-010~012, INV-015~018 확인.

## 4. 입력·산출물 계약

### 입력

- `src/content/levels/*.json`
- session reducer·repository·clock
- shared game UI components
- Tutorial step ID와 i18n key

### 산출물

```text
src/features/home/*
src/features/tutorial/*
src/features/lab/*
src/features/game-session/*
tests/e2e/tutorial.spec.ts
tests/e2e/lab.spec.ts
tests/e2e/persistence.spec.ts
```

- 54개 콘텐츠 자동 해답 E2E 결과
- 최종 UI 신규 사용자 플레이테스트 집계

## 5. 작업 순서

1. reusable GameScreen controller를 domain session과 연결한다.
2. Tutorial step 조건과 coachmark를 데이터 기반으로 구현한다.
3. first-run → Tutorial → 첫 Lab CTA 흐름을 연결한다.
4. Lab chapter·level list와 완료/등급 상태를 구현한다.
5. Hint·Undo·Reset·resume·error recovery를 실제 화면에 연결한다.
6. canonical solution runner를 test-only helper로 만들어 54개 퍼즐을 자동 완료한다.
7. keyboard, mobile, reload E2E를 작성한다.
8. 최종 UI로 최소 5명 신규 사용자 테스트를 재실행하고 카피·순서를 조정한다.

## 6. 참조

- **불변식**: INV-004~007, INV-010~012, INV-015, INV-016, INV-018
- **ADR**: ADR-0001, ADR-0002, ADR-0005, ADR-0013
- **기술 백서**: §1.4, §2.2, §4.2, §8.2~3
- **디자인 백서**: Home, Tutorial, Lab, Game, Result 화면 명세
- **프로토콜**: `docs/PLAYTEST_PROTOCOL.md`

## 7. DoD — 완료 게이트

- [x] **DOD-01 — Tutorial 수량·순서**: 6개 단계가 데이터 순서대로 실행되고 각 단계 완료 조건이 명시적 selector로 판정된다. skip·back 정책이 문서와 일치한다.
- [x] **DOD-02 — 첫 사용자 플로우**: 빈 storage에서 홈 → Tutorial → 첫 Lab 완료까지 오류·dead end 없이 진행된다. E3.
- [ ] **DOD-03 — 학습 실효**: 최종 배포 후보의 서로 다른 신규 사용자 n≥5에서 (a) 4/5 이상이 I2/I3 개입 없이 Tutorial 1을 90초 안에 완료, (b) 4/5 이상이 첫 Lab에서 유효 PULSE 실행, (c) 같은 P0 혼동이 2명 이상에게 반복되지 않음, (d) 360px 참가자의 control 가림 0건, (e) 4/5 이상이 질문 없이 완료 후 다음 CTA를 발견해야 한다. E1.
- [x] **DOD-04 — 전체 콘텐츠 플레이 가능**: canonical solution으로 Tutorial 6은 시작·해결·session clear·다음 이동이, Lab 48은 시작·해결·결과 기록·다음 이동이 성공한다. Tutorial level record는 만들지 않으며 실패=0이다. E3. (INV-006, INV-007)
- [x] **DOD-05 — PULSE·완료 단일성**: rapid tap/key repeat E2E에서 move와 result가 중복되지 않는다. (INV-010)
- [x] **DOD-06 — Hint·등급**: 각 Hint 단계의 표시, 적용, 결과 카드 제한이 M04 grade fixture와 UI에서 일치한다. (INV-006)
- [x] **DOD-07 — Resume**: selecting 상태에서 새로고침하면 current board·moves·timer·hint가 복구되고 pulsing 중 저장 fixture는 마지막 안정 상태로 복구된다. (INV-011)
- [x] **DOD-08 — 기록 병합**: 재플레이의 나쁜 결과가 기존 best를 덮어쓰지 않고, 개선된 등급·펄스·시간은 명세된 우선순위로 갱신된다.
- [x] **DOD-09 — Reset 안전성**: 진행 중 Reset은 확인 후에만 실행되고 완료 기록은 삭제하지 않는다. Dialog 취소 시 focus가 원래 컨트롤로 돌아간다.
- [x] **DOD-10 — 접근성**: 키보드만으로 first-run부터 첫 Lab 결과까지 완료, 자동 axe serious/critical=0, 결과 heading focus 이동. (INV-015)
- [x] **DOD-11 — 반응형**: 360px에서 Tutorial coachmark·target·sticky PULSE가 board를 가리지 않고 가로 overflow=0.
- [x] **DOD-12 — 사용자 문자열**: Tutorial·Lab·Result의 모든 문자열이 i18n key이고 ko/en key parity 검사에 포함된다. (INV-016)
- [x] **DOD-13 — 문서 정합성**: 실제 step·chapter·route·기록 비교를 추적표와 `PROGRESS.md`에 반영한다.

## 8. 검증 명령

```bash
npm run validate:levels
npm run test -- src/features/tutorial src/features/lab src/features/game-session
npm run test:e2e -- tests/e2e/tutorial.spec.ts tests/e2e/lab.spec.ts tests/e2e/persistence.spec.ts --workers=1
npm run test:a11y -- --grep "Tutorial|Lab"
npm run verify
```

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 신규 사용자 5명+ | 새 프로필에서 Tutorial 1 → 첫 Lab → 완료 후 CTA | 4/5 이상 Tutorial 1≤90초(I2/I3 없음), 4/5 이상 첫 Lab 유효 PULSE, 반복 P0 혼동<2명, 360px control 가림 0건, 다음 CTA 발견 4/5 이상 | **NOT RUN** — 최종 배포 후보의 신규 사용자 n≥5 E1 필요. M00 표본 재사용 금지 |
| 360px Android | Tutorial 6 → Lab 1 | 가림·오입력·overflow 없음 | **NOT RUN** — Chromium 360px 자동 geometry는 PASS, Android 실기기 영상 없음 |
| 키보드/스크린리더 | 동일 플로우 | 안내·상태·결과 이해 가능 | **PARTIAL** — Chromium keyboard-only 자동 PASS, 실제 스크린리더 체크표는 NOT RUN |
| storage 복구 | 중간 새로고침·손상 주입 | 복구 또는 안전한 재시작 | **자동 PASS** — Chromium·Firefox·WebKit 9/9 |

## 10. 증거

```text
checkpoint=IMPLEMENTED_NOT_COMPLETE
passedDoD=DOD-01,DOD-02,DOD-04..DOD-13
pendingDoD=DOD-03
humanE1=NOT_RUN; required=new users n>=5 on final deployed candidate; M00 reuse=forbidden
criteria=tutorial1<=90s without I2/I3 >=4/5; firstLabValidPulse>=4/5; repeatedP0<2; 360pxControlOverlap=0; nextCtaDiscovery>=4/5

npm run validate:levels
files=5 levels=54 tutorial=6 lab=48 pulse=12 echo=12 rank=12 noise=12
rankChecks=68 solutionChecks=68 tagChecks=68 validatorSelfChecks=22 failures=0
catalogHash=c625d54327e5a6c3c6305a373d5199abd01c6fb69415161f9d4aee27c1738484
approvalFingerprint=5a60604a91b51c88ab294701b7a1eb286b00700101643807c80d5d10d59b7e6a humanReview=APPROVED

npm run test -- src/features/tutorial src/features/lab src/features/game-session
testFiles=4 tests=27 failures=0

npm run test:e2e -- tests/e2e/tutorial.spec.ts tests/e2e/lab.spec.ts tests/e2e/persistence.spec.ts --workers=1
tests=36 passed=26 intentionalBrowserSkips=10 failures=0 duration=1.8m workers=1 (canonical CI command)
canonicalRunner=tutorial6 start/solve/sessionClear/next failures=0; lab48 start/solve/resultSave/next failures=0; tutorialLevelRecords=0
persistence=3 browsers x 3 scenarios = 9/9
chromiumOnly=keyboard full flow, 360 geometry, canonical54, Hint/best/reset deep cases

npm run test:a11y -- --grep "Tutorial|Lab"
actualRoutes=Tutorial+LabCatalog+LabGame passed=3 serious=0 critical=0

npm run test:visual -- --project=ui-fixtures
M05 regression=18/18; approved baseline9 diff=0

npm run test:pages
Chromium=12/12 Firefox=12/12 WebKit=12/12 failures=0

npm run verify
scriptContract=22/22 steps=12/12
unitFiles=36 tests=218 failures=0
boundaries files=97 edges=199 violations=0 cycles=0
designTokens files=16 hardcodes=0 annotations=13
appBuild=PASS pagesBuild=PASS
```

구현 추적(2026-08-30):

- `src/features/game-session/`: M04 session·repository·clock을 실제 GameScreen에 연결하고 resume, visibility timer, Hint, Undo, Reset confirm, 결과·best 병합을 제공한다.
- `src/features/tutorial/`: 승인된 Tutorial 6 순서, 학습 selector, coachmark, back·skip·advance 정책을 데이터 기반으로 판정한다.
- `src/features/lab/`: 4개 챕터×12레벨을 모두 열어 두고 완료·등급 상태와 안전한 invalid-route 복구를 제공한다.
- `src/features/home/`, `src/app/ProductRoutes.tsx`: 빈 storage first-run, Continue, Tutorial→첫 Lab, Result→replay/next 흐름을 연결한다.
- 게임 route(`/tutorial`, `/lab/:levelId`)에서는 디자인 백서 §2.2.2에 따라 상시 GNB를 제거하고 브랜드·현재 모드만 남긴 최소 헤더를 사용한다.
- 완료 기록 저장이 처리되지 않았거나 session clear가 실패하면 Tutorial back·advance·skip과 Lab replay·next·back 전환을 막고 저장 경고·재시도를 제공한다.
- Pages 산출물의 H00 공개 호환 URL 기본 접속은 M06 React `#/`로 이동하고, 기존 `stage`·`signal`·`seed`·`#controls` 링크는 `legacy.html`에서 H00을 계속 제공한다.
- `.github/workflows/ci.yml`: 실제 Tutorial/Lab axe와 Tutorial·Lab·persistence product-flow 게이트를 추가한다.

판정: 자동 E2/E3는 DOD-01~02·04~13을 충족했다. DOD-03 E1은 PASS·면제·M10 이관이 아니며, 고정 배포 후보에서 신규 사용자 n≥5 결과가 기록될 때까지 M06은 완료가 아니다.

## 11. 롤백 계획

- GameScreen controller, Tutorial, Lab을 분리 커밋한다.
- 카피·coachmark 변경은 콘텐츠 key와 visual snapshot을 함께 되돌린다.
- 콘텐츠 파일을 수정하면 M03 validator·감사를 다시 실행한다.

## 12. 리스크·미지수

- coachmark가 실제 규칙보다 UI 위치 암기에 의존할 수 있다.
- 48개 전체 자동 완료 E2E가 느려질 수 있어 validator와 대표 E2E를 분리해야 할 수 있다.
- 자유로운 Lab 잠금 정책이 동기 부여와 혼동에 미치는 영향.

## 13. STOP 트리거

- 최종 UI 플레이테스트 4/5 기준 미달.
- Tutorial 완료를 위해 코어 규칙을 예외 처리해야 함.
- 54개 중 validator·자동 해답 실패 1건 이상.
- 모바일 또는 키보드 핵심 플로우가 P1 수준으로 막힘.

## 14. 다음 phase 인계

- 안정된 GameScreen controller와 결과 저장 흐름
- first-run·완료·resume E2E fixture
- 홈 진입 카드 API
- Daily가 재사용할 session·result·record 컴포넌트
