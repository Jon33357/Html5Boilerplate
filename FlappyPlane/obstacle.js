function obstacle(img, inverted) {

    var image = img;
    var movement = global.obstacleSpeed;
    this.inverted = inverted;
    this.x = global.backgroundHeight;
    if (inverted) {
        this.y = 0;
    } else { this.y = 620 - image.height; }
    this.width = image.width;
    this.height = image.height;
    


    this.draw = function () {

        global.ctxt.drawImage(image, (this.x - movement), this.y);
        this.x -= movement;
    };


    this.reset = function () {
        this.x = global.backgroundHeight;
    }
}