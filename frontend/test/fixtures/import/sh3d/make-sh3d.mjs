// Packs Home.xml into ../house.sh3d the way Sweet Home 3D stores a home: a zip archive with Home.xml
// deflated. A stored "Home" entry stands in for the serialized home the importer doesn't read.
//   node test/fixtures/import/sh3d/make-sh3d.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const entries = [
  { name: "Home", data: Buffer.from("Not a real serialized home: see Home.xml.\n"), deflate: false },
  { name: "Home.xml", data: readFileSync(new URL("./Home.xml", import.meta.url)), deflate: true },
];
const local = [];
const central = [];
let offset = 0;
for (const e of entries) {
  const name = Buffer.from(e.name);
  const body = e.deflate ? deflateRawSync(e.data) : e.data;
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0);
  head.writeUInt16LE(20, 4);
  head.writeUInt16LE(e.deflate ? 8 : 0, 8);
  head.writeUInt32LE(crc32(e.data), 14);
  head.writeUInt32LE(body.length, 18);
  head.writeUInt32LE(e.data.length, 22);
  head.writeUInt16LE(name.length, 26);
  local.push(head, name, body);
  const dir = Buffer.alloc(46);
  dir.writeUInt32LE(0x02014b50, 0);
  dir.writeUInt16LE(20, 4);
  dir.writeUInt16LE(20, 6);
  dir.writeUInt16LE(e.deflate ? 8 : 0, 10);
  dir.writeUInt32LE(crc32(e.data), 16);
  dir.writeUInt32LE(body.length, 20);
  dir.writeUInt32LE(e.data.length, 24);
  dir.writeUInt16LE(name.length, 28);
  dir.writeUInt32LE(offset, 42);
  central.push(dir, name);
  offset += head.length + name.length + body.length;
}
const dirSize = central.reduce((n, b) => n + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(entries.length, 8);
end.writeUInt16LE(entries.length, 10);
end.writeUInt32LE(dirSize, 12);
end.writeUInt32LE(offset, 16);
writeFileSync(new URL("../house.sh3d", import.meta.url), Buffer.concat([...local, ...central, end]));
