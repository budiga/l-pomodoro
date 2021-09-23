const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('path')

let mainWindow
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 360,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 只加nodeIntegration不够，须加上这行才能正常运行
    },
    icon: path.join(__dirname, './assets/images/clock.png')
  })
  mainWindow.loadFile('./index.html')
  // mainWindow.webContents.openDevTools()

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, './assets/images/clock.png'));
  }

  return mainWindow
}

function handleIPC() {
  let notification;
  ipcMain.handle('notification', async (e, {body, title, actions, closeButtonText}) => {
    let res = await new Promise((resolve, reject) => {
      notification = new Notification({
        title,
        body,
        actions,
        closeButtonText
      })
      notification.show()
      notification.on('action', function(event) {
        resolve({event: 'action'})
      })
      notification.on('close', function(event) {
        resolve({event: 'close'})
      })
    })
    return res
  })

  ipcMain.on('closeNotiSync', (event) => {
    if (notification) {
      notification.close(true)
      notification = null
      event.returnValue = true
    } else {
      event.returnValue = false
    }
  })
}

app.whenReady().then(() => {
  handleIPC()
  createMainWindow()
})
