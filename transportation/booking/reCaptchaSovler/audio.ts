import wavefile from "wavefile";
import { Readable } from "stream";
import { Buffer } from "buffer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

if (typeof ffmpegStatic !== "string")
  throw new Error("ffmpeg-static binary not found");

ffmpeg.setFfmpegPath(ffmpegStatic);

export function convertMp3BufferToWav(mp3Buffer: Buffer): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const mp3Stream = new Readable();
    mp3Stream.push(mp3Buffer);
    mp3Stream.push(null);

    const chunks: Buffer[] = [];

    ffmpeg(mp3Stream)
      .inputFormat("mp3")
      .audioChannels(1)
      .audioFrequency(16000)
      .audioCodec("pcm_s16le")
      .toFormat("wav")
      .on("error", (err: Error) => {
        console.error("FFmpeg error:", err);
        reject(err);
      })
      .on("end", () => {
        console.log("Conversion complete");
        resolve(Buffer.concat(chunks));
      })
      .pipe()
      .on("data", (chunk: Buffer) => chunks.push(chunk))
      .on("error", (err: Error) => reject(err));
  });
}

export function waveBufferToF64(
  waveBuffer: Buffer,
): Float32Array | Float64Array {
  const wav = new wavefile.WaveFile(waveBuffer);
  wav.toBitDepth("32f");
  wav.toSampleRate(16000);
  let audioData = wav.getSamples();
  if (Array.isArray(audioData)) {
    if (audioData.length > 1) {
      const SCALING_FACTOR = Math.sqrt(2);
      for (let i = 0; i < audioData[0].length; ++i) {
        audioData[0][i] =
          (SCALING_FACTOR * (audioData[0][i] + audioData[1][i])) / 2;
      }
    }

    audioData = audioData[0];
  }
  return audioData;
}
