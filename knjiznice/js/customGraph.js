  var chartData={
        "type":"mixed",
        "title":{
            "text":"Sistolični in diastolični krvni tlak"
        },
        "plotarea":{
            "margin-left":70
        },
        "scaleX":{
            "min-value":40,
            "max-value":100,
            "step":1,
            "max-labels":7,
            "label":{
                "text":"Diastolični tlak"
            },
            "guide":{
                "line-style":"solid",
                "line-color":"#000"
            }
        },
        "scaleY":{
            "values":"70:190:10",
            "label":{
                "text":"Sistolični tlak"
            },
            "guide":{
                "line-style":"solid",
                "line-color":"#000"
            }
        },
        "series":[
            {
                "type":"area",
                "aspect":"stepped",
                "values":[190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190,190],
                "alpha-area":0.8,
                "line-color":"red",
                "line-width":0,
                "background-color":"#123646",
                "hover-state":{
                    "visible":false
                },
                "marker":{
                    "visible":false
                },
                "tooltip":{
                    "visible":false
                }
            },
            {
                "type":"area",
                "aspect":"stepped",
                "values":[140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140,140],
                "alpha-area":0.8,
                "line-color":"yellow",
                "line-width":0,
                "background-color":"#1D6C8E",
                "hover-state":{
                    "visible":false
                },
                "marker":{
                    "visible":false
                },
                "tooltip":{
                    "visible":false
                }
            },
            {
                "type":"area",
                "aspect":"stepped",
                "values":[120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120,120],
                "alpha-area":0.7,
                "line-color":"green",
                "line-width":0,
                "background-color":"#3FC2FA",
                "hover-state":{
                    "visible":false
                },
                "marker":{
                    "visible":false
                },
                "tooltip":{
                    "visible":false
                }
            },
            {
                "type":"area",
                "aspect":"stepped",
                "values":[90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90,90],
                "alpha-area":0.7,
                "line-color":"purple",
                "line-width":0,
                "background-color":"#EAF2F6",
                "hover-state":{
                    "visible":false
                },
                "marker":{
                    "visible":false
                },
                "tooltip":{
                    "visible":false
                }
            }
            
        ]
        
  };

   window.onload=function(){// Render Method[2]
   $("#stanjeTlaka").bind('click', function() {
	zingchart.exec("chartDiv", "addplot", {
		"data":{
			"values":[[parseInt($("#dodajVitalnoKrvniTlakDiastolicni").val()), parseInt($("#dodajVitalnoKrvniTlakSistolicni").val())]],
			"marker":{
                    "size":5,
                    "background-color":"white"
                }
		}
	});
  });
    zingchart.render({ 
      id:'chartDiv',
      data:chartData,
      height:400,
      width:600
    });
   };
