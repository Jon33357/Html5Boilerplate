(function () {

    var isRunning = false;

    sceneManager.init().then(function (value) {
        isRunning = true;
        startGame();
    }, function (reason) {
        console.log(reason);
    });

    function startGame() {

        console.log("STARTING GAME");
        mainLoop();
    }


    function mainLoop() {
        if (isRunning) {

            window.requestAnimationFrame(mainLoop);
            sceneManager.update();
            sceneManager.draw();
            if (global.gameOver) { isRunning = false; }
        }

    }

    function gameOver() {
        console.log("GAME OVER!");
        isRunning = false;
    }

    document.onkeydown = function (e) {
        //console.log("KEY DOWN");
        e.preventDefault();
        if (global.readyForNewInput) {
            global.readyForNewInput = false;
            global.keyPressed = true;
        }
        
        //var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        //if (KEY_CODES[keyCode]) {
        //    e.preventDefault();
        //    KEY_STATUS[KEY_CODES[keyCode]] = true;
    }

    document.onkeyup = function (e) {
        //console.log("KEY UP");
        e.preventDefault();
        global.readyForNewInput = true;

        //var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        //if (KEY_CODES[keyCode]) {
        //    e.preventDefault();
        //    KEY_STATUS[KEY_CODES[keyCode]] = false;
    }

})();