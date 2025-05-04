
import React, { createContext, useContext, useState } from "react";

type Controls = {
  temperature: number;
  shadowBlue: number;
  saturation: number;
  contrast: number;
  grain: number;
  dust: number;
  blur: number;
  dimming: number;
  leakIntensity: number;
};

const defaultControls: Controls = {
  temperature: 30,
  shadowBlue: 20,
  saturation: 70,
  contrast: 40,
  grain: 60,
  dust: 40,
  blur: 20,
  dimming: 25,
  leakIntensity: 35,
};

const ControlsContext = createContext<{
  controls: Controls;
  setControl: (controls: Partial<Controls>) => void;
  resetControls: () => void;
} | null>(null);

export const ControlsProvider = ({ children }: { children: React.ReactNode }) => {
  const [controls, setControls] = useState<Controls>(defaultControls);

  const setControl = (controls: Partial<Controls>) => {
    setControls((prev) => ({ ...prev, ...controls }));
  };

  const resetControls = () => {
    setControls(defaultControls);
  };

  return (
    <ControlsContext.Provider value={{ controls, setControl, resetControls }}>
      {children}
    </ControlsContext.Provider>
  );
};

export const useControls = () => {
  const context = useContext(ControlsContext);
  if (!context) {
    throw new Error("useControls must be used within a ControlsProvider");
  }
  return context;
};
