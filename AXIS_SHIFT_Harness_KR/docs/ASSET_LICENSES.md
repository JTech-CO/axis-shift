# AXIS//SHIFT Asset & License Registry

**문서 버전**: 1.0.0  
**상태**: Pre-Production inventory  
**최종 갱신**: 2026-08-09  
**관련 불변식**: INV-001, INV-002, INV-017, INV-019

## 1. 정책

- 출처·저작자·라이선스·수정 여부가 불명확한 자산은 source와 build에 넣지 않는다.
- 외부 URL hotlink와 runtime font/image/audio CDN을 사용하지 않는다.
- 자산은 가능하면 프로젝트 내 original SVG, CSS, Web Audio 합성음, system font로 만든다.
- 코드 라이브러리 라이선스와 시각·음향 자산 라이선스를 구분한다.
- 생성형 자산은 사용 도구·생성일·후처리·사람 검토를 기록한다.
- 썸네일·영상에만 쓰는 자산도 이 표의 대상이다.
- 단순히 “무료”, “인터넷 이미지”, “AI 생성”이라고 적는 것은 권리 근거가 아니다.

## 2. 저장소 LICENSE 결정

- **현재 상태**: 미결정
- **릴리스 차단**: M11 전에 최종 선택 필수
- **권장 검토 후보**: MIT 등 permissive license
- **주의**: 프로젝트 오너가 최종 승인하기 전 LICENSE 파일을 임의로 확정하지 않는다.

선택 시 다음을 기록한다.

```text
License:
Copyright holder:
Year:
Third-party notices requirement:
Decision/ADR:
```

## 3. 현재 자산 inventory

아직 production 자산이 생성·추가되지 않았다. 아래는 계획 항목이며 `Included=No`다.

| ID | 자산 | Source/Author | License/권리 | 수정 | 사용 위치 | Included | 상태 |
|---|---|---|---|---|---|---:|---|
| AST-001 | AXIS//SHIFT wordmark·logo SVG | 프로젝트 오너가 직접 제작 예정 | 프로젝트 original | 예정 | header, manifest, thumbnail | No | 계획 |
| AST-002 | UI icon set | 직접 제작 SVG 또는 라이선스 확정 set 예정 | 미정 | 미정 | controls | No | 결정 필요 |
| AST-003 | PWA app icons | AST-001 기반 프로젝트 export 예정 | 프로젝트 original | 크기별 export | `public/icons` | No | 계획 |
| AST-004 | Share card background·signature glyph | CSS/Canvas로 직접 생성 예정 | 프로젝트 original | runtime 생성 | share PNG | No | 계획 |
| AST-005 | Selection/PULSE/completion tones | Web Audio oscillator로 코드 생성 예정 | 프로젝트 code output | runtime 파라미터 | audio service | No | 계획 |
| AST-006 | System UI font stack | 사용자 OS 제공 | 각 OS/브라우저 환경 | 재배포 없음 | UI·Canvas fallback | No file | 허용 |
| AST-007 | Submission thumbnail | 실제 게임 캡처+original brand 예정 | 프로젝트 original | composition | submission | No | 계획 |
| AST-008 | Demo video | 실제 게임 캡처·자체 narration 예정 | 프로젝트 original | edit/subtitle | submission | No | 계획 |

실제 포함 시 `No`를 `Yes`로 바꾸고 정확한 file path·hash·source URL 또는 생성 기록을 입력한다.

## 4. 자산 등록 필수 필드

```text
Asset ID
표시명·파일 경로
원본 source URL 또는 original 생성 기록
저작자/권리자
정확한 license 이름과 버전
license/terms snapshot 위치와 확인일
상업·변형·재배포 허용 여부
수정 내용
attribution 요구와 표시 위치
production/submission 포함 여부
SHA-256
검토자·검토일
```

## 5. 허용 우선순위

1. 프로젝트 오너가 직접 만든 original 자산
2. 코드로 생성한 단순 기하·합성음
3. OS system font처럼 파일을 재배포하지 않는 자산
4. 명확한 permissive/open license 자산
5. 구매·계약으로 프로젝트 사용권을 확인한 자산

CC BY 사용 시 attribution 위치를 정하고, CC BY-SA·GPL 계열 시 결합·배포 의무를 별도 검토한다. CC BY-NC는 상용 배포 가능성 때문에 기본적으로 사용하지 않는다. “editorial use only” 자산은 사용하지 않는다.

## 6. 금지·고위험 자산

- 검색 결과·SNS·블로그에서 출처 없이 저장한 이미지
- 게임·AI 회사의 공식 logo를 허가 없이 장식으로 사용
- 라이선스 없는 상업 폰트 파일
- YouTube·게임·음원에서 추출한 audio
- 플랫폼에서 다운로드만 가능하고 재배포 권리가 없는 icon
- attribution을 UI에서 제거해야만 디자인에 맞는 자산
- AI 생성 결과라도 제3자 상표·캐릭터·작가 스타일을 직접 모사한 자산
- 라이선스 terms를 확인할 수 없는 CDN package

## 7. 코드 의존성 라이선스

M10에서 lockfile 기준 report를 생성한다.

```bash
npm run audit:licenses
```

리포트 최소 필드:

```text
package, version, license, repository, production/dev,
notice required, policy result
```

- production bundle dependency와 dev tool을 구분한다.
- unknown, unlicensed, custom license는 자동 승인하지 않는다.
- NOTICE 의무가 있으면 `THIRD_PARTY_NOTICES.md`를 추가한다.
- package license report는 이 asset 표의 각 행을 대체하지 않는다.

## 8. Build inventory 대조

M09·M10에서 다음을 자동화한다.

```bash
npm run audit:assets
```

검사 대상:

- `public/**/*`
- `src/assets/**/*`
- CSS `url(...)`
- manifest icons/screenshots
- Canvas renderer가 import하는 asset
- README·thumbnail·video source 목록

필수 결과:

```text
unregistered=0
missingFiles=0
unknownLicense=0
hotlinks=0
```

## 9. 생성형 자산 기록 템플릿

```markdown
### AST-XXX — 자산명

- Tool/model:
- Generated at:
- Prompt summary:
- Input/reference assets:
- Human edits:
- Third-party marks/characters review:
- Selected output path:
- License/terms snapshot:
- SHA-256:
- Approved by/date:
```

프롬프트 원문보다 입력 자산 권리와 사람 후처리·검토를 우선 기록한다.

## 10. 릴리스 승인

- [ ] 저장소 LICENSE 확정
- [ ] production asset inventory와 표 일치
- [ ] submission asset inventory와 표 일치
- [ ] unknown/custom license 0
- [ ] required attribution 표시
- [ ] third-party notices 생성
- [ ] hotlink·external font/audio/image request 0
- [ ] 삭제 자산이 dist/service worker cache에 남지 않음
- [ ] 최종 검토자·일시 기록
