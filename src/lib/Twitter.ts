import {
  TwitterTweetResponse,
  twitterUploadResponse,
} from './../types/interface';
import Twit, { Callback } from 'twit';
import dotenv from 'dotenv';
import mime from 'mime';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import createLogger from 'logging';
import sleep from '../utils/sleep';

dotenv.config();

export default class Twitter {
  private readonly client: Twit;
  public readonly imgSrc: string;
  private logger: createLogger.Logger;
  // private MAX_FILE_CHUNK_BYTES = 5 * 1024 * 1024;
  private isUploading: boolean = false;
  private chunkNumber: number = 0;
  private isFileStreamEnded: boolean = false;

  constructor() {
    this.client = new Twit({
      consumer_key: process.env.TWITTER_API_KEY!,
      consumer_secret: process.env.TWITTER_API_SECRET!,
      access_token: process.env.TWITTER_API_ACCESS_TOKEN!,
      access_token_secret: process.env.TWITTER_API_ACCESS_SECRET!,
    });
    this.logger = createLogger('Twitter');
  }

  public async uploadVideo(filepath: string): Promise<string> {
    const mediaIdTemp = await this.initMediaUpload(filepath);

    const mediaData = createReadStream(filepath, {
      highWaterMark: 128 * 1024,
    });

    return new Promise(resolve => {
      mediaData.on('data', chunk => {
        mediaData.pause();
        this.isUploading = true;

        this.appendFileChunk(
          mediaIdTemp,
          chunk.toString('base64'),
          this.chunkNumber,
          async err => {
            this.isUploading = false;
            if (err) {
              this.logger.error('appendFileChunk', err);
            } else {
              this.logger.info(`appendFileChunk n:${this.chunkNumber}`);

              if (this.isUploadComplete()) {
                const mediaId = await this.finalizeUpload(mediaIdTemp);
                resolve(mediaId);
              } else {
                this.chunkNumber++;
                mediaData.resume();
              }
            }
          }
        );
      });

      mediaData.on('end', async () => {
        this.isFileStreamEnded = true;
        if (this.isUploadComplete()) {
          const mediaId = await this.finalizeUpload(mediaIdTemp);
          resolve(mediaId);
        }
      });
    });
  }

  private async initMediaUpload(filepath: string): Promise<string> {
    const mediaType = mime.getType(filepath);

    const file = await fs.stat(filepath);

    return new Promise((resolve, reject) => {
      this.client.post(
        'media/upload',
        {
          command: 'INIT',
          total_bytes: file.size,
          media_type: mediaType!,
          media_category: 'tweet_video',
        },
        (err, data, _) => {
          if (err) {
            this.logger.error('initMediaUpload', err);
            reject(err);
          } else {
            this.logger.info('initMediaUpload');
            const _data = data as twitterUploadResponse;
            resolve(_data.media_id_string);
          }
        }
      );
    });
  }

  private appendFileChunk(
    mediaIdTemp: string,
    chunk: string,
    chunkNumber: number,
    cb: Callback
  ): void {
    this.client.post(
      'media/upload',
      {
        command: 'APPEND',
        media_id: mediaIdTemp,
        media: chunk,
        segment_index: chunkNumber,
      },
      cb
    );
  }

  private async finalizeUpload(mediaIdStr: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.post(
        'media/upload',
        {
          command: 'FINALIZE',
          media_id: mediaIdStr,
        },
        async err => {
          if (err) {
            this.logger.error('finalizeUpload', err);
            reject(err);
          } else {
            let mediaStatus = await this.getMediaStatus(mediaIdStr);

            while (mediaStatus !== 'succeeded') {
              mediaStatus = await this.getMediaStatus(mediaIdStr);
              if (mediaStatus === 'succeeded') {
                break;
              }
            }
            resolve(mediaIdStr);
          }
        }
      );
    });
  }

  private async getMediaStatus(
    mediaIdStr: string
  ): Promise<'succeeded' | 'in_progress'> {
    const { data } = await this.client.get('media/upload', {
      command: 'STATUS',
      media_id: mediaIdStr,
    });

    let _data = data as any;
    let processInfo = _data.processing_info;
    let state = processInfo.state;

    let checkAfterSecs = processInfo.check_after_secs;
    this.logger.info(`getMediaStatus state: ${state}`);
    await sleep(checkAfterSecs);

    return state === 'succeeded' ? 'succeeded' : 'in_progress';
  }

  private isUploadComplete() {
    return !this.isUploading && this.isFileStreamEnded;
  }

  public async tweetVideo(
    mediaIdStr: string,
    textAudio: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.client.post(
        'statuses/update',
        { status: textAudio, media_ids: [mediaIdStr] },
        (err, data) => {
          if (err) {
            this.logger.error('Tweeting Video Error', err);
            reject(err);
          } else {
            const _data = data as TwitterTweetResponse;
            this.logger.info(
              `tweetVideo https://twitter.com/pengharunnruang/status/${_data.id_str}`
            );
            resolve();
          }
        }
      );
    });
  }
}
