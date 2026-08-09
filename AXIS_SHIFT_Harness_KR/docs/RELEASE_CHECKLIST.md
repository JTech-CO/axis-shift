# AXIS//SHIFT Release Checklist

**문서 버전**: 1.0.0  
**상태**: 미실행 — M10·M11에서 체크  
**최종 갱신**: 2026-08-09

> 체크박스가 비어 있으면 미검증이다. “해당 없음”은 이유와 승인자를 기록해야 하며, 불변식·P0/P1 항목에는 사용할 수 없다.

## 0. 릴리스 식별

- Release candidate: M10에서 입력
- Commit SHA: M10에서 입력
- Production URL: M10에서 입력
- Generator version: M03에서 입력
- Storage schema: v1 예정
- QA report: `QA_REPORT.md`
- Release notes: `RELEASE_NOTES.md`
- Submission package: `SUBMISSION_PACKAGE.md`

## 1. 진입·동결

- [ ] M00~M09 phase DoD 전부 완료
- [ ] M10 full QA 완료
- [ ] 활성 불변식 위반 0건
- [ ] 활성 P0 0건
- [ ] 활성 P1 0건
- [ ] 승인 없는 P2 0건
- [ ] 2026-08-21 이후 새 mode·규칙·대형 의존성 없음
- [ ] 2026-08-23 이후 feature·dependency freeze 준수
- [ ] freeze 이후 변경 파일이 P0/P1·문서·제출 자산 허용 목록과 연결됨
- [ ] Sprint 점수식과 tie-break를 사람이 승인하고 문서·golden vector에 고정
- [ ] 공개 시작일·Archive 하한·기본 locale 정책을 사람이 승인

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
- [ ] high-contrast theme
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

- [ ] theme system/dark/light/high-contrast
- [ ] sound enabled/volume
- [ ] haptics enabled
- [ ] reduced motion system/on/off
- [ ] high contrast cells
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

- [ ] repository LICENSE 최종 선택·commit
- [ ] package dependency license report 확인
- [ ] public/src asset inventory 생성
- [ ] `ASSET_LICENSES.md`와 inventory 일치
- [ ] 자산별 source·author·license·modification 기록
- [ ] 사용권 불명확 자산 0
- [ ] thumbnail·video 자산도 동일 검토
- [ ] 제3자 상표·로고 무단 사용 없음
- [ ] 생성형 자산 사용 시 도구·후처리·권리 메모
- [ ] 삭제한 자산이 build/cache에 남지 않음

## 19. 빌드·배포

- [ ] `npm run verify`
- [ ] `npm run test:e2e`
- [ ] `npm run test:a11y`
- [ ] `npm run test:visual`
- [ ] `npm run build`
- [ ] CI Pages artifact 생성
- [ ] public URL 로그인 없이 접속
- [ ] home route
- [ ] Tutorial route
- [ ] Lab route/direct level
- [ ] Daily current/direct date
- [ ] Archive route
- [ ] Sprint route
- [ ] Settings/About
- [ ] unknown route 복구
- [ ] post-deploy Daily golden hash
- [ ] post-deploy offline/update
- [ ] artifact SHA-256 기록
- [ ] 마지막 green rollback 경로 확인

## 20. 저장소 문서

- [ ] README 게임 소개
- [ ] README 조작법
- [ ] README local setup·test·build
- [ ] README architecture·math 요약
- [ ] README deployment URL
- [ ] README accessibility·privacy
- [ ] README LICENSE·asset credits
- [ ] README Codex collaboration 링크
- [ ] 기술·디자인 백서 최신
- [ ] ADR 상태 최신
- [ ] 요구사항 전부 Verified
- [ ] `PROGRESS.md` 실제 phase·SHA 최신
- [ ] `RUNBOOK.md` 반복 장애 반영
- [ ] `QA_REPORT.md` 실제 수치·환경
- [ ] `RELEASE_NOTES.md` 실제 shipped 기능·제약

## 21. 행사 제출

- [ ] 공식 안내를 제출 당일 재확인
- [ ] 게임 제목 최종
- [ ] 소개문 문자 제한 통과
- [ ] gameplay URL final smoke
- [ ] 16:9 JPG/PNG thumbnail
- [ ] thumbnail 권장 파일 크기 이내
- [ ] 최대 3분 demo 영상
- [ ] 영상은 final commit 빌드 사용
- [ ] Codex 활용 설명이 실제 로그·commit과 일치
- [ ] repository 공개 상태 확인
- [ ] 링크·영상 외부 권한 확인
- [ ] 양식 필드 독립 2회 대조
- [ ] 제출 완료 캡처·일시 기록
- [ ] source/artifact/thumbnail/video/hash 백업

## 22. 최종 승인

| 역할 | 판정 | 식별/서명 | 일시 | 비고 |
|---|---|---|---|---|
| 개발 | — | — | — | — |
| UX/플레이테스트 | — | — | — | — |
| QA | — | — | — | — |
| 자산·라이선스 | — | — | — | — |
| 프로젝트 오너 | — | — | — | — |

- [ ] 모든 필수 체크 완료
- [ ] 최종 판정 `GO`
- [ ] `PROGRESS.md`를 M11/제출 상태로 갱신
