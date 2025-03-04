let song;
let fft;
let amplitude;
let button;
let drops = []; // 存储雨滴对象的数组

function setup() {
  createCanvas(400, 400);
  // 加载音频文件
  song = loadSound('Ku, Land of the Scarlet Sunset.mp3', loaded);
  song.setVolume(0.6);
  fft = new p5.FFT(0.8, 1024); // FFT设置
  amplitude = new p5.Amplitude(); // 用于检测音量
  button = createButton('Play');
  button.mousePressed(togglePlay);
  button.position(10, height - 40);
  button.style('background-color', 'rgb(223,131,142)');
}

function loaded() {
  // 音乐加载完成后，可以播放
  console.log("Successfully loaded.")
  song.play();
  button.html('Pause'); // 当音频加载并开始播放时，改变按钮文字为“Pause”
}

function togglePlay() {
  console.log('Button clicked, song is playing: ' + song.isPlaying()); // 打印歌曲播放状态
  if (song.isPlaying()) {
    song.pause();
    button.html('Play');
  } else {
    song.play();
    button.html('Pause');
  }
}

// 不断重复调用
function draw() {
  background(255);

  // 获取音量信息
  let vol = amplitude.getLevel(); 
  // 获取频谱信息
  let spectrum = fft.analyze();

  // 绘制顶部区域
  fill('#AB8089');
  rect(0, 0, width, height);

  // 检测高频部分（假设使用频谱数组的后1/4作为高频区间）
  let highFreq = spectrum.slice(spectrum.length * 0.15);
  let highAvg = highFreq.reduce((a, b) => a + b) / highFreq.length;
  // 当高频平均值超过阈值时生成雨滴
  if (highAvg > 0.9) { // 阈值可以调整
    for (let i = 0; i < 3; i++) { // 每次生成3滴
      drops.push({
        x: random(width),
        y: 0,
        speed: random(1, 4)
      });
    }
  }
  // 更新和绘制雨滴
  fill('#535774');
  noStroke();
  for (let i = drops.length - 1; i >= 0; i--) {
    let d = drops[i];
    // 绘制雨滴（椭圆形状）
    ellipse(d.x, d.y, 2, 10);
    // 更新位置
    d.y += d.speed;
    // 移出屏幕的雨滴移除
    if (d.y > height) {
      drops.splice(i, 1);
    }
  }


  // 绘制节奏驱动的动画
  noStroke(); //禁用轮廓线
  fill('#FD7F59');
  let circleSize = map(vol, 0, 1, 80, 400); // 通过音量控制圆的大小
  ellipse(width / 2, height / 2, circleSize);
  
  // 绘制围绕球体的频谱涟漪
  for (let i = 0; i < spectrum.length; i++) {
    // 基础角度
    let baseAngle = map(i, 0, spectrum.length, 0, TWO_PI);
    // 时间变量，使用 frameCount 或 millis()
    let t = frameCount * 0.004; // 调整速度，0.004 是速度因子
    // 动态角度
    let angle = (baseAngle + t) % TWO_PI;
    
    let radius = map(spectrum[i], 0, 255, 0, 100); // 频谱强度映射为半径
    let x = width / 2 + (radius + circleSize/2) * cos(angle);
    let y = height / 2 + (radius + circleSize/2) * sin(angle);

    let alpha = map(spectrum[i], 0, 255, 10, 255); // 透明度随频谱强度变化
    fill(253,127,89, alpha); // 设置透明度，增加视觉效果
    ellipse(x, y, 8); // 绘制小圆点形成涟漪效果
  }


  
  // 调整波浪高度基于频谱平均值
  let avgSpectrum = spectrum.reduce((a, b) => a + b) / spectrum.length;
  let dynamicWaveHeight = map(avgSpectrum, 0, 255, 12, 50); // 动态波浪高度




  // 绘制中间区域
  fill('#535774'); // 颜色2
  // 这里的波浪可以与底部区域的效果相似，可以选择不同的绘制方式
  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = dynamicWaveHeight * sin(x * 0.05 + frameCount * 0.02) + height * 7 / 11;
    vertex(x, y);
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);

  // 绘制底部区域
  fill('#262835'); // 颜色1
  // 绘制波浪边界
  beginShape();
  for (let x = 0; x <= width; x += 10) {
    let y = dynamicWaveHeight * sin(x * 0.05 + frameCount * 0.05) + height * 9 / 11;
    vertex(x, y); // 定义波浪的每个顶点
  }
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);



}