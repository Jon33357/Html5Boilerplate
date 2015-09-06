function background(img, speed) {

    var image = img;
    var movement = 0;
    var _speed = speed;


    this.draw = function () {

        global.ctxt.drawImage(image, movement, 0);
        global.ctxt.drawImage(image, image.width - Math.abs(movement), 0);
    };

    this.update = function () {

        if (Math.abs(movement) > image.width) { movement = 0; }
        movement -= _speed;
    };
}