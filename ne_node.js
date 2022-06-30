class NENode {
    constructor(scene, title) {
        this.scene = scene
        this.title = title

        // get first free id
        var curr_id = 0
        var ids = new Array()
        for (var i = 0; i < this.scene.nodes.length; i++){
            var node = this.scene.nodes[i]
            ids.push(node.id)
        }
        ids.every(function (a) {
            if (curr_id === a) {
                curr_id = a + 1;
                return true;
            }
        });
        this.id = curr_id

        this.ports = new Array()

        this.graphics_node = new NEGraphicsNode(scene, 20, 20)
        this.graphics_node.node = this

        this.can_be_deleted = true
        this.can_be_moved = true
        this.can_be_selected = true

        var test_input = new NEPort(this.scene, this, 1, false)
        test_input.graphics_port.x_offset = this.graphics_node.x
        test_input.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height
        this.ports.push(test_input)

        var test_output = new NEPort(this.scene, this, 1, true)
        test_output.graphics_port.x_offset = this.graphics_node.x + this.graphics_node.width - test_output.graphics_port.radius * 4
        test_output.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height
        this.ports.push(test_output)

        var test_output = new NEPort(this.scene, this, 2, true)
        test_output.graphics_port.x_offset = this.graphics_node.x + this.graphics_node.width - test_output.graphics_port.radius * 4
        test_output.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height * 2.5
        this.ports.push(test_output)
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

        for(var i = 0; i < this.ports.length; i++) {
            var input = this.ports[i]
            input.draw()
        }

    }

    delete(scene) {
        if(this.can_be_deleted){
            for (var i = 0; i < this.ports.length; i++){
                this.ports[i].delete()
            }

            var idx = scene.nodes.indexOf(this)
            scene.nodes.splice(idx, 1)
        }else{
            this.unselect()
        }
    }

    serialize() {
        var ports_arr = new Array()
        for (var i = 0; i < this.ports.length; i++){
            var port_str = this.ports[i].serialize()
            ports_arr.push(port_str)
        }
        var serialize_str = {
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
        if(this.node.can_be_moved){

            this.x = new_x + this.initialselectionpos.x
            this.y = new_y + this.initialselectionpos.y
    
            for(var i = 0; i < this.node.ports.length; i++) {
                var input = this.node.ports[i]
                input.graphics_port.move(new_x + this.initialselectionpos.x, new_y + this.initialselectionpos.y)
            }
        }

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

        ctx.lineWidth = 1
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