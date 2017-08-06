function registerNotifications() {

    console.log('registerNotifications');

    if(window.plugins && window.plugins.pushNotification) {

        var pushNotification = window.plugins.pushNotification;

        if (device.platform === 'android' || device.platform === 'Android') {

            pushNotification.register(successHandler, this.errorHandler, {
                "senderID": "51393321226",
                "ecb": "onNotificationGCM"
            });

            //console.log('Android');

        } else {

            pushNotification.register(tokenHandler, this.errorHandler, {
                "badge": "true",
                "sound": "true",
                "alert": "true",
                "ecb": "onNotificationAPN"
            });

            //console.log('IPhone');
        }
    }

    //loadOfflineData();
}

function successHandler() {}

// android
function tokenHandler(result) {

    //if(TOKEN_PUSH_NOTIFICATION === 0){
    storeToken(device.uuid, result, 'iphone');

    //console.log('tokenHandler ' + result);
    //}
}

function onNotificationGCM(e) {

    //console.log('onNotificationGCM');

    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                if(TOKEN_PUSH_NOTIFICATION === 0){
                    storeToken(device.uuid, e.regid, 'android');
                }
            }
            break;

        case 'message':
            // this is the actual push notification. its format depends on the data model from the push server
            //alert('message = '+e.message+' msgcnt = '+e.msgcnt);
            if(TOKEN_PUSH_NOTIFICATION !== 0){
                showNotification(e,'android');
            }else{
                HAVE_NOTIFICATION = true;
                TYPE_NOTIFICATION = 'android';
                EVENT = e;
            }
            break;

        case 'error':
            alert('GCM error = '+e.msg);
            break;

        default:
            alert('An unknown GCM event has occurred');
            break;
    }
}

function onNotificationAPN(event) {
    if (event.alert) {
        if(TOKEN_PUSH_NOTIFICATION !== 0){
            showNotification(event,'ios');
        }else{
            HAVE_NOTIFICATION = true;
            TYPE_NOTIFICATION = 'ios';
            EVENT = event;
        }
    }
}

function showNotification(event, type){
    var message     = type === "android" ? event.message : event.alert;
    var seccion     = type === "android" ? event.payload.seccion : event.seccion;
    var seccion_id  = type === "android" ? event.payload.seccion_id : event.seccion_id;
    var date        = type === "android" ? event.payload.date : event.date;

    currentDate = date;

    try {
        navigator.notification.alert(
            message,
            function () {
                redirectToPage(seccion, seccion_id);
            },
            getLabel("alert"),
            getLabel("accept")
        );
    } catch(error) {
        redirectToPage(seccion, seccion_id);
    }
}

function redirectToPage(seccion, id){
    var page = "";
    var params = {};
    var active_tab = -1;

    if(id !== ""){
        params.id = id;
    }

    current_seccion_id = id;

    if(seccion === "session"){

        if(current_seccion_id == '') {
            active_tab = 0;
        }

    } else if(seccion === "club"){

        active_tab = 1;

    } else if(seccion === "life"){

        active_tab = 2;

    } else if(seccion === "promo"){

        active_tab = 3;
    }

    if(isShowingForm === true) {
        closeForm();
    }

    if(isShowingInfo === true) {
        closeInfo();
    }

    if(active_tab !== -1) {

        if(current_page === 'profile_detail.html') {

            profileNavigator.popPage('profile_detail.html');

        } else if(current_page === 'promo_info.html') {

            splash.popPage('promo_info.html');

        } else if(current_page === 'life_info.html') {

            splash.popPage('life_info.html');

        } else if(current_page === 'club_info.html') {

            splash.popPage('club_info.html');

        } else if(current_page === 'guest_list.html') {

            splash.popPage('guest_info.html');
        }

        current_page = '';


        mainTabBar.setActiveTab(active_tab);

    } else {

        if( seccion == 'session' && current_seccion_id != '') {

            showSessionDetailScreen(current_seccion_id);
            current_seccion_id = '';
        }
    }
}

function errorHandler() {}


function storeToken(uuid, token, device) {

    TOKEN_PUSH_NOTIFICATION = token;
    DEVICE_UUID = uuid;

    //console.log('uuid: ' + uuid + ' token: ' + token + ' device: ' + device);

    getJsonPBackground(api_url + 'updateUUID/', storePushInfoInMobile, onError, {
        user_id: userData.id,
        uuid: TOKEN_PUSH_NOTIFICATION,
        uuid_device: uuid,
        device: device
    });
}

function storePushInfoInMobile(data) {

    //console.log(data);

    localStorage.setItem("push_token", TOKEN_PUSH_NOTIFICATION);
    localStorage.setItem("uuid", DEVICE_UUID);
}

function redirectToSection(scope, section) {

    //console.log('redirectToSection');

    //console.log(current_seccion_id);

    if(current_seccion_id !== '') {

        index=-1;

        list = lists[section];

        //console.log(list);

        if(list.length > 0) {
            //console.log('searching');

            for(var i in list) {
                if(list[i].id === current_seccion_id) {
                    index = i;
                    break;
                }
            }


            if(index !== -1) {
                scope.gotoDetailFromNotification(index);
            }
        }

        current_seccion_id = '';
    }
}

function verifyNotification(){
    //si tiene una notificacion pendiente la mostramos
    if(HAVE_NOTIFICATION){
        setTimeout(function(){
            showNotification(EVENT, TYPE_NOTIFICATION);
        },800);
        HAVE_NOTIFICATION = false;
    }
}