export const ko = {
  'app.meta.title': 'AXIS//SHIFT',
  'app.brand.name': 'AXIS//SHIFT',
  'app.skipToContent': '본문으로 건너뛰기',
  'app.nav.label': '주요 화면',
  'app.nav.home': '홈',
  'app.nav.daily': '오늘의 퍼즐',
  'app.status.home': '현재 화면: 홈',
  'app.status.daily': '현재 화면: 오늘의 퍼즐',
  'app.status.recovery': '현재 화면: 경로 복구',
  'home.title': 'AXIS//SHIFT',
  'home.description': '행과 열의 교차점을 뒤집어 목표 신호를 맞추는 짧은 퍼즐입니다.',
  'daily.title': '오늘의 퍼즐',
  'daily.description': '플레이 가능한 퍼즐은 다음 마일스톤에서 이 화면에 연결됩니다.',
  'recovery.title': '화면을 찾을 수 없습니다',
  'recovery.description': '요청한 경로 대신 안전한 복구 화면을 표시했습니다.',
  'recovery.backHome': '홈으로 돌아가기',
  'error.title': '화면을 불러오지 못했습니다',
  'error.description': '예상하지 못한 오류가 발생했습니다. 화면을 다시 불러와 주세요.',
  'error.reload': '다시 불러오기',
} as const;

export type MessageKey = keyof typeof ko;
