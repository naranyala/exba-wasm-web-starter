import { ExbaComponent } from '../../framework/core/component';
import { ease, t } from '../../styles';

export interface DatePickerState {
  currentYear: number;
  currentMonth: number; // 0-indexed
  selectedDate: string | null; // ISO String formatted as YYYY-MM-DD or null
}

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

  protected onMount() {
    const today = new Date();
    this.setState({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      selectedDate: today.toISOString().split('T')[0],
    });
  }

  private prevMonth() {
    let month = this.state.currentMonth - 1;
    let year = this.state.currentYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    this.setState({ currentMonth: month, currentYear: year });
  }

  private nextMonth() {
    let month = this.state.currentMonth + 1;
    let year = this.state.currentYear;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    this.setState({ currentMonth: month, currentYear: year });
  }

  private selectDate(dateStr: string) {
    this.setState({ selectedDate: dateStr });
  }

  private setToday() {
    const today = new Date();
    this.setState({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      selectedDate: today.toISOString().split('T')[0],
    });
  }

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
              <button class="navBtn" onclick="this.getRootNode().host.prevMonth()">◀</button>
              <span class="monthTitle">${monthNames[month]} ${year}</span>
              <button class="navBtn" onclick="this.getRootNode().host.nextMonth()">▶</button>
            </div>
            <button class="todayBtn" onclick="this.getRootNode().host.setToday()">📍 Today</button>
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
                  <div class="${cellClasses}" onclick="this.getRootNode().host.selectDate('${d.dateStr}')">
                    ${d.day}
                  </div>
                `;
              })
              .join('')}
          </div>

          <div class="presets">
            <button class="presetBtn" onclick="this.getRootNode().host.setPreset(0)">Today</button>
            <button class="presetBtn" onclick="this.getRootNode().host.setPreset(1)">Tomorrow</button>
            <button class="presetBtn" onclick="this.getRootNode().host.setPreset(7)">Next Week</button>
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
  }
}

customElements.define('exba-datepicker', DatePickerComponent);
