const Mode = {
    None: 1,
    Select: 2,
    Connect: 3,
    PendingMove: 4,
    Move: 5,
    ContextMenu: 6,
    EditText: 7
}

const PortTypes = {
    "exec": "#FFFFFF",
    "bool": "#992200", // bool
    "int": "#056605", // int
    "float": "#33DD11", // float
    "string": "#AB03BD", // string
    "object": "#3333AA" // object
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

        this.nodes = new Map()

        this.selected_nodes = new Array()
        this.curr_connections = new Array()
        this.curr_widget = null

        this.cm = new NEContextMenu(this)


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

    toScene(x, y){
        var matrix = this.ctx.getTransform()
        return { x :x * matrix.a + y * matrix.c + matrix.e,
                 y :x * matrix.b + y * matrix.d + matrix.f }
    }

    addNode(node){
        var inserted = false
        for (var i = 0; i < Object.entries(this.nodes).length; i++){
            if(!i in this.nodes){
                inserted = true
                node.id = i
                this.nodes[i] = node
                break
            }
        }
        if(!inserted){
            node.id = i
            this.nodes[i] = node
        }
        node.graphics_node.move(node.graphics_node.x, node.graphics_node.y)
        this.update()
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
        this.drawGrid()

        for(var i = 0; i < this.curr_connections.length; i++) {
            var connection = this.curr_connections[i]
            connection.draw()
        }

        for(const [id, node] of Object.entries(this.nodes)) {
            node.draw()
        }

        if(this.cm){
            this.cm.graphics_cm.draw()
        }

    }

    clear_curr_connections() {
        for(var i = 0; i < this.curr_connections.length; i++) {
            var connection = this.curr_connections[i]
            // connection.delete()
        }
        this.curr_connections = new Array()
    }

    mousedown(e) {

        // store mousedownpos
        this.mousedownpos_screen = {x: e.clientX - this.canvas.offsetLeft, y: e.clientY - this.canvas.offsetTop}
        this.mousedownpos_world = this.toWorld(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)

        // left mouse button down
        if(e.buttons === 1) {

            if (this.mode === Mode.None){

                for(const [node_id, node] of Object.entries(this.nodes)) {
                    if (node.graphics_node.x < this.mousedownpos_world.x && node.graphics_node.x + node.graphics_node.width > this.mousedownpos_world.x){
                        if (node.graphics_node.y < this.mousedownpos_world.y && node.graphics_node.y + node.graphics_node.height > this.mousedownpos_world.y){
                            
                            // check for ports
                            for(const [port_id, port] of Object.entries(node.ports)) {
                                if (port.graphics_port.x - port.graphics_port.radius < this.mousedownpos_world.x && port.graphics_port.x + port.graphics_port.radius * 2 > this.mousedownpos_world.x){
                                    if (port.graphics_port.y - port.graphics_port.radius < this.mousedownpos_world.y && port.graphics_port.y + port.graphics_port.radius * 2 > this.mousedownpos_world.y){
                                        
                                        if(e.ctrlKey){
                                            if(port.connected){
                                                port.disconnect()

                                                for(var k = 0; k < port.connections.length; k++){
                                                    var con = port.connections[k]
                                                    var other_port = con.port1
                                                    if(con.port1 === port){
                                                        other_port = con.port2
                                                    }

                                                    var temp_con = new NEConnection(this, other_port)
                                                    this.curr_connections.push(temp_con)

                                                    var idx = other_port.connections.indexOf(con)
                                                    other_port.connections.splice(idx)
                                                    if(other_port.connections.length === 0){
                                                        other_port.connected = false
                                                        other_port.disconnect()
                                                    }
                                                }
                                                
                                                port.connections = new Array()
                                                
                                                this.mode = Mode.Connect
                                                return
                                            }
                                        }
                                        else{
                                            if(port.multiple_outputs || port.connections.length < 1){
                                                this.mode = Mode.Connect
                                                this.curr_connections.push(new NEConnection(this, port))
                                                return
                                            }
                                        }
                                    }
                                }
                            }

                            // check for widgets
                            for(const [widget_id, widget] of Object.entries(node.widgets)) {
                                if(widget && widget.visible){
                                    if (widget.graphics_widget.x < this.mousedownpos_world.x && widget.graphics_widget.x + widget.graphics_widget.width > this.mousedownpos_world.x){
                                        if (widget.graphics_widget.y < this.mousedownpos_world.y && widget.graphics_widget.y + widget.graphics_widget.height > this.mousedownpos_world.y){
                                            
                                            this.mode = Mode.EditText
                                            widget.focus()
                                            this.curr_widget = widget
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

            if (this.mode === Mode.EditText) {
                if(this.curr_widget){
                    this.curr_widget.unfocus()
                }
            }

            if (this.mode === Mode.ContextMenu) {
                // if(this.cm){
                //     this.cm.hide()
                //     this.mode = Mode.None
                // }
            }
        }
        
        // right mouse button down
        if (e.buttons === 2) {
            if(this.cm){
                this.cm.hide()
            }
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
                // alert("context menu")
                this.cm.show(this.mousedownpos_screen.x,  this.mousedownpos_screen.y)
                this.update()
                e.preventDefault()
                return
            }
        }

        if (this.mode === Mode.Select) {
            // rectangle select
            this.selectionrange.width = ((e.layerX - this.canvas.offsetLeft) - this.mousedownpos_world.x) / this.curr_scale
            this.selectionrange.height = ((e.layerY - this.canvas.offsetTop) - this.mousedownpos_world.y) / this.curr_scale
            
            for(const [id, node] of Object.entries(this.nodes)) {
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

            for(const [node_id, node] of Object.entries(this.nodes)) {
    
                if (node.graphics_node.x < this.mousepos_world.x && node.graphics_node.x + node.graphics_node.width > this.mousepos_world.x){
                    if (node.graphics_node.y < this.mousepos_world.y && node.graphics_node.y + node.graphics_node.height > this.mousepos_world.y){
                            
                         // check for ports
                         for(const [port_id, port] of Object.entries(node.ports)) {
                            if (port.graphics_port.x - port.graphics_port.radius < this.mousepos_world.x && port.graphics_port.x + port.graphics_port.radius * 2 > this.mousepos_world.x){
                                if (port.graphics_port.y - port.graphics_port.radius < this.mousepos_world.y && port.graphics_port.y + port.graphics_port.radius * 2 > this.mousepos_world.y){
                                    
                                    for(var k = 0; k < this.curr_connections.length; k++) {
                                        var con = this.curr_connections[k]
                                        
                                        if (con.port1.type === port.type && con.port1.output !== port.output){
                                            con.port1.addConnection(node_id, port_id)
                                        }
                                    }

                                    this.clear_curr_connections()

                                    this.mode = Mode.None
                                    this.update()
                                    return
                                }
                            }
                        }
                    }
                } 
            }

            this.clear_curr_connections()
            
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
            for(var i = 0; i < this.curr_connections.length; i++) {
                var connection = this.curr_connections[i]
                connection.graphics_connection.move(this.mousepos_world.x, this.mousepos_world.y)
            }

            this.update()
        }
        
    }

    keydown(e) {

        if (this.mode == Mode.EditText){
           return
        }

        else {
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
                // this.addNode(new NEExecutionStart(this))
            }
    
            // S -> Serialize
            if(e.keyCode == 83) {
                this.serialize()
            }

            if(e.key === "e"){
                this.execute()
            }
        }
    }

    mousewheel(e) {
        this.curr_scale *= 1.0 - (e.deltaY / 102.0) / 5.0
        if (this.curr_scale < 0.5){
            this.curr_scale = 0.5
        }
        else if(this.curr_scale > 2.0){
            this.curr_scale = 2.0
        }
        else{

            this.ctx.scale(1.0 - (e.deltaY / 102.0) / 5.0, 1.0 - (e.deltaY / 102.0) / 5.0)
            e.preventDefault()
    
            this.update()
        }
    }

    serialize() {
        var nodes_arr = new Array()
        for (const [id, node] of Object.entries(this.nodes)){
            var node_str = node.serialize()
            nodes_arr.push(node_str)
        }
        var serialize_str = JSON.stringify({nodes: nodes_arr});
        console.log(serialize_str)
    }

    deserialize() {
        this.nodes = new Array()
        this.update()

        // var test_str = '{"nodes":[{"id":0,"title":"MyNode","ports":[{"id":0,"type":1,"output":false,"connections":[],"x":20,"y":44},{"id":1,"type":1,"output":true,"connections":[{"node":2,"port":0}],"x":228,"y":44},{"id":2,"type":2,"output":true,"connections":[],"x":228,"y":80}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":17,"y":270},{"id":1,"title":"TestNode","ports":[{"id":0,"type":1,"output":false,"connections":[],"x":20,"y":44},{"id":1,"type":1,"output":true,"connections":[{"node":2,"port":0}],"x":228,"y":44},{"id":2,"type":2,"output":true,"connections":[],"x":228,"y":80}],"can_be_deleted":false,"can_be_selected":true,"can_be_moved":true,"x":107,"y":59},{"id":2,"title":"ABC","ports":[{"id":0,"type":1,"output":false,"connections":[],"x":20,"y":44},{"id":1,"type":1,"output":true,"connections":[],"x":228,"y":44},{"id":2,"type":2,"output":true,"connections":[],"x":228,"y":80}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":600,"y":200}]}'
        var test_str = '{"nodes":[{"className":"NEExecutionStart","id":0,"title":"Start","ports":[{"className":"NEExecutionPort","id":0,"type":"exec","output":true,"connections":[{"node":4,"port":0}],"x":124,"y":44}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":0,"y":50},{"className":"NEExecutionEnd","id":1,"title":"End","ports":[{"className":"NEExecutionPort","id":0,"type":"exec","output":false,"connections":[],"x":20,"y":44}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":600,"y":50},{"className":"NENumberLiteral","id":2,"title":"NumberLiteral","ports":[{"className":"NEPort","id":0,"type":"float","output":true,"connections":[{"node":4,"port":2}],"x":124,"y":44}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":80,"y":150},{"className":"NENumberLiteral","id":3,"title":"NumberLiteral","ports":[{"className":"NEPort","id":0,"type":"float","output":true,"connections":[],"x":124,"y":44}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":80,"y":260},{"className":"NECalcSum","id":4,"title":"CalcSum","ports":[{"className":"NEExecutionPort","id":0,"type":"exec","output":false,"connections":[],"x":26,"y":44},{"className":"NEExecutionPort","id":1,"type":"exec","output":true,"connections":[{"node":1,"port":0}],"x":144,"y":44},{"className":"NEPort","id":2,"type":"float","output":false,"connections":[],"x":26,"y":68},{"className":"NEPort","id":3,"type":"float","output":false,"connections":[{"node":3,"port":0}],"x":26,"y":92}],"can_be_deleted":true,"can_be_selected":true,"can_be_moved":true,"x":311,"y":80}]}'

        var obj = JSON.parse(test_str)
        for (var i = 0; i < obj.nodes.length; i++){
            var ser_node = obj.nodes[i]
            var node = eval('new ' + ser_node.className + '(this)')
            
            node.deserialize(ser_node)
            this.addNode(node)
        }

        for (var i = 0; i < obj.nodes.length; i++){
            var ser_node = obj.nodes[i]
            var node = this.nodes[ser_node.id]

            for (var j = 0; j < ser_node.ports.length; j++){
                var ser_port = ser_node.ports[j]
                var port = node.ports[ser_port.id]
                port.deserialize(ser_port)
            }
            node.graphics_node.move(node.graphics_node.x, node.graphics_node.y)
        }

        this.update()
    }

    execute() {
        for(const [id, node] of Object.entries(this.nodes)) {
            // if(node.className === "NEExecutionStart")
            if(node.className === "NECalcSum")
            {
                node.execute()
            }
        }
    }
}