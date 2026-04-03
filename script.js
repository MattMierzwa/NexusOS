/* --- SOUND ENGINE (Web Audio API) --- */
const SoundEngine = {
    ctx: null,
    enabled: false,

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.enabled = true;
    },

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {
            console.log("Audio error:", e);
        }
    },

    boot() {
        if(!this.enabled) return;
        this.playTone(220, 'sine', 0.5, 0.1);
        setTimeout(() => this.playTone(330, 'sine', 0.5, 0.1), 100);
        setTimeout(() => this.playTone(440, 'sine', 0.8, 0.1), 200);
    },
    
    click() {
        this.playTone(800, 'sine', 0.05, 0.05);
    },

    openWindow() {
        if(!this.enabled) return;
        this.playTone(400, 'triangle', 0.1, 0.05);
        setTimeout(() => this.playTone(600, 'triangle', 0.1, 0.05), 50);
    },

    closeWindow() {
        if(!this.enabled) return;
        this.playTone(600, 'sine', 0.1, 0.05);
        setTimeout(() => this.playTone(300, 'sine', 0.1, 0.05), 50);
    },

    error() {
        if(!this.enabled) return;
        this.playTone(150, 'sawtooth', 0.3, 0.1);
    },
    
    notify() {
        if(!this.enabled) return;
        this.playTone(880, 'sine', 0.1, 0.05);
        setTimeout(() => this.playTone(1100, 'sine', 0.2, 0.05), 100);
    }
};

// Ativa o som no PRIMEIRO clique em qualquer lugar da página
document.addEventListener('click', () => {
    if (!SoundEngine.enabled) {
        SoundEngine.init();
    }
}, { once: true });

/* --- ESTADO DO SISTEMA --- */
const systemState = {
    windows: [],
    zIndexCounter: 100,
    fileSystem: {},
    todos: [],
    theme: 'dark',
    wallpaper: ''
};

document.addEventListener('DOMContentLoaded', () => {
    loadSystemData();
    startBootSequence();
});

function startBootSequence() {
    const progress = document.querySelector('.loader-progress');
    const bootScreen = document.getElementById('boot-screen');
    
    setTimeout(() => { progress.style.width = '100%'; }, 100);
    
    setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.style.display = 'none';
            // Se o usuário já clicou em algum lugar durante o boot, toca o som
            if(SoundEngine.enabled) {
                SoundEngine.boot();
            }
            showNotification("Bem-vindo ao WebOS 2.0 HD");
        }, 500);
    }, 2600);
}

function loadSystemData() {
    const storedFiles = localStorage.getItem('webos_files');
    systemState.fileSystem = storedFiles ? JSON.parse(storedFiles) : { "leia-me.txt": "WebOS 2.0\nSom sempre ativo!" };
    
    const storedTodos = localStorage.getItem('webos_todos');
    systemState.todos = storedTodos ? JSON.parse(storedTodos) : [];

    const storedTheme = localStorage.getItem('webos_theme');
    if (storedTheme) {
        systemState.theme = storedTheme;
        document.body.className = `theme-${storedTheme}`;
    }
    const storedWp = localStorage.getItem('webos_wp');
    if (storedWp) {
        systemState.wallpaper = storedWp;
        document.body.style.backgroundImage = `url('${storedWp}')`;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function saveSystemData() {
    localStorage.setItem('webos_files', JSON.stringify(systemState.fileSystem));
    localStorage.setItem('webos_todos', JSON.stringify(systemState.todos));
    localStorage.setItem('webos_theme', systemState.theme);
    if(systemState.wallpaper) localStorage.setItem('webos_wp', systemState.wallpaper);
}

/* --- GERENCIADOR DE JANELAS --- */
function openApp(appName) {
    SoundEngine.click();
    
    const id = 'win-' + Date.now();
    let title = '', icon = '', tplId = '', w = '600px', h = '400px';

    switch(appName) {
        case 'explorer': title='Arquivos'; icon='fa-folder-open'; tplId='tpl-explorer'; break;
        case 'browser': title='WikiBrowser'; icon='fa-chrome'; tplId='tpl-browser'; w='800px'; h='500px'; break;
        case 'notepad': title='Bloco de Notas'; icon='fa-file-lines'; tplId='tpl-notepad'; w='500px'; h='350px'; break;
        case 'todo': title='Tarefas'; icon='fa-list-check'; tplId='tpl-todo'; w='350px'; h='400px'; break;
        case 'calculator': title='Calculadora'; icon='fa-calculator'; tplId='tpl-calculator'; w='300px'; h='400px'; break;
        case 'tictactoe': title='Jogo da Velha'; icon='fa-gamepad'; tplId='tpl-tictactoe'; w='300px'; h='350px'; break;
        case 'monitor': title='Monitor'; icon='fa-chart-line'; tplId='tpl-monitor'; w='300px'; h='250px'; break;
        case 'settings': title='Ajustes'; icon='fa-gear'; tplId='tpl-settings'; w='400px'; h='300px'; break;
        case 'terminal': title='Terminal'; icon='fa-terminal'; tplId='tpl-terminal'; w='600px'; h='350px'; break;
    }

    createWindow(id, title, icon, document.getElementById(tplId).innerHTML, w, h, appName);
}

function createWindow(id, title, icon, content, w, h, appType) {
    SoundEngine.openWindow();

    const win = document.createElement('div');
    win.classList.add('window');
    win.id = id;
    win.style.width = w; win.style.height = h;
    win.style.top = '50px'; win.style.left = '50px';
    win.style.zIndex = ++systemState.zIndexCounter;

    win.innerHTML = `
        <div class="window-header" onmousedown="startDrag(event, '${id}')">
            <div class="window-title"><i class="fa-solid ${icon}"></i> ${title}</div>
            <div class="window-controls">
                <button class="win-btn btn-min" onclick="minimizeWindow('${id}')"></button>
                <button class="win-btn btn-close" onclick="closeWindow('${id}')"></button>
            </div>
        </div>
        <div class="window-body">${content}</div>
    `;

    win.addEventListener('mousedown', () => focusWindow(id));
    document.body.appendChild(win);
    systemState.windows.push({ id, appType, minimized: false });
    addTaskbarItem(id, title, icon);

    if (appType === 'explorer') renderFiles();
    if (appType === 'terminal') initTerminalLogic(win);
    if (appType === 'todo') renderTodos();
    if (appType === 'tictactoe') initTicTacToe();
    if (appType === 'monitor') startMonitor();
}

function closeWindow(id) {
    SoundEngine.closeWindow();
    const win = document.getElementById(id);
    if (win) win.remove();
    systemState.windows = systemState.windows.filter(w => w.id !== id);
    removeTaskbarItem(id);
}

function minimizeWindow(id) {
    SoundEngine.click();
    const win = document.getElementById(id);
    win.style.display = 'none';
    const winObj = systemState.windows.find(w => w.id === id);
    if (winObj) winObj.minimized = true;
    document.getElementById('task-' + id)?.classList.remove('active');
}

function focusWindow(id) {
    SoundEngine.click();
    const win = document.getElementById(id);
    if (!win) return;
    if (win.style.display === 'none') {
        win.style.display = 'flex';
        systemState.windows.find(w => w.id === id).minimized = false;
    }
    win.style.zIndex = ++systemState.zIndexCounter;
    document.querySelectorAll('.taskbar-item').forEach(el => el.classList.remove('active'));
    document.getElementById('task-' + id)?.classList.add('active');
}

/* --- DRAG & SNAP LAYOUTS --- */
let isDragging = false, dragOffset = { x: 0, y: 0 }, currentWindow = null;

function startDrag(e, id) {
    if (e.target.closest('.window-controls')) return;
    isDragging = true;
    currentWindow = document.getElementById(id);
    focusWindow(id);
    const rect = currentWindow.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
}

document.addEventListener('mousemove', (e) => {
    if (isDragging && currentWindow) {
        let x = e.clientX - dragOffset.x;
        let y = e.clientY - dragOffset.y;
        const threshold = 10;
        const winW = currentWindow.offsetWidth;
        if (x < threshold) x = 0;
        else if (x + winW > window.innerWidth - threshold) x = window.innerWidth - winW;
        if (y < 0) y = 0;
        currentWindow.style.left = `${x}px`;
        currentWindow.style.top = `${y}px`;
    }
});

document.addEventListener('mouseup', () => { isDragging = false; currentWindow = null; });

/* --- UI HELPERS --- */
function toggleStartMenu() { 
    SoundEngine.click();
    document.getElementById('start-menu').classList.toggle('hidden'); 
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-btn');
    if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.add('hidden');
    
    const ctx = document.getElementById('context-menu');
    if (!ctx.contains(e.target)) ctx.classList.add('hidden');
});

function addTaskbarItem(id, title, icon) {
    const bar = document.getElementById('taskbar-apps');
    const item = document.createElement('div');
    item.className = 'taskbar-item active';
    item.id = 'task-' + id;
    item.innerHTML = `<i class="fa-solid ${icon}"></i>`;
    item.onclick = () => focusWindow(id);
    bar.appendChild(item);
}
function removeTaskbarItem(id) { document.getElementById('task-' + id)?.remove(); }

function updateClock() {
    const now = new Date();
    document.getElementById('time').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('date').innerText = now.toLocaleDateString();
}

function showNotification(msg) {
    SoundEngine.notify();
    const c = document.getElementById('notification-container');
    const n = document.createElement('div');
    n.className = 'notification'; n.innerText = msg;
    c.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 300); }, 3000);
}

/* --- CONTEXT MENU --- */
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    SoundEngine.click();
    const ctx = document.getElementById('context-menu');
    ctx.style.left = `${e.clientX}px`;
    ctx.style.top = `${e.clientY}px`;
    ctx.classList.remove('hidden');
});

function refreshDesktop() {
    SoundEngine.click();
    document.getElementById('context-menu').classList.add('hidden');
    showNotification("Desktop atualizado");
}

function toggleTheme() {
    SoundEngine.click();
    systemState.theme = systemState.theme === 'dark' ? 'light' : 'dark';
    document.body.className = `theme-${systemState.theme}`;
    saveSystemData();
    document.getElementById('context-menu').classList.add('hidden');
}

function setWallpaperHD(el) {
    SoundEngine.click();
    const hdUrl = el.getAttribute('data-hd');
    systemState.wallpaper = hdUrl;
    document.body.style.backgroundImage = `url('${hdUrl}')`;
    saveSystemData();
    showNotification("Papel de parede HD aplicado!");
}

/* --- APPS LOGIC --- */

// 1. EXPLORER
function renderFiles() {
    document.querySelectorAll('.explorer-main').forEach(container => {
        container.innerHTML = '';
        Object.keys(systemState.fileSystem).forEach(filename => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.innerHTML = `<i class="fa-solid fa-file-lines"></i><span>${filename}</span>`;
            div.ondblclick = () => openFileInNotepad(filename);
            div.oncontextmenu = (e) => {
                e.preventDefault();
                if(confirm(`Deletar ${filename}?`)) {
                    delete systemState.fileSystem[filename];
                    saveSystemData();
                    renderFiles();
                }
            }
            container.appendChild(div);
        });
    });
}
function createNewFilePrompt() {
    SoundEngine.click();
    const name = prompt("Nome do arquivo:");
    if (name && !systemState.fileSystem[name]) {
        systemState.fileSystem[name] = "";
        saveSystemData();
        renderFiles();
        showNotification("Arquivo criado");
    }
}
function openFileInNotepad(filename) {
    SoundEngine.click();
    openApp('notepad');
    setTimeout(() => {
        const areas = document.querySelectorAll('#notepad-area');
        const last = areas[areas.length-1];
        last.value = systemState.fileSystem[filename];
        last.dataset.filename = filename;
    }, 100);
}

// 2. NOTEPAD
function saveNotepadContent(btn) {
    SoundEngine.click();
    const p = btn.closest('.window-body');
    const ta = p.querySelector('#notepad-area');
    const fn = ta.dataset.filename;
    if (fn) {
        systemState.fileSystem[fn] = ta.value;
        saveSystemData();
        showNotification("Salvo!");
    } else {
        const name = prompt("Salvar como:");
        if(name) {
            systemState.fileSystem[name] = ta.value;
            ta.dataset.filename = name;
            saveSystemData();
            renderFiles();
            showNotification("Salvo!");
        }
    }
}

// 3. BROWSER
function navWiki(action) {
    SoundEngine.click();
    const frame = document.getElementById('wiki-frame');
    if(action === 'refresh') frame.src = frame.src;
}

// 4. TODO
function renderTodos() {
    document.querySelectorAll('#todo-list').forEach(list => {
        list.innerHTML = '';
        systemState.todos.forEach((todo, idx) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.done ? 'done' : ''}`;
            li.innerHTML = `
                <span onclick="toggleTodo(${idx})">${todo.text}</span>
                <i class="fa-solid fa-trash todo-del" onclick="deleteTodo(${idx})"></i>
            `;
            list.appendChild(li);
        });
    });
}
function addTodo() {
    SoundEngine.click();
    const inputs = document.querySelectorAll('#todo-input');
    inputs.forEach(input => {
        if(input.value) {
            systemState.todos.push({ text: input.value, done: false });
            input.value = '';
            saveSystemData();
            renderTodos();
        }
    });
}
function toggleTodo(idx) {
    SoundEngine.click();
    systemState.todos[idx].done = !systemState.todos[idx].done;
    saveSystemData();
    renderTodos();
}
function deleteTodo(idx) {
    SoundEngine.click();
    systemState.todos.splice(idx, 1);
    saveSystemData();
    renderTodos();
}

// 5. CALCULATOR
function calcInput(val) {
    SoundEngine.click();
    const input = event.target.closest('.window-body').querySelector('#calc-display');
    if (val === 'C') input.value = "";
    else if (val === 'back') input.value = input.value.slice(0, -1);
    else if (val === '=') { 
        try { input.value = eval(input.value); } 
        catch { input.value = "Erro"; SoundEngine.error(); } 
    }
    else input.value += val;
}

// 6. TIC TAC TOE
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttTurn = 'X';
function initTicTacToe() {
    SoundEngine.click();
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttTurn = 'X';
    renderTTT();
}
function renderTTT() {
    const boards = document.querySelectorAll('#ttt-board');
    boards.forEach(board => {
        board.innerHTML = '';
        tttBoard.forEach((cell, i) => {
            const div = document.createElement('div');
            div.className = 'ttt-cell';
            div.innerText = cell;
            div.onclick = () => playTTT(i);
            board.appendChild(div);
        });
        const status = board.parentElement.querySelector('#ttt-turn');
        if(status) status.innerText = tttTurn;
    });
}
function playTTT(i) {
    if (tttBoard[i] === '') {
        SoundEngine.click();
        tttBoard[i] = tttTurn;
        tttTurn = tttTurn === 'X' ? 'O' : 'X';
        renderTTT();
        checkWin();
    }
}
function checkWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    wins.forEach(combo => {
        const [a,b,c] = combo;
        if(tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
            SoundEngine.notify();
            setTimeout(() => alert(`Vencedor: ${tttBoard[a]}`), 100);
            initTicTacToe();
        }
    });
}

// 7. MONITOR
function startMonitor() {
    setInterval(() => {
        const fills = document.querySelectorAll('#cpu-fill');
        const texts = document.querySelectorAll('#cpu-text');
        const ramFills = document.querySelectorAll('#ram-fill');
        const ramTexts = document.querySelectorAll('#ram-text');
        
        const cpu = Math.floor(Math.random() * 60) + 10;
        const ram = Math.floor(Math.random() * 40) + 30;
        
        fills.forEach(f => f.style.width = `${cpu}%`);
        texts.forEach(t => t.innerText = `${cpu}%`);
        ramFills.forEach(f => f.style.width = `${ram}%`);
        ramTexts.forEach(t => t.innerText = `${ram}%`);
    }, 1000);
}

// 8. TERMINAL
function refocusTerminal(layoutDiv) { layoutDiv.querySelector('.term-input').focus(); }
function initTerminalLogic(win) {
    const input = win.querySelector('.term-input');
    const output = win.querySelector('.terminal-output');
    printTerm(output, "WebOS Kernel v2.0 ready.");
    input.focus();
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            SoundEngine.click();
            const cmd = input.value.trim();
            printTerm(output, `user@webos:~$ ${cmd}`);
            processCommand(cmd, output);
            input.value = '';
            output.scrollTop = output.scrollHeight;
        }
    });
}
function printTerm(out, text) { out.innerHTML += `<div>${text}</div>`; }
function processCommand(cmd, out) {
    const parts = cmd.split(' ');
    switch(parts[0].toLowerCase()) {
        case 'help': printTerm(out, "Comandos: help, ls, clear, echo, date"); break;
        case 'ls': printTerm(out, Object.keys(systemState.fileSystem).join('  ')); break;
        case 'clear': out.innerHTML = ''; break;
        case 'echo': printTerm(out, parts.slice(1).join(' ')); break;
        case 'date': printTerm(out, new Date().toString()); break;
        default: 
            if(cmd) {
                printTerm(out, `Comando não encontrado: ${parts[0]}`);
                SoundEngine.error();
            }
    }
}