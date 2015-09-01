


var assets = {

    "bg": "images/MainGame/background_complete.jpg",
    "avatar": "images/MainGame/doomg.png"
}

var uploadedAssets = 0;

function loadAll() {


    var total = Object.keys(this.assets).length;
    var images = {};

    for (var asset in this.assets) {

        src = this.assets[asset];

        images[asset] = new Image();
        images[asset].src = assets[asset];
        images[asset].name = asset;
        images[asset].onload = function () { allLoad(); }
    }

    function allLoad(){

        if (total !== ++uploadedAssets) {

            return;
            
        } else {
            console.log(uploadedAssets);
            console.log("ALL ASSETS READY");
            return {
                images: this.images,
                total: uploadedAssets
            }
        }
    }

}
