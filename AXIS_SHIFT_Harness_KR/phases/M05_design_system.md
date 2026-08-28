# M05 — Design System & Shared Game UI ★

- **상태**: 완료 — DOD-01~13 PASS; 자동 E2/E3·오너 baseline 9/9·고정 SHA 원격 CI/Pages·공개 제출 URL smoke 통과, 수동 E1 0/4는 ADR-0012에 따라 M10 release-blocking gate로 이관
- **담당 범위**: 토큰, 레이아웃, 공통 컴포넌트, TensorGrid, 축 입력, 접근성·반응형 fixture
- **최종 갱신**: 2026-08-29

## 1. 맥락과 목표

도메인 상태를 사람이 즉시 이해하고 안전하게 조작할 수 있는 시각·입력 계층을 만든다. Dark/Light/System과 360px 모바일부터 데스크톱까지 같은 상태 의미를 유지하며, 색·사운드·모션 없이도 전체 조작이 가능해야 한다.

## 2. 범위

### 포함

- CSS reset, design tokens, typography, spacing, motion
- AppShell, Header, Footer, Button, IconButton, Toast, Dialog, VisuallyHidden
- AxisToggle, TensorGrid, TargetPreview, PulseButton, StatusStrip, HintPanel, ResultPanel
- board state fixture: idle, selected, preview, pulsing, paused, solved, error, disabled
- pointer·touch·keyboard 입력과 focus management
- 단일 Theme 버튼: 기본 dark, `dark → light → system → dark` 순환
- 단일 Motion 버튼: 기본 system, `system ↔ reduced` 전환
- custom high-contrast option/token/baseline 제외; OS forced-colors와 `highContrastCells` 계약 유지
- 360·768·1024·1440 반응형 구조
- visual·component·axe 테스트 기반

### 제외

- Tutorial·Lab·Daily·Sprint 실제 라우트 데이터 연결
- Canvas 공유 카드와 PWA
- 최종 브랜드 자산·마케팅 썸네일
- 게임 규칙·reducer 재구현

## 3. 진입조건 (DoR)

- [x] M04 DoD 통과.
- [x] 디자인 백서의 토큰·컴포넌트·레이아웃·상태 매트릭스 확인.
- [x] M04 session 상태에서 파생한 idle/selected/preview/pulsing/paused/solved/error/disabled UI fixture 준비.
- [x] 재배포 파일 없는 system font stack만 사용하기로 결정.
- [x] INV-003, INV-010, INV-015~019 확인.

## 4. 입력·산출물 계약

### 입력

- M04 selector·action과 상태 fixture
- 디자인 백서 Dark/Light 팔레트와 `Precision Without Intimidation` 원칙
- 축 레이블 행 A–F, 열 1–6
- 입력 키: Tab, Enter/Space, P/Ctrl+Enter, Z, H, Escape, Shift+R

### 산출물

```text
src/styles/reset.css
src/styles/tokens.css
src/styles/global.css
src/styles/utilities.css
src/components/common/*
src/components/layout/*
src/components/game/*
src/test/fixtures/game-ui.ts
src/test/ui-fixture-app.tsx
```

> 초기 phase 초안의 `src/assets/styles/*`는 M01 실제 트리와 `docs/FILE_TREE.md`의 단일 계약인 `src/styles/*`로 정정했다. 별도 스타일 트리 생성이나 파일 이동은 없다.
>
> 프로젝트 오너의 appearance 결정은 [ADR-0011](../decisions/0011-appearance-cycle-controls.md)에 고정했다. `UserSettings`의 새 쓰기는 `dark | light | system`, 기본은 `dark`이며 legacy v1 `high-contrast` 읽기는 `dark`로 정규화한다. OS forced-colors와 별도 `highContrastCells`는 제거하지 않는다.

- dark/light/system × mobile/tablet/desktop full-fixture visual baseline
- 키보드·axe·computed target size 테스트

## 5. 작업 순서

1. 토큰을 CSS custom property로 구현하고 Theme·Motion 단일 순환 버튼을 만든다.
2. 공통 Button·Dialog·Toast·focus ring을 먼저 굳힌다.
3. AxisToggle과 TensorGrid를 presentational component로 구현한다.
4. 선택 교차점 preview와 pulsing 시각 상태를 논리 상태에서 파생한다.
5. PULSE·Undo·Hint·Reset 컨트롤을 action callback에 연결한다.
6. 모바일 single-column + sticky PULSE와 desktop 3-column 레이아웃을 만든다.
7. 모든 상태 fixture와 long-copy fixture를 렌더링한다.
8. 키보드·ARIA·reduced motion·dark/light/system과 OS forced-colors를 자동·수동 검증한다.

## 6. 참조

- **불변식**: INV-003, INV-010, INV-015, INV-016, INV-017, INV-018, INV-019
- **ADR**: ADR-0004, ADR-0005, ADR-0007, [ADR-0011](../decisions/0011-appearance-cycle-controls.md), [ADR-0012](../decisions/0012-m05-checkpoint-manual-evidence-deferral.md)
- **기술 백서**: §2.1.3~4, §5, §8.2·4
- **디자인 백서**: 레이아웃, 상호작용, 컴포넌트, 토큰, 접근성 전 절
- **문서**: `docs/FILE_TREE.md`, `docs/ASSET_LICENSES.md`

## 7. DoD — 완료 게이트

- [x] **DOD-01 — 토큰 단일성**: 컴포넌트 CSS의 브랜드 색·간격·radius·motion duration 하드코딩이 0건이며 `tokens.css` 변수로 참조한다. 계산 2건·투명도 2건과 CSS media-query 문법상 custom property를 사용할 수 없는 breakpoint 9건은 총 13개 주석 annotation으로만 허용하고 자동 감사한다.
- [x] **DOD-02 — 상태 완전성**: idle/selected/preview/pulsing/paused/solved/error/disabled fixture가 모두 렌더링되고 각 상태가 색 외에 형태·기호·테두리 또는 텍스트로 구분된다. (INV-015)
- [x] **DOD-03 — 입력 원자성**: pointer double tap, key repeat, P와 Ctrl/Cmd+Enter 중복에서 동일 input token당 PULSE action callback이 최대 1회다. E3. (INV-010)
- [x] **DOD-04 — 키보드 완결성**: 포인터 없이 행·열 선택 → PULSE → Undo → Hint → Reset 취소 → 완료 결과까지 접근 가능하고 focus가 논리적 순서를 유지한다. E3. (INV-015)
- [x] **DOD-05 — ARIA**: AxisToggle은 `aria-pressed`, board/target에는 명확한 label과 상태 대체 텍스트, Dialog focus trap·복귀, 완료 후 Result heading focus를 가진다.
- [x] **DOD-06 — 터치 타깃**: 360px fixture에서 모든 핵심 interactive element의 computed width와 height가 각각 44 CSS px 이상이다. (INV-015)
- [x] **DOD-07 — 반응형**: 360×640, 390×844, 768×1024, 1024×768, 1440×900에서 document horizontal overflow=0, 6×6 board와 sticky PULSE가 겹치지 않는다. E3.
- [x] **DOD-08 — 테마**: 단일 Theme 버튼은 기본 `dark`에서 `dark → light → system → dark`로 순환하고 텍스트·셀·focus·error·success 상태를 페이지 새로고침 없이 유지한다. custom high-contrast option/token은 없고, 새 `UserSettings` 쓰기 타입은 `dark | light | system`·기본 `dark`, legacy v1 `high-contrast` 읽기는 `dark`로 정규화한다.
- [x] **DOD-09 — 모션 감소**: 단일 Motion 버튼은 기본 `system`에서 `system ↔ reduced`로 전환한다. system은 `prefers-reduced-motion`을 존중하고 reduced에서는 이동·scale·sweep을 제거하거나 80ms 이하 상태 전환으로 대체하며, 기능 완료는 animation event에 의존하지 않는다.
- [x] **DOD-10 — 자동 접근성 checkpoint**: 18개 axe case의 serious/critical violation=0 자동 E3를 통과했다. 실제 NVDA/VoiceOver 상당 환경은 `NOT RUN`이며 다른 수동 3종과 함께 ADR-0012에 따라 M10의 release-blocking E1으로 이관한다. PASS·면제·자동 증거의 대체가 아니다. (INV-015)
- [x] **DOD-11 — i18n 준비**: 사용자 문자열 prop은 i18n key/result를 받으며 컴포넌트 내부 한국어·영어 하드코딩이 0건이다. (INV-016)
- [x] **DOD-12 — visual baseline**: dark/light/system × mobile/tablet/desktop full-fixture baseline 9개는 strict 0-pixel 무갱신 재실행 18/18에서 실제 diff 0을 통과했고, 프로젝트 오너가 2026-08-29 전체 9종을 승인했다.
- [x] **DOD-13 — 외부 의존 없음**: 18개 axe case에서 원격 폰트·이미지·CSS·analytics network request=0이며 새 배포 자산이 없다. system font와 test-only baseline의 경계는 라이선스 문서에 기록했다. (INV-017, INV-019)

## 8. 검증 명령

```bash
npm run test -- src/components src/test/ui-fixture-app.tsx
npm run test:a11y -- --project=ui-fixtures
npm run test:visual -- --project=ui-fixtures
npm run test:e2e -- tests/e2e/keyboard-core.spec.ts
npm run audit:design-tokens
npm run audit:a11y-static
npm run check:boundaries
npm run lint
npm run format:check
npm run typecheck
npm run build
npm run verify
```

## 9. 수동 검증

| 환경 | 절차 | 기대 결과 | 증거 | 상태 |
|---|---|---|---|---|
| Android Chrome 실기기 | 6×6 fixture 터치 조작 | 오입력·가림·가로 스크롤 없음 | 미실행 | `DEFERRED_TO_M10` / `NOT RUN` |
| 데스크톱 NVDA/VoiceOver 상당 | 축 선택·PULSE·결과 탐색 | 상태·변화·완료 이해 가능 | 미실행 | `DEFERRED_TO_M10` / `NOT RUN` |
| 200% zoom | 모바일·desktop fixture | 핵심 CTA와 board 접근 가능 | 미실행 | `DEFERRED_TO_M10` / `NOT RUN` |
| 색각 시뮬레이션 | selected/preview/on/off 비교 | 색 없이 상태 구분 | 미실행 | `DEFERRED_TO_M10` / `NOT RUN` |

Playwright viewport·axe·theme/motion 결과와 OS forced-colors 지원은 각각 실기기, 실제 스크린리더, 브라우저 200% zoom, 색각 시뮬레이션을 대체하지 않는다. 네 항목은 수동 E1 0/4 `DEFERRED_TO_M10`이며 M10은 실제 4/4 증거 없이 완료할 수 없다.

## 10. 증거

```text
status=COMPLETE; DOD-01~13=PASS; automated E2/E3=PASS; manual E1=0/4 DEFERRED_TO_M10; projectOwnerFull9=APPROVED
implementation=f039bb8088d35df91ef393a9b226f22481981ca3; runtimeAndPagesEvidenceHead=1608c26cf4e8d3ca6be2c3765b20fb00bc7b06b9; deployedMainAtEvidence=1608c26cf4e8d3ca6be2c3765b20fb00bc7b06b9
focused component+fixture unit: files=7 tests=33 failures=0
global unit: files=30 tests=180 failures=0
design tokens: files=16 color=0 spacing=0 radius=0 duration=0 exceptionAnnotations=13
token annotations: calculation=2 transparency=2 mediaQueryBreakpoints=9
axe: tests=18/18 serious=0 critical=0 externalRequests=0
axe matrix: 8 states + long-copy + system 3 + light 3 + reduced-motion 3
visual update+no-update: tests=18/18 baselines=9 full-fixture viewports=5 themes=dark/light/system contrastPairs=AA
visual strict no-update: maxDiffPixels=0 threshold=0 actualDiff=0
visual review: Codex representative 3/3 PASS; project-owner full 9=APPROVED on 2026-08-29
visual remote CI: structural+mobile/desktop snapshots=15 PASS; tablet snapshots=3 explicit SKIP because GitHub Windows system-font metrics are non-portable; local owner-approved tablet remains strict
keyboard: chromium+firefox+webkit tests=9/9
boundaries: files=83 edges=150 violations=0 cycles=0
static a11y: files=36 interactiveTargets=8 failures=0
build: modules=46 CSS=10.49kB gzip=3.03kB JS=234.56kB gzip=75.20kB
lint=pass formatCheck=pass typecheck=pass diffCheck=pass
verify: scriptContract required=22 missing=0 passedSteps=12
Pages local: artifact files=14 bytes=353631 prototypeFiles=10; Chromium+Firefox+WebKit=30/30
submitted URL adapter local: H00 campaign browserAssertions=908 externalRequests=0 consoleErrors=0
remote: CI run=33207406441 success; Pages run=33207406497 success headSha=1608c26cf4e8d3ca6be2c3765b20fb00bc7b06b9; public Pages Chromium+Firefox+WebKit=30/30; public submitted URL https://jtech-co.github.io/axis-shift/prototypes/rule-proof/ browserAssertions=908 externalRequests=0 consoleErrors=0
manual: Android Chrome=NOT RUN screenReader=NOT RUN zoom200=NOT RUN colorVision=NOT RUN; all DEFERRED_TO_M10
```

ADR-0011 변경분과 제출 URL appearance adapter를 포함한 focused·global·token·axe·visual·keyboard·boundary·static a11y·build·Pages artifact·prototype browser smoke는 고정 SHA와 실제 공개 URL에서 통과했다. M05 React fixture는 아직 실제 feature controller가 아니므로 공개 URL은 기존 playable H00 game을 유지하면서 Theme/Motion만 최신 계약으로 교체했다. 이 증거로 M05 checkpoint를 닫는다.

strict 0-pixel visual 첫 재실행은 transparent backdrop blur가 rounded button corner의 한 color channel을 비결정적으로 바꿔 mobile에서 2/18, 이어 tablet에서 3/18 실패했다. fixture toolbar 배경을 opaque canvas token으로 고정하고 baseline을 재생성한 뒤 동일 무갱신 명령이 18/18, `maxDiffPixels=0`, threshold 0, diff 0으로 통과했다.
최종 keyboard 재실행의 첫 시도는 일반 빌드가 만든 `dist` 뒤에서 Playwright programmatic Vite build가 canonical preclean 계약을 우회해 Windows native cleanup 종료 코드 `3221226505`로 중단됐다. `start-e2e-server.ts`도 검증된 `cleanBuildOutput() + emptyOutDir=false` 경로를 사용하게 수정한 뒤 Chromium·Firefox·WebKit `9/9`와 전체 `verify 12/12`를 통과했다.
첫 원격 CI visual은 local Windows baseline과 GitHub Windows system-font rasterization 차이로 9 snapshot이 실패했고, 두 번째·세 번째 시도는 tablet 높이·font metric 차이 3건을 재현했다. 임계치를 6%로 완화하지 않고 local strict 18/18·오너 승인 9/9를 유지했으며, remote는 구조·접근성·mobile/desktop snapshot 15 PASS와 tablet snapshot 3개 명시적 SKIP을 분리해 run `33207406441`에서 성공했다.



## 11. 롤백 계획

- tokens, common UI, game UI를 분리 커밋한다.
- 시각 최적화가 입력·접근성을 깨면 마지막 검증 baseline으로 롤백한다.
- CSS hack으로 viewport 한 곳만 맞추지 않고 layout 계약을 수정한다.

## 12. 리스크·미지수

- 360px에서 6×6 축 타깃 44px과 board 공간의 충돌.
- [해소] custom high-contrast 테마가 ON·preview·selected를 과도하게 복잡하게 만들던 위험은 오너 결정과 ADR-0011에 따라 option/token/baseline을 제거해 닫았다. OS forced-colors와 `highContrastCells`는 별도 접근성 계약으로 유지한다.
- iOS viewport와 sticky bottom safe-area 차이.
- CSS animation과 rapid input의 경쟁 상태.

## 13. STOP 트리거

- 44px target과 6×6 조작을 동시에 만족하려면 규칙·레이아웃 재결정이 필요함.
- keyboard 경로를 위해 domain action 계약을 바꿔야 함.
- serious/critical 접근성 위반을 시각 디자인 때문에 유지해야 함.
- 외부 자산 라이선스가 불명확함.

## 14. 다음 phase 인계

- 승인된 UI fixture와 visual baseline
- feature가 조합할 공통 컴포넌트 API
- 모바일·desktop 레이아웃 계약
- 키보드·focus·ARIA 규칙

presentational component API와 ADR-0011 appearance fixture, 자동 E2/E3, 오너 9/9 승인, 원격 CI·Pages와 공개 제출 URL smoke가 모두 준비돼 M05 checkpoint를 닫았다. M06는 선행 M05 조건만 충족했으며, 나머지 DoR를 별도로 확인한 뒤 실제 feature controller 조합을 시작한다. 수동 E1 0/4는 ADR-0012에 따라 M10 release-blocking gate로 남는다.
