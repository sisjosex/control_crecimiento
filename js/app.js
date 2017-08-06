var module = ons.bootstrap('ControlCrecimiento', ['services']);

var db;

var lang = {
    nina_peso_longitud: 'P/T',
    nino_peso_longitud: 'P/T',
    nina_peso_talla: 'P/T',
    nino_peso_talla: 'P/T',
    nina_talla_edad: 'T/E',
    nino_talla_edad: 'T/E',
    nina_peso_edad: 'P/E',
    nino_peso_edad: 'P/E',
    nina_pc: 'PC',
    nino_pc: 'PC',
    mujer_altura: 'T/E',
    varon_altura: 'T/E',
    mujer_mc: 'IMC',
    varon_mc: 'IMC'
};

module.controller('MainNavigatorController', function ($scope, $rootScope) {

    ons.ready(function () {

        mainNavigator.pushPage('home.html', {animation: 'none'});

        $rootScope.importDatabase = function (reset) {

            modal.show();

            html5sql.openDatabase("control_crecimiento", "control Crecimiento Database", 20 * 1024 * 1024);

            if (reset) {

                $.get('drop.sql', function (sql) {
                    var startTime = new Date();
                    html5sql.process(
                        sql,
                        function () { //Success

                            $rootScope.importDatabase(false);
                        },
                        function (error, failingQuery) { //Failure
                            console.log(error);
                            alert('Ocurrio un problema al cargar las tablas: ' + failingQuery);
                            modal.hide();
                            localStorage.setItem('db_initialized', 'error');
                        }
                    );
                });

                return;
            }

            $.get('database.sql', function (sql) {
                var startTime = new Date();
                html5sql.process(
                    sql,
                    function () { //Success

                        alert('La base de datos se cargó exitosamente');
                        modal.hide();
                        localStorage.setItem('db_initialized', 'yes');
                    },
                    function (error, failingQuery) { //Failure
                        console.log(error);
                        alert('Ocurrio un problema al cargar las tablas: ' + failingQuery);
                        modal.hide();
                        localStorage.setItem('db_initialized', 'error');
                    }
                );
            });
        };

        $scope.deviceReady = false;

        if (document.location.protocol == 'http:') {

            setTimeout(onDeviceReady, 500);

        } else {

            document.addEventListener("deviceready", onDeviceReady, false);
        }

        function onDeviceReady() {

            $scope.$apply(function () {

                var db_initialized = localStorage.getItem('db_initialized');

                if (db_initialized != 'yes') {

                    $rootScope.importDatabase(false);

                    db = openDatabase("control_crecimiento", "", "control Crecimiento Database", 20 * 1024 * 1024);

                } else {

                    db = openDatabase("control_crecimiento", "", "control Crecimiento Database", 20 * 1024 * 1024);
                }

                document.addEventListener("online", onOnline, false);
                document.addEventListener("offline", onOffline, false);

                $scope.deviceReady = true;
            });
        }

        function onOnline() {
            $rootScope.online = true;
        }

        function onOffline() {
            $rootScope.online = false;
        }

    });
});

module.controller('Home', function ($scope) {

    ons.ready(function () {

        $scope.calculadora_nutricional = function () {

            mainNavigator.pushPage('calculadora_nutricional_menu.html');
        };

        $scope.inmunizacion = function () {

            mainNavigator.pushPage('inmunizacion.html');
        };

        $scope.control_seguimiento = function () {

            mainNavigator.pushPage('control_seguimiento.html');
        };

    });
});

module.controller('CalculadoraNutricionalMenu', function ($scope, $rootScope) {

    ons.ready(function () {

        $scope.goToForm = function (form) {

            $rootScope.form = form;

            mainNavigator.pushPage(form);
        };

    });
});


var CalculadoraNutricional;
module.controller('CalculadoraNutricional', function ($scope, service) {

    ons.ready(function () {

        CalculadoraNutricional = $scope;

        var dob;

        dob = new Date();
        dob.setFullYear(2015);
        dob.setMonth(7);
        dob.setDate(8);

        limit = new Date();

        limit.setFullYear(2017);
        limit.setMonth(6);
        limit.setDate(30);

        /*$scope.user = {
         dob: dob,
         limit: limit,
         weight: 11,
         height: 88,
         pc: 54,
         sex: 'M'
         };*/

        $scope.user = {
            dob: dob,
            dob_formatted: moment(dob).format('DD / MM / YYYY'),
            limit: new Date(),
            limit_formatted: moment(date).format('DD / MM / YYYY'),
            weight: '',
            height: '',
            pc: '',
            sex: ''
        };

        /*$scope.user = {
         dob: undefined,
         dob_formatted: 'DD / MM / YYYY',
         limit: new Date(),
         limit_formatted: moment(date).format('DD / MM / YYYY'),
         weight: '',
         height: '',
         pc: '',
         sex: ''
         };*/

        $scope.showDatePicker1 = function () {
            var options = {
                date: new Date(),
                mode: 'date'
            };

            datePicker.show(options, function (date) {
                $scope.user.dob = date;
                $scope.user.dob_formatted = moment(date).format('DD / MM / YYYY');
                $scope.$digest();
            });
        };

        $scope.showDatePicker2 = function () {
            var options = {
                date: new Date(),
                mode: 'date'
            };

            datePicker.show(options, function (date) {
                $scope.user.limit = date;
                $scope.user.limit_formatted = moment(date).format('DD / MM / YYYY');
                $scope.$digest();
            });
        };

        $scope.procesar = function () {

            var weight = parseFloat($scope.user.weight);
            var height = parseFloat($scope.user.height);
            var pc = parseFloat($scope.user.pc);

            if (isNaN(weight)) {
                weight = 0;
            }

            if (isNaN(height)) {
                height = 0;
            }

            if (isNaN(pc)) {
                pc = 0;
            }

            var error = false;

            var ageYears = getAge($scope.user.dob, 'years');

            if ($scope.user.dob == '' || $scope.user.dob == null || $scope.user.dob == undefined) {

                alert('Fecha de nacimiento es requerida');
                return;

            } else if ($scope.user.sex == '') {

                alert('Sexo es requerido');
                return;

            } else if (weight <= 0 || height <= 0 /*& pc <= 0*/) {

                alert('Peso, Altura son parametros requeridos');
                return;

            } else if (ageYears > 19) {

                alert('No se puede realizar el procedimiento, la edad debe ser menor o igual a 19 años');
                return;
            }

            modal.show();

            $scope.user.weight = weight;
            $scope.user.height = height;
            $scope.user.pc = pc;

            service.calculate($scope.user, function (result) {

                if (result.status == 'success') {

                    modal.hide();

                    mainNavigator.pushPage('results.html', {
                        data: {
                            result: result.data,
                            user: $scope.user,
                            params: result.params
                        }
                    });

                } else {

                    modal.hide();

                    alert('Ocurrio un problema al calcular los datos');
                }

            }, function () {

                modal.hide();

                alert('No se pudo conectar con el servidor');
            });
        };

    });
});

var resultsScope;
module.controller('Results', function ($scope, service) {

    ons.ready(function () {

        resultsScope = $scope;

        var data = mainNavigator.pages[mainNavigator.pages.length - 1].data;

        $scope.user = data.user;

        var dob = new Date($scope.user.dob);
        //var date = data.params.actualDate;
        var date = $scope.user.limit;

        console.log(data);

        var ageDays = data.params.ageDays;
        var ageYears = parseInt(ageDays / 365);
        var ageMonths = 0;

        if (ageDays > 365 * ageYears) {
            ageDays = ageDays - 365 * ageYears;
            if (ageDays > 30) {
                ageMonths = parseInt(ageDays / 30);
            } else {
                ageMonths = 0;
            }
        }

        if (parseInt(ageDays / 30) > 1) {
            ageDays = ageDays - ageMonths * 30;
        }

        if (ageYears != 1) {
            ageYears = ageYears + ' años ';
        } else {
            ageYears = ageYears + ' año ';
        }

        if (ageMonths != 1) {
            ageMonths = ageMonths + ' meses ';
        } else {
            ageMonths = ageMonths + ' mes ';
        }

        if (ageDays != 1) {
            ageDays = ageDays + ' dias ';
        } else {
            ageDays = ageDays + ' dia ';
        }


        $scope.user.dateFormatted = dob.getDate() + '/' + (dob.getMonth() + 1) + '/' + dob.getFullYear();
        $scope.user.actualDate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

        //$scope.user.edadTXT = ageYears + ageMonths + ageDays;
        $scope.user.edadTXT = calcularEdad(dob, date);

        $scope.results = [];

        console.log(data);

        var result_content_soaps = [];
        var result_content_aicv = [];

        $scope.results_soaps = [];
        $scope.results_aicv = [];

        for (var i in data.result) {

            result = data.result[i];

            evaluation = evalParamsSOAPS(data.user, data.params, result);

            if (result.result) {

                var result_data = {
                    name: lang[result.table_params.name],
                    result: result.result,
                    color: evaluation.color,
                    text: evaluation.text
                };

                try {
                    result_data.M = parseFloat(result.row.SD0.replace(',', '.')).toFixed(1);
                    if (result.table_params.param_name == 'peso_para_la_talla') {
                        result_data.M = result_data.M + ' Kg';
                    } else if (result.table_params.param_name == 'talla_para_la_edad') {
                        result_data.M = result_data.M + ' cm';
                    } else if (result.table_params.param_name == 'peso_para_la_edad') {
                        result_data.M = result_data.M + ' Kg';
                    } else if (result.table_params.param_name == 'perimetro_cefalico') {
                        result_data.M = result_data.M + ' cm';
                    }
                } catch (error) {
                }

                //if (result.table_params.param_name == 'peso_para_la_talla'
                //    || result.table_params.param_name == 'talla_para_la_edad'
                //    || result.table_params.param_name == 'peso_para_la_edad'
                //    || result.table_params.param_name == 'perimetro_cefalico'
                //    || result.table_params.param_name == 'masa_corporal') {
                //
                //    if (result_data.text != '') {
                //        result_content_soaps.push(result_data);
                //    }
                //}

                //if (result_data.text != '')
                {
                    result_content_soaps.push(result_data);
                }


                /*
                 * AICV
                 */


                evaluation = evalParamsAICV(data.user, data.params, result);

                var result_data = {
                    name: lang[result.table_params.name],
                    result: result.result,
                    color: evaluation.color,
                    text: evaluation.text
                };


                try {
                    result_data.M = parseFloat(result.row.SD0.replace(',', '.')).toFixed(1);
                    //peso_para_la_edad
                    if (result.table_params.param_name == 'peso_para_la_talla') {
                        result_data.M = result_data.M + ' Kg';
                    } else if (result.table_params.param_name == 'talla_para_la_edad') {
                        result_data.M = result_data.M + ' cm';
                    } else if (result.table_params.param_name == 'peso_para_la_edad') {
                        result_data.M = result_data.M + ' Kg';
                    } else if (result.table_params.param_name == 'perimetro_cefalico') {
                        result_data.M = result_data.M + ' cm';
                    }
                } catch (error) {
                }

                if (result_data.text != '')
                {

                    result_content_aicv.push(result_data);
                }
            }
        }

        $scope.results_soaps = result_content_soaps;
        $scope.results_aicv = result_content_aicv;

    });
});

function evalParamsSOAPS(user, params, result) {

    var text = '';
    var color = '';

    var age = parseFloat((params.ageMonths / 12).toFixed(1));

    console.log(result.table_params.param_name);
    console.log(result);

    switch (result.table_params.param_name) {

        case 'peso_para_la_talla':
        {

            if ((age <= 2) || (age > 2 && age <= 5)) {

                if (result.result > 3) {

                    text = 'OBESIDAD';
                    color = 'azul';

                } else if (result.result > 2 && result.result <= 3) {

                    text = 'SOBREPESO';
                    color = 'celeste';

                } else if (result.result >= -2 && result.result <= 2) {

                    text = 'NORMAL';
                    color = 'verde';

                } else if (result.result >= -3 && result.result < -2) {

                    text = 'MODERADA';
                    color = 'naranja';

                } else if (result.result < -3) {

                    text = 'GRAVE';
                    color = 'rojo';
                }
            }

            break;
        }

        case 'talla_para_la_edad':
        {

            if ((age <= 2) || (age > 2 && age <= 5)) {

                if (result.result >= -2) {

                    text = 'NORMAL';
                    color = 'verde';

                } else if (result.result < -2) {

                    text = 'BAJA';
                    color = 'rojo';

                }
            } else if (age >= 5 && age <= 19) {

                if (result.result >= 2.01) {

                    text = 'ALTA';
                    color = 'amarillo';

                } else if (result.result >= -2 && result.result <= 2) {

                    text = 'ADECUADA';
                    color = 'verde';

                } else if (result.result >= -2.01) {

                    text = 'BAJA';
                    color = 'amarillo';

                }
            }

            break;
        }

        case 'peso_para_la_edad':
        {

            if ((age <= 2) || (age > 2 && age <= 5)) {

                if (result.result >= -2) {

                    text = 'NORMAL';
                    color = 'verde';

                } else if (result.result >= -3 && result.result < -2) {

                    text = 'DTN G. MODERADA';
                    color = 'naranja';

                } else if (result.result < -3) {

                    text = 'DTN G. SEVERA';
                    color = 'rojo';

                }
            }

            break;
        }

        case 'perimetro_cefalico':
        {

            if (age >= 0 && age <= 5) {

                if (result.result >= -1 && result.result < 1) {

                    text = 'NORMAL';
                    color = 'verde';

                } else if ((result.result > 1 && result.result <= 2) || (result.result <= -1 && result.result >= -2)) {

                    text = 'ALERTA';
                    color = 'naranja';

                } else if ((result.result < 1 || result.result > 2)) {

                    text = 'RETRASO';
                    color = 'rojo';

                }
            }

            break;
        }

        case 'masa_corporal':
        {
            if (age >= 5 && age <= 19) {

                if (result.result >= 2.01) {

                    text = 'OBESIDAD';
                    color = 'rojo';

                } else if (result.result >= 1.01 && result.result <= 2.00) {

                    text = 'SOBREPESO';
                    color = 'naranja';

                } else if (result.result >= -1.00 && result.result <= 1.00) {

                    text = 'NORMAL';
                    color = 'verde';

                } else if (result.result >= -1.01 && result.result <= -2.00) {

                    text = 'DNT AGUDA LEVE';
                    color = 'amarillo';

                } else if (result.result >= -2.01 && result.result <= -3.00) {

                    text = 'DNT AGUDA MODERADA';
                    color = 'celeste';

                } else if (result.result <= -3.01) {

                    text = 'DNT AGUDA SEVERA';
                    color = 'azul';

                }
            }

            break;
        }
    }

    return {
        label: result.table_params.param_name,
        text: text,
        color: color
    };
}

function evalParamsAICV(user, params, result) {

    console.log("evalParamsAICV");

    console.log(result);

    var text = '';
    var color = '';

    var age = parseFloat((params.ageMonths / 12).toFixed(1));

    switch (result.table_params.param_name) {

        case 'peso_para_la_edad':
        {

            if (params.ageDays <= 7) {

                if (params.weight < 2) {

                    text = 'BAJO PESO GRAVE';
                    color = 'rojo';
                } else if (params.weight >= 2 && params.weight < 2.5) {

                    text = 'PROB DE ALIMENTACION O BAJO PESO';
                    color = 'naranja';

                } else if (params.weight >= 2.5) {

                    text = 'SIN PROB DE ALIMENTACION NI BAJO PESO';
                    color = 'verde';
                }

            } else if (params.ageDays > 7 && params.ageDays <= 60) {

                if (result.result > 3) {

                    text = 'OBESIDAD';
                    color = 'azul';

                } else if (result.result > 2 && result.result <= 3) {

                    text = 'SOBREPESO';
                    color = 'celeste';

                } else if (result.result > -2 && result.result <= 2) {

                    text = 'NO TIENE BAJO PESO';
                    color = 'verde';

                } else if (result.result > -3 && result.result <= -2) {

                    text = 'PROB DE ALIMENTACION O BAJO PESO';
                    color = 'naranja';

                } else if (result.result <= -3) {

                    text = 'DESNUTRICION GRAVE';
                    color = 'rojo';
                }

                /*TODO tomar en cuenta el P/T, ahora esta usando el P/E*/
            } else if (params.ageDays > 60 && params.ageDays <= 365 * 5) {

                /*if (result.result > 3) {

                    text = 'OBESIDAD';
                    color = 'azul';

                } else if (result.result > 2 && result.result <= 3) {

                    text = 'SOBREPESO';
                    color = 'celeste';

                } else if (result.result > -2 && result.result <= 2) {

                    text = 'NO TIENE DESNUTRICION';
                    color = 'verde';

                } else if (result.result > -3 && result.result <= -2) {

                    text = 'DESNUTRICION AGUDA MODERADA';
                    color = 'naranja';

                } else if (result.result <= -3) {

                    text = 'DESTNUTRICION AGUDA GRAVE Y/O ANEMIA GRAVE';
                    color = 'rojo';
                }*/
            }

            break;
        }

        case 'perimetro_cefalico':
        {

            if (age >= 0 && age <= 5) {

                if (result.result >= -1 && result.result <= 1) {

                    text = 'DESARROLLO NORMAL';
                    color = 'verde';

                } else if ((result.result >= 1 && result.result <= 2) || (result.result <= -1 && result.result >= -2)) {

                    text = 'ALERTA PARA EL DESARROLLO';
                    color = 'naranja';

                } else if ((result.result < -2 || result.result > 2)) {

                    text = 'PROBABLE RETRASO EN EL DESARROLLO';
                    color = 'rojo';

                }
            }

            break;
        }

        case 'talla_para_la_edad':
        {

            if ((params.ageMonths >= 6 && params.ageMonths <= 24)) {

                if (result.result >= -2) {

                    text = 'NO TIENE TALLA BAJA';
                    color = 'verde';

                } else if (result.result < -2) {

                    text = 'TALLA BAJA';
                    color = 'celeste';

                }
            }

            break;
        }

        case 'peso_para_la_talla':
        {

            if ((params.ageMonths >= 2 && age <= 5)) {

                if (result.result > 3.01) {

                    text = 'OBESIDAD';
                    color = 'azul';

                } else if (result.result >= 2.01 && result.result <= 3.00) {

                    text = 'SOBREPESO';
                    color = 'celeste';

                } else if (result.result >= -2.00 && result.result <= 2.00) {

                    text = 'NO TIENE DESNUTRICION AGUDA';
                    color = 'verde';

                } else if (result.result >= -3.00 && result.result <= -2.01) {

                    text = 'DESNUTRICION AGUDA MODERADA';
                    color = 'naranja';

                } else if (result.result <= -3.01) {

                    text = 'DNT AGUDA GRAVE Y/O ANEMIA GRAVE';
                    color = 'rojo';
                }
            }

            break;
        }

        case 'masa_corporal':
        {
            if ((age >= 5 && age <= 12)) {

                if (result.result >= 2.01) {

                    text = 'OBESIDAD';
                    color = 'azul';

                } else if (result.result >= 1.01 && result.result <= 2.00) {

                    text = 'SOBREPESO';
                    color = 'celeste';

                } else if (result.result >= -2.00 && result.result <= 1.00) {

                    text = 'NO TIENE DNT NI OBESIDAD/SOBREPESO';
                    color = 'verde';

                } else if (result.result >= -3.00 && result.result <= -2.01) {

                    text = 'DESNUTRICION Y/O ANEMIA';
                    color = 'naranja';

                } else if (result.result <= -3.01) {

                    text = 'DNT GRAVE Y/O ANEMIA GRAVE';
                    color = 'rojo';
                }
            }

            break;
        }
    }

    return {
        label: result.table_params.param_name,
        text: text,
        color: color
    };
}

function alert(message, callback) {
    ons.notification.alert({
        message: message,
        // or messageHTML: '<div>Message in HTML</div>',
        title: 'Mensaje',
        buttonLabel: 'OK',
        animation: 'default', // or 'none'
        // modifier: 'optional-modifier'
        callback: function () {
            callback ? callback() : '';
        }
    });
}

function confirm(message, callback) {
    ons.notification.confirm({
        message: message,
        // or messageHTML: '<div>Message in HTML</div>',
        title: 'Confirmación',
        buttonLabels: [t('yes'), t('no')],
        animation: 'default', // or 'none'
        primaryButtonIndex: 1,
        cancelable: true,
        callback: function (index) {
            // -1: Cancel
            // 0-: Button index from the left
            callback ? callback(index) : '';
        }
    });
}