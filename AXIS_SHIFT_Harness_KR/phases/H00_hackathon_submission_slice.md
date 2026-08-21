# H00 — Hackathon Submission Slice ★

- **상태**: 완료 — DOD-01~12 통과, 공개 v0.1 prerelease와 submission-ready 패키지 고정
- **담당 범위**: M00 프로토타입 콘텐츠 가시성, AXIS 연출, 제출용 v0.1 공개 슬라이스
- **최종 갱신**: 2026-08-21
- **목표 릴리스**: `v0.1.0-hackathon` / 2026-08-26

## 1. 맥락과 목표

정규 M02~M11 전체를 5일 안에 완료했다고 주장하지 않으면서, M00에서 사람에게 통과한 규칙을 심사 가능한 공개 게임으로 강화한다. 베타 피드백의 우선순위인 플레이 분량과 AXIS 고유 인과 연출을 기존 무의존 프로토타입에 한정해 구현한다.

## 2. 범위

### 포함

- 여섯 기존 profile × 고정 campaign signal 3개 이상, 총 18개 이상의 재현 가능한 진행
- campaign 다음 신호·다음 stage CTA와 기존 랜덤 새 신호의 구분
- 선택 행·열 진행선, 교차점 preview, PULSE charge/impact, 완료 Signal Lock
- 320~960px, 키보드, reduced motion, forced colors 회귀
- 기존 Pages artifact bridge, 공개 URL smoke, 정직한 v0.1 제출 문서·자산

### 제외

- M02 프로덕션 도메인 코어와 M03 Tutorial 6·Lab 48 완료 주장
- Daily, Archive, Sprint, 저장, 공유 PNG, PWA, 완전한 ko/en
- 3D, 외부 런타임 자산, 대형 의존성, 백엔드, 분석
- `v1.0.0`, M10 또는 M11 완료 주장

## 3. 진입조건 (DoR)

- [x] M00 DOD-01~07이 2026-08-16 n=5 E1과 증거 제한을 포함해 완료됐다.
- [x] M01 DOD-01~09와 Pages artifact baseline이 완료됐다.
- [x] ADR-0010이 오너의 피드백 우선순위·5일 일정 지시를 반영해 채택됐다.
- [x] 기준 commit `b0f935e396805bab9c0847847068cb9a3522968f`, Pages run `31733835031`, 공개 URL이 고정됐다.
- [x] 기존 활성 P0/P1·불변식 위반은 보고되지 않았고 INV-001~002, 004~006, 014~015, 017~020을 확인했다.
- [x] 새 외부 자산·의존성 없이 기존 DOM/CSS/JS로 구현할 수 있다.

## 4. 입력·산출물 계약

### 입력

- `prototypes/rule-proof/`의 여섯 profile, `m00-seeded-v1`, verifier 200,967개·browser 573개 baseline
- M00-R1의 콘텐츠량·AXIS 연출·2D 표현 피드백
- ADR-0010의 allowlist와 freeze 계약

### 산출물

- campaign signal 카탈로그와 URL 재현·진행 UI
- AXIS/PULSE/Signal Lock 상태·CSS 연출
- 확장 verifier·browser smoke·Pages artifact 증거
- H00 실제 공개 SHA·URL과 v0.1 제출 자료

## 5. 작업 순서

1. profile별 고정 seed 3개와 중복·canonical·route fixture를 먼저 추가한다.
2. campaign 진행·랜덤 반복 CTA를 구현하고 전체 signal을 자동 완주한다.
3. 기존 선택 mask에서 행·열·교차점 시각 상태를 파생하고 모션을 추가한다.
4. reduced motion·forced colors·키보드·viewport 회귀를 확장한다.
5. 전체 로컬 게이트 후 고정 SHA를 Pages에 배포하고 공개 E4를 기록한다.
6. 실제 동일 SHA 화면으로 썸네일·영상·제출 필드를 고정한다.

## 6. 참조

- **불변식**: INV-001~002, INV-004~006, INV-014~015, INV-017~020
- **ADR**: `decisions/0010-m00-prototype-hackathon-slice.md`
- **기술 백서**: §1.2, §2.2, §12
- **디자인 백서**: TensorGrid·AxisToggle·PULSE·motion·첫 사용자 흐름
- **추적성**: `docs/REQUIREMENTS_TRACEABILITY.md`의 H00 제출 슬라이스 절

## 7. DoD — 완료 게이트

- [x] **DOD-01 — 범위 경계**: 변경이 allowlist에 머물고 `src/domain`, 새 모드·규칙·dependency 변경이 0건이다. M02~M11은 미완료 상태를 유지한다. (INV-003, INV-018)
- [x] **DOD-02 — 콘텐츠 깊이**: 기존 여섯 profile마다 고정·재현 가능한 서로 다른 signal 3개 이상, 총 18개 이상이 UI에서 도달·완주 가능하다. profile 내부 target 중복 0, 저장 Par·canonical 합성 오류 0이며 이를 Lab 48로 부르지 않는다. 증거 수준 E3. (INV-004~007)
- [x] **DOD-03 — 코어 회귀**: 기존 verifier `assertions>=200967`, `failures=0`, 65,536 BFS와 browser `assertions>=573`, `consoleErrors=0` 기준을 낮추지 않고 새 검증을 추가한다. 증거 수준 E3. (INV-005~006, INV-018)
- [x] **DOD-04 — AXIS 인과**: 선택 행·열 진행선과 비색상 교차점 preview가 보이고, PULSE 중 두 축 전파와 교차점 반전, 완료 Signal Lock이 논리 상태와 분리돼 동작한다. 모션 on/off 보드 결과가 같다. 증거 수준 E2. (INV-005, INV-010, INV-015)
- [x] **DOD-05 — 모션·입력 접근성**: reduced motion에서 장식 sweep/scale을 제거하거나 80ms 이하로 줄이고 기능·텍스트·ARIA 상태를 유지한다. 키보드로 전체 signal을 풀 수 있고 핵심 타깃은 44px 이상이다. 증거 수준 E2. (INV-015)
- [x] **DOD-06 — 반응형**: 320×640, 360×640, 390×844, 960px에서 가로 overflow·grid/PULSE/result 가림이 0건이다. 증거 수준 E2+E1. (INV-015)
- [x] **DOD-07 — 자산·네트워크**: 새 외부 런타임 요청·권리 불명 자산·secret이 0건이다. (INV-001, INV-017, INV-019)
- [x] **DOD-08 — 재현 빌드**: `npm ci`, `npm run verify`, prototype verifier/smoke, `npm run build:pages`, `npm run test:pages`가 clean checkout에서 exit 0이다. 증거 수준 E3.
- [x] **DOD-09 — 공개 E4**: 고정 SHA artifact가 GitHub Pages에 배포되고 새 desktop/mobile profile에서 root·stage/signal/seed·직접 prototype·M01 `/#/` bridge가 오류 없이 동작한다. (INV-014, INV-020)
- [x] **DOD-10 — 결함**: 활성 P0/P1·불변식 위반 0건이며 P2 유예는 DOD_GUIDE 절차를 따른다. (INV-018, INV-020)
- [x] **DOD-11 — 릴리스 정직성**: tag·SHA·artifact hash·URL·README·영상의 기능 주장이 일치하고 Prototype/`v0.1`로 표기된다.
- [x] **DOD-12 — 제출 패키지**: release/tag SHA와 동일한 공개 화면의 16:9 썸네일, 3분 이하 영상, Codex/사람 역할, 자산 권리, 2회 필드 대조, submission-ready 패키지 검토 캡처와 2중 백업을 고정한다. 공식 양식 제출 확인 화면은 오너 작업이다.

## 8. 검증 명령

```powershell
node prototypes/rule-proof/verify-fixture.mjs
node prototypes/rule-proof/verify-h00-campaign.mjs
node prototypes/rule-proof/serve.cjs
# 별도 터미널: NODE_PATH/BROWSER_EXECUTABLE을 설정하고 browser-smoke.cjs
node prototypes/rule-proof/browser-smoke.cjs
npm run verify
npm run build:pages
npm run test:pages
npm run test:a11y
```

## 9. 수동 검증

| 환경/대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 390×844 mobile Chrome 상당 | 신호 18 canonical 완료와 랜덤 CTA·결과 배치 육안 확인 | 가림·overflow 0, CTA 발견 가능 | `evidence/H00/h00-signal18-390x844.png` — PASS |
| 360×640 mobile | 신호 18 canonical 완료 전체 앱 육안 확인 | 6×6 grid·PULSE·결과 CTA 비중첩 | `evidence/H00/h00-campaign-360x640.png` — PASS |
| reduced motion | Playwright `reducedMotion=reduce`에서 18개 전체 키보드 완주 | 정보·결과 동일, 장식 0.01ms | browser smoke 891 단언 — PASS |
| 실제 Pages 새 프로필 | root→stage/signal/seed→M01 `/#/` | 404·console·외부 요청 0 | Pages run `32453169029`, 27/27 + browser 891 — PASS |

## 10. 증거

```text
일시: 2026-08-21
환경: Windows / Node v24.19.0 / npm 11.6.2 / Playwright Chromium

node prototypes/rule-proof/verify-fixture.mjs
exit=0
assertions=200967 bfsVisited=65536 legalPulseCount=225 failures=0

node prototypes/rule-proof/verify-h00-campaign.mjs
exit=0
campaignSignals=18 signalsPerStage=3 uniqueBoardPairs=18 assertions=217 failures=0

node prototypes/rule-proof/browser-smoke.cjs
exit=0
browserAssertions=891 viewport=320/360/390/960 campaignSignals=18 signalsPerStage=3
replay=result-cta axisChoreography=360ms+signal-lock
externalRequests=0 consoleErrors=0
screenshots=evidence/H00/h00-campaign-360x640.png,evidence/H00/h00-signal18-390x844.png

npm run verify
exit=0
scriptContract=14/14 unit=5/5 boundaries violations=0 cycles=0 secretFindings=0
build modules=41 pagesArtifact files=14 bytes=336182 prototypeFiles=10 steps=10

npm run test:pages
exit=0
chromium+firefox+webkit=27/27

npm run test:a11y
exit=0
a11yTargetAudit files=12 interactiveTargets=6 failures=0

scope audit: src/domain changes=0, dependency changes=0, new modes/rules=0
static review: invalid signal fallback, control replay/CTA, forced-colors, seed coupling을 수정; active P0/P1=0

release tag: v0.1.0-hackathon (GitHub prerelease)
release SHA: 6690f5778f706e1875b452d552bd75ba1c06ee9a
app capture SHA: 6690f5778f706e1875b452d552bd75ba1c06ee9a (same as release/tag SHA)
CI run: 32453169036 success
Pages run: 32453169029 success; deployed SHA=release SHA
Pages artifact digest: sha256:07a222cc7af5ad221e3d4be3524f53992cdf01823e6af56b7723c00282671998

clean checkout: Node v24.19.0; npm ci lock 일치; vulnerabilities=0
M00 verifier: assertions=200967 failures=0
H00 verifier: assertions=217 failures=0
npm run verify: steps=10; E2E=12/12; a11y failures=0
npm run test:pages: chromium+firefox+webkit=27/27
public browser smoke: assertions=891 externalRequests=0 consoleErrors=0

source archive SHA-256: 69d623eac50d186f52cb88e2dd451ebb4859fd475151dc76ad1a4e4c243b919a
Pages archive SHA-256: 34a0601312712a5d7fa20c544960975cdfe3e1b5a2795e65036bc38dae663f01
manifest SHA-256: ae37db3ed60b0c7a751865b3cc1e078a812fbc069335b02c6954cbd3043cd3b0
manifest audit: entries=14 failures=0
backup audit: `.private/submission/H00`와 `C:/Users/MSI/Documents/AXIS_SHIFT_H00_Backup/v0.1.0-hackathon` 각각 files=15, hashDelta=0
submission field checks: 2026-08-21 15:41:32 KST PASS; 2026-08-21 15:42:06 KST PASS
license: UNLICENSED / All Rights Reserved 유지
submission boundary: 제출 가능한 패키지까지 H00 완료. Google 계정·개인정보·동의가 필요한 공식 양식의 최종 Submit은 오너 작업이며 실행했다고 주장하지 않는다.
```

## 11. 롤백 계획

- H00 변경은 M00 프로토타입 파일과 문서에 한정하고 마지막 green Pages artifact SHA로 복구한다.
- campaign route는 기존 `stage`·`seed` URL 호환을 보존한다.
- 모션 제거 시 논리 PULSE와 정적 preview는 영향을 받지 않는다.

## 12. 리스크·미지수

- 18개 고정 signal이 정식 54개 콘텐츠로 오인될 수 있어 제출 copy를 제한한다.
- 모션이 6×6 모바일 성능이나 가독성을 해칠 수 있어 transform/opacity와 reduced motion만 사용한다.
- 공개 라이선스는 부여하지 않고 `UNLICENSED`를 유지했다. 공식 Google 양식의 개인정보·동의·최종 Submit은 오너 권한 경계에 남는다.

## 13. STOP 트리거

- 기존 verifier·browser 단언 수 또는 임계치를 낮춰야 통과할 수 있음.
- PULSE·Par·generator version·생산 경계를 변경해야 함.
- 2026-08-23 이후 신규 기능·dependency가 필요함.
- public URL, LICENSE, 제출 양식처럼 사람 권한 없이는 결론을 낼 수 있음.

## 14. 다음 phase 인계

H00은 submission-ready 패키지까지 완료됐으며 정규 roadmap을 진전시키지 않는다. 오너의 공식 Google 양식 최종 Submit 뒤에도 M02는 원래 DoR에서 시작하고 H00 프로토타입은 기준 fixture·UX 관찰로만 참고한다.