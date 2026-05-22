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
 * Status toggle — single "Mark as answered" / "Answered ✓" button.
 * Toggling sends an explicit status PATCH. Toggling off sends
 * 'in_progress'; the server downgrades to 'not_started' if the body is
 * empty. Also updates the small status chip in the card header.
 */
class StatusToggle extends HTMLElement {
  private project!: string;
  private questionId!: string;
  private answeredBtn!: HTMLButtonElement;

  connectedCallback() {
    this.project = this.dataset.project ?? '';
    this.questionId = this.dataset.questionId ?? '';
    this.answeredBtn = this.querySelector('[data-action="toggle-answered"]') as HTMLButtonElement;
    this.answeredBtn?.addEventListener('click', () => this.toggle());
  }

  private currentStatus(): string {
    return this.dataset.status ?? 'not_started';
  }

  private async toggle() {
    const current = this.currentStatus();
    const next = current === 'answered' ? 'in_progress' : 'answered';
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

    const card = this.closest('.question-card');
    if (!card) return;
    card.className = card.className.replace(/\bstatus-\S+/g, `status-${status}`);
    const chip = card.querySelector<HTMLElement>('[data-role="status-chip"]');
    if (chip) {
      const label = status === 'answered' ? 'Answered' : '';
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
  internal: number;
}

interface MentionableUser {
  email: string;
  name: string;
  role: 'ec' | 'client';
}

// Per-project cache of the mentionable user list — the list is small and
// stable across a page load, so one fetch services every thread on the page.
const mentionableCache = new Map<string, Promise<MentionableUser[]>>();
function loadMentionable(project: string): Promise<MentionableUser[]> {
  const hit = mentionableCache.get(project);
  if (hit) return hit;
  const p = fetch(`/api/projects/${project}/mentionable`, { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : { users: [] }))
    .then((data: { users?: MentionableUser[] }) => data.users ?? [])
    .catch(() => [] as MentionableUser[]);
  mentionableCache.set(project, p);
  return p;
}

class CommentThread extends HTMLElement {
  private project!: string;
  private questionId!: string;
  private list!: HTMLElement;
  private form!: HTMLFormElement;
  private textarea!: HTMLTextAreaElement;
  private statusEl!: HTMLElement;
  private submitBtn!: HTMLButtonElement;
  private internalToggle: HTMLInputElement | null = null;

  // Mention autocomplete state
  private mentionables: MentionableUser[] = [];
  private mentionPopup: HTMLDivElement | null = null;
  private mentionTriggerStart = -1;       // index in textarea where '@' was typed
  private mentionFiltered: MentionableUser[] = [];
  private mentionSelected = 0;

  connectedCallback() {
    this.project = this.dataset.project ?? '';
    this.questionId = this.dataset.questionId ?? '';
    this.list = this.querySelector('[data-role="list"]') as HTMLElement;
    this.form = this.querySelector('[data-role="form"]') as HTMLFormElement;
    this.textarea = this.form.querySelector('textarea') as HTMLTextAreaElement;
    this.statusEl = this.form.querySelector('[data-role="status"]') as HTMLElement;
    this.submitBtn = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.internalToggle = this.form.querySelector('[data-role="internal-toggle"]') as HTMLInputElement | null;

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
    this.textarea.addEventListener('keydown', (e) => this.onTextareaKeydown(e));
    this.textarea.addEventListener('input', () => this.onTextareaInput());
    this.textarea.addEventListener('blur', () => {
      // Slight delay so click-on-option still registers before blur kills it.
      window.setTimeout(() => this.closeMentionPopup(), 120);
    });
    if (this.internalToggle) {
      this.internalToggle.addEventListener('change', () => {
        this.applyInternalState();
        // Re-filter the open popup so client roles disappear when toggled on.
        if (this.mentionTriggerStart >= 0) this.refreshMentionFilter();
      });
      // Always start in the safe (public) state on page load. Deliberately
      // not persisted: a sticky default is exactly how someone posts a
      // client-visible comment thinking it was internal.
      this.internalToggle.checked = false;
      this.applyInternalState();
    }

    // Kick off the mentionable fetch eagerly so the first @ is responsive.
    loadMentionable(this.project).then((users) => {
      this.mentionables = users;
    });
  }

  // === Mention autocomplete ===
  //
  // Detection is "did the user just type an @ that's at the start of input
  // or preceded by whitespace/punctuation, and not followed by anything
  // that looks like an email already". We track the @-position; as the
  // user keeps typing, we read the text from that position forward and
  // treat anything up to the next whitespace as the partial query.

  private onTextareaKeydown(e: KeyboardEvent) {
    // Ctrl/⌘+Enter submits regardless of popup state.
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.submit();
      return;
    }
    // Popup keyboard nav.
    if (this.mentionTriggerStart < 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.mentionSelected = (this.mentionSelected + 1) % Math.max(this.mentionFiltered.length, 1);
      this.renderMentionPopup();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const len = Math.max(this.mentionFiltered.length, 1);
      this.mentionSelected = (this.mentionSelected - 1 + len) % len;
      this.renderMentionPopup();
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (this.mentionFiltered.length > 0) {
        e.preventDefault();
        this.acceptMention(this.mentionFiltered[this.mentionSelected]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.closeMentionPopup();
    }
  }

  private onTextareaInput() {
    const value = this.textarea.value;
    const caret = this.textarea.selectionStart ?? value.length;

    // If we have an active trigger, check that it's still valid (caret still
    // after the @, no whitespace inserted between @ and caret).
    if (this.mentionTriggerStart >= 0) {
      if (caret < this.mentionTriggerStart + 1) {
        this.closeMentionPopup();
        return;
      }
      const slice = value.slice(this.mentionTriggerStart + 1, caret);
      if (/\s/.test(slice)) {
        this.closeMentionPopup();
        return;
      }
      this.refreshMentionFilter();
      return;
    }

    // Look for a freshly-typed @ at the caret position.
    if (caret === 0) return;
    const ch = value[caret - 1];
    if (ch !== '@') return;
    const before = caret >= 2 ? value[caret - 2] : '';
    // Only trigger at the start of input or after whitespace/punctuation.
    // Prevents tripping inside email-like patterns ("foo@bar.com").
    if (before && !/[\s(\[,;]/.test(before)) return;
    this.mentionTriggerStart = caret - 1;
    this.refreshMentionFilter();
  }

  private refreshMentionFilter() {
    const value = this.textarea.value;
    const caret = this.textarea.selectionStart ?? value.length;
    const query = value.slice(this.mentionTriggerStart + 1, caret).toLowerCase();
    const internalOn = this.internalToggle?.checked === true;
    const candidates = internalOn
      ? this.mentionables.filter((u) => u.role === 'ec')
      : this.mentionables;
    this.mentionFiltered = candidates.filter((u) => {
      if (!query) return true;
      return (
        u.email.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query)
      );
    }).slice(0, 8);
    this.mentionSelected = 0;
    this.renderMentionPopup();
  }

  private ensureMentionPopup(): HTMLDivElement {
    if (this.mentionPopup) return this.mentionPopup;
    const div = document.createElement('div');
    div.className = 'mention-popup';
    div.setAttribute('role', 'listbox');
    div.hidden = true;
    this.form.appendChild(div);
    div.addEventListener('mousedown', (e) => {
      // Prevent textarea blur on click.
      e.preventDefault();
    });
    div.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const opt = target.closest('[data-mention-email]');
      if (!opt) return;
      const email = opt.getAttribute('data-mention-email') ?? '';
      const user = this.mentionFiltered.find((u) => u.email === email);
      if (user) this.acceptMention(user);
    });
    this.mentionPopup = div;
    return div;
  }

  private renderMentionPopup() {
    const popup = this.ensureMentionPopup();
    // Position docked just under the textarea.
    const ta = this.textarea;
    const taRect = ta.getBoundingClientRect();
    const formRect = this.form.getBoundingClientRect();
    popup.style.top = `${taRect.bottom - formRect.top + 4}px`;
    popup.style.left = `${taRect.left - formRect.left}px`;
    popup.style.width = `${Math.max(taRect.width, 240)}px`;

    if (this.mentionFiltered.length === 0) {
      popup.innerHTML = '<div class="mention-empty">No matching users</div>';
      popup.hidden = false;
      return;
    }
    popup.innerHTML = this.mentionFiltered
      .map((u, i) => {
        const sel = i === this.mentionSelected ? 'true' : 'false';
        return `
          <div class="mention-option" role="option" aria-selected="${sel}" data-mention-email="${escapeAttr(u.email)}">
            <span class="mention-option-name"></span>
            <span class="mention-option-email"></span>
            <span class="mention-option-role" data-role="${u.role}">${u.role}</span>
          </div>
        `;
      })
      .join('');
    const nodes = popup.querySelectorAll('.mention-option');
    this.mentionFiltered.forEach((u, i) => {
      const node = nodes[i];
      if (!node) return;
      (node.querySelector('.mention-option-name') as HTMLElement).textContent = u.name;
      (node.querySelector('.mention-option-email') as HTMLElement).textContent = u.email;
    });
    popup.hidden = false;
  }

  private acceptMention(user: MentionableUser) {
    const value = this.textarea.value;
    const caret = this.textarea.selectionStart ?? value.length;
    // Replace from the @ trigger up to the current caret with `@email `.
    const before = value.slice(0, this.mentionTriggerStart);
    const after = value.slice(caret);
    const insertion = `@${user.email} `;
    const newValue = `${before}${insertion}${after}`;
    this.textarea.value = newValue;
    const newCaret = before.length + insertion.length;
    this.textarea.setSelectionRange(newCaret, newCaret);
    this.closeMentionPopup();
    this.textarea.focus();
  }

  private closeMentionPopup() {
    this.mentionTriggerStart = -1;
    this.mentionFiltered = [];
    this.mentionSelected = 0;
    if (this.mentionPopup) this.mentionPopup.hidden = true;
  }

  private applyInternalState() {
    const on = this.internalToggle?.checked === true;
    this.form.classList.toggle('comment-form--internal', on);
    this.submitBtn.textContent = on ? 'Post internal note' : 'Post comment';
  }

  private async submit() {
    const body = this.textarea.value.trim();
    if (!body) return;
    const internal = this.internalToggle?.checked === true;
    this.submitBtn.disabled = true;
    this.setStatus('saving', 'Posting…');
    try {
      const r = await fetch(
        `/api/projects/${this.project}/questions/${this.questionId}/comments`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ body, internal }),
        }
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as { comment: CommentPayload };
      this.appendComment(data.comment);
      this.textarea.value = '';
      // Reset the internal toggle after every post — same reason as on
      // page load: sticky-on is the failure mode that leaks notes to
      // clients (or hides them from clients), depending on direction.
      if (this.internalToggle) {
        this.internalToggle.checked = false;
        this.applyInternalState();
      }
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
    article.className = `comment comment-${role}${c.internal ? ' comment--internal' : ''}`;
    article.dataset.commentId = String(c.id);
    const time = new Date(c.created_at).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const badge = c.internal
      ? '<span class="comment-internal-badge" title="Internal — EC team only, not visible to client">INTERNAL</span>'
      : '';
    article.innerHTML = `
      <header class="comment-header">
        <span class="user-role user-role-${role}"></span>
        ${badge}
        <span class="comment-author"><code></code></span>
        <time class="comment-time" datetime="${escapeAttr(c.created_at)}"></time>
      </header>
      <p class="comment-body"></p>
    `;
    (article.querySelector('.user-role') as HTMLElement).textContent = c.author_label;
    (article.querySelector('.comment-author code') as HTMLElement).textContent = c.author_email;
    (article.querySelector('.comment-time') as HTMLElement).textContent = time;
    (article.querySelector('.comment-body') as HTMLElement).innerHTML = renderCommentBodyClient(c.body);
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Client-side mirror of src/lib/mentions.ts renderCommentBody — used for
// optimistic append when a comment is posted. Server-rendered comments go
// through the server helper; this needs to produce identical output.
const CLIENT_MENTION_PATTERN = /(^|[\s(\[,;])@([A-Za-z0-9._+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})/g;
function renderCommentBodyClient(body: string): string {
  const escaped = escapeHtml(body);
  return escaped.replace(CLIENT_MENTION_PATTERN, (_m, lead: string, email: string) => {
    const at = email.indexOf('@');
    const label = at > 0 ? email.slice(0, at) : email;
    return `${lead}<span class="mention-pill" title="${escapeAttr(email)}">@${escapeHtml(label)}</span>`;
  });
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
