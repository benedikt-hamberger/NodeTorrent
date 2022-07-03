class NEExecutionPort extends NEPort {
    constructor(scene, node, output){
        super(scene, node, 0, output)
        this.type = 0
        this.graphics_port = new NEGraphicsExecutionPort(scene, this)
    }
}

class NEGraphicsExecutionPort extends NEGraphicsPort {
    constructor(scene, port){
        super(scene, port)
    }

    draw(){
        var ctx = this.scene.ctx

        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y - 5)
        ctx.lineTo(this.x + 5, this.y)
        ctx.lineTo(this.x - 5, this.y + 5)
        ctx.closePath()
        ctx.fillStyle = '#444444FF';
        if (this.port.connected){
            ctx.fillStyle = Colors[this.port.type] + "FF"
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = Colors[this.port.type]
        ctx.stroke();
    }
}

class NEExecutionStart extends NENode {
    constructor(scene){
        super(scene)

        this.title = "Start"

        this.graphics_node.title_gradient_1 = '#FF4411AA'
        this.graphics_node.title_gradient_2 = '#FF441144'

        this.graphics_node.width = 140
        this.graphics_node.height = 80

        var output = new NEExecutionPort(this.scene, this, true)
        output.graphics_port.x_offset = this.graphics_node.x + this.graphics_node.width - output.graphics_port.radius * 6
        output.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height
        output.can_have_multiple_connections = false
        this.ports.push(output)
    }
}

class NEExecutionEnd extends NENode {
    constructor(scene){
        super(scene)

        this.title = "End"

        this.graphics_node.title_gradient_1 = '#FF4411AA'
        this.graphics_node.title_gradient_2 = '#FF441144'

        this.graphics_node.width = 140
        this.graphics_node.height = 80

        var output = new NEExecutionPort(this.scene, this, false)
        output.graphics_port.x_offset = this.graphics_node.x
        output.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height
        this.ports.push(output)
    }
} 

class NENumberLiteral extends NENode {
    constructor(scene){
        super(scene)

        this.title = "NumberLiteral"

        this.graphics_node.title_gradient_1 = '#33AA11AA'
        this.graphics_node.title_gradient_2 = '#33AA1144'

        this.graphics_node.width = 140
        this.graphics_node.height = 80

        var output = new NEPort(this.scene, this, 1, true)
        output.graphics_port.x_offset = this.graphics_node.x + this.graphics_node.width - output.graphics_port.radius * 6
        output.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height
        this.ports.push(output)
    }
}

class NECalcSum extends NENode {
    constructor(scene){
        super(scene)

        this.title = "CalcSum"

        this.graphics_node.title_gradient_1 = '#3333AAAA'
        this.graphics_node.title_gradient_2 = '#3333AA44'

        this.graphics_node.width = 160
        this.graphics_node.height = 120

        var exec_input = new NEExecutionPort(this.scene, this, false)
        exec_input.graphics_port.x_offset = this.graphics_node.x + exec_input.graphics_port.radius
        exec_input.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height
        this.ports.push(exec_input)

        var exec_output = new NEExecutionPort(this.scene, this, true)
        exec_output.graphics_port.x_offset = this.graphics_node.x +this.graphics_node.width - exec_input.graphics_port.radius * 6
        exec_output.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height
        exec_output.can_have_multiple_connections = false
        this.ports.push(exec_output)

        var number_1 = new NEPort(this.scene, this, 1, false)
        number_1.graphics_port.x_offset = this.graphics_node.x + number_1.graphics_port.radius
        number_1.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height * 2
        this.ports.push(number_1)

        var number_2 = new NEPort(this.scene, this, 1, false)
        number_2.graphics_port.x_offset = this.graphics_node.x + number_1.graphics_port.radius
        number_2.graphics_port.y_offset = this.graphics_node.y + this.graphics_node.title_height * 3
        this.ports.push(number_2)
    }
}