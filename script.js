/* --- SOUND ENGINE --- */
const SoundEngine = {
    ctx: null, muted: false,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); },
    playSynth(freq, type, duration, vol = 0.1, slideTo = null) { if (this.muted || !this.ctx) return; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); const filter = this.ctx.createBiquadFilter(); osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime); if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration); filter.type = 'lowpass'; filter.frequency.setValueAtTime(1000, this.ctx.currentTime); filter.frequency.linearRampToValueAtTime(5000, this.ctx.currentTime + duration); gain.gain.setValueAtTime(vol, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration); osc.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + duration); },
    boot() { if(this.muted) return; this.playSynth(110, 'sawtooth', 0.8, 0.1, 880); setTimeout(() => this.playSynth(220, 'square', 0.6, 0.05, 440), 100); },
    click() { if(this.muted) return; this.playSynth(1200, 'sine', 0.05, 0.05); },
    openWindow() { if(this.muted) return; this.playSynth(300, 'sawtooth', 0.15, 0.05, 600); },
    closeWindow() { if(this.muted) return; this.playSynth(600, 'triangle', 0.15, 0.05, 200); },
    error() { if(this.muted) return; this.playSynth(150, 'sawtooth', 0.3, 0.1); setTimeout(() => this.playSynth(100, 'sawtooth', 0.3, 0.1), 100); },
    notify() { if(this.muted) return; this.playSynth(880, 'sine', 0.1, 0.05); setTimeout(() => this.playSynth(1320, 'sine', 0.2, 0.05), 100); }
};
document.addEventListener('click', () => { SoundEngine.init(); }, { once: true });

function toggleMute() {
    SoundEngine.muted = !SoundEngine.muted;
    const icon = document.getElementById('vol-icon');
    localStorage.setItem('nexus_muted', SoundEngine.muted);
    if (SoundEngine.muted) { icon.classList.remove('fa-volume-high'); icon.classList.add('fa-volume-xmark', 'muted'); }
    else { icon.classList.remove('fa-volume-xmark', 'muted'); icon.classList.add('fa-volume-high'); SoundEngine.init(); SoundEngine.click(); }
}

/* --- ESTADO DO SISTEMA --- */
const systemState = { windows: [], zIndexCounter: 100, fileSystem: {}, todos: [], theme: 'dark', wallpaperSrc: '', accentColor: '#7aa2f7', accentGradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', windowOpacity: 0.85, events: {} };

document.addEventListener('DOMContentLoaded', () => { loadSystemData(); startBootSequence(); });

function startBootSequence() {
    const progress = document.querySelector('.loader-progress');
    const bootScreen = document.getElementById('boot-screen');
    setTimeout(() => { progress.style.width = '100%'; }, 100);
    setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.style.display = 'none';
            if(!SoundEngine.muted) SoundEngine.boot();
            showNotification("NexusOS Pronto");
        }, 500);
    }, 2600);
}

function loadSystemData() {
    const storedFiles = localStorage.getItem('webos_files');
    systemState.fileSystem = storedFiles ? JSON.parse(storedFiles) : { "leia-me.txt": "Bem-vindo ao NexusOS." };
    
    const storedTodos = localStorage.getItem('webos_todos');
    systemState.todos = storedTodos ? JSON.parse(storedTodos) : [];

    const storedEvents = localStorage.getItem('webos_events');
    if (storedEvents) systemState.events = JSON.parse(storedEvents);

    const storedTheme = localStorage.getItem('webos_theme');
    if (storedTheme) { systemState.theme = storedTheme; document.body.className = `theme-${storedTheme}`; }
    
    const storedWpSrc = localStorage.getItem('nexus_wp_src');
    if (storedWpSrc) {
        document.body.style.backgroundImage = `url('${storedWpSrc}')`;
        systemState.wallpaperSrc = storedWpSrc;
    }

    const storedAccent = localStorage.getItem('nexus_accent_color');
    const storedGradient = localStorage.getItem('nexus_accent_gradient');
    const storedOpacity = localStorage.getItem('nexus_window_opacity');

    if (storedAccent && storedGradient) setAccentColor(storedAccent, storedGradient, false);
    if (storedOpacity) {
        setWindowOpacity(storedOpacity, false);
        const slider = document.getElementById('opacity-slider');
        if(slider) slider.value = storedOpacity;
    }

    const isMuted = localStorage.getItem('nexus_muted') === 'true';
    if (isMuted) {
        SoundEngine.muted = true;
        const icon = document.getElementById('vol-icon');
        if(icon) { icon.classList.remove('fa-volume-high'); icon.classList.add('fa-volume-xmark', 'muted'); }
    }

    updateClock(); setInterval(updateClock, 1000);
}

function saveSystemData() {
    localStorage.setItem('webos_files', JSON.stringify(systemState.fileSystem));
    localStorage.setItem('webos_todos', JSON.stringify(systemState.todos));
    localStorage.setItem('webos_events', JSON.stringify(systemState.events));
    localStorage.setItem('webos_theme', systemState.theme);
    localStorage.setItem('nexus_wp_src', systemState.wallpaperSrc);
    localStorage.setItem('nexus_accent_color', systemState.accentColor);
    localStorage.setItem('nexus_accent_gradient', systemState.accentGradient);
    localStorage.setItem('nexus_window_opacity', systemState.windowOpacity);
}

function setWallpaper(el) {
    SoundEngine.click();
    const src = el.getAttribute('data-src');
    systemState.wallpaperSrc = src;
    document.body.style.backgroundImage = `url('${src}')`;
    saveSystemData();
    showNotification("Papel de Parede Alterado");
}

function setAccentColor(color, gradient, save = true) {
    SoundEngine.click();
    const root = document.documentElement;
    root.style.setProperty('--accent-color', color);
    root.style.setProperty('--accent-gradient', gradient);
    systemState.accentColor = color;
    systemState.accentGradient = gradient;
    if(save) saveSystemData();
}

function setWindowOpacity(value, save = true) {
    const root = document.documentElement;
    let baseColor = systemState.theme === 'dark' ? '30, 30, 60' : '255, 255, 255';
    root.style.setProperty('--window-bg', `rgba(${baseColor}, ${value})`);
    systemState.windowOpacity = value;
    const label = document.getElementById('opacity-value');
    if(label) label.innerText = Math.round(value * 100) + "%";
    if(save) saveSystemData();
}

/* --- FUNÇÃO DE MAXIMIZAR/RESTAURAR --- */
function toggleMaximizeWindow(id) {
    SoundEngine.click();
    const win = document.getElementById(id);
    if (!win) return;

    if (win.classList.contains('maximized')) {
        // RESTAURAR
        win.classList.remove('maximized');
        if (win.dataset.prevTop) win.style.top = win.dataset.prevTop;
        if (win.dataset.prevLeft) win.style.left = win.dataset.prevLeft;
        if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
        if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
    } else {
        // MAXIMIZAR
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.classList.add('maximized');
    }
}

/* --- JANELAS & UI --- */
function openApp(appName) {
    SoundEngine.click();
    const id = 'win-' + Date.now();
    let title = '', icon = '', tplId = '', w = '600px', h = '400px';

    if(appName === 'explorer') { title='Explorador'; icon='fa-folder-tree'; tplId='tpl-explorer'; }
    else if(appName === 'browser') { title='Navegador'; icon='fa-globe'; tplId='tpl-browser'; w='800px'; h='500px'; }
    else if(appName === 'notepad') { title='Editor'; icon='fa-pen-nib'; tplId='tpl-notepad'; w='500px'; h='350px'; }
    else if(appName === 'todo') { title='Tarefas'; icon='fa-check-double'; tplId='tpl-todo'; w='350px'; h='400px'; }
    else if(appName === 'calculator') { title='Calculadora'; icon='fa-calculator'; tplId='tpl-calculator'; w='300px'; h='400px'; }
    else if(appName === 'tictactoe') { title='Jogo'; icon='fa-gamepad'; tplId='tpl-tictactoe'; w='300px'; h='350px'; }
    else if(appName === 'monitor') { title='Monitor'; icon='fa-chart-line'; tplId='tpl-monitor'; w='300px'; h='250px'; }
    else if(appName === 'settings') { title='Sistema'; icon='fa-sliders-h'; tplId='tpl-settings'; w='450px'; h='400px'; }
    else if(appName === 'terminal') { title='Terminal'; icon='fa-code'; tplId='tpl-terminal'; w='600px'; h='350px'; }
    else if(appName === 'store') { title='Loja'; icon='fa-store'; tplId='tpl-store'; w='600px'; h='450px'; }
    else if(appName === 'calendar') { title='Agenda'; icon='fa-calendar-alt'; tplId='tpl-calendar'; w='400px'; h='500px'; }

    createWindow(id, title, icon, document.getElementById(tplId).innerHTML, w, h, appName);
}

function createWindow(id, title, icon, content, w, h, appType) {
    SoundEngine.openWindow();
    const win = document.createElement('div');
    win.classList.add('window'); win.id = id;
    win.style.width = w; win.style.height = h;
    win.style.top = '50px'; win.style.left = '50px';
    win.style.zIndex = ++systemState.zIndexCounter;
    // Note: O HTML do template já inclui o botão btn-max no header
    win.innerHTML = `<div class="window-header" onmousedown="startDrag(event, '${id}')"><div class="window-title"><i class="fa-solid ${icon}"></i> ${title}</div><div class="window-controls"><button class="win-btn btn-min" onclick="minimizeWindow('${id}')"></button><button class="win-btn btn-max" onclick="toggleMaximizeWindow('${id}')"></button><button class="win-btn btn-close" onclick="closeWindow('${id}')"></button></div></div><div class="window-body">${content}</div>`;
    
    win.addEventListener('mousedown', () => focusWindow(id));
    document.body.appendChild(win);
    systemState.windows.push({ id, appType, minimized: false });
    addTaskbarItem(id, title, icon);

    if (appType === 'explorer') renderFiles();
    if (appType === 'terminal') initTerminalLogic(win);
    if (appType === 'todo') renderTodos();
    if (appType === 'tictactoe') initTicTacToe();
    if (appType === 'monitor') startMonitor();
    if (appType === 'store') renderStore();
    if (appType === 'calendar') initCalendar();
    
    if (appType === 'settings') {
        setTimeout(() => {
            const slider = document.getElementById('opacity-slider');
            if(slider) {
                slider.value = systemState.windowOpacity;
                const label = document.getElementById('opacity-value');
                if(label) label.innerText = Math.round(systemState.windowOpacity * 100) + "%";
            }
        }, 100);
    }
}

function closeWindow(id) { SoundEngine.closeWindow(); document.getElementById(id)?.remove(); systemState.windows = systemState.windows.filter(w => w.id !== id); removeTaskbarItem(id); }
function minimizeWindow(id) { SoundEngine.click(); const win = document.getElementById(id); win.style.display = 'none'; systemState.windows.find(w => w.id === id).minimized = true; document.getElementById('task-' + id)?.classList.remove('active'); }
function focusWindow(id) { SoundEngine.click(); const win = document.getElementById(id); if (!win) return; if (win.style.display === 'none') { win.style.display = 'flex'; systemState.windows.find(w => w.id === id).minimized = false; } win.style.zIndex = ++systemState.zIndexCounter; document.querySelectorAll('.taskbar-item').forEach(el => el.classList.remove('active')); document.getElementById('task-' + id)?.classList.add('active'); }

/* --- DRAG AND DROP ATUALIZADO --- */
let isDragging = false, dragOffset = { x: 0, y: 0 }, currentWindow = null;

function startDrag(e, id) {
    if (e.target.closest('.window-controls')) return;
    
    const win = document.getElementById(id);
    // Impede arrastar se estiver maximizada
    if (win && win.classList.contains('maximized')) return;

    isDragging = true;
    currentWindow = win;
    focusWindow(id);
    const rect = currentWindow.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
}

document.addEventListener('mousemove', (e) => { if (isDragging && currentWindow) { let x = e.clientX - dragOffset.x; let y = e.clientY - dragOffset.y; if (x < 0) x = 0; if (y < 0) y = 0; currentWindow.style.left = `${x}px`; currentWindow.style.top = `${y}px`; } });
document.addEventListener('mouseup', () => { isDragging = false; currentWindow = null; });

/* --- UI HELPERS --- */
function toggleStartMenu() { SoundEngine.click(); document.getElementById('start-menu').classList.toggle('hidden'); }
document.addEventListener('click', (e) => { if (!document.getElementById('start-menu').contains(e.target) && !document.getElementById('start-btn').contains(e.target)) document.getElementById('start-menu').classList.add('hidden'); if (!document.getElementById('context-menu').contains(e.target)) document.getElementById('context-menu').classList.add('hidden'); });
function addTaskbarItem(id, title, icon) { const bar = document.getElementById('taskbar-apps'); const item = document.createElement('div'); item.className = 'taskbar-item active'; item.id = 'task-' + id; item.innerHTML = `<i class="fa-solid ${icon}"></i>`; item.onclick = () => focusWindow(id); bar.appendChild(item); }
function removeTaskbarItem(id) { document.getElementById('task-' + id)?.remove(); }
function updateClock() { const now = new Date(); document.getElementById('time').innerText = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); document.getElementById('date').innerText = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function showNotification(msg) { SoundEngine.notify(); const c = document.getElementById('notification-container'); const n = document.createElement('div'); n.className = 'notification'; n.innerText = msg; c.appendChild(n); setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000); }
document.addEventListener('contextmenu', (e) => { e.preventDefault(); SoundEngine.click(); const ctx = document.getElementById('context-menu'); ctx.style.left = `${e.clientX}px`; ctx.style.top = `${e.clientY}px`; ctx.classList.remove('hidden'); });
function refreshDesktop() { SoundEngine.click(); document.getElementById('context-menu').classList.add('hidden'); showNotification("Área de Trabalho Atualizada"); }
function toggleTheme() { SoundEngine.click(); systemState.theme = systemState.theme === 'dark' ? 'light' : 'dark'; document.body.className = `theme-${systemState.theme}`; saveSystemData(); document.getElementById('context-menu').classList.add('hidden'); }

function switchTab(tabName) {
    SoundEngine.click();
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const buttons = document.querySelectorAll('.tab-btn');
    if(tabName === 'visual') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

/* --- LOJA --- */
function renderStore() {
    const list = document.querySelector('.store-grid');
    if(!list) return;
    list.innerHTML = '';
    const apps = [
        { id: 'weather', name: 'Clima', icon: 'fa-cloud-sun', color: '#ffd700', desc: 'Previsão local' },
        { id: 'music', name: 'Música', icon: 'fa-music', color: '#bb9af7', desc: 'Player de áudio' }
    ];
    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `<i class="fa-solid ${app.icon}"></i><h4>${app.name}</h4><p>${app.desc}</p><button class="install-btn" onclick="alert('Em breve!')">Instalar</button>`;
        list.appendChild(card);
    });
}

/* --- CALENDÁRIO --- */
let currentCalDate = new Date();
let selectedDateKey = null;
function initCalendar() { renderCalendarGrid(); }
function changeMonth(delta) { currentCalDate.setMonth(currentCalDate.getMonth() + delta); renderCalendarGrid(); }
function renderCalendarGrid() {
    const grid = document.getElementById('cal-days-grid');
    const monthTitle = document.getElementById('cal-month-year');
    if(!grid || !monthTitle) return;
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    monthTitle.innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentCalDate);
    grid.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for(let i=0; i<firstDay; i++) { const empty = document.createElement('div'); empty.className = 'cal-day empty'; grid.appendChild(empty); }
    const today = new Date();
    for(let d=1; d<=daysInMonth; d++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'cal-day';
        if(d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayDiv.classList.add('today');
        dayDiv.innerHTML = `<span>${d}</span>`;
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if(systemState.events[dateKey]) { const dot = document.createElement('div'); dot.className = 'event-dot'; dayDiv.appendChild(dot); }
        dayDiv.onclick = () => openEventModal(dateKey, d);
        grid.appendChild(dayDiv);
    }
}
function openEventModal(dateKey, day) {
    selectedDateKey = dateKey;
    const modal = document.getElementById('event-modal');
    const title = document.getElementById('modal-date-title');
    const note = document.getElementById('event-note');
    title.innerText = `Lembrete: ${day}/${currentCalDate.getMonth()+1}`;
    note.value = systemState.events[dateKey] || '';
    modal.classList.remove('hidden');
}
function closeEventModal() { document.getElementById('event-modal').classList.add('hidden'); selectedDateKey = null; }
function saveEvent() {
    if(!selectedDateKey) return;
    const note = document.getElementById('event-note').value.trim();
    if(note) systemState.events[selectedDateKey] = note; else delete systemState.events[selectedDateKey];
    saveSystemData(); closeEventModal(); renderCalendarGrid(); showNotification("Evento Salvo");
}

/* --- OUTROS APPS --- */
function renderFiles() { document.querySelectorAll('.explorer-main').forEach(container => { container.innerHTML = ''; Object.keys(systemState.fileSystem).forEach(filename => { const div = document.createElement('div'); div.className = 'file-item'; div.innerHTML = `<i class="fa-solid fa-file-lines"></i><span>${filename}</span>`; div.ondblclick = () => openFileInNotepad(filename); div.oncontextmenu = (e) => { e.preventDefault(); if(confirm(`Deletar ${filename}?`)) { delete systemState.fileSystem[filename]; saveSystemData(); renderFiles(); } }; container.appendChild(div); }); }); }
function createNewFilePrompt() { SoundEngine.click(); const name = prompt("Nome do arquivo:"); if (name && !systemState.fileSystem[name]) { systemState.fileSystem[name] = ""; saveSystemData(); renderFiles(); showNotification("Arquivo Criado"); } }
function openFileInNotepad(filename) { SoundEngine.click(); openApp('notepad'); setTimeout(() => { const areas = document.querySelectorAll('#notepad-area'); const last = areas[areas.length-1]; last.value = systemState.fileSystem[filename]; last.dataset.filename = filename; }, 100); }
function saveNotepadContent(btn) { SoundEngine.click(); const p = btn.closest('.window-body'); const ta = p.querySelector('#notepad-area'); const fn = ta.dataset.filename; if (fn) { systemState.fileSystem[fn] = ta.value; saveSystemData(); showNotification("Salvo!"); } else { const name = prompt("Salvar como:"); if(name) { systemState.fileSystem[name] = ta.value; ta.dataset.filename = name; saveSystemData(); renderFiles(); showNotification("Salvo!"); } } }
function navWiki(action) { SoundEngine.click(); const frame = document.getElementById('wiki-frame'); if(action === 'refresh') frame.src = frame.src; }
function renderTodos() { document.querySelectorAll('#todo-list').forEach(list => { list.innerHTML = ''; systemState.todos.forEach((todo, idx) => { const li = document.createElement('li'); li.className = `todo-item ${todo.done ? 'done' : ''}`; li.innerHTML = `<span onclick="toggleTodo(${idx})">${todo.text}</span><i class="fa-solid fa-trash todo-del" onclick="deleteTodo(${idx})"></i>`; list.appendChild(li); }); }); }
function addTodo() { SoundEngine.click(); const inputs = document.querySelectorAll('#todo-input'); inputs.forEach(input => { if(input.value) { systemState.todos.push({ text: input.value, done: false }); input.value = ''; saveSystemData(); renderTodos(); } }); }
function toggleTodo(idx) { SoundEngine.click(); systemState.todos[idx].done = !systemState.todos[idx].done; saveSystemData(); renderTodos(); }
function deleteTodo(idx) { SoundEngine.click(); systemState.todos.splice(idx, 1); saveSystemData(); renderTodos(); }
function calcInput(val) { SoundEngine.click(); const input = event.target.closest('.window-body').querySelector('#calc-display'); if (val === 'C') input.value = ""; else if (val === 'back') input.value = input.value.slice(0, -1); else if (val === '=') { try { input.value = eval(input.value); } catch { input.value = "Erro"; SoundEngine.error(); } } else input.value += val; }
let tttBoard = ['', '', '', '', '', '', '', '', '']; let tttTurn = 'X';
function initTicTacToe() { SoundEngine.click(); tttBoard = ['', '', '', '', '', '', '', '', '']; tttTurn = 'X'; renderTTT(); }
function renderTTT() { const boards = document.querySelectorAll('#ttt-board'); boards.forEach(board => { board.innerHTML = ''; tttBoard.forEach((cell, i) => { const div = document.createElement('div'); div.className = 'ttt-cell'; div.innerText = cell; div.onclick = () => playTTT(i); board.appendChild(div); }); const status = board.parentElement.querySelector('#ttt-turn'); if(status) status.innerText = tttTurn; }); }
function playTTT(i) { if (tttBoard[i] === '') { SoundEngine.click(); tttBoard[i] = tttTurn; tttTurn = tttTurn === 'X' ? 'O' : 'X'; renderTTT(); checkWin(); } }
function checkWin() { const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]; wins.forEach(combo => { const [a,b,c] = combo; if(tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) { SoundEngine.notify(); setTimeout(() => alert(`Vencedor: ${tttBoard[a]}`), 100); initTicTacToe(); } }); }
function startMonitor() { setInterval(() => { const fills = document.querySelectorAll('#cpu-fill'); const texts = document.querySelectorAll('#cpu-text'); const ramFills = document.querySelectorAll('#ram-fill'); const ramTexts = document.querySelectorAll('#ram-text'); const cpu = Math.floor(Math.random() * 60) + 10; const ram = Math.floor(Math.random() * 40) + 30; fills.forEach(f => f.style.width = `${cpu}%`); texts.forEach(t => t.innerText = `${cpu}%`); ramFills.forEach(f => f.style.width = `${ram}%`); ramTexts.forEach(t => t.innerText = `${ram}%`); }, 1000); }
function refocusTerminal(layoutDiv) { layoutDiv.querySelector('.term-input').focus(); }
function initTerminalLogic(win) { const input = win.querySelector('.term-input'); const output = win.querySelector('.terminal-output'); printTerm(output, "Nexus Kernel v1.0 initialized."); input.focus(); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { SoundEngine.click(); const cmd = input.value.trim(); printTerm(output, `nexus@root:~$ ${cmd}`); processCommand(cmd, output); input.value = ''; output.scrollTop = output.scrollHeight; } }); }
function printTerm(out, text) { out.innerHTML += `<div>${text}</div>`; }
function processCommand(cmd, out) { const parts = cmd.split(' '); switch(parts[0].toLowerCase()) { case 'help': printTerm(out, "Comandos: help, ls, clear, echo, date"); break; case 'ls': printTerm(out, Object.keys(systemState.fileSystem).join('  ')); break; case 'clear': out.innerHTML = ''; break; case 'echo': printTerm(out, parts.slice(1).join(' ')); break; case 'date': printTerm(out, new Date().toString()); break; default: if(cmd) { printTerm(out, `Comando não encontrado: ${parts[0]}`); SoundEngine.error(); } } }
