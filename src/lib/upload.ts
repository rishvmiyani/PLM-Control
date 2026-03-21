export interface UploadResult {
  url: string
  isFallback: boolean
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const secret = process.env.UPLOADTHING_SECRET

  if (!secret) {
    console.warn("Uploadthing unavailable — using local fallback")
    return {
      url: `/uploads/mock-${file.name}`,
      isFallback: true,
    }
  }

  try {
    // Attempt Uploadthing upload when credentials are present
    const { UTApi } = await import("uploadthing/server")
    const utapi = new UTApi()
    const response = await utapi.uploadFiles(file)

    if (response.error || !response.data?.url) {
      throw new Error(response.error?.message ?? "Upload failed")
    }

    return { url: response.data.url, isFallback: false }
  } catch (error) {
    console.warn("Uploadthing unavailable — using local fallback", error)
    return {
      url: `/uploads/mock-${file.name}`,
      isFallback: true,
    }
  }
}

export function isLocalFallbackUrl(url: string): boolean {
  return url.startsWith("/uploads/mock-")
}
