function rgbToHex(r: number, g: number, b: number) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

export function getImageColors(
  imageUrl: string
): Promise<{ averageColor: string; dominantColor: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      canvas.width = (img as HTMLImageElement).width;
      canvas.height = (img as HTMLImageElement).height;
      ctx.drawImage(
        img as HTMLImageElement,
        0,
        0,
        (img as HTMLImageElement).width,
        (img as HTMLImageElement).height
      );
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r = 0,
        g = 0,
        b = 0;
      const colorMap: Record<string, number> = {};

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        const color = rgbToHex(data[i], data[i + 1], data[i + 2]);
        colorMap[color] = (colorMap[color] || 0) + 1;
      }

      const pixelCount = data.length / 4;
      const avgR = Math.floor(r / pixelCount);
      const avgG = Math.floor(g / pixelCount);
      const avgB = Math.floor(b / pixelCount);
      const averageColor = rgbToHex(avgR, avgG, avgB);
      const dominantColor = Object.keys(colorMap).reduce((a, b) =>
        colorMap[a] > colorMap[b] ? a : b
      );
      resolve({ averageColor, dominantColor });
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
}
