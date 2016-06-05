
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}
/**
 * Kreiraj nov EHR zapis za pacienta in dodaj osnovne demografske podatke.
 * V primeru uspešne akcije izpiši sporočilo s pridobljenim EHR ID, sicer
 * izpiši napako.
 */
 
function kreirajEHRzaBolnika() {
	var sessionId = getSessionId();

	var ime = $("#kreirajIme").val();
	var priimek = $("#kreirajPriimek").val();
	var datumRojstva = $("#kreirajDatumRojstva").val();
	$("#name").text(ime+" "+priimek);
	var starost = getAge(datumRojstva);
	$("#starost").text(starost);
	

	if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 ||
      priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
		$("#kreirajSporocilo").html("<span class='obvestilo label " +
      "label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		$.ajax({
		    url: baseUrl + "/ehr",
		    type: 'POST',
		    success: function (data) {
		        var ehrId = data.ehrId;
		        var partyData = {
		            firstNames: ime,
		            lastNames: priimek,
		            dateOfBirth: datumRojstva,
		            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
		        };
		        $.ajax({
		            url: baseUrl + "/demographics/party",
		            type: 'POST',
		            contentType: 'application/json',
		            data: JSON.stringify(partyData),
		            success: function (party) {
		                if (party.action == 'CREATE') {
		                    $("#dodatnoSporocilo").text("Uspešno kreiran EHR");
                            $("#dodajVitalnoEHR").text(ehrId);
		                    document.getElementById("dodatnoSporocilo").setAttribute("style","color:green")
		                }
		            },
		            error: function(err) {
		            	$("#dodatnoSporocilo").text("Napaka '" +
                    JSON.parse(err.responseText).userMessage + "'!");
                    	document.getElementById("kreirajSporocilo1").setAttribute("style","color:red")
		            }
		        });
		    }
		});
	}
}

function getAge(dateString) 
{
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
    {
        age--;
    }
    return age;
}

/**
 * Za dodajanje vitalnih znakov pacienta je pripravljena kompozicija, ki
 * vključuje množico meritev vitalnih znakov (EHR ID, datum in ura,
 * telesna višina, telesna teža, sistolični in diastolični krvni tlak,
 * nasičenost krvi s kisikom in merilec).
 */
 function dodajMeritve() {
	var sessionId = getSessionId();

	var ehrId = $("#dodajVitalnoEHR").text();
	var datumInUra = $("#dodajVitalnoDatumInUra").val();
	var telesnaVisina = $("#dodajVitalnoTelesnaVisina").val();
	var telesnaTeza = $("#dodajVitalnoTelesnaTeza").val();
	var telesnaTemperatura = $("#dodajVitalnoTelesnaTemperatura").val();
	var sistolicniKrvniTlak = $("#dodajVitalnoKrvniTlakSistolicni").val();
	var diastolicniKrvniTlak = $("#dodajVitalnoKrvniTlakDiastolicni").val();
	var nasicenostKrviSKisikom = $("#dodajVitalnoNasicenostKrviSKisikom").val();
	var merilec = $("#dodajVitalnoMerilec").val();
	$("#bmi").text(parseFloat(calculateBMI(telesnaTeza, telesnaVisina)).toFixed(2));
	
	window.onload=function(){
            zingchart.exec('chartDiv', 'addplot', {
                data : {
                    values : [[80, 100]],
                    text : "My new plot"
                }
            });
    };
	var pressure = findRange(diastolicniKrvniTlak, sistolicniKrvniTlak);
	console.log(pressure);
	if (pressure!="normal"){
		$.ajax({
	    	     success: function(){
    	            $.ajax({
    	            	url: 'https://api.duckduckgo.com/?q='+pressure+'+blood+pressure&format=json&pretty=1',
    	            	type: 'GET',
    	            	dataType: 'jsonp',
    	            	
    	            	success: function(results){
    	            		
    	            		//for(var i=0; i<results.RelatedTopics.length; i++){
    	            			
    	            			$("#pritisok").append(results.RelatedTopics[0].Text);
    	            		//}
    	            	}
    	            })
    	        }
    	    });
	}else{
		
	}
	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": datumInUra,
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
		    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: merilec
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function (res) {
		        $("#kreirajSporocilo1").text(res.meta.href);
		        document.getElementById("kreirajSporocilo1").setAttribute("style","color:green");
		    },
		    error: function(err) {
		    	$("#kreirajSporocilo1").text(JSON.parse(err.responseText).userMessage + "'!");
		    	document.getElementById("kreirajSporocilo1").setAttribute("style","color:red")
		    }
		});
	}
	
	
}

function calculateBMI(weight, height){
	
	if(weight > 0 && height > 0){	
		var finalBmi = weight/(height/100*height/100);
	}
	return finalBmi;
}

function findRange(d, s){
	if(d<60 && s<90){
		var pritisok = "low";
	}else if(d>=60 && d<=80 && s>=90 && s<=120){
		var pritisok = "normal";
	}else if(d>80 && d<=90 && s>120 && s<=140){
		var pritisok = "pre-high";
	}else 
		var pritisok = "high";
		
	return pritisok;
}

function dodajExample(){
	$("#dodajVitalnoDatumInUra").text("1990-10-10T17:17");
	$("#dodajVitalnoTelesnaVisina").text("185");
	$("#dodajVitalnoTelesnaTeza").text("80");
	$("#dodajVitalnoTelesnaTemperatura").text("37");
	$("#dodajVitalnoKrvniTlakSistolicni").text("120");
}

/**
 * Pridobivanje vseh zgodovinskih podatkov meritev izbranih vitalnih znakov
 * (telesna temperatura, filtriranje telesne temperature in telesna teža).
 * Filtriranje telesne temperature je izvedena z AQL poizvedbo, ki se uporablja
 * za napredno iskanje po zdravstvenih podatkih.
 */



/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */

function generirajPodatke(stPacienta) {
	var name1;
	var name2;
	var birth;
	var ehrId;
	if(stPacienta == 1){
		name1 = "John";
		name2 = "Smith";
		birth = "1992-10-10";
	}else if(stPacienta == 2){
		name1 = "Daniel";
		name2 = "Kostov";
		birth = "1993-05-14";
	}else if(stPacienta == 3){
		name1 = "Jessica";
		name2 = "Chastain";
		birth = "1977-03-24";
	}

	var sessionId = getSessionId();

	$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	$.ajax({
	    url: baseUrl + "/ehr",
	    type: 'POST',
	    success: function (data) {
	        var ehrId = data.ehrId;
	        var partyData = {
	            firstNames: name1,
	            lastNames: name2,
	            dateOfBirth: birth,
	            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
	        };
	        $.ajax({
	            url: baseUrl + "/demographics/party",
	            type: 'POST',
	            contentType: 'application/json',
	            data: JSON.stringify(partyData),
	            success: function (party) {
	                if (party.action == 'CREATE') {
	                    if(stPacienta == 1){
							$("#prviPacient").val(ehrId);
						}else if(stPacienta == 2){
							$("#drugiPacient").val(ehrId);
						}else if(stPacienta == 3){
							$("#tretiPacient").val(ehrId);
						}
						                }
	            },
	            error: function(err) {
	            }
	        });
	    }
	});
	

  return ehrId;
}

function generirajPacientovGumb(){
	$("#prviPacient").val(generirajPodatke("1"));
	$("#drugiPacient").val(generirajPodatke("2"));
	$("#tretiPacient").val(generirajPodatke("3"));

	document.getElementById("error7").innerHTML = "Generiranje pacientov je bilo uspešno";
	document.getElementById("error7").style.color = "blue";
	
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikaci
//-----------WHAT TO DO--------------------------------------------------------------------------
// series -> type "scatter" -> values tie da gi nadopolnam odkoga ke vnesam!!!!