import Randomizer from './lib/Randomizer';
import VideoMaker from './lib/VideoMaker';
import Twitter from './lib/Twitter';

(async () => {
  const r = new Randomizer();
  const twitter = new Twitter();
  console.log(r.finalText);

  const vm = new VideoMaker(await r.generatedImgSrc, r.generatedAudioData);
  await vm.generateAudio();
  const filePath = await vm.generateVideo();
  const mediaIdStr = await twitter.uploadVideo(filePath);
  await twitter.tweetVideo(mediaIdStr, r.finalText);
})();
