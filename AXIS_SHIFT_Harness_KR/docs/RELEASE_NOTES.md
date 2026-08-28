# AXIS//SHIFT Release Notes

**상태**: `v0.1.0-hackathon` released·해커톤 제출 완료 확인 / M05 post-submission compatibility deployed / v1.0.0 계획
**최종 갱신**: 2026-08-29

> H00 항목만 현재 해커톤 프로토타입을 나타낸다. 아래 v1.0.0 절은 계속 `Planned`이며 H00 제출 문구로 인용하지 않는다.

## v0.1.0-hackathon — Release record

### Release metadata

| 항목 | 값 |
|---|---|
| Release date | 2026-08-21 |
| Tag / prerelease | [`v0.1.0-hackathon`](https://github.com/JTech-CO/axis-shift/releases/tag/v0.1.0-hackathon) — annotated remote tag 고정 |
| Release / tag target SHA | `6690f5778f706e1875b452d552bd75ba1c06ee9a` |
| Application capture SHA | `6690f5778f706e1875b452d552bd75ba1c06ee9a` — release/tag SHA와 동일 |
| Gameplay URL | `https://jtech-co.github.io/axis-shift/` |
| Final CI run | `32453169036` — success |
| Final Pages run | `32453169029` — success, deployed SHA=`6690f577…` |
| Final Pages artifact digest | `sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998` |
| Generator version | `m00-seeded-v1` |
| Storage | 없음 — 새로고침 이후 기록 보존 안 함 |
| Hackathon submission | 프로젝트 오너가 공식 Google 양식 제출 완료를 확인함. 정확한 제출 시각·접수 ID·확인 화면은 제공되지 않았으며 Codex가 Submit을 수행하지 않음 |
| QA decision | H00 DOD-01~12 PASS; 고정된 submission-ready 기술 증거와 final SHA는 변경 없음 |

### Shipped prototype slice

- Easy 4×4, Normal 4×4·5×5, Hard 4×4·5×5·6×6의 여섯 profile
- profile별 고정 signal 3개, 총 18개 순차 campaign과 18→1 wrap
- 각 profile의 재현 가능한 URL seed와 무제한 랜덤 목표 신호
- 행·열 복수 선택, 교차 preview, PULSE, Undo, Reset
- visibility-safe stopwatch와 PULSE·시간 결과
- 단일 축 sweep 성공 시 대안 풀이 안내
- 선택 axis rail, 360ms PULSE 양축 전파·교차 impact, 완료 Signal Lock
- 키보드, 44px target, reduced motion, forced colors, 320~960px 회귀
- GitHub Pages root 게임과 M01 `/#/` bridge

### Verification

- formal Easy 신규 사용자: `n=5`, first PULSE·first solve·rule recall `5/5`, I0 `5/5`
- M00 verifier: `assertions=200967`, `bfsVisited=65536`, `failures=0`
- H00 campaign: `signals=18`, `uniqueBoardPairs=18`, `assertions=217`, `failures=0`
- release SHA clean checkout: Node 24/npm 11, `npm ci` lock 동일·취약점 `0`, verify 10단계, artifact `14 files / 336182 bytes`
- browser E2E `12/12`, a11y failures `0`, Pages Chromium·Firefox·WebKit `27/27`
- public Pages: Chromium·Firefox·WebKit `27/27`
- public interaction: `browserAssertions=891`, 외부 요청·콘솔 오류 `0`
- final main CI `32453169036`와 Pages `32453169029`: success

### Release package

- source archive: `axis-shift-source-v0.1.0-hackathon.zip`, 1,059,850 bytes, SHA-256 `69d623eac50d186f52cb88e2dd451ebb4859fd475151dc76ad1a4e4c243b919a`
- Pages archive: `axis-shift-pages-v0.1.0-hackathon.zip`, 103,088 bytes, SHA-256 `34a0601312712a5d7fa20c544960975cdfe3e1b5a2795e65036bc38dae663f01`
- `MANIFEST.sha256`: SHA-256 `ae37db3ed60b0c7a751865b3cc1e078a812fbc069335b02c6954cbd3043cd3b0`, 14 entries, failures `0`
- final release review: `release-package-review.png`, SHA-256 `7cfc102b2dbe84b6afb11058a3d0908b720d4636f0686ee35940bec0f62a7679`
- backup A `.private/submission/H00`, backup B 사용자 Documents의 `v0.1.0-hackathon`: 각 15 files, hash delta `0`
- 비공개 제출 원자료는 Git에 포함하지 않으며, 제출 완료로 정리 가능하지만 오너의 명시적 정리 결정 전까지 보존
- final release-SHA 독립 필드 검사: 2026-08-21 15:41:32 KST, 15:42:06 KST — PASS
- PR 기록: #1 H00 구현, #2 public favicon 회귀, #3 release record

### Explicitly not shipped

- Tutorial 6·Lab 48, Daily Signal·Archive·streak, Sprint
- score·grade·Hint, LocalStorage resume·best record
- share text·PNG·Signal Signature, PWA·offline 설치
- 완전한 ko/en i18n, sound, haptics
- production `src/domain` core와 v1.0 QA

### Known limitations

- H00은 M00 기반 폐기 가능한 정적 프로토타입이며 M02~M11 완료를 뜻하지 않는다.
- 18개 고정 signal은 Lab 48이 아니며 고정 signal 이후 랜덤 반복을 제공한다.
- 저장·계정·동기화·분석이 없고 진행 정보는 서버로 전송되지 않는다.
- `UNLICENSED`/All Rights Reserved 상태를 유지하며 공개 오픈소스 라이선스는 M11 전에 별도 오너 결정한다.

## Post-submission compatibility update — M05

`v0.1.0-hackathon` tag·release·capture SHA `6690f5778f706e1875b452d552bd75ba1c06ee9a`는 변경하지 않았다. 제출 링크를 계속 플레이 가능하게 유지하기 위한 Pages 호환 업데이트만 다음과 같이 별도 배포했다.

- implementation base `f039bb8088d35df91ef393a9b226f22481981ca3`, 최종 runtime/Pages head `1608c26cf4e8d3ca6be2c3765b20fb00bc7b06b9`
- 제출 URL: `https://jtech-co.github.io/axis-shift/prototypes/rule-proof/`
- M05 React fixture는 아직 production controller가 아니므로 공개 게임으로 승격하지 않았다. 기존 playable H00 18-signal game에 Theme 기본 dark 순환 버튼과 Motion 기본 system 토글만 이식했다.
- CI `33207406441`·Pages `33207406497` success; 공개 Pages Chromium·Firefox·WebKit 30/30
- 공개 prototype browser 908단언, 외부 요청 0, 콘솔 오류 0; stage/signal/seed/hash와 PULSE 플레이 호환 유지
- local visual strict 18/18·오너 baseline 9/9, remote visual 15 PASS+tablet 3 explicit SKIP
- Android Chrome·실제 screen reader·200% zoom·색각 시뮬레이션은 0/4 `NOT RUN`이며 ADR-0012에 따라 M10 release-blocking gate로 남는다.

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
- ADR-0011 Theme 단일 버튼: 기본 dark, `dark → light → system → dark`
- ADR-0011 Motion 단일 버튼: 기본 system, `system ↔ reduced`; UI reduced는 저장값 `on`
- 커스텀 high-contrast 테마 제거; legacy v1 `high-contrast` 저장값은 dark로 읽기 정규화
- 운영체제 Forced Colors·색 이외 상태 표식·별도 High Contrast Cells 지원
- keyboard-only core flow
- Reduced Motion에서도 기능 정보 손실 없음
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
| 0.1.0-hackathon | Released prerelease | 18 signal·AXIS/PULSE 공개 프로토타입 |
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
