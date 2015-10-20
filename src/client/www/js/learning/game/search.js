Learning.controller("Search","Game",{
    size: 8,
    directions: [
        {row:1,col:1},
        //{row:1,col:0},
        //{row:1,col:-1},
        //{row:0,col:-1},
        //{row:-1,col:-1},
        //{row:-1,col:0},
        {row:-1,col:1},
        {row:0,col:1}
    ],
    table: function(words,places) { // Creates a table and fills words from places
        var table = [];
        for (var row = 0; row < this.size; row++) {
            table.push([]);
            for (var col = 0; col < this.size; col++) {
                table[row][col] = ' ';
            }
        }
        if (places) {
            for (var index = 0; index < places.length; index++) {
                var word = words[index];
                for (var letter = 0; letter < word.length; letter++) {
                    var row = places[index].position.row + letter * places[index].direction.row;
                    var col = places[index].position.col + letter * places[index].direction.col;
                    table[row][col] = word[letter];
                }
            }
        }
        return table;
    },
    hide: function(words,places) { // Hides the next word in the table
        // If the number of places equals the number of words, then we're done
        if (words.length == places.length) {
            return places;
        }
        // The current word how many places we have
        var word = words[places.length];
        var table = this.table(words,places);
        var place;
        // A direction specifies which way for the word to go from its position 
        var directions = this.directions.slice();
        this.application.shuffle(directions);
        // Go through all the possible directions which we do first as that determines the possible positions
        turns: for (var turn = 0; turn < directions.length; turn++) {
            var direction = directions[turn];
            // Calculate the range of possible positions based on the word length and direction
            var start = {
                row: Math.max(0,-direction.row*word.length-1),
                col: Math.max(0,-direction.col*word.length-1)
            };
            var end = {
                row: Math.min(this.size,this.size-direction.row*word.length), 
                col: Math.min(this.size,this.size-direction.col*word.length)
            };
            // The position is where the word starts at
            positions = [];
            for (var row = start.row; row < end.row; row++) {
                for (var col = start.col; col < end.col; col++) {
                    positions.push({row: row, col: col});
                } 
            } 
            // Shuffle where they can start
            this.application.shuffle(positions);
            // Go through all the places to start
            locations: for (var location = 0; location < positions.length; location++) {
                var position = positions[location];
                // Determine letter position based on word length and direction
                for (var letter = 0; letter < word.length; letter++) {
                    var row = position.row + letter * direction.row;
                    var col = position.col + letter * direction.col;
                    // If we're not a space and not the same letter, we won't fit
                    if (table[row][col] != ' ' && table[row][col] != word[letter]) {
                        continue locations;
                    }
                }
                // If we're here, we fit! Make a copy of the places because we don't want to modify 
                // until we know everything fits
                var down_places = places.slice();
                // Add our new position
                down_places.push({direction: direction, position: position});
                // Get whether all other words fit
                var up_places = this.hide(words,down_places);
                // If we got places back, everything fit below and we're done
                if (up_places) {
                    return up_places;
                } // If not, it'll try a new location until they run out
            } // If we're here, it'll try a new direction until they run out
        }
        // If we're here, we've tried everything. Can't fit this word so move the previous word. 
        return false;
    },
    play: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.groups.length) {
            this.sight = (this.application.current.paths[3] == 'sight-search');
            this.it.searches = [];
            for (var search = 0; search < this.groups[this.index].length; search++) {
                this.it.searches.push({
                    word: this.groups[this.index][search]
                });
            }
            this.places = this.hide(this.groups[this.index],[]);
            if (!this.places) {
                alert("Couldn't fit!");
                return;
            }
            this.it.table = this.table(this.groups[this.index],this.places);
            for (var row = 0; row < this.size; row++) {
                for (var col = 0; col < this.size; col++) {
                    if (this.it.table[row][col] == ' ') {
                        this.it.table[row][col] = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(26*Math.random())];
                    }
                }
            }
            this.selection = null;
            this.finds = [];
            this.application.render(this.it);
            var canvas = $("#finds")[0];
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.draw();
        } else {
            this.application.go("student/position",this.it.student.id);
        }
    },
    find: function(cell) {
        var row = Number($(cell).attr("row"));
        var col = Number($(cell).attr("col"));
        var letter = $(cell).html();
        // If we have a selection and position, then we have to figure 
        // whether this is related to the current
        if (this.selection && this.selection.position) {
            // Calculate the distance from the current position
            var distance = {
                row: row-this.selection.position.row,
                col: col-this.selection.position.col
            };
            // If we have direction, than there's more than one already and 
            // we have to determin if it's next along the same line
            if (this.selection.direction) {
                // If the current postion plus it's length plus one along the direction
                // is the same as where we're at, then add to this length
                var position = {
                    row: this.selection.position.row + (this.selection.word.length)*this.selection.direction.row,
                    col: this.selection.position.col + (this.selection.word.length)*this.selection.direction.col
                }
                if (position.row == row && position.col == col) {
                    this.selection.word += letter;
                // Else we're somewhere new
                } else {
                    this.selection = null;
                }
            } else {
                // Go through all the valid positions and determine if this is one of them
                for (var turn = 0; turn < this.directions.length; turn++) {
                    if ((distance.row == this.directions[turn].row) &&
                        (distance.col == this.directions[turn].col)) {
                        this.selection.direction = distance;
                        this.selection.word += letter;
                    }
                }
                // Not valid, then this is the next start
                if (!this.selection.direction) {
                    this.selection = null;
                }
            }
        }
        // If there's no selection at this point, then what's clicked is it.
        if (!this.selection) {
            this.selection = {
                position: {
                    row: row,
                    col: col
                },
                word: letter
            };
        }
        // Now determine the word and see if there's a match
        if (this.selection) {
            // Go through the list of words
            for (var find = 0; find < this.groups[this.index].length; find++) {
                // If this word is the same, add to finds, null selection and make the word green
                if (this.selection.word == this.groups[this.index][find].toUpperCase()) {
                    $("#searches li[word='" + this.selection.word + "'] a").css('color','#82bb42');
                    this.finds.push(this.selection);
                    this.selection = null;
                    break;
                }
            }
        }
        this.draw();
    },
    select: function(context,from,to) {
        var start = from.getBoundingClientRect();
        var end = to.getBoundingClientRect();
        var degree = Math.atan2(end.top-start.top,end.left-start.left);
        context.beginPath();
        context.arc(
            0.5*(start.left+start.right),
            0.5*(start.top+start.bottom),
            0.25*(start.width+start.height)-5,
            degree+0.5*Math.PI,
            degree-0.5*Math.PI
        );
        context.arc(
            0.5*(end.left+end.right),
            0.5*(end.top+end.bottom),
            0.25*(end.width+end.height)-5,
            degree-0.5*Math.PI,
            degree+0.5*Math.PI
        );
        context.closePath();
        context.stroke();
    },
    draw: function() {
        var context = $("#finds")[0].getContext("2d");
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.lineWidth = 1;
        context.strokeStyle = '#82bb42';
        for (var find = 0; find < this.finds.length; find++) {
            var word = this.finds[find].word;
            var position = this.finds[find].position;
            var direction = this.finds[find].direction;
            var start_query = "#table td[row=" + position.row + "]" + 
                                       "[col=" + position.col + "]";
            var end_query = "#table td[row=" + (position.row+(word.length-1)*direction.row) + "]" + 
                                     "[col=" + (position.col+(word.length-1)*direction.col) + "]";
            this.select(context,$(start_query)[0],$(end_query)[0]);
        }
        if (this.selection && this.selection.position) {
            context.strokeStyle = '#0077dd';
            var position = this.selection.position;
            var start_query = "#table td[row=" + position.row + "]" + 
                                       "[col=" + position.col + "]";
            if (this.selection.direction) {
                var direction = this.selection.direction;
                var end_query = "#table td[row=" + (position.row+(this.selection.word.length-1)*direction.row) + "]" + 
                                         "[col=" + (position.col+(this.selection.word.length-1)*direction.col) + "]";
                this.select(context,$(start_query)[0],$(end_query)[0]);
            } else {
                this.select(context,$(start_query)[0],$(start_query)[0]);
            }
        }
    },
    check: function() {
        this.draw();
        var context = $("#finds")[0].getContext("2d");
        context.lineWidth = 1;
        context.strokeStyle = '#d32c46';
        var finds = [];
        // Go through the list of words and finds, adding to fidns if found
        for (var sought = 0; sought < this.groups[this.index].length; sought++) {
            var word = this.groups[this.index][sought];
            for (var found = 0; found < this.finds.length; found++) {
                if (word.toUpperCase() == this.finds[found].word) {
                    finds.push(this.groups[this.index][sought]);
                    break;
                }
            }
            // If we're in, then we have attainment
            if ($.inArray(word,finds) > -1) {
                hwAPI.student.attain(this.it.student.id,word,this.it.achievement.id);
            // If we don't, we have yield and we need to color what's missing
            } else {
                hwAPI.student.yield(this.it.student.id,word,this.it.achievement.id);
                var place = this.places[sought];
                $("#searches li[word='" + word.toUpperCase() + "'] a").css('color','#d32c46');
                var position = place.position;
                var direction = place.direction;
                var start_query = "#table td[row=" + position.row + "]" + 
                                           "[col=" + position.col + "]";
                var end_query = "#table td[row=" + (position.row+(word.length-1)*direction.row) + "]" + 
                                         "[col=" + (position.col+(word.length-1)*direction.col) + "]";
                this.select(context,$(start_query)[0],$(end_query)[0]);
            }
        }
        var transform = "rotate(" + -180 * (1 - finds.length / this.groups[this.index].length)  + "deg)";
        $('.hw-complete').css({
            "webkitTransform":transform,
            "MozTransform":transform,
            "msTransform":transform,
            "OTransform":transform,
            "transform":transform
        });
        $('.hw-complete').show();
        $('.hw-progress').hide();
    }
});

Learning.template("Search",Learning.load("game/search"),null,Learning.partials);

Learning.route("game/sight-search","/student/{student_id:^\\d+$}/game/sight-search/","Search","Search","choose");
Learning.route("game/sound-search","/student/{student_id:^\\d+$}/game/sound-search/","Search","Search","choose");