import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import getStaticPath from "../util/getStaticPath";

export let currentTray: Tray;

app.once("quit", () => {
	if (currentTray) {
		currentTray.destroy();
	}
});

export const InitiateTrayController = (
	currentWindow: BrowserWindow,
	logoutCallback: () => void
): Tray => {
	if (currentTray) {
		return currentTray;
	}

	currentTray = new Tray(
		nativeImage.createFromPath(getStaticPath("static/bald.png"))
	);
	currentTray.setToolTip(app.name);

	currentTray.on("click", () => {
		currentWindow.show();
	});

	currentTray.setContextMenu(
		Menu.buildFromTemplate([
			{
				label: "spotify overlay",
				enabled: false,
			},
			{ type: "separator" },
			{
				label: "Logout",
				click: () => {
					logoutCallback();
				},
			},
			{
				label: "Exit",
				click: () => {
					currentWindow.close();
				},
			},
		])
	);

	return currentTray;
};
