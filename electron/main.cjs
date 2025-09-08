const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron')
const path = require('path')
const os = require('os')

// The built directory structure
//
// ├─┬ dist
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── assets
// │ └── ...

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win = null

// 🚧 Use ['ENVIRONMENT'] to avoid errors when building with electron-builder
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'default',
    show: false,
  })

  // 简单的菜单（可选）
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // 总是加载本地构建的文件
  const indexPath = path.join(__dirname, '../dist/index.html')
  console.log('Loading from:', indexPath)
  
  // 检查文件是否存在
  const fs = require('fs')
  if (fs.existsSync(indexPath)) {
    // 加载文件并设置正确的 base path
    win.loadFile(indexPath, {
      hash: '',
      search: '',
    })
    
    // 等待页面加载完成后检查资源
    win.webContents.on('did-fail-load', (event, errorCode, errorDesc, validatedURL) => {
      console.error('Failed to load:', validatedURL, errorDesc)
    })
    
    win.webContents.on('dom-ready', () => {
      console.log('DOM is ready')
      // 在开发者工具中检查控制台错误
      win.webContents.openDevTools()
    })
    
  } else {
    console.error('Index file not found:', indexPath)
    // 如果文件不存在，尝试加载开发服务器
    if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL)
    } else {
      win.loadURL('data:text/html,<h1>Application not built properly</h1><p>Please run <code>pnpm build</code> first</p>')
    }
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // 显示窗口
  win.once('ready-to-show', () => {
    win?.show()
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// 处理一些简单的 IPC 通信
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-platform', () => {
  return os.platform()
})