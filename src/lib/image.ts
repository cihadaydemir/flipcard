export async function compressImage(file: File, maxSize = 1400, quality = 0.85): Promise<Blob> {
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
