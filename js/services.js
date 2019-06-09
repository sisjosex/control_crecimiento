var tablas = {
    height: {
        weight_0_2: {
            F: 'nina_peso_longitud',
            M: 'nino_peso_longitud',
            formula: function (obs, M, L, S) {

                return (Math.pow((obs / M), L) - 1) / (L * S);
            },
            type: 'mls',
            column: 'Longitud',
            param_name: 'peso_para_la_talla'
        },
        weight_2_5: {
            F: 'nina_peso_talla',
            M: 'nino_peso_talla',
            formula: function (obs, M, L, S) {

                return (Math.pow((obs / M), L) - 1) / (L * S);
            },
            type: 'mls',
            column: 'Talla',
            param_name: 'peso_para_la_talla'
        }
    },
    age: {
        height_0_5: {
            F: 'nina_talla_edad',
            M: 'nino_talla_edad',
            formula: function (obs, M, Z) {

                return (obs - M) / Z;
            },
            type: 'z',
            column: 'DIA',
            param_name: 'talla_para_la_edad'
        },
        weight_0_5: {
            F: 'nina_peso_edad',
            M: 'nino_peso_edad',
            formula: function (obs, M, L, S) {

                return (Math.pow((obs / M), L) - 1) / (L * S);
            },
            type: 'mls',
            column: 'DIAS',
            param_name: 'peso_para_la_edad'
        },
        pc_0_5: {
            F: 'nina_pc',
            M: 'nino_pc',
            formula: function (obs, M, Z) {

                return (obs - M) / Z;
            },
            type: 'mls',
            column: 'DIA',
            param_name: 'perimetro_cefalico'
        },
        height_5_19: {
            F: 'mujer_altura',
            M: 'varon_altura',
            formula: function (obs, M, Z) {

                return (obs - M) / Z;
            },
            type: 'z',
            column: 'MESES',
            param_name: 'talla_para_la_edad'
        },
        weight_5_19: {
            F: 'mujer_mc',
            M: 'varon_mc',
            formula: function (obs, M, L, S) {

                return (Math.pow((obs / M), L) - 1) / (L * S);
            },
            type: 'mls',
            column: 'MESES',
            param_name: 'masa_corporal'
        }
    }
};

function formulaLMS(formula, obs, M, L, S) {

    //console.log('obs: ' + obs + ' L: ' + L + ' M: ' + M + ' S:' + S);

    result = formula(parseFloat((obs+'').replace(',', '.')), parseFloat(M.replace(',', '.')), parseFloat(L.replace(',', '.')), parseFloat(S.replace(',', '.')));

    //console.log(result);

    return result;
}

function formulaM(formula, obs, M, Z) {

    //console.log('obs: ' + obs + ' M: ' + M + ' Z:' + Z);

    var params = {
        obs: parseFloat(obs.replace(',', '.')),
        M: parseFloat(M.replace(',', '.')),
        Z: parseFloat(Z.replace(',', '.'))
    };

    //console.log(params);

    result = formula(params.obs, params.M, params.Z);

    //console.log(result);

    return result;
}

function getTableParams(param, name, sex) {

    return {
        name: tablas[param][name][sex],
        formula: tablas[param][name].formula,
        type: tablas[param][name].type,
        column: tablas[param][name].column,
        param_name: tablas[param][name].param_name,
    };
}

function executeQuery(params, callback) {

    //console.log(params);

    db.transaction(function (tx) {

        tx.executeSql(params.query, params.query_params, function (tx, res) {

            //console.log(res.rows);

            params.callback(params, tx, res);
            callback();

        });
    });
}

function executeBatch(queryes, i, callback) {

    if (i >= queryes.length) {
        callback();

    } else {

        executeQuery(
            queryes[i],
            function () {
                //console.log(i);
                executeBatch(queryes, i + 1, callback);
            }
        );
    }

    //obs, query, table_params, callback
}

angular.module("services", []).factory("service", ["$http", "$q", function ($http, $q) {
    return {
        calculate: function (params, success, error) {

            sql = "";

            params.ageDays = getAge(params.dob, 'days', params.limit);
            params.ageYears = getAge(params.dob, 'years', params.limit);
            params.ageMonths = getAge(params.dob, 'months', params.limit);
            params.actualDate = new Date();

            table_prefix = 'nino_';

            var result = {};
            var callBacks = [];

            if (params.height != 0) {

                var height;
                var weight;

                if (params.ageYears <= 5) {

                    var table_params = {
                        name: '',
                        formula: '',
                        type: ''
                    };

                    if (params.ageDays >= 0 && params.ageDays <= 365*2) {

                        table_params = getTableParams('height', 'weight_0_2', params.sex);

                    } else if (params.ageDays > 365*2 && params.ageDays <= 365*5) {

                        table_params = getTableParams('height', 'weight_2_5', params.sex);

                    }

                    if (table_params.name != '') {

                        height = params.height.toFixed(1) + '';
                        height = height.replace('.', ',');

                        if (table_params.column == 'Longitud' || params.sex == 'M') {
                            height = height.replace(',0', '');
                        }

                        weight = params.weight.toFixed(1) + '';
                        weight = weight.replace('.', ',');

                        if (table_params.column == 'Longitud') {
                            weight = weight.replace(',0', '');
                        }

                        query = "SELECT * FROM " + table_params.name + " WHERE " + table_params.column + "='" + height + "'";

                        callBacks.push({
                            obs: params.weight,
                            query: query,
                            table_params: table_params,
                            callback: function (data, tx, res) {

                                if (res.rows.length > 0) {

                                    row = res.rows[0];

                                    console.log(data);
                                    console.log(db);
                                    console.log(row);

                                    data.row = row;

                                    data.result = parseFloat( formulaLMS(data.table_params.formula, data.obs, row.M, row.L, row.S).toFixed(2) );
                                }
                            }
                        });
                    }
                }

                if (params.ageYears <= 19) {

                    if (params.height != 0) {

                        if (params.ageDays >= 365*0 && params.ageDays <= 365*5) {

                            table_params = getTableParams('age', 'height_0_5', params.sex);

                        } else if (params.ageDays > 365*5 && params.ageDays <= 365*19) {

                            table_params = getTableParams('age', 'height_5_19', params.sex);
                        }

                        if (table_params.name != '') {

                            height = params.height.toFixed(1) + '';
                            height = height.replace('.', ',');

                            if (table_params.column == 'Longitud') {
                                height = height.replace(',0', '');
                            }

                            if (params.ageDays >= 365*0 && params.ageDays <= 365*5) {

                                query = "SELECT * FROM " + table_params.name + " WHERE " + table_params.column + "='" + params.ageDays + "'";

                            } else if (params.ageDays > 365*5 && params.ageDays <= 365*19) {

                                query = "SELECT * FROM " + table_params.name + " WHERE " + table_params.column + "='" + params.ageMonths + "'";
                            }

                            callBacks.push({
                                obs: height,
                                query: query,
                                table_params: table_params,
                                callback: function (data, tx, res) {

                                    if (res.rows.length > 0) {

                                        row = res.rows[0];

                                        data.row = row;

                                        if (params.ageDays >= 365*0 && params.ageDays <= 365*5) {

                                            data.result = parseFloat( formulaM(data.table_params.formula, data.obs, row.SD0, row.Z).toFixed(2) );

                                        } else if (params.ageDays > 365*5 && params.ageDays <= 365*19) {

                                            data.result = parseFloat( formulaM(data.table_params.formula, data.obs, row.SD0, row.Z).toFixed(2) );
                                        }
                                    }
                                }
                            });
                        }
                    }

                    if (params.weight != 0) {

                        if (params.ageYears >= 0 && params.ageYears <= 5) {

                            weight = params.weight;

                            table_params = getTableParams('age', 'weight_0_5', params.sex);

                        } else if (params.ageYears >= 5 && params.ageYears <= 19) {

                            weight = params.weight/Math.pow(params.height/100, 2);

                            table_params = getTableParams('age', 'weight_5_19', params.sex);
                        }

                        console.log("table_params.name");
                        console.log(table_params.name);

                        if (table_params.name != '') {

                            // weight = params.weight.toFixed(1) + '';
                            weight = weight.toFixed(1) + '';
                            weight = weight.replace('.', ',');

                            if (table_params.column == 'Longitud') {
                                weight = weight.replace(',0', '');
                            }

                            if (params.ageDays >= 365*0 && params.ageDays <= 365*5) {

                                query = "SELECT * FROM " + table_params.name + " WHERE " + table_params.column + "='" + params.ageDays + "'";

                            } else if (params.ageDays > 365*5 && params.ageDays <= 365*19) {

                                query = "SELECT * FROM " + table_params.name + " WHERE " + table_params.column + "='" + params.ageMonths + "'";
                            }

                            console.log('consulta');
                            console.log(weight);

                            callBacks.push({
                                obs: weight,
                                query: query,
                                table_params: table_params,
                                callback: function (data, tx, res) {

                                    if (res.rows.length > 0) {

                                        row = res.rows[0];

                                        data.row = row;

                                        if (params.ageDays >= 365*0 && params.ageDays <= 365*5) {

                                            data.result = parseFloat( formulaLMS(data.table_params.formula, data.obs, row.M, row.L, row.S).toFixed(2) );

                                        } else if (params.ageDays > 365*5 && params.ageDays <= 365*19) {

                                            data.result = parseFloat( formulaLMS(data.table_params.formula, data.obs, row.M, row.L, row.S).toFixed(2) );
                                            // data.result = parseFloat( formulaM(data.table_params.formula, data.obs, row.M, row.SD0).toFixed(2) );
                                        }
                                    }
                                }
                            });
                        }
                    }

                    if (params.ageYears <= 5 && params.pc != 0) {

                        var table_params = {
                            name: '',
                            formula: '',
                            type: ''
                        };

                        table_params = getTableParams('age', 'pc_0_5', params.sex);

                        if (table_params.name != '') {

                            query = "SELECT * FROM " + table_params.name + " WHERE " + table_params.column + "='" + params.ageDays + "'";

                            push = {
                                obs: params.pc+'',
                                query: query,
                                table_params: table_params,
                                callback: function (data, tx, res) {

                                    if (res.rows.length > 0) {

                                        row = res.rows[0];

                                        data.row = row;

                                        data.result = parseFloat( formulaM(data.table_params.formula, data.obs, row.SD0, row.Z).toFixed(2) );
                                    }
                                }
                            };

                            callBacks.push(push);
                        }
                    }
                }
            }

            executeBatch(callBacks, 0, function () {

                success({
                    status: 'success',
                    data: callBacks,
                    params: params
                });
            });

        },
        registerUser: function (params, success, error) {
            $http({
                method: 'JSONP',
                url: API_URL + 'registerUser?callback=JSON_CALLBACK',
                params: params
            }).success(success).error(error);
        },
        getCategories: function (params, success, error) {
            $http({
                method: 'JSONP',
                url: API_URL + 'getCategories?callback=JSON_CALLBACK',
                params: params
            }).success(success).error(error);
        },
        getMenus: function (params, success, error) {
            $http({
                method: 'JSONP',
                url: API_URL + 'getMenus?callback=JSON_CALLBACK',
                params: params
            }).success(success).error(error);
        },
        addToFavorite: function (params, success, error) {
            $http({
                method: 'JSONP',
                url: API_URL + 'getMenus?callback=JSON_CALLBACK',
                params: params
            }).success(success).error(error);
        },
        addToRecipes: function (params, success, error) {
            $http({
                method: 'JSONP',
                url: API_URL + 'getMenus?callback=JSON_CALLBACK',
                params: params
            }).success(success).error(error);
        }
    };
}]);

function getAge(dateString, format, limit) {

    if (format == 'days') {

        return parseInt((new Date(limit) - new Date(dateString)) / (1000 * 60 * 60 * 24));

    } else if (format == 'years') {

        var today = new Date(limit);
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;

    } else if (format == 'months') {

        start_date = new Date(dateString); //Create start date object by passing appropiate argument
        end_date = new Date(limit);

        total_months = (end_date.getFullYear() - start_date.getFullYear()) * 12 + (end_date.getMonth() - start_date.getMonth())

        return total_months;
    }
}