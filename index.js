const { app, BrowserWindow } = require('electron');
const electronReload = require("electron-reload")

let mainWindow = null;

electronReload(__dirname);

function createWindow () {
  const windowOptions = {
    width: 1280,
    height: 720,
    title: 'System Information',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false
    },
    menu: null,
    resizable: false,
    frame: false
  }

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null
  });
  mainWindow.setMenuBarVisibility(false);
}

app.on('ready', () => {
  createWindow();
});