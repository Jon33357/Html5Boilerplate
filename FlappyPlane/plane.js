function plane(img, speed) {

    var sprite = new SpriteSheet(img, 110, 50);
    var anim = new Animation(sprite, 10, 0, 1);
    var crashImage = new Animation(sprite, 0, 2, 2);
    var movement = new Phisics();
    var stateOnMovement = false;
    var floorLimit = 570;
    var gravity = 10;
    var _speed = speed;
    this.x = 300;
    this.y = 200;
    this.width = sprite.frameWidth;
    this.height = sprite.frameHeight;

    this.draw = function () {

        if (global.gameOver) {
            crashImage.draw(this.x, this.y);
            return;
        }
        anim.draw(this.x,this.y);
    };


    this.update = function () {

        if (global.keyPressed) { 
            global.keyPressed = false;
            stateOnMovement = true;
            movement.update(this.y, true);
        }
   
        if (stateOnMovement) {
            this.y = movement.update(this.y, false);
        } else {
            this.y += gravity;
        }
        if (this.y > floorLimit) {
            this.y = floorLimit;
            stateOnMovement = false;
        }
        if (this.y < 0) { this.y = 0; }
        anim.update();
    };
}


function Phisics() {

    var movementSeq = [{ cycles: 15, gravity: -3 }, { cycles: 10, gravity: -2 }, { cycles: 10, gravity: -1 }, { cycles: 10, gravity: 0 }, { cycles: 10, gravity: 1 },
        { cycles: 15, gravity: 3 }, { cycles: 20, gravity: 5 }, { cycles: 1000, gravity: 10 }];

    var tmpCycle = 0;
    var movementStep = 0;
    var initialYY = 0;

    this.update = function (y, init) {
        if (init) {
            initialYY = y;
            movementStep = 0;
            tmpCycle = 0;
        }
        if (++tmpCycle > movementSeq[movementStep].cycles) {
            movementStep++;
            tmpCycle = 0;
        }

        return y += movementSeq[movementStep].gravity;
    }
}