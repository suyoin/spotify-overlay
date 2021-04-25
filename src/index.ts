import { app, BrowserWindow, ipcMain, screen, session } from "electron";
import { AUTHORIZE_URL, CLIENT_ID, SCOPE } from "./constant";
import { InitiateTrayController } from "./controllers/trayController";
import { getAuthorizationCode } from "./util/oauth2";
import { getCurrentlyPlaying, oauth2Callback } from "./util/spotifyOAuth2";
import { join } from "path";
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	// eslint-disable-line global-require
	app.quit();
}

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
	app.quit();
} else {
	let refreshToken: string | undefined;

	const createWindow = (): void => {
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
			focusable: false,
			alwaysOnTop: true,
			//resizable: false,
			x: padding,
			y: display.workArea.height - windowHeight - padding,

			webPreferences: {
				nodeIntegration: true,
			},
		});

		InitiateTrayController(mainWindow, () => {
			refreshToken = undefined;
			mainWindow.webContents.send("login-status-changed", false);
		});

		mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
		mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
		mainWindow.setFullScreenable(false);

		mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

		mainWindow.webContents.session.clearStorageData({});

		ipcMain.on("login", (evt) => {
			getAuthorizationCode(AUTHORIZE_URL, CLIENT_ID, { scope: SCOPE })
				.then(async (authCode) => {
					refreshToken = await oauth2Callback(authCode);

					evt.reply("login-status-changed", true);
				})
				.catch((err) => {
					console.error(err);

					evt.reply("login-status-changed", false);
				});
		});

		ipcMain.on("get-login-status", (evt) => {
			evt.reply(
				"login-status-changed",
				refreshToken !== undefined ? true : false
			);
		});

		ipcMain.on(
			"get-currently-playing",
			async (evt, currentlyPlayingId: string) => {
				if (!refreshToken) {
					const authCode = await getAuthorizationCode(
						AUTHORIZE_URL,
						CLIENT_ID,
						{ scope: SCOPE }
					);
					refreshToken = await oauth2Callback(authCode);
				}

				evt.reply(
					"currently-playing",
					await getCurrentlyPlaying(refreshToken, currentlyPlayingId)
				);
			}
		);
	};

	app.setAppUserModelId("suyoin.spotify-overlay");
	app.setName("spotify-overlay");
	app.whenReady().then(() => {
		session.defaultSession.protocol.registerFileProtocol(
			"static",
			(request, callback) => {
				const fileUrl = request.url.replace("static://", "static/");
				const filePath = join(app.getAppPath(), ".webpack/renderer", fileUrl);
				callback(filePath);
			}
		);

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
