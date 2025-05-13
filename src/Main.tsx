import React, { useRef, useState, useEffect, useCallback } from "react";
import { Upload, RefreshCw, Palette, Layers, Lightbulb } from "lucide-react";
import { useControls } from "./hooks/create-controls-context";
import useActiveTab from "./hooks/use-active-tab";
import TabControlPanel from "./components/TabControlPanel";

type Tab = "color" | "texture" | "lighting";

function Main() {
	const [image, setImage] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [filteredImage, setFilteredImage] = useState<string | null>(null);

  	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const imgRef = useRef<HTMLImageElement | null>(null);
	const cacheRef = useRef<{
		baseImageData: ImageData | null;
		processedBaseImage: ImageData | null;
		controlsSnapshot: typeof controls | null;
		grainCache: string | null;
		dustCache: string | null;
		blurCache: string | null;
		leakCache: string | null;
	  }>({
		baseImageData: null,
		processedBaseImage: null,
		controlsSnapshot: null,
		grainCache: null,
		dustCache: null,
		blurCache: null,
		leakCache: null,
	  });
  
	const { activeTabControl, openTab } = useActiveTab();
	const { controls } = useControls();
	const prevControlsRef = useRef(controls);
	const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

	const createTempCanvas = (width: number, height: number): HTMLCanvasElement => {
		if (!tempCanvasRef.current) {
		  tempCanvasRef.current = document.createElement('canvas');
		}
		tempCanvasRef.current.width = width;
		tempCanvasRef.current.height = height;
		return tempCanvasRef.current;
	};
	const debounce = (func: Function, delay: number) => {
		let timeoutId: NodeJS.Timeout;
		return (...args: any[]) => {
		  clearTimeout(timeoutId);
		  timeoutId = setTimeout(() => func(...args), delay);
		};
	  };

	const shouldReprocessBase = (oldControls: typeof controls | null, newControls: typeof controls): boolean => {
		if (!oldControls) return true;
		
		return (
		  oldControls.temperature !== newControls.temperature ||
		  oldControls.saturation !== newControls.saturation ||
		  oldControls.contrast !== newControls.contrast ||
		  oldControls.dimming !== newControls.dimming ||
		  oldControls.shadowBlue !== newControls.shadowBlue
		);
	  };
	
	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsProcessing(true);
		const reader = new FileReader();
		 reader.onload = () => {
			const result = reader.result as string;
			setImage(result);

			const img = new Image();
			img.crossOrigin = "anonymous";
			img.src = result;
			img.onload = () => {
				const canvas = canvasRef.current;
				if (!canvas) return;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					setIsProcessing(false);
					return;
				}

				canvas.width = img.width;
				canvas.height = img.height;

				imgRef.current = img;
				ctx.drawImage(img, 0, 0);
				applyFilter(ctx);
			};
		
		};
		reader.readAsDataURL(file);
	};

	const applyFilter = (ctx: CanvasRenderingContext2D) => {
			if (!canvasRef.current || !imgRef.current) return;
		  
			const { width, height } = canvasRef.current;
			const cache = cacheRef.current;
			
			// Only reprocess pixel data if necessary controls have changed
			if (shouldReprocessBase(cache.controlsSnapshot, controls)) {
			  // Clear and draw the original image
			  ctx.clearRect(0, 0, width, height);
			  ctx.drawImage(imgRef.current, 0, 0, width, height);
			  
			  // Get image data for processing
			  let imageData = ctx.getImageData(0, 0, width, height);
			  
			  // Store original image data in cache if not already there
			  if (!cache.baseImageData) {
				cache.baseImageData = new ImageData(
				  new Uint8ClampedArray(imageData.data), 
				  imageData.width, 
				  imageData.height
				);
			  } else {
				// Reset to original image data to avoid compounding effects
				imageData = new ImageData(
				  new Uint8ClampedArray(cache.baseImageData.data),
				  cache.baseImageData.width,
				  cache.baseImageData.height
				);
			  }
			  
			  const data = imageData.data;
			  const tempFactor = controls.temperature / 100;
			  const satFactor = 1 - controls.saturation / 100;
			  const contrastFactor = 1 - controls.contrast / 200;
			  const dimFactor = 1 - controls.dimming / 200;
		  
			  // Your existing pixel processing loop
			  for (let i = 0; i < data.length; i += 4) {
				let r = data[i];
				let g = data[i + 1];
				let b = data[i + 2];
		  
				r = Math.max(0, r - tempFactor * 30);
				b = Math.min(255, b + tempFactor * 15);
		  
				if (r + g + b < 380) {
				  b = Math.min(255, b + controls.shadowBlue / 20);
				  g = Math.min(255, g + controls.shadowBlue / 40);
				}
		  
				const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
				r = r + satFactor * (luminance - r);
				g = g + satFactor * (luminance - g);
				b = b + satFactor * (luminance - b);
		  
				r = 128 + (r - 128) * contrastFactor;
				g = 128 + (g - 128) * contrastFactor;
				b = 128 + (b - 128) * contrastFactor;
		  
				r *= dimFactor;
				g *= dimFactor;
				b *= dimFactor;
		  
				data[i] = r;
				data[i + 1] = g;
				data[i + 2] = b;
			  }
			  
			  // Store processed base image in cache
			  cache.processedBaseImage = new ImageData(
				new Uint8ClampedArray(imageData.data),
				imageData.width,
				imageData.height
			  );
			  
			  // Update canvas with processed image
			  ctx.putImageData(imageData, 0, 0);
			} else if (cache.processedBaseImage) {
			  // Use cached base processed image
			  ctx.clearRect(0, 0, width, height);
			  ctx.putImageData(cache.processedBaseImage, 0, 0);
			}
		  
			// Keep the rest of your effects code unchanged for now
			if (controls.grain > 0) {
			  const grainAmount = controls.grain / 100;
			  const density = (width * height) / 5; // Increase number of particles
			  for (let i = 0; i < density * grainAmount; i++) {
				const x = Math.random() * width;
				const y = Math.random() * height;
				const radius = Math.random() * 0.5 + 0.3;
				const opacity = 0.1 + Math.random() * 0.2;
				ctx.fillStyle = `rgba(200, 200, 200, ${opacity})`;
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.fill();
			  }
			}
		  
			if (controls.dust > 0) {
			  const dustAmount = controls.dust;
			  for (let i = 0; i < dustAmount * 8; i++) {
				const x = Math.random() * width;
				const y = Math.random() * height;
				const length = 3 + Math.random() * 5;
				const angle = Math.random() * Math.PI * 2;
				const opacity = 0.2 + Math.random() * 0.1;
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
				ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
				ctx.lineWidth = 0.5;
				ctx.stroke();
			  }
			}
		  
			if (controls.blur > 0) {
			  const blurAmount = controls.blur / 100;
			  ctx.filter = `blur(${blurAmount * 3}px)`;
			  ctx.drawImage(canvasRef.current, 0, 0);
			  ctx.filter = "none";
			}
		  
			if (controls.leakIntensity > 0) {
			  ctx.globalCompositeOperation = "screen";
			  const leakAmount = controls.leakIntensity / 100;
		  
			  const leakColors = [
				{ color: `rgba(255, 80, 80, ${0.15 * leakAmount})`, x: 0, y: 0 },
				{
				  color: `rgba(255, 200, 100, ${0.1 * leakAmount})`,
				  x: width * 0.3,
				  y: height * 0.2,
				},
				{
				  color: `rgba(255, 100, 200, ${0.1 * leakAmount})`,
				  x: width * 0.7,
				  y: height * 0.4,
				},
			  ];
		  
			  leakColors.forEach(({ color, x, y }) => {
				const grad = ctx.createRadialGradient(x, y, 0, x, y, width / 2);
				grad.addColorStop(0, color);
				grad.addColorStop(1, "transparent");
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, width, height);
			  });
		  
			  ctx.globalCompositeOperation = "source-over";
			}
		  
			// Update the control snapshot after all processing
			cache.controlsSnapshot = { ...controls };
			
			setFilteredImage(canvasRef.current.toDataURL("image/png"));
			setIsProcessing(false);
	};

	const debouncedApplyFilter = useCallback(
		debounce((ctx: CanvasRenderingContext2D) => {
		  applyFilter(ctx);
		}, 200),
		[]
	);
	
	const downloadCanvas = () => {
		if (!filteredImage) return;

		const link = document.createElement("a");
		link.href = filteredImage;
		link.download = "my-image.png";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const resetImage = () => {
		setImage(null);
		setIsProcessing(false);
		setFilteredImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		if (imgRef.current) {
			imgRef.current = null;
		}
		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext("2d");
			if (ctx) {
				ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			}
		}
	};

	const handleUploadClick = () => {
		if (image) {
			resetImage();
		} else {
			if (fileInputRef.current) {
				fileInputRef.current.click();
			}
		}
	};
	useEffect(() => {
		if (!canvasRef.current || !imgRef.current) return;
		const changed =
			JSON.stringify(controls) !== JSON.stringify(prevControlsRef.current);
		if (changed) {
			const ctx = canvasRef.current.getContext("2d", { willReadFrequently: true });
			if (!ctx) return;

			prevControlsRef.current = controls;
			setIsProcessing(true);

			applyFilter(ctx);
		}
	},[controls, debouncedApplyFilter] );

	return (
		<div
	
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				width: "100%",
				height: "100%",
			}}
		>
			<div
		
				style={{
					textAlign: "center",
					marginTop: "1rem",
					maxWidth: "24rem",
					width: "100%",
				}}
			>
				<h1
					style={{
						fontWeight: "bold",
						fontSize: "1.25rem",
						marginBottom: "0.5rem",
					}}
				>
					Fast Film Filter
				</h1>

				{!image ? (
					<div style={{ margin: "1rem 0" }}>
						<Upload
							style={{
								width: "1.25rem",
								height: "1.25rem",
								margin: "0 auto 0.5rem",
							}}
						/>
						<h3>Upload a photo</h3>
						<p>PNG, JPG, WEBP up to 10MB</p>
						<button
							style={{ marginTop: "0.5rem" }}
							onClick={() => handleUploadClick()}
						>
							Select Image
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							style={{ display: "none" }}
							onChange={handleImageUpload}
						/>
					</div>
				) : (
					<div
					
						style={{ width: "21rem", margin: "0 auto" }}
					>
						{isProcessing && <RefreshCw className="animate-spin mb-2" />}
						{filteredImage && (
							<img
								src={filteredImage}
								alt="Filtered"
								style={{
									width: "100%",
									marginTop: "1rem",
									borderRadius: "0.25rem",
								}}
							/>
						)}
						<canvas ref={canvasRef} style={{ display: "none" }} />
						<button
							style={{ marginTop: "1rem" }}
							onClick={() => downloadCanvas()}
						>
							Download Image
						</button>
					</div>
				)}
			</div>

      <div
			
				style={{
					width: "100%",
					display: "flex",
					justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
					position: "fixed",
					bottom: "80px",
					left: "0",
					margin: "0 auto",
					zIndex: "30",
					backgroundColor: "white",
				}}
			>
				<TabControlPanel open={activeTabControl as Tab} />
				<div
					style={{
						width: "100%",
						display: "flex",
						justifyContent: "center",
						zIndex: "30",
						backgroundColor: "white",
					}}
				>
				<button
					onClick={() => handleUploadClick()}
				
					style={{ padding: "0.25rem" }}
				>
					<Upload
						style={{
							width: "1.25rem",
							height: "1.25rem",
							marginBottom: "0.25rem",
						}}
					/>
					<span style={{ fontSize: "0.75rem" }}>
						{image ? "Reset" : "Upload"}
					</span>
				</button>
				{["color", "texture", "lighting"].map((tab) => (
					<button
						key={tab}
						style={{ padding: "0.25rem" }}
						onClick={() => openTab(tab === activeTabControl ? "color" : tab)}
					>
						{tab === "color" && (
							<Palette
								style={{
									width: "1.25rem",
									height: "1.25rem",
									marginBottom: "0.25rem",
								}}
							/>
						)}
						{tab === "texture" && (
							<Layers
								style={{
									width: "1.25rem",
									height: "1.25rem",
									marginBottom: "0.25rem",
								}}
							/>
						)}
						{tab === "lighting" && (
							<Lightbulb
								style={{
									width: "1.25rem",
									height: "1.25rem",
									marginBottom: "0.25rem",
								}}
							/>
						)}
						<span style={{ fontSize: "0.75rem", textTransform: "capitalize" }}>
							{tab}
						</span>
          </button>
				))}
        </div>
			</div>
		</div>
	);
}

export default Main;
