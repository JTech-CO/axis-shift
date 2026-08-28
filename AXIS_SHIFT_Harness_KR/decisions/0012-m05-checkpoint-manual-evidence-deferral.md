# ADR-0012: M05 체크포인트를 닫고 수동 접근성 증거를 M10으로 이관한다

- **상태**: 채택
- **결정일**: 2026-08-26
- **최종 검토**: 2026-08-26
- **관련 phase**: M05, M06, M10
- **관련 불변식**: INV-014, INV-015, INV-018, INV-020
- **관련 문서**: `phases/M05_design_system.md`, `phases/M10_integration_qa_deployment.md`, `PROGRESS.md`

## 1. 맥락

M05의 자동 E2/E3는 component·keyboard·axe·visual·responsive·build·Pages matrix에서 모두 통과했고, 프로젝트 오너는 dark/light/system 9개 full-fixture baseline을 전부 검토해 승인했다. 반면 Android Chrome 실기기, 실제 NVDA/VoiceOver 상당 환경, 브라우저 200% zoom, 색각 시뮬레이션의 수동 E1 네 항목은 실행 증거가 없다.

프로젝트 오너는 이 사실을 확인한 뒤 M05 완료와 commit·push, 기존 해커톤 제출 URL에서 ADR-0011 appearance control을 포함한 플레이 가능 버전 배포를 지시했다.

## 2. 결정

M05는 자동 E2/E3 전체 PASS와 오너 visual baseline 9/9 승인을 checkpoint exit evidence로 사용해 완료한다. 수동 E1 4종은 PASS·면제·대체됐다고 기록하지 않고 `DEFERRED_TO_M10`으로 이관한다. M10은 실제 증거 4/4 없이 완료할 수 없다.

M06는 검증된 presentational API와 baseline을 입력으로 착수할 수 있다. 그러나 이 결정은 INV-015의 릴리스 검증, M10 통합 접근성, M11 릴리스 승인을 완화하지 않는다.

## 3. 제출 URL 호환 계약

- `https://jtech-co.github.io/axis-shift/prototypes/rule-proof/`의 기존 stage·signal·seed·anchor URL과 플레이 흐름을 유지한다.
- H00 정적 프로토타입에 ADR-0011의 Theme·Motion appearance adapter를 이식한다.
- Theme은 기본 `dark`에서 `dark → light → system → dark`, Motion은 기본 `system`에서 `system ↔ reduced`로 동작한다.
- custom high-contrast 테마는 추가하지 않고 OS forced-colors를 유지한다.
- M05 React shared UI 전체를 정적 프로토타입에 중복 구현하지 않는다. production controller 연결은 M06 범위다.
- public Pages run과 해당 URL의 post-deploy smoke가 통과해야 배포 완료를 주장한다.

## 4. 정직성 경계

- 프로젝트 오너 visual baseline 검토: `9/9 APPROVED`.
- 수동 E1: Android `NOT RUN`, screen reader `NOT RUN`, 200% zoom `NOT RUN`, color vision `NOT RUN`.
- 자동 Playwright·axe·visual 결과를 위 수동 증거로 재분류하지 않는다.
- M10으로 이관된 네 항목을 삭제하거나 임계치를 낮추려면 별도 ADR과 프로젝트 오너 승인이 필요하다.

## 5. 결과와 트레이드오프

### 이점

- 검증된 M05 component contract를 M06가 지연 없이 조합할 수 있다.
- 해커톤 제출 URL과 H00 플레이 호환성을 유지하면서 최신 appearance 결정을 공개할 수 있다.
- 미실행 수동 증거를 PASS로 과장하지 않는다.

### 비용·위험

- 실제 Android·보조기술·zoom·색각 환경의 결함은 M10까지 잔존할 수 있다.
- H00 prototype appearance adapter와 M05 React control은 서로 다른 렌더링 계층이므로 M10에서 동작 parity를 다시 확인해야 한다.

## 6. 검증·집행

- M05 phase와 `PROGRESS.md`에 오너 9/9 승인, E1 0/4 `DEFERRED_TO_M10`, checkpoint 완료를 함께 기록한다.
- M10 phase·QA·release checklist에 네 수동 증거를 blocking gate로 유지한다.
- Pages artifact 3브라우저 smoke와 공개 URL smoke에서 Theme/Motion 순환, URL 불변, stage·signal·seed 플레이 호환을 검증한다.

공개 Pages run·fixed implementation SHA·post-deploy smoke는 M05 phase와 `PROGRESS.md`의 closure evidence에 기록한다.
