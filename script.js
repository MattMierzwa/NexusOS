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
const systemState = { 
    windows: [], zIndexCounter: 100, 
    fileSystem: {}, trash: {}, 
    todos: [], theme: 'dark', wallpaperSrc: '', 
    accentColor: '#7aa2f7', accentGradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', 
    windowOpacity: 0.85, events: {} 
};

const mockProcesses = [
    { name: 'nexus_kernel', cpu: 2.5, mem: 120 },
    { name: 'window_manager', cpu: 1.2, mem: 85 },
    { name: 'audio_service', cpu: 0.5, mem: 40 },
    { name: 'network_daemon', cpu: 0.8, mem: 30 },
    { name: 'file_explorer', cpu: 0.0, mem: 60 },
    { name: 'browser_engine', cpu: 15.0, mem: 450 },
    { name: 'sys_monitor', cpu: 1.0, mem: 25 }
];

let cpuHistory = new Array(50).fill(0);
let ramHistory = new Array(50).fill(0);

document.addEventListener('DOMContentLoaded', () => { loadSystemData(); startBootSequence(); setupShortcuts(); });

function setupShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'd' && e.metaKey) { e.preventDefault(); systemState.windows.forEach(w => minimizeWindow(w.id)); }
        if (e.key === 'Tab' && e.altKey) {
            e.preventDefault();
            if(systemState.windows.length > 0) {
                const nextWin = systemState.windows.find(w => !w.minimized) || systemState.windows[0];
                if(nextWin) focusWindow(nextWin.id);
            }
        }
    });
}

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
    
    const storedTrash = localStorage.getItem('webos_trash');
    systemState.trash = storedTrash ? JSON.parse(storedTrash) : {};

    const storedTodos = localStorage.getItem('webos_todos');
    systemState.todos = storedTodos ? JSON.parse(storedTodos) : [];

    const storedEvents = localStorage.getItem('webos_events');
    if (storedEvents) systemState.events = JSON.parse(storedEvents);

    // Carregar Tema
    const storedTheme = localStorage.getItem('webos_theme');
    if (storedTheme) { systemState.theme = storedTheme; document.body.className = `theme-${storedTheme}`; }
    
    // Carregar Wallpaper
    const storedWpSrc = localStorage.getItem('nexus_wp_src');
    if (storedWpSrc) { document.body.style.backgroundImage = `url('${storedWpSrc}')`; systemState.wallpaperSrc = storedWpSrc; }

    // Carregar Personalização Visual (Cores e Transparência)
    const storedAccent = localStorage.getItem('nexus_accent_color');
    const storedGradient = localStorage.getItem('nexus_accent_gradient');
    const storedOpacity = localStorage.getItem('nexus_window_opacity');

    if (storedAccent && storedGradient) setAccentColor(storedAccent, storedGradient, false);
    
    if (storedOpacity) { 
        setWindowOpacity(storedOpacity, false); 
        // Atualiza o slider visualmente se ele existir na página
        const slider = document.getElementById('opacity-slider');
        if(slider) slider.value = storedOpacity;
        const label = document.getElementById('opacity-value');
        if(label) label.innerText = Math.round(storedOpacity * 100) + "%";
    }

    const isMuted = localStorage.getItem('nexus_muted') === 'true';
    if (isMuted) { SoundEngine.muted = true; const icon = document.getElementById('vol-icon'); if(icon) { icon.classList.remove('fa-volume-high'); icon.classList.add('fa-volume-xmark', 'muted'); } }

    updateClock(); setInterval(updateClock, 1000);
}

function saveSystemData() {
    localStorage.setItem('webos_files', JSON.stringify(systemState.fileSystem));
    localStorage.setItem('webos_trash', JSON.stringify(systemState.trash));
    localStorage.setItem('webos_todos', JSON.stringify(systemState.todos));
    localStorage.setItem('webos_events', JSON.stringify(systemState.events));
    localStorage.setItem('webos_theme', systemState.theme);
    localStorage.setItem('nexus_wp_src', systemState.wallpaperSrc);
    localStorage.setItem('nexus_accent_color', systemState.accentColor);
    localStorage.setItem('nexus_accent_gradient', systemState.accentGradient);
    localStorage.setItem('nexus_window_opacity', systemState.windowOpacity);
}

/* --- FUNÇÕES DE PERSONALIZAÇÃO --- */
function setWallpaper(el) { SoundEngine.click(); const src = el.getAttribute('data-src'); systemState.wallpaperSrc = src; document.body.style.backgroundImage = `url('${src}')`; saveSystemData(); showNotification("Papel de Parede Alterado"); }
function setAccentColor(color, gradient, save = true) { SoundEngine.click(); const root = document.documentElement; root.style.setProperty('--accent-color', color); root.style.setProperty('--accent-gradient', gradient); systemState.accentColor = color; systemState.accentGradient = gradient; if(save) saveSystemData(); }
function setWindowOpacity(value, save = true) { const root = document.documentElement; let baseColor = systemState.theme === 'dark' ? '30, 30, 60' : '255, 255, 255'; root.style.setProperty('--window-bg', `rgba(${baseColor}, ${value})`); systemState.windowOpacity = value; const label = document.getElementById('opacity-value'); if(label) label.innerText = Math.round(value * 100) + "%"; if(save) saveSystemData(); }

/* --- CLIMA (API) --- */
async function fetchWeather() {
    const city = document.getElementById('city-input').value;
    const display = document.getElementById('weather-display');
    if (!city) return;

    display.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Buscando...</div>';
    
    // SUBSTITUA PELA SUA CHAVE DA OPENWEATHERMAP OU USE DEMO_KEY PARA TESTE LIMITADO
    const apiKey = 'DEMO_KEY'; 
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        await new Promise(r => setTimeout(r, 800)); // Simula delay
        
        // Fallback Simulado para demonstração visual se não tiver chave válida
        const temps = [18, 22, 25, 30, 15, 28];
        const conds = ['céu limpo', 'nuvens dispersas', 'chuva leve', 'nublado'];
        const randomTemp = temps[Math.floor(Math.random() * temps.length)];
        const randomCond = conds[Math.floor(Math.random() * conds.length)];
        
        display.innerHTML = `
            <img src="https://openweathermap.org/img/wn/02d@2x.png" alt="Ícone" style="width: 80px;">
            <div class="weather-temp">${randomTemp}°C</div>
            <div class="weather-desc">${randomCond}</div>
            <div class="weather-details"><span><i class="fa-solid fa-droplet"></i> 60%</span><span><i class="fa-solid fa-wind"></i> 12 km/h</span></div>
            <div class="weather-city"><i class="fa-solid fa-location-dot"></i> ${city}</div>
        `;
    } catch (error) {
        display.innerHTML = '<div class="error">Erro ao buscar clima.</div>';
    }
}

/* --- JANELAS & UI --- */
function openApp(appName) {
    SoundEngine.click();
    const id = 'win-' + Date.now();
    let title = '', icon = '', tplId = '', w = '600px', h = '400px';

    if(appName === 'explorer') { title='Explorador'; icon='fa-folder-tree'; tplId='tpl-explorer'; }
    else if(appName === 'weather') { title='Clima'; icon='fa-cloud-sun-rain'; tplId='tpl-weather'; w='350px'; h='400px'; }
    else if(appName === 'browser') { title='Navegador'; icon='fa-globe'; tplId='tpl-browser'; w='800px'; h='500px'; }
    else if(appName === 'notepad') { title='Editor'; icon='fa-pen-nib'; tplId='tpl-notepad'; w='500px'; h='350px'; }
    else if(appName === 'todo') { title='Tarefas'; icon='fa-check-double'; tplId='tpl-todo'; w='350px'; h='400px'; }
    else if(appName === 'calculator') { title='Calculadora'; icon='fa-calculator'; tplId='tpl-calculator'; w='300px'; h='400px'; }
    else if(appName === 'monitor') { title='Monitor'; icon='fa-chart-line'; tplId='tpl-monitor'; w='350px'; h='450px'; }
    else if(appName === 'settings') { title='Sistema'; icon='fa-sliders-h'; tplId='tpl-settings'; w='450px'; h='400px'; }
    else if(appName === 'terminal') { title='Terminal'; icon='fa-code'; tplId='tpl-terminal'; w='600px'; h='350px'; }
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
    win.innerHTML = `<div class="window-header" onmousedown="startDrag(event, '${id}')"><div class="window-title"><i class="fa-solid ${icon}"></i> ${title}</div><div class="window-controls"><button class="win-btn btn-min" onclick="minimizeWindow('${id}')"></button><button class="win-btn btn-max" onclick="toggleMaximizeWindow('${id}')"></button><button class="win-btn btn-close" onclick="closeWindow('${id}')"></button></div></div><div class="window-body">${content}</div>`;
    win.addEventListener('mousedown', () => focusWindow(id));
    document.body.appendChild(win);
    systemState.windows.push({ id, appType, minimized: false });
    addTaskbarItem(id, title, icon);

    if (appType === 'explorer') renderFiles('/');
    if (appType === 'terminal') initTerminalLogic(win);
    if (appType === 'todo') renderTodos();
    if (appType === 'monitor') startMonitorLoop(id);
    if (appType === 'calendar') initCalendar();
    
    // Se for configurações, atualiza os controles visuais com os valores salvos
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
function toggleMaximizeWindow(id) {
    SoundEngine.click();
    const win = document.getElementById(id);
    if (!win) return;
    if (win.classList.contains('maximized')) {
        win.classList.remove('maximized');
        if (win.dataset.prevTop) win.style.top = win.dataset.prevTop;
        if (win.dataset.prevLeft) win.style.left = win.dataset.prevLeft;
        if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
        if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
    } else {
        win.dataset.prevTop = win.style.top; win.dataset.prevLeft = win.style.left;
        win.dataset.prevWidth = win.style.width; win.dataset.prevHeight = win.style.height;
        win.classList.add('maximized');
    }
}

/* --- DRAG AND DROP --- */
let isDragging = false, dragOffset = { x: 0, y: 0 }, currentWindow = null;
function startDrag(e, id) {
    if (e.target.closest('.window-controls')) return;
    const win = document.getElementById(id);
    if (win && win.classList.contains('maximized')) return;
    isDragging = true; currentWindow = win; focusWindow(id);
    const rect = currentWindow.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left; dragOffset.y = e.clientY - rect.top;
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
function switchTab(tabName) { SoundEngine.click(); document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active')); const buttons = document.querySelectorAll('.tab-btn'); if(tabName === 'visual') buttons[0].classList.add('active'); else buttons[1].classList.add('active'); document.getElementById(`tab-${tabName}`).classList.add('active'); }

/* --- EXPLORADOR COM LIXEIRA --- */
let currentExplorerPath = '/';
function renderFiles(path) {
    currentExplorerPath = path;
    const container = document.querySelector('.explorer-main');
    if(!container) return;
    container.innerHTML = '';
    const files = path === 'trash' ? systemState.trash : systemState.fileSystem;
    const isEmpty = Object.keys(files).length === 0;
    if (isEmpty) { container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; opacity:0.5; margin-top:50px;">${path === 'trash' ? 'Lixeira Vazia' : 'Pasta Vazia'}</div>`; return; }
    Object.keys(files).forEach(filename => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `<i class="fa-solid fa-file-lines"></i><span>${filename}</span>`;
        div.ondblclick = () => { if(path === 'trash') { if(confirm(`Restaurar ${filename}?`)) restoreFile(filename); } else { openFileInNotepad(filename); } };
        div.oncontextmenu = (e) => { e.preventDefault(); if(path === 'trash') { if(confirm(`Excluir permanentemente ${filename}?`)) deleteFilePermanently(filename); } else { if(confirm(`Mover ${filename} para Lixeira?`)) moveToTrash(filename); } };
        container.appendChild(div);
    });
}
function moveToTrash(filename) { systemState.trash[filename] = systemState.fileSystem[filename]; delete systemState.fileSystem[filename]; saveSystemData(); renderFiles(currentExplorerPath); showNotification("Arquivo movido para Lixeira"); }
function restoreFile(filename) { systemState.fileSystem[filename] = systemState.trash[filename]; delete systemState.trash[filename]; saveSystemData(); renderFiles('trash'); showNotification("Arquivo restaurado"); }
function deleteFilePermanently(filename) { delete systemState.trash[filename]; saveSystemData(); renderFiles('trash'); showNotification("Arquivo excluído permanentemente"); }
function createNewFilePrompt() { SoundEngine.click(); const name = prompt("Nome do arquivo:"); if (name && !systemState.fileSystem[name]) { systemState.fileSystem[name] = ""; saveSystemData(); renderFiles(currentExplorerPath); showNotification("Arquivo Criado"); } }
function openFileInNotepad(filename) { SoundEngine.click(); openApp('notepad'); setTimeout(() => { const areas = document.querySelectorAll('#notepad-area'); const last = areas[areas.length-1]; last.value = systemState.fileSystem[filename]; last.dataset.filename = filename; }, 100); }
function saveNotepadContent(btn) { SoundEngine.click(); const p = btn.closest('.window-body'); const ta = p.querySelector('#notepad-area'); const fn = ta.dataset.filename; if (fn) { systemState.fileSystem[fn] = ta.value; saveSystemData(); showNotification("Salvo!"); } else { const name = prompt("Salvar como:"); if(name) { systemState.fileSystem[name] = ta.value; ta.dataset.filename = name; saveSystemData(); renderFiles(currentExplorerPath); showNotification("Salvo!"); } } }

/* --- MONITOR COM GRÁFICOS --- */
let monitorIntervals = {};
function startMonitorLoop(winId) {
    if(monitorIntervals[winId]) clearInterval(monitorIntervals[winId]);
    monitorIntervals[winId] = setInterval(() => {
        const win = document.getElementById(winId);
        if(!win) { clearInterval(monitorIntervals[winId]); return; }
        const cpuVal = Math.floor(Math.random() * 40) + 10;
        const ramVal = Math.floor(Math.random() * 30) + 40;
        cpuHistory.push(cpuVal); cpuHistory.shift();
        ramHistory.push(ramVal); ramHistory.shift();
        drawChart(win.querySelector('#cpu-chart'), cpuHistory, '#f7768e');
        drawChart(win.querySelector('#ram-chart'), ramHistory, '#7aa2f7');
        win.querySelector('#cpu-text').innerText = cpuVal + "%";
        win.querySelector('#ram-text').innerText = ramVal + "%";
        const list = win.querySelector('#process-list');
        list.innerHTML = '';
        mockProcesses.forEach(p => {
            const curCpu = (p.cpu + (Math.random() * 2 - 1)).toFixed(1);
            const div = document.createElement('div');
            div.className = 'process-item';
            div.innerHTML = `<span class="process-name">${p.name}</span><span class="process-cpu">${curCpu}% CPU</span>`;
            list.appendChild(div);
        });
    }, 1000);
}
function drawChart(canvas, data, color) {
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width; const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath(); ctx.moveTo(0, h);
    const step = w / (data.length - 1);
    data.forEach((val, i) => { const x = i * step; const y = h - (val / 100 * h); ctx.lineTo(x, y); });
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    ctx.lineTo(w, h); ctx.fillStyle = color + '33'; ctx.fill();
}

/* --- OUTROS APPS --- */
function navWiki(action) { SoundEngine.click(); const frame = document.getElementById('wiki-frame'); if(action === 'refresh') frame.src = frame.src; }
function renderTodos() { document.querySelectorAll('#todo-list').forEach(list => { list.innerHTML = ''; systemState.todos.forEach((todo, idx) => { const li = document.createElement('li'); li.className = `todo-item ${todo.done ? 'done' : ''}`; li.innerHTML = `<span onclick="toggleTodo(${idx})">${todo.text}</span><i class="fa-solid fa-trash todo-del" onclick="deleteTodo(${idx})"></i>`; list.appendChild(li); }); }); }
function addTodo() { SoundEngine.click(); const inputs = document.querySelectorAll('#todo-input'); inputs.forEach(input => { if(input.value) { systemState.todos.push({ text: input.value, done: false }); input.value = ''; saveSystemData(); renderTodos(); } }); }
function toggleTodo(idx) { SoundEngine.click(); systemState.todos[idx].done = !systemState.todos[idx].done; saveSystemData(); renderTodos(); }
function deleteTodo(idx) { SoundEngine.click(); systemState.todos.splice(idx, 1); saveSystemData(); renderTodos(); }
function calcInput(val) { SoundEngine.click(); const input = event.target.closest('.window-body').querySelector('#calc-display'); if (val === 'C') input.value = ""; else if (val === 'back') input.value = input.value.slice(0, -1); else if (val === '=') { try { input.value = eval(input.value); } catch { input.value = "Erro"; SoundEngine.error(); } } else input.value += val; }
let currentCalDate = new Date(); let selectedDateKey = null;
function initCalendar() { renderCalendarGrid(); }
function changeMonth(delta) { currentCalDate.setMonth(currentCalDate.getMonth() + delta); renderCalendarGrid(); }
function renderCalendarGrid() {
    const grid = document.getElementById('cal-days-grid'); const monthTitle = document.getElementById('cal-month-year');
    if(!grid || !monthTitle) return;
    const year = currentCalDate.getFullYear(); const month = currentCalDate.getMonth();
    monthTitle.innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentCalDate);
    grid.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    for(let i=0; i<firstDay; i++) { const empty = document.createElement('div'); empty.className = 'cal-day empty'; grid.appendChild(empty); }
    const today = new Date();
    for(let d=1; d<=daysInMonth; d++) {
        const dayDiv = document.createElement('div'); dayDiv.className = 'cal-day';
        if(d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayDiv.classList.add('today');
        dayDiv.innerHTML = `<span>${d}</span>`;
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if(systemState.events[dateKey]) { const dot = document.createElement('div'); dot.className = 'event-dot'; dayDiv.appendChild(dot); }
        dayDiv.onclick = () => openEventModal(dateKey, d);
        grid.appendChild(dayDiv);
    }
}
function openEventModal(dateKey, day) { selectedDateKey = dateKey; const modal = document.getElementById('event-modal'); const title = document.getElementById('modal-date-title'); const note = document.getElementById('event-note'); title.innerText = `Lembrete: ${day}/${currentCalDate.getMonth()+1}`; note.value = systemState.events[dateKey] || ''; modal.classList.remove('hidden'); }
function closeEventModal() { document.getElementById('event-modal').classList.add('hidden'); selectedDateKey = null; }
function saveEvent() { if(!selectedDateKey) return; const note = document.getElementById('event-note').value.trim(); if(note) systemState.events[selectedDateKey] = note; else delete systemState.events[selectedDateKey]; saveSystemData(); closeEventModal(); renderCalendarGrid(); showNotification("Evento Salvo"); }
function refocusTerminal(layoutDiv) { layoutDiv.querySelector('.term-input').focus(); }
function initTerminalLogic(win) { const input = win.querySelector('.term-input'); const output = win.querySelector('.terminal-output'); printTerm(output, "Nexus Kernel v1.0 initialized."); input.focus(); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { SoundEngine.click(); const cmd = input.value.trim(); printTerm(output, `nexus@root:~$ ${cmd}`); processCommand(cmd, output); input.value = ''; output.scrollTop = output.scrollHeight; } }); }
function printTerm(out, text) { out.innerHTML += `<div>${text}</div>`; }
function processCommand(cmd, out) { const parts = cmd.split(' '); switch(parts[0].toLowerCase()) { case 'help': printTerm(out, "Comandos: help, ls, clear, echo, date"); break; case 'ls': printTerm(out, Object.keys(systemState.fileSystem).join('  ')); break; case 'clear': out.innerHTML = ''; break; case 'echo': printTerm(out, parts.slice(1).join(' ')); break; case 'date': printTerm(out, new Date().toString()); break; default: if(cmd) { printTerm(out, `Comando não encontrado: ${parts[0]}`); SoundEngine.error(); } } }
