Learning.controller("Introduction","Game",{
    play: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.it.word = this.it.words[this.index];
            this.it.audio = this.audio(this.it.word);
            this.application.render(this.it);
        } else {
            this.application.go("student/position",this.it.student.id);
        }
    },
    check: function() {
        if ($('#sound').attr('played')) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-attain').show();
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-yield').show();
        }
        $('.hw-progress').hide();
    },
});

Learning.template("Introduction",Learning.load("game/introduction"),null,Learning.partials);

Learning.route("game/introduction","/student/{student_id:^\\d+$}/game/introduction/","Introduction","Introduction","words");