# M11 — Release Freeze, Documentation & Hackathon Submission ★

- **상태**: 미시작
- **담당 범위**: v1.0 동결, 공개 문서·라이선스, 제출 링크·썸네일·영상·Codex 설명
- **최종 갱신**: 2026-08-09
- **공식 제출 마감**: 2026-08-26

## 1. 맥락과 목표

검증된 release candidate를 변경 불가능한 v1.0 제출물로 고정하고, 심사자가 링크를 열어 10초 안에 플레이를 시작하며 3분 안에 코어 규칙·완성도·Codex 협업을 이해할 수 있는 패키지를 만든다. 이 phase에서는 새 기능보다 링크·표현·권리·재현성의 오류를 막는다.

## 2. 범위

### 포함

- feature/dependency freeze와 final bug triage
- README, LICENSE, asset credits, privacy/about, release notes
- `v1.0.0` tag, commit SHA, production artifact hash
- 공개 gameplay URL final smoke
- 200자 이내 소개문
- 16:9 JPG/PNG 썸네일(권장 10MB 이하)
- 최대 3분 데모 영상
- Codex 활용 설명과 증거 링크
- 제출 전후 백업·체크·기록

### 제외

- 새 모드·레벨·규칙·의존성
- 제출 당일 디자인 개편
- 서버·분석·계정 추가
- 앱 스토어 배포

## 3. 진입조건 (DoR)

- [ ] M10 DoD 통과, 공개 RC URL과 QA 승인 존재.
- [ ] 활성 P0·P1·불변식 위반 0건.
- [ ] 2026-08-23 기능·의존성 동결 상태.
- [ ] 저장소 LICENSE와 모든 자산 권리 결정 완료.
- [ ] 제출 계정·양식 접근과 영상 업로드 위치 준비.
- [ ] `docs/SUBMISSION_PACKAGE.md`의 공식 필드가 최신 안내와 대조됨.

## 4. 입력·산출물 계약

### 입력

- M10 승인 RC commit·public URL·QA_REPORT
- 최종 게임 로고·공유 카드 fixture
- `docs/CODEX_COLLABORATION.md` 기록
- 공식 제출 양식 요구사항

### 산출물

- `v1.0.0` annotated tag와 GitHub Release
- 최종 gameplay URL
- 16:9 thumbnail 원본·제출본
- 3분 이하 demo 영상과 자막/대본
- 200자 이하 소개문 ko/en 관리본
- Codex 활용 설명
- 완성된 `docs/SUBMISSION_PACKAGE.md`, `docs/RELEASE_NOTES.md`, `docs/RELEASE_CHECKLIST.md`
- source ZIP·artifact hash·제출 완료 캡처

## 5. 작업 순서

1. 기능·의존성 freeze를 확인하고 허용 변경을 P0/P1·문서·제출 자산으로 제한한다.
2. README·LICENSE·ASSET_LICENSES·About·Privacy·release notes를 최종 검토한다.
3. clean checkout에서 final CI와 production smoke를 실행한다.
4. `v1.0.0` tag·release artifact·hash를 고정한다.
5. 소개문·썸네일·영상·Codex 설명을 gameplay와 같은 commit 기준으로 제작한다.
6. 제출 URL을 새 프로필·모바일·외부 네트워크에서 다시 연다.
7. 양식에 입력한 모든 필드를 다른 검토자가 대조한다.
8. 제출 후 확인 화면, 입력 문구, 파일 hash, 일시를 문서에 남긴다.

## 6. 참조

- **불변식**: INV-001, INV-002, INV-013~020
- **ADR**: 채택 ADR 전부
- **기술 백서**: §9~11
- **디자인 백서**: Share Card, thumbnail, 결과·첫 화면
- **문서**: `docs/QA_REPORT.md`, `docs/RELEASE_CHECKLIST.md`, `docs/SUBMISSION_PACKAGE.md`, `docs/CODEX_COLLABORATION.md`, `docs/ASSET_LICENSES.md`, `docs/RELEASE_NOTES.md`
- **공식 안내**: `https://openaigame2026.com/#main`

## 7. DoD — 완료 게이트

- [ ] **DOD-01 — Freeze 무결성**: RC 승인 이후 새 기능·규칙·대형 의존성 변경 0건. 변경된 파일은 허용 목록과 연결된다.
- [ ] **DOD-02 — Final CI**: `v1.0.0` 대상 commit의 full CI가 green이고 M10 기준 hash·수치에서 설명 없는 퇴행이 없다. E4. (INV-018)
- [ ] **DOD-03 — Final URL**: 외부 로그인 없이 desktop·mobile 새 프로필에서 gameplay URL이 열리고 첫 플레이가 2회 이내 주요 액션으로 시작된다. 핵심 route·offline·share smoke 통과. E4. (INV-014)
- [ ] **DOD-04 — Release 식별성**: tag, commit SHA, deployed artifact SHA-256, build timestamp, production URL이 release notes와 submission 문서에서 동일하다.
- [ ] **DOD-05 — 저장소 완결성**: README에 소개·규칙·조작·로컬 실행·테스트·배포·접근성·라이선스·Codex 협업 링크가 있다. LICENSE가 실제 선택과 일치한다.
- [ ] **DOD-06 — 자산 권리**: 최종 build·README·thumbnail·video의 모든 외부 자산이 `docs/ASSET_LICENSES.md`에 등록되고 미확인 권리 0건. (INV-019)
- [ ] **DOD-07 — 소개문**: 제출 필드의 문자 제한을 실제 양식 기준으로 통과하고 게임 규칙·짧은 세션·Daily·공유 중 핵심이 과장 없이 전달된다.
- [ ] **DOD-08 — 썸네일**: 16:9 JPG/PNG, 권장 파일 크기 이내, 작은 미리보기에서도 Target·Axis·Pulse가 읽히며 실제 게임 화면과 일치한다.
- [ ] **DOD-09 — 데모 영상**: 총 길이 3:00 이하, 0:10 안에 코어 훅, 실제 플레이, Daily/공유, 접근성·모바일, Codex 협업과 검증이 포함되고 사용한 빌드가 v1.0.0이다.
- [ ] **DOD-10 — Codex 설명**: Codex가 생성·수정한 작업, 사람이 결정한 규칙·큐레이션, 실제 테스트·커밋을 구분한다. 허위 자동화·코드 비율 주장이 없다.
- [ ] **DOD-11 — 제출 대조**: URL, 소개문, thumbnail, video, repository visibility, contact 필드를 2인 또는 2회 독립 검토로 대조한다.
- [ ] **DOD-12 — 제출 기록**: 제출 완료 일시·확인 화면·입력 최종본·파일 hash를 `docs/SUBMISSION_PACKAGE.md`에 기록한다.
- [ ] **DOD-13 — 결함 0**: 제출 시 활성 P0·P1과 불변식 위반 0건, 승인 없는 P2 0건. (INV-020)
- [ ] **DOD-14 — 백업**: source archive, final static artifact, thumbnail, video, 문구, SHA-256 manifest가 두 위치 이상에 보관된다.

## 8. 검증 명령

```bash
npm ci
npm run verify
npm run test:e2e
npm run test:a11y
npm run audit:network
npm run audit:assets
npm audit --audit-level=high
npm run build
npm run smoke:production -- --url "$PRODUCTION_URL"
git status --short
git rev-parse HEAD
git tag --points-at HEAD
sha256sum dist-*.zip submission/*
```

Windows 환경에서는 동등한 PowerShell hash 명령을 `docs/ENVIRONMENT.md`에 기록한다.

## 9. 수동 검증

| 대상 | 절차 | 기대 결과 | 증거 |
|---|---|---|---|
| 외부 네트워크·새 프로필 | 제출 URL 클릭→한 판→share | 로그인 없이 성공 | 영상/체크표 |
| 모바일 | 양식/QR에서 URL 접속 | 첫 화면·PULSE·결과 정상 | 영상 |
| 제출 미리보기 | 소개·thumbnail·video 재생 | 잘림·오류 링크 없음 | 캡처 |
| 독립 검토 | SUBMISSION_PACKAGE와 양식 비교 | 모든 필드 동일 | 검토자 기록 |

## 10. 증거

```text
아직 없음.
```

## 11. 롤백 계획

- 제출 전 치명 결함 발견 시 새 `v1.0.1` 또는 `v1.0.0-rc.N` commit을 만들고 모든 hash·영상·문서를 다시 맞춘다. 기존 tag를 이동하지 않는다.
- Pages 배포 실패 시 마지막 green artifact와 미러 정적 호스팅 사용 가능성을 검토하되 제출 URL 변경을 문서와 양식에 즉시 반영한다.
- 제출 후 수정은 공식 허용 범위와 마감 상태를 확인하고 기록한다.

## 12. 리스크·미지수

- 공식 양식 필드·파일 제한이 변경될 수 있으므로 제출 당일 재확인 필요.
- service worker가 최종 영상·심사 환경에서 구버전을 제공할 위험.
- 영상과 실제 배포 commit 불일치.
- 공개 저장소의 라이선스·자산 문서 누락.

## 13. STOP 트리거

- final URL 접속 실패 또는 다른 commit 제공.
- P0/P1·불변식·라이선스 문제 발견.
- 영상·썸네일이 실제 게임 기능과 다름.
- 공식 양식 요구와 패키지가 불일치함.
- 마감 당일 새 기능을 넣어야 한다는 요청.

## 14. 완료 후 인계

- `PROGRESS.md` 상태를 `v1.0 제출 완료`로 변경한다.
- 제출 시각·확인 정보·tag·SHA·URL을 고정한다.
- 이후 수정은 v1.0.1 별도 phase/ADR로 시작하고 제출 당시 증거를 덮어쓰지 않는다.
