# AXIS//SHIFT 개발·검증·배포 환경 계약

**버전**: 1.2.0
**상태**: M01~M05 완료; M05 원격 CI·Pages·공개 제출 URL smoke 통과, 수동 E1 0/4는 M10 release-blocking gate로 이관
**최종 갱신**: 2026-08-29

## 1. 기준 환경

| 항목 | 기준 |
|---|---|
| Node.js | 24.x LTS, `.nvmrc`에 메이저 고정 |
| Package manager | npm, `package-lock.json` 필수 |
| Language | TypeScript strict |
| Frontend | React + Vite |
| Unit/Component | Vitest + Testing Library |
| Browser E2E | Playwright Chromium·Firefox·WebKit |
| Formatting | Prettier |
| Lint | ESLint flat config |
| Primary hosting | GitHub Pages |
| Router | Hash Router |
| Data | LocalStorage only |

Node 24 메이저 안의 정확한 patch는 CI와 개발환경에서 같은 lock 전략을 사용한다. Node major 변경은 도구 호환성·CI·artifact hash에 영향을 주므로 ADR 또는 environment 변경 기록이 필요하다.

### M01 검증 기준선

| 항목 | 실제 기준 |
|---|---|
| Node.js | v24.19.0 |
| npm | 11.6.2 |
| React / React DOM | 19.2.8 |
| Vite | 8.2.1 |
| TypeScript | 6.0.3 |
| Vitest / Playwright | 4.1.10 / 1.62.1 |
| Pages base | `/axis-shift/` |

2026-08-14 Windows 호스트의 시스템 기본 Node는 v25.2.0이어서 공식 M01 증거 명령은 Node 24 실행기로 분리해 수행했다. 제품 계약은 시스템 Node 25가 아니라 `.nvmrc`와 `package.json#engines`의 Node 24다.

### M03 결정성 검증 기준선

| 항목 | 실제 기준 |
|---|---|
| Daily generator | `v1`, seed domain `axis-shift|daily`, max attempts 512 |
| PRNG | NFKC + SHA-256 first 4 bytes big-endian + Mulberry32/rejection sampling |
| PRNG golden | 20 seeds × first 100 `uint32` |
| Browser parity | Chromium·Firefox·WebKit, tests 9/9 |
| Process/timezone parity | UTC·Asia/Seoul·America/Los_Angeles 시간대 프로세스 3개 × 프로세스별 10회 반복, mismatch 0 |
| Daily audit rehearsal | unchanged working tree, 3,650 dates from `2026-01-01`, 2 runs, failures 0, max attempt 107 |
| Static content | Tutorial 6 + Lab 48, fallback 14, DOD-04 owner APPROVED |

M03은 candidate `1c313bd29e1d24c483749af90a8734542988be5d`의 clean detached worktree와 Node v24.19.0/npm 11.6.2에서 `npm ci` 취약점 0, browser parity 9/9, verify 10/10을 통과했다. 서로 다른 출력 디렉터리의 3,650일 감사 2회는 output hash `997df1b0…10b0`와 report/JSON SHA `b1102aee…6d49`가 일치했고 실행 전후 worktree status는 0이었다. 일반 level validator는 승인 metadata·approval fingerprint·machine scaffold가 어긋나면 계속 fail-closed한다.

### M05 shared UI 검증 기준선

| 항목 | 실제 기준 |
|---|---|
| Phase/evidence | `COMPLETE`; DOD-01~13 PASS, 오너 baseline 9/9 승인, 수동 E1 0/4 `DEFERRED_TO_M10` |
| Focused component/fixture | 7파일 / 33테스트 PASS |
| Global unit/component | 30파일 / 180테스트 PASS |
| Design token audit | files 16, color/spacing/radius/duration hardcode 0/0/0/0 |
| Token 예외 주석 | 13개: 계산식 2, 투명도 2, breakpoint 9 |
| Static accessibility | files 36, interactiveTargets 8, failures 0 |
| axe UI fixtures | 18/18 PASS: 8 states + long copy + system 3 + light 3 + reduced-motion 3; serious 0, critical 0, external requests 0 |
| Local visual strict | update/no-update 18/18 PASS, full-fixture baseline 9, viewport 5, dark/light/system, `maxDiffPixels=0`, threshold 0, diff 0; Codex 대표 3/3·오너 9/9 PASS |
| Remote CI visual | 구조·mobile/desktop snapshot 15 PASS; GitHub Windows system-font metric 비이식성 때문에 tablet snapshot 3개 명시적 SKIP |
| Keyboard core | Chromium·Firefox·WebKit 9/9 PASS |
| Module boundaries | files 83, edges 150, violations 0, cycles 0 |
| Full verify | script contract required 22, missing 0; 12단계 PASS |
| Production build | 46 modules; CSS 10.49 kB (gzip 3.03), JS 234.56 kB (gzip 75.20) |
| Local Pages artifact | files 14, bytes 353631, prototypeFiles 10; 3엔진 30/30; prototype browser 908단언 |
| Runtime/deployment | implementation `f039bb8088d35df91ef393a9b226f22481981ca3`; final runtime/Pages head `1608c26cf4e8d3ca6be2c3765b20fb00bc7b06b9`; CI `33207406441`·Pages `33207406497` success |
| Public validation | Pages 3엔진 30/30; `https://jtech-co.github.io/axis-shift/prototypes/rule-proof/` 908단언, external requests 0, console errors 0 |
| 정적 품질 | lint·format·typecheck PASS |

token 예외 13개는 CSS custom property를 사용할 수 없는 media query 문법 경계와 명시적 주석으로만 허용한다. 세부 분류는 계산식 2개, 투명도 2개, breakpoint 9개다. [ADR-0011](../decisions/0011-appearance-cycle-controls.md)은 Theme 기본 dark·dark→light→system 순환, Motion 기본 system·system↔reduced를 고정하고 custom high-contrast option/token/baseline을 제거한다. OS forced-colors와 `highContrastCells`, legacy v1 `high-contrast` 읽기의 dark 정규화는 유지한다.

자동 증거와 수동 E1을 분리한다. ADR-0011 변경분을 포함한 자동 E2/E3, 오너 baseline 9/9, 고정 SHA 원격 CI·Pages와 실제 공개 제출 URL smoke를 확보해 M05를 완료했다. 실제 Android Chrome, NVDA/VoiceOver 동등 스크린리더, 200% zoom, 색각 검토는 0/4 `NOT RUN`이며 ADR-0012로 M10에 이관했다. 이는 PASS나 면제가 아니다.

strict 0-pixel visual 재실행에서는 transparent backdrop blur가 rounded button corner 한 color channel을 비결정적으로 바꿔 mobile 2/18, 이어 tablet 3/18 실패했다. toolbar를 opaque canvas token background로 고정하고 baseline을 재생성한 뒤 동일 no-update가 18/18, `maxDiffPixels=0`, threshold 0, diff 0으로 통과했다.
## 2. 지원 개발 OS

- Windows 10/11 + PowerShell 7 또는 Git Bash
- macOS 현재 지원 버전
- Ubuntu LTS 또는 GitHub Actions `ubuntu-latest`

shell-specific 문법을 npm script에 직접 넣지 않는다. 복잡한 검사는 TypeScript/Node script로 구현한다. `.gitattributes`의 `text=auto eol=lf`로 Windows clean checkout도 CI와 같은 LF를 사용한다.

## 3. 최초 설치

### nvm 사용 환경

```bash
nvm install 24
nvm use 24
node --version
npm --version
npm ci
npx playwright install --with-deps
```

### Windows에서 nvm 미사용

Node 24.x LTS를 설치한 뒤 다음을 확인한다.

```powershell
node --version
npm --version
npm ci
npx playwright install
```

`npm install`은 의존성 변경 작업에서만 사용한다. 일반 재현 설치와 CI는 `npm ci`를 사용한다.

## 4. 로컬 명령

```bash
npm run dev                 # Vite dev server
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run test:coverage
npm run test:coverage:domain
npm run test:coverage:m04
npm run test:math:exhaustive
npm run test:storage:migrations
npm run generate:level-candidates
npm run validate:levels
npm run audit:daily
npm run audit:secrets
npm run audit:a11y-static
npm run audit:design-tokens
npm run check:boundaries
npm run build
npm run build:pages
npm run preview
npm run test:e2e
npm run test:pages
npm run test:a11y
npm run test:visual
npm run verify
```

M05 fixture 전용 canonical 명령은 다음과 같다.

```bash
npm run test -- src/components src/test/ui-fixture-app.tsx
npm run test:a11y -- --project=ui-fixtures
npm run test:visual -- --project=ui-fixtures
npm run test:e2e -- tests/e2e/keyboard-core.spec.ts
```

M03 종료 재검증에서 기본 `npm run generate:level-candidates -- --seed axis-shift-curation-v1`는 full manifest·순서 있는 catalog·human 필드를 정규화한 machine scaffold의 approval fingerprint exact match에서 승인 evidence를 byte-preserve하고 `curation=preserved`를 출력했다. catalog·manifest·scaffold 변경은 `PENDING` 재생성, 같은 fingerprint의 machine 편집은 fail-closed한다. `--reset-curation`은 사람 승인을 명시적으로 폐기하므로 closure 명령에 포함하지 않는다.

후속 phase에서 추가할 권장 script:

```bash
npm run test:i18n
npm run test:share:fixtures
npm run audit:network
npm run audit:assets
npm run docs:lint
npm run docs:links
npm run check:traceability
npm run smoke:production -- --url <URL>
```
## 5. 환경변수 정책

v1.0 runtime에 secret 환경변수는 없다. build-time 값도 공개 정보만 사용한다.

`.env.example` 후보:

```dotenv
# 공개 repository 하위 배포 경로. 예: /axis-shift/
VITE_BASE_PATH=/

# 화면에 표시할 공개 commit 식별자. CI에서 주입 가능.
VITE_BUILD_SHA=development

# ISO timestamp. CI에서 주입 가능.
VITE_BUILD_TIME=local

# production URL. 공유 링크와 smoke에 사용하며 비밀값이 아님.
VITE_PUBLIC_URL=http://localhost:4173
```

규칙:

- `.env`, `.env.local`, 실제 token은 commit 금지.
- `VITE_` 값은 브라우저 번들에 공개된다는 전제로 사용한다.
- API key·secret·개인 식별정보를 `VITE_`에 넣지 않는다.
- 값이 없을 때 안전한 local default 또는 명시적 build error를 사용한다.

## 6. Base path·라우팅 검증

GitHub Pages repository site base는 `/axis-shift/`다. M01부터 non-root production preview를 검사한다. Vite config는 shell 환경변수를 우선하고, 없으면 mode별 `.env*`의 `VITE_BASE_PATH`를 읽는다.

```bash
VITE_BASE_PATH=/axis-shift/ npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

PowerShell에서는 첫 줄 대신 다음을 사용한다.

```powershell
$env:VITE_BASE_PATH = '/axis-shift/'
npm run build
```

M01 필수 확인:

```text
/axis-shift/#/
/axis-shift/#/daily
/axis-shift/#/unknown
```

- 모두 서버 404 없이 app shell을 받는다.
- unknown route는 앱 내부 복구 화면을 보인다.
- `npm run test:e2e`는 위 세 route와 44px AppShell 상호작용 타깃을 Chromium·Firefox·WebKit에서 검사한다.

`/#/tutorial`은 M06, `/#/daily/YYYY-MM-DD`는 M07, manifest `start_url/scope`와 worker scope는 M09에서 이 목록에 추가한다. M01은 PWA나 아직 없는 route를 통과했다고 주장하지 않는다.

## 7. 테스트 환경 고정

### 시간

- 단위 테스트는 fake clock을 주입한다.
- Daily domain은 명시적 UTC `YYYY-MM-DD` 문자열을 사용하고 `Date`를 직접 읽지 않는다.
- Sprint는 `sessionEndAt` 경계를 ms 단위로 검사한다.
- 실제 현재 날짜·로컬 timezone에 의존하는 snapshot을 만들지 않는다.

### 랜덤

- Daily·generator test는 고정 seed와 version을 사용하며 NFKC→SHA-256→Mulberry32 순서를 고정한다.
- `nextInt`는 rejection sampling을 사용한다. 단순 modulo로 바꾸면 golden vector와 browser parity를 다시 고정해야 한다.
- Sprint production seed는 Web Crypto를 사용할 수 있으나 test는 주입한다.
- `Math.random()`·Web Crypto를 Daily domain과 테스트 오라클에서 사용하지 않는다.

### Locale·timezone

Playwright matrix 최소값:

```text
locale: ko-KR, en-US
timezone: UTC, Asia/Seoul, America/Los_Angeles, Pacific/Kiritimati
```

M03 generator parity는 `UTC`, `Asia/Seoul`, `America/Los_Angeles`의 3개 환경에서 puzzle/diagnostics stable hash를 비교한다. `Pacific/Kiritimati`를 포함한 전체 제품 locale·timezone matrix는 M07·M10에서 유지한다.

### Viewport

```text
360×640
390×844
768×1024
1024×768
1440×900
```

## 8. CI 계약

PR quality job:

```text
checkout
→ setup-node 24 + npm cache
→ Node·npm 버전 출력
→ npm ci
→ lint·format:check·typecheck
→ unit/component·global/domain/M04 coverage·storage/math
→ 정적 접근성 이름 검사
→ 디자인 token 검사
→ 모듈 경계·레벨·Daily·secret 검사
→ build
→ Chromium·Firefox·WebKit 설치
→ M05 axe fixture
→ M05 keyboard core 3엔진
→ non-root route core E2E
→ M03 PRNG·Daily browser parity 3엔진
```

정적 접근성·token 검사는 browser 설치 전에 실행한다. browser 기반 axe·keyboard·route·parity는 세 엔진 설치 뒤 실행한다.

canonical visual은 Linux quality job과 분리한 `windows-latest` job에서 수행한다.

```text
checkout
→ setup-node 24 + npm cache
→ npm ci
→ Chromium 설치
→ M05 visual regression
```

로컬 Windows dark/light/system full-fixture baseline 9개는 프로젝트 오너 승인 canonical이며 무갱신 18/18, `maxDiffPixels=0`, threshold 0, diff 0을 유지한다. GitHub `windows-latest`의 system-font rasterization은 로컬과 달라 원격에서는 `maxDiffPixelRatio=0.025`로 mobile/desktop snapshot을 검사하고 tablet snapshot 3건만 명시적으로 SKIP한다. 구조·접근성 검사는 계속 실행하며, tablet 차이를 덮기 위한 6% 임계치 완화는 채택하지 않았다.

main Pages pipeline:

```text
checkout
→ setup-node .nvmrc + npm cache
→ npm ci
→ npm run verify
→ npm run audit:a11y-static
→ Chromium 설치
→ npm run test:a11y -- --project=ui-fixtures
→ npm run test:e2e -- --project=chromium
→ npm run test:pages -- --project=chromium
→ Pages artifact upload/deploy
```

Pages도 정적 접근성 검사를 browser 설치 전에 수행하고, axe는 Chromium 설치 뒤 수행한다. 자동 E2/E3가 통과해도 실제 Android Chrome·스크린리더·200% zoom·색각 검토의 수동 E1 4개를 CI 성공으로 대체하지 않는다.

workflow는 `node-version-file: .nvmrc`, npm cache와 `package-lock.json`, `npm ci`를 사용한다. `.nvmrc=24`와 `package.json#engines`도 Node 24로 일치한다. 품질 CI는 Chromium core E2E 뒤 M03 parity를 Chromium·Firefox·WebKit에서 실행하고, Pages workflow는 호환 artifact Chromium smoke와 공식 upload/deploy를 유지한다.
## 9. GitHub Pages 배포

2026-08-14 원격 Pages를 legacy branch source에서 공식 artifact workflow로 전환했다. 배포 SHA는 `93a4359b5cbe1b45f8ed1fe0ee4a984003e8191c`이며 `build_type=workflow`·`status=built`다. 전환 전 SHA `576e6dbac1938652ba892539c91a1fa07f4d2cf7`는 `backup/pages-legacy-20260814`에 보존했다.

최초 원격 결론:

- CI run [31733232235](https://github.com/JTech-CO/axis-shift/actions/runs/31733232235): success, quality job 51초
- Pages run [31733232206](https://github.com/JTech-CO/axis-shift/actions/runs/31733232206): success, artifact build 60초·deploy 11초
- 공개 Chromium artifact smoke: 8/8
- 공개 M00 전체 회귀: 573단언, 320/360/960px, console 오류 0

M01 전환 artifact 계약:

- `npm run build:pages` 출력은 `pages-dist/`이며 commit하지 않는다.
- 공개 루트와 기존 stage/seed query는 M00 `prototypes/rule-proof/`로 연결한다.
- `/#/`, `/#/daily`, 알 수 없는 hash route는 M01 Hash Router로 제공한다.
- 정적 접근성·Chromium core E2E와 Chromium artifact smoke를 배포 job 안에서 모두 통과한 artifact만 업로드한다.
- upload는 숨김 파일 포함을 명시해 `.nojekyll`을 로컬 검증 artifact와 동일하게 보존한다.
- Chromium·Firefox·WebKit 로컬 artifact E2E 24/24와 asset HTTP 200을 별도 회귀 기준으로 유지한다.
- 실패 시 전환 직전 SHA의 legacy 백업 branch를 Pages source로 지정해 복구한다.

M10 목표 계약:

- source branch의 `dist/`를 commit하지 않는다.
- CI artifact를 Pages 공식 action으로 배포한다.
- deployment concurrency로 동시에 두 production deploy가 충돌하지 않게 한다.
- deploy 후 URL, commit SHA, manifest, worker, 핵심 route, Daily hash를 smoke한다.
- 실패 시 마지막 green artifact로 되돌릴 수 있게 run·SHA를 기록한다.

## 10. 성능 측정 환경

성능 수치는 환경 없이 기록하지 않는다.

최소 메타데이터:

```text
build SHA
browser/version
OS/device or Lighthouse profile
network/CPU throttle
cold/warm cache
sample count and median/p95
```

백서 목표:

| 항목 | 목표/상한 |
|---|---|
| 초기 JS gzip | 180KB 권장, 230KB 상한 |
| 초기 CSS gzip | 35KB 이하 |
| 첫 화면 정적 자산 | 1MB 이하 |
| 전체 app shell/content cache | 4MB 이하 |
| LCP | 2.0s 목표 |
| INP | 200ms 목표 |
| CLS | 0.05 이하 |
| 입력 피드백 | 50ms 이내 |
| generator | 50ms 목표, 200ms 상한 |
| rank/factorization | 10ms 목표 |
| share card | 500ms 목표 |

목표값은 측정 결과와 분리해 `QA_REPORT.md`에 기록한다.

## 11. Hash·artifact 명령

### Linux/macOS/Git Bash

```bash
sha256sum <file>
find pages-dist -type f -print0 | sort -z | xargs -0 sha256sum
```

### PowerShell

```powershell
Get-FileHash -Algorithm SHA256 <file>
Get-ChildItem pages-dist -Recurse -File |
  Sort-Object FullName |
  Get-FileHash -Algorithm SHA256
```

## 12. 자원 요구

- 개발: 4코어 CPU, 8GB RAM 이상 권장
- 전체 Playwright matrix: 16GB RAM 권장
- 디스크: browser binaries·reports 포함 5GB 여유 권장
- GPU는 필수 아님
- 외부 API·DB·container runtime은 필수 아님

## 13. 문제 해결 우선순위

1. Node·npm 버전과 `.nvmrc` 확인
2. 깨끗한 `npm ci`
3. lockfile·OS 경로·line ending 확인
4. 가장 작은 실패 명령 재현
5. `RUNBOOK.md` 해당 증상 확인
6. 서로 다른 방법 3회 실패 시 STOP

lockfile 삭제·재생성은 마지막 수단이며 의존성 diff와 이유를 기록한다.
