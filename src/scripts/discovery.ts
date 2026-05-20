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
    // On load: if a body was pre-filled, the data is saved from a prior
    // session — show "Saved" without a timestamp (the response-footer
    // line already carries the precise last-updated timestamp).
    this.setIndicator('idle', this.lastSavedBody ? 'Saved' : '');

    this.textarea.addEventListener('input', () => this.scheduleSave());
    this.textarea.addEventListener('blur', () => this.flushNow());
  }

  // Autosave still fires 1s after the last keystroke + on blur — but the
  // indicator no longer chatters during typing. The user just sees their
  // text update; when a save lands, "Saved 9:24 PM" appears and stays.
  // This is the Notion / Google Docs pattern: safety net present, drama absent.
  private scheduleSave() {
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
    if (body === this.lastSavedBody) return;
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
      this.setIndicator('saved', `Saved ${this.fmtTime(new Date())}`);
    } catch (err) {
      console.error('response save failed', err);
      this.setIndicator('error', 'Save failed — retrying on next edit');
    }
  }

  private fmtTime(d: Date): string {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  private setIndicator(state: string, text: string) {
    this.indicator.dataset.state = state;
    this.indicator.textContent = text;
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

/**
 * Priority flag — single EC-only toggle that surfaces "answer this one
 * next" to the client. Updates the visible priority chip in the card
 * header and the card's accent border.
 */
class PriorityFlag extends HTMLElement {
  private project!: string;
  private questionId!: string;
  private button!: HTMLButtonElement;

  connectedCallback() {
    this.project = this.dataset.project ?? '';
    this.questionId = this.dataset.questionId ?? '';
    this.button = this.querySelector('button[data-action="toggle-flag"]') as HTMLButtonElement;
    this.button?.addEventListener('click', () => this.toggle());
  }

  private isFlagged(): boolean {
    return this.dataset.flagged === '1';
  }

  private async toggle() {
    const next = !this.isFlagged();
    const prev = this.isFlagged();
    this.applyFlag(next);
    try {
      const r = await fetch(
        `/api/projects/${this.project}/questions/${this.questionId}/status`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ flagged: next }),
        }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    } catch (err) {
      console.error('priority flag toggle failed', err);
      this.applyFlag(prev);
      alert('Failed to update flag — please retry.');
    }
  }

  private applyFlag(flagged: boolean) {
    this.dataset.flagged = flagged ? '1' : '0';
    this.button?.classList.toggle('selected', flagged);
    const card = this.closest('.question-card');
    if (!card) return;
    card.classList.toggle('priority-flagged', flagged);
    const header = card.querySelector('.question-card-header');
    if (!header) return;
    let chip = header.querySelector<HTMLElement>('[data-role="priority-chip"]');
    if (flagged && !chip) {
      chip = document.createElement('span');
      chip.className = 'priority-chip';
      chip.dataset.role = 'priority-chip';
      chip.textContent = 'Priority';
      // Insert after the question-id badge so it sits with the title.
      const qid = header.querySelector('.question-id');
      qid?.parentNode?.insertBefore(chip, qid.nextSibling);
    } else if (!flagged && chip) {
      chip.remove();
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

class NotificationPrefs extends HTMLElement {
  private project!: string;
  private digestInput!: HTMLInputElement;
  private statusEl!: HTMLElement;
  private lastValue = false;

  connectedCallback() {
    this.project = this.dataset.project ?? '';
    this.digestInput = this.querySelector('[data-action="daily-digest"]') as HTMLInputElement;
    this.statusEl = this.querySelector('[data-role="status"]') as HTMLElement;
    if (!this.digestInput) return;
    this.lastValue = this.digestInput.checked;
    this.digestInput.addEventListener('change', () => this.save());
  }

  private async save() {
    const value = this.digestInput.checked;
    this.setStatus('saving', 'Saving…');
    this.digestInput.disabled = true;
    try {
      const r = await fetch(`/api/projects/${this.project}/notifications`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ daily_digest: value }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      this.lastValue = value;
      this.setStatus('saved', value ? 'On — you’ll get tomorrow’s digest' : 'Off');
    } catch (err) {
      console.error('notification pref save failed', err);
      this.digestInput.checked = this.lastValue;
      this.setStatus('error', 'Save failed — please retry');
    } finally {
      this.digestInput.disabled = false;
    }
  }

  private setStatus(state: string, text: string) {
    this.statusEl.dataset.state = state;
    this.statusEl.textContent = text;
  }
}

if (!customElements.get('response-form')) {
  customElements.define('response-form', ResponseForm);
}
if (!customElements.get('status-toggle')) {
  customElements.define('status-toggle', StatusToggle);
}
if (!customElements.get('priority-flag')) {
  customElements.define('priority-flag', PriorityFlag);
}
if (!customElements.get('comment-thread')) {
  customElements.define('comment-thread', CommentThread);
}
if (!customElements.get('notification-prefs')) {
  customElements.define('notification-prefs', NotificationPrefs);
}
