export interface MediaGetResponse {
  file: File
}

export interface MediaAPI {
  get(url: string): Promise<MediaGetResponse>
  buildLink(url: string): string
}
