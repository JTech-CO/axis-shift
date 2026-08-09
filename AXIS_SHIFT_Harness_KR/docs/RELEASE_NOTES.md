# AXIS//SHIFT Release Notes

**상태**: v1.0.0 초안 — 아직 배포된 기능을 나타내지 않음  
**최종 갱신**: 2026-08-09

> M10 전에는 아래 항목을 “출시됨”으로 인용하지 않는다. M11에서 실제 build·QA 결과와 대조해 `Planned`를 `Shipped` 또는 `Deferred`로 바꾼다.

## v1.0.0 — Planned

### Release metadata

| 항목 | 값 |
|---|---|
| Release date | 예정 |
| Tag | 예정: `v1.0.0` |
| Commit SHA | M11에서 입력 |
| Gameplay URL | M11에서 입력 |
| Build artifact SHA-256 | M11에서 입력 |
| Generator version | 예정: `v1` |
| Storage schema | 예정: `v1` |
| QA decision | NOT EVALUATED |

### Product summary

AXIS//SHIFT는 행과 열을 선택해 교차점의 셀을 반전하고 목표 패턴을 복원하는 1~3분 논리 퍼즐이다. 한 PULSE는 `GF(2)` 위 rank-1 외적이며, 차이 행렬의 rank가 증명된 최소 PULSE 수인 Par와 같다.

### Planned modes

- Tutorial 6개
- Lab 4개 chapter × 12레벨, 총 48개
- UTC 기반 Daily Signal
- 과거 Daily Archive
- 180초 Sprint

### Planned core features

- 행·열 복수 선택과 교차 preview
- PULSE, Undo, Reset, Resume
- 3단계 Hint
- S/A/B/C grade와 best record
- LocalStorage 진행도·설정
- spoiler-free Signal Signature
- text·1080×1080·1200×630 공유

### Planned product quality

- responsive 360px~desktop
- dark/light/high-contrast
- keyboard-only core flow
- reduced motion
- ko/en
- sound·haptics opt-in settings
- installable PWA·offline core play
- GitHub Pages static deployment

### Technical highlights

- React + TypeScript + Vite
- DOM/CSS Grid game board
- Canvas share card only
- pure domain core
- `GF(2)` exhaustive validation
- deterministic versioned Daily generator
- no backend·runtime AI API·remote analytics

### Known limitations planned for v1.0

- 기록은 현재 browser의 LocalStorage에만 저장된다.
- 기기 간 동기화·계정·친구·global leaderboard가 없다.
- browser data를 삭제하면 진행도가 사라진다.
- offline Daily는 기기 clock을 신뢰하며 clock 조작을 막지 않는다.
- Web Share file 지원은 browser마다 달라 text/clipboard fallback을 사용한다.
- 결과 grade는 개인 성취 지표이며 server-verified competition이 아니다.
- v1 보드는 정사각 3×3~6×6이고 binary cell만 지원한다.

### Privacy plan

- 계정·이메일·닉네임·위치 수집 없음
- cookie 없음
- remote analytics·advertising 없음
- external runtime API 없음
- 진행도·설정은 local browser에 저장
- 공유 결과에 사용자 식별자·정답 board·raw move 없음

### Verification to attach

- 3×3 512 matrices BFS vs rank result
- Tutorial/Lab validator result
- 3,650-day Daily audit
- browser/device/accessibility matrix
- PWA offline/update smoke
- performance·bundle report
- production URL smoke

## Version history

| Version | Status | Summary |
|---|---|---|
| 1.0.0 | Planned | 최초 공개 release·hackathon submission 목표 |
| 1.0.0-rc.1 | Future | M10 QA용 release candidate |
| 1.0.0-preview.1 | Future | 내부·플레이테스트 preview |

태그는 이동·덮어쓰기하지 않는다. 수정 build는 새 version/tag를 만든다.

## Post-v1 backlog — Not committed

- 추가 Lab pack·season Daily
- 선택적 privacy-preserving analytics
- app store TWA/Capacitor wrapper
- 사용자 puzzle code sharing
- non-square matrix
- multi-state cell
- 별도 3D tensor experiment

이 목록은 v1.0 약속이 아니며 새 ADR·phase·범위 승인 없이 구현하지 않는다.

## Release 작성 규칙

실제 릴리스 시:

1. `Planned` 표현을 실제 상태로 교체한다.
2. 구현되지 않은 기능은 숨기지 않고 `Deferred`로 이동한다.
3. QA 수치·known issue·P2 waiver를 기록한다.
4. tag·SHA·URL·artifact hash를 입력한다.
5. asset/license·privacy 내용이 실제 build와 일치하는지 대조한다.
6. 제출 당시 notes를 이후 버전으로 덮어쓰지 않는다.
