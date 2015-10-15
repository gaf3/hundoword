Learning.controller("Search","Game",{
    size: 10,
    grid: function(words,places) { // Creates a grid and fills words from places
        var grid = [];
        for (var x = 0; x < this.size; x++) {
            grid.push([]);
            for (var y = 0; y < this.size; y++) {
                grid[x][y] = ' ';
            }
        }
        if (places) {
            for (var index = 0; index < places.length; index++) {
                var word = words[index];
                for (var letter = 0; letter < word.length; letter++) {
                    var x = places[index].position.x + letter * places[index].direction.x;
                    var y = places[index].position.y + letter * places[index].direction.y;
                    grid[x][y] = word[letter];
                }
            }
        }
        return grid;
    },
    hide: function(words,places) { // Hides the next word in the grid
        // If the number of places equals the number of words, then we're done
        if (words.length == places.length) {
            return places;
        }
        // The current word how many places we have
        var word = words[places.length];
        var grid = this.grid(words,places);
        var place;
        // A direction specifies which way for the word to go from its position 
        var directions = [{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1},{x:0,y:-1},{x:0,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:1}];
        this.application.shuffle(directions);
        // Go through all the possible directions which we do first as that determines the possible positions
        turns: for (var turn = 0; turn < directions.length; turn++) {
            var direction = directions[turn];
            // Calculate the range of possible positions based on the word length and direction
            var start = {
                x: Math.max(0,-direction.x*word.length-1),
                y: Math.max(0,-direction.y*word.length-1)
            };
            var end = {
                x: Math.min(this.size,this.size-direction.x*word.length), 
                y: Math.min(this.size,this.size-direction.y*word.length)
            };
            // The position is where the word starts at
            positions = [];
            for (var x = start.x; x < end.x; x++) {
                for (var y = start.y; y < end.y; y++) {
                    positions.push({x: x, y: y});
                } 
            } 
            // Shuffle where they can start
            this.application.shuffle(positions);
            // Go through all the places to start
            locations: for (var location = 0; location < positions.length; location++) {
                var position = positions[location];
                // Determine letter position based on word length and direction
                for (var letter = 0; letter < word.length; letter++) {
                    var x = position.x + letter * direction.x;
                    var y = position.y + letter * direction.y;
                    // If we're not a space and not the same letter, we won't fit
                    if (grid[x][y] != ' ' && grid[x][y] != word[letter]) {
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
            this.it.searches = [];
            for (var search = 0; search < this.groups[this.index].length; search++) {
                this.it.searches.push({
                    word: this.groups[this.index][search],
                    audio: this.audio(this.groups[this.index][search])
                });
            }
            var places = this.hide(this.groups[this.index],[]);
            if (!places) {
                alert("Couldn't fit!");
                return;
            }
            this.it.grid = this.grid(this.groups[this.index],places);
            for (var x = 0; x < this.size; x++) {
                for (var y = 0; y < this.size; y++) {
                    if (this.it.grid[x][y] == ' ') {
                        this.it.grid[x][y] = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(26*Math.random())];
                    }
                }
            }
            this.application.render(this.it);
            var canvas = $("#finds")[0];
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            this.application.go("student/position",this.it.student.id);
        }
    }
});

Learning.template("Search",Learning.load("game/search"),null,Learning.partials);

Learning.route("game/sight-search","/student/{student_id:^\\d+$}/game/sight-search/","Search","Search","words");
Learning.route("game/sound-search","/student/{student_id:^\\d+$}/game/sound-search/","Search","Search","words");