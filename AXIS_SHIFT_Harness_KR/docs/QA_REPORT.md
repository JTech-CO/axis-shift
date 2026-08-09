# AXIS//SHIFT QA Report

**문서 버전**: 1.0.0  
**상태**: 미실행 템플릿 — M10에서 실제 값 입력  
**최종 갱신**: 2026-08-09

> 빈 항목은 통과를 의미하지 않는다. 명령·환경·commit·artifact가 연결되지 않은 값은 릴리스 증거가 아니다.

## 1. 릴리스 메타데이터

| 항목 | 값 |
|---|---|
| Release candidate | M10에서 입력 |
| Commit SHA | M10에서 입력 |
| Build time UTC | M10에서 입력 |
| Production URL | M10에서 입력 |
| CI run | M10에서 입력 |
| QA 시작/종료 | M10에서 입력 |
| Node/npm | M10에서 입력 |
| Generator version | M10에서 입력 |
| Storage schema | v1 예정 |
| 검증자 | M10에서 입력 |

## 2. 최종 판정

- **판정**: NOT EVALUATED
- **활성 P0**: 미집계
- **활성 P1**: 미집계
- **불변식 위반**: 미집계
- **승인된 P2 waiver**: 없음
- **M11 진입 가능**: 아니오 — M10 미실행

승인 조건:

```text
P0=0
P1=0
INV violation=0
필수 CI·production smoke=green
미승인 P2=0
```

## 3. Phase 게이트 요약

| Phase | 핵심 증거 | 목표 | 실제 | 상태 |
|---|---|---|---|---|
| M00 | 신규 사용자 이해도 | 4/5 first pulse 30s, solve 90s | 미실행 | NOT RUN |
| M01 | verify·boundary | all green, violation fixture blocked | 미실행 | NOT RUN |
| M02 | 3×3 전수 | 512, mismatch=0 | 미실행 | NOT RUN |
| M03 | content·Daily audit | 54 valid, 3650 days clean | 미실행 | NOT RUN |
| M04 | reducer·storage | duplicate=0, migration matrix pass | 미실행 | NOT RUN |
| M05 | UI·a11y | 360px, 44px, axe 0 | 미실행 | NOT RUN |
| M06 | Tutorial·Lab | 54 playable, final playtest pass | 미실행 | NOT RUN |
| M07 | Daily·Archive | timezone/version parity | 미실행 | NOT RUN |
| M08 | Sprint | exact 180000ms, score reproducible | 미실행 | NOT RUN |
| M09 | share·PWA·i18n | spoiler 0, offline, key parity | 미실행 | NOT RUN |
| M10 | full deployment | E4 + P0/P1 0 | 미실행 | NOT RUN |

## 4. 자동 테스트 결과

| Suite | Command | Cases/Scope | Passed | Failed | Duration | Artifact |
|---|---|---:|---:|---:|---:|---|
| Lint | `npm run lint` | — | — | — | — | — |
| Format | `npm run format:check` | — | — | — | — | — |
| Type | `npm run typecheck` | — | — | — | — | — |
| Unit/Component | `npm run test` | — | — | — | — | — |
| Coverage | `npm run test:coverage` | — | — | — | — | — |
| Math exhaustive | `npm run test:math:exhaustive` | 512 matrices | — | — | — | — |
| Level validation | `npm run validate:levels` | 54 levels | — | — | — | — |
| Daily audit | `npm run audit:daily` | 3,650 dates | — | — | — | — |
| E2E | `npm run test:e2e` | 3 browsers | — | — | — | — |
| Accessibility | `npm run test:a11y` | routes/fixtures | — | — | — | — |
| Visual | `npm run test:visual` | viewport/theme matrix | — | — | — | — |
| Network | `npm run audit:network` | production flows | — | — | — | — |
| Assets | `npm run audit:assets` | source inventory | — | — | — | — |

## 5. 수학·콘텐츠 정확성

| 지표 | 필수 기준 | 실제 |
|---|---:|---:|
| 3×3 matrices | 512 | — |
| BFS vs rank mismatch | 0 | — |
| factorization mismatch | 0 | — |
| pulse invariant failure | 0 | — |
| Tutorial count/invalid | 6 / 0 | — |
| Lab count/invalid | 48 / 0 | — |
| Daily audited dates | 3,650 | — |
| Daily exception | 0 | — |
| wrong Par | 0 | — |
| adjacent duplicate target | 0 | — |
| fallback usage | 보고·승인 | — |
| audit normalized SHA-256 | 기록 | — |

## 6. 브라우저·기기 matrix

| 환경 | Version/device | Core flow | Share | PWA/offline | A11y | 상태/증거 |
|---|---|---|---|---|---|---|
| Chromium desktop | — | — | — | — | — | NOT RUN |
| Firefox desktop | — | — | — | — | — | NOT RUN |
| WebKit desktop | — | — | — | — | — | NOT RUN |
| Android Chrome | — | — | — | — | — | NOT RUN |
| iOS Safari 상당 | — | — | — | — | — | NOT RUN |
| Keyboard-only | — | — | — | n/a | — | NOT RUN |
| Screen reader | — | — | — | n/a | — | NOT RUN |

## 7. Viewport·테마 matrix

| Viewport | Dark | Light | High Contrast | Reduced Motion | Overflow | 상태 |
|---|---|---|---|---|---|---|
| 360×640 | — | — | — | — | — | NOT RUN |
| 390×844 | — | — | — | — | — | NOT RUN |
| 768×1024 | — | — | — | — | — | NOT RUN |
| 1024×768 | — | — | — | — | — | NOT RUN |
| 1440×900 | — | — | — | — | — | NOT RUN |
| 200% zoom | — | — | — | — | — | NOT RUN |

## 8. 접근성 결과

| 항목 | 기준 | 실제 | 상태 |
|---|---|---|---|
| axe serious/critical | 0 | — | NOT RUN |
| keyboard complete flow | pass | — | NOT RUN |
| target computed size | >=44×44 | — | NOT RUN |
| result focus | heading | — | NOT RUN |
| dialog focus trap/return | pass | — | NOT RUN |
| color-independent state | pass | — | NOT RUN |
| reduced motion parity | pass | — | NOT RUN |
| screen reader comprehension | pass | — | NOT RUN |
| ko/en long text | no clipping | — | NOT RUN |

수동 점검에는 환경·단계·검증자·캡처 경로를 기록한다.

## 9. 성능·용량

| 지표 | 백서 목표/상한 | 환경 | 실제 | 판정 |
|---|---:|---|---:|---|
| Initial JS gzip | 180KB 목표 / 230KB 상한 | — | — | NOT RUN |
| Initial CSS gzip | <=35KB | — | — | NOT RUN |
| First-screen assets | <=1MB | — | — | NOT RUN |
| App shell/content cache | <=4MB | — | — | NOT RUN |
| LCP | <=2.0s 목표 | — | — | NOT RUN |
| INP | <=200ms 목표 | — | — | NOT RUN |
| CLS | <=0.05 | — | — | NOT RUN |
| Input feedback | <=50ms | — | — | NOT RUN |
| Generator | <=50ms 목표 / 200ms 상한 | — | — | NOT RUN |
| Rank/factorization | <=10ms 목표 | — | — | NOT RUN |
| Share PNG | <=500ms 목표 | — | — | NOT RUN |

성능 목표를 넘었다고 자동 P0/P1은 아니지만, 사용자 흐름 영향과 P2 waiver 여부를 기록해야 한다.

## 10. 저장·복구·시간

| Scenario | 기대 | 실제 | 상태 |
|---|---|---|---|
| valid v1 round-trip | deep equal | — | NOT RUN |
| invalid JSON | isolate/default | — | NOT RUN |
| future schema | backup/no overwrite | — | NOT RUN |
| write failure/quota | memory play continues | — | NOT RUN |
| resume selecting | exact recovery | — | NOT RUN |
| resume pulsing | last stable state | — | NOT RUN |
| normal hidden time | excluded | — | NOT RUN |
| Sprint hidden/reload | endAt unchanged | — | NOT RUN |
| SW update mid-session | save then user apply | — | NOT RUN |

## 11. 공유·스포일러

| 출력 | 금지 필드 검사 | 크기/형식 | 실제 환경 | 상태 |
|---|---|---|---|---|
| Text | target/current/masks/raw moves 0 | UTF-8 | — | NOT RUN |
| URL | public route only | valid | — | NOT RUN |
| Web Share files | allowlist only | PNG+text | — | NOT RUN |
| Clipboard | allowlist only | text | — | NOT RUN |
| 1:1 PNG | visual/manual | 1080×1080 | — | NOT RUN |
| 16:9 PNG | visual/manual | 1200×630 | — | NOT RUN |

## 12. PWA·배포

| 항목 | 기준 | 실제 | 상태 |
|---|---|---|---|
| Pages public URL | login-free | — | NOT RUN |
| Hash direct routes | no server 404 | — | NOT RUN |
| manifest start_url/scope | base path parity | — | NOT RUN |
| service worker scope | repository only | — | NOT RUN |
| installability | pass | — | NOT RUN |
| offline core | pass after cache | — | NOT RUN |
| update prompt | no forced reload | — | NOT RUN |
| post-deploy Daily hash | golden match | — | NOT RUN |
| artifact↔commit | one-to-one | — | NOT RUN |

## 13. 보안·개인정보·자산

| 검사 | 기준 | 실제 | 상태 |
|---|---|---|---|
| Secret scan | 0 | — | NOT RUN |
| High severity dependency | 0 또는 승인 조치 | — | NOT RUN |
| External runtime requests | 0 | — | NOT RUN |
| Cookies | 0 | — | NOT RUN |
| Personal identifiers | 0 | — | NOT RUN |
| CSP | self-first | — | NOT RUN |
| Unregistered assets | 0 | — | NOT RUN |
| Unknown licenses | 0 | — | NOT RUN |

## 14. 결함 목록

| ID | Severity | Summary | Reproduction | Owner | Status | Fix/waiver |
|---|---|---|---|---|---|---|
| — | — | 아직 집계되지 않음 | — | — | — | — |

## 15. P2 Waiver

현재 없음. waiver는 문제·영향·우회·만료·사용자 승인을 포함하고 `RELEASE_NOTES.md`에 노출한다.

## 16. 회귀 비교

| Metric/artifact | Baseline | Current | Difference | 설명 |
|---|---|---|---|---|
| Test count | — | — | — | — |
| Coverage | — | — | — | — |
| Daily audit SHA | — | — | — | — |
| Bundle size | — | — | — | — |
| Visual baseline | — | — | — | — |
| Public URL | — | — | — | — |

## 17. 승인

| 역할 | 이름/식별 | 판정 | 일시 | 비고 |
|---|---|---|---|---|
| 개발 검증 | — | — | — | — |
| UX/플레이 | — | — | — | — |
| QA/릴리스 | — | — | — | — |
| 프로젝트 오너 | — | — | — | — |

M10 완료 전 이 문서를 PASS로 바꾸지 않는다.
