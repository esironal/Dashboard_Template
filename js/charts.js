//declareer de variabelen
var chart;
var year;

//dit is de data voor 3 jaren
var data = {
    "2012":[1,2,3], 
    "2013":[8,5,6],    
    "2014":[3,4,2]
};

//maak een grafiek, noem hem 'chart', en plaats hem in de div die 'container' heet
//de opties spreken voor zich. je kunt bijv. by Type ook 'pie' of 'line' opgeven.
 
var $container = $('.chartcontainer'); 
 
chart = new Highcharts.Chart({
	chart: {
		renderTo: $container[0],
		type: 'column',
        height: 250,
		animation: {
            duration: 500
        }
	},
    credits: {
        enabled: false
    },
	title: {
		text: 'Fruit Consumption'
	},
	xAxis: {
		categories: ['Apples', 'Bananas', 'Oranges']
	},
	yAxis: {
		title: {
			text: 'Fruit eaten'
		}
	},
	series: [{
		name: 'Jane',
		//haal de data voor 2012 op uit de variabele 'data' en zet die in de grafiek
		data: data[2012].slice(0)
	}],
});        


//het stukje script hieronder zorgt dat de data ge-update wordt

//als de waarde van de selector verandert...
$('#selector').change(function(){

	//...dan krijgt 'year' de geselecteerde waarde...
	year = $('#selector').val();
	
	//...en zolang i kleiner is dan het aantal datapunten...
	for (var i = 0; i < data[year].length ; i++){ 
		
		//...wordt datapunt met nummer i in de grafiek ge-update.
		chart.series[0].data[i].update(data[year][i]);
		
		//i gaat telkens met 1 omhoog
		//er is ��n serie (serie 0) met drie datapunten (data[i])
		//elk punt krijgt de waarde van het corresponderende punt in de variabele 'data' 
	};	
});
