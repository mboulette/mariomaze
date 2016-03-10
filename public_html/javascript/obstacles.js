
        var hitZone = function(param) {

            this.trash = 0,
            this.x = param[1],
            this.y = param[2]
            this.width = param[3],
            this.height = param[4],
            this.spriteImg = param[5],
            this.spriteX = param[6],
            this.spriteY = param[7],
            this.choc = 0,


            this.hit = function(x1, y1, x2, y2) {
                return !((y2 < this.y) || (y1 > this.y+this.height) || (x1 > this.x+this.width) || (x2 < this.x));
            }

            this.hitH = function(object) {

                x1 = object.previewX(); y1 = object.current.y; x2 = object.previewX() + object.width; y2 = object.current.y + object.height;

                if (this.hit(x1, y1, x2, y2)) {

                    x1 = object.current.x - (this.x-object.width-1);
                    x2 = object.current.x - (this.x+this.width+1);

                    if (object.current.velX != 0) {
                        if ( Math.abs(x1) > Math.abs(x2) ) {
                            object.current.x -= x2;
                        } else { 
                            object.current.x -= x1;
                        }
                    }


                    object.current.velX = 0;

                }
            }

            this.hitV = function(object) {

                x1 = object.current.x; y1 = object.previewY(); x2 = object.current.x + object.width;  y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                 
                    if (object.current.velY > 0 ) {
                        object.current.y = this.y-object.height-object.gravity-1;
                        object.current.jumping = 0;
                        object.current.grounding = 1;

                    }

                    if (object.current.velY < 0) {
                        object.current.y = this.y+this.height+1; 
                    }

                    object.current.velY = 0;

                }
            }

            this.collision = function(object) {
                
                x1 = object.previewX(); y1 = object.previewY(); x2 = object.previewX() + object.width; y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                    this.hitH(object);
                    this.hitV(object);
                }
            },

            this.draw = function(ctx) {

                ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y+this.choc, this.width, this.height);

                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.rect(this.x, this.y, this.width, this.height);
                    ctx.stroke();
                }
                this.choc = (this.choc == 0) ? 0 : this.choc+5;
            }

        };


        var hitZoneR = function(param) {
            this.me = new hitZone(param);

            this.me.draw = function(ctx) {

                ctx.save();

                
                ctx.translate(this.x + (this.width/2), this.y + (this.height/2));
                ctx.scale(1, -1);
                ctx.translate(0 - (this.x + (this.width/2)), 0 - (this.y + (this.height/2)) );

                ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y+this.choc, this.width, this.height);

                ctx.restore();

                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.rect(this.x, this.y, this.width, this.height);
                    ctx.stroke();
                }
                this.choc = (this.choc == 0) ? 0 : this.choc+5;
            }
        };

        var platforms = function(param) {
            this.me = new hitZone(param);
            this.me.pattern = createPattern(ctx, img[this.me.spriteImg], this.me.spriteX*72, this.me.spriteY*72, 70, 70);
            
            this.me.draw = function(ctx) {
                
                ctx.save()

                ctx.translate(this.x, this.y);

                ctx.beginPath();
                ctx.rect(0, 0, this.width, this.height);
                ctx.fillStyle = this.pattern;
                ctx.fill();
                ctx.restore();
                

                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.rect(this.x, this.y, this.width, this.height);
                    ctx.stroke();
                }
            }
        };

        var boxes = function(param) {
            this.me = new hitZone(param);
        };

        var boxesReverse = function(param) {
            this.me = new hitZone(param);

            this.me.draw = function(ctx) {

                ctx.save();
                ctx.translate(0, this.y + (this.height/2));
                ctx.scale(1, -1);
                ctx.translate(0, 0 - (this.y + (this.height/2)));
                ctx.drawImage(img[this.spriteImg], this.spriteX*72, this.spriteY*72, this.width, this.height, this.x, this.y+this.choc, this.width, this.height);
                ctx.restore();

                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.rect(this.x, this.y, this.width, this.height);
                    ctx.stroke();
                }
            }
        };

        var fireflips = function(param) {
            param[3] = 70;
            param[4] = 70;
            param[5] = 2;
            param[6] = 0;
            param[7] = 9;
            this.me = new hitZone(param);

            for (var i = 0; i < 9; i++) { 
                var tmp = new firelame(['firelame', this.me.x+15, this.me.y+10, i*15]);
                map.monsters.push(tmp.me);
            }

        };


        var trigger = function(param) {
            this.x = param[1],
            this.y = param[2],
            this.event = param[3],
            this.width = 70,
            this.height = 70

            this.hit = function(x1, y1, x2, y2) {
                return !((y2 < this.y) || (y1 > this.y+this.height) || (x1 > this.x+this.width) || (x2 < this.x));
            },

            this.collision = function(object) {
                
                x1 = object.previewX(); y1 = object.previewY(); x2 = object.previewX() + object.width; y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                    switch (this.event) {
                        case 'exit_bowser':

                            current_music = music_theme.src;
                            path = current_music.split( '/' );

                            if ('musics/' + path[path.length-1] != map.theme) {
                                music_theme.src = map.theme;
                                music_theme.play();
                            }

                            break;
                        case 'enter_bowser':

                            current_music = music_theme.src;
                            path = current_music.split( '/' );
                            if (path[path.length-1] != 'boss.mp3') {
                                music_theme.src = 'musics/boss.mp3';
                                music_theme.play();  
                            }

                            break;
                    }

                }
            },


            this.draw = function(ctx) {

                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.rect(this.x, this.y, this.width, this.height);
                    ctx.stroke();
                }
            }
        }