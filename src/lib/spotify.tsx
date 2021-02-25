import React, { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

const SpotifyContext = createContext(null);

const getCurrentPlayback = async (
	refreshToken: string,
	currentlyPlayingId: string
) => {
	try {
		const res = await axios({
			method: "get",
			url: "https://spotify-stream-overlay.vercel.app/api/playing",
			params: {
				refresh_token: refreshToken,
				currently_playing_id: currentlyPlayingId,
			},
		});

		return res.data;
	} catch (err) {
		console.error(err);
		return;
	}
};

const getData = async (refreshToken: string, currentlyPlayingId: string) => {
	console.log("Getting Spotify data...");
	const currentlyPlaying = await getCurrentPlayback(
		refreshToken,
		currentlyPlayingId
	);

	return currentlyPlaying;
};

const SpotifyProvider = (props: { children: React.ReactNode }) => {
	const [spotifyData, setSpotifyData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [refreshToken, setRefreshToken] = useState("");

	const intervalHandle = useRef<NodeJS.Timeout>();
	//const timeoutHandle = useRef<any>();

	useEffect(() => {
		if (intervalHandle.current) {
			clearInterval(intervalHandle.current);
			intervalHandle.current = null;
		}

		//if (timeoutHandle.current) {
		//	clearTimeout(timeoutHandle.current);
		//	timeoutHandle.current = null;
		//}

		if (refreshToken) {
			console.log("Starting fetch interval");
			const effect = async () => {
				if (!spotifyData) {
					setLoading(true);
				}

				const currentlyPlaying = await getData(
					refreshToken,
					spotifyData?.item?.id
				);

				if (currentlyPlaying === undefined) {
					console.log("Try to reconnect");
				}

				if (currentlyPlaying !== "Same track") {
					setSpotifyData(currentlyPlaying);
				}

				if (loading) {
					setLoading(false);
				}
			};

			intervalHandle.current = setInterval(effect, 3000);

			effect();
		}

		return () => {
			if (intervalHandle.current) {
				clearInterval(intervalHandle.current);
				intervalHandle.current = null;
			}
		};
	}, [refreshToken]);

	return (
		<SpotifyContext.Provider
			value={{
				refreshToken,
				setRefreshToken,
				spotifyData,
				loading,
			}}
		>
			{props.children}
		</SpotifyContext.Provider>
	);
};

const SpotifyConsumer = SpotifyContext.Consumer;
export { SpotifyProvider, SpotifyConsumer, SpotifyContext };
