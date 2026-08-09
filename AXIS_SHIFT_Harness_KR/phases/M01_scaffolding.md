# M01 — Production Scaffolding & Boundaries

- **상태**: 미시작
- **담당 범위**: 저장소 기반, 도구 체인, 라우팅, CI, 모듈 경계
- **최종 갱신**: 2026-08-09

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
- 배포 프로덕션 승인

## 3. 진입조건 (DoR)

- [ ] M00 DoD 전부 통과.
- [ ] 저장소 이름, 공개/비공개 여부, npm 사용이 결정됨.
- [ ] `docs/FILE_TREE.md`와 `docs/ENVIRONMENT.md` 초안 확인.
- [ ] 라이선스의 최종 결정 또는 임시 `UNLICENSED` 정책이 사용자에게 명시됨.
- [ ] INV-001~003, INV-014, INV-017~019 확인.

## 4. 입력·산출물 계약

### 입력

- M00의 규칙 fixture와 Scope Lock
- `docs/FILE_TREE.md` import 경계 표
- `docs/ENVIRONMENT.md` 런타임·명령 계약
- ADR-0004 정적 PWA·Hash Router 결정

### 산출물

- `package.json`, `package-lock.json`, `.nvmrc`
- `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`
- `eslint.config.js`, Prettier 설정, `.editorconfig`, `.gitignore`
- `.github/workflows/ci.yml` 초안
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
- **ADR**: ADR-0001, ADR-0004, ADR-0007
- **기술 백서**: §3, §4.1, §6, §7.4, §8.5, §9
- **문서**: `docs/FILE_TREE.md`, `docs/ENVIRONMENT.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — 재현 설치**: 깨끗한 checkout과 Node 24.x에서 `npm ci`가 lockfile 변경 없이 exit 0이다. E2.
- [ ] **DOD-02 — 기본 품질 명령**: `npm run lint`, `format:check`, `typecheck`, `test`, `build`가 모두 exit 0이다. E2.
- [ ] **DOD-03 — Script 계약**: `AGENTS.md`에 선언된 모든 script 이름이 `package.json`에 존재한다. 아직 후속 phase 구현 전인 script는 명시적 placeholder가 아니라 안전한 “해당 검사 대상 0건” 검증기를 가져야 하며, 무조건 exit 0 스텁은 금지한다. (INV-018)
- [ ] **DOD-04 — 경계 차단**: `features`가 다른 feature 내부 파일을 import하거나 `domain`이 React·DOM·services를 import하는 의도적 샘플에서 lint가 실패한다. 샘플 제거 후 lint는 통과한다. E3. (INV-003)
- [ ] **DOD-05 — 순환 의존성**: 현재 `src/`의 순환 import가 0건이고 CI에서 차단된다. E2. (INV-003)
- [ ] **DOD-06 — GitHub Pages 경로**: 로컬 production preview에서 설정된 non-root `BASE_URL`과 Hash Router로 `/#/`, `/#/daily`, 알 수 없는 route가 404 없이 렌더링된다. E2. (INV-014)
- [ ] **DOD-07 — 시크릿·산출물 제외**: `.env*` 정책, `dist/`, coverage, Playwright 결과, 녹화 파일이 `.gitignore`에 반영되고 시크릿 스캔이 통과한다. (INV-001, INV-002)
- [ ] **DOD-08 — CI**: pull request 이벤트에서 install부터 build까지 동일 명령을 실행하도록 workflow가 유효하다.
- [ ] **DOD-09 — 문서 정합성**: 실제 트리·Node 버전·명령이 `docs/FILE_TREE.md`, `docs/ENVIRONMENT.md`, `PROGRESS.md`와 일치한다.

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
npm run verify
npm run check:boundaries
```

경계 fixture는 자동화된 test script가 생성·검사·정리하도록 구현해 작업 트리에 잔여 파일을 남기지 않는다.

## 9. 수동 검증

| 환경 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| production preview | non-root base로 빌드 후 각 hash route 직접 접속 | 404 없이 AppShell·복구 화면 | 명령 출력·캡처 |
| Windows 개발환경 | clone → `npm ci` → `npm run verify` | 경로/쉘 의존 오류 없음 | 로그 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- 스캐폴딩은 설정 영역별 커밋으로 분리한다.
- 도구 변경이 필요하면 lockfile과 설정을 함께 되돌린다.
- 경계 완화로 문제를 숨기지 않고 책임 위치를 수정한다.

## 12. 리스크·미지수

- 최신 ESLint·Vite 플러그인과 Node 24 호환성.
- GitHub Pages repository base 이름 미확정.
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
