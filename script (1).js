const fileInput = document.getElementById('fileInput');
const subtitleInput = document.getElementById('subtitleInput');
const mediaPlayer = document.getElementById('mediaPlayer');
const subtitleTrack = document.getElementById('subtitleTrack');
const speedControl = document.getElementById('speedControl');
const playlist = document.getElementById('playlist');
const pipBtn = document.getElementById('pipBtn');
const screenshotBtn = document.getElementById('screenshotBtn');
const visualizer = document.getElementById('visualizer');

let files = [];

// Load playlist
fileInput.addEventListener('change', function () {
  files = Array.from(this.files);
  updatePlaylist();
});

// Load subtitles
subtitleInput.addEventListener('change', function () {
  const subtitleFile = this.files[0];
  if (subtitleFile) {
    const subtitleURL = URL.createObjectURL(subtitleFile);
    subtitleTrack.src = subtitleURL;
    subtitleTrack.mode = 'showing';
  }
});

// Speed control
speedControl.addEventListener('change', function () {
  mediaPlayer.playbackRate = parseFloat(this.value);
});

// Playlist UI
function updatePlaylist() {
  playlist.innerHTML = '';
  files.forEach((file, index) => {
    const li = document.createElement('li');
    li.textContent = file.name;
    li.addEventListener('click', () => playMedia(index));
    playlist.appendChild(li);
  });
  if (files.length) playMedia(0);
}

// Play media from playlist
function playMedia(index) {
  const fileURL = URL.createObjectURL(files[index]);
  mediaPlayer.src = fileURL;
  mediaPlayer.load();
  mediaPlayer.play();
}

// PiP
pipBtn.addEventListener('click', () => {
  if (document.pictureInPictureEnabled) {
    mediaPlayer.requestPictureInPicture().catch(console.error);
  }
});

// Screenshot
screenshotBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = mediaPlayer.videoWidth;
  canvas.height = mediaPlayer.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(mediaPlayer, 0, 0, canvas.width, canvas.height);
  const link = document.createElement('a');
  link.download = 'screenshot.png';
  link.href = canvas.toDataURL();
  link.click();
});

// Audio Visualizer
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const canvasCtx = visualizer.getContext('2d');

mediaPlayer.addEventListener('play', () => {
  const source = audioCtx.createMediaElementSource(mediaPlayer);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = "#111";
    canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);

    const barWidth = (visualizer.width / bufferLength) * 2.5;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      canvasCtx.fillStyle = `rgb(${barHeight + 100}, 150, 200)`;
      canvasCtx.fillRect(x, visualizer.height - barHeight / 2, barWidth, barHeight / 2);
      x += barWidth + 1;
    }
  }

  draw();
});