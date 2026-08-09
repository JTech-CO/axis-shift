# RUNBOOK.md — AXIS//SHIFT 장애 대응 런북

> 같은 이슈를 두 번 겪었거나 재발 가능성이 높으면 행을 추가한다. 조치는 불변식과 게이트를 약화하지 않는 최소 복구 순서로 쓴다.

## 사용 절차

1. 증상을 관측 가능한 문장으로 고정한다.
2. 가장 작은 재현을 만든다.
3. 아래 표에서 일치하는 항목의 진단 순서를 따른다.
4. 같은 실패를 다른 방법으로 3회 시도해도 해결되지 않으면 STOP한다.
5. 임시 처치는 `PROGRESS.md`, 재발 방지 테스트는 해당 phase, 반복 지식은 이 런북에 남긴다.

| # | 증상 | 흔한 원인 | 최소 진단·조치 | 관련 불변식 |
|---:|---|---|---|---|
| 1 | `npm ci` 실패 | Node/npm 불일치, lockfile과 package.json 불일치, 네이티브 캐시 손상 | `.nvmrc`의 Node 24 사용 → npm 버전 확인 → 캐시가 아닌 깨끗한 디렉터리에서 `npm ci` → lockfile 재생성은 의존성 변경으로 기록 | INV-018 |
| 2 | 로컬은 되지만 CI type/lint 실패 | 대소문자 경로, Node 버전, 생성 파일 의존, OS 줄바꿈 | CI와 동일 Node·`npm ci` 사용 → case-sensitive import 검사 → 생성 결과를 소스처럼 참조하지 않는지 확인 | INV-003 |
| 3 | 금지 import가 통과함 | ESLint 경계 규칙 누락 또는 glob 미적용 | 의도적 위반 fixture를 추가해 lint가 실제 실패하는지 확인 → `docs/FILE_TREE.md`와 룰 동기화 | INV-003 |
| 4 | PULSE가 예상 외 셀을 바꿈 | row/column 비트 순서 반전, mask shift 오류, 보드 마스크 누락 | 2×2·3×3 최소 fixture → outer-product 행렬을 출력 비교 → affected cell exact test 추가 | INV-004, INV-005 |
| 5 | Undo 후 원상 복구되지 않음 | 이동 스냅샷 변형, 선택 mask 초기화 시점 오류, 두 번 기록 | reducer 단위로 `apply → undo` 비교 → move immutable 확인 → UI animation state 분리 | INV-005, INV-010 |
| 6 | 랭크와 brute-force 최소 이동이 다름 | GF(2)가 아닌 정수 연산, pivot swap/XOR 오류, 비트 순서 불일치 | 실패 행렬을 golden fixture로 고정 → elimination 각 pivot 단계 출력 → 3×3 전수 재실행 | INV-006 |
| 7 | 분해 펄스 수는 맞지만 재합성 실패 | basis column과 coefficient row 인덱스 불일치 | `D = Σ(u_i⊗v_i)` 각 항을 출력 → pivot 순서 고정 → round-trip test 우선 수정 | INV-006 |
| 8 | 생성기가 오래 멈춤 | rejection 조건 과도, 시도 제한 없음, PRNG 상태 갱신 오류 | 최대 시도 횟수 확인 → 실패 seed 단독 재현 → 조건별 reject counter 출력 → 결정적 fallback 유지 | INV-007, INV-008 |
| 9 | 같은 날짜에 기기별 Daily가 다름 | 로컬 날짜 사용, locale 문자열 seed, `Math.random`, 정렬 비결정성 | 입력을 UTC ISO date·version·domain string으로 출력 → golden vector 비교 → timezone matrix E2E | INV-008 |
| 10 | 과거 Daily가 업데이트 후 바뀜 | generatorVersion 미증가, 과거 구현 제거, fallback 목록 변경 | 해당 날짜·구버전 snapshot 비교 → 구버전 경로 복원 또는 frozen manifest 추가 → ADR | INV-009 |
| 11 | level validator는 통과하지만 실제 플레이 불가 | validator와 런타임 파서 중복 구현, initial=target 누락, ID 라우팅 불일치 | 런타임과 validator가 동일 schema/guard를 import하는지 확인 → E2E에서 각 콘텐츠 ID 로드 | INV-007 |
| 12 | 빠른 연타로 PULSE가 두 번 실행됨 | pointer·keyboard 중복, disabled가 렌더 후 적용, animation callback 재호출 | reducer에 action id/phase guard → rapid click+shortcut 테스트 → 논리 상태 즉시 확정 | INV-010 |
| 13 | 새로고침 후 세션이 깨짐 | 저장 시점이 animation 중, schema 불일치, 비직렬화 값 포함 | 저장 payload guard 실행 → `pulsing` 대신 안정 상태만 저장 → corrupt fixture와 migration test | INV-011 |
| 14 | 손상 LocalStorage 때문에 앱이 흰 화면 | JSON.parse 예외 미처리, Error Boundary 밖 초기화 | storage adapter에서 try/catch+quarantine → 기본값 복구 → 사용자 경고 1회 | INV-011 |
| 15 | Sprint가 백그라운드 후 시간이 늘어남 | decrement interval 누적 방식 | `remaining = max(0, endAt-now)`로 교체 → fake clock·visibility E2E → 완료 단일화 | INV-012 |
| 16 | 공유 텍스트에 정답이 보임 | debug payload 직렬화, move mask 포함, target 기반 signature 출력 | 허용 필드 allowlist → 금지 키 snapshot → 공유 URL query 검사 → 회귀 테스트 | INV-013 |
| 17 | PNG 공유가 빈 이미지/글자 깨짐 | 폰트 미준비, Canvas 크기 0, Blob API 차이 | `document.fonts.ready` 대기+system fallback → 고정 해상도 fixture → text-only 폴백 | INV-013 |
| 18 | Web Share/Clipboard가 특정 브라우저에서 실패 | 파일 공유 미지원, 권한/secure context, 사용자 제스처 없음 | capability 단계별 감지 → file→text→clipboard→textarea 순 폴백 → 실패를 게임 오류로 처리하지 않음 | INV-013 |
| 19 | GitHub Pages에서 자산 404 | Vite `base`와 절대 `/` 경로 불일치 | `import.meta.env.BASE_URL` 사용 → 빌드 산출물 URL 검사 → 하위 경로 preview E2E | INV-014 |
| 20 | 공유 링크 새로고침 시 404 | BrowserRouter 사용 또는 서버 rewrite 없음 | Hash Router 확인 → 모든 공유 URL에 `/#/` 포함 → 직접 로드 smoke | INV-014 |
| 21 | PWA가 구버전만 계속 표시 | service worker cache version·prompt update 오류 | SW 등록/대기 상태 확인 → 진행 세션 저장 후 update prompt → 캐시 정리 절차 제공 | INV-014 |
| 22 | 오프라인에서 홈은 열리지만 퍼즐이 안 열림 | level JSON·locale·route chunk precache 누락 | offline E2E에서 핵심 모드별 로드 → 필수 콘텐츠 precache 또는 local bundle → runtime cache 정책 검토 | INV-014 |
| 23 | 360px에서 가로 스크롤 | 고정 보드 폭, axis 44px+gap 합산 초과, 긴 문자열 | overflow 원소 탐지 스크립트 → `min()/clamp()` 조정 → 한국어·영어 fixture 동시 검사 | INV-015, INV-016 |
| 24 | 모바일 PULSE가 마지막 행을 가림 | sticky bar 높이·safe area·scroll padding 누락 | `env(safe-area-inset-bottom)`과 `scroll-padding-bottom` 확인 → 360×640·iOS viewport E2E | INV-015 |
| 25 | 키보드로 완료할 수 없음 | 포커스 순서, dialog trap, shortcut가 input에서 발동 | Tab 흐름 녹화 → 실제 button/aria-pressed 사용 → 결과 포커스와 Escape 복구 테스트 | INV-015 |
| 26 | axe는 통과하지만 상태를 구분하기 어려움 | 색에만 의존, preview ON/OFF 형태 동일 | 디자인 백서 상태 우선순위 적용 → 고대비·색각 시뮬레이션 수동 확인 | INV-015 |
| 27 | 번역 key 누락 또는 한 언어만 깨짐 | locale 객체 구조 불일치, 컴포넌트 하드코딩 | key flatten 후 set equality → missing key CI 실패 → 긴 문자열 fixture | INV-016 |
| 28 | 사운드가 첫 클릭 전 재생되지 않음 | AudioContext 사용자 제스처 정책 | 첫 명시적 사용자 제스처 후 resume → 실패 시 조용히 생략 → 상태 정보는 시각적으로 유지 | INV-015 |
| 29 | E2E가 간헐적으로 실패 | 실시간 날짜·모션·SW·랜덤 시드·비동기 폰트 | Clock/seed 주입 → reduced motion 테스트 → service worker를 테스트별 명시 제어 → locator 기반 대기 | INV-008, INV-018 |
| 30 | 번들에 외부 네트워크 요청이 생김 | CDN 폰트, analytics, third-party icon | Playwright request allowlist 검사 → 자산 로컬화 또는 제거 → 필요 시 ADR·사용자 승인 | INV-017 |
| 31 | asset license가 불명확 | 생성 출처·수정 이력 미기록 | 자산 사용 중단 → 원본·저작자·라이선스 확인 → `docs/ASSET_LICENSES.md` 등록 전 재도입 금지 | INV-019 |
| 32 | 실제 배포는 열리나 심사위원이 코어를 못 찾음 | 온보딩 CTA 약함, 라우트 오류, 안내 누락 | incognito에서 2클릭 내 튜토리얼/Daily 확인 → README와 인게임 조작법 → M11 3분 시연 리허설 | INV-020 |

## 행 추가 형식

```text
| n | 관측 가능한 증상 | 가능성이 높은 원인 순 | 최소 진단 → 수정 → 회귀 테스트 | INV-nnn |
```

P0·P1 또는 불변식 관련 장애는 해결 후 `docs/QA_REPORT.md`의 결함 이력에도 남긴다.
