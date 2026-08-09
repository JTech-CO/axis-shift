# ADR-0006: 공유는 `signature-v1` 기반 스포일러 없는 Signal Signature를 사용한다

- **상태**: 채택
- **결정일**: 2026-08-09
- **최종 검토**: 2026-08-09
- **관련 phase**: M07, M09~M11
- **관련 불변식**: INV-008, INV-013, INV-016
- **관련 문서**: `docs/TECHNICAL_WHITEPAPER.md` §1.3, §4.7

## 1. 맥락

Daily 결과가 SNS에서 비교 가능해야 하지만 목표 보드나 실제 행·열 선택을 그대로 공유하면 다른 사용자의 퍼즐을 망친다. 단순 점수만으로는 AXIS//SHIFT 고유의 시각 정체성이 약하다.

## 2. 결정

공유에는 allowlisted 성과 정보와 SHA-256 기반 `signature-v1` 추상 패턴만 포함한다. 목표·현재 보드, masks, raw move sequence, session ID는 텍스트·URL·PNG·Web Share payload에서 금지한다.

```text
signatureInput =
  "axis-shift|signature-v1|" + puzzleId + "|" +
  normalizedMoveSequence + "|" + grade + "|" + elapsedBucket
```

해시를 복원 불가능한 3×5 또는 5×5 문자·도형 패턴으로 매핑한다.

## 3. 세부 계약

- sharing module은 `ShareResult` allowlist만 받는다.
- signature version은 공개 후 의미를 바꾸지 않는다.
- 동일 입력은 동일 signature를 만든다.
- URL은 public puzzle/date route만 포함한다.
- 텍스트는 색에 의존하지 않는 문자 glyph를 사용한다.
- PNG에는 브랜드·성과·signature·URL만 포함한다.

## 4. 근거

결과 카드가 사용자별로 달라 수집·공유 동기를 만들면서도 정답 정보는 직접 드러나지 않는다. 해시 기반이므로 동일 풀이 비교와 클라이언트 생성이 가능하다.

## 5. 결과와 트레이드오프

### 이점

- Daily 스포일러 방지
- 브랜드 고유 시각 결과
- 서버 없이 결정적 생성
- 텍스트·이미지 모두 지원

### 비용·제약

- signature가 실제 전략을 사람이 읽을 수는 없음
- raw moves를 hash input으로 사용하므로 정규화 계약을 장기 유지해야 함
- 암호학적 해시가 개인정보 보호를 자동 보장하는 것은 아니므로 식별자는 애초에 입력 금지
- 새 디자인은 version 증가 필요

## 6. 검토한 대안

| 대안 | 장점 | 기각 또는 보류 이유 |
|---|---|---|
| 목표 보드 이모지 | 직관적 | 정답 직접 노출 |
| 실제 PULSE 이력 요약 | 전략 비교 | 해답 유출 가능 |
| 점수 텍스트만 | 안전·단순 | 시각적 공유 가치 낮음 |
| 랜덤 장식 패턴 | 다양함 | 같은 결과 비교·결정성 없음 |

## 7. 검증·집행

- share-safe TypeScript DTO
- 금지 필드 serialization 검사
- signature golden vectors
- 텍스트·URL·PNG snapshot과 수동 스포일러 리뷰
- version string lint

## 8. 변경 조건

실제 사용자 테스트에서 signature가 의도치 않게 해답을 유추하게 하거나 공유 가치가 없다고 반복 관찰될 때 `signature-v2`를 새로 제안한다. v1 결과는 유지한다.
