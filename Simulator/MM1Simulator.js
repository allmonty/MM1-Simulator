//Taxas de chegada e serviços dos clientes
var LAMBDA1 = 1/5;
var LAMBDA2 = 1/5;
var MU1 	= 1;
var MU2 	= 1;

//Variaveis nescessárias para rodar a simulação
var nextClient 		= 0;
var currentClient 	= 0;

var arrivalTime 	= 0;
var serviceTime 	= 0;

var totalTime 		= 0;

//Tempo total que da simulação 
const simulationTime = 100000;

const CLIENT_TYPE_0 = 0;	
const CLIENT_TYPE_1 = 1;	

//Arrays que guardam os tempos de chegada e saída dos clientes do sistema
var arrayArrivals 	= [];
var arrayServices 	= [];
var arrayArrivalsA 	= [];
var arrayServicesA 	= [];
var arrayArrivalsB 	= [];
var arrayServicesB 	= [];

//Array que guarda os tempos de serviços residuais do servidor quando um cliente chega no sistema 
var arrayResidualServicesA 	= [];
var arrayResidualServicesB 	= [];

//Array das filas (no caso FCFS sem distinção de classe só é utilizada a queueA)
var queueA = [];
var queueB = [];

//Array que armazena os tempos de serviço dos clientes
var ServiceTimesA = [];
var ServiceTimesB = [];

//Array que guarda o inicio e o fim dos períodos ocupados
var startOfBusyPeriod 	= [];
var endOfBusyPeriod 	= [];

//Array que guarda quantas pessoas se encontram no sistema a cada chegada
var numberOfClientsInQueue 	= [];

var metrics = {
	T : 0.0,
	T1: 0.0,
	T2: 0.0,
	W: 0.0,
	W1: 0.0,
	W2: 0.0,
	Xr: 0.0,
	Xr1: 0.0,
	Xr2: 0.0,
	X: 0.0,
	X1: 0.0,
	X2: 0.0,
	U: 0.0,
	B: 0.0,
	N: 0.0
}

var nextClientType = function(){

	var rand = Math.random();
	var probabilityOfClient1 = LAMBDA1/(LAMBDA1 + LAMBDA2);

	if (rand < probabilityOfClient1) {
		return CLIENT_TYPE_0;
	}else{
		return CLIENT_TYPE_1;
	}
}

var nextPoisson = function(rate){
	return -Math.log(1.0 - Math.random()) / rate;
}

var nextEventScenario1 = function(){

	var nextArrival = arrivalTime;
    var nextService = serviceTime;

    // Arrival
    if(nextArrival == 0){

    	if (nextClientType() == CLIENT_TYPE_0) {
    		nextArrival = nextPoisson(LAMBDA1 + LAMBDA2);
    		nextClient = CLIENT_TYPE_0;
    	}else{
    		nextArrival = nextPoisson(LAMBDA1 + LAMBDA2);
    		nextClient = CLIENT_TYPE_1; 
    	}

    }else{
    	// Exit
    	if (queueA.length != 0) {
			if (queueA[0] == CLIENT_TYPE_0) {
				nextService = nextPoisson(MU1);
				ServiceTimesA.push(nextService);
			}else{
				nextService = nextPoisson(MU2);
				ServiceTimesB.push(nextService);
			}
    	}

    }
    

    if (queueA.length == 0) {

    	if (totalTime != 0) {
    		endOfBusyPeriod.push(totalTime);
    	}
    	startOfBusyPeriod.push(totalTime + nextArrival);
    	numberOfClientsInQueue.push(0);
    	queueA.push(nextClient);

    	if (nextClient == CLIENT_TYPE_0) {
    		arrayArrivalsA.push(totalTime + nextArrival);
    		arrayResidualServicesA.push(0);
    	}else{
			arrayArrivalsB.push(totalTime + nextArrival);
			arrayResidualServicesB.push(0);
    	}

    	if (nextClientType() == CLIENT_TYPE_0) {
    		arrivalTime = nextPoisson(LAMBDA1 + LAMBDA2);
    		totalTime += nextArrival;
    		nextClient = CLIENT_TYPE_0;
    	}else{
    		arrivalTime = nextPoisson(LAMBDA1 + LAMBDA2);
    		totalTime += nextArrival;
    		nextClient = CLIENT_TYPE_0; 
    	}

    }else{
    	if (nextArrival < nextService) {

    		numberOfClientsInQueue.push(queueA.length);
    		queueA.push(nextClient);

    		if (nextClient == CLIENT_TYPE_0) {
    			arrayArrivalsA.push(totalTime + nextArrival);
    			arrayResidualServicesA.push(nextService - nextArrival);
    		}else{
				arrayArrivalsB.push(totalTime + nextArrival);
				arrayResidualServicesB.push(nextService - nextArrival);
    		}

    		arrivalTime = 0;
    		totalTime += nextArrival;
    		serviceTime = nextService - nextArrival;
    	
    	}else{

			if (queueA[0] == CLIENT_TYPE_0){
				arrayServicesA.push(totalTime + nextService);
			}else{
				arrayServicesB.push(totalTime + nextService);
			}

    		queueA.splice(0, 1);

    		serviceTime = 0;
    		arrivalTime = nextArrival - nextService;
    		totalTime += nextService;

    	}

    }

}


//###################################################################
//############################ CENARIO 2 ############################
//###################################################################


var nextEventScenario2 = function(){

	var nextArrival = arrivalTime;
    var nextService = serviceTime;

    // Arrival
    if(nextArrival == 0){

    	if (nextClientType() == CLIENT_TYPE_0) {
    		nextArrival = nextPoisson(LAMBDA1 + LAMBDA2);
    		nextClient = CLIENT_TYPE_0;
    	}else{
    		nextArrival = nextPoisson(LAMBDA1 + LAMBDA2);
    		nextClient = CLIENT_TYPE_1; 
    	}

    }else{
    	// Exit
    	if (queueA.length != 0) {
			nextService = nextPoisson(MU1);
			ServiceTimesA.push(nextService);
			currentClient = CLIENT_TYPE_0;
    	}else{
    		if (queueB.length != 0) {
    			nextService = nextPoisson(MU2);
    			ServiceTimesB.push(nextService);
    			currentClient = CLIENT_TYPE_1;
    		}
    	}

    }
    

    if (queueA.length == 0 && queueB.length == 0) {

    	if (totalTime != 0) {
    		endOfBusyPeriod.push(totalTime);
    	}
    	startOfBusyPeriod.push(totalTime + nextArrival);

    	numberOfClientsInQueue.push(0);
    	if(nextClient == CLIENT_TYPE_0){
	    	queueA.push(nextClient);
	    	arrayArrivalsA.push(totalTime + nextArrival);
	    	arrayResidualServicesA.push(0);
    	}else{
	    	queueB.push(nextClient);
	    	arrayArrivalsB.push(totalTime + nextArrival);
	    	arrayResidualServicesB.push(0);
    	}

    	if (nextClientType() == CLIENT_TYPE_0) {
    		arrivalTime = nextPoisson(LAMBDA1 + LAMBDA2);
    		totalTime += nextArrival;
    		nextClient = CLIENT_TYPE_0;
    	}else{
    		arrivalTime = nextPoisson(LAMBDA1 + LAMBDA2);
    		totalTime += nextArrival;
    		nextClient = CLIENT_TYPE_1; 
    	}

    }else{
    	if (nextArrival < nextService) {

    		numberOfClientsInQueue.push(queueA.length + queueB.length);
			if(nextClient == CLIENT_TYPE_0){
	    		queueA.push(nextClient);
    		    arrayArrivalsA.push(totalTime + nextArrival);
    		    arrayResidualServicesA.push(nextService - nextArrival);
    		}else{
	    		queueB.push(nextClient);
	    		arrayArrivalsB.push(totalTime + nextArrival);
    		    arrayResidualServicesB.push(nextService - nextArrival);
    		}
    		arrivalTime = 0;
    		totalTime += nextArrival;
    		serviceTime = nextService - nextArrival;
    	
    	}else{

    		if (currentClient == CLIENT_TYPE_0) {
				queueA.splice(0, 1);
    			arrayServicesA.push(totalTime + nextService);
    			serviceTime = 0;
    			arrivalTime = nextArrival - nextService;
    			totalTime += nextService;

    		}else{
    			queueB.splice(0, 1);
	    		arrayServicesB.push(totalTime + nextService);
    			serviceTime = 0;
    			arrivalTime = nextArrival - nextService;
    			totalTime += nextService;
    		}
    		
    	}

    }

}

//###################################################################
//######################## FIM DO CENARIO 2 #########################
//###################################################################

var calculateAverages = function(){

	metrics.T = 0;
    metrics.T1 = 0;
    metrics.T2 = 0;

    for(var i = 0; i< arrayServicesA.length ; i++){
     	metrics.T1 += (arrayServicesA[i]  - arrayArrivalsA[i]);
    }
    metrics.T = metrics.T1;
    metrics.T1 = metrics.T1/arrayServicesA.length;

    //Tempo médio dos clientes tipo 1 no sistema
	console.log("E[T1]", metrics.T1);

    for(var i = 0; i< arrayServicesB.length ; i++){
     	metrics.T2 += (arrayServicesB[i]  - arrayArrivalsB[i]);
    }
    metrics.T += metrics.T2;
    metrics.T2 = metrics.T2/arrayServicesB.length;

    metrics.T = metrics.T/(arrayServicesA.length + arrayResidualServicesB.length);

    //Tempo médio dos clientes tipo 2 no sistema
	console.log("E[T2]", metrics.T2);

	//Tempo médio dos clientes no sistema
	console.log("E[T]", metrics.T);

	metrics.W = 0;
	metrics.W1 = 0;
	metrics.W2 = 0;

	for(var i = 0; i< arrayServicesA.length; i++){
     	metrics.W1 += (arrayServicesA[i]  - (arrayArrivalsA[i] + ServiceTimesA[i]));
    }
    metrics.W = metrics.W1;

    for(var i = 0; i< arrayServicesB.length ; i++){
     	metrics.W2 += (arrayServicesB[i]  - (arrayArrivalsB[i] + ServiceTimesB[i]));
    }
    metrics.W += metrics.W2;

    metrics.W = metrics.W/(arrayServicesA.length + arrayServicesB.length);
    metrics.W1 = metrics.W1/(arrayServicesA.length);
    metrics.W2 = metrics.W2/(arrayServicesB.length);

	console.log("E[W1]", metrics.W1);
	console.log("E[W2]", metrics.W2);
	console.log("E[W]", metrics.W);

	metrics.Xr = 0;
	metrics.Xr1 = 0;
	metrics.Xr2 = 0;

	for(var i = 0; i< arrayResidualServicesA.length ; i++){
     	metrics.Xr += (arrayResidualServicesA[i]);
    }
    metrics.Xr1 = metrics.Xr/(arrayResidualServicesA.length);

    for(var i = 0; i< arrayResidualServicesB.length ; i++){
     	metrics.Xr += (arrayResidualServicesB[i]);
     	metrics.Xr2 += (arrayResidualServicesB[i]);
    }
    metrics.Xr2 = metrics.Xr2/(arrayResidualServicesB.length);

    metrics.Xr = metrics.Xr/(arrayResidualServicesA.length + arrayResidualServicesB.length);

	console.log("E[Xr1]", metrics.Xr1);
	console.log("E[Xr2]", metrics.Xr2);
	console.log("E[Xr]", metrics.Xr);

	metrics.X = 0;
	metrics.X1 = 0;
	metrics.X2 = 0;

	for(var i = 0; i< ServiceTimesA.length ; i++){
     	metrics.X += ServiceTimesA[i];
    }
    metrics.X1 = metrics.X/(ServiceTimesA.length);

	for(var i = 0; i< ServiceTimesB.length ; i++){
     	metrics.X 	+= ServiceTimesB[i];
     	metrics.X2 	+= ServiceTimesB[i];
    }
    metrics.X2 = metrics.X2/ServiceTimesB.length;

    metrics.X = metrics.X/(ServiceTimesA.length + ServiceTimesB.length);

	console.log("E[X1]", metrics.X1);
	console.log("E[X2]", metrics.X2);
	console.log("E[X]", metrics.X);

	metrics.U = 0;
    for(var i = 0; i< numberOfClientsInQueue.length ; i++){
     	metrics.U += (numberOfClientsInQueue[i] * metrics.X);
    }
    metrics.U = metrics.U/numberOfClientsInQueue.length;

	console.log("E[U]", metrics.U);

	metrics.B = 0;

	for(var i = 0; i< endOfBusyPeriod.length ; i++){
     	metrics.B += endOfBusyPeriod[i] - startOfBusyPeriod[i];
    }
    metrics.B = metrics.B/endOfBusyPeriod.length;

	console.log("E[B]", metrics.B);

	metrics.N = 0;

	for(var i = 0; i< numberOfClientsInQueue.length ; i++){
     	metrics.N += numberOfClientsInQueue[i];
    }
    metrics.N = metrics.N/numberOfClientsInQueue.length;

	console.log("E[N]", metrics.N);
}

var startScenario1 = function(){
	while(totalTime < simulationTime){
		nextEventScenario1();
	}
	calculateAverages();
}

var startScenario2 = function(){
	while(totalTime < simulationTime){
		nextEventScenario2();
	}
	calculateAverages();
}