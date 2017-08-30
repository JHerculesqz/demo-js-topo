(function($){
    $.MarvelTopoNode = function() {
        var self = this;

        //#region Const

        var ICON_WIDTH = 32;
        var ICON_HEIGHT = 32;

        this.SELECT = "selectNode";
        this.UNSELECT = "";

        //#endregion

        //#region draw

        this.draw = function(oBuObj, oTopo){
            //x/y
            var iX = oBuObj.x;
            var iY = oBuObj.y;

            //0.oGroup
            var oGroup = new Konva.Group({
                id: oBuObj.id,
                x: iX,
                y: iY,
                draggable: true
            });

            //1.oImage
            var oImage = new Konva.Image({
                x: 0,
                y: 0,
                image: oTopo.Resource.m_mapImage[oBuObj.uiImgKey],
                width: ICON_WIDTH,
                height: ICON_HEIGHT
            });
            oGroup.add(oImage);

            //2.oLabel
            var oLabel = new Konva.Text({
                x: 0,
                y: 0,
                text: oBuObj.uiLabel,
                fill: oTopo.Resource.getTheme().node.labelColor
            });
            _setLabelCenter(ICON_WIDTH, ICON_HEIGHT, oLabel);
            oGroup.add(oLabel);

            //3.oLayer
            oTopo.ins.layerNode.add(oGroup);

            //4.event
            oGroup.on('click', function(evt) {
                console.log("click...");
            });
            oGroup.on('dragmove', function(evt){
                //1.联动关联的链路
                var arrLinkId = oBuObj.uiLinkIds;
                var arrLinks = [];
                for(var i=0;i<arrLinkId.length;i++){
                    var oLink = oTopo.Stage.findOne(arrLinkId[i], oTopo);
                    if(oLink){
                        var oBuObjLink = oLink.tag;
                        // oTopo.Sprite.Link.draw(oBuObjLink, i, oTopo);
                        //如果是捆绑链路
                        if(oBuObjLink.children && oBuObjLink.children.length > 1){
                            arrLinks.push(oBuObjLink);
                        }
                        //如果是捆绑链路的子链路
                        else if(oBuObjLink.parent){
                            if(arrLinks.indexOf(oBuObjLink.parent) < 0){
                                arrLinks.push(oBuObjLink.parent);
                            }
                        }
                        //如果是普通单链路
                        else{
                            arrLinks.push(oBuObjLink);
                        }
                    }
                }
                oTopo.Sprite.LinkGroup.draw4Group(arrLinks, oTopo);
            });
            oGroup.on('mouseover', function(evt) {
                document.body.style.cursor = 'pointer';
            });
            oGroup.on('mouseout', function(evt) {
                document.body.style.cursor = 'default';
            });
            oImage.on("click", function(evt){
                _setSelectNodeStyle(this, oTopo);
            });
            oImage.on("mouseover", function(){
                _setMouseHoverStyle(this, oTopo)
            });
            oImage.on("mouseout", function(){
                _setMouseHoverOutStyle(this, oTopo);
            });

            return oGroup;
        };

        this.draw4Group = function(oBuObj, oExpandGroupExists, oTopo){
            //x/y
            var iX = oBuObj.x;
            var iY = oBuObj.y;

            //0.oGroup
            var oGroup = new Konva.Group({
                id: oBuObj.id,
                x: iX,
                y: iY,
                draggable: true,
                dragBoundFunc: function(pos) {
                    var x = oExpandGroupExists.getChildren()[0].x();
                    var y = oExpandGroupExists.getChildren()[0].y();
                    var radius = oExpandGroupExists.tag.uiRadius;
                    var scale = radius / Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
                    if(scale < 1){
                        return {
                            y: Math.round((pos.y - y) * scale + y),
                            x: Math.round((pos.x - x) * scale + x)
                        };
                    }
                    else{
                        return pos;
                    }
                }
            });

            //1.oImage
            var oImage = new Konva.Image({
                x: 0,
                y: 0,
                image: oTopo.Resource.m_mapImage[oBuObj.uiImgKey],
                width: ICON_WIDTH,
                height: ICON_HEIGHT
            });
            oGroup.add(oImage);

            //2.oLabel
            var oLabel = new Konva.Text({
                x: 0,
                y: 0,
                text: oBuObj.uiLabel,
                fill: oTopo.Resource.getTheme().node.labelColor
            });
            _setLabelCenter(ICON_WIDTH, ICON_HEIGHT, oLabel);
            oGroup.add(oLabel);

            //3.oExpandGroupExists
            oExpandGroupExists.add(oGroup);

            //4.event
            oGroup.on('click', function(evt) {
                console.log("click...");
            });
            oGroup.on('mouseover', function(evt) {
                document.body.style.cursor = 'pointer';
            });
            oGroup.on('mouseout', function(evt) {
                document.body.style.cursor = 'default';
            });
            oImage.on("click", function(evt){
                _setSelectNodeStyle(this, oTopo);
            });
            oImage.on("mouseover", function(){
                _setMouseHoverStyle(this, oTopo)
            });
            oImage.on("mouseout", function(){
                _setMouseHoverOutStyle(this, oTopo);
            });

            return oGroup;
        };

        //#endregion

        //#region style

        var _setLabelCenter = function(iIconWidth, iIconHeight, oLabel){
            oLabel.setOffset({
                x: -iIconWidth / 2 + oLabel.getWidth() / 2,
                y: -iIconHeight
            });
        };

        var _setSelectNodeStyle = function(oImage, oTopo){
            //1.便于后续搜索
            oImage.name(this.SELECT);
            //2.style
            oImage.fillEnabled(true);
            oImage.strokeEnabled(true);
            oImage.stroke(oTopo.Resource.getTheme().node.selectColor);
            oImage.strokeWidth(4);
            oImage.lineJoin("round");
            oImage.lineCap("round");
            oImage.fill(oTopo.Resource.getTheme().node.selectColor);
            oTopo.Layer.reDraw(oTopo.ins.layerNode);
        };

        var _setUnSelectNodeStyle = function(oImage){
            //1.便于后续搜索
            oImage.name(this.UNSELECT);
            //2.设置样式
            oImage.fillEnabled(false);
            oImage.strokeEnabled(false);
        };

        var _setMouseHoverStyle = function(oImage, oTopo){
            oImage.shadowEnabled(true);
            oImage.shadowColor("rgba(255,255,255,0.75)");
            oImage.shadowBlur(5);
            oTopo.Layer.reDraw(oTopo.ins.layerNode);
        };

        var _setMouseHoverOutStyle = function(oImage, oTopo){
            oImage.shadowEnabled(false);
            oTopo.Layer.reDraw(oTopo.ins.layerNode);
        };

        //#endregion

        //#region imsg

        this.getCenterPos = function(oGroup){
            return {
                x: oGroup.children[0].width() / 2 + oGroup.x(),
                y: oGroup.children[0].height() / 2 + oGroup.y()
            };
        };

        this.unSelectNode = function(oImage){
            _setUnSelectNodeStyle(oImage);
        };

        //#endregion
    }
})(jQuery);