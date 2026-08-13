import type { MessageKey } from './ko';

export const en = {
  'app.meta.title': 'AXIS//SHIFT',
  'app.brand.name': 'AXIS//SHIFT',
  'app.skipToContent': 'Skip to main content',
  'app.nav.label': 'Primary views',
  'app.nav.home': 'Home',
  'app.nav.daily': "Today's puzzle",
  'app.status.home': 'Current view: Home',
  'app.status.daily': "Current view: Today's puzzle",
  'app.status.recovery': 'Current view: Route recovery',
  'home.title': 'AXIS//SHIFT',
  'home.description':
    'A short puzzle about flipping row-and-column intersections to match a target signal.',
  'daily.title': "Today's puzzle",
  'daily.description': 'A playable puzzle will be connected to this view in the next milestone.',
  'recovery.title': 'View not found',
  'recovery.description': 'A safe recovery view is shown in place of the requested route.',
  'recovery.backHome': 'Return home',
  'error.title': 'Unable to load this view',
  'error.description': 'An unexpected error occurred. Please reload the view.',
  'error.reload': 'Reload',
} as const satisfies Record<MessageKey, string>;
