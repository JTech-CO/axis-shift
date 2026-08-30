import type { ReactNode } from 'react';

import { GameStage } from '../../components/game';
import {
  useGameSessionController,
  type GameSessionController,
  type UseGameSessionControllerOptions,
} from './use-game-session-controller';

export interface GameSessionScreenProps extends UseGameSessionControllerOptions {
  readonly children?: (controller: GameSessionController) => ReactNode;
  readonly before?: (controller: GameSessionController) => ReactNode;
  readonly screenKey?: string;
}

type MountedGameSessionScreenProps = Omit<GameSessionScreenProps, 'screenKey'>;

function MountedGameSessionScreen({ before, children, ...options }: MountedGameSessionScreenProps) {
  const controller = useGameSessionController(options);
  return (
    <>
      {before?.(controller)}
      <GameStage callbacks={controller.callbacks} view={controller.presentation.view} />
      {children?.(controller)}
    </>
  );
}

export function GameSessionScreen({ screenKey = 'default', ...props }: GameSessionScreenProps) {
  return <MountedGameSessionScreen {...props} key={`${props.puzzle.id}:${screenKey}`} />;
}
