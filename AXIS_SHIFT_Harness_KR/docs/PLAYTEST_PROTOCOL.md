# AXIS//SHIFT 플레이테스트 프로토콜

**버전**: 1.0.0  
**상태**: M00 내부 파일럿 run 2회 완료 · M00 본 표본 및 M06 실행 전  
**최종 갱신**: 2026-08-09

## 1. 목적

자동 테스트는 PULSE가 정확한지 증명할 수 있지만, 일반 사용자가 규칙을 이해하고 재미를 느끼는지는 사람 관찰이 필요하다. 본 프로토콜은 다음을 측정한다.

1. 첫 유효 조작까지 걸리는 시간
2. 첫 퍼즐 성공까지 걸리는 시간
3. 교차점·중첩 반전 규칙의 회상
4. 목표·현재 보드·축·PULSE의 시각적 구분
5. 모바일·키보드 조작 문제
6. 결과 공유 의향과 스포일러 인식

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
Recording consent: yes / no
```

## 6. M00 Rule Proof 절차

### 6.1 준비

- 모든 참가자에게 같은 4×4 fixture와 같은 시작 상태를 제공한다.
- 정식 본 표본의 기본 fixture는 `<HARNESS_ROOT>/phases/M00_rule_proof.md` §3.2의 `M00-MAIN-v1` Easy다. stage 선택 화면을 거치지 않고 직접 열어 30초·90초 측정을 시작한다.
- Normal·Hard는 폐기형 난도 탐색 run에서만 사용하며 M00 본 표본과 합산하지 않는다. `M00-BACKUP-v1`은 Easy 주 fixture 결함이 확인된 뒤 새 test run에서만 사용한다.
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

정식 M00 본 플레이테스트는 아직 실행하지 않았다.

### 내부 파일럿 관찰

- run: 2회, 본 표본 미포함
- 조건: 현재 stage `M00-MAIN-v1` / Easy
- 수학적 최소값: Par 2 유지
- 관측 최저: 3 PULSE
- 초기 계산이 어긋난 흐름: 4~5 PULSE까지 이어질 수 있음
- 미보고: 참가자 수, 각 run의 시간, 개입 코드, 규칙 회상, 기기 구성
- Gate result: NOT COUNTED — §3의 n≥5 표본과 DOD-02~04를 충족하지 않음

### 자동 준비 증거

다단계 fixture verifier는 다음과 같이 통과했다.

```text
command: node prototypes/rule-proof/verify-fixture.mjs
exit: 0
M00-MAIN-v1 rank=2 bfs=2
M00-NORMAL-v1 rank=3 bfs=3
M00-HARD-v1 rank=4 bfs=4
M00-BACKUP-v1 rank=3 bfs=3
stageSequence=easy:2>normal:3>hard:4
assertions=196708 bfsVisited=65536 legalPulseCount=225 failures=0
```

기존 단일-stage 브라우저 기준선은 51개 단언, 360×640, 주 2수·예비 3수, 콘솔 오류 0으로 보존한다. 최종 다단계 브라우저 스모크도 다음과 같이 통과했다.

```text
command: node prototypes/rule-proof/browser-smoke.cjs
exit: 0
browserAssertions=140 viewport=360x640 easyMoves=2 normalMoves=3 hardMoves=4 backupMoves=3 consoleErrors=0
evidence: evidence/M00/browser-smoke-stages-360x640.png
```

이 자동 결과는 단계 흐름과 fixture 구현의 E2 증거이며 M00 본 표본의 E1 결과로 집계하지 않는다.

다음 본 실행은 신규 사용자 n≥5, 표본 구성, 비공개 원시 기록 위치·삭제 예정일을 확정한 뒤 Easy `M00-MAIN-v1`만으로 시작한다. 자동 검증·내부 파일럿·Normal/Hard 탐색 수치는 DOD-02~04의 E1 참가자 결과로 집계하지 않는다.
