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
zingchart.THEME="classic";
var colors = {
    gray : "#EBEBEB",
    
    grayDark : "#3F3F3F"
};
 
 
function randomVal(min, max, num){
    var aData = [];
    for(var i = 0 ; i < num; i++){
        var val = ((Math.random() * (max-min)) + min);
        aData.push(parseInt(val));
    }
    return aData;
}
 
zingchart.THEME="classic";
var colors = {
    gray : "#EBEBEB",
    
    grayDark : "#3F3F3F"
};


function randomVal(min, max, num){
    var aData = [];
    for(var i = 0 ; i < num; i++){
        var val = ((Math.random() * (max-min)) + min);
        aData.push(parseInt(val));
    }
    return aData;
}

var myConfig = {
    type : 'area',
    backgroundColor : "#FFF",

    plot : {
        aspect : 'spline',
        lineColor : "rgba(151,187,205,1)",
        lineWidth : "2px",
        backgroundColor2 : "rgba(151,187,205,1)",
        marker : {
            backgroundColor : "rgba(151,187,205,1)",
            borderColor : "white",
            shadow : false
        }
    },
    plotarea : {
        backgroundColor : "white"
    },
    scaleX : {
      lineColor : colors.gray,
      lineWidth : "1px",
    },
    scaleY : {
      lineColor : colors.gray,
      lineWidth : "1px",
      step:10,
      tick : {
          lineColor : "#C7C7C7",
          lineWidth : "1px"
      },
      item : {
          color: colors.grayDark
      }
    },
    series : [
        {
			values : [70, 55, 57, 68]
        
		}
    ]
}
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

    zingchart.render({
        id : 'myChart',
        data : myConfig,
        hideprogresslogo : true,
        height : 400
    })
   };

