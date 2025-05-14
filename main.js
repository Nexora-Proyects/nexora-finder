require('dotenv').config();
const { app, BrowserWindow, Notification, shell } = require('electron'); 
const path = require('path');
const RPC = require("discord-rpc");
const axios = require('axios'); 
const semver = require('semver');

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
        url: "https://discord.gg/bestfinder"
      },
      {
        label: "Comprar",
        url: "https://discord.gg/bestfinder"
      }
    ]
  });
});

rpc.login({ clientId }).catch(console.error);

const currentVersion = '1.0.0';
const releaseAPIUrl = 'https://api.github.com/repos/Nexora-Proyects/Nexora-Finder/releases/latest'; 

function checkForUpdates() {
  app.setName("Nexora Finder");

  axios.get(releaseAPIUrl)
    .then(response => {
      const latestVersion = response.data.tag_name;

      if (semver.gt(latestVersion, currentVersion)) {

        const notification = new Notification({
          title: 'Nueva Actualización disponible',
          body: `Versión ${latestVersion} disponible en GitHub.`,
          icon: path.join(__dirname, 'assets', 'Logo.png'),
          silent: false
        });

        notification.onclick = () => {
          shell.openExternal('https://github.com/Nexora-Proyects/Nexora-Finder');
        };

        notification.show();
      } else {
    }
  });
}

app.whenReady().then(() => {
  checkForUpdates(); 
  createWindow();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    resizable: true,
    movable: false,
    icon: path.join(__dirname, 'assets', 'Logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.setMenu(null);
  win.loadFile('src/components/auth/login.html');
  win.maximize();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
