:root {
    --bg-color: #0f0c29;
    --taskbar-bg: rgba(20, 20, 40, 0.7);
    --window-bg: rgba(30, 30, 60, 0.85);
    --accent-color: #7aa2f7;
    --accent-gradient: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    --text-color: #ffffff;
    --border-color: rgba(255, 255, 255, 0.1);
    --hover-color: rgba(255, 255, 255, 0.15);
    --danger-color: #ff416c;
    --success-color: #00f260;
    --font-main: 'Poppins', sans-serif;
}

body.theme-light {
    --bg-color: #f0f2f5;
    --taskbar-bg: rgba(255, 255, 255, 0.8);
    --window-bg: rgba(255, 255, 255, 0.9);
    --text-color: #333;
    --border-color: rgba(0, 0, 0, 0.1);
    --hover-color: rgba(0, 0, 0, 0.05);
}

* { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }

body {
    font-family: var(--font-main);
    background: linear-gradient(to right, #24243e, #302b63, #0f0c29);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    height: 100vh; overflow: hidden; color: var(--text-color);
    transition: background 0.5s ease;
}

/* BOOT */
#boot-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #050510; z-index: 9999; display: flex; justify-content: center; align-items: center; color: white; flex-direction: column; }
.nexus-logo-svg { width: 120px; height: 120px; margin-bottom: 20px; animation: spinLogo 3s infinite linear; }
@keyframes spinLogo { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.boot-content h1 { font-weight: 300; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 30px; }
.loader-bar { width: 200px; height: 2px; background: rgba(255,255,255,0.2); margin: 20px auto; border-radius: 2px; overflow: hidden; }
.loader-progress { width: 0%; height: 100%; background: var(--accent-gradient); transition: width 2.5s ease-in-out; box-shadow: 0 0 10px var(--accent-color); }

/* DESKTOP */
#desktop { height: calc(100vh - 50px); padding: 20px; display: flex; flex-direction: column; flex-wrap: wrap; align-content: flex-start; gap: 20px; }
.desktop-icon { width: 90px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; border-radius: 12px; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); text-align: center; border: 1px solid transparent; }
.desktop-icon:hover { background: var(--hover-color); border-color: var(--border-color); transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
.desktop-icon i { font-size: 36px; margin-bottom: 8px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
.desktop-icon span { font-size: 13px; font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.8); color: white; }
body.theme-light .desktop-icon span { color: #333; text-shadow: none; }

/* TASKBAR */
#taskbar { position: absolute; bottom: 10px; left: 10px; right: 10px; height: 50px; background: var(--taskbar-bg); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); display: flex; align-items: center; padding: 0 15px; z-index: 1000; border-radius: 15px; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
#start-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; }
#start-btn:hover { transform: scale(1.1); }
#start-btn svg { filter: drop-shadow(0 0 5px var(--accent-color)); }

#taskbar-apps { flex: 1; display: flex; gap: 10px; padding-left: 20px; }
.taskbar-item { padding: 8px 15px; background: rgba(255,255,255,0.05); border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 13px; transition: all 0.2s; border-bottom: 2px solid transparent; }
.taskbar-item:hover { background: var(--hover-color); }
.taskbar-item.active { background: rgba(255,255,255,0.1); border-bottom: 2px solid var(--accent-color); box-shadow: 0 0 15px rgba(0, 210, 255, 0.2); }

#system-tray { display: flex; align-items: center; gap: 15px; padding-right: 10px; font-size: 12px; font-weight: 600; }
#volume-btn { cursor: pointer; padding: 0 10px; display: flex; align-items: center; transition: color 0.2s; }
#volume-btn:hover { color: var(--accent-color); }
#volume-btn i.muted { color: var(--danger-color); text-shadow: 0 0 5px var(--danger-color); }
#clock { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; cursor: default; padding-right: 15px; border-left: 1px solid rgba(255,255,255,0.1); margin-left: 5px; }
#time { font-weight: bold; font-size: 14px; }
#date { font-size: 11px; opacity: 0.8; }

/* START MENU */
#start-menu { position: absolute; bottom: 70px; left: 10px; width: 320px; background: var(--window-bg); border: 1px solid var(--border-color); border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); z-index: 1001; display: flex; flex-direction: column; overflow: hidden; backdrop-filter: blur(20px); animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.hidden { display: none !important; }
.start-header { padding: 20px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border-color); }
.user-profile { display: flex; align-items: center; gap: 15px; font-weight: 600; }
.avatar-circle { width: 40px; height: 40px; background: var(--accent-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; }
.start-apps { padding: 15px; max-height: 350px; overflow-y: auto; }
.start-item { padding: 12px 15px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 15px; margin-bottom: 5px; transition: background 0.2s; }
.start-item:hover { background: var(--hover-color); transform: translateX(5px); }
.start-item i { width: 20px; text-align: center; color: var(--accent-color); }
.start-footer { padding: 15px; border-top: 1px solid var(--border-color); text-align: right; }
.start-footer button { background: transparent; border: 1px solid var(--danger-color); color: var(--danger-color); padding: 8px 15px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.start-footer button:hover { background: var(--danger-color); color: white; box-shadow: 0 0 10px var(--danger-color); }

/* WINDOWS */
.window { 
    position: absolute; background: var(--window-bg); 
    border: 1px solid var(--border-color); border-radius: 15px; 
    box-shadow: 0 20px 50px rgba(0,0,0,0.4); 
    display: flex; flex-direction: column; min-width: 300px; min-height: 200px; 
    resize: both; overflow: hidden; backdrop-filter: blur(10px); 
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
    transition: top 0.2s, left 0.2s, width 0.2s, height 0.2s, border-radius 0.2s; /* Transição suave */
}

/* CLASSE PARA JANELA MAXIMIZADA */
.window.maximized {
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: calc(100vh - 50px) !important; /* Altura total menos a barra de tarefas */
    border-radius: 0 !important;
    resize: none !important;
}

.window-header { height: 40px; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between; padding: 0 15px; cursor: grab; border-bottom: 1px solid var(--border-color); }
.window-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.window-controls { display: flex; gap: 10px; }

/* BOTÕES DA JANELA */
.win-btn { width: 14px; height: 14px; border-radius: 50%; border: none; cursor: pointer; transition: transform 0.1s; }
.win-btn:hover { transform: scale(1.2); }
.btn-min { background: #f1c40f; } 
.btn-max { background: #2ecc71; } /* Verde para Maximizar */
.btn-close { background: #ff416c; } 

.window-body { flex: 1; padding: 0; overflow: auto; position: relative; display: flex; flex-direction: column; }

/* CONTEXT MENU */
#context-menu { position: absolute; background: var(--window-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 2000; width: 200px; padding: 8px 0; backdrop-filter: blur(15px); }
.ctx-item { padding: 10px 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 12px; }
.ctx-item:hover { background: var(--accent-gradient); color: white; }
.ctx-item i { width: 16px; }
.ctx-divider { height: 1px; background: var(--border-color); margin: 5px 0; }

/* APPS GERAIS (Estilos mantidos iguais aos anteriores) */
.explorer-layout { display: flex; height: 100%; }
.explorer-sidebar { width: 140px; background: rgba(0,0,0,0.1); padding: 15px; border-right: 1px solid var(--border-color); }
.sidebar-item { padding: 10px; cursor: pointer; margin-bottom: 5px; border-radius: 8px; display: flex; align-items: center; gap: 10px; }
.sidebar-item:hover { background: var(--hover-color); }
.explorer-main { flex: 1; padding: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); grid-auto-rows: 100px; gap: 15px; align-content: start; }
.file-item { display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer; padding: 10px; border-radius: 10px; transition: background 0.2s; }
.file-item:hover { background: var(--hover-color); }
.file-item i { font-size: 32px; color: #ffd700; margin-bottom: 8px; }

.browser-layout { display: flex; flex-direction: column; height: 100%; }
.browser-bar { display: flex; padding: 10px; background: rgba(0,0,0,0.1); gap: 10px; align-items: center; }
.browser-bar input { flex: 1; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-color); padding: 8px 15px; border-radius: 20px; outline: none; }
.browser-bar button { background: var(--hover-color); border: none; color: var(--text-color); padding: 8px 12px; cursor: pointer; border-radius: 50%; }
#wiki-frame { flex: 1; border: none; background: white; }

.notepad-layout { display: flex; flex-direction: column; height: 100%; }
#notepad-area { flex: 1; background: rgba(0,0,0,0.2); color: var(--text-color); border: none; padding: 15px; font-family: 'Courier New', monospace; resize: none; outline: none; font-size: 14px; }
.notepad-controls { height: 40px; background: rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between; padding: 0 15px; font-size: 12px; }
.notepad-controls button { background: var(--accent-gradient); border: none; color: white; padding: 5px 15px; border-radius: 15px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }

.todo-layout { padding: 15px; display: flex; flex-direction: column; height: 100%; }
.todo-input-group { display: flex; gap: 10px; margin-bottom: 15px; }
.todo-input-group input { flex: 1; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); color: var(--text-color); border-radius: 8px; }
.todo-input-group button { padding: 10px 20px; background: var(--success-color); border: none; color: white; cursor: pointer; border-radius: 8px; font-weight: bold; }
#todo-list { list-style: none; overflow-y: auto; flex: 1; }
.todo-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border-color); align-items: center; }
.todo-item.done span { text-decoration: line-through; opacity: 0.5; }
.todo-del { color: var(--danger-color); cursor: pointer; }

.calculator-layout { width: 100%; height: 100%; display: flex; flex-direction: column; padding: 15px; }
#calc-display { width: 100%; height: 60px; background: rgba(0,0,0,0.3); color: var(--text-color); border: none; text-align: right; font-size: 28px; padding: 15px; margin-bottom: 15px; border-radius: 10px; }
.calc-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; flex: 1; }
.calc-buttons button { background: rgba(255,255,255,0.05); border: none; color: var(--text-color); font-size: 20px; cursor: pointer; border-radius: 10px; transition: background 0.2s; }
.calc-buttons button:hover { background: var(--hover-color); }
.btn-equal { background: var(--accent-gradient) !important; color: white !important; }
.btn-zero { grid-column: span 2; }

.tictactoe-layout { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 20px; }
.game-status { margin-bottom: 20px; font-size: 20px; font-weight: bold; }
.game-board { display: grid; grid-template-columns: repeat(3, 70px); gap: 10px; margin-bottom: 20px; }
.ttt-cell { width: 70px; height: 70px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 36px; cursor: pointer; border-radius: 10px; transition: background 0.2s; }
.ttt-cell:hover { background: var(--hover-color); }
.reset-game { padding: 10px 25px; background: var(--accent-gradient); border: none; color: white; cursor: pointer; border-radius: 20px; font-weight: bold; }

.monitor-layout { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.monitor-card h3 { margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.7; }
.progress-bar { width: 100%; height: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; overflow: hidden; margin-bottom: 5px; }
.fill { height: 100%; background: var(--accent-gradient); transition: width 0.5s ease; box-shadow: 0 0 10px var(--accent-color); }

.settings-layout { padding: 25px; }
.setting-group { margin-bottom: 25px; }
.setting-group label { display: block; margin-bottom: 15px; font-weight: 600; font-size: 16px; }
.wallpaper-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.wp-thumb { height: 60px; background-size: cover; cursor: pointer; border: 2px solid transparent; border-radius: 8px; transition: transform 0.2s; }
.wp-thumb:hover { transform: scale(1.05); border-color: var(--accent-color); }

.settings-tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; }
.tab-btn { background: transparent; border: none; color: var(--text-color); opacity: 0.6; padding: 8px 15px; cursor: pointer; font-size: 14px; font-weight: 600; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.tab-btn:hover { opacity: 1; background: var(--hover-color); }
.tab-btn.active { opacity: 1; background: var(--accent-gradient); color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
.tab-content { display: none; animation: fadeIn 0.3s ease; }
.tab-content.active { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.full-width-btn { width: 100%; padding: 10px; background: var(--hover-color); border: 1px solid var(--border-color); color: var(--text-color); border-radius: 8px; cursor: pointer; text-align: left; display: flex; align-items: center; justify-content: space-between; }
.full-width-btn:hover { background: var(--accent-color); color: white; border-color: transparent; }
.danger-btn { color: var(--danger-color); border-color: var(--danger-color); }
.danger-btn:hover { background: var(--danger-color); color: white; }
.sys-info p { margin-bottom: 5px; font-size: 13px; opacity: 0.8; }

.color-picker-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.color-option { height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.2s; }
.color-option:hover { transform: scale(1.2); border-color: white; }

.terminal-layout { background: #0a0a12; font-family: 'Courier New', monospace; height: 100%; display: flex; flex-direction: column; cursor: text; }
.terminal-output { flex: 1; overflow-y: auto; padding: 15px; font-size: 14px; color: #00f260; }
.terminal-input-line { display: flex; padding: 15px; background: #0a0a12; border-top: 1px solid #1f1f2e; }
.prompt { color: #6a11cb; margin-right: 10px; font-weight: bold; }
.term-input { background: transparent; border: none; color: white; flex: 1; outline: none; font-family: inherit; }

.store-layout { padding: 20px; display: flex; flex-direction: column; height: 100%; }
.store-header { margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
.store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 20px; overflow-y: auto; padding-right: 5px; }
.app-card { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; border: 1px solid transparent; }
.app-card:hover { transform: translateY(-5px); background: var(--hover-color); border-color: var(--accent-color); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
.app-card i { font-size: 40px; margin-bottom: 15px; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.install-btn { background: var(--success-color); color: white; border: none; padding: 8px 15px; border-radius: 20px; font-size: 12px; cursor: pointer; width: 100%; margin-top: 10px; font-weight: bold; }
.install-btn.installed { background: var(--border-color); cursor: default; color: var(--text-color); }

.calendar-layout { padding: 20px; display: flex; flex-direction: column; height: 100%; position: relative; }
.cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.cal-header button { background: transparent; border: 1px solid var(--border-color); color: var(--text-color); padding: 8px 15px; cursor: pointer; border-radius: 8px; transition: background 0.2s; }
.cal-header button:hover { background: var(--hover-color); }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: bold; margin-bottom: 10px; font-size: 12px; opacity: 0.7; text-transform: uppercase; }
.cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; flex: 1; overflow-y: auto; }
.cal-day { background: rgba(255,255,255,0.03); border-radius: 8px; min-height: 45px; display: flex; flex-direction: column; align-items: flex-start; padding: 8px; cursor: pointer; font-size: 13px; position: relative; transition: background 0.2s; }
.cal-day:hover { background: var(--hover-color); }
.cal-day.today { border: 1px solid var(--accent-color); background: rgba(0, 210, 255, 0.1); font-weight: bold; }
.cal-day.empty { background: transparent; cursor: default; }
.event-dot { width: 6px; height: 6px; background: var(--danger-color); border-radius: 50%; margin-top: 4px; box-shadow: 0 0 5px var(--danger-color); }

#event-modal { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
.modal-content { background: var(--window-bg); padding: 25px; border-radius: 15px; width: 90%; max-width: 320px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid var(--border-color); }
#event-note { width: 100%; height: 100px; margin: 15px 0; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); color: var(--text-color); padding: 10px; resize: none; border-radius: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-save { background: var(--success-color); border: none; color: white; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; }
.btn-cancel { background: var(--danger-color); border: none; color: white; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; }

#notification-container { position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 15px; z-index: 2000; }
.notification { background: var(--window-bg); border-left: 4px solid var(--accent-color); padding: 15px 20px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); min-width: 280px; animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(10px); border: 1px solid var(--border-color); }

@keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
