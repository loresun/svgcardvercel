import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const svgDir = path.join(process.cwd(), 'public', 'svg');
    const files = await fs.promises.readdir(svgDir);
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    return NextResponse.json(svgFiles);
  } catch (error) {
    console.error('Error reading SVG directory:', error);
    return NextResponse.json({ error: 'Failed to load SVG files' }, { status: 500 });
  }
}