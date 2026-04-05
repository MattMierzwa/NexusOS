/* --- SOUND ENGINE --- */
const SoundEngine = {
    ctx: null, muted: false, pack: 'futuristic',
    init() { 
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); 
        if (this.ctx.state === 'suspended') this.ctx.resume(); 
    },
    playTone(freq, type, duration, vol = 0.1, slideTo = null) { 
        if (this.muted || this.pack === 'silent' || !this.ctx) return; 
        let finalType = type, finalVol = vol, finalDuration = duration;
        if (this.pack === 'classic') { finalType = 'sine'; finalVol = vol * 0.3; finalDuration = duration * 1.5; }
        else if (this.pack === 'mechanical') { finalType = 'square'; finalVol = vol * 0.1; finalDuration = 0.03; }
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = finalType;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + finalDuration);
        gain.gain.setValueAtTime(finalVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + finalDuration);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + finalDuration);
    },
    boot() { if(this.muted || this.pack === 'silent') return; this.playTone(110, 'sawtooth', 0.8, 0.1, 880); setTimeout(() => this.playTone(220, 'square', 0.6, 0.05, 440), 100); },
    click() { if(this.muted || this.pack === 'silent') return; this.playTone(800, 'sine', 0.05, 0.05); },
    openWindow() { if(this.muted || this.pack === 'silent') return; this.playTone(300, 'sawtooth', 0.15, 0.05, 600); },
    closeWindow() { if(this.muted || this.pack === 'silent') return; this.playTone(600, 'triangle', 0.15, 0.05, 200); },
    error() { if(this.muted || this.pack === 'silent') return; this.playTone(150, 'sawtooth', 0.3, 0.1); setTimeout(() => this.playTone(100, 'sawtooth', 0.3, 0.1), 100); },
    notify() { if(this.muted || this.pack === 'silent') return; this.playTone(880, 'sine', 0.1, 0.05); setTimeout(() => this.playTone(1320, 'sine', 0.2, 0.05), 100); }
};
document.addEventListener('click', () => { SoundEngine.init(); }, { once: true });

function toggleMute() {
    SoundEngine.muted = !SoundEngine.muted;
    const icon = document.getElementById('vol-icon');
    localStorage.setItem('nexus_muted', SoundEngine.muted);
    if (SoundEngine.muted) { icon.classList.remove('fa-volume-high'); icon.classList.add('fa-volume-xmark', 'muted'); }
    else { icon.classList.remove('fa-volume-xmark', 'muted'); icon.classList.add('fa-volume-high'); SoundEngine.init(); SoundEngine.click(); }
}

function setSoundPack(packName, save=true) {
    systemState.soundPack = packName;
    SoundEngine.pack = packName;
    if(!SoundEngine.muted && packName !== 'silent') SoundEngine.click();
    if(save) saveSystemData();
}

/* --- ESTADO --- */
const systemState = { 
    windows: [], zIndexCounter: 100, fileSystem: {}, trash: {}, todos: [], theme: 'dark', wallpaperSrc: '', 
    accentColor: '#7aa2f7', accentGradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', 
    windowOpacity: 0.85, events: {}, borderRadius: 15, blurIntensity: 10, interfaceScale: 1,
    musicPlaylist: [], systemFont: 'font-poppins', soundPack: 'futuristic', glowEffect: false, customCursor: false
};

const mockProcesses = [ { name: 'nexus_kernel', cpu: 2.5, mem: 120 }, { name: 'window_manager', cpu: 1.2, mem: 85 }, { name: 'audio_service', cpu: 0.5, mem: 40 }, { name: 'network_daemon', cpu: 0.8, mem: 30 }, { name: 'file_explorer', cpu: 0.0, mem: 60 }, { name: 'browser_engine', cpu: 15.0, mem: 450 }, { name: 'sys_monitor', cpu: 1.0, mem: 25 } ];
let cpuHistory = new Array(50).fill(0); let ramHistory = new Array(50).fill(0); 
let currentExplorerPath = '/'; let explorerHistory = ['/']; 
let currentImageZoom = 1; let currentImageSrc = ''; let currentImageName = '';

document.addEventListener('DOMContentLoaded', () => { loadSystemData(); startBootSequence(); setupShortcuts(); setupCustomCursor(); });

function setupCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    document.addEventListener('mousemove', (e) => { if(systemState.customCursor && cursor) { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; } });
    document.addEventListener('mousedown', () => { if(cursor) cursor.style.transform = 'translate(-50%, -50%) scale(0.8)'; });
    document.addEventListener('mouseup', () => { if(cursor) cursor.style.transform = 'translate(-50%, -50%) scale(1)'; });
}

function setupShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); toggleSearch(); }
        if (e.key === 'Escape') { const searchOverlay = document.getElementById('search-overlay'); if (!searchOverlay.classList.contains('hidden')) toggleSearch(); }
        if (e.key === 'd' && e.metaKey) { e.preventDefault(); systemState.windows.forEach(w => minimizeWindow(w.id)); }
        if (e.key === 'Tab' && e.altKey) { e.preventDefault(); if(systemState.windows.length > 0) { const nextWin = systemState.windows.find(w => !w.minimized) || systemState.windows[0]; if(nextWin) focusWindow(nextWin.id); } }
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
    const storedFiles = localStorage.getItem('webos_files'); systemState.fileSystem = storedFiles ? JSON.parse(storedFiles) : { "leia-me.txt": "Bem-vindo ao NexusOS." };
    const storedTrash = localStorage.getItem('webos_trash'); systemState.trash = storedTrash ? JSON.parse(storedTrash) : {};
    const storedTodos = localStorage.getItem('webos_todos'); systemState.todos = storedTodos ? JSON.parse(storedTodos) : [];
    const storedEvents = localStorage.getItem('webos_events'); if (storedEvents) systemState.events = JSON.parse(storedEvents);
    const storedTheme = localStorage.getItem('webos_theme'); if (storedTheme) { systemState.theme = storedTheme; document.body.className = `${systemState.theme === 'dark' ? 'theme-dark' : 'theme-light'} ${systemState.systemFont}`; }
    const storedWpSrc = localStorage.getItem('nexus_wp_src'); if (storedWpSrc) { document.body.style.backgroundImage = `url('${storedWpSrc}')`; systemState.wallpaperSrc = storedWpSrc; }
    const storedAccent = localStorage.getItem('nexus_accent_color'); const storedGradient = localStorage.getItem('nexus_accent_gradient'); if (storedAccent && storedGradient) setAccentColor(storedAccent, storedGradient, false);
    
    const storedRadius = localStorage.getItem('nexus_border_radius'); if (storedRadius) setBorderRadius(storedRadius, false);
    const storedBlur = localStorage.getItem('nexus_blur_intensity'); if (storedBlur) setBlurIntensity(storedBlur, false);
    const storedScale = localStorage.getItem('nexus_interface_scale'); if (storedScale) setInterfaceScale(storedScale, false);
    const storedPlaylist = localStorage.getItem('nexus_music_playlist'); if (storedPlaylist) systemState.musicPlaylist = JSON.parse(storedPlaylist);
    
    const storedFont = localStorage.getItem('nexus_system_font'); if (storedFont) setSystemFont(storedFont, false);
    const storedSound = localStorage.getItem('nexus_sound_pack'); if (storedSound) setSoundPack(storedSound, false);
    const storedGlow = localStorage.getItem('nexus_glow_effect') === 'true'; if (storedGlow) toggleGlowEffect(true);
    const storedCursor = localStorage.getItem('nexus_custom_cursor') === 'true'; if (storedCursor) toggleCustomCursor(true);

    const isMuted = localStorage.getItem('nexus_muted') === 'true'; if (isMuted) { SoundEngine.muted = true; const icon = document.getElementById('vol-icon'); if(icon) { icon.classList.remove('fa-volume-high'); icon.classList.add('fa-volume-xmark', 'muted'); } }
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
    localStorage.setItem('nexus_border_radius', systemState.borderRadius);
    localStorage.setItem('nexus_blur_intensity', systemState.blurIntensity);
    localStorage.setItem('nexus_interface_scale', systemState.interfaceScale);
    localStorage.setItem('nexus_music_playlist', JSON.stringify(systemState.musicPlaylist));
    localStorage.setItem('nexus_system_font', systemState.systemFont);
    localStorage.setItem('nexus_sound_pack', systemState.soundPack);
    localStorage.setItem('nexus_glow_effect', systemState.glowEffect);
    localStorage.setItem('nexus_custom_cursor', systemState.customCursor);
}

/* --- PERSONALIZAÇÃO --- */
function setSystemFont(fontClass, save=true) { systemState.systemFont = fontClass; document.body.classList.remove('font-poppins', 'font-roboto', 'font-inter', 'font-fira'); document.body.classList.add(fontClass); if(save) saveSystemData(); }
function toggleGlowEffect(forceOn = null) { if (forceOn !== null) systemState.glowEffect = forceOn; else systemState.glowEffect = !systemState.glowEffect; if (systemState.glowEffect) document.body.classList.add('glow-active'); else document.body.classList.remove('glow-active'); const btn = document.getElementById('glow-btn'); if(btn) { btn.style.background = systemState.glowEffect ? 'var(--accent-color)' : ''; btn.style.color = systemState.glowEffect ? 'white' : ''; } saveSystemData(); }
function toggleCustomCursor(forceOn = null) { if (forceOn !== null) systemState.customCursor = forceOn; else systemState.customCursor = !systemState.customCursor; if (systemState.customCursor) document.body.classList.add('cursor-active'); else document.body.classList.remove('cursor-active'); const btn = document.getElementById('cursor-btn'); if(btn) { btn.style.background = systemState.customCursor ? 'var(--accent-color)' : ''; btn.style.color = systemState.customCursor ? 'white' : ''; } saveSystemData(); }
function setBorderRadius(val, save=true) { systemState.borderRadius = val; document.documentElement.style.setProperty('--window-radius', val + 'px'); const label = document.getElementById('radius-value'); if(label) label.innerText = val + 'px'; if(save) saveSystemData(); }
function setBlurIntensity(val, save=true) { systemState.blurIntensity = val; document.documentElement.style.setProperty('--blur-intensity', val + 'px'); const label = document.getElementById('blur-value'); if(label) label.innerText = val + 'px'; if(save) saveSystemData(); }
function setInterfaceScale(val, save=true) { systemState.interfaceScale = val; document.documentElement.style.setProperty('--interface-scale', val); const label = document.getElementById('scale-value'); if(label) label.innerText = Math.round(val * 100) + '%'; if(save) saveSystemData(); }
function setWallpaper(el) { SoundEngine.click(); const src = el.getAttribute('data-src'); systemState.wallpaperSrc = src; document.body.style.backgroundImage = `url('${src}')`; saveSystemData(); showNotification("Papel de Parede Alterado"); }
function setAccentColor(color, gradient, save = true) { SoundEngine.click(); const root = document.documentElement; root.style.setProperty('--accent-color', color); root.style.setProperty('--accent-gradient', gradient); systemState.accentColor = color; systemState.accentGradient = gradient; if(save) saveSystemData(); }

/* --- BUSCA --- */
function toggleSearch() { const overlay = document.getElementById('search-overlay'); const input = document.getElementById('global-search-input'); if (overlay.classList.contains('hidden')) { overlay.classList.remove('hidden'); input.value = ''; input.focus(); document.getElementById('search-results').innerHTML = ''; } else { overlay.classList.add('hidden'); } }
function performSearch() {
    const query = document.getElementById('global-search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    if (!query) return;
    const apps = [
        { name: 'Explorador', icon: 'fa-folder-tree', action: "openApp('explorer')" }, { name: 'Clima', icon: 'fa-cloud-sun-rain', action: "openApp('weather')" },
        { name: 'Navegador', icon: 'fa-globe', action: "openApp('browser')" }, { name: 'Editor', icon: 'fa-pen-nib', action: "openApp('notepad')" },
        { name: 'Code Editor', icon: 'fa-code', action: "openApp('codeeditor')" }, { name: 'Paint', icon: 'fa-paintbrush', action: "openApp('paint')" },
        { name: 'Calculadora', icon: 'fa-calculator', action: "openApp('calculator')" }, { name: 'Música', icon: 'fa-music', action: "openApp('music')" },
        { name: 'Tarefas', icon: 'fa-check-double', action: "openApp('todo')" }, { name: 'Agenda', icon: 'fa-calendar-alt', action: "openApp('calendar')" },
        { name: 'Task Manager', icon: 'fa-list-check', action: "openApp('taskmanager')" }, { name: 'Monitor', icon: 'fa-chart-line', action: "openApp('monitor')" },
        { name: 'Sistema', icon: 'fa-sliders-h', action: "openApp('settings')" }
    ];
    apps.forEach(app => { if (app.name.toLowerCase().includes(query)) createSearchResult(app.name, app.icon, app.action, resultsContainer); });
    Object.keys(systemState.fileSystem).forEach(key => { 
        if (key.toLowerCase().includes(query)) {
            let action = `openFileInNotepad('${key}')`; let icon = 'fa-file-lines';
            if(key.match(/\.(jpg|jpeg|png|gif|webp)$/i)) { action = `openImageViewer('${key}')`; icon = 'fa-image'; }
            createSearchResult(key, icon, action, resultsContainer);
        }
    });
}
function createSearchResult(title, icon, action, container) { const div = document.createElement('div'); div.className = 'search-item'; div.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${title}</span>`; div.onclick = () => { eval(action); toggleSearch(); }; container.appendChild(div); }

/* --- EXPLORADOR --- */
function navigateTo(path) { SoundEngine.click(); currentExplorerPath = path; if(explorerHistory[explorerHistory.length-1] !== path) explorerHistory.push(path); renderExplorer(); }
function goBack() { SoundEngine.click(); if (explorerHistory.length > 1) { explorerHistory.pop(); currentExplorerPath = explorerHistory[explorerHistory.length - 1]; renderExplorer(); } }
function navigateToTrash() { SoundEngine.click(); currentExplorerPath = 'trash'; explorerHistory.push('trash'); renderExplorer(); }
function renderExplorer() {
    const grid = document.getElementById('explorer-grid'); const pathDisplay = document.getElementById('explorer-path');
    if(!grid) return; grid.innerHTML = '';
    pathDisplay.innerText = currentExplorerPath === '/' ? 'Home' : (currentExplorerPath === 'trash' ? 'Lixeira' : currentExplorerPath);
    let items = {};
    if (currentExplorerPath === '/') items = systemState.fileSystem;
    else if (currentExplorerPath === 'trash') items = systemState.trash;
    else { const folderName = currentExplorerPath.replace('/', ''); if(systemState.fileSystem[folderName] && typeof systemState.fileSystem[folderName] === 'object') items = systemState.fileSystem[folderName]; else items = systemState.fileSystem; }
    if (currentExplorerPath !== '/' && currentExplorerPath !== 'trash') {
        const backBtn = document.createElement('div'); backBtn.className = 'file-item folder'; backBtn.innerHTML = `<i class="fa-solid fa-arrow-up"></i><span>..</span>`; backBtn.ondblclick = () => goBack(); grid.appendChild(backBtn);
    }
    if (Object.keys(items).length === 0) { grid.innerHTML += `<div style="grid-column:1/-1; text-align:center; opacity:0.5; margin-top:20px;">Vazio</div>`; return; }
    Object.keys(items).forEach(name => {
        const item = items[name]; const isFolder = typeof item === 'object'; const isImage = !isFolder && name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const div = document.createElement('div'); div.className = `file-item ${isFolder ? 'folder' : (isImage ? 'image' : 'file')}`;
        div.innerHTML = `<i class="fa-solid ${isFolder ? 'fa-folder' : (isImage ? 'fa-image' : 'fa-file-lines')}"></i><span>${name}</span>`;
        div.ondblclick = () => { if (isFolder) navigateTo('/' + name); else if (isImage) openImageViewer(name); else { if(currentExplorerPath === 'trash') { if(confirm(`Restaurar ${name}?`)) restoreFile(name); } else openFileInNotepad(name); } };
        div.oncontextmenu = (e) => { e.preventDefault(); if(currentExplorerPath === 'trash') { if(confirm(`Excluir permanentemente ${name}?`)) deleteFilePermanently(name); } else { if(confirm(`${isFolder ? 'Mover pasta' : 'Mover arquivo'} ${name} para Lixeira?`)) moveToTrash(name); } };
        grid.appendChild(div);
    });
}
function createNewFolderPrompt() { SoundEngine.click(); const name = prompt("Nome da nova pasta:"); if (name && currentExplorerPath === '/') { if (!systemState.fileSystem[name]) { systemState.fileSystem[name] = {}; saveSystemData(); renderExplorer(); showNotification("Pasta criada"); } else alert("Já existe um item com este nome."); } else if (currentExplorerPath !== '/') alert("Criação de pastas suportada apenas na Raiz (Home)."); }
function createNewFilePrompt() { SoundEngine.click(); const name = prompt("Nome do arquivo:"); if (name && currentExplorerPath === '/') { if (!systemState.fileSystem[name]) { systemState.fileSystem[name] = ""; saveSystemData(); renderExplorer(); showNotification("Arquivo criado"); } else alert("Já existe um item com este nome."); } }
function moveToTrash(name) { const item = systemState.fileSystem[name]; systemState.trash[name] = item; delete systemState.fileSystem[name]; saveSystemData(); renderExplorer(); showNotification("Movido para Lixeira"); }
function restoreFile(name) { systemState.fileSystem[name] = systemState.trash[name]; delete systemState.trash[name]; saveSystemData(); renderExplorer(); showNotification("Restaurado"); }
function deleteFilePermanently(name) { delete systemState.trash[name]; saveSystemData(); renderExplorer(); showNotification("Excluído permanentemente"); }

/* --- VISUALIZADOR --- */
function openImageViewer(filename) { SoundEngine.click(); let src = systemState.fileSystem[filename]; if (!src.startsWith('http') && !src.startsWith('')) { src = 'https://via.placeholder.com/600x400?text=Imagem+Local+Nao+Suportada+Diretamente'; } currentImageSrc = src; currentImageName = filename; currentImageZoom = 1; openApp('imageviewer'); setTimeout(() => { const img = document.getElementById('viewer-img'); const nameDisplay = document.getElementById('image-name-display'); if(img) { img.src = src; img.style.transform = `scale(1)`; } if(nameDisplay) nameDisplay.innerText = filename; }, 100); }
function zoomImage(delta) { currentImageZoom += delta; if(currentImageZoom < 0.1) currentImageZoom = 0.1; const img = document.getElementById('viewer-img'); if(img) img.style.transform = `scale(${currentImageZoom})`; }
function resetZoom() { currentImageZoom = 1; const img = document.getElementById('viewer-img'); if(img) img.style.transform = `scale(1)`; }
function setAsWallpaperFromViewer() { if(currentImageSrc) { systemState.wallpaperSrc = currentImageSrc; document.body.style.backgroundImage = `url('${currentImageSrc}')`; saveSystemData(); showNotification("Papel de Parede Definido"); } }

/* --- MÚSICA --- */
function handleMusicUpload(input) { const files = input.files; if (!files.length) return; for (let i = 0; i < files.length; i++) { const file = files[i]; const url = URL.createObjectURL(file); const song = { name: file.name, url: url, id: Date.now() + i }; systemState.musicPlaylist.push(song); } saveSystemData(); renderPlaylist(); showNotification(`${files.length} música(s) adicionada(s)`); input.value = ''; }
function renderPlaylist() { const list = document.getElementById('music-playlist'); if(!list) return; list.innerHTML = ''; systemState.musicPlaylist.forEach((song, index) => { const div = document.createElement('div'); div.className = 'playlist-item'; div.innerHTML = `<span><i class="fa-solid fa-music"></i> ${song.name}</span> <i class="fa-solid fa-play" onclick="playSong(${index})"></i>`; list.appendChild(div); }); }
function playSong(index) { const song = systemState.musicPlaylist[index]; if(!song) return; const audio = document.getElementById('audio-element'); const title = document.getElementById('music-title'); const status = document.getElementById('music-status'); if(audio && title && status) { audio.src = song.url; audio.play(); title.innerText = song.name; status.innerText = "Tocando"; document.querySelectorAll('.playlist-item').forEach(item => item.classList.remove('active')); const items = document.querySelectorAll('.playlist-item'); if(items[index]) items[index].classList.add('active'); } }

/* --- CALCULADORA --- */
let calcExpression = "";
function calcInput(val) { const display = document.getElementById('calc-display'); if(!display) return; if (val === 'C') { calcExpression = ""; } else if (val === 'back') { calcExpression = calcExpression.slice(0, -1); } else if (val === '=') { try { if (/[^0-9+\-*/().]/.test(calcExpression)) throw new Error("Invalid"); calcExpression = eval(calcExpression).toString(); } catch { calcExpression = "Erro"; SoundEngine.error(); } } else { calcExpression += val; } display.value = calcExpression; }

/* --- NOTEPAD --- */
function openFileInNotepad(filename) { SoundEngine.click(); openApp('notepad'); setTimeout(() => { const areas = document.querySelectorAll('#notepad-area'); const last = areas[areas.length-1]; last.value = systemState.fileSystem[filename] || ""; last.dataset.filename = filename; }, 100); }
function saveNotepadContent(btn) { SoundEngine.click(); const p = btn.closest('.window-body'); const ta = p.querySelector('#notepad-area'); const fn = ta.dataset.filename; if (fn) { systemState.fileSystem[fn] = ta.value; saveSystemData(); showNotification("Salvo!"); } else { const name = prompt("Salvar como:"); if(name) { systemState.fileSystem[name] = ta.value; ta.dataset.filename = name; saveSystemData(); if(document.getElementById('explorer-grid')) renderExplorer(); showNotification("Salvo!"); } } }

/* --- BACKUP --- */
function downloadBackup() { SoundEngine.click(); const dataStr = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemState)); const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", "nexusos_backup.json"); document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove(); showNotification("Backup Baixado"); }
function restoreBackup(input) { const file = input.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { try { const data = JSON.parse(e.target.result); systemState.fileSystem = data.fileSystem || {}; systemState.trash = data.trash || {}; systemState.todos = data.todos || {}; systemState.events = data.events || {}; systemState.theme = data.theme || 'dark'; systemState.wallpaperSrc = data.wallpaperSrc || ''; systemState.accentColor = data.accentColor || '#7aa2f7'; systemState.accentGradient = data.accentGradient || 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'; systemState.borderRadius = data.borderRadius || 15; systemState.blurIntensity = data.blurIntensity || 10; systemState.interfaceScale = data.interfaceScale || 1; systemState.musicPlaylist = data.musicPlaylist || []; systemState.systemFont = data.systemFont || 'font-poppins'; systemState.soundPack = data.soundPack || 'futuristic'; systemState.glowEffect = data.glowEffect || false; systemState.customCursor = data.customCursor || false; saveSystemData(); location.reload(); } catch (err) { alert("Arquivo de backup inválido."); } }; reader.readAsText(file); }

/* --- CODE EDITOR --- */
function runCode() { const code = document.getElementById('code-area').value; const lang = document.getElementById('code-lang').value; const preview = document.getElementById('code-preview'); let content = ""; if (lang === 'html') content = code; else if (lang === 'css') content = `<style>${code}</style><h1>Preview CSS</h1><p>Adicione HTML para ver melhor.</p>`; else if (lang === 'js') content = `<script>${code}<\/script><h1>Preview JS</h1><p>Veja o console.</p>`; preview.srcdoc = content; }
function saveCode() { SoundEngine.click(); const code = document.getElementById('code-area').value; const lang = document.getElementById('code-lang').value; const name = prompt(`Salvar como (ex: script.${lang}):`, `Untitled.${lang}`); if (name) { systemState.fileSystem[name] = code; saveSystemData(); showNotification("Código Salvo"); } }
function updateLines() { const textarea = document.getElementById('code-area'); const lines = document.getElementById('code-lines'); const numLines = textarea.value.split('\n').length; lines.innerHTML = Array(numLines).fill(0).map((_, i) => i + 1).join('<br>'); }

/* --- PAINT --- */
let paintCtx, isPainting = false, paintTool = 'brush';
function initPaint(canvasId) { const canvas = document.getElementById(canvasId); if(!canvas) return; const container = canvas.parentElement; canvas.width = container.clientWidth; canvas.height = container.clientHeight; paintCtx = canvas.getContext('2d'); paintCtx.lineCap = 'round'; paintCtx.lineJoin = 'round'; canvas.addEventListener('mousedown', startPaint); canvas.addEventListener('mousemove', drawPaint); canvas.addEventListener('mouseup', stopPaint); canvas.addEventListener('mouseout', stopPaint); }
function startPaint(e) { isPainting = true; drawPaint(e); }
function drawPaint(e) { if (!isPainting) return; const canvas = document.getElementById('paint-canvas'); const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; paintCtx.lineWidth = document.getElementById('paint-size').value; paintCtx.strokeStyle = paintTool === 'eraser' ? '#ffffff' : document.getElementById('paint-color').value; paintCtx.lineTo(x, y); paintCtx.stroke(); paintCtx.beginPath(); paintCtx.moveTo(x, y); }
function stopPaint() { isPainting = false; paintCtx.beginPath(); }
function setTool(tool) { paintTool = tool; }
function clearCanvas() { const canvas = document.getElementById('paint-canvas'); const ctx = canvas.getContext('2d'); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
function saveCanvas() { const canvas = document.getElementById('paint-canvas'); const dataURL = canvas.toDataURL('image/png'); const name = prompt("Salvar desenho como:", "desenho.png"); if(name) { systemState.fileSystem[name] = dataURL; saveSystemData(); showNotification("Desenho Salvo"); } }

/* --- TASK MANAGER --- */
function refreshTasks() { const list = document.getElementById('tm-list'); const count = document.getElementById('tm-count'); if(!list) return; list.innerHTML = ''; let activeCount = 0; systemState.windows.forEach(win => { activeCount++; const div = document.createElement('div'); div.className = 'tm-item'; div.innerHTML = `<div class="tm-info"><i class="fa-solid fa-window-maximize"></i><span>${win.appType.toUpperCase()} (ID: ${win.id.substr(-4)})</span></div><div class="tm-actions"><button onclick="forceClose('${win.id}')">Fechar</button></div>`; list.appendChild(div); }); count.innerText = `${activeCount} processos ativos`; }
function forceClose(id) { closeWindow(id); refreshTasks(); }

/* --- JANELAS --- */
function openApp(appName) {
    SoundEngine.click();
    const id = 'win-' + Date.now();
    let title = '', icon = '', tplId = '', w = '600px', h = '400px';
    if(appName === 'explorer') { title='Explorador'; icon='fa-folder-tree'; tplId='tpl-explorer'; }
    else if(appName === 'weather') { title='Clima'; icon='fa-cloud-sun-rain'; tplId='tpl-weather'; w='350px'; h='400px'; }
    else if(appName === 'browser') { title='Navegador'; icon='fa-globe'; tplId='tpl-browser'; w='800px'; h='500px'; }
    else if(appName === 'notepad') { title='Editor'; icon='fa-pen-nib'; tplId='tpl-notepad'; w='500px'; h='350px'; }
    else if(appName === 'codeeditor') { title='Code Editor'; icon='fa-code'; tplId='tpl-codeeditor'; w='700px'; h='500px'; }
    else if(appName === 'paint') { title='Paint'; icon='fa-paintbrush'; tplId='tpl-paint'; w='600px'; h='450px'; }
    else if(appName === 'calculator') { title='Calculadora'; icon='fa-calculator'; tplId='tpl-calculator'; w='300px'; h='400px'; }
    else if(appName === 'music') { title='Música'; icon='fa-music'; tplId='tpl-music'; w='350px'; h='500px'; }
    else if(appName === 'todo') { title='Tarefas'; icon='fa-check-double'; tplId='tpl-todo'; w='350px'; h='400px'; }
    else if(appName === 'calendar') { title='Agenda'; icon='fa-calendar-alt'; tplId='tpl-calendar'; w='400px'; h='500px'; }
    else if(appName === 'taskmanager') { title='Task Manager'; icon='fa-list-check'; tplId='tpl-taskmanager'; w='400px'; h='300px'; }
    else if(appName === 'monitor') { title='Monitor'; icon='fa-chart-line'; tplId='tpl-monitor'; w='350px'; h='450px'; }
    else if(appName === 'settings') { title='Sistema'; icon='fa-sliders-h'; tplId='tpl-settings'; w='450px'; h='400px'; }
    else if(appName === 'terminal') { title='Terminal'; icon='fa-code'; tplId='tpl-terminal'; w='600px'; h='350px'; }
    else if(appName === 'imageviewer') { title='Visualizador'; icon='fa-image'; tplId='tpl-imageviewer'; w='600px'; h='500px'; }
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

    if (appType === 'explorer') { explorerHistory = ['/']; currentExplorerPath = '/'; renderExplorer(); }
    if (appType === 'terminal') initTerminalLogic(win);
    if (appType === 'todo') renderTodos();
    if (appType === 'monitor') startMonitorLoop(id);
    if (appType === 'calendar') initCalendar();
    if (appType === 'music') renderPlaylist();
    if (appType === 'paint') setTimeout(() => initPaint('paint-canvas'), 100);
    if (appType === 'taskmanager') setTimeout(refreshTasks, 100);
    
    if (appType === 'settings') {
        setTimeout(() => {
            const rSlider = document.getElementById('border-radius-slider');
            const bSlider = document.getElementById('blur-slider');
            const sSlider = document.getElementById('scale-slider');
            const fSelect = document.getElementById('font-select');
            const spSelect = document.getElementById('sound-pack-select');
            if(rSlider) rSlider.value = systemState.borderRadius;
            if(bSlider) bSlider.value = systemState.blurIntensity;
            if(sSlider) sSlider.value = systemState.interfaceScale;
            if(fSelect) fSelect.value = systemState.systemFont;
            if(spSelect) spSelect.value = systemState.soundPack;
            const rLabel = document.getElementById('radius-value');
            const bLabel = document.getElementById('blur-value');
            const sLabel = document.getElementById('scale-value');
            if(rLabel) rLabel.innerText = systemState.borderRadius + 'px';
            if(bLabel) bLabel.innerText = systemState.blurIntensity + 'px';
            if(sLabel) sLabel.innerText = Math.round(systemState.interfaceScale * 100) + '%';
            const resSpan = document.getElementById('sys-res');
            if(resSpan) resSpan.innerText = `${window.screen.width}x${window.screen.height}`;
            const glowBtn = document.getElementById('glow-btn');
            const cursorBtn = document.getElementById('cursor-btn');
            if(glowBtn) { glowBtn.style.background = systemState.glowEffect ? 'var(--accent-color)' : ''; glowBtn.style.color = systemState.glowEffect ? 'white' : ''; }
            if(cursorBtn) { cursorBtn.style.background = systemState.customCursor ? 'var(--accent-color)' : ''; cursorBtn.style.color = systemState.customCursor ? 'white' : ''; }
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

/* --- DRAG --- */
let isDragging = false, dragOffset = { x: 0, y: 0 }, currentWindow = null;
function startDrag(e, id) { if (e.target.closest('.window-controls')) return; const win = document.getElementById(id); if (win && win.classList.contains('maximized')) return; isDragging = true; currentWindow = win; focusWindow(id); const rect = currentWindow.getBoundingClientRect(); dragOffset.x = e.clientX - rect.left; dragOffset.y = e.clientY - rect.top; }
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
function toggleTheme() { SoundEngine.click(); systemState.theme = systemState.theme === 'dark' ? 'light' : 'dark'; document.body.className = `theme-${systemState.theme} ${systemState.systemFont}`; saveSystemData(); document.getElementById('context-menu').classList.add('hidden'); }
function switchTab(tabName) { SoundEngine.click(); document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active')); document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active')); const buttons = document.querySelectorAll('.tab-btn'); if(tabName === 'visual') buttons[0].classList.add('active'); else buttons[1].classList.add('active'); document.getElementById(`tab-${tabName}`).classList.add('active'); }

/* --- MONITOR --- */
let monitorIntervals = {};
function startMonitorLoop(winId) { if(monitorIntervals[winId]) clearInterval(monitorIntervals[winId]); monitorIntervals[winId] = setInterval(() => { const win = document.getElementById(winId); if(!win) { clearInterval(monitorIntervals[winId]); return; } const cpuVal = Math.floor(Math.random() * 40) + 10; const ramVal = Math.floor(Math.random() * 30) + 40; cpuHistory.push(cpuVal); cpuHistory.shift(); ramHistory.push(ramVal); ramHistory.shift(); drawChart(win.querySelector('#cpu-chart'), cpuHistory, '#f7768e'); drawChart(win.querySelector('#ram-chart'), ramHistory, '#7aa2f7'); win.querySelector('#cpu-text').innerText = cpuVal + "%"; win.querySelector('#ram-text').innerText = ramVal + "%"; const list = win.querySelector('#process-list'); list.innerHTML = ''; mockProcesses.forEach(p => { const curCpu = (p.cpu + (Math.random() * 2 - 1)).toFixed(1); const div = document.createElement('div'); div.className = 'process-item'; div.innerHTML = `<span class="process-name">${p.name}</span><span class="process-cpu">${curCpu}% CPU</span>`; list.appendChild(div); }); }, 1000); }
function drawChart(canvas, data, color) { if(!canvas) return; const ctx = canvas.getContext('2d'); const w = canvas.width; const h = canvas.height; ctx.clearRect(0, 0, w, h); ctx.beginPath(); ctx.moveTo(0, h); const step = w / (data.length - 1); data.forEach((val, i) => { const x = i * step; const y = h - (val / 100 * h); ctx.lineTo(x, y); }); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); ctx.lineTo(w, h); ctx.fillStyle = color + '33'; ctx.fill(); }

/* --- OUTROS --- */
function navWiki(action) { SoundEngine.click(); const frame = document.getElementById('wiki-frame'); if(action === 'refresh') frame.src = frame.src; }
function renderTodos() { document.querySelectorAll('#todo-list').forEach(list => { list.innerHTML = ''; systemState.todos.forEach((todo, idx) => { const li = document.createElement('li'); li.className = `todo-item ${todo.done ? 'done' : ''}`; li.innerHTML = `<span onclick="toggleTodo(${idx})">${todo.text}</span><i class="fa-solid fa-trash todo-del" onclick="deleteTodo(${idx})"></i>`; list.appendChild(li); }); }); }
function addTodo() { SoundEngine.click(); const inputs = document.querySelectorAll('#todo-input'); inputs.forEach(input => { if(input.value) { systemState.todos.push({ text: input.value, done: false }); input.value = ''; saveSystemData(); renderTodos(); } }); }
function toggleTodo(idx) { SoundEngine.click(); systemState.todos[idx].done = !systemState.todos[idx].done; saveSystemData(); renderTodos(); }
function deleteTodo(idx) { SoundEngine.click(); systemState.todos.splice(idx, 1); saveSystemData(); renderTodos(); }
let currentCalDate = new Date(); let selectedDateKey = null;
function initCalendar() { renderCalendarGrid(); }
function changeMonth(delta) { currentCalDate.setMonth(currentCalDate.getMonth() + delta); renderCalendarGrid(); }
function renderCalendarGrid() { const grid = document.getElementById('cal-days-grid'); const monthTitle = document.getElementById('cal-month-year'); if(!grid || !monthTitle) return; const year = currentCalDate.getFullYear(); const month = currentCalDate.getMonth(); monthTitle.innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentCalDate); grid.innerHTML = ''; const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate(); for(let i=0; i<firstDay; i++) { const empty = document.createElement('div'); empty.className = 'cal-day empty'; grid.appendChild(empty); } const today = new Date(); for(let d=1; d<=daysInMonth; d++) { const dayDiv = document.createElement('div'); dayDiv.className = 'cal-day'; if(d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) dayDiv.classList.add('today'); dayDiv.innerHTML = `<span>${d}</span>`; const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; if(systemState.events[dateKey]) { const dot = document.createElement('div'); dot.className = 'event-dot'; dayDiv.appendChild(dot); } dayDiv.onclick = () => openEventModal(dateKey, d); grid.appendChild(dayDiv); } }
function openEventModal(dateKey, day) { selectedDateKey = dateKey; const modal = document.getElementById('event-modal'); const title = document.getElementById('modal-date-title'); const note = document.getElementById('event-note'); title.innerText = `Lembrete: ${day}/${currentCalDate.getMonth()+1}`; note.value = systemState.events[dateKey] || ''; modal.classList.remove('hidden'); }
function closeEventModal() { document.getElementById('event-modal').classList.add('hidden'); selectedDateKey = null; }
function saveEvent() { if(!selectedDateKey) return; const note = document.getElementById('event-note').value.trim(); if(note) systemState.events[selectedDateKey] = note; else delete systemState.events[selectedDateKey]; saveSystemData(); closeEventModal(); renderCalendarGrid(); showNotification("Evento Salvo"); }
function refocusTerminal(layoutDiv) { layoutDiv.querySelector('.term-input').focus(); }
function initTerminalLogic(win) { const input = win.querySelector('.term-input'); const output = win.querySelector('.terminal-output'); printTerm(output, "Nexus Kernel v1.0 initialized."); input.focus(); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { SoundEngine.click(); const cmd = input.value.trim(); printTerm(output, `nexus@root:~$ ${cmd}`); processCommand(cmd, output); input.value = ''; output.scrollTop = output.scrollHeight; } }); }
function printTerm(out, text) { out.innerHTML += `<div>${text}</div>`; }
function processCommand(cmd, out) { const parts = cmd.split(' '); switch(parts[0].toLowerCase()) { case 'help': printTerm(out, "Comandos: help, ls, clear, echo, date"); break; case 'ls': printTerm(out, Object.keys(systemState.fileSystem).join('  ')); break; case 'clear': out.innerHTML = ''; break; case 'echo': printTerm(out, parts.slice(1).join(' ')); break; case 'date': printTerm(out, new Date().toString()); break; default: if(cmd) { printTerm(out, `Comando não encontrado: ${parts[0]}`); SoundEngine.error(); } } }
async function fetchWeather() {
    const city = document.getElementById('city-input').value;
    const display = document.getElementById('weather-display');
    
    if (!city) return;

    display.innerHTML = '<div class="loading"><i class="fa-solid fa-spinner fa-spin"></i> Buscando...</div>';
    
    // SUBSTITUA 'SUA_CHAVE_AQUI' PELA SUA CHAVE REAL DA OPENWEATHERMAP
    const apiKey = 'fb5da73546482815b42af679e90b0b4f'; 
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Cidade não encontrada');
        }

        const data = await response.json();
        
        // Extrai os dados reais da API
        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const humidity = data.main.humidity;
        const wind = data.wind.speed;
        const country = data.sys.country;

        // Monta o HTML com os dados reais
        display.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Ícone do tempo" style="width: 80px;">
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-desc">${description}</div>
            <div class="weather-details">
                <span><i class="fa-solid fa-droplet"></i> ${humidity}%</span>
                <span><i class="fa-solid fa-wind"></i> ${wind} m/s</span>
            </div>
            <div class="weather-city"><i class="fa-solid fa-location-dot"></i> ${data.name}, ${country}</div>
        `;
    } catch (error) {
        console.error(error);
        display.innerHTML = `
            <div class="error">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 30px; margin-bottom: 10px;"></i><br>
                Cidade não encontrada ou erro na conexão.<br>
                <small>Verifique se digitou corretamente.</small>
            </div>
        `;
    }
}
