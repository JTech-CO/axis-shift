# ADR-0011: 외형 설정을 순환 버튼으로 단순화하고 커스텀 고대비 테마를 제거한다

- **상태**: 채택
- **결정일**: 2026-08-26
- **최종 검토**: 2026-08-26
- **관련 phase**: M05, M06, M09, M10
- **관련 불변식**: INV-015, INV-016, INV-018, INV-019
- **관련 문서**: `phases/M05_design_system.md`, `docs/DESIGN_WHITEPAPER.md` §2.1.2·§9, `docs/TECHNICAL_WHITEPAPER.md` §2.1·§5

## 1. 맥락

M05 fixture의 Theme과 Motion이 select 목록으로 노출돼 짧은 퍼즐의 즉시 조작 흐름보다 설정 UI가 무겁게 보였다. 프로젝트 오너는 커스텀 High Contrast 팔레트가 실제 화면에서 오히려 정보 밀도와 가독성을 해친다고 판단했다. 다만 운영체제 Forced Colors와 색 이외의 셀·축 상태 표식은 별개의 접근성 계약이다.

## 2. 결정

Theme과 Motion은 각각 하나의 native button 의미를 가진 순환 컨트롤로 제공한다. Theme은 `dark → light → system → dark`, Motion은 `system ↔ reduced` 순서로 동작한다. 초기 Theme은 `dark`, 초기 Motion은 `system`이다. 커스텀 `high-contrast` 테마 선택지·팔레트·visual baseline은 제거한다.

## 3. 세부 계약

- Theme은 3상태이므로 `aria-pressed`를 사용하지 않고 현재값과 다음값을 accessible name과 보이는 텍스트로 제공한다.
- Motion은 2상태이며 `reduced`일 때 `aria-pressed=true`다. Enter·Space와 pointer가 같은 전환 함수를 사용한다.
- 두 버튼은 각각 44 CSS px 이상이며 Tab 순서는 Theme → Motion → 열 축 → 행 축 → PULSE를 유지한다.
- 전환은 navigation·reload 없이 `data-theme`과 `data-motion`을 즉시 갱신한다.
- 제품 `UserSettings.theme`의 쓰기 계약은 `dark | light | system`, 기본값은 `dark`다.
- 이미 저장된 v1 `high-contrast` 값은 데이터 손실을 막기 위한 읽기 호환 입력으로만 인정하고 `dark`로 정규화한다. 새 값으로 다시 쓰거나 UI에 노출하지 않는다.
- `highContrastCells`와 운영체제 `forced-colors` 대응은 커스텀 테마와 별개이므로 유지한다.
- M09에서 UI의 `reduced`는 저장 계약의 `reducedMotion: on`으로 매핑하고 `system`은 `system`으로 매핑한다.

## 4. 근거

세 가지 테마와 두 가지 모션 상태는 목록 탐색보다 한 번의 반복 클릭으로 이해하기 쉽다. 기본 다크 팔레트는 AXIS//SHIFT의 브랜드 화면과 일치하고, System은 사용자가 원할 때만 운영체제 색상 선호를 따르게 한다. 읽기 어려운 커스텀 고대비 팔레트를 없애면서도 실제 보조 기술 지원을 유지한다.

## 5. 결과와 트레이드오프

### 이점

- 상단 설정이 두 개의 명확한 버튼으로 줄어든다.
- 현재값과 다음값이 키보드·스크린리더·pointer에서 같은 계약을 갖는다.
- High Contrast 전용 복잡한 팔레트와 테스트 분기를 제거한다.

### 비용·제약

- 임의 상태로 바로 점프하지 않고 최대 두 번 클릭해야 System에 도달한다.
- 기존 v1 `high-contrast` 저장값을 위한 읽기 호환 코드는 당분간 남는다.
- System visual baseline은 러너의 OS 설정에 의존하지 않도록 `prefers-color-scheme`을 명시적으로 고정해야 한다.

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| 기존 select 4종 유지 | 임의 값으로 즉시 이동 | 짧은 게임의 상단 UI가 무겁고 커스텀 고대비 가독성 문제가 남음 |
| Theme을 3개 독립 버튼으로 표시 | 모든 값이 한눈에 보임 | 모바일 상단 폭과 탭 정지점이 늘어남 |
| 운영체제 Forced Colors까지 제거 | 구현 분기 최소 | 사용자 보조 기술을 훼손하므로 범위 밖 |
| legacy 저장값을 invalid 처리 | 타입이 즉시 단순해짐 | 다른 사용자 설정까지 quarantine·fallback될 수 있음 |

## 7. 검증·집행

- Unit은 Theme `dark → light → system → dark`, Motion `system ↔ reduced`, URL 불변과 ARIA 상태를 검증한다.
- Chromium·Firefox·WebKit은 Theme Enter, Motion Space, 이후 Tab 순서를 검증한다.
- axe 18개 행렬은 기존 고대비 3건을 reduced-motion 3건으로 대체한다.
- visual 18개는 5 viewport, dark/light/system 대비, Motion 80ms 이하와 3모드×3 viewport baseline을 검증한다.
- custom `high-contrast` CSS selector·UI option·테스트 locator가 0건인지 정적 검색한다.

## 8. 변경 조건

커스텀 네 번째 테마를 다시 추가하려면 실제 사용자 가독성 증거, dark/light/system으로 해결할 수 없는 요구, 360px·스크린리더·색각·visual baseline 검증과 프로젝트 오너 승인을 포함한 대체 ADR이 필요하다.

M05의 H00 appearance adapter는 이 순환 계약을 제출 URL에서도 동일하게 유지한다.
