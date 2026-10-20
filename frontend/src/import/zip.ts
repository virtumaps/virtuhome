// Just enough of the zip format to take one file out of an archive: the central directory says
// where each entry is; entries are stored or deflated (the browser's DecompressionStream inflates).

/** Whether the bytes start like a zip archive. */
export const isZip = (b: Uint8Array): boolean => b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 3 && b[3] === 4;

/** The entry called `name` in the archive, unpacked, or null when there is none. */
export async function unzipEntry(bytes: Uint8Array, name: string): Promise<Uint8Array | null> {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // the end of central directory record: 22 bytes, then a comment of up to 64 KB
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 0xffff); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("The file is not a zip archive.");
  const count = v.getUint16(end + 10, true);
  let p = v.getUint32(end + 16, true);
  const want = new TextEncoder().encode(name);
  for (let n = 0; n < count && p + 46 <= bytes.length; n++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const method = v.getUint16(p + 10, true);
    const size = v.getUint32(p + 20, true);
    const nameLen = v.getUint16(p + 28, true);
    const extraLen = v.getUint16(p + 30, true);
    const commentLen = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const entry = bytes.subarray(p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;
    if (entry.length !== want.length || entry.some((c, i) => c !== want[i])) continue;
    // the data follows the local header, whose name and extra field can differ from the directory's
    if (v.getUint32(local, true) !== 0x04034b50) throw new Error("The zip archive is damaged.");
    const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
    const data = bytes.subarray(start, start + size);
    if (method === 0) return data;
    if (method !== 8) throw new Error("The zip archive is packed in a way that can't be read here.");
    // "deflate-raw" came with Chrome 103 and Safari 16.4: older browsers have no stream, or refuse the format
    let inflate: DecompressionStream;
    try {
      inflate = new DecompressionStream("deflate-raw");
    } catch {
      throw new Error("This browser can't unpack zip archives: try another browser.");
    }
    const stream = new Blob([data.slice()]).stream().pipeThrough(inflate);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  return null;
}
