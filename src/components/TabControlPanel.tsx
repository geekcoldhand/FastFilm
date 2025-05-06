import React from "react";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import useActiveTab from "../hooks/use-active-tab";
import { Palette, Layers, Lightbulb } from "lucide-react";
import { useControls } from "../hooks/create-controls-context";

type Tab = "color" | "texture" | "lighting";
export default function TabControlPanel({ open }: { open: Tab }) {
	

	//const { activeTabControl, openTab, isTabOpen, closeTab } = useActiveTab();
	const { controls, setControl } = useControls();

	const handleControlChange = (
		name: keyof typeof controls,
		value: number[]
	) => {
		setControl({
			[name]: value[0],
		});
	};

	const handleReset = () => {
		setControl({
			temperature: 30,
			shadowBlue: 20,
			saturation: 30,
			contrast: 40,
			grain: 60,
			dust: 40,
			blur: 20,
			dimming: 25,
			leakIntensity: 35,
		});
	};

	return (
		<div className="fixed bottom-[79px] left-0 right-0 z-30 bg-white border-t border-b border-gray-200 p-4">
			{open === "color" && (
				<div className="space-y-6">
					<div>
						<div className="flex justify-between mb-2">
							<Label htmlFor="temperature">Cool Temperature</Label>
							<span className="text-sm text-gray-500">
								{controls.temperature}%
							</span>
						</div>
						<Slider
							id="temperature"
							min={0}
							max={200}
							step={1}
							value={[controls.temperature]}
							onValueChange={(value) =>
								handleControlChange("temperature", value)
							}
							className="touch-none"
						/>
					</div>

					<div>
						<div className="flex justify-between mb-2">
							<Label htmlFor="shadowBlue">Blue Shadows</Label>
							<span className="text-sm text-gray-500">
								{controls.shadowBlue}%
							</span>
						</div>
						<Slider
							id="shadowBlue"
							min={0}
							max={200}
							step={1}
							value={[controls.shadowBlue]}
							onValueChange={(value) =>
								handleControlChange("shadowBlue", value)
							}
							className="touch-none"
						/>
					</div>

					<div>
						<div className="flex justify-between mb-2">
							<Label htmlFor="saturation">Desaturation</Label>
							<span className="text-sm text-gray-500">
								{controls.saturation}%
							</span>
						</div>
						<Slider
							id="saturation"
							min={0}
							max={100}
							step={1}
							value={[controls.saturation]}
							onValueChange={(value) =>
								handleControlChange("saturation", value)
							}
							className="touch-none"
						/>
					</div>

					<div>
						<div className="flex justify-between mb-2">
							<Label htmlFor="contrast">Reduced Contrast</Label>
							<span className="text-sm text-gray-500">
								{controls.contrast}%
							</span>
						</div>
						<Slider
							id="contrast"
							min={0}
							max={100}
							step={1}
							value={[controls.contrast]}
							onValueChange={(value) => handleControlChange("contrast", value)}
							className="touch-none"
						/>
					</div>
				</div>
			)}
			{open === "texture" && (
				<div>
					<div className="space-y-6">
						<div>
							<div className="flex justify-between mb-2">
								<Label htmlFor="grain">Film Grain</Label>
								<span className="text-sm text-gray-500">{controls.grain}%</span>
							</div>
							<Slider
								id="grain"
								min={0}
								max={130}
								step={1}
								value={[controls.grain]}
								onValueChange={(value) => handleControlChange("grain", value)}
								className="touch-none"
							/>
						</div>

						<div>
							<div className="flex justify-between mb-2">
								<Label htmlFor="dust">Dust Particles</Label>
								<span className="text-sm text-gray-500">{controls.dust}%</span>
							</div>
							<Slider
								id="dust"
								min={0}
								max={100}
								step={1}
								value={[controls.dust]}
								onValueChange={(value) => handleControlChange("dust", value)}
								className="touch-none"
							/>
						</div>

						<div>
							<div className="flex justify-between mb-2">
								<Label htmlFor="blur">Softness/Blur</Label>
								<span className="text-sm text-gray-500">{controls.blur}%</span>
							</div>
							<Slider
								id="blur"
								min={0}
								max={100}
								step={1}
								value={[controls.blur]}
								onValueChange={(value) => handleControlChange("blur", value)}
								className="touch-none"
							/>
						</div>
					</div>
				</div>
			)}
			{open === "lighting" && (
				<div>
					<div className="space-y-6">
						<div>
							<div className="flex justify-between mb-2">
								<Label htmlFor="dimming">Dim Lighting</Label>
								<span className="text-sm text-gray-500">
									{controls.dimming}%
								</span>
							</div>
							<Slider
								id="dimming"
								min={0}
								max={100}
								step={1}
								value={[controls.dimming]}
								onValueChange={(value) => handleControlChange("dimming", value)}
								className="touch-none"
							/>
						</div>

						<div>
							<div className="flex justify-between mb-2">
								<Label htmlFor="leakIntensity">Light Leak Intensity</Label>
								<span className="text-sm text-gray-500">
									{controls.leakIntensity}%
								</span>
							</div>
							<Slider
								id="leakIntensity"
								min={0}
								max={130}
								step={1}
								value={[controls.leakIntensity]}
								onValueChange={(value) =>
									handleControlChange("leakIntensity", value)
								}
								className="touch-none"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
