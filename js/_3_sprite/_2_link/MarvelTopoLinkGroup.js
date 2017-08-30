(function($){
    //TODO:待重构
    $.MarvelTopoLinkGroup = function() {
        var self = this;

        //#region Const

        var OFFSET = 10;

        //#endregion

        //#region draw

        this.draw4Group = function(arrLinks, oTopo){
            //需要绘制的链路
            var arrLinks4Draw = [];
            arrLinks.forEach(function(oLink, index){
                //如果是捆绑链路
                if(oLink.children && oLink.children.length > 1){
                    //如果是展开的
                    if(oLink.expand === true){
                        oLink.children.forEach(function(oChildLink, index){
                            oChildLink.parent = oLink;
                            arrLinks4Draw.push(oChildLink);
                        });
                    }
                    //如果是折叠的
                    else{
                        arrLinks4Draw.push(oLink);
                    }
                }
                //如果是单根链路
                else{
                    arrLinks4Draw.push(oLink);
                }
            });

            arrLinks4Draw.forEach(function(oLink, index){
                _draw(arrLinks, oLink, index, oTopo);
            });
        };

        var _draw = function(arrSrcLinks, oBuObj, iOffsetIndex, oTopo){
            //remove
            var oLinkExists = oTopo.Stage.findOne(oBuObj.id, oTopo);
            if(oLinkExists){
                oLinkExists.destroy();
                oTopo.Layer.reDraw(oTopo.ins.layerLink);
            }

            //oNodeSrc/oNodeDst
            var oNodeSrc = oTopo.Stage.findOne(oBuObj.srcNodeId, oTopo);
            var oNodeDst = oTopo.Stage.findOne(oBuObj.dstNodeId, oTopo);

            //oPosStart/oPosMid/oPosEnd
            var oPosStart = {
                x: oTopo.Sprite.Node.getCenterPos(oNodeSrc).x,
                y: oTopo.Sprite.Node.getCenterPos(oNodeSrc).y
            };
            var oPosEnd = {
                x: oTopo.Sprite.Node.getCenterPos(oNodeDst).x,
                y: oTopo.Sprite.Node.getCenterPos(oNodeDst).y
            };
            var iOffsetHeight = 0;
            if(0 == iOffsetIndex % 2){
                iOffsetHeight = iOffsetIndex/2 * OFFSET;
            }
            else{
                iOffsetHeight = -(iOffsetIndex+1)/2 * OFFSET;
            }
            var oPosMid = _getBezierPoint(oPosStart, oPosEnd, iOffsetHeight);

            var oLine = new Konva.Line({
                id: oBuObj.id,
                points: [oPosStart.x, oPosStart.y, oPosMid.x, oPosMid.y, oPosEnd.x, oPosEnd.y],
                stroke: oTopo.Resource.getTheme().link.linkColor[oBuObj.uiLinkColorKey],
                strokeWidth: oBuObj.uiLinkWidth,
                tension: 1
            });
            oLine.tag = oBuObj;
            oTopo.ins.layerLink.add(oLine);

            //event
            oLine.on("click", function(evt){
                console.log("link click");
                _setSelectLinkStyle(this, oTopo);
            });
            oLine.on("mouseover", function(evt){
                _setMouseHoverStyle(this, oTopo)
            });
            oLine.on("mouseout", function(evt){
                _setMouseHoverOutStyle(this, oTopo);
            });
            oLine.on("dblclick", function(evt){
                console.log("link dblclick");
                _dblClickLink(arrSrcLinks, this, oTopo);
            });

            return oLine;
        };

        //#endregion

        //#region style

        var _getBezierPoint = function(oPointStart, oPointEnd, iHeight){
            //1.oPointMid
            var oPointMid = {
                x: (oPointEnd.x - oPointStart.x)/2 + oPointStart.x,
                y: (oPointEnd.y - oPointStart.y)/2 + oPointStart.y
            };

            //2.iSin/iCos
            var iDistance = Math.sqrt(
                Math.pow(oPointEnd.x - oPointStart.x, 2) +
                Math.pow(oPointEnd.y - oPointStart.y, 2), 2);
            var iSin = (oPointEnd.y - oPointStart.y)/iDistance;
            var iCos = (oPointEnd.x - oPointStart.x)/iDistance;

            //3.iOffsetX/iOffsetY
            var iOffsetX = iHeight * iSin;
            var iOffsetY = iHeight * iCos;

            //4.oBezierPoint
            return {
                x: oPointMid.x + iOffsetX,
                y: oPointMid.y + iOffsetY
            };
        };

        var _setSelectLinkStyle = function(oLine, oTopo){

        };

        var _setMouseHoverStyle = function(oLine, oTopo){

        };

        var _setMouseHoverOutStyle = function(oLine, oTopo){

        };

        var _dblClickLink = function(arrSrcLinks, oLine, oTopo){
            //如果是捆绑链路
            var oBuObj = oLine.tag;
            if(oBuObj.children && oBuObj.children.length > 1){
                oLine.destroy();
                oBuObj.expand = true;
                self.draw4Group(arrSrcLinks, oTopo);
                oTopo.Layer.reDraw(oTopo.ins.layerLink);
            }
            //如果是单根的有parent的链路
            else if(oBuObj.parent){
                //干掉所有的子链路
                oBuObj.parent.children.forEach(function(oChildLink){
                    var oChildLine = oTopo.Stage.findOne(oChildLink.id, oTopo);
                    if(oChildLine){
                        oChildLine.destroy();
                    }
                });
                oBuObj.parent.expand = false;
                self.draw4Group(arrSrcLinks, oTopo);
                oTopo.Layer.reDraw(oTopo.ins.layerLink);
            }
            //如果是单根的没有parent的链路
            else{
                //do nothing
            }
        };

        //#endregion

        //#region imsg

        //#endregion
    }
})(jQuery);