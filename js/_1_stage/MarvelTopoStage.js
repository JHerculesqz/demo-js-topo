(function($){
    $.MarvelTopoStage = function() {
        var self = this;

        //#region Const

        var ZOOM_SCALE = 2;

        //#endregion

        //#region Fields



        //#endregion

        //#region init

        this.init = function(strId, iWidth, iHeight, oTopo){
            //_initContainer
            _initContainer(strId, oTopo);

            //oStage
            var oStage = new Konva.Stage({
                container: strId,
                width: iWidth,
                height: iHeight,
                draggable: true
            });

            //event
            _initEventZoom(oStage);

            return oStage;
        };

        var _initContainer = function (strId, oTopo) {
            $("#" + strId).css("background-color", oTopo.Resource.getTheme().stage["bgColor"]);
            $("#" + strId).css("background-image", oTopo.Resource.getTheme().stage["bgImg"]);
        };

        //TODO:需要缩小绑定事件的范围
        var _initEventZoom = function(oStage){
            window.addEventListener('wheel', function(e){
                e.preventDefault();
                var oldScale = oStage.scaleX();
                var mousePointTo = {
                    x: oStage.getPointerPosition().x / oldScale - oStage.x() / oldScale,
                    y: oStage.getPointerPosition().y / oldScale - oStage.y() / oldScale
                };
                var newScale = e.deltaY > 0 ? oldScale * ZOOM_SCALE : oldScale / ZOOM_SCALE;
                oStage.scale({ x: newScale, y: newScale });
                var newPos = {
                    x: -(mousePointTo.x - oStage.getPointerPosition().x / newScale) * newScale,
                    y: -(mousePointTo.y - oStage.getPointerPosition().y / newScale) * newScale
                };
                oStage.position(newPos);
                oStage.batchDraw();
            });
        };

        //#endregion

        //#region find

        this.findOne = function (strId, oTopo) {
            var oEle = oTopo.ins.stage.findOne("#" + strId);
            return oEle;
        };

        //#endregion
    }
})(jQuery);