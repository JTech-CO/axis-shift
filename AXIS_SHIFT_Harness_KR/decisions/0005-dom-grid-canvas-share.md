# ADR-0005: 게임 보드는 DOM/CSS Grid, 공유 카드는 Canvas로 구현한다

- **상태**: 채택
- **결정일**: 2026-08-09
- **최종 검토**: 2026-08-09
- **관련 phase**: M05, M06~M10
- **관련 불변식**: INV-010, INV-013, INV-015
- **관련 문서**: `docs/TECHNICAL_WHITEPAPER.md` §5, 부록 B; `docs/DESIGN_WHITEPAPER.md`

## 1. 맥락

보드는 최대 6×6로 작고 각 행·열이 독립 interactive control이다. 반면 공유 카드는 고정 픽셀 크기의 PNG가 필요하다. 하나의 렌더링 기술을 양쪽에 강제하면 접근성 또는 이미지 생성이 복잡해진다.

## 2. 결정

플레이 보드·축·상태는 semantic DOM과 CSS Grid로 구현한다. Canvas는 사용자 입력을 받지 않으며 1080×1080·1200×630 공유 PNG 생성에만 사용한다.

## 3. 세부 계약

- 각 AxisToggle은 native button 또는 동등 semantic control이다.
- board cell은 DOM 상태와 ARIA 대체 설명을 가진다.
- Canvas는 share-safe DTO만 입력받는다.
- Canvas 실패 시 텍스트 공유가 남는다.
- 게임 상태·완료는 CSS animation/Canvas frame에 의존하지 않는다.

## 4. 근거

DOM은 키보드, focus, `aria-pressed`, responsive hit target, 테스트가 단순하다. Canvas는 고정 해상도 이미지와 Blob 생성에 적합하다. 각 도구를 강점에만 사용한다.

## 5. 결과와 트레이드오프

### 이점

- 접근성·입력·반응형 구현 용이
- 36셀 수준에서 성능 충분
- component/axe 테스트 가능
- 일관된 공유 이미지 생성

### 비용·제약

- DOM 상태 클래스가 많아질 수 있음
- Canvas와 DOM 텍스트 metric이 다름
- 두 렌더러의 디자인 토큰 연결 필요
- 공유 이미지는 스크린리더 콘텐츠가 아니므로 별도 텍스트 필수

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| Canvas로 게임 보드 전체 | 일괄 drawing | hit test·focus·ARIA·반응형 복잡성 |
| SVG로 전부 | 벡터·접근성 가능 | button semantics와 PNG export 복잡성 증가 |
| DOM screenshot 라이브러리 | 화면 재사용 | 번들·브라우저 일관성·스포일러 제어 위험 |

## 7. 검증·집행

- keyboard E2E와 axe
- 44px computed target test
- Canvas module import 경계
- PNG dimensions·snapshot
- DOM board에 `<canvas>` interactive implementation이 없는지 리뷰

## 8. 변경 조건

보드 크기·효과가 크게 늘어 DOM 성능 예산을 실제로 초과할 때만 SVG/Canvas를 실험한다. 접근성 parity가 선행 조건이다.
