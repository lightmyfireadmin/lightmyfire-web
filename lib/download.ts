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