var sceneManager = (function () {

    var scene = new SceneOne();

    return {
        currentScene:0,
        scenes: [],
        init: function () {
            return scene.loadScene();
        },
        update: function () {
            scene.update();

        },
        draw: function () {
            scene.draw();

        }
    }
})();


