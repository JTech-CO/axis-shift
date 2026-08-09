# M03 — Deterministic Generator & Content Pipeline ★

- **상태**: 미시작
- **담당 범위**: 결정적 PRNG, Daily 생성기, 난도, fallback, Tutorial·Lab 데이터 검증
- **최종 갱신**: 2026-08-09

## 1. 맥락과 목표

서버 없는 Daily와 54개 정적 레벨이 모두 같은 도메인 코어로 검증되도록 콘텐츠 공급망을 만든다. 생성 실패, 잘못된 Par, 날짜별 비결정성, ID 변경이 런타임에서 발견되지 않도록 빌드 전에 차단한다.

## 2. 범위

### 포함

- 문자열→시드 해시와 결정적 PRNG
- `UTC date + generatorVersion + domain string` seed 계약
- 난도·밀도·태그·중복 필터
- 제한된 시도와 결정적 fallback
- Tutorial 6개, Lab 4×12=48개 데이터
- candidate 생성·사람 큐레이션·validator
- 3,650일 Daily 감사와 golden vectors
- generator version map과 과거 재현 계약

### 제외

- Daily 화면·Archive 달력·streak
- Tutorial 안내 UI와 Lab 탐색 화면
- Sprint 시퀀스·점수
- 온라인 퍼즐 다운로드

## 3. 진입조건 (DoR)

- [ ] M02 DoD 통과.
- [ ] ADR-0003 채택, generator version 초기값 확정.
- [ ] `PuzzleDefinition` schemaVersion 1 고정.
- [ ] Tutorial 6개와 Lab 4개 챕터의 학습 목표가 백서에 정의됨.
- [ ] INV-004, INV-006~009, INV-018 확인.

## 4. 입력·산출물 계약

### 입력

- M02 domain 공개 API
- chapter: `tutorial`, `pulse`, `echo`, `rank`, `noise`
- generator-map의 날짜별 크기·난도 정책
- 사람이 승인할 패턴·난도 기준

### 산출물

```text
src/domain/generator/prng.ts
src/domain/generator/daily-generator.ts
src/domain/generator/difficulty.ts
src/domain/generator/version-registry.ts
src/content/levels/tutorial.json
src/content/levels/pulse.json
src/content/levels/echo.json
src/content/levels/rank.json
src/content/levels/noise.json
src/content/fallbacks/*.json
src/content/generator-map.json
scripts/generate-level-candidates.ts
scripts/validate-levels.ts
scripts/audit-daily-generator.ts
```

- 3,650일 감사 JSON/Markdown 리포트
- generator golden vector fixture
- 사람 큐레이션 체크 결과

## 5. 작업 순서

1. seed 문자열 정규화와 고정 해시·PRNG golden vector를 만든다.
2. generator version registry와 `v1` 계약을 작성한다.
3. rank·밀도·대칭·overlap 등 complexity feature를 계산한다.
4. 목표 프로파일을 만족하는 후보 생성과 최대 시도 수를 구현한다.
5. 실패 시 같은 seed에서 항상 같은 검증된 fallback을 선택한다.
6. Tutorial·Lab 후보를 생성하고 사람이 학습 목표·가독성·중복을 큐레이션한다.
7. 정적 JSON validator를 만들고 `optimalPulseCount`를 재계산한다.
8. 3,650개 연속 UTC 날짜를 감사하고 결과 해시를 고정한다.
9. 생성기·콘텐츠 변경이 CI에서 자동 검증되도록 연결한다.

## 6. 참조

- **불변식**: INV-004, INV-006, INV-007, INV-008, INV-009, INV-018
- **ADR**: ADR-0001, ADR-0002, ADR-0003
- **기술 백서**: §2.3.2, §4.4, §4.5, §8.1, §12
- **문서**: `docs/PUZZLE_MATH.md`, `docs/REQUIREMENTS_TRACEABILITY.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — PRNG 결정성**: 명세된 seed 20개 이상의 golden vector가 Node·Chromium·Firefox·WebKit에서 동일한 첫 100개 출력과 일치한다. E3. (INV-008)
- [ ] **DOD-02 — 정적 콘텐츠 수량**: Tutorial 정확히 6개, Lab 정확히 48개이며 chapter별 12개다. ID 중복·변경·빈 title key가 0건이다.
- [ ] **DOD-03 — 콘텐츠 유효성**: 54개 모든 퍼즐에서 schema, 보드 범위, 비자명성, 재계산 Par, canonical solution round-trip, 난도 범위가 통과한다. invalid=0. E3. (INV-004, INV-006, INV-007)
- [ ] **DOD-04 — 학습 순서**: Tutorial과 각 Lab chapter가 도입하는 개념이 앞 레벨에 없는 규칙을 설명 없이 요구하지 않는다. 사람이 체크리스트로 승인한다. E1.
- [ ] **DOD-05 — Daily 10년 감사**: 고정된 3,650개 연속 UTC 날짜에서 생성 예외=0, invalid puzzle=0, wrong Par=0, adjacent target hash duplicate=0이다. E3. (INV-007, INV-008)
- [ ] **DOD-06 — Fallback 안전성**: 강제 max-attempt fixture에서 fallback이 결정적으로 선택되고 validator를 통과한다. 정상 3,650일 감사에서 fallback 사용률과 날짜 목록을 리포트한다. 사용률이 0이 아니면 원인과 허용 근거를 사람이 승인한다.
- [ ] **DOD-07 — 날짜 결정성**: 동일 날짜·version을 10회 반복, 서로 다른 프로세스와 시간대에서 직렬화한 결과 해시가 동일하다. E3. (INV-008)
- [ ] **DOD-08 — 과거 보호**: `v1` golden 날짜 최소 20개가 version registry snapshot에 있고, 추후 default version 변경 시에도 명시적으로 `v1`을 요청하면 동일 결과를 낸다. (INV-009)
- [ ] **DOD-09 — 분포 감사**: generator-map에 정의된 size·difficulty 프로파일별 관측 분포가 목표 허용 구간 안에 있고 report에 표로 남는다. 임계치는 코드가 아니라 map과 문서 한 곳에서 관리한다.
- [ ] **DOD-10 — 재현 가능한 산출물**: 같은 commit에서 감사 재실행 시 정규화 JSON 리포트 SHA-256이 동일하다.
- [ ] **DOD-11 — 문서 정합성**: 콘텐츠 수, generatorVersion, seed 형식, fallback 정책, 감사 결과를 관련 docs와 `PROGRESS.md`에 반영한다.

## 8. 검증 명령

```bash
npm run test -- src/domain/generator
npm run generate:level-candidates -- --seed axis-shift-curation-v1
npm run validate:levels
npm run audit:daily -- --version v1 --days 3650 --start 2026-01-01
npm run test:e2e -- tests/e2e/generator-parity.spec.ts
npm run verify
```

감사 리포트 최소 필드:

```text
version, startDate, dayCount, outputHash,
exceptions, invalid, wrongPar, fallbackCount,
adjacentDuplicates, sizeDistribution, difficultyDistribution
```

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 54개 정적 퍼즐 | 타깃 문양·초기 상태·canonical 해답 검토 | 시각 중복 과다·우연한 불쾌 패턴 없음 | 큐레이션 표 |
| chapter progression | 순서대로 3~5개 샘플 플레이 | 난도 급변·미소개 개념 없음 | 관찰 메모 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- generator algorithm과 content JSON을 분리 커밋한다.
- 알고리즘 회귀 시 `v1` 구현과 golden vectors를 유지한 채 후보 변경만 롤백한다.
- 이미 공개된 ID와 generator version은 삭제·재사용하지 않는다.

## 12. 리스크·미지수

- 수학적 complexity와 인간 체감 난도가 다를 수 있다.
- 생성 조건이 과도하면 fallback이 자주 사용될 수 있다.
- 48개 큐레이션이 일정 병목이 될 수 있다.
- 패턴 해시만으로 시각적 유사성을 완전히 포착하지 못한다.

## 13. STOP 트리거

- 10년 감사에서 wrong Par 또는 invalid puzzle 1건 이상.
- 동일 seed가 환경별로 다른 결과를 생성함.
- 공개된 `v1` 결과를 변경해야 함.
- 54개 콘텐츠를 맞추기 위해 validator를 완화해야 함.
- 큐레이션 일정 때문에 기능 범위 재결정이 필요함.

## 14. 다음 phase 인계

- 검증된 `PuzzleDefinition` 데이터와 version registry
- Daily 생성 API와 date adapter 계약
- canonical solution·Par·difficulty를 포함한 fixture
- 저장·세션이 참조할 변경 불가 puzzle ID 목록
