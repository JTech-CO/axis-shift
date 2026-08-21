# AXIS//SHIFT Asset & License Registry

**문서 버전**: 1.0.0  
**상태**: H00 제출 자산 등록 완료 / M11 production inventory·공개 라이선스 결정 대기
**최종 갱신**: 2026-08-21
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

- **H00 현재 상태**: `package.json`의 `private: true`, `UNLICENSED`와 All Rights Reserved를 유지한다.
- **권리 부여**: H00에서 `LICENSE` 파일을 추가하지 않았고, 저장소 코드·자산에 새 오픈소스 사용권을 부여하지 않았다.
- **제출 권리 확인**: H00 제출 썸네일·영상은 실제 공개 게임 빌드의 프로젝트 통제 화면만 캡처했다. 외부 이미지·폰트·음원·상표 자산은 추가하지 않았다.
- **M11 결정**: 공개 오픈소스 라이선스 채택 여부와 정확한 조건은 프로젝트 오너가 최종 승인한다.
- **주의**: 공개 저장소라는 사실만으로 복제·수정·재배포 라이선스가 발생하지 않는다.

M11에서 오픈소스 라이선스를 선택할 경우 다음을 기록한다.

```text
License:
Copyright holder:
Year:
Third-party notices requirement:
Decision/ADR:
```

## 3. 현재 자산 inventory

H00 제출 전용 자산 AST-007·AST-008은 등록·검증을 마쳤다. AST-001~AST-006은 향후 production 계획 또는 OS 제공 항목이므로 기존 `Included=No`·`No file` 상태를 유지한다.

| ID | 자산 | Source/Author | License/권리 | 수정 | 사용 위치 | Included | 상태 |
|---|---|---|---|---|---|---:|---|
| AST-001 | AXIS//SHIFT wordmark·logo SVG | 프로젝트 오너가 직접 제작 예정 | 프로젝트 original | 예정 | header, manifest, thumbnail | No | 계획 |
| AST-002 | UI icon set | 직접 제작 SVG 또는 라이선스 확정 set 예정 | 미정 | 미정 | controls | No | 결정 필요 |
| AST-003 | PWA app icons | AST-001 기반 프로젝트 export 예정 | 프로젝트 original | 크기별 export | `public/icons` | No | 계획 |
| AST-004 | Share card background·signature glyph | CSS/Canvas로 직접 생성 예정 | 프로젝트 original | runtime 생성 | share PNG | No | 계획 |
| AST-005 | Selection/PULSE/completion tones | Web Audio oscillator로 코드 생성 예정 | 프로젝트 code output | runtime 파라미터 | audio service | No | 계획 |
| AST-006 | System UI font stack | 사용자 OS 제공 | 각 OS/브라우저 환경 | 재배포 없음 | UI·Canvas fallback | No file | 허용 |
| AST-007 | H00 submission thumbnail | application SHA `5e2fe239…` 실제 공개 게임 캡처 | All Rights Reserved; 외부 자산 없음 | 1920×1080 화면 구성·crop 없음 | private submission package | Yes | H00 검증 완료 |
| AST-008 | H00 demo video | application SHA `5e2fe239…` 실제 공개 게임 캡처 | All Rights Reserved; 외부 자산·오디오 없음 | WebM 캡처, H.264 MP4 변환 | private submission package | Yes | H00 검증 완료 |

실제 포함 시 `No`를 `Yes`로 바꾸고 정확한 file path·hash·source URL 또는 생성 기록을 입력한다.

### AST-007 — H00 submission thumbnail

- 경로: `.private/submission/H00/axis-shift-submission-thumbnail-v0.1.0.png`
- 생성 기록: `https://jtech-co.github.io/axis-shift/`의 application SHA `5e2fe2390ccacd4c5425a476fc13770c524a9517` 실제 6×6 게임 화면 캡처
- 권리: 프로젝트 통제 UI 캡처, All Rights Reserved; H00에서 별도 라이선스 부여 없음
- 외부 입력 자산: 없음
- 규격: PNG, 1920×1080, 293,827 bytes
- SHA-256: `69d19cccc8a2435e66f23dd5c45d692c0d4d79fc49e8a799ad2caef1e54bb8f1`
- 검토: 2026-08-21 자동 field check 2회 및 사람 육안 검토 통과

### AST-008 — H00 demo video

- 경로: `.private/submission/H00/axis-shift-demo-v0.1.0.mp4`
- 원본 캡처: `.private/submission/H00/axis-shift-demo-v0.1.0.webm`
- 생성 기록: 위 application SHA의 실제 공개 플레이를 Playwright로 캡처하고 FFmpeg로 H.264 MP4 변환
- 권리: 프로젝트 통제 UI 캡처, All Rights Reserved; 외부 영상·이미지·폰트·음원 없음
- 오디오: 없음
- 규격: MP4 1920×1080, 25fps, 13.76초, 1,478,118 bytes; WebM 1920×1080, 13.76초, 1,316,500 bytes
- MP4 SHA-256: `a2450610eeaf637df7451eaf6e40f88fe034b10794bb7ca11ba044e4b5f07c93`
- WebM SHA-256: `6c9415266268834422026f0a37a3491e0a24581f4f3d5970a9d6474e720590ac`
- 권리 근거: `.private/submission/H00/RIGHTS.md`
- 검토: 2026-08-21 대표 프레임 3개 육안 확인과 독립 field check 2회 통과

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

### H00 v0.1 체크포인트

- [x] submission asset inventory와 AST-007·AST-008 일치
- [x] 제출 자산의 unknown/custom third-party license 0
- [x] 외부 attribution·third-party notice 의무 없음
- [x] public browser smoke의 external font/audio/image request 0
- [x] 실제 공개 빌드 캡처와 application SHA 기록
- [x] 자산 hash·규격 독립 검사 2회 및 육안 검토 기록
- [x] `UNLICENSED` / All Rights Reserved 유지와 신규 LICENSE 부재 명시

### M11 v1.0 최종 릴리스 체크리스트

- [ ] 저장소 LICENSE 또는 명시적 비공개 라이선스 정책 최종 승인
- [ ] production asset inventory와 표 일치
- [ ] submission asset inventory와 표 일치
- [ ] unknown/custom license 0
- [ ] required attribution 표시 또는 해당 없음 증명
- [ ] third-party notices 생성 또는 해당 없음 증명
- [ ] hotlink·external font/audio/image request 0
- [ ] 삭제 자산이 dist/service worker cache에 남지 않음
- [ ] 최종 검토자·일시 기록
