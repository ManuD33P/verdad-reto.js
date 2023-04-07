/*
   Script verdad o reto by Manu16

 Nota: Los retos, y preguntas se guardaran en un archivo en la carpeta data, para volver a ser utilizados en el proximo juego.
       por lo cual pueden decidir si jugar una partida con retos desde 0, o agregar 
       nuevos retos y preguntas, mas las preguntas y retos anteriores.

*/

function onLoad(){
    print("Script Verdad o Reto by Manu16");
}
var datos = {
    retos : {
      msg: [],
      add: function(string){ 
       for(var i in this.msg){
        if(string==this.msg[i]){
            print("Ese reto ya existe");
        }
       }
       this.msg.push(string);
       return print("Reto agregado con éxito        Toltal: "+this.msg.length);
      },
      enviar: function(){ 
       var temp = Math.floor(Math.random()*this.msg.length);
       return this.msg[temp];
      },
      cargar: function(){
        var temp = [];
        temp = JSON.parse(File.load("retos.txt"));
        for(var i in temp){
          this.add(temp[i]);
        }
      }
    },
    verdades:{
     msg:[],
     add: function(string){
        for(var i in this.msg){
            if(string==this.msg[i]){
                return print("Ese pregunta ya existe");
            }
           }
           this.msg.push(string);
           return print("Verdad agregado con éxito        Toltal: "+this.msg.length);
     },
     enviar: function(){
        var temp = Math.floor(Math.random()*this.msg.length);
        return this.msg[temp];
     },
     cargar: function(){
        var temp = [];
        temp = JSON.parse(File.load("preguntas.txt"));
        for(var i in temp){
          this.add(temp[i]);
        }
      }
    },
}

var jugadores = {
    data: [],
    actual:[],
    add:function(obj){
        for(var i in this.data){
            if(obj.name==this.data[i].name){
                return print(obj,"Ya estas incluido en la lista de participantes.");
            }
        }
         this.data.push(obj);
         print(obj.name+" Ha entrado al juego");
         return print(obj,"El juego comenzara en unos minutos...");
    },
    eliminar: function(obj){
    for(var i in this.data){
        if(obj.name==this.data[i].name){
            this.data.splice(i,1);
        }
    } 
    return print(obj,"No estas como participante, puedes irte tranquilo");
    },
    obtener: function(){
        this.actual.push(this.data[Math.floor(Math.random()*this.data.length)])
        return this.actual[0];
    },
    limpiar: function(){
      this.data = [];
    },
    votacion: function(){
        Users.local(function(u){
            for(var i in this.data){
                if(this.data[i].name==u.name){
                    u.votacion==true;
                }
            }
        })
    },
}

var juego = false; // boleano para activar el recibimiento de las preguntas.
var contesto= false; // boleano global para interactucar con la funcion ontextbefore y el objeto game.
var decision=0; // -1 no cumplio, +1/0 si cumplio.
var votacion=false;
var game = {
  start: function(){
   print("El juego empezara en 1 min...");
   print("Si es la primera vez que juegan, agregen preguntas y retos #pregunta +la pregunta / #reto +el reto");
   print("Para cargar preguntas y retos guardados #viejos si/no");
   print("La votación esta abierta solo para los participantes.");
   print("Para participar #juego");
   print("IMPORTANTE!!!: La penalización por no cumplir es la descalificación del juego.");
   juego =true;
  },
  votacion:{
    votantes:[],
    positivo:0,
    negativo:0,
    restablecer:function(){
      this.negativo=0;
      this.positivo=0;
      votantes = [];
    },
    sumar: function(u,estado){
      for(var i in this.votantes){
       if(this.votantes[i].name==u.name){
        return("Ya votaste una vez");
       }
      }
      switch(estado){
        case true:
          this.positivo +=1
          this.votantes.push(u);
          return print("\x0301\x06 El jugador "+u.name+" ah votado positivamente");
          case false:
            this.negativo +=1
            this.votantes.push(u);
            return print("\x0301\x06 El jugador "+u.name+" ah votado negativamente");
      }
      
    },
    obtenerResultados: function(){
      if(this.positivo >= this.negativo){
        return true
      } else { return false }
    }
  },
  stop: function(){
   juego=false;
   File.save("preguntas.txt",JSON.stringify(datos.verdades.msg));
   File.save("retos.txt",JSON.stringify(datos.retos.msg));
   jugadores.limpiar();
   return print("El juego ha finalizado y los datos han sido guardados para el proximo juego.");
  },
  accion: function(estado){ 
    /*
    1- preguntar si verdad o reto
    2- enviar reto
    3- enviar verdad
    5- comprobar si cumplio
    4- penalizar al jugador y llamar al 1 de nuevo.
    */
   switch(estado){
    case 1:

    var player = jugadores.obtener();
     contesto=false;
     print("\x06\x0301(i) "+player.name+" VERDAD o RETO?... 60s para contestar");
     accion2=true;
     break;
    case 2:
     var player = jugadores.actual[0];
     var mensaje = datos.retos.enviar();
     print("\x06\x0301 (i) "+player.name+" RETO: "+mensaje);
     cyclo=0;
     accion2=true;
   
    break;
    case 3:
        var player = jugadores.actual[0];
        var mensaje = datos.verdades.enviar();
        print("\x06\x0301 (i) "+player.name+" Verdad: "+mensaje);
        cyclo=0;
        accion2=true;
        break;
    case 4:
     print("El jugador: "+jugadores.actual[0].name+" es eliminado por no contestar a tiempo o no cumplir con el juego.");
     print("10 segundos para elegir un nuevo jugador.")
     jugadores.eliminar(jugadores.actual[0]);
     jugadores.actual=[];
     break;
    case 5:
      votacion=true;
      print("\x0301\x06 Empieza la votación... 30s para votar");
      print("\x0301\x06 Para votar \x0304#cumplio / #nocumplio");
      print("\x0301\x06 La votación solo esta abierta para participantes del juego.");

      accion5=true;
     break;
   }

  }
}
var cyclo =0;
var accion1=false;
var accion2=false;
var accion4=false;
var accion5=false;
function onTimer(){
if(juego==true){
cyclo++
if(cyclo==30){
if(accion5==true){
  var estado = game.votacion.obtenerResultados();
  switch(estado){
    case true:
      print("La votación salio positiva. 10s para elejir la proxima victima.");
      cyclo=49;
      votacion=false;
      game.votacion.restablecer();
      accion5=false;
    accion1=false;
    break;
    case false:
      game.accion(4);
      cyclo=49;
      accion5=false;
      accion1=false;
      break;
  }
}
}
if(cyclo==60){
  if(accion1==false){
  if(jugadores.data.length>0){
    accion1=true;
    game.accion(1);
    cyclo=0;
  } else{
    cyclo=0;
  }
  } else if(accion2==true){
    if(contesto==true){
      contesto=false;
      game.accion(5);
      accion2=false;
      cyclo=0;
    } else if( contesto==false){
      game.accion(4);
      accion1=false;
      cyclo=49;
    }
}
}
}
}
function onTextBefore(u, text) { 
    if(juego==true){
        if(contesto==false){
          if(jugadores.actual.length>0){
  if(u.name==jugadores.actual[0].name){
    if(text=='RETO' || text =='reto'){
        contesto=true;
        game.accion(2);
    } else if(text=='VERDAD' || text=='verdad'){
        contesto=true;
        game.accion(3);
    }
  }
}
}
}
    return text; }
function onCommand(u,cmd,target,args){  // #verdad +string | #reto +string | #juego | #cumplio / #nocumplio | #viejos si/no
  if(juego==true){
   if(cmd=='juego'){
    jugadores.add(u);
   }
 if(votacion==true){
   if(cmd=='cumplio'){
    game.votacion.sumar(u,true);
   }
   if(cmd=='nocumplio'){
    game.votacion.sumar(u,false);
   }
}
   if(cmd.substr(0,7)=='verdad '){
    var temp = cmd.substr(7);
    datos.verdades.add(temp);
   }
   if(cmd.substr(0,5)=='reto '){
    var temp = cmd.substr(5);
    datos.retos.add(temp);
   } 
   if(cmd.substr(0,7)=='viejos '){
     if(cmd.substr(7)=='si'){
       datos.retos.cargar();
       datos.verdades.cargar();
     }else if(cmd.substr(7)=='no'){
      print("retos viejos, y preguntas no cargadas, recorda que puedes agregarlas en cualquier momento del juego.");
     }
   }
  }
  if(cmd=='startGame'){
   if(juego==true){
    print("El juego esta actualmente en proceso. para participar #juego");
   } else {
    game.start();
   }
  }
  if(cmd=='stopGame'){
   if(juego==true){
    game.stop();
   } else{
    print("El juego esta actualmente detenido, para empesar el juego #startGame");
   }
  }
}