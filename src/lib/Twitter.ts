import { twitterUploadResponse } from './../types/interface';
import Twit from 'twit';
import dotenv from 'dotenv';
import mime from 'mime';
import { promises as fs } from 'fs';

dotenv.config();

export default class Twitter {
  private readonly client: Twit;
  public readonly imgSrc: string;

  constructor() {
    this.client = new Twit({
      consumer_key: process.env.TWITTER_API_KEY!,
      consumer_secret: process.env.TWITTER_API_SECRET!,
      access_token: process.env.TWITTER_API_ACCESS_TOKEN!,
      access_token_secret: process.env.TWITTER_API_ACCESS_SECRET!,
    });
  }

  public async uploadVideo(filepath: string): Promise<string> {
    return new Promise(resolve => {
      this.initializeMediaUpload(filepath).then(mediaIdStr => {
        this.appendFileChunk(filepath, mediaIdStr).then(async mediaIdStr => {
          const data = await this.finalizeUpload(mediaIdStr);
          resolve(data);
        });
      });
    });
  }

  private async initializeMediaUpload(filepath: string): Promise<string> {
    const mediaType = mime.getType(filepath);
    const file = await fs.stat(filepath);

    return new Promise((resolve, reject) => {
      this.client.post(
        'media/upload',
        {
          command: 'INIT',
          total_bytes: file.size,
          media_type: mediaType!,
        },
        (err, data, _) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log('INIT', data);
            const _data = data as twitterUploadResponse;
            resolve(_data.media_id_string);
          }
        }
      );
    });
  }

  private async appendFileChunk(
    filepath: string,
    mediaIdStr: string
  ): Promise<string> {
    const mediaData = await fs.readFile(filepath, {
      encoding: 'base64',
    });
    console.log('Append');

    return new Promise((resolve, reject) => {
      this.client.post(
        'media/upload',
        {
          command: 'APPEND',
          media_id: mediaIdStr,
          media_data: mediaData,
          segment_index: 0,
        },
        (err, data) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log('APPEND', data);
            resolve(mediaIdStr);
          }
        }
      );
    });
  }

  private async finalizeUpload(mediaIdStr: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.post(
        'media/upload',
        {
          command: 'FINALIZE',
          media_id: mediaIdStr,
        },
        (err, data) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log('FINALIZE', data);

            resolve(mediaIdStr);
          }
        }
      );
    });
  }

  public async tweetVideo(
    mediaIdStr: string,
    textAudio: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.post(
        'statuses/update',
        { status: textAudio, media_ids: [mediaIdStr] },
        (err, data, _) => {
          if (err) {
            reject(err);
          } else {
            console.log(data);
            resolve();
          }
        }
      );
    });
  }
}
