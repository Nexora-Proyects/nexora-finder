require("dotenv").config();
const { app, BrowserWindow, Notification, screen } = require("electron");
const path = require("path");
const RPC = require("discord-rpc");
const { autoUpdater } = require("electron-updater");

let win;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

const clientId = "1337657143482126346";
RPC.register(clientId);

const rpc = new RPC.Client({ transport: "ipc" });

rpc.on("ready", () => {
  rpc.setActivity({
    details: "Nexora Finder",
    state: "🌀 Best MC Finder",
    startTimestamp: new Date(),
    largeImageKey: "raw-photoroom",
    largeImageText: "Nexora Finder",
    instance: false,
    buttons: [
      {
        label: "Unirme al Discord",
        url: "https://discord.gg/bestfinder",
      },
      {
        label: "Comprar",
        url: "https://discord.gg/bestfinder",
      },
    ],
  });
});

rpc.login({ clientId }).catch(console.error);

autoUpdater.on("update-available", (info) => {
  const notification = new Notification({
    title: "Nueva Actualización Disponible",
    body: `Descargando la versión ${info.version}...`,
    icon: path.join(__dirname, "assets", "Logo.png"),
    silent: false,
  });
  notification.show();
});

autoUpdater.on("update-downloaded", () => {
  const notification = new Notification({
    title: "Actualización Lista",
    body: "La app se reiniciará para instalar la nueva versión.",
    icon: path.join(__dirname, "assets", "Logo.png"),
    silent: false,
  });
  notification.show();

  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 5000);
});

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width,
    height,
    icon: path.join(__dirname, "assets", "Logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.setMenu(null);
  win.loadFile("src/components/auth/login.html");
  win.maximize();
  win.show();

  win.on("unmaximize", () => {
    win.maximize();
  });
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdates();
});

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
