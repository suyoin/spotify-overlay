import { BrowserWindow } from "electron";
import querystring from "querystring";
import nodeUrl from "url";

const POSSIBLE_CHARACTERS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomString = (length: number) => {
	let text = "";

	for (let i = 0; i < length; i++) {
		text += POSSIBLE_CHARACTERS.charAt(
			Math.floor(Math.random() * POSSIBLE_CHARACTERS.length)
		);
	}
	return text;
};

export const getAuthorizationCode = (
	authUrl: string,
	clientId: string,
	options?: { redirectUri?: string; scope?: string; accessType?: string }
): Promise<string> => {
	options = options || {
		redirectUri: "https://spotify-overlay-site.vercel.app/",
	};

	if (!options.redirectUri) {
		options.redirectUri = "https://spotify-overlay-site.vercel.app/";
	}

	const urlParams = {
		response_type: "code",
		redirect_uri: options.redirectUri,
		client_id: clientId,
		state: generateRandomString(16),
		scope: options.scope,
	};

	const url = `${authUrl}?${querystring.stringify(urlParams)}`;

	return new Promise((resolve, reject) => {
		const authWindow = new BrowserWindow({
			useContentSize: true,
		});
		authWindow.setMenu(null);
		authWindow.loadURL(url);
		authWindow.show();

		authWindow.once("closed", () => {
			reject(new Error("Window was closed by user."));
		});

		const onCallback = (url: string) => {
			const url_parts = new nodeUrl.URL(url);
			const query = url_parts.searchParams;

			const state = query.get("state");
			const code = query.get("code");
			const error = query.get("error");

			console.log(url, query);
			if (!state && !code && !error) {
				return;
			}

			if (error) {
				reject(error);

				authWindow.removeAllListeners("closed");
				setImmediate(() => {
					authWindow.close();
				});
			} else if (state !== urlParams.state) {
				reject(new Error("State mismatch"));

				authWindow.removeAllListeners("closed");
				setImmediate(() => {
					authWindow.close();
				});
			} else if (code) {
				resolve(code);

				authWindow.removeAllListeners("closed");
				setImmediate(() => {
					authWindow.close();
				});
			}
		};

		authWindow.webContents.on("will-navigate", (event, url) => {
			onCallback(url);
		});

		authWindow.webContents.on("will-redirect", (event, newUrl) => {
			onCallback(newUrl);
		});
	});
};
