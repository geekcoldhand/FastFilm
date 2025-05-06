"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../components/lib/utils";

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		style={{
			position: "relative",
			display: "flex",
			alignItems: "center",
			width: "100%",
			height: "32px", // enough space for thumb
		}}
		{...props}
	>
		<SliderPrimitive.Track
			style={{
				position: "relative",
				height: "8px",
				width: "100%",
				flexGrow: 1,
				overflow: "hidden",
				borderRadius: "9999px",
				backgroundColor: "#e5e7eb", // matches Tailwind `bg-secondary`
			}}
		>
			<SliderPrimitive.Range
				style={{
					position: "absolute",
					height: "100%",
					backgroundColor: "#3b82f6", // Tailwind `bg-primary`
				}}
			/>
		</SliderPrimitive.Track>
		<SliderPrimitive.Thumb
			style={{
				display: "block",
				width: "20px",
				height: "20px",
				borderRadius: "9999px",
				border: "2px solid #3b82f6", // Tailwind `border-primary`
				backgroundColor: "#ffffff", // Tailwind `bg-background`
				boxSizing: "border-box",
				transition: "background-color 0.2s ease",
				outline: "none",
				boxShadow: "0 0 0 2px transparent",
      }}
      onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #3b82f6'}
      onBlur={(e) => e.target.style.boxShadow = '0 0 0 2px transparent'}
		/>
	</SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
