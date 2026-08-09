# M07 — Daily Signal, Archive & Streak ★

- **상태**: 미시작
- **담당 범위**: 오늘의 Daily, UTC 날짜, Archive 재생성, 로컬 완료·streak
- **최종 갱신**: 2026-08-09

## 1. 맥락과 목표

서버 없이 모든 사용자가 같은 날짜에 같은 퍼즐을 받게 하고, 이미 공개된 Daily가 생성기 변경 뒤에도 재현되도록 한다. 기기 로컬 기록만 사용한다는 한계를 정직하게 유지하면서 날짜 경계·직접 링크·오프라인을 안전하게 처리한다.

## 2. 범위

### 포함

- `/#/daily`, `/#/daily/:yyyy-mm-dd`, `/#/archive`
- UTC date adapter와 오늘/과거/미래 검증
- generator version map 조회·Daily 생성
- 날짜별 record, sharedCount, local streak
- 홈의 오늘 상태·continue·완료 CTA
- Archive 달력/목록과 과거 퍼즐 재플레이
- 날짜 경계·시간대·version regression E2E

### 제외

- 글로벌 streak·계정·치트 방지
- 서버 시간 검증
- 공유 payload·PNG 구현
- service worker 오프라인 설치 검증

## 3. 진입조건 (DoR)

- [ ] M06 DoD 통과.
- [ ] M03 `v1` generator·version registry·10년 감사 통과.
- [ ] Daily record와 storage repository가 M04에서 검증됨.
- [ ] 공개 시작일 또는 Archive 표시 하한 정책이 사용자 결정으로 고정됨.
- [ ] INV-008~012, INV-014~018 확인.

## 4. 입력·산출물 계약

### 입력

- `generateDaily(dateUtc, generatorVersion)`
- generator version map
- `DailyRecord`와 game session controller
- 주입 가능한 UTC clock

### 산출물

```text
src/features/daily/*
src/features/archive/*
src/services/clock/utc-date.ts
tests/e2e/daily.spec.ts
tests/e2e/archive.spec.ts
tests/e2e/timezone.spec.ts
```

- 날짜·version golden route fixture
- streak 계산 truth table

## 5. 작업 순서

1. UTC date parse·format·today 비교를 순수 함수로 만든다.
2. 오늘 Daily route와 날짜 직접 route를 generator에 연결한다.
3. solve·resume·result를 Daily record repository와 연결한다.
4. 연속 날짜 완료만 계산하는 local streak 함수를 구현한다.
5. Archive에 허용 날짜와 완료·등급 상태를 표시한다.
6. 과거 날짜가 해당 version으로 재생성되는지 regression test를 만든다.
7. UTC 자정 전후, 여러 browser timezone, 잘못된 날짜·미래 날짜를 E2E로 검사한다.

## 6. 참조

- **불변식**: INV-008, INV-009, INV-010, INV-011, INV-012, INV-014, INV-016, INV-017, INV-018
- **ADR**: ADR-0003, ADR-0004, ADR-0007
- **기술 백서**: §1.3, §2.1.2, §2.2.5~7, §4.4, §4.6, §4.8
- **문서**: `docs/PUZZLE_MATH.md`, `docs/ENVIRONMENT.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — 오늘 결정성**: 동일 UTC instant와 generator map에서 ko/en, reload, browser timezone과 무관하게 동일 puzzle ID·직렬화 해시를 얻는다. E3. (INV-008)
- [ ] **DOD-02 — 날짜 파싱**: strict `YYYY-MM-DD`만 허용하고 존재하지 않는 날짜·미래 날짜·지원 하한 이전 날짜는 설명과 복구 CTA를 가진 오류 화면으로 처리한다.
- [ ] **DOD-03 — 날짜 경계**: UTC 23:59:59.999와 다음날 00:00:00.000에서 puzzle ID가 정확히 한 번 전환되고 진행 중 세션을 강제 교체하지 않는다. 새 진입부터 새 날짜를 사용한다.
- [ ] **DOD-04 — 과거 version 보호**: golden 날짜 최소 20개가 default version 변경 simulation 뒤에도 기존 version 결과와 일치한다. E3. (INV-009)
- [ ] **DOD-05 — 완료 단일성**: 같은 날짜를 여러 번 완료·새로고침·뒤로가기로 재진입해도 firstCompletedAt과 완료 횟수가 중복 생성되지 않는다. sharedCount는 실제 공유 성공 phase에서만 변경하도록 아직 0 또는 기존 값을 유지한다. (INV-010)
- [ ] **DOD-06 — Resume**: 오늘·Archive의 미완료 세션을 재개하되 puzzle ID·date·generatorVersion이 모두 일치할 때만 복구한다. 불일치 세션은 격리한다. (INV-011)
- [ ] **DOD-07 — Streak truth table**: 빈 기록, 단일 날짜, 연속, gap, 미래 record 무시, UTC 경계 fixture가 기대값과 일치한다. 로컬 기록임을 UI에서 명시한다.
- [ ] **DOD-08 — Archive**: 허용된 과거 날짜를 선택해 생성·플레이·저장할 수 있고 오늘 완료 기록과 같은 key를 사용한다. 미래 선택 불가.
- [ ] **DOD-09 — 시간대 매트릭스**: `UTC`, `Asia/Seoul`, `America/Los_Angeles`, `Pacific/Kiritimati` Playwright context에서 고정 UTC instant의 puzzle hash가 동일하다. E3. (INV-008)
- [ ] **DOD-10 — 네트워크 독립**: Daily 생성·Archive 조회 중 게임 데이터 network request=0. (INV-017)
- [ ] **DOD-11 — 접근성·모바일**: Archive 날짜 컨트롤이 키보드·스크린리더로 사용 가능하고 360px에서 overflow=0. (INV-015)
- [ ] **DOD-12 — 문서 정합성**: start date, UTC 정책, version map, streak 한계를 About·docs·추적표·`PROGRESS.md`에 반영한다.

## 8. 검증 명령

```bash
npm run audit:daily -- --version v1 --days 3650 --start 2026-01-01
npm run test -- src/features/daily src/features/archive src/services/clock
npm run test:e2e -- tests/e2e/daily.spec.ts tests/e2e/archive.spec.ts tests/e2e/timezone.spec.ts
npm run test:a11y -- --grep "Daily|Archive"
npm run verify
```

## 9. 수동 검증

| 환경 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 기기 시간대 2종 | 같은 UTC instant로 Daily 진입 | 동일 ID·패턴 | 캡처/해시 |
| UTC 자정 simulation | 진행 중/새 진입 비교 | 진행 세션 보존, 새 진입만 날짜 전환 | 영상 |
| Archive 모바일 | 여러 날짜 탐색·완료 | 가로 scroll·focus 손실 없음 | 체크표 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- version registry와 UI 변경을 분리한다.
- 날짜 표시 오류는 generation contract를 바꾸지 않고 adapter·format layer만 롤백한다.
- 공개된 version 결과는 롤백 대신 구현 보존 또는 frozen fallback으로 유지한다.

## 12. 리스크·미지수

- 오프라인 기기 시계 조작은 서버 없이 방지할 수 없다.
- 공개 시작일 이전 Archive 정책 미결.
- UTC 날짜와 사용자의 현지 “오늘” 기대 차이.
- 로컬 streak가 브라우저 데이터 삭제로 사라짐.

## 13. STOP 트리거

- 동일 UTC 입력이 브라우저·timezone별 다른 퍼즐을 만듦.
- 이미 고정한 golden 날짜 결과 변경 필요.
- 날짜 경계에서 진행 기록 손실 또는 중복 완료 발생.
- 서버 시간 도입 없이는 요구를 충족할 수 있다는 잘못된 전제가 나타남.

## 14. 다음 phase 인계

- 안정된 UTC date·Daily route·record API
- 결과 카드가 사용할 date, puzzle ID, grade, streak 파생 데이터
- Archive·Daily E2E fixture
- Sprint와 공유에서 재사용할 홈 상태·ResultPanel 연계
