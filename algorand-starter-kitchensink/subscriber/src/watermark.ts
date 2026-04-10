import { readFileSync, writeFileSync } from 'node:fs'

const WATERMARK_FILE = '.watermark.json'

export async function getWatermark(): Promise<number> {
  try {
    const data = JSON.parse(readFileSync(WATERMARK_FILE, 'utf-8'))
    return data.watermark ?? 0
  } catch {
    return 0
  }
}

export async function setWatermark(watermark: number): Promise<void> {
  writeFileSync(WATERMARK_FILE, JSON.stringify({ watermark }, null, 2))
}
