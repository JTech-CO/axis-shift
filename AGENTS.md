# AGENTS.md — AXIS//SHIFT 작업공간 브리지

> 실제 Git 저장소와 구현 작업 루트는 이 파일이 있는 `AXIS SHIFT (Tensor)` 디렉터리다. `AXIS_SHIFT_Harness_KR/`는 phase·불변식·증거를 관리하는 개발 하네스이며 제품 구현을 담는 디렉터리가 아니다.

## 필수 읽기 순서

1. `AXIS_SHIFT_Harness_KR/AGENTS.md`
2. `AXIS_SHIFT_Harness_KR/PROGRESS.md`
3. `AXIS_SHIFT_Harness_KR/phases/`의 현재 phase
4. 현재 phase가 참조하는 하네스 문서·ADR·백서

## 경로 계약

- `PROJECT_ROOT`는 이 파일이 있는 Git 루트다.
- `HARNESS_ROOT`는 `PROJECT_ROOT/AXIS_SHIFT_Harness_KR`다.
- 제품 코드와 실행 산출물은 `PROJECT_ROOT`에 둔다: `src/`, `public/`, `tests/`, `scripts/`, `prototypes/`, `package.json` 및 도구 설정.
- phase·불변식·ADR·증거 문서는 `HARNESS_ROOT`에서 유지한다.
- 하네스 문서의 제품 경로(`src/...`, `prototypes/...` 등)는 별도 명시가 없으면 `PROJECT_ROOT` 기준이다.
- 제품 코드·프로토타입·빌드 설정을 `HARNESS_ROOT` 안에 만들지 않는다.
- 하네스 삭제는 M11 릴리스 준비와 프로젝트 오너 승인 전에는 수행하지 않는다.

## Git 계약

- 원격 저장소: `https://github.com/JTech-CO/axis-shift`
- 기본 브랜치: `main`
- 마일스톤 DoD와 증거 기록이 끝난 작업만 해당 마일스톤 단위로 commit·push한다.
- 현재 phase가 완료되지 않은 중간 상태는 사용자의 별도 지시 없이 push하지 않는다.
