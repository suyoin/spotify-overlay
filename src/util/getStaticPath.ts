import { app } from "electron";
import { join } from "path";

export default (filePath: string): string => {
	return app.isPackaged
		? join(app.getAppPath(), ".webpack/renderer", filePath)
		: join(app.getAppPath(), filePath);
};
