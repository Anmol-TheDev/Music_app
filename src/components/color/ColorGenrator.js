import ColorThief from "colorthief";

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export function getImageColors(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    const colorThief = new ColorThief();

    img.onload = () => {
      try {
        const palette = colorThief.getPalette(img, 2);
        const dominantColor = rgbToHex(palette[0][0], palette[0][1], palette[0][2]);
        const averageColor = rgbToHex(palette[1][0], palette[1][1], palette[1][2]);
        resolve({ averageColor, dominantColor });
      } catch (e) {
        console.error("Error extracting colors:", e);
        reject(new Error("Failed to extract colors from image"));
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
}
