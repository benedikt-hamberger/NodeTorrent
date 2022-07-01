class NENode {
    constructor(scene) {
        this.scene = scene
        this.title = ""
        this.id = 0

        this.ports = new Map()

        this.graphics_node = new NEGraphicsNode(scene, this, 20, 20)

        this.can_be_deleted = true
        this.can_be_moved = true
        this.can_be_selected = true
    }

    addPort(port){
        var inserted = false
        for (var i = 0; i < Object.entries(this.ports).length; i++){
            if(!i in this.ports){
                inserted = true
                port.id = i
                this.ports[i] = port
                break
            }
        }
        if(!inserted){
            port.id = i
            this.ports[i] = port
        }
        // port.graphics_port.move(this.x + port.graphics_port.x_offset, this.y + port.graphics_port.y_offset)
        // port.graphics_port.move(this.x, this.y)
    }

    select(scene) {
        if(this.can_be_selected && !this.graphics_node.selected){

            this.graphics_node.select()
            scene.selected_nodes.push(this)
        }
    }

    unselect(scene) {
        if(this.graphics_node.selected){
            this.graphics_node.selected = false
        }
    }

    draw() {
        this.graphics_node.draw()

        for(const [id, port] of Object.entries(this.ports)) {
            port.draw()
        }
    }

    delete() {
        if(this.can_be_deleted){
            for (const [port_id, port] of Object.entries(this.ports)){
                port.delete()
            }
           delete this.scene.nodes[this.id]
        }else{
            this.unselect()
        }
    }

    serialize() {
        var ports_arr = new Array()
        for (const [port_id, port] of Object.entries(this.ports)){
            var port_str = port.serialize()
            ports_arr.push(port_str)
        }

        var serialize_str = {
            className: this.constructor.name,
            id: this.id,
            title: this.title,
            ports: ports_arr,
            can_be_deleted: this.can_be_deleted,
            can_be_selected: this.can_be_selected,
            can_be_moved: this.can_be_moved,
            x: this.graphics_node.x,
            y: this.graphics_node.y
        }
        return serialize_str
    }

    deserialize(ser_node) {
        this.id = ser_node.id
        this.can_be_deleted = ser_node.can_be_deleted
        this.can_be_selected = ser_node.can_be_selected
        this.can_be_moved = ser_node.can_be_moved
        this.graphics_node.x = ser_node.x
        this.graphics_node.y = ser_node.y
    }
}

class NEGraphicsNode {
    constructor(scene, node, x, y) {
        var that = this
        this.scene = scene
        this.node = node
        this.x = x
        this.y = y

        this.width = 240
        this.height = 100
        this.border_radius = 8.0
        this.title_height = 24.0
        
        this.title_padding = 5.0

        this.selected = false
        this.initialselectionpos = {x: 0, y: 0}

        this.title_color = '#DDDDDD'

        this.title_gradient_1 = '#BB3131AF'
        this.title_gradient_2 = '#992121AF'

        this.body_gradient_1 = '#101112AF'
        this.body_gradient_2 = '#0A0B0C9F'
    }

    select() {
        this.selected = true
        this.initialselectionpos.x = this.x
        this.initialselectionpos.y = this.y
    }

    move(new_x, new_y) {
        if(this.node.can_be_moved){

            this.x = new_x + this.initialselectionpos.x
            this.y = new_y + this.initialselectionpos.y
    
            for(const [id, port] of Object.entries(this.node.ports)) {
                port.graphics_port.move(new_x + this.initialselectionpos.x, new_y + this.initialselectionpos.y)
            }
        }
    }

    draw() {
        var ctx = this.scene.ctx

        // draw head

        var title_gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.title_height)
        title_gradient.addColorStop(0, this.title_gradient_1)
        title_gradient.addColorStop(1, this.title_gradient_2)


        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.title_height)
        ctx.lineTo(this.x, this.y + this.title_height)
        ctx.arcTo(this.x, this.y, this.x + this.width, this.y, this.border_radius)
        ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.title_height, this.border_radius)
        ctx.fillStyle = title_gradient;
        ctx.fill();

        // draw title

        ctx.font = "18px Arial";
        ctx.strokeStyle = '#000000FF'
        ctx.lineWidth = 1
        ctx.strokeText(this.node.title, this.x + this.title_padding, this.y - this.title_padding + this.title_height)
        ctx.fillStyle = this.title_color;
        ctx.fillText(this.node.title, this.x + this.title_padding, this.y - this.title_padding + this.title_height)
        // draw body

        var body_gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.title_height)
        body_gradient.addColorStop(0, this.body_gradient_1)
        body_gradient.addColorStop(1, this.body_gradient_2)

        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.title_height)
        ctx.lineTo(this.x + this.width, this.y + this.title_height)
        ctx.arcTo(this.x + this.width, this.y + this.height, this.x, this.y + this.height, this.border_radius)
        ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.title_height, this.border_radius)
        ctx.fillStyle = body_gradient;
        ctx.fill();


        // draw outline
        if (this.selected){
            ctx.beginPath();
            ctx.moveTo(this.x + this.width - this.border_radius, this.y + this.height)
            ctx.arcTo(this.x, this.y + this.height, this.x, this.y, this.border_radius)
            ctx.arcTo(this.x, this.y, this.x + this.width, this.y, this.border_radius)
            ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.height, this.border_radius)
            ctx.arcTo(this.x + this.width, this.y + this.height, this.x, this.y + this.height, this.border_radius)
            ctx.lineWidth = this.selected? 2 : 0
            ctx.strokeStyle = this.selected? '#EE8800' : '#000000'
            ctx.stroke();
        }
    }
}