var game = ( function ()
{
    var canvas = document.getElementById( 'maincanvas' );
    var ctxt = canvas.getContext( '2d' );

    //AUDIO VISUALIZATION... FUN STUFF
    var audioCtxt = new ( window.AudioContext || window.webkitAudioContext )();
    var analyser = audioCtxt.createAnalyser();

    var gradient = ctxt.createLinearGradient( 0, canvas.height, 0, 0 );
    gradient.addColorStop( 0, "green" );
    gradient.addColorStop( 0.5, "yellow" );
    gradient.addColorStop( 1, "red" );

    var timerAcc = 0, timerCount = 0;

    // NO MORE FUN...
    var isRunning = false;

    //PROFILER
    var stats = new Stats();
    stats.setMode( 0 );

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild( stats.domElement );

    var assetLoader = ( function ()
    {

        var ASSET_STATUS = {
            LOADING: 0,
            LOADED: 1
        };

        this.images = {
            'bg': 'graphics/clouds.png'
            //'ground': 'graphics/tiles.png',
            //'avatar': 'graphics/player.png',
            //'enemies': 'graphics/enemies.png',
            //'meter': 'graphics/meter.png'
        };
        this.sounds = {
            'bgm': 'sounds/music_game.mp3'
            //            'jump': 'sounds/jump.wav',
            //'shot': 'sounds/laser.wav'
        };

        var assetsLoaded = 0;
        var numImgs = Object.keys( this.images ).length;
        var numSounds = Object.keys( this.sounds ).length;
        var totalAssets = numImgs + numSounds;

        var assetLoaded = function ( dict, id )
        {
            console.log( "LOADED ASSET: " + id );
            if ( dict === 'images' && this[dict][id].status !== ASSET_STATUS.LOADING )
            {
                return;
            }

            this[dict][id].status = ASSET_STATUS.LOADED;
            if ( ++assetsLoaded == totalAssets )
            {
                finishedLoading();
            }
        }

        //        function _checkAudioState( soundID )
        //        {
        //            if ( this.sounds[soundID].status === ASSET_STATUS.LOADING && this.sounds[soundID].readyState === 4 )
        //            {
        //                assetLoaded.call( this, 'sounds', soundID );
        //            }
        //        }

        function downloadSingleImg( _this, imgID, src )
        {
            _this.images[imgID] = new Image();
            _this.images[imgID].status = ASSET_STATUS.LOADING;
            _this.images[imgID].name = imgID;
            _this.images[imgID].onload = function () { assetLoaded.call( _this, 'images', imgID ) };
            _this.images[imgID].src = src;
        }

        function downloadSingleSound( _this, soundID, src )
        {
            var request = new XMLHttpRequest();
            request.open( 'GET', src, true );
            request.responseType = 'arraybuffer';
            request.onload = function ()
            {
                console.log( "FINISHED DOWNLOADING SOUND" );
                _this.sounds[soundID] = audioCtxt.createBufferSource();

                audioCtxt.decodeAudioData( request.response, function ( buffer )
                {
                    console.log( "DECODE SUCCESSFUL" );
                    _this.sounds[soundID].buffer = buffer;
                    _this.sounds[soundID].connect( audioCtxt.destination );

                    assetLoaded.call( _this, 'sounds', soundID );
                },
                function ( er )
                {
                    console.log( "ERROR " + er );
                } );
            }

            request.send();

            //            _this.sounds[soundID] = new Audio();
            //            _this.sounds[soundID].status = ASSET_STATUS.LOADING;
            //            _this.sounds[soundID].name = soundID;
            //            _this.sounds[soundID].addEventListener( 'canplay', function ()
            //            {
            //                _checkAudioState.call( _this, soundID )
            //            } );
            //            _this.sounds[soundID].src = src;
            //            _this.sounds[soundID].preload = 'auto';
            //            _this.sounds[soundID].load();
        }

        this.startDownloading = function ()
        {
            for ( var img in this.images )
            {
                if ( this.images.hasOwnProperty( img ) )
                {
                    downloadSingleImg( this, img, this.images[img] );
                }
            }

            for ( var sound in this.sounds )
            {
                if ( this.sounds.hasOwnProperty( sound ) )
                {
                    downloadSingleSound( this, sound, this.sounds[sound] );
                }
            }
        };

        this.finishedLoading = function ()
        {
            console.log( "EVERYTHING IS LOADED" );
            startGame();
        }

        return {
            images: this.images,
            sounds: this.sounds,
            startDownloading: this.startDownloading,
            finishedLoading: this.finishedLoading
        }
    } )();

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

        _keyExists: function ( key )
        {
            for ( var k in this.KEY_CODE )
            {
                if ( this.KEY_CODE.hasOwnProperty( k ) )
                {
                    if ( key === this.KEY_CODE[k] )
                    {
                        return true;
                    }
                }
            }
            return false;
        },

        onkeydown: function ( e )
        {
            var keycode = e.keyCode || e.charCode;
            //console.log(keycode);
            if ( this._keyExists( keycode ) && !this.KEY_STATUS[keycode] )
            {
                e.preventDefault();
                this.KEY_STATUS[keycode] = true;
            }
        },

        onkeyup: function ( e )
        {
            var keycode = e.keyCode || e.charCode;
            if ( this._keyExists( keycode ) && this.KEY_STATUS[keycode] )
            {
                e.preventDefault();
                this.KEY_STATUS[keycode] = false;
            }
        },

        IsKeyDown: function ( keycode )
        {
            return !!this.KEY_STATUS[keycode];
        }
    };

    document.onkeydown = function ( e ) { InputHandler.onkeydown( e ) };
    document.onkeyup = function ( e ) { InputHandler.onkeyup( e ) };

    function Sprite()
    {

    }

    function updateAll()
    {
        analyser.getByteFrequencyData( this.frequencyData );
        //        console.log( this.frequencyData );

        timerAcc += delta;
        if ( timerAcc >= 1000 )
        {
            timerAcc = 0;
            timerCount += 1;
        }
    }

    function drawAll()
    {
        ctxt.clearRect( 0, 0, canvas.width, canvas.height );

        //VISUALIZING AUDIO
        //        ctxt.fillStyle = 'rgb(0,120,0)';
        ctxt.fillStyle = gradient;
        for ( var i = 0; i < this.frequencyData.length; i++ )
        {
            ctxt.fillRect( i * ( 7 + 2 ), canvas.height - this.frequencyData[i] / 2, 7, this.frequencyData[i] / 2 );
        }

        ctxt.fillStyle = 'rgb(0,0,0)';
        ctxt.fillText( timerCount.toString(), 10, 20 );
    }

    var now, delta, then;
    var mainLoop = function ()
    {
        if ( isRunning )
        {
            now = new Date().getTime();
            delta = now - then;

            requestAnimationFrame( mainLoop );
            //console.log("IN MAIN LOOP");
            stats.begin();
            updateAll();

            drawAll();
            stats.end();

            then = now;
        }
        else
        {
            console.log( "NOT RUNNING ANYMORE" );
        }
    }

    ////Request Animation Polyfill
    var requestAnimFrame = ( function ()
    {
        return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function ( callback, element )
                {
                    window.setTimeout( callback, 1000 / 60 );
                };
    } )();

    var startGame = function ()
    {
        console.log( "GAME IS STARTING" );
        isRunning = true;

        assetLoader.sounds.bgm.connect( analyser );
        analyser.connect( audioCtxt.destination );

        assetLoader.sounds.bgm.onended = function ()
        {
            console.log( "SOUND DONE" );
            setTimeout( function ()
            {
                this.frequencyData = new Uint8Array( analyser.frequencyBinCount );
                drawAll();
            },
            10 );

            isRunning = false;
        }

        assetLoader.sounds.bgm.start( 0 );


        this.frequencyData = new Uint8Array( analyser.frequencyBinCount );
        analyser.getByteFrequencyData( this.frequencyData );

        then = new Date().getTime();
        mainLoop();
    }

    assetLoader.startDownloading();
} )();