// Class to interact with the API

var HundoWord = {};
$.ajaxSetup({ cache: false });

// Exception to use with the API

HundoWord.APIException = function(message,response) {
    
    this.name = "HundoWord.APIException";
    this.message = message;

    try {
        this.json = JSON.parse(response.responseText);
    } catch (exception) {
        this.json = {};
    }

}

HundoWord.APIException.prototype = Object.create(Error.prototype);
HundoWord.APIException.prototype.constructor = HundoWord.APIException;

// API

HundoWord.API = function(url) {
    this.url = url;
}

// Use as constructor

HundoWord.API.prototype.constructor = HundoWord.API;


// Headers for learning

HundoWord.API.prototype.headers = function() {
    return {authorization: "Token " + this.token};
}


// Builds URL off Community base

HundoWord.API.prototype.build_url = function(path,id,action) {

    var url = this.url + "/" + path + "/";

    if (typeof id !== 'undefined') {
        url += id + "/";
    }

    if (typeof action !== 'undefined') {
        url += action + "/";
    }

    return url;

}


// Makes a REST call

HundoWord.API.prototype.rest = function(type,url,data,headers,success,error,complete) {

    var response = $.ajax({
        type: type,
        url: url,
        headers: headers,
        contentType: "application/json",
        data: (data === null) ? null : JSON.stringify(data),
        dataType: "json",
        success: success,
        error: error,
        complete: complete,
        async: (success != null || error != null || complete != null)
    });

    if (success != null || error != null || complete != null) {
        return;
    }

    //alert(response.status);

    if ((response.status != 200) && (response.status != 201) && (response.status != 202)) {
        throw new HundoWord.APIException(type + ": " + url + " failed",response);
    }

    return response.responseJSON;

}


// Registers an account

HundoWord.API.prototype.register = function(username,password,email,success,error,complete) {

    return this.rest("POST",this.build_url("register"),{
        "username": username,
        "password": password,
        "email": email
    },null,success,error,complete);

}


// Gets token

HundoWord.API.prototype.login = function(username,password,success,error,complete) {

    var self = this;
    var respond = function(data) {
        self.token = data["token"];
        if (success) {
            success(data);
        }
    }

    var response = $.ajax({
        type: "POST",
        url: this.build_url("token"),
        contentType: "application/json",
        data: JSON.stringify({
            "username": username,
            "password": password
        }),
        dataType: "json",
        success: respond,
        error: error,
        complete: complete,
        async: (success != null || error != null || complete != null)
    });

    if (success != null || error != null || complete != null) {
        return;
    }

    if (response.status != 200) {
        throw new HundoWord.APIException("POST: " + this.build_url("token") + " failed",response);
    }

}


// Handles achievements

HundoWord.API.prototype.achievement = {
    list: function(success,error,complete) {
        return this.rest("GET",this.build_url("achievement"),null,success,error,complete);
    },
    select: function(id,success,error,complete) {
        alert(JSON.stringify(this));
        return this.rest("GET",this.build_url("achievement",id),null,success,error,complete);
    },
    create: function(data,success,error,complete) {
        return this.rest("POST",this.build_url("achievement"),data,success,error,complete);
    },
    update: function(id,data,success,error,complete) {
        return this.rest("POST",this.build_url("achievement",id),data,success,error,complete);
    },
    delete: function(id,success,error,complete) {
        return this.rest("DELETE",this.build_url("achievement",id),success,error,complete);
    }
}


// Handles programs

HundoWord.API.prototype.program = {
    list: function(success,error,complete) {
        return this.rest("GET",this.build_url("program"),null,success,error,complete);
    },
    select: function(id,success,error,complete) {
        return this.rest("GET",this.build_url("program",id),null,success,error,complete);
    },
    create: function(data,success,error,complete) {
        return this.rest("POST",this.build_url("program"),data,success,error,complete);
    },
    update: function(id,data,success,error,complete) {
        return this.rest("POST",this.build_url("program",id),data,success,error,complete);
    },
    append: function(id,words,success,error,complete) {
        return this.rest("POST",this.build_url("program",id,"append"),{words: (typeof words === 'string' ? [words] : words)},success,error,complete);
    },
    remove: function(id,data,success,error,complete) {
        return this.rest("POST",this.build_url("program",id,"remove"),{words: (typeof words === 'string' ? [words] : words)},success,error,complete);
    },
    delete: function(id,success,error,complete) {
        return this.rest("DELETE",this.build_url("program",id),success,error,complete);
    }
}


// Handles students

HundoWord.API.prototype.student = {
    list: function(success,error,complete) {
        return this.rest("GET",this.build_url("student"),null,success,error,complete);
    },
    select: function(id,success,error,complete) {
        return this.rest("GET",this.build_url("student",id),null,success,error,complete);
    },
    position: function(id,success,error,complete) {
        return this.rest("GET",this.build_url("student",id,"position"),null,success,error,complete);
    },
    progress: function(id,success,error,complete) {
        return this.rest("GET",this.build_url("student",id,"progress"),null,success,error,complete);
    },
    create: function(data,success,error,complete) {
        return this.rest("POST",this.build_url("student"),data,success,error,complete);
    },
    update: function(id,data,success,error,complete) {
        return this.rest("POST",this.build_url("student",id),data,success,error,complete);
    },
    append: function(id,words,success,error,complete) {
        return this.rest("POST",this.build_url("student",id,"append"),{words: (typeof words === 'string' ? [words] : words)},success,error,complete);
    },
    remove: function(id,words,success,error,complete) {
        return this.rest("POST",this.build_url("student",id,"remove"),{words: (typeof words === 'string' ? [words] : words)},success,error,complete);
    },
    attain: function(id,word,achievement,success,error,complete) {
        return this.rest("POST",this.build_url("student",id,"attain"),{word: word,achievment: achievement},success,error,complete);
    },
    yield: function(id,word,achievement,success,error,complete) {
        return this.rest("POST",this.build_url("student",id,"yield"),{words: word,achievment: achievement},success,error,complete);
    },
    delete: function(id,success,error,complete) {
        return this.rest("DELETE",this.build_url("student",id),success,error,complete);
    }
}


// Determines if there's an exception in the response

HundoWord.API.prototype.exception = function() {
    try {
        return this.response.responseJSON["exception"];
    } catch (exception) {}
}

