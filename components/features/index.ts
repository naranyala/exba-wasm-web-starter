import { EXBA } from '@core/lifecycle/exba';
import { ActivityFeedComponent } from './activity-feed';
import { AnalyticsComponent } from './analytics';
import { KanbanComponent } from './kanban';
import { NeofetchComponent } from './neofetch';
import { ProfileComponent } from './profile';
import { SettingsComponent } from './settings';
import { TerminalComponent } from './terminal';

/**
 * Registers all high-level feature and demo components.
 */
export function registerFeatures() {
  EXBA.register('exba-activity-feed', ActivityFeedComponent);
  EXBA.register('exba-analytics', AnalyticsComponent);
  EXBA.register('exba-kanban', KanbanComponent);
  EXBA.register('exba-neofetch', NeofetchComponent);
  EXBA.register('exba-profile', ProfileComponent);
  EXBA.register('exba-settings', SettingsComponent);
  EXBA.register('exba-terminal', TerminalComponent);
}
