import { audioData } from './../types/interface';
import data from '../data.json';
import lodash from 'lodash';
import { promises as fs } from 'fs';
import path from 'path';

export default class Randomizer {
  private _audioData: audioData[];
  public generatedImgSrc: Promise<string>;
  private sequence: string;

  constructor() {
    this.generatedImgSrc = this.generateImage();
    this.generateRandomSequence();
  }

  private generateAudioData() {
    const generatedCounts = data.map((data, index) => {
      const counts = parseInt(this.sequence.charAt(index));
      return {
        text: data.text,
        counts,
      };
    });

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

    this._audioData = lodash.shuffle(listText);
  }

  private async generateImage(): Promise<string> {
    const imgDir = path.join(__dirname + '/../media/img');
    const files = await fs.readdir(imgDir);
    const n = Math.floor(Math.random() * files.length) + 1;
    return `${imgDir}/${n}.jpg`;
  }

  public getSequence(): string {
    return this.sequence;
  }

  public generateRandomSequence(): void {
    let seq = '';
    for (let i = 0; i < 11; i++) {
      const n = Math.round(Math.random() * 5);
      seq += n;
    }
    console.log(seq);

    this.sequence = seq;
    this.generateAudioData();
  }

  public setSequence(seq: string): void {
    const maxSequenceLength = 11;
    let sequence = seq.substring(0, maxSequenceLength);
    const sequenceLength = sequence.length;

    if (sequenceLength !== 11) {
      const repeatedZero = maxSequenceLength - sequenceLength;
      const repeatedZeroStr = '0'.repeat(repeatedZero);
      sequence += repeatedZeroStr;
    }

    this.sequence = sequence;
    this.generateAudioData();
  }

  public getAudioData(): audioData[] {
    return this._audioData;
  }
}
