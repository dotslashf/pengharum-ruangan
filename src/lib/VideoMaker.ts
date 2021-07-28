import { audioData } from '../types/interface';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import Randomizer from './Randomizer';

export default class VideoMaker {
  public imagePath: string;
  public audioList: audioData[];
  public audioOutput: string;
  public videoOutput: string;
  public fullPath: string;
  public audioLength: number;
  command: ffmpeg.FfmpegCommand;

  public constructor(img: string, audioList: audioData[]) {
    this.command = ffmpeg();
    this.imagePath = img;
    this.audioList = audioList;
    this.audioOutput = './output.ogg';
    this.videoOutput = './output.mp4';
    this.fullPath = path.join(__dirname + '/../');
  }

  private getAudioLength(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.command.input(this.audioOutput).ffprobe((err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(Math.floor(metadata.format.duration!) + 1);
        }
      });
    });
  }

  public generateAudio(): Promise<void> {
    const audioPaths = this.audioList.map(data => {
      return `${this.fullPath}${data.audioPath}`;
    });

    const inputAudio = 'concat:' + audioPaths.join('|');

    return new Promise(resolve => {
      this.command
        .input(inputAudio)
        .save(this.audioOutput)
        .on('end', async () => {
          console.log('done creating audio');
          this.audioLength = await this.getAudioLength();
          resolve();
        });
    });
  }

  public generateStaticVideo(): Promise<void> {
    return new Promise(resolve => {
      this.command = ffmpeg();

      this.command
        .input(this.imagePath)
        .inputOption('-loop 1')
        .addInput(this.audioOutput)
        .outputOptions([
          `-c:v libx264`,
          `-t ${this.audioLength}`,
          `-pix_fmt yuv420p`,
        ])
        .save(this.videoOutput)
        .on('end', () => {
          console.log('video created');
          resolve();
        });
    });
  }
}

(async () => {
  const r = new Randomizer();
  console.log(r.finalText);

  const vm = new VideoMaker(await r.generatedImgSrc, r.generatedAudioData);
  await vm.generateAudio();
  await vm.generateStaticVideo();
})();
