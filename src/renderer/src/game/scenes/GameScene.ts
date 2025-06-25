import Phaser from 'phaser';
import { type LaunchConfigCustomData } from '../index';

// --- NEW: Add onGameOver to our custom data interface ---
interface ExtendedLaunchConfigCustomData extends LaunchConfigCustomData {
  onGameOver: () => void;
  onPause: () => void; 
}

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private coins!: Phaser.Physics.Arcade.Group;
  // --- NEW: Add a property for the bombs group ---
  private bombs!: Phaser.Physics.Arcade.Group;
  private background!: Phaser.GameObjects.TileSprite;
  private score: number = 0;
  private onScoreUpdate!: (score: number) => void;
  // --- NEW: Add a property for the game over callback ---
  private onGameOver!: () => void;
  private onPause!: () => void;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(): void {
    const customData = (this.game as any).customData as ExtendedLaunchConfigCustomData;
    this.onScoreUpdate = customData.onScoreUpdate;
    // --- NEW: Get the onGameOver function from React ---
    this.onGameOver = customData.onGameOver;
    this.onPause = customData.onPause
  }

  preload(): void {
    this.load.image('night-sky', 'assets/backgrounds/night_sky.png');
    this.load.image('sky', 'assets/backgrounds/sky.png');
    this.load.image('ground', 'assets/tiles/ground_tile.png');
    this.load.image('coin', 'assets/collectables/coin.png');
    // --- NEW: Load the bomb image ---
    this.load.image('bomb', 'assets/sprites/bomb.png');
    this.load.spritesheet('player', 'assets/sprites/player_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create(): void {
    // ... (existing code for sky, platforms, player, coins, anims)
    this.add.image(400, 300, 'sky').setScrollFactor(0);
    this.background = this.add.tileSprite(0, 0, 800, 600, 'night-sky').setOrigin(0, 0)
    this.background.setScrollFactor(0);
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
    
    this.coins = this.physics.add.group({ key: 'coin', repeat: 11, setXY: { x: 12, y: 0, stepX: 110 } });
    this.coins.children.iterate((c) => {
      const coin = c as Phaser.Physics.Arcade.Sprite;
      coin.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)).setScale(0.3).refreshBody();
      return true;
    });

    this.anims.create({ key: 'left', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'turn', frames: [{ key: 'player', frame: 4 }], frameRate: 20 });
    this.anims.create({ key: 'right', frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }), frameRate: 10, repeat: -1 });

    if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();

    // --- NEW: Create the bombs group ---
    this.bombs = this.physics.add.group();

    // --- NEW: Define Colliders and Overlaps ---
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms); // Bombs should sit on platforms

    // When player hits a bomb, call hitBomb
    this.physics.add.collider(this.player, this.bombs, (player, bomb) => {
        this.hitBomb(
            player as Phaser.Types.Physics.Arcade.GameObjectWithBody,
            bomb as Phaser.Types.Physics.Arcade.GameObjectWithBody
        )
    }, undefined, this);

    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
        this.collectCoin(
            player as Phaser.Types.Physics.Arcade.GameObjectWithBody,
            coin as Phaser.Types.Physics.Arcade.GameObjectWithBody
        );
    }, undefined, this);

    this.physics.world.setBounds(0, 0, 1600, 600);
    this.cameras.main.setBounds(0, 0, 1600, 600).startFollow(this.player, true, 0.08, 0.08);

    this.score = 0;

    this.input.keyboard?.on('keydown-ESC', () => {
        this.scene.pause(); // Pause Phaser's update loop
        this.onPause();     // Tell React to show the pause menu
    });
  }

  update(): void {
    // ... (existing update logic)
    if (!this.cursors || !this.player) { return; }
    if (this.player.active === false) { return; } // Don't allow movement if game is over
    this.background.tilePositionX = this.cameras.main.scrollX * 0.3;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200); this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200); this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0); this.player.anims.play('turn');
    }
    if (this.cursors.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-350);
    }
  }

  private collectCoin(_player: Phaser.Types.Physics.Arcade.GameObjectWithBody, coin: Phaser.Types.Physics.Arcade.GameObjectWithBody): void {
    const coinSprite = coin as Phaser.Physics.Arcade.Sprite;
    coinSprite.disableBody(true, true);
    this.score += 10;
    this.onScoreUpdate(this.score);

    // --- NEW: Spawn a bomb every time all coins are collected ---
    if (this.coins.countActive(true) === 0) {
      this.coins.children.iterate((c) => {
        const coin = c as Phaser.Physics.Arcade.Sprite;
        coin.enableBody(true, coin.x, 0, true, true); // Re-enable all coins
        return true;
      });

      // Spawn a bomb at a random x position across from the player
      const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
      const bomb = this.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }
  
  // --- NEW: The function that runs when the player hits a bomb ---
  private hitBomb(_player: Phaser.Types.Physics.Arcade.GameObjectWithBody, _bomb: Phaser.Types.Physics.Arcade.GameObjectWithBody): void {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.anims.play('turn');
    this.player.active = false; // Mark player as inactive

    // Call the function to update React/Zustand state
    this.onGameOver();
  }
}