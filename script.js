/**
 * NexusOS - Sistema Operacional Web
 * Código refatorado e organizado em módulos
 */

/* ============================================
   SOUND ENGINE - Gerenciador de Áudio
   ============================================ */
const SoundEngine = {
    ctx: null,
    muted: false,
    pack: 'futuristic',

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playTone(freq, type, duration, vol = 0.1, slideTo = null) {
        if (this.muted || this.pack === 'silent' || !this.ctx) return;

        let finalType = type;
        let finalVol = vol;
        let finalDuration = duration;

        // Ajustes baseados no pacote de som
        if (this.pack === 'classic') {
            finalType = 'sine';
            finalVol = vol * 0.3;
            finalDuration = duration * 1.5;
        } else if (this.pack === 'mechanical') {
            finalType = 'square';
            finalVol = vol * 0.1;
            finalDuration = 0.03;
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = finalType;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        if (slideTo) {
            osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + finalDuration);
        }
        
        gain.gain.setValueAtTime(finalVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + finalDuration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + finalDuration);
    },

    boot() {
        if (this.muted || this.pack === 'silent') return;
        this.playTone(110, 'sawtooth', 0.8, 0.1, 880);
        setTimeout(() => this.playTone(220, 'square', 0.6, 0.05, 440), 100);
    },

    click() {
        if (this.muted || this.pack === 'silent') return;
        this.playTone(800, 'sine', 0.05, 0.05);
    },

    openWindow() {
        if (this.muted || this.pack === 'silent') return;
        this.playTone(300, 'sawtooth', 0.15, 0.05, 600);
    },

    closeWindow() {
        if (this.muted || this.pack === 'silent') return;
        this.playTone(600, 'triangle', 0.15, 0.05, 200);
    },

    error() {
        if (this.muted || this.pack === 'silent') return;
        this.playTone(150, 'sawtooth', 0.3, 0.1);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.3, 0.1), 100);
    },

    notify() {
        if (this.muted || this.pack === 'silent') return;
        this.playTone(880, 'sine', 0.1, 0.05);
        setTimeout(() => this.playTone(1320, 'sine', 0.2, 0.05), 100);
    },

    toggleMute() {
        this.muted = !this.muted;
        const icon = document.getElementById('vol-icon');
        localStorage.setItem('nexus_muted', this.muted);
        
        if (icon) {
            if (this.muted) {
                icon.classList.remove('fa-volume-high');
                icon.classList.add('fa-volume-xmark', 'muted');
            } else {
                icon.classList.remove('fa-volume-xmark', 'muted');
                icon.classList.add('fa-volume-high');
                this.init();
                this.click();
            }
        }
    }
};

// Inicializa o áudio no primeiro clique
document.addEventListener('click', () => SoundEngine.init(), { once: true });

/* ============================================
   STATE MANAGER - Gerenciador de Estado
   ============================================ */
const SystemState = {
    windows: [],
    zIndexCounter: 100,
    fileSystem: {},
    trash: {},
    todos: [],
    events: {},
    theme: 'dark',
    wallpaperSrc: '',
    accentColor: '#7aa2f7',
    accentGradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
    windowOpacity: 0.85,
    borderRadius: 15,
    blurIntensity: 10,
    interfaceScale: 1,
    musicPlaylist: [],
    systemFont: 'font-poppins',
    soundPack: 'futuristic',
    glowEffect: false,
    customCursor: false
};

/* ============================================
   STORAGE MANAGER - Persistência de Dados
   ============================================ */
const Storage = {
    save() {
        localStorage.setItem('webos_files', JSON.stringify(SystemState.fileSystem));
        localStorage.setItem('webos_trash', JSON.stringify(SystemState.trash));
        localStorage.setItem('webos_todos', JSON.stringify(SystemState.todos));
        localStorage.setItem('webos_events', JSON.stringify(SystemState.events));
        localStorage.setItem('webos_theme', SystemState.theme);
        localStorage.setItem('nexus_wp_src', SystemState.wallpaperSrc);
        localStorage.setItem('nexus_accent_color', SystemState.accentColor);
        localStorage.setItem('nexus_accent_gradient', SystemState.accentGradient);
        localStorage.setItem('nexus_border_radius', SystemState.borderRadius);
        localStorage.setItem('nexus_blur_intensity', SystemState.blurIntensity);
        localStorage.setItem('nexus_interface_scale', SystemState.interfaceScale);
        localStorage.setItem('nexus_music_playlist', JSON.stringify(SystemState.musicPlaylist));
        localStorage.setItem('nexus_system_font', SystemState.systemFont);
        localStorage.setItem('nexus_sound_pack', SystemState.soundPack);
        localStorage.setItem('nexus_glow_effect', SystemState.glowEffect);
        localStorage.setItem('nexus_custom_cursor', SystemState.customCursor);
    },

    load() {
        const storedFiles = localStorage.getItem('webos_files');
        SystemState.fileSystem = storedFiles ? JSON.parse(storedFiles) : { "leia-me.txt": "Bem-vindo ao NexusOS." };

        const storedTrash = localStorage.getItem('webos_trash');
        SystemState.trash = storedTrash ? JSON.parse(storedTrash) : {};

        const storedTodos = localStorage.getItem('webos_todos');
        SystemState.todos = storedTodos ? JSON.parse(storedTodos) : [];

        const storedEvents = localStorage.getItem('webos_events');
        SystemState.events = storedEvents ? JSON.parse(storedEvents) : {};

        const storedTheme = localStorage.getItem('webos_theme');
        if (storedTheme) {
            SystemState.theme = storedTheme;
            document.body.className = `${SystemState.theme === 'dark' ? 'theme-dark' : 'theme-light'} ${SystemState.systemFont}`;
        }

        const storedWpSrc = localStorage.getItem('nexus_wp_src');
        if (storedWpSrc) {
            document.body.style.backgroundImage = `url('${storedWpSrc}')`;
            SystemState.wallpaperSrc = storedWpSrc;
        }

        const storedAccent = localStorage.getItem('nexus_accent_color');
        const storedGradient = localStorage.getItem('nexus_accent_gradient');
        if (storedAccent && storedGradient) {
            this.applyAccentColor(storedAccent, storedGradient);
        }

        const storedRadius = localStorage.getItem('nexus_border_radius');
        if (storedRadius) Settings.setBorderRadius(storedRadius, false);

        const storedBlur = localStorage.getItem('nexus_blur_intensity');
        if (storedBlur) Settings.setBlurIntensity(storedBlur, false);

        const storedScale = localStorage.getItem('nexus_interface_scale');
        if (storedScale) Settings.setInterfaceScale(storedScale, false);

        const storedPlaylist = localStorage.getItem('nexus_music_playlist');
        if (storedPlaylist) SystemState.musicPlaylist = JSON.parse(storedPlaylist);

        const storedFont = localStorage.getItem('nexus_system_font');
        if (storedFont) Settings.setSystemFont(storedFont, false);

        const storedSound = localStorage.getItem('nexus_sound_pack');
        if (storedSound) {
            SystemState.soundPack = storedSound;
            SoundEngine.pack = storedSound;
        }

        const storedGlow = localStorage.getItem('nexus_glow_effect') === 'true';
        if (storedGlow) Settings.toggleGlowEffect(true);

        const storedCursor = localStorage.getItem('nexus_custom_cursor') === 'true';
        if (storedCursor) Settings.toggleCustomCursor(true);

        const isMuted = localStorage.getItem('nexus_muted') === 'true';
        if (isMuted) {
            SoundEngine.muted = true;
            const icon = document.getElementById('vol-icon');
            if (icon) {
                icon.classList.remove('fa-volume-high');
                icon.classList.add('fa-volume-xmark', 'muted');
            }
        }
    },

    applyAccentColor(color, gradient) {
        const root = document.documentElement;
        root.style.setProperty('--accent-color', color);
        root.style.setProperty('--accent-gradient', gradient);
        SystemState.accentColor = color;
        SystemState.accentGradient = gradient;
    }
};

/* ============================================
   UI MANAGER - Interface do Usuário
   ============================================ */
const UI = {
    toggleStartMenu() {
        SoundEngine.click();
        document.getElementById('start-menu').classList.toggle('hidden');
    },

    toggleSearch() {
        const overlay = document.getElementById('search-overlay');
        const input = document.getElementById('global-search-input');
        
        if (overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            input.value = '';
            input.focus();
            document.getElementById('search-results').innerHTML = '';
        } else {
            overlay.classList.add('hidden');
        }
    },

    refreshDesktop() {
        SoundEngine.click();
        document.getElementById('context-menu').classList.add('hidden');
        Notification.show('Área de Trabalho Atualizada');
    },

    switchTab(tabName) {
        SoundEngine.click();
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        const buttons = document.querySelectorAll('.tab-btn');
        if (tabName === 'visual') {
            buttons[0]?.classList.add('active');
        } else {
            buttons[1]?.classList.add('active');
        }
        
        document.getElementById(`tab-${tabName}`)?.classList.add('active');
    }
};

// Fecha menus ao clicar fora
document.addEventListener('click', (e) => {
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.getElementById('start-btn');
    const contextMenu = document.getElementById('context-menu');
    
    if (!startMenu?.contains(e.target) && !startBtn?.contains(e.target)) {
        startMenu?.classList.add('hidden');
    }
    if (!contextMenu?.contains(e.target)) {
        contextMenu?.classList.add('hidden');
    }
});

// Menu de contexto
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    SoundEngine.click();
    const ctx = document.getElementById('context-menu');
    if (ctx) {
        ctx.style.left = `${e.clientX}px`;
        ctx.style.top = `${e.clientY}px`;
        ctx.classList.remove('hidden');
    }
});

/* ============================================
   NOTIFICATION SYSTEM
   ============================================ */
const Notification = {
    show(msg) {
        SoundEngine.notify();
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerText = msg;
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

/* ============================================
   WINDOW MANAGER - Gerenciador de Janelas
   ============================================ */
const WindowManager = {
    create(id, title, icon, content, w, h, appType) {
        SoundEngine.openWindow();
        
        const win = document.createElement('div');
        win.classList.add('window');
        win.id = id;
        win.style.width = w;
        win.style.height = h;
        win.style.top = '50px';
        win.style.left = '50px';
        win.style.zIndex = ++SystemState.zIndexCounter;
        
        win.innerHTML = `
            <div class="window-header" onmousedown="DragManager.start(event, '${id}')">
                <div class="window-title">
                    <i class="fa-solid ${icon}"></i> ${title}
                </div>
                <div class="window-controls">
                    <button class="win-btn btn-min" onclick="WindowManager.minimize('${id}')"></button>
                    <button class="win-btn btn-max" onclick="WindowManager.toggleMaximize('${id}')"></button>
                    <button class="win-btn btn-close" onclick="WindowManager.close('${id}')"></button>
                </div>
            </div>
            <div class="window-body">${content}</div>
        `;
        
        win.addEventListener('mousedown', () => WindowManager.focus(id));
        document.body.appendChild(win);
        
        SystemState.windows.push({ id, appType, minimized: false });
        Taskbar.addItem(id, title, icon);

        // Inicialização específica por aplicativo
        this.initApp(appType, win);
    },

    initApp(appType, win) {
        switch(appType) {
            case 'explorer':
                ExplorerHistory.reset();
                Explorer.render();
                break;
            case 'terminal':
                Terminal.init(win);
                break;
            case 'todo':
                Todo.render();
                break;
            case 'monitor':
                Monitor.start(win.id);
                break;
            case 'calendar':
                Calendar.init();
                break;
            case 'music':
                Music.renderPlaylist();
                break;
            case 'paint':
                setTimeout(() => Paint.init('paint-canvas'), 100);
                break;
            case 'taskmanager':
                setTimeout(TaskManager.refresh, 100);
                break;
            case 'settings':
                setTimeout(Settings.init, 100);
                break;
        }
    },

    close(id) {
        SoundEngine.closeWindow();
        document.getElementById(id)?.remove();
        SystemState.windows = SystemState.windows.filter(w => w.id !== id);
        Taskbar.removeItem(id);
    },

    minimize(id) {
        SoundEngine.click();
        const win = document.getElementById(id);
        if (win) {
            win.style.display = 'none';
            const windowData = SystemState.windows.find(w => w.id === id);
            if (windowData) windowData.minimized = true;
        }
        document.getElementById('task-' + id)?.classList.remove('active');
    },

    focus(id) {
        SoundEngine.click();
        const win = document.getElementById(id);
        if (!win) return;
        
        if (win.style.display === 'none') {
            win.style.display = 'flex';
            const windowData = SystemState.windows.find(w => w.id === id);
            if (windowData) windowData.minimized = false;
        }
        
        win.style.zIndex = ++SystemState.zIndexCounter;
        document.querySelectorAll('.taskbar-item').forEach(el => el.classList.remove('active'));
        document.getElementById('task-' + id)?.classList.add('active');
    },

    toggleMaximize(id) {
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
            win.dataset.prevTop = win.style.top;
            win.dataset.prevLeft = win.style.left;
            win.dataset.prevWidth = win.style.width;
            win.dataset.prevHeight = win.style.height;
            win.classList.add('maximized');
        }
    }
};

/* ============================================
   DRAG MANAGER - Movimento de Janelas
   ============================================ */
const DragManager = {
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    currentWindow: null,

    start(e, id) {
        if (e.target.closest('.window-controls')) return;
        
        const win = document.getElementById(id);
        if (!win || win.classList.contains('maximized')) return;
        
        this.isDragging = true;
        this.currentWindow = win;
        WindowManager.focus(id);
        
        const rect = win.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
    }
};

document.addEventListener('mousemove', (e) => {
    if (DragManager.isDragging && DragManager.currentWindow) {
        let x = e.clientX - DragManager.dragOffset.x;
        let y = e.clientY - DragManager.dragOffset.y;
        
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        
        DragManager.currentWindow.style.left = `${x}px`;
        DragManager.currentWindow.style.top = `${y}px`;
    }
});

document.addEventListener('mouseup', () => {
    DragManager.isDragging = false;
    DragManager.currentWindow = null;
});

/* ============================================
   TASKBAR MANAGER
   ============================================ */
const Taskbar = {
    addItem(id, title, icon) {
        const bar = document.getElementById('taskbar-apps');
        if (!bar) return;
        
        const item = document.createElement('div');
        item.className = 'taskbar-item active';
        item.id = 'task-' + id;
        item.innerHTML = `<i class="fa-solid ${icon}"></i>`;
        item.onclick = () => WindowManager.focus(id);
        bar.appendChild(item);
    },

    removeItem(id) {
        document.getElementById('task-' + id)?.remove();
    }
};

/* ============================================
   CLOCK
   ============================================ */
const Clock = {
    update() {
        const now = new Date();
        const timeEl = document.getElementById('time');
        const dateEl = document.getElementById('date');
        
        if (timeEl) {
            timeEl.innerText = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
        if (dateEl) {
            dateEl.innerText = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    }
};

/* ============================================
   BOOT SEQUENCE
   ============================================ */
const BootSequence = {
    start() {
        const progress = document.querySelector('.loader-progress');
        const bootScreen = document.getElementById('boot-screen');
        
        setTimeout(() => {
            if (progress) progress.style.width = '100%';
        }, 100);
        
        setTimeout(() => {
            if (bootScreen) {
                bootScreen.style.opacity = '0';
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                    if (!SoundEngine.muted) SoundEngine.boot();
                    Notification.show('NexusOS Pronto');
                }, 500);
            }
        }, 2600);
    }
};

/* ============================================
   SHORTCUTS
   ============================================ */
const Shortcuts = {
    setup() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Space para busca
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                UI.toggleSearch();
            }
            
            // ESC para fechar busca
            if (e.key === 'Escape') {
                const searchOverlay = document.getElementById('search-overlay');
                if (!searchOverlay?.classList.contains('hidden')) {
                    UI.toggleSearch();
                }
            }
            
            // Cmd/Ctrl+D para minimizar tudo
            if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                SystemState.windows.forEach(w => WindowManager.minimize(w.id));
            }
            
            // Alt+Tab para alternar janelas
            if (e.key === 'Tab' && e.altKey) {
                e.preventDefault();
                if (SystemState.windows.length > 0) {
                    const nextWin = SystemState.windows.find(w => !w.minimized) || SystemState.windows[0];
                    if (nextWin) WindowManager.focus(nextWin.id);
                }
            }
        });
    }
};

/* ============================================
   CUSTOM CURSOR
   ============================================ */
const CustomCursor = {
    setup() {
        const cursor = document.getElementById('custom-cursor');
        
        document.addEventListener('mousemove', (e) => {
            if (SystemState.customCursor && cursor) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });
        
        document.addEventListener('mousedown', () => {
            if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        });
        
        document.addEventListener('mouseup', () => {
            if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }
};

/* ============================================
   APP CONTROLLER - Principal ponto de entrada
   ============================================ */
const AppController = {
    open(appName) {
        SoundEngine.click();
        
        const id = 'win-' + Date.now();
        let title = '', icon = '', tplId = '', w = '600px', h = '400px';
        
        const apps = {
            explorer: { title: 'Explorador', icon: 'fa-folder-tree', tplId: 'tpl-explorer' },
            weather: { title: 'Clima', icon: 'fa-cloud-sun-rain', tplId: 'tpl-weather', w: '350px', h: '400px' },
            browser: { title: 'Navegador', icon: 'fa-globe', tplId: 'tpl-browser', w: '800px', h: '500px' },
            notepad: { title: 'Editor', icon: 'fa-pen-nib', tplId: 'tpl-notepad', w: '500px', h: '350px' },
            codeeditor: { title: 'Code Editor', icon: 'fa-code', tplId: 'tpl-codeeditor', w: '700px', h: '500px' },
            paint: { title: 'Paint', icon: 'fa-paintbrush', tplId: 'tpl-paint', w: '600px', h: '450px' },
            calculator: { title: 'Calculadora', icon: 'fa-calculator', tplId: 'tpl-calculator', w: '300px', h: '400px' },
            music: { title: 'Música', icon: 'fa-music', tplId: 'tpl-music', w: '350px', h: '500px' },
            todo: { title: 'Tarefas', icon: 'fa-check-double', tplId: 'tpl-todo', w: '350px', h: '400px' },
            calendar: { title: 'Agenda', icon: 'fa-calendar-alt', tplId: 'tpl-calendar', w: '400px', h: '500px' },
            taskmanager: { title: 'Task Manager', icon: 'fa-list-check', tplId: 'tpl-taskmanager', w: '400px', h: '300px' },
            monitor: { title: 'Monitor', icon: 'fa-chart-line', tplId: 'tpl-monitor', w: '350px', h: '450px' },
            settings: { title: 'Sistema', icon: 'fa-sliders-h', tplId: 'tpl-settings', w: '450px', h: '400px' },
            terminal: { title: 'Terminal', icon: 'fa-code', tplId: 'tpl-terminal', w: '600px', h: '350px' },
            imageviewer: { title: 'Visualizador', icon: 'fa-image', tplId: 'tpl-imageviewer', w: '600px', h: '500px' }
        };
        
        const app = apps[appName];
        if (!app) return;
        
        const template = document.getElementById(app.tplId);
        if (!template) {
            SoundEngine.error();
            return;
        }
        
        WindowManager.create(id, app.title, app.icon, template.innerHTML, app.w || w, app.h || h, appName);
    },

    search: {
        perform() {
            const query = document.getElementById('global-search-input')?.value.toLowerCase() || '';
            const resultsContainer = document.getElementById('search-results');
            if (!resultsContainer) return;
            
            resultsContainer.innerHTML = '';
            if (!query) return;
            
            const apps = [
                { name: 'Explorador', icon: 'fa-folder-tree', action: () => AppController.open('explorer') },
                { name: 'Clima', icon: 'fa-cloud-sun-rain', action: () => AppController.open('weather') },
                { name: 'Navegador', icon: 'fa-globe', action: () => AppController.open('browser') },
                { name: 'Editor', icon: 'fa-pen-nib', action: () => AppController.open('notepad') },
                { name: 'Code Editor', icon: 'fa-code', action: () => AppController.open('codeeditor') },
                { name: 'Paint', icon: 'fa-paintbrush', action: () => AppController.open('paint') },
                { name: 'Calculadora', icon: 'fa-calculator', action: () => AppController.open('calculator') },
                { name: 'Música', icon: 'fa-music', action: () => AppController.open('music') },
                { name: 'Tarefas', icon: 'fa-check-double', action: () => AppController.open('todo') },
                { name: 'Agenda', icon: 'fa-calendar-alt', action: () => AppController.open('calendar') },
                { name: 'Task Manager', icon: 'fa-list-check', action: () => AppController.open('taskmanager') },
                { name: 'Monitor', icon: 'fa-chart-line', action: () => AppController.open('monitor') },
                { name: 'Sistema', icon: 'fa-sliders-h', action: () => AppController.open('settings') }
            ];
            
            apps.forEach(app => {
                if (app.name.toLowerCase().includes(query)) {
                    this.createResult(app.name, app.icon, app.action, resultsContainer);
                }
            });
            
            // Busca em arquivos
            Object.keys(SystemState.fileSystem).forEach(key => {
                if (key.toLowerCase().includes(query)) {
                    let action = () => Notepad.openFile(key);
                    let icon = 'fa-file-lines';
                    
                    if (key.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                        action = () => ImageViewer.open(key);
                        icon = 'fa-image';
                    }
                    
                    this.createResult(key, icon, action, resultsContainer);
                }
            });
        },

        createResult(title, icon, action, container) {
            const div = document.createElement('div');
            div.className = 'search-item';
            div.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${title}</span>`;
            div.onclick = () => {
                action();
                UI.toggleSearch();
            };
            container.appendChild(div);
        }
    }
};

/* ============================================
   SYSTEM FUNCTIONS
   ============================================ */
const System = {
    toggleTheme() {
        SoundEngine.click();
        SystemState.theme = SystemState.theme === 'dark' ? 'light' : 'dark';
        document.body.className = `theme-${SystemState.theme} ${SystemState.systemFont}`;
        Storage.save();
        document.getElementById('context-menu')?.classList.add('hidden');
    }
};

// Alias para compatibilidade com HTML antigo
const openApp = (name) => AppController.open(name);
const toggleStartMenu = () => UI.toggleStartMenu();
const toggleSearch = () => UI.toggleSearch();
const toggleMute = () => SoundEngine.toggleMute();
const toggleTheme = () => System.toggleTheme();
const refreshDesktop = () => UI.refreshDesktop();
const switchTab = (name) => UI.switchTab(name);
const setSoundPack = (pack, save = true) => Settings.setSoundPack(pack, save);
const setBorderRadius = (val, save = true) => Settings.setBorderRadius(val, save);
const setBlurIntensity = (val, save = true) => Settings.setBlurIntensity(val, save);
const setInterfaceScale = (val, save = true) => Settings.setInterfaceScale(val, save);
const setSystemFont = (font, save = true) => Settings.setSystemFont(font, save);
const toggleGlowEffect = (force) => Settings.toggleGlowEffect(force);
const toggleCustomCursor = (force) => Settings.toggleCustomCursor(force);
const setWallpaper = (el) => Settings.setWallpaper(el);
const setAccentColor = (color, gradient, save = true) => Settings.setAccentColor(color, gradient, save);
const downloadBackup = () => Backup.download();
const restoreBackup = (input) => Backup.restore(input);
const navigateTo = (path) => Explorer.navigateTo(path);
const goBack = () => Explorer.goBack();
const navigateToTrash = () => Explorer.navigateToTrash();
const createNewFolderPrompt = () => Explorer.createNewFolder();
const createNewFilePrompt = () => Explorer.createNewFile();
const openFileInNotepad = (filename) => Notepad.openFile(filename);
const saveNotepadContent = (btn) => Notepad.save(btn);
const handleMusicUpload = (input) => Music.handleUpload(input);
const playSong = (index) => Music.play(index);
const calcInput = (val) => Calculator.input(val);
const addTodo = () => Todo.add();
const toggleTodo = (idx) => Todo.toggle(idx);
const deleteTodo = (idx) => Todo.delete(idx);
const changeMonth = (delta) => Calendar.changeMonth(delta);
const openEventModal = (dateKey, day) => Calendar.openEventModal(dateKey, day);
const closeEventModal = () => Calendar.closeEventModal();
const saveEvent = () => Calendar.saveEvent();
const initPaint = (canvasId) => Paint.init(canvasId);
const drawPaint = (e) => Paint.draw(e);
const startPaint = (e) => Paint.start(e);
const stopPaint = () => Paint.stop();
const setTool = (tool) => Paint.setTool(tool);
const clearCanvas = () => Paint.clear();
const saveCanvas = () => Paint.save();
const runCode = () => CodeEditor.run();
const saveCode = () => CodeEditor.save();
const updateLines = () => CodeEditor.updateLines();
const refreshTasks = () => TaskManager.refresh();
const forceClose = (id) => TaskManager.forceClose(id);
const zoomImage = (delta) => ImageViewer.zoom(delta);
const resetZoom = () => ImageViewer.reset();
const setAsWallpaperFromViewer = () => ImageViewer.setAsWallpaper();
const fetchWeather = () => Weather.fetch();
const navWiki = (action) => Browser.nav(action);
const refocusTerminal = (layoutDiv) => Terminal.refocus(layoutDiv);

/* ============================================
   INITIALIZATION
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    Storage.load();
    BootSequence.start();
    Shortcuts.setup();
    CustomCursor.setup();
    Clock.update();
    setInterval(() => Clock.update(), 1000);
});
