import { EXBA } from '@core/lifecycle/exba';
import { AccordionComponent } from './accordion';
import { CodeBlockComponent } from './code-block';
import { DatePickerComponent } from './datepicker';
import { DrawerComponent } from './drawer';
import { ExbaGreeting } from './exba-greeting';
import { MyWidgetComponent } from './my-widget';

/**
 * Registers all generic widget components.
 */
export function registerWidgets() {
  EXBA.register('exba-my-widget', MyWidgetComponent);
  EXBA.register('exba-accordion', AccordionComponent);
  EXBA.register('exba-code-block', CodeBlockComponent);
  EXBA.register('exba-datepicker', DatePickerComponent);
  EXBA.register('exba-drawer', DrawerComponent);
  EXBA.register('exba-greeting', ExbaGreeting);
}
