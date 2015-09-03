
var assetLoader = (function () {
    
    return {
        loadAll: function (assets) {

            return new Promise( function (resolve, reject) {
            
                var total = Object.keys(assets).length;
                var images = {};
                var uploadedAssets = 0;

                for (var asset in assets) {

                    src = assets[asset];

                    images[asset] = new Image();
                    images[asset].src = src;
                    images[asset].name = asset;
                    images[asset].onerror = function() { reject("FAILED TO LOAD " + src); } 
                    images[asset].onload = function () { allLoad(); }
                }

                function allLoad() {

                    if (total !== ++uploadedAssets) {
                        return;
                    } else {
                        console.log("UPLOADED " + uploadedAssets + " ASSETS - ALL ASSETS READY");
                        images.total = uploadedAssets;
                        var res =  {
                            images: images
                        }
                        resolve(res);
                    }
                }
            });
        }
    }
})();