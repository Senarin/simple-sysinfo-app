const { app, BrowserWindow } = require('electron');

let mainWindow = null;

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
    resizable: false
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