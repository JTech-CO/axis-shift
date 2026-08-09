# AXIS//SHIFT 문서 세트

**버전**: 1.0.0  
**상태**: Pre-Production  
**최종 갱신**: 2026-08-09

> 루트 하네스가 “어떻게 진행·검증하는가”를 정의한다면, 이 디렉터리는 “무엇을 만들며 어떤 계약을 지키는가”를 정의한다.

## 1. 문서 권한

저장소 내부 문서가 충돌할 때 다음 순서를 따른다.

```text
AGENTS.md·HARNESS.md·INVARIANTS.md
→ 채택 ADR
→ 현재 phase의 명시적 게이트
→ TECHNICAL_WHITEPAPER·DESIGN_WHITEPAPER
→ 보조 docs
→ 코드 주석
```

- 공개 규칙·수학·스키마·아키텍처를 바꾸려면 ADR과 관련 백서를 함께 갱신한다.
- 현재 구현 상태와 다음 작업은 `../PROGRESS.md`가 단일 진실 공급원이다.
- 문서가 구현과 다르면 조용히 코드에 맞추지 않고 불일치 원인을 확인한다.

## 2. 문서 지도

| 문서 | 역할 | 주요 독자 | 갱신 시점 |
|---|---|---|---|
| `TECHNICAL_WHITEPAPER.md` | 제품 범위, 아키텍처, 데이터, 알고리즘, 테스트, 배포 | 개발·QA | 공개 기술 계약 변경 |
| `DESIGN_WHITEPAPER.md` | UX 원칙, 화면, 컴포넌트, 토큰, 반응형, 접근성 | 디자인·FE·QA | 디자인 계약 변경 |
| `FILE_TREE.md` | 파일 책임, public entrypoint, import allow/deny | 개발 에이전트 | 구조 변경 |
| `ENVIRONMENT.md` | Node·npm·브라우저·CI·Pages 실행 계약 | 개발·배포 | 도구·환경 변경 |
| `PUZZLE_MATH.md` | `GF(2)` 규칙, Par 증명, canonical factorization, 오라클 | 도메인 개발·검증 | 수학 계약 변경 |
| `REQUIREMENTS_TRACEABILITY.md` | 요구사항 → phase → 모듈 → 테스트 → INV | PM·QA | 기능·테스트 변경 |
| `CODEX_COLLABORATION.md` | Codex 기여와 사람 결정을 검증 증거로 기록 | 심사·개발 | 작업 묶음마다 |
| `PLAYTEST_PROTOCOL.md` | 신규 사용자 이해도·완료 시간·공유 의향 측정 | UX·QA | 테스트 전후 |
| `QA_REPORT.md` | 릴리스 후보의 자동·수동 검증 결과 | QA·릴리스 | M10·M11 |
| `RELEASE_CHECKLIST.md` | 출시 차단 항목과 최종 승인 | 릴리스 담당 | RC·v1.0 |
| `SUBMISSION_PACKAGE.md` | 행사 제출 필드, 썸네일, 영상, 최종 대조 | 제출 담당 | M11 |
| `ASSET_LICENSES.md` | 자산 출처·저작자·권리·수정·포함 위치 | 개발·법적 검토 | 자산 추가 즉시 |
| `RELEASE_NOTES.md` | 버전별 기능·제약·빌드·배포 정보 | 사용자·릴리스 | 태그마다 |

## 3. Phase별 필독 순서

| Phase | 필독 문서 |
|---|---|
| M00 | 기술 §1·2.2, 디자인 첫 사용자·게임 화면, `PLAYTEST_PROTOCOL.md` |
| M01 | 기술 §3·6·9, `FILE_TREE.md`, `ENVIRONMENT.md`, ADR-0001·0004·0007 |
| M02 | 기술 §4.3·8.1, `PUZZLE_MATH.md`, ADR-0001·0002 |
| M03 | 기술 §4.4·4.5, `PUZZLE_MATH.md`, ADR-0003 |
| M04 | 기술 §2.3.3~5·4.6, `FILE_TREE.md` |
| M05 | 디자인 전반, 기술 §5, `ASSET_LICENSES.md` |
| M06 | 기술 §2.2, 디자인 Home·Tutorial·Lab·Result, `PLAYTEST_PROTOCOL.md` |
| M07 | 기술 §4.4·4.6, ADR-0003 |
| M08 | 기술 §2.2.5~6. 정확한 점수식은 별도 사람 결정 필요 |
| M09 | 기술 §4.7~9·5.3~4, 디자인 Share·Settings·About, ADR-0005~0007 |
| M10 | `REQUIREMENTS_TRACEABILITY.md`, `QA_REPORT.md`, `RELEASE_CHECKLIST.md` |
| M11 | `SUBMISSION_PACKAGE.md`, `CODEX_COLLABORATION.md`, `ASSET_LICENSES.md`, `RELEASE_NOTES.md` |

## 4. 상태 표기

- **계약**: 구현이 반드시 따라야 하는 확정 문서.
- **초안**: 방향은 있으나 사람 결정 또는 실제 결과가 남아 있음.
- **실행 기록**: 명령·수치·환경을 포함하는 결과 문서.
- **템플릿**: 실제 값을 채우기 전에는 통과 근거가 아님.

현재 기술·디자인 백서는 v1.0 제품 계약 초안이며, M00 Scope Lock과 각 ADR을 통해 공개 계약을 확정한다. `QA_REPORT.md`와 제출·릴리스 문서는 아직 미실행 템플릿이다.

## 5. 갱신 규율

1. 기능 요구가 바뀌면 기술/디자인 백서와 추적표를 같은 변경에서 갱신한다.
2. 수학·seed·storage·route·sharing field·module boundary 변경은 ADR을 먼저 작성한다.
3. 실제 테스트 결과를 목표값 칸에 덮어쓰지 않는다. 목표와 측정 결과를 분리한다.
4. 날짜·브라우저·빌드 SHA가 없는 QA 수치는 릴리스 증거로 사용하지 않는다.
5. 외부 자산은 코드에 넣기 전에 `ASSET_LICENSES.md`에 등록한다.
6. 개인 이름·이메일·원본 영상 등 플레이테스트 개인정보를 저장소에 넣지 않는다.
7. Markdown 링크와 코드 경로는 M10 전 문서 검사 script로 검증한다.

## 6. 문서 빌드·검사 권장 명령

M01 이후 다음 script를 제공한다.

```bash
npm run docs:lint
npm run docs:links
npm run check:traceability
npm run audit:assets
```

- `docs:lint`: Markdown 구조·중복 heading·trailing space 검사
- `docs:links`: 저장소 내부 상대 링크·파일 경로 검사
- `check:traceability`: 요구사항 ID의 phase/test 연결 누락 검사
- `audit:assets`: 실제 public/src asset과 라이선스 inventory 대조
