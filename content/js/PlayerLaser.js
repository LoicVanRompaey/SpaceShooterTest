class PlayerLaser extends Entity{
    constructor(scene, x, y) {
        super(scene, x, y, "sprLaserPlayer");
        this.body.velocity.y= -200;
    }
}