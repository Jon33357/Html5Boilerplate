(function () {

    var canvas = document.getElementById('maincanvas');
    var ctxt = canvas.getContext('2d');
    //var movement = 0;
    //var currentScene = scene1;

    sceneManager.init().then(function (value) {
        startGame();
    }, function (reason) {
        console.log(reason);
    });

    function startGame() {

        console.log("STARTING GAME");
        mainLoop();
    }


    function mainLoop() {

        window.requestAnimationFrame(mainLoop);
        sceneManager.update();
        sceneManager.draw();
    }

})()