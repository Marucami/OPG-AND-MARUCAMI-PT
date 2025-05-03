import { app, BrowserWindow } from "electron"

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 720
  })

  // win.removeMenu()

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})