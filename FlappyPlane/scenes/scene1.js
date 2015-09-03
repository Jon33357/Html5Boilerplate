var scene1 = (function () {

    var assetsToLoad = {
        "bg": "images/MainGame/background_complete.jpg",
        "plane": "images/MainGame/doomg.png"
    }

    return {

        name: 'Scene1',
        assets: {},
        update: function () {
            for (var prop in this.assets) {
                this.assets[prop].update();
            }
        },
        draw: function () {
            for (var prop in this.assets) {
                this.assets[prop].draw();
            }
        },
        loadScene: function (obj) {

            var promise = assetLoader.loadAll(assetsToLoad);
            promise.then(function (value) {
                obj.assets.bg = new background(value.images.bg, 2);
                console.log(obj.assets);
              //  obj.assets.plane = new plane(value.images.plane, 2);
            }, function (reason) {
                console.log(reason);
            });
            return promise;
        }
    }
})();


    



    











