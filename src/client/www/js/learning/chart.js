Learning.controller("Chart","Changeable",{
    list: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list(),
            achievement_names: {}
        };
        for (var achievement = 0; achievement < this.it.achievements.length; achievement++) {
            this.it.achievement_names[this.it.achievements[achievement].id] = this.it.achievements[achievement].name;
        }
        var by = null;
        if (this.application.current.query.by) {
            by = this.application.current.query.by;
        }        
        var focus = null;
        if (this.application.current.query.focus) {
            focus = this.application.current.query.focus.toLowerCase() == 'true';
        }
        var words = null;
        if (this.application.current.query.words) {
            words = this.application.words_array(this.application.current.query.words);
        }
        var achievements = null;
        if (this.application.current.query.achievements) {
            achievements = this.application.words_array(this.application.current.query.achievements);
        }
        var from = null;
        if (this.application.current.query.from) {
            from = this.application.current.query.from;
        }
        var to = null;
        if (this.application.current.query.to) {
            to = this.application.current.query.to;
        }
        this.application.render(this.it);
        $("#chart").css('width','100%');
        $("#chart").css('height','100%');
        $("#chart")[0].width  = $("#chart")[0].offsetWidth;
        $("#chart")[0].height = $("#chart")[0].offsetHeight;
        var chart = hwAPI.student.chart(this.application.current.path.student_id,by,focus,words,achievements,from,to);
        var context = $("#chart")[0].getContext("2d");
        var data = {
            labels: chart.times,
            datasets: []
        }
        var achievement_sets = {};
        for (var achievement = 0; achievement < this.it.achievements.length; achievement++) {
            if (!(this.it.achievements[achievement].id in chart.data[chart.times[0]])) {
                continue;
            }
            achievement_sets[this.it.achievements[achievement].id] = data.datasets.length;
            data.datasets.push({
                label: this.it.achievements[achievement].name,
                strokeColor: this.it.achievements[achievement].color,
                pointColor: this.it.achievements[achievement].color,
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: this.it.achievements[achievement].color,
                data: []
            });
        }
        for (var time = 0; time < chart.times.length; time++) {
            for (var achievement_id in chart.data[chart.times[time]]) {
                if (!chart.data[chart.times[time]].hasOwnProperty(achievement_id)) {
                    continue;
                }
                data.datasets[achievement_sets[achievement_id]].data.push(chart.data[chart.times[time]][achievement_id]);
            }
        }
        new Chart(context).Line(data,{datasetFill: false});
    },
    toggle: function(achievement) {
        if ($(achievement).hasClass("uk-active")) {
            $(achievement).removeClass("uk-active");
        } else {
            $(achievement).addClass("uk-active");
        }
        this.search();
    },
    search: function() {
        var parameters = {};
        parameters["by"] = $("#by option:selected").val();
        if ($("#focus").prop("checked")) {
            parameters["focus"] = "true";
        }
        var words = $("#words").val();
        if (words.length) {
            parameters["words"] = this.application.words_array(words).join(",");
        }
        var achievements = $("#achievements li.uk-active").map(function(){return $(this).attr("achievement-id");}).get();;
        if (achievements.length) {
            parameters["achievements"] = achievements.join(",");
        }
        var from = $("#from").val();
        if (from) {
            parameters["from"] = from;
        }
        var to = $("#to").val();
        if (to) {
            parameters["to"] = to;
        }
        if ($.isEmptyObject(parameters)) {
            this.application.go('student/chart',this.application.current.path.student_id);
        } else {
            this.application.go('student/chart',this.application.current.path.student_id,parameters);
        }
    }
});

Learning.template("Chart",Learning.load("student/chart"),null,Learning.partials);

Learning.route("student/chart","/student/{student_id:^\\d+$}/chart/","Chart","Chart","list");

