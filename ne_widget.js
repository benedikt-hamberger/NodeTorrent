class NEWidget {
    constructor(scene) {
        this.that = this
        this.scene = scene
        this.graphics_widget = null // new NEGraphicsWidget(this.scene, this)
        this.value = null
        this.cursor = null
    }

    move() {

    }

    draw() {
        this.graphics_widget.draw()
    }
}

class NEGraphicsWidget {
    constructor(scene, widget) {
        this.scene = scene
        this.widget = widget
        this.x = 20
        this.y = 20
    }

    move() {

    }

    draw() {
        var ctx = this.scene.ctx

    }
}

class NETextWidget extends NEWidget{
    constructor(scene){
        super(scene)
        this.graphics_widget = new NETextGraphicsWidget(this.scene, this)
        this.value = ""
        this.focused = false
        this.cursor = 0
    }

    focus() {
        this.focused = true
    }

}

class NETextGraphicsWidget extends NEGraphicsWidget {
    constructor(scene, widget) {
        super(scene, widget)
    }

    draw() {
        var ctx = this.scene.ctx

        ctx.fillStyle = '#060204EE';
        ctx.fillRect(this.x, this.y, 80, 30)

        ctx.strokeStyle = '#EE8800';
        ctx.lineWidth = 1
        ctx.strokeRect(this.x, this.y, 80, 30)

        ctx.font = "18px Arial";
        ctx.strokeStyle = '#000000FF'
        ctx.lineWidth = 1
        var display_text = this.widget.value
        if(this.widget.focused){
            display_text = this.widget.value.slice(0, this.widget.cursor)
            + "|" + this.widget.value.slice(this.widget.cursor)
        }
        ctx.strokeText(display_text, this.x + 5, this.y + 20)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(display_text, this.x + 5, this.y + 20)
        
    }
}