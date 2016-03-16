    var decorations = function(param) {
        this.trash = 0,
        this.x = param[1],
        this.y = param[2],
        this.width = param[3],
        this.height = param[4],
        this.spriteImg = param[5],
        this.spriteX = param[6],
        this.spriteY = param[7],

        this.current = {'x' : param[1], 'y' : param[2]};

        this.draw = function(ctx) {
            ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y, this.width, this.height);
        },

        this.collision = function(object) {
        }

    };



    var sign = function(param) {
        this.me = new decorations(param);

        this.me.draw = function(ctx) {

            ctx.save();
            ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y, this.width, this.height);

            ctx.font = 'bold 18pt Comic Sans MS';
            ctx.fillStyle = '#CFA67C';
            ctx.strokeStyle = '#A06D3D';
            ctx.lineWidth = 2;

            ctx.textAlign="center";
            ctx.strokeText(param[8], this.x + (this.width / 2)-1, this.y + (this.height / 2)-1, 58);
            ctx.fillText(param[8], this.x + (this.width / 2), this.y + (this.height / 2), 58);
            ctx.restore();


        }

    };

    var windows = function(param) {
        this.me = new decorations(param);

        this.me.draw = function(ctx) {
            
            ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y, this.width, this.height);
            ctx.drawImage(img[this.spriteImg], 1*72, 0*72, this.width, this.height, this.x, this.y, this.width, this.height); 
        }

    };

    var flags = function(param) {
        this.me = new decorations(param);
        this.me.current = {
            'frame' : 0,
            'action' : 'fly',
            'timer' : performance.now(),
        },

        this.me.draw = function(ctx) {
            ctx.drawImage(img[this.spriteImg], this.action[this.current.action][this.current.frame][0], this.action[this.current.action][this.current.frame][1], this.width, this.height, this.x, this.y, this.width, this.height);
            this.nextframe();
        },

        this.me.action = {
            'fly' : [
            [3*72, 5*72, 200],
            [3*72, 6*72, 200],
            ],
        },


        this.me.nextframe = function () {

            if ((performance.now() - this.current.timer) > this.action[this.current.action][this.current.frame][2] && this.action[this.current.action][this.current.frame][2] != -1) {

                if (!this.action[this.current.action][this.current.frame + 1]) {
                    this.current.frame = 0;
                } else if (!$.isArray(this.action[this.current.action][this.current.frame + 1])) {
                    this.current.action = this.action[this.current.action][this.current.frame + 1];
                    this.current.frame = 0;
                } else {
                    this.current.frame++;
                }

                this.current.timer = performance.now();
            }
        }

    };