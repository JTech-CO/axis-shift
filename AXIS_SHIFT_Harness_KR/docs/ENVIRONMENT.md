# AXIS//SHIFT 개발·검증·배포 환경 계약

**버전**: 1.0.0  
**상태**: M01 제한 체크포인트·Pages artifact 전환 기준
**최종 갱신**: 2026-08-14

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
npm run validate:levels
npm run audit:daily
npm run audit:secrets
npm run check:boundaries
npm run build
npm run build:pages
npm run preview
npm run test:e2e
npm run test:pages
npm run test:a11y
npm run verify
```

후속 phase에서 추가할 권장 script:

```bash
npm run test:math:exhaustive
npm run test:storage:migrations
npm run test:visual
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
- Daily는 명시적 UTC instant와 timezone을 사용한다.
- Sprint는 `sessionEndAt` 경계를 ms 단위로 검사한다.
- 실제 현재 날짜에 의존하는 snapshot을 만들지 않는다.

### 랜덤

- Daily·generator test는 고정 seed와 version을 사용한다.
- Sprint production seed는 Web Crypto를 사용할 수 있으나 test는 주입한다.
- `Math.random()`을 도메인·테스트 오라클에서 사용하지 않는다.

### Locale·timezone

Playwright matrix 최소값:

```text
locale: ko-KR, en-US
timezone: UTC, Asia/Seoul, America/Los_Angeles, Pacific/Kiritimati
```

### Viewport

```text
360×640
390×844
768×1024
1024×768
1440×900
```

## 8. CI 계약

PR pipeline:

```text
checkout
→ setup-node 24 + npm cache
→ Node·npm 버전 출력
→ npm ci
→ lint
→ format:check
→ typecheck
→ unit/component
→ 정적 접근성 이름 검사
→ 모듈 경계·순환 검사
→ level validation
→ Daily 구현 탐지·대표 날짜 audit
→ secret scan
→ build
→ Chromium 설치
→ non-root route core E2E
```

main Pages pipeline:

```text
checkout
→ setup-node .nvmrc + npm cache
→ npm ci
→ npm run verify
→ npm run test:a11y
→ Chromium 설치
→ npm run test:e2e -- --project=chromium
→ npm run test:pages -- --project=chromium
→ Pages artifact upload/deploy
```

M01 workflow는 `node-version-file: .nvmrc`, npm cache와 `package-lock.json`, `npm ci`를 사용한다. `.nvmrc=24`와 `package.json#engines`도 Node 24로 일치한다. PR/main 품질 CI는 Chromium core E2E까지, Pages workflow는 호환 artifact Chromium smoke와 공식 upload/deploy까지 실행한다.

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
