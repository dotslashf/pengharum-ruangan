import Randomizer from './lib/Randomizer';
import Formatter from './lib/Formatter';
import VideoMaker from './lib/VideoMaker';
import Twitter from './lib/Twitter';
import sleep from './utils/sleep';
import { config } from './config';

(async () => {
  while (true) {
    const r = new Randomizer();
    const audioData = r.getAudioData();
    const generatedImgSrc = await r.generatedImgSrc;
    const sequence = r.getSequence();

    const f = new Formatter(audioData);
    const tweet = f.finalText;

    const vm = new VideoMaker(generatedImgSrc, audioData);
    await vm.generateAudio();
    const videoPath = await vm.generateVideo();

    const twitter = new Twitter();
    const mediaId = await twitter.uploadVideo(videoPath);
    await twitter.tweetVideo(mediaId, tweet, sequence);

    await sleep(config.waitingTime * 60);
  }
})();
