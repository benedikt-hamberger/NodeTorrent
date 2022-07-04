class NEExecutionPort extends NEPort {
    constructor(scene, node, output){
        super(scene, node, "exec", output)
        this.type = "exec"
        this.graphics_port = new NEGraphicsExecutionPort(scene, this)

        this.multiple_outputs = !output
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
            ctx.fillStyle = PortTypes[this.port.type] + "FF"
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = PortTypes[this.port.type]
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

        var output = new NEExecutionPort(this.scene, this, true)
        this.addPort(output)
    }
}

class NEExecutionEnd extends NENode {
    constructor(scene){
        super(scene)

        this.title = "End"

        this.graphics_node.title_gradient_1 = '#FF4411AA'
        this.graphics_node.title_gradient_2 = '#FF441144'

        this.graphics_node.width = 140

        var input = new NEExecutionPort(this.scene, this, false)
        this.addPort(input)
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

        var output = new NEPort(this.scene, this, "float", true)
        this.addPort(output)
    }
}

class NECalcSum extends NENode {
    constructor(scene){
        super(scene)

        this.title = "CalcSum"

        this.graphics_node.title_gradient_1 = '#3333AAAA'
        this.graphics_node.title_gradient_2 = '#3333AA44'

        this.graphics_node.width = 160

        var exec_input = new NEExecutionPort(this.scene, this, false)
        this.addPort(exec_input)

        var exec_output = new NEExecutionPort(this.scene, this, true)
        this.addPort(exec_output)

        var number_1 = new NEPort(this.scene, this, "float", false)
        this.addPort(number_1)

        var number_2 = new NEPort(this.scene, this, "float", false)
        this.addPort(number_2)
    }

    execute() {
        var result = 0.0
        var a = 0.0
        var b = 0.0
        if(this.ports[2].connected){
            var con = this.ports[2].connections[0]
            if(con.port1 === this.ports[2]){
                a = parseFloat(con.port2.node.widgets[0].value)
            } else {
                a = parseFloat(con.port1.node.widgets[0].value)
            }
        } else {
            a = parseFloat(this.widgets[2].value)
        }

        if(this.ports[3].connected){
            var con = this.ports[3].connections[0]
            if(con.port1 === this.ports[3]){
                b = parseFloat(con.port2.node.widgets[0].value)
            } else {
                b = parseFloat(con.port1.node.widgets[0].value)
            }
        }
        else {
            b = parseFloat(this.widgets[3].value)
        }
        result = a + b
        console.log(result)
    }
}

class NETest extends NENode {
    constructor(scene){
        super(scene)

        this.title = "Test"

        this.graphics_node.title_gradient_1 = '#3333AAAA'
        this.graphics_node.title_gradient_2 = '#3333AA44'

        this.graphics_node.width = 160


        this.addPort(new NEExecutionPort(this.scene, this, true))

        this.addPort(new NEPort(this.scene, this, "bool", true))
        this.addPort(new NEPort(this.scene, this, "int", true))
        this.addPort(new NEPort(this.scene, this, "float", true))
        this.addPort(new NEPort(this.scene, this, "string", true))
        this.addPort(new NEPort(this.scene, this, "object", true))
    }
}