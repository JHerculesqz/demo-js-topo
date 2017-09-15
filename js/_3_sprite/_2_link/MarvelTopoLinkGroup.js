(function ($) {
    //TODO:待重构
    $.MarvelTopoLinkGroup = function () {
        var self = this;

        //#region Const

        var OFFSET = 10;

        //#endregion

        //#region draw

        this.draw = function (arrLinks, oTopo) {
            //对链路按照源宿网元进行分组
            var groupByNodes = {};
            arrLinks.forEach(function (oLink, index) {
                var groupNodeId = _getGroupNodeId(oLink, oTopo);
                var arrLinks = groupByNodes[groupNodeId];
                if (!arrLinks) {
                    arrLinks = groupByNodes[groupNodeId] = [];
                }
                arrLinks.push(oLink);
            });
            //对两个网元之间的链路进行分组，用于找出可以捆绑的链路
            for (var k in groupByNodes) {
                var arrLinks4Draw = [];
                var groupByGroupLinkId = {};
                groupByNodes[k].forEach(function (oLink, index) {
                    //如果设置了uiLinkGroupId
                    if (oLink.uiLinkGroupId) {
                        var groupLinks = groupByGroupLinkId[oLink.uiLinkGroupId];
                        if (!groupLinks) {
                            groupLinks = groupByGroupLinkId[oLink.uiLinkGroupId] = [];
                        }
                        groupLinks.push(oLink);
                    }
                    //没有设置uiLinkGroupId的，认为是单根链路
                    else {
                        arrLinks4Draw.push(oLink);
                    }
                });
                for (var key in groupByGroupLinkId) {
                    var groupLinks = groupByGroupLinkId[key];
                    //如果groupLinks的长度为1，认为是单根链路
                    if (groupLinks.length === 1) {
                        arrLinks4Draw.push(groupLinks[0]);
                    }
                    else {
                        var groupLink = _generateGroupLink(groupLinks);
                        arrLinks4Draw.push(groupLink);
                    }
                }
                //绘制两个网元之间的链路
                _draw4Group(arrLinks4Draw, oTopo);

                //linkLayer绘制
                oTopo.Layer.reDraw(oTopo.ins.layerLink);
            }
        };

        var _getGroupNodeId = function (oLink, oTopo) {
            //找到绘制的节点(节点自己或者节点的父亲)
            var srcNodeRel = oTopo.Sprite.NodeGroup.getDrawnNodeById(oLink.srcNodeId, oTopo);
            var dstNodeRel = oTopo.Sprite.NodeGroup.getDrawnNodeById(oLink.dstNodeId, oTopo);
            if (srcNodeRel.id < dstNodeRel.id) {
                return srcNodeRel.id + "-" + dstNodeRel.id;
            }
            else {
                return dstNodeRel.id + "-" + srcNodeRel.id;
            }
        };

        var _generateGroupLink = function (groupLinks) {
            var oChildLink = groupLinks[0];
            var groupLink = {
                id: oChildLink.uiLinkGroupId,
                srcNodeId: oChildLink.srcNodeId,
                dstNodeId: oChildLink.dstNodeId,
                uiLink: true,
                uiLinkExpand: oChildLink.uiLinkExpand,
                children: groupLinks
            };
            return groupLink;
        };

        var _isGroupLink = function (oBuObj) {
            return oBuObj.children && oBuObj.children.length > 1;
        };

        var _draw4Group = function (arrLinks, oTopo) {
            //需要绘制的链路
            var arrLinks4Draw = [];
            arrLinks.forEach(function (oLink, index) {
                //如果是捆绑链路
                if (_isGroupLink(oLink)) {
                    //如果是展开的
                    if (oLink.uiLinkExpand === true) {
                        oLink.children.forEach(function (oChildLink, index) {
                            oChildLink.parent = oLink;
                            arrLinks4Draw.push(oChildLink);
                        });
                    }
                    //如果是折叠的
                    else {
                        arrLinks4Draw.push(oLink);
                    }
                }
                //如果是单根链路
                else {
                    arrLinks4Draw.push(oLink);
                }
            });

            arrLinks4Draw.forEach(function (oLink, index) {
                _drawLink(arrLinks, oLink, index, oTopo);
            });
        };

        var _drawLink = function (arrSrcLinks, oBuObj, iOffsetIndex, oTopo) {
            //remove
            var oLinkExists = oTopo.Stage.findOne(oBuObj.id, oTopo);
            if (oLinkExists) {
                oLinkExists.destroy();
            }

            var position = _getPosition(oBuObj, iOffsetIndex, oTopo);

            //group
            var oGroup = new Konva.Group({
                x: 0,
                y: 0,
                id: oBuObj.id
            });
            oGroup.tag = oBuObj;

            //line
            var oLine = new Konva.Line({
                points: [position.start.x, position.start.y, position.middle.x, position.middle.y, position.end.x, position.end.y],
                stroke: _getLinkColor(oBuObj, oTopo),
                strokeWidth: _getLinkWidth(oBuObj, oTopo),
                dash: _getLinkDash(oBuObj, oTopo),
                tension: 1
            });
            oGroup.add(oLine);

            //label
            var oCenterLabel = new Konva.Text({
                x: 0,
                y: 0,
                text: _genLinkCenterLabel(oBuObj, oTopo),
                fontSize: 12,
                fill: _getCenterLabelColor(oBuObj, oTopo)
            });
            _setCenterLabelPosition(oCenterLabel, position.middle);
            oGroup.add(oCenterLabel);

            oTopo.ins.layerLink.add(oGroup);

            //event
            oLine.on("click", function (evt) {
                console.log("link click");
                _setSelectLinkStyle(this, oTopo);
            });
            oLine.on("mouseover", function (evt) {
                _setMouseHoverStyle(this, oTopo)
            });
            oLine.on("mouseout", function (evt) {
                _setMouseHoverOutStyle(this, oTopo);
            });
            oLine.on("dblclick", function (evt) {
                console.log("link dblclick");
                _dblClickLink(arrSrcLinks, oGroup, oTopo);
            });

            return oLine;
        };

        //#endregion

        //#region event

        var _setSelectLinkStyle = function (oLine, oTopo) {

        };

        var _setMouseHoverStyle = function (oLine, oTopo) {

        };

        var _setMouseHoverOutStyle = function (oLine, oTopo) {

        };

        var _dblClickLink = function (arrSrcLinks, oGroup, oTopo) {
            //如果是捆绑链路
            var oBuObj = oGroup.tag;
            if (_isGroupLink(oBuObj)) {
                oGroup.destroy();
                oBuObj.uiLinkExpand = true;
                oBuObj.children.forEach(function (oChildLink, index) {
                    oChildLink.uiLinkExpand = true;
                });
                _draw4Group(arrSrcLinks, oTopo);
                oTopo.Layer.reDraw(oTopo.ins.layerLink);
            }
            //如果是单根的有parent的链路
            else if (oBuObj.parent) {
                //干掉所有的子链路
                oBuObj.parent.children.forEach(function (oChildLink) {
                    oChildLink.uiLinkExpand = false;
                    var oChildLine = oTopo.Stage.findOne(oChildLink.id, oTopo);
                    if (oChildLine) {
                        oChildLine.destroy();
                    }
                });
                oBuObj.parent.uiLinkExpand = false;
                _draw4Group(arrSrcLinks, oTopo);
                oTopo.Layer.reDraw(oTopo.ins.layerLink);
            }
            //如果是单根的没有parent的链路
            else {
                //do nothing
            }
        };

        //#endregion

        //#region style

        var _getBezierPoint = function (oPointStart, oPointEnd, iHeight) {
            //1.oPointMid
            var oPointMid = {
                x: (oPointEnd.x - oPointStart.x) / 2 + oPointStart.x,
                y: (oPointEnd.y - oPointStart.y) / 2 + oPointStart.y
            };

            //2.iSin/iCos
            var iDistance = Math.sqrt(
                Math.pow(oPointEnd.x - oPointStart.x, 2) +
                Math.pow(oPointEnd.y - oPointStart.y, 2), 2);
            var iSin = (oPointEnd.y - oPointStart.y) / iDistance;
            var iCos = (oPointEnd.x - oPointStart.x) / iDistance;

            //3.iOffsetX/iOffsetY
            var iOffsetX = iHeight * iSin;
            var iOffsetY = iHeight * iCos;

            //4.oBezierPoint
            return {
                x: oPointMid.x + iOffsetX,
                y: oPointMid.y + iOffsetY
            };
        };

        //这个函数中算中间节点的代码可以参考_getBezierPoint中计算方式优化
        var _getPosition = function (oBuObj, iOffsetIndex, oTopo) {
            //oNodeSrc/oNodeDst
            var oNodeSrc = oTopo.Sprite.NodeGroup.getDrawnGroupById(oBuObj.srcNodeId, oTopo);
            var oNodeDst = oTopo.Sprite.NodeGroup.getDrawnGroupById(oBuObj.dstNodeId, oTopo);

            var oNodeSrcPos = oTopo.Sprite.Node.getCenterPos(oNodeSrc);
            var oNodeDstPos = oTopo.Sprite.Node.getCenterPos(oNodeDst);

            //确保源节点在宿节点的左侧
            if (oNodeDstPos.x < oNodeSrcPos.x) {
                var temp = oNodeSrcPos;
                oNodeSrcPos = oNodeDstPos;
                oNodeDstPos = temp;
            }

            var sX = oNodeSrcPos.x;
            var sY = oNodeSrcPos.y;
            var eX = oNodeDstPos.x;
            var eY = oNodeDstPos.y;

            var mX, mY, step;
            //如果是奇数
            if (iOffsetIndex % 2 === 1) {
                step = (iOffsetIndex + 1) / 2 * OFFSET;
            }
            //如果是偶数
            else {
                step = iOffsetIndex / 2 * OFFSET;
            }

            var length = Math.sqrt(Math.pow(sX - eX, 2) + Math.pow(sY - eY, 2));
            var a1 = Math.atan(step / (length / 2));
            var a2 = Math.atan(Math.abs(sY - eY) / Math.abs(sX - eX));
            var radius = Math.sqrt(Math.pow(step, 2) + Math.pow(length / 2, 2));

            //1.区分两种场景
            //1.1如果源节点的y坐标大于宿节点的y坐标
            if (sY > eY) {
                //如果为奇数
                if (iOffsetIndex % 2 === 1) {
                    mX = sX + radius * Math.cos(a2 + a1);
                    mY = sY - radius * Math.sin(a2 + a1);
                }
                //如果为偶数
                else {
                    mX = sX + radius * Math.cos(a2 - a1);
                    mY = sY - radius * Math.sin(a2 - a1);
                }
            }
            //1.2如果源节点的y坐标小于宿节点的y坐标
            else {
                //如果为奇数
                if (iOffsetIndex % 2 === 1) {
                    mX = sX + radius * Math.cos(a2 - a1);
                    mY = sY + radius * Math.sin(a2 - a1);
                }
                //如果为偶数
                else {
                    mX = sX + radius * Math.cos(a2 + a1);
                    mY = sY + radius * Math.sin(a2 + a1);
                }
            }

            return {
                start: {
                    x: sX,
                    y: sY
                },
                middle: {
                    x: mX,
                    y: mY
                },
                end: {
                    x: eX,
                    y: eY
                }
            }

        };

        var _setCenterLabelPosition = function (oLabel, oPosition) {
            oLabel.setOffset({
                x: -oPosition.x + oLabel.getWidth() / 2,
                y: -oPosition.y
            });
        };

        //链路颜色，后续可能回调业务代码来实现
        var _getLinkColor = function (oBuObj, oTopo) {
            if (_isGroupLink(oBuObj)) {
                return oTopo.Resource.getTheme().link.linkColor[oBuObj.children[0].uiLinkColorKey];
            }
            else {
                return oTopo.Resource.getTheme().link.linkColor[oBuObj.uiLinkColorKey];
            }
        };

        //链路宽度，后续可能回调业务代码来实现
        var _getLinkWidth = function (oBuObj, oTopo) {
            if (_isGroupLink(oBuObj)) {
                return oBuObj.children[0].uiLinkWidth;
            }
            return oBuObj.uiLinkWidth;
        };

        var _getLinkDash = function (oBuObj, oTopo) {
            if (_isGroupLink(oBuObj)) {
                return oBuObj.children[0].uiDash ? oBuObj.children[0].uiDash : [];
            }
            else {
                return oBuObj.uiDash ? oBuObj.uiDash : [];
            }
        };

        //链路中间label，后续可能回调业务代码来实现
        var _genLinkCenterLabel = function (oBuObj, oTopo) {
            if (_isGroupLink(oBuObj)) {
                return oBuObj.children[0].uiLabelM;
            }
            else {
                return oBuObj.uiLabelM;
            }
        };

        var _getCenterLabelColor = function (oBuObj, oTopo) {
            return oTopo.Resource.getTheme().link.labelColor;
        };

        //#endregion

        //#region imsg

        this.response2NodeEvent4ReDraw = function (oNode, oTopo) {
            var arrLinks = [];
            var oGroups = oTopo.Stage.findGroupByTagAttr("uiLink", true, oTopo);
            oGroups.forEach(function (oGroup, index) {
                var oBuObj = oGroup.tag;
                //直接和这个Node相连的链路
                if (oNode.id === oBuObj.srcNodeId || oNode.id === oBuObj.dstNodeId) {
                    if (_isGroupLink(oBuObj)) {
                        arrLinks = arrLinks.concat(oBuObj.children);
                    }
                    else {
                        arrLinks.push(oBuObj);
                    }
                }
                //和这个Node的childNode相连的链路
                if (oNode.children && oNode.children.length > 0) {
                    oNode.children.forEach(function (oChildNode, index) {
                        if (oChildNode.id === oBuObj.srcNodeId || oChildNode.id === oBuObj.dstNodeId) {
                            if (_isGroupLink(oBuObj)) {
                                oBuObj.children.forEach(function (oChildLink, index) {
                                    arrLinks.push(oChildLink);
                                })
                            }
                            else {
                                arrLinks.push(oBuObj);
                            }
                        }
                    });
                }
            });
            //绘制
            this.draw(arrLinks, oTopo);
        };

        this.expandAllLinkGroup = function (oTopo) {
            //获取所有的折叠链路
            var arrCollapseGroups = oTopo.Stage.findGroupByTagAttr("uiLinkExpand", false, oTopo);
            if (arrCollapseGroups.length === 0) {
                return;
            }
            var arrLinks4ReDraw = [];
            var oId2Links = {};
            arrCollapseGroups.forEach(function (oCollapseGroup, index) {
                var oBuObj = oCollapseGroup.tag;
                oBuObj.uiLinkExpand = true;
                oBuObj.children.forEach(function (oChildLink, index) {
                    oChildLink.uiLinkExpand = true;
                });
                var oLinks = _getLinksBySrcAndDstNodeId(oBuObj.srcNodeId, oBuObj.dstNodeId, oTopo);
                Object.assign(oId2Links, oLinks);

                //干掉绘制的链路
                oCollapseGroup.destroy();
            });

            if (Object.values) {
                arrLinks4ReDraw = Object.values(oId2Links);
            }
            else {
                for (var k in oId2Links) {
                    arrLinks4ReDraw.push(oId2Links[k]);
                }
            }
            self.draw(arrLinks4ReDraw, oTopo);
        };

        var _getLinksBySrcAndDstNodeId = function (srcNodeId, dstNodeId, oTopo) {
            var arrLinkGroups = oTopo.Stage.findGroupByTagAttr("uiLink", true, oTopo);
            var oId2Links = {};
            arrLinkGroups.forEach(function (oLinkGroup, index) {
                var oBuObj = oLinkGroup.tag;
                var bSame = false;
                if (oBuObj.srcNodeId === srcNodeId && oBuObj.dstNodeId === dstNodeId) {
                    bSame = true;
                }
                else if (oBuObj.srcNodeId === dstNodeId && oBuObj.dstNodeId === srcNodeId) {
                    bSame = true;
                }
                if (bSame) {
                    if (_isGroupLink(oBuObj)) {
                        oBuObj.children.forEach(function (oChildLink, index) {
                            oId2Links[oChildLink.id] = oChildLink;
                        });
                    }
                    else {
                        oId2Links[oBuObj.id] = oBuObj;
                    }
                }
            });

            return oId2Links;
        };

        this.collapseAllLinkGroup = function (oTopo) {
            //获取所有的展开链路
            var arrExpandGroups = oTopo.Stage.findGroupByTagAttr("uiLinkExpand", true, oTopo);
            if (arrExpandGroups.length === 0) {
                return;
            }
            var arrLinks4ReDraw = [];
            var oId2Links = {};
            arrExpandGroups.forEach(function (oExpandGroup, index) {
                var oBuObj = oExpandGroup.tag;
                oBuObj.uiLinkExpand = false;
                var oLinks = _getLinksBySrcAndDstNodeId(oBuObj.srcNodeId, oBuObj.dstNodeId, oTopo);
                Object.assign(oId2Links, oLinks);
                //干掉绘制的链路
                oExpandGroup.destroy();
            });

            if (Object.values) {
                arrLinks4ReDraw = Object.values(oId2Links);
            }
            else {
                for (var k in oId2Links) {
                    arrLinks4ReDraw.push(oId2Links[k]);
                }
            }
            self.draw(arrLinks4ReDraw, oTopo);
        };

        //#endregion
    }
})(jQuery);