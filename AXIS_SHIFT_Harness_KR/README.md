# AXIS//SHIFT Harness Expand Pack — KR

**버전**: 1.0.0  
**작성일**: 2026-08-09  
**프로젝트**: AXIS//SHIFT — A Daily Tensor Puzzle  
**대상 에이전트**: OpenAI Codex 우선, Claude Code 호환  
**상태**: M00·M01·M02 및 H00 완료 / M03 진입 전

AXIS//SHIFT를 여러 세션에 걸쳐 구현하더라도 게임 규칙, 수학적 정확성, 디자인 품질, 검증 기준이 표류하지 않도록 만든 다중 파일 작업 하네스다. 이 팩은 단순 작업 목록이 아니라 다음을 분리해 관리한다.

- 에이전트 계약과 레드라인
- 프로젝트 불변식
- phase별 진입조건(DoR)·완료 게이트(DoD)
- 증거 기반 상태 인계
- 아키텍처 결정 기록(ADR)
- 반복 장애 대응 런북
- 기술·디자인·수학·환경·QA·릴리스 문서

## 1. 원본 KR 확장팩에서 적용한 변경

이 폴더는 `JTech-CO/Schema-Hub/Harness/Pack/KR`의 구조와 운영 규율을 기반으로 AXIS//SHIFT에 맞게 인스턴스화했다.

1. 원본은 Claude Code 자동 로드 문서인 `CLAUDE.md`를 중심으로 한다. 본 프로젝트는 Codex가 주 개발 도구이므로 `AGENTS.md`를 단일 계약 원본으로 추가하고, `CLAUDE.md`는 이를 읽도록 하는 호환 진입점으로 유지했다.
2. 원본 README는 `docs/`를 참조하지만 KR 저장소의 골격 파일은 `docx/README.md`에 위치한다. 본 팩에서는 문서 의도에 맞춰 경로를 `docs/`로 정규화했다.
3. 원본의 범용 M0 예시는 제거하지 않고 프로젝트별 12개 phase로 구체화했다.
4. 기술·디자인 백서 원문을 `docs/`에 포함하고, 파일 경계·환경·수학·추적성·플레이테스트·QA·제출 문서를 추가했다.
5. 모든 `{{...}}` 자리표시는 실제 프로젝트 값으로 채웠다. 자리표시는 `_TEMPLATE.md` 파일에만 남는다.

## 2. 설치 위치

실제 프로젝트는 하네스를 하위 가이드 폴더로 유지하고, 부모 디렉터리를 Git·구현 루트로 사용한다.

```text
axis-shift/                         # PROJECT_ROOT: Git·구현 루트
├── AGENTS.md                       # 하네스 진입 브리지
├── AXIS_SHIFT_Harness_KR/          # HARNESS_ROOT: phase·불변식·증거
│   ├── AGENTS.md
│   ├── HARNESS.md
│   ├── INVARIANTS.md
│   ├── PROGRESS.md
│   ├── phases/
│   ├── decisions/
│   ├── gates/
│   └── docs/
├── docs/                           # 원본 제품 백서
├── prototypes/                     # M00 폐기 가능한 구현
├── src/                            # M01 이후 제품 코드
├── public/
├── tests/
├── scripts/
└── package.json
```

`src/`, `prototypes/`, 제품 설정과 빌드 산출물은 항상 `PROJECT_ROOT`에 둔다. 하네스는 개발 중 가이드와 증거 기록에만 사용하고, M11 릴리스 준비와 프로젝트 오너 승인 전에는 삭제하지 않는다.

## 3. 파일 지도

| 파일 | 역할 | 변경 빈도 |
|---|---|---:|
| `AGENTS.md` | Codex 최우선 저장소 계약, 매 세션 행동, 레드라인, 명령 색인 | 드묾 |
| `CLAUDE.md` | Claude Code 호환 진입점. 계약 원본은 `AGENTS.md` | 드묾 |
| `HARNESS.md` | 세션 루프, 증거 규칙, STOP, 변경 통제, 검증 우선순위 | 드묾 |
| `INVARIANTS.md` | `INV-nnn` 불변식. 1건 위반 시 해당 phase와 릴리스 통과 금지 | 드묾 |
| `PROGRESS.md` | 현재 phase, 직전 작업, 다음 할 일, 증거와 막힘을 인계 | 매 세션 |
| `RUNBOOK.md` | 반복 장애의 증상 → 원인 → 최소 조치 | 성장 |
| `GLOSSARY.md` | 사람과 에이전트가 동일한 용어를 사용하도록 고정 | 가끔 |
| `gates/DOD_GUIDE.md` | DoR·DoD 작성법, 증거 수준, 공통 명령, 예외 정책 | 드묾 |
| `phases/_TEMPLATE.md` | 신규 phase 작성 템플릿 | 고정 |
| `phases/M00…M11.md` | 단계별 범위, 산출물, DoD, 검증, 롤백, 위험 | 작업 중 |
| `decisions/_TEMPLATE.md` | ADR 템플릿 | 고정 |
| `decisions/0001…0007.md` | 이미 백서에서 채택한 핵심 설계 결정 | 결정 변경 시 |
| `docs/TECHNICAL_WHITEPAPER.md` | 전체 기술 명세 | 기준 변경 시 |
| `docs/DESIGN_WHITEPAPER.md` | 전체 UI/UX·디자인 시스템 명세 | 기준 변경 시 |
| `docs/FILE_TREE.md` | 저장소 트리, 패키지 책임, import 허용·금지 | 구조 변경 시 |
| `docs/ENVIRONMENT.md` | Node·npm·명령·CI·배포 환경 계약 | 도구 변경 시 |
| `docs/PUZZLE_MATH.md` | `GF(2)` 규칙, 최소해 증명, 구현·테스트 오라클 | 수학 변경 시 |
| `docs/REQUIREMENTS_TRACEABILITY.md` | 요구사항 → phase → 모듈 → 테스트 → 불변식 연결 | 기능 변경 시 |
| `docs/CODEX_COLLABORATION.md` | Codex 활용·사람 결정·검증 증거 기록 | 매 작업 묶음 |
| `docs/PLAYTEST_PROTOCOL.md` | 규칙 이해도·첫 성공·관찰 기록 절차 | 플레이테스트 시 |
| `docs/QA_REPORT.md` | 테스트 결과와 알려진 위험의 릴리스 보고서 | 릴리스 전 |
| `docs/RELEASE_CHECKLIST.md` | 상용 웹 게임 수준의 최종 승인표 | 릴리스 전 |
| `docs/SUBMISSION_PACKAGE.md` | 해커톤 제출물과 3분 시연 패키지 | 제출 전 |
| `docs/ASSET_LICENSES.md` | 이미지·폰트·음원·아이콘 출처와 라이선스 | 자산 추가 시 |
| `docs/RELEASE_NOTES.md` | 버전·의존성·배포 URL·커밋 해시 | 릴리스 시 |
| `MANIFEST.sha256` | 배포 패키지 파일 무결성 검증용 SHA-256 목록 | 패키징 시 |

## 4. Phase 의존 순서

```text
M00 Rule Proof
  ↓
M01 Production Scaffolding
  ↓
H00 Hackathon Submission Slice (한시적 v0.1 lane)
  ↓ 제출 후 정규 roadmap 복귀
M02 Board & GF(2) Core
  ↓
M03 Generator & Content Pipeline
  ↓
M04 Session, Persistence & Scoring
  ↓
M05 Design System & Shared UI
  ↓
M06 Tutorial & Lab
  ↓
M07 Daily & Archive
  ↓
M08 Sprint
  ↓
M09 Sharing, PWA, i18n & Feedback
  ↓
M10 Integration QA & Deployment
  ↓
M11 Release Freeze & Submission
```

원칙적으로 한 번에 한 phase만 진행한다. 다만 M03의 콘텐츠 후보 생성과 M05의 시각 fixture 제작처럼 코드 경계가 독립적이고 선행 DoR이 모두 충족된 작업은 사용자가 명시적으로 허용한 경우에만 병렬화한다.

## 5. 세션 프로토콜

### 시작

1. `AGENTS.md`
2. `PROGRESS.md`
3. 현재 `phases/Mnn_*.md`
4. 해당 phase가 참조하는 `INVARIANTS.md`, `decisions/`, `docs/`
5. 작업 시작 전 DoR 체크

### 작업

- 한 번에 한 phase와 하나의 검증 가능한 작업 묶음만 다룬다.
- 핵심 로직 수정은 실패 재현 테스트 또는 속성 테스트를 먼저 만든다.
- 가장 작은 관련 게이트를 먼저 돌리고, phase 종료 시 해당 phase 전체 게이트를 실행한다.
- “빌드 성공”과 “기능 실효”를 구분한다.

### 종료

1. phase 파일의 체크박스와 증거를 갱신한다.
2. `PROGRESS.md`에 완료·다음 작업·미결·최근 게이트를 남긴다.
3. Codex가 기여한 작업은 `docs/CODEX_COLLABORATION.md`에 기록한다.
4. 아키텍처·공개 규칙·스키마 변경은 ADR을 남긴다.
5. 커밋·푸시·PR은 사용자의 명시적 지시 범위에서만 수행한다.

## 6. 완료의 정의

AXIS//SHIFT에서 완료는 다음 세 조건을 동시에 만족하는 상태다.

1. 해당 phase의 DoD가 전부 통과한다.
2. 참조한 모든 불변식이 위반되지 않는다.
3. 재현 가능한 명령과 핵심 출력이 phase 파일과 `PROGRESS.md`에 기록된다.

수동 시연만 있고 자동 검증이 가능한 항목을 자동화하지 않았거나, 테스트·수치를 낮춰 통과시킨 경우 완료로 인정하지 않는다.

## 7. 첫 실행

현재 시작점은 `PROGRESS.md`와 다음 정규 phase인 `phases/M03_generator_content.md`다. M00·M01·M02와 한시적 H00 v0.1 제출 lane은 완료됐으며, M03은 자신의 원래 DoR를 충족한 뒤 별도 오너 지시로 착수한다. H00 완료는 정규 M03~M11 완료를 뜻하지 않는다.
