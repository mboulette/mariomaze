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


    var shop = function(param) {
        this.me = new decorations(param);

        this.me.draw = function(ctx) {
            ctx.drawImage(img[this.spriteImg], 3*72, 0*72, this.width, this.height, this.x, this.y, this.width, this.height);
            ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y, this.width, this.height);

            ctx.font = '9pt Comic Sans MS';
            ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
            ctx.lineWidth = 5;

            ctx.textAlign="center";
            ctx.strokeText('Marchand', this.x + (this.width / 2), this.y + (this.height / 2));
            ctx.fillText('Marchand', this.x + (this.width / 2), this.y + (this.height / 2));

        }

    };

