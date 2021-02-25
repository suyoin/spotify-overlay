import { app, BrowserWindow, screen, session } from "electron";
import { InitiateTrayController } from "./controllers/trayController";
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

const requestFilters = {
	urls: ["http://localhost:3000/api/callback*"],
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	// eslint-disable-line global-require
	app.quit();
}

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
	app.quit();
} else {
	const createWindow = (): void => {
		// Create the browser window.
		const display = screen.getPrimaryDisplay();

		const windowWidth = 320;
		const windowHeight = 100;
		const padding = 5;

		const mainWindow = new BrowserWindow({
			width: windowWidth,
			height: windowHeight,

			skipTaskbar: true,
			transparent: true,
			frame: false,
			//focusable: false,
			alwaysOnTop: true,
			//resizable: false,
			x: padding,
			y: display.workArea.height - windowHeight - padding,

			webPreferences: {
				nodeIntegration: true,
			},
		});

		InitiateTrayController(mainWindow);

		mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
		mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
		mainWindow.setFullScreenable(false);

		session.defaultSession.webRequest.onBeforeRequest(
			requestFilters,
			(details, callback) => {
				const url = details.url;

				callback({
					cancel: false,
				});
			}
		);

		mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
	};

	app.setAppUserModelId("suyoin.spotify-overlay");
	app.setName("spotify-overlay");
	app.whenReady().then(() => {
		createWindow();
	});

	// Quit when all windows are closed, except on macOS. There, it's common
	// for applications and their menu bar to stay active until the user quits
	// explicitly with Cmd + Q.
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
}
