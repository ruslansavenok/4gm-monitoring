import fs from "fs";
import path from "path";
import zlib from "zlib";
import BN from "bn.js";

// TODO: latest node has BN inmplementation

// RSA parameters for Lineage2Ver413
const RSA_MODULUS = new BN(
  "97df398472ddf737ef0a0cd17e8d172f0fef1661a38a8ae1d6e829bc1c6e4c3cfc19292dda9ef90175e46e7394a18850b6417d03be6eea274d3ed1dde5b5d7bde72cc0a0b71d03608655633881793a02c9a67d9ef2b45eb7c08d4be329083ce450e68f7867b6749314d40511d09bc5744551baa86a89dc38123dc1668fd72d83",
  16,
);
const RSA_PRIVATE_EXPONENT = new BN("35", 16);

const HEADER_PREFIX = "Lineage2Ver";
const BLOCK_SIZE = 128;
const BLOCK_BODY_SIZE = 124;

/**
 * Align value to 4-byte boundary
 */
function alignTo4Bytes(size) {
  return (size + 3) & ~3;
}

/**
 * RSA decrypt a single 128-byte block
 */
function rsaDecryptBlock(block) {
  // Convert block to big number (big-endian)
  const blockBN = new BN(block);

  // Perform modular exponentiation: M = C^d mod n
  const decrypted = blockBN
    .toRed(BN.red(RSA_MODULUS))
    .redPow(RSA_PRIVATE_EXPONENT)
    .fromRed();

  // Convert back to buffer, padded to BLOCK_SIZE
  const decryptedArray = decrypted.toArray("be", BLOCK_SIZE);
  return Buffer.from(decryptedArray);
}

/**
 * Remove RSA padding from decrypted data
 * Each 128-byte block has metadata at offset +3 indicating actual data size
 */
function removePadding(decryptedData) {
  const output = [];

  for (
    let offset = 0;
    offset + BLOCK_SIZE <= decryptedData.length;
    offset += BLOCK_SIZE
  ) {
    // Size byte is at offset + 3
    const sizeByte = decryptedData[offset + 3];
    const chunkSize = Math.min(sizeByte, BLOCK_BODY_SIZE);

    // Data is right-aligned in the block
    const dataOffset = offset + BLOCK_SIZE - alignTo4Bytes(chunkSize);

    if (dataOffset + chunkSize > decryptedData.length) {
      break;
    }

    output.push(decryptedData.subarray(dataOffset, dataOffset + chunkSize));
  }

  return Buffer.concat(output);
}

/**
 * Decompress data using zlib inflate
 * The compressed data has a 4-byte header with expected decompressed size
 */
function decompress(compressedData) {
  // First 4 bytes contain the expected decompressed size (little-endian)
  const expectedSize = compressedData.readUInt32LE(0);

  // Rest is zlib compressed data
  const zlibData = compressedData.subarray(4);

  // Decompress using zlib inflate (raw deflate, no zlib header)
  const decompressed = zlib.inflateSync(zlibData);

  if (decompressed.length !== expectedSize) {
    console.warn(
      `Warning: Decompressed size ${decompressed.length} doesn't match expected ${expectedSize}`,
    );
  }

  return decompressed;
}

/**
 * Decode a Lineage2Ver413 encrypted .dat file
 */
function decode(inputPath) {
  console.log(`Reading: ${inputPath}`);
  const data = fs.readFileSync(inputPath);

  // Header is UTF-16LE encoded: "Lineage2Ver413" = 14 chars * 2 bytes = 28 bytes
  const HEADER_SIZE = 28;
  const TAIL_SIZE = 20;

  // Check header (UTF-16LE)
  const header = data.subarray(0, HEADER_SIZE).toString("utf16le");
  if (!header.startsWith(HEADER_PREFIX)) {
    throw new Error(
      `Invalid header: expected "${HEADER_PREFIX}", got "${header.substring(0, 11)}"`,
    );
  }

  const version = header.substring(
    HEADER_PREFIX.length,
    HEADER_PREFIX.length + 3,
  );
  console.log(`Detected version: ${version}`);

  if (version !== "413") {
    throw new Error(`Unsupported version: ${version}. Only 413 is supported.`);
  }

  const encryptedData = data.subarray(HEADER_SIZE, data.length - TAIL_SIZE);
  console.log(`Encrypted data size: ${encryptedData.length} bytes`);

  if (encryptedData.length % BLOCK_SIZE !== 0) {
    throw new Error(
      `Encrypted data size ${encryptedData.length} is not divisible by block size ${BLOCK_SIZE}`,
    );
  }

  // RSA decrypt each block
  console.log("Performing RSA decryption...");
  const blockCount = encryptedData.length / BLOCK_SIZE;
  const decryptedBlocks = [];

  for (let i = 0; i < blockCount; i++) {
    const block = encryptedData.subarray(i * BLOCK_SIZE, (i + 1) * BLOCK_SIZE);
    const decryptedBlock = rsaDecryptBlock(block);
    decryptedBlocks.push(decryptedBlock);

    if ((i + 1) % 100 === 0 || i === blockCount - 1) {
      process.stdout.write(`\rDecrypted ${i + 1}/${blockCount} blocks`);
    }
  }
  console.log("");

  const decryptedData = Buffer.concat(decryptedBlocks);

  // Remove padding
  console.log("Removing padding...");
  const unpaddedData = removePadding(decryptedData);
  console.log(`Unpadded data size: ${unpaddedData.length} bytes`);

  // Decompress
  console.log("Decompressing...");
  const decompressed = decompress(unpaddedData);
  console.log(`Decompressed size: ${decompressed.length} bytes`);

  return decompressed;
}

// Main execution
const inputFile = process.argv[2] || "collection-ru.dat";
const inputPath = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  inputFile,
);
const outputPath = inputPath.replace(/\.dat$/, "-decoded.txt");

/**
 * Binary reader helper class
 */
class BinaryReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.offset = 0;
  }

  readUInt32() {
    const val = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return val;
  }

  readUInt16() {
    const val = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return val;
  }

  readUInt8() {
    const val = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return val;
  }

  readFloat() {
    const val = this.buffer.readFloatLE(this.offset);
    this.offset += 4;
    return val;
  }

  // ASCF format: length (uint32) + UTF-16LE string (no null terminator)
  readASCF() {
    const len = this.readUInt32();
    if (len === 0) return "";
    const strBytes = this.buffer.subarray(this.offset, this.offset + len * 2);
    this.offset += len * 2;
    return strBytes.toString("utf16le");
  }

  hasMore() {
    return this.offset < this.buffer.length;
  }

  getOffset() {
    return this.offset;
  }
}

/**
 * Parse collection.dat format
 */
function parseCollection(data) {
  const reader = new BinaryReader(data);
  const collections = [];

  // Read total record count
  const totalRecords = reader.readUInt32();
  console.log(`Total records: ${totalRecords}`);

  for (let i = 0; i < totalRecords; i++) {
    try {
      const collection = {};

      // Basic fields
      collection.id = reader.readUInt32();
      collection.name = reader.readASCF();
      collection.mainCategory = reader.readUInt32();
      collection.period = reader.readUInt32();
      collection.optionId = reader.readUInt32();

      // Descriptions array
      const descCount = reader.readUInt32();
      collection.descriptions = [];
      for (let d = 0; d < descCount; d++) {
        const desc = {
          name: reader.readASCF(),
          unk4: reader.readUInt32(),
          param: reader.readFloat(),
        };
        collection.descriptions.push(desc);
      }

      // Items array
      const itemCount = reader.readUInt32();
      collection.items = [];
      for (let j = 0; j < itemCount; j++) {
        const item = {
          itemId: reader.readUInt32(),
          itemId2: reader.readUInt32(),
          itemCount: reader.readUInt32(),
          enchant: reader.readUInt16(),
          slot: reader.readUInt8(),
          bless: reader.readUInt8(),
          blessCond: reader.readUInt32(),
        };
        collection.items.push(item);
      }

      // Unknown field
      collection.unk3 = reader.readUInt16();

      // Complete item types
      const completeItemTypeCount = reader.readUInt32();
      collection.completeItemTypes = [];
      for (let k = 0; k < completeItemTypeCount; k++) {
        collection.completeItemTypes.push(reader.readUInt16());
      }

      // Complete skill types
      const completeSkillTypeCount = reader.readUInt32();
      collection.completeSkillTypes = [];
      for (let k = 0; k < completeSkillTypeCount; k++) {
        collection.completeSkillTypes.push(reader.readUInt16());
      }

      // Check for event flag (MasterClass2 format)
      if (reader.hasMore() && reader.offset < data.length - 4) {
        const possibleEventFlag = reader.buffer.readUInt8(reader.offset);
        if (possibleEventFlag === 0 || possibleEventFlag === 1) {
          collection.isEvent = reader.readUInt8();
          if (collection.isEvent === 1) {
            collection.startDate = reader.readASCF();
            collection.endDate = reader.readASCF();
          }
        }
      }

      collections.push(collection);
    } catch (e) {
      console.warn(
        `Warning: Error parsing record ${i} at offset ${reader.getOffset()}: ${e.message}`,
      );
      break;
    }
  }

  return collections;
}

/**
 * Format collections as TSV
 */
function formatAsTSV(collections) {
  const lines = [];

  // Header
  lines.push(
    [
      "ID",
      "Name",
      "Category",
      "Period",
      "OptionID",
      "Descriptions",
      "Items",
      "CompleteItemTypes",
      "CompleteSkillTypes",
      "IsEvent",
      "StartDate",
      "EndDate",
    ].join("\t"),
  );

  for (const c of collections) {
    const descStr = c.descriptions
      .map((d) => `${d.name}(${d.param})`)
      .join("; ");
    const itemsStr = c.items
      .map((i) => `${i.itemId}x${i.itemCount}`)
      .join("; ");
    const completeItemStr = c.completeItemTypes.join(", ");
    const completeSkillStr = c.completeSkillTypes.join(", ");

    lines.push(
      [
        c.id,
        c.name,
        c.mainCategory,
        c.period,
        c.optionId,
        descStr,
        itemsStr,
        completeItemStr,
        completeSkillStr,
        c.isEvent ?? "",
        c.startDate ?? "",
        c.endDate ?? "",
      ].join("\t"),
    );
  }

  return lines.join("\n");
}

try {
  const decoded = decode(inputPath);

  // Parse the collection data structure
  console.log("Parsing collection data...");
  const collections = parseCollection(decoded);
  console.log(`Parsed ${collections.length} collections`);

  // Save as TSV
  const tsvOutput = formatAsTSV(collections);
  const tsvPath = outputPath.replace(".txt", ".tsv");
  fs.writeFileSync(tsvPath, tsvOutput, "utf8");
  console.log(`\nDecoded file saved to: ${tsvPath}`);

  // Also save as JSON for full data
  const jsonPath = outputPath.replace(".txt", ".json");
  fs.writeFileSync(jsonPath, JSON.stringify(collections, null, 2), "utf8");
  console.log(`JSON file saved to: ${jsonPath}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}
