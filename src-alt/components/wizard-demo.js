import { defineComponent } from '../framework/Component';

defineComponent({
  name: 'wizard-demo',
  initialState: {
    currentStep: 0,
    formData: {
      name: '',
      email: '',
      username: '',
      theme: 'dark',
      notifications: true,
    },
    isCompleted: false,
  },
  reducer: (state, action) => {
    if (action.type === 'NEXT_STEP') {
      return { ...state, currentStep: state.currentStep + 1 };
    }
    if (action.type === 'PREV_STEP') {
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    }
    if (action.type === 'UPDATE_FIELD') {
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    }
    if (action.type === 'COMPLETE') {
      return { ...state, isCompleted: true };
    }
    return state;
  },
  render: (state) => {
    const steps = [
      {
        title: 'Personal Information',
        fields: [
          {
            label: 'Full Name',
            name: 'name',
            type: 'text',
            placeholder: 'John Doe',
          },
          {
            label: 'Email Address',
            name: 'email',
            type: 'email',
            placeholder: 'john@example.com',
          },
        ],
      },
      {
        title: 'Account Settings',
        fields: [
          {
            label: 'Username',
            name: 'username',
            type: 'text',
            placeholder: 'johndoe123',
          },
          {
            label: 'Theme',
            name: 'theme',
            type: 'select',
            options: ['light', 'dark', 'system'],
          },
          {
            label: 'Enable Notifications',
            name: 'notifications',
            type: 'checkbox',
          },
        ],
      },
      {
        title: 'Review & Confirm',
        isReview: true,
      },
    ];

    const current = steps[state.currentStep];

    return `
      <style>
        :host {
          display: block;
          max-width: 32rem;
          margin: 2rem auto;
          font-family: inherit;
        }
        .wizard-card {
          background: var(--zinc-800);
          border: 1px solid var(--zinc-700);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .step-indicator {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
        }
        .step-indicator::before {
          content: '';
          position: absolute;
          top: 12px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--zinc-700);
          z-index: 0;
        }
        .step-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--zinc-700);
          border: 2px solid var(--zinc-600);
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--zinc-400);
          transition: all 0.3s;
        }
        .step-dot.active {
          background: var(--indigo-500);
          border-color: var(--indigo-400);
          color: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }
        .step-dot.completed {
          background: #22c55e;
          border-color: #16a34a;
          color: white;
        }
        h2 {
          font-size: 1.25rem;
          margin: 0 0 1.5rem;
          color: var(--zinc-100);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        label {
          font-size: 0.875rem;
          color: var(--zinc-400);
        }
        input[type="text"], input[type="email"], select {
          background: var(--zinc-900);
          border: 1px solid var(--zinc-700);
          border-radius: var(--radius-md);
          padding: 0.625rem;
          color: var(--zinc-200);
          font-size: 0.875rem;
        }
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .nav-btns {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--zinc-700);
        }
        button {
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-prev {
          background: transparent;
          border: 1px solid var(--zinc-600);
          color: var(--zinc-300);
        }
        .btn-prev:hover { background: var(--zinc-700); }
        .btn-next {
          background: var(--indigo-500);
          border: 1px solid var(--indigo-400);
          color: white;
        }
        .btn-next:hover { background: var(--indigo-600); }
        .review-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--zinc-700);
          font-size: 0.875rem;
        }
        .review-label { color: var(--zinc-500); }
        .review-value { color: var(--zinc-200); }
        .success-screen {
          text-align: center;
          padding: 2rem 0;
        }
        .success-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }
      </style>
      <div class="wizard-card">
        ${
          state.isCompleted
            ? `
          <div class="success-screen">
            <span class="success-icon">🎉</span>
            <h2>All set!</h2>
            <p style="color: var(--zinc-400); margin-bottom: 1.5rem;">Your profile has been created successfully.</p>
            <button class="btn-next" id="wizard-reset">Start Over</button>
          </div>
        `
            : `
          <div class="step-indicator">
            ${steps
              .map(
                (_, i) => `
              <div class="step-dot ${i === state.currentStep ? 'active' : ''} ${i < state.currentStep ? 'completed' : ''}">
                ${i < state.currentStep ? '✓' : i + 1}
              </div>
            `,
              )
              .join('')}
          </div>
          
          <h2>${current.title}</h2>

          ${
            current.isReview
              ? `
            <div class="review-list">
              ${Object.entries(state.formData)
                .map(
                  ([key, value]) => `
                <div class="review-item">
                  <span class="review-label">${key}</span>
                  <span class="review-value">${value}</span>
                </div>
              `,
                )
                .join('')}
            </div>
          `
              : `
            <div class="form-body">
              ${current.fields
                .map(
                  (field) => `
                <div class="form-group">
                  <label>${field.label}</label>
                  ${
                    field.type === 'select'
                      ? `
                    <select data-field="${field.name}">
                      ${field.options.map((opt) => `<option value="${opt}" ${state.formData[field.name] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                  `
                      : field.type === 'checkbox'
                        ? `
                    <label class="checkbox-group">
                      <input type="checkbox" data-field="${field.name}" ${state.formData[field.name] ? 'checked' : ''}>
                      <span>Enable this option</span>
                    </label>
                  `
                        : `
                    <input type="${field.type}" data-field="${field.name}" placeholder="${field.placeholder}" value="${state.formData[field.name]}">
                  `
                  }
                </div>
              `,
                )
                .join('')}
            </div>
          `
          }

          <div class="nav-btns">
            <button class="btn-prev" id="wizard-prev" ${state.currentStep === 0 ? 'disabled' : ''}>Back</button>
            <button class="btn-next" id="wizard-next">
              ${state.currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
            </button>
          </div>
        `
        }
      </div>
    `;
  },
  hooks: {
    onUpdate: (instance) => {
      const root = instance.shadowRoot;

      // Handle input changes
      root.querySelectorAll('[data-field]').forEach((input) => {
        const field = input.getAttribute('data-field');
        input.oninput = (e) => {
          const value =
            e.target.type === 'checkbox' ? e.target.checked : e.target.value;
          instance.dispatch({ type: 'UPDATE_FIELD', field, value });
        };
      });

      // Navigation
      root.getElementById('wizard-prev')?.addEventListener('click', () => {
        instance.dispatch({ type: 'PREV_STEP' });
      });

      root.getElementById('wizard-next')?.addEventListener('click', () => {
        const currentState = instance.getComponentState();
        if (currentState.currentStep === 2) {
          // Review step
          instance.dispatch({ type: 'COMPLETE' });
        } else {
          instance.dispatch({ type: 'NEXT_STEP' });
        }
      });

      // Reset
      root.getElementById('wizard-reset')?.addEventListener('click', () => {
        instance.setState({
          currentStep: 0,
          isCompleted: false,
          formData: {
            name: '',
            email: '',
            username: '',
            theme: 'dark',
            notifications: true,
          },
        });
      });
    },
  },
});
