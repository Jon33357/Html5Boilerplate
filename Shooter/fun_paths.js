var game = (function () {

    var canvas = document.getElementById('maincanvas');
    var ctxt = canvas.getContext('2d');

    //JUST HAVING FUN
    var currentColor = [~~(Math.random() * 255), ~~(Math.random() * 255), ~~(Math.random() * 255)];
    var invertedColor = [0, 0, 0];
    var roundedColor = [0, 0, 0];
    var colorPhase = Math.random() * 255;

    var midCanvasX = canvas.width * 0.5;
    var midCanvasY = canvas.height * 0.5;
    var arcAngle = Math.PI * 2;

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
            'avatar': 'graphics/player.png'
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

    function updateAll() {
        // DO NOTHING... should be updating colors
        if (InputHandler.IsKeyDown(InputHandler.KEY_CODE.SPACE)) {
            colorPhase = Math.random() * 255;
        }

        for (var i = 0; i < currentColor.length; i++) {
            //currentColor[i] = (currentColor[i] + 0.2) % 255;
            //currentColor[i] = Math.sin(colorPhase * 0.01) * 128 + 127;
            currentColor[i] = Math.sin(0.3 * colorPhase + i * 2) * 127 + 128;
            roundedColor[i] = Math.round(currentColor[i]);
            invertedColor[i] = 255 - roundedColor[i];
        }
        colorPhase = (colorPhase + 0.05) % 255;
    }

    function drawAll() {
        
        ctxt.clearRect(0, 0, canvas.width, canvas.height);
        
        var time = Date.now() * 0.0005;
        
        for (var i = 0; i < 1700; i++) {
            var x = Math.cos(time + i * 0.01) * 100 + midCanvasX;
            var y = Math.sin(time + i * 0.0234) * 60 + midCanvasY;
            ctxt.beginPath();
            ctxt.fillStyle = 'rgba(' + roundedColor[0] + ','
            + roundedColor[1] + ','
            + roundedColor[2]
            + ' ,0.1)';
            ctxt.arc(x, y, 6, 0, arcAngle, true);
            ctxt.fill();

            ctxt.beginPath();
            ctxt.fillStyle = 'rgba(' + invertedColor[0] + ','
           + invertedColor[1] + ','
           + invertedColor[2]
           + ' ,0.1)';
            //x *= 0.5;
            //y *= 2;
            //ctxt.arc(y, x, 3, 0, arcAngle, true);
            
            ctxt.arc(x , y, 3, 0, arcAngle, true);

            ctxt.fill();
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
                window.mozRequestAnimationFrame||
                window.webkitRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback, element) {
                    window.setTimeout(callback, 1000 / 60);
                };
    })();

    var startGame = function () {
        console.log("GAME IS STARTING");
        isRunning = true;

        mainLoop();
    }

    assetLoader.startDownloading();
})();