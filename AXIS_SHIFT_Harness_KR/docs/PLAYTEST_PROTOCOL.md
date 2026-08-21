# AXIS//SHIFT 플레이테스트 프로토콜

**버전**: 1.0.0  
**상태**: M00 formal Easy 완료 / 2026-08-16 행동 기준 5/5, aggregate-only E1 제한 보존
**최종 갱신**: 2026-08-21

## 1. 목적

자동 테스트는 PULSE가 정확한지 증명할 수 있지만, 일반 사용자가 규칙을 이해하고 재미를 느끼는지는 사람 관찰이 필요하다. 본 프로토콜은 다음을 측정한다.

1. 첫 유효 조작까지 걸리는 시간
2. 첫 퍼즐 성공까지 걸리는 시간
3. 교차점·중첩 반전 규칙의 회상
4. 목표·현재 보드·축·PULSE의 시각적 구분
5. 모바일·키보드 조작 문제
6. 결과 공유 의향과 스포일러 인식
7. 반복 목표의 다양성, sweep 의존도, 시간·PULSE 피드백의 유용성

## 2. 개인정보·윤리

- 실명 대신 `P01`, `P02` 같은 익명 ID를 사용한다.
- 연령은 필요한 경우 구간만 기록한다.
- 이메일·전화·계정·화면에 표시된 개인 알림을 저장하지 않는다.
- 녹화는 사전 동의를 받고 원본은 공개 저장소에 commit하지 않는다.
- 저장소에는 이 문서의 익명 ID 집계와 개인정보를 제거한 관찰 요약만 남긴다.
- 연락처·동의 원본·원시 메모·녹화는 프로젝트 오너가 정한 비공개 저장 위치에 보관하고, test run 전에 위치와 삭제 예정일을 기록한다.
- 참가자는 언제든 중단할 수 있다.
- 보상 여부와 테스트 목적을 미리 알린다.
- 개발자의 기대 답을 유도하지 않는다.

## 3. 참가자 구성

### M00 최소 표본

- 신규 사용자 최소 5명
- 프로젝트 구현에 참여하지 않은 사람
- 최소 3명은 AI·선형대수·퍼즐 개발 전문성이 없는 사람
- 가능하면 모바일 사용자 3명 이상

### M06 권장 표본

- 신규 사용자 최소 5명
- M00 참가자와 겹치지 않는 사람을 우선
- Android/iOS/desktop을 혼합
- 키보드 또는 보조기술 사용자 1명 이상이 가능하면 포함

작은 표본은 통계적 시장 검증이 아니라 심각한 이해도 실패를 조기에 찾는 용도다.

## 4. 관찰자 규율

- 참가자 화면을 대신 조작하지 않는다.
- “행을 누르세요”, “여기를 선택하세요” 같은 절차 힌트를 주지 않는다.
- 참가자가 질문하면 먼저 “지금 화면에서 무엇이 보이나요?”라고 반문한다.
- 30초 이상 완전히 막힌 경우에만 정해진 중립 안내를 반복한다.
- 개입은 반드시 코드로 기록한다.

### 개입 코드

| 코드 | 의미 | 성공 판정 |
|---|---|---|
| I0 | 개입 없음 | 독립 성공 |
| I1 | 화면에 이미 있는 안내를 그대로 재읽음 | 성공 가능, 별도 표시 |
| I2 | 조작 범주를 지시함(행/열/PULSE) | 독립 성공 아님 |
| I3 | 구체 축·정답을 지시하거나 대신 조작 | 실패 |

## 5. 공통 환경 기록

```text
Participant ID:
Date/time:
Run kind: internal pilot / M00 main sample / exploration
Build SHA/version:
URL/prototype:
Fixture ID:
Stage/difficulty:
Device/OS/browser:
Input: touch / mouse / keyboard / assistive tech
Viewport or orientation:
Prior puzzle frequency: low / medium / high
AI/matrix familiarity: none / basic / advanced
Pulses used:
Elapsed seconds:
Observed strategy: singleton row/column sweep / mixed axes / other
Recording consent: yes / no
```

## 6. M00 Rule Proof 절차

### 6.1 준비

- 모든 참가자에게 같은 4×4 fixture와 같은 시작 상태를 제공한다.
- 정식 본 표본의 기본 fixture는 `<HARNESS_ROOT>/phases/M00_rule_proof.md` §3.2의 `M00-MAIN-v1` Easy다. stage 선택 화면을 거치지 않고 직접 열어 30초·90초 측정을 시작한다.
- Normal 4×4·5×5, Hard 4×4·5×5·6×6와 Full Rank 대조군은 폐기형 난도 비교 run에서만 사용하며 M00 본 표본과 합산하지 않는다. legacy `?stage=hard`는 Full Rank 대조군 alias다. `M00-BACKUP-v1`은 Easy 주 fixture 결함이 확인된 뒤 새 test run에서만 사용한다.
- browser storage를 초기화한다.
- observer stopwatch와 기록표를 준비한다.
- 완료한 내부 파일럿 run 2회는 본 표본에서 제외한다. 파일럿 참가자 수·시간·개입은 보고되지 않았으므로 추정하거나 DOD 판정에 사용하지 않는다.

### 6.2 중립 안내문

다음 이상의 수학 설명을 하지 않는다.

> 목표 신호와 현재 신호를 같게 만드세요. 왼쪽에서 행을, 위에서 열을 하나 이상 고른 뒤 PULSE를 누르면 선택한 행과 열의 교차점이 반전됩니다. 같은 칸에 신호가 다시 닿으면 원래 상태로 돌아갈 수 있습니다.

실제 Tutorial의 문구가 이보다 짧다면 해당 문구를 사용하고 버전을 기록한다.

### 6.3 과업

1. 화면을 자유롭게 살펴본다.
2. 행과 열을 선택해 첫 PULSE를 실행한다.
3. 목표 패턴을 완성한다.
4. 완료 후 규칙을 자기 말로 설명한다.

### 6.4 측정값

| 지표 | 시작 | 종료 | 기준 |
|---|---|---|---|
| 첫 axis 선택 | 안내 시작 | 첫 row/col 선택 | 보조 지표 |
| 첫 유효 PULSE | 안내 시작 | row·col 비영 PULSE | 4/5가 30초 이내 |
| 첫 성공 | 안내 시작 | solved event | 4/5가 90초 이내 |
| 사용 PULSE 수 | 첫 PULSE | solved event | 체감 난도 보조 지표, 통과 임계치 없음 |
| 개입 | 전체 | I0~I3 | DOD 판정 |
| 규칙 회상 | 완료 후 | 답변 종료 | 4/5 핵심 설명 |

핵심 회상 포인트:

- 행과 열을 고른다.
- 교차점이 바뀐다.
- 이미 켜진 칸도 다시 반전될 수 있다.

### 6.5 폐기형 난도 비교

여섯 난도×크기 profile과 Full Rank 대조군은 같은 참가자가 순서 균형을 바꿔 플레이할 수 있다. 각 run에 다음을 기록하되 Easy DOD-02~04 표본에는 합산하지 않는다.

| 지표 | 기록 | 해석 |
|---|---|---|
| 완료시간·PULSE 수 | stage별 실제값 | 완료 가능성과 효율 분리 |
| singleton-column PULSE 비율 | 전체 PULSE 중 열 하나만 선택한 비율 | 축 순회 의존도 |
| 첫 복수 열 선택 시점 | PULSE 번호 또는 미발견 | 압축 관계 발견 여부 |
| Undo·Reset·힌트 | 횟수 | 시행착오 비용 |
| 사후 난도 순위·이유 | 대조군·A·B 순위와 자유 응답 | 구조 게이트와 체감 난도의 차이 |

구조 게이트 통과만으로 Hard를 승인하지 않는다. 비교 표본과 순서 균형은 실행 전에 고정하고, 후보를 채택하지 않는 결과도 허용한다.

완료된 후속 비교의 참가자 수·시간·기기·입력·순서 균형·개입은 보고되지 않았다. 따라서 그 후기는 크기 풀과 후속 UX 요구를 정하는 정성 근거로만 기록하고, 이 절의 정량 지표나 M00 Easy 본 표본으로 소급 집계하지 않는다.

`tensor`, `XOR`, `rank` 단어는 요구하지 않는다.

## 7. M06 최종 Tutorial 테스트

### 과업

```text
새 프로필에서 게임 열기
→ 별도 설명 없이 Tutorial 시작
→ Tutorial 1 완료
→ Tutorial 전체 또는 지정 단계 진행
→ 첫 Lab 진입·첫 PULSE
```

### 성공 기준

- 5명 중 4명 이상이 사람의 I2/I3 개입 없이 Tutorial 1을 90초 이내 완료
- 5명 중 4명 이상이 첫 Lab에서 유효 PULSE 실행
- 동일 P0 혼동이 2명 이상에게 반복되지 않음
- 360px 참가자에서 control 가림 0건
- 완료 뒤 다음 행동을 묻지 않아도 CTA를 발견하는 비율 4/5 이상

### 추가 질문

1. 현재 보드와 목표 보드를 어떻게 구분했는가?
2. PULSE를 누르기 전에 어떤 칸이 바뀔지 예상할 수 있었는가?
3. Undo, Reset, Hint 중 먼저 찾을 수 있었던 것은 무엇인가?
4. 결과의 `4 / 4 Pulses`와 S/A/B/C를 어떻게 이해했는가?
5. 한 문제 더 플레이하고 싶은가? 이유는 무엇인가?

## 8. M09 공유 테스트

결과 화면을 보여주고 다음을 묻는다.

- 이 결과가 무엇을 의미한다고 생각하는가?
- 이 이미지를 보면 퍼즐 정답을 알 수 있는가?
- 텍스트·1:1 이미지·16:9 이미지 중 무엇을 공유하겠는가?
- 공개 SNS에 올려도 개인 정보가 노출되지 않는다고 느끼는가?
- 같은 날짜 다른 사람과 비교하고 싶은 요소는 무엇인가?

관찰자는 실제 공유 성공 여부와 capability fallback을 기록한다.

## 9. 원시 기록표

| ID | Device | First Axis | First Pulse | Solved | Pulses | Intervention | Recall | Major Confusion | Replay Intent | Notes |
|---|---|---:|---:|---:|---:|---|---|---|---|---|
| P01 | — | — | — | — | — | — | — | — | — | — |
| P02 | — | — | — | — | — | — | — | — | — | — |
| P03 | — | — | — | — | — | — | — | — | — | — |
| P04 | — | — | — | — | — | — | — | — | — | — |
| P05 | — | — | — | — | — | — | — | — | — | — |
| M00-R1 aggregate | PC 4 / mobile Chrome 1 | 미기록 | ≤30s 5/5 | ≤90s 5/5 | 미기록 | I0 5/5 | 5/5 | 반복 P0 0 | 미기록 | 개별 ID·정확한 값은 복구하지 않음 |

시간은 초 단위로 기록한다. 미완료는 `>limit`, 중단은 `DNF`로 쓴다.

## 10. 혼동 분류

| Code | 혼동 |
|---|---|
| C-TARGET | 목표와 현재 보드를 구분하지 못함 |
| C-AXIS | 행·열 control이 선택 가능한지 모름 |
| C-PREVIEW | preview를 실제 변경으로 오해 |
| C-XOR | 켜진 셀이 다시 꺼지는 것을 오류로 생각 |
| C-PULSE | PULSE 활성 조건·CTA를 찾지 못함 |
| C-UNDO | Undo와 Reset의 차이를 모름 |
| C-HINT | Hint 단계·등급 영향을 오해 |
| C-RESULT | Par·grade·시간을 이해하지 못함 |
| C-NEXT | 완료 후 다음 행동을 찾지 못함 |
| C-MOBILE | 가림·오입력·scroll 문제 |
| C-A11Y | focus·label·상태 공지가 불충분 |

같은 code가 2명 이상에게 나타나면 반복 문제로 간주하고 phase에서 명시적으로 처리한다.

## 11. 분석 규칙

- 평균보다 중앙값과 개별 실패를 함께 본다.
- 성공 시간이 빠르더라도 I2/I3 개입은 독립 성공에 포함하지 않는다.
- 퍼즐 경험이 높은 참가자만 성공하면 일반 대중 통과로 보지 않는다.
- 카피·레이아웃·규칙 변경은 한 번에 하나의 주요 변수만 바꾼다.
- 재시험 참가자는 신규 표본과 분리한다.
- 목표 임계치를 사후 하향하지 않는다.

## 12. 결과 요약 템플릿

```markdown
### Test Run: M00-R1

- Build/fixture:
- Date:
- Sample: n=5
- Independent first pulse <=30s: 0/5
- Independent solve <=90s: 0/5
- Correct rule recall: 0/5
- Median first pulse:
- Median solve:
- Pulses used:
- Repeated confusion:
- Mobile blockers:
- Adopted changes:
- Rejected changes:
- Gate result: PASS / FAIL
- Evidence location:
```

## 13. 현재 결과

### Formal Easy beta 본 표본 — `M00-R1`

- Build/fixture: `b0f935e396805bab9c0847847068cb9a3522968f` / `M00-MAIN-v1` / Easy / seed 없음
- Deployment: GitHub Pages run `31733835031` success
- URL: `https://jtech-co.github.io/axis-shift/`
- Date: 2026-08-16
- Sample: n=5, 전원 신규 인터넷 익명 사용자, 프로젝트 구현 비참여
- Environment: PC 4명, mobile Chrome 1명; 개인별 매핑과 PC 세부 환경 미기록
- Intervention: I0 5/5, 진행자 개입 없음
- Independent first pulse ≤30s: 5/5 — PASS
- Independent solve ≤90s: 5/5 — PASS
- Correct rule recall: 5/5 — PASS
- Median first pulse / solve: not recorded
- Pulses used: not recorded
- Repeated P0 confusion: 0건 보고
- Mobile blockers: none reported; 상세 실기기 검증으로 재사용하지 않음
- Gate result: `PASS — project-owner-attested aggregate E1`
- Private evidence: `<PROJECT_ROOT>/.private/playtests/M00-R1-2026-08-16.md`, Git 미추적
- Deletion: 2026-08-26 해커톤 제출 완료 후

참가자별 ID·정확한 초·PULSE 수·PC 브라우저/OS·전문성 층화는 보존되지 않았다. 프로젝트 오너는 2026-08-21 이 제한을 인지하고 M00 종료를 승인했다. 중앙값·개별 행을 추정하지 않으며 M06/M10 증거로 재사용하지 않는다.

### 정성 피드백과 결정

1. 유사 규칙이 드물어 신선하다 — 코어 차별점으로 유지하고 제출 피치에서 강조한다.
2. 생각할 거리는 있으나 단계가 적다 — 첫 우선순위로 기존 6 profile의 반복 콘텐츠와 제출용 신호 카탈로그를 가시화한다.
3. 3D 경쟁작 대비 우려 — 일정·가독성·접근성 위험이 큰 3D 전환은 보류하고 규칙·콘텐츠·완성도로 차별화한다.
4. AXIS 변화가 잘 보이지 않는다 — 선택 축 진행선, 교차점 충격, 완료 Signal Lock 연출을 두 번째 우선순위로 둔다.
5. 2D가 밋밋하다 — 로컬 CSS 기반 깊이·상태·모션을 보강하되 대형 의존성·외부 자산은 추가하지 않는다.
### 내부 파일럿 관찰

- run: 2회, 본 표본 미포함
- 조건: 현재 stage `M00-MAIN-v1` / Easy
- 수학적 최소값: Par 2 유지
- 관측 최저: 3 PULSE
- 초기 계산이 어긋난 흐름: 4~5 PULSE까지 이어질 수 있음
- 미보고: 참가자 수, 각 run의 시간, 개입 코드, 규칙 회상, 기기 구성
- Gate result: NOT COUNTED — §3의 n≥5 표본과 DOD-02~04를 충족하지 않음

### 내부 파일럿 후속 제보 — P0-DIFF-001

- 제보: 4×4에서 열 1~4를 차례로 맞추면 어떤 보드도 4 PULSE 이하에 해결되고 당시 Hard에서는 Par 4와 같아짐
- 재현: 성공. 각 비영 열 `d_j`에 `rowMask=d_j`, `colMask=e_j`를 적용하면 다른 열을 건드리지 않고 해당 열만 맞는다.
- 영향: 당시 Hard 라벨의 구성 타당성 무효. 코어 PULSE·`Par=rank`·Easy 정식 조건은 정상
- 채택: 당시 Hard를 Full Rank 대조군으로 재분류하고 5×5 gap 2·6×6 gap 3 후보를 비교 조건으로 구현
- 후속 판단: 사람 비교 후 난도별 보드 크기 풀은 채택했지만 구조 게이트와 정성 후기만으로 현재 후보를 정식 Hard fixture로 승인하지 않음

### 사람 대상 5×5·6×6 비교 후기 — 비게이트 관찰

- 보고된 체감: 5×5·6×6 모두 4×4보다 생각할 거리가 있으며 지나치게 쉽지 않음
- 채택한 보드 크기 풀:
  - Easy: 4×4
  - Normal: 4×4·5×5
  - Hard: 4×4·5×5·6×6
- 해석 경계: 크기 풀 채택이며 개별 목표의 정식 난도 승인과 다름. 현재 4×4 Full Rank 대조군은 sweep 취약성 때문에 Hard가 아님
- 다양성 요구: 조합당 한 목표만 제공하면 반복성이 부족하므로 완료 후 계속 새로운 목표 신호를 제공함
- sweep 대응: 단일 행/열 순회로 완료해도 성공은 인정하고 “다른 방법으로도 풀어 보세요”라는 비강제 안내를 표시함
- 시간·결과 요구: 플레이 중 스톱워치를 표시하고 완료 시 사용 PULSE와 경과 초를 함께 표시함
- 구현 상태: 새 목표·sweep 안내·visibility-safe 스톱워치와 완료 PULSE·0.1초 표시가 구현됐고 573개 브라우저 단언으로 회귀했다.
- 미보고: 참가자 수, 완료시간, PULSE 수, 기기·브라우저, 입력 방식, 순서 균형, 개입 코드, 규칙 회상, 원시 기록 위치
- Gate result: NOT COUNTED — formal Easy n≥5와 DOD-02~07을 충족하지 않으며 beta까지 미판정

### 자동 준비 증거

현재 fixture·난도 verifier는 다음과 같이 통과했다.

```text
command: node prototypes/rule-proof/verify-fixture.mjs
exit: 0
difficulty=M00-MAIN-v1 rank=2 sweep=4 gap=2 density=0.6250 hardGate=pass
difficulty=M00-NORMAL-v1 rank=3 sweep=4 gap=1 density=0.5000 hardGate=fail
difficulty=M00-NORMAL-5X5-v1 rank=3 sweep=4 gap=1 density=0.5200 hardGate=fail
difficulty=M00-CANDIDATE-4X4-v1 rank=2 sweep=4 gap=2 density=0.6250 hardGate=pass
difficulty=M00-CANDIDATE-5X5-v1 rank=3 sweep=5 gap=2 density=0.6400 hardGate=pass
difficulty=M00-CANDIDATE-6X6-v1 rank=3 sweep=6 gap=3 density=0.5556 hardGate=pass
difficulty=M00-HARD-v1 rank=4 sweep=4 gap=0 density=0.5625 hardGate=fail
difficulty=M00-BACKUP-v1 rank=3 sweep=4 gap=1 density=0.6250 hardGate=fail
generatorRegression=version:m00-seeded-v1 playableProfiles:6 controlProfiles:1 goldenVectors:7 seedsPerProfile:12 maxAttempts:512 density:0.22-0.68 hard4Initial:0.25-0.5
stageSequence=easy:2>normal:3>normal-5:3>hard-4:2>hard-5:3>hard-6:3
assertions=200967 bfsVisited=65536 legalPulseCount=225 failures=0
```

기존 51개 단일-stage와 140개 P0 발견 전 4×4 다단계 출력은 역사 기준선으로만 보존한다. 현재 여섯 profile 반복 UX 브라우저 스모크는 다음과 같이 통과했다.

```text
command: node prototypes/rule-proof/browser-smoke.cjs
exit: 0
browserAssertions=573 viewport=320/360/960 easyMoves=2 normal4Moves=3 normal5Moves=3 hard4Moves=2 hard5Moves=3 hard6Moves=3 backupMoves=3 timer=visibility-safe newTarget=crypto+fallback sweepGuidance=column consoleErrors=0
evidence: evidence/M00/browser-smoke-stages-360x640.png
```

이 자동 결과는 독립 minor·행 루프 oracle, generator golden·fallback, Hard 4×4 initial 노이즈, seed 재현·직전 target 배제, sweep 안내와 visibility-safe 타이머의 E2 증거다. 5×5·6×6의 이동 거리 전수 BFS는 실행하지 않았으며, 구조 게이트 통과를 체감 난도 승인이나 M00 본 표본 E1 결과로 집계하지 않는다.

다음 본 실행은 출시 직전 playable beta의 SHA·공개 URL, 신규 사용자 n≥5, 표본 구성, 비공개 원시 기록 위치·삭제 예정일을 확정한 뒤 Easy `M00-MAIN-v1`만으로 시작한다. 자동 검증·내부 파일럿·Normal·Full Rank 대조군·비교 후보 수치는 DOD-02~07의 formal E1 판정으로 집계하지 않는다.
