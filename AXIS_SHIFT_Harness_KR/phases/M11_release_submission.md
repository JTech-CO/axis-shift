# M11 — Release Freeze, Public Launch & Operations Handoff ★

> 파일명 `M11_release_submission.md`는 기존 참조 안정성을 위해 유지한다. 이 phase는 해커톤 제출이 아니라 일반 공개 런칭을 다룬다.

- **상태**: 미시작
- **담당 범위**: release freeze, 공개 문서·권리·개인정보, production 런칭, rollback 준비, 운영 인계
- **최종 갱신**: 2026-08-30

## 1. 맥락과 목표

M10에서 실제 production URL과 rollback까지 검증한 release candidate를 일반 사용자가 안정적으로 플레이할 수 있는 공개 릴리스로 동결한다. fixed SHA, release identifier, 배포 artifact, production URL과 문서를 하나의 launch manifest로 일치시키고, 외부 네트워크 post-deploy smoke와 운영 인계를 마쳐 정상적인 공개 런칭을 완료한다.

H00 `v0.1.0-hackathon`과 당시 제출 자산은 완료된 역사 기록이며 M11 완료 증거로 재사용하거나 수정하지 않는다. 기존 H00 호환 경로는 ADR-0013에 따라 별도 오너 폐기 승인 전까지 유지한다.

## 2. 범위

### 포함

- feature/dependency freeze와 final bug triage
- release version·출시일·최종 도메인·공개 라이선스에 대한 프로젝트 오너 결정 기록
- README, LICENSE, asset credits, privacy/about, release notes
- fixed SHA, immutable release identifier/tag, production artifact hash와 launch manifest
- 실제 production URL deploy·post-deploy smoke·PWA update 확인
- rollback 대상·절차·권한·담당자 확인
- known issues, P2/P3 후속 계획과 운영 인계
- source·artifact·manifest 백업과 런칭 기록

### 제외

- 새 모드·레벨·규칙·대형 의존성
- 런칭 직전 디자인 전면 개편
- 백엔드·계정·분석·광고·수익화 추가
- 앱 스토어 배포
- 행사 전용 패키지·홍보 자산

## 3. 진입조건 (DoR)

- [ ] M10 DoD 통과, 승인된 fixed-SHA RC·실제 production URL·QA_REPORT·rollback 증거가 존재함.
- [ ] 활성 P0·P1·불변식 위반 0건이며 P2 유예는 오너 승인을 가짐.
- [ ] 프로젝트 오너가 release freeze를 승인함.
- [ ] release version을 프로젝트 오너가 결정하고 기록함(결정 전 `TBD`, 임의 확정 금지).
- [ ] 출시일·launch window를 프로젝트 오너가 결정하고 기록함(결정 전 `TBD`).
- [ ] 최종 production domain/URL을 프로젝트 오너가 결정하고 기록함(결정 전 `TBD`).
- [ ] 공개 라이선스를 프로젝트 오너가 결정하고 저장소 LICENSE와 일치시킬 준비가 됨(결정 전 `TBD`).
- [ ] 모든 배포 자산 권리와 개인정보·storage·network 공개 내용이 검토됨.
- [ ] 배포·rollback 권한, last-green artifact와 운영 담당자가 준비됨.
- [ ] `docs/RELEASE_CHECKLIST.md`, `docs/RELEASE_NOTES.md`의 launch·운영 인계 섹션이 준비됨.

## 4. 입력·산출물 계약

### 입력

- M10 승인 RC commit·artifact·manifest·actual production URL·QA_REPORT
- M10 post-deploy와 rollback→recovery 증거
- `docs/CODEX_COLLABORATION.md`, `docs/ASSET_LICENSES.md`
- 프로젝트 오너가 승인한 version·출시일·domain·license 결정

### 산출물

- 오너가 결정한 immutable release identifier/tag와 release record
- final fixed SHA, static artifact hash, build timestamp와 production URL이 일치하는 launch manifest
- 실제 production URL과 post-deploy smoke 기록
- 최종 README, LICENSE, ASSET_LICENSES, About/Privacy, 사용자 지원·결함 제보 경로, RELEASE_NOTES, RELEASE_CHECKLIST
- P0/P1=0과 승인된 known issues 목록
- rollback target·권한·담당자·절차가 포함된 운영 인계 기록
- source archive·final static artifact·manifest의 백업 및 hash
- launch 시각·배포 run·smoke·승인 기록

## 5. 작업 순서

1. 오너가 version·출시일·최종 domain·공개 license를 결정하고 release freeze를 승인한다.
2. freeze 이후 변경을 P0/P1 수정, 승인된 P2, 문서·배포 메타데이터로 제한한다.
3. README·LICENSE·ASSET_LICENSES·About·Privacy·release notes를 최종 검토한다.
4. clean checkout에서 final CI와 M10 기준 회귀를 fixed SHA로 실행한다.
5. release identifier, commit, artifact hash, build timestamp와 URL을 launch manifest에 고정한다.
6. 최종 production target에 배포하고 외부 네트워크·새 프로필·모바일에서 post-deploy smoke를 실행한다.
7. manifest/service worker update, offline restart, share와 H00 호환 경로를 점검한다.
8. last-green rollback 대상·권한·절차·담당자와 장애 triage 연락 경로를 독립 검토한다.
9. known issues와 승인된 P2/P3 후속 작업을 운영 인계에 기록한다.
10. source·artifact·manifest를 백업하고 사람이 launch checklist를 승인한다.

## 6. 참조

- **불변식**: INV-001, INV-002, INV-011, INV-013~020
- **ADR**: 채택 ADR 전부, 특히 ADR-0013
- **기술 백서**: §9~11
- **디자인 백서**: first-run, 결과·공유, 반응형·접근성
- **문서**: `docs/QA_REPORT.md`, `docs/RELEASE_CHECKLIST.md`, `docs/CODEX_COLLABORATION.md`, `docs/ASSET_LICENSES.md`, `docs/RELEASE_NOTES.md`, `docs/ENVIRONMENT.md`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — Freeze 무결성**: RC 승인 이후 새 기능·규칙·대형 의존성 변경 0건이며 모든 변경 파일이 승인된 freeze 허용 목록과 연결된다.
- [ ] **DOD-02 — Final CI**: release 대상 fixed SHA의 full CI가 green이고 M10 기준 hash·수치에서 설명 없는 퇴행이 없다. E4. (INV-018)
- [ ] **DOD-03 — Production URL**: 외부 로그인·특수 헤더 없이 desktop·mobile 새 프로필에서 최종 URL이 열리고 Home·Tutorial·Lab·Daily·Archive·Sprint·Settings·About, offline restart와 share smoke가 통과한다. E4. (INV-014)
- [ ] **DOD-04 — Release 식별성**: 오너가 승인한 release identifier/tag, commit SHA, deployed artifact SHA-256, build timestamp와 production URL이 launch manifest·release notes·배포 기록에서 동일하다.
- [ ] **DOD-05 — 저장소·문서 완결성**: README에 소개·규칙·조작·로컬 실행·테스트·배포·접근성·개인정보·사용자 지원·결함 제보·라이선스·Codex 협업 링크가 있고 모든 링크가 유효하다.
- [ ] **DOD-06 — 라이선스·자산 권리**: 오너가 결정한 LICENSE가 실제 공개 조건과 일치하고 최종 build·README의 모든 외부 자산이 `docs/ASSET_LICENSES.md`에 등록되며 미확인 권리 0건이다. (INV-019)
- [ ] **DOD-07 — 개인정보·네트워크 공개**: About/Privacy와 README가 계정·쿠키·storage key·원격 요청·분석 여부를 실제 build와 일치하게 설명하고 개인 식별 데이터·미고지 외부 런타임 요청이 0건이다. (INV-001, INV-017)
- [ ] **DOD-08 — PWA update·offline**: final production scope·manifest·service worker가 launch manifest와 일치하고 이전 production artifact에서 update 후 최신 release가 로드되며 offline 핵심 플레이가 통과한다. (INV-014)
- [ ] **DOD-09 — 공유·저장 안전성**: production share payload의 스포일러 금지 정보 0건이고 valid/corrupt/future-version/update 저장 fixture가 데이터 손실 없이 정책대로 처리된다. (INV-011, INV-013)
- [ ] **DOD-10 — Rollback 준비**: last-green artifact·manifest·권한·담당자·실행 절차가 명시되고 M10의 실제 rollback→recovery 증거가 final target과 여전히 유효하다. launch 변경이 절차에 영향을 주면 재리허설한다.
- [ ] **DOD-11 — 운영 인계**: 배포·rollback·service worker cache·P0/P1 incident triage·known issues·후속 maintenance의 담당자와 절차가 RELEASE_CHECKLIST 또는 연결 문서에 기록되고 인수자가 확인한다.
- [ ] **DOD-12 — Post-deploy smoke**: launch 배포 후 외부 네트워크의 새 프로필·모바일에서 핵심 플로우를 재검증하고 deploy run, 실제 URL, 시간, 실행자와 결과를 기록한다. E4.
- [ ] **DOD-13 — H00 역사 보존**: H00 tag·commit·제출 증거는 변경하지 않고 정규 release artifact·완료 증거와 분리한다. 기존 호환 경로는 별도 오너 폐기 승인 없이는 유지한다. (ADR-0013)
- [ ] **DOD-14 — 결함 0**: 공개 런칭 시 활성 P0·P1과 불변식 위반 0건, 승인 없는 P2 0건이다. (INV-020)
- [ ] **DOD-15 — 백업·재현성**: source archive, final static artifact, launch manifest와 SHA-256 목록을 두 위치 이상에 보관하고 clean checkout에서 같은 artifact를 재현하거나 허용된 차이를 기록한다.
- [ ] **DOD-16 — Launch 승인**: release version·출시일·production URL·license, fixed SHA·artifact hash, QA·rollback·운영 인계가 RELEASE_CHECKLIST에서 프로젝트 오너의 최종 승인을 받는다.

## 8. 검증 명령

```bash
npm ci
npm run verify
npm run test:e2e
npm run test:a11y
npm run test:visual
npm run audit:network
npm run audit:assets
npm audit --audit-level=high
npm run build
npm run smoke:production -- --url "$PRODUCTION_URL"
git status --short
git rev-parse HEAD
git tag --points-at HEAD
```

artifact와 backup hash 명령은 `docs/ENVIRONMENT.md`에 기록한 운영체제별 절차를 사용하며, 결과를 launch manifest에 보존한다.

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 외부 네트워크·새 프로필 | production URL→first-run→한 판→share | 로그인·기존 storage 없이 성공 | 영상/체크표 |
| 실제 모바일 | production URL→PULSE→결과→reload | 가림·overflow 없이 정상 | 영상/체크표 |
| PWA update·offline | 이전 production 방문→launch 배포→update→offline 재시작 | 최신 release와 저장 기록 유지 | 캡처/체크표 |
| 접근성 표본 | keyboard+SR·200% zoom·Forced Colors 핵심 플로우 | M10 승인 상태 유지 | 체크표 |
| H00 호환 경로 | 기존 공개 경로 접속 | 승인 없는 폐기·404 없이 명시된 호환 동작 | smoke 로그 |
| rollback 운영 인계 | 담당자가 manifest로 last-green 식별→절차 dry run | 권한·명령·검증·복구 기준을 재현 가능 | 체크표/배포 로그 |
| 문서 독립 검토 | README·License·Privacy·release notes·manifest 대조 | build·URL·권리·데이터 설명이 동일 | 검토자 기록 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- launch manifest의 last-green commit·artifact hash를 production rollback 대상으로 사용한다.
- P0/P1 발견 시 신규 기능 작업을 중단하고 지정 담당자가 production을 last-green artifact로 되돌린 뒤 실제 URL·service worker·핵심 route를 smoke한다.
- 장애 발생·탐지·rollback·복구 시각, 영향, 배포 run과 후속 결함 ID를 RELEASE_CHECKLIST와 QA_REPORT에 기록한다.
- 수정 릴리스는 새 immutable commit·artifact·release identifier로 검증하며 기존 tag나 manifest를 이동·덮어쓰지 않는다.

## 12. 리스크·미지수

- final domain/DNS 또는 GitHub Pages cache가 검증한 artifact와 다른 응답을 제공할 위험.
- service worker가 launch 후 일부 사용자에게 구버전을 제공할 위험.
- version·출시일·domain·license 오너 결정이 늦어져 DoR를 충족하지 못할 가능성.
- release identifier·commit·artifact·URL 문서가 서로 표류할 위험.
- 개인정보·라이선스 문서와 실제 build가 불일치할 위험.
- 운영 담당자·rollback 권한·last-green artifact가 런칭 후 불명확해질 위험.

## 13. STOP 트리거

- release version·출시일·final domain·license 중 하나라도 오너 결정 없이 확정된 것처럼 기록됨.
- final production URL 접속 실패, 잘못된 artifact 제공 또는 rollback 불가.
- P0/P1·불변식·개인정보·라이선스 문제 발견.
- release identifier, commit, artifact hash와 URL이 일치하지 않음.
- PWA update가 저장 기록을 잃거나 오프라인 핵심 플레이가 실패함.
- 운영 담당자 또는 production deploy·rollback 권한을 확인할 수 없음.
- freeze 이후 새 기능·대형 의존성·공개 규칙 변경이 필요함.

## 14. 완료 후 인계

- `PROGRESS.md` 상태를 일반 공개 런칭 완료로 갱신한다.
- release identifier·fixed SHA·artifact hash·production URL·launch 시각과 최종 승인자를 launch manifest에 고정한다.
- 배포·rollback·incident triage·known issues·후속 maintenance의 담당자와 문서를 운영 인수자에게 넘긴다.
- 후속 수정은 별도 maintenance milestone/ADR과 새 immutable release로 진행하며 launch 당시 증거를 덮어쓰지 않는다.
- H00은 해커톤 제출 당시 상태의 역사 기록으로 보존하고 정규 제품 release line과 분리한다.
