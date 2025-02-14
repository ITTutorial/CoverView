import React, { useContext, useState } from "react";
import "./CoverImage.css";
import { ImgContext } from "../utils/ImgContext";
import unsplash from "../utils/unsplashConfig";
import domtoimage from "dom-to-image";

const ComponentToImg = (props) => {
	const [loading, setLoading] = useState(false);
	const [copying, setCopying] = useState(false);
	const { unsplashImage } = useContext(ImgContext);
	const componentRef = React.createRef();

	async function saveImage(data) {
		var a = document.createElement("A");
		a.href = data;
		a.download = `cover.png`;
		document.body.appendChild(a);
		setLoading(false);

		a.click();
		document.body.removeChild(a);
	}

	const generateImage = async () => {
		const element = componentRef.current;
		return await domtoimage.toPng(element, {
			height: element.offsetHeight * 2,
			width: element.offsetWidth * 2,
			style: {
				transform: "scale(" + 2 + ")",
				transformOrigin: "top left",
				width: element.offsetWidth + "px",
				height: element.offsetHeight + "px",
			}
		});
	};

	const downloadImage = async () => {
		setLoading(true);
		try {
			const data = await generateImage();
			await saveImage(data);
			if (unsplashImage) {
				unsplash.photos.trackDownload({ downloadLocation: unsplashImage.downloadLink, });
			}
		} catch (err) {
			console.error('Failed to download:', err);
			alert("Failed to download image. Please try again.");
			setLoading(false);
		}
	};

	const copyImage = async () => {
		setCopying(true);
		try {
			if (!window.ClipboardItem) {
				alert("Your browser doesn't support direct image copying. Please use the Download button instead.");
				setCopying(false);
				return;
			}

			const data = await generateImage();
			// Convert base64 to blob
			const response = await fetch(data);
			const blob = await response.blob();
			
			const item = new window.ClipboardItem({ "image/png": blob });
			await navigator.clipboard.write([item]);
			// 短暂显示成功状态
			setTimeout(() => setCopying(false), 1000);
		} catch (err) {
			console.error('Failed to copy:', err);
			alert("Failed to copy image. Please use the Download button instead.");
			setCopying(false);
		}
	};

	return (
		<React.Fragment>
			<div ref={componentRef}>{props.children}</div>
			<div className="flex gap-2 m-4">
				<button
					className="border p-2 bg-gray-700 hover:bg-gray-800 flex items-center text-white text-xl rounded-lg px-4"
					onClick={() => downloadImage()}>
					<span>
						{loading ?
							<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white animate animate-spin" fill="currentColor" width="24" height="24" viewBox="0 0 24 24" ><path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path></svg>
							:
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
						}
					</span>
					<span className="mx-2">Download</span>
				</button>

				<button
					className="border p-2 bg-gray-700 hover:bg-gray-800 flex items-center text-white text-xl rounded-lg px-4"
					onClick={copyImage}>
					<span>
						{copying ?
							<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
							:
							<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
							</svg>
						}
					</span>
					<span className="mx-2">Copy</span>
				</button>
			</div>
		</React.Fragment>
	);
}

export default ComponentToImg;
