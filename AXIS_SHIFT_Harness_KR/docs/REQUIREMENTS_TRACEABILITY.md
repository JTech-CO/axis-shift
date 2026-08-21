# AXIS//SHIFT 요구사항 추적표

**버전**: 1.0.0  
**상태**: M00·M01 verified / H00 v0.1 submission slice verified / v1 roadmap baseline
**최종 갱신**: 2026-08-21

> 기능 요구사항 ID는 기술 백서 §2.2.2를 따른다. `NFR-*`는 백서의 성능·접근성·배포·개인정보 기준을 하네스에서 추적 가능하게 부여한 ID다. 이 표가 새로운 제품 요구를 만드는 것은 아니며, 원문 기준의 검증 경로를 연결한다.

## 1. 상태 코드

| 상태 | 의미 |
|---|---|
| Planned | phase·test 경로만 정의, 구현 전 |
| In Progress | 현재 phase에서 구현 중 |
| Verified | 명령·증거가 연결됨 |
| Blocked | DoR·결정·결함으로 진행 불가 |
| Deferred | v1 비목표로 명시 |

## 2. 기능 요구사항

| ID | 요구사항·승인 조건 | Phase | 기준 모듈 | 자동 검증 | INV | 상태 |
|---|---|---|---|---|---|---|
| FR-CORE-001 | 행·열 복수 선택과 독립 토글, 시각·ARIA 상태 | M05·M06 | `components/game/AxisToggle`, session reducer | component + keyboard E2E | 010,015 | Planned |
| FR-CORE-002 | PULSE 전 실제 변경 없는 교차점 preview | M05·M06 | `TensorGrid`, selectors | fixture snapshot + component | 005,015 | Planned |
| FR-CORE-003 | 선택 교차점만 XOR 반전, 이동 1건 | M02·M04·M06 | `domain/board`, session reducer | property + rapid-input E2E | 005,010 | Planned |
| FR-CORE-004 | 목표 일치 시 완료 event 1회 | M04·M06 | session reducer | idempotency + E2E | 010 | Planned |
| FR-CORE-005 | Undo가 직전 PULSE를 역산·기록 복원 | M04·M06 | session reducer | reducer + E2E | 005,010 | Planned |
| FR-CORE-006 | 확인 후 initial state Reset, 확정 기록 보존 | M04·M06 | reducer, Dialog | reducer + component/E2E | 010,011 | Planned |
| FR-CORE-007 | 새로고침 후 유효 미완료 세션 복구 | M04·M06·M07 | storage repository | migration + reload E2E | 011 | Planned |
| FR-HINT-001 | 남은 Par → 한 축 → 전체 PULSE 단계형 Hint | M02·M04·M06 | factorization, selectors | rank/factorization + UI | 006 | Planned |
| FR-LAB-001 | Tutorial 이후 Lab 진입·48레벨 진행 | M03·M06 | content, lab feature | level validator + E2E | 007,011 | Planned |
| FR-DAILY-001 | 동일 UTC date/version에서 동일 퍼즐 | M03·M07 | generator, UTC adapter | 3,650-day audit + timezone E2E | 008,009 | Planned |
| FR-DAILY-002 | 날짜별 완료와 local streak | M04·M07 | record repository, streak | truth table + E2E | 011,012 | Planned |
| FR-SPRINT-001 | `sessionEndAt` 기준 180초 연속 세션 | M08 | sprint reducer, score | fake clock + browser E2E | 010,012 | Planned |
| FR-SHARE-001 | 정답 없는 UTF-8 결과 텍스트·폴백 | M09 | share-safe DTO, adapter | payload snapshot + capability matrix | 013,016 | Planned |
| FR-SHARE-002 | 1080×1080·1200×630 PNG | M09 | Canvas renderer | dimension/golden fixture | 013,019 | Planned |
| FR-PWA-001 | 캐시 후 네트워크 없이 핵심 앱 시작 | M09·M10 | manifest, service worker | offline E2E + production smoke | 014,017 | Planned |
| FR-I18N-001 | ko/en 즉시 전환과 선택 저장 | M09 | i18n, settings | key parity + reload E2E | 011,016 | Planned |

## 3. 파생 비기능 요구사항

| ID | 백서 기준 | Phase | 자동·수동 검증 | INV | 상태 |
|---|---|---|---|---|---|
| NFR-MATH-001 | Par=`rank_GF2(current XOR target)` | M02 | 3×3 512 전수 BFS 패리티 | 006 | Planned |
| NFR-CONTENT-001 | Tutorial 6 + Lab 48 전부 유효 | M03·M06 | validator + canonical solve | 007 | Planned |
| NFR-DET-001 | seed·factorization·signature 결정성 | M02·M03·M09 | golden vectors·browser parity | 006,008 | Planned |
| NFR-STORAGE-001 | schema guard·migration·손상 복구 | M04 | fixture matrix + reload E2E | 011 | Planned |
| NFR-RESP-001 | 360px부터 가로 스크롤·가림 없음 | M05·M10 | viewport E2E + 실기기 | 015 | Planned |
| NFR-A11Y-001 | 키보드 전체 흐름, 44px, 색 외 표식 | M05~M10 | axe·computed size·manual SR | 015 | Planned |
| NFR-MOTION-001 | Reduced Motion에서 정보·기능 동일 | M05·M09 | media fixture + E2E | 015 | Planned |
| NFR-I18N-001 | ko/en key 누락·hardcoded copy 0 | M05·M09 | key parity·lint | 016 | Planned |
| NFR-PERF-001 | JS/CSS/cache·Web Vitals·계산 예산 기록 | M10 | bundle/Lighthouse/bench report | 018 | Planned |
| NFR-OFFLINE-001 | same-origin 자산과 offline 핵심 플레이 | M09·M10 | request audit + offline E2E | 014,017 | Planned |
| NFR-PRIVACY-001 | 계정·식별정보·analytics·cookie 없음 | M09·M10 | network/storage/CSP audit | 001,017 | Planned |
| NFR-LICENSE-001 | 모든 배포 자산 권리 등록 | M09~M11 | asset inventory | 019 | Planned |
| NFR-DEPLOY-001 | GitHub Pages base/hash route/PWA scope 정합 | M01·M09·M10 | non-root + production smoke | 014 | Planned |
| NFR-RECOVERY-001 | 오류·저장·PWA update에서 안전 복구 | M04·M09·M10 | fault injection E2E | 011,014 | Planned |
| NFR-RELEASE-001 | P0/P1·INV 위반 0 | M10·M11 | QA_REPORT + issue audit | 020 | Planned |
| NFR-CODEX-001 | Codex 기여·사람 판단·검증 증거 구분 | 전 phase·M11 | collaboration log + commit links | 018 | Planned |

## 4. H00 해커톤 제출 슬라이스 추적

> 아래 `HS-*`는 2026-08-26 제출용 v0.1 프로토타입 승인 조건이다. 기존 v1 FR/NFR 행을 `Verified`로 승격하지 않는다.

| ID | 승인 조건 | Phase | 기준 구현 | 검증 | INV | 상태 |
|---|---|---|---|---|---|---|
| HS-CONTENT-001 | 기존 6 profile × 고정 signal 3개 이상, 총 18개 이상·중복 0 | H00 | `prototypes/rule-proof/fixtures.mjs` | verifier + 전체 진행 browser smoke | 004~007,018 | Verified |
| HS-AXIS-001 | 선택 축 진행선·PULSE 교차점 충격·완료 Signal Lock | H00 | `game.mjs`, `styles.css` | state/computed-style browser smoke | 005,010,015 | Verified |
| HS-A11Y-001 | 키보드·44px·reduced motion·비색상 preview 유지 | H00 | M00 prototype UI | 320/360/390/960 E2E + E1 | 015,018 | Verified |
| HS-DEPLOY-001 | 고정 v0.1 SHA Pages root·signal·seed·M01 bridge 공개 smoke | H00 | Pages artifact | CI `32453169036` + Pages `32453169029` + public E4 | 014,017,020 | Verified |
| HS-SUBMIT-001 | Prototype/v0.1로 정직한 URL·README·영상·썸네일·백업 | H00 | 제출 문서·자산 | 필드 대조 2회 + manifest 14/0 + 2중 백업 hashDelta 0 | 018~020 | Verified |

> **H00 완료 증거 (2026-08-21)**: tag/release SHA와 app capture SHA는 모두 `6690f5778f706e1875b452d552bd75ba1c06ee9a`이며 Pages digest는 `sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998`다. H00 경계는 submission-ready 패키지까지이며 공식 Google 양식의 최종 Submit은 오너 작업으로 남아 있고 실행했다고 주장하지 않는다. v1 FR/NFR 행은 계속 `Planned`다.

## 5. 모드별 E2E 추적

| 사용자 흐름 | 주요 요구 | Test file 목표 | Phase |
|---|---|---|---|
| 새 사용자 → Tutorial → 첫 Lab | CORE-001~007, LAB-001, A11Y | `tutorial.spec.ts`, `lab.spec.ts` | M06 |
| Lab 중 reload → Resume | CORE-007, STORAGE | `persistence.spec.ts` | M06 |
| 오늘 Daily → solve → reload | DAILY-001~002, CORE-004 | `daily.spec.ts` | M07 |
| 과거 Archive direct route | DAILY-001, DEPLOY | `archive.spec.ts` | M07 |
| 180초 Sprint background/reload | SPRINT-001 | `sprint.spec.ts` | M08 |
| 결과 text/PNG 공유 | SHARE-001~002 | `sharing.spec.ts` | M09 |
| 설치 후 offline 재시작 | PWA-001 | `offline.spec.ts` | M09·M10 |
| update prompt 중 진행 세션 | RECOVERY | `pwa-update.spec.ts` | M09·M10 |
| ko↔en·테마·모션 설정 | I18N-001, A11Y | `settings.spec.ts` | M09 |
| GitHub Pages non-root 전체 route | DEPLOY | `base-path.spec.ts`, production smoke | M01·M10 |

## 6. 추적성 완료 조건

M10 진입 전:

- 모든 v1 FR/NFR 행이 `Planned` 이상이며 phase·test·INV가 비어 있지 않다.
- `Deferred`는 기술 백서 비목표와 링크된다.

M11 진입 전:

- 모든 v1 필수 행이 `Verified`다.
- `Blocked` 0건.
- test file·명령·CI artifact·QA_REPORT 증거를 실제 값으로 연결한다.
- 코드 검색으로 요구사항 ID의 중복·누락을 검사한다.

## 7. 변경 규칙

- 새 요구사항은 ID를 재사용하지 않는다.
- 삭제 대신 `Deferred` 또는 대체 ID를 기록한다.
- 승인 조건 변경은 백서·phase·test·INV·ADR의 영향 범위를 함께 갱신한다.
- 테스트가 없어진 요구는 `Verified` 상태를 유지할 수 없다.
