# M05 — Design System & Shared Game UI ★

- **상태**: 미시작
- **담당 범위**: 토큰, 레이아웃, 공통 컴포넌트, TensorGrid, 축 입력, 접근성·반응형 fixture
- **최종 갱신**: 2026-08-09

## 1. 맥락과 목표

도메인 상태를 사람이 즉시 이해하고 안전하게 조작할 수 있는 시각·입력 계층을 만든다. Dark/Light/High Contrast와 360px 모바일부터 데스크톱까지 같은 상태 의미를 유지하며, 색·사운드·모션 없이도 전체 조작이 가능해야 한다.

## 2. 범위

### 포함

- CSS reset, design tokens, typography, spacing, motion
- AppShell, Header, Footer, Button, IconButton, Toast, Dialog, VisuallyHidden
- AxisToggle, TensorGrid, TargetPreview, PulseButton, StatusStrip, HintPanel, ResultPanel
- board state fixture: idle, selected, preview, pulsing, solved, error, disabled
- pointer·touch·keyboard 입력과 focus management
- system/dark/light/high-contrast, reduced motion
- 360·768·1024·1440 반응형 구조
- visual·component·axe 테스트 기반

### 제외

- Tutorial·Lab·Daily·Sprint 실제 라우트 데이터 연결
- Canvas 공유 카드와 PWA
- 최종 브랜드 자산·마케팅 썸네일
- 게임 규칙·reducer 재구현

## 3. 진입조건 (DoR)

- [ ] M04 DoD 통과.
- [ ] 디자인 백서의 토큰·컴포넌트·레이아웃·상태 매트릭스 확인.
- [ ] M04가 제공하는 모든 session fixture 준비.
- [ ] 폰트는 로컬 시스템 스택 또는 라이선스가 등록된 로컬 파일만 사용하기로 결정.
- [ ] INV-003, INV-010, INV-015~019 확인.

## 4. 입력·산출물 계약

### 입력

- M04 selector·action과 상태 fixture
- 디자인 백서 Dark/Light 팔레트와 `Precision Without Intimidation` 원칙
- 축 레이블 행 A–F, 열 1–6
- 입력 키: Tab, Enter/Space, P/Ctrl+Enter, Z, H, Escape, Shift+R

### 산출물

```text
src/assets/styles/reset.css
src/assets/styles/tokens.css
src/assets/styles/global.css
src/assets/styles/utilities.css
src/components/common/*
src/components/layout/*
src/components/game/*
src/test/fixtures/game-ui.ts
src/test/ui-fixture-app.tsx
```

- 주요 뷰포트·테마 visual baseline
- 키보드·axe·computed target size 테스트

## 5. 작업 순서

1. 토큰을 CSS custom property로 구현하고 theme selector를 만든다.
2. 공통 Button·Dialog·Toast·focus ring을 먼저 굳힌다.
3. AxisToggle과 TensorGrid를 presentational component로 구현한다.
4. 선택 교차점 preview와 pulsing 시각 상태를 논리 상태에서 파생한다.
5. PULSE·Undo·Hint·Reset 컨트롤을 action callback에 연결한다.
6. 모바일 single-column + sticky PULSE와 desktop 3-column 레이아웃을 만든다.
7. 모든 상태 fixture와 long-copy fixture를 렌더링한다.
8. 키보드·ARIA·reduced motion·high contrast를 자동·수동 검증한다.

## 6. 참조

- **불변식**: INV-003, INV-010, INV-015, INV-016, INV-017, INV-018, INV-019
- **ADR**: ADR-0004, ADR-0005, ADR-0007
- **기술 백서**: §2.1.3~4, §5, §8.2·4
- **디자인 백서**: 레이아웃, 상호작용, 컴포넌트, 토큰, 접근성 전 절
- **문서**: `docs/FILE_TREE.md`, `docs/ASSET_LICENSES.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — 토큰 단일성**: 컴포넌트 CSS의 브랜드 색·간격·radius·motion duration 하드코딩이 0건이며 `tokens.css` 변수로 참조한다. 예외는 계산값과 투명도 조합만 주석으로 허용.
- [ ] **DOD-02 — 상태 완전성**: idle/selected/preview/pulsing/solved/error/disabled fixture가 모두 렌더링되고 각 상태가 색 외에 형태·기호·테두리 또는 텍스트로 구분된다. (INV-015)
- [ ] **DOD-03 — 입력 원자성**: pointer double tap, key repeat, P와 Ctrl/Cmd+Enter 중복에서 동일 input token당 PULSE action callback이 최대 1회다. E3. (INV-010)
- [ ] **DOD-04 — 키보드 완결성**: 포인터 없이 행·열 선택 → PULSE → Undo → Hint → Reset 취소 → 완료 결과까지 접근 가능하고 focus가 논리적 순서를 유지한다. E3. (INV-015)
- [ ] **DOD-05 — ARIA**: AxisToggle은 `aria-pressed`, board/target에는 명확한 label과 상태 대체 텍스트, Dialog focus trap·복귀, 완료 후 Result heading focus를 가진다.
- [ ] **DOD-06 — 터치 타깃**: 360px fixture에서 모든 핵심 interactive element의 computed width와 height가 각각 44 CSS px 이상이다. (INV-015)
- [ ] **DOD-07 — 반응형**: 360×640, 390×844, 768×1024, 1024×768, 1440×900에서 document horizontal overflow=0, 6×6 board와 sticky PULSE가 겹치지 않는다. E3.
- [ ] **DOD-08 — 테마**: system/dark/light/high-contrast에서 텍스트·셀·focus·error·success 상태가 유지되고 theme 전환이 페이지 새로고침 없이 반영된다.
- [ ] **DOD-09 — 모션 감소**: `prefers-reduced-motion` 또는 setting on에서 이동·scale·sweep이 제거 또는 80ms 이하 상태 전환으로 대체되며 기능 완료는 animation event에 의존하지 않는다.
- [ ] **DOD-10 — 자동 접근성**: 모든 fixture에서 axe serious/critical violation=0. E3. 수동 스크린리더에서 축 상태와 완료가 이해 가능하다. (INV-015)
- [ ] **DOD-11 — i18n 준비**: 사용자 문자열 prop은 i18n key/result를 받으며 컴포넌트 내부 한국어·영어 하드코딩이 0건이다. (INV-016)
- [ ] **DOD-12 — visual baseline**: 핵심 fixture의 3개 테마·3개 대표 뷰포트 스크린샷이 승인되고 의도치 않은 차이는 CI에서 실패한다.
- [ ] **DOD-13 — 외부 의존 없음**: 원격 폰트·이미지·CSS·analytics network request=0. 자산은 라이선스 문서에 등록된다. (INV-017, INV-019)

## 8. 검증 명령

```bash
npm run test -- src/components src/test/ui-fixture-app.tsx
npm run test:a11y -- --project=ui-fixtures
npm run test:visual -- --project=ui-fixtures
npm run test:e2e -- tests/e2e/keyboard-core.spec.ts
npm run lint
npm run typecheck
npm run build
```

## 9. 수동 검증

| 환경 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| Android Chrome 실기기 | 6×6 fixture 터치 조작 | 오입력·가림·가로 스크롤 없음 | 영상 |
| 데스크톱 NVDA/VoiceOver 상당 | 축 선택·PULSE·결과 탐색 | 상태·변화·완료 이해 가능 | 체크표 |
| 200% zoom | 모바일·desktop fixture | 핵심 CTA와 board 접근 가능 | 캡처 |
| 색각 시뮬레이션 | selected/preview/on/off 비교 | 색 없이 상태 구분 | 캡처 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- tokens, common UI, game UI를 분리 커밋한다.
- 시각 최적화가 입력·접근성을 깨면 마지막 검증 baseline으로 롤백한다.
- CSS hack으로 viewport 한 곳만 맞추지 않고 layout 계약을 수정한다.

## 12. 리스크·미지수

- 360px에서 6×6 축 타깃 44px과 board 공간의 충돌.
- 고대비 테마가 ON·preview·selected를 과도하게 복잡하게 보일 수 있음.
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
