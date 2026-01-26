export function mockUploadPoster(eventId: string, posterPath?: string): string | undefined {
  if (!posterPath) return undefined;
  const fileName = posterPath.split("/").pop();
  return `http://mock-media/${eventId}/${fileName}`;
}
