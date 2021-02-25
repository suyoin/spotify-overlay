import ElectronStore from "electron-store";

export interface ElectronStorage {
	refresh_token: string;
	spotify_auth_state: string;
}

export const settings = new ElectronStore({
	defaults: {} as ElectronStorage,
});

export const updateSetting = <TKey extends keyof ElectronStorage>(
	key: TKey,
	value: ElectronStorage[TKey]
): void => {
	settings.set(key, value);
};
