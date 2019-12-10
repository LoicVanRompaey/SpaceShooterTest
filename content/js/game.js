var config = {

    type: Phaser.AUTO,
    width: 600,
    height: 800,                     //size gamepage
    backgroundColor: "black",
    physics: {
        default: "arcade",           // game physics, basic collision mechanics
        arcade:{
            gravity:{x:0, y:0}      //default gravity

        }
    },
    scene: [
        SceneMainMenu,
        SceneMain,
        SceneGameOver           //order beslist welk scherm je eerst ziet
    ],
    pixelArt: true,              //old school pixel graphics
    roundPixels: true

};

var game = new Phaser.Game(config);