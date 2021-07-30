import Formatter from './lib/Formatter';
import Randomizer from './lib/Randomizer';
import VideoMaker from './lib/VideoMaker';

(async () => {
  const r = new Randomizer();
  // r.setSequence('99999999999');
  const audioData = r.getAudioData();
  const generatedImgSrc = await r.generatedImgSrc;

  const f = new Formatter(audioData);
  const tweet = f.finalText;
  console.log(tweet.length);

  const vm = new VideoMaker(generatedImgSrc, audioData);
  await vm.generateAudio();
  await vm.generateVideo();
})();
