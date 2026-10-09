// Ventana de escritorio que abre la carpeta app/ (index.html). Sin red, sin login.
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function crearVentana() {
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    width: 760,
    height: 720,
    title: 'Sincronizador',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(crearVentana);
app.on('window-all-closed', () => app.quit());
