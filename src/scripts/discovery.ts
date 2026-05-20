class ResponseForm extends HTMLElement {
  private textarea!: HTMLTextAreaElement;
  private indicator!: HTMLElement;
  private project!: string;
  private questionId!: string;
  private saveTimer: number | null = null;
  private lastSavedBody = '';

  connectedCallback() {
    this.project = this.dataset.project ?? '';
    this.questionId = this.dataset.questionId ?? '';
    this.textarea = this.querySelector('textarea') as HTMLTextAreaElement;
    this.indicator = this.querySelector('.save-indicator') as HTMLElement;
    if (!this.textarea || !this.indicator) return;
    this.lastSavedBody = this.textarea.value;
    this.setIndicator('idle', this.lastSavedBody ? 'Saved' : '');

    this.textarea.addEventListener('input', () => this.scheduleSave());
    this.textarea.addEventListener('blur', () => this.flushNow());
  }

  private scheduleSave() {
    this.setIndicator('typing', 'Editing…');
    if (this.saveTimer !== null) window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => this.save(), 1000);
  }

  private flushNow() {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (this.textarea.value !== this.lastSavedBody) this.save();
  }

  private async save() {
    const body = this.textarea.value;
    if (body === this.lastSavedBody) {
      this.setIndicator('idle', body ? 'Saved' : '');
      return;
    }
    this.setIndicator('saving', 'Saving…');
    try {
      const r = await fetch(
        `/api/projects/${this.project}/questions/${this.questionId}/response`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ body }),
        }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      this.lastSavedBody = body;
      this.setIndicator('saved', 'Saved');
    } catch (err) {
      console.error('response save failed', err);
      this.setIndicator('error', 'Save failed — retrying on next edit');
    }
  }

  private setIndicator(state: string, text: string) {
    this.indicator.dataset.state = state;
    this.indicator.textContent = text;
  }
}

class StatusPills extends HTMLElement {
  private project!: string;
  private questionId!: string;

  connectedCallback() {
    this.project = this.dataset.project ?? '';
    this.questionId = this.dataset.questionId ?? '';

    this.querySelectorAll<HTMLButtonElement>('button[data-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const status = btn.dataset.status;
        if (status) this.update({ status });
      });
    });
    this.querySelectorAll<HTMLButtonElement>('button[data-priority]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const priority = btn.dataset.priority;
        if (priority) this.update({ priority });
      });
    });
  }

  private async update(patch: { status?: string; priority?: string }) {
    const prevSelection = this.captureSelection();
    this.applySelection(patch);
    try {
      const r = await fetch(
        `/api/projects/${this.project}/questions/${this.questionId}/status`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(patch),
        }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    } catch (err) {
      console.error('status update failed', err);
      this.applySelection(prevSelection);
      alert('Failed to update — please retry.');
    }
  }

  private captureSelection(): { status?: string; priority?: string } {
    const status = this.querySelector<HTMLButtonElement>('button[data-status].selected')?.dataset
      .status;
    const priority = this.querySelector<HTMLButtonElement>(
      'button[data-priority].selected'
    )?.dataset.priority;
    return { status, priority };
  }

  private applySelection(patch: { status?: string; priority?: string }) {
    if (patch.status !== undefined) {
      this.querySelectorAll<HTMLButtonElement>('button[data-status]').forEach((b) => {
        b.classList.toggle('selected', b.dataset.status === patch.status);
      });
    }
    if (patch.priority !== undefined) {
      this.querySelectorAll<HTMLButtonElement>('button[data-priority]').forEach((b) => {
        b.classList.toggle('selected', b.dataset.priority === patch.priority);
      });
    }
  }
}

if (!customElements.get('response-form')) {
  customElements.define('response-form', ResponseForm);
}
if (!customElements.get('status-pills')) {
  customElements.define('status-pills', StatusPills);
}
