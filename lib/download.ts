/**
 * Triggers a file download in the browser.
 *
 * @param {Uint8Array} bytes - The file content as a Uint8Array.
 * @param {string} filename - The name to save the file as.
 * @param {string} mimeType - The MIME type of the file.
 */
export function downloadFile(
  bytes: Uint8Array,
  filename: string,
  mimeType: string
) {
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );

  const blob = new Blob([arrayBuffer as ArrayBuffer], { type: mimeType });

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
