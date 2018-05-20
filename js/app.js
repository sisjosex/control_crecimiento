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

        mainNavigator.pushPage('views/home.html', {animation: 'none'});

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

        $scope.imc = function () {

            console.log('imc');

            mainNavigator.pushPage('views/imc.html');
        };

        $scope.calculadora_nutricional = function () {

            mainNavigator.pushPage('views/calculadora_nutricional_menu.html');
        };

        $scope.inmunizacion = function () {

            mainNavigator.pushPage('views/inmunizacion.html');
        };

        $scope.control_seguimiento = function () {

            mainNavigator.pushPage('views/control_seguimiento.html');
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
        //dob.setFullYear(2015);
        //dob.setMonth(6);
        //dob.setDate(28);

        limit = new Date();

        //limit.setFullYear(2017);
        //limit.setMonth(6);
        //limit.setDate(30);

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

                    mainNavigator.pushPage('views/results.html', {
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



var CalculadoraIMC;
module.controller('CalculadoraIMC', function ($scope, service) {

    ons.ready(function () {

        CalculadoraIMC = $scope;

        var dob;

        dob = new Date();
        //dob.setFullYear(2015);
        //dob.setMonth(6);
        //dob.setDate(28);

        limit = new Date();

        //limit.setFullYear(2017);
        //limit.setMonth(6);
        //limit.setDate(30);

        //$scope.user = {
        // dob: dob,
        // limit: limit,
        // weight: 11,
        // height: 88,
        // pc: 54,
        // sex: 'M'
        // };

        $scope.user = {
            weight: '',
            height: ''
        };

        $scope.result = '';

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

        $scope.procesar = function () {

            var weight = parseFloat($scope.user.weight);
            var height = parseFloat($scope.user.height);

            if (isNaN(weight)) {
                weight = 0;
            }

            if (isNaN(height)) {
                height = 0;
            }

            var error = false;

            var ageYears = getAge($scope.user.dob, 'years');

            if (weight <= 0 || height <= 0) {

                alert('Peso, Altura son parametros requeridos');
                return;

            } else {

                $scope.result = ($scope.user.weight / Math.pow($scope.user.height, 2)).toFixed(2);
            }

            //modal.show();

            $scope.user.weight = weight;
            $scope.user.height = height;


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
                    text: evaluation.text,
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
                    text: evaluation.text,
                    conducta: evaluation.conducta,
                    conducta_dnt_moderada_sin_complicacion: evaluation.conducta_dnt_moderada_sin_complicacion,
                    conducta_dnt_moderada_con_complicacion: evaluation.conducta_dnt_moderada_con_complicacion
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
        };


        $scope.showConducta = function(result) {

            if (result.conducta) {

                if (result.text == 'DESNUTRICION AGUDA MODERADA') {
                //if (result.text == 'PROBABLE RETRASO EN EL DESARROLLO') {
                    conducta(result.conducta, function(option){

                        if (option == 0) {

                            alert(result.conducta_dnt_moderada_con_complicacion, function(){}, 'Con Complicacion');

                        } else if (option == 1) {

                            alert(result.conducta_dnt_moderada_sin_complicacion, function(){}, 'Sin Complicacion');
                        }

                    });

                } else {

                    alert(result.conducta);
                }

            }

            console.log(result);
        };

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
    var conducta = '';
    var conducta_dnt_moderada_sin_complicacion = '';
    var conducta_dnt_moderada_con_complicacion = '';
    var conducta = '';

    var age = parseFloat((params.ageMonths / 12).toFixed(1));

    switch (result.table_params.param_name) {

        case 'peso_para_la_edad':
        {

            if (params.ageDays <= 7) {

                if (params.weight < 2) {

                    text = 'BAJO PESO GRAVE';
                    color = 'rojo';
                    conducta = 'Referir URGENTEMENTE al hospital, según normas de estabilización y transporte';

                } else if (params.weight >= 2 && params.weight < 2.5) {

                    text = 'PROB DE ALIMENTACION O BAJO PESO';
                    color = 'naranja';
                    conducta = 'Recomendar a la madre que le dé el pecho las veces que el RN quiera (por lo menos 10 veces en 24 horas)\
                        • Si el RN no agarra bien o no mama bien, enseñar a la madre la posición y el agarre correctos<br>\
                        • Recomendar que reciba lactancia materna exclusiva<br>\
                        • Si tiene moniliasis oral, enseñar a la madre cómo tratarla en el hogar<br>\
                        • Orientar a la madre sobre cuidados del RN en el hogar<br>\
                        • Indicar cuándo volver de inmediato<br>\
                        • Recomendar que vuelva a visita de seguimiento 2 días después para ver problemas de alimentación o moniliasis<br>\
                        • Recomendar cuidados extra a ambos padres';

                } else if (params.weight >= 2.5) {

                    text = 'SIN PROB DE ALIMENTACION NI BAJO PESO';
                    color = 'verde';
                    conducta = '' +
                        '• Orientar a la madre sobre:<br>\
                        &nbsp;&nbsp;- Lactancia Materna Exclusiva<br>\
                        &nbsp;&nbsp;- Cuidados del RN en el hogar<br>\
                        • Indicar cuándo debe volver de inmediato<br>\
                        • Verificar vacunas<br>\
                        • Recomendar que vuelva a consulta de atención integral según cronograma\
                    ';
                }

            } else if (params.ageDays > 7 && params.ageDays <= 60) {

                if (result.result > 3) {

                    text = 'OBESIDAD';
                    color = 'azul';
                    conducta = '\
                • Evaluar la alimentación y corregir los problemas identificados (Hoja de atención sistematizada)<br>\
                • Dar recomendaciones nutricionales según la edad del niño o niña<br>\
                • Recomendar la disminución del consumo de bebidas azucaradas (gaseosas), dulces, pasteles, frituras, etc. (comida chatarra o rápida)<br>\
                • Promover la actividad física mediante el juego, de acuerdo a la edad del niño o niña<br>\
                • Orientar sobre el uso del Nutribebé (niño/a de 6 meses a menor de 2 años)<br>\
                • Dar mebendazol<br>\
                • Dar vitamina A y hierro de acuerdo a la edad<br>\
                • Evaluar salud oral<br>\
                • Realizar control regular según cronograma<br>\
                • Si después de dos controles\
                    ';

                } else if (result.result > 2 && result.result <= 3) {

                    text = 'SOBREPESO';
                    color = 'celeste';
                    conducta = '\
                • Evaluar la alimentación y corregir los problemas identificados (Hoja de atención sistematizada)<br>\
                • Dar recomendaciones nutricionales según la edad del niño o niña<br>\
                • Recomendar la disminución del consumo de bebidas azucaradas (gaseosas), dulces, pasteles, frituras, etc. (comida chatarra o rápida)<br>\
                • Promover la actividad física mediante el juego, de acuerdo a la edad del niño o niña<br>\
                • Orientar sobre el uso del Nutribebé (niño/a de 6 meses a menor de 2 años)<br>\
                • Dar mebendazol<br>\
                • Dar vitamina A y hierro de acuerdo a la edad<br>\
                • Evaluar salud oral<br>\
                • Realizar control regular según cronograma<br>\
                • Si después de dos controles\
                    ';

                } else if (result.result > -2 && result.result <= 2) {

                    text = 'NO TIENE BAJO PESO';
                    color = 'verde';
                    conducta = '\
                    • Enseñar a la madre los cuidados del niño en el hogar<br>\
                    • Elogiar a la madre porque lo alimenta bien<br>\
                    • Dar orientación y promoción sobre lactancia materna<br>\
                    • Indicar a la madre cuándo volver de inmediato<br>\
                    • Indicar que vuelva a visita de seguimiento en 14 días<br>\
                    • Orientar sobre controles para la atención integral\
                    ';

                } else if (result.result > -3 && result.result <= -2) {

                    text = 'PROB DE ALIMENTACION O BAJO PESO';
                    color = 'naranja';
                    conducta = '\
                    • Enseñar a la madre los cuidados del niño/a en el hogar<br>\
                    • Promover la lactancia materna exclusiva<br>\
                    • Recomendar a la madre que le dé el pecho las veces que el niño/a quiera (por lo menos 10 veces en 24 horas)<br>\
                    • Si el niño/a no agarra bien o no mama bien, enseñar a la madre la posición y el agarre correctos<br>\
                    • Si está recibiendo otros alimentos o líquidos, recomendar a lamadre que le dé el pecho más veces, reduciendo los otros alimentos o líquidos hasta eliminarlos<br>\
                    • Si tiene moniliasis oral, enseñar a la madre a tratar la moniliasis en casa (incluyendo tratamiento de pezones)<br>\
                    • Orientar a la madre para que evite el uso de biberón<br>\
                    • Hacer el seguimiento para cualquier problema de alimentación o para moniliasis 7 días después<br>\
                    • Control de peso cada 14 días<br>\
                    • Si no mejora en dos controles, referir al Establecimiento de Salud con mayor capacidad resolutiva<br>\
                    • Indicar cuándo volver de inmediato<br>\
                    • Averiguar si la madre tiene problemas con la lactancia materna y dar orientación adecuada\
                    ';

                } else if (result.result <= -3) {

                    text = 'DESNUTRICION GRAVE';
                    color = 'rojo';
                    conducta = '\
                    • Dar la Primera Dosis de Antibiótico por vía intramuscular<br>\
                    • Referir URGENTEMENTE al Hospital de acuerdo a normas de transporte<br>\
                    • Recomendar a la madre que continúe dándole el pecho\
                    ';
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
                    conducta = '\
                    • Elogiar a la madre<br>\
                    • Orientar a madre para que continúe estimulando su hijo (Guía de Desarrollo)<br>\
                    • Indicar a la madre que regrese al establecimiento de salud para la consulta integral<br>\
                    ';

                } else if ((result.result >= 1 && result.result <= 2) || (result.result <= -1 && result.result >= -2)) {

                    text = 'ALERTA PARA EL DESARROLLO';
                    color = 'naranja';
                    conducta = '\
                    • Orientar a la madre sobre la estimulación de su niño/a (Guía de Desarrollo)<br>\
                    • Indicar que vuelva para una consulta de control del desarrollo en 30 días\
                    ';

                } else if ((result.result < -2 || result.result > 2)) {

                    text = 'PROBABLE RETRASO EN EL DESARROLLO';
                    color = 'rojo';
                    conducta = '\
                    • Referir para evaluación especializada\
                    ';
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
                    conducta = '\
                    • Evaluar la lactancia materna o la alimentación y corregir los problemas identificados (formulario de registro)<br>\
                    • Dar recomendaciones nutricionales según la edad del niño o niña<br>\
                    • Dar mebendazol (si es mayor de 1 año)<br>\
                    • Dar vitamina A si no la recibió en los 6 últimos meses<br>\
                    • Orientar sobre el uso del Nutribebé (si es de 6 meses a menor de 2<br>\
                    • Dar Chispitas Nutricionales (niño o niña de 6 meses a menor de 2 años) o Solución de hierro (niño o niña d e 2 a 5 años) y transmitir mensajes para promover su uso<br>\
                    • Realizar control regular según cronograma<br>\
                    ';

                } else if (result.result < -2) {

                    text = 'TALLA BAJA';
                    color = 'celeste';
                    conducta = '\
                    • Dar zinc durante 12 semanas (si es de 6 meses a menor de 2 años)<br>\
                    • Evaluar la lactancia materna o la alimentación y corregir los problemas identificados<br>\
                    • Dar recomendaciones nutricionales según la edad del niño o niña<br>\
                    • Dar mebendazol (si es mayor de 1 año)<br>\
                    • Dar vitamina A si no la recibió en los 6 últimos meses<br>\
                    • Orientar sobre el uso del Nutribebé (si es de 6 meses a menor de 2 años)<br>\
                    • Dar Chispitas Nutricionales (niño o niña de 6 meses a menor de 2 años) o Solución de hierro (niño o niñad e 2 a 5 años) y transmitir mensajes para promover su uso<br>\
                    • Realizar control en 30 días\
                    ';
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
                    conducta = '\
                    • Evaluar la alimentación y corregir los problemas identificados (Hoja de atención sistematizada)<br>\
                    • Dar recomendaciones nutricionales según la edad del niño o niña<br>\
                    • Recomendar la disminución del consumo de bebidas azucaradas (gaseosas), dulces, pasteles, frituras, etc. (comida chatarra o rápida)<br>\
                    • Promover la actividad física mediante el juego, de acuerdo a la edad del niño o niña<br>\
                    • Orientar sobre el uso del Nutribebé (niño/a de 6 meses a menor de 2 años)<br>\
                    • Dar mebendazol<br>\
                    • Dar vitamina A y hierro de acuerdo a la edad<br>\
                    • Evaluar salud oral<br>\
                    • Realizar control regular según cronograma<br>\
                    • Si después de dos controles\
                    ';

                } else if (result.result >= 2.01 && result.result <= 3.00) {

                    text = 'SOBREPESO';
                    color = 'celeste';
                    conducta = '\
                    • Evaluar la alimentación y corregir los problemas identificados (Hoja de atención sistematizada)<br>\
                    • Dar recomendaciones nutricionales según la edad del niño o niña<br>\
                    • Recomendar la disminución del consumo de bebidas azucaradas (gaseosas), dulces, pasteles, frituras, etc. (comida chatarra o rápida)<br>\
                    • Promover la actividad física mediante el juego, de acuerdo a la edad del niño o niña<br>\
                    • Orientar sobre el uso del Nutribebé (niño/a de 6 meses a menor de 2 años)<br>\
                    • Dar mebendazol<br>\
                    • Dar vitamina A y hierro de acuerdo a la edad<br>\
                    • Evaluar salud oral<br>\
                    • Realizar control regular según cronograma<br>\
                    • Si después de dos controles\
                    ';

                } else if (result.result >= -2.00 && result.result <= 2.00) {

                    text = 'NO TIENE DESNUTRICION AGUDA';
                    color = 'verde';
                    conducta = '\
                    • Dar recomendaciones nutricionales según la edad del niño o niña<br>\
                    • Dar mebendazol (si es mayor de 1 año)<br>\
                    • Dar vitamina A si no la recibió en los 6 últimos meses<br>\
                    • Orientar sobre el uso del Nutribebé o similares (niño/a de 6 meses a menor de 2 años)<br>\
                    • Dar hierro de acuerdo a la edad y transmitir mensajes para promover su uso<br>\
                    • Evaluar salud oral<br>\
                    • Indicar a la madre cuándo debe volver de inmediato<br>\
                    • Realizar control regular según cronograma<br>\
                    • Aconsejar a la madre sobre su propia salud\
                    ';

                } else if (result.result >= -3.00 && result.result <= -2.01) {

                    text = 'DESNUTRICION AGUDA MODERADA';
                    color = 'naranja';
                    conducta = '\
                    • Completar la evaluación de los síntomas principales del niño o niña para identificar complicaciones y definir la conducta a seguir, de acuerdo a la presencia o ausencia de complicaciones\
                    ';

                    conducta_dnt_moderada_sin_complicacion = '\
                    • Realizar manejo de acuerdo con la GUÍA PARA EL MANEJO DEL NIÑO O NIÑA CON DESNUTRICIÓN MODERADA SIN COMPLICACIONES<br>\
                    • Dar mebendazol (si es mayor de 1 año)<br>\
                    • Evaluar salud oral<br>\
                    • Realizar seguimiento en 7 días empleando el Formulario de Seguimiento Nutricional<br>\
                    • Indicar a la madre cuándo debe volver de inmediato\
                    ';

                    conducta_dnt_moderada_con_complicacion = '\
                    • Dar el tratamiento de acuerdo a la clasificació  o complicación<br>\
                    • Referir URGENTEMENTE al Hospital, siguiendo las recomendaciones para el transporte<br>\
                    • Si no es posible referir DE INMEDIATO, mientras viabiliza la referencia iniciar tratamiento de acuerdo con la GUIA PARA EL MANEJO DEL NIÑO O NIÑA CON DESNUTRICIÓN AGUDA MODERADA SIN COMPLICACIONES\
                    ';

                } else if (result.result <= -3.01) {

                    text = 'DNT AGUDA GRAVE Y/O ANEMIA GRAVE';
                    color = 'rojo';
                    conducta = '\
                    • Dar vitamina A<br>\
                    • Dar primera dosis de CEFTRIAXONA<br>\
                    • Referir URGENTEMENTE al hospital siguiendo las recomendaciones para el transporte<br>\
                    • Si no es posible referir DE INMEDIATO, mientras viabiliza la referencia iniciar tratamiento de acuerdo a la guía: MANEJO INICIAL DEL DESNUTRIDO AGUDO GRAVE\
                    ';
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
        color: color,
        conducta: conducta,
        conducta_dnt_moderada_sin_complicacion: conducta_dnt_moderada_sin_complicacion,
        conducta_dnt_moderada_con_complicacion: conducta_dnt_moderada_con_complicacion
    };
}

function alert(message, callback, title) {
    ons.notification.alert({
        messageHTML: message,
        // or messageHTML: '<div>Message in HTML</div>',
        title: title == undefined ? 'Mensaje' : title,
        buttonLabel: 'OK',
        animation: 'default', // or 'none'
        // modifier: 'optional-modifier'
        callback: function () {
            callback ? callback() : '';
        }
    });
}

function conducta(message, callback) {
    ons.notification.confirm({
        messageHTML: message,
        // or messageHTML: '<div>Message in HTML</div>',
        title: 'Confirmación',
        buttonLabels: ['Con Complicacion', 'Sin Complicacion'],
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

function confirm(message, callback) {
    ons.notification.confirm({
        messageHTML: message,
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