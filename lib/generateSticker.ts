
/**
 * Requests the server to generate a sticker sheet PDF (or image) for the given lighter.
 * Note: The server actually returns a PNG or ZIP, but the function is named generateStickerPDF
 * in the client code, so we keep the name for compatibility or rename it if possible.
 *
 * @param {string} name - The name of the lighter.
 * @param {string} pinCode - The unique PIN code of the lighter.
 * @returns {Promise<void>} Resolves when the download starts or throws an error.
 * @throws {Error} If the sticker generation request fails.
 */
export async function generateStickerPDF(name: string, pinCode: string) {
  try {
    // Default values since the client doesn't provide them
    // In a real scenario, we might want to ask the user for these or fetch them from the lighter details
    const backgroundColor = '#FFFFFF'; // Default white
    const language = 'en'; // Default English

    const response = await fetch('/api/generate-sticker-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stickers: [{
          name,
          pinCode,
          backgroundColor,
          language,
        }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate sticker');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `lightmyfire-sticker-${name}.png`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch?.[1]) {
        filename = filenameMatch[1];
      }
    }

    // Trigger download using a temporary anchor tag (browser-native way)
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

  } catch (error) {
    console.error('Error generating sticker:', error);
    throw error;
  }
}
