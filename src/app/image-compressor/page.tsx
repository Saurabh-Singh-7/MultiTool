import type { Metadata } from "next"
import ImageCompressorClient from "./client"

export const metadata: Metadata = {
  title: "Free Image Compressor Online - Reduce Image Size Without Losing Quality",
  description:
    "Compress JPG, PNG, WebP images online for free. Reduce file size up to 90% without visible quality loss. No upload limit. Works in browser.",
  keywords: [
    "image compressor",
    "compress image online",
    "reduce image size",
    "jpg compressor",
    "png compressor",
  ],
  openGraph: {
    title: "Free Image Compressor Online - ToolHive",
    description:
      "Compress JPG, PNG, WebP images online for free. Reduce file size up to 90% without visible quality loss.",
  },
}

export default function ImageCompressorPage() {
  return <ImageCompressorClient />
}
