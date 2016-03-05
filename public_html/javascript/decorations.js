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



    var sign = function(param) {
        this.me = new decorations(param);

        this.me.draw = function(ctx) {
            //ctx.drawImage(img[this.spriteImg], 3*72, 0*72, this.width, this.height, this.x, this.y, this.width, this.height);
            ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y, this.width, this.height);

            ctx.font = 'bold 18pt Comic Sans MS';
            ctx.fillStyle = '#CFA67C';
            ctx.strokeStyle = '#A06D3D';
            ctx.lineWidth = 2;

            ctx.textAlign="center";
            //ctx.strokeText('A VENDRE', this.x + (this.width / 2), this.y + (this.height / 2));
            ctx.strokeText(param[8], this.x + (this.width / 2)-1, this.y + (this.height / 2)-1, 58);
            ctx.fillText(param[8], this.x + (this.width / 2), this.y + (this.height / 2), 58);


        }

    };

