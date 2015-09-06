var global = (function () {

    var mainCanvas = document.getElementById('maincanvas');

    return {
        canvas: mainCanvas,
        ctxt: mainCanvas.getContext('2d'),
        keypressed: false,
        readyForNewInput: true,
        obstacleSpeed: 5,
        backgroundHeight: 1280,
        backgroundWeight: 720,
        gameOver: false
    }

})();