import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../components/common';
import { GameStage, type GameUiCallbacks, type GameUiViewModel } from '../components/game';
import { gameSessionReducer, type GameSessionAction } from '../domain';
import {
  createInteractiveGameUiState,
  GAME_UI_FIXTURES,
  NOOP_GAME_UI_CALLBACKS,
  presentInteractiveGameUiState,
  UI_FIXTURE_NAMES,
  type UiFixtureName,
} from './fixtures/game-ui';
import styles from './ui-fixture-app.module.css';

type ThemeName = 'dark' | 'light' | 'system';
type MotionName = 'system' | 'reduced';

const THEME_SEQUENCE: readonly ThemeName[] = ['dark', 'light', 'system'];

function nextTheme(theme: ThemeName): ThemeName {
  return THEME_SEQUENCE[(THEME_SEQUENCE.indexOf(theme) + 1) % THEME_SEQUENCE.length] ?? 'dark';
}

function nextMotion(motion: MotionName): MotionName {
  return motion === 'system' ? 'reduced' : 'system';
}

function fixtureFromSearch(search: string): UiFixtureName {
  const value = new URLSearchParams(search).get('fixture');
  return UI_FIXTURE_NAMES.includes(value as UiFixtureName) ? (value as UiFixtureName) : 'preview';
}

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
}

function withLongCopy(view: GameUiViewModel): GameUiViewModel {
  return {
    ...view,
    board: {
      ...view.board,
      summary:
        view.board.summary +
        ', 선택 결과와 목표 패턴의 차이를 문장으로도 확인할 수 있는 긴 설명 fixture',
    },
    controls: {
      ...view.controls,
      affectedCellsLabel:
        '선택한 모든 행과 열이 만나는 ' +
        view.controls.affectedCellCount +
        '개의 교차점이 한 번에 반전됩니다.',
    },
    labels: {
      ...view.labels,
      hintDescription:
        '정답을 직접 보여 주지 않고 남아 있는 신호의 깊이와 축 구조를 단계별로 길게 안내합니다.',
      resetDescription:
        '현재 선택, 이동 기록, 사용한 힌트를 모두 지우고 이 퍼즐의 최초 신호에서 다시 시작합니다.',
    },
    status: {
      ...view.status,
      detail:
        '더 긴 상태 설명에서도 축 선택, 교차점 미리보기, 다음 행동이 잘리거나 다른 조작을 가리지 않아야 합니다.',
    },
    target: {
      ...view.target,
      summary: view.target.summary + ', 다이아몬드 기호는 목표에서 켜져 있어야 하는 셀을 뜻합니다.',
    },
    title: 'HARD / 여섯 번째 축과 길어진 지역화 문구 검증',
  };
}

function FixtureCard({
  fixtureName,
  view,
}: {
  readonly fixtureName: UiFixtureName;
  readonly view: GameUiViewModel;
}) {
  return (
    <section aria-labelledby={'fixture-' + fixtureName} className={styles.card}>
      <p className={styles.cardLabel} id={'fixture-' + fixtureName}>
        STATE / {fixtureName.toUpperCase()}
      </p>
      <GameStage callbacks={NOOP_GAME_UI_CALLBACKS} view={view} />
    </section>
  );
}

function InteractiveFixture() {
  const [state, setState] = useState(createInteractiveGameUiState);
  const [pulseRequests, setPulseRequests] = useState(0);
  const sequenceRef = useRef(0);
  const nowRef = useRef(10_000);

  const dispatch = useCallback((action: GameSessionAction) => {
    setState((current) => gameSessionReducer(current, action));
  }, []);

  const nextNow = useCallback(() => {
    nowRef.current += 100;
    return nowRef.current;
  }, []);

  const callbacks = useMemo<GameUiCallbacks>(
    () => ({
      onHint: () => {
        const nextLevel = Math.min(3, state.session.hintLevelUsed + 1) as 1 | 2 | 3;
        dispatch({ level: nextLevel, type: 'USE_HINT' });
      },
      onPulse: () => {
        sequenceRef.current += 1;
        setPulseRequests((count) => count + 1);
        dispatch({
          actionId: 'interactive-pulse-' + sequenceRef.current,
          nowEpochMs: nextNow(),
          type: 'PULSE_COMMIT',
        });
      },
      onPulseVisualComplete: (actionId) => {
        dispatch({ actionId, type: 'PULSE_ANIMATION_FINISHED' });
      },
      onRecover: () => dispatch({ type: 'SESSION_RECOVER' }),
      onResetConfirmed: () => {
        sequenceRef.current += 1;
        dispatch({
          sessionId: 'fixture-session-reset-' + sequenceRef.current,
          type: 'RESET_CONFIRMED',
        });
      },
      onToggleColumn: (index) => {
        dispatch({ index, nowEpochMs: nextNow(), type: 'TOGGLE_COL' });
      },
      onToggleRow: (index) => {
        dispatch({ index, nowEpochMs: nextNow(), type: 'TOGGLE_ROW' });
      },
      onUndo: () => dispatch({ nowEpochMs: nextNow(), type: 'UNDO' }),
    }),
    [dispatch, nextNow, state.session.hintLevelUsed],
  );

  return (
    <>
      <GameStage callbacks={callbacks} view={presentInteractiveGameUiState(state)} />
      <output
        aria-live="polite"
        className={styles.testOutput}
        data-hint-level={state.session.hintLevelUsed}
        data-move-count={state.session.moves.length}
        data-pulse-requests
        data-session-status={state.session.status}
      >
        PULSE callback count: {pulseRequests}
      </output>
    </>
  );
}

export function UiFixtureApp() {
  const [theme, setTheme] = useState<ThemeName>('dark');
  const [motion, setMotion] = useState<MotionName>('system');
  const fixtureName = useMemo(() => fixtureFromSearch(window.location.search), []);
  const parameters = useMemo(() => new URLSearchParams(window.location.search), []);
  const gallery = parameters.get('gallery') === '1';
  const interactive = parameters.get('interactive') === '1';
  const longCopy = parameters.get('long') === '1';
  const singleView = longCopy
    ? withLongCopy(GAME_UI_FIXTURES[fixtureName])
    : GAME_UI_FIXTURES[fixtureName];

  useEffect(() => {
    applyTheme(theme);
    document.documentElement.dataset.motion = motion;
  }, [motion, theme]);

  useEffect(() => {
    document.body.dataset.fixtureReady = 'true';
    return () => {
      delete document.body.dataset.fixtureReady;
    };
  }, []);

  return (
    <div className={styles.app} data-ui-fixture-app="true">
      <header className={styles.toolbar}>
        <div>
          <p className={styles.eyebrow}>AXIS//SHIFT</p>
          <h1>Design System UI Fixtures</h1>
        </div>
        <div className={styles.settings}>
          <Button
            aria-label={`Theme: ${theme}; next: ${nextTheme(theme)}`}
            className={styles.settingButton}
            data-setting-control="theme"
            onClick={() => setTheme((current) => nextTheme(current))}
            variant="secondary"
          >
            <span className={styles.settingLabel}>Theme</span>
            <span className={styles.settingValue}>{theme}</span>
          </Button>
          <Button
            aria-label={`Motion: ${motion}; next: ${nextMotion(motion)}`}
            aria-pressed={motion === 'reduced'}
            className={styles.settingButton}
            data-setting-control="motion"
            onClick={() => setMotion((current) => nextMotion(current))}
            variant="secondary"
          >
            <span className={styles.settingLabel}>Motion</span>
            <span className={styles.settingValue}>{motion}</span>
          </Button>
        </div>
      </header>

      <main className={gallery ? styles.gallery : styles.single}>
        {interactive ? (
          <InteractiveFixture />
        ) : gallery ? (
          UI_FIXTURE_NAMES.map((name) => (
            <FixtureCard fixtureName={name} key={name} view={GAME_UI_FIXTURES[name]} />
          ))
        ) : (
          <GameStage callbacks={NOOP_GAME_UI_CALLBACKS} view={singleView} />
        )}
      </main>
    </div>
  );
}
