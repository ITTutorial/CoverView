import React, { useContext, useState, useRef } from "react";
import "./CoverImage.css";
import { ImgContext } from "../utils/ImgContext";
import unsplash from "../utils/unsplashConfig";
import domtoimage from "dom-to-image";

const ComponentToImg = (props) => {
	const [loading, setLoading] = useState(false);
	const [copying, setCopying] = useState(false);
	const { unsplashImage } = useContext(ImgContext);
	const componentRef = useRef();

	// 等待所有图片加载完成
	const waitForImages = async (element) => {
		const images = element.getElementsByTagName('img');
		if (images.length === 0) return;

		await Promise.all(Array.from(images).map(img => {
			if (img.complete) return Promise.resolve();
			return new Promise((resolve, reject) => {
				img.onload = resolve;
				img.onerror = reject;
			});
		}));
	};

	async function saveImage(data) {
		var a = document.createElement("A");
		a.href = data;
		a.download = `cover.png`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	const generateImage = async () => {
		const element = componentRef.current;
		if (!element) {
			throw new Error('Component not found');
		}

		// 等待所有图片加载完成
		try {
			await waitForImages(element);
		} catch (err) {
			console.error('Image loading failed:', err);
			throw new Error('图片资源加载失败，请刷新页面重试');
		}

		try {
			return await domtoimage.toPng(element, {
				height: element.offsetHeight * 2,
				width: element.offsetWidth * 2,
				style: {
					transform: "scale(" + 2 + ")",
					transformOrigin: "top left",
					width: element.offsetWidth + "px",
					height: element.offsetHeight + "px"
				},
				imagePlaceholder: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
			});
		} catch (err) {
			console.error('Failed to generate image:', err);
			throw new Error('生成图片失败，请重试');
		}
	};

	const downloadImage = async () => {
		if (loading) return;
		setLoading(true);
		try {
			const data = await generateImage();
			await saveImage(data);
			if (unsplashImage && unsplashImage.downloadLink) {
				try {
					await unsplash.photos.trackDownload({ 
						downloadLocation: unsplashImage.downloadLink 
					});
				} catch (err) {
					console.error('Failed to track download:', err);
				}
			}
		} catch (err) {
			console.error('Failed to download:', err);
			alert(err.message || "下载失败，请稍后重试");
		} finally {
			setLoading(false);
		}
	};

	const copyImage = async () => {
		if (copying) return;
		setCopying(true);
		try {
			if (!navigator.clipboard || !window.ClipboardItem) {
				throw new Error('您的浏览器不支持复制功能，请使用下载按钮');
			}

			const data = await generateImage();
			const response = await fetch(data);
			const blob = await response.blob();
			
			const item = new window.ClipboardItem({ "image/png": blob });
			await navigator.clipboard.write([item]);
			
			// 短暂显示成功状态
			setTimeout(() => setCopying(false), 1000);
		} catch (err) {
			console.error('Failed to copy:', err);
			alert(err.message || "复制失败，请使用下载按钮");
			setCopying(false);
		}
	};

	return (
		<React.Fragment>
			<div ref={componentRef}>{props.children}</div>
			<div className="flex gap-2 m-4">
				<button
					className="border p-2 bg-gray-700 hover:bg-gray-800 flex items-center text-white text-xl rounded-lg px-4"
					onClick={downloadImage}
					disabled={loading}>
					<span>
						{loading ?
							<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white animate animate-spin" fill="currentColor" width="24" height="24" viewBox="0 0 24 24" ><path d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"></path></svg>
							:
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
						}
					</span>
					<span className="mx-2">下载</span>
				</button>

				<button
					className="border p-2 bg-gray-700 hover:bg-gray-800 flex items-center text-white text-xl rounded-lg px-4"
					onClick={copyImage}
					disabled={copying}>
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
					<span className="mx-2">复制</span>
				</button>
			</div>
		</React.Fragment>
	);
}

export default ComponentToImg;
