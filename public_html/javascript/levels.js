var level = function() {

            this.name = '',
            this.start = {'x' : 0, 'y' : 0},
            this.projectiles = [],
            this.obstacles = [],
            this.monsters = [],
            this.items = [],

            this.clean = function() {
                this.obstacles = this.obstacles.filter(function(object){
                    return object.trash != 1;
                });

                this.items = this.items.filter(function(object){
                    return object.trash != 1;
                });

                this.projectiles = this.projectiles.filter(function(object){
                    return object.trash != 1;
                });
            },

            this.draw = function() {
                
                ctx.save();

                for (var i = 0; i < this.obstacles.length; i++) { 
                    this.obstacles[i].draw(ctx);
                }
                for (var i = 0; i < this.items.length; i++) { 
                    this.items[i].draw(ctx);
                }
                for (var i = 0; i < this.monsters.length; i++) { 
                    this.monsters[i].draw(ctx);
                }
                for (var i = 0; i < this.projectiles.length; i++) { 
                    this.projectiles[i].draw(ctx);
                }

                ctx.restore();

            },

            this.load = function(template) {
                this.name = template.name;
                this.start = template.start;
                mario.current.x = map.start.x;
                mario.current.y = map.start.y;

                for (var i = 0; i < template.obstacles.length; i++) { 
                    tmp = new window[template.obstacles[i][0]](template.obstacles[i]);
                    if (tmp.me) tmp = tmp.me;
                    this.obstacles.push(tmp);
                }
                for (var i = 0; i < template.items.length; i++) { 
                    tmp = new window[template.items[i][0]](template.items[i]);
                    if (tmp.me) tmp = tmp.me;
                    this.items.push(tmp);
                }
                for (var i = 0; i < template.monsters.length; i++) { 
                    tmp = new window[template.monsters[i][0]](template.monsters[i]);
                    if (tmp.me) tmp = tmp.me;
                    this.monsters.push(tmp);
                }

            },

            this.loadMap = function(shema, start) {

                this.id = shema.id;
                this.background = shema.background;
                this.translation = shema.translation;
                this.start = {x:0, y:0};
                this.height = 0;
                this.width = 0 ;
                this.exits = shema.exits
                this.name = shema.name;


                background = ctx.createPattern(img[this.background], "repeat");
                var plate = false;

                for (y = 0; y < shema.plan.length; y++) {
                    
                    var lines = shema.plan[y].match(/.{1,2}/g);

                    for (x = 0; x < lines.length; x++) {

                        console.log(lines[x]);

                        if (lines[x][0] == 'E') {
                            if (this.exits[lines[x]]) {
                                this.exits[lines[x]]['x'] = x*69;
                                this.exits[lines[x]]['y'] = y*69;
                            }
                        }

                        if (lines[x] == start) {
                            this.start.x = x*69+1;
                            this.start.y = y*69+1;
                            mario.current.x = x*69+1;
                            mario.current.y = y*69+1;
                        }

                        

                        module = level_modules[lines[x]];

                        if (module && module.define[0] == 'platforms') {

                            if (!plate) {
                                module.define[1] = x*69;
                                module.define[2] = y*69;
                                module.define[3] = 70;
                                plate = module;
                            } else {
                                plate.define[3] += 69;
                            }

                        } else {

                            if (plate) {
                                tmp = new window[plate.define[0]](plate.define);
                                if (tmp.me) tmp = tmp.me;

                                this[plate.groupe].push(tmp);

                                if (tmp.x + tmp.width > this.width) this.width = tmp.x + tmp.width;
                                if (tmp.y + tmp.height > this.height) this.height = tmp.y + tmp.height;

                                plate = false;
                            }

                            if (lines[x] != '  ') {

                                module.define[1] = x*69;
                                module.define[2] = y*69;

                                tmp = new window[module.define[0]](module.define);
                                if (tmp.me) tmp = tmp.me;

                                this[module.groupe].push(tmp);

                                if (x*69 + tmp.width > this.width) this.width = x*69 + tmp.width;
                                if (y*69 + tmp.height > this.height) this.height = y*69 +tmp.height;
                            }
                        }

                    }

                    if (plate) {
                        tmp = new window[plate.define[0]](plate.define);
                        if (tmp.me) tmp = tmp.me;

                        this[plate.groupe].push(tmp);

                        if (tmp.x + tmp.width > this.width) this.width = tmp.x + tmp.width;
                        if (tmp.y + tmp.height > this.height) this.height = tmp.y + tmp.height;

                        plate = false;
                    }
                }

            }



        };
        

        var level_modules = {
            '<=' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 8, 10]},
            '==' : {'groupe' : 'obstacles', 'define' : ['platforms', 0, 0, 70, 70, 2, 7, 8]},
            '=>' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 8, 8]},
            '= ' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 9, 0]},

            '<_' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 11, 03]},
            '__' : {'groupe' : 'obstacles', 'define' : ['platforms', 0, 0, 70, 70, 2, 11, 2]},
            '_>' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 11, 01]},
            '_ ' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 4, 11]},

            '- ' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 8, 12]},

            '[]' : {'groupe' : 'obstacles', 'define' : ['platforms', 0, 0, 70, 70, 2, 7, 4]},

            ' |' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 15, 15]},
            '| ' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 15, 15]},
            'oo' : {'groupe' : 'monsters',  'define' : ['elevator', 0, 0]},

            '##' : {'groupe' : 'obstacles', 'define' : ['brickwall', 0, 0]},
            '#1' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 10, 12]},
            'W#' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 1, 0]},
            '<#' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 10, 2]},
            '#>' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 10, 0]},
            '«#' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 10, 1]},
            '#»' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 9, 12]},
            'F#' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 0, 0]},


            '? ' : {'groupe' : 'obstacles', 'define' : ['surprises', 0, 0]},
            '$ ' : {'groupe' : 'items',     'define' : ['coins', 0, 0]},
            '$$' : {'groupe' : 'items',     'define' : ['diamons', 0, 0]},
            '$1' : {'groupe' : 'obstacles', 'define' : ['shopLives', 0, 0]},
            '$2' : {'groupe' : 'obstacles', 'define' : ['shopKeys', 0, 0]},
            '$3' : {'groupe' : 'obstacles', 'define' : ['shopAmmos', 0, 0]},
            '! ' : {'groupe' : 'items',     'define' : ['hiddenBlock', 0, 0, 2, 11, 2]},
            '♥ ' : {'groupe' : 'items',     'define' : ['hearts', 0, 0]},
            '* ' : {'groupe' : 'items',     'define' : ['ammos', 0, 0]},
            'i ' : {'groupe' : 'items',     'define' : ['torches', 0, 0]},
            '+ ' : {'groupe' : 'items',     'define' : ['keys', 0, 0]},
            'S1' : {'groupe' : 'items',     'define' : ['decorations', 0, 0, 70, 70, 2, 7, 4]},
            'S2' : {'groupe' : 'items',     'define' : ['decorations', 0, 0, 70, 70, 2, 3, 0]},
            'SE' : {'groupe' : 'obstacles', 'define' : ['shop', 0, 0, 70, 70, 2, 4, 6]},
            'E0' : {'groupe' : 'items',     'define' : ['decorations', 0, 0, 70, 70, 2, 4, 3]},
            'E1' : {'groupe' : 'items',     'define' : ['openDoors', 0, 0, 'E1']},
            'E2' : {'groupe' : 'items',     'define' : ['lockDoors', 0, 0, 'E2']},
            'E3' : {'groupe' : 'items',     'define' : ['decorations', 0, 0, 70, 70, 2, 4, 5]},
            'M1' : {'groupe' : 'monsters',  'define' : ['snails', 0, 0]},
            'M2' : {'groupe' : 'monsters',  'define' : ['rats', 0, 0]}
        };

        var maps = {

            0 : {
                'id' : 0,
                'name' : 'Carte TEST',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 1,
                "exits" : {},
                'plan' : [

                    "  ",
                    "  ",
                    "  ",
                    "  ",
                    "  ",
                    "<====>  =   <____>  _   -   []  ##  ?   $   !   ♥   +   S1  E1  E2  ",
                    "  ====",
                    "  ",
                    "E0",
                    "<======================================================================>"
                    ]
            },
            1 : {
                'id' : 1,
                'name' : 'Carte #1.0',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 1,
                "exits" : {'E2' : {'map' : 2, 'pos' :  'E1'}},
                'plan' : [

                    "-                                                                        |",
                    "-                                                           <##>         |",
                    "-                                                         <#«##»#>       |",
                    "-                                                         S2S2S2S2       |",
                    "-                                                         S2SEE2S2       |",
                    "-                                                       <==========>     |",
                    "-                                                                        |",
                    "-                                             <====>                     |",
                    "-                                                                        |",
                    "-                                                                        |",
                    "-                                                                        |",
                    "-     + M1                        $   $   $         $ $                   ",
                    "-     <======>                            M1                            E3",
                    "-                                 ##########        oooo            ######",
                    "-                 !                                               ########",
                    "-         $ $$$                                                 ##########",
                    "-         <====>        ?         ##########                  ############",
                    "-                                                           ##############",
                    "- E0                    M1              =                                |",
                    "===========>      <========>        <======>      <====>                 |"
                    ]

            },
            
            2 : {
                'id' : 2,
                'name' : 'Carte #1.1',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 7,
                "exits" : {'E1' : {'map' : 1, 'pos' : 'E2'}},
                'plan' : [
                    "[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]",
                    "[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]",
                    "[][]                      [][][][][][][][][]      $ $ $ $       [][]",
                    "[]                          [][][][][][][]                        []",
                    "[]  i         $2        i   S1S1S1S1S1S1S1    $ $ $     $ $ $     []",
                    "[]      $1          $3      S1S1S1S1S1S1S1    ######$$$$######    []",
                    "[]                          [][][][][][][]    $ ? $     $ ? $     []",
                    "[]                          [][][][][][][]$           M2        $ []",
                    "[][]          E1          [][][][][][][][][]$ $   M2      M2$ $ [][]",
                    "[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]",
                    ]
            }
/*
            3 : {
                'id' : 3,
                'name' : 'Carte #3',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 1,
                "exits" : {'E2' : {'map' : 2, 'pos' :  'E1'}},
                'plan' : [
                    "|                                                                     |",
                    "|                                                          F          |",
                    "|                                                        <##1#>       |",
                    "|                                                      <#«##1#»#>     |",
                    "|                                                      #1W##1W##1     |",
                    "|                                                    _ #1_ #1_ #1_    |",
                    "|                                                    [][][][][][][]   |",
                    "|                                                    S1S1S1S1[][][]   |",
                    "                                                     S1S1S1E2[][][]   |",
                    "E3                                             <=======================",
                    "|                                                                     |",

                    ]

            },
*/
        };