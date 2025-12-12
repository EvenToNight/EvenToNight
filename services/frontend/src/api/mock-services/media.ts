import type { MediaAPI, MediaGetResponse } from '../interfaces/media'
import { delay } from '../utils'

export const mockMediaApi: MediaAPI = {
  async get(url: string): Promise<MediaGetResponse> {
    await delay()
    const response = await fetch(url)
    const blob = await response.blob()
    return { file: new File([blob], 'downloaded_file', { type: blob.type }) }
  },
  buildLink(url: string): string {
    return url
  },
}
