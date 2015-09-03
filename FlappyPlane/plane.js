function plane(img, speed) {

    var image = img;
    var movement = 0;
    var _speed = speed;
    var canvas = document.getElementById('maincanvas');
    var ctxt = canvas.getContext('2d');

    this.draw = function () {

        ctxt.drawImage(image, movement, 0);
        ctxt.drawImage(image, image.width - Math.abs(movement), 0);
    };

    this.update = function () {

        console.log("UPDATE PLANE");
        if (Math.abs(movement) > image.width) { movement = 0; }
        movement -= _speed;
    };
}