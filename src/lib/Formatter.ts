import { audioData } from './../types/interface';
import createLogger from 'logging';
import { config } from '../config';

export default class Formatter {
  private _data: audioData[];
  public finalText: string;
  private logger: createLogger.Logger;

  constructor(data: audioData[]) {
    this._data = data;
    this.logger = createLogger('Formatter');
    this.finalText = this.flattenText();
  }

  private transformWord() {
    let sprayCount = 0;
    const transformedWord = this._data.filter(data => {
      if (data.text === 'shake') {
        return (data.text = '*shake*');
      } else if (data.text === 'shakeshake') {
        return (data.text = '*shake shake*');
      } else {
        sprayCount += 1;
        return data.text;
      }
    });
    return {
      transformedWord,
      sprayCount,
    };
  }

  public flattenText(): string {
    let textCount = 0;
    const { sprayCount, transformedWord } = this.transformWord();
    const sprayText = '💨'.repeat(sprayCount);

    let flattenText = transformedWord.reduce((acc, data) => {
      textCount += 1;
      if (textCount % 4 === 0) {
        return `${acc}${data.text}\n`;
      } else {
        return `${acc}${data.text} `;
      }
    }, '');

    const flattenTextSpray = `${flattenText}\n\n${sprayText}`;

    if (flattenTextSpray.length <= config.tweetMaxLength) {
      this.logger.info('Text Flattened + Emoji');
      return flattenTextSpray;
    } else {
      this.logger.info('Text Flattened');
      return flattenText;
    }
  }
}
