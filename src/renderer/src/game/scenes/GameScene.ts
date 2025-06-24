import Phaser from 'phaser';
import { type LaunchConfigCustomData } from '../index';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private coins!: Phaser.Physics.Arcade.Group;

  private score: number = 0;
  private onScoreUpdate!: (score: number) => void;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(): void {
    const customData = (this.game as any).customData as LaunchConfigCustomData;
    this.onScoreUpdate = customData.onScoreUpdate;
  }

  preload(): void {
    this.load.image('sky', 'assets/backgrounds/sky.png');
    this.load.image('ground', 'assets/tiles/ground_tile.png');
    this.load.image('coin', 'assets/collectables/coin.png');
    this.load.spritesheet('player', 'assets/sprites/player_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create(): void {
    this.add.image(400, 300, 'sky').setScrollFactor(0);

    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 5; i++) {
        this.platforms.create(128 + i * 256, 568, 'ground').setScale(2).refreshBody();
    }
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 300, 'ground');
    this.platforms.create(750, 280, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    
    this.coins = this.physics.add.group({
      key: 'coin',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 110 }
    });

    this.coins.children.iterate((child) => {
        const coin = child as Phaser.Physics.Arcade.Sprite;
        coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        // 1. Shrink the coin to 50% of its original size
        coin.setScale(0.5);

        // 2. Update the physics body to match the new, smaller scale
        coin.refreshBody();

        return true;
    });

    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'turn', frames: [{ key: 'player', frame: 4 }], frameRate: 20 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    
    // The overlap call is now type-safe with the corrected collectCoin method
    this.physics.add.overlap(
    this.player,
    this.coins,
    (player, coin) => {
        // Inside here, TypeScript correctly infers the types for player and coin
        this.collectCoin(
        player as Phaser.Types.Physics.Arcade.GameObjectWithBody,
        coin as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
    },
    undefined,
    this
    );


    this.physics.world.setBounds(0, 0, 1600, 600);
    this.cameras.main.setBounds(0, 0, 1600, 600);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.score = 0;
  }

  update(): void {
    if (!this.cursors || !this.player) { return; }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-350);
    }
  }

  private collectCoin(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody, 
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void {
    console.log('Coin collected!');
    const coinSprite = coin as Phaser.Physics.Arcade.Sprite;
    coinSprite.disableBody(true, true);

    this.score += 10;
    this.onScoreUpdate(this.score);
  }
}