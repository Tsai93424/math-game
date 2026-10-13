const WIDTH = 960;
const HEIGHT = 600;
const FONT = '"Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif';

const LEVELS = [
  { name: "綠芽森林", question: "7 + 5 = ?", answers: [10, 12, 13], correct: 12, sky: 0x94dce0, hill: 0x42aaa5, platform: 0x258e88, accent: 0xffcf69, mote: 0xeaffce },
  { name: "雲朵高地", question: "18 − 9 = ?", answers: [8, 9, 10], correct: 9, sky: 0xa9d9ff, hill: 0x648fce, platform: 0x4772b8, accent: 0xffd278, mote: 0xf4fdff },
  { name: "星星山谷", question: "4 × 6 = ?", answers: [20, 24, 28], correct: 24, sky: 0xc1b6f2, hill: 0x8272bd, platform: 0x6657a3, accent: 0xffcf69, mote: 0xf8f0ff },
  { name: "糖果城堡", question: "32 ÷ 4 = ?", answers: [6, 8, 9], correct: 8, sky: 0xffb8cd, hill: 0xd979a5, platform: 0xb85f91, accent: 0xffd86b, mote: 0xfff4fa },
  { name: "太陽神殿", question: "(12 + 8) ÷ 4 = ?", answers: [4, 5, 6], correct: 5, sky: 0xffca8d, hill: 0xd88949, platform: 0xb66c37, accent: 0x75e0cd, mote: 0xfff6d6 },
];

class AdventureScene extends Phaser.Scene {
  constructor() {
    super("Adventure");
    this.score = 0;
    this.levelIndex = 0;
    this.mode = "title";
    this.levelObjects = [];
    this.answerChoices = [];
    this.touchMove = 0;
    this.touchJump = false;
  }

  create() {
    this.createTextures();
    this.backgroundLayer = this.add.graphics().setDepth(-20);
    this.cameras.main.setBackgroundColor(0x9ad9de);
    this.drawLandscape(LEVELS[0]);
    this.createWorld();
    this.createHud();
    this.createTouchControls();
    this.createTitleScreen();

    this.keys = this.input.keyboard.addKeys("W,A,D,SPACE,R");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on("keydown-R", () => {
      if (this.mode === "won" || this.mode === "title") this.startGame();
    });
    document.getElementById("loading-note")?.remove();
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x18324a, 0.24).fillRoundedRect(4, 8, 56, 54, 17);
    g.fillStyle(0x38c8bb).fillRoundedRect(10, 25, 44, 32, 13);
    g.fillStyle(0xf8cb91).fillCircle(32, 24, 18);
    g.fillStyle(0xff8a72).fillTriangle(15, 16, 21, 2, 27, 16);
    g.fillStyle(0xff8a72).fillTriangle(37, 16, 43, 2, 49, 16);
    g.fillStyle(0x20345a).fillCircle(26, 24, 2.2).fillCircle(38, 24, 2.2);
    g.lineStyle(2, 0x20345a, 0.85).beginPath().arc(32, 26, 7, 0.35, Math.PI - 0.35).strokePath();
    g.fillStyle(0xffd36f).fillRoundedRect(41, 37, 13, 17, 5);
    g.fillStyle(0x20345a).fillRoundedRect(15, 52, 13, 9, 4).fillRoundedRect(36, 52, 13, 9, 4);
    g.generateTexture("explorer", 64, 68);
    g.clear();

    g.fillStyle(0xffffff, 0.23).fillCircle(46, 46, 44);
    g.fillStyle(0xffffff, 0.92).fillCircle(46, 46, 34);
    g.lineStyle(4, 0xffffff, 0.96).strokeCircle(46, 46, 33);
    g.fillStyle(0xffffff, 0.72).fillCircle(35, 33, 7);
    g.fillStyle(0xffffff, 0.75).fillTriangle(57, 40, 62, 48, 53, 49);
    g.generateTexture("answer-crystal", 92, 92);
    g.clear();

    g.fillStyle(0x17284a, 0.28).fillRoundedRect(0, 8, 192, 23, 11);
    g.fillStyle(0x94f3de).fillRoundedRect(0, 2, 192, 23, 11);
    g.fillStyle(0xffffff, 0.55).fillRoundedRect(13, 5, 166, 4, 2);
    g.generateTexture("island", 192, 34);
    g.clear();

    g.fillStyle(0x26385c).fillRect(0, 0, WIDTH, 48);
    g.fillStyle(0x54d9ba).fillRect(0, 0, WIDTH, 7);
    g.fillStyle(0xffffff, 0.12).fillRect(0, 8, WIDTH, 2);
    g.generateTexture("ground", WIDTH, 48);
    g.destroy();
  }

  roundedBox(width, height, color, alpha = 1, radius = 18, strokeColor = 0xffffff, strokeAlpha = 0, strokeWidth = 0) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, alpha).fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    if (strokeWidth > 0) {
      graphics.lineStyle(strokeWidth, strokeColor, strokeAlpha).strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    }
    return graphics;
  }

  drawLandscape(level) {
    const g = this.backgroundLayer;
    g.clear();
    this.cameras.main.setBackgroundColor(level.sky);
    g.fillStyle(level.mote, 0.24);
    [[80, 246, 5], [244, 287, 3], [408, 225, 4], [630, 275, 5], [838, 238, 4], [904, 332, 3], [341, 349, 3]].forEach(([x, y, r]) => g.fillCircle(x, y, r));
    g.fillStyle(level.hill, 0.23).fillEllipse(112, 476, 420, 206).fillEllipse(773, 465, 530, 220);
    g.fillStyle(level.hill, 0.48).fillEllipse(472, 535, 920, 246);
    g.fillStyle(0xffffff, 0.15).fillEllipse(78, 263, 68, 24).fillEllipse(105, 253, 44, 28).fillEllipse(133, 264, 56, 20);
    g.fillStyle(0xffffff, 0.13).fillEllipse(796, 322, 82, 23).fillEllipse(824, 313, 48, 28).fillEllipse(855, 323, 58, 20);
  }

  createWorld() {
    this.platforms = this.physics.add.staticGroup();
    this.ground = this.physics.add.staticImage(WIDTH / 2, 576, "ground").setDepth(3);
    this.player = this.physics.add.sprite(180, 510, "explorer").setDepth(5);
    this.player.setDisplaySize(52, 56);
    this.player.body.setSize(34, 50).setOffset(15, 12);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.04);
    this.player.body.setMaxVelocity(360, 680);
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);
    this.physics.world.gravity.y = 980;
  }

  createHud() {
    this.hud = this.add.container(0, 0).setDepth(20);
    this.add.text(30, 17, "數學星球", { fontFamily: FONT, fontSize: "17px", fontStyle: "bold", color: "#17314d" }).setDepth(20);
    this.add.text(30, 39, "MATH QUEST", { fontFamily: "Arial, sans-serif", fontSize: "9px", fontStyle: "bold", letterSpacing: 2, color: "#315c72" }).setDepth(20);

    this.stageLabel = this.add.text(468, 28, "第 1 關", {
      fontFamily: FONT, fontSize: "14px", fontStyle: "bold", color: "#18324b", backgroundColor: "#ffffffa8", padding: { x: 13, y: 7 },
    }).setOrigin(0.5).setDepth(20);
    this.scorePill = this.add.container(824, 31).setDepth(20);
    this.scorePill.add(this.add.rectangle(0, 0, 112, 40, 0x173451, 0.88).setStrokeStyle(1, 0xffffff, 0.3).setOrigin(0.5));
    this.scoreText = this.add.text(0, 0, "⭐ 0 分", { fontFamily: FONT, fontSize: "17px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);
    this.scorePill.add(this.scoreText);
    this.levelPips = [];
    for (let i = 0; i < 5; i += 1) {
      const pip = this.add.circle(0, 0, 5, 0xffffff, 0.48);
      this.levelPips.push(pip);
      this.hud.add(pip);
    }
    this.levelPips.forEach((pip, i) => {
      pip.setPosition(437 + i * 15, 56);
    });

    this.questionCard = this.add.container(WIDTH / 2, 125).setDepth(19);
    const questionShadow = this.roundedBox(880, 112, 0x142d48, 0.18, 20);
    questionShadow.setPosition(0, 5);
    const questionBackground = this.roundedBox(880, 112, 0xffffff, 0.88, 20, 0xffffff, 0.65, 2);
    this.questionCard.add([questionShadow, questionBackground]);
    this.questionTag = this.add.text(-399, -37, "關卡任務", { fontFamily: FONT, fontSize: "12px", fontStyle: "bold", color: "#386174" });
    this.questionText = this.add.text(0, -4, "", { fontFamily: FONT, fontSize: "34px", fontStyle: "bold", color: "#17314d" }).setOrigin(0.5);
    this.instructionText = this.add.text(0, 34, "跳上浮空石，碰到正確答案水晶", { fontFamily: FONT, fontSize: "13px", color: "#4b687d" }).setOrigin(0.5);
    this.questionCard.add([this.questionTag, this.questionText, this.instructionText]);
    this.questionCard.setVisible(false);

    this.feedback = this.add.container(WIDTH / 2, 266).setDepth(30).setVisible(false);
    this.feedbackBg = this.roundedBox(330, 54, 0x163554, 0.92, 18, 0xffffff, 0.52, 2);
    this.feedbackText = this.add.text(0, 0, "", { fontFamily: FONT, fontSize: "18px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);
    this.feedback.add([this.feedbackBg, this.feedbackText]);
  }

  createTouchControls() {
    this.touchControls = this.add.container(0, 0).setDepth(40);
    const makeButton = (x, icon, onDown, onUp) => {
      const group = this.add.container(x, 568);
      const circle = this.add.circle(0, 0, 29, 0x173451, 0.45).setStrokeStyle(2, 0xffffff, 0.54);
      const label = this.add.text(0, -1, icon, { fontFamily: "Arial, sans-serif", fontSize: "24px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);
      const hit = this.add.zone(0, 0, 62, 62).setInteractive();
      hit.on("pointerdown", () => { onDown(); circle.setFillStyle(0x347d8b, 0.8); });
      hit.on("pointerup", () => { onUp(); circle.setFillStyle(0x173451, 0.45); });
      hit.on("pointerout", () => { onUp(); circle.setFillStyle(0x173451, 0.45); });
      group.add([circle, label, hit]);
      this.touchControls.add(group);
    };
    makeButton(58, "◀", () => { this.touchMove = -1; }, () => { if (this.touchMove < 0) this.touchMove = 0; });
    makeButton(128, "▶", () => { this.touchMove = 1; }, () => { if (this.touchMove > 0) this.touchMove = 0; });
    makeButton(902, "↑", () => { this.touchJump = true; }, () => { this.touchJump = false; });
    this.add.text(480, 571, "← → 移動　　空白鍵 / ↑ 跳躍", {
      fontFamily: FONT, fontSize: "12px", color: "#ffffff", backgroundColor: "#17345188", padding: { x: 11, y: 5 },
    }).setOrigin(0.5).setDepth(40);
  }

  createTitleScreen() {
    this.titleLayer = this.add.container(0, 0).setDepth(50);
    this.titleLayer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x11213e, 0.43));
    const titlePanel = this.roundedBox(640, 450, 0x152644, 0.97, 30, 0xffffff, 0.45, 2).setPosition(WIDTH / 2, 310);
    const titleBadge = this.roundedBox(104, 32, 0x39cbb7, 1, 16).setPosition(WIDTH / 2, 135);
    this.titleLayer.add([titlePanel, titleBadge]);
    this.titleLayer.add(this.add.text(WIDTH / 2, 135, "五關冒險", { fontFamily: FONT, fontSize: "14px", fontStyle: "bold", color: "#123d50" }).setOrigin(0.5));
    this.titleLayer.add(this.add.text(WIDTH / 2, 193, "數學星球大冒險", { fontFamily: FONT, fontSize: "38px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5));
    this.titleLayer.add(this.add.text(WIDTH / 2, 238, "準備好用數學點亮星球了嗎？", { fontFamily: FONT, fontSize: "16px", color: "#c3d5f2" }).setOrigin(0.5));

    ["森林", "高地", "山谷", "城堡", "神殿"].forEach((name, i) => {
      const x = 303 + i * 89;
      this.titleLayer.add(this.add.circle(x, 296, 20, LEVELS[i].accent, 1).setStrokeStyle(3, 0xffffff, 0.75));
      this.titleLayer.add(this.add.text(x, 296, `${i + 1}`, { fontFamily: "Arial, sans-serif", fontSize: "16px", fontStyle: "bold", color: "#19334c" }).setOrigin(0.5));
      this.titleLayer.add(this.add.text(x, 329, name, { fontFamily: FONT, fontSize: "12px", color: "#d8e4f8" }).setOrigin(0.5));
    });

    const button = this.add.container(WIDTH / 2, 406);
    const buttonBg = this.roundedBox(254, 58, 0x43d4bc, 1, 18, 0xd8fff6, 0.7, 2);
    const drawButton = (color) => {
      buttonBg.clear();
      buttonBg.fillStyle(color, 1).fillRoundedRect(-127, -29, 254, 58, 18);
      buttonBg.lineStyle(2, 0xd8fff6, 0.7).strokeRoundedRect(-127, -29, 254, 58, 18);
    };
    const buttonText = this.add.text(0, 0, "開始闖關　➜", { fontFamily: FONT, fontSize: "20px", fontStyle: "bold", color: "#12394b" }).setOrigin(0.5);
    const hit = this.add.zone(0, 0, 254, 58).setInteractive({ useHandCursor: true });
    hit.on("pointerover", () => drawButton(0x73ecd5));
    hit.on("pointerout", () => drawButton(0x43d4bc));
    hit.on("pointerdown", () => this.startGame());
    button.add([buttonBg, buttonText, hit]);
    this.titleLayer.add(button);
    this.titleLayer.add(this.add.text(WIDTH / 2, 466, "答對 +10 分　　答錯 −5 分", { fontFamily: FONT, fontSize: "16px", fontStyle: "bold", color: "#f5d889" }).setOrigin(0.5));
    this.titleLayer.add(this.add.text(WIDTH / 2, 503, "用 ← → 或 A / D 移動，按空白鍵或 ↑ 跳躍", { fontFamily: FONT, fontSize: "13px", color: "#c3d5f2" }).setOrigin(0.5));
    this.titleLayer.add(this.add.text(WIDTH / 2, 531, "手機也可以使用畫面下方的方向按鈕", { fontFamily: FONT, fontSize: "12px", color: "#a8bddc" }).setOrigin(0.5));
  }

  startGame() {
    this.titleLayer?.destroy(true);
    this.titleLayer = undefined;
    this.mode = "playing";
    this.score = 0;
    this.levelIndex = 0;
    this.scoreText.setText("⭐ 0 分");
    this.player.setPosition(180, 510);
    this.player.setVelocity(0, 0);
    this.questionCard.setVisible(true);
    this.touchControls.setVisible(true);
    this.loadLevel();
  }

  loadLevel() {
    const level = LEVELS[this.levelIndex];
    this.mode = "playing";
    this.cameras.main.setBackgroundColor(level.sky);
    this.drawLandscape(level);
    this.stageLabel.setText(`第 ${this.levelIndex + 1} 關`);
    this.questionTag.setText(`${level.name}・關卡 ${String(this.levelIndex + 1).padStart(2, "0")}`);
    this.questionText.setText(level.question);
    this.levelPips.forEach((pip, i) => {
      pip.setFillStyle(i < this.levelIndex ? 0x28a995 : 0xffffff, i < this.levelIndex ? 1 : 0.48);
      pip.setRadius(i === this.levelIndex ? 7 : 5);
    });
    this.feedback.setVisible(false);
    this.clearLevelObjects();

    const heights = this.levelIndex % 2 === 0 ? [476, 440, 476] : [440, 476, 440];
    const spots = [
      { x: 180, y: heights[0] },
      { x: 480, y: heights[1] },
      { x: 780, y: heights[2] },
    ];
    spots.forEach((spot) => {
      const platform = this.platforms.create(spot.x, spot.y, "island").setTint(level.platform).setDepth(4);
      platform.setDisplaySize(184, 32).refreshBody();
      this.levelObjects.push(platform);
    });
    const shuffled = Phaser.Utils.Array.Shuffle([...level.answers]);
    this.answerChoices = shuffled.map((value, i) => this.createAnswer(value, spots[i], i, level));
    this.player.setPosition(180, 510);
    this.player.setVelocity(0, 0);
    this.player.setTint(0xffffff);
  }

  createAnswer(value, spot, index, level) {
    const colors = [0xff8c74, 0x5ee0c4, 0xffd15e];
    const image = this.physics.add.image(spot.x, spot.y - 43, "answer-crystal").setTint(colors[index]).setDepth(6);
    image.setDisplaySize(68, 68);
    image.body.setCircle(32, 14, 14);
    image.body.setAllowGravity(false);
    image.body.setImmovable(true);
    const label = this.add.text(spot.x, spot.y - 43, String(value), {
      fontFamily: FONT, fontSize: value >= 10 ? "22px" : "24px", fontStyle: "bold", color: "#19334c",
      stroke: "#ffffff", strokeThickness: 1,
    }).setOrigin(0.5).setDepth(7);
    const tag = this.add.text(spot.x, spot.y + 23, `水晶 ${String.fromCharCode(65 + index)}`, {
      fontFamily: FONT, fontSize: "11px", fontStyle: "bold", color: "#ffffff", backgroundColor: "#18334c99", padding: { x: 7, y: 4 },
    }).setOrigin(0.5).setDepth(8);
    const choice = { value, image, label, tag, active: true, correct: value === level.correct };
    this.physics.add.overlap(this.player, image, () => this.collectAnswer(choice));
    this.tweens.add({ targets: [image, label], y: spot.y - 48, duration: 750 + index * 90, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.levelObjects.push(image, label, tag);
    return choice;
  }

  collectAnswer(choice) {
    if (this.mode !== "playing" || !choice.active) return;
    choice.active = false;
    choice.image.disableBody(true, true);
    choice.label.setVisible(false);
    choice.tag.setVisible(false);
    if (choice.correct) {
      this.score += 10;
      this.updateScore();
      this.showFeedback("答對了！ +10 分 ✨", true);
      this.mode = "transition";
      this.player.setTint(0xfff2af);
      this.time.delayedCall(950, () => {
        this.levelIndex += 1;
        if (this.levelIndex >= LEVELS.length) this.showResults();
        else this.loadLevel();
      });
    } else {
      this.score -= 5;
      this.updateScore();
      this.showFeedback("再想一想！ −5 分", false);
      this.player.setVelocityY(-180);
      this.time.delayedCall(1050, () => {
        if (this.mode === "playing") this.feedback.setVisible(false);
      });
    }
  }

  updateScore() {
    this.scoreText.setText(`⭐ ${this.score} 分`);
  }

  showFeedback(message, good) {
    this.feedbackText.setText(message);
    this.feedbackBg.clear();
    this.feedbackBg.fillStyle(good ? 0x178b79 : 0x9b5363, 0.96).fillRoundedRect(-165, -27, 330, 54, 18);
    this.feedbackBg.lineStyle(2, 0xffffff, 0.52).strokeRoundedRect(-165, -27, 330, 54, 18);
    this.feedback.setAlpha(0).setVisible(true);
    this.tweens.killTweensOf(this.feedback);
    this.tweens.add({ targets: this.feedback, alpha: 1, y: 254, duration: 180, ease: "Back.Out" });
  }

  clearLevelObjects() {
    this.levelObjects.forEach((object) => {
      this.tweens.killTweensOf(object);
      if (object?.active) object.destroy();
    });
    this.levelObjects = [];
    this.answerChoices = [];
    this.platforms.clear(false, true);
  }

  showResults() {
    this.mode = "won";
    this.feedback.setVisible(false);
    this.questionCard.setVisible(false);
    this.touchControls.setVisible(false);
    this.levelPips.forEach((pip) => pip.setFillStyle(0x28a995, 1).setRadius(7));
    this.titleLayer = this.add.container(0, 0).setDepth(50);
    this.titleLayer.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x11213e, 0.5));
    const resultPanel = this.roundedBox(590, 370, 0x152644, 0.97, 30, 0xffffff, 0.45, 2).setPosition(WIDTH / 2, 295);
    this.titleLayer.add(resultPanel);
    this.titleLayer.add(this.add.text(WIDTH / 2, 174, "星球全都點亮了！", { fontFamily: FONT, fontSize: "34px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5));
    this.titleLayer.add(this.add.text(WIDTH / 2, 225, "五關完成，太棒了！", { fontFamily: FONT, fontSize: "18px", color: "#c3d5f2" }).setOrigin(0.5));
    this.titleLayer.add(this.add.text(WIDTH / 2, 300, `你的總分　${this.score} 分`, { fontFamily: FONT, fontSize: "30px", fontStyle: "bold", color: "#f6d77d" }).setOrigin(0.5));
    this.titleLayer.add(this.add.text(WIDTH / 2, 350, this.score >= 50 ? "數學小達人！每題都答對了！" : "繼續練習，你會越來越厲害！", { fontFamily: FONT, fontSize: "16px", color: "#d7e3f8" }).setOrigin(0.5));
    const again = this.add.container(WIDTH / 2, 420);
    const bg = this.roundedBox(234, 58, 0x43d4bc, 1, 18, 0xd8fff6, 0.7, 2);
    const drawAgainButton = (color) => {
      bg.clear();
      bg.fillStyle(color, 1).fillRoundedRect(-117, -29, 234, 58, 18);
      bg.lineStyle(2, 0xd8fff6, 0.7).strokeRoundedRect(-117, -29, 234, 58, 18);
    };
    const label = this.add.text(0, 0, "再玩一次　↻", { fontFamily: FONT, fontSize: "20px", fontStyle: "bold", color: "#12394b" }).setOrigin(0.5);
    const hit = this.add.zone(0, 0, 234, 58).setInteractive({ useHandCursor: true });
    hit.on("pointerover", () => drawAgainButton(0x73ecd5));
    hit.on("pointerout", () => drawAgainButton(0x43d4bc));
    hit.on("pointerdown", () => {
      this.titleLayer.destroy(true);
      this.titleLayer = undefined;
      this.questionCard.setVisible(true);
      this.touchControls.setVisible(true);
      this.startGame();
    });
    again.add([bg, label, hit]);
    this.titleLayer.add(again);
    this.titleLayer.add(this.add.text(WIDTH / 2, 484, "按 R 鍵也能重新開始", { fontFamily: FONT, fontSize: "13px", color: "#a8bddc" }).setOrigin(0.5));
  }

  update() {
    if (this.mode !== "playing" || !this.player?.body) return;
    const left = this.cursors.left.isDown || this.keys.A.isDown || this.touchMove < 0;
    const right = this.cursors.right.isDown || this.keys.D.isDown || this.touchMove > 0;
    if (left === right) this.player.setVelocityX(0);
    else {
      this.player.setVelocityX(left ? -250 : 250);
      this.player.setFlipX(left);
    }
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || (this.touchJump && onGround);
    if (jumpPressed && onGround) this.player.setVelocityY(-540);
  }
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: "#94dce0",
  render: { antialias: true, pixelArt: false },
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 980 }, debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [AdventureScene],
});
