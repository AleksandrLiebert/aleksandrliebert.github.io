host = "http://localhost:8080";

$('#login-button').click(function() {
    var username = $('#login-input').val();
    if (username == "") return;
    $.ajax({
        url: host + '/login',
        type: 'POST',
        data: JSON.stringify({username: username}),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(data) {
            localStorage.setItem('nomic_username', data.username);
            localStorage.setItem('nomic_profile_id', data.user_id);
            localStorage.setItem('nomic_head', data.head);
            localStorage.setItem('nomic_body', data.body);
            localStorage.setItem('nomic_color', data.color);
            localStorage.setItem('nomic_tripcode', data.tripcode);
            hideLogin();
            showLounge();
        },
        error: function(data) {
        }
    })
})

function showLogin() {
    $('#login-container').fadeIn(400);
    $('#login-input').focus();
}

function hideLogin() {
    $('#login-container').fadeOut(400);
}

function makeMessage(message) {
    if (message.username == 'System') {
        return '<div class="row message">' +
        '<div class="col-2 col-md-2 col-xl-1 offset-md-1 offset-xl-2 text-right"> ►► </div>' +
        '<div class="col-8 col-md-8 col-xl-6"><div>' + message.content + '</div></div></div>';
    }
    else {
        return '<div class="row message">' +
        '<div class="col-2 col-md-2 col-xl-1 offset-md-1 offset-xl-2"><div class="message-bgc bgc bgc-' + message.color + '">' +
        '<div class="message-body body body-' + message.body + '">' +
        '<div class="message-head head head-' + message.head + '"></div></div>' +
        '<div class="message-username">' + message.username + '</div></div></div>' +
        '<div class="col-8 col-md-8 col-xl-6 "><div class="message-text message-text-bgc-' + message.color  + '">' + message.content + '</div></div></div>';
    }
}

function getLounge() {
    $.ajax({
        url: host + '/lounge',
        type: 'GET',
        headers: {
            'Authorization': localStorage.getItem('nomic_profile_id'),
        },
        success: function(data) {
            $('#lounge-rows').empty();
            for (var i = 0; i < data.length; i++) {
                if (i != 0) {
                    $('#lounge-rows').append('<hr />');
                }
                $('#lounge-rows').append(
                    '<div class="row lounge-row" data-room-id="' + data[i].room_id + '">' +
                    '<div class="col-6">' + data[i].room_name + '</div>' +
                    '<div class="col-4">' + data[i].host_name + '</div>' +
                    '<div class="col-2 text-center" style="padding: 0.5rem;">' + 
                    '<div class="progress" style="background-color: black;"><div class="progress-bar bg-success" role="progressbar" style="width:' + (data[i].count / data[i].size * 100) + '%;" aria-valuenow="' + data[i].count + '" aria-valuemin="0" aria-valuemax="' + data[i].size + '">' + 
                    '</div><div class="progress-values">' + data[i].count + '/' + data[i].size + '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
                );
            }
            $('.lounge-row').click(function() {
                var room_id = $(this).attr('data-room-id');
                $.ajax({
                    url: host + '/room/' + room_id + '/join',
                    type: 'POST',
                    headers: {
                        'Authorization': localStorage.getItem('nomic_profile_id'),
                    },
                    success: function(data) {
                        localStorage.setItem('nomic_room_id', room_id);
                        $('#lounge-container').fadeOut(400);
                        showRoom(data);
                    },
                    error: function(data) {
                        alert('error');
                    },
                });
            });
        }
    });
}

function showLounge() {
    $('#profile-username').text('@' + localStorage.getItem('nomic_username'));
    tripcode = localStorage.getItem('nomic_tripcode');
    if (tripcode == 'null') {
        $('#profile-tripcode').text('');
    } else {
        $('#profile-tripcode').text('#' + tripcode);
    }
    $('#profile-bgc').attr('class', 'bgc-' + localStorage.getItem('nomic_color'));
    $('#profile-head').attr('class', 'head head-' + localStorage.getItem('nomic_head'));
    $('#profile-body').attr('class', 'body body-' + localStorage.getItem('nomic_body'));
    getLounge();
    $('#choice-avatar-head').attr('class', 'head head-' + localStorage.getItem('nomic_head'));
    $('#choice-avatar-body').attr('class', 'body body-' + localStorage.getItem('nomic_body'));
    $('#choice-avatar-bgc').attr('class', 'bgc bgc-' + localStorage.getItem('nomic_color'));
    $('.select-head').removeClass('selected-head');
    $('.select-body').removeClass('selected-body');
    $('.select-bgc').removeClass('selected-bgc');
    $('[data="head-' + localStorage.getItem('nomic_head') + '"]').addClass('selected-head');
    $('[data="body-' + localStorage.getItem('nomic_body') + '"]').addClass('selected-body');
    $('[data="bgc-' + localStorage.getItem('nomic_color') + '"]').addClass('selected-bgc');
    $('#lounge-container').fadeIn(400);
}

function main() {
    profile_id = localStorage.getItem('nomic_profile_id')
    if (profile_id == null) {
        showLogin();
        return;
    }
    $.ajax({
        url: host + '/room',
        type: 'GET',
        headers: {
            'Authorization': profile_id,
        },
        success: function(data) {
            showRoom(data);
        },
        error: function(data) {
            showLounge();
        },
    })
}

$('.select-head').click(function() {
    $('.select-head').removeClass('selected-head');
    $(this).addClass('selected-head');
    $('#choice-avatar-head').attr('class', 'head ' + $(this).attr('data'));
});

$('.select-body').click(function() {
    $('.select-body').removeClass('selected-body');
    $(this).addClass('selected-body');
    $('#choice-avatar-body').attr('class', 'body ' + $(this).attr('data'));
});

$('.select-bgc').click(function() {
    $('.select-bgc').removeClass('selected-bgc');
    $(this).addClass('selected-bgc');
    $('#choice-avatar-bgc').attr('class', 'bgc ' + $(this).attr('data'));
});

$('#change-avatar-submit').click(function() {
    var chooseHead = parseInt($('.selected-head').first().attr('data').split('-')[1]);
    var chooseBody = parseInt($('.selected-body').first().attr('data').split('-')[1]);
    var chooseColor = parseInt($('.selected-bgc').first().attr('data').split('-')[1]);
    $.ajax({
        url: host + '/profile',
        type: 'PUT',
        headers: {
            'Authorization': localStorage.getItem('nomic_profile_id'),
        },
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({
            head: chooseHead,
            body: chooseBody,
            color: chooseColor,
        }),
        success: function(data) {
            localStorage.setItem('nomic_head', chooseHead);
            localStorage.setItem('nomic_body', chooseBody);
            localStorage.setItem('nomic_color', chooseColor);
            $('#profile-bgc').removeClass();
            $('#profile-head').removeClass();
            $('#profile-body').removeClass();
            $('#profile-bgc').addClass('bgc-' + chooseColor);
            $('#profile-head').addClass('head');
            $('#profile-head').addClass('head-' + chooseHead);
            $('#profile-body').addClass('body');
            $('#profile-body').addClass('body-' + chooseBody);
            $('#change-avatar-modal').modal('hide');
        },
        error: function(data) {
        }
    });
});

$('#logout-button').click(function() {
    localStorage.removeItem('nomic_profile_id');
    localStorage.removeItem('nomic_username');
    localStorage.removeItem('nomic_tripcode');
    localStorage.removeItem('nomic_head');
    localStorage.removeItem('nomic_body');
    localStorage.removeItem('nomic_color');
    $('#lounge-container').fadeOut(400);
    showLogin();
});

function showRoom(data) {
    $('#message-container').empty();
    for (var i = 0; i < data.messages.length; i++) {
        console.log(data.messages[i]);
        var messageHtml = makeMessage(data.messages[i]);
        $('#messages-container').append(messageHtml);
    }
    $('#room-display').fadeIn(400);
}

main();
