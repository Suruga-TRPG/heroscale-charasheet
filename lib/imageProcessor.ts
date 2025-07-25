export async function convertToRasterizedWatermarkedImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("ctx error");

        // 元画像描画
        ctx.drawImage(img, 0, 0);

        // ウォーターマーク用設定
        const fontSize = Math.floor(img.width / 30); // 小さめ
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const text = "Hero Scale CS Storage";
        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize;

        // 回転のために原点を中央に
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((-45 * Math.PI) / 180); // 右上がりに-45度回転

        // ウォーターマークを繰り返し描画（斜めの軸に従ってタイル状に）
        for (let y = -canvas.height; y < canvas.height * 1.5; y += textHeight * 3) {
          for (let x = -canvas.width; x < canvas.width * 1.5; x += textWidth * 1.3) {
            ctx.fillText(text, x, y);
          }
        }

        ctx.restore(); // 回転を元に戻す

        // PNGに変換
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Blob生成失敗");
        }, "image/png");
      };

      if (typeof reader.result === "string") {
        img.src = reader.result;
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
