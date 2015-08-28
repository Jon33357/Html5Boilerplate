var game = (function () {

    var canvas = document.getElementById('maincanvas');
    var ctxt = canvas.getContext('2d');

    // NO MORE FUN...
    var isRunning = false;

    //PROFILER
    var stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);

    var assetLoader = (function () {

        var ASSET_STATUS = {
            LOADING: 0,
            LOADED: 1
        };

        this.images = {
            'bg': 'graphics/clouds.png',
            'ground': 'graphics/tiles.png',
            'avatar': 'graphics/player.png',
            'enemies': 'graphics/enemies.png',
            'meter': 'graphics/meter.png'
        };
        this.sounds = {
            'bgm': 'sounds/music_game.mp3',
            'jump': 'sounds/jump.wav',
            'shot': 'sounds/laser.wav'
        };

        var assetsLoaded = 0;
        var numImgs = Object.keys(this.images).length;
        var numSounds = Object.keys(this.sounds).length;
        var totalAssets = numImgs + numSounds;

        var assetLoaded = function (dict, id) {
            console.log("LOADED ASSET: " + id);
            if (this[dict][id].status !== ASSET_STATUS.LOADING) {
                return;
            }

            this[dict][id].status = ASSET_STATUS.LOADED;
            if (++assetsLoaded == totalAssets) {
                finishedLoading();
            }
        }

        function _checkAudioState(soundID) {
            if (this.sounds[soundID].status === ASSET_STATUS.LOADING && this.sounds[soundID].readyState === 4) {
                assetLoaded.call(this, 'sounds', soundID);
            }
        }

        function downloadSingleImg(_this, imgID, src) {
            _this.images[imgID] = new Image();
            _this.images[imgID].status = ASSET_STATUS.LOADING;
            _this.images[imgID].name = imgID;
            _this.images[imgID].onload = function () { assetLoaded.call(_this, 'images', imgID) };
            _this.images[imgID].src = src;
        }

        function downloadSingleSound(_this, soundID, src) {
            _this.sounds[soundID] = new Audio();
            _this.sounds[soundID].status = ASSET_STATUS.LOADING;
            _this.sounds[soundID].name = soundID;
            _this.sounds[soundID].addEventListener('canplay', function () {
                _checkAudioState.call(_this, soundID)
            });
            _this.sounds[soundID].src = src;
            _this.sounds[soundID].preload = 'auto';
            _this.sounds[soundID].load();
        }

        this.startDownloading = function () {
            for (var img in this.images) {
                if (this.images.hasOwnProperty(img)) {
                    downloadSingleImg(this, img, this.images[img]);
                }
            }

            for (var sound in this.sounds) {
                if (this.sounds.hasOwnProperty(sound)) {
                    downloadSingleSound(this, sound, this.sounds[sound]);
                }
            }
        };

        this.finishedLoading = function () {
            console.log("EVERYTHING IS LOADED");
            startGame();
        }

        return {
            images: this.images,
            sounds: this.sounds,
            startDownloading: this.startDownloading,
            finishedLoading: this.finishedLoading
        }
    })();

    var InputHandler = {

        KEY_CODE: {
            ENTER: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,

            SPACE: 32,
            A: 65,
            W: 87,
            D: 68,
            S: 83
        },

        KEY_STATUS: {},

        _keyExists: function (key) {
            for (var k in this.KEY_CODE) {
                if (this.KEY_CODE.hasOwnProperty(k)) {
                    if (key === this.KEY_CODE[k]) {
                        return true;
                    }
                }
            }
            return false;
        },

        onkeydown: function (e) {
            var keycode = e.keyCode || e.charCode;
            //console.log(keycode);
            if (this._keyExists(keycode) && !this.KEY_STATUS[keycode]) {
                e.preventDefault();
                this.KEY_STATUS[keycode] = true;
            }
        },

        onkeyup: function (e) {
            var keycode = e.keyCode || e.charCode;
            if (this._keyExists(keycode) && this.KEY_STATUS[keycode]) {
                e.preventDefault();
                this.KEY_STATUS[keycode] = false;
            }
        },

        IsKeyDown: function (keycode) {
            return !!this.KEY_STATUS[keycode];
        }
    };

    document.onkeydown = function (e) { InputHandler.onkeydown(e) };
    document.onkeyup = function (e) { InputHandler.onkeyup(e) };

    function SpriteSheet(imageID, frameWidth, frameHeight) {
        //console.log("DEBUGGING SHEET: " + imageID);
        this.image = assetLoader.images[imageID];

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.framesPerRow = Math.floor(this.image.width / this.frameWidth);
        //console.log("FINISHED DEBUGGING SHEET: " + imageID);
    }

    function Sprite() {

    }

    function Animation(spritesheet, frameSpeed, startFrame, endFrame) {
        this.spritesheet = spritesheet;
        this.animationSequence = [];
        this.currentFrame = 0;
        this.frameSpeed = frameSpeed;
        this.counter = 0;

        for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++) {
            this.animationSequence.push(frameNumber);
        }
    }
    Animation.prototype = Object.create(Object.prototype);

    Animation.prototype.update = function () {
        if (this.counter == (this.frameSpeed - 1)) {
            this.currentFrame = (this.currentFrame + 1) % this.animationSequence.length;
        }

        this.counter = (this.counter + 1) % this.frameSpeed;
    }

    Animation.prototype.draw = function (x, y, width, height) {
        var row = Math.floor(this.animationSequence[this.currentFrame] / this.spritesheet.framesPerRow);
        var col = Math.floor(this.animationSequence[this.currentFrame] % this.spritesheet.framesPerRow);

        ctxt.drawImage(
            this.spritesheet.image,
            col * this.spritesheet.frameWidth, row * this.spritesheet.frameHeight,
            this.spritesheet.frameWidth, this.spritesheet.frameHeight,
            x, y,
            width, height);
    }

    function ControlMapping(mapObj) {
        this.JUMP = mapObj.jump;
        this.GO_LEFT = mapObj.left;
        this.GO_RIGHT = mapObj.right;
        this.GO_UP = mapObj.up;
        this.GO_DOWN = mapObj.down;
    }

    function Player(id) {
        this.playerID = id;
        this.x = 0;
        this.y = 0;

        this.controlsMapping = null;
        this.playerSheet = new SpriteSheet('avatar', 16, 16);

        this.walkAnim = new Animation(this.playerSheet, 20, 0, 1);

        this.currentAnim = this.walkAnim;

        this.width = this.playerSheet.frameWidth;
        this.height = this.playerSheet.frameHeight;
    }
    Player.prototype = Object.create(Object.prototype);

    Player.prototype.InitControls = function (mapping) {
        this.controlsMapping = mapping;
    }

    Player.prototype.resetPosition = function (x, y) {
        this.x = x;
        this.y = y;
    }

    Player.prototype.resetDimension = function (width, height) {
        this.width = width;
        this.height = height || this.height;
    }

    Player.prototype.update = function () {
        if (InputHandler.IsKeyDown(this.controlsMapping.JUMP)) {
            //console.log(this.playerID + " JUMPING...");
        }
        if (InputHandler.IsKeyDown(this.controlsMapping.GO_LEFT)) {
            //console.log(this.playerID + " GOING LEFT...");
            this.x -= 1;
            this.x = Math.max(this.x, 0);
        }
        if (InputHandler.IsKeyDown(this.controlsMapping.GO_RIGHT)) {
            //console.log(this.playerID + " GOING RIGHT...");
            this.x += 1;
            this.x = Math.min(this.x, canvas.width - this.width);
        }
        if (InputHandler.IsKeyDown(this.controlsMapping.GO_UP)) {
            //console.log(this.playerID + " GOING UP...");
            this.y -= 1;
            this.y = Math.max(this.y, 0);
        }
        if (InputHandler.IsKeyDown(this.controlsMapping.GO_DOWN)) {
            //console.log(this.playerID + " GOING DOWN...");
            this.y += 1;
            this.y = Math.min(this.y, canvas.height - this.height);
        }

        this.currentAnim.update();
    }

    Player.prototype.draw = function () {
        this.currentAnim.draw(this.x, this.y, this.width, this.height);
    }

    function updateAll() {
        //this.player1.update();
        //this.player2.update();
        for (var i = 0, len = this.players.length; i < len; i++) {
            this.players[i].update();
        }
    }

    function drawAll() {
        //for (var img in assetLoader.images) {
        //    if (assetLoader.images.hasOwnProperty(img)) {
        //        ctxt.drawImage(assetLoader.images[img], 0, 0);
        //    }
        //}

        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        //ctxt.clearRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);

        //this.player1.draw();

        //ctxt.clearRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);
        //this.player2.draw();

        for (var i = 0, len = this.players.length; i < len; i++) {
            this.players[i].draw();
        }
    }

    var mainLoop = function () {
        if (isRunning) {
            requestAnimationFrame(mainLoop);
            //console.log("IN MAIN LOOP");
            stats.begin();
            updateAll();

            drawAll();
            stats.end();
        }
    }

    ////Request Animation Polyfill
    var requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, element) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    var startGame = function () {
        console.log("GAME IS STARTING");
        isRunning = true;
        //assetLoader.sounds.bgm.play();

        var PLAYER_WIDTH = 16;
        var PLAYER_HEIGHT = 16;

        this.players = [];
        for (var i = 0; i < ~~(canvas.width / PLAYER_WIDTH) ; i++) {
            for (var j = 0; j < ~~(canvas.height / PLAYER_HEIGHT) ; j++) {
                var newplayer = new Player("player" + i);
                this.players.push(newplayer);

                newplayer.resetDimension(PLAYER_WIDTH, PLAYER_HEIGHT);
                newplayer.resetPosition(i * newplayer.width, j * newplayer.height);

                newplayer.InitControls(new ControlMapping({
                    jump: InputHandler.KEY_CODE.ENTER,
                    left: InputHandler.KEY_CODE.LEFT,
                    right: InputHandler.KEY_CODE.RIGHT,
                    up: InputHandler.KEY_CODE.UP,
                    down: InputHandler.KEY_CODE.DOWN
                }));
            }
        }

        //this.player1 = new Player("player1");
        //this.player1.resetDimension(PLAYER_WIDTH, PLAYER_HEIGHT);
        //this.player1.resetPosition(canvas.width * 0.1, (canvas.height - this.player1.height) * 0.5);

        //this.player2 = new Player("player2");
        //this.player2.resetDimension(PLAYER_WIDTH, PLAYER_HEIGHT);
        //this.player2.resetPosition(canvas.width * 0.9 - this.player1.width, (canvas.height - this.player2.height) * 0.5);

        //this.player1.InitControls(
        //    new ControlMapping({
        //        jump: InputHandler.KEY_CODE.SPACE,
        //        left: InputHandler.KEY_CODE.A,
        //        right: InputHandler.KEY_CODE.D,
        //        up: InputHandler.KEY_CODE.W,
        //        down: InputHandler.KEY_CODE.S
        //    }));

        //this.player2.InitControls(
        //    new ControlMapping({
        //        jump: InputHandler.KEY_CODE.ENTER,
        //        left: InputHandler.KEY_CODE.LEFT,
        //        right: InputHandler.KEY_CODE.RIGHT,
        //        up: InputHandler.KEY_CODE.UP,
        //        down: InputHandler.KEY_CODE.DOWN
        //    }));

        mainLoop();
    }

    assetLoader.startDownloading();
})();