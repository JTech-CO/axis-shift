# AXIS//SHIFT Release Checklist

**문서 버전**: 1.0.0  
**상태**: H00 v0.1 릴리스·해커톤 제출 완료 역사 보존 / 일반 공개 출시 M10·M11 게이트 미실행·출시 식별 `TBD`
**최종 갱신**: 2026-08-30

> 체크박스가 비어 있으면 미검증이다. “해당 없음”은 이유와 승인자를 기록해야 하며, 불변식·P0/P1 항목에는 사용할 수 없다.

## H00 v0.1 해커톤 프로토타입 부록

> 이 부록은 ADR-0010의 제한된 H00 릴리스만 다룬다. 아래 일반 공개 출시 M10·M11 체크박스를 완료 처리하거나 M02~M11 완료를 뜻하지 않는다.

- [x] M00 종료 기록과 H00 구현을 별도 commit으로 고정했다.
- [x] PR #1에서 18 signal campaign과 AXIS/PULSE vertical slice를 검토·병합했다.
- [x] 공개 Chromium origin의 `/favicon.ico` 404를 PR #2에서 수정하고 회귀 단언을 추가했다.
- [x] release/tag SHA `6690f5778f706e1875b452d552bd75ba1c06ee9a`의 CI run `32453169036`와 Pages run `32453169029`가 성공했다.
- [x] release/tag SHA의 Pages artifact digest `sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998`를 기록했다.
- [x] 공개 URL에서 Chromium·Firefox·WebKit Pages `27/27`과 browser smoke `891`, 외부 요청·콘솔 오류 `0`을 확인했다.
- [x] 동일 공개 release/tag SHA에서 1920×1080 썸네일과 14.84초 무음 데모 영상을 생성했다.
- [x] H00 전용 제목·95자 소개·URL·자산·권리 문구를 두 구현으로 독립 대조했다.
- [x] Google 인증·개인정보·법적 동의·최종 Submit은 프로젝트 오너가 직접 수행했고 제출 완료를 확인했다. Codex는 이 행위를 수행하지 않았으며 정확한 제출 시각·접수 ID·확인 화면은 제공되지 않았다.
- [x] release/tag SHA `6690f5778f706e1875b452d552bd75ba1c06ee9a` clean checkout에서 `npm ci` lock 동일·취약점 0, M00 200,967/0, H00 217/0, verify 10단계, E2E 12/12, a11y 0, Pages 27/27, artifact 14 files/336,182 bytes로 DOD-08을 통과했다.
- [x] final CI `32453169036`, Pages `32453169029`, artifact digest `sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998`와 공개 browser 891·외부 요청/콘솔 오류 0으로 DOD-09를 통과했다.
- [x] `v0.1.0-hackathon` annotated remote tag와 GitHub prerelease가 SHA `6690f577…`를 가리키는지 대조했다.
- [x] source·Pages archive, 14-entry `MANIFEST.sha256`와 제출 자산을 primary `.private/submission/H00` 및 사용자 Documents `v0.1.0-hackathon`에 각 15 files로 백업하고 hash delta 0을 확인했다.
- [x] H00 phase·PROGRESS·traceability를 완료 상태로 고정했고, 이후 프로젝트 오너의 공식 Google 양식 제출 완료 확인을 기록했다. 이는 아래 M10·M11 일반 출시 게이트를 완료 처리하지 않는다.
- [x] 비공개 제출 원자료는 Git에 넣지 않았다. 제출 완료로 정리 조건은 충족했지만 삭제 권한은 별도로 부여되지 않았으므로 오너의 명시적 정리 결정 전까지 보존한다.

H00 공개 자산과 공식 양식 값은 보관된 `SUBMISSION_PACKAGE.md`를, 자산 권리는 `ASSET_LICENSES.md`를, 실제 기능은 `RELEASE_NOTES.md`를 대조 기준으로 사용한다. `SUBMISSION_PACKAGE.md`는 정규 M11의 입력·게이트·승인 증거에서 제외한다.

## 0. 일반 공개 출시 식별

- Release version / tag: `TBD` — 프로젝트 오너 승인 전 임의 지정 금지
- Release date: `TBD` — 프로젝트 오너 승인 전 임의 지정 금지
- Release channel: `TBD` — production·preview 등 실제 승격 채널을 승인 후 기록
- Canonical gameplay URL / domain: `TBD` — GitHub Pages repository path 또는 승인된 도메인을 기록
- Release candidate / freeze commit: `TBD` — M10 QA를 통과하고 프로젝트 오너가 freeze한 고정 SHA
- Final commit SHA: `TBD`
- Build artifact SHA-256 / manifest: `TBD`
- Generator version: M03 승인 결과와 대조 후 기록
- Storage schema: 실제 build와 대조 후 기록
- License / rights policy: `TBD` — 공개 OSS 여부를 포함해 프로젝트 오너 승인 필요
- QA report: `QA_REPORT.md`
- Release notes: `RELEASE_NOTES.md`
- Support / feedback channel and owner: `TBD`
- Production promotion / rollback owner: `TBD`

출시 식별값 하나라도 `TBD`이면 M11 최종 `GO`를 선언하지 않는다. H00 tag·SHA·URL·제출 자산은 이 표의 빈칸을 채우는 값이 아니다.

## 1. 진입·동결

- [ ] M00~M09 phase DoD 전부 완료
- [ ] M10 full QA 완료
- [ ] 활성 불변식 위반 0건
- [ ] 활성 P0 0건
- [ ] 활성 P1 0건
- [ ] 승인 없는 P2 0건
- [ ] 출시 버전·날짜·채널·canonical URL/도메인·라이선스 정책을 프로젝트 오너가 승인함
- [ ] M10 QA를 통과한 고정 commit을 프로젝트 오너가 RC로 승인하고 feature·dependency freeze 시작점을 기록함
- [ ] freeze 이후 변경은 P0/P1 수정, 정확성·보안·접근성 수정, 문서·배포·운영 보완의 허용 목록과 연결됨
- [ ] freeze 이후 변경마다 영향 범위 테스트와 required CI를 재실행하고 RC 승인자가 다시 판정함
- [ ] Sprint 점수식과 tie-break를 사람이 승인하고 문서·golden vector에 고정
- [ ] 공개 시작일·Archive 하한·기본 locale 정책을 사람이 승인
- [ ] support/feedback 채널·담당자·공개 응답 범위가 확정됨
- [ ] About/Privacy의 local data·삭제 방법·offline·analytics·권리 설명이 실제 build와 일치함
- [ ] production 승격·post-deploy smoke·rollback·사고 대응의 운영 담당자와 접근 권한이 준비됨

## 2. Source·재현성

- [ ] clean checkout에서 Node 24.x 확인
- [ ] `npm ci`가 lockfile 변경 없이 통과
- [ ] `git status --short`가 비어 있음
- [ ] `.nvmrc`, CI Node, local Node major 일치
- [ ] package-lock commit됨
- [ ] `dist/`, coverage, Playwright 결과, 대형 영상이 source commit에 없음
- [ ] `.env`, token, key, 개인 정보 없음
- [ ] tag·commit·artifact SHA-256 매핑 가능
- [ ] source archive를 별도 위치에 보관

## 3. 정적 품질 게이트

- [ ] `npm run lint`
- [ ] `npm run format:check`
- [ ] `npm run typecheck`
- [ ] `npm run docs:lint`
- [ ] `npm run docs:links`
- [ ] `npm run check:boundaries`
- [ ] `npm run check:traceability`
- [ ] 순환 의존성 0건
- [ ] feature deep import 위반 0건
- [ ] domain 금지 Web API·React import 0건
- [ ] skip/only 증가·임계치 하향 없음

## 4. 수학·게임 규칙

- [ ] `npm run test:math:exhaustive`
- [ ] 3×3 matrix count=512
- [ ] BFS 최소 PULSE vs rank mismatch=0
- [ ] factorization mismatch=0
- [ ] PULSE exact-cell failure=0
- [ ] PULSE involution failure=0
- [ ] PULSE commutativity failure=0
- [ ] 보드 밖 bit failure=0
- [ ] 같은 입력 canonical solution 동일
- [ ] Hint 3 적용 시 remaining rank 정확히 1 감소
- [ ] 사용자가 Par보다 적게 해결하는 fixture 0건

## 5. 콘텐츠·생성기

- [ ] Tutorial 정확히 6개
- [ ] Lab 정확히 48개, chapter별 12개
- [ ] level ID 중복·재사용 0건
- [ ] `npm run validate:levels`
- [ ] invalid schema/board=0
- [ ] initial==target 일반 퍼즐=0
- [ ] wrong `optimalPulseCount`=0
- [ ] canonical round-trip failure=0
- [ ] Tutorial 학습 순서 사람 승인
- [ ] Lab 시각·난도 큐레이션 사람 승인
- [ ] `npm run audit:daily -- --days 3650`
- [ ] Daily exception=0
- [ ] Daily wrong Par=0
- [ ] adjacent target duplicate=0
- [ ] fallback count와 원인 보고·승인
- [ ] audit normalized SHA-256 기록
- [ ] generator v1 golden dates 보존

## 6. Core session·저장

- [ ] 한 input token당 PULSE move 최대 1건
- [ ] 완료 event·record 세션당 1회
- [ ] Undo exact inverse
- [ ] Reset confirm·cancel focus 복귀
- [ ] Reset이 확정 Daily 기록을 삭제하지 않음
- [ ] S/A/B/C 경계 fixture 통과
- [ ] Hint 2·3 grade 제한 통과
- [ ] 나쁜 재플레이가 best를 덮어쓰지 않음
- [ ] valid v1 storage round-trip
- [ ] Theme 기본 `dark`, 쓰기 allowlist `dark|light|system`
- [ ] legacy v1 `theme: high-contrast` 읽기 시 `dark` 정규화·legacy 값 재기록 없음
- [ ] Motion UI `reduced` → 저장값 `on`
- [ ] invalid JSON 안전 복구
- [ ] invalid field 안전 복구
- [ ] future schema backup/no overwrite
- [ ] write failure에서도 메모리 플레이 지속
- [ ] selecting resume 정확
- [ ] pulsing 저장은 마지막 안정 상태 복구
- [ ] 일반 mode hidden 시간 제외

## 7. Tutorial·Lab

- [ ] 빈 storage에서 first-run route 정상
- [ ] Tutorial 1~6 완료 가능
- [ ] Tutorial skip/back 정책 일치
- [ ] Tutorial coachmark가 360px에서 가리지 않음
- [ ] 신규 사용자 5명 중 4명 이상 90초 내 Tutorial 1 독립 완료
- [ ] 첫 Lab CTA 발견 4/5 이상
- [ ] Lab 48개 route 직접 접근·완료 가능
- [ ] canonical test runner로 54개 전부 완료
- [ ] 완료·등급·시간 저장
- [ ] reload resume
- [ ] 결과 review·next/retry 동작

## 8. Daily·Archive

- [ ] 오늘 Daily는 UTC 기준
- [ ] strict date parser
- [ ] 잘못된·미래·하한 이전 날짜 복구 화면
- [ ] UTC 자정에 새 진입만 새 puzzle 사용
- [ ] 진행 중 세션 자정 강제 교체 없음
- [ ] 4개 timezone에서 동일 UTC instant hash 동일
- [ ] 과거 generator version regression 통과
- [ ] Daily firstCompletedAt 중복 없음
- [ ] local streak truth table 통과
- [ ] Archive 과거 날짜 플레이·기록
- [ ] 계정 동기화 없음·기기 clock 한계 UI 명시

## 9. Sprint

- [ ] 정확한 점수식·tie-break 문서화
- [ ] `sessionEndAt=start+180000`
- [ ] 179999ms 진행, 180000ms 종료
- [ ] background에서 시간 연장 없음
- [ ] 만료 후 복귀 즉시 result
- [ ] reload 후 같은 seed/index/endAt
- [ ] 종료·완료 경쟁에서 score 중복 0
- [ ] 난도 progression 승인 표와 일치
- [ ] 모든 Sprint puzzle validator 통과
- [ ] 같은 event log score 동일
- [ ] best record merge·tie-break 정확
- [ ] timer screen-reader 과다 공지 없음

## 10. UI·반응형

- [ ] dark theme
- [ ] light theme
- [ ] system theme이 운영체제 dark/light 선호를 따름
- [ ] 커스텀 high-contrast theme 노출 0
- [ ] 운영체제 forced-colors parity
- [ ] High Contrast Cells가 Theme·Forced Colors와 독립적으로 동작
- [ ] reduced-motion parity
- [ ] 360×640 overflow=0
- [ ] 390×844 overflow=0
- [ ] 768×1024 overflow=0
- [ ] 1024×768 overflow=0
- [ ] 1440×900 overflow=0
- [ ] 200% zoom 핵심 조작 가능
- [ ] 6×6 board와 sticky PULSE 겹침 없음
- [ ] 모든 핵심 target >=44×44 CSS px
- [ ] selected/preview/on/off/error가 색 외 표식 보유
- [ ] pulsing 중 중복 입력 차단
- [ ] animation event에 완료 로직 비의존
- [ ] visual regression 의도치 않은 diff 0

## 11. 접근성

- [ ] 키보드로 홈→Tutorial→Lab→result→share
- [ ] 키보드로 Daily·Archive·Sprint·Settings
- [ ] AxisToggle `aria-pressed`
- [ ] board·target 대체 설명
- [ ] dialog focus trap·복귀
- [ ] 완료 후 Result heading focus
- [ ] 오류·toast 상태 적절한 live region
- [ ] timer 공지 throttling
- [ ] axe serious=0
- [ ] axe critical=0
- [ ] screen reader 수동 점검
- [ ] 색각 시뮬레이션
- [ ] 운영체제 Forced Colors에서 색 이외 상태 표식 유지
- [ ] sound/haptics 없이 정보 동일
- [ ] reduce motion에서 멀미 유발 이동 제거

## 12. i18n·카피

- [ ] ko/en key set 동일
- [ ] 빈 translation 0
- [ ] raw key 노출 0
- [ ] component user-facing hardcode 0
- [ ] 날짜·시간·숫자 locale formatting
- [ ] 긴 한국어·영어 clipping 0
- [ ] locale 즉시 전환
- [ ] locale reload persistence
- [ ] 첫 Tutorial에 tensor/XOR/rank 용어 강제 없음
- [ ] About의 수학 설명이 `PUZZLE_MATH.md`와 모순 없음
- [ ] Privacy·offline·local record 한계 명확

## 13. 공유

- [ ] share module은 `ShareResult` allowlist만 수신
- [ ] target rows 노출 0
- [ ] current rows 노출 0
- [ ] row/col mask 노출 0
- [ ] raw move sequence 노출 0
- [ ] session/user identifier 노출 0
- [ ] signature-v1 golden vector 통과
- [ ] text share UTF-8·줄바꿈 정상
- [ ] Web Share files 지원 경로
- [ ] Web Share text-only 경로
- [ ] Clipboard 경로
- [ ] selectable textarea 최종 폴백
- [ ] 1080×1080 PNG
- [ ] 1200×630 PNG
- [ ] ko/en·font fallback에서 잘림 없음
- [ ] PNG 생성 실패 시 text CTA 유지
- [ ] 실제 Android/iOS 상당 공유 검증

## 14. Settings·피드백

- [ ] Theme 단일 버튼 기본 `dark`, `dark → light → system → dark`
- [ ] sound enabled/volume
- [ ] haptics enabled
- [ ] Motion 단일 버튼 기본 `system`, `system ↔ reduced`
- [ ] Motion UI `reduced`가 저장값 `on`으로 매핑
- [ ] high contrast cells는 Theme·Forced Colors와 별도 설정
- [ ] keyboard hints
- [ ] 설정 즉시 적용·reload 저장
- [ ] AudioContext 첫 gesture 이후
- [ ] sound off 호출 0
- [ ] haptics off 호출 0
- [ ] unsupported API 안전 no-op
- [ ] 합성음·icon 등 자산 권리 기록

## 15. PWA·오프라인

- [ ] manifest 유효
- [ ] favicon·icons 크기·maskable 검증
- [ ] name/short_name/description ko/en 정책
- [ ] Vite base = manifest scope/start_url = worker scope
- [ ] repository path 밖 interception 없음
- [ ] installability 검증
- [ ] app shell precache
- [ ] Tutorial·Lab·fallback precache
- [ ] 최초 cache 후 offline 홈
- [ ] offline Tutorial·Lab
- [ ] offline 오늘 Daily 생성
- [ ] offline 저장·reload
- [ ] update prompt 표시
- [ ] 진행 세션 저장 뒤 사용자 승인 update
- [ ] 강제 auto reload 없음
- [ ] 새 version 후 archive version map 보존

## 16. 성능

- [ ] initial JS gzip 측정·기록
- [ ] JS 230KB 상한 초과 시 승인된 분석
- [ ] initial CSS gzip <=35KB 또는 승인 분석
- [ ] first-screen assets <=1MB 또는 승인 분석
- [ ] cache <=4MB 또는 승인 분석
- [ ] LCP 환경·수치 기록
- [ ] INP 환경·수치 기록
- [ ] CLS 환경·수치 기록
- [ ] input feedback 측정
- [ ] generator median/p95 측정
- [ ] rank/factorization 측정
- [ ] share PNG 측정
- [ ] 60fps target motion trace 점검
- [ ] 성능 수치가 `QA_REPORT.md`에 있음

## 17. 보안·개인정보

- [ ] secret scan 0
- [ ] browser bundle secret-like string 검토
- [ ] `dangerouslySetInnerHTML` 0 또는 승인·sanitize 근거
- [ ] route/storage allowlist parse
- [ ] external link `noopener noreferrer`
- [ ] CSP self-first
- [ ] cookies 0
- [ ] 계정·이메일·닉네임·위치 수집 0
- [ ] remote analytics 0
- [ ] 광고 SDK 0
- [ ] 외부 AI/API 호출 0
- [ ] 외부 font CDN 0
- [ ] hotlink asset 0
- [ ] production same-origin request audit
- [ ] high severity dependency issue 0 또는 승인 조치

## 18. 자산·라이선스

- [ ] 공개 라이선스 또는 All Rights Reserved 정책을 프로젝트 오너가 승인하고 repository·package·About에 동일하게 기록
- [ ] package dependency license report 확인
- [ ] public/src asset inventory 생성
- [ ] `ASSET_LICENSES.md`와 inventory 일치
- [ ] 자산별 source·author·license·modification 기록
- [ ] 사용권 불명확 자산 0
- [ ] 게임 UI·icon·share card·README·일반 출시 홍보 자산도 동일 검토
- [ ] H00 thumbnail·video는 역사 패키지에만 귀속되고 정규 출시 권리 증거로 재사용되지 않음
- [ ] 제3자 상표·로고 무단 사용 없음
- [ ] 생성형 자산 사용 시 도구·후처리·권리 메모
- [ ] 삭제한 자산이 build/cache에 남지 않음

## 19. 빌드·배포

- [ ] `npm run verify`
- [ ] `npm run test:e2e`
- [ ] `npm run test:a11y`
- [ ] `npm run test:visual`
- [ ] `npm run build`
- [ ] owner-approved RC commit의 required CI가 모두 green
- [ ] production 승격은 승인된 RC SHA와 1:1인 CI Pages artifact만 사용
- [ ] artifact manifest에 release 식별값, commit SHA, build 환경, 파일별 SHA-256을 기록
- [ ] release manifest와 배포 run·environment URL을 변경 불가능한 증거로 보존
- [ ] public URL 로그인 없이 접속
- [ ] canonical URL·repository base·legacy 호환 URL의 역할이 문서와 실제 redirect/route에 일치
- [ ] home route
- [ ] Tutorial route
- [ ] Lab route/direct level
- [ ] Daily current/direct date
- [ ] Archive route
- [ ] Sprint route
- [ ] Settings/About
- [ ] unknown route 복구
- [ ] manifest `start_url`·`scope`, service worker scope, Vite base 일치
- [ ] fresh profile·기존 worker update·offline restart를 실제 production URL에서 검증
- [ ] 외부 네트워크의 desktop·mobile 상당 환경에서 post-deploy smoke 실행
- [ ] post-deploy smoke에 배포 SHA, URL, 실행 시각, 브라우저, 결과를 기록
- [ ] post-deploy Daily golden hash
- [ ] post-deploy offline/update
- [ ] post-deploy CSP·same-origin network·storage/cookie inventory 확인
- [ ] artifact SHA-256 기록
- [ ] 마지막 green artifact·commit·manifest를 식별하고 접근 가능함
- [ ] rollback trigger·승인자·명령·사용자 공지 경로를 runbook에 기록
- [ ] service worker cache를 포함한 rollback rehearsal 뒤 canonical URL smoke 통과

## 20. 저장소 문서

- [ ] README 게임 소개
- [ ] README 조작법
- [ ] README local setup·test·build
- [ ] README architecture·math 요약
- [ ] README deployment URL
- [ ] README accessibility·privacy·local data 삭제 방법
- [ ] README LICENSE·asset credits·권리 정책
- [ ] README Codex collaboration 링크
- [ ] README support/feedback 채널과 known limitations
- [ ] 기술·디자인 백서 최신
- [ ] ADR 상태 최신
- [ ] 요구사항 전부 Verified
- [ ] `PROGRESS.md` 실제 phase·SHA 최신
- [ ] `RUNBOOK.md` production 승격·post-deploy smoke·rollback·장애 대응 반영
- [ ] `QA_REPORT.md` 실제 수치·환경
- [ ] `RELEASE_NOTES.md` 실제 shipped 기능·제약

## 21. 일반 공개 출시·운영 인계

- [ ] 프로젝트 오너가 release identity와 최종 `GO` 범위를 서면 기록
- [ ] canonical gameplay URL을 외부 네트워크·새 프로필·모바일에서 다시 확인
- [ ] production artifact manifest·source archive·release notes를 두 위치 이상에 보관
- [ ] public support/feedback 링크가 로그인 요구·권한 오류 없이 열림
- [ ] feedback 경로가 불필요한 개인정보를 요구하지 않고 수집·보관 범위를 설명함
- [ ] About/Privacy가 계정·cookie·analytics 유무, LocalStorage 저장·삭제, offline·기기 시계 한계를 설명함
- [ ] 라이선스·자산 권리·상표 정책을 repository와 실제 build에서 대조함
- [ ] 운영 담당자가 Pages 배포·환경 설정·마지막 green artifact·rollback runbook에 접근 가능함
- [ ] 장애 심각도·rollback trigger·support 공지 책임을 운영 인계표에 기록함
- [ ] post-deploy smoke와 rollback rehearsal 증거를 `QA_REPORT.md`와 release notes에 연결함
- [ ] 알려진 제한·승인된 P2·사용자 영향과 복구 방법을 공개 release notes에 기록함
- [ ] H00 `SUBMISSION_PACKAGE.md`와 행사 양식·200자 소개·3분 영상·마감은 일반 출시 gate에서 참조하지 않음

## 22. 최종 승인

| 역할 | 판정 | 식별/서명 | 일시 | 비고 |
|---|---|---|---|---|
| 개발 | — | — | — | — |
| UX/플레이테스트 | — | — | — | — |
| QA | — | — | — | — |
| 자산·라이선스 | — | — | — | — |
| 운영·지원 | — | — | — | — |
| 프로젝트 오너 | — | — | — | — |

- [ ] 모든 필수 체크 완료
- [ ] 최종 판정 `GO`
- [ ] `PROGRESS.md`를 M11/일반 공개 출시 상태와 실제 release identity로 갱신
