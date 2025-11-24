/**
 * Requests the server to generate a sticker sheet (PNG) for the given lighter and initiates a download.
 *
 * This function sends a POST request to the `/api/generate-sticker-pdf` endpoint with the lighter details.
 * It uses default values for background color ('#FFFFFF') and language ('en') as these are not currently
 * provided by the caller. Upon a successful response, it creates a Blob from the response body and
 * triggers a browser download of the generated image file.
 *
 * @param {string} name - The name of the lighter to appear on the sticker.
 * @param {string} pinCode - The unique PIN code of the lighter.
 * @returns {Promise<void>} A promise that resolves when the download has been initiated.
 * @throws {Error} If the network request fails or the server returns an error response.
 */
export async function generateStickerPDF(name: string, pinCode: string): Promise<void> {
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
