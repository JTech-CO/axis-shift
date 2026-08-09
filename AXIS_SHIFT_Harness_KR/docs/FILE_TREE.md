# AXIS//SHIFT 파일 트리·모듈 경계 계약

**버전**: 1.0.0  
**상태**: M01 구현 기준  
**최종 갱신**: 2026-08-09  
**관련 불변식**: INV-002, INV-003, INV-017, INV-019

## 1. 목표

- 수학 코어를 UI·저장·시간에서 분리한다.
- 같은 규칙의 중복 구현과 feature 간 내부 결합을 차단한다.
- Codex가 파일 위치만 보고 책임과 검증 범위를 판단할 수 있게 한다.
- GitHub Pages 정적 빌드·테스트·문서·하네스 산출물을 명확히 분리한다.

## 2. 목표 저장소 트리

> **물리 배치 주의 (2026-08-09)**: 아래 트리의 구현 항목(`prototypes/`, `src/`, `public/`, `tests/`, `scripts/`, 설정 파일)은 부모 `PROJECT_ROOT` 기준이다. phase·ADR·불변식·증거 문서는 개발 중 `PROJECT_ROOT/AXIS_SHIFT_Harness_KR/`에 유지한다. M01 진입 시 이 구분을 실제 스캐폴딩과 경계 검사에 반영한다.

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
│   ├── check-boundaries.ts
│   ├── check-traceability.ts
│   ├── export-share-fixtures.ts
│   ├── generate-level-candidates.ts
│   └── validate-levels.ts
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── error-boundary.tsx
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── assets/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── global.css
│   │       ├── reset.css
│   │       ├── tokens.css
│   │       └── utilities.css
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
│   │   ├── board/
│   │   ├── generator/
│   │   ├── scoring/
│   │   ├── session/
│   │   ├── sprint/
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
│   ├── test/
│   │   ├── fixtures/
│   │   ├── setup.ts
│   │   └── test-utils.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── e2e/
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
├── .gitignore
├── .nvmrc
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

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

M01에서 다음을 자동화한다.

```bash
npm run lint
npm run check:boundaries
```

검사 항목:

1. `domain` 금지 import·global 사용
2. feature 간 deep import
3. public entrypoint 우회
4. 순환 의존성
5. sharing이 raw session/puzzle 타입을 받는지
6. components가 storage·network를 호출하는지
7. scripts가 규칙을 중복 구현하는지

의도적 위반 fixture가 실패하는지를 CI에서 확인하고 제거한다. 경계 규칙 완화는 ADR과 INV-003 검토가 필요하다.
