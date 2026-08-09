# ADR-0004: 정적 PWA·Hash Router·GitHub Pages를 기본 배포로 채택한다

- **상태**: 채택
- **결정일**: 2026-08-09
- **최종 검토**: 2026-08-09
- **관련 phase**: M01, M05~M11
- **관련 불변식**: INV-014, INV-017
- **관련 문서**: `docs/TECHNICAL_WHITEPAPER.md` §2.1, §4.8, §7.4, §9

## 1. 맥락

해커톤 제출물은 브라우저에서 즉시 실행되어야 한다. 게임은 서버 계산·계정·DB가 필요 없고 GitHub 저장소와 공개 링크의 연결이 중요하다. GitHub Pages는 SPA path rewrite를 기본 제공하지 않는다.

## 2. 결정

React·Vite 정적 SPA를 GitHub Pages에 배포하고 Hash Router를 사용한다. manifest, service worker, asset URL은 Vite base와 repository 하위 scope를 공유하는 설치 가능한 PWA로 구성한다.

## 3. 세부 계약

- 공개 route는 `/#/...` 형식이다.
- `BASE_URL`, manifest `start_url/scope`, worker scope가 동일하다.
- core runtime은 backend·API key 없이 동작한다.
- app shell, Tutorial·Lab, fallback을 precache한다.
- worker update는 사용자 prompt 후 적용한다.
- 동일 artifact를 다른 정적 호스팅에 미러링할 수 있다.

## 4. 근거

로그인 없는 배포, 낮은 운영비, offline 실행, 공개 repo와 CI/CD의 단순성이 프로젝트 범위와 맞는다. Hash Router는 404 rewrite 설정 없이 직접 링크를 보존한다.

## 5. 결과와 트레이드오프

### 이점

- 정적 파일만으로 배포·복구 가능
- server outage·비밀키 없음
- PWA 설치·오프라인 지원
- PR과 release artifact 재현이 쉬움

### 비용·제약

- URL에 `#` 포함
- 서버 기능·클라우드 동기화 없음
- service worker cache 회귀 위험
- GitHub Pages base path를 모든 asset에서 고려해야 함

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| BrowserRouter + 404 rewrite | 깔끔한 URL | GitHub Pages rewrite 제약·복구 스크립트 복잡성 |
| Next.js/SSR | SEO·서버 확장 | 게임에 불필요, static/offline 복잡성 |
| Firebase backend | 계정·통계 | v1 비목표, 개인정보·운영 추가 |
| 네이티브 앱 우선 | 앱스토어 배포 | 해커톤 브라우저 링크와 일정에 부적합 |

## 7. 검증·집행

- non-root base local E2E
- production Pages post-deploy smoke
- manifest/worker scope assertion
- offline·update E2E
- network request audit

## 8. 변경 조건

GitHub Pages가 제품 요구를 충족하지 못하거나 서버 기능이 명시적으로 승인된 후속 버전에서만 호스팅·라우팅 변경을 검토한다. static artifact 자체는 계속 생성한다.
