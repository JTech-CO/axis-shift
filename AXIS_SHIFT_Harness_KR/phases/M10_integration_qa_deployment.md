# M10 — Integration QA, Performance & Production Release Candidate ★

- **상태**: 미시작
- **담당 범위**: 전체 회귀, 브라우저·기기·접근성·성능, production 배포, rollback QA, RC 승인
- **최종 갱신**: 2026-08-30

## 1. 맥락과 목표

개별 phase가 통과한 기능을 하나의 production release candidate로 검증한다. 로컬 성공이나 행사 일정의 예외가 아니라 fixed SHA의 CI, 실제 production URL, 새 브라우저 프로필, 오프라인 설치 환경과 rollback 절차에서 모든 핵심 흐름이 동작하고 P0·P1이 0건인 RC를 만든다.

최종 release version, 출시일, 도메인과 공개 라이선스는 프로젝트 오너 결정 전까지 `TBD`다. 이 phase는 값을 임의로 확정하지 않으며, 선택된 production 후보 URL과 immutable commit·artifact를 기준으로 QA한다. M11에서 최종 도메인이 바뀌면 영향을 받는 production smoke를 다시 실행한다.

## 2. 범위

### 포함

- 전체 CI pipeline과 protected main 기준
- unit/component/content/generator/E2E/a11y/visual 회귀
- Chromium·Firefox·WebKit, 모바일·데스크톱 matrix
- 360px, 768px, 1024px, 1440px, 200% zoom, 운영체제 Forced Colors
- Lighthouse·bundle·runtime performance 기록
- GitHub Pages production workflow와 post-deploy smoke
- 실제 production URL의 manifest·service worker·base path·direct hash route
- 실제 production workflow를 사용한 rollback·복구 리허설
- CSP, dependency, license, secret, network audit
- 결함 triage와 `docs/QA_REPORT.md`

### 제외

- 새 게임 모드·규칙·대형 리팩터링
- 마케팅 캠페인·홍보 자산 제작
- 백엔드·계정·분석·광고·수익화 추가
- 앱 스토어 패키징
- P2/P3의 무제한 유예

## 3. 진입조건 (DoR)

- [ ] M09 DoD 통과.
- [ ] 프로젝트 오너가 RC 범위 동결을 승인했고 이후 신규 기능이 없음.
- [ ] GitHub Pages repository·permissions·base path와 실제 production 후보 URL이 준비됨.
- [ ] fixed SHA와 배포 artifact를 1:1로 식별하는 manifest·hash 절차가 준비됨.
- [ ] 마지막 green artifact와 production rollback·재배포 절차가 준비됨.
- [ ] 실제 Android와 iOS Safari 상당 환경 또는 승인된 대체 검증 장치가 준비됨.
- [ ] ADR-0012에서 이관된 Android Chrome 실기기·실제 NVDA/VoiceOver 상당·200% zoom·색각 시뮬레이션 4종의 실행 환경과 증거 절차가 준비됨.
- [ ] `docs/QA_REPORT.md`, `docs/RELEASE_CHECKLIST.md`의 실행 섹션이 준비됨.
- [ ] 모든 활성 INV와 결함 심각도 기준을 확인함.

## 4. 입력·산출물 계약

### 입력

- `main`의 fixed-SHA RC 후보 commit
- 전체 자동 테스트와 승인된 visual baseline
- production build 설정, Pages workflow와 후보 URL
- 마지막 green production artifact와 rollback 절차
- M00·M06 플레이테스트 결과

### 산출물

- fixed SHA에 대응하는 production release candidate commit·artifact(버전·태그는 오너 결정 전 `TBD`)
- 실제 production URL과 배포 commit·artifact hash manifest
- CI run·post-deploy smoke 증거
- rollback→smoke→RC 복구 리허설 증거
- 완성된 `docs/QA_REPORT.md`
- 결함 목록과 P0/P1=0 증거
- bundle/Lighthouse/runtime performance 리포트
- M11에 인계할 승인 기록과 남은 P2/P3 목록

## 5. 작업 순서

1. 전체 요구사항 추적표의 미연결 항목을 0으로 만든다.
2. CI 명령 순서, fixed-SHA 식별과 artifact 보존을 완성한다.
3. 깨끗한 환경에서 full regression을 실행한다.
4. production base로 build·deploy하고 실제 URL smoke를 실행한다.
5. 브라우저·viewport·dark/light/system/reduced-motion/forced-colors·locale·input matrix를 실행한다.
6. 오프라인·PWA update·storage corruption·timezone·sharing capability를 실제 URL에서 재검증한다.
7. performance·bundle·Lighthouse를 측정하고 수치와 환경을 함께 기록한다.
8. 마지막 green artifact로 rollback하고 실제 URL·service worker·cache를 smoke한 뒤 같은 RC를 재배포해 복구를 확인한다.
9. 발견 결함을 P0~P3로 triage하고 P0/P1을 전부 수정·재검증한다.
10. QA_REPORT, release checklist와 RC manifest를 사람이 승인한다.

## 6. 참조

- **불변식**: INV-001~020 전부
- **ADR**: 채택 ADR 전부, 특히 ADR-0012·ADR-0013
- **기술 백서**: §2.4, §7~9, §11
- **디자인 백서**: 반응형·상태·접근성·QA matrix
- **문서**: `docs/QA_REPORT.md`, `docs/RELEASE_CHECKLIST.md`, `docs/ENVIRONMENT.md`, `docs/REQUIREMENTS_TRACEABILITY.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — Full CI**: fixed SHA에서 install → lint → format → typecheck → tests → level validate → daily audit → build → E2E → a11y가 전부 green이고 CI URL을 기록한다. E4. (INV-018)
- [ ] **DOD-02 — 수학·콘텐츠 회귀**: M02 3×3 전수, M03 54개 validator·3,650일 audit 결과가 기준 hash와 일치한다. E3. (INV-005~009)
- [ ] **DOD-03 — 실제 production URL**: 로그인·특수 헤더 없이 실제 URL이 외부 네트워크의 새 브라우저 프로필에서 열리고 Home·Tutorial·Lab·Daily·Archive·Sprint·Settings·About route가 404 없이 동작한다. E4. (INV-014)
- [ ] **DOD-04 — 핵심 E2E**: first-run → Tutorial → Lab, Daily solve/reload/share, Archive, Sprint expiry, Settings/i18n, offline restart가 production 또는 동일 hash artifact에서 통과한다.
- [ ] **DOD-05 — 브라우저 matrix**: desktop Chromium·Firefox·WebKit 상당에서 핵심 E2E green, 모바일 Android Chrome·iOS Safari 상당에서 E1 수동 핵심 플로우 green.
- [ ] **DOD-06 — 반응형·테마**: 360×640·390×844·768×1024·1024×768·1440×900에서 dark/light/system/reduced-motion/forced-colors matrix의 horizontal overflow=0이고 주요 visual diff가 승인된다. 커스텀 high-contrast 테마는 matrix에 포함하지 않는다.
- [ ] **DOD-07 — 접근성**: 자동 axe serious/critical=0, 키보드 전체 플로우, 수동 스크린리더·200% zoom·색각·운영체제 Forced Colors 점검이 QA 표에서 통과하고 색 이외 상태 표식이 유지된다. ADR-0012 이관 4종은 실제 E1 4/4가 필요하며 자동 증거로 대체할 수 없다. E4. (INV-015)
- [ ] **DOD-08 — PWA·오프라인**: production scope·manifest·installability·precache·offline 핵심 플레이·update prompt가 실제 URL에서 통과한다. (INV-014)
- [ ] **DOD-09 — 저장 안전성**: production artifact에서 valid/corrupt/future-version/reload/update fixture가 기록 손실 없이 명세대로 처리되고, Theme 기본 `dark`·쓰기 allowlist `dark | light | system`·legacy v1 `high-contrast → dark` 읽기 정규화·UI `reduced → on` 저장 매핑이 통과한다. (INV-011)
- [ ] **DOD-10 — 공유 스포일러**: production text·URL·두 PNG·capability fallback에서 금지 정보 0건, 실제 SNS/공유 시트 1회 이상 검증. (INV-013)
- [ ] **DOD-11 — 보안·개인정보**: secret scan, dependency audit, CSP, network request, cookie/storage key inventory가 통과하고 외부 런타임 요청·개인 식별 데이터 0건이다. (INV-001, INV-017)
- [ ] **DOD-12 — 자산·라이선스**: source asset inventory와 `docs/ASSET_LICENSES.md` diff가 일치하고 미등록·불명확 자산 0건이다. 최종 공개 라이선스 값은 M11 DoR 전 오너가 결정한다. (INV-019)
- [ ] **DOD-13 — 성능 기록**: initial JS/CSS, cache size, LCP/INP/CLS, input feedback, generation, rank, share card를 명시 환경에서 측정해 QA_REPORT에 기록한다. 상한 초과는 P1/P2 영향 분석과 사용자 승인이 필요하다.
- [ ] **DOD-14 — 결함 0**: 활성 P0·P1과 불변식 위반이 0건이다. P2 유예는 `HARNESS.md` 규칙과 사용자 승인을 가진다. (INV-020)
- [ ] **DOD-15 — Rollback QA**: 실제 production workflow에서 마지막 green artifact rollback → production smoke → 동일 RC 재배포를 수행하고 URL, artifact hash, service worker/cache 상태와 소요 시간을 기록한다. 실패 시 RC를 승인하지 않는다. E4. (INV-014, INV-020)
- [ ] **DOD-16 — 문서·RC 승인**: QA_REPORT, release checklist, RC manifest, commit SHA, artifact hash와 실제 URL이 일치하고 사람이 승인했으며 `PROGRESS.md`가 M11 진입 대기로 갱신된다.

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
bundle report, Lighthouse report, asset/network audit,
deployment manifest, rollback and recovery smoke logs
```

## 9. 수동 검증

| 환경 | 핵심 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| Android Chrome 실기기 | first-run→Daily→share→install→offline | 전부 완료 | 영상/체크표 |
| iOS Safari 상당 | Lab→share fallback→reload | 전부 완료 | 영상/체크표 |
| Desktop keyboard + SR | 홈부터 결과 공유 | 포인터 없이 완료·상태 이해 | 체크표 |
| 브라우저 200% zoom | 게임·설정·결과 핵심 흐름 | CTA·board 접근 가능, overflow 없음 | 캡처/체크표 |
| 색각 시뮬레이션 | selected/preview/on/off 비교 | 색 이외 표식으로 상태 구분 | 캡처/체크표 |
| Forced Colors | Theme·High Contrast Cells·게임 상태 | 커스텀 테마 없이 OS 색과 비색상 표식 유지 | 캡처/체크표 |
| Slow 4G/중급 모바일 profile | 첫 로드·입력·share PNG | QA 예산 기록 | Lighthouse/trace |
| 외부 네트워크·새 프로필 | 실제 production URL→주요 route→한 판 | 로그인·기존 storage 없이 성공 | smoke 로그 |
| production rollback window | last-green 배포→smoke→RC 재배포→smoke | artifact·URL·cache가 각 단계와 일치 | 배포 로그/체크표 |

ADR-0012 이관 상태는 Android=`NOT RUN`, screen reader=`NOT RUN`, 200% zoom=`NOT RUN`, color vision=`NOT RUN`이다. 네 항목 중 하나라도 실제 증거가 없으면 M10과 M11 진입을 승인하지 않는다.

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- production 배포 artifact, source commit, manifest와 hash를 1:1 매핑한다.
- P0 production 회귀 시 마지막 green artifact로 즉시 rollback하고 service worker cache·manifest·핵심 route를 실제 URL에서 확인한다.
- rollback 후 장애 영향·시각·원인·복구 시각을 QA_REPORT에 기록하고, 수정 RC는 새 immutable commit·artifact로 검증한다.
- release identifier나 tag가 도입되면 기존 identifier를 이동·덮어쓰지 않는다. identifier 형식은 프로젝트 오너 결정 전 `TBD`다.

## 12. 리스크·미지수

- 실제 iOS 기기 확보 여부.
- GitHub Pages cache·service worker가 오래된 artifact를 제공할 가능성.
- 브라우저 업데이트 직후 Web Share/PWA 차이.
- 최종 도메인이 RC QA 뒤 변경되어 production smoke를 반복해야 할 가능성.
- 출시 버전·일정·도메인·라이선스 결정이 M11 진입 전 지연될 가능성.
- P2를 P3로 과소평가하거나 rollback 증거 없이 RC를 승인할 위험.

## 13. STOP 트리거

- 활성 P0/P1 또는 불변식 위반 1건 이상.
- 실제 production URL·PWA scope·Daily 결정성이 로컬과 다름.
- 배포 artifact와 commit을 식별할 수 없음.
- rollback 또는 RC 재배포 뒤 production URL이 last-green/RC manifest와 일치하지 않음.
- 실제 기기 없이는 핵심 P1 여부를 판정할 수 없음.
- 대형 의존성·아키텍처·공개 규칙 변경이 필요함.

## 14. 다음 phase 인계

- 승인된 fixed-SHA RC commit·artifact·manifest·실제 production URL
- QA_REPORT와 승인된 남은 P2/P3
- post-deploy 및 rollback→recovery 로그
- M11에서 다시 실행할 final smoke 목록
- 오너가 결정해야 할 release version·출시일·최종 도메인·공개 라이선스 `TBD` 목록
- H00은 역사 기록으로만 유지하며, 기존 호환 경로의 유지·폐기는 ADR-0013과 별도 오너 승인에 따른다.
