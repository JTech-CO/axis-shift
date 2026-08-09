# M04 — Session, Persistence, Clock & Scoring ★

- **상태**: 미시작
- **담당 범위**: 게임 세션 reducer, Undo·Reset·Hint, 일반 타이머, 등급, LocalStorage·마이그레이션
- **최종 갱신**: 2026-08-09

## 1. 맥락과 목표

검증된 퍼즐을 실제 플레이 가능한 상태 머신으로 바꾸고, 새로고침·탭 전환·손상 저장에서도 기록이 정확하게 유지되도록 한다. 논리 상태는 애니메이션과 분리하고, 한 입력이 한 PULSE·한 완료 기록만 만드는 원자성을 증명한다.

## 2. 범위

### 포함

- `GameSession` 상태와 순수 reducer
- 행·열 선택, PULSE, Undo, Reset, 완료 확정
- Hint 1~3과 canonical solution 사용
- Lab·Daily 활성 시간 계산용 clock port
- S/A/B/C 등급과 best record 병합
- settings/progress/session storage adapter
- schemaVersion 1 guard, 격리, 복구, migration framework
- 저장 실패·quota·미래 버전 처리

### 제외

- React 게임 컴포넌트와 시각 애니메이션
- Sprint 180초 시퀀스·점수
- Daily streak·Archive UI
- 공유 카드·service worker

## 3. 진입조건 (DoR)

- [ ] M03 DoD 통과.
- [ ] `GameSession`, `PuzzleBestRecord`, `UserSettings`, `PersistedAppState` v1 계약 확인.
- [ ] 등급 조건 S/A/B/C와 Hint 제한이 기술 백서와 일치.
- [ ] 저장 키 4종과 미래 버전 격리 정책 확정.
- [ ] INV-005, INV-006, INV-010~012, INV-018 확인.

## 4. 입력·산출물 계약

### 입력

- 검증된 `PuzzleDefinition`과 canonical factorization
- 주입 가능한 `Clock`, `IdGenerator`, `StoragePort`
- 저장 키:
  - `axis-shift:settings:v1`
  - `axis-shift:progress:v1`
  - `axis-shift:session:v1`
  - `axis-shift:generator-map:v1`

### 산출물

```text
src/domain/session/session.ts
src/domain/session/session-reducer.ts
src/domain/session/session-selectors.ts
src/domain/scoring/grade.ts
src/domain/scoring/best-record.ts
src/services/clock/clock.ts
src/services/storage/schema.ts
src/services/storage/migrations.ts
src/services/storage/local-storage-adapter.ts
src/services/storage/repository.ts
src/test/fixtures/storage/*.json
```

- reducer action 표와 상태 전이 테스트
- migration matrix와 손상 복구 리포트

## 5. 작업 순서

1. 상태·action·허용 전이를 표와 테스트로 정의한다.
2. 선택·PULSE·Undo·Reset을 순수 reducer로 구현한다.
3. 완료 이벤트를 edge transition으로 한 번만 생성한다.
4. Hint 1~3을 canonical 분해에서 파생하고 등급 제한을 구현한다.
5. 일반 모드의 active elapsed time을 clock port로 구현한다.
6. best record 비교 규칙을 순수 함수로 만든다.
7. 저장 스키마 guard·serializer·repository를 만든다.
8. 정상·빈 값·손상·미래 버전·부분 누락 fixture를 검사한다.
9. 안정 상태에서만 resumable session을 저장하고 새로고침 round-trip을 검증한다.

## 6. 참조

- **불변식**: INV-004~006, INV-010, INV-011, INV-012, INV-018
- **ADR**: ADR-0001, ADR-0002, ADR-0007
- **기술 백서**: §2.1.4, §2.2.3~5, §2.3.3~5, §4.1~2, §4.6, §8.1
- **문서**: `docs/PUZZLE_MATH.md`, `docs/FILE_TREE.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — 상태 전이**: 명세된 `ready → selecting → pulsing → selecting/solved`, pause, error 전이만 허용되고 잘못된 action은 상태를 손상시키지 않는다. E3.
- [ ] **DOD-02 — 원자적 PULSE**: 한 `PULSE_COMMIT` action은 보드 반전과 `PulseMove` 1건을 같은 reducer 결과로 만든다. 같은 UI token/action id 재전송은 중복 적용되지 않는다. E3. (INV-005, INV-010)
- [ ] **DOD-03 — 완료 단일성**: 해결 경계에서 완료 event·timestamp·record candidate가 세션당 정확히 한 번만 생성된다. rapid dispatch와 replay에서 중복 0건. (INV-010)
- [ ] **DOD-04 — Undo·Reset**: Undo는 직전 펄스를 정확히 역산하고 move·pulse count를 복원한다. Reset은 initial state로 돌아가되 이미 확정된 Daily best record를 지우지 않는다.
- [ ] **DOD-05 — Hint 정합성**: Hint 1은 남은 rank, Hint 2·3은 같은 canonical 분해의 다음 펄스에서 파생되며 적용하면 남은 rank가 정확히 1 감소한다. E3. (INV-006)
- [ ] **DOD-06 — 등급 경계**: S/A/B/C, Hint 2·3 제한, Undo 비감점, best record 병합이 경계 fixture 전부와 일치한다.
- [ ] **DOD-07 — 일반 타이머**: 첫 축 선택 전 시간은 0, visibility hidden 구간은 Lab·Daily active time에서 제외되고 clock 역행·재개에서도 음수나 중복 누적이 없다. E3. (INV-012)
- [ ] **DOD-08 — 저장 round-trip**: 정상 settings/progress/session을 쓰고 다시 읽으면 정규화된 객체가 깊은 동등이다. JSON serialization에 런타임 전용 객체가 없다.
- [ ] **DOD-09 — 손상 복구**: invalid JSON, 필드 누락, 범위 오류, 미래 schemaVersion에서 앱이 throw하지 않고 해당 키를 격리·기본값 복구한다. 기존 유효 best record는 가능한 범위에서 보존한다. E3. (INV-011)
- [ ] **DOD-10 — 저장 실패**: quota 또는 write exception에서 현재 메모리 게임은 계속되고 동일 세션에 경고 이벤트가 한 번만 발생한다.
- [ ] **DOD-11 — 경계 준수**: domain reducer는 LocalStorage·Date·React를 import하지 않고 service adapter를 주입받는다. (INV-003)
- [ ] **DOD-12 — 테스트 무결성**: reducer·grade·storage 핵심 모듈의 branches 95% 이상, 나머지 coverage 임계치는 기존보다 낮추지 않는다. skip/only 0건. (INV-018)
- [ ] **DOD-13 — 문서 정합성**: action, 저장 키, schema, migration, best 비교 규칙이 백서·추적표·`PROGRESS.md`와 일치한다.

## 8. 검증 명령

```bash
npm run test -- src/domain/session src/domain/scoring src/services/storage src/services/clock
npm run test:coverage
npm run test:storage:migrations
npm run typecheck
npm run check:boundaries
npm run verify
```

migration matrix 최소 fixture:

```text
missing | empty | valid-v1 | invalid-json | invalid-fields |
future-version | write-failure | resumable-solved | resumable-pulsing
```

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| Dev storage inspector | 정상/손상 fixture 주입 후 앱 초기화 | throw 없이 복구·경고 | 캡처·로그 |
| 탭 전환 | 일반 퍼즐 시작 → hidden → 복귀 | hidden 시간이 기록에 미포함 | 타임라인 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- reducer, scoring, storage를 별도 커밋으로 유지한다.
- migration 오류 시 신규 write를 중단하고 마지막 검증 schema reader로 롤백한다.
- 이미 사용자 데이터에 기록된 schema를 변경할 때 down migration보다 forward repair를 우선한다.

## 12. 리스크·미지수

- 애니메이션 종료와 논리 commit을 결합하면 중복·저장 타이밍 오류가 생긴다.
- 브라우저 storage event·private mode 차이.
- best record의 여러 기준(등급·펄스·시간) 비교 우선순위가 UI 기대와 다를 수 있다.

## 13. STOP 트리거

- 완료 이벤트 또는 PULSE가 중복되는 fixture 1건 이상.
- 손상 저장 복구가 유효 기록을 무조건 삭제함.
- schema 변경이 v1 계약과 비호환.
- Date/LocalStorage 의존을 domain 안에 넣어야만 테스트 가능해 보임.

## 14. 다음 phase 인계

- UI가 dispatch할 action과 selector 계약
- game 상태별 fixture(`ready`, `selecting`, `pulsing`, `solved`, `error`)
- 저장 repository와 clock adapter 인터페이스
- 등급·Hint·ResultPanel 표시용 파생 데이터
