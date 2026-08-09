# AXIS//SHIFT — A Daily Tensor Puzzle 기술 백서 (Technical Whitepaper)

**버전**: 1.0.0-draft  
**작성일**: 2026년 8월 9일  
**작성자**: JTech-CO / Bryan  
**문서 상태**: Pre-Production / OpenAI Game Builders Seoul 예선 빌드 기준  
**참고 문서**: AXIS//SHIFT 기획 정의 v0.1, AXIS//SHIFT 디자인 백서 v1.0, QA 및 릴리스 체크리스트(추후 작성)

---

## 1. 프로젝트 개요 (Project Overview)

### 1.1. 프로젝트 명

**AXIS//SHIFT — A Daily Tensor Puzzle**

- 한국어 표기: **액시스 시프트 — 데일리 텐서 퍼즐**
- 저장소 권장명: `axis-shift`
- 패키지 권장명: `axis-shift-game`
- 공개 장르 표기: Daily Logic Puzzle / Pattern Puzzle
- 내부 도메인 표기: Binary Matrix Outer-Product Puzzle

### 1.2. 목적 (Purpose)

AXIS//SHIFT는 텐서와 이진 행렬의 연산 원리를 일반 사용자가 수학 지식 없이 조작할 수 있는 짧은 웹 퍼즐로 변환하는 프로젝트다. 플레이어는 하나 이상의 행과 열을 선택한 뒤 `PULSE`를 실행하여 교차점의 셀을 반전시키고, 현재 보드를 목표 패턴과 일치시켜야 한다.

프로젝트의 기술적 목표는 다음과 같다.

1. **직관적 코어 규칙**: 접속 후 10초 이내에 행·열 선택과 교차점 반전의 관계를 이해할 수 있어야 한다.
2. **수학적으로 검증되는 퍼즐**: 모든 퍼즐의 해결 가능 여부, 최소 펄스 수, 힌트용 최적해를 `GF(2)` 행렬 연산으로 정확히 산출해야 한다.
3. **짧고 반복 가능한 세션**: 기본 한 판을 1~3분 안에 완료하고, Daily·Lab·Sprint를 통해 재방문 동기를 제공해야 한다.
4. **서버 없는 배포**: GitHub Pages 등 정적 호스팅에서 회원가입·백엔드·유료 API 없이 완전하게 동작해야 한다.
5. **모바일 우선 품질**: 360px 폭의 저사양 스마트폰부터 데스크톱까지 동일한 게임 규칙과 품질을 유지해야 한다.
6. **공유 가능한 결과물**: 정답을 노출하지 않는 텍스트 결과와 1:1·16:9 이미지 카드를 클라이언트에서 생성해야 한다.
7. **출시 가능한 완결성**: 튜토리얼, 저장, 설정, 접근성, 오프라인 실행, 오류 복구, QA 자동화가 포함된 배포 수준의 제품을 목표로 한다.

#### 제품 목표

- 첫 실행 사용자의 80% 이상이 별도 설명 없이 90초 안에 첫 튜토리얼을 완료하는 것을 플레이테스트 목표로 한다.
- Daily Signal 한 판은 일반 난도 기준 45초~3분 안에 종료되도록 설계한다.
- 초기 화면에서 플레이 시작까지 필요한 주요 액션은 최대 2회로 제한한다.
- 게임 코어는 네트워크가 끊긴 상태에서도 실행 가능해야 한다.

#### 비목표 (Non-Goals)

초기 출시 범위에서는 다음을 구현하지 않는다.

- 실시간 멀티플레이 및 PvP
- 계정·친구·클라우드 세이브
- 서버 기반 글로벌 랭킹
- 런타임 LLM 또는 OpenAI API 의존 기능
- 3차원 텐서 시각화와 자유 회전
- 사용자 제작 퍼즐 공개 마켓
- 광고, 인앱 결제, 가챠, 에너지 제한
- 정답을 평가하는 서버 측 치트 방지

### 1.3. 핵심 차별점 (Key Differentiators)

1. **Exact Solvability — 최소해가 증명되는 퍼즐**  
   각 펄스는 이진 행렬에서 하나의 rank-1 외적을 더하는 연산이며, 현재 상태와 목표 상태의 차이 행렬에 대한 `GF(2)` 랭크가 최소 펄스 수와 정확히 일치한다. 퍼즐 생성·난도 분류·힌트·결과 등급이 추정치가 아니라 동일한 수학 모델을 공유한다.

2. **Deterministic Daily — 서버 없는 동일 일일 퍼즐**  
   날짜, 생성기 버전, 고정 도메인 문자열에서 결정적 시드를 만들고 검증된 퍼즐을 생성한다. 같은 날짜와 버전에서는 모든 기기에서 동일한 문제를 얻으며, 아카이브도 정적 데이터베이스 없이 재생성할 수 있다.

3. **Spoiler-Free Sharing — 정답을 숨긴 공유 결과**  
   목표 패턴이나 실제 펄스 선택을 노출하지 않고, 퍼즐 ID·완료 시간·펄스 수·등급·해시 기반 Signal Signature만 공유한다. 소셜 미디어에서 비교 가능하지만 정답 유출은 방지한다.

4. **Static-First Product — 설치 가능하고 오프라인인 정적 게임**  
   게임 로직, 퍼즐 생성기, 기록, 공유 카드 생성이 모두 브라우저에서 실행된다. 정적 호스팅만으로 PWA 설치와 오프라인 플레이가 가능하며 API 키, 서버 비용, 개인정보 저장을 요구하지 않는다.

5. **Testable Domain Core — UI와 분리된 순수 게임 엔진**  
   보드 연산, 랭크, 분해, 생성, 점수 계산을 프레임워크와 분리된 순수 TypeScript 모듈로 작성한다. Codex가 구현·리팩터링·속성 테스트를 수행하기 쉬우며, 수학적 불변식을 CI에서 검증할 수 있다.

### 1.4. 출시 범위 (Release Scope)

| 영역 | v1.0 필수 범위 | 이후 확장 |
|---|---|---|
| 튜토리얼 | 3×3·4×4 기반 6개 인라인 레벨 | 상황별 인터랙티브 도움말 |
| Lab | 4개 챕터 × 12레벨, 총 48레벨 | 신규 챕터·주간 팩 |
| Daily Signal | UTC 날짜 기준 동일 퍼즐, 연속 기록 | 온라인 통계·친구 비교 |
| Sprint | 180초 연속 퍼즐 | 일일 시드 Sprint·리더보드 |
| Archive | 지난 Daily 재생, 로컬 완료 표시 | 시즌별 컬렉션 |
| 공유 | 텍스트, 1080×1080, 1200×630 | 동영상 리플레이 카드 |
| 접근성 | 키보드, 고대비 상태, 모션 감소, 한·영 | 추가 언어·스크린리더 최적화 |
| 저장 | LocalStorage 기반 진행도·설정 | 계정 연동 클라우드 세이브 |
| 배포 | GitHub Pages PWA | 앱 스토어용 TWA/Capacitor 래핑 |

> **출시 완성도 기준**: v1.0은 웹 게임의 콘텐츠·UX·접근성·저장·오프라인·QA가 상용 배포 수준으로 닫힌 상태를 의미한다. Play Store 패키징은 게임 완성도와 별개인 유통 채널 래핑 작업으로 분리하며, 예선 제출 빌드의 범위를 축소하는 근거로 사용하지 않는다.

---

## 2. 상세 기능 요구사항 (Detailed Requirements)

### 2.1. 시스템 환경 및 인터페이스 (System & Interface)

#### 2.1.1. 실행 환경

- **애플리케이션 유형**: Client-only Single Page Application + Progressive Web App
- **호스팅**: GitHub Pages를 1차 배포 대상으로 하며, 동일 빌드를 Cloudflare Pages 또는 다른 정적 호스팅에 미러링할 수 있다.
- **네트워크 의존성**: 최초 설치·업데이트 외에는 필수 네트워크 요청이 없어야 한다.
- **지원 보드 크기**: v1.0에서 3×3~6×6 정사각형 보드. 내부 엔진은 최대 8×8까지 확장 가능하도록 작성한다.
- **지원 언어**: 한국어, 영어. URL 또는 저장 설정을 통해 전환하며 텍스트를 이미지에 포함하지 않는다.
- **뷰 모드**: Mobile First + Fluid Layout
- **최소 기준 뷰포트**: 360×640 CSS px
- **테마 정책**: `prefers-color-scheme`을 기본값으로 사용하고 사용자의 수동 선택을 우선한다. `system`, `dark`, `light`, `high-contrast` 값을 지원한다.

#### 2.1.2. 라우팅

GitHub Pages의 직접 경로 404를 피하기 위해 Hash Router를 기본으로 사용한다.

```text
/#/                          홈
/#/tutorial                  첫 사용자 튜토리얼
/#/lab                       Lab 챕터 목록
/#/lab/:levelId              개별 Lab 퍼즐
/#/daily                     오늘의 Daily Signal
/#/daily/:yyyy-mm-dd         아카이브 Daily
/#/sprint                    180초 Sprint
/#/archive                   Daily 기록 달력
/#/settings                  설정
/#/about                     규칙·수학·크레딧
```

- 존재하지 않는 라우트는 홈으로 강제 이동하지 않고 오류 안내와 복구 버튼을 제공한다.
- `:levelId`와 날짜 파라미터는 허용 형식만 파싱하며 문자열을 HTML로 삽입하지 않는다.
- 공유 링크는 퍼즐 ID만 포함하며 실제 해답이나 이동 기록은 URL에 넣지 않는다.

#### 2.1.3. 입력 장치

- Pointer Events를 기준으로 마우스·터치·펜을 단일 처리한다.
- 키보드만으로 모든 게임 조작과 설정 변경이 가능해야 한다.
- 기본 키 매핑:
  - `Tab` / `Shift+Tab`: 포커스 이동
  - `Enter` / `Space`: 행·열 선택 토글
  - `P` 또는 `Ctrl/Cmd+Enter`: PULSE
  - `Z`: Undo
  - `H`: Hint
  - `Escape`: 설정·힌트 패널 닫기
  - `Shift+R`: Reset 확인 열기
- 터치 타깃은 최소 44×44 CSS px을 확보한다.
- 드래그 입력은 핵심 규칙으로 사용하지 않는다. 스크롤과 선택 충돌을 피하기 위해 모든 축 선택은 명시적 탭/클릭으로 처리한다.

#### 2.1.4. 애플리케이션 상태

게임 세션은 아래 상태를 가진다.

```text
loading → ready → selecting → pulsing → selecting
                              └──────→ solved → result
ready/selecting ─────────────→ paused
loading/ready ───────────────→ error → recover
```

- `pulsing` 중에는 중복 입력을 잠시 잠그며, 애니메이션 종료 후 안정 상태에서 저장한다.
- 모션 감소가 활성화되면 `pulsing` 시각 지연을 최소화하되 상태 전이는 동일하게 유지한다.
- 결과 화면에서 보드로 돌아가 풀이를 검토할 수 있으나 완료 기록은 최초 확정 결과를 기준으로 저장한다.

### 2.2. 사용자 상호작용 로직 (Interaction Logic)

#### 2.2.1. 기본 규칙

1. 보드는 `N×N` 이진 셀로 구성된다. 각 셀은 `OFF(0)` 또는 `ON(1)` 상태다.
2. 플레이어는 왼쪽 레일에서 하나 이상의 행을 선택한다.
3. 플레이어는 위쪽 레일에서 하나 이상의 열을 선택한다.
4. 행과 열이 각각 하나 이상 선택됐을 때만 `PULSE`가 활성화된다.
5. `PULSE`를 실행하면 선택한 행과 열의 모든 교차점이 반전된다.
6. 반전은 `0 → 1`, `1 → 0`의 XOR 연산이다.
7. 펄스 적용 후 선택 레일은 기본적으로 초기화된다.
8. 현재 보드가 목표 보드와 완전히 같아지면 즉시 완료 상태로 전환한다.

#### 2.2.2. 기능 요구사항 식별자

| ID | 기능 | 승인 조건 |
|---|---|---|
| FR-CORE-001 | 행·열 복수 선택 | 각 축을 독립적으로 토글하고 선택 상태가 시각·ARIA로 표시된다. |
| FR-CORE-002 | 교차점 미리보기 | PULSE 전 선택된 교차점이 실제 변경 없이 미리 표시된다. |
| FR-CORE-003 | PULSE 실행 | 선택 교차점만 정확히 XOR 반전되며 한 번의 이동으로 기록된다. |
| FR-CORE-004 | 완료 판정 | 모든 행 비트가 목표와 같을 때 한 번만 완료 이벤트가 발생한다. |
| FR-CORE-005 | Undo | 현재 세션의 직전 펄스를 역연산하고 이동 수를 복원한다. |
| FR-CORE-006 | Reset | 최초 보드로 돌아가며 확인 절차로 오동작을 방지한다. |
| FR-CORE-007 | Resume | 새로고침 후 진행 중 세션을 안전하게 복구한다. |
| FR-HINT-001 | 단계형 힌트 | 남은 최소 펄스 수 → 한 축 → 완전한 한 펄스 순으로 공개한다. |
| FR-LAB-001 | 레벨 진행 | 선행 챕터 조건과 관계없이 튜토리얼 이후 기본 챕터를 시작할 수 있다. |
| FR-DAILY-001 | 동일 일일 퍼즐 | 동일 UTC 날짜와 생성기 버전에서 동일 퍼즐이 생성된다. |
| FR-DAILY-002 | 연속 기록 | 날짜별 완료 여부와 streak를 로컬에서 계산한다. |
| FR-SPRINT-001 | 180초 세션 | 절대 종료 시각을 기준으로 카운트다운하며 연속 퍼즐을 제공한다. |
| FR-SHARE-001 | 텍스트 공유 | 정답이 없는 결과 문자열을 클립보드에 복사한다. |
| FR-SHARE-002 | 이미지 공유 | 1:1·16:9 PNG를 Canvas로 생성한다. |
| FR-PWA-001 | 오프라인 실행 | 앱 셸과 필수 콘텐츠가 캐시된 후 네트워크 없이 시작된다. |
| FR-I18N-001 | 한·영 전환 | 새로고침 없이 언어를 바꾸고 선택을 저장한다. |

#### 2.2.3. 선택·펄스 처리

- 선택은 `selectedRowsMask`, `selectedColsMask` 두 정수 비트마스크로 관리한다.
- 선택된 행 또는 열을 다시 누르면 해제한다.
- 행이나 열 중 하나가 비어 있으면 PULSE 버튼은 `disabled` 상태다.
- PULSE를 누른 순간 입력 스냅샷을 생성하고 애니메이션이 끝날 때까지 추가 입력을 차단한다.
- 로직 계산과 기록 추가는 동일한 reducer action 안에서 원자적으로 처리한다.
- 애니메이션 실패나 탭 비활성화 여부와 관계없이 보드의 논리 상태는 즉시 확정한다.
- 포인터를 빠르게 연타해도 동일한 펄스가 중복 기록되지 않아야 한다.

#### 2.2.4. Undo·Reset·Hint

- **Undo**: 마지막 `PulseMove`의 동일한 행·열 마스크를 다시 XOR하면 원상 복구된다. 이동 이력이 비어 있으면 비활성화한다.
- **Reset**: 최초 상태로 복귀하고 이동 이력·타이머·힌트 사용 상태를 초기화한다. Daily 완료 기록 자체는 삭제하지 않는다.
- **Hint 1 — Depth**: 현재 차이 행렬의 랭크, 즉 남은 최소 펄스 수를 공개한다.
- **Hint 2 — Axis**: 정규 최적 분해의 다음 펄스에서 행 또는 열 한쪽만 표시한다.
- **Hint 3 — Pulse**: 다음 최적 펄스의 행·열을 모두 표시한다. 사용자가 적용을 선택할 수 있다.
- Hint 2 이상을 사용한 경우 결과 카드에 `Hint Used`를 기록하고 최고 등급을 제한한다.

#### 2.2.5. 타이머 및 등급

- Lab·Daily 타이머는 최초 행/열 선택 시 시작한다.
- 일반 모드에서는 탭이 `hidden` 상태가 된 시간을 제외한다.
- Sprint는 `sessionEndAt` 절대 시각으로 계산하여 백그라운드 전환으로 시간이 늘어나지 않게 한다.
- 결과 등급은 아래를 기본값으로 사용하며 플레이테스트 후 조정할 수 있다.

| 등급 | 조건 |
|---|---|
| S | 최소 펄스 수와 동일, Hint 2·3 미사용 |
| A | 최소 +1 이하, 또는 최소해지만 Hint 2 사용 |
| B | 최소 +2~3, 또는 Hint 3 사용 |
| C | 그 외 완료 |

- Undo는 학습과 실험을 장려하기 위해 등급을 직접 낮추지 않는다.
- 결과에는 `사용 펄스 / 최소 펄스`, 완료 시간, 힌트 여부, 모드별 추가 점수를 표시한다.

#### 2.2.6. 모드별 규칙

| 모드 | 보드 | 종료 조건 | 기록 |
|---|---:|---|---|
| Tutorial | 3×3~4×4 | 안내 목표 달성 | 튜토리얼 단계 |
| Lab | 4×4~6×6 | 단일 퍼즐 해결 | 최고 등급·최단 시간·최소 펄스 |
| Daily Signal | 5×5 중심, 일부 4×4·6×6 | 날짜별 단일 퍼즐 해결 | 완료·streak·공유 기록 |
| Sprint | 4×4→6×6 점진 상승 | 180초 종료 | 해결 수·S 등급 수·총점 |
| Archive | Daily와 동일 | 선택 날짜 해결 | 날짜별 최고 기록 |

#### 2.2.7. 데이터 검증

- 보드 크기는 3~8 범위의 정수만 허용한다.
- 각 행 비트는 `0 <= row < 2^size`를 만족해야 한다.
- `initialRows`와 `targetRows`의 길이는 `size`와 같아야 한다.
- 일반 퍼즐에서 초기 상태와 목표 상태는 같을 수 없다.
- 저장 데이터는 스키마 버전과 런타임 타입 가드를 통과해야 한다.
- 생성된 퍼즐은 랭크, 밀도, 목표 난도, 정규 해답 재구성 검사를 모두 통과해야 한다.
- 유효하지 않은 저장 데이터는 격리 후 기본값으로 복구하며 앱 전체를 중단하지 않는다.

### 2.3. 데이터 모델 (Data Model)

#### 2.3.1. 보드 표현

v1.0의 각 행은 최대 8비트이므로 `number` 하나로 표현한다. 전체 보드는 행 비트 배열이다.

```ts
export type BoardRows = readonly number[];

// 5×5 예시
// 10101
// 00110
// 11100
// 01010
// 10001
const rows: BoardRows = [0b10101, 0b00110, 0b11100, 0b01010, 0b10001];
```

이 표현은 다음 장점을 가진다.

- 셀 배열보다 비교와 복제가 단순하다.
- 펄스는 선택 행에 대해 `row ^ colMask`만 수행하면 된다.
- 랭크 계산에서 각 행 자체를 비트 벡터로 사용할 수 있다.
- JSON 직렬화가 가능하며 BigInt 변환 문제가 없다.

#### 2.3.2. 퍼즐 정의

```ts
export type GameMode = 'tutorial' | 'lab' | 'daily' | 'sprint' | 'archive';
export type Difficulty = 'intro' | 'easy' | 'normal' | 'hard' | 'master';

export interface PuzzleDefinition {
  schemaVersion: 1;
  id: string;
  mode: GameMode;
  generatorVersion: string;
  seed?: string;
  size: number;
  initialRows: number[];
  targetRows: number[];
  optimalPulseCount: number;
  canonicalSolution?: EncodedPulse[];
  difficulty: Difficulty;
  complexityScore: number;
  tags: Array<
    | 'sparse'
    | 'dense'
    | 'symmetric'
    | 'asymmetric'
    | 'overlap'
    | 'noise'
    | 'tutorial'
  >;
  titleKey?: string;
  tutorialStepIds?: string[];
}

export interface EncodedPulse {
  rowMask: number;
  colMask: number;
}
```

- Campaign 퍼즐은 `canonicalSolution`을 빌드 타임에 포함할 수 있다.
- Daily 퍼즐은 생성 후 런타임에서 최적 분해를 산출하고 메모리 캐시에 보관한다.
- `optimalPulseCount`는 저장값을 신뢰하지 않고 개발 빌드에서 실제 랭크와 교차 검증한다.

#### 2.3.3. 세션과 이동

```ts
export interface PulseMove {
  rowMask: number;
  colMask: number;
  appliedAtMs: number;
}

export type SessionStatus =
  | 'ready'
  | 'selecting'
  | 'pulsing'
  | 'paused'
  | 'solved'
  | 'error';

export interface GameSession {
  sessionId: string;
  puzzleId: string;
  status: SessionStatus;
  currentRows: number[];
  selectedRowsMask: number;
  selectedColsMask: number;
  moves: PulseMove[];
  startedAtEpochMs: number | null;
  activeElapsedMs: number;
  hiddenAtEpochMs: number | null;
  hintLevelUsed: 0 | 1 | 2 | 3;
  undoCount: number;
  completedAtEpochMs: number | null;
}
```

#### 2.3.4. 기록과 설정

```ts
export interface PuzzleBestRecord {
  puzzleId: string;
  completed: boolean;
  bestGrade: 'S' | 'A' | 'B' | 'C' | null;
  bestPulseCount: number | null;
  bestElapsedMs: number | null;
  firstCompletedAt: string | null;
  lastCompletedAt: string | null;
}

export interface DailyRecord extends PuzzleBestRecord {
  dateUtc: string;
  sharedCount: number;
}

export interface UserSettings {
  schemaVersion: 1;
  locale: 'ko' | 'en';
  theme: 'system' | 'dark' | 'light' | 'high-contrast';
  soundEnabled: boolean;
  soundVolume: number;
  hapticsEnabled: boolean;
  reducedMotion: 'system' | 'on' | 'off';
  highContrastCells: boolean;
  showKeyboardHints: boolean;
}

export interface PersistedAppState {
  schemaVersion: 1;
  tutorialCompleted: boolean;
  labRecords: Record<string, PuzzleBestRecord>;
  dailyRecords: Record<string, DailyRecord>;
  sprintBest: {
    score: number;
    solvedCount: number;
    sGradeCount: number;
    achievedAt: string;
  } | null;
  resumableSession: GameSession | null;
}
```

#### 2.3.5. 저장 키와 마이그레이션

```text
axis-shift:settings:v1
axis-shift:progress:v1
axis-shift:session:v1
axis-shift:generator-map:v1
```

- 모든 루트 객체는 `schemaVersion`을 가진다.
- 마이그레이션은 `migrateV1ToV2()` 형태의 순차 함수로만 수행한다.
- 지원할 수 없는 미래 버전은 덮어쓰지 않고 별도 백업 키로 이동한다.
- 쓰기 중 예외가 발생하면 게임을 계속 진행하되 저장 실패 토스트를 한 번만 표시한다.

### 2.4. 출력 및 성능 기준 (Output & Performance)

#### 2.4.1. 결과물 형식

- 반응형 React SPA 정적 빌드
- 설치 가능한 PWA manifest 및 service worker
- 게임 진행도와 설정을 저장하는 LocalStorage JSON
- 공유용 UTF-8 텍스트
- 공유용 PNG Blob
  - 1080×1080: 일반 SNS 카드
  - 1200×630: 링크·썸네일형 카드
- `docs/` 아래 기술·디자인·QA·라이선스 문서

#### 2.4.2. 성능 예산

| 항목 | 목표 |
|---|---:|
| 초기 JavaScript gzip | 180KB 이하 권장, 230KB 상한 |
| 초기 CSS gzip | 35KB 이하 |
| 첫 화면 필수 정적 자산 | 1MB 이하 |
| 전체 앱 셸·콘텐츠 캐시 | 4MB 이하 |
| LCP | 중급 모바일 4G 기준 2.0초 이내 목표 |
| INP | 200ms 이내 목표 |
| CLS | 0.05 이하 |
| 선택 입력 피드백 | 50ms 이내 |
| 일반 애니메이션 | 60fps 목표, transform·opacity 중심 |
| 퍼즐 생성 | 50ms 이내 목표, 200ms 상한 |
| 랭크·최적 분해 | 10ms 이내 목표 |
| 공유 카드 생성 | 일반 모바일에서 500ms 이내 목표 |

수치는 출시 차단 기준이 아니라 목표 예산이며, Lighthouse와 실기기 측정 결과를 `docs/QA_REPORT.md`에 기록한다.

#### 2.4.3. 품질 기준

- 최신 주요 데스크톱·모바일 브라우저의 현재 버전과 직전 주요 버전을 목표로 한다.
- JavaScript가 활성화된 환경을 전제로 하며, 비활성화 시 설명과 GitHub 링크를 제공한다.
- 가로 스크롤이 발생하지 않아야 한다.
- 360px 폭에서 6×6 보드의 각 축 선택 버튼이 44px 타깃을 유지해야 한다.
- 색상만으로 ON/OFF·선택·오류 상태를 구분하지 않는다.
- 모든 핵심 기능은 키보드로 실행 가능해야 한다.
- 퍼즐 도메인 모듈의 테스트 커버리지는 95% 이상을 목표로 한다.
- 생성된 퍼즐은 100% 재구성 검사와 랭크 검사를 통과해야 빌드에 포함된다.

---

## 3. 기술 스택 및 라이브러리 (Tech Stack)

### 3.1. Core

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **Routing**: Hash-based client router
- **Styling**: CSS Modules + Global CSS Variables
- **Backend**: 없음
- **Database**: 없음
- **Persistence**: LocalStorage, 메모리 캐시
- **Offline**: Service Worker + Web App Manifest
- **Hosting**: GitHub Pages
- **Package Manager**: npm + `package-lock.json`
- **Runtime Policy**: 저장소의 `.nvmrc`와 CI에서 동일한 Node.js 메이저 버전을 고정한다.

#### 스택 선정 원칙

1. 게임 코어에 2D 물리·렌더링 엔진이 필요하지 않으므로 Phaser, PixiJS, Three.js를 사용하지 않는다.
2. 6×6 이하 DOM/SVG는 성능 부담이 작고 접근성이 높으므로 Canvas를 보드 렌더러로 사용하지 않는다.
3. 공유 이미지만 Canvas 2D API로 생성한다.
4. 상태 관리 라이브러리를 도입하지 않고 `useReducer`, Context, 순수 도메인 함수로 구성한다.
5. 외부 런타임 API와 CDN 의존성을 제거하여 오프라인·정적 배포를 보장한다.

### 3.2. Libraries & Tools

| 도구 | 구분 | 용도 | 정책 |
|---|---|---|---|
| React | 필수 | UI 컴포넌트와 상태 연결 | 렌더링 계층에만 사용 |
| TypeScript | 필수 | 도메인 타입·엄격 검증 | `strict: true` |
| Vite | 필수 | 개발 서버·빌드·자산 처리 | `base`를 환경별 설정 |
| react-router-dom | 선택/권장 | Hash Router와 화면 분리 | 라우트 데이터는 최소화 |
| vite-plugin-pwa | 권장 | manifest·service worker 구성 | 업데이트는 prompt 방식 |
| Vitest | 필수 | 단위·도메인 테스트 | 퍼즐 엔진 집중 |
| Testing Library | 필수 | 사용자 관점 컴포넌트 테스트 | 구현 세부 대신 역할 기반 |
| Playwright | 필수 | 모바일·데스크톱 E2E | 주요 브라우저 프로젝트 구성 |
| @axe-core/playwright | 권장 | 자동 접근성 검사 | 주요 화면마다 실행 |
| ESLint | 필수 | 정적 분석 | TypeScript·React 규칙 적용 |
| Prettier | 필수 | 포맷 통일 | CI에서 검사 |

#### 사용 Web API

- Canvas 2D API: 공유 이미지 렌더링
- Web Share API: 지원 환경에서 텍스트·파일 공유
- Clipboard API: 텍스트 결과 복사
- Web Audio API: 짧은 합성 효과음
- Vibration API: 선택적 햅틱
- Web Crypto API: Signal Signature 해시
- Page Visibility API: 타이머 처리
- `Intl`: 날짜·숫자·시간 현지화
- LocalStorage: 진행도·설정·복구 세션

모든 선택적 Web API는 기능 감지 후 사용하며, 미지원 시 게임 플레이 자체에 영향을 주지 않는 폴백을 제공한다.

### 3.3. 의존성 및 버전 정책

- `package.json`의 버전 범위와 별개로 `package-lock.json`을 반드시 커밋한다.
- 예선 제출 72시간 전부터 기능 의존성 업그레이드를 동결한다.
- 빌드 시점의 정확한 버전은 `docs/RELEASE_NOTES.md`에 기록한다.
- 런타임 의존성은 가능한 5개 이하로 유지한다.
- UI 아이콘은 범용 아이콘 패키지 대신 프로젝트 전용 SVG를 사용한다.
- 폰트·음원·그래픽 자산은 `docs/ASSET_LICENSES.md`에 원본, 저작자, 라이선스, 수정 여부를 기록한다.
- 취약점 수정 외 자동 의존성 업데이트는 릴리스 브랜치에 직접 병합하지 않는다.

---

## 4. 아키텍처 및 로직 (Architecture & Logic)

### 4.1. 상태 관리 전략 (State Management)

#### 4.1.1. 계층 구조

```text
Presentation Layer
  React pages / components / CSS / ARIA
          ↓ commands, selectors
Application Layer
  session reducer / mode controllers / use cases
          ↓ pure domain calls
Domain Layer
  board / pulse / rank / factorization / generator / scoring
          ↓ adapters
Infrastructure Layer
  storage / PWA / share canvas / audio / clock / hash
```

- Domain Layer는 React, DOM, LocalStorage를 import하지 않는다.
- 현재 시각, 난수, 저장소, 해시 함수는 인터페이스로 주입해 테스트 가능하게 한다.
- UI는 보드 배열을 직접 수정하지 않고 reducer action을 발행한다.
- 모드 차이는 `ModePolicy` 객체로 캡슐화하고 코어 펄스 로직을 복제하지 않는다.

#### 4.1.2. 상태 범위

- **전역 설정**: Locale, Theme, Sound, Motion은 `SettingsContext`에서 관리한다.
- **전역 진행도**: 완료 기록은 `ProgressRepository`를 통해 읽고 화면별 selector로 전달한다.
- **세션 상태**: 게임 화면 내부 `useReducer`로 관리한다.
- **UI 지역 상태**: 토스트, 드로어, 포커스 위치는 각 컴포넌트에 둔다.
- **파생 상태**: 일치 셀, PULSE 활성 여부, 현재 차이 랭크 등은 저장하지 않고 selector에서 계산한다.

```ts
interface GameState {
  puzzle: PuzzleDefinition;
  session: GameSession;
  result: GameResult | null;
  ui: {
    hintPanelOpen: boolean;
    resetConfirmationOpen: boolean;
    focusedAxis: 'rows' | 'cols' | null;
  };
}

type GameAction =
  | { type: 'TOGGLE_ROW'; index: number }
  | { type: 'TOGGLE_COL'; index: number }
  | { type: 'APPLY_PULSE'; now: number }
  | { type: 'PULSE_ANIMATION_FINISHED' }
  | { type: 'UNDO' }
  | { type: 'RESET_CONFIRMED' }
  | { type: 'USE_HINT'; level: 1 | 2 | 3 }
  | { type: 'VISIBILITY_CHANGED'; hidden: boolean; now: number };
```

#### 4.1.3. 불변성

- `PuzzleDefinition`은 세션 동안 불변이다.
- reducer는 입력 상태를 직접 수정하지 않고 새 배열·객체를 반환한다.
- `currentRows.length === puzzle.size`를 항상 유지한다.
- 선택 마스크는 `size` 바깥 비트를 가질 수 없다.
- `moves.length`는 현재 보드에 실제로 적용된 펄스 수와 일치한다.
- `solved` 이후 펄스 action은 무시한다.

### 4.2. 주요 동작 파이프라인 (Main Workflow)

#### 4.2.1. 초기화 (Init)

1. `import.meta.env.BASE_URL`을 기반으로 정적 자산 경로를 설정한다.
2. 설정과 진행도 JSON을 읽고 스키마 마이그레이션 및 검증을 수행한다.
3. 시스템 언어·테마·모션 설정을 해석하되 저장된 사용자의 명시적 선택을 우선한다.
4. 현재 라우트와 재개 가능한 세션을 비교한다.
5. 캠페인 퍼즐을 정적 JSON에서 읽거나 Daily 퍼즐을 생성한다.
6. 퍼즐의 보드 형식·랭크·최적해를 검증한다.
7. PWA 업데이트가 있으면 플레이 중단 없이 배너로 알린다.
8. 초기 포커스를 페이지 제목 또는 첫 주요 CTA로 이동한다.

#### 4.2.2. 퍼즐 로드

```text
Route Request
  → PuzzleSource.resolve(route)
  → PuzzleDefinition validation
  → rank(initial XOR target)
  → canonical factorization
  → mode policy initialization
  → render ready state
```

- 캠페인 파일의 `optimalPulseCount`가 실제 랭크와 다르면 개발 빌드에서는 예외, 프로덕션에서는 해당 레벨을 비활성화하고 복구 화면을 표시한다.
- Daily 생성이 제한 횟수 안에 성공하지 못하면 해당 난도용 사전 검증 fallback 퍼즐을 사용한다.

#### 4.2.3. 펄스 처리

1. 행·열 선택 마스크를 검증한다.
2. 최초 액션이면 타이머를 시작한다.
3. 선택된 각 행에 대해 `currentRows[row] ^= selectedColsMask`를 실행한다.
4. `PulseMove`를 이력에 추가한다.
5. 선택 마스크를 0으로 초기화한다.
6. 목표 상태와 비교한다.
7. 완료 시 결과를 계산하고 진행도를 저장한다.
8. 미완료 시 안정 상태로 돌아간다.

#### 4.2.4. 결과 생성

```text
Solved State
  → elapsed time normalization
  → used pulses / optimal pulses
  → grade calculation
  → best-record comparison
  → persistence
  → Signal Signature hash
  → result scene
```

- 최고 기록 갱신은 등급, 펄스 수, 시간 순으로 비교한다.
- 공유 횟수는 실제 공유 API 성공을 보장할 수 없으므로 사용자가 공유 CTA를 실행한 횟수만 기록한다.
- 결과 카드의 생성 실패는 게임 완료 기록에 영향을 주지 않는다.

### 4.3. 핵심 알고리즘 (Core Algorithms)

#### 4.3.1. 수학 모델

크기 `N`의 현재 보드를 `B`, 목표 보드를 `T`라 하며 각 원소는 `GF(2)={0,1}`에 속한다. 선택 행 벡터를 `r`, 선택 열 벡터를 `c`라고 하면 한 번의 펄스는 다음과 같다.

```text
B' = B ⊕ (r ⊗ c)
```

- `⊕`: 원소별 XOR
- `⊗`: 외적. `r_i = 1`이고 `c_j = 1`인 교차점만 1이 된다.

목표까지 바꿔야 할 셀은 차이 행렬 `D`다.

```text
D = B ⊕ T
```

`D`를 rank-1 외적들의 합으로 표현하면 해당 외적 각각이 한 번의 펄스가 된다.

#### 4.3.2. 최소 펄스 수 정리

```text
minimumPulses(B, T) = rank_GF(2)(B ⊕ T)
```

근거는 다음과 같다.

1. 각 펄스 `r ⊗ c`의 랭크는 0 또는 1이다.
2. `k`개의 rank-1 행렬 합의 랭크는 최대 `k`이므로, `D`의 랭크가 `q`라면 최소 `q`회 이상 필요하다.
3. 랭크 분해 `D = X·Y`에서 `X`의 각 열과 `Y`의 각 행을 외적으로 합하면 정확히 `q`개의 펄스로 `D`를 구성할 수 있다.
4. 따라서 하한과 상한이 같아 최소 펄스 수는 `rank_GF(2)(D)`다.

이 정리는 퍼즐의 목표 횟수, S 등급, 힌트, 생성기 검증의 단일 진실 공급원이다.

#### 4.3.3. 펄스 적용

```ts
export function applyPulse(
  rows: readonly number[],
  rowMask: number,
  colMask: number,
): number[] {
  return rows.map((rowBits, rowIndex) =>
    rowMask & (1 << rowIndex) ? rowBits ^ colMask : rowBits,
  );
}
```

- 시간 복잡도: `O(N)`
- 공간 복잡도: `O(N)`
- 동일 펄스를 두 번 적용하면 원상 복구된다.
- 서로 다른 펄스의 적용 순서는 XOR 교환법칙 때문에 최종 결과에 영향을 주지 않는다.

#### 4.3.4. `GF(2)` 랭크 계산

행 비트를 복사한 뒤 높은 열부터 피벗을 찾는 가우스 소거법을 사용한다.

```ts
export function gf2Rank(inputRows: readonly number[], width: number): number {
  const rows = [...inputRows];
  let rank = 0;

  for (let col = width - 1; col >= 0 && rank < rows.length; col -= 1) {
    const pivot = rows.findIndex((row, index) => index >= rank && (row & (1 << col)) !== 0);
    if (pivot === -1) continue;

    [rows[rank], rows[pivot]] = [rows[pivot], rows[rank]];

    for (let row = 0; row < rows.length; row += 1) {
      if (row !== rank && (rows[row] & (1 << col)) !== 0) {
        rows[row] ^= rows[rank];
      }
    }
    rank += 1;
  }

  return rank;
}
```

실제 구현에서는 `findIndex` 범위와 정적 분석 규칙을 최적화하되 동작 원리를 유지한다.

#### 4.3.5. 최적 펄스 분해

1. 차이 행렬의 독립 행 집합을 찾는다.
2. 랭크가 `q`라면 `q`개의 기저 행을 선택한다.
3. 각 원본 행을 기저 행들의 XOR 조합으로 표현한다.
4. 기저 행 `k`를 `colMask_k`로 사용한다.
5. 해당 기저가 포함되는 원본 행 인덱스를 모아 `rowMask_k`로 사용한다.
6. `q`개의 `(rowMask_k, colMask_k)`가 최적 펄스 분해다.

보드가 최대 6×6이므로 각 원본 행의 기저 조합을 `2^q` 전수 탐색해도 충분히 빠르다. 여러 독립 행 집합이 가능한 경우 다음 비용 함수를 최소화하는 정규 해답을 선택한다.

```text
gestureCost = Σ(popcount(rowMask) + popcount(colMask))
             + overlapPenalty
             + imbalancePenalty
```

- `gestureCost`가 낮을수록 힌트가 이해하기 쉽다.
- 정규 해답은 유일한 최적해를 의미하지 않는다. 힌트와 생성기 평가를 위한 대표 해답이다.
- 모든 분해는 다시 합성하여 원래 차이 행렬과 같은지 검증한다.

#### 4.3.6. 일치·차이 계산

```ts
export function diffRows(current: readonly number[], target: readonly number[]): number[] {
  return current.map((row, index) => row ^ target[index]);
}

export function isSolved(current: readonly number[], target: readonly number[]): boolean {
  return current.every((row, index) => row === target[index]);
}
```

#### 4.3.7. 난도 휴리스틱

수학적 랭크만으로 체감 난도를 완전히 설명할 수 없으므로 다음 정규화 지표를 결합한다.

- `rankFactor`: 최소 펄스 수
- `sizeFactor`: 보드 크기
- `overlapIndex`: 정규 해답 펄스 간 교차 셀 중첩률
- `dispersionIndex`: 켜진 셀의 공간적 분산도
- `noiseRatio`: 초기 상태가 빈 보드가 아닌 경우의 혼잡도
- `symmetryScore`: 수평·수직·회전 대칭성. 대칭이 높으면 대체로 인지 부담이 낮다.
- `gestureCost`: 최적해의 총 행·열 선택 수

```text
complexityScore =
  20 × (rankFactor - 1)
  + 5 × (sizeFactor - 3)
  + 12 × overlapIndex
  + 8 × dispersionIndex
  + 8 × noiseRatio
  + 6 × (1 - symmetryScore)
  + normalizedGestureCost
```

이 점수는 자동 필터와 초기 배치용이며 최종 Lab 난도는 사람 플레이테스트로 재분류한다.

### 4.4. 결정적 퍼즐 생성기 (Deterministic Generator)

#### 4.4.1. 시드

```text
seedInput = "axis-shift|daily|{generatorVersion}|{UTC yyyy-mm-dd}"
seedHash  = SHA-256(seedInput)
prngSeed  = hash 앞 32비트
```

- Daily 기준 시각은 UTC 00:00이다.
- 화면에는 사용자의 현지 날짜와 다음 퍼즐까지 남은 시간을 표시한다.
- `generatorVersion`을 포함하여 알고리즘 수정 후 과거 퍼즐이 바뀌는 것을 방지한다.
- 생성기 버전 적용 기간을 `generator-map`에 저장한다.

#### 4.4.2. 난도 스케줄

초기 기본 스케줄은 다음과 같다.

| 요일(UTC) | 보드 | 목표 랭크 | 성격 |
|---|---:|---:|---|
| 월 | 4×4 | 2 | 짧고 대칭적인 시작 |
| 화 | 5×5 | 3 | 희소 패턴 |
| 수 | 5×5 | 3 | 중첩 중심 |
| 목 | 5×5 | 4 | 일반 도전 |
| 금 | 6×6 | 4 | 넓은 패턴 |
| 토 | 6×6 | 5 | 주간 최고 난도 |
| 일 | 5×5 | 4 | 시각적 특수 패턴 |

난도는 날짜 해시로 일부 변형하되 목표 랭크 범위를 벗어나지 않는다.

#### 4.4.3. 생성 절차

```text
1. 날짜 시드로 PRNG 초기화
2. 보드 크기·목표 랭크 결정
3. 서로 독립인 row vector와 column vector 쌍 생성
4. rank-1 외적을 XOR 합성해 차이 행렬 생성
5. 실제 GF(2) 랭크가 목표와 같은지 검증
6. 밀도·빈 행/열·대칭·gestureCost 조건 검사
7. 초기 보드 생성 후 target = initial XOR diff 계산
8. 정규 최적 분해 재구성 검증
9. 통과 시 PuzzleDefinition 반환
10. 최대 시도 초과 시 사전 검증 fallback 사용
```

#### 4.4.4. 필터 조건

- 전체 ON 밀도 22%~68%
- 모든 셀이 OFF 또는 ON인 목표 제외
- 튜토리얼 외에는 차이 행렬이 한 행 또는 한 열에만 몰린 문제 제한
- 목표 랭크와 실제 랭크 일치
- 정규 해답의 각 `rowMask`, `colMask`가 0이 아님
- 최적 분해 재합성 결과가 차이 행렬과 일치
- 연속 Daily 간 동일 목표 패턴 해시 중복 방지
- 시각적으로 해석 불가능한 과도한 노이즈는 난도별 임계값으로 제외

#### 4.4.5. 생성 실패 대응

- 단일 퍼즐 생성 최대 시도: 512회
- 실패 시 난도별 정적 fallback 풀에서 날짜 해시로 선택
- fallback 사용 여부는 개발 로그에만 남기며 사용자에게 오류로 표시하지 않는다.
- CI에서 향후 3,650일 분량을 샘플 생성하여 실패율과 중복률을 검사한다.

### 4.5. 콘텐츠 파이프라인

- Lab 레벨은 `src/content/levels/*.json`에 체크인한다.
- 개발용 `scripts/generate-level-candidates.ts`가 후보를 생성한다.
- `scripts/validate-levels.ts`가 스키마·랭크·최적해·중복을 검사한다.
- 사람이 후보를 플레이하고 난도·패턴·튜토리얼 적합성을 승인한다.
- 승인된 콘텐츠만 프로덕션 번들에 포함한다.
- 레벨 ID는 한번 배포하면 변경하지 않는다.

```text
lab-01-pulse-01
lab-01-pulse-02
lab-02-echo-01
lab-03-rank-01
lab-04-noise-01
```

### 4.6. 저장 및 복구 (Persistence & Recovery)

1. 안정 상태(`ready`, `selecting`, `solved`)에서만 세션을 저장한다.
2. 펄스 애니메이션 도중 페이지가 종료되더라도 논리 적용이 끝난 상태를 저장한다.
3. 저장 JSON은 최대 수십 KB 수준으로 제한한다.
4. 앱 시작 시 JSON parse, schema version, 필드 범위, 퍼즐 존재 여부를 검사한다.
5. 손상된 세션은 제거하되 Lab·Daily 최고 기록은 별도 객체에서 보존한다.
6. Private Browsing 또는 저장 용량 예외가 발생하면 세션 내 메모리 모드로 계속 실행한다.
7. 설정 변경은 즉시 저장하고 진행도 쓰기는 완료·펄스 후에 수행한다.
8. 세션 복구 안내는 진행 중 퍼즐이 있을 때만 홈에 인라인 카드로 표시한다.

### 4.7. 공유 파이프라인 (Sharing Pipeline)

#### 4.7.1. Signal Signature

정답 유출을 방지하기 위해 실제 보드나 선택 마스크를 직접 표현하지 않는다.

```text
signatureInput =
  "axis-shift|signature-v1|"
  + puzzleId + "|"
  + normalizedMoveSequence + "|"
  + grade + "|"
  + elapsedBucket

signatureHash = SHA-256(signatureInput)
```

- 해시 바이트를 3×5 또는 5×5 추상 패턴, 선 방향, 밀도에 매핑한다.
- 동일한 퍼즐에서 동일한 풀이 기록은 동일한 서명을 만든다.
- 해시는 일방향 표현이므로 목표 패턴을 복원하는 정보로 사용하지 않는다.
- 텍스트 공유에서는 `▰`, `▱`, `◆`, `◇` 등 색상 비의존 문자를 사용한다.

#### 4.7.2. 텍스트 예시

```text
AXIS//SHIFT #018

Signal Grade S
4 / 4 Pulses · 00:51 · No Hint

▰▱▰▰▱
▱▰▱▰▰
▰▰▱▱▰

https://example.github.io/axis-shift/#/daily/2026-08-09
```

#### 4.7.3. 이미지 생성

- Canvas를 device-independent 고정 해상도로 생성한다.
- 카드에는 브랜드, 퍼즐 ID, 등급, 펄스·시간, 배지, Signal Signature, 짧은 URL만 포함한다.
- 목표 보드·현재 보드·실제 선택 기록은 포함하지 않는다.
- 테마와 무관하게 브랜드 다크 팔레트를 사용하여 공유 피드에서 일관성을 유지한다.
- 폰트 로딩 실패 시 시스템 sans-serif로 대체하고 레이아웃을 재계산한다.
- PNG Blob 생성 실패 시 텍스트 복사 CTA만 남긴다.

#### 4.7.4. 공유 폴백

```text
Web Share + files 지원 → PNG 파일과 텍스트 공유
Web Share 텍스트만 지원 → 텍스트와 URL 공유
Clipboard 지원 → 결과 텍스트 복사
둘 다 미지원 → 선택 가능한 textarea에 결과 표시
```

### 4.8. PWA 및 오프라인 전략

- 앱 셸, 아이콘, 번들, Lab 콘텐츠, 기본 fallback 퍼즐을 precache한다.
- 외부 CDN과 런타임 폰트 요청을 사용하지 않는다.
- service worker 업데이트는 즉시 강제 적용하지 않고 `새 버전 사용 가능` 배너를 제공한다.
- 진행 중 세션이 있을 때 새 버전 적용 전 저장을 완료한다.
- 오프라인 상태에서는 Daily를 기기 날짜로 생성한다.
- 기기 시계 조작은 v1.0에서 제한하지 않으며 서버 랭킹이 없으므로 공정성 문제로 취급하지 않는다.
- 업데이트 후 생성기 버전 매핑을 유지하여 과거 아카이브가 바뀌지 않게 한다.

### 4.9. 보안 및 개인정보 (Security & Privacy)

- API 키, 사용자 토큰, 비밀값을 번들에 포함하지 않는다.
- 계정, 이메일, 닉네임, 위치, 연락처를 수집하지 않는다.
- 기본 배포에는 외부 분석 SDK를 포함하지 않는다.
- 공유 카드는 사용자 식별자를 포함하지 않는다.
- `dangerouslySetInnerHTML`을 사용하지 않는다.
- URL 파라미터와 저장 데이터는 allowlist 기반으로 파싱한다.
- Content Security Policy는 self-hosted script/style/image를 기준으로 설정한다.
- 외부 링크는 `rel="noopener noreferrer"`를 사용한다.
- service worker는 프로젝트 base path 범위 안에서만 등록한다.
- 의존성 감사와 라이선스 검사를 릴리스 체크리스트에 포함한다.

---

## 5. UI 구현 가이드 (Implementation Guide)

디자인의 시각 규칙은 디자인 백서를 단일 기준으로 하며, 본 장은 코드 구현에 필요한 인터페이스와 토큰 연결만 정의한다.

### 5.1. 디자인 토큰 (Design Tokens)

```css
:root {
  --color-bg: #f5f7fa;
  --color-surface: #ffffff;
  --color-surface-raised: #eef2f6;
  --color-text: #111821;
  --color-text-muted: #5f6b7a;
  --color-border: #d7dee8;
  --color-primary: #007e69;
  --color-on-primary: #ffffff;
  --color-secondary: #6b57d9;
  --color-warning: #9a5b00;
  --color-danger: #b4233d;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;

  --motion-fast: 120ms;
  --motion-normal: 220ms;
  --motion-slow: 650ms;
}

[data-theme='dark'] {
  --color-bg: #070a0f;
  --color-surface: #0f141c;
  --color-surface-raised: #161d28;
  --color-text: #f4f7fa;
  --color-text-muted: #9ba8b8;
  --color-border: #2a3442;
  --color-primary: #72f2c5;
  --color-on-primary: #07110e;
  --color-secondary: #8da2ff;
  --color-warning: #ffc65c;
  --color-danger: #ff6b7a;
}
```

- **Typography**: 시스템 UI sans-serif를 본문 기본으로 사용하고 수치에는 `ui-monospace`를 사용한다.
- **Base Size**: 16px
- **Breakpoints**:
  - Compact: `< 480px`
  - Mobile/Tablet: `480px~767px`
  - Tablet: `768px~1023px`
  - Desktop: `>= 1024px`
  - Wide: `>= 1280px`
- Breakpoint보다 실제 컨테이너 폭에 반응할 수 있도록 핵심 스테이지에 Container Query 사용을 고려한다.

### 5.2. 공통 컴포넌트 (Shared Components)

#### `AxisToggle`

```ts
interface AxisToggleProps {
  axis: 'row' | 'column';
  index: number;
  selected: boolean;
  disabled?: boolean;
  onToggle(index: number): void;
}
```

- 실제 `<button>` 사용
- `aria-pressed` 제공
- 화면 표시 라벨과 스크린리더 라벨 분리

#### `TensorGrid`

```ts
interface TensorGridProps {
  size: number;
  rows: readonly number[];
  previewRowMask: number;
  previewColMask: number;
  targetRows?: readonly number[];
  readOnly?: boolean;
  phase: 'idle' | 'preview' | 'pulsing' | 'solved';
}
```

- 메인 보드는 CSS Grid로 렌더링한다.
- 각 셀은 읽기 전용 상태 요소이며 수십 개 이하이므로 가상화하지 않는다.
- 스크린리더에는 모든 셀을 반복 읽기보다 요약과 포커스 가능한 `보드 상태 설명`을 제공한다.

#### `PulseButton`

```ts
interface PulseButtonProps {
  disabled: boolean;
  selectedRowCount: number;
  selectedColCount: number;
  onPulse(): void;
}
```

- 게임 화면에서 항상 가장 강한 시각적 우선순위를 가진다.
- 모바일에서는 safe area를 고려한 하단 sticky 영역에 위치한다.
- 버튼 라벨은 기본 `PULSE`, 보조 텍스트로 예상 반전 셀 수를 표시할 수 있다.

#### `TargetPreview`

- 목표 패턴만 표시하고 입력을 받지 않는다.
- 메인 보드보다 작은 셀과 낮은 애니메이션 강도를 사용한다.
- 모바일에서는 접을 수 있지만 완전히 숨기지 않는다.

#### `StatusStrip`

- 퍼즐 ID, 사용 펄스, 최소 펄스, 시간, 힌트 상태를 표시한다.
- 수치는 고정 폭 숫자 기능 또는 monospace를 사용하여 레이아웃 흔들림을 방지한다.

#### `ResultPanel`

- 완료 시 포커스를 제목으로 이동한다.
- 공유·다시 플레이·다음 퍼즐을 제공한다.
- `dialog`를 사용할 경우 focus trap, Escape, 배경 inert를 구현한다.
- 모바일에서는 전체 화면 결과 scene 또는 bottom sheet 중 하나로 일관되게 구현한다.

#### `Toast`

- 복사 완료, 저장 실패, 오프라인, 업데이트 안내에 사용한다.
- 핵심 오류를 Toast만으로 전달하지 않는다.
- `aria-live="polite"`, 최대 1개 표시, 자동 닫힘 3~5초.

### 5.3. 애니메이션 구현

- 레이아웃 속성 대신 transform과 opacity를 우선한다.
- 셀 36개를 넘는 동시 blur·box-shadow 애니메이션을 금지한다.
- 펄스 시퀀스:
  1. 축 선택 충전 80ms
  2. 교차점 반전 140ms
  3. 안정화 80ms
- 성공 연출은 650ms 이내이며 입력 가능한 결과 CTA를 지연시키지 않는다.
- `prefers-reduced-motion`에서는 이동·확대 대신 즉시 색·테두리 변경으로 대체한다.
- 애니메이션 종료 이벤트에 비즈니스 로직을 의존하지 않는다.

### 5.4. 사운드·햅틱 구현

- Web Audio API로 짧은 합성음을 만들어 별도 음원 용량과 라이선스 문제를 줄인다.
- 첫 사용자 제스처 이후 AudioContext를 초기화한다.
- 행·열 선택, PULSE, 완료, 오류의 음색을 구분한다.
- 반복 선택음은 100ms 이내, 완료음은 800ms 이내를 권장한다.
- `navigator.vibrate`는 기능 감지하고 사용자 설정이 켜졌을 때만 호출한다.
- 사운드와 햅틱이 없어도 동일한 상태 정보를 화면에서 확인할 수 있어야 한다.

---

## 6. 파일 구조 (File Structure)

```text
axis-shift/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy-pages.yml
├── docs/
│   ├── TECHNICAL_WHITEPAPER.md
│   ├── DESIGN_WHITEPAPER.md
│   ├── CODEX_COLLABORATION.md
│   ├── PUZZLE_MATH.md
│   ├── QA_REPORT.md
│   ├── RELEASE_CHECKLIST.md
│   └── ASSET_LICENSES.md
├── public/
│   ├── icons/
│   ├── og/
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── robots.txt
├── scripts/
│   ├── generate-level-candidates.ts
│   ├── validate-levels.ts
│   ├── audit-daily-generator.ts
│   └── export-share-fixtures.ts
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── error-boundary.tsx
│   ├── assets/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── reset.css
│   │       ├── tokens.css
│   │       ├── global.css
│   │       └── utilities.css
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── IconButton/
│   │   │   ├── Toast/
│   │   │   └── VisuallyHidden/
│   │   ├── layout/
│   │   │   ├── AppShell/
│   │   │   ├── Header/
│   │   │   └── Footer/
│   │   └── game/
│   │       ├── AxisToggle/
│   │       ├── TensorGrid/
│   │       ├── TargetPreview/
│   │       ├── PulseButton/
│   │       ├── StatusStrip/
│   │       ├── HintPanel/
│   │       └── ResultPanel/
│   ├── content/
│   │   ├── levels/
│   │   │   ├── tutorial.json
│   │   │   ├── pulse.json
│   │   │   ├── echo.json
│   │   │   ├── rank.json
│   │   │   └── noise.json
│   │   ├── fallbacks/
│   │   └── generator-map.json
│   ├── domain/
│   │   ├── board/
│   │   │   ├── board.ts
│   │   │   ├── pulse.ts
│   │   │   └── board.test.ts
│   │   ├── algebra/
│   │   │   ├── gf2-rank.ts
│   │   │   ├── factorization.ts
│   │   │   └── algebra.test.ts
│   │   ├── generator/
│   │   │   ├── daily-generator.ts
│   │   │   ├── difficulty.ts
│   │   │   ├── prng.ts
│   │   │   └── generator.test.ts
│   │   ├── scoring/
│   │   │   ├── grade.ts
│   │   │   └── sprint-score.ts
│   │   └── types.ts
│   ├── features/
│   │   ├── home/
│   │   ├── tutorial/
│   │   ├── lab/
│   │   ├── daily/
│   │   ├── sprint/
│   │   ├── archive/
│   │   ├── settings/
│   │   └── about/
│   ├── services/
│   │   ├── storage/
│   │   ├── sharing/
│   │   ├── audio/
│   │   ├── haptics/
│   │   ├── clock/
│   │   └── pwa/
│   ├── i18n/
│   │   ├── ko.ts
│   │   ├── en.ts
│   │   └── index.ts
│   ├── test/
│   │   ├── fixtures/
│   │   ├── setup.ts
│   │   └── test-utils.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── e2e/
│   │   ├── tutorial.spec.ts
│   │   ├── daily.spec.ts
│   │   ├── persistence.spec.ts
│   │   ├── sharing.spec.ts
│   │   └── accessibility.spec.ts
│   └── visual/
├── .editorconfig
├── .env.example
├── .gitignore
├── .nvmrc
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── LICENSE
└── README.md
```

---

## 7. 개발 시 주의사항 (Implementation Notes)

### 7.1. 보안 (Security)

1. 런타임 API나 비밀키를 추가하지 않는다. 필요 시 별도 백엔드 도입 결정 문서를 먼저 작성한다.
2. 저장·URL·콘텐츠 JSON을 신뢰하지 않고 범위 검사를 수행한다.
3. 사용자 입력을 HTML 문자열로 삽입하지 않는다.
4. 외부 자산 핫링크와 외부 폰트 로딩을 금지한다.
5. GitHub Actions에는 최소 권한만 부여한다.
6. 배포된 service worker의 scope가 저장소 하위 경로를 벗어나지 않는지 확인한다.

### 7.2. 성능 최적화 (Optimization)

1. 퍼즐 도메인 모듈은 페이지 코드와 분리하여 tree-shaking 가능하게 한다.
2. Archive, About, 공유 카드 편집 화면은 route-level lazy loading을 적용한다.
3. 보드 셀 컴포넌트의 불필요한 리렌더링을 프로파일링하되 조기 memoization은 피한다.
4. CSS blur, 대형 그림자, 반복 필터, 배경 비디오를 사용하지 않는다.
5. 공유 Canvas는 사용자 요청 시에만 생성한다.
6. 홈 화면에서 전체 Daily 아카이브나 모든 레벨 데이터를 미리 렌더링하지 않는다.
7. 시스템 폰트 또는 필요한 글리프만 포함한 자가 호스팅 폰트를 사용한다.

### 7.3. 게임 정확성

1. 모든 펄스 연산은 UI가 아니라 `domain/board` 함수만 사용한다.
2. 최소 펄스 수를 하드코딩하지 않고 차이 행렬 랭크로 계산한다.
3. 정규 해답은 반드시 재합성 검사를 통과해야 한다.
4. 난도 생성 조건을 완화할 때 목표 랭크 검사를 생략하지 않는다.
5. 비트 연산은 JS의 32비트 signed 변환을 고려한다. v1.0은 행 폭 8비트 이하로 제한한다.
6. 보드 크기 확대 시 표현 형식을 먼저 재검토한다.

### 7.4. GitHub Pages 대응

1. `vite.config.ts`의 `base`를 저장소 배포 경로에 맞춘다.
2. 정적 자산 URL을 `/`로 하드코딩하지 않고 `import.meta.env.BASE_URL`을 사용한다.
3. Hash Router를 사용하여 새로고침 404를 방지한다.
4. manifest의 `start_url`, `scope`, 아이콘 경로를 base path와 일치시킨다.
5. PR 미리보기와 프로덕션 배포의 base path 차이를 자동 테스트한다.

### 7.5. 브라우저·장치 예외

1. Web Share, Clipboard, Vibration, 파일 공유는 항상 기능 감지한다.
2. AudioContext는 첫 사용자 제스처 이후 생성·재개한다.
3. `100vh` 대신 동적 viewport 단위와 safe area inset을 고려한다.
4. 터치 환경에서는 hover 상태가 고정되지 않도록 `@media (hover: hover)`를 사용한다.
5. 가상 키보드가 열려도 게임 보드가 불필요하게 축소되지 않게 한다.
6. 공유 파일이 지원되지 않으면 텍스트 복사와 PNG 저장 폴백을 제공한다.

### 7.6. 알려진 제한 (Known Limitations)

- 기기 시계를 기준으로 Daily 날짜가 결정되므로 오프라인에서 날짜 조작을 검증할 수 없다.
- 서버가 없으므로 기기 간 streak와 기록이 동기화되지 않는다.
- 브라우저별 공유 API 차이로 PNG 직접 공유가 항상 가능하지는 않다.
- LocalStorage 삭제 또는 브라우저 데이터 정리 시 진행도가 사라진다.
- v1.0의 결과 등급은 경쟁 랭킹이 아닌 개인 성취 지표다.

---

## 8. 테스트 전략 (Test Strategy)

### 8.1. 단위 테스트

#### 보드 불변식

- 동일 펄스를 두 번 적용하면 원래 보드가 된다.
- 펄스 A와 B의 적용 순서를 바꿔도 최종 보드가 같다.
- 빈 행 또는 빈 열 선택은 상태를 바꾸지 않으며 UI에서는 실행할 수 없다.
- 보드 바깥 비트가 켜지지 않는다.

#### 랭크·분해

- 영행렬의 랭크는 0이다.
- 단일 비영 외적의 랭크는 1이다.
- `rank(A) <= min(rows, cols)`를 만족한다.
- 정규 분해의 펄스 수는 랭크와 같다.
- 분해 펄스를 합성하면 원본 행렬과 같다.
- 3×3 전체 행렬을 전수 또는 광범위 샘플링하여 brute-force 최소 이동과 랭크를 교차 검증한다.

#### 생성기

- 동일 시드와 버전은 동일 JSON을 생성한다.
- 목표 랭크·밀도·범위 조건을 만족한다.
- 10년치 날짜 샘플에서 생성 실패가 허용 기준 이하이다.
- fallback 선택도 결정적이다.
- 생성기 버전 변경 전 과거 버전 스냅샷이 유지된다.

#### 점수·저장

- 등급 경계값 테스트
- 힌트 사용에 따른 최고 등급 제한
- 이전 최고 기록보다 나쁜 결과가 덮어쓰지 않는지 검사
- 손상 JSON과 이전 schema migration 검사

### 8.2. 컴포넌트 테스트

- 행·열 버튼의 `aria-pressed`
- PULSE 활성·비활성 조건
- 키보드 입력과 포커스 이동
- Undo·Reset 확인
- 완료 후 결과 포커스
- Reduced Motion 상태
- 한·영 문자열 누락 검사

### 8.3. E2E 테스트

1. 최초 사용자: 홈 → 튜토리얼 → 첫 Lab 완료
2. Daily: 문제 로드 → 최적해 적용 → 결과 저장 → 새로고침 후 유지
3. Resume: 미완료 퍼즐 새로고침 → 복구
4. Sprint: 180초 절대 종료와 결과 계산
5. Share: API 지원·미지원 폴백
6. Offline: 최초 캐시 후 네트워크 차단 상태 실행
7. PWA Update: 진행 중 세션 보존 후 업데이트
8. GitHub Pages base path와 Hash Router
9. 360px·768px·1440px 레이아웃
10. 키보드 전용 전체 흐름

### 8.4. 시각·접근성 테스트

- 주요 화면의 고정 뷰포트 스크린샷 회귀
- dark/light/high-contrast 테마
- 200% 브라우저 줌
- 텍스트 확대와 긴 한국어·영어 문자열
- 자동 axe 검사와 수동 스크린리더 확인
- 색각 이상 시뮬레이션
- `prefers-reduced-motion` 확인

### 8.5. 품질 게이트

배포 워크플로는 다음 순서로 실패 시 중단한다.

```text
install
→ lint
→ format check
→ typecheck
→ unit/component tests
→ level validation
→ daily generator audit
→ production build
→ E2E smoke
→ accessibility smoke
→ deploy
```

---

## 9. 빌드·배포 및 운영 (Build, Deployment & Operations)

### 9.1. 브랜치 정책

- `main`: 항상 배포 가능한 상태
- `develop`은 장기 유지하지 않고 기능 브랜치 → PR → main 흐름을 권장한다.
- 기능 브랜치 예시: `feat/daily-generator`, `feat/share-card`, `fix/ios-safe-area`
- 릴리스 태그: `v1.0.0-preview.1`, `v1.0.0-rc.1`, `v1.0.0`

### 9.2. CI/CD

- PR: lint, typecheck, test, build, 핵심 E2E
- main 병합: 전체 E2E, 접근성 검사, GitHub Pages 배포
- 배포 artifact는 CI에서 생성하며 로컬 빌드 결과를 직접 커밋하지 않는다.
- 배포 후 실제 URL의 manifest, service worker, 주요 라우트, Daily 실행을 smoke test한다.

### 9.3. 로그와 분석

- 기본 제품은 원격 분석을 사용하지 않는다.
- 개발 빌드는 콘솔에 생성기 시도 횟수, 퍼즐 난도 지표, 저장 복구 정보를 구조화해 출력할 수 있다.
- 플레이테스트 데이터는 사용자의 명시적 동의 아래 수동 설문 또는 로컬 JSON 내보내기로 수집한다.
- 원격 분석 도입 시 별도 개인정보·쿠키·보존 정책을 작성한다.

### 9.4. 장애 대응

| 장애 | 사용자 대응 | 개발 대응 |
|---|---|---|
| 퍼즐 JSON 손상 | 해당 레벨 이용 불가 안내·홈 복귀 | CI validator 강화 |
| Daily 생성 실패 | fallback 퍼즐 자동 사용 | 생성 로그와 시드 재현 |
| 저장 실패 | 현재 세션 계속·경고 1회 | 저장소 가용성·용량 검사 |
| 공유 이미지 실패 | 텍스트 공유 유지 | Canvas·폰트 폴백 검사 |
| SW 업데이트 충돌 | 이전 버전 유지·재시도 | 캐시 버전·scope 수정 |
| 렌더 오류 | Error Boundary 복구 화면 | 오류 재현 정보 제공 |

---

## 10. Codex 협업 기준 (Codex Collaboration Boundary)

OpenAI Game Builders Seoul 평가 맥락을 고려하여 Codex 사용은 단순 코드 생성량이 아니라 검증 가능한 개발 산출물로 기록한다.

### 10.1. Codex에 적합한 작업

- 순수 함수 기반 GF(2) 랭크·분해 구현
- 테스트 케이스와 불변식 확장
- 결정적 퍼즐 생성기 및 감사 스크립트
- 접근성 속성·키보드 흐름 구현
- 반응형 컴포넌트 코드와 리팩터링
- Canvas 공유 카드 렌더링
- GitHub Actions·배포 자동화
- 버그 재현 테스트 작성 후 수정

### 10.2. 사람이 유지할 결정권

- 최종 코어 규칙과 난도 철학
- 어떤 힌트가 재미를 해치지 않는지에 대한 판단
- Lab 퍼즐 큐레이션
- 시각적 브랜드와 모션 강도
- 범위 축소·릴리스 차단 판단
- 라이선스와 개인정보 정책 승인

### 10.3. 기록 형식

`docs/CODEX_COLLABORATION.md`에 다음을 남긴다.

```text
날짜 / 목표
사용한 Codex 요청의 요약
Codex가 제안하거나 생성한 변경
채택·수정·거절한 이유
관련 커밋 또는 PR
실행한 테스트와 결과
남은 위험
```

프롬프트 전체를 무분별하게 붙이지 않고 결정과 검증 중심으로 작성한다.

---

## 11. 릴리스 승인 기준 (Definition of Done)

### 코어 게임

- [ ] 행·열 복수 선택과 교차점 미리보기가 정확하다.
- [ ] PULSE, Undo, Reset, 완료 판정이 모든 보드 크기에서 동작한다.
- [ ] 랭크와 최적 분해가 brute-force 검증 세트와 일치한다.
- [ ] 48개 Lab와 모든 튜토리얼 레벨이 검증된다.
- [ ] Daily 생성기가 동일 날짜에서 결정적이다.
- [ ] Sprint가 정확히 종료되고 점수가 재현된다.

### 제품 품질

- [ ] 360px 모바일에서 가로 스크롤과 잘린 컨트롤이 없다.
- [ ] 키보드만으로 홈부터 공유 결과까지 완료할 수 있다.
- [ ] Dark, Light, High Contrast, Reduced Motion이 동작한다.
- [ ] 한국어·영어의 누락 문자열이 없다.
- [ ] 새로고침과 오프라인에서 세션이 복구된다.
- [ ] 공유 텍스트와 두 이미지 비율이 정답을 노출하지 않는다.
- [ ] 필수 Lighthouse·E2E·접근성 결과가 QA 보고서에 기록된다.

### 배포

- [ ] GitHub Pages 공개 링크가 로그인 없이 열린다.
- [ ] 새로고침·직접 공유 라우트가 404 없이 동작한다.
- [ ] manifest, 아이콘, 설치, service worker 업데이트가 검증된다.
- [ ] README에 게임 소개·조작·기술·실행·배포 방법이 있다.
- [ ] LICENSE와 ASSET_LICENSES가 완성된다.
- [ ] 릴리스 태그와 최종 커밋 해시가 제출 문서에 기록된다.

---

## 12. 단계별 로드맵 (Roadmap)

### Phase 0 — Rule Proof

- 4×4 단일 화면 프로토타입
- 펄스·랭크·최적 분해
- 5명 이상 규칙 이해 테스트

### Phase 1 — Core Product

- Tutorial, Lab 기본 구조
- 저장·Undo·Hint·등급
- 반응형 게임 화면

### Phase 2 — Retention & Sharing

- Daily, Archive, Sprint
- Signal Signature와 이미지 카드
- streak·최고 기록

### Phase 3 — Release Quality

- PWA·오프라인
- 사운드·햅틱·설정
- 접근성·한영화·QA 자동화
- 데모 영상·제출 자료

### Post-v1

- 추가 Lab 팩과 시즌 Daily
- 웹 설치 지표와 선택적 익명 분석
- 앱 스토어 래핑
- 사용자 퍼즐 코드 공유
- 비정사각 행렬, 다중 상태 셀, 3차원 텐서의 별도 실험 모드

---

## 부록 A. 핵심 용어

| 용어 | 사용자 노출 | 의미 |
|---|---|---|
| Axis | 축 | 행 또는 열 선택 레일 |
| Pulse | 펄스 | 선택 행×열 교차점을 반전하는 한 번의 이동 |
| Signal | 신호 | 셀의 ON 상태와 전체 패턴 |
| Target | 목표 신호 | 완성해야 할 보드 |
| Rank | About·고급 설명에서만 | 차이 행렬의 GF(2) 랭크, 최소 펄스 수 |
| Outer Product | About·수학 설명에서만 | 행 선택과 열 선택으로 교차점 행렬을 만드는 연산 |
| Signal Signature | 결과 화면 | 해답을 숨긴 공유용 추상 패턴 |

## 부록 B. 설계 결정 요약

| 결정 | 채택 | 이유 |
|---|---|---|
| DOM/CSS Grid 보드 | 예 | 접근성·반응형·작은 셀 수 |
| Canvas 보드 | 아니오 | 입력·ARIA 복잡도 대비 이점 부족 |
| Canvas 공유 카드 | 예 | 고정 해상도 PNG 생성에 적합 |
| 백엔드 | 아니오 | 서버 없는 Daily·저장·공유 가능 |
| 상태 관리 라이브러리 | 아니오 | reducer와 도메인 분리로 충분 |
| Hash Router | 예 | GitHub Pages 직접 경로 404 방지 |
| 외부 폰트 CDN | 아니오 | 오프라인·성능·개인정보 일관성 |
| 런타임 AI API | 아니오 | 게임 규칙에 필요 없고 비용·지연 리스크 증가 |
