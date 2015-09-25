Learning.controller("Achievement","Changeable",{
    list: function() {
        this.it = {achievements: hwAPI.achievement.list()};
        this.application.render(this.it);
    },
    select: function() {
        this.it = {achievement: hwAPI.achievement.select(this.application.current.path.achievement_id)};
        this.application.render(this.it);
    },    
    new: function() {
        this.it = {achievement: {}};
        this.application.render(this.it);
        this.changing();
    },
    edit: function() {
        this.changing();
    },
    save: function() {
        var achievement_id = $("#achievement_id").val();
        var achievement = {
            name: $("#name").val(), 
            description: $("#description").val(),
            words: this.words_array($("#words").val())
        };
        if (achievement_id) {
            this.it = {achievement: hwAPI.achievement.update(achievement_id,achievement)};
        } else {
            this.it = {achievement: hwAPI.achievement.create(achievement)};
        }
        this.application.render(this.it);
    },
    cancel: function() {
        var achievement_id = $("#achievement_id").val();
        if (achievement_id) {
            this.selecting();
        } else {
            this.application.go('achievement');
        }
    },
    delete: function() {
        if (confirm("Are you sure?") == true) {
            hwAPI.achievement.delete(this.application.current.path.achievement_id);
            this.application.go('achievement');
        }
    }
});

Learning.template("Achievements",Learning.load("achievements"),null,Learning.partials);
Learning.template("Achievement",Learning.load("achievement"),null,Learning.partials);

Learning.route("achievement","/achievement/","Achievements","Achievement","list");
Learning.route("achievement/select","/achievement/{achievement_id:^\\d+$}","Achievement","Achievement","select");
Learning.route("achievement/new","/achievement/new/","Achievement","Achievement","new");

