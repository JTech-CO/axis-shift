# M01 — Production Scaffolding & Boundaries

- **상태**: 완료 — ADR-0008 제한 체크포인트, DOD-01~09·CI·Pages artifact 공개 smoke 통과
- **담당 범위**: 저장소 기반, 도구 체인, 라우팅, CI, 모듈 경계
- **최종 갱신**: 2026-08-14

## 1. 맥락과 목표

M02 이후 모든 정확성·UI·배포 작업이 같은 명령과 경계를 사용하도록 생산 기반을 만든다. “프로젝트가 실행된다”뿐 아니라 잘못된 import, 타입 오류, 포맷 표류, GitHub Pages base path 문제가 자동으로 차단되는 상태가 목표다.

## 2. 범위

### 포함

- React + TypeScript + Vite 애플리케이션
- Node.js 24.x LTS와 npm lockfile 고정
- TypeScript strict, ESLint, Prettier, Vitest, Testing Library, Playwright
- Hash Router와 GitHub Pages base path 환경
- 기술 백서 기준 디렉터리 골격
- npm script 계약과 GitHub Actions CI 초안
- import allow/deny와 순환 의존성 차단
- 기본 Error Boundary, AppShell, 404/복구 라우트 골격

### 제외

- 실제 퍼즐 수학 구현
- PWA service worker와 오프라인 캐시
- 완성된 디자인 시스템·게임 화면
- M01 범위를 넘는 제품·릴리스 승인

## 3. 진입조건 (DoR)

- [ ] M00 DoD 전부 통과.
- [x] 저장소 이름(`JTech-CO/axis-shift`), 공개 저장소, npm 사용이 결정됨.
- [x] `docs/FILE_TREE.md`와 `docs/ENVIRONMENT.md` 초안 확인.
- [x] 최종 라이선스 결정 전 `private: true`·`UNLICENSED` 임시 정책이 명시됨.
- [x] INV-001~003, INV-014, INV-017~019 확인.

M00 DoD는 미완료 상태다. 프로젝트 오너가 2026-08-14 ADR-0008 범위의 M01 제한 체크포인트 선행 착수를 직접 승인했으므로 작업을 시작한다. 이 예외는 첫 항목을 체크하거나 M00을 통과 처리하지 않으며, M01 범위를 도구 체인·경계·라우팅·CI·최소 AppShell로 제한한다.

## 4. 입력·산출물 계약

### 입력

- M00 규칙 fixture와 공개 프로토타입 E2. formal Scope Lock은 미완료이며 ADR-0008 예외로 입력에서 제외
- `docs/FILE_TREE.md` import 경계 표
- `docs/ENVIRONMENT.md` 런타임·명령 계약
- ADR-0004 정적 PWA·Hash Router 결정

### 산출물

- `package.json`, `package-lock.json`, `.nvmrc`
- `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`
- `eslint.config.js`, Prettier 설정, `.editorconfig`, `.gitignore`
- `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`
- `playwright.pages.config.ts`, `scripts/build-pages.ts`, `scripts/start-pages-server.ts`
- `src/`·`tests/`·`scripts/` 기본 트리
- `AGENTS.md`의 npm script가 실제 명령에 연결된 상태
- import 경계 검사와 최소 테스트

## 5. 작업 순서

1. Node 24.x LTS·npm 환경과 lockfile을 고정한다.
2. Vite React TypeScript 앱을 만들고 strict 옵션을 적용한다.
3. 기술 백서의 폴더 경계를 만들고 public entrypoint를 최소화한다.
4. Hash Router, base path, 오류 라우트와 AppShell 골격을 연결한다.
5. lint·format·typecheck·unit·build 명령을 만든다.
6. `no-restricted-imports` 또는 동등 규칙으로 경계를 코드화한다.
7. 의도적 위반 fixture가 실제 CI에서 실패하는지 확인한 뒤 제거한다.
8. CI를 install → lint → format → typecheck → test → build 순서로 연결한다.

## 6. 참조

- **불변식**: INV-001, INV-002, INV-003, INV-014, INV-017, INV-018, INV-019
- **ADR**: ADR-0001, ADR-0004, ADR-0007, ADR-0008, ADR-0009
- **기술 백서**: §3, §4.1, §6, §7.4, §8.5, §9
- **문서**: `docs/FILE_TREE.md`, `docs/ENVIRONMENT.md`

## 7. DoD — 완료 게이트

- [x] **DOD-01 — 재현 설치**: 깨끗한 checkout과 Node 24.x에서 `npm ci`가 lockfile 변경 없이 exit 0이다. E2.
- [x] **DOD-02 — 기본 품질 명령**: `npm run lint`, `format:check`, `typecheck`, `test`, `build`가 모두 exit 0이다. E2.
- [x] **DOD-03 — Script 계약**: `AGENTS.md`에 선언된 모든 script 이름이 `package.json`에 존재한다. 아직 후속 phase 구현 전인 script는 명시적 placeholder가 아니라 안전한 “해당 검사 대상 0건” 검증기를 가져야 하며, 무조건 exit 0 스텁은 금지한다. (INV-018)
- [x] **DOD-04 — 경계 차단**: `features`가 다른 feature 내부 파일을 import하거나 `domain`이 React·DOM·services를 import하는 의도적 샘플에서 lint가 실패한다. 샘플 제거 후 lint는 통과한다. E3. (INV-003)
- [x] **DOD-05 — 순환 의존성**: 현재 `src/`의 순환 import가 0건이고 CI에서 차단된다. E2. (INV-003)
- [x] **DOD-06 — GitHub Pages 경로**: 로컬 production preview와 배포 artifact에서 설정된 non-root `BASE_URL`과 Hash Router로 `/#/`, `/#/daily`, 알 수 없는 route가 404 없이 렌더링되며, 공개 루트의 M00 진입과 stage/seed query가 보존된다. E2. (INV-014)
- [x] **DOD-07 — 시크릿·산출물 제외**: `.env*` 정책, `dist/`, coverage, Playwright 결과, 녹화 파일이 `.gitignore`에 반영되고 시크릿 스캔이 통과한다. (INV-001, INV-002)
- [x] **DOD-08 — CI**: pull request 이벤트에서 install부터 build까지 동일 명령을 실행하도록 workflow가 유효하다.
- [x] **DOD-09 — 문서 정합성**: 실제 트리·Node 버전·명령이 `docs/FILE_TREE.md`, `docs/ENVIRONMENT.md`, `PROGRESS.md`와 일치한다.

## 8. 검증 명령

```bash
node --version
npm --version
npm ci
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run build
npm run build:pages
npm run verify
npm run check:boundaries
npm run audit:secrets
npm run test:a11y
npm run test:e2e
npm run test:pages
```

경계 fixture는 자동화된 test script가 생성·검사·정리하도록 구현해 작업 트리에 잔여 파일을 남기지 않는다.

## 9. 수동 검증

| 환경 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| production preview | `/axis-shift/` base로 빌드 후 3개 hash route를 3개 엔진에서 접속 | 404 없이 AppShell·복구 화면, 셸 타깃 44px 이상 | Playwright 12/12 통과 |
| Pages artifact | 공개 루트·stage/seed query·M00 anchor·직접 경로와 M01 hash route를 3개 엔진에서 접속 | M00 플레이 보존, M01 route·JS·CSS HTTP 200, console/page 오류 0 | Playwright 24/24 통과 |
| Windows 개발환경 | final commit detached clean checkout → Node 24 `npm ci` → `npm run verify` | lockfile·tracked 변경과 경로/쉘 의존 오류 없음 | commit `bf3d1fe`, install·verify 통과 |

## 10. 증거

환경: Windows, Node v24.19.0, npm 11.6.2

```text
DOD-01 final clean checkout:
  commit=bf3d1fe1fe37f101718d21df9ca8c020e97fd5b1
  detached worktree=C:/tmp/axis-shift-m01-clean-bf3d1fe
  node=v24.19.0 npm=11.6.2
  npm ci exit=0, added=261, vulnerabilities=0
  package-lock SHA256 before/after:
  3D8ECB7F611A72BC815DE3A2F1A0189546A1B607E558E508C1A3E47DAD50915B (동일)
  git status after install/verify/tests: tracked changes=0
  npm run verify exit=0
  npm run test:a11y exit=0
  npm run test:e2e -- --project=chromium: 4/4
  npm run test:pages -- --project=chromium: 8/8

npm run verify exit=0
  scriptContract required=14 missing=0
  lint / format:check / typecheck exit=0
  Vitest files=2 tests=5 failures=0
  boundaries files=37 edges=23 violations=0 cycles=0
  lintFixtures=4 lintAssertions=7 cycleFixtures=1
  levelValidation files=0 levels=0 rankChecks=0 solutionChecks=0
  validatorSelfChecks=2 failures=0
  dailyAudit sourceFiles=1 implementations=0 dates=0 puzzleChecks=0
  detectorSelfChecks=2 failures=0
  secretScan files=143 findings=0
  build modules=41 JS=233.88kB(gzip 74.94kB) CSS=2.73kB(gzip 1.15kB)
  pagesArtifact files=14 bytes=327103 prototypeFiles=10

npm run test:a11y exit=0
  files=12 interactiveTargets=6 staticNames=true computedSizeChecks=0 failures=0

npm run test:e2e exit=0
  Chromium + Firefox + WebKit, tests=12 passed
  routes=/axis-shift/#/, /axis-shift/#/daily, /axis-shift/#/unknown
  computed interaction target size >=44px

npm run test:pages exit=0
  Chromium + Firefox + WebKit, tests=24 passed
  M00=root, stage/seed query, direct prototype path
  M01=/#/, /#/daily, /#/unknown; JS/CSS HTTP 200; console/page errors=0

git check-ignore:
  .env.local, dist/, coverage/, test-results/*.webm, playwright-report/ 모두 제외

CI:
  pull_request + main push, setup-node .nvmrc, npm ci, 동일 품질 명령,
  non-root build, Chromium core E2E까지 연결
  Pages는 artifact build + a11y + Chromium core/artifact smoke + hidden-file 포함 upload/deploy로 분리
  CI run=31733232235 conclusion=success duration=51s
  Pages run=31733232206 conclusion=success build=60s deploy=11s

remote Pages:
  deployed commit=93a4359b5cbe1b45f8ed1fe0ee4a984003e8191c
  build_type=workflow status=built
  legacy backup=backup/pages-legacy-20260814
  legacy backup SHA=576e6dbac1938652ba892539c91a1fa07f4d2cf7
  public Chromium Pages smoke=8/8
  public M00 browserAssertions=573 viewport=320/360/960 consoleErrors=0
```

실패 후 수정 기록:

- 최초 3엔진 실행은 Firefox·WebKit 바이너리 미설치로 Chromium 3건만 통과했다. 두 엔진을 설치한 뒤 당시 route 9건은 통과했다.
- 44px E2E 추가 후 Firefox가 `43.99993896484375px` 반올림과 8-worker teardown timeout을 드러냈다. CSS 최소값을 45px로 올리고 로컬 worker를 3으로 제한한 뒤 12/12 통과했다.
- 최초 commit 기준 Windows clean checkout은 `npm ci`와 lockfile 불변을 통과했지만 CRLF checkout으로 `format:check`가 65개 파일에서 실패했다. 루트 `.gitattributes`에 `text=auto eol=lf`를 추가한 final commit의 새 clean checkout에서 전체 verify와 Pages 3엔진 24/24가 통과했다.

## 11. 롤백 계획

- 스캐폴딩은 설정 영역별 커밋으로 분리한다.
- 도구 변경이 필요하면 lockfile과 설정을 함께 되돌린다.
- 경계 완화로 문제를 숨기지 않고 책임 위치를 수정한다.

## 12. 리스크·미지수

- 최신 ESLint·Vite 플러그인과 Node 24 호환성.
- GitHub Pages base `/axis-shift/`와 M00 호환 artifact는 로컬 3엔진과 실제 공개 URL smoke를 통과했다.
- Pages는 `build_type=workflow`로 전환됐고 이전 legacy SHA는 `backup/pages-legacy-20260814`에 보존됐다. 이후 배포에서도 공개 루트 M00·M01 hash route smoke를 유지한다.
- 불필요한 의존성을 초기에 추가하면 PWA 번들과 유지 비용이 증가한다.

## 13. STOP 트리거

- Node 24와 필수 도구의 호환 문제로 3회 이상 설치 실패.
- 파일 경계를 지키려면 기술 백서 구조를 변경해야 함.
- root path에서는 되지만 실제 repository base에서 라우팅이 깨짐.
- 라이선스 불명확한 starter asset이 생성됨.

## 14. 다음 phase 인계

- 확정된 script 이름과 CI 명령
- import 경계의 자동 검증 방식
- `src/domain/`에서 사용할 순수 TypeScript 테스트 환경
- production base path와 라우팅 fixture
