Learning.controller("Spell","Learn",{
    next: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.sight = (this.application.current.paths[3] == 'sight-spell');
            this.it.word = this.it.words[this.index];
            this.application.render(this.it);
        } else {
            this.finish();
        }
    },
    spell: function(item,sound) {
        this.audio(item,sound);
        $("#spell").focus();
    },
    check: function() {
        if ($('#spell').val().toLowerCase() == this.it.word.toLowerCase()) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
        }
        if (this.assessing) {
            this.next();
        } else {
            if ($('#spell').val().toLowerCase() == this.it.word.toLowerCase()) {
                $('.hw-attain').show();
            } else {
                $('.hw-yield').show();
            }
            $('.hw-progress').hide();
        }

    }
});

Learning.template("Spell",Learning.load("learn/spell"),null,Learning.partials);

Learning.route("play/sight-spell","/student/{student_id:^\\d+$}/play/sight-spell/","Spell","Spell","words");
Learning.route("play/sound-spell","/student/{student_id:^\\d+$}/play/sound-spell/","Spell","Spell","words");

Learning.route("assess/sight-spell","/student/{student_id:^\\d+$}/assess/sight-spell/","Spell","Spell","choose");
Learning.route("assess/sound-spell","/student/{student_id:^\\d+$}/assess/sound-spell/","Spell","Spell","choose");