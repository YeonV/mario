import Phaser from 'phaser';
import { TouchControls, type LaunchConfigCustomData } from '../index';
import { THEMES } from '../themes';

interface ExtendedLaunchConfigCustomData extends LaunchConfigCustomData {
  onGameOver: () => void;
  onPause: () => void;
  currentThemeId: number;
  coinScale: number;
  bombScale: number;
  onControlsCreated: (controls: TouchControls) => void;
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private coins!: Phaser.Physics.Arcade.Group;
  private bombs!: Phaser.Physics.Arcade.Group;
  private background!: Phaser.GameObjects.TileSprite;
  private score: number = 0;
  private onScoreUpdate!: (score: number) => void;
  private onGameOver!: () => void;
  private onPause!: () => void;
  private currentThemeId!: number;
  private assetKeys!: { background: string, player: string, coin: string, ground: string, bomb: string };
  private coinScale!: number;
  private bombScale!: number;
  private onControlsCreated!: (controls: TouchControls) => void;
  // --- NEW: Internal flags for touch state ---
  private touchLeftIsDown: boolean = false;
  private touchRightIsDown: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(): void {
    const customData = (this.game as any).customData as ExtendedLaunchConfigCustomData;
    this.onScoreUpdate = customData.onScoreUpdate;
    this.onGameOver = customData.onGameOver;
    this.onPause = customData.onPause;
    this.currentThemeId = customData.currentThemeId;
    this.coinScale = customData.coinScale;
    this.bombScale = customData.bombScale;
    this.onControlsCreated = customData.onControlsCreated

    // Dynamically generate the asset keys based on the theme ID
    this.assetKeys = {
      background: `sky${this.currentThemeId}`,
      player: `player${this.currentThemeId}`,
      coin: `coin${this.currentThemeId}`,
      ground: `ground${this.currentThemeId}`,
      bomb: `bomb${this.currentThemeId}`,
    };
  }

  preload(): void {
    // Loop through all defined themes and preload their assets
    THEMES.forEach(theme => {
      this.load.image(`sky${theme.id}`, `assets/backgrounds/sky${theme.id}.png`);
      this.load.image(`coin${theme.id}`, `assets/collectables/coin${theme.id}.png`);
      this.load.image(`ground${theme.id}`, `assets/tiles/ground${theme.id}.png`);
      this.load.image(`bomb${theme.id}`, `assets/sprites/bomb${theme.id}.png`);
      this.load.spritesheet(`player${theme.id}`, `assets/sprites/player${theme.id}.png`, {
        frameWidth: 32,
        frameHeight: 48,
      });
    });

    this.load.audio('music', ['assets/sfx/music.ogg', 'assets/sfx/music.m4a']);
    this.load.audio('jump', ['assets/sfx/jump.ogg', 'assets/sfx/jump.m4a']);
    this.load.audio('coin', ['assets/sfx/coin.ogg', 'assets/sfx/coin.m4a']);
    this.load.audio('gameover', ['assets/sfx/gameover.ogg', 'assets/sfx/gameover.m4a']);
    this.load.audio('powerup', ['assets/sfx/powerup.ogg', 'assets/sfx/powerup.m4a']);
    
  }

  create(): void {
    this.background = this.add.tileSprite(0, 0, 800, 600, this.assetKeys.background).setOrigin(0, 0);
    this.background.setScrollFactor(0);

    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 10; i++) {
        this.platforms.create(128 + i * 256, 568, this.assetKeys.ground).setScale(2).refreshBody();
    }
    this.platforms.create(600, 400, this.assetKeys.ground);
    this.platforms.create(50, 300, this.assetKeys.ground);
    this.platforms.create(750, 280, this.assetKeys.ground);
    this.platforms.create(1100, 450, this.assetKeys.ground);
    this.platforms.create(1300, 320, this.assetKeys.ground);
    this.platforms.create(1550, 200, this.assetKeys.ground);
    this.platforms.create(1800, 400, this.assetKeys.ground).setScale(0.5, 1).refreshBody();
    this.platforms.create(2000, 300, this.assetKeys.ground);

    this.player = this.physics.add.sprite(100, 450, this.assetKeys.player);
    this.player.setBounce(0.2).setCollideWorldBounds(true);

    this.coins = this.physics.add.group({ key: this.assetKeys.coin, repeat: 23, setXY: { x: 12, y: 0, stepX: 90 } });
    this.coins.children.iterate((c) => {
        const coin = c as Phaser.Physics.Arcade.Sprite;
        coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setScale(this.coinScale).refreshBody();
        return true;
    });

    // Since all players are 9-frame spritesheets, we can create the animations universally.
    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers(this.assetKeys.player, { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'turn', frames: [{ key: this.assetKeys.player, frame: 4 }], frameRate: 20 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers(this.assetKeys.player, { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

    if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();

    const touchControls: TouchControls = {
      left: (isDown) => { this.touchLeftIsDown = isDown; },
      right: (isDown) => { this.touchRightIsDown = isDown; },
      up: () => {
        // Only jump if the player is on the ground
        if (this.player.body?.touching.down) {
          this.player.setVelocityY(-350);
          this.sound.play('jump', { volume: 0.6 });
        }
      },
    };
    this.onControlsCreated(touchControls);
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(this.player, this.bombs, (player, bomb) => {
        this.hitBomb(
            player as Phaser.Types.Physics.Arcade.GameObjectWithBody,
            bomb as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
    }, undefined, this);

    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
        this.collectCoin(player as Phaser.GameObjects.GameObject, coin as Phaser.GameObjects.GameObject);
    }, undefined, this);

    const worldWidth = 2400;
    this.physics.world.setBounds(0, 0, worldWidth, 600);
    this.cameras.main.setBounds(0, 0, worldWidth, 600).startFollow(this.player, true, 0.08, 0.08);

    this.score = 0;

    this.input.keyboard?.on('keydown-ESC', () => {
        this.scene.pause();
        this.onPause();
    });
    const music = this.sound.add('music', { loop: true, volume: 0.4 });
    music.play();
    (this.game as any).musicTrack = music;
  }

  update(): void {
    if (!this.cursors || !this.player || !this.player.active) { return; }
    
    this.background.tilePositionX = this.cameras.main.scrollX * 0.3;

    if (this.cursors.left.isDown || this.touchLeftIsDown) {
        this.player.setVelocityX(-200);
        this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown || this.touchRightIsDown) {
        this.player.setVelocityX(200);
        this.player.anims.play('right', true);
    } else {
        this.player.setVelocityX(0);
        this.player.anims.play('turn');
    }
    if (this.cursors.up.isDown && this.player.body?.touching.down) {
        this.player.setVelocityY(-350);
        this.sound.play('jump', { volume: 0.6 });
    }
  }

  private collectCoin(_player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject): void {
    const coinSprite = coin as Phaser.Physics.Arcade.Sprite;
    coinSprite.disableBody(true, true);
    this.score += 10;
    this.onScoreUpdate(this.score);
    this.sound.play('coin');

    if (this.coins.countActive(true) === 0) {
        this.sound.play('powerup', { volume: 0.6 });
        this.coins.children.iterate((c) => {
            const coin = c as Phaser.Physics.Arcade.Sprite;
            coin.enableBody(true, coin.x, 0, true, true);
            return true;
        });

        for (let i = 0; i < 2; i++) {
            const x = (this.player.x < 1200) ? Phaser.Math.Between(1200, 2400) : Phaser.Math.Between(0, 1200);
            const bomb = this.bombs.create(x, 16, `bomb${this.currentThemeId}`) as Phaser.Physics.Arcade.Sprite;
            bomb.setScale(this.bombScale).refreshBody();
            bomb.setBounce(1).setCollideWorldBounds(true).setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }
  }
  
  private hitBomb(_player: Phaser.Types.Physics.Arcade.GameObjectWithBody, _bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody): void {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.anims.play('turn');
    this.player.active = false;
    const musicTrack = (this.game as any).musicTrack as Phaser.Sound.BaseSound;
    if (musicTrack) {
      musicTrack.stop();
    }
    this.sound.play('gameover'); 
    this.onGameOver();
  }
}