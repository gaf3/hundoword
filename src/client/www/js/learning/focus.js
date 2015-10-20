Learning.controller("Focus","Changeable",{
    list: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id)
        };
        this.application.render(this.it);
    },
    toggle: function(item) {
        if ($(item).hasClass("uk-active")) {
            $(item).removeClass("uk-active");
            hwAPI.student.blur(this.it.student.id,[$(item).attr('word')]);
        } else {
            $(item).addClass("uk-active");
            hwAPI.student.focus(this.it.student.id,[$(item).attr('word')]);
        }
    },
    select: function() {
        var words = this.application.words_array($("#select").val());
        for (var word = 0; word < words.length; word++) {
            $("#words li[word=" + words[word] + "]").addClass("uk-active");
        }
        hwAPI.student.focus(this.it.student.id,words);
        $("#select").val('');
    },
    all: function() {
        var words = $("#words li:not(.uk-active)").map(function(){return $(this).attr("word");}).get();
        $("#words li:not(.uk-active)").addClass("uk-active");
        hwAPI.student.focus(this.it.student.id,words);
    },
    clear: function() {
        var words = $("#words li.uk-active").map(function(){return $(this).attr("word");}).get();
        $("#words li.uk-active").removeClass("uk-active");
        hwAPI.student.blur(this.it.student.id,words);
    }
});

Learning.template("Focus",Learning.load("student/focus"),null,Learning.partials);

Learning.route("student/focus","/student/{student_id:^\\d+$}/focus/","Focus","Focus","list");

