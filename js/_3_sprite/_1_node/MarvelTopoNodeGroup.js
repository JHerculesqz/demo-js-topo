(function($){
    $.MarvelTopoNodeGroup = function() {
        var self = this;

        //#region Const

        var ICON_WIDTH = 32;
        var ICON_HEIGHT = 32;

        this.COLLAPSE = "collapseGroup";
        this.EXPAND = "expandGroup";

        this.SELECT = "selectNode";
        this.UNSELECT = "";

        //#endregion

        //#region draw

        this.draw = function(oBuObj, oTopo){
            if(!oBuObj.uiExpand){
                return self.drawCollapse(oBuObj, undefined, oTopo);
            }
            else{
                return self.drawExpand(oBuObj, undefined, oTopo);
            }
        };

        this.drawCollapse = function(oBuObj, oExpandGroupExists, oTopo){
            //remove
            if(oExpandGroupExists){
                oExpandGroupExists.destroy();
                oTopo.Layer.reDraw(oTopo.ins.layerNode);
            }

            //x/y
            var iX = oExpandGroupExists == undefined ? oBuObj.x : oExpandGroupExists.getPosition().x;
            var iY = oExpandGroupExists == undefined ? oBuObj.y : oExpandGroupExists.getPosition().y;

            //0.oGroup
            var oGroup = new Konva.Group({
                id: oBuObj.id,
                name: self.COLLAPSE,
                x: iX,
                y: iY,
                draggable: true
            });
            oGroup.tag = oBuObj;

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
            oGroup.on('dblclick', function(evt) {
                oBuObj.uiExpand = !oBuObj.uiExpand;
                self.drawExpand(oBuObj, oGroup, oTopo);
            });
            oGroup.on('mouseover', function(evt) {
                document.body.style.cursor = 'pointer';
            });
            oGroup.on('mouseout', function(evt) {
                document.body.style.cursor = 'default';
            });
            oGroup.on('dragmove', function(evt){
                //1.联动关联的链路
                var arrLinkId = oBuObj.uiLinkIds;
                for(var i=0;i<arrLinkId.length;i++){
                    var oLink = oTopo.Stage.findOne(arrLinkId[i], oTopo);
                    var oBuObjLink = oLink.tag;
                    oTopo.Sprite.Link.draw(oBuObjLink, i, oTopo);
                }
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

        this.drawExpand = function(oBuObj, oCollapseGroupExists, oTopo){
            //hide
            if(oCollapseGroupExists){
                oCollapseGroupExists.destroy();
                oTopo.Layer.reDraw(oTopo.ins.layerNode);
            }

            //x/y
            var iX = oCollapseGroupExists == undefined ? oBuObj.x : oCollapseGroupExists.getPosition().x;
            var iY = oCollapseGroupExists == undefined ? oBuObj.y : oCollapseGroupExists.getPosition().y;

            //#region circle

            //0.oGroup
            var oGroup = new Konva.Group({
                id: oBuObj.id,
                x: iX,
                y: iY,
                opacity: oBuObj.opacity ? oBuObj.opacity : 1.0,
                name: self.EXPAND,
                draggable: true
            });
            oGroup.tag = oBuObj;

            //1.oImage
            var oImage = new Konva.Image({
                x: 0,
                y: 0,
                image: oTopo.Resource.m_mapImage["nodeGroupExpand"],
                width: oBuObj.uiExpandWidth,
                height: oBuObj.uiExpandHeight
            });
            oGroup.add(oImage);

            //2.oLabel
            var oLabel = new Konva.Text({
                x: 0,
                y: 0,
                text: oBuObj.uiLabel,
                fill: oTopo.Resource.getTheme().node.labelColor
            });
            _setLabelCenter(oBuObj.uiExpandWidth, oBuObj.uiExpandHeight, oLabel);
            oGroup.add(oLabel);

            //3.oLayer
            oTopo.ins.layerNode.add(oGroup);

            //#endregion

            //#region arrNode

            for(var i=0;i<oBuObj.children.length;i++){
                var oBuObjItem = oBuObj.children[i];
                oTopo.Sprite.Node.draw4Group(oBuObjItem, oGroup, oTopo);
            }

            //#endregion

            //4.event
            oGroup.on('dblclick', function(evt) {
                oBuObj.uiExpand = !oBuObj.uiExpand;
                self.drawCollapse(oBuObj, oGroup, oTopo);
            });
            oGroup.on('mouseover', function(evt) {
                document.body.style.cursor = 'pointer';
            });
            oGroup.on('mouseout', function(evt) {
                document.body.style.cursor = 'default';
            });
            //TODO:待调整nodeGroup选中样式
            // oImage.on("click", function(evt){
            //     _setSelectNodeStyle(this, oTopo);
            // });
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

        this.unSelectNodeGroup = function(oImage){
            _setUnSelectNodeStyle(oImage);
        };

        //#endregion
    }
})(jQuery);