# AXIS//SHIFT 개발·검증·배포 환경 계약

**버전**: 1.0.0  
**상태**: M01 구현 기준  
**최종 갱신**: 2026-08-09

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

## 2. 지원 개발 OS

- Windows 10/11 + PowerShell 7 또는 Git Bash
- macOS 현재 지원 버전
- Ubuntu LTS 또는 GitHub Actions `ubuntu-latest`

shell-specific 문법을 npm script에 직접 넣지 않는다. 복잡한 검사는 TypeScript/Node script로 구현한다.

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
npm run build
npm run preview
npm run test:e2e
npm run test:a11y
npm run verify
```

추가 권장 script:

```bash
npm run check:boundaries
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

GitHub Pages repository site는 root가 아닐 수 있다. M01부터 non-root preview를 검사한다.

```bash
VITE_BASE_PATH=/axis-shift/ npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

필수 확인:

```text
/axis-shift/#/
/axis-shift/#/tutorial
/axis-shift/#/daily
/axis-shift/#/daily/2026-08-09
/axis-shift/#/unknown
```

- 모두 서버 404 없이 app shell을 받는다.
- unknown route는 앱 내부 복구 화면을 보인다.
- manifest `start_url/scope`와 worker scope가 `/axis-shift/` 안이다.

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
→ npm ci
→ lint
→ format:check
→ typecheck
→ unit/component
→ level validation
→ Daily audit representative/full policy
→ build
→ core E2E
```

main/release pipeline:

```text
PR pipeline 전체
→ full 3,650-day audit
→ full browser E2E
→ accessibility
→ visual regression
→ asset/network/security audit
→ Pages artifact upload/deploy
→ production smoke
```

CI는 `package-lock.json`, `.nvmrc`, Node setup major가 일치하는지 검사한다.

## 9. GitHub Pages 배포

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
find dist -type f -print0 | sort -z | xargs -0 sha256sum
```

### PowerShell

```powershell
Get-FileHash -Algorithm SHA256 <file>
Get-ChildItem dist -Recurse -File |
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
