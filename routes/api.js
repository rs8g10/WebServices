
/*
 * Creation, delete, update and retrieval of questions
 */

var helper = require("../js/helper");

function getRange(req, callback) {
    var count = req.query.count,
        rangeStart = req.query.start,
        rangeEnd = req.query.end,
        inputValid = true,
        offset = null,
        limit = null;
    if (count !== undefined) {
        if (!helper.check_int(count)) {
            inputValid = false;
        } else {
            count = parseInt(count, 10);
            if (count <= 0) {
                inputValid = false;
            }
        }
    }
    if (rangeStart !== undefined && rangeEnd !== undefined) {
        if (!helper.check_int(rangeStart) || !helper.check_int(rangeEnd)) {
            inputValid = false;
        } else {
            rangeStart = parseInt(rangeStart, 10);
            rangeEnd = parseInt(rangeEnd, 10);
            if (rangeStart < 0 || rangeStart > rangeEnd) {
                inputValid = false;
            }
        }
    } else if (rangeStart !== undefined || rangeEnd !== undefined) {
        inputValid = false;
    }
    if (!inputValid) {
        callback(400, null, null);
    } else {
        if (rangeStart !== undefined) {
            offset = rangeStart;
            limit = rangeEnd - rangeStart + 1;
        } else if (count !== undefined) {
            offset = 0;
            limit = count;
        }
        callback(null, offset, limit);
    }
}

function find_object(model, id, callback) {
    if (helper.check_int(id)) {
        model.find({id : parseInt(id, 10)}, function (err, objects) {
            if (err) {
                callback(500, null);
            } else if (objects.length === 0) {
                callback(404, null);
            } else {
                var object = objects[0];
                callback(null, object);
            }
        });
    } else {
        callback(400);
    }
}

function encode_objects(objects, encode_function, callback, json_objects) {
    if (!json_objects) {
        json_objects = [];
    }
    if (objects.length === 0) {
        callback(null, json_objects);
    } else {
        var object = objects.shift();
        encode_function(object, function (err, json_object) {
            if (err) {
                callback(err, null);
            } else {
                json_objects.push(json_object);
                encode_objects(objects, encode_function, callback, json_objects);
            }
        });
    }
}

function encode_question(question, callback) {
    question.getAnswers(function (err, answers) {
        if (err) {
            callback(500, null);
        } else {
            question.getComments(function (err, comments) {
                if (err) {
                    callback(500, null);
                } else {
                    callback(null, {title: question.title,
                                    body: question.body,
                                    date: question.date,
                                    answers_count: answers.length,
                                    comments_count: comments.length});
                }
            });
        }
    });
}

function remove_comment(comment, callback) {
    comment.remove(function (err) {
        if (err) {
            callback(500);
        } else {
            callback(null);
        }
    });
}

function remove_comments(object, callback) {
    object.getComments(function (err, comments) {
        if (err) {
            callback(500);
        } else {
            object.removeComments(comments, function (err) {
                if (err) {
                    callback(500);
                } else {
                    callback(null);
                }
            });
        }
    });
}

function remove_answer(answer, callback) {
    remove_comments(answer, function (err) {
        if (err) {
            callback(err);
        } else {
            answer.remove(function (err) {
                if (err) {
                    callback(500);
                } else {
                    callback(null);
                }
            });
        }
    });
}

function remove_answers(answers, callback) {
    if (answers.length === 0) {
        callback(null);
    } else {
        var answer = answers.shift();
        remove_answer(answer, function (err) {
            if (err) {
                callback(err);
            } else {
                remove_answers(answers, callback);
            }
        });
    }
}

function match_answer(question, answer, callback) {
    var i;
    question.getAnswers(function (err, answers) {
        if (err) {
            callback(500);
        } else {
            for (i = 0; i < answers.length; i += 1) {
                if (answers[i].id === answer.id) {
                    callback(null);
                    return;
                }
            }
            callback(404);
        }
    });
}

function match_comment(object, comment, callback) {
    var i;
    object.getComments(function (err, comments) {
        if (err) {
            callback(500);
        } else {
            for (i = 0; i < comments.length; i += 1) {
                if (comments[i].id === comment.id) {
                    callback(null);
                    return;
                }
            }
            callback(404);
        }
    });
}

function encode_answer(answer, callback) {
    answer.getComments(function (err, comments) {
        if (err) {
            callback(500, null);
        } else {
            callback(null, {body: answer.body,
                            date: answer.date,
                            comments_count: comments.length});
        }
    });
}

function encode_comment(comment, callback) {
    callback(null, {body: comment.body,
                    date: comment.date});
}

function dateComparator(object1, object2) {
    return (object1.date < object2.date) ? 1 : (object1.date > object2.date) ? -1 : 0;
}

exports.create_question = function (req, resp) {
    var title = req.body.title,
        body = req.body.body;
    if (title && body) {
        req.models.question.create([{
            title: title,
            body: body,
            date: new Date().getTime()
        }], function (err, items) {
            if (err) {
                resp.send(500);
            } else {
                resp.location("/questions/" + items[0].id);
                resp.send(201);
            }
        });
    } else {
        resp.send(400);
    }
};

exports.get_questions = function (req, resp) {
    getRange(req, function (err, offset, limit) {
        if (err) {
            resp.send(err);
        } else {
            var callback = function (err, questions) {
                encode_objects(questions, encode_question, function (err, json_questions) {
                    if (err) {
                        resp.send(err);
                    } else {
                        resp.send(json_questions);
                    }
                });
            };
            if (offset !== null) {
                req.models.question.find(null, ["date", "Z"])
                                    .limit(limit)
                                    .offset(offset)
                                    .run(callback);
            } else {
                req.models.question.find(null, ["date", "Z"])
                                    .run(callback);
            }
        }
    });
};

exports.get_question = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            encode_question(question, function (err, json_question) {
                if (err) {
                    resp.send(err);
                } else {
                    resp.send(json_question);
                }
            });
        }
    });
};

exports.delete_question = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            question.getAnswers(function (err, answers) {
                if (err) {
                    resp.send(500);
                } else {
                    remove_answers(answers, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            remove_comments(question, function (err) {
                                if (err) {
                                    resp.send(500);
                                } else {
                                    question.remove(function (err) {
                                        if (err) {
                                            resp.send(500);
                                        } else {
                                            resp.send(204);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.update_question = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            var title = req.body.title,
                body = req.body.body;
            if (title) {
                question.title = title;
            }
            if (body) {
                question.body = body;
            }
            question.save(function (err) {
                if (err) {
                    resp.send(500);
                } else {
                    resp.send(204);
                }
            });
        }
    });
};

exports.create_answer = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            var body = req.body.body;
            if (body) {
                req.models.answer.create([{
                    body: body,
                    date: new Date().getTime()
                }], function (err, items) {
                    if (err) {
                        resp.send(500);
                    } else {
                        question.addAnswers(items, function (err) {
                            if (err) {
                                resp.send(500);
                            } else {
                                resp.location("/questions/" + req.params.qid + "/answers/" + items[0].id);
                                resp.send(201);
                            }
                        });
                    }
                });
            } else {
                resp.send(400);
            }
        }
    });
};

exports.get_answers = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            getRange(req, function (err, offset, limit) {
                if (err) {
                    resp.send(err);
                } else {
                    question.getAnswers(function (err, answers) {
                        if (err) {
                            resp.send(500);
                        } else {
                            answers.sort(dateComparator);
                            if (offset !== null) {
                                answers = answers.slice(offset, offset + limit);
                            }
                            encode_objects(answers, encode_answer, function (err, json_answers) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    resp.send(json_answers);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.get_answer = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.answer, req.params.aid, function (err, answer) {
                if (err) {
                    resp.send(err);
                } else {
                    match_answer(question, answer, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            encode_answer(answer, function (err, json_answer) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    resp.send(json_answer);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.delete_answer = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.answer, req.params.aid, function (err, answer) {
                if (err) {
                    resp.send(err);
                } else {
                    match_answer(question, answer, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            remove_answer(answer, function (err) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    resp.send(204);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.update_answer = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.answer, req.params.aid, function (err, answer) {
                if (err) {
                    resp.send(err);
                } else {
                    match_answer(question, answer, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            var body = req.body.body;
                            if (body) {
                                answer.body = body;
                            }
                            answer.save(function (err) {
                                if (err) {
                                    resp.send(500);
                                } else {
                                    resp.send(204);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.create_q_comment = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            var body = req.body.body;
            if (body) {
                req.models.comment.create([{
                    body: body,
                    date: new Date().getTime()
                }], function (err, items) {
                    if (err) {
                        resp.send(500);
                    } else {
                        question.addComments(items, function (err) {
                            if (err) {
                                resp.send(500);
                            } else {
                                resp.location("/questions/" + req.params.qid + "/comments/" + items[0].id);
                                resp.send(201);
                            }
                        });
                    }
                });
            } else {
                resp.send(400);
            }
        }
    });
};

exports.create_a_comment = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.answer, req.params.aid, function (err, answer) {
                if (err) {
                    resp.send(err);
                } else {
                    match_answer(question, answer, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            var body = req.body.body;
                            if (body) {
                                req.models.comment.create([{
                                    body: body,
                                    date: new Date().getTime()
                                }], function (err, items) {
                                    if (err) {
                                        resp.send(500);
                                    } else {
                                        answer.addComments(items, function (err) {
                                            if (err) {
                                                resp.send(500);
                                            } else {
                                                resp.location("/questions/" + req.params.qid + "/answers/" + req.params.aid + "/comments/" + items[0].id);
                                                resp.send(201);
                                            }
                                        });
                                    }
                                });
                            } else {
                                resp.send(400);
                            }
                        }
                    });
                }
            });
        }
    });
};

exports.get_q_comment = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.comment, req.params.cid, function (err, comment) {
                if (err) {
                    resp.send(err);
                } else {
                    match_comment(question, comment, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            encode_comment(comment, function (err, json_comment) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    resp.send(json_comment);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.get_a_comment = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.answer, req.params.aid, function (err, answer) {
                if (err) {
                    resp.send(err);
                } else {
                    match_answer(question, answer, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            find_object(req.models.comment, req.params.cid, function (err, comment) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    match_comment(answer, comment, function (err) {
                                        if (err) {
                                            resp.send(err);
                                        } else {
                                            encode_comment(comment, function (err, json_comment) {
                                                if (err) {
                                                    resp.send(err);
                                                } else {
                                                    resp.send(json_comment);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.get_q_comments = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            getRange(req, function (err, offset, limit) {
                if (err) {
                    resp.send(err);
                } else {
                    question.getComments(function (err, comments) {
                        if (err) {
                            resp.send(500);
                        } else {
                            comments.sort(dateComparator);
                            if (offset !== null) {
                                comments = comments.slice(offset, offset + limit);
                            }
                            encode_objects(comments, encode_comment, function (err, json_comments) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    resp.send(json_comments);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.get_a_comments = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.answer, req.params.aid, function (err, answer) {
                if (err) {
                    resp.send(err);
                } else {
                    match_answer(question, answer, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            getRange(req, function (err, offset, limit) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    answer.getComments(function (err, comments) {
                                        if (err) {
                                            resp.send(500);
                                        } else {
                                            comments.sort(dateComparator);
                                            if (offset !== null) {
                                                comments = comments.slice(offset, offset + limit);
                                            }
                                            encode_objects(comments, encode_comment, function (err, json_comments) {
                                                if (err) {
                                                    resp.send(err);
                                                } else {
                                                    resp.send(json_comments);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.delete_q_comment = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.comment, req.params.cid, function (err, comment) {
                if (err) {
                    resp.send(err);
                } else {
                    match_comment(question, comment, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            remove_comment(comment, function (err) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    resp.send(204);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.delete_a_comment = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.answer, req.params.aid, function (err, answer) {
                if (err) {
                    resp.send(err);
                } else {
                    match_answer(question, answer, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            find_object(req.models.comment, req.params.cid, function (err, comment) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    match_comment(answer, comment, function (err) {
                                        if (err) {
                                            resp.send(err);
                                        } else {
                                            remove_comment(comment, function (err) {
                                                if (err) {
                                                    resp.send(err);
                                                } else {
                                                    resp.send(204);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.update_q_comment = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.comment, req.params.cid, function (err, comment) {
                if (err) {
                    resp.send(err);
                } else {
                    match_comment(question, comment, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            var body = req.body.body;
                            if (body) {
                                comment.body = body;
                            }
                            comment.save(function (err) {
                                if (err) {
                                    resp.send(500);
                                } else {
                                    resp.send(204);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.update_a_comment = function (req, resp) {
    find_object(req.models.question, req.params.qid, function (err, question) {
        if (err) {
            resp.send(err);
        } else {
            find_object(req.models.answer, req.params.aid, function (err, answer) {
                if (err) {
                    resp.send(err);
                } else {
                    match_answer(question, answer, function (err) {
                        if (err) {
                            resp.send(err);
                        } else {
                            find_object(req.models.comment, req.params.cid, function (err, comment) {
                                if (err) {
                                    resp.send(err);
                                } else {
                                    match_comment(answer, comment, function (err) {
                                        if (err) {
                                            resp.send(err);
                                        } else {
                                            var body = req.body.body;
                                            if (body) {
                                                comment.body = body;
                                            }
                                            comment.save(function (err) {
                                                if (err) {
                                                    resp.send(500);
                                                } else {
                                                    resp.send(204);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.bad_method_collection = function (req, resp) {
    resp.set("Allow", "HEAD, GET, POST");
    resp.send(405);
};

exports.bad_method_item = function (req, resp) {
    resp.set("Allow", "HEAD, GET, PUT, DELETE");
    resp.send(405);
};
