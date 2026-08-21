# AXIS//SHIFT — OpenAI Game Builders Seoul 제출 패키지

**문서 버전**: 1.0.0  
**상태**: H00 v0.1 submission-ready 패키지 완료 — 공식 양식 제출은 프로젝트 오너 작업
**공식 안내 확인일**: 2026-08-21
**제출 접수 종료**: 2026-08-26  
**공식 안내**: `https://openaigame2026.com/#main`

> H00 기록은 2026-08-21에 실제 공식 양식을 다시 확인한 결과다. Google 계정 인증, 팀·연락처 정보, 동의 확인과 최종 `Submit`은 프로젝트 오너가 수행하며, 이 문서는 공식 제출 완료를 주장하지 않는다. 아래 M11 v1.0 템플릿은 향후 릴리스를 위해 보존한다.

## H00 v0.1 submission-ready 패키지

### 공식 양식 필드와 확정 입력값

2026-08-21 라이브 양식 확인 기준 필수 필드는 팀 이름, 게임 제목, 200자 이내 게임 소개, 공개 플레이 링크, 썸네일이다. 데모 영상과 Codex 활용 설명은 선택 필드다.

| 필드 | H00 v0.1 값 | 상태 |
|---|---|---|
| Team name | 프로젝트 오너가 공식 양식에 직접 입력 | 공개 문서·패키지에 개인정보를 저장하지 않음 |
| Game title | AXIS//SHIFT — A Tensor Pulse Puzzle | 확정 |
| Game description | 행과 열을 선택해 교차점 신호를 반전하고 목표 패턴을 맞추는 짧은 텐서 퍼즐입니다. 6개 난도·크기 구역의 18개 신호와 무한 랜덤 문제에서 최소 PULSE에 도전하세요. | 95자 / 200자 이하 |
| Repository | `https://github.com/JTech-CO/axis-shift` | 공개 접근 확인 |
| Gameplay URL | `https://jtech-co.github.io/axis-shift/` | 로그인 없이 HTTP 200 및 public E4 확인 |
| Application capture SHA | `6690f5778f706e1875b452d552bd75ba1c06ee9a` | release/tag SHA와 동일한 실제 공개 화면 기준 |
| Release / tag target SHA | `6690f5778f706e1875b452d552bd75ba1c06ee9a` | release record와 annotated tag 고정 |
| Release tag | [`v0.1.0-hackathon`](https://github.com/JTech-CO/axis-shift/releases/tag/v0.1.0-hackathon) | GitHub prerelease 공개·remote tag 대조 완료; 공식 양식 제출 근거는 아님 |
| Final CI workflow | run `32453169036` | success |
| Final Pages workflow | run `32453169029` | success·배포 SHA 일치 |
| Final Pages artifact | `sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998` | GitHub Pages artifact digest |
| Release record PR | `https://github.com/JTech-CO/axis-shift/pull/3` | #1 구현, #2 favicon 수정 뒤 최종 기록 |
| Thumbnail | `.private/submission/H00/axis-shift-submission-thumbnail-v0.1.0.png` | 1920×1080, 293,879 bytes |
| Demo video (MP4) | `.private/submission/H00/axis-shift-demo-v0.1.0.mp4` | H.264, 1920×1080, 25fps, 14.84초, 무음, 1,366,482 bytes |
| Demo capture (WebM) | `.private/submission/H00/axis-shift-demo-v0.1.0.webm` | 1920×1080, 14.84초, 1,458,929 bytes |
| Codex process | `.private/submission/H00/codex-collaboration-summary.txt` | H00에서 실제 수행한 구현·검증만 기술 |

### 제출용 소개문

> 행과 열을 선택해 교차점 신호를 반전하고 목표 패턴을 맞추는 짧은 텐서 퍼즐입니다. 6개 난도·크기 구역의 18개 신호와 무한 랜덤 문제에서 최소 PULSE에 도전하세요.

문자 수는 PowerShell과 Node의 독립 검사에서 각각 95자로 확인했다. H00에는 Daily, PWA, Tutorial, Lab, Sprint, 결과 공유 기능을 구현했다고 쓰지 않는다.

### 제출 자산 무결성

| 자산 | SHA-256 |
|---|---|
| `axis-shift-submission-thumbnail-v0.1.0.png` | `49a4b7a279256046264aa03cecd1be205983045f54137b659e05021cedd70a2f` |
| `axis-shift-demo-v0.1.0.mp4` | `d0eaf60887cf94154d074297d8a6ba530d08abab8f158ab3a9e21ea3021cd990` |
| `axis-shift-demo-v0.1.0.webm` | `79f31acc48c45778fbd5ca59a07304ff1d60fb24e5dee75a8803aa406506e6db` |
| `submission-package-review.png` | `bf8981a208ed637e9c9b2f95c51d8e8b30d934b8eef8ac68c963395aac0eb480` |
| `axis-shift-source-v0.1.0-hackathon.zip` | `69d623eac50d186f52cb88e2dd451ebb4859fd475151dc76ad1a4e4c243b919a` — 1,059,850 bytes |
| `axis-shift-pages-v0.1.0-hackathon.zip` | `34a0601312712a5d7fa20c544960975cdfe3e1b5a2795e65036bc38dae663f01` — 103,088 bytes |
| `release-package-review.png` | `7cfc102b2dbe84b6afb11058a3d0908b720d4636f0686ee35940bec0f62a7679` |
| `MANIFEST.sha256` | `ae37db3ed60b0c7a751865b3cc1e078a812fbc069335b02c6954cbd3043cd3b0` — 14 entries, failures 0 |

썸네일과 영상은 위 application SHA의 실제 공개 게임 화면을 캡처했다. 외부 이미지·폰트·음원·상표 자산은 추가하지 않았고 영상에는 오디오가 없다. 저장소는 기존 `private: true`, `UNLICENSED`, All Rights Reserved 상태를 유지하며 H00에서 새로운 LICENSE 또는 오픈소스 권리를 부여하지 않는다.

### 독립 필드 검사

| 검사 | 일시(KST) | 방법 | 핵심 결과 |
|---|---|---|---|
| pre-tag 1차 | 2026-08-21T14:55:14+09:00 | PowerShell, HTTP, `ffprobe` | 초기 제목·95/200자·URL 200·썸네일 1920×1080·3분 이하 영상·권리 기록 통과 |
| pre-tag 2차 | 2026-08-21T14:55:32+09:00 | Node `fetch`·crypto·PNG header | 제목·설명·URL·3개 자산 hash·썸네일 크기·H00 범위 주장 통과 |
| final release-SHA 3차 | 2026-08-21T15:41:32+09:00 | PowerShell, HTTP, System.Drawing, `ffprobe`, Git | URL 2/2, 6개 최종 hash, 1920×1080, 영상 14.84초, annotated tag target 통과 |
| final release-SHA 4차 | 2026-08-21T15:42:06+09:00 | Node `fetch`·crypto·PNG header·`ffprobe`·GitHub API | URL 2/2, hash 6/6, 영상 14.84초, tag target=capture SHA, final link allowlist 통과 |

`submission-package-review.png`와 최종 tag·run·archive를 담은 `release-package-review.png`를 1920×1080에서 육안 검토했다. primary `.private/submission/H00`와 secondary `<USER_DOCUMENTS>/AXIS_SHIFT_H00_Backup/v0.1.0-hackathon`은 각 15 files이며 hash delta는 0이다. 공식 양식의 최종 제출은 Google 계정, 개인·팀 정보, 약관·개인정보·국외 이전 동의를 포함하므로 프로젝트 오너가 직접 수행한다. 제출 시각, submission ID, 확인 화면이 생기기 전에는 `Submitted`로 기록하지 않는다.

## 1. M11 v1.0 공식 제출 필드 스냅샷 — H00 미사용 템플릿

2026-08-09 확인 기준:

> 이 절과 아래 §2~§12는 모두 향후 M11 v1.0 템플릿이다. H00 제출 문구·완료 주장·자산 경로로 사용하지 않는다.

| 필드 | 필수 | 현재 계약 |
|---|---:|---|
| 게임 제목 | 필수 | AXIS//SHIFT — A Daily Tensor Puzzle |
| 게임 소개 | 필수 | 200자 이내 양식 기준 재검증 |
| 플레이 링크 | 필수 | 브라우저에서 로그인 없이 실행 가능한 공개 URL |
| 썸네일 | 필수 | 16:9 JPG/PNG, 권장 10MB 이하 |
| 데모 영상 | 선택·가산점 | 최대 3분 |
| Codex 활용 설명 | 선택·가산점 | 구현·문제 해결·사람 결정 구분 |

공식 심사 맥락:

```text
Playability
Originality
Codex Collaboration
Release Potential
Presentation
```

## 2. 최종 필드 원본

| 필드 | 최종 값 | 검증자 | 검증 일시 |
|---|---|---|---|
| Title | AXIS//SHIFT — A Daily Tensor Puzzle | — | — |
| Repository | M11에서 입력 | — | — |
| Gameplay URL | M11에서 입력 | — | — |
| Release tag | M11에서 입력 | — | — |
| Commit SHA | M11에서 입력 | — | — |
| Thumbnail | M11에서 입력 | — | — |
| Demo video | M11에서 입력 | — | — |
| Codex process text | 아래 최종본으로 교체 | — | — |
| Submission timestamp | M11에서 입력 | — | — |
| Confirmation evidence | M11에서 입력 | — | — |

## 3. 200자 소개문 초안

### 한국어 초안 A — 규칙 중심 (현재 101자)

> 행과 열을 선택하면 교차점의 신호가 반전됩니다. 증명된 최소 횟수로 목표 패턴을 복원하고, 모두가 같은 데일리 퍼즐을 풀어 스포일러 없는 결과 카드를 공유하는 3분 논리 퍼즐입니다.

### 한국어 초안 B — 짧은 CTA 중심 (현재 98자)

> 행과 열을 골라 교차점에 신호를 찍으세요. 겹친 신호는 다시 반전됩니다. 증명된 최소 횟수에 도전하고, 매일 같은 퍼즐의 스포일러 없는 결과를 공유하는 1~3분 웹 퍼즐입니다.

최종 양식의 문자 계산 규칙—공백, 줄바꿈, 영문 slash 포함 여부—으로 다시 측정한다. 과장된 “세계 최초”, “AI가 전부 제작” 같은 표현은 사용하지 않는다.

### English reference copy

> Select rows and columns to flip their intersections. Restore the target in the provable minimum number of pulses, solve the same daily puzzle, and share a spoiler-free signal card in this 1–3 minute logic game.

영문이 공식 필수가 아니라면 저장소·영상 자막·OG 설명에 사용한다.

## 4. Gameplay URL 승인 기준

- 로그인·초대·비밀번호 없음
- 새 browser profile에서 첫 화면 로드
- 시작까지 주요 action 최대 2회
- mobile·desktop 지원
- 직접 hash route 404 없음
- 오늘 Daily 생성
- first Tutorial·Lab·Sprint 실행
- 결과·share fallback
- HTTPS·manifest·worker 정상
- 외부 API 장애에 비의존
- build SHA를 About/진단에서 확인 가능

Final smoke:

```bash
npm run smoke:production -- --url "$PRODUCTION_URL"
```

외부 네트워크와 QR/제출 미리보기 링크에서도 한 번 더 확인한다.

## 5. 썸네일 사양

### 제출본

- 비율: 16:9
- 권장 작업 크기: 1920×1080
- 형식: PNG 우선, 크기 문제 시 고품질 JPG
- 권장 용량: 10MB 이하
- 파일명: `axis-shift-submission-thumbnail-v1.0.0.png`
- source와 export hash 기록

### 화면 구성

```text
좌상단: AXIS//SHIFT 로고
중앙: Target Preview ↔ Current Grid
상·좌측: 선택된 axis와 교차 preview
하단/우측: PULSE CTA
짧은 부제: A Daily Tensor Puzzle
```

### 금지

- 실제 Daily 정답 전체 노출
- 구현되지 않은 모드·효과 합성
- 과도한 네온·코드 레인·AI 얼굴 이미지
- 작은 preview에서 읽히지 않는 장문
- 미등록 외부 로고·폰트·이미지
- 게임 UI와 다른 색·컴포넌트

## 6. 최대 3분 데모 영상

### 권장 타임라인

| 시간 | 내용 | 증명할 평가 축 |
|---:|---|---|
| 0:00–0:10 | Target·행/열 선택·한 번의 PULSE로 즉시 훅 | Playability·Presentation |
| 0:10–0:35 | 교차점·중첩 반전 규칙 | Playability |
| 0:35–1:15 | Daily 실제 문제 해결·Par/S grade | Originality·Playability |
| 1:15–1:40 | Signal Signature·text/PNG 공유 | Release Potential |
| 1:40–2:00 | Lab·Sprint·mobile·offline·accessibility | Release Potential |
| 2:00–2:35 | Codex: rank/factorization, generator audit, E2E | Codex Collaboration |
| 2:35–2:55 | 사람: 규칙·큐레이션·디자인·릴리스 판단 | 신뢰성 |
| 2:55–3:00 | gameplay URL·마무리 | Presentation |

### 영상 게이트

- 실제 v1.0.0 production build 사용
- 길이 3:00 이하
- 1080p 이상 권장
- 커서·터치가 action을 가리지 않음
- 한국어 음성이라면 영어 자막 또는 반대 구성 검토
- 배경음·폰트·캡처 자산 라이선스 확인
- API key·알림·개인정보·브라우저 계정 노출 없음
- 설명 수치가 QA_REPORT와 일치
- public 또는 심사자가 접근 가능한 권한

## 7. Codex 활용 설명 초안 골격

최종본은 `CODEX_COLLABORATION.md`의 실제 로그로만 채운다.

```text
Codex는 GF(2) 기반 게임 코어, 결정적 Daily 생성기, 콘텐츠 검증기,
접근성 E2E와 GitHub Pages 배포 자동화를 구현·검증하는 데 사용했습니다.

사람은 코어 규칙, 난도 철학, Lab 48개 큐레이션, 시각 방향,
Sprint 점수와 최종 릴리스 승인을 유지했습니다.

대표 검증:
- 3×3 전체 512개 행렬에서 brute-force 최소해와 rank 일치: [실제 결과]
- Daily 3,650일 생성 감사: [실제 결과]
- 브라우저·모바일·오프라인 E2E: [실제 결과]

관련 commit/문서: [실제 링크]
```

실제 구현 전 현재 초안을 제출하지 않는다.

## 8. 저장소 공개 상태

M11 확인:

- repository visibility: public
- default branch: main
- README 첫 화면에 gameplay 링크
- LICENSE 존재
- asset credits 존재
- release tag 존재
- issue/PR의 secret·개인정보 없음
- build instructions 재현 가능
- `CODEX_COLLABORATION.md` 공개 가능한 내용만 포함
- 해커톤용 임시 access token 없음

## 9. 제출 전 독립 대조표

| 항목 | 1차 확인 | 2차 확인 | 최종 |
|---|---|---|---|
| Title spelling·slash | — | — | — |
| 소개문 문자 수 | — | — | — |
| Gameplay URL | — | — | — |
| Repository URL | — | — | — |
| Thumbnail ratio/size | — | — | — |
| Video length/access | — | — | — |
| Codex 설명 사실성 | — | — | — |
| Contact/account | — | — | — |
| 제출 마감·timezone | — | — | — |

가능하면 한 번은 제출 작성자와 다른 사람이 검토한다. 단독 작업이면 브라우저 세션을 닫고 `SUBMISSION_PACKAGE.md` 원본과 다시 대조한다.

## 10. 제출 당일 절차

1. 공식 페이지의 마감·필드·파일 제한 재확인.
2. final production smoke 실행.
3. service worker 새 profile/clear storage 상태 확인.
4. 소개문 최종 문자 수 계산.
5. thumbnail·video local playback과 외부 권한 확인.
6. 양식 입력 후 제출 전 화면 캡처.
7. 독립 대조표 완료.
8. 제출.
9. confirmation 화면·메일·submission ID 저장.
10. 제출 시각과 final values를 이 문서에 기록.

## 11. 백업 패키지

```text
submission/
├── axis-shift-source-v1.0.0.zip
├── axis-shift-dist-v1.0.0.zip
├── axis-shift-submission-thumbnail-v1.0.0.png
├── axis-shift-demo-v1.0.0.mp4
├── description-ko.txt
├── description-en.txt
├── codex-collaboration-summary.txt
├── final-links.txt
└── MANIFEST.sha256
```

두 위치 이상에 저장하되 공개하면 안 되는 계정·연락정보는 package와 분리한다.

## 12. 제출 후 기록

| 항목 | 값 |
|---|---|
| Submitted at | — |
| Submission ID | — |
| Confirmation URL/file | — |
| Final gameplay URL | — |
| Final commit/tag | — |
| Final thumbnail SHA-256 | — |
| Final video SHA-256 | — |
| Post-submit smoke | — |
| Allowed edit window | — |

제출 당시 증거를 이후 release로 덮어쓰지 않는다.
