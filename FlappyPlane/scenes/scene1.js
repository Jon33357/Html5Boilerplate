
// Deveria implementar o Singleton aqui

var scene1 = (function () {

    var assets = {
        "bg": "images/MainGame/background_complete.jpg",
        "avatar": "images/MainGame/doomg.png"
    }

    return {

        loadScene: function (obj) {

            var promise = assetLoader.loadAll(assets);
            promise.then(function (value) {
                obj.img = value.images;
            }, function (reason) {
                console.log(reason);
            });
            return promise;
        },

        img: {}
    }
})();


    



    











