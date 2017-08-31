(function($){
    $.MarvelTopoNodeGroup = function() {
        var self = this;

        //#region Const

        var ICON_WIDTH = 32;
        var ICON_HEIGHT = 32;

        //#endregion

        //#region draw

        this.draw = function(oBuObj, oTopo){
            if(!oBuObj.uiExpandNode){
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
            var iX = oExpandGroupExists == undefined ?
                oBuObj.x : oExpandGroupExists.getPosition().x;
            var iY = oExpandGroupExists == undefined ?
                oBuObj.y : oExpandGroupExists.getPosition().y;

            //0.oGroup
            var oGroup = new Konva.Group({
                id: oBuObj.id,
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
                oGroup.tag.uiExpandNode = true;
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
                console.log(oGroup.tag);
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
            var iX = oCollapseGroupExists == undefined ?
                oBuObj.x : oCollapseGroupExists.getPosition().x;
            var iY = oCollapseGroupExists == undefined ?
                oBuObj.y : oCollapseGroupExists.getPosition().y;

            //#region circle

            //0.oGroup
            var oGroup = new Konva.Group({
                id: oBuObj.id,
                x: iX,
                y: iY,
                opacity: oBuObj.opacity ? oBuObj.opacity : 1.0,
                draggable: true
            });
            oGroup.tag = oBuObj;

            //1.oImage
            var oImage = new Konva.Image({
                x: 0,
                y: 0,
                image: oTopo.Resource.m_mapImage["nodeGroupExpand"],
                width: oBuObj.uiExpandNodeWidth,
                height: oBuObj.uiExpandNodeHeight
            });
            oGroup.add(oImage);

            //2.oLabel
            var oLabel = new Konva.Text({
                x: 0,
                y: 0,
                text: oBuObj.uiLabel,
                fill: oTopo.Resource.getTheme().node.labelColor
            });
            _setLabelCenter(oBuObj.uiExpandNodeWidth, oBuObj.uiExpandNodeHeight, oLabel);
            oGroup.add(oLabel);

            //3.oLayer
            oTopo.ins.layerNode.add(oGroup);

            //#endregion

            //#region arrNode

            for(var i=0;i<oBuObj.children.length;i++){
                var oBuObjItem = oBuObj.children[i];
                oTopo.Sprite.Node.drawInGroup(oBuObjItem, oGroup, oTopo);
            }

            //#endregion

            //4.event
            oGroup.on('dblclick', function(evt) {
                oGroup.tag.uiExpandNode = false;
                self.drawCollapse(oBuObj, oGroup, oTopo);
            });
            oGroup.on('mouseover', function(evt) {
                document.body.style.cursor = 'pointer';
            });
            oGroup.on('mouseout', function(evt) {
                document.body.style.cursor = 'default';
            });
            //TODO:待调整nodeGroup选中样式
            oImage.on("click", function(evt){
                console.log(oGroup.tag);
                // _setSelectNodeStyle(this, oTopo);
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

        this.expandAllNodeGroup = function(oTopo){
            //1.findAll
            var arrCollapseGroupExists =
                oTopo.Stage.findGroupByTagAttr("uiExpandNode", false, oTopo);

            //2.expand
            for(var i=0;i<arrCollapseGroupExists.length;i++){
                var oCollapseGroupExists = arrCollapseGroupExists[i];
                this.drawExpand(oCollapseGroupExists.tag, oCollapseGroupExists, oTopo);
            }
        };

        this.collapseAllNodeGroup = function(oTopo){
            //1.findAll
            var arrExpandGroupExists =
                oTopo.Stage.findGroupByTagAttr("uiExpandNode", false, oTopo);

            //2.expand
            for(var i=0;i<arrExpandGroupExists.length;i++){
                var oExpandGroupExists = arrExpandGroupExists[i];
                this.drawCollapse(oExpandGroupExists.tag, oExpandGroupExists, oTopo);
            }
        };

        //#endregion
    }
})(jQuery);