# M06 — Tutorial & Lab Product Flow ★

- **상태**: 미시작
- **담당 범위**: 홈, 최초 사용자, Tutorial 6, Lab 48, Hint·Result 통합
- **최종 갱신**: 2026-08-09

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

## 3. 진입조건 (DoR)

- [ ] M05 DoD 통과.
- [ ] Tutorial 6·Lab 48 validator 통과 상태.
- [ ] M04 storage·session API와 M05 component API가 안정됨.
- [ ] Tutorial 카피의 ko/en key가 초안 상태로 존재.
- [ ] INV-004~007, INV-010~012, INV-015~018 확인.

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
- **ADR**: ADR-0001, ADR-0002, ADR-0005
- **기술 백서**: §1.4, §2.2, §4.2, §8.2~3
- **디자인 백서**: Home, Tutorial, Lab, Game, Result 화면 명세
- **프로토콜**: `docs/PLAYTEST_PROTOCOL.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — Tutorial 수량·순서**: 6개 단계가 데이터 순서대로 실행되고 각 단계 완료 조건이 명시적 selector로 판정된다. skip·back 정책이 문서와 일치한다.
- [ ] **DOD-02 — 첫 사용자 플로우**: 빈 storage에서 홈 → Tutorial → 첫 Lab 완료까지 오류·dead end 없이 진행된다. E3.
- [ ] **DOD-03 — 학습 실효**: 신규 사용자 5명 이상 중 4명 이상이 최종 UI에서 사람의 절차 개입 없이 첫 Tutorial을 90초 안에 완료하고, 첫 Lab에서 유효 PULSE를 실행한다. E1.
- [ ] **DOD-04 — 전체 콘텐츠 플레이 가능**: canonical solution으로 Tutorial 6 + Lab 48 모두 시작·해결·결과 저장·다음 이동이 성공한다. 실패=0. E3. (INV-006, INV-007)
- [ ] **DOD-05 — PULSE·완료 단일성**: rapid tap/key repeat E2E에서 move와 result가 중복되지 않는다. (INV-010)
- [ ] **DOD-06 — Hint·등급**: 각 Hint 단계의 표시, 적용, 결과 카드 제한이 M04 grade fixture와 UI에서 일치한다. (INV-006)
- [ ] **DOD-07 — Resume**: selecting 상태에서 새로고침하면 current board·moves·timer·hint가 복구되고 pulsing 중 저장 fixture는 마지막 안정 상태로 복구된다. (INV-011)
- [ ] **DOD-08 — 기록 병합**: 재플레이의 나쁜 결과가 기존 best를 덮어쓰지 않고, 개선된 등급·펄스·시간은 명세된 우선순위로 갱신된다.
- [ ] **DOD-09 — Reset 안전성**: 진행 중 Reset은 확인 후에만 실행되고 완료 기록은 삭제하지 않는다. Dialog 취소 시 focus가 원래 컨트롤로 돌아간다.
- [ ] **DOD-10 — 접근성**: 키보드만으로 first-run부터 첫 Lab 결과까지 완료, 자동 axe serious/critical=0, 결과 heading focus 이동. (INV-015)
- [ ] **DOD-11 — 반응형**: 360px에서 Tutorial coachmark·target·sticky PULSE가 board를 가리지 않고 가로 overflow=0.
- [ ] **DOD-12 — 사용자 문자열**: Tutorial·Lab·Result의 모든 문자열이 i18n key이고 ko/en key parity 검사에 포함된다. (INV-016)
- [ ] **DOD-13 — 문서 정합성**: 실제 step·chapter·route·기록 비교를 추적표와 `PROGRESS.md`에 반영한다.

## 8. 검증 명령

```bash
npm run validate:levels
npm run test -- src/features/tutorial src/features/lab src/features/game-session
npm run test:e2e -- tests/e2e/tutorial.spec.ts tests/e2e/lab.spec.ts tests/e2e/persistence.spec.ts
npm run test:a11y -- --grep "Tutorial|Lab"
npm run verify
```

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 신규 사용자 5명+ | 새 프로필에서 first-run | 4/5 이상 90초 내 Tutorial 1 완료 | 익명 집계 |
| 360px Android | Tutorial 6 → Lab 1 | 가림·오입력·overflow 없음 | 영상 |
| 키보드/스크린리더 | 동일 플로우 | 안내·상태·결과 이해 가능 | 체크표 |
| storage 복구 | 중간 새로고침·손상 주입 | 복구 또는 안전한 재시작 | 로그 |

## 10. 증거

```text
아직 없음.
```

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
