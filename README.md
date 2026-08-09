# AXIS//SHIFT — A Daily Tensor Puzzle

텐서와 이진 행렬의 연산 원리를 수학 지식 없이 조작할 수 있는 짧은 웹 퍼즐 게임입니다.

## 플레이

**[브라우저에서 AXIS//SHIFT 플레이하기](https://jtech-co.github.io/axis-shift/)**

현재 공개 빌드는 M00 규칙 검증용 프로토타입입니다. 쉬움·보통·어려움 세 단계를 연속으로 플레이할 수 있으며, 정식 사용자 테스트와 프로덕션 전환 전까지 구조와 콘텐츠가 변경될 수 있습니다.

## 로컬 실행

```bash
node prototypes/rule-proof/verify-fixture.mjs
node prototypes/rule-proof/serve.cjs
```

그다음 `http://127.0.0.1:4173/`을 엽니다.
