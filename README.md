# AXIS//SHIFT — A Tensor Pulse Puzzle

텐서와 이진 행렬의 연산 원리를 수학 지식 없이 조작할 수 있는 짧은 웹 퍼즐 게임입니다.

## 플레이

**[현재 공개 Pages 열기](https://jtech-co.github.io/axis-shift/)**

**[마지막 배포의 H00 플레이 링크](https://jtech-co.github.io/axis-shift/prototypes/rule-proof/)**

현재 공개 URL은 문서에 기록된 마지막 성공 배포 `1608c26cf4e8d3ca6be2c3765b20fb00bc7b06b9`의 빌드를 제공합니다. 작업 트리의 M06 제품 플로우는 아직 fixed SHA로 원격 배포되지 않았으므로 위 링크에서 최신 로컬 구현을 플레이할 수 있다고 주장하지 않습니다. 마지막 배포에서 실제 퍼즐 플레이는 H00 호환 경로를 사용합니다.

H00 `v0.1`은 M00 사람 대상 규칙 게이트를 통과하고 18개 campaign signal을 제공한 해커톤 프로토타입입니다. 이 결과와 [`v0.1.0-hackathon`](https://github.com/JTech-CO/axis-shift/releases/tag/v0.1.0-hackathon) tag(`6690f5778f706e1875b452d552bd75ba1c06ee9a`)는 역사 기록으로 보존하며 현재 제품 완료 상태로 재해석하지 않습니다.

## 현재 개발 상태

ADR-0013에 따라 현재 목표는 해커톤 제출이 아니라 M06~M11의 게이트를 순서대로 통과한 일반 공개 웹 게임 출시입니다. 출시 version·날짜·최종 도메인·공개 라이선스는 프로젝트 오너 결정 전까지 `TBD`입니다.

M06 작업 트리에는 Home first-run·Continue, Tutorial 6, Lab 48, 실제 GameScreen의 Hint·Undo·Reset·Result·best·resume가 연결됐고 자동 E2/E3 체크포인트가 통과했습니다. 다만 최종 배포 후보의 신규 사용자 n≥5 DOD-03 E1, fixed-SHA 원격 CI와 공개 배포 증거가 없어 M06은 아직 완료가 아닙니다.

Daily·Archive는 M07, Sprint는 M08, 공유·PWA·완성된 한영 설정은 M09 범위이며 현재 공개 빌드에서 제공한다고 주장하지 않습니다.

## 프로덕션 스캐폴딩

Node.js 24.x와 npm 11.x를 사용합니다.

```bash
npm ci
npm run dev
npm run verify
npm run build:pages
npm run test:pages
```

`build:pages`는 현재 React 제품과 H00 legacy 공유 링크 호환 runtime을 `pages-dist/`에 조립합니다. 이 폴더는 Git에 넣지 않고 GitHub Actions artifact로 배포합니다.

## M03 생성기·콘텐츠 상태

M03 종료 검증 기준선은 다음과 같습니다. pre-close rehearsal은 역사 기록이며 아래 candidate exact-SHA 결과가 DOD-10의 권위 있는 증거입니다.

- Tutorial 6 + Lab 48, Lab chapter별 12개, fallback 14개
- PRNG 20 seed×첫 100출력, Chromium·Firefox·WebKit parity 9/9
- 2026-01-01부터 3,650일 Daily 감사: 예외·invalid·wrong Par·fallback·인접 중복·분포 실패 0
- catalog SHA-256 `c625d54327e5a6c3c6305a373d5199abd01c6fb69415161f9d4aee27c1738484`
- approval fingerprint `5a60604a91b51c88ab294701b7a1eb286b00700101643807c80d5d10d59b7e6a`
- 54개 패턴·progression 5행 프로젝트 오너 승인, evidence SHA-256 `B81406D8DCEE7214692426B112BB5941DBC319CC3FADD070F43F5638D9B0214F`
- candidate SHA `1c313bd29e1d24c483749af90a8734542988be5d`, clean detached worktree
- exact-SHA Daily output SHA-256 `997df1b01c8fee746168f6edebb2c549ad859da8f505e414e8eabdb918dd10b0`, report/JSON SHA-256 `b1102aee05f5e578894c13d36b0e14af9fb278d6e5af14efb9de49a480d96d49` — 서로 다른 출력 디렉터리 2회 동일
- exact-SHA parity 9/9, verify 10/10, npm audit vulnerabilities 0

재현 명령:

```bash
npm run generate:level-candidates -- --seed axis-shift-curation-v1
npm run validate:levels
npm run audit:daily -- --version v1 --days 3650 --start 2026-01-01
npm run test:e2e -- tests/e2e/generator-parity.spec.ts
```

프로젝트 오너는 2026-08-26 `AXIS_SHIFT_Harness_KR/evidence/M03/content-curation-v1.md`의 54개 패턴과 progression 5행을 전체 승인해 DOD-04를 통과시켰습니다. 일반 `npm run validate:levels`는 이 승인 metadata·approval fingerprint·machine scaffold가 어긋나면 fail-closed합니다. candidate exact-SHA 감사 2회까지 일치해 DOD-10과 M03도 완료됐습니다. Tutorial/Lab 제품 화면은 M06 구현 체크포인트에서 연결됐지만 DOD-03 E1과 원격 배포가 남아 있고, Daily 화면은 M07 범위입니다.

큐레이션 판단은 단일 `AXIS_SHIFT_Harness_KR/evidence/M03/content-curation-v1.md`에 둡니다. 기본 후보 재생성은 full manifest, 순서 있는 catalog, human 필드만 `PENDING`으로 정규화한 machine scaffold의 approval fingerprint가 정확히 일치할 때 승인 파일을 byte-preserve하고 `curation=preserved`를 출력합니다. catalog·manifest·scaffold가 바뀌면 stale 승인을 `PENDING`으로 되돌리고, 같은 fingerprint의 machine 편집은 fail-closed합니다. 명시적 `--reset-curation`도 승인을 초기화하므로 closure 재실행에서는 사용하지 않습니다.

`outputs/m03/`의 감사 JSON·Markdown·checksum은 재생성 가능한 로컬 산출물이므로 Git에 포함하지 않습니다.

## H00 역사 프로토타입 실행

```bash
node prototypes/rule-proof/verify-fixture.mjs
node prototypes/rule-proof/verify-h00-campaign.mjs
node prototypes/rule-proof/serve.cjs
```

그다음 `http://127.0.0.1:4173/`을 엽니다.

## 라이선스

현재 저장소에는 별도 공개 라이선스 승인이 없으므로 package는 `private: true`·`UNLICENSED`, 코드는 All Rights Reserved로 유지되며 `LICENSE` 파일을 추가하지 않았습니다. 명시적인 라이선스 부여 전에는 코드 재사용 권한이 허여되지 않습니다. 일반 공개 출시의 라이선스는 M11 진입 전 프로젝트 오너가 별도로 결정합니다.
