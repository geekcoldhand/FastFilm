import React, { use, useRef, useState } from "react";
import { Upload, RefreshCw, Palette, Layers, Lightbulb } from "lucide-react";
import { useControls } from "./hooks/create-controls-context";
import useActiveTab from "./hooks/use-active-tab";
import TabControlPanel from "./components/TabControlPanel";

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
  
  type Tab = "color" | "texture" | "lighting";


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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
    
    <TabControlPanel open={activeTabControl as Tab } />
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-around items-center z-40">
      <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-2">
        <Upload className="h-5 w-5 mb-1" />
        <span className="text-xs">Upload</span>
      </button>
      {["color", "texture", "lighting"].map((tab) => (
        <button
          key={tab}
          className="flex flex-col items-center justify-center p-2"
          onClick={() => openTab(tab === activeTabControl ? "color" : tab)}
        >
          {tab === "color" && <Palette className="h-5 w-5 mb-1" />}
          {tab === "texture" && <Layers className="h-5 w-5 mb-1" />}
          {tab === "lighting" && <Lightbulb className="h-5 w-5 mb-1" />}
          <span className="text-xs capitalize">{tab}</span>
        </button>
      ))}
    </div>
  </div>
    
	);
}

export default Main;
