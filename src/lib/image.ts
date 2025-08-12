export async function compressImage(file: File, maxSize = 1400, quality = 0.85): Promise<Blob> {
  // SVGs can be drawn to canvas inconsistently across engines and may taint the canvas.
  // For robustness in tests and prod, return a fresh Blob with the same bytes to avoid File subclass quirks in IDB.
  if (file.type === "image/svg+xml") {
    const buf = await file.arrayBuffer()
    return new Blob([buf], { type: file.type })
  }

  try {
    const img = await loadImageFromFile(file)
    const { w, h } = scaleToMax(img.width, img.height, maxSize)

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0, w, h)

    const mime = file.type === "image/png" ? "image/png" : "image/jpeg"
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), mime, quality)
    })
    return blob
  } catch (err) {
    // Fallback: if compression fails for any reason, return a fresh Blob with the original bytes.
    console.warn("compressImage failed, returning original file", err)
    const buf = await file.arrayBuffer()
    return new Blob([buf], { type: file.type })
  }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			const img = new Image()
			img.onload = () => resolve(img)
			img.onerror = reject
			img.src = reader.result as string
		}
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

function scaleToMax(w: number, h: number, max: number) {
	const ratio = Math.min(1, max / Math.max(w, h))
	return { w: Math.round(w * ratio), h: Math.round(h * ratio) }
}
