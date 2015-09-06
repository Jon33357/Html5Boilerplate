function SceneOne() {

    var assetsToLoad = {
        "bg": {"img": "images/MainGame/background_complete.jpg"},
        "plane": { "img": "images/MainGame/planes/avioneta_sprite.png" },
//        "obstacles": { "img": "images/MainGame/obstacles/obstacles.png", "json": "images/MainGame/obstacles/obstacles.json" },
        "semaforo_up": { "img": "images/MainGame/obstacles/semaforo_up.png" },
        "riscas_up": { "img": "images/MainGame/obstacles/riscas_up.png" },
        "totem_up": { "img": "images/MainGame/obstacles/totem_up.png" },
        "totem_down": { "img": "images/MainGame/obstacles/totem_down.png" },
        "riscas_down": { "img": "images/MainGame/obstacles/riscas_down.png" },
        "sinal_down": { "img": "images/MainGame/obstacles/sinal_down.png" }
    }
    this.name = 'Scene1';
    var assets = {
        "bg": {}, "plane": {},
        "obstacles": { "inverted": [], "straight": []}
    };
    var obstaclesInPlay = [];
    var obstacleManager = new ObstacleManager(assets.obstacles, obstaclesInPlay);
    var collisionDetector = new CollisionDetector();

    this.update = function () {
        for (var prop in assets) {
            if (assets[prop].hasOwnProperty("update")) {
                assets[prop].update();
            }
        }
        obstacleManager.update();
        global.gameOver = collisionDetector.detect(assets.plane, obstaclesInPlay);
    };
    this.draw = function () {
        for (var prop in assets) {
            if (assets[prop].hasOwnProperty("draw")){
                assets[prop].draw();
            }  
        }
        obstacleManager.draw();
    };
    this.loadScene = function () {

        var promise = assetLoader.loadAll(assetsToLoad);
        promise.then(function (value) {
            assets.bg = new background(value.images.bg, 2);
            assets.plane = new plane(value.images.plane, 2);
            assets.obstacles.inverted.push(new obstacle(value.images.totem_up, true));
            assets.obstacles.inverted.push(new obstacle(value.images.riscas_up, true));
            assets.obstacles.inverted.push(new obstacle(value.images.semaforo_up, true));
            assets.obstacles.straight.push(new obstacle(value.images.totem_down, false));
            assets.obstacles.straight.push(new obstacle(value.images.riscas_down, false));
            assets.obstacles.straight.push(new obstacle(value.images.sinal_down, false));
        }, function (reason) {
            console.log(reason);
        });
        return promise;
    };
}




function ObstacleManager(assets, obstaclesInPlay) {

    var counter = 0;
    var interval = 150;
    var index = 0;

    this.update = function () {
        if (counter !== 0) {
            counter--;
            return;
        }

        if (index >= 7) {
            index = 0;
        }
        var x = Math.round(Math.random() * (2));
        switch (x) {
            case 0:
                obstaclesInPlay[index++] = $.extend({}, assets.straight[0]);
                break;
            case 1:
                obstaclesInPlay[index++] = $.extend({}, assets.straight[2]);
                obstaclesInPlay[index++] = $.extend({}, assets.inverted[2]);
                break;
            case 2:
                obstaclesInPlay[index++] = $.extend({}, assets.inverted[0]);
                break;
        }
        counter = interval;
    };


    this.draw = function () {
    
        for (var i = 0; i < obstaclesInPlay.length; ++i) {
            
            obstaclesInPlay[i].draw()
        }
    };
}

function CollisionDetector() {

    this.detect = function (plane, obstacles) {
  
        for (var i = 0; i < obstacles.length; ++i) {
            var obs = obstacles[i];
            if (plane.x + plane.width < obs.x || plane.x > obs.x + obs.width) { continue; }
            if ((!obs.inverted && plane.y + plane.height > obs.y) || (obs.inverted && plane.y < obs.y + obs.height)) {

                console.log("OBSTACLE XX - " + obs.x);
                console.log("OBSTACLE YY - " + obs.y);
                console.log("PLANE XX - " + plane.x + " WIDTH - " + plane.width);
                console.log("PLANE YY - " + plane.y + " HEIGHT - " + plane.height);
                return true;
            }
        }
        return false;
    };
}


    



    











