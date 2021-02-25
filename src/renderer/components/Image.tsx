//Image component that remembers the previous image src given to transition
//https://github.com/khanglu/react-crossfade-image/blob/master/index.js

import React, { useEffect, useRef, useState } from "react";

const Image = (props: {
	src: string;
	containerStyle?: React.CSSProperties;
	imageStyle?: React.CSSProperties;
}): React.ReactElement => {
	const { src, containerStyle } = props;

	const timeout = useRef<NodeJS.Timeout>();

	const [topSrc, setTopSrc] = useState(src);
	const [bottomSrc, setBottomSrc] = useState(src);
	const [bottomOpacity, setBottomOpacity] = useState(0);

	useEffect(() => {
		if (topSrc !== src) {
			setBottomSrc(topSrc);
			setTopSrc(src);

			setBottomOpacity(0.99);

			if (timeout.current) {
				clearTimeout(timeout.current);
			}

			timeout.current = setTimeout(() => {
				setBottomOpacity(0);
				timeout.current = undefined;
			}, 20);
		}
	}, [src]);

	return (
		<div style={containerStyle}>
			{topSrc && (
				<img
					className="selectDisable"
					key={topSrc}
					src={topSrc}
					style={{
						position: "absolute",
						...props.imageStyle,
					}}
				/>
			)}
			{bottomSrc && topSrc !== bottomSrc && (
				<img
					className="selectDisable"
					key={bottomSrc}
					src={bottomSrc}
					style={{
						position: "absolute",
						...props.imageStyle,

						opacity: bottomOpacity,
						transition: `opacity 1s ease`,
					}}
				/>
			)}
		</div>
	);
};

export default Image;
