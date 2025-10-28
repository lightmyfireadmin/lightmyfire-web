// lib/download.ts
export function downloadFile(
  bytes: Uint8Array,
  filename: string,
  mimeType: string
) {
  // Create a blob from the bytes' underlying ArrayBuffer
  // This explicitly uses the ArrayBuffer, resolving the type issue.
  const blob = new Blob([bytes.buffer], { type: mimeType });

  // Create an 'a' element and set its properties
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  // Append to the document, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}