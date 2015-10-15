Learning.controller("Introduction","Game",{
    sight: true,
    play: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.it.word = this.it.words[this.index];
            this.it.played = false;
            this.application.render(this.it);
        } else {
            this.application.go("student/position",this.it.student.id);
        }
    },
    introduce: function(item,sound) {
        this.audio(item,sound);
        this.it.played = true;
    },
    check: function() {
        if (this.it.played) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-attain').show();
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-yield').show();
        }
        $('.hw-progress').hide();
    }
});

Learning.template("Introduction",Learning.load("game/introduction"),null,Learning.partials);

Learning.route("game/introduction","/student/{student_id:^\\d+$}/game/introduction/","Introduction","Introduction","words");