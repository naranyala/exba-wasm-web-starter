import { EXBA } from '@core/lifecycle/exba';
import { ActivityFeedComponent } from './activity-feed';
import { AnalyticsComponent } from './analytics';
import { DashboardComponent } from './dashboard';
import { KanbanComponent } from './kanban';
import { NeofetchComponent } from './neofetch';
import { ProfileComponent } from './profile';
import { SampleTaskComponent } from './sample-task';
import { SettingsComponent } from './settings';
import { TerminalComponent } from './terminal';
import { SqliteExplorer } from './sqlite-explorer';

/**
 * Registers all high-level feature and demo components.
 */
export function registerFeatures() {
  EXBA.register('exba-dashboard', DashboardComponent);
  EXBA.register('exba-sample-task', SampleTaskComponent);
  EXBA.register('exba-activity-feed', ActivityFeedComponent);
  EXBA.register('exba-analytics', AnalyticsComponent);
  EXBA.register('exba-kanban', KanbanComponent);
  EXBA.register('exba-neofetch', NeofetchComponent);
  EXBA.register('exba-profile', ProfileComponent);
  EXBA.register('exba-settings', SettingsComponent);
  EXBA.register('exba-terminal', TerminalComponent);
  EXBA.register('exba-sqlite-explorer', SqliteExplorer);
}
