/**
 * Validates the required data for file upload
 * @param file - The uploaded file from multer
 * @param type - The type parameter from request body
 * @param entityId - The entityId parameter from request body
 * @returns An object with isValid boolean and error message if invalid
 */
export function checkData(file: Express.Multer.File | undefined, type: string, entityId: string) {
  if (!file) {
    return { isValid: false, error: "File missing" }
  }
  if (!type || !entityId) {
    return { isValid: false, error: "Metadata missing" }
  }
  return { isValid: true, error: null }
}

/**
 * Returns the appropriate default file key based on the type
 * @param type - The type string
 * @returns The default file key path
 */
export function returnDefault(type: string): string {
  if (type === "events") {
    return "events/default.png";
  } else if (type === "users") {
    return "users/default.png";
  } else {
    return "default.png";
  }
}