# AGENTS.md — AXIS//SHIFT 에이전트 계약

> 부모 저장소 루트의 `AGENTS.md`가 자동 탐색 진입점이며, 모든 코드 에이전트는 이어서 이 상세 계약 원본을 읽는다. 플랫폼의 시스템·개발자·사용자 지시가 항상 상위이며, 그 아래에서는 이 문서 → `HARNESS.md` → `INVARIANTS.md` → 현재 phase → `docs/` 순으로 적용한다.

## 프로젝트 한 줄

행과 열을 선택해 교차점 셀을 XOR 반전하고, `GF(2)` 위에서 증명 가능한 최소 펄스로 목표 패턴을 복원하는 서버리스 웹 퍼즐을 만든다. 날짜별 `Daily Signal`은 Lab·Tutorial·Sprint·Archive와 함께 제공되는 여러 모드 중 하나이며, 제품 전체를 하루 한 문제로 제한하지 않는다.

## 현재 기준

- 현재 phase: `PROGRESS.md`가 단일 진실 공급원이다.
- 출시 범위: Tutorial 6개, Lab 48개, Daily Signal, Archive, 180초 Sprint, 공유 카드, 한·영, PWA·오프라인, 접근성.
- 프런트엔드: React + TypeScript + Vite.
- 보드 렌더링: DOM/CSS Grid. Canvas는 공유 PNG 생성에만 사용한다.
- 데이터: LocalStorage. 백엔드·계정·외부 런타임 API·원격 분석은 v1.0 범위 밖이다.
- 호스팅: GitHub Pages를 1차 대상으로 하고 Hash Router와 base path를 사용한다.

## 작업공간 배치 계약

- 부모 `AGENTS.md`가 저장소 자동 탐색 진입점이며, 이 문서는 하네스의 단일 상세 계약 원본이다.
- 실제 Git 저장소와 구현 작업 루트(`PROJECT_ROOT`)는 이 하네스 폴더의 부모인 `AXIS SHIFT (Tensor)`다.
- `AXIS_SHIFT_Harness_KR/`(`HARNESS_ROOT`)는 phase·불변식·ADR·증거를 유지하는 가이드/하네스 폴더다.
- `src/`, `public/`, `tests/`, `scripts/`, `prototypes/`, `package.json`과 도구 설정은 모두 `PROJECT_ROOT`에 생성한다.
- 하네스 문서에 적힌 제품 경로는 별도 명시가 없으면 `PROJECT_ROOT` 기준이다.
- 제품 코드, 폐기형 프로토타입, 빌드 산출물을 `HARNESS_ROOT` 안에 만들지 않는다.
- 하네스는 M11 릴리스 준비와 프로젝트 오너 승인 전에는 삭제하지 않는다.

## 매 세션 행동

1. `PROGRESS.md`에서 현재 phase, 다음 할 일, 미결, 최근 실패를 확인한다.
2. 해당 `phases/Mnn_*.md`의 DoR가 전부 충족됐는지 확인한다. 미충족이면 구현을 시작하지 않는다.
3. phase가 참조하는 `INVARIANTS.md`, ADR, 백서 절을 읽는다.
4. 변경 전에 작업 목표, 수정 예정 파일, 실행할 최소 검증을 짧게 정리한다.
5. 한 번에 한 phase만 작업한다. 현재 phase 밖의 문제를 발견하면 `PROGRESS.md`의 백로그에 기록하고 임의 확장하지 않는다.
6. 버그·수학·상태 로직은 실패 재현 테스트를 먼저 추가한다. UI는 fixture 또는 사용자 흐름 테스트를 함께 만든다.
7. 작업 단위가 끝날 때 가장 작은 관련 테스트를 실행한다. phase 종료 주장 전에는 phase 파일의 전체 검증 명령을 실행한다.
8. 통과를 주장할 때 명령, 종료 코드, 핵심 수치, 산출물 경로를 phase 파일의 증거 절과 `PROGRESS.md`에 남긴다.
9. Codex 기여와 사람의 판단을 `docs/CODEX_COLLABORATION.md`에 구분해 기록한다.
10. 세션 종료 전에 `PROGRESS.md`를 반드시 갱신한다. 커밋·푸시·PR은 사용자 지시가 있을 때만 수행한다.

## 레드라인 — 위반 시 즉시 STOP

1. 테스트 삭제, assertion 완화, 표본 축소, 임계치 하향으로 실패를 숨기지 않는다.
2. `INVARIANTS.md`의 활성 불변식을 깨고 다음 phase로 진행하지 않는다.
3. 퍼즐 규칙·랭크·분해·점수의 기준 로직을 `src/domain/` 밖에 중복 구현하지 않는다.
4. PULSE는 반드시 `B' = B XOR (r ⊗ c)`다. 셀별 임의 토글·예외 규칙을 추가하지 않는다.
5. 최소 펄스 수를 하드코딩하거나 휴리스틱으로 추정하지 않는다. 차이 행렬의 `GF(2)` 랭크를 사용한다.
6. 공유 텍스트·PNG·URL에 목표 보드, 현재 보드, 행/열 마스크, 원시 이동 이력을 노출하지 않는다.
7. 날짜 기반 Daily에 `Math.random()`, 로컬 타임존, 구현체별 비결정적 순서를 사용하지 않는다.
8. 검증되지 않은 LocalStorage JSON을 도메인 상태로 직접 사용하지 않는다. 저장 접근은 `src/services/storage/`를 통한다.
9. 사용자 노출 문자열을 컴포넌트에 하드코딩하지 않는다. i18n key를 사용한다.
10. 외부 폰트 CDN, 핫링크 이미지, 런타임 AI API, 광고 SDK, 원격 분석, 쿠키를 ADR과 사용자 승인 없이 추가하지 않는다.
11. `docs/FILE_TREE.md`의 import 경계를 임의로 바꾸지 않는다. 구조 변경은 ADR과 경계 테스트가 필요하다.
12. `.env`, 키, 토큰, `dist/`, 대용량 녹화·바이너리·테스트 산출물을 커밋하지 않는다.
13. 접근성 상태를 색상·사운드·모션 하나에만 의존시키지 않는다.
14. 기능 플래그나 폴백으로 오류를 숨긴 채 릴리스하지 않는다. 폴백은 명세된 실패 모드에서만 사용한다.

## 핵심 수학 계약

```text
D = current XOR target
P = selectedRows ⊗ selectedCols
next = current XOR P
par = rank_GF2(D)
```

- 동일 PULSE를 두 번 적용하면 원상 복구돼야 한다.
- 펄스 적용 순서는 최종 보드에 영향을 주지 않는다.
- 정규 분해의 펄스들을 합성하면 D와 정확히 같아야 한다.
- 3×3 전체 512개 행렬에서 brute-force 최소 이동과 랭크가 일치해야 한다.

상세는 `docs/PUZZLE_MATH.md`를 따른다.

## 기본 명령 계약

M01에서 아래 npm script를 실제 `package.json`에 연결한다. 이후 문서는 이 이름을 기준으로 한다.

```bash
npm ci
npm run dev
npm run lint
npm run format:check
npm run typecheck
npm run test
npm run test:coverage
npm run validate:levels
npm run audit:daily
npm run build
npm run test:e2e
npm run test:a11y
npm run verify
```

- `npm run verify`: lint → format → typecheck → test → level validation → daily audit → build 순서의 로컬 전체 게이트.
- E2E와 접근성은 브라우저 설치 비용 때문에 `verify`와 별도일 수 있으나 M10·M11에서는 모두 필수다.
- 명령이 아직 존재하지 않으면 임의 대체하지 말고 현재 phase의 산출물로 구현한다.

## 코딩 규율

- TypeScript `strict: true`; 공개 함수는 입력·출력 타입을 명시한다.
- 도메인 코어는 React, DOM, LocalStorage, Date, 네트워크에 의존하지 않는 순수 함수로 유지한다.
- 날짜·타이머·스토리지는 포트/어댑터로 주입해 테스트 가능하게 한다.
- 불변 데이터와 reducer action을 사용한다. 애니메이션 상태와 논리 상태를 분리한다.
- 보드 행은 v1.0에서 8비트 이하의 `number`로 표현하고 보드 밖 비트를 마스킹한다.
- 선택적 Web API는 반드시 기능 감지와 폴백을 가진다.
- 의미 없는 추상화, 미사용 확장점, 조기 상태 관리 라이브러리를 추가하지 않는다.
- 의존성 추가 전 네이티브 Web API나 기존 도구로 해결 가능한지 검토하고 근거를 남긴다.

## 검증 우선순위

```text
불변식·수학 정확성
→ 핵심 기능 실효
→ 생성기·콘텐츠 정합성
→ 상태·저장·시간 정합성
→ UI·접근성
→ 성능·PWA·배포
→ 제출 자료
```

앞 단계가 깨지면 뒤 단계의 성공은 완료 근거가 아니다.

## STOP 조건

다음 중 하나면 구현을 멈추고 `HARNESS.md` §7 절차를 따른다.

- 같은 실패를 서로 다른 방법으로 3회 시도해도 해결되지 않음.
- 불변식이나 DoD를 깨야만 진행 가능해 보임.
- 공개 게임 규칙, 수학 모델, generator version, 저장 스키마, 모듈 경계를 바꿔야 함.
- 외부 서비스·비밀키·약관상 불명확한 자산이 필요함.
- 일정상 현재 phase 전체를 완성할 수 없어 범위 재결정이 필요함.
- 생성기 감사, PWA 캐시, 브라우저 차이처럼 로컬 단일 환경으로 결론을 낼 수 없음.

## 보고 형식

세션 종료 보고는 다음 순서를 사용한다.

```text
현재 phase / 상태
변경 파일과 핵심 결과
실행한 검증과 수치
남은 위험 또는 미결
PROGRESS.md 갱신 여부
```
