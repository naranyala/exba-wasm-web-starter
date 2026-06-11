import { ExbaComponent } from '@core/lifecycle/component';
import { ease, t } from '@shell/theme/styles';

/**
 * Represents the internal state of the DatePicker component.
 */
export interface DatePickerState {
  /** The currently displayed year */
  currentYear: number;
  /** The currently displayed month (0-11) */
  currentMonth: number;
  /** The selected date in YYYY-MM-DD format, or null */
  selectedDate: string | null;
}

/**
 * A highly interactive calendar/date picker component.
 * 
 * Features include:
 * - Month-to-month navigation.
 * - Automatic "Today" highlighting.
 * - Date selection with visual feedback.
 * - Preset buttons for quick navigation (Today, Tomorrow, Next Week).
 * 
 * @extends ExbaComponent
 */
export class DatePickerComponent extends ExbaComponent {
  static useShadow = true;

  static styles = {
    container:
      'padding: 2rem; width: 100%; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;',
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1.5rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; backdrop-filter: blur(8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);`,
    header:
      'display: flex; justify-content: space-between; align-items: center;',
    monthNav: 'display: flex; align-items: center; gap: 1rem;',
    navBtn: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; color: ${t.zinc200}; width: 2.25rem; height: 2.25rem; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.875rem; font-weight: bold; transition: all ${ease}; &:hover { background: ${t.zinc700}; color: ${t.white}; border-color: ${t.zinc500}; }`,
    monthTitle: `font-size: 1.125rem; font-weight: 700; color: ${t.zinc100}; min-width: 120px; text-align: center;`,
    todayBtn: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; color: ${t.zinc300}; padding: 0.375rem 0.75rem; border-radius: 0.75rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all ${ease}; &:hover { background: ${t.indigo600a}; color: ${t.indigo300}; border-color: ${t.indigo500}; }`,
    grid: 'display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.375rem; text-align: center;',
    dayName: `font-size: 0.75rem; font-weight: 700; color: ${t.zinc500}; padding: 0.5rem 0; text-transform: uppercase; letter-spacing: 0.05em;`,
    cell: `aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 500; border-radius: 0.75rem; cursor: pointer; transition: all ${ease}; position: relative; overflow: hidden;`,
    cellCurrent: `color: ${t.zinc200}; &:hover { background: ${t.zinc800}; color: ${t.white}; }`,
    cellOutside: `color: ${t.zinc700}; &:hover { background: ${t.zinc800a}; color: ${t.zinc400}; }`,
    cellToday: `border: 1px solid ${t.indigo500}; color: ${t.indigo300}; &::after { content: ""; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: ${t.indigo400}; }`,
    cellSelected: `background: linear-gradient(135deg, ${t.indigo500}, ${t.indigo600}) !important; color: ${t.white} !important; border: none !important; box-shadow: 0 4px 12px ${t.indigo600a}; font-weight: 700;`,
    displayCard: `background: ${t.zinc950}; border: 1px solid ${t.zinc800}; border-radius: 1rem; padding: 1rem; text-align: center;`,
    displayLabel: `font-size: 0.75rem; font-weight: 700; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;`,
    displayValue: `font-size: 0.9375rem; font-weight: 600; color: ${t.indigo300};`,
    presets:
      'display: flex; gap: 0.5rem; justify-content: space-between; border-top: 1px solid ${t.zinc800}; padding-top: 1rem;',
    presetBtn: `flex: 1; background: ${t.zinc900a}; border: 1px solid ${t.zinc800}; color: ${t.zinc400}; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; cursor: pointer; text-align: center; transition: all ${ease}; &:hover { border-color: ${t.zinc500}; color: ${t.zinc200}; background: ${t.zinc800}; }`,
  };

  /**
   * Initializes the date picker to the current month and today's date on mount.
   */
  protected onMount() {
    const today = new Date();
    this.setState({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      selectedDate: today.toISOString().split('T')[0],
    });
  }

  /**
   * Navigates the calendar to the previous month.
   */
  private prevMonth() {
    let month = this.state.currentMonth - 1;
    let year = this.state.currentYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    this.setState({ currentMonth: month, currentYear: year });
  }

  /**
   * Navigates the calendar to the next month.
   */
  private nextMonth() {
    let month = this.state.currentMonth + 1;
    let year = this.state.currentYear;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    this.setState({ currentMonth: month, currentYear: year });
  }

  /**
   * Selects a specific date.
   * @param dateStr Date in YYYY-MM-DD format.
   */
  private selectDate(dateStr: string) {
    this.setState({ selectedDate: dateStr });
  }

  /**
   * Resets the view to the current month and selects today.
   */
  private setToday() {
    const today = new Date();
    this.setState({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      selectedDate: today.toISOString().split('T')[0],
    });
  }

  /**
   * Sets the date based on a relative day offset.
   * @param daysOffset Number of days from today.
   */
  private setPreset(daysOffset: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    this.setState({
      currentYear: d.getFullYear(),
      currentMonth: d.getMonth(),
      selectedDate: d.toISOString().split('T')[0],
    });
  }

  render() {
    const year = this.state.currentYear || new Date().getFullYear();
    const month =
      this.state.currentMonth !== undefined
        ? this.state.currentMonth
        : new Date().getMonth();
    const selected = this.state.selectedDate || '';

    const todayStr = new Date().toISOString().split('T')[0];

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Days in current month
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    const prevNumDays = new Date(year, month, 0).getDate();

    interface DayInfo {
      day: number;
      type: 'prev' | 'current' | 'next';
      dateStr: string;
    }

    const days: DayInfo[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevNumDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      const mm = (m + 1).toString().padStart(2, '0');
      const dd = d.toString().padStart(2, '0');
      days.push({ day: d, type: 'prev', dateStr: `${y}-${mm}-${dd}` });
    }

    // Current month days
    for (let i = 1; i <= numDays; i++) {
      const mm = (month + 1).toString().padStart(2, '0');
      const dd = i.toString().padStart(2, '0');
      days.push({ day: i, type: 'current', dateStr: `${year}-${mm}-${dd}` });
    }

    // Next month padding
    const totalCells = 42;
    const nextDaysCount = totalCells - days.length;
    for (let i = 1; i <= nextDaysCount; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      const mm = (m + 1).toString().padStart(2, '0');
      const dd = i.toString().padStart(2, '0');
      days.push({ day: i, type: 'next', dateStr: `${y}-${mm}-${dd}` });
    }

    // Selected date formatting
    let formattedDate = 'No date selected';
    if (selected) {
      const parts = selected.split('-');
      const d = new Date(
        Number.parseInt(parts[0]),
        Number.parseInt(parts[1]) - 1,
        Number.parseInt(parts[2]),
      );
      formattedDate = d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return `
      <div class="container">
        <h2 style="color: ${t.zinc100}; margin-bottom: 0.5rem; text-align: center;">Monthly Date Picker</h2>
        <p style="color: ${t.zinc500}; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem; margin-top: 0;">Unified reactive primitive demo</p>
        
        <div class="card">
          <header class="header">
            <div class="monthNav">
              <button class="navBtn" data-action="prev">◀</button>
              <span class="monthTitle">${monthNames[month]} ${year}</span>
              <button class="navBtn" data-action="next">▶</button>
            </div>
            <button class="todayBtn" data-action="today">📍 Today</button>
          </header>
 
          <div class="grid">
            ${dayNames.map((name) => `<span class="dayName">${name}</span>`).join('')}
            ${days
              .map((d) => {
                const isToday = d.dateStr === todayStr;
                const isSelected = d.dateStr === selected;
 
                let cellClasses = 'cell';
                if (d.type === 'current') {
                  cellClasses += ' cellCurrent';
                } else {
                  cellClasses += ' cellOutside';
                }
 
                if (isToday) {
                  cellClasses += ' cellToday';
                }
                if (isSelected) {
                  cellClasses += ' cellSelected';
                }
 
                return `
                  <div class="${cellClasses}" data-date="${d.dateStr}">
                    ${d.day}
                  </div>
                `;
              })
              .join('')}
          </div>
 
          <div class="presets">
            <button class="presetBtn" data-preset="0">Today</button>
            <button class="presetBtn" data-preset="1">Tomorrow</button>
            <button class="presetBtn" data-preset="7">Next Week</button>
          </div>
 
          <div class="displayCard">
            <div class="displayLabel">Selected Date</div>
            <div class="displayValue">${formattedDate}</div>
          </div>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    (window as any).dispatchDatePickerPrev = () => this.prevMonth();
    (window as any).dispatchDatePickerNext = () => this.nextMonth();
    (window as any).dispatchDatePickerSelect = (dateStr: string) =>
      this.selectDate(dateStr);
    (window as any).dispatchDatePickerToday = () => this.setToday();
    (window as any).dispatchDatePickerPreset = (offset: number) =>
      this.setPreset(offset);

    this.shadowRoot?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      const navBtn = target.closest('.navBtn');
      if (navBtn) {
        const action = navBtn.getAttribute('data-action');
        if (action === 'prev') this.prevMonth();
        if (action === 'next') this.nextMonth();
        return;
      }

      const todayBtn = target.closest('.todayBtn');
      if (todayBtn) {
        this.setToday();
        return;
      }

      const presetBtn = target.closest('.presetBtn');
      if (presetBtn) {
        const offset = Number(presetBtn.getAttribute('data-preset'));
        this.setPreset(offset);
        return;
      }

      const cell = target.closest('.cell');
      if (cell) {
        const dateStr = cell.getAttribute('data-date');
        if (dateStr) {
          this.selectDate(dateStr);
        }
      }
    });
  }
}

