const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// CRC32 implementation for PNG chunks
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Normalized coordinates
      const nx = (x - cx) / (width * 0.5);
      const ny = (y - cy) / (height * 0.5);
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Base emerald gradient
      const gradT = (y / height + x / width) * 0.5;
      let r = Math.round(2 + gradT * (4 - 2));
      let g = Math.round(44 + gradT * (120 - 44));
      let b = Math.round(34 + gradT * (87 - 34));
      let a = 255;

      // Outer squircle boundary for standard icons
      if (!isMaskable) {
        // Squircle formula |nx|^4 + |ny|^4 <= 0.85
        const sq = Math.pow(Math.abs(nx), 3.6) + Math.pow(Math.abs(ny), 3.6);
        if (sq > 0.88) {
          // Soft anti-aliased edge or background
          const edgeAlpha = Math.max(0, Math.min(1, (1.0 - sq) * 8));
          a = Math.round(edgeAlpha * 255);
        }
      }

      // Upper Sun (Top Right: cx + 0.35, cy - 0.35)
      const sunDist = Math.hypot(nx - 0.32, ny + 0.35);
      if (sunDist < 0.28) {
        const sunFactor = 1 - sunDist / 0.28;
        r = Math.round(r * (1 - sunFactor) + 250 * sunFactor);
        g = Math.round(g * (1 - sunFactor) + 204 * sunFactor);
        b = Math.round(b * (1 - sunFactor) + 21 * sunFactor);
      }

      // Rain Cloud (Top Left: cx - 0.3, cy - 0.2)
      const cloudDist = Math.hypot(nx + 0.28, ny + 0.22);
      if (cloudDist < 0.22) {
        const cloudFactor = Math.max(0, (0.22 - cloudDist) / 0.22);
        r = Math.round(r * (1 - cloudFactor * 0.85) + 255 * cloudFactor * 0.85);
        g = Math.round(g * (1 - cloudFactor * 0.85) + 255 * cloudFactor * 0.85);
        b = Math.round(b * (1 - cloudFactor * 0.85) + 255 * cloudFactor * 0.85);
      }

      // Caring Hands (Arc at the lower left and right)
      // Left arm arc: ny > 0.1, nx < -0.05
      const leftHandDist = Math.hypot(nx + 0.38, ny - 0.32);
      const rightHandDist = Math.hypot(nx - 0.38, ny - 0.32);
      if ((leftHandDist < 0.25 && leftHandDist > 0.14) || (rightHandDist < 0.25 && rightHandDist > 0.14)) {
        r = 251; g = 191; b = 36; // Warm amber golden hands
      }

      // Central Golden Wheat stalk & grains: |nx| < 0.18, -0.4 < ny < 0.35
      const stalkDist = Math.abs(nx);
      if (stalkDist < 0.02 && ny > -0.38 && ny < 0.4) {
        r = 250; g = 204; b = 21; // Central stem
      }

      // 6 Wheat grains (alternating left/right)
      const grains = [
        { gx: -0.11, gy: 0.12 }, { gx: 0.11, gy: 0.12 },
        { gx: -0.12, gy: -0.06 }, { gx: 0.12, gy: -0.06 },
        { gx: -0.11, gy: -0.22 }, { gx: 0.11, gy: -0.22 },
        { gx: 0.0, gy: -0.36 }
      ];

      for (const grain of grains) {
        const gdist = Math.hypot((nx - grain.gx) * 1.5, ny - grain.gy);
        if (gdist < 0.075) {
          r = 254; g = 240; b = 138; // Bright gold grains
          break;
        }
      }

      // Fresh Green Leaves at the bottom base
      const leafDistL = Math.hypot((nx + 0.16) * 1.8, ny - 0.3);
      const leafDistR = Math.hypot((nx - 0.16) * 1.8, ny - 0.3);
      if (leafDistL < 0.12 || leafDistR < 0.12) {
        r = 52; g = 211; b = 153; // Fresh spring emerald leaves
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // Deflate compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // No interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
console.log('pwa-192x192.png created');

// Generate 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
console.log('pwa-512x512.png created');

// Generate 512x512 maskable
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
console.log('pwa-maskable-512x512.png created');

// Generate apple-touch-icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
console.log('apple-touch-icon.png created');
