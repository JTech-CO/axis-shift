# AXIS//SHIFT — A Daily Tensor Puzzle

텐서와 이진 행렬의 연산 원리를 수학 지식 없이 조작할 수 있는 짧은 웹 퍼즐 게임입니다.

## 플레이

**[브라우저에서 M00 퍼즐 플레이하기](https://jtech-co.github.io/axis-shift/)**

현재 공개 빌드는 M00 규칙 검증용 프로토타입입니다. 쉬움·보통·어려움의 4×4·5×5·6×6 조합을 플레이할 수 있으며, 정식 사용자 테스트와 프로덕션 전환 전까지 구조와 콘텐츠가 변경될 수 있습니다.

M01 생산 AppShell은 [해시 라우트](https://jtech-co.github.io/axis-shift/#/)에서 확인할 수 있습니다. 아직 완성된 게임 화면이 아니며 M00 플레이 링크와 분리되어 있습니다.

## 프로덕션 스캐폴딩

Node.js 24.x와 npm 11.x를 사용합니다.

```bash
npm ci
npm run dev
npm run verify
npm run build:pages
npm run test:pages
```

`build:pages`는 Vite AppShell과 기존 M00 브라우저 runtime을 `pages-dist/`에 조립합니다. 이 폴더는 Git에 넣지 않고 GitHub Actions artifact로 배포합니다.

## M00 프로토타입 실행

```bash
node prototypes/rule-proof/verify-fixture.mjs
node prototypes/rule-proof/serve.cjs
```

그다음 `http://127.0.0.1:4173/`을 엽니다.

## 라이선스

최종 공개 라이선스가 결정될 때까지 이 저장소의 package는 `private: true`·`UNLICENSED`로 유지됩니다. 명시적인 라이선스 부여 전에는 코드 재사용 권한이 허여되지 않습니다.
