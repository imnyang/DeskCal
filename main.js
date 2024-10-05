const { app, BrowserWindow, globalShortcut } = require('electron');
const { session } = require('electron');
let mainWindow;
let counter = 0;

app.on('ready', () => {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    resizable: false,
    movable: true,
    autoHideMenuBar: true,
    title: 'Google Calendar',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Required to use nodeIntegration with executeJavaScript
    },
    x: width - 1200,
    y: 0,
    backgroundMaterial: 'acrylic',
    skipTaskbar: true,
    openAtLogin: true
  });

  //mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Load the external website
  mainWindow.loadURL('https://calendar.google.com/calendar'); // Change this to the desired external URL

  // Inject CSS styles when the page finishes loading
  mainWindow.webContents.on('did-finish-load', () => {
    const css = `
      * { 
      border-color: rgba(255, 255, 255, 0.2) !important; /* 60% transparent white */
      color: white !important;
      }
      body {
      border-radius: 15px !important;
      }
      .kbf0gd div div div div div div div {
        background-color: rgba(0, 0, 255, 0.5) !important; /* 50% transparent black */
      }
      body, * {
        background-color: transparent !important;
      }
      .dwlvNd div:nth-child(1) {
        background-color: rgba(0, 0, 0, 0.5) !important; /* 50% transparent black */
        border-radius: 100px !important;
      }
      .ChfiMc.p261Pc.mR2qle.LP6XKe {
        background-color: rgba(0, 0, 0, 0.5) !important; /* 50% transparent black */
      }
    `;
    mainWindow.webContents.insertCSS(css);
  });

  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    console.log('minimize', ++counter);
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.restore();
      }
    }, 10);
  });

  mainWindow.on('restore', () => {
    console.log('restore', counter);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setAlwaysOnTop(false);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Make the window transparent when it loses focus
  mainWindow.on('blur', () => {
    mainWindow.setOpacity(0.8); // Adjust the opacity value as needed
  });

  // Restore the window opacity when it gains focus
  mainWindow.on('focus', () => {
    mainWindow.setOpacity(1.0);
  });

  // Register the global shortcut
  globalShortcut.register('Control+Alt+Shift+R', () => {
    session.defaultSession.clearStorageData().then(() => {
      console.log('Storage data cleared');
      // close app
      app.quit();
      app.relaunch();
    }).catch((error) => {
      console.error('Failed to clear storage data:', error);
    });
  });

});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  session.defaultSession.cookies.get({ url: 'https://calendar.google.com' })
    .then((cookies) => {
      if (cookies.length === 0) {
        mainWindow.loadURL('https://accounts.google.com/v3/signin/identifier?dsh=S1611624178:1665765818620318&continue=https://calendar.google.com/calendar/r&followup=https://calendar.google.com/calendar/r&osid=1&passive=1209600&service=cl&flowName=GlifWebSignIn&flowEntry=ServiceLogin&ifkv=AQDHYWrL2lk0_Bcr1n1Y-f-i1sNZRKJK8CNisliX9rpozkqKhY2Jby8gsVZ_wDz_oHqiWmN6uZ6s6g');
      } else {
        mainWindow.loadURL('https://calendar.google.com/calendar');
      }
    }).catch((error) => {
      console.error('Failed to get cookies:', error);
      mainWindow.loadURL('https://calendar.google.com/calendar');
    });
});