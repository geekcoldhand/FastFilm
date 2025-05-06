import React, { useRef, useState, useEffect } from "react";
import { Upload, RefreshCw, Palette, Layers, Lightbulb } from "lucide-react";
import { useControls } from "./hooks/create-controls-context";
import useActiveTab from "./hooks/use-active-tab";
import TabControlPanel from "./components/TabControlPanel";

type Tab = "color" | "texture" | "lighting";

function Main() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const { activeTabControl, openTab } = useActiveTab();
  const { controls } = useControls();
  const prevControlsRef = useRef(controls);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        imgRef.current = img;
        ctx.drawImage(img, 0, 0);
        applyFilter(ctx);
      };
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

    const applyFilter = (ctx: CanvasRenderingContext2D) => {
      if (!canvasRef.current || !imgRef.current) return;

      const { width, height } = canvasRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(imgRef.current, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      const tempFactor = controls.temperature / 100;
      const satFactor = 1 - controls.saturation / 100;
      const contrastFactor = 1 - controls.contrast / 200;
      const dimFactor = 1 - controls.dimming / 200;

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

      ctx.putImageData(imageData, 0, 0);

      if (controls.grain > 0) {
        const grainAmount = controls.grain / 100;
        for (let i = 0; i < (width * height) / 20; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const radius = Math.random() * 2 * grainAmount;
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
          const length = 30 + Math.random() * 5;
          const angle = Math.random() * Math.PI * 2;
          //const opacity = 0.05 + Math.random() * 0.1;
          const opacity = 0.3;
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

      setIsProcessing(false);
    };
  
    const downloadCanvas = () => {
      const canvas = canvasRef.current as HTMLCanvasElement;
      const dataURL = canvas.toDataURL("image/png");
    
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (isSafari) {
        window.open(dataURL, "_blank");
      } else {
        // Trigger download
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "my-image.png";
        link.click();
      }
    };

    useEffect(() => {
      if (!canvasRef.current || !imgRef.current) return;
      const changed =
        JSON.stringify(controls) !== JSON.stringify(prevControlsRef.current);
      if (changed) {
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        prevControlsRef.current = controls;
        setIsProcessing(true);
        applyFilter(ctx);
      }
    }, [controls]);

    return (
      <div
        className="flex flex-col items-center w-full"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <div
          className="shadow-lg border p-4 mb-10"
          style={{
            textAlign: "center",
            marginTop: "1rem",
            maxWidth: "24rem",
            width: "90%",
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
                onClick={() => fileInputRef.current?.click()}
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
              className="flex flex-col items-center"
              style={{ width: "21rem", margin: "0 auto" }}
            >
              {isProcessing && <RefreshCw className="animate-spin mb-2" />}
              <canvas
                ref={canvasRef}
                style={{ width: "100%", display: "block" }}
              />
              <button
                style={{ marginTop: "1rem" }}
                onClick={() => downloadCanvas()}
              >
                Download Image
              </button>
            </div>
          )}
        </div>

        <TabControlPanel open={activeTabControl as Tab} />

        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center z-40"
          style={{
            padding: "1rem 1rem 1.25rem",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center"
            style={{ padding: "0.25rem" }}
          >
            <Upload
              style={{
                width: "1.25rem",
                height: "1.25rem",
                marginBottom: "0.25rem",
              }}
            />
            <span style={{ fontSize: "0.75rem" }}>Upload</span>
          </button>
          {["color", "texture", "lighting"].map((tab) => (
            <button
              key={tab}
              className="flex flex-col items-center"
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
    );
  }

export default Main;
