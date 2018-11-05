window.PIXI = require('libs/gamelibs/pixi.min.js')
window.p2 = require('libs/gamelibs/p2.min.js')
window.Phaser = require('libs/gamelibs/phaser-split.min.js')
window.scrollTo = function() {}

const birds = [
  'images/bird1.png',
  'images/bird2.png',
  'images/bird3.png'
]
let b = 0

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // get screen size
    this.screenSize = {
      w: window.innerWidth || 320,
      h: window.innerHeight || 568
    }

    // score
    this.score = 0

    // phaser config
    const conf = {
      width: this.screenSize.w,
      height: this.screenSize.h,
      canvas: canvas,
      renderer: Phaser.CANCAS,
      parent: 'phaser',
      transparent: false,
      backgroundColor: '#71c5cf',
      antialias: false,
      scaleMode: Phaser.ScaleManager.EXACT_FIT
    }

    // create game
    this.game = new Phaser.Game(conf)
    this.game.state.add('main', { 
      preload: this.preload,
      create: this.create,
      update: this.update,
      jump: this.jump,
      addOnePig: this.addOnePig,
      addRowOfPigs: this.addRowOfPigs,
      hitPig: this.hitPig,
      restartGame: this.restartGame,
      score: this.score
    })
    this.game.state.start('main')
  }

  preload() {
    (b === birds.length) && (b = 0)
    this.game.load.image('bird', birds[b++])
    this.game.load.image('pig', 'images/pig.png')
    this.game.load.audio('jump', 'audio/jump.wav')
  }

  create() {
    // clear score
    this.score = 0
    // add listener
    this.game.input.onDown.add(this.jump, this)

    // draw pigs
    this.pigs = this.game.add.group()
    this.pigs.createMultiple(20, 'pig')
    this.timer = this.game.time.events.loop(1500, this.addRowOfPigs, this)

    // draw bird
    this.bird = this.game.add.sprite(100, 245, 'bird')
    this.game.physics.arcade.enable([this.bird, this.pigs])
    this.bird.body.gravity.y = 1000
    // change the anchor point of the bird
    this.bird.anchor.setTo(-0.2, 0.5)

    let style = { font: '30px Arial', fill: '#ffffff' }
    this.labelScore = this.game.add.text(20, 20, this.score, style)

    // add sound
    this.jumpSound = this.game.add.audio('jump')
  }

  update() {
    if(this.bird.inWorld === false) {
      console.log('not in world')
      this.restartGame()
    }

    if(this.bird.angle < 20) {
      this.bird.angle += 1
    }
    this.game.physics.arcade.overlap(this.bird, this.pigs, this.hitPig, null ,this)
  }

  // jump func
  jump() {
    // if the bird hit a pig, no jump
    if (this.bird.alive == false)
      return

    this.bird.body.velocity.y = -350;

    // Animation to rotate the bird
    this.game.add.tween(this.bird).to({ angle: -20 }, 100).start();

    // Play a jump sound
    this.jumpSound.play();
  }

  addOnePig(x, y) {
    var pig = this.pigs.getFirstDead()
    // this.game.physics.arcade.enable(pig)
    pig.reset(x, y);
    console.log(pig)
    pig.body.velocity.x = -200;
    pig.outOfBoundsKill = true;
  } 

  addRowOfPigs() {
    var hole = Math.floor(Math.random() * 5) + 1;

    for (var i = 0; i < 8; i++)
      if (i != hole && i != hole + 1)
        this.addOnePig(400, i * 60 + 10)

    this.score += 1
    console.log(this.score)
    this.labelScore.content = this.score
  }

  hitPig() {
    // if the bird has already hit a pig, we have nothing to do
    if (this.bird.alive === false) {
      return
    }

    // set the alive flag to false
    this.bird.alive = false

    // prevent new pigs from apearing
    this.game.time.events.remove(this.timmer)

    // go through all the pigs, and stop thire movement
    this.pigs.forEachAlive(function (p) {
      p.body.velocity.x = 0
    }, this)
  }

  restartGame() {
    this.game.time.events.remove(this.timer)
    this.game.state.start('main')
  } 

}
