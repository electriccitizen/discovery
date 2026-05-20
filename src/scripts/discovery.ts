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

/**
 * Status toggle — two action buttons:
 *   - "Mark as answered" / "Answered ✓"
 *   - "Flag for clarification" / "Flagged — needs clarification"
 * Toggling either button sends an explicit status PATCH. Toggling off
 * sends 'in_progress'; the server downgrades to 'not_started' if the
 * body is empty. Also updates the small status chip in the card header.
 */
class StatusToggle extends HTMLElement {
  private project!: string;
  private questionId!: string;
  private answeredBtn!: HTMLButtonElement;
  private clarificationBtn!: HTMLButtonElement;

  connectedCallback() {
    this.project = this.dataset.project ?? '';
    this.questionId = this.dataset.questionId ?? '';
    this.answeredBtn = this.querySelector('[data-action="toggle-answered"]') as HTMLButtonElement;
    this.clarificationBtn = this.querySelector('[data-action="toggle-clarification"]') as HTMLButtonElement;
    this.answeredBtn?.addEventListener('click', () => this.toggle('answered'));
    this.clarificationBtn?.addEventListener('click', () => this.toggle('needs_clarification'));
  }

  private currentStatus(): string {
    return this.dataset.status ?? 'not_started';
  }

  private async toggle(target: 'answered' | 'needs_clarification') {
    const current = this.currentStatus();
    const next = current === target ? 'in_progress' : target;
    const prev = current;

    this.applyStatus(next);
    try {
      const r = await fetch(
        `/api/projects/${this.project}/questions/${this.questionId}/status`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: next }),
        }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as { response: { status: string } };
      // Server may downgrade 'in_progress' → 'not_started' when body is empty.
      this.applyStatus(data.response.status);
    } catch (err) {
      console.error('status toggle failed', err);
      this.applyStatus(prev);
      alert('Failed to update — please retry.');
    }
  }

  private applyStatus(status: string) {
    this.dataset.status = status;
    this.answeredBtn?.classList.toggle('selected', status === 'answered');
    this.clarificationBtn?.classList.toggle('selected', status === 'needs_clarification');

    const card = this.closest('.question-card');
    if (!card) return;
    card.className = card.className.replace(/\bstatus-\S+/g, `status-${status}`);
    const chip = card.querySelector<HTMLElement>('[data-role="status-chip"]');
    if (chip) {
      const label =
        status === 'answered'
          ? 'Answered'
          : status === 'needs_clarification'
            ? 'Needs clarification'
            : '';
      chip.textContent = label;
      chip.className = `status-chip status-chip-${status}`;
      chip.hidden = label === '';
    }
  }
}

interface CommentPayload {
  id: number;
  author_email: string;
  author_label: string;
  body: string;
  created_at: string;
}

class CommentThread extends HTMLElement {
  private project!: string;
  private questionId!: string;
  private list!: HTMLElement;
  private form!: HTMLFormElement;
  private textarea!: HTMLTextAreaElement;
  private statusEl!: HTMLElement;
  private submitBtn!: HTMLButtonElement;

  connectedCallback() {
    this.project = this.dataset.project ?? '';
    this.questionId = this.dataset.questionId ?? '';
    this.list = this.querySelector('[data-role="list"]') as HTMLElement;
    this.form = this.querySelector('[data-role="form"]') as HTMLFormElement;
    this.textarea = this.form.querySelector('textarea') as HTMLTextAreaElement;
    this.statusEl = this.form.querySelector('[data-role="status"]') as HTMLElement;
    this.submitBtn = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
    this.textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.submit();
      }
    });
  }

  private async submit() {
    const body = this.textarea.value.trim();
    if (!body) return;
    this.submitBtn.disabled = true;
    this.setStatus('saving', 'Posting…');
    try {
      const r = await fetch(
        `/api/projects/${this.project}/questions/${this.questionId}/comments`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ body }),
        }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as { comment: CommentPayload };
      this.appendComment(data.comment);
      this.textarea.value = '';
      this.setStatus('saved', 'Posted');
      window.setTimeout(() => this.setStatus('idle', ''), 1500);
    } catch (err) {
      console.error('comment post failed', err);
      this.setStatus('error', 'Failed — retry?');
    } finally {
      this.submitBtn.disabled = false;
    }
  }

  private appendComment(c: CommentPayload) {
    const empty = this.list.querySelector('.comment-empty');
    if (empty) empty.remove();
    const role = c.author_label === 'EC' ? 'ec' : 'client';
    const article = document.createElement('article');
    article.className = `comment comment-${role}`;
    article.dataset.commentId = String(c.id);
    const time = new Date(c.created_at).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    article.innerHTML = `
      <header class="comment-header">
        <span class="user-role user-role-${role}"></span>
        <span class="comment-author"><code></code></span>
        <time class="comment-time" datetime="${escapeAttr(c.created_at)}"></time>
      </header>
      <p class="comment-body"></p>
    `;
    (article.querySelector('.user-role') as HTMLElement).textContent = c.author_label;
    (article.querySelector('.comment-author code') as HTMLElement).textContent = c.author_email;
    (article.querySelector('.comment-time') as HTMLElement).textContent = time;
    (article.querySelector('.comment-body') as HTMLElement).textContent = c.body;
    this.list.appendChild(article);
  }

  private setStatus(state: string, text: string) {
    this.statusEl.dataset.state = state;
    this.statusEl.textContent = text;
  }
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

if (!customElements.get('response-form')) {
  customElements.define('response-form', ResponseForm);
}
if (!customElements.get('status-pills')) {
  customElements.define('status-pills', StatusPills);
}
if (!customElements.get('status-toggle')) {
  customElements.define('status-toggle', StatusToggle);
}
if (!customElements.get('comment-thread')) {
  customElements.define('comment-thread', CommentThread);
}
