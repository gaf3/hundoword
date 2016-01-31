
var hundoword_django_host = window.location.protocol + "//" + window.location.hostname;
var hundoword_django_prefix = "api-js-test";

document.execCommand("ClearAuthenticationCache");

function make_user(username) {

    return hundoword_django_prefix + "-" + username

}

function make_achievement(achievement) {

    return hundoword_django_prefix + "-" + achievement

}

function make_lesson(lesson) {

    return hundoword_django_prefix + "-" + lesson

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

    $.ajax({url: hundoword_django_host + "/admin/logout/",async: false}).responseText;

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

function delete_lessons() {

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
            "next": "/admin/learning/lesson/?q=" + make_lesson("")
        },
        async: false
    }).responseText;

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');
    if (!token) { throw "Couldn't get search token"; }

    $(html).find("input[name='_selected_action']").each(function() {

        var lesson_id = $(this).attr('value');

        if (!lesson_id) { throw "Couldn't get search lesson_id"; }

        var html = $.ajax({
            type: "POST",
            dataType : "html",
            url: hundoword_django_host + "/admin/learning/lesson/" + lesson_id + "/delete/",
            data: {
                "post": "yes",
                "csrfmiddlewaretoken": token
            },
            async: false
        }).responseText;

        var success = $(html).find("li.success").html();

        if (!((success.indexOf('The lesson "' + make_lesson("")) == 0) && (success.indexOf('" was deleted successfully.') > 0))) {
            throw "Delete unsuccessful"; 
        }

    });

    $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});

}

function filter_achievements(achievements) {
    filtered = [];

    for (var achievement = 0; achievement < achievements.length; achievement++) {
        if (achievements[achievement].name.startsWith(make_achievement(""))) {
            filtered.push(achievements[achievement]);
        }
    }

    return filtered;
}

function filter_lessons(lessons) {
    filtered = [];

    for (var lesson = 0; lesson < lessons.length; lesson++) {
        if (lessons[lesson].name.startsWith(make_lesson(""))) {
            filtered.push(lessons[lesson]);
        }
    }

    return filtered;
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

    var api = new HundoWord.API("learning/");

    assert.equal(api.url,"learning/");

});

QUnit.test("headers", function(assert) {

    var api = new HundoWord.API("learning.com/");
    api.token = "funspot"

    assert.deepEqual(api.headers(),{authorization: "Token funspot"});

});

QUnit.test("build_url", function(assert) {

    var api = new HundoWord.API("learning.com/");

    assert.equal(api.build_url("stuff"),"learning.com/stuff/");
    assert.equal(api.build_url("stuff",1),"learning.com/stuff/1/");
    assert.equal(api.build_url("stuff",1,"do"),"learning.com/stuff/1/do/");
    assert.equal(api.build_url("stuff",1,"do",{people: "things"}),"learning.com/stuff/1/do/?people=things");

});


QUnit.test("register", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");

    try {

        api.register("good","bad","ugly");
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/v0/register/ failed");
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

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");

    try {

        api.login("good","bad");
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/v0/token/ failed");
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

QUnit.test("audio", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var audio = api.audio("cat");

    assert.ok("mp3" in audio);
    assert.ok("ogg" in audio);


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

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");
    var entity = new HundoWord.Base(api,"stuff");

    assert.equal(entity.build_url(),"http://192.168.72.87/api/v0/stuff/");
    assert.equal(entity.build_url(1),"http://192.168.72.87/api/v0/stuff/1/");
    assert.equal(entity.build_url(1,"do"),"http://192.168.72.87/api/v0/stuff/1/do/");
    assert.equal(entity.build_url(1,"do",{people: "things"}),"http://192.168.72.87/api/v0/stuff/1/do/?people=things");

    // Check all failures with exceptions

    try {

        entity.list();
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"GET: http://192.168.72.87/api/v0/stuff/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.select(0);
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"GET: http://192.168.72.87/api/v0/stuff/0/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.create({});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/v0/stuff/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.update(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/v0/stuff/0/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.delete(0);
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"DELETE: http://192.168.72.87/api/v0/stuff/0/ failed");
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

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");
    var entity = new HundoWord.Words(api,"stuff");

    // Check all failures with exceptions

    try {

        entity.append(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/v0/stuff/0/append/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.remove(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/v0/stuff/0/remove/ failed");
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

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100,
        color: "blue"
    });
    assert.equal(sight.name,make_achievement("Sight"));
    assert.equal(sight.description,"See it");
    assert.equal(sight.progression,100);
    assert.equal(sight.color,"blue");

    var pass = assert.async();
    api.achievement.create({
            name: make_achievement("Sound"), 
            slug: make_achievement("sound"), 
            description: "Hear it", 
            progression: 101,
            color: "green"
        },
        function (data) {
            assert.equal(data.name,make_achievement("Sound"));
            assert.equal(data.slug,make_achievement("sound"));
            assert.equal(data.description,"Hear it");
            assert.equal(data.progression,101);
            assert.equal(data.color,"green");
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("select", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100,
        color: "blue"
    });

    assert.deepEqual(
        api.achievement.select(sight.id),
        {
            id: sight.id,
            name: make_achievement("Sight"),
            slug: make_achievement("sight"),
            description: "See it",
            progression: 100,
            color: "blue"
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
                    slug: make_achievement("sight"),
                    description: "See it",
                    progression: 100,
                    color: "blue"
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("slug", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100,
        color: "blue"
    });

    assert.deepEqual(
        api.achievement.slug(make_achievement("sight")),
        {
            id: sight.id,
            name: make_achievement("Sight"),
            slug: make_achievement("sight"),
            description: "See it",
            progression: 100,
            color: "blue"
        }
    );

    var pass = assert.async();
    api.achievement.slug(make_achievement("sight"),
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_achievement("Sight"),
                    slug: make_achievement("sight"),
                    description: "See it",
                    progression: 100,
                    color: "blue"
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("list", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100,
        color: "blue"
    });
    var sound = api.achievement.create({
        name: make_achievement("Sound"), 
        slug: make_achievement("sound"), 
        description: "Hear it", 
        progression: 101,
        color: "green"
    });

    assert.deepEqual(
        filter_achievements(api.achievement.list()),
        [
            {
                id: sight.id,
                name: make_achievement("Sight"),
                slug: make_achievement("sight"),
                description: "See it",
                progression: 100,
                color: "blue"
            },
            {
                id: sound.id,
                name: make_achievement("Sound"),
                slug: make_achievement("sound"),
                description: "Hear it",
                progression: 101,
                color: "green"
            }
        ]
    );

    var pass = assert.async();
    api.achievement.list(
        function (data) {
            assert.deepEqual(
                filter_achievements(data),
                [
                    {
                        id: sight.id,
                        name: make_achievement("Sight"),
                        slug: make_achievement("sight"),
                        description: "See it",
                        progression: 100,
                        color: "blue"
                    },
                    {
                        id: sound.id,
                        name: make_achievement("Sound"),
                        slug: make_achievement("sound"),
                        description: "Hear it",
                        progression: 101,
                        color: "green"
                    }
                ]
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("update", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100,
        color: "blue"
    });

    assert.deepEqual(
        api.achievement.update(sight.id,{description: "View it"}),
        {
            id: sight.id,
            name: make_achievement("Sight"),
            slug: make_achievement("sight"),
            description: "View it",
            progression: 100,
            color: "blue"
        }
    );

    assert.deepEqual(
        api.achievement.select(sight.id),
        {
            id: sight.id,
            name: make_achievement("Sight"),
            slug: make_achievement("sight"),
            description: "View it",
            progression: 100,
            color: "blue"
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
                    slug: make_achievement("sight"),
                    description: "See it",
                    progression: 100,
                    color: "blue"
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("delete", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100,
        color: "blue"
    });
    var sound = api.achievement.create({
        name: make_achievement("Sound"), 
        slug: make_achievement("sound"), 
        description: "Hear it", 
        progression: 101,
        color: "green"
    });

    assert.deepEqual(api.achievement.delete(sight.id),{});

    assert.deepEqual(
        filter_achievements(api.achievement.list()),
        [
            {
                id: sound.id,
                name: make_achievement("Sound"),
                slug: make_achievement("sound"),
                description: "Hear it",
                progression: 101,
                color: "green"
            }
        ]
    );

    var pass = assert.async();
    api.achievement.delete(sound.id,
        function (data) {
            assert.deepEqual(data,{});
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.module("HundoWord.Lesson", {

    setup: function() {
        delete_users();
        delete_lessons();
    },

    teardown: function() {
        delete_users();
        delete_lessons();
    }

});

QUnit.test("create", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.lesson.create({name: make_lesson("Fundamentals"), description: "Fun time",words:["fun","time"]});
    assert.equal(sight.name,make_lesson("Fundamentals"));
    assert.equal(sight.description,"Fun time");
    assert.deepEqual(sight.words,["fun","time"]);

    var pass = assert.async();
    api.lesson.create({name: make_lesson("Basics"), description: "Base time",words: ["base","time"]},
        function (data) {
            assert.equal(data.name,make_lesson("Basics"));
            assert.equal(data.description,"Base time");
            assert.deepEqual(data.words,["base","time"]);
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("select", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.lesson.create({name: make_lesson("Fundamentals"), description: "Fun time",words:["fun","time"]});

    assert.deepEqual(
        api.lesson.select(sight.id),
        {
            id: sight.id,
            name: make_lesson("Fundamentals"),
            description: "Fun time",
            words: ["fun","time"]
        }
    );

    var pass = assert.async();
    api.lesson.select(sight.id,
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_lesson("Fundamentals"),
                    description: "Fun time",
                    words: ["fun","time"]
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("list", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.lesson.create({name: make_lesson("Fundamentals"), description: "Fun time",words:["fun","time"]});
    var sound = api.lesson.create({name: make_lesson("Basics"), description: "Base time",words: ["base","time"]});

    assert.deepEqual(
        filter_lessons(api.lesson.list()),
        [
            {
                id: sound.id,
                name: make_lesson("Basics"),
                description: "Base time",
                words: ["base","time"]
            },
            {
                id: sight.id,
                name: make_lesson("Fundamentals"),
                description: "Fun time",
                words: ["fun","time"]
            }
        ]
    );

    var pass = assert.async();
    api.lesson.list(
        function (data) {
            assert.deepEqual(
                filter_lessons(data),
                [
                    {
                        id: sound.id,
                        name: make_lesson("Basics"),
                        description: "Base time",
                        words: ["base","time"]
                    },
                    {
                        id: sight.id,
                        name: make_lesson("Fundamentals"),
                        description: "Fun time",
                        words: ["fun","time"]
                    }
                ]
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("update", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.lesson.create({name: make_lesson("Fundamentals"), description: "Fun time",words:["fun","time"]});

    assert.deepEqual(
        api.lesson.update(sight.id,{description: "Happy time"}),
        {
            id: sight.id,
            name: make_lesson("Fundamentals"),
            description: "Happy time",
            words: ["fun","time"]
        }
    );

    assert.deepEqual(
        api.lesson.select(sight.id),
        {
            id: sight.id,
            name: make_lesson("Fundamentals"),
            description: "Happy time",
            words: ["fun","time"]
        }
    );

    var pass = assert.async();
    api.lesson.update(sight.id,{description: "Fun time"},
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_lesson("Fundamentals"),
                    description: "Fun time",
                    words: ["fun","time"]
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("append", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.lesson.create({name: make_lesson("Fundamentals"), description: "Fun time",words:["fun","time"]});

    assert.deepEqual(
        api.lesson.append(sight.id,["dee","lite"]),
        {
            id: sight.id,
            name: make_lesson("Fundamentals"),
            description: "Fun time",
            words: ["fun","time","dee","lite"]
        }
    );

    assert.deepEqual(
        api.lesson.select(sight.id),
        {
            id: sight.id,
            name: make_lesson("Fundamentals"),
            description: "Fun time",
            words: ["fun","time","dee","lite"]
        }
    );

    var pass = assert.async();
    api.lesson.append(sight.id,["groove"],
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_lesson("Fundamentals"),
                    description: "Fun time",
                    words: ["fun","time","dee","lite","groove"]
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("remove", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.lesson.create({name: make_lesson("Fundamentals"), description: "Fun time",words:["dee","fun","groove","lite","time"]});

    assert.deepEqual(
        api.lesson.remove(sight.id,["dee","lite"]),
        {
            id: sight.id,
            name: make_lesson("Fundamentals"),
            description: "Fun time",
            words: ["fun","groove","time"]
        }
    );

    assert.deepEqual(
        api.lesson.select(sight.id),
        {
            id: sight.id,
            name: make_lesson("Fundamentals"),
            description: "Fun time",
            words: ["fun","groove","time"]
        }
    );

    var pass = assert.async();
    api.lesson.remove(sight.id,["groove"],
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sight.id,
                    name: make_lesson("Fundamentals"),
                    description: "Fun time",
                    words: ["fun","time"]
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("delete", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.lesson.create({name: make_lesson("Fundamentals"), description: "Fun time",words:["fun","time"]});
    var sound = api.lesson.create({name: make_lesson("Basics"), description: "Base time",words: ["base","time"]});

    assert.deepEqual(api.lesson.delete(sight.id),{});

    assert.deepEqual(
        filter_lessons(api.lesson.list()),
        [
            {
                id: sound.id,
                name: make_lesson("Basics"),
                description: "Base time",
                words: ["base","time"]
            }
        ]
    );

    var pass = assert.async();
    api.lesson.delete(sound.id,
        function (data) {
            assert.deepEqual(data,{});
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.module("HundoWord.Student", {

    setup: function() {
        delete_users();
        delete_achievements();
        delete_lessons();
    },

    teardown: function() {
        delete_users();
        delete_achievements();
        delete_lessons();
    }

});

QUnit.test("create", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"],plan:{focus: 1},focus:["fun"]});
    assert.equal(sane_jane.first_name,"Sane");
    assert.equal(sane_jane.last_name,"Jane");
    assert.deepEqual(sane_jane.words,["fun","time"]);
    assert.deepEqual(sane_jane.plan,{focus: 1});
    assert.deepEqual(sane_jane.focus,["fun"]);

    var pass = assert.async();
    api.student.create({first_name: "Silly", last_name: "Billy", words: ["base","time"],plan:{focus: 2},focus:["base","time"]},
        function (data) {
            assert.equal(data.first_name,"Silly");
            assert.equal(data.last_name,"Billy");
            assert.deepEqual(data.words,["base","time"]);
            assert.deepEqual(data.plan,{focus: 2});
            assert.deepEqual(data.focus,["base","time"]);
            assert.deepEqual(data.position,{});
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("select", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"],focus:["fun"]});

    assert.deepEqual(
        api.student.select(sane_jane.id),
        {
            id: sane_jane.id,
            first_name: "Sane",
            last_name: "Jane",
            words: ["fun","time"],
            plan: {},
            focus: ["fun"],
            position: {}
        }
    );

    var pass = assert.async();
    api.student.select(sane_jane.id,
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sane_jane.id,
                    first_name: "Sane",
                    last_name: "Jane",
                    words: ["fun","time"],
                    plan: {},
                    focus: ["fun"],
                    position: {}
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("list", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"],focus:["fun"]});
    var silly_billy = api.student.create({first_name: "Silly", last_name: "Billy", words: ["base","time"],focus:["base"]});

    assert.deepEqual(
        api.student.list(),
        [
            {
                id: silly_billy.id,
                first_name: "Silly", 
                last_name: "Billy",
                words: ["base","time"],
                plan: {},
                focus: ["base"],
                position: {}
            },
            {
                id: sane_jane.id,
                first_name: "Sane",
                last_name: "Jane",
                words: ["fun","time"],
                plan: {},
                focus: ["fun"],
                position: {}
            }
        ]
    );

    var pass = assert.async();
    api.student.list(
        function (data) {
            assert.deepEqual(
                data,
                [
                    {
                        id: silly_billy.id,
                        first_name: "Silly", 
                        last_name: "Billy",
                        words: ["base","time"],
                        plan: {},
                        focus: ["base"],
                        position: {}
                    },
                    {
                        id: sane_jane.id,
                        first_name: "Sane",
                        last_name: "Jane",
                        words: ["fun","time"],
                        plan: {},
                        focus: ["fun"],
                        position: {}
                    }
                ]
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("update", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"],focus:["fun"]});

    assert.deepEqual(
        api.student.update(sane_jane.id,{last_name: "Janey"}),
        {
            id: sane_jane.id,
            first_name: "Sane", 
            last_name: "Janey",
            words: ["fun","time"],
            plan: {},
            focus: ["fun"],
            position: {}
        }
    );

    assert.deepEqual(
        api.student.select(sane_jane.id),
        {
            id: sane_jane.id,
            first_name: "Sane", 
            last_name: "Janey",
            words: ["fun","time"],
            plan: {},
            focus: ["fun"],
            position: {}
        }
    );

    var pass = assert.async();
    api.student.update(sane_jane.id,{last_name: "Janes"},
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sane_jane.id,
                    first_name: "Sane", 
                    last_name: "Janes",
                    words: ["fun","time"],
                    plan: {},
                    focus: ["fun"],
                    position: {}
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("append", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"],focus:["fun"]});

    assert.deepEqual(
        api.student.append(sane_jane.id,["dee","lite"]),
        {
            id: sane_jane.id,
            first_name: "Sane", 
            last_name: "Jane",
            words: ["fun","time","dee","lite"],
            plan: {},
            focus: ["fun"],
            position: {}
        }
    );

    assert.deepEqual(
        api.student.select(sane_jane.id),
        {
            id: sane_jane.id,
            first_name: "Sane", 
            last_name: "Jane",
            words: ["fun","time","dee","lite"],
            plan: {},
            focus: ["fun"],
            position: {}
        }
    );

    var pass = assert.async();
    api.student.append(sane_jane.id,["groove"],
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sane_jane.id,
                    first_name: "Sane", 
                    last_name: "Jane",
                    words: ["fun","time","dee","lite","groove"],
                    plan: {},
                    focus: ["fun"],
                    position: {}
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("remove", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["dee","fun","groove","lite","time"],focus: ["fun"]});

    assert.deepEqual(
        api.student.remove(sane_jane.id,["dee","lite"]),
        {
            id: sane_jane.id,
            first_name: "Sane", 
            last_name: "Jane",
            words: ["fun","groove","time"],
            plan: {},
            focus: ["fun"],
            position: {}
        }
    );

    assert.deepEqual(
        api.student.select(sane_jane.id),
        {
            id: sane_jane.id,
            first_name: "Sane", 
            last_name: "Jane",
            words: ["fun","groove","time"],
            plan: {},
            focus: ["fun"],
            position: {}
        }
    );

    var pass = assert.async();
    api.student.remove(sane_jane.id,["groove"],
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sane_jane.id,
                    first_name: "Sane", 
                    last_name: "Jane",
                    words: ["fun","time"],
                    plan: {},
                    focus: ["fun"],
                    position: {}
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("focus", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time","party"]});

    assert.deepEqual(
        api.student.focus(sane_jane.id,["fun","time"]),
        {
            id: sane_jane.id,
            first_name: "Sane", 
            last_name: "Jane",
            words: ["fun","time","party"],
            plan: {},
            focus: ["fun","time"],
            position: {}
        }
    );

    var pass = assert.async();
    api.student.focus(sane_jane.id,["party"],
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sane_jane.id,
                    first_name: "Sane", 
                    last_name: "Jane",
                    words: ["fun","time","party"],
                    plan: {},
                    focus: ["fun","time","party"],
                    position: {}
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("blur", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time","party"],focus:["fun","time","party"]});

    assert.deepEqual(
        api.student.blur(sane_jane.id,["fun","time"]),
        {
            id: sane_jane.id,
            first_name: "Sane", 
            last_name: "Jane",
            words: ["fun","time","party"],
            plan: {},
            focus: ["party"],
            position: {}
        }
    );

    var pass = assert.async();
    api.student.blur(sane_jane.id,["party"],
        function (data) {
            assert.deepEqual(
                data,
                {
                    id: sane_jane.id,
                    first_name: "Sane", 
                    last_name: "Jane",
                    words: ["fun","time","party"],
                    plan: {},
                    focus: [],
                    position: {}
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("attain", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"]});
    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100
    });
    var sound = api.achievement.create({
        name: make_achievement("Sound"), 
        slug: make_achievement("sound"), 
        description: "Hear it", 
        progression: 101
    });

    var progress = api.student.attain(sane_jane.id,"fun",sight.id,"2015-09-22T00:00:00Z");

    assert.equal(progress.word,"fun");
    assert.equal(progress.achievement,sight.id);
    assert.equal(progress.held,true);
    assert.equal(progress.at,"2015-09-22T00:00:00Z");

    var pass = assert.async();
    api.student.attain(sane_jane.id,"time",sound.id,"2015-09-23T00:00:00Z",
        function (data) {
            assert.equal(data.word,"time");
            assert.equal(data.achievement,sound.id);
            assert.equal(data.held,true);
            assert.equal(data.at,"2015-09-23T00:00:00Z");
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("yield", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"]});
    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100
    });
    var sound = api.achievement.create({
        name: make_achievement("Sound"), 
        slug: make_achievement("sound"), 
        description: "Hear it", 
        progression: 101
    });

    var progress = api.student.yield(sane_jane.id,"fun",sight.id,"2015-09-22T00:00:00Z");

    assert.equal(progress.word,"fun");
    assert.equal(progress.achievement,sight.id);
    assert.equal(progress.held,false);
    assert.equal(progress.at,"2015-09-22T00:00:00Z");

    var pass = assert.async();
    api.student.yield(sane_jane.id,"time",sound.id,"2015-09-23T00:00:00Z",
        function (data) {
            assert.equal(data.word,"time");
            assert.equal(data.achievement,sound.id);
            assert.equal(data.held,false);
            assert.equal(data.at,"2015-09-23T00:00:00Z");
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("evaluate", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100
    });

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time","player"], focus: ["fun"], plan: {focus: 1, required: [sight.id]}});

    api.student.attain(sane_jane.id,"fun",sight.id,"2015-09-22T00:00:00Z");
    
    assert.deepEqual(
        api.student.evaluate(sane_jane.id),
        {
            "learned": ["fun"],
            "blurred": ["fun"],
            "focused": ["time"],
            "focus": ["time"]
        }
    );

    api.student.attain(sane_jane.id,"time",sight.id,"2015-09-22T00:00:00Z");

    var pass = assert.async();
    api.student.evaluate(sane_jane.id,
        function (data) {
            assert.deepEqual(
                data,
                {
                    "learned": ["fun","time"],
                    "blurred": ["time"],
                    "focused": ["player"],
                    "focus": ["player"]
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("position", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"]});
    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100
    });
    var sound = api.achievement.create({
        name: make_achievement("Sound"), 
        slug: make_achievement("sound"), 
        description: "Hear it", 
        progression: 101
    });

    api.student.attain(sane_jane.id,"fun",sight.id);
    api.student.attain(sane_jane.id,"time",sound.id);
    api.student.focus(sane_jane.id,["fun"]);

    assert.deepEqual(
        api.student.position(sane_jane.id),
        {
            "fun": [sight.id],
            "time": [sound.id]
        }
    );

    assert.deepEqual(
        api.student.position(sane_jane.id,["fun","time"]),
        {
            "fun": [sight.id],
            "time": [sound.id]
        }
    );

    assert.deepEqual(
        api.student.position(sane_jane.id,["fun"]),
        {
            "fun": [sight.id]
        }
    );

    assert.deepEqual(
        api.student.position(sane_jane.id,null,true),
        {
            "fun": [sight.id]
        }
    );

    assert.deepEqual(
        api.student.position(sane_jane.id,null,false),
        {
            "time": [sound.id]
        }
    );

    var pass = assert.async();
    api.student.position(sane_jane.id,null,null,
        function (data) {
            assert.deepEqual(
                data,
                {
                    "fun": [sight.id],
                    "time": [sound.id]
                }
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("learned", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100
    });
    var sound = api.achievement.create({
        name: make_achievement("Sound"), 
        slug: make_achievement("sound"), 
        description: "Hear it", 
        progression: 101
    });

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"],plan:{required: [sight.id]}});

    api.student.attain(sane_jane.id,"fun",sight.id);
    api.student.attain(sane_jane.id,"time",sound.id);

    assert.deepEqual(
        api.student.learned(sane_jane.id),
        ["fun"]
    );

    var pass = assert.async();
    api.student.learned(sane_jane.id,
        function (data) {
            assert.deepEqual(
                data,
                ["fun"]
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("history", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"]});
    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100
    });
    var sound = api.achievement.create({
        name: make_achievement("Sound"), 
        slug: make_achievement("sound"), 
        description: "Hear it", 
        progression: 101
    });

    api.student.attain(sane_jane.id,"fun",sight.id,"2015-09-22T00:00:00Z");
    api.student.yield(sane_jane.id,"time",sound.id,"2015-09-23T00:00:00Z");

    assert.deepEqual(
        api.student.history(sane_jane.id),
        [
            {
                word: "time",
                achievement: sound.id,
                held: false,
                at: "2015-09-23T00:00:00Z"
            },
            {
                word: "fun",
                achievement: sight.id,
                held: true,
                at: "2015-09-22T00:00:00Z"
            }
        ]
    );

    api.student.attain(sane_jane.id,"fun",sound.id,"2015-09-24T00:00:00Z");

    assert.deepEqual(
        api.student.history(sane_jane.id,["fun"]),
        [
            {
                word: "fun",
                achievement: sound.id,
                held: true,
                at: "2015-09-24T00:00:00Z"
            },
            {
                word: "fun",
                achievement: sight.id,
                held: true,
                at: "2015-09-22T00:00:00Z"
            }
        ]
    );

    assert.deepEqual(
        api.student.history(sane_jane.id,["fun"],[sight.id]),
        [
            {
                word: "fun",
                achievement: sight.id,
                held: true,
                at: "2015-09-22T00:00:00Z"
            }
        ]
    );

    assert.deepEqual(
        api.student.history(sane_jane.id,null,null,"2015-09-24"),
        [
            {
                word: "fun",
                achievement: sound.id,
                held: true,
                at: "2015-09-24T00:00:00Z"
            }
        ]
    );

    assert.deepEqual(
        api.student.history(sane_jane.id,null,null,null,"2015-09-23"),
        [
            {
                word: "fun",
                achievement: sight.id,
                held: true,
                at: "2015-09-22T00:00:00Z"
            }
        ]
    );

    var pass = assert.async();
    api.student.history(sane_jane.id,["fun"],[sight.id],null,null,
        function (data) {
            assert.deepEqual(
                data,
                [
                    {
                        word: "fun",
                        achievement: sight.id,
                        held: true,
                        at: "2015-09-22T00:00:00Z"
                    }
                ]
            );
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("chart", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["here","there"]});
    var sight = api.achievement.create({
        name: make_achievement("Sight"), 
        slug: make_achievement("sight"), 
        description: "See it", 
        progression: 100
    });
    var sound = api.achievement.create({
        name: make_achievement("Sound"), 
        slug: make_achievement("sound"), 
        description: "Hear it", 
        progression: 101
    });

    api.student.attain(sane_jane.id,"here",sight.id,"2015-09-20T00:00:00Z");
    api.student.attain(sane_jane.id,"here",sight.id,"2015-09-21T00:00:00Z");
    api.student.attain(sane_jane.id,"there",sound.id,"2015-09-22T00:00:00Z");
    api.student.yield(sane_jane.id,"there",sound.id,"2015-09-23T00:00:00Z");
    api.student.yield(sane_jane.id,"there",sound.id,"2015-09-24T00:00:00Z");
    api.student.attain(sane_jane.id,"here",sound.id,"2015-09-25T00:00:00Z");

    api.student.focus(sane_jane.id,["there"]);

    assert.deepEqual(api.student.chart(sane_jane.id,"date",null,null,[sight.id,sound.id]),{
        words: ["here","there"],
        times: [
            "2015-09-20",
            "2015-09-21",
            "2015-09-22",
            "2015-09-23",
            "2015-09-24",
            "2015-09-25"
        ],
        data: [
            {achievement: sight.id, totals: [1,1,1,1,1,1]},
            {achievement: sound.id, totals: [0,0,1,0,0,1]}
        ]
    })

    assert.deepEqual(api.student.chart(sane_jane.id,"week",null,null,[sight.id,sound.id]),{
        words: ["here","there"],
        times: [
            "2015-09-14",
            "2015-09-21"
        ],
        data: [
            {achievement: sight.id, totals: [1,1]},
            {achievement: sound.id, totals: [0,1]}
        ]
    })

    assert.deepEqual(api.student.chart(sane_jane.id,"month",null,null,[sight.id,sound.id]),{
        words: ["here","there"],
        times: [
            "2015-09"
        ],
        data: [
            {achievement: sight.id, totals: [1]},
            {achievement: sound.id, totals: [1]}
        ]
    })

    assert.deepEqual(api.student.chart(sane_jane.id,"date",["here","there"],null,[sight.id,sound.id]),{
        words: ["here","there"],
        times: [
            "2015-09-20",
            "2015-09-21",
            "2015-09-22",
            "2015-09-23",
            "2015-09-24",
            "2015-09-25"
        ],
        data: [
            {achievement: sight.id, totals: [1,1,1,1,1,1]},
            {achievement: sound.id, totals: [0,0,1,0,0,1]}
        ]
    })

    assert.deepEqual(api.student.chart(sane_jane.id,"date",null,["here"],[sight.id,sound.id]),{
        words: ["here"],
        times: [
            "2015-09-20",
            "2015-09-21",
            "2015-09-22",
            "2015-09-23",
            "2015-09-24",
            "2015-09-25"
        ],
        data: [
            {achievement: sight.id, totals: [1,1,1,1,1,1]},
            {achievement: sound.id, totals: [0,0,0,0,0,1]}
        ]
    })

    assert.deepEqual(api.student.chart(sane_jane.id,"date",null,null,[sight.id,sound.id],"2015-09-22","2015-09-25"),{
        words: ["here","there"],
        times: [
            "2015-09-22",
            "2015-09-23",
            "2015-09-24"
        ],
        data: [
            {achievement: sight.id, totals: [1,1,1]},
            {achievement: sound.id, totals: [1,0,0]}
        ]
    })

    var pass = assert.async();
    api.student.chart(sane_jane.id,"date",null,null,[sight.id,sound.id],null,null,
        function (data) {
            assert.deepEqual(data,{
                words: ["here","there"],
                times: [
                    "2015-09-20",
                    "2015-09-21",
                    "2015-09-22",
                    "2015-09-23",
                    "2015-09-24",
                    "2015-09-25"
                ],
                data: [
                    {achievement: sight.id, totals: [1,1,1,1,1,1]},
                    {achievement: sound.id, totals: [0,0,1,0,0,1]}
                ]
            });
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});

QUnit.test("delete", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api/v0/");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    var sane_jane = api.student.create({first_name: "Sane", last_name: "Jane", words:["fun","time"]});
    var silly_billy = api.student.create({first_name: "Silly", last_name: "Billy", words: ["base","time"]});

    assert.deepEqual(api.student.delete(sane_jane.id),{});

    assert.deepEqual(
        api.student.list(),
        [
            {
                id: silly_billy.id,
                first_name: "Silly", 
                last_name: "Billy",
                words: ["base","time"],
                plan: {},
                focus: [],
                position: {}
            }
        ]
    );

    var pass = assert.async();
    api.student.delete(silly_billy.id,
        function (data) {
            assert.deepEqual(data,{});
            pass();
        },
        function () {
            assert.ok(false);
            pass();
        }
    );

});