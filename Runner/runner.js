//GAME SINGLETON
(function () {
    var canvas = document.getElementById('maincanvas');
    var ctxt = canvas.getContext('2d');

    var isRunning = false;
    var ground = [];
    var platformWidth = 32;
    var platformHeight = canvas.height - platformWidth * 4;

    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }

    var assetLoader = (function () {
        this.images = {
            "bg": "graphics/background.png",
            "avatar": "graphics/player.png",
            "items": "graphics/obstacles.png"
        }

        var assetsLoaded = 0;
        var numImages = Object.keys(this.images).length;
        this.totalAssets = numImages;

        //Make sure every asset is loaded before starting the game
        function assetLoaded(dict, name) {
            if (this[dict][name].status !== 'loading') {
                return;
            }

            this[dict][name].status = 'loaded';
            assetsLoaded++;
            if (assetsLoaded == this.totalAssets && typeof this.finishedLoading === 'function') {
                this.finishedLoading();
                console.log("ALL ASSETS READY");
            }
        }

        this.downloadAll = function () {
            var _this = this;
            var src;

            for (var img in this.images) {
                if (this.images.hasOwnProperty(img)) {
                    src = this.images[img];
                    console.log("DOWNLOADING ASSET: " + src);

                    (function (_this, img) {
                        _this.images[img] = new Image();
                        _this.images[img].status = 'loading';
                        _this.images[img].name = img;
                        _this.images[img].onload = function () { assetLoaded.call(_this, "images", img) };
                        _this.images[img].src = src;
                        console.log(_this.images);
                    })(_this, img);
                }
            }
        };
        console.log(this.images);
        return {
            images: this.images,
            totalAssets: this.totalAssets,
            downloadAll: this.downloadAll
        };
    })();
    assetLoader.finishedLoading = function () {
        startGame();
    }

    function SpriteSheet(path, frameWidth, frameHeight, imageWidth, imageHeight) {
        this.image = new Image();
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;

        var self = this;
        this.image.onload = function () {
            self.framesPerRow = Math.floor(self.image.width / self.frameWidth);
        };

        this.image.src = path;
    }

    function Animation(spritesheet, frameSpeed, startFrame, endFrame) {
        var animationSequence = [];
        var currentFrame = 0;
        var counter = 0;

        for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++) {
            animationSequence.push(frameNumber);
        }

        this.update = function () {
            if (counter == (frameSpeed - 1)) {
                currentFrame = (currentFrame + 1) % animationSequence.length;
            }

            counter = (counter + 1) % frameSpeed;
        };

        this.draw = function (x, y) {
            var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
            var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

            ctxt.drawImage(spritesheet.image,
                col * spritesheet.frameWidth, row * spritesheet.frameHeight,
                spritesheet.frameWidth, spritesheet.frameHeight,
                x, y,
                spritesheet.imageWidth, spritesheet.imageHeight);
        };
    }

    var background = (function () {
        this.draw = function () {
            ctxt.drawImage(assetLoader.images.bg, 0, 0, assetLoader.images.bg.width, assetLoader.images.bg.height,
                0, 0, canvas.width, canvas.height);
        }

        this.reset = function () {

        }

        return {
            draw: this.draw,
            reset: this.reset
        };
    })();

    // Vector type
    function Vector(x, y, dx, dy) {
        this.x = x || 0;
        this.y = y || 0;

        this.dx = dx || 0;
        this.dy = dy || 0;
    }

    Vector.prototype.advance = function () {
        this.x += this.dx;
        this.y += this.dy;
    };

    Vector.prototype.minDistance = function (vec) {
        var minDist = Infinity;
        var max = Math.max(Math.abs(this.dx), Math.abs(this.dy),
                            Math.abs(vec.dx), Math.abs(vec.dy));
        var slice = 1 / max;

        var x, y, distSquared;

        var vec1 = {}, vec2 = {};
        vec1.x = this.x + this.width / 2;
        vec1.y = this.y + this.height / 2;
        vec2.x = vec.x + vec.width / 2;
        vec2.y = vec.y + vec.height / 2;

        for (var percent = 0; percent < 1; percent += slice) {
            x = (vec1.x + this.dx * percent) - (vec2.x + vec.dx * percent);
            y = (vec1.y + this.dy * percent) - (vec2.y + vec.dy * percent);
            distSquared = x * x + y * y;

            minDist = Math.min(minDist, distSquared);
        }

        return Math.sqrt(minDist);
    };

    var player = (function (player) {
        player.width = 64;
        player.height = 64;
        player.speed = 6;

        player.gravity = 1;
        player.dy = 0;
        player.jumpDy = -10;
        player.isFalling = false;
        player.isJumping = false;

        player.sheet = new SpriteSheet('graphics/player.png', 16, 16, player.width, player.height);
        player.walkAnim = new Animation(player.sheet, 10, 0, 2);
        player.jumpAnim = new Animation(player.sheet, 10, 4, 4);
        player.fallAnim = new Animation(player.sheet, 10, 6, 6);
        player.currentAnim = player.walkAnim;

        Vector.call(player, canvas.width * 0.25, canvas.height * 0.5, 0, player.dy);

        player.currentState = player.updateOnJump;

        var jumpCounter = 0; //long jump control

        player.update = function () {


            //walk
            if (KEY_STATUS.RIGHT_ARROW) {
                player.dx = 2;
            }

            if (KEY_STATUS.UP_ARROW) {
                player.dy = 0;
            }

            if (KEY_STATUS.DOWN_ARROW) {
                player.dy = 0;
            }

            if (KEY_STATUS.LEFT_ARROW) {
                player.dx = -2;
            }

            if (!KEY_STATUS.UP_ARROW && !KEY_STATUS.DOWN_ARROW) {
                player.dy = 0;
            }

            if (!KEY_STATUS.RIGHT_ARROW && !KEY_STATUS.LEFT_ARROW) {
                player.dx = 0;
            }

            if (KEY_STATUS.SPACE) {

            }

            //normal jump
            if (KEY_STATUS.SPACE && player.dy === 0 && !player.isJumping) {
                player.isJumping = true;
                player.dy = 5;
                player.dy = 2;
                //player.dy = player.jumpDy;
                jumpCounter = 12;
            }

            //jump higher
            if (KEY_STATUS.SPACE && jumpCounter) {
                player.dy = player.jumpDy;
            }

            jumpCounter = Math.max(jumpCounter - 1, 0);

            //update player physics
            this.advance();
      
            //gravity
            if (player.isFalling || player.isJumping) {
                player.dy += player.gravity;
            }

            //check if falling animation
            if (player.dy > 0) {
                player.currentAnim = player.fallAnim;
            }
                //check if jumping animation
            else if (player.dy < 0) {
                player.currentAnim = player.jumpAnim;
            }
            else {
                //normal animation
                player.currentAnim = player.walkAnim;
            }

            player.anim.update();
        };

        player.draw = function () {
            player.anim.draw(player.x, player.y);
        };

        player.reset = function () {
            player.x = canvas.width * 0.5;
            player.y = canvas.height * 0.5;
        };

        return player;
    })(Object.create(Vector.prototype));

    function Sprite(x, y, width, height, imageID) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imageID = imageID;
        Vector.call(this, x, y, 0, 0);

        this.draw = function () {
            ctxt.drawImage(assetLoader.images[this.imageID], this.x, this.y);
        };
    }
    Sprite.prototype = Object.create(Vector.prototype);

    function updatePlayer() {
        player.update();
        player.draw();

        if (player.y + player.height >= canvas.height) {
            gameOver();
        }
    }

    //// GAME MAIN LOOP 
    function mainLoop() {
        if (isRunning) {
            requestAnimationFrame(mainLoop);

            background.draw();

            updatePlayer();

            //player.anim.update();
            //player.anim.draw(canvas.width * 0.5, canvas.height * 0.5);
        }
    }

    var KEY_CODES = {
        32: 'SPACE',
        37: 'LEFT_ARROW',
        38: 'UP_ARROW',
        39: 'RIGHT_ARROW',
        40: 'DOWN_ARROW'
    };
    var KEY_STATUS = {};
    for (var code in KEY_CODES) {
        if (KEY_CODES.hasOwnProperty(code)) {
            KEY_STATUS[KEY_CODES[code]] = false;
        }
    }

    document.onkeydown = function (e) {
        var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if (KEY_CODES[keyCode]) {
            e.preventDefault();
            KEY_STATUS[KEY_CODES[keyCode]] = true;
        }
    }

    document.onkeyup = function (e) {
        var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if (KEY_CODES[keyCode]) {
            e.preventDefault();
            KEY_STATUS[KEY_CODES[keyCode]] = false;
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

    function startGame() {
        console.log("STARTING GAME");

        player.width = 64;
        player.height = 64;
        player.speed = 6;
        player.sheet = new SpriteSheet('graphics/player.png', 16, 16, player.width, player.height);
        player.anim = new Animation(player.sheet, 10, 0, 2);

        background.reset();

        isRunning = true;
        mainLoop();
    }

    function gameOver() {
        console.log("GAME OVER!");
        isRunning = false;
    }

    assetLoader.downloadAll();
})();








// Complex Input Model 


var InputManager = {
    inputs: {},

    init: function () {
        document.addEventListener("keydown", InputManager.keyDownEvent, false);
        document.addEventListener("keyup", InputManager.keyUpEvent, false);
    },

    shutDown: function () {
        document.removeEventListener("keydown", InputManager.keyDownEvent);
        document.removeEventListener("keyup", InputManager.keyUpEvent);

        InputManager.inputs = null;
        KEYCODE = null;
    },

    keyDownEvent: function (evt) {
        var keycode = evt.keyCode || evt;

        if (!(keycode in InputManager.inputs)) {
            InputManager.inputs[keycode] = new createKeyState();
        }

        if (!InputManager.inputs[keycode].isDown) {
            InputManager.inputs[keycode].isDown = true;
            var ondownCallers = InputManager.inputs[keycode].ondownCallbacks;
            for (var i = ondownCallers.length - 1; i >= 0; i--) {
                ondownCallers[i].func.apply(ondownCallers[i].context);
            }
        }
    },

    keyUpEvent: function (evt) {
        var keycode = evt.keyCode || evt;

        if (!(keycode in InputManager.inputs)) {
            return;
        }

        InputManager.inputs[keycode].isDown = false;
        var onupCallers = InputManager.inputs[keycode].onupCallbacks;

        for (var i = onupCallers.length - 1; i >= 0; i--) {
            onupCallers[i].func.apply(onupCallers[i].context);
        }
    },

    RegisterOnKeyUp: function (func, context, key) {
        if (!InputManager.inputs[key]) {
            InputManager.inputs[key] = new createKeyState();
        }
        InputManager.inputs[key].onupCallbacks.push({ func: func, context: context });
    },

    RegisterOnKeyDown: function (func, context, key) {
        if (!(key in InputManager.inputs)) {
            InputManager.inputs[key] = new createKeyState();
        }
        InputManager.inputs[key].ondownCallbacks.push({ func: func, context: context });
        InputManager.inputs[key].isDown = false;
    },

    RemoveOnKeyDown: function (func, context, key) {
        if (!(key in InputManager.inputs)) {
            return;
        }

        var ondownCallers = InputManager.inputs[key].ondownCallbacks;

        for (var i = 0, len = ondownCallers.length; i < len; i++) {
            if (ondownCallers[i].func == func && ondownCallers[i].context == context) {
                InputManager.inputs[key].ondownCallbacks.splice(i, 1);
                break;
            }
        }

        if (InputManager.inputs[key].onupCallbacks.length == 0 && InputManager.inputs[key].ondownCallbacks.length == 0) {
            delete InputManager.inputs[key];
        }
    },

    RemoveOnKeyUp: function (func, context, key) {
        if (!(key in InputManager.inputs)) {
            return;
        }

        var onupCallers = InputManager.inputs[key].onupCallbacks;

        for (var i = 0; i < onupCallers.length; i++) {
            if (onupCallers[i].func == func && onupCallers[i].context == context) {
                InputManager.inputs[key].onupCallbacks.splice(i, 1);
                break;
            }
        }

        if (InputManager.inputs[key].onupCallbacks.length == 0 && InputManager.inputs[key].ondownCallbacks.length == 0) {
            delete InputManager.inputs[key];
        }
    },

    ChangeOnKeyDown: function (key, oldFunc, oldContext, newFunc, newContext) {
        if (!(key in InputManager.inputs)) {
            return;
        }

        var ondownCallers = InputManager.inputs[key].ondownCallbacks;

        for (var i = 0; i < ondownCallers.length; i++) {
            if (ondownCallers[i].func == oldFunc && ondownCallers[i].context == oldContext) {
                InputManager.inputs[key].ondownCallbacks[i] = { func: newFunc, context: newContext };
                return;
            }
        }
    },

    ChangeOnKeyUp: function (key, oldFunc, oldContext, newFunc, newContext) {
        if (!(key in InputManager.inputs)) {
            return;
        }

        var onupCallers = InputManager.inputs[key].onupCallbacks;

        for (var i = 0; i < onupCallers.length; i++) {
            if (onupCallers[i].func == oldFunc && onupCallers[i].context == oldContext) {
                InputManager.inputs[key].onupCallbacks[i] = { func: newFunc, context: newContext };
                return;
            }
        }
    },

    IsDown: function (keycode) {
        if (!InputManager.inputs[keycode]) {
            return false;
        }
        return InputManager.inputs[keycode].isDown;
    }
};

function countObjs(obj) {
    var count = 0;
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            ++count;
        }
    }

    return count;
}

function createKeyState() {
    this.isDown = false;
    this.onupCallbacks = [];
    this.ondownCallbacks = [];
}

var KEYCODE =
{
    R: 82,
    BACKSPACE: 8,
    ENTER: 13,
    CURSOR_LEFT: 37,
    CURSOR_UP: 38,
    CURSOR_RIGHT: 39,
    CURSOR_DOWN: 40,
    INSERT: 45,
    HOME: 36,
    END: 35,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    PRINT: 44,
    PAUSE: 19,
    OK: 61451,
    SELECT: 61452,
    GOTO: 61453,
    CLEAR: 61454,
    POWER: 61455,
    POWER2: 61456,
    OPTION: 61457,
    MENU: 61458,
    HELP: 61459,
    INFO: 61460,
    TIME: 61461,
    VENDOR: 61462,
    ARCHIVE: 61463,
    PROGRAM: 61464,
    CHANNEL: 61465,
    FAVORITES: 61466,
    EPG: 61467,
    PVR: 61468,
    MHP: 61469,
    LANGUAGE: 61470,
    TITLE: 61471,
    SUBTITLE: 61472,
    ANGLE: 61473,
    ZOOM: 61474,
    MODE: 61475,
    KEYBOARD: 61476,
    PC: 61477,
    SCREEN: 61478,
    TV: 61479,
    TV2: 61480,
    VCR: 61481,
    VCR2: 61482,
    SAT: 61483,
    SAT2: 61484,
    CD: 61485,
    TAPE: 61486,
    RADIO: 61487,
    TUNER: 61488,
    PLAYER: 61489,
    TEXT: 61490,
    DVD: 61491,
    AUX: 61492,
    MP3: 61493,
    PHONE: 61494,
    AUDIO: 61495,
    VIDEO: 61496,
    INTERNET: 61497,
    MAIL: 61498,
    NEWS: 61499,
    DIRECTORY: 61500,
    LIST: 61501,
    CALCULATOR: 61502,
    MEMO: 61503,
    CALENDAR: 61504,
    EDITOR: 61505,
    RED: 61506,
    GREEN: 61507,
    YELLOW: 61508,
    BLUE: 61509,
    CHANNEL_UP: 61510,
    CHANNEL_DOWN: 61511,
    BACK: 61512,
    FORWARD: 61513,
    FIRST: 61514,
    LAST: 61515,
    VOLUME_UP: 61516,
    VOLUME_DOWN: 61517,
    MUTE: 61518,
    AB: 61519,
    PLAYPAUSE: 61520,
    PLAY: 61521,
    STOP: 61522,
    RESTART: 61523,
    SLOW: 61524,
    FAST: 61525,
    RECORD: 61526,
    EJECT: 61527,
    SHUFFLE: 61528,
    REWIND: 61529,
    FASTFORWARD: 61530,
    PREVIOUS: 61531,
    NEXT: 61532,
    BEGIN: 61533,
    DIGITS: 61534,
    TEEN: 61535,
    TWEN: 61536,
    BREAK: 61537,
    EXIT: 61538,
    SETUP: 61539,
    CURSOR_LEFT_UP: 61540,
    CURSOR_LEFT_DOWN: 61541,
    CURSOR_UP_RIGHT: 61542,
    CURSOR_DOWN_RIGHT: 61543,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    SHIFT: 16,
    CONTROL: 17,
    ALT: 18,
    ALTGR: 61960,
    META: 61968,
    SUPER: 61984,
    HYPER: 62016,
    CAPS_LOCK: 20,
    NUM_LOCK: 144,
    SCROLL_LOCK: 145,
    KEY_1: 97,
    KEY_2: 98,
    KEY_3: 99,
    KEY_4: 100,
    KEY_5: 101,
    KEY_6: 102,
    KEY_7: 103,
    KEY_8: 104,
    KEY_9: 105,
    KEY_0: 96,
    KEY_NAGRA_1: 49,
    KEY_NAGRA_2: 50,
    KEY_NAGRA_3: 51,
    KEY_NAGRA_4: 52,
    KEY_NAGRA_5: 53,
    KEY_NAGRA_6: 54,
    KEY_NAGRA_7: 55,
    KEY_NAGRA_8: 56,
    KEY_NAGRA_9: 57,
    KEY_NAGRA_0: 96
};