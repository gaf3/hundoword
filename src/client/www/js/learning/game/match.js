Learning.controller("Match","Game",{
    play: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.sight = (this.application.current.paths[3] == 'sight-match');
            this.it.word = this.it.words[this.index];
            this.it.choices = [];
            while (this.it.choices.length < 6) {
                var choice = this.it.student.words[Math.floor(Math.random() * this.it.student.words.length)];
                if (choice != this.it.word) {
                    this.it.choices.push(choice);
                }
            }
            this.it.choices[Math.floor(Math.random() * 6)] = this.it.word
            this.application.render(this.it);
        } else {
            this.finish();
        }
    },
    match: function(item) {
        $('#choices li').removeClass('uk-active'); 
        $(item).addClass('uk-active');
    },
    check: function() {
        $('#choices li').attr('OnClick','');
        if ($('#choices li.uk-active').attr('word') == this.it.word) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-attain').show();
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-yield').show();
        }
        $('.hw-progress').hide();
    }
});

Learning.template("Match",Learning.load("game/match"),null,Learning.partials);

Learning.route("game/sight-match","/student/{student_id:^\\d+$}/game/sight-match/","Match","Match","choose");
Learning.route("game/sound-match","/student/{student_id:^\\d+$}/game/sound-match/","Match","Match","choose");

Learning.route("self/sight-match","/student/{student_id:^\\d+$}/self/sight-match/","Match","Match","self");
Learning.route("self/sound-match","/student/{student_id:^\\d+$}/self/sound-match/","Match","Match","self");