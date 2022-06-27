class NENode {
    constructor(scene, title, inputs, outputs) {
        this.scene = scene
        this.title = title

        this.inputs = inputs
        this.outputs = outputs

        this.graphics_node = new NEGraphicsNode(scene, 20, 20)
        this.graphics_node.node = this
    }

    draw() {
        this.graphics_node.draw()
    }

    delete() {
        // TODO
    }
}

class NEGraphicsNode {
    constructor(scene, x, y) {
        var that = this
        this.scene = scene
        this.x = x
        this.y = y
        this.node = null

        this.width = 240
        this.height = 100
        this.border_radius = 8.0
        this.title_height = 24.0
        
        this.title_padding = 5.0

        this.selected = false
        this.initialselectionpos = {x: 0, y: 0}
    }

    select() {

        this.selected = true
        this.initialselectionpos.x = this.x
        this.initialselectionpos.y = this.y
    }

    move(new_x, new_y) {
        this.x = new_x + this.initialselectionpos.x
        this.y = new_y + this.initialselectionpos.y
    }

    draw() {
        var ctx = this.scene.ctx

        // draw head

        var title_gradient = ctx.createLinearGradient(20, 100, 150, 127)
        title_gradient.addColorStop(0, '#BB3131AF')
        title_gradient.addColorStop(1, '#992121AF')


        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.title_height)
        ctx.lineTo(this.x, this.y + this.title_height)
        ctx.arcTo(this.x, this.y, this.x + this.width, this.y, this.border_radius)
        ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.title_height, this.border_radius)
        ctx.fillStyle = title_gradient;
        ctx.fill();

        // draw title

        ctx.font = "18px Arial";
        ctx.fillStyle = '#DDDDDD';
        ctx.fillText(this.node.title, this.x + this.title_padding, this.y - this.title_padding + this.title_height)
        
        // draw body

        var body_gradient = ctx.createLinearGradient(20, 100, 150, 127)
        body_gradient.addColorStop(0, '#101112AF')
        body_gradient.addColorStop(1, '#0A0B0C9F')

        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.title_height)
        ctx.lineTo(this.x + this.width, this.y + this.title_height)
        ctx.arcTo(this.x + this.width, this.y + this.height, this.x, this.y + this.height, this.border_radius)
        ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.title_height, this.border_radius)
        ctx.fillStyle = body_gradient;
        ctx.fill();


        // draw outline

        ctx.beginPath();
        ctx.moveTo(this.x + this.width - this.border_radius, this.y + this.height)
        ctx.arcTo(this.x, this.y + this.height, this.x, this.y, this.border_radius)
        ctx.arcTo(this.x, this.y, this.x + this.width, this.y, this.border_radius)
        ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.height, this.border_radius)
        ctx.arcTo(this.x + this.width, this.y + this.height, this.x, this.y + this.height, this.border_radius)
        ctx.strokeStyle = this.selected? '#EE8800' : '#000000'
        ctx.stroke();
    }
}