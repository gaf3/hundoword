Learning.controller("Lesson","Changeable",{
    list: function() {
        this.it = {lessons: hwAPI.lesson.list()};
        this.application.render(this.it);
    },
    select: function() {
        this.it = {lesson: hwAPI.lesson.select(this.application.current.path.lesson_id)};
        this.application.render(this.it);
    },    
    new: function() {
        this.it = {lesson: {}};
        this.application.render(this.it);
        this.changing();
    },
    edit: function() {
        this.changing();
    },
    save: function() {
        var lesson_id = $("#lesson_id").val();
        var lesson = {
            name: $("#name").val(), 
            description: $("#description").val(),
            words: this.application.words_array($("#words").val())
        };
        if (lesson_id) {
            this.it = {lesson: hwAPI.lesson.update(lesson_id,lesson)};
        } else {
            this.it = {lesson: hwAPI.lesson.create(lesson)};
        }
        this.application.render(this.it);
    },
    cancel: function() {
        var lesson_id = $("#lesson_id").val();
        if (lesson_id) {
            this.selecting();
        } else {
            this.application.go('lesson');
        }
    },
    delete: function() {
        if (confirm("Are you sure?") == true) {
            hwAPI.lesson.delete(this.application.current.path.lesson_id);
            this.application.go('lesson');
        }
    }
});

Learning.template("Lessons",Learning.load("lesson/list"),null,Learning.partials);
Learning.template("Lesson",Learning.load("lesson/item"),null,Learning.partials);

Learning.route("lesson","/lesson/","Lessons","Lesson","list");
Learning.route("lesson/select","/lesson/{lesson_id:^\\d+$}","Lesson","Lesson","select");
Learning.route("lesson/new","/lesson/new/","Lesson","Lesson","new");

