class NEPort {
    constructor(scene, node, type, output) {
        this.that = this
        this.scene = scene
        this.type = type
        this.node = node
        this.output = output

        this.connections = new Array()

        this.graphics_port = new NEGraphicsPort(scene, this)
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
        if (this.port.connections.length > 0){
            ctx.fillStyle =  Colors[this.port.type] + "AA"
        }
        ctx.fill();
        ctx.lineWidth = 4;
        // ctx.strokeStyle = '#003300EE';
        ctx.strokeStyle = Colors[this.port.type]
        ctx.stroke();
    }
}