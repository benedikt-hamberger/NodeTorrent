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

        this.selected_nodes = new Array()
        this.currConnections = new Array()


        canvas.onmousedown = (e) => {that.mousedown(e)}
        canvas.onmouseup = (e) => {that.mouseup(e)}
        canvas.onmousemove = (e) => {that.mousemove(e)}
        canvas.onkeydown = (e) => {that.keydown(e)}
        canvas.onwheel = (e) => {that.mousewheel(e)}
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
                                        
                                        if(e.ctrlKey){
                                            if(port.connected){
                                                for(var k = 0; k < port.connections.length; k++){
                                                    var con = port.connections[k]

                                                    port.connected = false
                                                    if(con.port1 === port){
                                                        con.port1 = con.port2
                                                    }
                                                    con.port2 = null
                                                    this.currConnections.push(con)
                                                }

                                                port.connections = new Array()

                                                this.mode = Mode.Connect
                                                return
                                            }
                                        }
                                        else{
                                            this.mode = Mode.Connect
                                            this.currConnections.push(new NEConnection(this, this.mousedownpos_world.x, this.mousedownpos_world.y, port))
                                            return
                                        }
                                    }
                                }
                            }
                            
                            // node checks self if it can be selected
                            node.select(this)
                        }
                    }
                }
        
                if (this.selected_nodes.length == 0) {
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
                        node.select(this)
                    }
                }
            }
            
            // store mousedownpos
            this.mousedownpos_screen = {x: e.clientX - this.canvas.offsetLeft, y: e.clientY - this.canvas.offsetTop}
            this.mousedownpos_world = this.toWorld(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)


            if ( this.selected_nodes.length === 0){
                this.mode = Mode.None
            }
        }
        if (this.mode === Mode.None) {

            if (this.selected_nodes.length > 0) {
                for(var i = 0; i < this.selected_nodes.length; i++) {
                    var node = this.selected_nodes[i]
                    node.unselect(this)
                }
                this.selected_nodes = new Array()
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
                                            connection.port1.connected = true
                                            connection.port2.connected = true
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
            if (this.selected_nodes.length > 0) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            }
    
            for(var i = 0; i < this.selected_nodes.length; i++) {
                var node = this.selected_nodes[i]
                node.graphics_node.move(
                    this.mousepos_world.x - this.mousedownpos_world.x
                    ,this.mousepos_world.y - this.mousedownpos_world.y
                )
            }
    
            if (this.selected_nodes.length > 0) {
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
        // Del -> Delete Selected
        if (e.keyCode == 46) {

            for(var i = 0; i < this.selected_nodes.length; i++) {
                var node = this.selected_nodes[i]
                node.delete(this)
            }

            this.selected_nodes = new Array()
            this.mode = Mode.None
            this.update()
            
        }

        // D -> Deserialize
        if(e.keyCode == 68) {
            this.deserialize()
        }

        // S -> Serialize
        if(e.keyCode == 83) {
            this.serialize()
        }
    }

    mousewheel(e) {
        this.curr_scale *= 1.0 - (e.deltaY / 102.0) / 5.0
        // console.log(this.curr_scale)
        // this.ctx.scale(this.curr_scale, this.curr_scale)
        this.ctx.scale(1.0 - (e.deltaY / 102.0) / 5.0, 1.0 - (e.deltaY / 102.0) / 5.0)
        e.preventDefault()

        this.update()
    }

    serialize() {
        var nodes_arr = new Array()
        for (var i = 0; i < this.nodes.length; i++){
            var node_str = this.nodes[i].serialize()
            nodes_arr.push(node_str)
        }
        var serialize_str = JSON.stringify({nodes: nodes_arr});
        console.log(serialize_str)
    }

    deserialize() {
        this.nodes = new Array()
        this.update()

        var test_str = '{"nodes":[{"id":0,"title":"MyNode","ports":[{"id":0,"type":1,"output":false,"connections":[],"x":20,"y":44},{"id":1,"type":1,"output":true,"connections":[{"node":2,"port":0}],"x":228,"y":44},{"id":2,"type":2,"output":true,"connections":[],"x":228,"y":80}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":17,"y":270},{"id":1,"title":"TestNode","ports":[{"id":0,"type":1,"output":false,"connections":[],"x":20,"y":44},{"id":1,"type":1,"output":true,"connections":[{"node":2,"port":0}],"x":228,"y":44},{"id":2,"type":2,"output":true,"connections":[],"x":228,"y":80}],"can_be_deleted":false,"can_be_selected":true,"can_be_moved":true,"x":107,"y":59},{"id":2,"title":"ABC","ports":[{"id":0,"type":1,"output":false,"connections":[],"x":20,"y":44},{"id":1,"type":1,"output":true,"connections":[],"x":228,"y":44},{"id":2,"type":2,"output":true,"connections":[],"x":228,"y":80}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":600,"y":200}]}'
    
        var obj = JSON.parse(test_str)
        for (var i = 0; i < obj.nodes.length; i++){
            var ser_node = obj.nodes[i]
            
            var node = new NENode(this, ser_node.title)
            node.deserialize(ser_node)
            this.nodes.push(node)
        }

        for (var i = 0; i < this.nodes.length; i++){
            var node = this.nodes[i]
            var ser_node = obj.nodes[i]

            for (var j = 0; j < node.ports.length; j++){
                var port = node.ports[j]
                var ser_port = ser_node.ports[j]
                port.deserialize(ser_port)
            }
            node.graphics_node.move(node.graphics_node.x, node.graphics_node.y)
        }

        this.update()
    }
}