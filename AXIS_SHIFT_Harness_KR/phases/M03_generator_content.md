# M03 — Deterministic Generator & Content Pipeline ★

- **상태**: 완료 — DOD-01~11 통과, candidate exact-SHA 감사 2회 일치
- **담당 범위**: 결정적 PRNG, Daily 생성기, 난도, fallback, Tutorial·Lab 데이터 검증
- **최종 갱신**: 2026-08-26

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

- [x] M02 DoD 통과.
- [x] ADR-0003 채택, generator version 초기값 `v1` 확정.
- [x] `PuzzleDefinition` schemaVersion 1 고정.
- [x] Tutorial 6개와 Lab 4개 챕터의 학습 목표가 백서에 정의됨.
- [x] INV-004, INV-006~009, INV-018 확인.

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

- [x] **DOD-01 — PRNG 결정성**: 명세된 seed 20개 이상의 golden vector가 Node·Chromium·Firefox·WebKit에서 동일한 첫 100개 출력과 일치한다. E3. (INV-008)
- [x] **DOD-02 — 정적 콘텐츠 수량**: Tutorial 정확히 6개, Lab 정확히 48개이며 chapter별 12개다. ID 중복·변경·빈 title key가 0건이다.
- [x] **DOD-03 — 콘텐츠 유효성**: 54개 모든 퍼즐에서 schema, 보드 범위, 비자명성, 재계산 Par, canonical solution round-trip, 난도 범위가 통과한다. invalid=0. E3. (INV-004, INV-006, INV-007)
- [x] **DOD-04 — 학습 순서**: 프로젝트 오너가 2026-08-26 Tutorial 6 + Lab 48의 54개 패턴과 progression 5행을 체크리스트에서 전체 승인했다. E1.
- [x] **DOD-05 — Daily 10년 감사**: 고정된 3,650개 연속 UTC 날짜에서 생성 예외=0, invalid puzzle=0, wrong Par=0, adjacent target hash duplicate=0이다. E3. (INV-007, INV-008)
- [x] **DOD-06 — Fallback 안전성**: 강제 max-attempt fixture에서 fallback이 결정적으로 선택되고 validator를 통과한다. 정상 3,650일 감사에서 fallback 사용률과 날짜 목록을 리포트한다. 사용률이 0이 아니면 원인과 허용 근거를 사람이 승인한다.
- [x] **DOD-07 — 날짜 결정성**: UTC·Asia/Seoul·America/Los_Angeles 시간대별 프로세스 3개에서 각각 동일 날짜·version을 10회 반복하고, 직렬화한 결과 해시가 동일하다. E3. (INV-008)
- [x] **DOD-08 — 과거 보호**: `v1` golden 날짜 최소 20개가 version registry snapshot에 있고, 추후 default version 변경 시에도 명시적으로 `v1`을 요청하면 동일 결과를 낸다. (INV-009)
- [x] **DOD-09 — 분포 감사**: generator-map에 정의된 size·difficulty 프로파일별 관측 분포가 목표 허용 구간 안에 있고 report에 표로 남는다. 임계치는 코드가 아니라 map과 문서 한 곳에서 관리한다.
- [x] **DOD-10 — 재현 가능한 산출물**: candidate commit `1c313bd29e1d24c483749af90a8734542988be5d`의 clean detached worktree에서 감사를 서로 다른 출력 디렉터리에 2회 재실행했고, 정규화 JSON·report SHA-256 `b1102aee…6d49`가 일치했다.
- [x] **DOD-11 — 문서 정합성**: 콘텐츠 수, generatorVersion, seed 형식, fallback 정책, 감사 결과를 관련 docs와 `PROGRESS.md`에 반영한다.

## 8. 검증 명령

```bash
npm run test -- src/domain/generator
npm run generate:level-candidates -- --seed axis-shift-curation-v1
npm run validate:levels
npm run audit:daily -- --version v1 --days 3650 --start 2026-01-01
npm run test:e2e -- tests/e2e/generator-parity.spec.ts
npm run verify
```
기본 `generate:level-candidates`는 full manifest, 순서가 있는 catalog, human 판정 필드를 `PENDING`으로 정규화한 machine scaffold를 묶은 approval fingerprint가 정확히 일치할 때만 기존 승인 evidence를 byte-preserve하고 `curation=preserved`를 출력한다. catalog·manifest·machine scaffold가 바뀌면 stale 승인을 보존하지 않고 `PENDING` template로 재생성한다. fingerprint는 같은데 machine 영역이 편집되었으면 덮어쓰지 않고 fail-closed한다. 같은 입력을 의도적으로 초기화하는 `--reset-curation`은 기존 사람 판단을 폐기하는 명시적 오너 작업이며 closure 재실행에서는 사용하지 않는다.

validator는 manifest의 54개 ID exact set/order와 canonical physical profile order, 각 section의 board·판정 필드, progression 5행 exact order, completion 5행 exact order, reviewer/time/decision metadata, catalog hash·approval fingerprint binding, human 필드만 정규화한 machine scaffold exact comparison을 검증한다.

감사 리포트 최소 필드:

```text
version, startDate, dayCount, outputHash,
exceptions, invalid, wrongPar, fallbackCount,
adjacentDuplicates, sizeDistribution, difficultyDistribution
```

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 54개 정적 퍼즐 | 타깃 문양·초기 상태·canonical 해답 검토 | 시각 중복 과다·우연한 불쾌 패턴 없음 | `evidence/M03/content-curation-v1.md` — **APPROVED**, 2026-08-26 |
| chapter progression | 순서대로 3~5개 샘플 플레이 | 난도 급변·미소개 개념 없음 | 같은 체크리스트의 progression 5행 — **APPROVED**, 교체·재분류 없음 |

## 10. 증거

### 종료 검증 — PASS / DOD-10 closure COMPLETE

```text
focused generator+curation+catalog unit: files=3 tests=23 failures=0
full unit: files=11 tests=55 failures=0
boundaries: files=55 edges=81 violations=0 cycles=0 coreFiles=30
full verify: steps=10/10
PRNG parity: seeds=20 outputsPerSeed=100 browsers=Chromium/Firefox/WebKit tests=9/9
level content: files=5 levels=54 tutorial=6 lab=48 pulse=12 echo=12 rank=12 noise=12
level validation: rankChecks=68 solutionChecks=68 tagChecks=68 idChanges=0 validatorSelfChecks=22 humanReview=APPROVED failures=0
fallbacks: profiles=7 entries=14 forced-selection deterministic=true
catalogHash=c625d54327e5a6c3c6305a373d5199abd01c6fb69415161f9d4aee27c1738484
approvalFingerprint=5a60604a91b51c88ab294701b7a1eb286b00700101643807c80d5d10d59b7e6a
curationMetadata: reviewer=프로젝트 오너 reviewedAt=2026-08-26T00:20:42+09:00 overallDecision=APPROVED
approvedEvidenceSha256=B81406D8DCEE7214692426B112BB5941DBC319CC3FADD070F43F5638D9B0214F
candidate regeneration: curation=preserved jsonFiles=6 jsonHashChanges=0 curationEvidenceHashChanges=0
curation evidence: AXIS_SHIFT_Harness_KR/evidence/M03/content-curation-v1.md
daily audit: version=v1 startDate=2026-01-01 dayCount=3650
outputHash=997df1b01c8fee746168f6edebb2c549ad859da8f505e414e8eabdb918dd10b0
reportAndJsonSha256=b1102aee05f5e578894c13d36b0e14af9fb278d6e5af14efb9de49a480d96d49

historicalPreCloseRehearsalReruns=2
candidateSha=1c313bd29e1d24c483749af90a8734542988be5d
auditScope=clean-detached-worktree worktreeStatusBeforeAfter=0 auditOutputDirectoriesDistinct=true
environment: node=v24.19.0 npm=11.6.2 npmCiVulnerabilities=0
exactShaParity: browsers=Chromium/Firefox/WebKit tests=9/9
exactShaVerify: steps=10/10 unitFiles=11 unitTests=55
exactShaAudit: reruns=2 outputHash=997df1b01c8fee746168f6edebb2c549ad859da8f505e414e8eabdb918dd10b0
auditMarkdownSha256=3149a492592e88ab7329c20343613bac051e7a0719abd744333855d9a7baa036
auditChecksumFileSha256=8a827506ea0cb296fc0f125f65c08a03230bb67aa9454eaa6f3b5c646b98a893
exceptions=0 invalid=0 wrongPar=0 fallbackCount=0 adjacentDuplicates=0
maxAttemptCount=107 distributionFailures=0 goldenVectors=20 goldenMismatches=0
timezoneProcesses=3 timezones=UTC/Asia-Seoul/America-Los_Angeles repeatsPerProcess=10 hashMismatches=0
fixedShaAuditReruns=2 hashesMatch=true
```
- 변경 없는 미커밋 working tree의 pre-close rehearsal 2회는 역사 기준선으로 보존한다. DOD-10의 권위 있는 증거는 candidate exact SHA `1c313bd…be5d`의 clean detached worktree에서 서로 다른 출력 디렉터리로 수행한 위 2회 감사다.
- exact-SHA 두 실행은 output hash·정규화 JSON/report·Markdown·checksum-file SHA가 각각 일치했고, 실행 전후 tracked worktree status는 0이었다. 이 문서 evidence commit은 candidate 이후의 종료 기록이며 아직 push·PR을 주장하지 않는다.

- 감사 산출물: `outputs/m03/daily-audit-v1-2026-01-01-3650.{json,md,sha256}`. 이 경로는 재생성 가능한 로컬 출력이므로 Git에 커밋하지 않는다.
- 후보·카탈로그는 동일 seed 재생성에서 JSON 6파일 hash change 0이며 Prettier 검사를 통과했다. approval fingerprint exact match에서는 승인 evidence hash `B81406D8…0214F`가 그대로 보존되어 `curationEvidenceHashChanges=0`, `curation=preserved`였다.
- catalog·manifest·machine scaffold 변경은 기존 사람 승인을 자동 `PENDING`으로 무효화한다. 같은 fingerprint의 machine 편집은 fail-closed하며, `--reset-curation`도 같은 입력의 승인을 명시적으로 초기화하므로 실행했다면 DOD-04를 다시 승인하기 전 closure를 진행하지 않는다.
- 버전 map은 날짜별 `effectiveFrom` schedule과 version별 policy·fallback·golden registry를 분리한다. 기본 version이 바뀌어도 명시적 `v1` 요청은 `v1` resource를 사용한다.

### 종료 게이트 — PASS

- DOD-04는 자동 수치가 아니라 프로젝트 오너의 2026-08-26 전체 승인으로 통과했다.
- 승인 evidence metadata는 `프로젝트 오너` / `2026-08-26T00:20:42+09:00` / `APPROVED`이며 54개 패턴과 progression 5행 모두 PASS다.
- DOD-10은 candidate `1c313bd29e1d24c483749af90a8734542988be5d`의 clean detached worktree에서 감사 2회와 동일 hash를 확인해 통과했다.
- 일반 `npm run validate:levels`는 승인 metadata·fingerprint·machine scaffold가 어긋나면 실패하도록 닫혀 있다.
- DOD-01~11이 모두 통과해 M03을 완료한다. 이 종료 기록 시점에는 push·PR이 아직 없으며 별도 Git 작업으로 남긴다.

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
- 다음 작업은 M04 DoR 확인 후 Session, Persistence & Scoring을 착수한다. Tutorial/Lab/Daily 화면은 여전히 M06/M07 범위다.
