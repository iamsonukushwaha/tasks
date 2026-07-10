'use strict';

// ── Live clock ────────────────────────────────────────────────────────────────
function updateClock() {
    const now = new Date();
    document.getElementById('date').textContent = now.toDateString();
    document.getElementById('time').textContent = now.toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);

// ── State ─────────────────────────────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentFilter = 'all';

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderTasks() {
    const list = document.getElementById('task-list');
    const emptyMsg = document.getElementById('empty-msg');
    const countEl = document.getElementById('task-count');

    const filtered = tasks.filter(t => {
        if (currentFilter === 'pending') return !t.done;
        if (currentFilter === 'done')    return  t.done;
        return true;
    });

    list.innerHTML = '';

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.done ? ' done' : '');

        const dueStr = task.due
            ? `<span class="due ${isOverdue(task) ? 'overdue' : ''}">&#128336; ${formatDue(task.due)}</span>`
            : '';

        li.innerHTML = `
            <button class="check-btn" data-id="${task.id}" title="${task.done ? 'Mark pending' : 'Mark done'}">
                ${task.done ? '&#10003;' : ''}
            </button>
            <span class="task-text">${escapeHtml(task.text)}</span>
            ${dueStr}
            <button class="delete-btn" data-id="${task.id}" title="Delete task">&#10005;</button>
        `;
        list.appendChild(li);
    });

    const total = tasks.length;
    const done  = tasks.filter(t => t.done).length;
    countEl.textContent = total ? `(${done}/${total} done)` : '';
    emptyMsg.style.display = filtered.length ? 'none' : 'block';
}

function isOverdue(task) {
    return !task.done && task.due && new Date(task.due) < new Date();
}

function formatDue(due) {
    const d = new Date(due);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Add task ──────────────────────────────────────────────────────────────────
function addTask() {
    const input = document.getElementById('task-input');
    const dueInput = document.getElementById('due-input');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }

    tasks.unshift({ id: Date.now(), text, due: dueInput.value || null, done: false });
    saveTasks();
    renderTasks();
    input.value = '';
    dueInput.value = '';
    input.focus();
}

document.getElementById('add-btn').addEventListener('click', addTask);
document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
});

// ── Toggle / Delete ───────────────────────────────────────────────────────────
document.getElementById('task-list').addEventListener('click', e => {
    const id = Number(e.target.dataset.id);
    if (!id) return;

    if (e.target.classList.contains('check-btn')) {
        const task = tasks.find(t => t.id === id);
        if (task) { task.done = !task.done; saveTasks(); renderTasks(); }
    }
    if (e.target.classList.contains('delete-btn')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
});

// ── Filters ───────────────────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderTasks();

