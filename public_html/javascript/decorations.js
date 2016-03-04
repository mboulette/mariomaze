        var decorations = function(param) {
            this.trash = 0,
            this.x = param[1],
            this.y = param[2]
            this.width = param[3],
            this.height = param[4],
            this.spriteImg = param[5],
            this.spriteX = param[6],
            this.spriteY = param[7],

            this.draw = function(ctx) {
                ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y, this.width, this.height);
            },

            this.collision = function(object) {
            }

        };
