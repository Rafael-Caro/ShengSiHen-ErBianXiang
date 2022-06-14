var mainHeight = 4000;
var mainWidth = 1350;
var version;

var margin = 40;

var linesInfo;
var voiceTrack;
var accTrack;

var lines = [];
var linesNum;
var lineHeight;
var maxDur = 94.63;
var maxLoud = 0.167;
var loudHeight = 10;
var plotMaxWidth = mainWidth-2*margin;

var gradeLines = [7, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4, 5];

var buttons = [];
var showBeats;
var showGrid;
var showLyr;
var tuoqiang;
var playVoice;
var playAcc;

var htmls = {
  "play": {
    "en": "Play",
    "es": "Toca"
  },
  "stop": {
    "en": "Stop",
    "es": "Para"
  }
}

function preload () {
  version = document.documentElement.lang;
  if (version == 'en') {
    linesInfo = loadJSON("files/shengsihen-erbianxiang-lines.json");
    voiceTrack = loadSound("tracks/shengsihen-erbianxiang-voice.mp3");
    voiceTrack.setVolume(2.0);
    accTrack = loadSound("tracks/shengsihen-erbianxiang-acc.mp3");
  } else if (version == 'es') {
    linesInfo = loadJSON("../files/shengsihen-erbianxiang-lines.json");
    voiceTrack = loadSound("../tracks/shengsihen-erbianxiang-voice.mp3");
    accTrack = loadSound("../tracks/shengsihen-erbianxiang-acc.mp3");
  }
}

function setup () {
  var canvas = createCanvas(mainWidth, mainHeight);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; position: relative;");
  canvas.parent("sketch-holder");

  ellipseMode(CORNER);
  strokeJoin(ROUND);

  linesNum = Object.keys(linesInfo).length;
  lineHeight = mainHeight/linesNum;
  for (var i = 0; i < linesNum; i++) {
    var thisLine = {};
    var x1 = margin;
    var x2 = map(linesInfo[str(i)]['dur'], 0, maxDur, margin, mainWidth-margin);
    var y1 = lineHeight * i + margin;
    var y2 = y1 + lineHeight - 2 * margin;
    var start = linesInfo[str(i)]['start'];
    var end = linesInfo[str(i)]['end'];
    var track = linesInfo[str(i)]['track'];
    var thisTrack = []
    for (var j = start*100; j < end*100+1; j++) {
      if (track[str(int(j))] != undefined) {
        var x = map(j, start*100, end*100, x1, x2);
        var y = map(track[str(int(j))]['p'], -200, 2000, y2, y1);
        var l = map(track[str(int(j))]['l'], 0, maxLoud, 0, loudHeight);
        y = y - (l/2);
        thisTrack.push([x, y, l]);
      }
    }
    var grades = [-100, 0, 200, 400, 500, 700, 900, 1100, 1200, 1400, 1600, 1700, 1900];
    var grid = [];
    for (var k = 0; k < grades.length; k++) {
      var grade = map(grades[k], -200, 2000, y2, y1);
      grid.push(grade);
    }
    var ban = [];
    for (var l = 0; l < linesInfo[str(i)]['ban'].length; l++) {
      var thisBan = map(linesInfo[str(i)]['ban'][l], start, end, x1, x2);
      ban.push(thisBan);
    }
    var gu = [];
    for (var m = 0; m < linesInfo[str(i)]['gu'].length; m++) {
      var thisGu = map(linesInfo[str(i)]['gu'][m], start, end, x1, x2);
      gu.push(thisGu);
    }
    var syl = [];
    for (var n = 0; n < linesInfo[str(i)]['syllables'].length; n++) {
      var syllable = linesInfo[str(i)]['syllables'][n]['syl'];
      var xSyl = map(linesInfo[str(i)]['syllables'][n]['pos'], start, end, x1, x2);
      syl.push([syllable, xSyl]);
    }
    var timeStamps = [];
    for (var ts = Math.ceil(start/10); ts < Math.floor(end/10)+1; ts++) {
      var pos = map(ts*10, start, end, x1, x2);
      var t = niceTime(ts*10);
      timeStamps.push([pos, t]);
    }
    if (Math.ceil(start/10)*10 - start < 3) {
      timeStamps = timeStamps.slice(1, timeStamps.length);
    }
    if (end - Math.floor(end/10)*10 < 3) {
      timeStamps = timeStamps.slice(0, timeStamps.length-1);
    }
    var tq = [];
    for (var p = 0; p < linesInfo[str(i)]['tq'].length; p++) {
      var tqstart = map(linesInfo[str(i)]['tq'][p][0], start, end, x1, x2);
      var tqend = map(linesInfo[str(i)]['tq'][p][1], start, end, x1, x2);
      tq.push([tqstart, tqend-tqstart]);
    }
    thisLine['lyr'] = linesInfo[str(i)]['label'];
    thisLine['banshi'] = linesInfo[str(i)]['banshi'];
    thisLine['trans'] = linesInfo[str(i)]['trans'][version];
    thisLine['type'] = linesInfo[str(i)]['type'];
    thisLine['syl'] = syl;
    thisLine['start'] = start;
    thisLine['end'] = end;
    thisLine['x1'] = x1;
    thisLine['x2'] = x2;
    thisLine['y1'] = y1;
    thisLine['y2'] = y2;
    thisLine['track'] = thisTrack;
    thisLine['grid'] = grid;
    thisLine['ban'] = ban;
    thisLine['gu'] = gu;
    thisLine['tS'] = timeStamps;
    thisLine['tq'] = tq;
    lines.push(thisLine);

    var playButton = createButton(htmls.play[version], i)
      .size(100, 25)
      .position(x1+3, y2-27)
      // .mousePressed(player(start, end))
      .mousePressed(player)
      .parent("sketch-holder");
    buttons.push(playButton);
  }

  showGrid = select('#grid');
  showBeats = select('#beats');
  showLyr = select('#lyrics');
  tuoqiang = select('#tuoqiang');
  playVoice = select('#playVoice');
  playAcc = select('#playAcc');
}

function draw () {
  background(255);

  for (var i = 0; i < linesNum; i++) {
    var linea = lines[str(i)];
      textAlign(LEFT, BOTTOM);
      textStyle(NORMAL);
      stroke(0);
      strokeWeight(1);
      textSize(15);
      text(linea.banshi, linea.x1, linea.y1-5);
      noStroke();
      text('   |   ' + linea.lyr, textWidth(linea.banshi)+linea.x1, linea.y1-5);
      textAlign(LEFT, TOP);
      noStroke();
      textStyle(ITALIC);
      textSize(15);
      text(linea.trans, linea.x1, linea.y2+20);
    if (showGrid.checked()) {
      for (var k = 0; k < linea.grid.length; k++) {
        if (k == 1 || k == 8) {
          strokeWeight(1);
          stroke(255, 0, 0);
        } else {
          strokeWeight(0.5);
          stroke(100);
        }
        line(linea.x1, linea.grid[k], linea.x2, linea.grid[k])
        textAlign(RIGHT, CENTER);
        textStyle(NORMAL);
        noStroke();
        fill(0);
        textSize(10);
        text(gradeLines[k], linea.x1-5, linea.grid[k]);
        textAlign(LEFT, CENTER);
        text(gradeLines[k], linea.x2+5, linea.grid[k]);
      }
    }
    strokeWeight(1);
    stroke(0);
    line(linea.x1, linea.y1, linea.x1, linea.y2);
    line(linea.x1, linea.y2, linea.x2, linea.y2);
    line(linea.x1, linea.y2, linea.x1, linea.y2+3);
    line(linea.x2, linea.y2, linea.x2, linea.y2+3);
    textAlign(CENTER, TOP);
    textStyle(NORMAL);
    noStroke();
    fill(0);
    textSize(10);
    text(niceTime(linea.start), linea.x1, linea.y2+5);
    textAlign(CENTER, TOP);
    text(niceTime(linea.end), linea.x2, linea.y2+5);
    for (var o = 0; o < linea.tS.length; o++) {
      strokeWeight(1);
      stroke(0);
      line(linea.tS[o][0], linea.y2, linea.tS[o][0], linea.y2+3);
      noStroke();
      text(linea.tS[o][1], linea.tS[o][0], linea.y2+5);
    }
    if (showBeats.checked()) {
      for (var l = 0; l < linea.ban.length; l++) {
        strokeWeight(1.5);
        stroke(153, 50, 204);
        // stroke(200);
        line(linea.ban[l], linea.y1, linea.ban[l], linea.y2);
      }
      for (var m = 0; m < linea.gu.length; m++) {
        strokeWeight(0.5);
        // stroke(153, 50, 204);
        stroke(100);
        line(linea.gu[m], linea.y1, linea.gu[m], linea.y2);
      }
    }
    if (linea.type[0] == 'O') {
      stroke(255, 140, 0);
    } else {
      stroke(0, 100, 0);
    }
    var track = linea.track;
    for (var j = 0; j < Object.keys(track).length; j++) {
      var x = track[j][0];
      var y1 = track[j][1];
      var y2 = y1 + track[j][2];
      strokeWeight(1.5);
      line(x, y1, x, y2);
    }
    if (tuoqiang.checked()) {
      for (var p = 0; p < linea.tq.length; p++) {
        noStroke();
        fill(65, 105, 225, 50);
        rect(linea.tq[p][0], linea.y1, linea.tq[p][1], linea.y2-linea.y1);
      }
    }
    if (showLyr.checked()) {
      for (var n = 0; n < linea.syl.length; n++) {
        var syl = linea.syl[n];
        textAlign(LEFT, TOP);
        textStyle(NORMAL);
        noStroke();
        fill(0);
        textSize(12);
        text(syl[0], syl[1], linea.y1+12);
      }
    }
  }
}

function player() {
  var i = int(mouseY / lineHeight)
  var button = buttons[i];
  if (button.html() == htmls.play[version]) {
    button.html(htmls.stop[version]);
    var start = lines[i]['start'];
    var end = lines[i]['end'];
    // outputVolume(1.0);
    if (playVoice.checked()) {
      voiceTrack.jump(start, end-start);
    }
    if (playAcc.checked()) {
      accTrack.jump(start, end-start);
    }
  } else {
    button.html(htmls.play[version]);
    voiceTrack.stop();
    accTrack.stop();
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
