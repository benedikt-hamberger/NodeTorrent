class NEWidget {
    constructor(scene) {
        this.that = this
        this.scene = scene
        this.graphics_widget = new NEGraphicsWidget(this.scene, this)
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

    draw() {
        var ctx = this.scene.ctx

        ctx.fillStyle = '#060204EE';
        ctx.fillRect(this.x, this.y, 80, 30)

        ctx.font = "18px Arial";
        ctx.strokeStyle = '#000000FF'
        ctx.lineWidth = 1
        ctx.strokeText("Lorem", this.x + 5, this.y + 20)
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText("Lorem", this.x + 5, this.y + 20)
        
    }
}