import React, { useContext, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { SpotifyContext, SpotifyProvider } from "../lib/spotify";
import Image from "./components/Image";
import "./index.css";

const InformationPanel = (): React.ReactElement => {
	const { refreshToken, setRefreshToken, spotifyData, loading } = useContext(
		SpotifyContext
	);

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

			window.moveTo(ev.screenX - wX, ev.screenY - wY);
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

	if (!refreshToken) {
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
					src={`https://i.ytimg.com/vi/yi_ppuOMgSc/hq720.jpg?sqp=-oaymwEcCOgCEMoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBuL67obI_2HCl00Fr9zWBjfP4XQQ`}
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
							color: "rgba(255,255,255,1)",

							lineHeight: "1.75rem",
							fontSize: "1.125rem",
							fontWeight: 700,

							boxSizing: "border-box",
						}}
					>
						not connected
					</p>
					<a
						href="https://google.com"
						style={{
							border: "1px solid",
							padding: "5px",
							borderRadius: "0.5rem",

							backgroundSize: "100%",

							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							color: "rgba(255,255,255,1)",

							lineHeight: "1.5rem",
							fontSize: "1rem",
							fontWeight: 700,
						}}
					>
						authenticate
					</a>
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
				src={`https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png`}
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
						titleasdasdasdasdasdsadadsadasdsadasdsadasdasdsadadasd
					</p>
					<p
						style={{
							marginTop: "-rem",

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
						author
					</p>
				</div>
			</div>
		</div>
	);
};

ReactDOM.render(
	<SpotifyProvider>
		<InformationPanel />
	</SpotifyProvider>,
	document.getElementById("root")
);
