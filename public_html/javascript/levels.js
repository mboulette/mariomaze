//http://ian-albert.com/games/super_mario_bros_maps/

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

                //console.log(shema);

                this.id = shema.id;
                this.background = shema.background;
                this.translation = shema.translation;
                this.start = {x:0, y:0};
                this.height = 0;
                this.width = 0 ;
                this.exits = shema.exits
                this.name = shema.name;
                this.theme = shema.theme;


                background = ctx.createPattern(img[this.background], "repeat");
                var plate = false;

                for (y = 0; y < shema.plan.length; y++) {
                    
                    var lines = shema.plan[y].match(/.{1,2}/g);

                    for (x = 0; x < lines.length; x++) {

                        //console.log(x, y, lines[x]);
                        

                        if (lines[x][0] == 'E'  && !this.exits[lines[x]] ) this.exits[lines[x]] = {'x' : x*69+1, 'y' : y*69+1 };


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

                                if( lines[x][0] == 'E' ) {
                                    this.exits[lines[x]]['x'] = tmp.current.x+1;
                                    this.exits[lines[x]]['y'] = tmp.current.y+1;
                                }

                                if( lines[x] == 'E1' ) {
                                    this.exits[lines[x]]['y'] = tmp.current.y-30;
                                }

                                if (lines[x] == start) {
                                    this.start.x = this.exits[lines[x]]['x'];
                                    this.start.y = this.exits[lines[x]]['y'];
                                    mario.current.x = this.exits[lines[x]]['x'];
                                    mario.current.y = this.exits[lines[x]]['y'];

                                }



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
            '(=' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 7, 9]},
            '=)' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 7, 7]},
            '<=' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 8, 10]},
            '=>' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 8, 8]},
            '==' : {'groupe' : 'obstacles', 'define' : ['platforms', 0, 0, 70, 70, 2, 7, 8]},

            '= ' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 9, 0]},

            '<_' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 11, 03]},
            '__' : {'groupe' : 'obstacles', 'define' : ['platforms', 0, 0, 70, 70, 2, 11, 2]},
            '_>' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 11, 01]},
            '_ ' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 4, 11]},
            'T0' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 140, 70, 0, 0, 7]},
            '0T' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 0, 1, 7]},
            'T2' : {'groupe' : 'obstacles', 'define' : ['boxesReverse', 0, 0, 70, 70, 0, 0, 7]},
            '2T' : {'groupe' : 'obstacles', 'define' : ['boxesReverse', 0, 0, 70, 70, 0, 1, 7]},
            'T1' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 142, 70, 0, 0, 8]},
            '1T' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 0, 1, 8]},
            'XX' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 0, 11]},

            '- ' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 8, 12]},

            '[]' : {'groupe' : 'obstacles', 'define' : ['platforms', 0, 0, 70, 70, 2, 7, 4]},

            ' |' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 15, 15]},
            '| ' : {'groupe' : 'obstacles', 'define' : ['boxes', 0, 0, 70, 70, 2, 15, 15]},
            'oo' : {'groupe' : 'monsters',  'define' : ['elevators', 0, 0, -3]},
            'xx' : {'groupe' : 'monsters',  'define' : ['movingPlatform', 0, 0, -2]},
            'xz' : {'groupe' : 'monsters',  'define' : ['movingPlatform', 0, 0, 2]},
            'zx' : {'groupe' : 'monsters',  'define' : ['movingPlatform', 0, 0, 3]},

            'A1' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 50, 140, 2, 12, 0]},
            'A2' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 4, 5, 3]},
            '%1' : {'groupe' : 'obstacles', 'define' : ['trigger', 0, 0, 'exit_bowser']},
            '%2' : {'groupe' : 'obstacles', 'define' : ['trigger', 0, 0, 'enter_bowser']},

            '##' : {'groupe' : 'obstacles', 'define' : ['brickwall', 0, 0]},
            '#1' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 10, 12]},
            '#2' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 11, 0]},
            'W#' : {'groupe' : 'obstacles', 'define' : ['windows', 0, 0, 70, 70, 2, 10, 12]},
            'W1' : {'groupe' : 'obstacles', 'define' : ['windows', 0, 0, 70, 70, 2, 15, 15]},
            '<#' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 10, 2]},
            '#>' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 10, 0]},
            '«#' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 10, 1]},
            '#»' : {'groupe' : 'obstacles', 'define' : ['decorations', 0, 0, 70, 70, 2, 9, 12]},
            'F ' : {'groupe' : 'obstacles', 'define' : ['flags', 0, 0, 70, 70, 4, 3, 5]},


            '? ' : {'groupe' : 'obstacles', 'define' : ['surprises', 0, 0]},
            '?1' : {'groupe' : 'obstacles', 'define' : ['surpriseBlock', 0, 0]},
            '$ ' : {'groupe' : 'items',     'define' : ['coins', 0, 0]},
            '$$' : {'groupe' : 'items',     'define' : ['diamons', 0, 0]},
            '$1' : {'groupe' : 'obstacles', 'define' : ['shopLives', 0, 0]},
            '$2' : {'groupe' : 'obstacles', 'define' : ['shopKeys', 0, 0]},
            '$3' : {'groupe' : 'obstacles', 'define' : ['shopAmmos', 0, 0]},
            '! ' : {'groupe' : 'items',     'define' : ['hiddenBlock', 0, 0, 2, 11, 2]},
            '♥ ' : {'groupe' : 'items',     'define' : ['hearts', 0, 0]},
            '@ ' : {'groupe' : 'items',     'define' : ['ammos', 0, 0]},
            '* ' : {'groupe' : 'items',     'define' : ['stars', 0, 0]},
            'i ' : {'groupe' : 'items',     'define' : ['torches', 0, 0]},
            '+ ' : {'groupe' : 'items',     'define' : ['keys', 0, 0]},
            'P1' : {'groupe' : 'items',     'define' : ['princess', 0, 0]},
            'S1' : {'groupe' : 'items',     'define' : ['decorations', 0, 0, 70, 70, 2, 7, 4]},
            'S2' : {'groupe' : 'items',     'define' : ['decorations', 0, 0, 70, 70, 2, 3, 0]},
            'SE' : {'groupe' : 'obstacles', 'define' : ['sign', 0, 0, 70, 70, 2, 4, 6, 'A VENDRE']},
            'E0' : {'groupe' : 'items',     'define' : ['sign', 0, 0, 70, 70, 2, 4, 3, 'DÉPART']},
            'E1' : {'groupe' : 'items',     'define' : ['openDoors', 0, 0, 'E1']},
            'E2' : {'groupe' : 'items',     'define' : ['lockDoors', 0, 0, 'E2']},
            'E3' : {'groupe' : 'items',     'define' : ['decorations', 0, 0, 70, 70, 2, 15, 15]},
            'E4' : {'groupe' : 'items',     'define' : ['hiddenDoors', 0, 0, 'E4']},
            'E5' : {'groupe' : 'items',     'define' : ['hiddenDoors', 0, 0, 'E5']},
            'E6' : {'groupe' : 'items',     'define' : ['autoExit', 0, 0, 'E6']},
            'E7' : {'groupe' : 'items',     'define' : ['autoExit', 0, 0, 'E7']},
            'E8' : {'groupe' : 'items',     'define' : ['lockDoors', 0, 0, 'E8']},
            'E>' : {'groupe' : 'items',     'define' : ['exit', 0, 0, 'E>']},
            'E<' : {'groupe' : 'items',     'define' : ['exit', 0, 0, 'E<']},
            'F0' : {'groupe' : 'monsters',  'define' : ['lavas', 0, 0]},
            'F1' : {'groupe' : 'monsters',  'define' : ['breaths', 0, 0]},
            'F3' : {'groupe' : 'monsters',  'define' : ['breathsReverse', 0, 0]},
            'F2' : {'groupe' : 'obstacles',  'define' : ['fireflips', 0, 0]},

            'M1' : {'groupe' : 'monsters',  'define' : ['snails', 0, 0]},
            'M2' : {'groupe' : 'monsters',  'define' : ['rats', 0, 0]},
            'M3' : {'groupe' : 'monsters',  'define' : ['plants', 0, 0]},
            'M5' : {'groupe' : 'monsters',  'define' : ['bats', 0, 0]},
            'M6' : {'groupe' : 'monsters',  'define' : ['bowser', 0, 0]},
            'MM' : {'groupe' : 'monsters',  'define' : ['pikes', 0, 0]},

            'HH' : {'groupe' : 'items', 'define' : ['ladders', 0, 0, 70, 70, 2, 7, 2]},
            'H1' : {'groupe' : 'items', 'define' : ['laddersEnd', 0, 0]},
        };

        var maps = {

            1 : {
                'id' : 1,
                'name' : 'La prairie',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 1,
                'theme' : 'musics/grasslands.mp3',
                "exits" :   {
                    'E>' : {'map' : 2, 'pos' :  'E3'},
                    'E4' : {'map' : 6, 'pos' :  'E6'},
                    'E5' : {'map' : 6, 'pos' :  'E7'},
                },
                'plan' : [
                    "      |                                                                                                                                                                            |",
                    "      |                                                                                                                                                                            |",
                    "      |                                                                                                                                         $ $       @ @                      |",
                    "      |                                                                                                                                                   <====>                   |",
                    "      |                                                                                                                                                                            |",
                    "      |                   ####? ####                                                        $ $ $ $                                           ####                                 |",
                    "  <##>|                                                             $ $                           M1                                                                          E3E> |",
                    "<#«##»#>                          M1                  E4          $     $         E5        ########                XX    XX      XX                                        (=======",
                    "XXXXXXXX            ?     ####?1####                  T0        $         $       M3                              XXXX    XX      XX                                      (=- - - - ",
                    "XXXXXXXX                                      M3      T1    A1$             $     T1                            XXXXXX    XX      XXXX          A1                      (=- - - - - ",
                    "XXXXE2XXE0    A2                              T1      T1                M1        T1                      M1  XXXXXXXX    XX      XXXXXX  M1  M1    M1        M3      (=- - - - - - ",
                    "===================================================================)    (================)      (=====================    ==      ==================================================",
                    "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -     - - - - - - - - -       - - - - - - - - - - -     -       - - - - - - - - - - - - - - - - - - - - - - - - - ",
                    ]

            },    

            2 : {
                'id' : 2,
                'name' : 'Le sentier du chateau',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 1,
                'theme' : 'musics/grasslands.mp3',
                "exits" :   {
                    'E<' : {'map' : 1, 'pos' :  'E3'},
                    'E2' : {'map' : 3, 'pos' :  'E1'},
                    'E4' : {'map' : 4, 'pos' :  'E6'},
                    'E5' : {'map' : 4, 'pos' :  'E7'},
                    'E8' : {'map' : 5, 'pos' :  'E1'},
                },
                'plan' : [

                    "|                                                                                                             $ $ $ $                                  |",
                    "|                                                                                                                                                      |",
                    "|                                                                                                             ##?1####                                 |",
                    "|                                                                                                                                           F          |",
                    "|                                                               <##>                              $             M1                      #2  #2  #2     |",
                    "|                                                             <#«##»#>                  ?     $ $             <======>                  #1#1#1#1#1     |",
                    "|                                                             S2S2S2S2                    $ $                                           #1W##1W##1     |",
                    "|                                                         SE  S2S2E2S2                  $               M1                            _ #1_ #1_ #1_    |",
                    "|                                                         <============>                ##            <======>                        [][][][][][][]   |",
                    "|                                                 $                                                             =                     S1S1S1S1[][][]+  |",
                    "|                                               <====>                                                                                S1S1S1E8[][][]XXXX",
                    "|                                                                                                             xzxz              <===H1==================",
                    "|                                                                                                                                   HH                 |",
                    "|                                                                                                       xxxx                        HH                 |",
                    "|       + M1                        $   $   $         $ $                             E4                                            HH                 |",
                    "|       <======>                            M1                          M1            M3                                            HH        $        |",
                    "|                                   ##########        oooo            ##########      T1                                            HH  E5    $        |",
                    "|                   !                                               ########################                                        HH  T00T           |",
                    "|           $ $$$                                                 ####################                                              <========>         |",
                    "|           <====>        ?         ##########                  ################                                                                       |",
                    "|                                                             ##############                                                                           |",
                    "| E<E3                    M1              =                                                                                                            |",
                    "=============)      (========)        (======)      (====)                                                                                             |",
                    "- - - - - - -       - - - - -         - - - -       - - -                                                                                              |",
                    ]

            },
            
            3 : {
                'id' : 3,
                'name' : 'Le magasin',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 7,
                'theme' : 'musics/mushroom.mp3',
                "exits" : {'E1' : {'map' : 2, 'pos' : 'E2'}},
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
            },

            4 : {
                'id' : 4,
                'name' : 'Le tunnel souterrain',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 7,
                'theme' : 'musics/mushroom.mp3',
                "exits" : {
                    'E6' : {'map' : 2, 'pos' :  'E4'},
                    'E7' : {'map' : 2, 'pos' :  'E5'},
                },
                'plan' : [
                    "[][][][]T11T[][][][][][][][][][][][][][][][][][][][][][]T11T[][][][]",
                    "[][][][]T11T[][][][][][][][][][][][][][][][][][][][][][]T11T[][][][]",
                    "[][]    T22T              [][][][][][][][][]            T22T    [][]",
                    "[]      E6                  [][][][][][][]              E7        []",
                    "[]                                                                []",
                    "[]              ?             i   *   i         $ $ $ $ $ $ $ $   []",
                    "[]                                                                []",
                    "[]      []                  [][][]F1[][][]              []        []",
                    "[][]    M2      M2        [][][][][][][][][]  M2  M2            [][]",
                    "[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]",
                    ]
            },


            5 : {
                'id' : 5,
                'name' : 'Le chateau de Bowser',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 8,
                'theme' : 'musics/dungeon.mp3',
                "exits" : {
                    'E1' : {'map' : 2, 'pos' :  'E8'},
                    'E6' : {'map' : 5, 'pos' :  'E4'},
                    'E4' : {'map' : 5, 'pos' :  'E6'},
                    'E2' : {'map' : 7, 'pos' :  'E1'},
                },
                'plan' : [
                    "[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]",
                    "[]$$                                          [][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]",
                    "[]                                  M2    i     [][][][][][][][][][][][]        [][][]                          []",
                    "[]          i             [][]F1[][][]      M5    ##?1##  $ $ $ $ $             %1  %2                          []",
                    "[]$ $                   [][][][][][][][]          ####                    W1                                E2i []",
                    "[][][]        <=H1=>    [][][][][][][][][]        ##                [][]        []F2[]              M6      [][][]",
                    "[]M5            HH      [][][]$ $ $ [][][][]            [][]F1[]F1[][]##        [][][]    ############    [][][][]",
                    "[]          W1  HH      [][][]$ $$$ [][][][]          [][][][][][][][]##+ [][][][][][][][][][][][][][][][][][][][]",
                    "[]                      [][][]  ?   [][][][]  _   [][][]F3[][][][][][]##[][][][][][][][][][][][][][][][][][][][][]",
                    "[]      $ $             [][][]                            [][]T11T      [][][][][][][][][][][][][][][][][][][][][]",
                    "[]      [][]            [][][]                            [][]T22T      []  M5                            [][][][]",
                    "[]          W1          [][][][][][]F1[][][]MMMMMM[][]    [][]E6    $3  []$$$ $ $ $ $ $ $ $ $ $ $           [][][]",
                    "[]                      [][][][][][][][][][][][][][][][]  [][]$ $ $ $ $ [][][][][][][][][][][][][][]F1        [][]",
                    "[]M5          oooo      [][][][][][]                      [][]          [][]                      [][]        [][]",
                    "[]                      [][][][][]    $ $ $ $ $ $ $ $       [][][][][][][][]  $ $ $ $   $ $ $ $   [][][]    [][][]",
                    "[]    [][]  W1          [][][][][]                    ##                  []                    M5[][]        [][]",
                    "[]                      [][][][]♥                             i   i   i                                       [][]",
                    "[]MMMMMMMMMM            [][][][]          xxxxxzxz            M2      M2          ##        ##          oooo  [][]",
                    "[][][][][][][]F2[][]    [][][][][]                          [][][][][][][]        ##    ##  ##      []  E4    [][]",
                    "[]                      [][][][][][]                      [][][][][][][][][]  ##  ##    ##  ##    [][]  T00T  [][]",
                    "[]  E1                  [][][][][][][][]F0F0F0[]F0F0F0[][][][][][][][][][][][]##F0##F0F0##F0##F0[][][]  T11T  [][]",
                    "[][][][][]F2[][][]F2[][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]T11T[][][]",
                    ]
            },


            6 : {
                'id' : 6,
                'name' : 'La chambre secrette',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 7,
                'theme' : 'musics/mushroom.mp3',
                "exits" : {
                    'E6' : {'map' : 1, 'pos' : 'E4'},
                    'E7' : {'map' : 1, 'pos' : 'E5'},
                },
                'plan' : [
                    "[][][][]T11T[][][][][][][][][]T11T[]",
                    "[][][][]T11T[][][][][][][][][]T11T[]",
                    "[][]    T22T              [][]T11T[]",
                    "[]      E6                  []T22T[]",
                    "[]    $ $ $ $ $ $ $           E7  []",
                    "[]                  M2  i         []",
                    "[]    [][]  ##########            []",
                    "[]    $ $ $ $ $ $ $         [][][][]",
                    "[][]    M2              [][][][][][]",
                    "[][][][][][][][][][][][][][][][][][]",
                    ]
            },



            7 : {
                'id' : 7,
                'name' : 'La cellule de la princesse',
                'translation' : {'x' : 0, 'y' : 0},
                'background' : 9,
                'theme' : 'musics/mushroom.mp3',
                "exits" : {
                    'E1' : {'map' : 5, 'pos' : 'E2'},
                },
                'plan' : [
                    "[][][][][][][][][][][][][][][][][][][][][][]",
                    "[][][][][][][][][][][][][][][][][][][][][][]",
                    "[]                                        []",
                    "[]                                        []",
                    "[]                                        []",
                    "[]                                        []",
                    "[]      E1                                []",
                    "[]    [][][]                              []",
                    "[]  [][][][][]                      P1    []",
                    "[][][][][][][][][][][][][][][][][][][][][][]",
                    "[][][][][][][][][][][][][][][][][][][][][][]",
                    ]
            },


        };