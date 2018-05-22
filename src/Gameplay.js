var AMOUNT_DIAMONDS = 10;

GamePlayManager = {

    init: function () {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.flagFirstMouseDown = false;
    },
    preload: function () {
        game.load.image("background", "assets/images/background.png");
        game.load.image("explosion", "assets/images/explosion.png");
        game.load.spritesheet("horse", "assets/images/horse.png", 84, 156, 2);
        game.load.spritesheet("diamonds", "assets/images/diamonds.png", 81, 84, 4);
    },
    create: function () {
        game.add.sprite(0, 0, "background");
        this.horse = game.add.sprite(0, 0, "horse");
        this.horse.frame = 1;
        this.horse.x = game.width / 2;
        this.horse.y = game.height / 2;
        this.horse.anchor.setTo(0.5);

        game.input.onDown.add(this.onTap, this);

        this.diamonds = [];
        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
            var diamond = game.add.sprite(100, 100, "diamonds");
            diamond.frame = game.rnd.integerInRange(0, 3);
            diamond.scale.setTo(0.3 + game.rnd.frac());
            diamond.anchor.setTo(0.5);
            diamond.x = game.rnd.integerInRange(50, 1050);
            diamond.y = game.rnd.integerInRange(50, 600);

            this.diamonds[i] = diamond;
            var rectHorse = this.getBoundsDiamond(this.horse);
            var rectCurrentDiamond = this.getBoundsDiamond(diamond);

            while (this.isOverlappingotherDiamond(i, rectCurrentDiamond) || this.isRectangleOverlapping(rectHorse, rectCurrentDiamond)) {
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);
                rectCurrentDiamond = this.getBoundsDiamond(diamond)
            }
        }

        this.explosionGroup = game.add.group();

        for (var i = 0; i < 10; i++) {
            this.explosion = this.explosionGroup.create(100, 100, "explosion");
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                x: [0.4, 0.8, 0.4],
                y: [0.4, 0.8, 0.4]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                alpha: [1, 0.6, 0]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);
            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
        }
    },

    onTap: function () {
        this.flagFirstMouseDown = true;
    },

    getBoundsDiamond: function (currentDiamond) {
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },

    isRectangleOverlapping: function (rect1, rect2) {
        if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
            return false;
        }
        if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
            return false;
        }
        return true;
    },

    isOverlappingotherDiamond: function (index, rect2) {
        for (var i = 0; i < index; i++) {
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if (this.isRectangleOverlapping(rect1, rect2)) {
                return true;
            }
        }
        return false;
    },

    getBoundsHorse: function () {
        var x0 = this.horse.x - Math.abs(this.horse.width) / 4;
        var width = Math.abs(this.horse.width) / 2;
        var y0 = this.horse.y - this.horse.height / 2;
        var height = this.horse.height;

        return new Phaser.Rectangle(x0, y0, width, height);
    },

    update: function () {
        if (this.flagFirstMouseDown) {
            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distanceX = pointerX - this.horse.x;
            var distanceY = pointerY - this.horse.y;

            if (distanceX > 0) {
                this.horse.scale.setTo(1, 1);
            }
            if (distanceX < 0) {
                this.horse.scale.setTo(-1, 1);
            }

            this.horse.x += distanceX * 0.02;
            this.horse.y += distanceY * 0.02;
            for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
                var rectHorse = this.getBoundsHorse();
                var rectDiamond = this.getBoundsDiamond(this.diamonds[i]);
                if (this.diamonds[i].visible == true && this.isRectangleOverlapping(rectHorse, rectDiamond)) {
                    this.diamonds[i].visible = false;
                    var explosion = this.explosionGroup.getFirstDead();
                    if (explosion != null) {
                        explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();

                        explosion.tweenAlpha.onComplete.add(function (currentTarget, currentTween) {
                            currentTarget.kill();
                        }, this);
                    }
                }
            }
        }
    }
}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");