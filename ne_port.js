class NEPort {
    constructor(scene, node, type, output) {
        this.that = this
        this.scene = scene
        this.type = type
        this.node = node
        this.id = 0
        this.output = output
        this.multiple_outputs = output

        this.connections = new Array()
        this.graphics_port = new NEGraphicsPort(scene, this)
        this.connected = false
    }

    addConnection(node_id, port_id){
        var other_port = this.scene.nodes[node_id].ports[port_id]

        if((this.connections.length < 1 || this.multiple_outputs) && (other_port.connections.length < 1 || other_port.multiple_outputs))
        { 
            var con = new NEConnection(this.scene, 0, 0, this)

            con.port1 = this
            con.port2 = other_port

            other_port.connections.push(con)
            this.connections.push(con)

            this.connected = true
            other_port.connected = true
            con.graphics_connection.move()

            if(!this.output){
                var i = Object.keys(this.node.ports).find(key => this.node.ports[key] === this)
                var w = this.node.widgets[i]
                if(w){
                    w.visible = false
                    w.editable = false
                }
            }

            if(!other_port.output){
                var i = Object.keys(other_port.node.ports).find(key => other_port.node.ports[key] === other_port)
                var w = other_port.node.widgets[i]
                if(w){
                    w.visible = false
                    w.editable = false
                }
            }
        }

    }

    draw() {
        this.graphics_port.draw()
        for (var i = 0; i < this.connections.length; i++){
            this.connections[i].draw()
        }
    }

    delete() {
        for (var i = 0; i < this.connections.length; i++){
            this.connections[i].delete(this)
        }
        this.connections = new Array()
    }

    serialize() {
        var connection_arr = new Array()
        for (var i = 0; i < this.connections.length; i++){
            var connection = this.connections[i]
            if(connection.port1 === this){
                var connection_str = this.connections[i].serialize()
                connection_arr.push(connection_str)
            }
        }
        var serialize_str = {
            className: this.constructor.name,
            id: this.id,
            type: this.type,
            output: this.output,
            connections: connection_arr,
            x: this.graphics_port.x_offset,
            y: this.graphics_port.y_offset
        }
        return serialize_str
    }

    deserialize(ser_port){

        for (var i = 0; i < ser_port.connections.length; i++){
            var ser_connection = ser_port.connections[i]
            for (const [node_id, node] of Object.entries(this.scene.nodes)){
                if(node.id === ser_connection.node){
                    for (const [port_id, port] of Object.entries(node.ports)){
                        if(port.id === ser_connection.port){
                            this.addConnection(node_id, port_id)
                            break
                        }
                    }
                }
            }
        }
    }

    get_other_port(){
        if(this.connections.length === 1){
            var con = this.connections[0]
            if(this === con.port1){
                return con.port2
            }
            return con.port1
        }
        return con
    }

    disconnect(){
        this.connected = false
        if(!this.output){
            var i = Object.keys(this.node.ports).find(key => this.node.ports[key] === this)
            var w = this.node.widgets[i]
            if(w){
                w.visible = true
                w.editable = true
            }
        }
        this.scene.update()
    }

    get_value() {
        if(this.output){
            if(this.connected){
                // this.connections[0].
            }
            else{
                var i = Object.keys(this.node.ports).find(key => this.node.ports[key] === this)
                return this.node.widgets[i].value
            }

            return null
        }
    }
}

class NEGraphicsPort {
    constructor(scene, port) {
        this.scene = scene
        this.port = port

        this.x = 0
        this.y = 0

        this.x_offset = 0
        this.y_offset = 0

        this.radius = 6

    }

    move(new_x, new_y) {
        this.x = new_x + this.x_offset
        this.y = new_y + this.y_offset

        for (var i = 0; i < this.port.connections.length; i++){
            this.port.connections[i].graphics_connection.move()
        }
    }

    draw() {
        var ctx = this.scene.ctx

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#44444400';
        if (this.port.connected){
            ctx.fillStyle = PortTypes[this.port.type] + "AA"
        }
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = PortTypes[this.port.type]
        ctx.stroke();
    }
}