Learning.controller("Play",null,{
    clear: function() {
        clearTimeout(this.application.timeout);
    },
    playable: function() {
        this.it = {codes: hwAPI.run(null,"playable")};
        this.application.render(this.it);
        this.clear();
        this.application.timeout = setTimeout($.proxy(this.playable,this),30000);
    },
    create: function(code_id) {
        hwAPI.run(null,null,{"code_id": code_id});
        this.application.go('play/current');
    },
    joinable: function() {
        this.it = {runs: hwAPI.run(null,"joinable")};
        this.application.render(this.it);
        this.clear();
        this.application.timeout = setTimeout($.proxy(this.joinable,this),5000);
    },
    join: function(run_id) {
        hwAPI.run(run_id,"join");
        this.application.go('play/current');
    },
    current: function() {
        this.it = {runs: hwAPI.run(null,"current")};
        this.application.render(this.it);
        this.clear();
        this.application.timeout = setTimeout($.proxy(this.current,this),5000);
    },
    leave: function(run_id) {
        hwAPI.run(run_id,"leave");
        this.application.go('play/join');
    },
    public: function(run_id) {
        hwAPI.run(run_id,"public");
        this.application.refresh();
    },
    private: function(run_id) {
        hwAPI.run(run_id,"private");
        this.application.refresh();
    },
    start: function(run_id) {
        hwAPI.run(run_id,"start");
        this.application.refresh();
    },
    play: function(run_id) {
        alert('Coming soon!');
    },
    watchable: function() {
        this.it = {runs: hwAPI.run(null,"watchable")};
        this.application.render(this.it);
        this.clear();
        this.application.timeout = setTimeout($.proxy(this.watchable,this),5000);
    },
    watch: function(run_id) {
        alert('Coming soon!');
    },
    history: function() {
        this.it = {runs: hwAPI.run(null,"history")};
        this.application.render(this.it);
        this.clear();
        this.application.timeout = setTimeout($.proxy(this.history,this),30000);
    }
});

Learning.partial("PlayTabs",Learning.load("play/tabs"));

Learning.template("New",Learning.load("play/new"),null,Learning.partials);
Learning.template("Join",Learning.load("play/join"),null,Learning.partials);
Learning.template("Current",Learning.load("play/current"),null,Learning.partials);
Learning.template("Watch",Learning.load("play/watch"),null,Learning.partials);
Learning.template("History",Learning.load("play/history"),null,Learning.partials);

Learning.route("play","/play/",null,null,function() {this.application.go('play/join')});
Learning.route("play/new","/play/new/","New","Play","playable","clear");
Learning.route("play/join","/play/join/","Join","Play","joinable","clear");
Learning.route("play/current","/play/current/","Current","Play","current","clear");
Learning.route("play/watch","/play/watch/","Watch","Play","watchable","clear");
Learning.route("play/history","/play/history/","History","Play","history","clear");

