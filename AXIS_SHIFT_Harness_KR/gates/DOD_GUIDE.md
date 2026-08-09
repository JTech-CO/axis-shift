# DOD_GUIDE.md — AXIS//SHIFT DoR·DoD·증거 작성 가이드

**버전**: 1.0.0  
**적용 범위**: `phases/M00`~`M11`, 신규 phase, 긴급 수정 phase

> phase는 일정 구간이 아니라 검증 가능한 위험 묶음이다. 작업량이 많다는 이유로 phase를 닫지 않으며, 반대로 코드량이 적어도 게이트가 통과하면 완료할 수 있다.

## 1. Definition of Ready — 진입조건

DoR는 해당 phase를 시작하기 전에 이미 만족되어 있어야 하는 조건이다. 하나라도 미충족이면 구현하지 않고 `PROGRESS.md`에 `진입 대기` 또는 `막힘`으로 기록한다.

필수 DoR 항목은 다음 네 범주를 포함한다.

1. **선행 게이트**: 직접 선행 phase의 DoD가 전부 통과했다.
2. **계약 확정**: 필요한 입력·출력·스키마·공개 규칙·모듈 경계가 문서 또는 ADR에 정의됐다.
3. **환경·자원**: 필요한 런타임, 브라우저, 실기기, 자산, 사용자 테스트 참여자가 준비됐다.
4. **위험 확인**: 참조할 불변식과 알려진 리스크를 읽었고, 실패 시 STOP 기준을 알고 있다.

좋은 DoR 예시:

```text
- [ ] M02 DoD 통과 및 INV-004~006 위반 0건
- [ ] PuzzleDefinition v1 스키마가 TECHNICAL_WHITEPAPER §2.3.2와 일치
- [ ] generatorVersion `v1` seed 계약이 ADR-0003에 채택됨
- [ ] 10년 감사가 실행 가능한 Node 환경과 고정 시간대 fixture 준비
```

나쁜 DoR 예시:

```text
- [ ] 준비가 된 것 같다
- [ ] 디자인 확인
- [ ] 필요한 파일 있음
```

## 2. Definition of Done — 완료 게이트

DoD는 결과를 직접 판정할 수 있어야 한다. 각 항목은 최소한 다음 중 하나를 가져야 한다.

- 재현 가능한 명령과 exit code
- 입력·기대 출력·실제 출력이 있는 자동 테스트
- 명시된 표본 수와 통과 비율
- 실제 URL·기기·브라우저에서 수행한 재현 절차
- 생성된 리포트 또는 산출물의 경로와 해시

### 2.1 작성 원칙

1. **이진 판정**: 통과/실패가 모호하지 않아야 한다.
2. **효과 직접 검증**: “빌드된다” 대신 “행·열 선택이 정확한 셀만 반전한다”를 검사한다.
3. **불변식 인용**: 해당 게이트가 보호하는 `INV-nnn`을 붙인다.
4. **정합성 검사**: 동일 정보를 여러 계층이 해석하면 하나의 fixture로 패리티를 확인한다.
5. **결정성 보장**: 시간·랜덤·환경을 고정하거나 주입해 같은 입력이 같은 결과를 내게 한다.
6. **회귀 가능성**: 가능한 항목은 일회성 수동 확인이 아니라 CI에서 반복 실행한다.
7. **증거 보존**: 명령과 핵심 출력은 phase 파일 및 `PROGRESS.md`에 남긴다.
8. **임계치 변경 통제**: 숫자나 표본을 낮춰야 한다면 실패를 숨기지 말고 ADR과 사용자 승인을 먼저 받는다.

### 2.2 금지되는 완료 문구

다음 표현만으로는 완료를 주장할 수 없다.

- 정상적으로 보인다
- 대부분 동작한다
- 에러가 안 난다
- 모바일도 아마 괜찮다
- Codex가 테스트했다고 했다
- Lighthouse 점수가 높다
- 한 번 직접 해봤는데 된다

## 3. 증거 수준

| 수준 | 정의 | 허용 예 | 완료 사용 |
|---|---|---|---|
| E0 | 근거 없는 주장 | “완료함” | 불가 |
| E1 | 수동 관찰 | 캡처, 실기기 체크, 플레이테스트 원시 기록 | 시각·인간 이해도 보조 |
| E2 | 재현 가능한 명령 | lint/build/test의 명령·exit 0 | 일반 구현 게이트 |
| E3 | 자동 대량 검증 | 전수 탐색, property test, 10년 generator audit, migration matrix | 정확성 phase 필수 |
| E4 | CI + 실제 공개 환경 | 보호된 CI green, GitHub Pages URL smoke, 오프라인 실배포 | M10·M11 필수 |

증거 수준은 누적된다. E4는 E2·E3를 대체하지 않고 그 결과를 공개 환경에서 다시 확인하는 단계다.

## 4. AXIS//SHIFT 공통 검증 명령 계약

M01 이후 아래 script 이름을 유지한다. 내부 도구가 바뀌어도 phase 문서와 CI가 참조하는 공개 명령은 변경하지 않는다. 변경이 필요하면 ADR을 작성한다.

```bash
npm ci
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run test:coverage
npm run validate:levels
npm run audit:daily
npm run build
npm run test:e2e
npm run test:a11y
npm run verify
```

### 4.1 `npm run verify` 최소 구성

```text
lint
→ format:check
→ typecheck
→ test
→ validate:levels
→ audit:daily
→ build
```

Playwright 브라우저 설치 비용 때문에 `test:e2e`와 `test:a11y`는 로컬 기본 `verify`에서 분리할 수 있다. 단, M10·M11과 main CI에서는 전부 필수다.

### 4.2 명령 부재 처리

현재 phase가 해당 script를 만드는 단계라면 산출물로 구현한다. 그렇지 않은데 명령이 없다면 유사 명령을 임의로 대체하지 말고 STOP 또는 문서 불일치로 기록한다.

## 5. Phase 아키타입과 본 프로젝트 매핑

| 아키타입 | AXIS//SHIFT phase | 핵심 출구 게이트 |
|---|---|---|
| 규칙 증명·범위 잠금 | M00 | 신규 사용자 5명 중 4명 이상 90초 내 첫 성공 |
| 기반·스캐폴딩 | M01 | toolchain green + import 경계 실제 차단 |
| 핵심 도메인 로직 | M02 | 3×3 전수에서 brute-force 최소 이동 = `GF(2)` rank |
| 데이터·콘텐츠 파이프라인 | M03 | 54개 정적 콘텐츠 + 10년 Daily 감사 |
| 상태·영속화 | M04 | reducer·등급·타이머·저장 migration 정합 |
| 디자인 시스템·UI 기반 | M05 | 상태 fixture, 360px, 키보드, 테마·접근성 |
| 캠페인 기능 | M06 | Tutorial 6 + Lab 48 전체 플로우 |
| 결정적 Daily | M07 | UTC·버전·Archive·streak 회귀 |
| 시간제 모드 | M08 | 180초 절대 종료와 점수 재현 |
| 공유·PWA·i18n | M09 | 스포일러 0건, 오프라인, 한·영 key parity |
| 통합·배포 | M10 | 전체 CI + 실제 URL + P0/P1 0건 |
| 릴리스·제출 | M11 | 태그·해시·링크·썸네일·영상·설명 고정 |

## 6. 핵심 phase별 최소 증거

### M00 — 인간 이해도

- 익명 참가자 ID, 기기, 시작·완료 시각, 개입 횟수, 관찰 메모
- 동일한 중립 안내문
- 5명 이상, 4명 이상 90초 내 성공
- 정량 결과와 반복되는 혼동 패턴 요약

### M02 — 수학 정확성

- 3×3 가능한 차이 행렬 512개 전수
- 각 행렬에서 brute-force 최소 펄스 수와 rank 일치
- canonical factorization round-trip 100%
- pulse involution·commutativity property test

### M03 — 콘텐츠·생성기

- Tutorial 6 + Lab 48 validator 통과
- Daily 3,650일 감사 결과와 generator version
- 생성 실패·중복·잘못된 par 0건 또는 문서화된 결정적 fallback 사용
- 동일 감사 재실행 결과 해시 일치

### M04 — 저장·시간

- v1 정상, 빈 값, 손상 JSON, 미래 버전, 구버전 fixture
- 원자적 PULSE와 완료 이벤트 중복 0건
- visibility 전환과 fake clock 결과

### M09 — 공유·오프라인

- 텍스트·URL·Web Share·PNG payload 금지 필드 검사
- 1080×1080 및 1200×630 fixture
- 최초 온라인 캐시 후 네트워크 차단 E2E
- 한국어·영어 key parity와 길이 fixture

### M10·M11 — 공개 릴리스

- CI 실행 URL·커밋 SHA
- 실제 GitHub Pages URL에서 각 핵심 라우트 smoke
- 새 브라우저 프로필의 첫 사용자 플로우
- 모바일 실기기 결과
- QA_REPORT와 RELEASE_CHECKLIST의 서명·일시

## 7. 수동 게이트 작성 형식

```text
환경: Pixel 8 / Android / Chrome xx / 360×800 CSS px
빌드: v1.0.0-rc.1, commit abc1234
절차:
1. 새 프로필에서 URL 접속
2. 키보드 또는 터치로 Tutorial 시작
3. 첫 Lab 완료
기대:
- 가로 스크롤 0
- PULSE 가림 0
- 완료 후 Result 제목으로 포커스 이동
실제:
- 모두 충족
증거:
- artifacts/manual/M10-pixel8-tutorial.mp4
검증자/일시:
- initials / 2026-08-24T12:00:00+09:00
```

수동 증거에는 민감정보·참가자 실명을 넣지 않는다.

## 8. Waiver와 임계치 변경

정확성, 개인정보, 보안, 스포일러, 라이선스, 공개 링크 접근성, P0·P1 0건은 waiver할 수 없다.

P2 또는 비핵심 성능 임계치를 유예하려면 다음을 모두 남긴다.

1. 문제와 사용자 영향
2. 재현 절차
3. 유예 이유와 만료 시점
4. 우회 방법
5. 사용자 승인
6. `docs/QA_REPORT.md`와 `docs/RELEASE_NOTES.md` 링크

## 9. 증거 블록 표준

각 phase의 `증거` 절에는 다음 형식을 사용한다.

```text
[YYYY-MM-DD HH:mm KST] Gate DOD-03
Command: npm run audit:daily
Exit: 0
Input/Scope: generator v1, 2026-01-01..2035-12-29 (3,650 days)
Result: failures=0, invalidPar=0, duplicateAdjacent=0
Artifact: artifacts/audits/daily-v1-3650.json
Commit: abc1234
Reviewer: human/codex + human verified
```

출력이 길면 전체를 붙이지 않고 핵심 요약과 리포트 경로·해시를 남긴다.

## 10. 신규 phase 추가 규칙

- 기존 phase의 실패를 숨기기 위해 새 phase를 만들지 않는다.
- 단일 위험 묶음과 독립된 DoR·DoD가 있어야 한다.
- `phases/_TEMPLATE.md`를 복사한다.
- `README.md`, `PROGRESS.md`, `docs/REQUIREMENTS_TRACEABILITY.md`의 색인을 갱신한다.
- 순서·범위 변화가 공개 일정이나 아키텍처에 영향을 주면 ADR을 추가한다.
