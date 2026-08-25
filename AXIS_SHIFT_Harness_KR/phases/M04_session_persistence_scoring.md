# M04 — Session, Persistence, Clock & Scoring ★

- **상태**: 완료 — DoR 5/5, DOD-01~13 통과
- **담당 범위**: 게임 세션 reducer, Undo·Reset·Hint, 일반 타이머, 등급, LocalStorage·마이그레이션
- **최종 갱신**: 2026-08-26

## 1. 맥락과 목표

검증된 퍼즐을 실제 플레이 가능한 상태 머신으로 바꾸고, 새로고침·탭 전환·손상 저장에서도 기록이 정확하게 유지되도록 한다. 논리 상태는 애니메이션과 분리하고, 한 입력이 한 PULSE·한 완료 기록만 만드는 원자성을 증명한다.

## 2. 범위

### 포함

- `GameSession` 상태와 순수 reducer
- 행·열 선택, PULSE, Undo, Reset, 완료 확정
- Hint 1~3과 canonical solution 사용
- Lab·Daily 활성 시간 계산용 clock port
- S/A/B/C 등급과 best record 병합
- issued ledger 기반 고유 ID service
- settings/progress/session storage adapter
- schemaVersion 1 guard, 격리, 복구, migration framework
- 저장 실패·quota·미래 버전 처리

### 제외

- React 게임 컴포넌트와 시각 애니메이션
- Sprint 180초 시퀀스·점수
- Daily streak·Archive UI
- 공유 카드·service worker

## 3. 진입조건 (DoR)

- [x] M03 DoD 통과.
- [x] `GameSession`, `PuzzleBestRecord`, `UserSettings`, `PersistedAppState` v1 계약 확인.
- [x] 등급 조건 S/A/B/C와 Hint 제한이 기술 백서와 일치.
- [x] 저장 키 4종과 미래 버전 격리 정책 확정.
- [x] INV-005, INV-006, INV-010~012, INV-018 확인.

### 3.1. M04 v1 계약 동결

- `PulseMove.actionId`는 JSON에 보존하며 `acceptedPulseActionIds`는 attempt 수명 동안 줄지 않는 수락 ledger다. Undo가 `moves`에서 마지막 이동을 제거해도 ledger ID는 남으므로 같은 UI token의 replay는 다시 적용되지 않는다. `PULSE_COMMIT` 한 번이 보드·이동·완료 event를 원자적으로 확정하고 `pulsing`은 시각 잠금만 나타낸다.
- `GameSession`은 최초 시작 시각과 별도로 `activeSinceEpochMs`, `lastObservedEpochMs`를 가진다. `TIMER_TICK`은 활성 상태의 관측 high-water만 앞으로 이동시키며 clock 역행은 무시한다. hidden·pause·완료·저장 정규화는 열린 활성 구간을 정확히 한 번 누적한다.
- Reset은 기존 완료 기록을 건드리지 않고 action으로 받은 새 `sessionId`의 새 attempt를 만든다. `createUniqueIdGenerator()`는 seed·`reserveId()`·유효성 검사·중복 재시도·attempt limit을 가진 issued ledger service를 제공한다. Reset ID가 앱·저장 수명 동안 재사용되지 않게 하는 것은 호출자 계약이며, M06가 이 service를 singleton·crypto-backed source로 앱에 연결한다. 완료 event ID는 session ID에서 결정적으로 파생한다.
- Hint 1은 현재 rank, Hint 2는 같은 canonical 다음 PULSE의 `rowMask`, Hint 3은 그 PULSE 전체다. 기본 pulse 등급을 먼저 계산한 뒤 Hint 2는 최고 A, Hint 3은 최고 B로 제한하며 나쁜 등급을 올리지 않는다.
- 완료 event는 `projectCompletionRecord()`만 런타임 전용 opaque record candidate로 투영할 수 있다. projection이 puzzle ID·event ID·Par·힌트 cap·UTC formatter를 검증하고, module-private `WeakSet` provenance와 private brand를 모두 통과한 candidate만 merge한다. reflective symbol 복사본을 포함한 위조 plain object는 거부한다.
- best record는 `S>A>B>C → pulse 오름차순 → active elapsed 오름차순` 단일 tuple을 비교한다. 완전 동률은 기존 best를 유지하고, 첫 완료 시각은 고정하며 마지막 완료 시각은 `max(기존, 후보)`로만 전진한다.
- 네 primary key는 백서 이름을 그대로 쓴다. settings·progress·session·generator-map은 별도 schema v1 root이고, `PersistedAppState`는 progress와 session을 합친 런타임 view이며 독립 저장 root가 아니다.
- 시작 전 Hint·visibility 상태는 hint level을 보존한 canonical `ready` snapshot과 null clock으로 정규화한다. 시작된 미해결 세션은 저장 시 열린 구간을 `lastObservedEpochMs`까지 한 번 합산한 `paused` snapshot으로 정규화하며 `activeSinceEpochMs=null`, `hiddenAtEpochMs=lastObservedEpochMs`를 강제한다. accepted ledger의 정확한 크기는 `moves.length + undoCount`다. 논리 적용된 `pulsing`도 같은 방식으로 보존하고 solved 세션은 resumable root에서 제거한다.
- 손상·미래 버전 raw 값은 `axis-shift:quarantine:v1:<key-kind>:<reason>:<id>`에 원문 백업이 성공한 뒤에만 primary key에서 제거한다. 기존 quarantine key는 최대 128회 collision 탐색으로 절대 덮어쓰지 않으며, 사용 가능한 ID를 찾지 못하면 primary raw를 보존한다. progress 부분 복구는 격리·제거 성공 뒤 salvage한 유효 record를 primary root에 다시 저장해 다음 repository 수명에도 유지한다. 백업 실패 시 원키를 보존하고 메모리 기본값으로 계속한다. 경고는 repository 인스턴스에서 `keyKind+code`당 한 번이다. 공개된 과거 schema가 아직 없으므로 임의 v0 migration은 만들지 않고 순차 migration registry만 둔다.
- 저장 guard는 canonical UTC의 연도를 `1..9999`로 제한하고, `labRecords`를 null-prototype map으로 재구성해 `__proto__` 같은 합법 ID도 prototype을 변경하지 못하게 한다. generator-map payload는 `schemaVersion`, `defaultVersion`, UTC `schedule`만 가진 runtime snapshot으로 한정하며 전체 생성 정책과 알고리즘 기준은 계속 검증된 정적 M03 content다.
- Sprint 180초 절대 타이머·총점·동점 규칙은 M08 범위이며 M04에서 추정하지 않는다.

### 3.2. reducer action·전이 표

| Action | 허용 시작 상태 | 결과 |
|---|---|---|
| `TOGGLE_ROW`, `TOGGLE_COL` | `ready`, `selecting` | 첫 선택에서 일반 타이머를 시작하고 `selecting` 유지 |
| `TIMER_TICK` | 시작된 `selecting`, `pulsing` | `lastObservedEpochMs` high-water만 전진 |
| `PULSE_COMMIT` | 두 축이 선택된 `selecting` | unseen `actionId`를 ledger에 추가하고 보드·move·완료 event를 원자 확정한 뒤 `pulsing` |
| `PULSE_ANIMATION_FINISHED` | 마지막 move ID와 일치하는 `pulsing` | 미해결은 `selecting`, 해결은 `solved` |
| `UNDO` | move가 있는 `selecting` | 마지막 PULSE를 XOR 역산하되 action ledger는 보존 |
| `RESET_CONFIRMED` | `pulsing` 외 | 수명 내 고유한 새 `sessionId`의 `ready` attempt |
| `USE_HINT` | `ready`, `selecting` | 더 높은 hint level만 기록 |
| `VISIBILITY_CHANGED` | visible `ready/selecting/pulsing`, 또는 `paused` | hidden이면 `paused`, visible 복귀면 `ready/selecting/solved` |
| `SESSION_ERROR`, `SESSION_RECOVER` | 각각 `ready`, `error` | `error`, `ready` |

허용 조건을 벗어난 action, 잘못된 index·시각·ID, 이미 수락한 `actionId`는 같은 state 참조를 반환한다.

## 4. 입력·산출물 계약

### 입력

- 검증된 `PuzzleDefinition`과 canonical factorization
- 주입 가능한 `Clock`, `StoragePort`와 issued ledger 기반 `IdGenerator`
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
src/services/id/id-generator.ts
src/services/id/index.ts
src/services/storage/schema.ts
src/services/storage/migrations.ts
src/services/storage/local-storage-adapter.ts
src/services/storage/repository.ts
src/test/fixtures/storage/*.json
scripts/clean-build-output.ts
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
7. seed·reserve·retry를 가진 수명 고유 ID service를 만든다.
8. 저장 스키마 guard·serializer·repository를 만든다.
9. 정상·빈 값·손상·미래 버전·부분 누락 fixture를 검사한다.
10. `error` 외 논리 세션을 저장하되 시작 전 상태는 canonical `ready`, 시작된 미해결 attempt는 열린 활성 구간을 한 번 닫은 `paused` snapshot으로 정규화하고 round-trip을 검증한다.

## 6. 참조

- **불변식**: INV-004~006, INV-010, INV-011, INV-012, INV-018
- **ADR**: ADR-0001, ADR-0002, ADR-0007
- **기술 백서**: §2.1.4, §2.2.3~5, §2.3.3~5, §4.1~2, §4.6, §8.1
- **문서**: `docs/PUZZLE_MATH.md`, `docs/FILE_TREE.md`

## 7. DoD — 완료 게이트

- [x] **DOD-01 — 상태 전이**: 명세된 `ready → selecting → pulsing → selecting/solved`, pause, error 전이만 허용되고 잘못된 action은 상태를 손상시키지 않는다. E3.
- [x] **DOD-02 — 원자적 PULSE**: 한 `PULSE_COMMIT` action은 보드 반전과 `PulseMove` 1건을 같은 reducer 결과로 만든다. attempt 수명 ledger가 Undo 뒤 replay까지 차단한다. E3. (INV-005, INV-010)
- [x] **DOD-03 — 완료 단일성**: 해결 경계에서 결정적 완료 event·timestamp가 attempt당 한 번 확정되고 `projectCompletionRecord()`만 opaque record candidate를 만든다. rapid dispatch·projection·merge replay에서 중복 효과 0건. (INV-010)
- [x] **DOD-04 — Undo·Reset·ID**: Undo는 직전 펄스를 정확히 역산하고 move·pulse count를 복원한다. `IdGenerator`의 issued ledger·seed·reserve·invalid/duplicate retry·exhaustion을 검증했고, Reset은 호출자가 공급한 새 `sessionId`로 initial state를 만들면서 별도 progress root의 Daily best를 보존한다. 앱 singleton·crypto source 연결은 M06 범위다.
- [x] **DOD-05 — Hint 정합성**: Hint 1은 남은 rank, Hint 2·3은 같은 canonical 분해의 다음 펄스에서 파생되며 적용하면 남은 rank가 정확히 1 감소한다. E3. (INV-006)
- [x] **DOD-06 — 등급 경계**: S/A/B/C, Hint 2·3 제한, Undo 비감점, `WeakSet` provenance를 가진 opaque completion projection과 best record 병합이 경계 fixture 전부와 일치한다.
- [x] **DOD-07 — 일반 타이머**: 첫 축 선택 전 시간은 0, `TIMER_TICK` high-water와 visibility pause로 hidden 구간을 제외하고 clock 역행·재개·저장 정규화에서도 음수나 중복 누적이 없다. E3. (INV-012)
- [x] **DOD-08 — 저장 round-trip**: 정상 settings/progress/session을 쓰고 다시 읽으면 정규화된 객체가 깊은 동등이다. 시작 전 Hint·visibility는 canonical `ready`, 시작된 미해결 세션은 open segment를 한 번 합산한 `paused` snapshot이 되며 `hiddenAtEpochMs === lastObservedEpochMs`다. candidate provenance는 비직렬화 `WeakSet` side channel이고 저장 JSON에 포함되지 않는다.
- [x] **DOD-09 — 손상 복구**: invalid JSON, 부분 v1, 필드·ledger·clock·UTC 범위 오류, 미래 schemaVersion에서 앱이 throw하지 않는다. 기존 quarantine key는 최대 128회 collision 탐색에서도 덮어쓰지 않고 고갈 시 primary raw를 보존한다. raw backup·primary 제거 성공 뒤 progress의 유효 best record를 repaired primary로 다시 저장한다. E3. (INV-011)
- [x] **DOD-10 — 저장 실패**: quota 또는 write exception에서 현재 메모리 게임은 계속되고 repository 인스턴스의 같은 `keyKind+code` 경고 이벤트는 한 번만 발생한다.
- [x] **DOD-11 — 경계 준수**: domain reducer는 LocalStorage·Date·React를 import하지 않고 clock·storage adapter를 경계 밖에서 주입받는다. (INV-003)
- [x] **DOD-12 — 테스트 무결성**: M04 핵심 구현 11개 파일 모두 per-file branch gate 95%를 통과했고 최저치는 `best-record.ts` 95.45%다. global coverage 임계치를 낮추지 않았으며 skip/only는 0건이다. (INV-018)
- [x] **DOD-13 — 문서 정합성**: action, timer, 저장 root·schema·migration·격리, grade·best 비교 규칙을 백서·파일 트리·추적표·`PROGRESS.md`와 동기화했다.

## 8. 검증 명령

```bash
npm run test -- src/domain/session src/domain/scoring src/services/storage src/services/clock src/services/id
npm run test:coverage:m04
npm run test:coverage
npm run test:storage:migrations
npm run typecheck
npm run check:boundaries
npm run verify
```

migration matrix 최소 fixture:

```text
missing | empty | valid-v1 | invalid-json | invalid-fields |
future-version | write-failure | resumable-solved | resumable-pulsing | partial-v1
```

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| Dev storage inspector | 정상/손상 fixture 주입 후 앱 초기화 | throw 없이 복구·경고 | M06 화면 통합에서 실행 |
| 탭 전환 | 일반 퍼즐 시작 → hidden → 복귀 | hidden 시간이 기록에 미포함 | M06 visibility 연결에서 실행 |

M04는 React·브라우저 feature 연결을 범위에서 제외하므로 위 수동 UI 절차를 통과했다고 주장하지 않는다. 동일 계약은 fake-clock reducer와 storage fault-injection E3로 닫았고 실제 화면 reload·visibility는 M06 DOD-07에서 재검증한다.

## 10. 증거

```text
status: COMPLETE; DOD-01~13 PASS
focused M04 unit: files=12 tests=92 failures=0
storage migrations: tests=3 failures=0
M04 aggregate coverage: statements=98.90% branches=98.79% functions=100% lines=98.95%

lint=pass formatCheck=pass typecheck=pass boundaries=pass
per-file branch gate: implementations=11/11 minimum=95.45% best-record selectors=95.65% repository=97.67%
global unit/coverage: files=23 tests=147 failures=0 statements=93.06% branches=91.81% functions=97.61% lines=94.31%
verify: scriptContract=19/19 steps=10/10 failures=0; unit=23/147 boundaries=67/112/0/0 levels=54/0 daily=3650/0 secrets=234/0 builds=2/2
fixtures=10: missing empty valid-v1 invalid-json invalid-fields future-version write-failure resumable-solved resumable-pulsing partial-v1
```

- reducer 검증은 잘못된 action no-op, PULSE 100회 replay, Undo 뒤 같은 ID 차단, 3~8 보드 역산, `TIMER_TICK` 역행·high-water, hidden 반복·solved resume를 포함한다.
- scoring 검증은 base grade·Hint cap, reflective symbol 복사본까지 막는 `WeakSet` provenance, canonical UTC year `1..9999`, completion projection replay와 `grade → pulse → active elapsed` tuple, first/last timestamp를 포함한다.
- storage 검증은 네 v1 root, pre-start canonical `ready`, exact ledger cardinality·board replay, paused clock equality, null-prototype Lab map, open segment 1회 합산, pulsing→paused·solved 제거, quarantine backup-before-delete·128회 collision 탐색·고갈 시 primary 보존, 성공 뒤 progress salvage primary 재저장과 `keyKind+code` 경고 dedupe를 포함한다.
- canonical app build는 기존 `dist`가 있을 때 발생한 Vite 8 Windows native cleanup crash를 피하려 `scripts/clean-build-output.ts`로 검증된 `dist`만 먼저 지우고 `vite build --emptyOutDir=false`를 실행한다.
- Vitest 4의 기본 15개 fork가 Windows에서 worker startup timeout을 일으킨 최초 verify를 재현해 공통 runner를 `pool=threads`, `maxWorkers=4`, `testTimeout=30_000`으로 제한했다. 같은 설정의 전체 unit 23/147과 최종 verify 10/10이 통과했다.
- 최종 사용자 화면의 singleton·crypto-backed ID source, visible resume, Result·Lab record 저장과 reload E2E는 M05·M06 인계 범위다.

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

- M05가 소비할 action·selector와 `ready/selecting/pulsing/paused/solved/error` 상태 fixture
- M06 controller가 `IdGenerator`를 앱 singleton·crypto-backed source로 연결하고 hydrated ID를 seed/reserve하며 `TIMER_TICK`·Page Visibility를 dispatch하는 계약
- M06가 hydrate된 `paused` snapshot을 현재 주입 시각으로 resume하고 completion event를 opaque candidate로 한 번 투영해 Lab best를 저장하는 흐름
- M07이 같은 repository로 Daily record를 연결하되 UTC 날짜·streak·Archive·puzzle/date/version 일치 검증을 추가하는 경계
- Sprint 절대 종료·점수·동점 규칙은 계속 M08 범위
