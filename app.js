
// Module dependencies
var express = require('express');
var routes = require('./routes');
var api = require('./routes/api');
var http = require('http');
var orm = require('orm');
var sqlite3 = require('sqlite3').verbose();
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.bodyParser());

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

// Creates database if not exists, defines and creates tables
app.use(orm.express("sqlite://ws.db", {
    define: function (db, models, next) {
        models.question = db.define("question", {
            title: {type: "text", size: 100, required: true},
            body: {type: "text", size: 1000, required: true},
            date: {type: "date", time: true, required: true}
        });
        models.answer = db.define("answer", {
            body: {type: "text", size: 1000, required: true},
            date: {type: "date", time: true, required: true}
        });
        models.comment = db.define("comment", {
            body: {type: "text", size: 1000, required: true},
            date: {type: "date", time: true, required: true}
        });
        models.question.hasMany("answers", models.answer, {}, { reverse: "questions"});
        models.question.hasMany("comments", models.comment, {}, { reverse: "questions"});
        models.answer.hasMany("comments", models.comment, {}, { reverse: "answers"});
        db.sync(function (err) {
            if (err) {
                throw err;
            }
            next();
        });
    }
}));

app.get("/", routes.index);

// urls for question collections
app.post("/questions", api.create_question);
app.get("/questions", api.get_questions);
app.put("/questions", api.bad_method_collection);
app.del("/questions", api.bad_method_collection);

// urls for questions
app.get("/questions/:qid", api.get_question);
app.del("/questions/:qid", api.delete_question);
app.put("/questions/:qid", api.update_question);
app.post("/questions/:qid", api.bad_method_item);

// urls for answer collections
app.post("/questions/:qid/answers", api.create_answer);
app.get("/questions/:qid/answers", api.get_answers);
app.put("/questions/:qid/answers", api.bad_method_collection);
app.del("/questions/:qid/answers", api.bad_method_collection);

// urls for answers
app.get("/questions/:qid/answers/:aid", api.get_answer);
app.del("/questions/:qid/answers/:aid", api.delete_answer);
app.put("/questions/:qid/answers/:aid", api.update_answer);
app.post("/questions/:qid/answers/:aid", api.bad_method_item);

// urls for comment collections in questions
app.post("/questions/:qid/comments", api.create_q_comment);
app.get("/questions/:qid/comments", api.get_q_comments);
app.put("/questions/:qid/comments", api.bad_method_collection);
app.del("/questions/:qid/comments", api.bad_method_collection);

// urls for comments in questions
app.get("/questions/:qid/comments/:cid", api.get_q_comment);
app.del("/questions/:qid/comments/:cid", api.delete_q_comment);
app.put("/questions/:qid/comments/:cid", api.update_q_comment);
app.post("/questions/:qid/comments/:cid", api.bad_method_item);

//urls for comment collections in answers
app.post("/questions/:qid/answers/:aid/comments", api.create_a_comment);
app.get("/questions/:qid/answers/:aid/comments", api.get_a_comments);
app.put("/questions/:qid/answers/:aid/comments", api.bad_method_collection);
app.del("/questions/:qid/answers/:aid/comments", api.bad_method_collection);

//urls for comments in answers
app.get("/questions/:qid/answers/:aid/comments/:cid", api.get_a_comment);
app.del("/questions/:qid/answers/:aid/comments/:cid", api.delete_a_comment);
app.put("/questions/:qid/answers/:aid/comments/:cid", api.update_a_comment);
app.post("/questions/:qid/answers/:aid/comments/:cid", api.bad_method_item);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
