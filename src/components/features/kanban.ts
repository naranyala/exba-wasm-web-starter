import { ExbaComponent } from '@core/lifecycle/component';
import { EXBA } from '@core/lifecycle/exba';
import { ease, t } from '@shell/theme/styles';

/**
 * Represents a single task in the Kanban board.
 */
export interface KanbanTask {
  /** Unique identifier for the task */
  id: string;
  /** Display title of the task */
  title: string;
  /** The column ID the task currently belongs to ('todo', 'in-progress', 'done') */
  col: string;
  /** Priority level ('High', 'Medium', 'Low') */
  priority: string;
  /** List of tag strings associated with the task */
  tags: string[];
}

/**
 * A full-featured Kanban board component with drag-and-drop support.
 *
 * Features include:
 * - Persistent state management using LocalStorage.
 * - Drag-and-drop task movement between columns.
 * - Task creation, editing, and deletion via prompts.
 * - Real-time synchronization with the global activity feed signal.
 *
 * @extends ExbaComponent
 */
export class KanbanComponent extends ExbaComponent {
  static useShadow = true;

  static styles = {
    container:
      'padding: 2rem; width: 100%; max-width: 1100px; margin: 0 auto; min-height: 80vh;',
    header:
      'display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;',
    title:
      'font-size: 1.75rem; font-weight: 800; color: ${t.zinc100}; letter-spacing: -0.02em;',
    board: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;',
    column: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1.25rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem; backdrop-filter: blur(8px); transition: all ${ease};`,
    columnDragOver: `border-color: ${t.indigo500} !important; background: rgba(99, 102, 241, 0.08) !important;`,
    colHeader:
      'display: flex; align-items: center; justify-content: space-between; padding: 0 0.25rem;',
    colTitle: `font-size: 0.75rem; font-weight: 800; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.1em;`,
    colCount: `font-size: 0.75rem; background: ${t.zinc800}; color: ${t.zinc400}; padding: 0.125rem 0.5rem; border-radius: 1rem;`,
    taskList:
      'flex: 1; display: flex; flex-direction: column; gap: 1rem; min-height: 200px;',
    task: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; border-radius: 1rem; padding: 1.25rem; cursor: pointer; transition: all ${ease}; position: relative; overflow: hidden;`,
    taskActive: `&:hover { transform: translateY(-4px) scale(1.02); border-color: ${t.indigo500}; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3); }`,
    taskTitle: `font-size: 1rem; font-weight: 600; color: ${t.zinc100}; margin-bottom: 0.75rem; line-height: 1.4;`,
    taskFooter:
      'display: flex; justify-content: space-between; align-items: center; margin-top: auto;',
    priority:
      'font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 0.375rem; text-transform: uppercase;',
    priorityHigh: `background: rgba(220, 38, 38, 0.2); color: #f87171;`,
    priorityMedium: `background: rgba(245, 158, 11, 0.2); color: #fbbf24;`,
    priorityLow: `background: rgba(5, 150, 105, 0.2); color: #34d399;`,
    tagRow: 'display: flex; gap: 0.375rem; flex-wrap: wrap;',
    tag: `font-size: 0.65rem; color: ${t.zinc500}; background: ${t.zinc900}; padding: 0.125rem 0.375rem; border-radius: 0.25rem; border: 1px solid ${t.zinc800};`,
    empty:
      'flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${t.zinc700}; border: 2px dashed ${t.zinc800a}; border-radius: 1rem; gap: 0.5rem;',
    emptyIcon: 'font-size: 1.5rem; opacity: 0.5;',
    btn: `padding: 0.625rem; background: transparent; border: 1px dashed ${t.zinc700}; border-radius: 0.75rem; color: ${t.zinc500}; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;`,
    btnHover: `&:hover { background: ${t.zinc800}; color: ${t.zinc200}; border-style: solid; border-color: ${t.zinc600}; }`,
  };

  /**
   * Retrieves the current task list from LocalStorage or returns defaults.
   * @returns Array of Kanban tasks.
   */
  private getLocalTasks(): KanbanTask[] {
    const data = localStorage.getItem('exba_kanban_tasks');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse local kanban tasks', e);
      }
    }
    const defaultTasks: KanbanTask[] = [
      {
        id: '1',
        title: 'WASM Performance Benchmarking',
        col: 'todo',
        priority: 'High',
        tags: ['core', 'bench'],
      },
      {
        id: '2',
        title: 'Refactor Component Bridge',
        col: 'todo',
        priority: 'Medium',
        tags: ['refactor'],
      },
      {
        id: '3',
        title: 'Implement Glassmorphism UI',
        col: 'in-progress',
        priority: 'Low',
        tags: ['ui'],
      },
      {
        id: '4',
        title: 'Initial Project Layout',
        col: 'done',
        priority: 'High',
        tags: ['setup'],
      },
      {
        id: '5',
        title: 'Write Documentation',
        col: 'todo',
        priority: 'Medium',
        tags: ['docs'],
      },
      {
        id: '6',
        title: 'Setup CI/CD Pipeline',
        col: 'in-progress',
        priority: 'High',
        tags: ['devops'],
      },
    ];
    localStorage.setItem('exba_kanban_tasks', JSON.stringify(defaultTasks));
    return defaultTasks;
  }

  /**
   * Helper to sync local task structures into Rust WASM state.
   */
  private async syncTasksWithWasm(tasks: KanbanTask[]): Promise<KanbanTask[]> {
    try {
      const response = await EXBA.api.process_ir(
        JSON.stringify({
          type: 'SyncKanban',
          payload: { tasks },
        }),
      );
      if (response.type === 'KanbanData') {
        return response.payload;
      }
    } catch (e) {
      console.error('Failed to sync tasks with WASM:', e);
    }
    return tasks;
  }

  /**
   * Persists the task list to LocalStorage.
   * @param tasks The array of tasks to save.
   */
  private saveLocalTasks(tasks: KanbanTask[]) {
    localStorage.setItem('exba_kanban_tasks', JSON.stringify(tasks));
  }

  /**
   * Loads the board state on mount.
   */
  protected async onMount() {
    const local = localStorage.getItem('exba_kanban_tasks');
    let tasks: KanbanTask[] = [];
    if (local) {
      try {
        tasks = JSON.parse(local);
        const synced = await this.syncTasksWithWasm(tasks);
        this.setState({ tasks: synced });
      } catch (e) {
        console.error('Failed to load local tasks', e);
      }
    }

    if (tasks.length === 0) {
      try {
        const response = await EXBA.api.process_ir(
          JSON.stringify({
            type: 'KanbanFetch',
            payload: null,
          }),
        );
        if (response.type === 'KanbanData') {
          tasks = response.payload;
          this.saveLocalTasks(tasks);
          this.setState({ tasks });
        }
      } catch (e) {
        console.error('Failed to fetch Kanban tasks from WASM:', e);
      }
    }
  }

  /**
   * Prompts the user to edit an existing task's details.
   * @param id The ID of the task to edit.
   */
  private async editTask(id: string) {
    const tasks: KanbanTask[] = this.state.tasks || [];
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle === null) return;
    if (!newTitle.trim()) return;

    const newPriority =
      prompt('Edit priority (High, Medium, Low):', task.priority) || 'Medium';
    const newTagsStr = prompt(
      'Edit tags (comma separated):',
      task.tags.join(', '),
    );
    const newTags =
      newTagsStr !== null
        ? newTagsStr
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : task.tags;

    try {
      const response = await EXBA.api.process_ir(
        JSON.stringify({
          type: 'EditTask',
          payload: {
            id,
            title: newTitle.trim(),
            priority: newPriority,
            tags: newTags,
          },
        }),
      );
      if (response.type === 'KanbanData') {
        const updated = response.payload;
        this.saveLocalTasks(updated);
        this.setState({ tasks: updated });

        EXBA.notify('activity', {
          id: Math.random().toString(36).substring(2, 11),
          icon: '📝',
          msg: `Task "${newTitle.trim()}" updated (WASM)`,
          time: new Date().toLocaleTimeString(),
        });
      }
    } catch (e) {
      console.error('Failed to edit task in WASM:', e);
    }
  }

  /**
   * Handles the start of a drag operation on a task.
   */
  private dragStart(e: DragEvent, id: string) {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  /**
   * Prevents default behavior to allow dropping on a column.
   */
  private dragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  /**
   * Highlights a column when a task is dragged into it.
   */
  private dragEnter(e: DragEvent, colId: string) {
    e.preventDefault();
    const root = this.shadowRoot || this;
    const colEl = root.getElementById(`col-${colId}`);
    if (colEl) {
      colEl.classList.add('columnDragOver');
    }
  }

  /**
   * Removes highlighting from a column when a task is dragged out.
   */
  private dragLeave(e: DragEvent, colId: string) {
    const root = this.shadowRoot || this;
    const colEl = root.getElementById(`col-${colId}`);
    if (colEl) {
      colEl.classList.remove('columnDragOver');
    }
  }

  /**
   * Handles the drop of a task into a new column.
   * Synchronizes LocalStorage and notifies the activity signal.
   */
  private async drop(e: DragEvent, colId: string) {
    e.preventDefault();
    const root = this.shadowRoot || this;
    const colEl = root.getElementById(`col-${colId}`);
    if (colEl) {
      colEl.classList.remove('columnDragOver');
    }
    const id = e.dataTransfer?.getData('text/plain');
    if (id) {
      const tasks: KanbanTask[] = this.state.tasks || [];
      const task = tasks.find((t) => t.id === id);
      if (task && task.col !== colId) {
        try {
          const response = await EXBA.api.process_ir(
            JSON.stringify({
              type: 'MoveTask',
              payload: { id, col: colId },
            }),
          );
          if (response.type === 'KanbanData') {
            const updated = response.payload;
            this.saveLocalTasks(updated);
            this.setState({ tasks: updated });

            EXBA.notify('activity', {
              id: Math.random().toString(36).substring(2, 11),
              icon: '📋',
              msg: `Task "${task.title}" moved to ${colId.toUpperCase()} (WASM)`,
              time: new Date().toLocaleTimeString(),
            });
          }
        } catch (e) {
          console.error('Failed to move task in WASM:', e);
        }
      }
    }
  }

  /**
   * Prompts the user to create a new task in a specific column.
   * @param colId The starting column for the new task.
   */
  private async addTask(colId: string = 'todo') {
    const title = prompt('Enter task title:');
    if (!title) return;
    const priority = prompt('Enter priority (High, Medium, Low):') || 'Medium';
    const tags =
      prompt('Enter tags (comma separated):')
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) || [];

    try {
      const response = await EXBA.api.process_ir(
        JSON.stringify({
          type: 'AddTask',
          payload: { title, priority, tags },
        }),
      );
      if (response.type === 'KanbanData') {
        let updated = response.payload;

        if (colId !== 'todo') {
          const added = updated[updated.length - 1];
          if (added) {
            const moveRes = await EXBA.api.process_ir(
              JSON.stringify({
                type: 'MoveTask',
                payload: { id: added.id, col: colId },
              }),
            );
            if (moveRes.type === 'KanbanData') {
              updated = moveRes.payload;
            }
          }
        }

        this.saveLocalTasks(updated);
        this.setState({ tasks: updated });

        EXBA.notify('activity', {
          id: Math.random().toString(36).substring(2, 11),
          icon: '➕',
          msg: `Task "${title}" created in ${colId.toUpperCase()} (WASM)`,
          time: new Date().toLocaleTimeString(),
        });
      }
    } catch (e) {
      console.error('Failed to add task in WASM:', e);
    }
  }

  /**
   * Deletes a task by ID and updates LocalStorage.
   * @param id The ID of the task to delete.
   */
  private async deleteTask(id: string) {
    const tasks: KanbanTask[] = this.state.tasks || [];
    const task = tasks.find((t) => t.id === id);
    if (task) {
      try {
        const response = await EXBA.api.process_ir(
          JSON.stringify({
            type: 'DeleteTask',
            payload: { id },
          }),
        );
        if (response.type === 'KanbanData') {
          const updated = response.payload;
          this.saveLocalTasks(updated);
          this.setState({ tasks: updated });

          EXBA.notify('activity', {
            id: Math.random().toString(36).substring(2, 11),
            icon: '🗑️',
            msg: `Task "${task.title}" deleted (WASM)`,
            time: new Date().toLocaleTimeString(),
          });
        }
      } catch (e) {
        console.error('Failed to delete task in WASM:', e);
      }
    }
  }

  /**
   * Renders the board columns and tasks.
   */
  render() {
    const tasks: KanbanTask[] = this.state.tasks || [];
    const columns = [
      { id: 'todo', title: 'To Do' },
      { id: 'in-progress', title: 'In Progress' },
      { id: 'done', title: 'Done' },
    ];

    return `
      <div class="container">
        <header class="header">
          <h1 class="title">Engineering Board</h1>
          <div style="color: ${t.zinc500}; font-size: 0.875rem;">Local Storage State</div>
        </header>
        
        <div class="board">
          ${columns
            .map((col) => {
              const colTasks = tasks.filter((t) => t.col === col.id);
              return `
              <div class="column" id="col-${col.id}" ondragover="window.dispatchKanbanDragOver(event)" ondragenter="window.dispatchKanbanDragEnter(event, '${col.id}')" ondragleave="window.dispatchKanbanDragLeave(event, '${col.id}')" ondrop="window.dispatchKanbanDrop(event, '${col.id}')">
                <div class="colHeader">
                  <div class="colTitle">${col.title}</div>
                  <div class="colCount">${colTasks.length}</div>
                </div>
                <div class="taskList">
                  ${
                    colTasks.length > 0
                      ? colTasks
                          .map(
                            (t) => `
                      <div class="task taskActive" draggable="true" ondragstart="window.dispatchKanbanDragStart(event, '${t.id}')" onclick="window.dispatchKanbanEdit('${t.id}')">
                        <div style="position: absolute; top: 0.5rem; right: 0.5rem; cursor: pointer; color: ${t.zinc600};" onclick="event.stopPropagation(); window.dispatchKanbanDelete('${t.id}')">X</div>
                        <div class="taskTitle">${t.title}</div>
                        <div class="tagRow">
                          ${t.tags.map((tag: string) => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                        <div class="taskFooter">
                          <span class="priority priority${t.priority}">${t.priority}</span>
                          <span style="color: ${t.zinc600}; font-size: 0.65rem;">ID-${t.id}</span>
                        </div>
                      </div>
                    `,
                          )
                          .join('')
                      : `
                      <div class="empty">
                        <span class="emptyIcon">📭</span>
                        <span>Empty</span>
                      </div>
                    `
                  }
                </div>
                <button class="btn btnHover" onclick="window.dispatchKanbanAdd('${col.id}')">
                  <span>+</span> New Task
                </button>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    (window as any).dispatchKanbanEdit = (id: string) => this.editTask(id);
    (window as any).dispatchKanbanAdd = (colId?: string) => this.addTask(colId);
    (window as any).dispatchKanbanDelete = (id: string) => this.deleteTask(id);
    (window as any).dispatchKanbanDragStart = (e: DragEvent, id: string) =>
      this.dragStart(e, id);
    (window as any).dispatchKanbanDragOver = (e: DragEvent) => this.dragOver(e);
    (window as any).dispatchKanbanDragEnter = (e: DragEvent, colId: string) =>
      this.dragEnter(e, colId);
    (window as any).dispatchKanbanDragLeave = (e: DragEvent, colId: string) =>
      this.dragLeave(e, colId);
    (window as any).dispatchKanbanDrop = (e: DragEvent, colId: string) =>
      this.drop(e, colId);
  }
}
