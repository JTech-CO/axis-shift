# ADR-0009: Pages를 artifact workflow로 전환하고 M00 공개 진입점을 보존한다

- **상태**: 채택
- **결정일**: 2026-08-14
- **최종 검토**: 2026-08-14
- **관련 phase**: M00, M01, M10
- **관련 불변식**: INV-001, INV-002, INV-014, INV-018, INV-019
- **관련 문서**: `PROGRESS.md`, `phases/M00_rule_proof.md`, `phases/M01_scaffolding.md`, `docs/ENVIRONMENT.md`

## 1. 맥락

원격 Pages는 `main:/`을 직접 제공하는 legacy 방식이었다. M01의 Vite source entry를 그대로 push하면 공개 루트에서 플레이되던 M00 프로토타입 대신 미완성 AppShell이 노출되고, 기존 신규 사용자 모집·공유 링크가 깨질 수 있다. 반대로 Pages 전환을 미루면 M01을 commit·push해 clean checkout과 실제 CI를 검증할 수 없다.

## 2. 결정

프로젝트 오너는 2026-08-14 GitHub Pages를 공식 artifact workflow로 전환하도록 지시했다. 배포 artifact는 다음 계약을 따른다.

- 공개 루트와 hash가 `#/`로 시작하지 않는 기존 query/hash 링크는 `prototypes/rule-proof/`의 M00 플레이 화면으로 이동한다.
- `/#/`, `/#/daily`, 알 수 없는 `/#/...` 경로는 M01 Hash Router AppShell로 연다.
- `prototypes/rule-proof/` 직접 링크도 계속 작동한다.
- 호환 redirect는 source `index.html`이 아니라 생성된 `pages-dist/index.html`에만 주입한다.
- `pages-dist/`는 commit하지 않고 Actions artifact로만 업로드한다.
- 배포 전 기존 `origin/main` SHA를 날짜가 붙은 legacy 백업 branch로 보존한다.

## 3. 구현 계약

- `npm run build:pages`는 안전 검사를 거친 고정 출력 경로만 정리하고 Vite bundle, `.nojekyll`, M00 브라우저 runtime whitelist를 조립한다.
- M00 runtime은 브라우저 실행에 필요한 파일만 복사하며 verifier·서버·스크린샷은 배포 artifact에 넣지 않는다.
- `npm run test:pages`는 루트, stage/seed query, M00 직접 경로, M01 hash route, asset HTTP 응답을 Chromium·Firefox·WebKit에서 검사한다.
- Actions는 `configure-pages` → 검증·빌드 → 정적 접근성 → Chromium core·artifact smoke → `upload-pages-artifact` → `deploy-pages` 순서로 실행한다.
- upload 단계는 숨김 파일 포함을 명시해 로컬 필수 artifact인 `.nojekyll`이 실제 배포 tar에서도 빠지지 않게 한다.
- deploy job만 `pages: write`와 `id-token: write` 권한을 갖는다.

## 4. 근거

공개 M00 플레이 가능성을 유지하면서도 source branch와 생성물을 분리하고, 실제 GitHub Pages base path에서 M01 라우팅을 검증할 수 있다. artifact를 재현 가능한 명령으로 생성하면 배포 결과가 임의의 작업 트리 상태가 아니라 lockfile·CI 게이트를 통과한 산출물에 연결된다.

## 5. 결과와 트레이드오프

### 이점

- 기존 M00 모집·공유 링크와 query 기반 stage 링크를 보존한다.
- 생성물 commit 없이 Pages를 배포한다.
- M01 AppShell을 `/#/`에서 실제 환경으로 검증할 수 있다.
- legacy 백업 branch로 설정 수준의 복구 지점을 유지한다.

### 비용·제약

- M00와 M01이 한 artifact 안에서 임시로 공존한다.
- 루트 호환 bridge는 M00 공개 진입 계약이 끝날 때 제거해야 한다.
- artifact workflow와 Pages 설정이 함께 맞아야 하므로 원격 배포 smoke가 필수다.

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| legacy `main:/` 유지 | 설정 변경 없음 | source와 생성물이 섞이고 M01 push가 공개 M00 루트를 덮음 |
| M01을 즉시 공개 루트로 교체 | 구조가 단순함 | 아직 플레이 가능한 제품이 아니어서 신규 사용자 링크 목적과 충돌 |
| `dist/`를 commit | Pages 설정이 단순함 | 생성물 commit 금지와 재현 배포 원칙에 어긋남 |
| M01 배포를 M10까지 연기 | 초기 배포 작업 감소 | M01 clean checkout·원격 CI와 실제 base 검증을 막음 |

## 7. 롤백

전환 직전의 `origin/main`을 가리키는 legacy 백업 branch를 유지한다. 새 workflow가 배포에 실패하거나 공개 smoke가 깨지면 Pages `build_type`을 `legacy`로 되돌리고 source를 해당 백업 branch의 `/`로 지정한다. 원인 수정 후 artifact workflow와 공개 smoke를 다시 통과해야 재전환한다.

## 8. 경계

이 결정은 M00 formal E1 통과, M02 착수, PWA 구현, 최종 릴리스 승인을 뜻하지 않는다. M00 DOD-02~07은 출시 직전 playable beta 증거가 기록될 때까지 미완료로 유지한다.
