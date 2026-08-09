# M00 Rule Proof prototype

M00의 규칙 이해도만 검증하는 폐기 가능한 정적 프로토타입이다. React/Vite, 저장, 라우팅, PWA, 공유 및 프로덕션 디자인 시스템을 포함하지 않는다.

## 실행

저장소 루트에서 실행한다.

```bash
node prototypes/rule-proof/verify-fixture.mjs
node prototypes/rule-proof/serve.cjs
```

브라우저에서 `http://localhost:4173/`을 연다. 기본 단계는 `M00-MAIN-v1 / 쉬움`이다. 난도 탐색용 단계는 `?stage=easy`, `?stage=normal`, `?stage=hard`로 바로 열 수 있으며 화면의 단계 선택기와 완료 후 CTA로도 이어서 플레이할 수 있다. 예비 fixture는 `?fixture=backup`에서 회귀 확인용 별도 run으로만 연다.

`serve.cjs`는 Windows에서도 ES module을 올바른 JavaScript MIME으로 제공하는 외부 의존성 없는 M00 전용 서버다.

## 브라우저 스모크

서버를 실행한 상태에서 Playwright module과 Chromium 실행 파일을 환경 변수로 전달한다.

```powershell
$env:NODE_PATH = "<Playwright node_modules>"
$env:BROWSER_EXECUTABLE = "<Chromium executable>"
node prototypes/rule-proof/browser-smoke.cjs
```

성공하면 360×640 다단계 완료 화면을 `AXIS_SHIFT_Harness_KR/evidence/M00/`에 저장한다. 이 자동 검증은 사람 대상 내부 파일럿과 본 플레이테스트를 대체하지 않는다.

## 포함 범위

- 복수 행·열 선택과 교차점 Preview
- 쉬움(Par 2)·보통(Par 3)·어려움(Par 4) 단계 선택과 완료 후 다음 단계 흐름
- 진행 중 단계 이탈 확인과 단계별 세션 격리
- PULSE 입력 스냅샷과 중복 입력 잠금
- Undo, 확인형 Reset, 완료 잠금
- 360px 레이아웃과 44px 이상 조작 타깃
- 키보드 Tab·Enter·Space 경로와 `aria-pressed`
- 색 외 기호를 사용하는 Preview ON·OFF와 완료 상태

## 검증 계약

`verify-fixture.mjs`는 외부 의존성 없이 다음을 검증한다.

- 4×4 전체 65,536개 상태의 독립 BFS 거리와 `GF(2)` rank 패리티
- canonical factorization 길이와 전수 round-trip
- 쉬움·보통·어려움·예비 fixture의 정확한 중간 상태
- PULSE involution·commutativity·입력 불변
- 세션의 rapid input, Undo, Reset, solved, completion 단일 기록

본 플레이테스트 결과는 이 폴더가 아니라 `AXIS_SHIFT_Harness_KR/docs/PLAYTEST_PROTOCOL.md`에 익명 집계로 기록한다.
