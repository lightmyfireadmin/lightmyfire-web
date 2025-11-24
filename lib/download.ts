/**
 * Triggers a file download in the browser.
 *
 * This function creates a temporary `<a>` element, sets its href to a Blob URL created from the provided bytes,
 * and programmatically clicks it to initiate the download. It handles the necessary array buffer slicing
 * and cleanup of the DOM element.
 *
 * @param {Uint8Array} bytes - The file content as a Uint8Array.
 * @param {string} filename - The desired name for the downloaded file.
 * @param {string} mimeType - The MIME type of the file (e.g., 'application/pdf', 'image/png').
 */
export function downloadFile(
  bytes: Uint8Array,
  filename: string,
  mimeType: string
) {
  // Create a slice of the buffer to ensure we only use the relevant bytes
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );

  // Create a Blob from the array buffer with the specified MIME type
  const blob = new Blob([arrayBuffer as ArrayBuffer], { type: mimeType });

  // Create a hidden anchor element to trigger the download
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
