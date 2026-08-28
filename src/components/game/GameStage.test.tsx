import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  GAME_UI_FIXTURES,
  NOOP_GAME_UI_CALLBACKS,
  UI_FIXTURE_NAMES,
} from '../../test/fixtures/game-ui';
import { Dialog } from '../common';
import type { GameUiCallbacks } from './types';
import { GameStage } from './GameStage';

function callbacks(overrides: Partial<GameUiCallbacks> = {}): GameUiCallbacks {
  return { ...NOOP_GAME_UI_CALLBACKS, ...overrides };
}

describe('GameStage', () => {
  it.each(UI_FIXTURE_NAMES)('renders the %s state fixture', (name) => {
    const { unmount } = render(
      <GameStage callbacks={NOOP_GAME_UI_CALLBACKS} view={GAME_UI_FIXTURES[name]} />,
    );

    expect(document.querySelector('[data-game-stage="true"]')).toHaveAttribute(
      'data-phase',
      GAME_UI_FIXTURES[name].phase,
    );
    unmount();
  });

  it('uses unique heading relationships for repeated puzzle instances', () => {
    const view = GAME_UI_FIXTURES.idle;
    render(
      <>
        <GameStage callbacks={NOOP_GAME_UI_CALLBACKS} view={view} />
        <GameStage callbacks={NOOP_GAME_UI_CALLBACKS} view={view} />
      </>,
    );

    const titleIds = Array.from(document.querySelectorAll('[data-game-stage="true"]')).map(
      (stage) => stage.getAttribute('aria-labelledby'),
    );
    expect(new Set(titleIds).size).toBe(2);
    for (const titleId of titleIds) {
      expect(titleId).not.toBeNull();
      expect(document.getElementById(titleId ?? '')).toHaveTextContent(view.title);
    }
  });

  it.each(['paused', 'error'] as const)('announces the %s-specific PULSE lock reason', (name) => {
    const view = GAME_UI_FIXTURES[name];
    render(<GameStage callbacks={NOOP_GAME_UI_CALLBACKS} view={view} />);

    expect(
      screen.getByRole('button', { name: new RegExp(view.controls.pulseStatusLabel) }),
    ).toBeDisabled();
  });

  it('dispatches one PULSE callback across rapid pointer and shortcut input', () => {
    const onPulse = vi.fn();
    render(<GameStage callbacks={callbacks({ onPulse })} view={GAME_UI_FIXTURES.preview} />);

    const pulse = screen.getByRole('button', { name: /PULSE/ });
    fireEvent.click(pulse);
    fireEvent.click(pulse);
    fireEvent.keyDown(window, { key: 'p' });
    fireEvent.keyDown(window, { ctrlKey: true, key: 'Enter' });
    fireEvent.keyDown(window, { key: 'p', repeat: true });

    expect(onPulse).toHaveBeenCalledTimes(1);
  });

  it('routes Undo, Hint and Reset cancel through keyboard with focus restoration', async () => {
    const user = userEvent.setup();
    const onHint = vi.fn();
    const view = {
      ...GAME_UI_FIXTURES.preview,
      controls: {
        ...GAME_UI_FIXTURES.preview.controls,
        undoEnabled: true,
      },
    };
    render(<GameStage callbacks={callbacks({ onHint })} view={view} />);

    fireEvent.keyDown(window, { key: 'h' });
    expect(onHint).toHaveBeenCalledTimes(1);

    const reset = screen.getByRole('button', { name: /초기화/ });
    reset.focus();
    fireEvent.keyDown(window, { key: 'R', shiftKey: true });
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('open'));
    expect(screen.getByRole('button', { name: '취소' })).toHaveFocus();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open'),
    );
    expect(reset).toHaveFocus();

    await user.keyboard('{Tab}');
  });

  it('does not intercept reserved browser shortcut chords', () => {
    const onHint = vi.fn();
    const onPulse = vi.fn();
    const onUndo = vi.fn();
    const view = {
      ...GAME_UI_FIXTURES.preview,
      controls: {
        ...GAME_UI_FIXTURES.preview.controls,
        undoEnabled: true,
      },
    };
    render(<GameStage callbacks={callbacks({ onHint, onPulse, onUndo })} view={view} />);

    fireEvent.keyDown(window, { ctrlKey: true, key: 'p' });
    fireEvent.keyDown(window, { ctrlKey: true, key: 'h' });
    fireEvent.keyDown(window, { ctrlKey: true, key: 'z' });
    fireEvent.keyDown(window, { ctrlKey: true, key: 'R', shiftKey: true });
    fireEvent.keyDown(window, { altKey: true, key: 'p' });
    fireEvent.keyDown(window, { key: 'p', shiftKey: true });

    expect(onPulse).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
    expect(onHint).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open');
  });

  it('does not let hidden custom dialogs disable game shortcuts', () => {
    const onHint = vi.fn();
    const onPulse = vi.fn();
    const onUndo = vi.fn();
    const view = {
      ...GAME_UI_FIXTURES.preview,
      controls: {
        ...GAME_UI_FIXTURES.preview.controls,
        undoEnabled: true,
      },
    };
    render(
      <>
        <GameStage callbacks={callbacks({ onHint, onPulse, onUndo })} view={view} />
        <div aria-modal="true" hidden role="dialog" />
        <div aria-modal="true" role="dialog" style={{ display: 'none' }} />
      </>,
    );

    fireEvent.keyDown(window, { key: 'p' });
    fireEvent.keyDown(window, { key: 'z' });
    fireEvent.keyDown(window, { key: 'h' });

    expect(onPulse).toHaveBeenCalledTimes(1);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onHint).toHaveBeenCalledTimes(1);
  });

  it('blocks global game shortcuts while a sibling modal dialog is open', async () => {
    const onHint = vi.fn();
    const onPulse = vi.fn();
    const onUndo = vi.fn();
    const view = {
      ...GAME_UI_FIXTURES.preview,
      controls: {
        ...GAME_UI_FIXTURES.preview.controls,
        undoEnabled: true,
      },
    };
    render(
      <>
        <GameStage callbacks={callbacks({ onHint, onPulse, onUndo })} view={view} />
        <Dialog
          cancelLabel="닫기"
          confirmLabel="확인"
          description="설정 대화상자"
          onClose={() => undefined}
          onConfirm={() => undefined}
          open
          title="설정"
        />
      </>,
    );
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('open'));

    fireEvent.keyDown(window, { key: 'p' });
    fireEvent.keyDown(window, { key: 'z' });
    fireEvent.keyDown(window, { key: 'h' });

    expect(onPulse).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
    expect(onHint).not.toHaveBeenCalled();
  });

  it('blocks global game shortcuts while the reset dialog is open', async () => {
    const onHint = vi.fn();
    const onPulse = vi.fn();
    const onUndo = vi.fn();
    const view = {
      ...GAME_UI_FIXTURES.preview,
      controls: {
        ...GAME_UI_FIXTURES.preview.controls,
        undoEnabled: true,
      },
    };
    render(<GameStage callbacks={callbacks({ onHint, onPulse, onUndo })} view={view} />);

    fireEvent.click(screen.getByRole('button', { name: /초기화/ }));
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('open'));

    fireEvent.keyDown(window, { key: 'p' });
    fireEvent.keyDown(window, { key: 'z' });
    fireEvent.keyDown(window, { key: 'h' });

    expect(onPulse).not.toHaveBeenCalled();
    expect(onUndo).not.toHaveBeenCalled();
    expect(onHint).not.toHaveBeenCalled();
  });

  it('closes a reset dialog when the puzzle identity changes', async () => {
    const { rerender } = render(
      <GameStage callbacks={NOOP_GAME_UI_CALLBACKS} view={GAME_UI_FIXTURES.preview} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /초기화/ }));
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveAttribute('open'));

    rerender(
      <GameStage
        callbacks={NOOP_GAME_UI_CALLBACKS}
        view={{ ...GAME_UI_FIXTURES.preview, puzzleId: 'different-puzzle' }}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open'),
    );
  });

  it('focuses the result heading when completion appears', async () => {
    render(<GameStage callbacks={NOOP_GAME_UI_CALLBACKS} view={GAME_UI_FIXTURES.solved} />);

    await waitFor(() => expect(screen.getByRole('heading', { name: '패턴 일치' })).toHaveFocus());
  });

  it('does not restart pulse completion when callback objects change', () => {
    vi.useFakeTimers();
    const firstComplete = vi.fn();
    const latestComplete = vi.fn();
    const { rerender } = render(
      <GameStage
        callbacks={callbacks({ onPulseVisualComplete: firstComplete })}
        view={GAME_UI_FIXTURES.pulsing}
      />,
    );

    act(() => vi.advanceTimersByTime(300));
    rerender(
      <GameStage
        callbacks={callbacks({ onPulseVisualComplete: latestComplete })}
        view={GAME_UI_FIXTURES.pulsing}
      />,
    );
    act(() => vi.advanceTimersByTime(150));

    expect(firstComplete).not.toHaveBeenCalled();
    expect(latestComplete).toHaveBeenCalledWith('fixture-pulse-001');
    vi.useRealTimers();
  });

  it('finishes pulsing without depending on animation events', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(
      <GameStage
        callbacks={callbacks({ onPulseVisualComplete: onComplete })}
        view={GAME_UI_FIXTURES.pulsing}
      />,
    );

    act(() => vi.advanceTimersByTime(500));
    expect(onComplete).toHaveBeenCalledWith('fixture-pulse-001');
    vi.useRealTimers();
  });
});
