class NEPort {
    constructor(scene, type, node) {
        this.that = this
        this.scene = scene
        this.type = type
        this.node = node

        this.graphics_port = new NEGraphicsPort(scene, this)
    }

    draw() {
        this.graphics_port.draw()
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

        this.radius = 10
    }

    move(new_x, new_y) {
        this.x = new_x + this.x_offset
        this.y = new_y + this.y_offset
    }

    draw() {
        var ctx = this.scene.ctx

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#44444400';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#003300EE';
        ctx.stroke();
    }
}