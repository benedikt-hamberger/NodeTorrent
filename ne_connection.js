class NEConnection {
    constructor(scene, x, y, port1) {
        this.that = this
        this.scene = scene
        this.port1 = port1
        this.port2 = null
        this.type = port1.type
        this.graphics_connection = new NEGraphicsConnection(scene, x, y)
        this.graphics_connection.connection = this
    }

    draw() {
        this.graphics_connection.draw()
    }

    delete(port) {
        if(this.port1 !== port && this.port1) {
            var idx = this.port1.connections.indexOf(this.that)
            this.port1.connections.splice(idx, 1)
        }
        if(this.port2 !== port && this.port2) {
            var idx = this.port1.connections.indexOf(this.that)
            this.port2.connections.splice(idx, 1)
        }
    }
}

class NEGraphicsConnection {
    constructor(scene, x, y) {
        this.scene = scene
        this.connection = null
        this.start = {x: x, y: y}
        this.cp1 = {x: 0, y: 0}
        this.cp2 = {x: 0, y: 0}
        this.end = {x: 0, y: 0}
    }

    move(new_x, new_y) {

        this.end = {
            x: new_x, 
            y: new_y
        }

        if (this.connection.port1){
            this.start = {x: this.connection.port1.graphics_port.x, y: this.connection.port1.graphics_port.y}
        }
        if (this.connection.port2) {
            this.end = {x: this.connection.port2.graphics_port.x, y: this.connection.port2.graphics_port.y}
        }

        this.cp1 = {
            x: (this.end.x + this.start.x) / 2.0,
            y: this.start.y
        }
        this.cp2 = {
            x: (this.start.x + this.end.x) / 2.0,
            y: this.end.y
        }
    }

    draw() {
        var ctx = this.scene.ctx

        ctx.beginPath()
        ctx.strokeStyle = Colors[this.connection.type]
        ctx.strokeWidth = 2
        ctx.moveTo(this.start.x, this.start.y)
        ctx.bezierCurveTo(
                this.cp1.x, this.cp1.y,
                this.cp2.x, this.cp2.y,
                this.end.x, this.end.y)
        ctx.stroke()
    }
}