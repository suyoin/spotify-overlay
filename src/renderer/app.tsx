import { ipcRenderer } from "electron";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { getCurrentlyPlaying } from "../util/spotifyOAuth2";
import Image from "./components/Image";
import "./index.css";

type ReturnType<T extends (...args: Array<any>) => any> = T extends (
	...args: Array<any>
) => infer R
	? R
	: any;

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

const InformationPanel = (): React.ReactElement => {
	const [
		currentlyPlaying,
		setCurrentlyPlaying,
	] = useState<SpotifyCurrentlyPlayingTrack>();
	const [loggedIn, setLoggedIn] = useState(false);
	const intervalHandle = useRef<NodeJS.Timeout>();

	const containerRef = useRef<HTMLDivElement>();

	useEffect(() => {
		let wX = 0;
		let wY = 0;
		let dragging = false;

		const mouseDownCallback = (ev: MouseEvent) => {
			wX = ev.pageX;
			wY = ev.pageY;
			dragging = true;
		};

		const mouseMoveCallback = (ev: MouseEvent) => {
			if (!dragging) {
				return;
			}

			ipcRenderer.send("drag-window", ev.screenX - wX, ev.screenY - wY);
		};

		const mouseUpCallback = () => {
			dragging = false;
		};

		containerRef.current.addEventListener("mousedown", mouseDownCallback);

		window.addEventListener("mousemove", mouseMoveCallback);

		window.addEventListener("mouseup", mouseUpCallback);

		return () => {
			if (window) {
				window.removeEventListener("mousemove", mouseMoveCallback);
				window.removeEventListener("mouseup", mouseUpCallback);
			}

			if (containerRef.current) {
				containerRef.current.removeEventListener(
					"mousedown",
					mouseDownCallback
				);
			}
		};
	}, []);

	useEffect(() => {
		ipcRenderer.on(
			"currently-playing",
			(
				evt,
				newCurrentlyPlaying: ThenArg<ReturnType<typeof getCurrentlyPlaying>>
			) => {
				switch (newCurrentlyPlaying.response_type) {
					case "new": {
						setCurrentlyPlaying(newCurrentlyPlaying);
						break;
					}
					case "same_track": {
						setCurrentlyPlaying({
							...currentlyPlaying,
							progress_ms: newCurrentlyPlaying.progress_ms,
						});
						break;
					}
				}
			}
		);

		ipcRenderer.on("login-status-changed", (evt, isLoggedIn: boolean) => {
			setLoggedIn(isLoggedIn);
		});
		ipcRenderer.send("get-login-status");

		return () => {
			ipcRenderer.removeAllListeners("currently-playing");
			ipcRenderer.removeAllListeners("login-status-changed");
		};
	}, []);

	useEffect(() => {
		if (intervalHandle.current) {
			clearInterval(intervalHandle.current);
			intervalHandle.current = null;
		}

		if (loggedIn) {
			console.log("Starting fetch interval");
			let secondsElapsed = 4;
			const effect = () => {
				secondsElapsed += 1;

				if (secondsElapsed >= 4) {
					secondsElapsed = 0;
					ipcRenderer.send("get-currently-playing");
				} else {
					setCurrentlyPlaying((current) => {
						if (!current || !current.is_playing) {
							return current;
						}

						return { ...current, progress_ms: current.progress_ms + 1000 };
					});
				}
			};

			intervalHandle.current = setInterval(effect, 1000);

			effect();
		}

		return () => {
			if (intervalHandle.current) {
				clearInterval(intervalHandle.current);
				intervalHandle.current = null;
			}
		};
	}, [loggedIn]);

	if (!loggedIn) {
		return (
			<div
				style={{
					position: "absolute",
					right: 0,
					top: 0,

					width: "100%",
					height: "100%",
					borderRadius: ".375rem",
					overflow: "hidden",
					overflowX: "hidden",
					overflowY: "hidden",
				}}
			>
				<Image
					src={`url('static://ocean.jpg')`}
					containerStyle={{
						width: "100vw",
						height: "100vh",
					}}
					imageStyle={{
						position: "absolute",
						height: "100%",
						width: "100%",
						objectFit: "cover",
					}}
				/>
				<div
					ref={containerRef}
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",

						width: "100%",
						height: "100%",

						overflow: "hidden",

						boxSizing: "border-box",

						backgroundImage:
							"linear-gradient(to right, rgba(17,24,39,0.8), rgba(17,24,39,0.8)",
					}}
				>
					<p
						style={{
							marginBottom: "0.25rem",

							backgroundSize: "100%",

							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							color: "rgba(98,195,98,1)",

							lineHeight: "1.75rem",
							fontSize: "1.125rem",
							fontWeight: 700,

							boxSizing: "border-box",
						}}
					>
						not connected
					</p>
					<button
						onClick={() => {
							ipcRenderer.send("login");
						}}
						style={{
							background: "transparent",
							border: "1px solid",
							padding: "6px",
							borderRadius: "0.3rem",

							backgroundSize: "100%",

							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							color: "rgba(98,225,98,1)",

							lineHeight: "1.5rem",
							fontSize: "1rem",
							fontWeight: 400,

							transition: "all 0.5s ease-out",
						}}
					>
						authenticate
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				position: "absolute",
				right: 0,
				top: 0,

				width: "100%",
				height: "100%",
				borderRadius: ".375rem",
				overflow: "hidden",
				overflowX: "hidden",
				overflowY: "hidden",
			}}
		>
			<Image
				src={
					currentlyPlaying?.item?.album?.images[0]?.url ||
					`url('static://ocean.png')`
				}
				containerStyle={{
					width: "100vw",
					height: "100vh",
				}}
				imageClass={
					currentlyPlaying?.is_playing ? `normal-img` : `grayscale-img`
				}
				imageStyle={{
					position: "absolute",
					height: "100%",
					width: "100%",
					objectFit: "cover",
				}}
			/>
			<div
				ref={containerRef}
				style={{
					position: "absolute",
					left: 0,
					top: 0,
					display: "flex",
					justifyContent: "flex-start",
					alignItems: "center",

					width: "100%",
					height: "100%",

					overflow: "hidden",

					boxSizing: "border-box",

					backgroundImage:
						"linear-gradient(to right, rgba(17,24,39,1), rgba(17,24,39,0.7) 50%, transparent, rgba(17,24,39,0))",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",

						boxSizing: "border-box",
						paddingBottom: ".25rem",
						marginLeft: "1rem",
					}}
				>
					<p
						style={{
							marginBottom: "-1rem",

							backgroundSize: "100%",
							WebkitTextFillColor: "transparent",
							WebkitFontSmoothing: "antialiased",
							WebkitBackgroundClip: "text",

							backgroundImage:
								"linear-gradient(90deg,#fff 10rem,transparent 11rem)",

							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							color: "rgba(255,255,255,1)",

							lineHeight: "1.75rem",
							fontSize: "1.125rem",
							fontWeight: 800,

							boxSizing: "border-box",
						}}
					>
						{currentlyPlaying?.item?.name || "ad break"}
					</p>
					<p
						style={{
							backgroundSize: "100%",
							WebkitTextFillColor: "transparent",
							WebkitFontSmoothing: "antialiased",
							WebkitBackgroundClip: "text",

							backgroundImage:
								"linear-gradient(90deg, #fff 10rem, transparent 11rem)",

							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							color: "rgba(255,255,255,1)",

							lineHeight: "1.5rem",
							fontSize: "1rem",
							fontWeight: 700,
						}}
					>
						{currentlyPlaying?.item
							? currentlyPlaying.item.artists.map((v) => v.name).join(", ")
							: ""}
					</p>
				</div>
				<div
					style={{
						position: "absolute",
						width: `${
							((currentlyPlaying?.progress_ms || 0) /
								(currentlyPlaying?.item?.duration_ms || 1)) *
							100
						}%`,
						height: "0.4rem",
						bottom: 0,

						backgroundColor: "rgba(98,205,98,1)",
					}}
				/>
			</div>
		</div>
	);
};

ReactDOM.render(<InformationPanel />, document.getElementById("root"));
