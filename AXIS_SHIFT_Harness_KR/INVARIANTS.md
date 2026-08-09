# INVARIANTS.md — AXIS//SHIFT 불변식 레지스트리

> 불변식은 “항상 지켜야 하는 품질 목표”가 아니라 “한 건이라도 위반되면 해당 phase와 릴리스를 통과시킬 수 없는 조건”이다. 폐기할 때 행을 삭제하지 말고 상태와 대체 ADR을 기록한다.

## 등록 규칙

- 관측 가능하고 자동 검증 가능한 문장으로 쓴다.
- 적용 범위와 검증 방법을 함께 둔다.
- phase DoD는 `(INV-006 준수)`처럼 ID로 참조한다.
- 임계치 완화는 ADR과 사용자 승인이 필요하며, 정확성·보안·스포일러 불변식은 waiver할 수 없다.

## 레지스트리

| ID | 불변식 | 범위 | 검증 방법 | 상태 |
|---|---|---|---|---|
| INV-001 | 비밀키·토큰·실제 `.env` 값·개인정보를 저장소나 클라이언트 번들에 넣지 않는다. | 전역 | 시크릿 스캔, `git diff --cached`, 번들 문자열 검사 | 활성 |
| INV-002 | `dist/`, Playwright 결과, 대형 녹화·바이너리·생성 캐시를 소스와 함께 커밋하지 않는다. | 전역 | `.gitignore`, 파일 크기 CI, 리뷰 | 활성 |
| INV-003 | `docs/FILE_TREE.md`의 import 허용·금지 경계를 위반하는 상호 import와 순환 의존성이 0건이다. | `src/`, `scripts/` | ESLint 경계 규칙, dependency cycle 검사, 의도적 위반 fixture | 활성 |
| INV-004 | 모든 보드는 `3 <= size <= 8`, 행 수가 size와 동일하고 각 행의 보드 밖 비트가 0이다. | domain·content·storage | 런타임 guard, property test, level validator | 활성 |
| INV-005 | PULSE 결과는 정확히 `B XOR (r ⊗ c)`이며 선택 교차점 외 셀은 바뀌지 않는다. 동일 PULSE 두 번은 원상 복구되고 펄스 순서는 최종 결과에 영향을 주지 않는다. | board·session | exhaustive/property tests | 활성 |
| INV-006 | 모든 유효 보드에서 최소 펄스 수는 `rank_GF2(current XOR target)`와 같고, 정규 분해를 합성하면 차이 행렬과 비트 단위로 일치한다. | algebra·hint·grade | 3×3 전수 brute-force, 4×4~8×8 property test, factorization round-trip | 활성 |
| INV-007 | 출시 콘텐츠와 생성 퍼즐은 비자명하고 해결 가능하며 저장된 `par`가 재계산 랭크와 같다. 잘못된 퍼즐은 런타임에 도달하지 않는다. | content·generator | `validate:levels`, generator audit | 활성 |
| INV-008 | 동일 `UTC date + generatorVersion + domain string`은 브라우저·OS·재실행과 무관하게 동일한 직렬화 퍼즐을 만든다. | daily generator | golden vectors, 다중 런 반복, Playwright timezone matrix | 활성 |
| INV-009 | 이미 공개된 Daily는 기존 generator version으로 재생성된다. 알고리즘 변경은 version 증가와 과거 버전 구현 또는 frozen fallback을 동반한다. | generator·archive | version snapshot, archive regression | 활성 |
| INV-010 | 한 사용자 입력은 최대 한 번의 논리 PULSE와 한 개 `PulseMove`만 만든다. 완료 이벤트와 완료 기록도 퍼즐 세션당 한 번만 확정된다. | reducer·UI·storage | rapid-input component/E2E, reducer idempotency test | 활성 |
| INV-011 | 저장 데이터는 schema version과 runtime guard를 통과한 뒤에만 사용한다. 손상·구버전 데이터는 앱 중단 없이 격리·마이그레이션·기본값 복구된다. | storage | migration fixtures, corrupt JSON tests, E2E reload | 활성 |
| INV-012 | Lab·Daily 시간은 명세된 visibility 정책을 따르고 Sprint는 `sessionEndAt` 절대 시각을 사용한다. 백그라운드 전환으로 Sprint 시간이 연장되지 않는다. | clock·session·sprint | fake clock tests, Playwright visibility test | 활성 |
| INV-013 | 공유 텍스트·URL·PNG·Web Share payload에 목표/현재 보드, 선택 마스크, 원시 이동 이력이 포함되지 않는다. Signal Signature만 허용된 파생 표현을 사용한다. | sharing | payload snapshot, 금지 필드 검사, 이미지 fixture 수동 검토 | 활성 |
| INV-014 | GitHub Pages 하위 base path, Hash Router, manifest `start_url/scope`, service worker scope가 일치하며 캐시 완료 후 핵심 게임이 오프라인에서 열린다. | app·PWA·deployment | base-path E2E, offline E2E, 실제 URL smoke | 활성 |
| INV-015 | 모든 핵심 흐름은 키보드로 완료 가능하고, 인터랙티브 타깃은 44×44 CSS px 이상이며, 상태는 색·사운드·모션 하나만으로 전달되지 않는다. | UI 전역 | axe, 키보드 E2E, computed-size test, 수동 SR·색각 검사 | 활성 |
| INV-016 | 한국어·영어 사용자 노출 문자열은 i18n key로 관리되고 누락 key·빈 번역·컴포넌트 하드코딩이 0건이다. | UI·sharing·manifest | locale key parity, lint rule, visual fixtures | 활성 |
| INV-017 | v1.0 런타임은 백엔드, 외부 AI API, 원격 분석, 광고, 외부 폰트 CDN, 핫링크 자산에 의존하지 않는다. | architecture·network | ADR review, build/network smoke, CSP·request audit | 활성 |
| INV-018 | 테스트 삭제·skip 증가·표본 축소·커버리지/성능 임계치 하향으로 실패를 숨기지 않는다. 변경 시 이유와 사용자 승인을 남긴다. | 전역 | diff review, CI config review, test count snapshot | 활성 |
| INV-019 | 배포 자산은 출처·저작자·라이선스·수정 여부가 `docs/ASSET_LICENSES.md`에 등록되어 있고 사용 권한이 불명확한 자산은 포함하지 않는다. | public·assets·audio | asset inventory script, 수동 라이선스 검토 | 활성 |
| INV-020 | 릴리스 시 활성 P0·P1 결함과 미해결 불변식 위반은 0건이다. | M10·M11 | `docs/QA_REPORT.md`, issue 목록, release checklist | 활성 |

## 정확성 불변식의 최소 테스트 집합

```text
INV-005: pulse involution + commutativity + exact affected cells
INV-006: 3×3 512행렬 전수 + canonical factorization round-trip
INV-007: 6 tutorial + 48 Lab + Daily audit 전부 validate
INV-008: golden seed vectors + timezone/browser 반복
INV-010: rapid click/keyboard input에서도 move 1건
INV-013: 공유 payload 금지 필드 0건
```
