import { audioData } from './../types/interface';
import data from '../data.json';
import lodash from 'lodash';
import { promises as fs } from 'fs';
import path from 'path';

export default class Randomizer {
  public generatedAudioData: audioData[];
  public generatedImgSrc: Promise<string>;
  public generatedCounts: audioData[];
  public generatedSequence: void;

  constructor() {
    this.generatedAudioData = this.generateTextAudio();
    this.generatedImgSrc = this.generateImage();
    this.generatedSequence = this.generateSequence();
  }

  private generateTextAudio() {
    const generatedCounts = data.map(data => {
      const counts = Math.round(Math.random() * 5);
      return {
        text: data.text,
        counts,
      };
    });

    this.generatedCounts = generatedCounts as audioData[];

    const listText: audioData[] = [];
    generatedCounts.map(data => {
      if (data.counts) {
        for (let i = 0; i < data.counts; i++) {
          listText.push({
            text: data.text,
            audioPath: `media/sound/${data.text}.ogg`,
          });
        }
      }
    });
    return lodash.shuffle(listText);
  }

  private async generateImage(): Promise<string> {
    const imgDir = path.join(__dirname + '/../media/img');
    const files = await fs.readdir(imgDir);
    const n = Math.floor(Math.random() * files.length) + 1;
    return `${imgDir}/${n}.jpg`;
  }

  private generateSequence(): void {
    const sequence = this.generatedCounts.reduce((acc, data) => {
      return `${acc}${data.counts}`;
    }, '');

    console.log(sequence, typeof sequence);
  }
}
