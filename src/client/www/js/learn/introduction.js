Learning.controller("Introduction","Learn",{
    sight: true,
    next: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.it.word = this.it.words[this.index];
            this.it.played = false;
            this.application.render(this.it);
        } else {
            this.finish();
        }
    },
    introduce: function(item,sound) {
        this.audio(item,sound);
        this.it.played = true;
    },
    check: function() {
        if (this.it.played) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
        }
        if (this.assessing) {
            this.next();
        } else {
            if (this.it.played) {
                $('.hw-attain').show();
            } else {
                $('.hw-yield').show();
            }
            $('.hw-progress').hide();
        }
    }
});

Learning.template("Introduction",Learning.load("learn/introduction"),null,Learning.partials);

Learning.route("play/introduction","/student/{student_id:^\\d+$}/play/introduction/","Introduction","Introduction","words");

Learning.route("assess/introduction","/student/{student_id:^\\d+$}/assess/introduction/","Introduction","Introduction","choose");
