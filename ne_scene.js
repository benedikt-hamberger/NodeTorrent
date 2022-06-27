class NEScene {
    constructor(canvas, ctx) {
        var that = this
        this.canvas = canvas
        this.ctx = ctx

        this.nodes = new Array()
        this.ports = new Array()
        this.connections = new Array()

        this.mousedownpos = { x:0, y:0 }
        this.initialnodedownpos = { x:0, y:0 }

        this.currNodes = new Array()

        canvas.onmousedown = (e) => {that.mousedown(e)}
        canvas.onmouseup = (e) => {that.mouseup(e)}
        canvas.onmousemove = (e) => {that.mousemove(e)}
        canvas.onkeydown = (e) => {that.keydown(e)}
    }

    drawGrid() {
        var gridspacing = 40
        var p = 10
        for (var x = 0; x <= this.canvas.width; x += gridspacing) {
            this.ctx.moveTo(0.5 + x + p, p);
            this.ctx.lineTo(0.5 + x + p, this.canvas.height + p);
        }
    
        for (var x = 0; x <= this.canvas.height; x += gridspacing) {
            this.ctx.moveTo(p, 0.5 + x + p);
            this.ctx.lineTo(this.canvas.width + p, 0.5 + x + p);
        }
        this.ctx.strokeStyle = "#22222288";
        this.ctx.stroke();
    }

    draw() {

        this.drawGrid()

        for(var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i]
            node.draw()
        }

        for(var i = 0; i < this.ports.length; i++) {
            var port = this.ports[i]
        }

        for(var i = 0; i < this.connections.length; i++) {
            var connection = this.connections[i]
        }

    }

    mousedown(e) {

        // store mousedownpos
        this.mousedownpos.x = e.layerX - this.canvas.offsetLeft
        this.mousedownpos.y = e.layerY - this.canvas.offsetTop

        

        for(var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i]

            if (node.graphics_node.x < this.mousedownpos.x && node.graphics_node.x + node.graphics_node.width > this.mousedownpos.x){
                if (node.graphics_node.y < this.mousedownpos.y && node.graphics_node.y + node.graphics_node.height > this.mousedownpos.y){
 
                    this.initialnodedownpos.x = node.graphics_node.x
                    this.initialnodedownpos.y = node.graphics_node.y
                    this.currNodes.push(node)
                    node.graphics_node.selected = true
                }
            }
            
        }
    }

    mouseup(e) {
        if (this.currNodes.length > 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        

            for(var i = 0; i < this.currNodes.length; i++) {
                var node = this.currNodes[i]
                node.graphics_node.selected = false
            }
            this.currNodes = new Array()

            this.draw()
        }
    }

    mousemove(e) {
        if (this.currNodes.length > 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }

        for(var i = 0; i < this.currNodes.length; i++) {
            var node = this.currNodes[i]

            node.graphics_node.x = e.layerX - this.canvas.offsetLeft - (this.mousedownpos.x - this.initialnodedownpos.x)
            node.graphics_node.y =  e.layerY - this.canvas.offsetTop - (this.mousedownpos.y - this.initialnodedownpos.y)
        }

        if (this.currNodes.length > 0) {
            this.draw()
        }
    }

    keydown(e) {
        // Delete
        if (e.keyCode = 46) {
            //TODO delete selected Nodes
        }
    }
}