import type { Metadata } from "next"
import ImageResizerClient from "./client"

export const metadata: Metadata = {
  title: "Free Image Resizer Online - Resize Image to Any Size | ToolHive",
  description:
    "Resize images online for free. Set custom width and height, maintain aspect ratio, resize for Instagram, Facebook, YouTube and more. JPG, PNG, WebP supported. No signup required.",
  keywords: [
    "image resizer",
    "resize image online",
    "change image size",
    "resize photo free",
    "image dimensions changer",
    "resize for instagram",
  ],
  openGraph: {
    title: "Free Image Resizer Online - Resize Image to Any Size | ToolHive",
    description:
      "Resize images online for free. Set custom width and height, maintain aspect ratio, resize for social media, print & more.",
  },
}

export default function ImageResizerPage() {
  return <ImageResizerClient />
}
