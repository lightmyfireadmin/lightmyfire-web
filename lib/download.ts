// lib/download.ts
export function downloadFile(
  bytes: Uint8Array,
  filename: string,
  mimeType: string
) {
  // Explicitly create an ArrayBuffer from the Uint8Array's data
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );

  // Create a blob, explicitly casting the buffer type
  // This tells TypeScript to trust us that it's a standard ArrayBuffer
  const blob = new Blob([arrayBuffer as ArrayBuffer], { type: mimeType });

  // Create an 'a' element and set its properties
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  // Append to the document, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}