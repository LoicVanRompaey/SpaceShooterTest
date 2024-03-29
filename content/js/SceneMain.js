class SceneMain extends Phaser.Scene {


    constructor() {
        super({key: "SceneMain"});
    }


    preload() {  //loads sprites and sounds voordat ze die gebruiken
        this.load.spritesheet("sprExplosion", "content/Sprites/sprExplosion.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("sprEnemy0", "content/Sprites/sprEnemy0.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("sprEnemy1", "content/Sprites/sprEnemy1.png");
        this.load.spritesheet("sprEnemy2", "content/Sprites/sprEnemy2.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.image("sprLaserEnemy0", "content/Sprites/sprLaserEnemy0.png");
        this.load.image("sprLaserPlayer", "content/Sprites/sprLaserPlayer.png");
        this.load.spritesheet("sprPlayer", "content/Sprites/sprPlayer.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.audio("sndExplode0", "content/Sound/sndExplode0.wav");
        this.load.audio("sndExplode1", "content/Sound/sndExplode1.wav");
        this.load.audio("sndLaser", "content/Sound/sndLaser.wav");
    }

    create() { //assets worden gemaakt met voorgeladen sprites and sounds

        var score = 0;
        var highScore = localStorage.getItem("highScore");
        var scoreText;
        var highScoreText;

        this.anims.create({
            key: "sprEnemy0",
            frames: this.anims.generateFrameNumbers("sprEnemy0"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "sprEnemy2",
            frames: this.anims.generateFrameNumbers("sprEnemy2"),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: "sprExplosion",
            frames: this.anims.generateFrameNumbers("sprExplosion"),
            frameRate: 20,
            repeat: 0
        });
        this.anims.create({
            key: "sprPlayer",
            frames: this.anims.generateFrameNumbers("sprPlayer"),
            frameRate: 20,
            repeat: -1
        });

        this.sfx = {
            explosions: [
                this.sound.add("sndExplode0"),
                this.sound.add("sndExplode1")
            ],
            laser: this.sound.add("sndLaser")
        };

        this.backgrounds = []; //laat de achtergrond bewegen, geeft illusie van bewegen
        for (var i = 0; i < 5; i++) {
            var bg = new ScrollingBackground(this, "sprBg0", i * 10);
            this.backgrounds.push(bg);
        }
        scoreText = this.add.text(16, 16, 'SCORE :' + score, {fontsize: '32px', fill: '#FFF'});
        highScoreText = this.add.text(425, 16, 'HIGH_SCORE:' + highScore, {fontsize: '32px', fill: '#FFF'});


        this.player = new Player(
            this,
            this.game.config.width * 0.5,
            this.game.config.height * 0.5,
            "sprPlayer",
        );


        //keybindings
        this.keyMoveUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyMoveDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyMoveLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keyMoveRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keyShoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.enemies = this.add.group();
        this.enemyLasers = this.add.group();
        this.playerLasers = this.add.group();

        this.time.addEvent({  //zorgt ervoor dat de soorten vijanden random spawnen
            delay: 500,     // kleinere delay = meer enemies
            callback: function () {
                var enemy = null;

                if (Phaser.Math.Between(0, 10) >= 3) {
                    enemy = new GunShip(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0
                    );
                } else if (Phaser.Math.Between(0, 10) >= 5) {
                    if (this.getEnemiesByType("ChaserShip").length < 5) {

                        enemy = new ChaserShip(
                            this,
                            Phaser.Math.Between(0, this.game.config.width),
                            0
                        );
                    }
                } else {
                    enemy = new CarrierShip(
                        this,
                        Phaser.Math.Between(0, this.game.config.width),
                        0
                    );
                }

                if (enemy !== null) {
                    enemy.setScale(Phaser.Math.Between(10, 20) * 0.1);
                    this.enemies.add(enemy);
                }
            },
            callbackScope: this,
            loop: true
        });

        //zorgt ervoor dat lasers schepen vernietigen
        this.physics.add.collider(this.playerLasers, this.enemies, function (playerLaser, enemy) {
            if (enemy) {
                if (enemy.onDestroy !== undefined) {
                    enemy.onDestroy();
                }
                enemy.explode(true);
                playerLaser.destroy();

                score += 50;
                scoreText.setText('SCORE :' + score);

                if (score >= highScore) {
                    highScore = score;
                    highScoreText.setText('HIGH_SCORE:' + highScore);
                    localStorage.setItem("highScore", highScore);                //slaagt highscore op, zoek naar mogelijk betere manier
                }

                localStorage.setItem("score", score);                           // opslaan score kan voor lag zorgen als die te veel op een korte periode wordt veranderd

            }
        });

        //zorgt ervoor dat schepen opblazen als ze botsen
        this.physics.add.overlap(this.player, this.enemies, function (player, enemy) {
                if (!player.getData("isDead") &&
                    !enemy.getData("isDead")) {
                    player.explode(false);
                    enemy.explode(true);
                        player.onDestroy();

                }
        });

        this.physics.add.overlap(this.player, this.enemyLasers, function (player, laser) {
            if (!player.getData("isDead") &&
                !laser.getData("isDead")) {
                player.explode(false);
                player.onDestroy();
                laser.destroy();
            }

        });
    }

    getEnemiesByType(type) {
        var arr = [];
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];
            if (enemy.getData("type") == type) {
                arr.push(enemy);
            }
        }
        return arr;
    }

    update() {

        if (!this.player.getData("isDead")) {
            this.player.update();
            if (this.keyMoveUp.isDown) {
                this.player.moveUp();
            } else if (this.keyMoveDown.isDown) {
                this.player.moveDown();
            }
            if (this.keyMoveLeft.isDown) {
                this.player.moveLeft();
            } else if (this.keyMoveRight.isDown) {
                this.player.moveRight();
            }

            if (this.keyShoot.isDown) {
                this.player.setData("isShooting", true);
            } else {
                this.player.setData("timerShootTick", this.player.getData("timerShootDelay") - 1);
                this.player.setData("isShooting", false);
            }
        }
        //zorgt ervoor dat assets offscreen verwijderd worden om lag te voorkomen
        for (var i = 0; i < this.enemies.getChildren().length; i++) {
            var enemy = this.enemies.getChildren()[i];

            enemy.update();

            if (enemy.x < -enemy.displayWidth ||
                enemy.x > this.game.config.width + enemy.displayWidth ||
                enemy.y < -enemy.displayHeight * 4 ||
                enemy.y > this.game.config.height + enemy.displayHeight) {
                if (enemy) {
                    if (enemy.onDestroy !== undefined) {
                        enemy.onDestroy();
                    }
                    enemy.destroy();
                }
            }
        }

        for (var i = 0; i < this.enemyLasers.getChildren().length; i++) {
            var laser = this.enemyLasers.getChildren()[i];
            laser.update();
            if (laser.x < -laser.displayWidth ||
                laser.x > this.game.config.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.game.config.height + laser.displayHeight) {
                if (laser) {
                    laser.destroy();
                }
            }
        }

        for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
            var laser = this.playerLasers.getChildren()[i];
            laser.update();
            if (laser.x < -laser.displayWidth ||
                laser.x > this.game.config.width + laser.displayWidth ||
                laser.y < -laser.displayHeight * 4 ||
                laser.y > this.game.config.height + laser.displayHeight) {
                if (laser) {
                    laser.destroy();
                }
            }
        }

        for (var i = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].update();
        }
    }
}