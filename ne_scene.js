class NEScene {
    constructor(canvas, ctx) {
        var that = this
        this.canvas = canvas
        this.ctx = ctx

        this.nodes = new Array()
        this.ports = new Array()
        this.connections = new Array()

        this.mousedownpos = { x:0, y:0 }
        this.mousepos = { x:0, y:0 }
        this.selectionrange = {x: 0, x: 0, width: 0, height: 0}

        this.currNodes = new Array()

        this.selectionmode = false

        

        canvas.onmousedown = (e) => {that.mousedown(e)}
        canvas.onmouseup = (e) => {that.mouseup(e)}
        canvas.onmousemove = (e) => {that.mousemove(e)}
        canvas.onkeydown = (e) => {that.keydown(e)}
    }

    drawSelectionRect() {
        if (this.selectionmode) {
            this.ctx.fillStyle = "#00AACC55";
            this.ctx.fillRect(this.mousedownpos.x, this.mousedownpos.y, this.mousepos.x - this.mousedownpos.x, this.mousepos.y - this.mousedownpos.y)
            
            this.ctx.strokeStyle = "#0088DD77";
            this.ctx.strokeRect(this.mousedownpos.x, this.mousedownpos.y, this.mousepos.x - this.mousedownpos.x, this.mousepos.y - this.mousedownpos.y)
        }
    }

    drawGrid() {

        // minor grid 
        this.ctx.beginPath();
        var minor_grid_spacing = 40
        var padding = 0
        this.ctx.lineWidth = 1
        for (var x = 0; x <= this.canvas.width; x += minor_grid_spacing) {
            this.ctx.moveTo(0.5 + x + padding, padding);
            this.ctx.lineTo(0.5 + x + padding, this.canvas.height + padding);
        }
    
        for (var x = 0; x <= this.canvas.height; x += minor_grid_spacing) {
            this.ctx.moveTo(padding, 0.5 + x + padding);
            this.ctx.lineTo(this.canvas.width + padding, 0.5 + x + padding);
        }
        this.ctx.strokeStyle = "#292929AA";
        this.ctx.stroke();

        // major grid 
        this.ctx.beginPath();
        var major_grid_spacing = 200
        var padding = 0
        this.ctx.lineWidth = 2
        for (var x = 0; x <= this.canvas.width; x += major_grid_spacing) {
            this.ctx.moveTo(0.5 + x + padding, padding);
            this.ctx.lineTo(0.5 + x + padding, this.canvas.height + padding);
        }
    
        for (var x = 0; x <= this.canvas.height; x += major_grid_spacing) {
            this.ctx.moveTo(padding, 0.5 + x + padding);
            this.ctx.lineTo(this.canvas.width + padding, 0.5 + x + padding);
        }
        this.ctx.strokeStyle = "#2F2F2FAA";
        this.ctx.stroke();
    }

    draw() {

        // clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

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

        this.drawSelectionRect()

    }

    mousedown(e) {

        // store mousedownpos
        this.mousedownpos.x = e.layerX - this.canvas.offsetLeft
        this.mousedownpos.y = e.layerY - this.canvas.offsetTop

        for(var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i]

            if (node.graphics_node.x < this.mousedownpos.x && node.graphics_node.x + node.graphics_node.width > this.mousedownpos.x){
                if (node.graphics_node.y < this.mousedownpos.y && node.graphics_node.y + node.graphics_node.height > this.mousedownpos.y){
                    node.graphics_node.select.call(node.graphics_node)
                    this.currNodes.push(node)
                }
            }
        }

        if (this.currNodes.length == 0) {
            this.selectionmode = true
            this.selectionrange = {x: this.mousedownpos.x, y: this.mousedownpos.y, width: 0, height: 0}
        }
        else {
            this.selectionmode = false
        }
    }

    mouseup(e) {

        // check if moved
        if (Math.abs((e.layerX - this.canvas.offsetLeft) - this.mousedownpos.x) < 10 &&
        Math.abs((e.layerY - this.canvas.offsetTop) - this.mousedownpos.y) < 10) {

            this.selectionmode = false
        }

        
        if (this.selectionmode) {
            // rectangle select
            this.selectionrange.width = (e.layerX - this.canvas.offsetLeft) - this.mousedownpos.x
            this.selectionrange.height = (e.layerY - this.canvas.offsetTop) - this.mousedownpos.y
            
            for(var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i]
                
                if (node.graphics_node.x > this.selectionrange.x && node.graphics_node.x + node.graphics_node.width < this.selectionrange.x + this.selectionrange.width){
                    if (node.graphics_node.y > this.selectionrange.y && node.graphics_node.y + node.graphics_node.height < this.selectionrange.y + this.selectionrange.height){
                        
                        
                        this.currNodes.push(node)
                        node.graphics_node.select.call(node.graphics_node)
                    }
                }
            }
            
            this.mousedownpos.x = e.layerX - this.canvas.offsetLeft
            this.mousedownpos.y = e.layerY - this.canvas.offsetTop
        }
        else {

            if (this.currNodes.length > 0) {
                for(var i = 0; i < this.currNodes.length; i++) {
                    var node = this.currNodes[i]
                    node.graphics_node.selected = false
                }
                this.currNodes = new Array()
    
                
            }

        }
        this.draw()
        this.selectionmode = false
        
    }

    mousemove(e) {
        if (this.selectionmode) {
            this.mousepos = {x: e.layerX - this.canvas.offsetLeft, y: e.layerY - this.canvas.offsetTop}
            this.draw()
        }
        else {
            if (this.currNodes.length > 0) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            }
    
            for(var i = 0; i < this.currNodes.length; i++) {
                var node = this.currNodes[i]
                node.graphics_node.move(
                    e.layerX - this.canvas.offsetLeft - this.mousedownpos.x
                    ,e.layerY - this.canvas.offsetTop - this.mousedownpos.y
                )
            }
    
            if (this.currNodes.length > 0) {
                this.draw()
            }
        }
        
    }

    keydown(e) {
        // Delete
        if (e.keyCode == 46) {

            for(var i = 0; i < this.currNodes.length; i++) {
                var node = this.currNodes[i]

                node.delete()

                var idx = this.nodes.indexOf(node)
                this.nodes.splice(idx, 1)
            }

            this.currNodes = new Array()

            this.selectionmode = false
            this.draw()
            
        }
    }
}