Learning.controller("Spell","Game",{
    play: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.sight = (this.application.current.paths[3] == 'sight-spell');
            this.it.word = this.it.words[this.index];
            this.application.render(this.it);
        } else {
            this.application.go("student/position",this.it.student.id);
        }
    },
    spell: function(item,sound) {
        this.audio(item,sound);
        $("#spell").focus();
    },
    check: function() {
        if ($('#spell').val().toLowerCase() == this.it.word.toLowerCase()) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-attain').show();
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-yield').show();
        }
        $('.hw-progress').hide();
    }
});

Learning.template("Spell",Learning.load("game/spell"),null,Learning.partials);

Learning.route("game/sight-spell","/student/{student_id:^\\d+$}/game/sight-spell/","Spell","Spell","choose");
Learning.route("game/sound-spell","/student/{student_id:^\\d+$}/game/sound-spell/","Spell","Spell","choose");