import Randomizer from './lib/Randomizer';
import Formatter from './lib/Formatter';
import VideoMaker from './lib/VideoMaker';
import Twitter from './lib/Twitter';

(async () => {
  const r = new Randomizer();
  const generatedAudioData = r.generatedAudioData;
  // const generatedImgSrc = await r.generatedImgSrc;

  const f = new Formatter(generatedAudioData);
  const tweet = f.finalText;
  console.log(tweet); 

  // const vm = new VideoMaker(generatedImgSrc, generatedAudioData);
  // await vm.generateAudio();
  // const videoPath = await vm.generateVideo();

  // const twitter = new Twitter();
  // const mediaId = await twitter.uploadVideo(videoPath);
  // await twitter.tweetVideo(mediaId, tweet);
})();
