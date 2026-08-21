# AXIS//SHIFT 파일 트리·모듈 경계 계약

**버전**: 1.1.0
**상태**: M01·M02 구현 + 후속 phase 목표 계약
**최종 갱신**: 2026-08-21
**관련 불변식**: INV-002, INV-003, INV-017, INV-019

## 1. 목표

- 수학 코어를 UI·저장·시간에서 분리한다.
- 같은 규칙의 중복 구현과 feature 간 내부 결합을 차단한다.
- Codex가 파일 위치만 보고 책임과 검증 범위를 판단할 수 있게 한다.
- GitHub Pages 정적 빌드·테스트·문서·하네스 산출물을 명확히 분리한다.

## 2. 목표 저장소 트리

> **물리 배치 주의 (2026-08-21)**: 아래 트리는 M11까지의 목표 구조이며 모든 항목이 현재 존재한다는 뜻이 아니다. 구현 항목(`prototypes/`, `src/`, `public/`, `tests/`, `scripts/`, 설정 파일)은 부모 `PROJECT_ROOT` 기준이고, phase·ADR·불변식·증거 문서는 개발 중 `PROJECT_ROOT/AXIS_SHIFT_Harness_KR/`에 유지한다. 바로 아래 §2.1~2.2에 M01·M02 실제 범위를 별도로 적는다.

```text
axis-shift/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy-pages.yml
├── decisions/                       # ADR
├── docs/                            # 제품 계약·QA·제출 문서
├── gates/                           # DoR·DoD 가이드
├── phases/                          # M00~M11 실행 파일
├── prototypes/
│   └── rule-proof/                  # M00 폐기 가능한 규칙 검증물
├── public/
│   ├── icons/                       # 등록된 PWA 아이콘
│   ├── og/                          # 등록된 공개 미리보기 자산
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── robots.txt
├── scripts/
│   ├── audit-assets.ts
│   ├── audit-daily-generator.ts
│   ├── audit-network.ts
│   ├── build-pages.ts
│   ├── check-boundaries.ts
│   ├── check-traceability.ts
│   ├── export-share-fixtures.ts
│   ├── generate-level-candidates.ts
│   ├── start-pages-server.ts
│   └── validate-levels.ts
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── error-boundary.tsx
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── assets/
│   │   └── icons/
│   ├── components/
│   │   ├── common/                  # 도메인을 모르는 원자 UI
│   │   ├── game/                    # presentational game UI
│   │   └── layout/
│   ├── content/
│   │   ├── fallbacks/
│   │   ├── levels/
│   │   │   ├── echo.json
│   │   │   ├── noise.json
│   │   │   ├── pulse.json
│   │   │   ├── rank.json
│   │   │   └── tutorial.json
│   │   └── generator-map.json
│   ├── domain/
│   │   ├── algebra/
│   │   │   ├── bruteforce-oracle.test.ts
│   │   │   ├── factorization.test.ts
│   │   │   ├── factorization.ts
│   │   │   ├── gf2-rank.test.ts
│   │   │   ├── gf2-rank.ts
│   │   │   └── index.ts
│   │   ├── board/
│   │   │   ├── board.test.ts
│   │   │   ├── board.ts
│   │   │   ├── guards.test.ts
│   │   │   ├── guards.ts
│   │   │   ├── index.ts
│   │   │   ├── pulse.test.ts
│   │   │   └── pulse.ts
│   │   ├── generator/
│   │   ├── scoring/
│   │   ├── session/
│   │   ├── sprint/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── features/
│   │   ├── about/
│   │   ├── archive/
│   │   ├── daily/
│   │   ├── game-session/            # domain session과 UI 조합
│   │   ├── home/
│   │   ├── lab/
│   │   ├── settings/
│   │   ├── sprint/
│   │   └── tutorial/
│   ├── i18n/
│   │   ├── en.ts
│   │   ├── index.ts
│   │   └── ko.ts
│   ├── services/
│   │   ├── audio/
│   │   ├── clock/
│   │   ├── haptics/
│   │   ├── pwa/
│   │   ├── sharing/
│   │   └── storage/
│   ├── styles/
│   │   ├── global.css
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   └── utilities.css
│   ├── test/
│   │   ├── fixtures/
│   │   ├── setup.ts
│   │   └── test-utils.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── e2e/
│   ├── pages/
│   └── visual/
├── AGENTS.md
├── CLAUDE.md
├── GLOSSARY.md
├── HARNESS.md
├── INVARIANTS.md
├── PROGRESS.md
├── README.md
├── RUNBOOK.md
├── .editorconfig
├── .env.example
├── .gitattributes
├── .gitignore
├── .nvmrc
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── playwright.config.ts
├── playwright.pages.config.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── vitest.domain.config.ts
```

### 2.1 M01 제한 체크포인트의 실제 구현 범위

2026-08-14 현재 실제 생성된 생산 트리는 다음 범위다.

- `.github/workflows/ci.yml`, `.github/workflows/deploy-pages.yml`, Node/npm lock, TypeScript·Vite·Vitest·Playwright·ESLint·Prettier 설정
- `scripts/`의 경계·레벨·Daily·시크릿·정적 접근성 검사, E2E preview runner, Pages artifact 빌더·정적 서버
- `src/app`, 최소 `components/layout`, `features/home`, `features/daily`, 한·영 i18n, `src/styles`
- 후속 모듈 위치를 고정하는 `domain`·`content`·`services`의 빈 public entrypoint
- AppShell·Error Boundary unit/component test, non-root Hash Router E2E, M00 호환 진입을 포함한 Pages artifact 3엔진 E2E
- 생성되지만 commit하지 않는 `pages-dist/`: Vite M01 bundle, `.nojekyll`, whitelist된 M00 브라우저 runtime

아직 생성하지 않은 목표 항목은 `public/` PWA 자산, 실제 level JSON, 퍼즐 수학·generator 구현, M02 이후 feature와 visual fixture다. 빈 public entrypoint는 구현 완료 주장이 아니라 경계 위치 고정용이다.

### 2.2 M02 순수 수학 코어의 실제 구현 범위

2026-08-21 현재 M02에서 실제 생성·활성화한 생산 트리는 다음 범위다.

- `src/domain/types.ts`: 보드·PULSE·퍼즐 정의 공용 타입과 모드·난도·태그 allowlist
- `src/domain/board/board.ts`: 보드 생성·셀 조회·열 마스크·차이·완료 판정
- `src/domain/board/guards.ts`: 엔진 크기 3~8, 행·축·좌표·비자명 퍼즐의 구분 가능한 오류 guard
- `src/domain/board/pulse.ts`: 외적 마스크와 단일·연속 PULSE 순수 함수
- `src/domain/algebra/gf2-rank.ts`: 낮은 열·행 우선 pivot의 결정적 `GF(2)` rank
- `src/domain/algebra/factorization.ts`: rank 개수의 canonical PULSE 분해
- 위 다섯 구현 파일의 인접 unit test와 `bruteforce-oracle.test.ts`: 3×3 전수 BFS 및 4~8 고정 시드 property 검증
- `src/domain/{board,algebra}/index.ts`, `src/domain/index.ts`: 생산 코드와 script가 사용하는 public API
- `scripts/validate-levels.ts`: 로컬 PULSE·rank 구현을 제거하고 위 public API를 소비
- `vitest.domain.config.ts`: 전역 coverage 보고 범위와 분리한 M02 5파일 per-file 100% threshold

`generator`·`session`·`scoring`·`sprint` 구현과 실제 level JSON은 이 범위에 포함하지 않는다. M00/H00의 `prototypes/rule-proof/core.mjs`는 제출 슬라이스의 재현성을 위한 동결된 역사 구현이며 M02 production API로 간주하지 않는다.

## 3. 계층별 책임

| 계층 | 책임 | 허용되는 부수효과 |
|---|---|---|
| `domain` | 보드·대수·생성·세션·점수의 순수 규칙 | 없음 |
| `content` | 검증된 정적 퍼즐·fallback·generator map | 정적 import만 |
| `services` | 브라우저·시간·저장·공유·PWA adapter | 명시된 Web API |
| `components/common` | 범용 presentational UI | DOM event callback |
| `components/game` | 게임 상태를 표현하는 UI, 규칙 계산 없음 | DOM event callback |
| `features` | route 단위 orchestration, domain·service·component 조합 | 저장·route·Web API 호출을 service 경유 |
| `app` | provider, router, error boundary, app composition | 초기화·route |
| `i18n` | locale key·formatter | locale 저장은 service 경유 |
| `scripts` | domain/content를 재사용한 build-time 생성·감사 | 파일 I/O, process exit |
| `tests` | 사용자 흐름·브라우저·visual 검증 | test fixture 내 허용 |

## 4. Import 허용 행렬

`A → B`는 A가 B를 import할 수 있음을 뜻한다.

| From \ To | domain | content | services | common UI | game UI | features | i18n | app |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `domain` | 같은/하위 public API | 금지 | 금지 | 금지 | 금지 | 금지 | 금지 | 금지 |
| `content` | types·validator-safe API | 같은 폴더 | 금지 | 금지 | 금지 | 금지 | 금지 | 금지 |
| `services` | types·순수 helper | 필요 시 read-only | 같은 service public API | 금지 | 금지 | 금지 | i18n formatter는 원칙상 금지 | 금지 |
| `components/common` | 금지 | 금지 | 금지 | 같은 public API | 금지 | 금지 | 번역된 string만 prop으로 수신 | 금지 |
| `components/game` | type·selector 결과만 | 금지 | 금지 | 허용 | 같은 public API | 금지 | 번역된 string만 prop으로 수신 | 금지 |
| `features` | 허용 | 허용 | public API 허용 | 허용 | 허용 | **다른 feature 내부 금지** | 허용 | 금지 |
| `i18n` | 금지 | 금지 | 금지 | 금지 | 금지 | 금지 | 내부 허용 | 금지 |
| `app` | 타입 최소 | 금지 | provider adapter | 허용 | 금지 | feature public entry 허용 | 허용 | 내부 허용 |
| `scripts` | public API 허용 | 허용 | 브라우저 service 금지 | 금지 | 금지 | 금지 | key audit 시 허용 | 금지 |

## 5. Public entrypoint 규칙

각 모듈은 폴더 루트의 `index.ts` 또는 명시된 파일만 외부에 공개한다.

```text
src/domain/index.ts
src/services/storage/index.ts
src/services/sharing/index.ts
src/components/common/index.ts
src/components/game/index.ts
src/features/<name>/index.ts
src/i18n/index.ts
```

금지 예:

```ts
import { internalReducer } from '@/features/daily/internal/reducer';
import { pivotStep } from '@/domain/algebra/internal/pivot-step';
```

허용 예:

```ts
import { createDailyViewModel } from '@/features/daily';
import { factorizeGF2 } from '@/domain';
```

## 6. Feature 경계

- feature끼리 직접 내부 import하지 않는다.
- 공통 orchestration이 필요하면 `features/game-session` 또는 `app`으로 승격한다.
- 특정 feature 전용 UI는 해당 feature 안에 둘 수 있지만 다른 feature가 재사용하면 `components/`로 이동한다.
- route param parsing은 feature boundary에서 allowlist 검증한다.
- raw LocalStorage·navigator 호출은 feature에 넣지 않고 services를 사용한다.

## 7. 도메인 코어 금지 의존성

`src/domain/**`에서 다음 식별자·모듈을 import 또는 직접 사용하지 않는다.

```text
react, react-dom, window, document, navigator,
localStorage, sessionStorage, fetch, XMLHttpRequest,
Date.now, performance.now, setTimeout, crypto.getRandomValues
```

필요한 시간·seed는 함수 인자 또는 port로 받는다. 순수 계산의 `Math` 사용은 허용하되 `Math.random()`은 금지한다.

## 8. 파일·명명 규칙

- React component: `PascalCase.tsx`; 폴더형이면 `ComponentName/index.ts` public export.
- 순수 module: `kebab-case.ts`.
- 단위 테스트: source 인접 `*.test.ts(x)`.
- E2E: `tests/e2e/<flow>.spec.ts`.
- JSON ID: 소문자 kebab case, 배포 후 재사용·변경 금지.
- i18n key: `feature.section.element.state`.
- ADR: `NNNN-kebab-title.md`.
- phase: `Mnn_snake_case.md`.

## 9. 생성물·커밋 정책

커밋 허용:

- source, config, lockfile
- 검증된 content JSON
- 작고 결정적인 golden fixtures
- 승인된 visual baseline
- docs·report의 요약 결과

커밋 금지:

- `dist/`, `.vite/`, `coverage/`
- `playwright-report/`, `test-results/`, trace·video 대량 파일
- local `.env`와 token
- generated candidate 전체 dump
- OS metadata·editor cache
- 제출용 대형 영상 원본

CI artifact나 외부 보관 경로를 `PROGRESS.md`에 기록한다.

## 10. 경계 집행

M01~M02에서 다음을 자동화한다.

```bash
npm run lint
npm run check:boundaries
```

M01에서 활성화한 검사 항목:

1. `domain`의 외부·비도메인 import, 브라우저 global, `Math.random()` 사용
2. feature 간 import와 feature·component의 직접 `fetch`·storage·navigator 사용
3. public entrypoint 우회
4. 순환 의존성
5. component의 services import
6. 위반 7종과 순환 1종의 생성 → 실패 확인 → 자동 정리

의도적 위반 fixture가 실패하는지를 CI에서 확인하고 제거한다. 경계 규칙 완화는 ADR과 INV-003 검토가 필요하다.

M02는 DOD-08용 named AST 중복 구현 보조 검사를 추가한다.

1. `features`·`components`·`services`·`scripts`에서 PULSE·rank·factorization 핵심 함수의 로컬 구현 선언을 금지한다.
2. public domain API의 import와 호출은 허용한다.
3. `tests`·fixture·`prototypes`는 의미가 다른 독립 오라클과 회귀 자료이므로 production 중복 검사에서 제외한다.
4. 임시 self-check가 함수 선언, 함수식, 화살표 함수, 객체 메서드, 클래스 메서드의 5개 구현 형태를 모두 탐지하고 import·호출 2건은 허용하는지 확인한 뒤 fixture를 정리한다.

이 AST 검사는 정확한 이름을 가진 재정의의 회귀를 빠르게 막는 보조 gate다. 이름을 바꾼 동일 알고리즘을 의미적으로 판별하거나, domain API에 단순 위임하는 같은 이름 wrapper와 실제 복제를 구분하지는 못한다. 따라서 DOD-08은 named gate 통과만으로 주장하지 않고 occurrence 검색과 diff code review를 함께 요구한다.

전역 `npm run test:coverage`는 전체 제품 source 보고 용도를 유지한다. M02 지정 코어 5파일의 per-file 100% threshold는 `vitest.domain.config.ts`와 `npm run test:coverage:domain`에만 둔다.

`npm run check:boundaries`의 M02 기준 출력은 `files=43 edges=40 violations=0 cycles=0 coreFiles=27 coreFixtureImplementations=5 coreFixtureAssertions=2`다. 동결된 `prototypes/rule-proof/core.mjs`는 H00 legacy 예외이며, M02를 위해 과거 제출 artifact를 소급 변경하지 않는다.

`sharing`의 raw session/puzzle 타입 차단은 DTO가 생기는 M09에서 활성화한다.
