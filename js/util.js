function ImageLoader(preview, image) {

    var self = this;

    self.image = image;
    self.preview = preview;

    self.image.src = preview.attr('src');

    var outerWidth = self.preview.width();
    var outerHeight = self.preview.height();

    self.image.onload = function () {

        self.preview.css('background-image', "url('" + self.image.src + "')");
        self.preview.css('background-repeat', "no-repeat");
        self.preview.css('background-position', "center center");

        var width = image.width;
        var height = image.height;
        var factor = 1;

        if (outerWidth > width) {
            factor = outerWidth / width;
            width = width * factor;
            height = height * factor;
        }

        if (outerHeight > height) {

            factor = (outerHeight) / height;
            width = width * factor;
            height = height * factor;
        }

        if (outerWidth < width) {
            factor = outerHeight / height;
            width = width * factor;
            height = outerHeight;

            if (outerWidth - width > 0) {
                factor = outerWidth / width;
                width = outerWidth;
                height = height * factor;
            }


        } else if (outerHeight < height) {
            factor = outerWidth / width;
            width = outerWidth;
            height = height * factor;

            if (outerHeight - height > 0) {
                factor = outerHeight / height;
                height = outerHeight;
                width = width * factor;
            }
        }

        width = parseInt(width + "");
        height = parseInt(height + "");

        self.preview.css('background-size', (width) + "px" + " " + (height) + "px");

        self.preview.addClass('loaded');
    }
}


function isValidDate(day, month, year) {
    var dteDate;

    // En javascript, el mes empieza en la posicion 0 y termina en la 11
    //   siendo 0 el mes de enero
    // Por esta razon, tenemos que restar 1 al mes
    month = month - 1;
    // Establecemos un objeto Data con los valore recibidos
    // Los parametros son: año, mes, dia, hora, minuto y segundos
    // getDate(); devuelve el dia como un entero entre 1 y 31
    // getDay(); devuelve un num del 0 al 6 indicando siel dia es lunes,
    //   martes, miercoles ...
    // getHours(); Devuelve la hora
    // getMinutes(); Devuelve los minutos
    // getMonth(); devuelve el mes como un numero de 0 a 11
    // getTime(); Devuelve el tiempo transcurrido en milisegundos desde el 1
    //   de enero de 1970 hasta el momento definido en el objeto date
    // setTime(); Establece una fecha pasandole en milisegundos el valor de esta.
    // getYear(); devuelve el año
    // getFullYear(); devuelve el año
    dteDate = new Date(year, month, day);

    //Devuelva true o false...
    return ((day == dteDate.getDate()) && (month == dteDate.getMonth()) && (year == dteDate.getFullYear()));
}

/**
 * Funcion para validar una fecha
 * Tiene que recibir:
 *  La fecha en formato ingles yyyy-mm-dd
 * Devuelve:
 *  true-Fecha correcta
 *  false-Fecha Incorrecta
 */
function validate_fecha(fecha) {
    var patron = new RegExp("^(19|20)+([0-9]{2})([-])([0-9]{1,2})([-])([0-9]{1,2})$");

    if (fecha.search(patron) == 0) {
        var values = fecha.split("-");
        if (isValidDate(values[2], values[1], values[0])) {
            return true;
        }
    }
    return false;
}

/**
 * Esta función calcula la edad de una persona y los meses
 * La fecha la tiene que tener el formato yyyy-mm-dd que es
 * metodo que por defecto lo devuelve el <input type="date">
 */

/*function calcularEdad(desde, hasta) {

    console.log(desde);
    console.log(hasta);

    var a = moment([hasta.getFullYear(), hasta.getMonth() + 1, hasta.getDate()]);
    var b = moment([desde.getFullYear(), desde.getMonth() + 1, desde.getDate()]);

    var years = a.diff(b, 'year');
    b.add(years, 'years');

    var months = a.diff(b, 'months');
    b.add(months, 'months');

    var days = a.diff(b, 'days');

    return years + ' años ' + months + ' meses ' + days + ' dias';
}*/

function calcularEdad(desde, hasta) {

    var dia = desde.getDate();
    var mes = desde.getMonth() + 1;
    var ano = desde.getYear();

    // cogemos los valores actuales
    var fecha_hoy = hasta;
    var ahora_ano = fecha_hoy.getYear();
    var ahora_mes = fecha_hoy.getMonth()+1;
    var ahora_dia = fecha_hoy.getDate();

    // realizamos el calculo
    var edad = (ahora_ano + 1900) - ano;
    if ( ahora_mes < mes )
    {
        edad--;
    }
    if ((mes == ahora_mes) && (ahora_dia < dia))
    {
        edad--;
    }
    if (edad > 1900)
    {
        edad -= 1900;
    }

    // calculamos los meses
    var meses=0;
    if(ahora_mes>mes)
        meses=ahora_mes-mes;
    if(ahora_mes<mes)
        meses=12-(mes-ahora_mes);
    if(ahora_mes==mes && dia>ahora_dia)
        meses=11;

    // calculamos los dias
    var dias=0;
    if(ahora_dia>dia)
        dias=ahora_dia-dia;
    if(ahora_dia<dia)
    {
        ultimoDiaMes=new Date(ahora_ano, ahora_mes, 0);
        dias=ultimoDiaMes.getDate()-(dia-ahora_dia);
    }

    return edad + ' años ' + meses + ' meses ' + dias + ' dias';
}