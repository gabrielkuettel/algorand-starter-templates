import { readFileSync, writeFileSync } from 'node:fs'

const WATERMARK_FILE = '.watermark.json'

export async function getWatermark(): Promise<bigint> {
  try {
    const data = JSON.parse(readFileSync(WATERMARK_FILE, 'utf-8'))
    return BigInt(data.watermark ?? 0)
  } catch {
    return 0n
  }
}

export async function setWatermark(watermark: bigint): Promise<void> {
  writeFileSync(WATERMARK_FILE, JSON.stringify({ watermark: Number(watermark) }, null, 2))
}
