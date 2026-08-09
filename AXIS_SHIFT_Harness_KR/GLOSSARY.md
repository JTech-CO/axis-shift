# GLOSSARY.md — AXIS//SHIFT 공유 용어집

> 사람과 에이전트가 같은 단어를 같은 의미로 사용하도록 고정한다. 사용자 노출 용어와 내부 수학·하네스 용어를 구분한다.

## 게임·수학 용어

| 용어 | 정의 | 사용자 노출 |
|---|---|---|
| Axis / 축 | 행 또는 열 선택 레일. Row Axis와 Column Axis가 있다. | 예 |
| Board / 현재 보드 | 플레이 중인 `N×N` 이진 행렬 B. | `현재 신호`로 노출 |
| Target / 목표 신호 | 플레이어가 맞춰야 하는 이진 행렬 T. | 예 |
| Cell | OFF(0) 또는 ON(1) 상태를 가진 보드 한 칸. | 셀이라는 표현은 최소화 |
| Row Mask | 선택한 행을 비트로 나타낸 열벡터 r. | 아니오 |
| Column Mask | 선택한 열을 비트로 나타낸 행벡터 c. | 아니오 |
| PULSE / 펄스 | 선택 행×열의 교차점을 한 번 XOR 반전하는 이동. | 예, Primary CTA |
| Outer Product / 외적 | `r ⊗ c`로 교차점 rank-1 행렬을 만드는 연산. | About에서만 |
| XOR | 같은 비트는 0, 다른 비트는 1이 되는 `GF(2)` 덧셈. 셀 반전에 사용. | 첫 플레이에는 숨김 |
| `GF(2)` | 0과 1로 이루어진 유한체. 덧셈이 XOR다. | About에서만 |
| Difference Matrix / 차이 행렬 | `D = current XOR target`. 해결해야 할 남은 변화. | 아니오 |
| Rank / 랭크 | `GF(2)` 위 차이 행렬의 랭크. 최소 펄스 수와 같다. | 고급 설명에서만 |
| Par / 최소 펄스 | 현재 퍼즐의 증명된 최소 PULSE 수. | 예 |
| Canonical Factorization / 정규 분해 | 같은 입력에 항상 같은 최적 펄스열을 반환하는 결정적 분해. Hint 기준. | 아니오 |
| Signal Grade / 신호 등급 | 사용 펄스, Par, Hint에 따른 S/A/B/C 결과. | 예 |
| Signal Signature | 정답 대신 결과·풀이 흔적을 해시해 만든 추상 공유 패턴. | 예 |
| Daily Signal | UTC 날짜 기준 모든 사용자가 같은 generator version에서 얻는 일일 퍼즐. | 예 |
| Lab | 큐레이션된 48개 레벨 캠페인. | 예 |
| Sprint | 180초 동안 연속 퍼즐을 해결하는 모드. | 예 |
| Archive | 과거 Daily를 다시 생성하고 로컬 기록을 보는 모드. | 예 |
| Hint Depth | 남은 최소 펄스 수만 공개하는 1단계 힌트. | 예 |
| Hint Axis | 다음 최적 펄스의 한 축만 공개하는 2단계 힌트. | 예 |
| Hint Pulse | 다음 최적 펄스의 행·열 전체를 공개하는 3단계 힌트. | 예 |
| Generator Version | Daily 생성 계약의 버전 문자열. 과거 Daily 재현성을 보호한다. | About/진단에서만 |
| Fallback Puzzle | 생성 시도 제한을 넘을 때 같은 입력에서 결정적으로 선택하는 사전 검증 퍼즐. | 오류 없이 내부 사용 |

## 상태·제품 용어

| 용어 | 정의 |
|---|---|
| Session | 하나의 퍼즐을 시작해 완료·중단할 때까지의 런타임 상태. |
| Resume | 새로고침 후 검증된 저장 상태에서 미완료 세션을 복구하는 기능. |
| Best Record | 퍼즐별 최고 등급·최소 펄스·최단 시간 중 명세된 비교 규칙으로 저장한 기록. |
| Streak | 로컬 기기에서 연속 날짜 Daily 완료를 계산한 값. 계정 동기화 없음. |
| Static-First | 서버 없이 정적 호스팅과 브라우저 API만으로 핵심 기능을 제공하는 원칙. |
| Offline-Ready | 앱 셸과 필수 콘텐츠가 캐시된 뒤 네트워크 없이 핵심 플레이가 가능한 상태. |
| Reduced Motion | 시스템 또는 설정에 따라 상태 정보는 유지하면서 sweep·scale·slide를 줄이는 모드. |
| High Contrast | 색뿐 아니라 2px 경계와 형태 표식을 강화한 테마. |

## 하네스 용어

| 용어 | 정의 |
|---|---|
| Phase | 독립적인 진입조건·산출물·완료 게이트를 가진 작업 단계. |
| DoR (Definition of Ready) | phase를 시작할 수 있는 진입조건. 하나라도 미충족이면 시작 금지. |
| DoD (Definition of Done) | phase 완료를 판정하는 측정 가능한 게이트. 전부 통과해야 완료. |
| Invariant / 불변식 | 절대 위반할 수 없는 규칙. 1건 위반 시 통과 금지. |
| Gate / 게이트 | 명령·수치·이진 결과로 통과/실패를 판정하는 기준. |
| Evidence / 증거 | 게이트 통과를 뒷받침하는 명령, 종료 코드, 핵심 출력, 리포트, 실기기 기록. |
| Parity / 정합성 | 두 구현·환경이 동일 입력에서 동일 출력을 내는 상태. |
| ADR | Architecture Decision Record. 중요한 결정과 대안·트레이드오프 기록. |
| STOP | 우회하지 않고 작업을 중단해 재현·시도·가설·필요 결정을 보고하는 절차. |
| P0/P1/P2/P3 | 결함 심각도. P0·P1은 릴리스 차단. |
| Golden Vector | 입력과 기대 출력을 고정해 구현·환경 간 결정성을 검증하는 fixture. |
| Property Test | 개별 예시가 아니라 많은 입력에서 항상 성립해야 하는 성질을 검증하는 테스트. |
| Evidence Level | E0~E4로 구분한 완료 증거 강도. |
