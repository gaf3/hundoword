Learning.controller("Plan","Changeable",{
    list: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            learned: hwAPI.student.learned(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list()
        };
        this.application.render(this.it);
    },
    save: function() {
        var focus = $("#focus").val();
        if (isNaN(focus) || focus % 1 != 0 || focus < 1) {
            this.save();
        }
        var plan = {
            focus: parseInt(focus),
            required: $("#required input:checked").map(function(){return parseInt($(this).attr("achievement"));}).get(),
            forgo: $("#forgo input:checked").map(function(){return parseInt($(this).attr("achievement"));}).get()
        };
        hwAPI.student.update(this.it.student.id,{plan: plan});
    },
    required: function(event) {
        if ($(event.target).prop("checked")) {
            var achievement = $(event.target).attr("achievement")
            $("#forgo input[achievement=" + achievement + "]").prop("checked",false)
        }
        this.save();
    },
    forgo: function(event) {
        if ($(event.target).prop("checked")) {
            var achievement = $(event.target).attr("achievement")
            $("#required input[achievement=" + achievement + "]").prop("checked",false)
        }
        this.save();
    },
    evaluate: function() {
        hwAPI.student.evaluate(this.it.student.id);
        this.list();
    }
});

Learning.template("Plan",Learning.load("student/plan"),null,Learning.partials);

Learning.route("student/plan","/student/{student_id:^\\d+$}/plan/","Plan","Plan","list");

