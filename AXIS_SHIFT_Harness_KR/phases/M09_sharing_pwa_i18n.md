# M09 — Sharing, PWA, i18n, Settings & Feedback ★

- **상태**: 미시작
- **담당 범위**: 스포일러 없는 결과 공유, PNG, 한·영, 설정, 사운드·햅틱, PWA·오프라인
- **최종 갱신**: 2026-08-09

## 1. 맥락과 목표

완성된 게임 모드에 재방문·바이럴·설치 품질을 추가한다. 공유 결과는 비교할 정보만 담고 정답이나 실제 축 선택은 노출하지 않으며, 모든 기능은 외부 서버·CDN 없이 동작하고 오프라인에서도 핵심 플레이가 가능해야 한다.

## 2. 범위

### 포함

- `signature-v1` SHA-256 Signal Signature
- 텍스트 공유, Web Share, Clipboard, textarea 폴백
- Canvas 1080×1080·1200×630 PNG
- ko/en locale, key parity, locale persistence
- Settings·About·Credits·Privacy 설명
- theme, reduced motion, sound, volume, haptics, keyboard hints
- Web Audio 합성 피드백과 Vibration 기능 감지
- manifest, icons, service worker, precache, update prompt, offline
- CSP·network request audit

### 제외

- 동영상 replay, 글로벌 결과 통계
- 외부 폰트·음원·분석 SDK
- 앱 스토어 래핑
- 사용자 식별자·계정 공유

## 3. 진입조건 (DoR)

- [ ] M08 DoD 통과.
- [ ] 결과 모델별 공유 허용 필드 allowlist가 문서화됨.
- [ ] Signal Signature 입력 정규화 계약과 `signature-v1`이 ADR-0006과 일치.
- [ ] ko/en copy 초안과 자산 라이선스 정책 준비.
- [ ] GitHub Pages base·manifest start_url/scope 값이 환경별로 계산 가능.
- [ ] INV-001, INV-008~019 확인.

## 4. 입력·산출물 계약

### 입력

- Lab/Daily/Sprint result view model
- 허용 공유 필드: 브랜드, public puzzle label, grade, pulse/par, elapsed bucket/display, hint flag, non-identifying signature, public URL
- 금지 공유 필드: target/current rows, row/column masks, raw moves, session ID, storage data, 사용자 식별자

### 산출물

```text
src/services/sharing/signature.ts
src/services/sharing/share-text.ts
src/services/sharing/share-image.ts
src/services/sharing/share-adapter.ts
src/services/audio/*
src/services/haptics/*
src/services/pwa/*
src/features/settings/*
src/features/about/*
src/i18n/ko.ts
src/i18n/en.ts
public/manifest.webmanifest
public/icons/*
```

- share text·PNG golden fixtures
- PWA install·offline·update E2E
- locale key parity report

## 5. 작업 순서

1. result model을 share-safe DTO allowlist로 변환하는 경계를 만든다.
2. 정규화 move summary와 SHA-256 `signature-v1`을 구현한다.
3. 텍스트·URL·Web Share·Clipboard 폴백을 구현한다.
4. Canvas 카드 2개 비율과 font fallback을 구현한다.
5. ko/en key·formatting·locale detection/persistence를 연결한다.
6. Settings와 system preference adapter를 구현한다.
7. Web Audio·Vibration을 사용자 gesture·설정 뒤에 연결한다.
8. manifest·service worker·precache·update prompt를 구성한다.
9. 실제 base path에서 offline·update·network·spoiler 검증을 실행한다.

## 6. 참조

- **불변식**: INV-001, INV-008~019
- **ADR**: ADR-0003~0007
- **기술 백서**: §2.4, §4.7~9, §5.3~4, §7, §8.3~4
- **디자인 백서**: Result·Share Card·Settings·About·motion·accessibility
- **문서**: `docs/ASSET_LICENSES.md`, `docs/REQUIREMENTS_TRACEABILITY.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — Share-safe 경계**: sharing 모듈은 raw `GameSession`·`PuzzleDefinition`을 직접 받지 않고 allowlisted `ShareResult`만 받는다. 금지 필드 static/type test 통과. (INV-013)
- [ ] **DOD-02 — Signature 결정성**: 동일 puzzle ID·정규화 풀이·grade·elapsed bucket은 같은 signature, 허용 입력이 달라지면 golden vector 기준으로 예상 패턴이 달라진다. Node·3 browser 일치. (INV-008)
- [ ] **DOD-03 — 스포일러 0건**: 텍스트, URL, Web Share payload, PNG metadata와 픽셀 fixture 검토에서 target/current board, masks, raw move sequence가 노출되지 않는다. E3+E1. (INV-013)
- [ ] **DOD-04 — 폴백 완전성**: files share → text share → clipboard → selectable textarea 각 capability matrix에서 사용자가 결과를 획득할 수 있다. API 실패가 게임 결과를 잃게 하지 않는다.
- [ ] **DOD-05 — PNG 출력**: 1080×1080과 1200×630 PNG가 정확한 크기, 투명하지 않은 배경, safe area, ko/en 긴 문자열, font fallback에서 생성된다. 일반 모바일 500ms 목표 측정치를 QA에 기록한다.
- [ ] **DOD-06 — i18n parity**: ko/en key set 동일, 빈 번역·raw key 노출·컴포넌트 하드코딩 0건. 숫자·날짜·시간은 locale formatter를 사용한다. (INV-016)
- [ ] **DOD-07 — 설정 지속성**: locale/theme/sound/volume/haptics/reduced motion/high contrast/keyboard hints가 즉시 적용되고 reload 후 검증된 값으로 복구된다. 손상 값은 default로 복구한다. (INV-011)
- [ ] **DOD-08 — 피드백 선택성**: AudioContext는 첫 gesture 후에만 생성, sound/haptics off에서는 호출 0건, API 미지원에서도 기능 흐름이 동일하다. 상태 정보는 시각·텍스트로 유지된다. (INV-015)
- [ ] **DOD-09 — PWA 범위**: manifest `start_url`, `scope`, Vite base, service worker scope가 동일 repository path에 있고 root를 가로채지 않는다. (INV-014)
- [ ] **DOD-10 — 오프라인**: 최초 온라인 방문·precache 후 네트워크 차단 상태에서 홈, Tutorial, Lab, 오늘 Daily 생성, 진행 저장·재시작이 가능하다. E3. (INV-014, INV-017)
- [ ] **DOD-11 — 업데이트 안전성**: 새 worker는 자동 강제 reload하지 않고 update prompt를 보인다. 진행 세션 저장 후 사용자가 승인할 때만 적용되고 새 버전 후 resume 또는 안전 복구된다.
- [ ] **DOD-12 — 외부 요청 0건**: production build의 핵심 플레이·공유·설정 중 same-origin 정적 asset 외 네트워크 요청, cookie, remote analytics가 0건이다. E3. (INV-017)
- [ ] **DOD-13 — 자산 권리**: icon·font·image·sound source가 `docs/ASSET_LICENSES.md`에 등록되고 미확인 자산 0건. 합성음은 생성 방식과 권리 메모를 기록한다. (INV-019)
- [ ] **DOD-14 — 접근성**: Share·Settings·update prompt를 키보드·스크린리더로 완료하고 axe serious/critical=0. 200% zoom과 360px overflow=0. (INV-015)
- [ ] **DOD-15 — 문서 정합성**: privacy·offline 한계·공유 필드·설정·PWA 갱신 정책을 About, docs, 추적표, `PROGRESS.md`에 반영한다.

## 8. 검증 명령

```bash
npm run test -- src/services/sharing src/services/audio src/services/haptics src/services/pwa src/i18n src/features/settings
npm run test:share:fixtures
npm run test:i18n
npm run test:e2e -- tests/e2e/sharing.spec.ts tests/e2e/offline.spec.ts tests/e2e/pwa-update.spec.ts
npm run test:a11y -- --grep "Share|Settings|About"
npm run audit:network
npm run audit:assets
npm run build
```

## 9. 수동 검증

| 환경 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| Android Web Share | Daily 결과 PNG 공유 | 파일/텍스트 또는 안전 폴백 | 녹화 |
| iOS Safari 상당 | text/clipboard fallback | 결과 획득 가능 | 체크표 |
| 설치 PWA | offline 실행·update prompt | 핵심 플레이·안전 갱신 | 녹화 |
| ko/en 공유 카드 | 긴 문자열 포함 두 크기 | 잘림·스포일러 없음 | PNG fixture |
| Reduced Motion/Sound Off | 전체 1회 플레이 | 기능 정보 손실·음향 호출 없음 | 체크표 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- signature version은 공개 후 수정하지 않고 새 version을 추가한다.
- service worker 회귀 시 등록을 일시 중단하는 안전 배포를 준비하되 오프라인 DoD를 충족하기 전 M09 완료로 보지 않는다.
- 자산 문제는 해당 자산을 제거하고 로컬 SVG·시스템 폰트·합성음으로 복구한다.

## 12. 리스크·미지수

- 브라우저별 Web Share files 지원 차이.
- Canvas font metric·emoji 렌더링 차이.
- service worker 캐시가 제출 직전 구버전을 유지할 위험.
- signature 입력에 raw move sequence의 정보가 지나치게 반영될 가능성.

## 13. STOP 트리거

- 공유 출력에서 정답·mask·raw move를 유추 가능한 형태로 노출함.
- service worker scope가 repository path 밖으로 나감.
- 외부 런타임 요청 없이는 구현할 수 있다고 판단됨.
- 사용 권한 불명확한 자산이 필수로 남음.
- offline/update가 진행 기록을 손상함.

## 14. 다음 phase 인계

- production share fixtures와 PWA cache manifest
- ko/en 완성 문자열과 자산 inventory
- network request baseline
- M10 실제 URL에서 재검증할 offline·update·share 절차
