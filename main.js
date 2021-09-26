const { app, BrowserWindow, BrowserView, ipcMain, Notification } = require('electron')
const path = require('path')

let mainWindow
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 360,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 须加上这行才能正常运行
    },
    icon: path.join(__dirname, './assets/images/clock.png'),
    titleBarStyle: 'hidden'
  })
  mainWindow.loadFile('./index.html')

  // BrowserWindow子窗口，可以打开多个
  // const child = new BrowserWindow({
  //   width: 150,
  //   height: 150,
  //   parent: mainWindow,
  // })
  // child.loadURL('https://baidu.com')
  // const child2 = new BrowserWindow({
  //   width: 150,
  //   height: 150,
  //   parent: mainWindow,
  // })
  // child2.loadURL('https://sina.com.cn')

  // BrowserView子窗口,只有一个可用
  // const view = new BrowserView()
  // mainWindow.setBrowserView(view)
  // view.setBounds({ x: 0, y: 0, width: 100, height: 100 })
  // view.webContents.loadURL('https://sina.com.cn')
  // view.webContents.openDevTools()
  // const view2 = new BrowserView()
  // mainWindow.setBrowserView(view2)
  // view2.setBounds({ x: 150, y: 0, width: 100, height: 100 })
  // view2.webContents.loadURL('https://baidu.com')
  // view2.webContents.openDevTools()
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
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, './assets/images/clock.png'));
  }
  handleIPC()
  createMainWindow()
})
