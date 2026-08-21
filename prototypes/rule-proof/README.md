# M00 Rule Proof / H00 Hackathon prototype

M00의 규칙 이해도 검증을 통과한 정적 프로토타입을 H00 해커톤 제출 슬라이스로 확장했다. `v0.1` 범위이며 React 제품 코어, 저장, PWA, Daily, Sprint, 공유 및 프로덕션 디자인 시스템 완료를 의미하지 않는다.

## 실행

저장소 루트에서 실행한다.

```bash
node prototypes/rule-proof/verify-fixture.mjs
node prototypes/rule-proof/verify-h00-campaign.mjs
node prototypes/rule-proof/serve.cjs
```

브라우저에서 `http://localhost:4173/`을 연다. 기본 run은 `M00-MAIN-v1 / 쉬움 4×4 / 신호 1`이다. 여섯 플레이 가능 profile은 `?stage=easy`, `?stage=normal`, `?stage=normal-5`, `?stage=hard-4`, `?stage=hard-5`, `?stage=hard-6`이며, 각 profile의 고정 신호 1~3은 `&signal=1`, `&signal=2`, `&signal=3`으로 재현할 수 있다. 완료 CTA는 18개 신호를 순서대로 진행하고 신호 18 다음에는 신호 1로 돌아간다.

결과 패널의 랜덤 재플레이 또는 목표 카드의 `랜덤 목표 신호`를 사용하면 `&seed=<seed>`가 URL에 기록된다. 같은 stage·seed 링크는 같은 initial·target을 재현한다. Web Crypto seed를 우선 사용하고 로컬 fallback도 URL에 남기며, 직전 target을 최대 32회 제외한다. `?stage=full-rank`와 이전 `?stage=hard`는 고정 4×4 대조군, `?fixture=backup`은 회귀 확인용 별도 run이다.

`serve.cjs`는 Windows에서도 ES module을 올바른 JavaScript MIME으로 제공하는 외부 의존성 없는 M00 전용 서버다.

## 브라우저 스모크

서버를 실행한 상태에서 Playwright module과 Chromium 실행 파일을 환경 변수로 전달한다.

```powershell
$env:NODE_PATH = "<Playwright node_modules>"
$env:BROWSER_EXECUTABLE = "<Chromium executable>"
node prototypes/rule-proof/browser-smoke.cjs
```

성공하면 360×640·390×844 신호 18 완료 앱 캡처를 `AXIS_SHIFT_Harness_KR/evidence/H00/`에 저장한다. 최종 회귀는 320·360·390·960px, 18개 고정 신호 전체 완주, 대조군, seed 생성, 결과 재플레이, 가시성 안전 타이머, sweep 안내, AXIS/PULSE 360ms 교차 연출, Signal Lock과 외부 요청 0을 검사한다. 자동 검증과 캡처 육안 검토는 실제 Pages E4·실기기 검증을 대체하지 않는다.

## 포함 범위

- profile당 고정 신호 3개, 총 18개를 순차 플레이하고 같은 profile의 랜덤 신호를 계속 생성하는 H00 캠페인
- 복수 행·열 선택과 교차점 Preview, 선택 축 rail, PULSE 양축 charge와 교차점 impact, 완료 Signal Lock sweep
- 쉬움 4×4(Par 2), 보통 4×4·5×5(각 Par 3), 어려움 4×4(Par 2)·5×5·6×6(각 Par 3)의 여섯 profile과 Full Rank 4×4 대조군(Par 4)
- `m00-seeded-v1` 기반의 stage·seed 결정적 initial·target 생성과 URL 재현
- 어려움 4×4의 25%~50% initial 노이즈와 gap 2 구조; 정식 사람 대상 Hard 승인은 아님
- 단계 전환 시 크기에 맞게 다시 만들어지는 목표·현재 보드와 A~F 행·1~6 열 조작 계약
- 진행 중 단계 이탈 확인과 단계별 세션 격리
- 진행이 있으면 확인하고 성공 시 세션·URL을 함께 초기화하는 `새 목표 신호`; 생성 실패 시 현재 퍼즐 보존
- PULSE 입력 스냅샷과 중복 입력 잠금
- Undo, 확인형 Reset, 완료 잠금
- 320px·360px 무가로스크롤 레이아웃과 6×6에서도 44px 이상인 축 조작 타깃
- 키보드 Tab·Enter·Space 경로와 `aria-pressed`
- 색 외 기호를 사용하는 Preview ON·OFF와 완료 상태
- 첫 축 선택에서 시작하고 숨김 탭 시간을 제외하는 스톱워치, 완료 시 고정된 PULSE·0.1초 결과
- 여러 단일 행 또는 열 sweep 완료에만 표시되는 비강제 대안 풀이 안내

## 검증 계약

`verify-fixture.mjs`는 외부 의존성 없이 기존 M00 코어를 검증하고, `verify-h00-campaign.mjs`는 18개 H00 신호의 불변식을 별도로 검증한다.

`verify-h00-campaign.mjs`는 다음을 검증한다.

- 6개 profile마다 정확히 3개이며 전체 18개인 고정 카탈로그
- profile 내 목표 및 전체 initial/target pair의 중복 0
- 각 신호의 canonical round-trip, `Par = GF(2) rank`, Hard anti-sweep 게이트
- 신호 1~18 순서와 18→1 wrap, 잘못된 signal 번호 거부

`verify-fixture.mjs`는 다음을 검증한다.

- 4×4 전체 65,536개 상태의 독립 BFS 거리와 `GF(2)` rank 패리티
- 모든 fixture의 선언 Par 차수 비영 minor와 다음 차수 minor 부재를 조합×순열 Leibniz parity로 독립 검증
- 행 루프 독립 oracle과 7개 profile golden vector로 생성기·코어 구현의 공통 오류를 교차 검증
- canonical factorization 길이와 전수 round-trip
- 여섯 생성 profile·Full Rank 대조군·예비 fixture의 정확한 canonical 중간 상태
- `sweepBound`·`compressionGap`·density·Par 일치와 모든 축 비영 Hard 구조 게이트
- `m00-seeded-v1`의 seed 정규화·결정성·profile filter·512회 제한·fallback round-trip
- PULSE involution·commutativity·입력 불변
- 세션의 rapid input, Undo, Reset, solved, completion 단일 기록
- stopwatch의 시작·숨김 일시정지·재개·완료 고정·reset과 sweep/mixed-axis 풀이 분류

본 플레이테스트 결과는 이 폴더가 아니라 `AXIS_SHIFT_Harness_KR/docs/PLAYTEST_PROTOCOL.md`에 익명 집계로 기록한다.
