import { audioData } from '../types/interface';
import data from '../data.json';
import lodash from 'lodash';
import { promises as fs } from 'fs';
import path from 'path';

export default class Randomizer {
  public generatedAudioData: audioData[];
  public generatedImgSrc: Promise<string>;
  public finalText: string;

  constructor() {
    this.generatedAudioData = this.generateTextAudio();
    this.generatedImgSrc = this.generateImage();
    this.finalText = this.generatedAudioData.reduce((acc, data) => {
      if (data.text === 'shake') {
        return acc + '*shake*' + ' ';
      } else if (data.text === 'shakeshake') {
        return acc + '*shake lebih lama*' + ' ';
      } else {
        return acc + data.text + ' ';
      }
    }, '');
  }

  private generateTextAudio() {
    const generateCounts = data.map(data => {
      const counts = Math.round(Math.random() * 5);

      return {
        text: data.text,
        counts,
      };
    });

    const listText: audioData[] = [];
    generateCounts.map(data => {
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
}
