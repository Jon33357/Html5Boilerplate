function SpriteSheet(img, frameWidth, frameHeight) {
    this.image = img
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.imageWidth = this.image.width;
    this.imageHeight = this.image.height;

    this.framesPerRow = Math.floor(this.image.width / this.frameWidth);
}


function Animation(spritesheet, frameSpeed, startFrame, endFrame) {
    var animationSequence = [];
    var currentFrame = 0;
    var counter = 0;

    for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++) {
        animationSequence.push(frameNumber);
    }

    this.update = function () {
        if (counter == (frameSpeed - 1)) {
            currentFrame = (currentFrame + 1) % animationSequence.length;
        }

        counter = (counter + 1) % frameSpeed;
    };

    this.draw = function (x, y) {
        var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
        var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

        global.ctxt.drawImage(spritesheet.image,
            col * spritesheet.frameWidth, row * spritesheet.frameHeight,
            spritesheet.frameWidth, spritesheet.frameHeight,
            x, y,
            spritesheet.frameWidth, spritesheet.frameHeight);
    };
}