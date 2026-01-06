const { ElectronEgg } = require('ee-core')
const { Lifecycle } = require('./preload/lifecycle')
const { preload } = require('./preload')
const { session, Menu } = require('electron')

// new app
const app = new ElectronEgg()

Menu.setApplicationMenu(null)

// register lifecycle
const life = new Lifecycle()
app.register('ready', life.ready)
app.register('electron-app-ready', life.electronAppReady)
app.register('window-ready', life.windowReady)
app.register('before-close', life.beforeClose)

// register preload
app.register('preload', preload)

// run
app.run()
