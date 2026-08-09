# M08 — 180-Second Sprint Mode ★

- **상태**: 미시작
- **담당 범위**: 시간제 연속 퍼즐, 절대 종료, 난도 상승, 점수·최고 기록
- **최종 갱신**: 2026-08-09

## 1. 맥락과 목표

Sprint는 Daily와 다른 반복 플레이 이유를 제공하지만, 타이머·연속 생성·점수의 결합으로 회귀 위험이 높다. 백그라운드 전환이나 새로고침으로 시간이 늘어나지 않고, 같은 고정 seed·행동 기록은 같은 퍼즐열과 점수를 만드는 상태를 목표로 한다.

## 2. 범위

### 포함

- `/#/sprint` 준비·플레이·결과 화면
- `sessionStartedAt`, `sessionEndAt = startedAt + 180000`
- 4×4 → 5×5 → 6×6 난도 상승 시퀀스
- 주입 가능한 Sprint seed와 결정적 puzzle sequence
- 퍼즐 완료 전환, 결과 집계, local best
- visibility·reload·clock jump 처리
- score 함수와 golden vectors
- 키보드·모바일·접근성

### 제외

- 일일 공통 Sprint seed·온라인 리더보드
- 서버 기반 부정행위 방지
- 공유 카드의 세부 구현(M09)
- Sprint 중 장시간 pause 기능

## 3. 진입조건 (DoR)

- [ ] M07 DoD 통과.
- [ ] Sprint의 **정확한 점수식과 tie-break 우선순위**가 사람 결정으로 문서화됐다. 기술 백서는 해결 수·S 등급 수·총점을 요구하지만 구체 산식은 지원하지 않으므로 임의로 확정하지 않는다.
- [ ] Sprint reload 정책이 확정됐다: 남은 시간이 있으면 같은 seed·index·endAt으로 재개, 만료됐으면 즉시 결과 확정.
- [ ] 난도 상승 표와 puzzle source가 검증됐다.
- [ ] INV-006~008, INV-010~012, INV-015~018 확인.

## 4. 입력·산출물 계약

### 입력

- 검증된 generator·static fallback
- game session controller·absolute clock
- 인간 승인 score specification
- 주입 가능한 `SprintSeedSource`; production은 Web Crypto, 테스트는 고정 seed

### 산출물

```text
src/domain/scoring/sprint-score.ts
src/domain/sprint/sprint-sequence.ts
src/domain/sprint/sprint-session.ts
src/features/sprint/*
tests/e2e/sprint.spec.ts
```

- score golden vector 표
- 180초 fake-clock·visibility·reload 리포트

## 5. 작업 순서

1. score specification을 문서와 test vector로 먼저 고정한다.
2. seed·puzzle index·성과에서 결정적 시퀀스를 만드는 순수 함수를 구현한다.
3. `endAt` 절대 시각 기반 Sprint reducer를 만든다.
4. 완료 즉시 다음 퍼즐로 전환하되 마지막 PULSE·완료가 중복되지 않게 한다.
5. reload storage와 만료 후 결과 확정을 구현한다.
6. 타이머·진행·score UI와 warning 상태를 연결한다.
7. fake clock, background, clock jump, rapid completion E2E를 작성한다.

## 6. 참조

- **불변식**: INV-006, INV-007, INV-008, INV-010, INV-011, INV-012, INV-015, INV-016, INV-018
- **ADR**: ADR-0001, ADR-0003, ADR-0007; 점수식이 제품 계약이면 신규 ADR 작성
- **기술 백서**: §1.4, §2.2.5~6, §2.3.4, §8.3
- **추적성**: FR-SPRINT-001

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — 180초 절대 종료**: 고정 clock에서 시작 후 정확히 180,000ms에 입력이 잠기고 결과가 한 번 확정된다. 179,999ms에는 아직 진행 중이다. E3. (INV-012)
- [ ] **DOD-02 — 백그라운드 비연장**: hidden 상태로 60초가 지나도 `endAt`이 변하지 않고 복귀 시 남은 시간이 즉시 보정된다. 만료 후 복귀하면 결과로 이동한다. (INV-012)
- [ ] **DOD-03 — reload 정합**: 남은 시간 중 reload하면 같은 seed·puzzle index·current session·endAt으로 복구한다. 만료 후 reload는 추가 플레이 없이 결과를 확정한다. (INV-011, INV-012)
- [ ] **DOD-04 — 퍼즐열 결정성**: 동일 seed와 완료 순서에서 puzzle ID·size·difficulty 시퀀스가 반복·브라우저와 무관하게 동일하다. E3. (INV-008)
- [ ] **DOD-05 — 난도 상승**: 승인된 progression table을 벗어난 size·difficulty가 생성되지 않고 모든 퍼즐이 validator를 통과한다. (INV-007)
- [ ] **DOD-06 — 경계 입력 단일성**: 종료 시각과 완료 PULSE가 같은 tick에 경쟁해도 퍼즐 완료·score 가산·결과 확정이 각각 최대 한 번이다. E3. (INV-010)
- [ ] **DOD-07 — 점수 재현**: 인간 승인 score fixture 전부가 기대 `score`, `solvedCount`, `sGradeCount`, tie-break 결과와 일치한다. 같은 event log는 같은 결과를 낸다.
- [ ] **DOD-08 — 최고 기록**: 나쁜 결과가 기존 best를 덮어쓰지 않고 tie-break가 문서와 일치한다. write failure에서도 현재 결과를 화면에 표시한다.
- [ ] **DOD-09 — 시간 표시**: 시각 카운트다운은 논리 clock에서 파생되고 animation frame 지연으로 시간이 늘지 않는다. 10초·5초 경고는 색 외 텍스트/형태를 가진다.
- [ ] **DOD-10 — 접근성·모바일**: 키보드만으로 Sprint 시작·플레이·결과 가능, timer update가 스크린리더를 과도하게 반복하지 않으며 360px에서 PULSE·timer·board가 겹치지 않는다. (INV-015)
- [ ] **DOD-11 — 자동 테스트**: fake-clock unit + Chromium/Firefox/WebKit E2E에서 만료·reload·visibility 시나리오 전부 통과한다.
- [ ] **DOD-12 — 문서 정합성**: 점수식·progression·reload·best 규칙을 백서 보완문, 추적표, `PROGRESS.md`에 기록한다.

## 8. 검증 명령

```bash
npm run test -- src/domain/sprint src/domain/scoring/sprint-score.ts src/features/sprint
npm run test:e2e -- tests/e2e/sprint.spec.ts
npm run test:a11y -- --grep "Sprint"
npm run verify
```

필수 fake-clock 경계:

```text
0, 1, 179999, 180000, 180001 ms
hidden 60000 ms
reload at 90000 ms
reload at 180001 ms
completion dispatch at 180000 ms
```

## 9. 수동 검증

| 환경 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 모바일 실기기 | 3분 전체 세션 | timer drift 체감·가림 없음 | 녹화 |
| background | 앱 전환 후 만료 뒤 복귀 | 즉시 결과, 시간 연장 없음 | 녹화 |
| 키보드 | start→다중 퍼즐→result | 포인터 없이 완료 | 체크표 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- sequence, timer, score, UI를 분리 커밋한다.
- scoring 회귀는 승인 golden vector 기준 구현으로 롤백한다.
- Sprint가 M10 일정의 P0/P1을 유발하면 임의 삭제하지 않고 사용자에게 범위 결정을 요청한다.

## 12. 리스크·미지수

- 구체 점수식은 원문 백서에 미정이며 반드시 사람 결정이 필요하다.
- 탭 throttling과 OS sleep 후 timer UI 보정.
- Web Crypto 미지원 환경의 seed source 폴백.
- 연속 퍼즐 전환이 스크린리더 focus를 잃게 할 가능성.

## 13. STOP 트리거

- 점수식이 승인되지 않았는데 구현을 진행해야 함.
- background/reload로 180초를 초과해 플레이 가능함.
- 경계 tick에서 중복 score 또는 완료 발생.
- Sprint 때문에 코어 reducer 불변식을 깨야 함.

## 14. 다음 phase 인계

- Sprint Result 모델과 공유 가능 필드
- 결정적 Signal Signature 입력에 사용할 정규화 event summary
- timer·score E2E fixture
- Settings의 sound/haptics가 적용될 action 이벤트
