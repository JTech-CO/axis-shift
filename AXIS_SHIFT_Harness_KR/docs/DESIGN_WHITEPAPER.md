# AXIS//SHIFT — A Daily Tensor Puzzle 디자인 백서 (Design Whitepaper)

**버전**: 1.0.0-draft  
**작성일**: 2026년 8월 9일  
**작성자**: JTech-CO / Bryan  
**문서 상태**: Pre-Production / OpenAI Game Builders Seoul 예선 빌드 기준  
**참고 문서**: AXIS//SHIFT 기획 정의 v0.1, AXIS//SHIFT 기술 백서 v1.0, 접근성·QA 체크리스트(추후 작성)

---

## 1. 프로젝트 개요 (Project Overview)

### 1.1. 프로젝트 명

**AXIS//SHIFT — A Daily Tensor Puzzle UI/UX Design**

- 한국어 표기: **액시스 시프트 — 데일리 텐서 퍼즐**
- 공개 장르: Daily Logic Puzzle / Pattern Puzzle
- 핵심 조작: 행 선택 × 열 선택 → 교차점 반전
- 핵심 제품 문장: **“축을 고르고, 신호를 뒤집고, 패턴을 맞춘다.”**

### 1.2. 목적 (Purpose)

AXIS//SHIFT의 디자인 목표는 수학적 배경이 있는 퍼즐을 “수학 문제”처럼 보이지 않게 만들면서도, 조작과 결과의 인과관계를 정밀하게 드러내는 것이다. 플레이어는 텐서, 외적, `GF(2)`, 행렬 랭크를 몰라도 행과 열을 선택하면 교차점이 반전된다는 사실을 화면 반응만으로 이해해야 한다.

디자인은 다음 목표를 달성해야 한다.

1. **즉시 이해**: 첫 화면에서 무엇을 눌러야 하는지, 선택한 축이 어느 셀에 영향을 주는지 즉시 보인다.
2. **한 가지 주요 액션**: 게임 중 시각적 초점은 항상 `PULSE`에 있으며, 부가 기능이 코어 조작을 방해하지 않는다.
3. **짧은 세션의 완결감**: 1~3분 플레이 후에도 시작·전개·완료·결과 공유가 하나의 닫힌 경험으로 느껴진다.
4. **정밀하지만 위압적이지 않은 과학성**: 계기판·개발자 도구처럼 정보가 과밀하지 않고, 신호 격자와 축만으로 기술적 정체성을 표현한다.
5. **모바일 우선**: 작은 화면에서도 축 버튼, 보드, 목표 패턴, PULSE를 한 손으로 조작할 수 있다.
6. **저사양 대응**: 3D, 배경 영상, 대형 파티클 없이 CSS·SVG 중심의 가벼운 시각 효과를 사용한다.
7. **공유 가능한 시각 정체성**: 게임 화면과 결과 카드가 한눈에 AXIS//SHIFT임을 알아볼 수 있어야 한다.

### 1.3. 핵심 차별점 (Key Differentiators)

1. **Legible Causality — 조작 원인이 보이는 퍼즐**  
   선택한 행과 열을 축 레일로 강조하고, 실제로 반전될 교차점을 PULSE 전에 미리 보여준다. 플레이어가 결과를 추측하는 것이 아니라 원인과 결과를 학습한다.

2. **Precision Without Intimidation — 정밀하지만 어렵게 보이지 않는 디자인**  
   검은 배경, 네온, 다중 패널로 가득한 전형적 “AI·개발자” 미학을 피한다. 제한된 색, 큰 보드, 넓은 여백, 짧은 문장으로 기술적 주제를 캐주얼 퍼즐의 문법으로 바꾼다.

3. **Spoiler-Free Identity — 해답 대신 풀이의 흔적을 공유**  
   결과 카드에는 목표 격자나 실제 이동을 넣지 않고, 성과 수치와 Signal Signature를 배치한다. 스포일러 없이도 각 플레이 결과가 서로 다른 시각적 수집물로 보인다.

4. **Adaptive Simplicity — 기기별로 정보량을 재배치**  
   데스크톱에서는 목표·보드·상태를 나란히 두고, 모바일에서는 목표를 축소하고 PULSE를 하단에 고정한다. 기능을 삭제하지 않고 우선순위를 바꾼다.

5. **Accessible State Language — 색상 이외의 상태 문법**  
   셀의 채움, 중심 기호, 테두리, 패턴, 레이블을 함께 사용한다. 색각 이상, 고대비, 모션 감소, 키보드 환경에서도 동일한 규칙을 이해할 수 있다.

### 1.4. 대상 사용자 (Target Users)

#### 1차 사용자

- Wordle, Nonogram, Sudoku, 2048, Mini Metro처럼 짧고 명확한 규칙의 퍼즐을 선호하는 사용자
- 출퇴근·대기 시간에 1~3분 정도 플레이하는 모바일 사용자
- 정답보다 “최소 횟수”와 기록 단축에 반복 도전하는 사용자
- 결과 이미지를 SNS나 메신저에 공유하는 사용자

#### 2차 사용자

- AI·머신러닝·개발에 관심이 있어 텐서라는 소재에 호기심이 있는 사용자
- 수학적 구조가 실제 게임 규칙으로 바뀌는 방식을 흥미롭게 보는 개발자·학생
- 데일리 퍼즐과 streak를 통해 가볍게 재방문하는 데스크톱 사용자

#### 사용 맥락

- 세로형 스마트폰, 한 손 조작
- 데스크톱 브라우저, 마우스·키보드
- 소리 없이 플레이하는 공공장소
- 오프라인 또는 불안정한 네트워크
- 다크 모드·고대비·모션 감소를 사용하는 환경

### 1.5. UX 원칙 (Experience Principles)

1. **설명보다 반응으로 가르친다.**  
   긴 튜토리얼 문장보다 첫 행·열 선택에서 교차점 미리보기를 보여준다.

2. **한 화면에 하나의 결정만 둔다.**  
   행 선택, 열 선택, PULSE의 순서를 흐리는 추가 버튼을 보드 주변에 늘어놓지 않는다.

3. **플레이어가 실패하지 않고 개선하게 한다.**  
   시간 초과나 게임 오버 대신 Undo, Reset, 단계형 Hint, 등급으로 학습을 지원한다.

4. **현재 상태를 숨기지 않는다.**  
   선택 축, 반전 예정 셀, 이동 수, 목표 패턴, 타이머는 명확히 보인다.

5. **정답은 숨기고 성과는 드러낸다.**  
   공유 카드에서 퍼즐 해답은 제거하고 완료 시간·펄스 효율·서명만 보여준다.

6. **깊이는 뒤에서 발견하게 한다.**  
   첫 튜토리얼에는 텐서·랭크라는 단어를 사용하지 않고, About의 수학 설명에서 선택적으로 공개한다.

7. **애니메이션은 정보여야 한다.**  
   움직임은 선택 축의 전달, 셀 반전, 완료 잠금에만 사용하며 장식용 반복 애니메이션을 두지 않는다.

---

## 2. 상세 기능 요구사항 (Detailed Requirements)

### 2.1. 레이아웃 및 인터페이스 (Layout & Interface)

#### 2.1.1. 전체 레이아웃 정책

- **뷰 모드**: Container-Based + Fluid Game Stage
- **기본 방향**: Mobile First
- **페이지 최대 너비**: 일반 콘텐츠 1120px, Wide 게임 레이아웃 1280px
- **최소 좌우 여백**:
  - Compact: 16px
  - Mobile: 20px
  - Tablet: 24px
  - Desktop: 32px
- **페이지 배경**: 단색 또는 매우 약한 정적 radial gradient만 사용
- **카드 구조**: 과도한 중첩 카드 금지. 한 화면에서 최대 3개의 주요 surface depth만 사용
- **스크롤**: 게임 보드와 PULSE가 첫 뷰포트 안에 들어오도록 우선 배치
- **가로 스크롤**: 모든 지원 뷰포트에서 금지

#### 2.1.2. 테마 정책

- 기본값은 시스템 설정을 따른다.
- 사용자는 `System`, `Dark`, `Light`, `High Contrast` 중 선택할 수 있다.
- 마케팅 썸네일과 공유 카드는 일관된 다크 브랜드 팔레트를 사용한다.
- 테마 전환 시 페이지 전체가 번쩍이지 않도록 초기 HTML에서 저장값 또는 시스템 설정을 먼저 적용한다.

##### Dark Theme

- 배경: `#070A0F`
- 기본 Surface: `#0F141C`
- Elevated Surface: `#161D28`
- 기본 텍스트: `#F4F7FA`
- 보조 텍스트: `#9BA8B8`
- 경계선: `#2A3442`
- Signal Primary: `#72F2C5`
- Signal Secondary: `#8DA2FF`

##### Light Theme

- 배경: `#F5F7FA`
- 기본 Surface: `#FFFFFF`
- Elevated Surface: `#EEF2F6`
- 기본 텍스트: `#111821`
- 보조 텍스트: `#5F6B7A`
- 경계선: `#D7DEE8`
- Signal Primary: `#007E69`
- Signal Secondary: `#6B57D9`

#### 2.1.3. 데스크톱 레이아웃

`1024px` 이상에서는 세 영역을 병렬 배치한다.

```text
┌──────────────────────────────────────────────────────────────────┐
│ AXIS//SHIFT       DAILY #018               Settings / Theme      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────┐  ┌────────────────────────┐  ┌───────────────┐ │
│ │ TARGET       │  │     COLUMN AXIS        │  │ STATUS        │ │
│ │ 5×5 preview  │  │  ┌──────────────────┐  │  │ 2 / 4 PULSE   │ │
│ │              │  │ R│                  │  │  │ 00:51         │ │
│ │ Daily note   │  │ O│   CURRENT GRID   │  │  │ Hint: none    │ │
│ │              │  │ W│                  │  │  │               │ │
│ └──────────────┘  │  └──────────────────┘  │  │ Undo / Hint   │ │
│                   │      [ PULSE ]          │  └───────────────┘ │
│                   └────────────────────────┘                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

- 목표 카드: 200~240px
- 메인 게임 스테이지: 440~520px
- 상태 카드: 220~260px
- 보드는 시각적 중심이며 세 영역의 높이를 강제로 같게 만들지 않는다.
- PULSE는 메인 보드 바로 아래에 배치하고 오른쪽 상태 카드로 이동시키지 않는다.

#### 2.1.4. 태블릿 레이아웃

`768px~1023px`에서는 목표와 상태를 보드 위의 한 줄로 압축한다.

```text
┌────────────────────────────────────────────┐
│ Header                                     │
├────────────────────────────────────────────┤
│ [Target preview]   Daily #018 · 2/4 · 00:51│
│                                            │
│             Column Axis                    │
│       Row   Current Grid                   │
│       Axis                                 │
│                                            │
│        Undo     [ PULSE ]     Hint          │
└────────────────────────────────────────────┘
```

- 상태 수치는 `StatusStrip`으로 한 줄 표시한다.
- 설정과 보조 기능은 드로어로 이동한다.
- 보드는 `min(62vw, 500px)` 범위로 유지한다.

#### 2.1.5. 모바일 레이아웃

`767px` 이하에서는 단일 열로 구성한다.

```text
┌──────────────────────────────┐
│ AXIS//SHIFT      #018   ⚙    │
├──────────────────────────────┤
│ Target [mini 5×5]  2/4 00:51 │
│                              │
│          1  2  3  4  5       │
│       A  □  □  □  □  □       │
│       B  □  □  □  □  □       │
│       C  □  □  □  □  □       │
│       D  □  □  □  □  □       │
│       E  □  □  □  □  □       │
│                              │
│ Undo                  Hint   │
├──────────────────────────────┤
│         [ PULSE · 6 ]        │
└──────────────────────────────┘
```

- Target Preview는 전체 화면 너비를 차지하지 않고 88~128px 정사각형으로 표시한다.
- PULSE 영역은 `position: sticky; bottom: 0`을 사용하고 `env(safe-area-inset-bottom)`을 반영한다.
- PULSE가 보드의 마지막 행을 가리지 않도록 스크롤 패딩을 둔다.
- 모바일에서는 헤더 높이를 56px 이내로 제한한다.
- 설정, Hint, Reset 확인은 bottom sheet를 우선한다.

#### 2.1.6. 낮은 높이·가로 방향

- 높이 600px 이하의 landscape에서는 헤더와 설명을 축소한다.
- 목표 패턴을 메인 보드 왼쪽에 배치하고 상태를 상단 한 줄로 이동한다.
- PULSE를 오른쪽 하단 고정이 아니라 보드 아래 또는 우측의 충분한 폭에 둔다.
- 화면 회전 후 선택·타이머·보드 상태를 유지한다.

### 2.2. 사용자 상호작용 (Interaction Logic)

#### 2.2.1. 주요 액션

##### 행·열 선택

- 축 버튼은 실제 `<button>`으로 구현한다.
- 선택 전: Surface 배경 + 1px 경계선
- Hover 가능 환경: 경계선이 Signal Primary로 바뀌고 1px 위로 이동
- Focus: 2px 외곽 링 + 2px offset
- Selected: Signal Primary 배경 + `ON` 대비 텍스트/기호
- Pressed: `scale(0.97)`을 80ms 적용
- 선택 상태는 색상뿐 아니라 중심 점·체크형 notch·`aria-pressed`로 표시한다.

##### 교차점 미리보기

- 행과 열이 각각 하나 이상 선택되면 해당 교차점에 얇은 점선 링 또는 대각선 패턴을 표시한다.
- 실제 ON 셀과 미리보기 셀이 겹칠 경우 “꺼질 예정”임을 이중 테두리 또는 빼기 기호로 구분한다.
- 미리보기는 보드 상태를 바꾸지 않으며 PULSE 취소 시 즉시 사라진다.
- 선택 수가 많아도 강한 glow를 셀마다 적용하지 않는다.

##### PULSE

- 선택 전: 비활성, “행과 열을 선택하세요” 보조 라벨
- 선택 후: Primary 채움, 반전 예정 셀 수 표시
- 실행 시: 축 레일 → 교차점 → 셀 반전 순으로 반응
- 연타 방지를 위해 논리 상태가 확정될 때까지 짧게 비활성화한다.
- 버튼 안의 숫자는 `selectedRowCount × selectedColCount`로 계산한다.

##### Undo

- 마지막 펄스가 없으면 비활성화한다.
- Undo 시 역방향의 짧은 셀 플립을 보여주되 완료 애니메이션보다 약하게 처리한다.
- Undo 사용 자체를 부정적으로 경고하지 않는다.

##### Reset

- 보조 메뉴 또는 상태 카드에 둔다.
- 한 번의 실수로 누르지 않도록 확인 dialog/bottom sheet를 사용한다.
- 확인 문구는 결과를 명확히 설명한다: “현재 퍼즐의 이동과 시간이 초기화됩니다.”

##### 새 목표 신호 — M00 반복 플레이

- Easy 4×4, Normal 4×4·5×5, Hard 4×4·5×5·6×6의 여섯 플레이 가능 profile에서만 같은 난도·크기의 새 목표를 요청한다. Full Rank는 대조군이므로 반복 목표 CTA 대상이 아니다.
- 이동·축 선택·진행 중 타이머가 있으면 현재 진행을 버릴지 확인한다. idle 또는 완료 상태에서는 즉시 전환할 수 있다.
- 직전 target과 같은 결과를 최대 32회 제외한다. 새 target을 만들지 못하면 현재 보드와 진행을 보존하고 비파괴 오류 안내를 표시한다.
- 성공하면 이동·선택·타이머를 함께 초기화하고 URL의 `stage`·`seed`를 갱신한다. 재현 가능한 링크라는 사실을 개발·테스트 계약으로 유지하되 seed 문자열을 주 CTA보다 강조하지 않는다.
- 완료 결과의 `새 목표 신호`는 `다음 퍼즐`과 같은 secondary CTA 위계를 사용한다. 진행 중 보조 컨트롤은 Reset·Undo보다 시각적으로 강하게 만들지 않는다.

##### Hint

- 첫 진입에서는 패널에 3단계를 모두 노출하지 않고 `힌트 보기`만 표시한다.
- 단계별 설명:
  1. 남은 최소 펄스 수
  2. 다음 펄스의 한 축
  3. 다음 펄스의 전체 행·열
- 각 단계는 결과 등급에 미치는 영향을 실행 전에 알려준다.
- 힌트 강조는 기존 선택과 다른 보라색/점선 패턴을 사용한다.

#### 2.2.2. 탐색 (Navigation)

- 상단 헤더에는 브랜드, 현재 모드/퍼즐 ID, 설정만 둔다.
- 게임 중 홈 이동은 뒤로가기 또는 브랜드 버튼으로 제공하되 진행 중임을 알린다.
- 데스크톱에 상시 GNB를 두지 않는다. 게임 외 화면에서만 `Daily`, `Lab`, `Sprint`, `Archive`를 노출한다.
- 모바일 홈에는 햄버거 메뉴보다 카드형 모드 선택을 사용한다.
- 브라우저 뒤로가기를 정상 지원한다.

#### 2.2.3. 입력 방식

- 보드 셀 자체를 눌러 상태를 직접 바꾸는 기능은 제공하지 않는다. 핵심은 축 선택이다.
- 축 선택은 탭·클릭·키보드 Enter/Space를 동일하게 처리한다.
- 키보드 포커스 순서는 열 축 → 행 축 → PULSE → Undo → Hint 순으로 자연스럽게 구성한다.
- 단축키는 설정 또는 도움말에서 확인할 수 있지만 단축키를 몰라도 모든 기능을 사용할 수 있다.
- 사운드·햅틱은 보조 피드백이며 상태 전달의 필수 수단으로 사용하지 않는다.

### 2.3. 데이터 구조 및 모듈 (Component Structure)

#### 2.3.1. App Shell

- 페이지 배경, 테마, safe area, 최대 너비를 관리한다.
- Header와 Footer는 게임 중 최소화되고 홈·About에서 확장된다.
- 오프라인·업데이트 상태는 상단 또는 하단의 얇은 배너로 전달한다.

#### 2.3.2. Header

- 좌측: `AXIS//SHIFT` wordmark 또는 축 아이콘
- 중앙 또는 좌측 보조: 현재 모드·퍼즐 ID·필요 시 중립적 난도 배지. M00은 선택한 profile의 난도와 `4×4`·`5×5`·`6×6` 크기를 함께 표시하며, Full Rank에는 `HARD` 대신 `대조군`을 사용한다.
- 우측: 사운드 빠른 토글, 설정
- 모바일에서는 wordmark를 축약하지 않고 글자 크기를 줄인다.
- 헤더에 streak, 시간, 펄스 등 게임 수치를 중복 배치하지 않는다.

#### 2.3.3. Home

구성 우선순위:

1. 첫 사용자: `45초 튜토리얼 시작`
2. 재방문 사용자: `오늘의 신호 시작/계속`
3. Continue Lab
4. Sprint
5. 최근 기록·streak
6. About·GitHub·Credits

- Hero에 긴 설명이나 배경 영상을 넣지 않는다.
- Daily 카드는 가장 큰 면적과 Primary CTA를 가진다.
- 완료한 Daily 카드는 등급·시간·공유 버튼을 보여준다.
- 미완료 세션이 있으면 “이어하기”를 Daily보다 위에 배치할 수 있다.

#### 2.3.4. Target Preview

- 제목: `TARGET` / `목표 신호`
- 메인 보드와 다른 보조색 또는 링 형태로 구분한다.
- 셀 간격을 줄여 패턴 전체를 한 덩어리로 읽게 한다.
- 데스크톱에서는 설명과 최소 펄스 수를 함께 배치할 수 있다.
- 모바일에서는 패턴과 최소 펄스만 표시한다.

#### 2.3.5. Game Stage

- Column Axis Rail
- Row Axis Rail
- Tensor Grid
- Intersection Preview
- Pulse Button
- Status Strip
- Stopwatch
- Undo·Hint·Reset
- M00 반복 플레이의 `새 목표 신호`

보드 주변에 장식 패널을 추가하지 않는다. 축과 보드가 하나의 기기처럼 느껴지도록 같은 기준선과 간격을 사용한다.

M00 스톱워치는 첫 행 또는 열 선택에서 시작하고 `00:00.0`처럼 읽을 수 있게 표시한다. 탭이 보이지 않는 동안 증가하지 않으며 Reset·stage·새 목표 전환에서 0으로 돌아간다. 타이머는 관찰 피드백이지 제한 시간이 아니므로 PULSE보다 강한 색·크기·경고를 사용하지 않는다.

#### 2.3.6. Result Scene

- 완료 직후 보드가 잠긴 다음 결과 콘텐츠가 인라인 또는 overlay로 나타난다.
- 정보 순서:
  1. `SIGNAL LOCKED`
  2. Signal Grade
  3. 사용 펄스 / 최소 펄스
  4. 완료 시간
  5. Hint·Undo 배지
  6. Signal Signature
  7. 공유 CTA
  8. 다음 행동
- Primary CTA: `결과 공유`
- Secondary CTA: `다음 퍼즐` 또는 `다시 플레이`
- Tertiary: `보드 보기`
- 결과 화면을 닫지 않아도 브라우저 뒤로가기와 화면 읽기가 가능해야 한다.
- M00 결과는 사용 PULSE와 0.1초 단위 경과 시간을 함께 고정해 보여준다. 완료 후 탭 가시성이 바뀌어도 값이 증가하지 않는다.
- 여러 번의 단일 열 또는 단일 행 PULSE로 sweep 완료한 경우 성공·기록을 그대로 인정하고 “한 축씩 맞추는 방식으로 정렬했습니다. 이번에는 여러 행과 열을 한 번에 묶는 다른 방법으로도 풀어 보세요.”라는 비강제 학습 안내를 덧붙인다.
- 한 번의 PULSE 또는 행·열을 함께 묶은 풀이에는 sweep 안내를 표시하지 않는다. 이 안내는 실패·감점·치트 판정이 아니며 Signal Grade보다 낮은 시각 위계를 사용한다.

#### 2.3.7. Footer

- 게임 화면에서는 생략하거나 최소화한다.
- 홈·About에서 GitHub, License, Privacy, Credits를 제공한다.
- 외부 링크는 텍스트 레이블을 명확히 표시한다.

### 2.4. 출력 및 결과물 (Output)

- **UI 결과물**: React Components + CSS Modules + SVG Assets
- **브랜드 결과물**:
  - Wordmark SVG
  - App Icon 512×512
  - Maskable Icon
  - Favicon SVG
  - Generic OG 1200×630
- **게임 공유 결과물**:
  - Text Signature
  - 1080×1080 PNG
  - 1200×630 PNG
- **문서 결과물**:
  - Design Tokens
  - Screen State Matrix
  - Responsive Specifications
  - Accessibility Checklist
  - Asset License Inventory

#### 품질 기준

- WCAG 2.2 AA 수준을 목표로 한다.
- 텍스트·핵심 아이콘이 200% 확대에서도 잘리지 않는다.
- 360px 폭에서 가로 스크롤이 없다.
- 인터랙티브 타깃은 최소 44×44px이다.
- 색상만으로 상태를 구분하지 않는다.
- 초당 3회 이상의 번쩍임을 사용하지 않는다.
- Reduced Motion에서 모든 기능을 동일하게 사용할 수 있다.
- 게임 화면의 주요 정보는 첫 뷰포트 또는 한 번의 짧은 스크롤 안에 존재한다.
- 웹 제출 형식이더라도 튜토리얼·설정·기록·오프라인·접근성·오류 복구를 생략하지 않으며, 앱 스토어 제품과 같은 화면 완결성을 기준으로 승인한다.

### 2.5. 정보 구조 (Information Architecture)

```text
Home
├── Continue Session
├── Daily Signal
│   ├── Game
│   └── Result
├── Lab
│   ├── Pulse / 12
│   ├── Echo / 12
│   ├── Rank / 12
│   └── Noise / 12
├── Sprint
│   ├── Intro
│   ├── Game
│   └── Result
├── Archive
│   ├── Month Calendar
│   └── Daily Game / Result
├── Settings
└── About
    ├── How to Play
    ├── The Math Behind It
    ├── Accessibility
    ├── Credits
    └── GitHub
```

날짜당 한 문제 제한은 `Daily Signal` 가지에만 적용한다. Tutorial·Lab은 여러 단계와 레벨을 연속 또는 재선택해 플레이할 수 있고, Sprint는 제한 시간 동안 여러 퍼즐을 제공하므로 Home과 결과 화면의 다음 행동이 Daily 하나로 막히지 않아야 한다.

### 2.6. 화면 상태 매트릭스

| 화면 | 빈 상태 | 진행 상태 | 완료 상태 | 오류·오프라인 |
|---|---|---|---|---|
| Home | 첫 튜토리얼 CTA | 이어하기 카드 | Daily 결과·streak | 오프라인 배너 |
| Lab | 챕터 0/12 | 레벨별 등급 | 12/12 완료 배지 | 콘텐츠 복구 안내 |
| Daily | 오늘 퍼즐 시작 | 이동·타이머 | 공유·Archive CTA | fallback 또는 오류 |
| Sprint | 시작 설명 | 카운트다운 | 점수·개인 최고 | 세션 복구 불가 안내 |
| Archive | 기록 없음 | 일부 날짜 완료 | 월 완료율 | 날짜 파싱 오류 |
| Share | 생성 전 | Canvas 생성 | 공유/복사 성공 | 텍스트 폴백 |

---

## 3. 기술 스택 및 라이브러리 (Tech Stack)

### 3.1. Core

- **Frontend Framework**: React + TypeScript
- **Styling Engine**: CSS Modules + CSS Custom Properties
- **Layout**: CSS Grid, Flexbox, Container Query 선택적 사용
- **Board Rendering**: Semantic DOM + CSS Grid
- **Graphic Assets**: Inline/Sprite SVG
- **Share Rendering**: Canvas 2D
- **Theme**: `data-theme` + CSS Variables
- **Animation**: CSS Transitions/Keyframes, Web Animations API는 필요한 경우에만 사용
- **Responsive Unit**: `rem`, `%`, `clamp()`, dynamic viewport unit, safe area inset

### 3.2. Libraries & Tools

1. **React**
   - 화면·상태 연결
   - 컴포넌트는 시각 역할을 기준으로 작게 분리

2. **CSS Modules**
   - 컴포넌트 단위 스타일 격리
   - 상태는 무작위 클래스가 아니라 `data-state`, `aria-pressed`와 결합

3. **Custom SVG Asset Set**
   - 축, 펄스, Undo, Hint, Settings, Share 아이콘
   - 외부 범용 아이콘 라이브러리를 사용하지 않고 일관된 stroke 규칙 적용

4. **Canvas 2D**
   - Signal Signature와 결과 카드 생성
   - 메인 보드 UI에는 사용하지 않음

5. **Playwright + Screenshot Fixtures**
   - 뷰포트·테마·상태별 시각 회귀

6. **axe 기반 자동 검사**
   - 자동 접근성 결함 탐지
   - 자동 검사만으로 승인하지 않고 키보드·스크린리더 수동 확인 병행

### 3.3. 자산 전략 (Asset Strategy)

- 3D 모델, 실사 이미지, 대형 일러스트를 사용하지 않는다.
- 핵심 비주얼은 코드로 생성되는 격자·축·Signal Signature다.
- 앱 아이콘과 wordmark는 벡터로 관리한다.
- 폰트는 시스템 스택을 기본으로 하며 별도 웹폰트 사용 시 자가 호스팅·서브셋·라이선스 기록을 필수로 한다.
- 효과음은 Web Audio 합성음을 우선하여 외부 음원 의존을 줄인다.
- 모든 제3자 자산은 `ASSET_LICENSES.md`에 기록한다.

---

## 4. 아키텍처 및 로직 (Architecture & Logic)

### 4.1. 시각적 계층 구조 (Visual Hierarchy)

#### Level 0 — Primary Action

- PULSE 버튼
- Signal Primary 채움
- 화면당 하나만 존재
- 높이 52~60px
- 버튼 텍스트 16~18px / 700

#### Level 1 — Page / Mode Title

- Desktop: `clamp(2.5rem, 5vw, 4.5rem)`
- Mobile: 36~44px
- Weight: 650~750
- Letter spacing: 영문 wordmark `-0.03em`, 본문 제목 `-0.02em`
- 사용 위치: Home Hero, Result Grade

#### Level 2 — Section Title

- 24~32px
- Weight: 650~700
- 사용 위치: Daily Card, Lab Chapter, Result Header

#### Level 3 — Game Labels / Body

- 16~18px
- Line-height: 1.5~1.65
- 사용 위치: 설명, CTA 보조 문구

#### Level 4 — Metrics / Meta

- 12~14px
- 수치는 monospace 또는 tabular nums
- Letter spacing: 0.02em~0.08em
- 사용 위치: 퍼즐 ID, 시간, 펄스, 최소값

```css
.pageTitle {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 0.98;
}

.metric {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
```

### 4.2. 반응형 로직 (Responsive Logic)

#### Breakpoints

```text
0–479px       Compact
480–767px     Mobile
768–1023px    Tablet
1024–1279px   Desktop
1280px+       Wide
```

#### 보드 크기

```css
.gameBoard {
  inline-size: clamp(17rem, 78vw, 31rem);
  aspect-ratio: 1;
}
```

- Compact 360px에서는 축 레일을 포함한 전체 게임 폭이 328px 안에 들어가야 한다.
- 6×6 셀의 실제 시각 크기는 약 38~48px이지만 축 버튼 타깃은 투명 패딩으로 44px 이상을 유지한다.
- Wide 화면에서도 보드를 520px 이상 과도하게 키우지 않는다. 시선 이동 거리가 길어지기 때문이다.

#### Desktop

- 3-column stage
- Target·Status는 sticky가 아니라 보드와 같은 vertical start에 정렬
- 보드 중심선이 페이지 중심과 크게 벗어나지 않게 한다.

#### Tablet

- 2-row layout
- Target와 Status를 상단 strip으로 결합
- 메인 보드 폭 우선

#### Mobile

- 1-column layout
- Target mini + Status strip
- PULSE sticky bottom
- Undo·Hint는 PULSE 위 양쪽에 배치

#### Container Query

게임이 iframe, 작은 창, PWA standalone 등 다양한 컨테이너에 들어갈 수 있으므로 가능하면 페이지 viewport 외에 `.gameStage`의 inline size를 기준으로 목표·상태 배치를 전환한다.

### 4.3. 핵심 컴포넌트 로직 (Core Components)

#### 4.3.1. `BrandMark`

- 워드마크: `AXIS//SHIFT`
- `//`는 축이 이동하는 방향을 상징하며 Primary 색 또는 cut-out으로 강조한다.
- 작은 아이콘은 수평·수직 축과 하나의 이동된 노드로 구성한다.
- 로고에 과도한 글리치, 코드 스트림, 회전 애니메이션을 사용하지 않는다.

#### 4.3.2. `AxisRail`

- Column Axis는 숫자 `1–6`, Row Axis는 문자 `A–F`를 사용한다.
- 레일과 보드 사이 간격은 셀 간격보다 작게 유지해 소속 관계를 강화한다.
- 선택 축은 전체 레일 배경이 아니라 개별 버튼과 보드 방향선으로 강조한다.
- 키보드 포커스가 축 간에 이동할 때 현재 축 종류를 보조 텍스트로 안내한다.

#### 4.3.3. `TensorCell`

상태 조합:

| 상태 | 시각 처리 |
|---|---|
| OFF | Surface + Border |
| ON | Primary fill + center diamond/node |
| Preview ON | Primary soft fill + dotted ring |
| Preview OFF | ON fill 위 minus/notch + double border |
| Solved | Primary fill 또는 final target state + lock sweep |
| High Contrast ON | 검정/흰색 강대비 + 사선 또는 X pattern |

- 셀 자체는 입력 요소가 아니므로 hover 효과를 주지 않는다.
- 각 셀의 radius는 보드 크기에 따라 8~14px 범위다.
- 셀 gap은 6~12px이며 모바일에서 완전히 붙이지 않는다.
- ON/OFF 전환 시 `scale(0.92 → 1)`과 fill transition을 사용한다.

#### 4.3.4. `TargetPreview`

- 현재 보드보다 작은 크기와 Secondary 색을 사용한다.
- 목표 ON 셀에는 내부 링을 넣어 현재 ON 셀의 중심 diamond와 구분한다.
- 사용자가 목표를 계속 볼 수 있어야 하므로 모바일에서도 완전히 접지 않는다.
- 최소 펄스가 공개되는 모드에서는 `PAR 4`를 함께 표시한다.

#### 4.3.5. `PulseButton`

- 버튼 구조:

```text
PULSE
6 CELLS
```

또는 한국어:

```text
PULSE
6개 반전
```

- Primary 배경, 높은 대비의 텍스트
- 비활성 상태는 단순 opacity 저하만 사용하지 않고 경계·채움·커서를 함께 변경
- 선택 완료 시 버튼에 짧은 “charge line”이 나타나도 되지만 반복 loop는 금지
- 키보드 단축키를 데스크톱에서만 작은 `P` 배지로 표시할 수 있다.

#### 4.3.6. `StatusStrip`

```text
DAILY #018     2 / 4 PULSES     00:51
```

- 모바일에서는 3개 정보까지만 한 줄에 배치한다.
- Hint 상태는 아이콘·텍스트 배지로 두 번째 줄 또는 Result에서 표시한다.
- 숫자 폭이 변해도 레이아웃이 흔들리지 않게 tabular nums를 사용한다.

#### 4.3.7. `HintSheet`

- 현재 단계만 강조하고 잠긴 다음 단계를 흐리게 표시한다.
- 등급 영향 안내를 CTA 가까이에 둔다.
- Hint 3 적용 버튼과 단순 보기 버튼을 구분한다.
- bottom sheet는 drag gesture 없이도 명확한 닫기 버튼과 Escape를 제공한다.

#### 4.3.8. `ResultCard`

- 앱 내부 결과 패널과 공유 이미지의 정보 구조를 통일한다.
- 앱 내부에서는 버튼을 포함하고, 공유 이미지에서는 CTA 버튼을 제거한다.
- Signal Grade는 가장 크게, 퍼즐 ID는 작게 표시한다.
- Signature는 카드 하단 1/3을 차지한다.
- 정답 격자와 실제 축 조합은 표시하지 않는다.

#### 4.3.9. `SignalSignature`

- 3×5 또는 5×5 추상 셀, 선, 노드 조합
- 각 결과마다 결정적으로 생성
- ON/OFF를 색과 형태 둘 다로 구분
- 작은 썸네일에서도 브랜드처럼 보이게 일정한 외곽 프레임 유지
- 퍼즐 목표와 유사한 실제 격자 모양을 직접 재현하지 않는다.

### 4.4. 사용자 흐름 (User Flows)

#### 4.4.1. 첫 사용자

```text
Landing
→ 45초 튜토리얼 CTA
→ 행 하나 선택
→ 열 하나 선택
→ 교차점 preview
→ PULSE
→ 3개 짧은 문제
→ “이제 오늘의 신호를 풀 수 있습니다”
→ Daily 또는 Lab
```

- 첫 설명은 최대 2문장이다.
- 1단계에서는 선택 가능한 버튼만 활성화해 시선을 유도한다.
- Spotlight overlay보다 실제 컨트롤 옆의 inline callout을 사용한다.
- 튜토리얼은 언제든 Skip 가능하지만 핵심 규칙 설명 링크를 남긴다.

#### 4.4.2. 재방문 Daily

```text
Home
→ Daily Card
→ Game
→ Solve
→ Result
→ Share
→ Archive / Lab / Close
```

- 이미 완료한 경우 Daily Card에 결과와 `다시 보기`를 표시한다.
- 공유 후 홈으로 강제 이동하지 않는다.
- streak는 결과 완료 후 부드럽게 갱신한다.

#### 4.4.3. Lab 진행

```text
Lab Chapters
→ Level Grid
→ Puzzle
→ Result
→ Next Level
```

- 챕터 카드는 12개 레벨 진행률을 보여준다.
- 강제 잠금은 최소화한다. Tutorial 완료 후 Pulse 챕터를 열고, 각 챕터의 초반 일부는 자유 접근을 허용할 수 있다.
- 레벨 버튼은 등급을 S/A/B/C 문자와 패턴으로 표시한다.

#### 4.4.4. Sprint

```text
Sprint Intro
→ 3-2-1
→ Puzzle 1
→ Short transition
→ Puzzle 2…
→ Time Up
→ Result / Best comparison
```

- 퍼즐 간 결과 모달을 띄우지 않는다.
- 성공 시 보드가 250ms 안에 다음 문제로 전환된다.
- 남은 시간 10초 이하에서는 색상·짧은 음으로 알리되 화면 전체를 붉게 깜박이지 않는다.

#### 4.4.5. 오프라인

```text
Launch
→ Cached App
→ Small Offline Indicator
→ All local modes available
→ Share text/image local
```

- 오프라인을 오류 페이지로 처리하지 않는다.
- 외부 GitHub·Credits 링크만 비활성 또는 재시도 안내한다.

### 4.5. 인터랙션 모션 (Interaction Choreography)

#### 선택

| 단계 | 시간 | 동작 |
|---|---:|---|
| Press | 0–60ms | Axis 버튼 0.97 scale |
| Select | 60–120ms | Primary fill·center node 표시 |
| Preview | 80–160ms | 교차점 dotted ring fade-in |

#### PULSE

| 단계 | 시간 | 동작 |
|---|---:|---|
| Charge | 0–80ms | 선택 축을 따라 얇은 선 이동 |
| Intersect | 80–140ms | 교차점이 짧게 수축 |
| Flip | 120–220ms | 셀 채움·기호 반전 |
| Settle | 220–300ms | 모든 요소 원래 크기로 복귀 |

#### 완료

| 단계 | 시간 | 동작 |
|---|---:|---|
| Confirm | 0–180ms | 마지막 반전 완료 |
| Lock Sweep | 180–420ms | 좌상단→우하단 축 sweep |
| Grade Reveal | 360–650ms | Result Grade와 Signature 등장 |

- 완료 시 일반적 confetti를 사용하지 않는다.
- “Signal Lock”이라는 제품 고유의 축 sweep으로 성취감을 만든다.
- CTA는 애니메이션 전체 종료 전에 포커스 가능하게 하지 않는다.
- Reduced Motion에서는 단계 이동을 제거하고 120ms opacity 전환만 사용한다.

### 4.6. 피드백 우선순위

1. **즉시 피드백**: 선택됨, 미리보기, 버튼 활성화
2. **상태 피드백**: 이동 수, 시간, Hint 상태, 오프라인
3. **결과 피드백**: 셀 반전, Undo, 완료
4. **시스템 피드백**: 저장 실패, 업데이트, 공유 복사

오류는 가능한 한 발생 전에 예방한다. 예를 들어 행이나 열이 비어 있을 때 PULSE를 눌러 오류 Toast를 띄우는 대신 버튼을 비활성화하고 이유를 짧게 표시한다.

---

## 5. UI/UX 디자인 가이드 (Design System)

### 5.1. 색상 팔레트 (Color Palette)

#### 5.1.1. Dark Theme Tokens

| Token | 값 | 용도 |
|---|---|---|
| `--bg-0` | `#070A0F` | 페이지 배경 |
| `--surface-1` | `#0F141C` | 기본 카드·보드 배경 |
| `--surface-2` | `#161D28` | Elevated 카드·sheet |
| `--border` | `#2A3442` | 기본 경계선 |
| `--text-1` | `#F4F7FA` | 제목·본문 |
| `--text-2` | `#9BA8B8` | 보조 텍스트 |
| `--signal-primary` | `#72F2C5` | ON 셀·PULSE·선택 |
| `--signal-primary-soft` | `#163D35` | Preview·선택 배경 |
| `--signal-secondary` | `#8DA2FF` | Target·Hint |
| `--warning` | `#FFC65C` | 시간 경고·주의 |
| `--danger` | `#FF6B7A` | 파괴적 액션·오류 |
| `--on-primary` | `#07110E` | Primary 위 텍스트 |

#### 5.1.2. Light Theme Tokens

| Token | 값 | 용도 |
|---|---|---|
| `--bg-0` | `#F5F7FA` | 페이지 배경 |
| `--surface-1` | `#FFFFFF` | 기본 카드·보드 배경 |
| `--surface-2` | `#EEF2F6` | Elevated 카드·sheet |
| `--border` | `#D7DEE8` | 기본 경계선 |
| `--text-1` | `#111821` | 제목·본문 |
| `--text-2` | `#5F6B7A` | 보조 텍스트 |
| `--signal-primary` | `#007E69` | ON 셀·PULSE·선택 |
| `--signal-primary-soft` | `#D8F3EC` | Preview·선택 배경 |
| `--signal-secondary` | `#6B57D9` | Target·Hint |
| `--warning` | `#9A5B00` | 시간 경고·주의 |
| `--danger` | `#B4233D` | 파괴적 액션·오류 |
| `--on-primary` | `#FFFFFF` | Primary 위 텍스트 |

#### 5.1.3. 대비 기준

주요 조합의 대비 목표:

| 조합 | 대비비 근사 | 용도 |
|---|---:|---|
| Dark Text `#F4F7FA` / `#070A0F` | 18.4:1 | 기본 본문 |
| Dark Muted `#9BA8B8` / `#070A0F` | 8.2:1 | 메타 텍스트 |
| Dark Primary `#72F2C5` / `#070A0F` | 14.3:1 | 신호·포커스 |
| Light Text `#111821` / `#F5F7FA` | 16.6:1 | 기본 본문 |
| Light Muted `#5F6B7A` / `#F5F7FA` | 5.0:1 | 메타 텍스트 |
| Light Primary `#007E69` / `#F5F7FA` | 4.6:1 | 링크·아이콘 |
| White / Light Primary `#007E69` | 5.0:1 | Primary 버튼 |

- 작은 본문 텍스트는 4.5:1 이상을 유지한다.
- 테두리·비텍스트 상태는 주변과 3:1 이상의 구분을 목표로 한다.
- Primary Soft는 단독 텍스트 배경보다 Preview 면과 장식에 사용한다.

#### 5.1.4. 색상 사용 비율

- 배경·Surface·중립: 80~88%
- Signal Primary: 8~12%
- Signal Secondary: 3~6%
- Warning·Danger: 상황 발생 시에만 1~2%

Primary를 화면 전체 네온 glow로 확장하지 않는다. 강조가 희소해야 PULSE와 ON 셀의 의미가 유지된다.

### 5.2. 타이포그래피 (Typography)

#### 5.2.1. Font Family

```css
--font-sans:
  Inter,
  "Pretendard Variable",
  Pretendard,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Noto Sans KR",
  sans-serif;

--font-mono:
  ui-monospace,
  SFMono-Regular,
  Menlo,
  Monaco,
  Consolas,
  monospace;
```

- 외부 CDN 폰트는 사용하지 않는다.
- 시스템 폰트를 기본으로 하고, 자가 호스팅 폰트를 추가할 경우 라이선스와 용량을 검증한다.
- 수치에 `font-variant-numeric: tabular-nums`를 사용한다.

#### 5.2.2. Weight

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- 800 이상은 wordmark 또는 단일 Grade 외에는 사용하지 않는다.

#### 5.2.3. Type Scale

| Token | Desktop | Mobile | 용도 |
|---|---:|---:|---|
| `display-xl` | 72px | 44px | Home wordmark |
| `display-lg` | 56px | 40px | Result Grade |
| `heading-xl` | 36px | 30px | Page title |
| `heading-lg` | 28px | 24px | Section title |
| `heading-md` | 22px | 20px | Card title |
| `body-lg` | 18px | 17px | 핵심 설명 |
| `body-md` | 16px | 16px | 기본 본문 |
| `label` | 14px | 14px | 버튼·레이블 |
| `meta` | 12px | 12px | ID·시간·보조 정보 |

- 본문 line-height: 1.55~1.65
- 제목 line-height: 1.0~1.2
- 최대 본문 줄 길이: 68ch

### 5.3. 공간 체계 (Spacing)

4px 기본 단위를 사용한다.

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
```

| 용도 | 값 |
|---|---:|
| 셀 gap | 6~12px |
| 축–보드 gap | 6~10px |
| 버튼 내부 gap | 8~12px |
| 카드 padding Mobile | 16~20px |
| 카드 padding Desktop | 24~32px |
| 섹션 간격 | 48~80px |
| 게임 주요 영역 간격 | 20~32px |

### 5.4. Radius·Border·Shadow

#### Radius

- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 24px
- `pill`: 999px

셀과 축 버튼은 `sm~md`, 카드와 sheet는 `lg~xl`을 사용한다.

#### Border

- 기본: 1px solid `--border`
- Focus: 2px solid `--signal-primary` + 2px offset
- Preview: 1px dashed 또는 double motif
- 고대비: 2px solid

#### Shadow

- Dark에서 과도한 drop shadow 대신 border와 surface 차이를 사용한다.
- Light elevated surface:
  - `0 8px 24px rgba(17, 24, 33, 0.08)`
- PULSE hover:
  - 미세한 `0 8px 24px color-mix(...)`
- 셀마다 개별 대형 shadow를 적용하지 않는다.

### 5.5. 아이콘 (Iconography)

- 20px·24px 기본
- Stroke 1.75~2px
- Round cap·round join
- 가능한 한 단순한 축·노드·펄스 모티프
- 의미:
  - Undo: 왼쪽 회전 화살표
  - Reset: 원형 화살표 + 중심점
  - Hint: 축 교차점 + 작은 별
  - Share: 외부 방향 신호
  - Settings: 3개의 슬라이더
- 아이콘만 있는 버튼에는 accessible name과 tooltip을 제공한다.

### 5.6. 버튼 (Buttons)

#### Primary

- PULSE, 결과 공유, 튜토리얼 시작
- Primary fill + on-primary text
- 최소 높이 52px
- 한 화면에 최대 1개

#### Secondary

- 다음 퍼즐, 이어하기, 다시 플레이
- Surface fill + Primary border/text

#### Ghost

- Undo, Hint, 설정 내 보조 액션
- 투명 배경 + 텍스트/아이콘

#### Danger

- 진행도 초기화, 현재 퍼즐 Reset 확인
- Danger fill은 확인 단계에서만 사용

#### 상태

| 상태 | 처리 |
|---|---|
| Hover | 1px translateY(-1), border/brightness 변화 |
| Pressed | scale(0.98) |
| Focus | 2px ring + offset |
| Disabled | 중립 Surface, 낮은 채도, `not-allowed`는 마우스 환경에서만 |
| Loading | 레이아웃 유지, 짧은 spinner 또는 진행 라인 |

### 5.7. 카드 (Cards)

- 카드 자체를 클릭 가능한 경우 내부에 별도 중복 버튼을 두지 않는다.
- Daily Card는 Home에서만 큰 Accent line을 사용할 수 있다.
- Lab Chapter Card는 progress와 성격을 보여주되 장식 이미지를 요구하지 않는다.
- 결과 카드는 공유 이미지와 같은 비율·정보 순서를 따른다.
- 카드 내 카드 중첩은 최대 1단계다.

### 5.8. 보드와 셀 (Grid System)

#### 셀 비율

- 정사각형 `aspect-ratio: 1`
- 보드 크기에 따라 radius와 gap을 `clamp()`로 조절
- 셀의 중심 기호는 셀 크기의 18~24%

#### 상태 우선순위

```text
Solved > Preview Toggle-Off > Preview Toggle-On > ON > OFF
```

- Preview Toggle-Off는 현재 ON 셀 위에 `−` 또는 내부 cut-out을 표시한다.
- Preview Toggle-On은 OFF 셀 안에 점선 링과 작은 `+`를 표시할 수 있다.
- 실제 반전 후 Preview 표식은 제거한다.

#### Target와 Current의 구분

| 요소 | Current | Target |
|---|---|---|
| 색 | Primary | Secondary |
| 중심 기호 | Diamond/Node | Ring |
| 인터랙션 | 축에 따라 반전 | Read-only |
| 크기 | Main | 25~45% |

### 5.9. 모션 (Motion)

#### Duration Tokens

- `instant`: 80ms
- `fast`: 120ms
- `normal`: 220ms
- `pulse`: 300ms
- `success`: 650ms

#### Easing

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-emphasized: cubic-bezier(0.2, 0.8, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

#### 금지

- 무한 배경 파티클
- 텍스트 글리치 반복
- 화면 흔들림
- 긴 스프링 bounce
- 800ms를 넘는 필수 전환
- 게임 상태와 무관한 pulse loop

### 5.10. 사운드·햅틱 (Audio & Haptics)

- 선택음: 짧고 건조한 click/tone
- 행과 열은 음높이 또는 stereo 방향을 다르게 하되 필수 정보로 사용하지 않는다.
- PULSE: 선택 수에 따라 가벼운 chord 변화
- Undo: 역방향 짧은 sweep
- 완료: 3~4음의 상승형 signal lock
- 오류: 강한 buzzer 대신 짧은 낮은 tone
- 기본 볼륨은 과하지 않게 설정하고 첫 플레이 전에 명시적 음소거 버튼을 제공한다.
- 햅틱:
  - 선택: 없음 또는 5ms
  - PULSE: 10ms
  - 완료: 10ms–30ms–10ms 패턴
- 시스템·브라우저 미지원 시 조용히 생략한다.

### 5.11. 콘텐츠 디자인 (Content Design)

#### 기본 용어

| 영어 | 한국어 | 사용 위치 |
|---|---|---|
| PULSE | PULSE / 펄스 | Primary CTA |
| Target Signal | 목표 신호 | Target 카드 |
| Pulses | 펄스 | 이동 수 |
| Par | 최소 펄스 | 상태·결과 |
| Signal Grade | 신호 등급 | 결과 |
| Daily Signal | 오늘의 신호 | Home·Daily |
| Signal Locked | 신호 고정 완료 | 완료 헤더 |
| Undo | 되돌리기 | 게임 |
| Reset | 초기화 | 게임 메뉴 |
| Hint | 힌트 | 게임 |

#### 문장 원칙

- 튜토리얼은 명령형이되 위압적이지 않게 쓴다.
- 한 문장에 하나의 행동만 안내한다.
- 수학 용어를 첫 플레이에 사용하지 않는다.
- 실패를 비난하는 표현을 피한다.

##### 예시

```text
행 하나를 선택하세요.
이제 열 하나를 선택하세요.
빛나는 교차점이 PULSE로 반전됩니다.
```

```text
행과 열을 각각 하나 이상 선택하세요.
```

```text
신호가 맞았습니다.
4번의 펄스로 최소해를 완성했습니다.
```

#### 피해야 할 표현

- “틀렸습니다”
- “잘못된 이동”
- “AI 텐서 행렬 외적을 계산하세요”
- “이 퍼즐은 쉽습니다”
- 지나친 감탄사와 밈 표현

`EASY / 쉬움` 같은 난도 배지는 콘텐츠를 찾기 위한 중립적 메타데이터이므로 사용할 수 있다. “이 퍼즐은 쉽습니다”처럼 사용자의 체감이나 능력을 단정하는 평가 문장은 계속 사용하지 않는다.

### 5.12. 공유 카드 (Share Card)

Wordle 유사성은 정답을 숨긴 채 핵심 결과를 짧고 반복 가능한 1:1·텍스트 형식으로 SNS에 공유하는 레이아웃 원칙에만 한정한다. Wordle의 하루 한 문제 cadence나 플레이 제한은 차용하지 않는다.

#### 1080×1080 구조

```text
┌────────────────────────────────┐
│ AXIS//SHIFT           #018     │
│                                │
│          SIGNAL GRADE          │
│               S                │
│                                │
│  4 / 4 PULSES        00:51     │
│  NO HINT                        │
│                                │
│      ▰ ▱ ▰ ▰ ▱                 │
│      ▱ ▰ ▱ ▰ ▰                 │
│      ▰ ▰ ▱ ▱ ▰                 │
│                                │
│  axis-shift.game               │
└────────────────────────────────┘
```

- Safe margin: 72px
- Grade: 180~240px 상당의 시각 크기
- Signature: 하단 28~34%
- 브랜드: 좌상단
- URL: 하단, 작은 크기지만 읽을 수 있게
- 결과 카드에는 버튼처럼 보이는 장식을 넣지 않는다.

#### 1200×630 구조

- 좌측: 브랜드·Grade·수치
- 우측: 큰 Signal Signature
- 16:9 썸네일에서도 Grade와 Signature가 320px 폭에서 식별되어야 한다.

#### 텍스트 공유

- 정답 패턴 대신 Signature 사용
- 줄 수 10줄 안팎
- 플랫폼별 잘림을 고려해 첫 3줄에 게임명·등급·핵심 수치 배치
- 해시태그를 자동으로 과도하게 붙이지 않는다.

---

## 6. 파일 구조 (File Structure)

```text
src/
├── assets/
│   ├── brand/
│   │   ├── axis-shift-wordmark.svg
│   │   ├── axis-shift-mark.svg
│   │   └── app-icon-source.svg
│   ├── icons/
│   │   ├── undo.svg
│   │   ├── reset.svg
│   │   ├── hint.svg
│   │   ├── share.svg
│   │   ├── settings.svg
│   │   └── sound.svg
│   └── styles/
│       ├── reset.css
│       ├── tokens.css
│       ├── themes.css
│       ├── typography.css
│       ├── motion.css
│       ├── global.css
│       └── utilities.css
├── components/
│   ├── layout/
│   │   ├── AppShell/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── PageContainer/
│   │   └── BottomActionBar/
│   ├── ui/
│   │   ├── Button/
│   │   ├── IconButton/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Dialog/
│   │   ├── BottomSheet/
│   │   ├── Toast/
│   │   ├── Toggle/
│   │   └── VisuallyHidden/
│   └── game/
│       ├── GameStage/
│       ├── AxisRail/
│       ├── AxisToggle/
│       ├── TensorGrid/
│       ├── TensorCell/
│       ├── TargetPreview/
│       ├── StatusStrip/
│       ├── PulseButton/
│       ├── HintSheet/
│       ├── ResultScene/
│       └── SignalSignature/
├── features/
│   ├── home/
│   ├── tutorial/
│   ├── lab/
│   ├── daily/
│   ├── sprint/
│   ├── archive/
│   ├── settings/
│   └── about/
├── services/
│   └── sharing/
│       ├── card-layout.ts
│       ├── card-renderer.ts
│       └── signature-renderer.ts
└── test/
    └── visual-fixtures/
        ├── game-dark.ts
        ├── game-light.ts
        ├── game-high-contrast.ts
        ├── result-square.ts
        └── result-wide.ts

public/
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── maskable-512.png
├── og/
│   └── default-1200x630.png
└── favicon.svg

docs/
├── DESIGN_WHITEPAPER.md
├── DESIGN_TOKENS.md
├── SCREEN_SPECS.md
├── ACCESSIBILITY_CHECKLIST.md
└── ASSET_LICENSES.md
```

---

## 7. 개발 시 주의사항 (Implementation Notes)

### 7.1. 스타일링 전략 (Styling Strategy)

1. 전역 CSS는 reset, token, typography, theme, utility까지만 담당한다.
2. 기능 컴포넌트 스타일은 CSS Modules에 둔다.
3. 상태는 임의의 문자열 클래스보다 `data-state`, `data-phase`, `aria-pressed`를 우선한다.
4. 색상·spacing·radius·motion 값을 컴포넌트에 하드코딩하지 않는다.
5. `!important`는 고대비·reduced motion 같은 전역 접근성 override 외에는 사용하지 않는다.
6. CSS nesting·container query 등 최신 기능은 지원 범위와 폴백을 확인한다.
7. 테마별 이미지 파일을 따로 만들기보다 토큰과 SVG `currentColor`를 사용한다.

### 7.2. 접근성 가이드 (Accessibility)

1. 축 버튼은 `aria-pressed`를 제공한다.
2. PULSE가 비활성인 이유를 시각 텍스트와 accessible description으로 제공한다.
3. 보드 셀을 수십 개의 tab stop으로 만들지 않는다.
4. 보드의 현재 상태는 요약 live region 또는 읽기 버튼을 통해 제공한다.
5. 완료 시 포커스를 결과 제목으로 이동하고, 결과 화면 종료 후 적절한 위치로 복원한다.
6. 모달·bottom sheet는 focus trap, Escape, 배경 inert를 지원한다.
7. 모든 아이콘 단독 버튼에 accessible name을 제공한다.
8. 색상 외에 shape·border·pattern·text를 함께 사용한다.
9. `prefers-reduced-motion`, 200% zoom, high contrast를 지원한다.
10. 키보드만으로 첫 실행부터 결과 공유까지 진행할 수 있어야 한다.
11. 시간 제한이 있는 Sprint 외에는 완료 시간에 따른 강제 실패가 없다.
12. 사운드·햅틱을 끄더라도 정보 손실이 없어야 한다.

### 7.3. 예외 처리 (Exception Handling)

- 퍼즐 로드 실패: 빈 보드를 보여주지 말고 복구 카드와 홈 링크를 표시한다.
- 공유 이미지 생성 실패: 텍스트 공유를 유지한다.
- 폰트 미로드: 시스템 폰트로 즉시 렌더링한다.
- 사운드 초기화 실패: 음소거 상태로 계속한다.
- LocalStorage 실패: “이 기기에서는 기록이 저장되지 않습니다”를 인라인으로 알린다.
- service worker 업데이트: 진행 중 세션을 방해하지 않는 배너를 사용한다.
- 오프라인: 외부 링크만 제한하고 게임은 정상 화면을 유지한다.

### 7.4. 모바일 브라우저 주의사항

1. PULSE sticky bar에 safe area inset을 적용한다.
2. `100vh`를 고정 사용하지 않고 `dvh/svh`와 폴백을 사용한다.
3. 터치 hover 고정 문제를 피하기 위해 hover media query를 사용한다.
4. 두 번 탭 확대와 축 선택이 충돌하지 않도록 버튼 크기와 touch-action을 조절한다.
5. 화면 회전 후 보드가 뷰포트 밖으로 밀리지 않게 한다.
6. 공유 API 파일 지원이 다를 수 있으므로 버튼 문구와 폴백을 런타임에 맞춘다.

### 7.5. 현지화 (Localization)

- 문자열을 CSS pseudo-element로 삽입하지 않는다.
- 한국어와 영어의 길이 차이를 고려해 버튼 최소 폭을 고정하지 않는다.
- 영어 대문자 label은 한국어에서 억지로 모두 대문자 스타일을 적용하지 않는다.
- 시간은 `mm:ss`, 날짜는 locale 형식을 사용하되 퍼즐 ID는 ISO 날짜를 유지할 수 있다.
- 줄바꿈은 단어 중간이 아닌 자연스러운 어절 기준으로 한다.
- 공유 카드의 한국어·영어 버전에서 수치 정렬과 Signature 위치가 동일하게 유지되어야 한다.

### 7.6. 시각적 금지 사항

- 복잡한 데이터센터·AI 대시보드 스타일
- 배경을 가득 채우는 코드·행렬 숫자 rain
- 과도한 neon glow와 chromatic aberration
- 3D 회전 큐브를 기본 로딩·배경 요소로 사용
- 일반적인 confetti 완료 효과
- 버튼마다 다른 gradient
- 지나치게 작은 monospace 본문
- 셀마다 서로 다른 색상
- 튜토리얼을 여러 모달로 분절
- 게임 보드 주변의 광고성 CTA와 GitHub 버튼

---

## 8. 화면별 상세 명세 (Screen Specifications)

### 8.1. Home

#### 목적

- 첫 사용자에게 튜토리얼을, 재방문 사용자에게 Daily를 가장 빠르게 제공한다.
- 게임의 규칙을 한 문장과 작은 데모 격자로 보여준다.

#### 구성

```text
Header
Hero Wordmark
One-line Value Proposition
Primary Daily/Tutorial Card
Continue Lab Card
Sprint Card
Recent Record / Streak
Footer
```

#### Hero 카피 예시

```text
AXIS//SHIFT
축을 선택하고 교차점을 뒤집어 목표 신호를 맞추세요.
```

- 자동 재생 애니메이션은 4×4 미니 격자에서 1회만 실행하고 반복하지 않는다.
- 첫 사용자 Primary CTA: `45초 튜토리얼`
- 재방문 Primary CTA: `오늘의 신호 시작`

#### 승인 기준

- 360px에서 Primary CTA가 첫 화면에 보인다.
- 설명이 2줄을 넘지 않는다.
- 튜토리얼 완료 여부에 따라 카드 우선순위가 바뀐다.

### 8.2. Tutorial

#### 단계

1. 행 하나 선택
2. 열 하나 선택
3. 교차점 확인
4. PULSE 실행
5. 복수 행·열 선택
6. 겹치면 다시 반전됨 이해

#### 디자인

- 실제 게임 화면을 축소하지 않고 그대로 사용한다.
- 현재 단계에 필요한 요소만 강하게 보이게 한다.
- 나머지 요소는 비활성화하되 완전히 숨기지 않는다.
- 안내 문구는 보드 위 또는 아래 한 곳에 고정한다.
- Progress: `1 / 6`

### 8.3. Daily Signal

#### 상단 정보

- `DAILY #018`
- 현지 날짜
- `PAR 4`
- streak는 게임 중 표시하지 않고 결과 또는 Home에서 표시

#### 게임 중

- Target, Current, Status, PULSE
- 타이머는 과도하게 강조하지 않는다.
- Hint는 우측 또는 보조 액션 영역

#### 완료

- Signal Grade
- 펄스 효율
- 시간
- streak 갱신
- 공유

### 8.4. Lab

#### 챕터 카드

| 챕터 | 시각 키워드 | 설명 |
|---|---|---|
| Pulse | 단일 교차 | 행×열의 기본 |
| Echo | 겹침·반전 | 두 번 닿으면 꺼짐 |
| Rank | 여러 축 층 | 최소 펄스 탐색 |
| Noise | 초기 신호 | 빈 보드가 아닌 시작 |

- 챕터마다 색을 완전히 바꾸지 않고 Primary/Secondary의 비율과 패턴만 다르게 한다.
- 레벨 그리드는 3~4열 모바일, 6열 데스크톱.
- S/A/B/C를 문자와 테두리 패턴으로 표시한다.

### 8.5. Sprint

#### Intro

- `180 seconds`
- 해결 수·S 등급 수로 점수 계산 설명
- Primary CTA `START SPRINT`

#### 게임

- 타이머를 상단 중앙에 크게 표시하되 보드보다 크지 않게 한다.
- 30초 이하: Warning 색을 점진적으로 적용
- 10초 이하: 숫자와 짧은 음, 화면 flashing 없음
- 퍼즐 완료 전환은 250ms 안에 끝낸다.

#### Result

- 총점
- 해결 수
- S 등급 수
- 최고 기록 비교
- 다시 시작
- 공유 카드는 Daily와 다른 `SPRINT` 라벨을 사용한다.

### 8.6. Archive

- 월 단위 달력
- 날짜 버튼은 완료 상태, 등급, 오늘, 미래를 구분한다.
- 미래 날짜는 비활성화한다.
- 완료 상태는 색 + 작은 등급 문자 사용
- 모바일에서는 달력 가독성을 위해 카드 padding을 줄이고 날짜 타깃은 40~44px 확보
- 날짜 선택 시 상세 기록과 `다시 플레이` CTA를 하단에 표시

### 8.7. Settings

#### 그룹

1. Appearance: Theme, High Contrast Cells, Reduced Motion
2. Audio: Sound, Volume, Haptics
3. Language: Korean, English
4. Controls: Keyboard hints
5. Data: Export/Reset Progress
6. About: Version, GitHub, Licenses

- 토글마다 즉시 미리보기가 가능해야 한다.
- `Reset Progress`는 Danger 영역으로 분리한다.
- 설정 화면을 닫으면 이전 포커스 위치로 돌아간다.

### 8.8. About / The Math Behind It

- 첫 섹션은 3단계 조작 그림
- 두 번째 섹션에서 “이 게임 뒤에는 이진 행렬이 있습니다”를 설명
- 수식은 선택적 확장 영역에 둔다.
- `rank = 최소 펄스`를 작은 시각 예제로 보여준다.
- GitHub·라이선스·Codex 협업 설명을 포함할 수 있다.
- 이 페이지는 게임 진행에 필요하지 않으며 수학 학습을 강제하지 않는다.

### 8.9. Error / Recovery

#### 일반 오류

```text
신호를 불러오지 못했습니다.
기록은 그대로 유지됩니다.
[다시 시도] [홈으로]
```

- 기술 스택 trace를 일반 사용자에게 노출하지 않는다.
- 개발 빌드에서만 오류 ID와 재현 정보를 보여준다.
- Error 화면도 브랜드와 테마를 유지한다.

---

## 9. 접근성 상세 명세 (Accessibility Specification)

### 9.1. 키보드

- 논리적 Tab 순서
- 모든 축 버튼의 visible focus
- Enter/Space 선택
- PULSE 단축키와 실제 버튼 모두 제공
- Escape로 sheet/dialog 종료
- 결과 화면 포커스 관리
- focus trap이 background scroll과 함께 작동

### 9.2. 스크린리더

#### 축 버튼 예시

```text
행 A, 선택되지 않음, 버튼
열 3, 선택됨, 버튼
```

#### 상태 요약 예시

```text
5행 5열 보드. 켜진 셀 9개. 행 A와 C, 열 2와 5가 선택됨. 4개 셀이 반전될 예정입니다.
```

- 매 셀 변화마다 live region을 연속 갱신하지 않는다.
- PULSE 후 “4개 셀이 반전되었습니다. 목표와 7개 셀이 다릅니다.” 같은 요약을 제공할 수 있다.
- Target 패턴은 필요 시 행별 이진 텍스트 또는 좌표 목록으로 읽는 별도 기능을 제공한다.

### 9.3. 색각·고대비

- ON 셀: 색 + 중심 diamond
- Target ON: 색 + ring
- Preview ON: 점선 + plus
- Preview OFF: double border + minus
- Selected Axis: 채움 + node + `aria-pressed`
- Grade: 문자 S/A/B/C
- Streak: 숫자와 label

### 9.4. 모션

- 시스템 Reduced Motion을 기본 존중
- 모션 감소 시 scale, sweep, slide 제거
- 상태 변경은 즉시 또는 120ms opacity로 표현
- 시간 경고에서 pulse animation 반복 금지

### 9.5. 인지 접근성

- 튜토리얼 문장은 15~25자 내외의 단일 지시문
- 버튼 위치를 플레이 중 변경하지 않는다.
- PULSE 후 선택이 초기화된다는 사실을 첫 튜토리얼에서 보여준다.
- 등급과 최소 펄스의 관계를 결과에서 설명한다.
- Hint 사용이 가능하지만 사용하지 않아도 된다는 표현을 사용한다.

---

## 10. 디자인 QA 체크리스트 (Design QA Checklist)

### 10.1. 뷰포트

- [ ] 360×640
- [ ] 390×844
- [ ] 430×932
- [ ] 768×1024
- [ ] 1024×768
- [ ] 1280×720
- [ ] 1440×900
- [ ] 1920×1080

### 10.2. 테마·접근성

- [ ] Light
- [ ] Dark
- [ ] High Contrast
- [ ] Reduced Motion
- [ ] 200% Zoom
- [ ] 키보드 전용
- [ ] 스크린리더 주요 흐름
- [ ] 색각 이상 시뮬레이션

### 10.3. 게임 상태

- [ ] 아무 축도 선택되지 않음
- [ ] 행만 선택
- [ ] 열만 선택
- [ ] 복수 행·열 선택
- [ ] ON 셀을 OFF로 바꿀 Preview
- [ ] PULSE 중
- [ ] Undo 가능·불가
- [ ] Hint 단계 1·2·3
- [ ] 완료 직전
- [ ] 완료 Result
- [ ] Sprint 10초 이하
- [ ] 저장 실패
- [ ] 오프라인
- [ ] 업데이트 가능

### 10.4. 현지화

- [ ] 한국어 360px 줄바꿈
- [ ] 영어 긴 버튼·설명
- [ ] 날짜·시간 형식
- [ ] 공유 카드 한·영
- [ ] 수치 정렬
- [ ] 누락 번역 key 없음

### 10.5. 공유 카드

- [ ] 1080×1080
- [ ] 1200×630
- [ ] Dark brand palette
- [ ] 긴 퍼즐 ID
- [ ] C 등급·Hint Used
- [ ] S 등급·No Hint
- [ ] 폰트 fallback
- [ ] Signature가 목표 패턴을 노출하지 않음
- [ ] 320px 축소 썸네일 식별

---

## 11. 디자인 인계 및 승인 기준 (Design Handoff & Definition of Done)

### 디자인 시스템

- [ ] 모든 색·공간·radius·motion이 token으로 정의된다.
- [ ] Light/Dark/High Contrast 간 의미 token이 동일하다.
- [ ] 버튼·카드·축·셀 상태가 Story 또는 fixture로 확인 가능하다.
- [ ] 아이콘 stroke와 viewBox 규칙이 통일된다.

### 게임 화면

- [ ] 선택 축과 반전 예정 셀이 즉시 연결되어 보인다.
- [ ] PULSE가 유일한 Primary CTA다.
- [ ] Target와 Current를 색상 외 형태로도 구분한다.
- [ ] 360px에서 6×6 보드와 축 타깃이 사용 가능하다.
- [ ] 완료 애니메이션이 650ms 안에 끝난다.
- [ ] Reduced Motion에서 정보 손실이 없다.

### 사용자 흐름

- [ ] 첫 실행에서 2회 이하 주요 액션으로 튜토리얼을 시작한다.
- [ ] 90초 안에 첫 성공을 경험할 수 있는 튜토리얼이다.
- [ ] Daily 완료 후 한 화면에서 공유와 다음 행동이 가능하다.
- [ ] 새로고침·오프라인·오류 복구 시 브랜드와 상태가 유지된다.

### 접근성

- [ ] 모든 핵심 조작에 키보드 경로가 있다.
- [ ] 인터랙티브 요소가 44×44px 이상이다.
- [ ] 기본 텍스트 대비가 AA 기준을 만족한다.
- [ ] 색상만으로 상태를 전달하지 않는다.
- [ ] dialog/sheet의 포커스 관리가 검증된다.

### 배포 자산

- [ ] Wordmark SVG
- [ ] App Icon·Maskable Icon
- [ ] Favicon
- [ ] Generic OG Image
- [ ] Share Card layouts 2종
- [ ] ASSET_LICENSES
- [ ] 모바일 홈 화면 아이콘·PWA standalone 확인

---

## 12. 출시 후 확장 방향 (Post-Release Design Extensions)

### 12.1. 시즌 테마

- 색상 전체를 바꾸지 않고 Signature 프레임·미세 패턴·배지로 시즌성을 표현한다.
- 코어 셀 상태 색상은 접근성과 학습 일관성을 위해 유지한다.

### 12.2. 사용자 퍼즐 코드

- 짧은 퍼즐 코드를 입력하거나 공유하는 화면
- 사용자 제작 퍼즐은 별도 라벨과 경고를 표시
- 공개 갤러리는 서버 도입 이후 검토

### 12.3. 비정사각·다중 상태 모드

- `4×6` 행렬
- 3상태 셀
- 제한된 펄스 타입
- 기존 Daily와 시각 문법이 혼동되지 않도록 Experimental Lab로 분리

### 12.4. 앱 스토어 래핑

- PWA standalone과 동일한 화면 구조 유지
- 시스템 back gesture, safe area, status bar theme 검증
- 광고·결제 도입 여부와 무관하게 보드 주변의 집중 영역은 유지

---

## 부록 A. 핵심 화면 카피 초안

### Home

```text
AXIS//SHIFT
축을 선택하고 교차점을 뒤집어 목표 신호를 맞추세요.

오늘의 신호
모두에게 같은 퍼즐이 주어집니다.
[시작]
```

### Tutorial

```text
행 하나를 선택하세요.
열 하나를 선택하세요.
빛나는 교차점이 PULSE로 반전됩니다.
```

### Game

```text
TARGET
목표 신호

PULSE
6개 반전

행과 열을 각각 하나 이상 선택하세요.
```

### Result

```text
SIGNAL LOCKED
신호가 맞았습니다.

SIGNAL GRADE S
4 / 4 PULSES
00:51 · NO HINT

[결과 공유] [다음 퍼즐]
```

### Hint

```text
힌트 1
남은 최소 펄스 수를 확인합니다.

힌트 2
다음 펄스의 한 축을 표시합니다.

힌트 3
다음 펄스의 행과 열을 모두 표시합니다.
```

### Offline

```text
오프라인 모드
게임과 기록은 이 기기에서 계속 사용할 수 있습니다.
```

### Storage Failure

```text
기록을 저장할 수 없습니다.
현재 게임은 계속할 수 있지만 새로고침 후 진행도가 사라질 수 있습니다.
```

## 부록 B. 디자인 결정 요약

| 결정 | 채택 | 이유 |
|---|---|---|
| Dark-only | 아니오 | 기기·접근성 선호 대응 |
| System + Dark/Light/High Contrast | 예 | 선택권과 접근성 |
| 3-column Desktop | 예 | Target·Game·Status 동시 가시성 |
| 모바일 PULSE sticky | 예 | 한 손 조작과 주요 액션 유지 |
| 일반 confetti | 아니오 | 제품 고유성이 낮고 산만함 |
| Signal Lock sweep | 예 | 게임 규칙과 연결된 완료 연출 |
| 보드 Canvas | 아니오 | 접근성과 반응형 DOM이 유리 |
| 공유 Canvas | 예 | 일관된 PNG 생성 |
| 네온 cyberpunk | 아니오 | 과밀·전형성·저사양 부담 |
| 제한된 민트·보라 팔레트 | 예 | Current·Target·Hint의 명확한 구분 |
| 수학 용어 초기 노출 | 아니오 | 대중적 진입 장벽 방지 |
| About에서 수학 공개 | 예 | 소재의 깊이와 교육적 가치 보존 |
