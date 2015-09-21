
var hundoword_django_host = window.location.protocol + "//" + window.location.hostname;
var hundoword_django_prefix = "api-js-test"

function make_user(username) {

    return hundoword_django_prefix + "-" + username

}

function make_achievement(achievement) {

    return hundoword_django_prefix + "-" + achievement

}

function make_program(program) {

    return hundoword_django_prefix + "-" + program

}

function check_user(api,username,password,email) {

    try {
        
        api.login(make_user(username),password);

    } catch (exception) {

        api.register(make_user(username),password,email);
        api.login(make_user(username),password);

    }

}

function delete_users() {

    var html;
    var token;

    html = $.ajax({url: hundoword_django_host + "/admin/",async: false}).responseText;

    if ($(html).find("a[href='/admin/logout/']").attr('href')) {

        $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});
        var html = $.ajax({url: hundoword_django_host + "/admin/",async: false}).responseText;

    }

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');

    if (!token) { throw "Couldn't get initial token"; }

    var action = $(html).find("form").attr('action');

    if (!action) { throw "Couldn't get initial action"; }

    var html = $.ajax({
        type: "POST",
        url: hundoword_django_host + action,
        data: {
            "csrfmiddlewaretoken": token,
            "username": "vagrant",
            "password": "vagrant",
            "next": "/admin/auth/user/?q=" + make_user("")
        },
        async: false
    }).responseText;

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');
    if (!token) { throw "Couldn't get search token"; }

    $(html).find("input[name='_selected_action']").each(function() {

        var user_id = $(this).attr('value');

        if (!user_id) { throw "Couldn't get search user_id"; }

        var html = $.ajax({
            type: "POST",
            dataType : "html",
            url: hundoword_django_host + "/admin/auth/user/" + user_id + "/delete/",
            data: {
                "post": "yes",
                "csrfmiddlewaretoken": token
            },
            async: false
        }).responseText;

        var success = $(html).find("li.success").html();

        if (!((success.indexOf('The user "' + make_user("")) == 0) && (success.indexOf('" was deleted successfully.') > 0))) {
            throw "Delete unsuccessful"; 
        }

    });

    $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});

}

function delete_achievements() {

    var html;
    var token;

    html = $.ajax({url: hundoword_django_host + "/admin/",async: false}).responseText;

    if ($(html).find("a[href='/admin/logout/']").attr('href')) {

        $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});
        var html = $.ajax({url: hundoword_django_host + "/admin/",async: false}).responseText;

    }

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');

    if (!token) { throw "Couldn't get initial token"; }

    var action = $(html).find("form").attr('action');

    if (!action) { throw "Couldn't get initial action"; }

    var html = $.ajax({
        type: "POST",
        url: hundoword_django_host + action,
        data: {
            "csrfmiddlewaretoken": token,
            "username": "vagrant",
            "password": "vagrant",
            "next": "/admin/learning/achievement/?q=" + make_achievement("")
        },
        async: false
    }).responseText;

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');
    if (!token) { throw "Couldn't get search token"; }

    $(html).find("input[name='_selected_action']").each(function() {

        var achievement_id = $(this).attr('value');

        if (!achievement_id) { throw "Couldn't get search achievement_id"; }

        var html = $.ajax({
            type: "POST",
            dataType : "html",
            url: hundoword_django_host + "/admin/learning/achievement/" + achievement_id + "/delete/",
            data: {
                "post": "yes",
                "csrfmiddlewaretoken": token
            },
            async: false
        }).responseText;

        var success = $(html).find("li.success").html();

        if (!((success.indexOf('The achievement "' + make_achievement("")) == 0) && (success.indexOf('" was deleted successfully.') > 0))) {
            throw "Delete unsuccessful"; 
        }

    });

    $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});

}

function delete_programs() {

    var html;
    var token;

    html = $.ajax({url: hundoword_django_host + "/admin/",async: false}).responseText;

    if ($(html).find("a[href='/admin/logout/']").attr('href')) {

        $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});
        var html = $.ajax({url: hundoword_django_host + "/admin/",async: false}).responseText;

    }

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');

    if (!token) { throw "Couldn't get initial token"; }

    var action = $(html).find("form").attr('action');

    if (!action) { throw "Couldn't get initial action"; }

    var html = $.ajax({
        type: "POST",
        url: hundoword_django_host + action,
        data: {
            "csrfmiddlewaretoken": token,
            "username": "vagrant",
            "password": "vagrant",
            "next": "/admin/learning/program/?q=" + make_program("")
        },
        async: false
    }).responseText;

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');
    if (!token) { throw "Couldn't get search token"; }

    $(html).find("input[name='_selected_action']").each(function() {

        var program_id = $(this).attr('value');

        if (!program_id) { throw "Couldn't get search program_id"; }

        var html = $.ajax({
            type: "POST",
            dataType : "html",
            url: hundoword_django_host + "/admin/learning/program/" + program_id + "/delete/",
            data: {
                "post": "yes",
                "csrfmiddlewaretoken": token
            },
            async: false
        }).responseText;

        var success = $(html).find("li.success").html();

        if (!((success.indexOf('The program "' + make_program("")) == 0) && (success.indexOf('" was deleted successfully.') > 0))) {
            throw "Delete unsuccessful"; 
        }

    });

    $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});

}

QUnit.module("HundoWord");

QUnit.module("HundoWord.API", {

    setup: function() {
        delete_users();
    },

    teardown: function() {
        delete_users();
    }

});

QUnit.test("constructor", function(assert) {

    var api = new HundoWord.API("learning");

    assert.equal(api.url,"learning");

});

QUnit.test("headers", function(assert) {

    var api = new HundoWord.API("learning.com");
    api.token = "funspot"

    assert.deepEqual(api.headers(),{authorization: "Token funspot"});

});

QUnit.test("build_url", function(assert) {

    var api = new HundoWord.API("learning.com");

    assert.equal(api.build_url("stuff"),"learning.com/stuff/");
    assert.equal(api.build_url("stuff",1),"learning.com/stuff/1/");
    assert.equal(api.build_url("stuff",1,"do"),"learning.com/stuff/1/do/");

});


QUnit.test("register", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");

    try {

        api.register("good","bad","ugly");
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/register/ failed");
        assert.deepEqual(exception.json,{email: ["Enter a valid email address."]});

    }

    var fail = assert.async();
    api.register("good","bad","ugly",
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.deepEqual(response.responseJSON,{email: ["Enter a valid email address."]});
        },
        function () {
            fail();
        }
    );

});

QUnit.test("login", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");

    try {

        api.login("good","bad");
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/token/ failed");
        assert.deepEqual(exception.json,{non_field_errors: ["Unable to log in with provided credentials."]});

    }

    var fail = assert.async();
    api.login("good","bad",
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.deepEqual(response.responseJSON,{non_field_errors: ["Unable to log in with provided credentials."]});
        },
        function () {
            fail();
        }
    );

    api.register(make_user("tester0"),"tester0","tester0@hundoword.com");
    var pass = assert.async();
    api.login(make_user("tester0"),"tester0",
        function (data) {
            assert.equal(api.token,data.token);
        },
        function () {
            assert.ok(false);
        },
        function () {
            pass();
        }
    );

});

QUnit.module("HundoWord.Base", {

    setup: function() {
        delete_users();
    },

    teardown: function() {
        delete_users();
    }

});

QUnit.test("failures", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");
    var entity = new HundoWord.Base(api,"stuff");

    assert.equal(entity.build_url(),"http://192.168.72.87/api/stuff/");
    assert.equal(entity.build_url(1),"http://192.168.72.87/api/stuff/1/");
    assert.equal(entity.build_url(1,"do"),"http://192.168.72.87/api/stuff/1/do/");

    // Check all failures with exceptions

    try {

        entity.list();
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"GET: http://192.168.72.87/api/stuff/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.select(0);
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"GET: http://192.168.72.87/api/stuff/0/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.create({});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/stuff/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.update(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/stuff/0/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.delete(0);
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"DELETE: http://192.168.72.87/api/stuff/0/ failed");
        assert.deepEqual(exception.json,{});

    }

    // Check all failures with callback

    var list_fail = assert.async();
    entity.list(
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            list_fail();
        }
    );

    var select_fail = assert.async();
    entity.select(0,
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            select_fail();
        }
    );

    var create_fail = assert.async();
    entity.create({},
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            create_fail();
        }
    );

    var update_fail = assert.async();
    entity.update(0,{},
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            update_fail();
        }
    );

    var delete_fail = assert.async();
    entity.delete(0,
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            delete_fail();
        }
    );

});

QUnit.module("HundoWord.Words", {

    setup: function() {
        delete_users();
    },

    teardown: function() {
        delete_users();
    }

});

QUnit.test("failures", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");
    var entity = new HundoWord.Words(api,"stuff");

    // Check all failures with exceptions

    try {

        entity.append(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/stuff/0/append/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.remove(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/stuff/0/remove/ failed");
        assert.deepEqual(exception.json,{});

    }

    // Check all failures with callback

    var append_fail = assert.async();
    entity.append(0,{},
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            append_fail();
        }
    );

    var remove_fail = assert.async();
    entity.remove(0,{},
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            remove_fail();
        }
    );

});

QUnit.module("HundoWord.Achievement", {

    setup: function() {
        delete_users();
        delete_achievements();
    },

    teardown: function() {
        delete_users();
        delete_achievements();
    }

});

QUnit.test("create", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({name: make_achievement("Sight"), description: "See it"});
    assert.equal(sight.name,make_achievement("Sight"));
    assert.equal(sight.description,"See it");

    var pass = assert.async();
    api.achievement.create({name: make_achievement("Sound"), description: "Hear it"},
        function (data) {
            assert.equal(data.name,make_achievement("Sound"));
            assert.equal(data.description,"Hear it");
            pass();
        }
    );

});

QUnit.test("select", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({name: make_achievement("Sight"), description: "See it"});

    assert.deepEqual(
        api.achievement.select(sight.id),
        {
            id: sight.id,
            name: make_achievement("Sight"),
            description: "See it"
        }
    );

    var pass = assert.async();
    api.achievement.select(sight.id,
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_achievement("Sight"),
                    description: "See it"
                }
            );
            pass();
        }
    );

});

QUnit.test("list", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({name: make_achievement("Sight"), description: "See it"});
    var sound = api.achievement.create({name: make_achievement("Sound"),description: "Hear it"});

    assert.deepEqual(
        api.achievement.list(),
        [
            {
                id: sight.id,
                name: make_achievement("Sight"),
                description: "See it"
            },
            {
                id: sound.id,
                name: make_achievement("Sound"),
                description: "Hear it"
            }
        ]
    );

    var pass = assert.async();
    api.achievement.list(
        function (data) {
            assert.deepEqual(
                data,
                [
                    {
                        id: sight.id,
                        name: make_achievement("Sight"),
                        description: "See it"
                    },
                    {
                        id: sound.id,
                        name: make_achievement("Sound"),
                        description: "Hear it"
                    }
                ]
            );
            pass();
        }
    );

});

QUnit.test("update", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({name: make_achievement("Sight"), description: "See it"});

    assert.deepEqual(
        api.achievement.update(sight.id,{description: "View it"}),
        {
            id: sight.id,
            name: make_achievement("Sight"),
            description: "View it"
        }
    );

    assert.deepEqual(
        api.achievement.select(sight.id),
        {
            id: sight.id,
            name: make_achievement("Sight"),
            description: "View it"
        }
    );

    var pass = assert.async();
    api.achievement.update(sight.id,{description: "See it"},
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_achievement("Sight"),
                    description: "See it"
                }
            );
            pass();
        }
    );

});

QUnit.test("delete", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({name: make_achievement("Sight"), description: "See it"});
    var sound = api.achievement.create({name: make_achievement("Sound"),description: "Hear it"});

    assert.deepEqual(api.achievement.delete(sight.id),{});

    assert.deepEqual(
        api.achievement.list(),
        [
            {
                id: sound.id,
                name: make_achievement("Sound"),
                description: "Hear it"
            }
        ]
    );

    var pass = assert.async();
    api.achievement.delete(sound.id,
        function (data) {
            assert.deepEqual(data,{});
            pass();
        }
    );

});

QUnit.module("HundoWord.Program", {

    setup: function() {
        delete_users();
        delete_programs();
    },

    teardown: function() {
        delete_users();
        delete_programs();
    }

});

QUnit.test("create", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.program.create({name: make_program("Fundamentals"), description: "Fun time",words:["fun","time"]});
    assert.equal(sight.name,make_program("Fundamentals"));
    assert.equal(sight.description,"Fun time");
    assert.deepEqual(sight.words,["fun","time"]);

    var pass = assert.async();
    api.program.create({name: make_program("Basics"), description: "Base time",words: ["base","time"]},
        function (data) {
            assert.equal(data.name,make_program("Basics"));
            assert.equal(data.description,"Base time");
            assert.deepEqual(data.words,["base","time"]);
            pass();
        }
    );

});

QUnit.test("select", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.program.create({name: make_program("Fundamentals"), description: "Fun time",words:["fun","time"]});

    assert.deepEqual(
        api.program.select(sight.id),
        {
            id: sight.id,
            name: make_program("Fundamentals"),
            description: "Fun time",
            words: ["fun","time"]
        }
    );

    var pass = assert.async();
    api.program.select(sight.id,
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_program("Fundamentals"),
                    description: "Fun time",
                    words: ["fun","time"]
                }
            );
            pass();
        }
    );

});

QUnit.test("list", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.program.create({name: make_program("Fundamentals"), description: "Fun time",words:["fun","time"]});
    var sound = api.program.create({name: make_program("Basics"), description: "Base time",words: ["base","time"]});

    assert.deepEqual(
        api.program.list(),
        [
            {
                id: sound.id,
                name: make_program("Basics"),
                description: "Base time",
                words: ["base","time"]
            },
            {
                id: sight.id,
                name: make_program("Fundamentals"),
                description: "Fun time",
                words: ["fun","time"]
            }
        ]
    );

    var pass = assert.async();
    api.program.list(
        function (data) {
            assert.deepEqual(
                data,
                [
                    {
                        id: sound.id,
                        name: make_program("Basics"),
                        description: "Base time",
                        words: ["base","time"]
                    },
                    {
                        id: sight.id,
                        name: make_program("Fundamentals"),
                        description: "Fun time",
                        words: ["fun","time"]
                    }
                ]
            );
            pass();
        }
    );

});

QUnit.test("update", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.program.create({name: make_program("Fundamentals"), description: "Fun time",words:["fun","time"]});

    assert.deepEqual(
        api.program.update(sight.id,{description: "Happy time"}),
        {
            id: sight.id,
            name: make_program("Fundamentals"),
            description: "Happy time",
            words: ["fun","time"]
        }
    );

    assert.deepEqual(
        api.program.select(sight.id),
        {
            id: sight.id,
            name: make_program("Fundamentals"),
            description: "Happy time",
            words: ["fun","time"]
        }
    );

    var pass = assert.async();
    api.program.update(sight.id,{description: "Fun time"},
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_program("Fundamentals"),
                    description: "Fun time",
                    words: ["fun","time"]
                }
            );
            pass();
        }
    );

});

QUnit.test("append", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.program.create({name: make_program("Fundamentals"), description: "Fun time",words:["fun","time"]});

    assert.deepEqual(
        api.program.append(sight.id,["dee","lite"]),
        {
            id: sight.id,
            name: make_program("Fundamentals"),
            description: "Fun time",
            words: ["dee","fun","lite","time"]
        }
    );

    assert.deepEqual(
        api.program.select(sight.id),
        {
            id: sight.id,
            name: make_program("Fundamentals"),
            description: "Fun time",
            words: ["dee","fun","lite","time"]
        }
    );

    var pass = assert.async();
    api.program.append(sight.id,["groove"],
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_program("Fundamentals"),
                    description: "Fun time",
                    words: ["dee","fun","groove","lite","time"]
                }
            );
            pass();
        }
    );

});

QUnit.test("remove", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.program.create({name: make_program("Fundamentals"), description: "Fun time",words:["dee","fun","groove","lite","time"]});

    assert.deepEqual(
        api.program.remove(sight.id,["dee","lite"]),
        {
            id: sight.id,
            name: make_program("Fundamentals"),
            description: "Fun time",
            words: ["fun","groove","time"]
        }
    );

    assert.deepEqual(
        api.program.select(sight.id),
        {
            id: sight.id,
            name: make_program("Fundamentals"),
            description: "Fun time",
            words: ["fun","groove","time"]
        }
    );

    var pass = assert.async();
    api.program.remove(sight.id,["groove"],
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_program("Fundamentals"),
                    description: "Fun time",
                    words: ["fun","time"]
                }
            );
            pass();
        }
    );

});

QUnit.test("delete", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.program.create({name: make_program("Fundamentals"), description: "Fun time",words:["fun","time"]});
    var sound = api.program.create({name: make_program("Basics"), description: "Base time",words: ["base","time"]});

    assert.deepEqual(api.program.delete(sight.id),{});

    assert.deepEqual(
        api.program.list(),
        [
            {
                id: sound.id,
                name: make_program("Basics"),
                description: "Base time",
                words: ["base","time"]
            }
        ]
    );

    var pass = assert.async();
    api.program.delete(sound.id,
        function (data) {
            assert.deepEqual(data,{});
            pass();
        }
    );

});
