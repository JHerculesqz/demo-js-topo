(function($){
    $.MarvelTopoNode = function() {
        var self = this;

        //#region Const

        var ICON_WIDTH = 32;
        var ICON_HEIGHT = 32;

        //#endregion

        //#region draw

        this.draw = function(oBuObj, oTopo){
            //#region 1.getPos

            var oPos = _getPos(oBuObj);

            //#endregion

            //#region 2.node

            var oGroup = new Konva.Group({
                id: oBuObj.id,
                x: oPos.x,
                y: oPos.y,
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
            oTopo.Sprite.NodeGroup._setLabelCenter(ICON_WIDTH, ICON_HEIGHT, oLabel);
            oGroup.add(oLabel);

            //#endregion

            //#region 3.parent

            oTopo.ins.layerNode.add(oGroup);

            //#endregion

            //#region 4.event

            oGroup.on('mouseover', function(evt) {
                oTopo.Sprite.NodeGroup._onNodeGroupOrNodeMouseOver(oGroup, oTopo);
            });
            oGroup.on('mouseout', function(evt) {
                oTopo.Sprite.NodeGroup._onNodeGroupOrNodeMouseOut(oGroup, oTopo);
            });
            oGroup.on('click', function(evt) {
                oTopo.Sprite.NodeGroup._onNodeGroupOrNodeClick(oGroup, oTopo);
            });
            oGroup.on('dragmove', function(evt){
                //TODO:调用LinkGroup
                // //1.联动关联的链路
                // var arrLinkId = oBuObj.uiLinkIds;
                // var arrLinks = [];
                // for(var i=0;i<arrLinkId.length;i++){
                //     var oLink = oTopo.Stage.findOne(arrLinkId[i], oTopo);
                //     if(oLink){
                //         var oBuObjLink = oLink.tag;
                //         // oTopo.Sprite.Link.draw(oBuObjLink, i, oTopo);
                //         //如果是捆绑链路
                //         if(oBuObjLink.children && oBuObjLink.children.length > 1){
                //             arrLinks.push(oBuObjLink);
                //         }
                //         //如果是捆绑链路的子链路
                //         else if(oBuObjLink.parent){
                //             if(arrLinks.indexOf(oBuObjLink.parent) < 0){
                //                 arrLinks.push(oBuObjLink.parent);
                //             }
                //         }
                //         //如果是普通单链路
                //         else{
                //             arrLinks.push(oBuObjLink);
                //         }
                //     }
                // }
                // oTopo.Sprite.LinkGroup.draw4Group(arrLinks, oTopo);
            });

            //#endregion

            return oGroup;
        };

        this.drawInGroup = function(oBuObj, oExpandGroupExists, oTopo){
            //region 1.getPos

            var oPos = _getPos(oBuObj);

            //#endregion

            //#region 2.node

            var oGroup = new Konva.Group({
                id: oBuObj.id,
                x: oPos.x,
                y: oPos.y,
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
            oTopo.Sprite.NodeGroup._setLabelCenter(ICON_WIDTH, ICON_HEIGHT, oLabel);
            oGroup.add(oLabel);

            //#endregion

            //#region 3.parent

            oExpandGroupExists.add(oGroup);

            //#endregion

            //#region 4.event

            oGroup.on('mouseover', function(evt) {
                oTopo.Sprite.NodeGroup._onNodeGroupOrNodeMouseOver(oGroup, oTopo);
            });
            oGroup.on('mouseout', function(evt) {
                oTopo.Sprite.NodeGroup._onNodeGroupOrNodeMouseOut(oGroup, oTopo);
            });
            oGroup.on('click', function(evt) {
                evt.cancelBubble = true;
                oTopo.Sprite.NodeGroup._onNodeGroupOrNodeClick(oGroup, oTopo);
            });
            oGroup.on('dragmove', function(evt){
                //TODO:调用LinkGroup
            });

            //#endregion

            return oGroup;
        };

        var _getPos = function(oBuObj){
            return {
                x: oBuObj.x,
                y: oBuObj.y
            };
        };

        //#endregion

        //#region event

        //#endregion

        //#region style

        //#endregion

        //#region imsg

        this.getCenterPos = function(oGroup){
            return {
                x: oGroup.children[0].width() / 2 + oGroup.x(),
                y: oGroup.children[0].height() / 2 + oGroup.y()
            };
        };

        //#endregion
    }
})(jQuery);