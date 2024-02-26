import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { registerFont } from 'canvas';
import { generateTextBuffer } from '@/lib/image';
import brands from '@/config/brands';

export async function POST(req) {
    try {
        const { brandId, segmentId, text, file, secondText, fontSize } = await req.json();
        
        const brand = brands.find((b) => b.id === brandId);

        if (!brand) {
            throw new Error('Brand not found');
        }

        const segment = brand.segments.find((s) => s.id === segmentId);

        if (!segment) {
            throw new Error('Segment not found');
        }

        if (!file) {
            throw new Error('No file provided');
        }

        const publicDirectory = path.join(process.cwd(), 'public');
        const fontPath = path.join(publicDirectory, '/fonts/MarkOT-CondBoldItalic.otf');

        registerFont(fontPath, { family: 'MarkOT-CondBoldItalic' });

        const textColor = 'white';
        const processedImageSize = { width: 1920, height: 1080 };

        // decode the base64 string
        const base64String = file.split(';base64,').pop();
        const buffer = Buffer.from(base64String, 'base64');

        // Select the PNG overlay based on the segment
        const overlayPngPath = segment.image || '/pngs/E.png';
        const overlayPngFullPath = path.join(publicDirectory, overlayPngPath);

        if (!fs.existsSync(overlayPngFullPath)) {
            throw new Error('Overlay PNG not found');
        }

        // Format text
        const formattedText = `${text}${secondText ? `\n${secondText}` : ''}`.toUpperCase();

        // Create text
        const { buffer: textBuffer, height: textBufferHeight } = await generateTextBuffer({ text: formattedText, fontSize, fontFamily: 'MarkOT-CondBoldItalic', color: textColor });

        const targetPositionRatio = 0.847; // Fixed percentage at top (e.g. 84%)
       
        const textXPos = 350;
        const textYPos = parseInt((processedImageSize.height * targetPositionRatio) - (textBufferHeight / 2));
        
        const composites = [
            { input: overlayPngFullPath, blend: 'over', top: 0, left: 0},
            { input: textBuffer, blend: 'over', top: textYPos, left: textXPos},
        ];

        const processedImage = await sharp(buffer)
            .resize(processedImageSize.width, processedImageSize.height, {
                fit: 'cover',
                position: 'center',
            })
            .composite(composites)
            .toFormat('jpeg')
            .jpeg({ quality: 70 })
            .toBuffer();

        // convert the buffer to base64 to send back to the client
        const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;

        // send the base64 image back to the client
        return Response.json({ base64Image });
    } catch (error) {
        console.error('Error:', error);

        return Response.json({ error: error.message });
    }
}