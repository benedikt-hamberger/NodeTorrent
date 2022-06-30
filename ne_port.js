class NEPort {
    constructor(scene, node, type, output) {
        this.that = this
        this.scene = scene
        this.type = type
        this.node = node

        // get first free id
        var curr_id = 0
        var ids = new Array()
        for (var i = 0; i < this.node.ports.length; i++){
            var port = this.node.ports[i]
            ids.push(port.id)
        }
        ids.every(function (a) {
            if (curr_id === a) {
                curr_id = a + 1;
                return true;
            }
        });
        this.id = curr_id

        this.output = output

        this.connections = new Array()

        this.graphics_port = new NEGraphicsPort(scene, this)

        this.connected = false
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
        this.graphics_port.x_offset = ser_port.x
        this.graphics_port.y_offset = ser_port.y

        // this.graphics_port.x = this.node.graphics_node.x + ser_port.x
        // this.graphics_port.y = this.node.graphics_node.y + ser_port.y

        for (var i = 0; i < ser_port.connections.length; i++){
            var ser_connection = ser_port.connections[i]
            this.connected = true
            var connection = new NEConnection(this.scene, this.graphics_port.x, this.graphics_port.y, this)
            for (var j = 0; j < this.scene.nodes.length; j++){
                var node = this.scene.nodes[j]
                if(node.id === ser_connection.node){
                    for (var k = 0; k < node.ports.length; k++){
                        var port = node.ports[k]
                        if(port.id === ser_connection.port){

                            connection.port2 = port
                            port.connected = true

                            port.connections.push(connection)
                            break
                        }
                    }
                    if(connection.port2){break}
                }
            }
            this.connections.push(connection)
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

        this.radius = 8

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
            ctx.fillStyle = Colors[this.port.type] + "AA"
        }
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = Colors[this.port.type]
        ctx.stroke();
    }
}