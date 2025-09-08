import pkg from 'electron'
const { contextBridge, ipcRenderer } = pkg

// Custom APIs for renderer
const electronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
}

// Use `contextBridge` APIs to expose Electron APIs to renderer
// only if context isolation is enabled, otherwise just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
}