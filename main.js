const { app, BrowserWindow, ipcMain } = require("electron");
const { clockIn } = require("./module/auto.js");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "module/preload.js"),
    },
  });

  win.loadFile("index.html");
}

ipcMain.handle("clock-in", async (event, id, pw, dataList) => {
  try {
    await clockIn(id, pw, dataList);
    return { success: true };
  } catch (error) {
    console.error("Clock-in error:", error);
    throw error;
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
