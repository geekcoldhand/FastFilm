import React, { use, useRef, useState } from "react";
import { RefreshCw, Upload } from "lucide-react";
import { useControls } from "./hooks/create-controls-context";
import useActiveTab from "./hooks/use-active-tab";

function Main() {
	const [image, setImage] = useState<string | null>(null);
	const [filteredImage, setFilteredImage] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const imgRef = useRef<HTMLImageElement | null>(null);

	const { activeTabControl, openTab } = useActiveTab();
	const { controls, setControl } = useControls();
	const prevControlsRef = useRef(controls);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			if (reader.result) {
				setImage(reader.result as string);

				const img = new Image();
				img.crossOrigin = "anonymous";
				img.src = reader.result as string;
				img.onload = () => {
					imgRef.current = img;
					applyFilter();
				};
			}
		};
		reader.readAsDataURL(file);
	};

	const applyFilter = () => {
		// TODO
	};
	return (
		<div>
			<div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
				<h1>Fast Film Filter</h1>

				<div>
					{!image ? (
						<div style={{ textAlign: "center" , display: "flex", flexDirection: "column", alignItems: "center"}}>
							<Upload />
							<h3>Upload a photo</h3>
							<p>PNG, JPG, WEBP up to 10MB</p>
							<div style={{ display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
								<button onClick={() => fileInputRef.current?.click()}>
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
						</div>
					) : (
						<div style={{ display: "flex", flexDirection: "column" , alignItems: "center", justifyContent: "space-around"}}>
							{isProcessing && (
								<div>
									<RefreshCw />
								</div>
							)}
							<img src={filteredImage || image} alt="Filtered" style={{ maxWidth: "22rem" }}/>
							<div>
								<button onClick={() => fileInputRef.current?.click()}>
									Change Image
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
			<canvas></canvas>
		</div>
	);
}

export default Main;
