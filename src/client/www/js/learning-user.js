if ($.cookie("username") != null && $.cookie("token") != null) {

    hwAPI.username = $.cookie("username");
    hwAPI.token = $.cookie("token");

}

Learning.controller("User",null,{
    register: function() {

        $("#failed").hide();

        try {
            
            var email = $("#email").val();
            var username = $("#email").val();
            var password = $("#password").val();
            var confirm = $("#confirm").val();

            if (password != confirm) {
                alert("Passwords do not match");
                $("#failed").show();
                return;
            }

            hwAPI.register(email,password,email);
            hwAPI.login(email,password);
            hwAPI.username = username;

            if ($("#remember").val()) {
                $.cookie("username",username,{path:'/',expires: 30});
                $.cookie("token",hwAPI.token,{path:'/',expires: 30});
            } else {
                $.cookie("username",username);
                $.cookie("token",hwAPI.token);
            }

            this.application.go("home");

        } catch (exception) {

            console.log(new Error().stack);
            alert(exception.message);
            $("#failed").show();

        }

    },
    login: function() {

        $("#failed").hide();

        try {
            
            var username = $("#email").val();
            var password = $("#password").val();

            hwAPI.login(username,password);
            hwAPI.username = username;

            if ($("#remember").val()) {
                $.cookie("username",username,{path:'/',expires: 30});
                $.cookie("token",hwAPI.token,{path:'/',expires: 30});
            } else {
                $.cookie("username",username);
                $.cookie("token",hwAPI.token);
            }

            this.application.go("home");

        } catch (exception) {

            alert(exception.message);
            $("#failed").show();

        }

    },
    logout: function() {

        $.removeCookie("username",{path: '/'});
        $.removeCookie("token",{path: '/'});

        hwAPI.token = null;
        hwAPI.username = null;

        this.application.go("home");

    }
});

Learning.template("Register",Learning.load("register"),null,Learning.partials);
Learning.template("Login",Learning.load("login"),null,Learning.partials);

Learning.route("register","/register/","Register");
Learning.route("login","/login/","Login");
Learning.route("logout","/logout/",null,"User","logout");