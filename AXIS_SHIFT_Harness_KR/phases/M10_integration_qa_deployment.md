# M10 — Integration QA, Performance & Production Deployment ★

- **상태**: 미시작
- **담당 범위**: 전체 회귀, 브라우저·기기·접근성·성능, GitHub Pages 배포, QA 승인
- **최종 갱신**: 2026-08-09

## 1. 맥락과 목표

개별 phase가 통과한 기능을 하나의 공개 빌드로 검증한다. 로컬 성공이 아니라 CI와 실제 GitHub Pages 하위 경로, 새 브라우저 프로필, 오프라인 설치 환경에서 모든 핵심 흐름이 동작하고 P0·P1이 0건인 release candidate를 만든다.

## 2. 범위

### 포함

- 전체 CI pipeline과 protected main 기준
- unit/component/content/generator/E2E/a11y/visual 회귀
- Chromium·Firefox·WebKit, 모바일·데스크톱 matrix
- 360px, 768px, 1024px, 1440px, 200% zoom
- Lighthouse·bundle·runtime performance 기록
- GitHub Pages production workflow와 post-deploy smoke
- manifest·service worker·base path·direct hash route
- CSP, dependency, license, secret, network audit
- 결함 triage와 `docs/QA_REPORT.md`

### 제외

- 새 게임 모드·규칙·대형 리팩터링
- 마케팅 영상·최종 제출 입력(M11)
- 앱 스토어 패키징
- P2/P3의 무제한 폴리시

## 3. 진입조건 (DoR)

- [ ] M09 DoD 통과.
- [ ] 2026-08-21 scope freeze 이후 신규 기능이 없음.
- [ ] GitHub Pages repository·permissions·base path 준비.
- [ ] 실제 Android와 iOS Safari 상당 환경 또는 대체 검증 장치 준비.
- [ ] `docs/QA_REPORT.md`, `docs/RELEASE_CHECKLIST.md`의 실행 섹션 준비.
- [ ] 모든 활성 INV와 결함 심각도 기준 확인.

## 4. 입력·산출물 계약

### 입력

- `main` 후보 commit
- 전체 자동 테스트와 visual baseline
- production environment 값과 Pages workflow
- M00·M06 플레이테스트 결과

### 산출물

- `v1.0.0-rc.1` 이상의 release candidate commit/tag
- 공개 GitHub Pages URL
- CI run·post-deploy smoke 증거
- 완성된 `docs/QA_REPORT.md`
- 결함 목록과 P0/P1=0 증거
- bundle/Lighthouse/performance 리포트

## 5. 작업 순서

1. 전체 요구사항 추적표의 미연결 항목을 0으로 만든다.
2. CI 명령 순서와 artifact 보존을 완성한다.
3. 깨끗한 환경에서 full regression을 실행한다.
4. production base로 build·deploy하고 실제 URL smoke를 실행한다.
5. 브라우저·viewport·테마·locale·input matrix를 실행한다.
6. 오프라인·PWA update·storage corruption·timezone·sharing capability를 재검증한다.
7. performance·bundle·Lighthouse를 측정하되 수치와 환경을 함께 기록한다.
8. 발견 결함을 P0~P3로 triage하고 P0/P1을 전부 수정·재검증한다.
9. QA_REPORT와 release checklist를 사람이 승인한다.

## 6. 참조

- **불변식**: INV-001~020 전부
- **ADR**: 채택 ADR 전부
- **기술 백서**: §2.4, §7~9, §11
- **디자인 백서**: 반응형·상태·접근성·QA matrix
- **문서**: `docs/QA_REPORT.md`, `docs/RELEASE_CHECKLIST.md`, `docs/ENVIRONMENT.md`, `docs/REQUIREMENTS_TRACEABILITY.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — Full CI**: 고정 commit에서 install → lint → format → typecheck → tests → level validate → daily audit → build → E2E → a11y가 전부 green이고 CI URL을 기록한다. E4. (INV-018)
- [ ] **DOD-02 — 수학·콘텐츠 회귀**: M02 3×3 전수, M03 54개 validator·3,650일 audit 결과가 기준 hash와 일치한다. E3. (INV-005~009)
- [ ] **DOD-03 — 공개 링크**: 로그인·특수 헤더 없이 production URL이 새 브라우저 프로필에서 열리고 홈·Tutorial·Lab·Daily·Archive·Sprint·Settings·About route가 404 없이 동작한다. E4. (INV-014)
- [ ] **DOD-04 — 핵심 E2E**: first-run → Tutorial → Lab, Daily solve/reload/share, Archive, Sprint expiry, Settings/i18n, offline restart가 production 또는 동일 artifact에서 통과한다.
- [ ] **DOD-05 — 브라우저 matrix**: desktop Chromium·Firefox·WebKit 상당에서 핵심 E2E green, 모바일 Android Chrome·iOS Safari 상당에서 E1 수동 핵심 플로우 green.
- [ ] **DOD-06 — 반응형·테마**: 360×640·390×844·768×1024·1024×768·1440×900, dark/light/high-contrast/reduced-motion에서 horizontal overflow=0, 주요 visual diff가 승인됨.
- [ ] **DOD-07 — 접근성**: 자동 axe serious/critical=0, 키보드 전체 플로우, 수동 스크린리더·200% zoom·색각 점검이 QA 표에서 통과한다. E4. (INV-015)
- [ ] **DOD-08 — PWA·오프라인**: production scope·manifest·installability·precache·offline 핵심 플레이·update prompt가 실제 URL에서 통과한다. (INV-014)
- [ ] **DOD-09 — 저장 안전성**: production artifact에서 valid/corrupt/future-version/reload/update fixture가 기록 손실 없이 명세대로 처리된다. (INV-011)
- [ ] **DOD-10 — 공유 스포일러**: production text·URL·두 PNG·capability fallback에서 금지 정보 0건, 실제 SNS/공유 시트 1회 이상 검증. (INV-013)
- [ ] **DOD-11 — 보안·개인정보**: secret scan, dependency audit, CSP, network request, cookie/storage key inventory가 통과하고 외부 런타임 요청·개인 식별 데이터 0건이다. (INV-001, INV-017)
- [ ] **DOD-12 — 자산·라이선스**: source asset inventory와 `docs/ASSET_LICENSES.md` diff가 일치하고 미등록·불명확 자산 0건이다. (INV-019)
- [ ] **DOD-13 — 성능 기록**: initial JS/CSS, cache size, LCP/INP/CLS, input feedback, generation, rank, share card를 명시 환경에서 측정해 QA_REPORT에 기록한다. 상한 초과는 P1/P2 영향 분석과 사용자 승인이 필요하다.
- [ ] **DOD-14 — 결함 0**: 활성 P0·P1과 불변식 위반이 0건이다. P2 유예는 `HARNESS.md` 규칙과 사용자 승인을 가진다. (INV-020)
- [ ] **DOD-15 — 문서·릴리스 후보**: QA_REPORT, release checklist, release notes, commit SHA, deployed URL이 일치하고 `PROGRESS.md`가 M11 진입 대기로 갱신된다.

## 8. 검증 명령

```bash
npm ci
npm run verify
npm run test:e2e
npm run test:a11y
npm run test:visual
npm run audit:network
npm run audit:assets
npm audit --audit-level=high
npm run build
npm run smoke:production -- --url "$PRODUCTION_URL"
```

CI artifact에는 최소 다음을 보존한다.

```text
test summary, coverage, level validation, daily audit,
Playwright HTML report, axe report, visual diff,
bundle report, Lighthouse report, asset/network audit
```

## 9. 수동 검증

| 환경 | 핵심 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| Android Chrome 실기기 | first-run→Daily→share→install→offline | 전부 완료 | 영상/체크표 |
| iOS Safari 상당 | Lab→share fallback→reload | 전부 완료 | 영상/체크표 |
| Desktop keyboard + SR | 홈부터 결과 공유 | 포인터 없이 완료·상태 이해 | 체크표 |
| Slow 4G/중급 모바일 profile | 첫 로드·입력·share PNG | QA 예산 기록 | Lighthouse/trace |
| 새 프로필 | 직접 공개 URL | 캐시·기존 storage 없이 성공 | smoke 로그 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- Pages 배포 artifact와 source commit을 1:1 매핑한다.
- P0 production 회귀 시 마지막 green artifact로 rollback하고 service worker cache strategy를 함께 확인한다.
- release candidate 수정은 `rc.N` 태그로 누적하며 기존 태그를 덮어쓰지 않는다.

## 12. 리스크·미지수

- 실제 iOS 기기 확보 여부.
- GitHub Pages cache·service worker가 오래된 artifact를 제공할 가능성.
- 브라우저 업데이트 직후 Web Share/PWA 차이.
- 일정 압박으로 P2를 P3로 과소평가할 위험.

## 13. STOP 트리거

- 활성 P0/P1 또는 불변식 위반 1건 이상.
- 공개 URL·PWA scope·Daily 결정성이 로컬과 다름.
- 배포 artifact와 commit을 식별할 수 없음.
- 실제 기기 없이는 핵심 P1 여부를 판정할 수 없음.
- 8월 23일 이후 대형 의존성·아키텍처 변경이 필요함.

## 14. 다음 phase 인계

- 승인된 RC tag·commit·public URL
- QA_REPORT와 남은 P2/P3
- 최종 썸네일·영상에 사용할 안정 화면
- M11에서 다시 실행할 최소 final smoke 목록
