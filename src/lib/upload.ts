export interface UploadResult {
  url: string
  isLocal: boolean
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const secret = process.env.UPLOADTHING_SECRET
  const appId = process.env.UPLOADTHING_APP_ID

  if (!secret || !appId) {
    return fallbackUpload(file)
  }

  try {
    // Attempt real Uploadthing upload
    const { UTApi } = await import("uploadthing/server")
    const utapi = new UTApi()
    const response = await utapi.uploadFiles(file)

    if (response.error || !response.data?.url) {
      return fallbackUpload(file)
    }

    return { url: response.data.url, isLocal: false }
  } catch {
    console.warn("Uploadthing unavailable — using local fallback")
    return fallbackUpload(file)
  }
}

async function fallbackUpload(file: File): Promise<UploadResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const mockUrl = `uploads/mock-${Date.now()}-${file.name}`
      resolve({ url: mockUrl, isLocal: true })
    }
    reader.readAsDataURL(file)
  })
}

export function isLocalUpload(url: string): boolean {
  return url.startsWith("uploads/mock-")
}
