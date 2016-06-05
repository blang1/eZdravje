
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
window.rezultati1 = new Array(4);
window.rezultati2 = new Array(4);
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
	$("#SpO2").text(nasicenostKrviSKisikom);

	var pressure = findRange(diastolicniKrvniTlak, sistolicniKrvniTlak);
	$("#stanje").text(pressure+" blood pressure");
	if (pressure!="normal"){
		$.ajax({
	    	     success: function(){
    	            $.ajax({
    	            	url: 'https://api.duckduckgo.com/?q='+pressure+'+blood+pressure&format=json&pretty=1',
    	            	type: 'GET',
    	            	dataType: 'jsonp',
    	            	
    	            	success: function(results){
    	            		$("#pritisok").empty();
    	            		for(var i=0; i<results.RelatedTopics.length; i++){
    	            			
    	            			$("#pritisok").append(results.RelatedTopics[i].Result);
    	            		}
    	            	}
    	            })
    	        }
    	    });
	}else{
		$("#pritisok").append("Vaš tlak je normalan! Keep workin!")
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
							$("#prviPacient").html(ehrId);
							dodajDrugeVitalneZnake("1",ehrId);
							preberiVitalnePodatke(ehrId);
						}else if(stPacienta == 2){
							$("#drugiPacient").html(ehrId);
							dodajDrugeVitalneZnake("2", ehrId);
							//preberiVitalnePodatke(ehrId);
						}else if(stPacienta == 3){
							$("#tretiPacient").html(ehrId);
							dodajDrugeVitalneZnake("3", ehrId);
							//preberiVitalnePodatke(ehrId);
						}
						                }
	            },
	            error: function(err) {
	            }
	        });
	    }
	});
}

function generirajPacientovGumb(){
	generirajPodatke("1");
	generirajPodatke("2");
	generirajPodatke("3");
}
function dodajDrugeVitalneZnake(stPacienta, ehrId) {
	var sessionId = getSessionId();
	
	var data = new Array(4);
	var sistolicen = new Array(4);
	var diastolicen = new Array(4);
	var visina = new Array(4);
	var temperatura = new Array(4);
	var tezina = new Array(4);
	//console.log(ehrId);

	
	if(stPacienta=="1"){
			data[0] = "2013-5-13T10:10";
			data[1] = "2014-5-1T12:27";
			data[2] = "2015-10-28T23:30";
			data[3] = "2016-1-1T13:17";
			diastolicen[0] = 60;
			diastolicen[1] = 80;
			diastolicen[2] = 90;
			diastolicen[3] = 66;
			sistolicen[0] = 90;
			sistolicen[1] = 126;
			sistolicen[2] = 130;
			sistolicen[3] = 100;
			visina[0] = 180;
			visina[1] = 181;
			visina[2] = 189;
			visina[3] = 190;
			temperatura[0] = 36;
			temperatura[1] = 37.5;
			temperatura[2] = 36,7;
			temperatura[3] = 40;
			tezina[0] = 100;
			tezina[1] = 70;
			tezina[2] = 120;
			tezina[3] = 85;
	}if(stPacienta=="2"){
			data[0] = "2013-5-13T10:10";
			data[1] = "2014-5-1T12:27";
			data[2] = "2015-10-28T23:30";
			data[3] = "2016-1-1T13:17";
			diastolicen[0] = 80;
			diastolicen[1] = 70;
			diastolicen[2] = 65;
			diastolicen[3] = 75;
			sistolicen[0] = 130;
			sistolicen[1] = 200;
			sistolicen[2] = 186;
			sistolicen[3] = 190;
			visina[0] = 190;
			visina[1] = 195;
			visina[2] = 192;
			visina[3] = 200;
			temperatura[0] = 37;
			temperatura[1] = 35;
			temperatura[2] = 35,7;
			temperatura[3] = 43;
			tezina[0] = 130;
			tezina[1] = 70;
			tezina[2] = 100;
			tezina[3] = 90;
}else if(stPacienta=="3"){
			data[0] = "2013-5-13T10:10";
			data[1] = "2014-5-1T12:27";
			data[2] = "2015-10-28T23:30";
			data[3] = "2016-1-1T13:17";
			diastolicen[0] = 70;
			diastolicen[1] = 55;
			diastolicen[2] = 57;
			diastolicen[3] = 68;
			sistolicen[0] = 93;
			sistolicen[1] = 80;
			sistolicen[2] = 140;
			sistolicen[3] = 100;
			visina[0] = 160;
			visina[1] = 162;
			visina[2] = 180;
			visina[3] = 182;
			temperatura[0] = 35;
			temperatura[1] = 42;
			temperatura[2] = 36;
			temperatura[3] = 38,5;
			tezina[0] = 60;
			tezina[1] = 70;
			tezina[2] = 55;
			tezina[3] = 76;
}
	
	for(var i = 0; i < 4; i++) {
		 $.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		
		var podatki = {
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "ctx/time": data[i],
		    "vital_signs/height_length/any_event/body_height_length": visina[i],
		    "vital_signs/body_weight/any_event/body_weight": tezina[i],
		   	"vital_signs/body_temperature/any_event/temperature|magnitude": temperatura[i],
		    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
		    "vital_signs/blood_pressure/any_event/systolic": sistolicen[i],
		    "vital_signs/blood_pressure/any_event/diastolic": diastolicen[i]
		};
		
		var parameters = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: 'Someone'
		};
		
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parameters),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    async: false 
		});
	}	
	
}

// function preberiVitalnePodatke(ehrId){
// 	sessionId = getSessionId();

// 	console.log(ehrId);
	
// 	if (ehrId){
// 		$.ajax({
// 			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
// 	    	type: 'GET',
// 	    	headers: {"Ehr-Session": sessionId},
// 	    	success: function (data) {
// 				var party = data.party;
// 				$("#name").html(party.frirstNames+" "+party.lastNames);

// 				$.ajax({
//   				    url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
// 				    type: 'GET',
// 				    headers: {"Ehr-Session": sessionId},
// 				    success: function (res) {
// 				    	if (res.length > 0) {
// 					        for (var i in res) {
// 					            window.rezultati1[i]=res[i].systolic;
// 					        }
// 				    	}
// 				    },
// 				    error: function() {
// 				    }
// 				});

// 				$.ajax({
// 				    url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure",
// 				    type: 'GET',
// 				    headers: {"Ehr-Session": sessionId},
// 				    success: function (res) {
// 				    	if (res.length > 0) {
// 					        for (var i in res) {
// 					            window.rezultati2[i]=res[i].diastolic;
// 					        }
// 				    	} 
// 				    },
// 				    error: function() {
// 				    }
// 				});
// 	    	},
// 	    	error: function(err) {
// 	    	}
// 		});
// 	}
// 	// for(var j in rezultati2)
// 	// 	console.log("toa-> "+rezultati2[j]);
	
// }

// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikaci
//-----------WHAT TO DO--------------------------------------------------------------------------
// series -> type "scatter" -> values tie da gi nadopolnam odkoga ke vnesam!!!!