import axios from "axios";

export const oauth2Callback = async (code: string): Promise<string> => {
	const response = await axios({
		method: "GET",
		url: "https://spotify-overlay-site.vercel.app/api/callback",
		params: {
			code: code,
		},
	});

	return response.data as string;
};

export const getCurrentlyPlaying = async (
	refresh_token: string,
	currently_playing_id: string
): Promise<SpotifyProgressUpdate | SpotifyCurrentlyPlayingTrack> => {
	const response = await axios({
		method: "GET",
		url: "https://spotify-overlay-site.vercel.app/api/currentlyPlaying",
		params: {
			refresh_token,
			currently_playing_id,
		},
	});

	return response.data;
};
