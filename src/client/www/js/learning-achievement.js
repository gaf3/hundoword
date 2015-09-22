Learning.controller("Achievement","Changeable",{
    list: function() {
        achievements: hwAPI.achievement.list($.proxy(this.listed,this));
    },
    listed: function(achievements) {
        this.it = {achievements: achievements};
        this.application.render(this.it);
    },
    select: function() {
        hwAPI.achievement.select(this.application.current.path.achievement_id,$.proxy(this.selected,this));
    },
    selected: function(achievement) {
        this.it = {achievement: achievement};
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
            description: $("#description").val()
        };
        if (achievement_id) {
            hwAPI.achievement.update(achievement_id,achievement,$.proxy(this.updated,this));
        } else {
            hwAPI.achievement.create(achievement,$.proxy(this.created,this));
        }
    },
    updated: function(achievement) {
        this.it = {achievement: achievement};
        this.application.render(this.it);
    }, 
    created: function(achievement) {
        this.application.go('achievement/select',achievement.id);
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
            hwAPI.achievement.delete(this.application.current.path.achievement_id,$.proxy(this.deleted,this));
        }
    },
    deleted: function() {
        this.application.go('achievement');
    }
});

Learning.template("Achievements",Learning.load("achievements"),null,Learning.partials);
Learning.template("Achievement",Learning.load("achievement"),null,Learning.partials);

Learning.route("achievement","/achievement/","Achievements","Achievement","list");
Learning.route("achievement/select","/achievement/{achievement_id:^\\d+$}","Achievement","Achievement","select");
Learning.route("achievement/new","/achievement/new/","Achievement","Achievement","new");

