class Player extends Entity {

    constructor(scene, x, y, key) {
        super(scene, x, y, key, "Player");

        this.setData("speed", 200);
        this.setData("isShooting", false);
        this.setData("timerShootDelay", 4);
        this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
        this.health = 3;
        this.resetTime = 3;
        this.blinkDelay = 0.2;
        this.shipIsIinvulnerable;
    }


    moveUp() {
        this.body.velocity.y = -this.getData("speed");
    }

    moveDown() {
        this.body.velocity.y = this.getData("speed");
    }

    moveLeft() {
        this.body.velocity.x = -this.getData("speed");
    }

    moveRight() {
        this.body.velocity.x = this.getData("speed");
    }

    /* resetPlayer() { //TODO debug respawn
        this.shipIsInvulnerable = true;
        this.sprite.reset(this.x, this.y); // undefined error voor 'sprite' hier
        game.time.events.add(Phaser.Timer.SECOND * this.resetTime, this.shipReady(), this);
        game.time.events.repeat(Phaser.Timer.SECOND * this.blinkDelay, this.resetTime / this.blinkDelay,
            this.shipBlink(), this);

    } */

    /*   shipReady() {
          this.shipIsInvulnerable = false;
          this.visible = true;
      } */

    /*   shipBlink() {
           this.visible != this.visible;
       } */

    onDestroy() {


        this.scene.time.addEvent({
            delay: 1000,
            callback: function () {
                this.scene.scene.start("SceneGameOver");

            },

            callbackScope: this,
            loop: false
        });
    }


    update() {
        this.body.setVelocity(0, 0);
        this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
        this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);

        if (this.getData("isShooting")) {
            if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
                this.setData("timerShootTick", this.getData("timerShootTick") + 1);
            } else {
                var laser = new PlayerLaser(this.scene, this.x, this.y);
                this.scene.playerLasers.add(laser);

                this.scene.sfx.laser.play(); // pew pew
                this.setData("timerShootTick", 0);
            }
        }
    }
}