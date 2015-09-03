(function () {

    var canvas = document.getElementById('maincanvas');
    var ctxt = canvas.getContext('2d');
    var movement = 0;
    var currentScene = scene1;

    currentScene.loadScene(currentScene).then(function (value) {
        startGame();
    }, function (reason) {
        console.log(reason);
    });

    function startGame() {

        console.log("STARTING GAME");
//        var ptrn = ctxt.createPattern(currentScene.img.bg, 'repeat');
//        ctxt.fillStyle = ptrn;
        
        mainLoop();
    }


    function mainLoop() {

        window.requestAnimationFrame(mainLoop);

        ctxt.drawImage(currentScene.img.bg, movement, 0);
        ctxt.drawImage(currentScene.img.bg, currentScene.img.bg.width - Math.abs(movement), 0);

        if (Math.abs(movement) > currentScene.img.bg.width) {
            movement = 0;
        }

        movement -= 2;

    }








})()