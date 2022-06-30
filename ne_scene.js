const Mode = {
    None: 1,
    Select: 2,
    Connect: 3,
    PendingMove: 4,
    Move: 5,
    ContextMenu: 6
}

class NEScene {
    constructor(canvas, ctx) {
        var that = this
        this.canvas = canvas
        this.ctx = ctx

        this.mode = Mode.None

        
        this.mousedownpos_screen = { x:0, y:0 }
        this.mousedownpos_world = { x:0, y:0 }
        this.mousepos_screen = { x:0, y:0 }
        this.mousepos_world = { x:0, y:0 }

        this.selectionrange = {x: 0, x: 0, width: 0, height: 0}

        this.curr_scale = 1.0

        this.nodes = new Array()

        this.currNodes = new Array()
        this.currConnections = new Array()


        canvas.onmousedown = (e) => {that.mousedown(e)}
        canvas.onmouseup = (e) => {that.mouseup(e)}
        canvas.onmousemove = (e) => {that.mousemove(e)}
        canvas.onkeydown = (e) => {that.keydown(e)}
        canvas.onwheel = (e) => {that.mousewheel(e)}
    }

    serialize() {
        // TODO
    }

    deserialize(json) {
        // TODO
    }

    toWorld(x,y){
        var matrix = this.ctx.getTransform()
        var imatrix = matrix.invertSelf();         // invert

        // apply to point:
        return { x :x * imatrix.a + y * imatrix.c + imatrix.e,
                 y :x * imatrix.b + y * imatrix.d + imatrix.f }
    }

    drawSelectionRect() {
        if (this.mode == Mode.Select) {
            this.ctx.fillStyle = "#00AACC55";
            this.ctx.fillRect(this.mousedownpos_world.x, this.mousedownpos_world.y, this.mousepos_world.x - this.mousedownpos_world.x, this.mousepos_world.y - this.mousedownpos_world.y)
            
            this.ctx.strokeStyle = "#0088DD77";
            this.ctx.strokeRect(this.mousedownpos_world.x, this.mousedownpos_world.y, this.mousepos_world.x - this.mousedownpos_world.x, this.mousepos_world.y - this.mousedownpos_world.y)
        }
    }

    drawGrid() {

        // minor grid 
        let minor_grid_size = 50
        let left = 0.5 - Math.ceil(this.canvas.width / 2)
        let top = 0.5 - Math.ceil(this.canvas.height / 2)
        let right = this.canvas.width * 2;
        let bottom = this.canvas.height * 2;

        this.ctx.beginPath();
        this.ctx.strokeStyle = "#292929AA";
        this.ctx.lineWidth = 1

        for (let x = left; x < right; x += minor_grid_size) {
            this.ctx.moveTo(x, top);
            this.ctx.lineTo(x, bottom);
        }
        for (let y = top; y < bottom; y += minor_grid_size) {
            this.ctx.moveTo(left, y);
            this.ctx.lineTo(right, y);
        }
        this.ctx.stroke();
    }

    //updates the scene(canvas) every frame if needed
    update() {

        // clear canvas
        this.ctx.save();
        this.ctx.setTransform(1,0,0,1,0,0);
        // Will always clear the right space
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        
        this.ctx.restore();

        this.drawSelectionRect()

        // var m = matrix;
        // ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

        this.drawGrid()

        for(var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i]
            node.draw()
        }

        // for(var i = 0; i < this.ports.length; i++) {
        //     var port = this.ports[i]
        // }

        for(var i = 0; i < this.currConnections.length; i++) {
            var connection = this.currConnections[i]
            connection.draw()
        }

        

        

    }

    mousedown(e) {

        // store mousedownpos
        this.mousedownpos_screen = {x: e.clientX - this.canvas.offsetLeft, y: e.clientY - this.canvas.offsetTop}
        this.mousedownpos_world = this.toWorld(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)

        // left mouse button down
        if(e.buttons === 1) {

            if (this.mode === Mode.None){

                for(var i = 0; i < this.nodes.length; i++) {
                    var node = this.nodes[i]
        
                    if (node.graphics_node.x < this.mousedownpos_world.x && node.graphics_node.x + node.graphics_node.width > this.mousedownpos_world.x){
                        if (node.graphics_node.y < this.mousedownpos_world.y && node.graphics_node.y + node.graphics_node.height > this.mousedownpos_world.y){
                            
                            // check for ports
                            for(var j = 0; j < node.ports.length; j++) {
                                var port = node.ports[j]
                                if (port.graphics_port.x - port.graphics_port.radius < this.mousedownpos_world.x && port.graphics_port.x + port.graphics_port.radius * 2 > this.mousedownpos_world.x){
                                    if (port.graphics_port.y - port.graphics_port.radius < this.mousedownpos_world.y && port.graphics_port.y + port.graphics_port.radius * 2 > this.mousedownpos_world.y){
                                        this.mode = Mode.Connect
                                        this.currConnections.push(new NEConnection(this, this.mousedownpos_world.x, this.mousedownpos_world.y, port))
                                        return
                                    }
                                }
                            }
        
        
                            node.graphics_node.select.call(node.graphics_node)
                            this.currNodes.push(node)
                        }
                    }
                }
        
                if (this.currNodes.length == 0) {
                    this.mode = Mode.Select
                    this.selectionrange = {x: this.mousedownpos_world.x, y: this.mousedownpos_world.y, width: 0, height: 0}
                }
                else {
                    this.mode = Mode.None
                }
            }
        }
        
        // right mouse button down
        if (e.buttons === 2) {
            this.mode = Mode.PendingMove
        }

    }

    mouseup(e) {

        if (this.mode === Mode.PendingMove)
        {
            // check if moved
            if (Math.abs((e.layerX - this.canvas.offsetLeft) - this.mousedownpos_screen.x) < 10 &&
            Math.abs((e.layerY - this.canvas.offsetTop) - this.mousedownpos_screen.y) < 10) {

                this.mode = Mode.ContextMenu
                alert("context menu")
                this.update()
            }
        }

        if (this.mode === Mode.Select) {
            // rectangle select
            this.selectionrange.width = ((e.layerX - this.canvas.offsetLeft) - this.mousedownpos_world.x) / this.curr_scale
            this.selectionrange.height = ((e.layerY - this.canvas.offsetTop) - this.mousedownpos_world.y) / this.curr_scale
            
            for(var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i]
                
                if (node.graphics_node.x > this.selectionrange.x && node.graphics_node.x + node.graphics_node.width < this.selectionrange.x + this.selectionrange.width){
                    if (node.graphics_node.y > this.selectionrange.y && node.graphics_node.y + node.graphics_node.height < this.selectionrange.y + this.selectionrange.height){
                        
                        
                        this.currNodes.push(node)
                        node.graphics_node.select.call(node.graphics_node)
                    }
                }
            }
            
            // store mousedownpos
            this.mousedownpos_screen = {x: e.clientX - this.canvas.offsetLeft, y: e.clientY - this.canvas.offsetTop}
            this.mousedownpos_world = this.toWorld(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)


            if ( this.currNodes.length === 0){
                this.mode = Mode.None
            }
        }
        if (this.mode === Mode.None) {

            if (this.currNodes.length > 0) {
                for(var i = 0; i < this.currNodes.length; i++) {
                    var node = this.currNodes[i]
                    node.graphics_node.selected = false
                }
                this.currNodes = new Array()
            }
        }

        if (this.mode === Mode.Connect){

            for(var i = 0; i < this.nodes.length; i++) {
                var node = this.nodes[i]
    
                if (node.graphics_node.x < this.mousepos_world.x && node.graphics_node.x + node.graphics_node.width > this.mousepos_world.x){
                    if (node.graphics_node.y < this.mousepos_world.y && node.graphics_node.y + node.graphics_node.height > this.mousepos_world.y){
                            
                         // check for ports
                         for(var j = 0; j < node.ports.length; j++) {
                            var port = node.ports[j]
                            if (port.graphics_port.x - port.graphics_port.radius < this.mousepos_world.x && port.graphics_port.x + port.graphics_port.radius * 2 > this.mousepos_world.x){
                                if (port.graphics_port.y - port.graphics_port.radius < this.mousepos_world.y && port.graphics_port.y + port.graphics_port.radius * 2 > this.mousepos_world.y){
                                    

                                    for(var k = 0; k < this.currConnections.length; k++) {
                                        var connection = this.currConnections[k]
                                        if (connection.port1.type === port.type && connection.port1.output !== port.output){
                                            connection.port2 = port
                                            port.connections.push(connection)
                                            connection.port1.connections.push(connection)
                                            connection.graphics_connection.move()
                                        }
                                    }

                                    this.currConnections = new Array()

                                    this.mode = Mode.None
                                    this.update()
                                    return
                                }
                            }
                        }
                    }
                }
            }

            for(var i = 0; i < this.currConnections.length; i++) {
                var connection = this.currConnections[i]
                connection.delete()
            }
            this.currConnections = new Array()
            
        }

        this.update()
        this.mode = Mode.None

    }

    mousemove(e) {

        this.mousepos_world = this.toWorld(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
        this.mousepos_screen = {x: e.clientX - this.canvas.offsetLeft, y: e.clientY - this.canvas.offsetTop}
        
        if (this.mode === Mode.Select) {
             this.update()
        }

        if (this.mode === Mode.None) {
            if (this.currNodes.length > 0) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            }
    
            for(var i = 0; i < this.currNodes.length; i++) {
                var node = this.currNodes[i]
                node.graphics_node.move(
                    this.mousepos_world.x - this.mousedownpos_world.x
                    ,this.mousepos_world.y - this.mousedownpos_world.y
                )
            }
    
            if (this.currNodes.length > 0) {
                this.update()
            }
        }

        if (this.mode === Mode.PendingMove) {
            // check if moved a bit
            if (Math.abs(this.mousepos_screen.x - this.mousedownpos_screen.x) < 10 &&
             Math.abs(this.mousepos_screen.y - this.mousedownpos_screen.y) < 10) {
     
                 this.mode = Mode.Move
             }
        }

        if (this.mode === Mode.Move) {
            var deltaX = (this.mousepos_screen.x - this.mousedownpos_screen.x) * 1.0 / this.curr_scale
            var deltaY = (this.mousepos_screen.y - this.mousedownpos_screen.y) * 1.0 / this.curr_scale
            this.ctx.translate(deltaX, deltaY)

            this.mousedownpos_world = this.mousepos_world
            this.mousedownpos_screen = this.mousepos_screen
            this.update()
        }

        if (this.mode === Mode.Connect){
            for(var i = 0; i < this.currConnections.length; i++) {
                var connection = this.currConnections[i]
                connection.graphics_connection.move(this.mousepos_world.x, this.mousepos_world.y)
            }

            this.update()
        }
        
    }

    keydown(e) {
        // Delete
        if (e.keyCode == 46) {

            for(var i = 0; i < this.currNodes.length; i++) {
                var node = this.currNodes[i]

                if(node.can_be_deleted){
                    node.delete()

                    var idx = this.nodes.indexOf(node)
                    this.nodes.splice(idx, 1)
                }
            }

            this.currNodes = new Array()

            this.mode = Mode.None
            this.update()
            
        }

        if (e.keyCode == 83){
            // for(var i = 0; i < this.nodes.length; i++){
            //     var node = this.nodes[i]
            // }

            var serial_str = JSON.stringify(this.nodes, function( key, value) {
                if( key == 'nodes' || key == 'that') { return value.id;}
                else {return value;}
            })

            console.log(serial)
        }
    }

    mousewheel(e) {
        this.curr_scale *= 1.0 + (e.deltaY / 102.0) / 5.0
        // console.log(this.curr_scale)
        // this.ctx.scale(this.curr_scale, this.curr_scale)
        this.ctx.scale(1.0 + (e.deltaY / 102.0) / 5.0, 1.0 + (e.deltaY / 102.0) / 5.0)
        e.preventDefault()

        this.update()
    }
}