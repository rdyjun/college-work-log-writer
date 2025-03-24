const { contextBridge, ipcRenderer } = require("electron");

// API를 노출시킵니다
contextBridge.exposeInMainWorld("electronAPI", {
  clockIn: (id, pw, dataList) =>
    ipcRenderer.invoke("clock-in", id, pw, dataList),
});
