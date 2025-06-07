/// VARIABLES GLOBALES
let retrofont; //LETRA CON ESTILO RETRO-VIDEOJUEGO
let juegoW = 880;
let juegoH = 650;
let escala;
let offsetX, offsetY;

// Variables de juego
let jugador;
let imgJugadorAbajo, imgJugadorArriba, imgJugadorDerecha, imgJugadorIzquierda;
let imgProyectil;
let imgEnemigo1, imgEnemigo2, imgMeteorito;
let imgFondoInicio, imgFondoJuego;
let imgEstrella;
let imgGameOver;
let nivel = 1;
let vidas = 3;
let puntaje = 0;
let estado = "inicio";
let tops = [];
let disparos = [];
let disparosNeg = [];
let enemigos = [];
let estrellas = [];
let tiempoUltimaEstrella = 0;
let intervaloEstrellas = 15000;
let sonidoDisparo;

let tiempoTransicion = 0;
let mostrarTransicion = false;
let imgVictoria; 
let nombreJugador = "";
let ingresandoNombre = false;
let oleadaNivel1 = 1; // Controla cuántos grupos de enemigos van en el nivel 1
let oleadaNivel2 = 1;
let oleadaNivel3 = 1;






// Música
let musicaFondo;
let musicaIniciada = false;

function preload() {
  imgJugadorAbajo = loadImage("HamsterAbajo.png");
  imgJugadorArriba = loadImage("HamsterArriba.png");
  imgJugadorDerecha = loadImage("HamsterDerecha.png");
  imgJugadorIzquierda = loadImage("HamsterIzquierda.png");
  imgEnemigo1 = loadImage("Enemigo1.png");
  imgEnemigo2 = loadImage("Enemigo2.png");
  imgMeteorito = loadImage("meteorito.png");
  imgFondoInicio = loadImage("fondo.png");
  imgFondoJuego = loadImage("fondoNivel.png");
  imgProyectil = loadImage("banana.png");
  imgEstrella = loadImage("estrella.png");
  imgGameOver = loadImage("GameOver.png");
  sonidoDisparo = loadSound("bala.mp3");
  musicaFondo = loadSound("GetLuck.mp3");
  retrofont = loadFont("PressStart2P-Regular.ttf");
  imgVictoria = loadImage("Victoria.png"); 
  imgJefe = loadImage("jefe.png");
  imgTransicion1 = loadImage("transicion1.png"); // Nivel 1 a 2
  imgTransicion2 = loadImage("transicion2.png"); // Nivel 1 a 2

}

function setup() {
  createCanvas(880, 650);
  textFont(retrofont);
  escala = min(width / juegoW, height / juegoH) * 0.9;
  offsetX = (width - juegoW * escala) / 2;
  offsetY = (height - juegoH * escala) / 2;
  smooth();
  noStroke();
  jugador = new Nave();
  cargarTop();
  generarEnemigos();
  tiempoUltimaEstrella = millis();
}

function draw() {
  background(0);
  noFill();
  stroke(100);
  rect(offsetX, offsetY, juegoW * escala, juegoH * escala);
  dibujarJuego();

  if (estado === "jugando") {
    if (!musicaIniciada) {
      musicaFondo.setVolume(0.3);
      musicaFondo.loop();
      musicaIniciada = true;
    }
  } else {
    if (musicaIniciada) {
      musicaFondo.stop();
      musicaIniciada = false;
    }
  }
}

function dibujarJuego() {
  if (estado === "fin") {
    // Estas imágenes deben estar fuera del push/scale/translate
    if (nivel === 3 && enemigos.length === 0) {
      mostrarVictoria();
    } else {
      mostrarGameOver();
    }
    return; // Salimos antes de hacer push/scale
  }

  push();
  translate(offsetX, offsetY);
  scale(escala);

  if (estado === "inicio") {
    image(imgFondoInicio, 0, 0, juegoW, juegoH);
  } else if (estado === "jugando") {
    image(imgFondoJuego, 0, 0, juegoW, juegoH);
    actualizarJuego();
  } else if (estado === "transicion") {
    image(imgFondoJuego, 0, 0, juegoW, juegoH);
    mostrarTransicionNivel();
    if (millis() - tiempoTransicion > 2000) {
      mostrarTransicion = false;
      nivel++;
      if (nivel > 3) {
        guardarPuntaje();
        estado = "fin";
      } else {
        generarEnemigos();
        estado = "jugando";
      }
    }
  }

  pop();
}


class Nave {
  constructor() {
    this.x = juegoW / 2;
    this.y = juegoH - 80;
    this.dir = 0;
    this.velocidad = 5;
    this.direccion = "abajo";
    this.ancho = 60;
    this.alto = 60;
  }

  mover() {
    this.x = constrain(
      this.x + this.dir * this.velocidad,
      this.ancho / 2,
      juegoW - this.ancho / 2
    );
    if (keyIsDown(LEFT_ARROW)) this.direccion = "izquierda";
    else if (keyIsDown(RIGHT_ARROW)) this.direccion = "derecha";
    else this.direccion = "abajo";
  }

  mostrar() {
    imageMode(CENTER);
    switch (this.direccion) {
      case "izquierda":
        image(imgJugadorIzquierda, this.x, this.y, this.ancho, this.alto);
        break;
      case "derecha":
        image(imgJugadorDerecha, this.x, this.y, this.ancho, this.alto);
        break;
      case "arriba":
        image(imgJugadorArriba, this.x, this.y, this.ancho, this.alto);
        break;
      default:
        image(imgJugadorAbajo, this.x, this.y, this.ancho, this.alto);
    }
  }
}

class Enemigo {
  constructor(nivel) {
    this.x = random(50, juegoW - 50);
    this.y = random(-200, -40);
    this.dir = random([-1, 1]);
    this.vel = 0.5 + nivel * 0.2;
    this.tipo = this.determinarTipo(nivel);
    this.vida =
      this.tipo === "meteorito" ? 3 : nivel >= 2 && random() < 0.3 ? 3 : 1;
    this.puntaje = this.tipo === "meteorito" ? 15 : this.vida === 3 ? 3 : 1;
    this.nivel = nivel;
    this.ancho = this.tipo === "meteorito" ? 50 : 60;
    this.alto = this.tipo === "meteorito" ? 50 : 80;
  }

  determinarTipo(nivel) {
    if (nivel >= 1 && random() < (nivel === 2 ? 0.1 : 0.15)) return "meteorito";
    return "normal";
  }

  mover() {
    if (this.tipo !== "meteorito") {
      this.x += this.dir * (this.nivel === 1 ? 0 : this.nivel === 2 ? 1.5 : 2);
      if (this.x < 0 || this.x > juegoW) this.dir *= -1;
      if (this.nivel === 3 && random() < 0.01) this.dir *= -1;
    }
    this.y += this.vel;
  }

  mostrar() {
    imageMode(CENTER);
    if (this.tipo === "meteorito")
      image(imgMeteorito, this.x, this.y, this.ancho, this.alto);
    else
      image(
        this.nivel >= 3 ? imgEnemigo2 : imgEnemigo1,
        this.x,
        this.y,
        this.ancho,
        this.alto
      );
  }

  disparar() {
    if (this.nivel >= 2 && this.tipo !== "meteorito" && random() < 0.01) {
      disparosNeg.push(new DisparoEnemigo(this.x, this.y));
    }
  }
}

class Estrella {
  constructor() {
    this.x = random(50, juegoW - 50);
    this.y = -30;
    this.vel = 2;
    this.ancho = 30;
    this.alto = 30;
    this.activa = true;
  }

  mover() {
    this.y += this.vel;
  }

  mostrar() {
    if (this.activa) {
      imageMode(CENTER);
      image(imgEstrella, this.x, this.y, this.ancho, this.alto);
    }
  }
}

class Disparo {
  constructor(x) {
    this.x = x;
    this.y = juegoH - 80;
    this.ancho = 15;
    this.alto = 30;
  }
  mover() {
    this.y -= 10;
  }
  mostrar() {
    image(imgProyectil, this.x, this.y, this.ancho, this.alto);
  }
}

class DisparoEnemigo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  mover() {
    this.y += 5;
  }
  mostrar() {
    stroke(255, 0, 0);
    strokeWeight(2);
    line(this.x, this.y, this.x, this.y + 15);
  }
}

function mostrarGameOver() {
  image(imgGameOver, 0, 0, juegoW, juegoH);
  push();
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(20);
  text(`Puntaje: ${puntaje}`, juegoW / 2, juegoH / 2 - 140);
  mostrarTop();
  
  
  if (ingresandoNombre) {
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textFont(retrofont);
  textSize(16);
  text("Escribe tu nombre y presiona ENTER:", juegoW / 2, juegoH / 2 + 150);
  text("> " + nombreJugador + "_", juegoW / 2, juegoH / 2 + 180);
  pop();
}


}

function mostrarVictoria() {
  image(imgVictoria, 0, 0, juegoW, juegoH);
  push();
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(32);
  text("¡HAS GANADO!", juegoW / 2, juegoH / 2 - 260);
  textSize(24);
  text(`Puntaje: ${puntaje}`, juegoW / 2, juegoH / 2 - 30);
  mostrarTop();
  textSize(16);
  pop();
  
  if (ingresandoNombre) {
  push();
  textFont(retrofont);
  textSize(16);
  textAlign(CENTER, CENTER);
  fill(255);
  text("Escribe tu nombre y presiona ENTER:", juegoW / 2, juegoH / 2 + 140);
  
  fill(0, 0, 0, 180); // fondo para el texto
  rectMode(CENTER);
  rect(juegoW / 2, juegoH / 2 + 180, 300, 40, 8); // caja con borde redondeado
  
  fill(255); // texto blanco
  text("> " + nombreJugador + "_", juegoW / 2, juegoH / 2 + 180);
  pop();
}


}



function actualizarJuego() {
  if (
    estrellas.length < nivel &&
    millis() - tiempoUltimaEstrella > intervaloEstrellas
  ) {
    estrellas.push(new Estrella());
    tiempoUltimaEstrella = millis();
  }

  for (let i = estrellas.length - 1; i >= 0; i--) {
    let estrella = estrellas[i];
    estrella.mover();
    estrella.mostrar();

    if (
      estrella.activa &&
      dist(estrella.x, estrella.y, jugador.x, jugador.y) < 30
    ) {
      puntaje += 10;
      estrella.activa = false;
      estrellas.splice(i, 1);
      continue;
    }

    for (let j = disparos.length - 1; j >= 0; j--) {
      if (
        estrella.activa &&
        dist(disparos[j].x, disparos[j].y, estrella.x, estrella.y) < 20
      ) {
        puntaje += 10;
        estrella.activa = false;
        estrellas.splice(i, 1);
        disparos.splice(j, 1);
        break;
      }
    }

    if (estrella.y > juegoH) estrellas.splice(i, 1);
  }

  jugador.mostrar();
  jugador.mover();

  for (let i = disparos.length - 1; i >= 0; i--) {
    disparos[i].mover();
    disparos[i].mostrar();
    if (disparos[i].y < 0) disparos.splice(i, 1);

    for (let j = enemigos.length - 1; j >= 0; j--) {
      if (
        dist(disparos[i]?.x, disparos[i]?.y, enemigos[j]?.x, enemigos[j]?.y) <
        30
      ) {
        enemigos[j].vida--;
        if (enemigos[j].vida <= 0) {
          puntaje += enemigos[j].puntaje;
          enemigos.splice(j, 1);
        }

        disparos.splice(i, 1);
        break;
      }
    }
  }

  for (let i = enemigos.length - 1; i >= 0; i--) {
    enemigos[i].mover();
    enemigos[i].mostrar();
    enemigos[i].disparar();

    if (
      dist(enemigos[i].x, enemigos[i].y, jugador.x, jugador.y) < 40 ||
      enemigos[i].y > juegoH
    ) {
      perderVida();
      enemigos.splice(i, 1);
    }
  }

  for (let i = disparosNeg.length - 1; i >= 0; i--) {
    disparosNeg[i].mover();
    disparosNeg[i].mostrar();
    if (
      disparosNeg[i].y > juegoH ||
      dist(disparosNeg[i].x, disparosNeg[i].y, jugador.x, jugador.y) < 20
    ) {
      if (dist(disparosNeg[i].x, disparosNeg[i].y, jugador.x, jugador.y) < 20)
        perderVida();
      disparosNeg.splice(i, 1);
    }
  }
mostrarHUD();

if (enemigos.length === 0) {
  if (nivel === 1 && oleadaNivel1 === 1) {
    // Segunda oleada de nivel 1
    oleadaNivel1++;
    for (let i = 0; i < 5; i++) enemigos.push(new Enemigo(nivel));
  }

  else if (nivel === 2) {
    if (oleadaNivel2 === 1) {
      oleadaNivel2++;
      // Segunda oleada: enemigos resistentes (vida 3, imgEnemigo2)
      for (let i = 0; i < 4; i++) {
        let enemigo = new Enemigo(nivel);
        enemigo.vida = 3;
        enemigo.tipo = "fuerte";
        enemigo.puntaje = 3;
        enemigos.push(enemigo);
      }

    } else if (oleadaNivel2 === 2) {
      oleadaNivel2++;
      // Tercera oleada: mezcla de normales y resistentes
      for (let i = 0; i < 3; i++) {
        let enemigo = new Enemigo(nivel);
        enemigo.vida = 1;
        enemigo.tipo = "normal";
        enemigo.puntaje = 1;
        enemigos.push(enemigo);
      }
      for (let i = 0; i < 2; i++) {
        let enemigo = new Enemigo(nivel);
        enemigo.vida = 3;
        enemigo.tipo = "fuerte";
        enemigo.puntaje = 3;
        enemigos.push(enemigo);
      }

    } else {
      pasarNivel();
    }

  } else if (nivel === 3) {
  if (oleadaNivel3 === 1) {
    oleadaNivel3++;

    // Segunda oleada: 5 enemigos más resistentes
    for (let i = 0; i < 5; i++) {
      let enemigo = new Enemigo(nivel);
      enemigo.vida = 2;
      enemigo.tipo = "normal";
      enemigo.puntaje = 2;
      enemigos.push(enemigo);
    }

  } else if (oleadaNivel3 === 2) {
    oleadaNivel3++;

    // Oleadas terminadas: aparece jefe final
    let jefe = new JefeFinal();
    enemigos.push(jefe);

  } else {
    // Seguridad por si algo sale mal
    estado = "fin";
    ingresandoNombre = true;
    nombreJugador = "";
  }
}
else {
    pasarNivel();
  }
}

}

function mostrarHUD() {
  push();
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`Nivel: ${nivel}   Vidas: ${vidas}   Puntaje: ${puntaje}`, 20, 20);
  pop();
}

function cargarTop() {
  const datos = localStorage.getItem("topPuntajes");
  if (datos) {
    tops = JSON.parse(datos);
  } else {
    tops = [];
  }
}


function guardarPuntaje(nombre, puntos) {
  if (!nombre || nombre.trim() === "") nombre = "Anónimo";
  tops.push({ nombre, puntaje: puntos });
  tops.sort((a, b) => b.puntaje - a.puntaje);
  tops = tops.slice(0, 5);
  localStorage.setItem("topPuntajes", JSON.stringify(tops));
}




function perderVida() {
  vidas--;
  if (vidas <= 0) {
    estado = "fin";
    ingresandoNombre = true;
    nombreJugador = "";
  }
}


function pasarNivel() {
  if (nivel === 3 && enemigos.some(e => e.tipo === "jefe")) return;

  if (nivel > 3) {
    estado = "fin";
  } else {
    generarEnemigos();
    mostrarTransicion = true;
    tiempoTransicion = millis();
    estado = "transicion";
  }
}


//TRANSICION

function mostrarTransicionNivel() {
  if (nivel === 1) {
    image(imgTransicion1, 0, 0, juegoW, juegoH);
  } else if (nivel === 2) {
    image(imgTransicion2, 0, 0, juegoW, juegoH);
  }
  
  push();
  fill(255);
  pop();
}

function generarEnemigos() {
  enemigos = [];

  if (nivel === 1) {

  oleadaNivel1 = 1;
  for (let i = 0; i < 5; i++) enemigos.push(new Enemigo(nivel));
  } else if (nivel === 2) {
    for (let i = 0; i < 8; i++) enemigos.push(new Enemigo(nivel));
    for (let i = 0; i < 1; i++) {
      let meteorito = new Enemigo(nivel);
      meteorito.tipo = "meteorito";
      meteorito.vida = 3;
      meteorito.puntaje = 15;
      meteorito.dir = 0;
      meteorito.x = random(100, juegoW - 100);
      enemigos.push(meteorito);
    }
    } else if (nivel === 2) {
  oleadaNivel2 = 1;
  // Primera oleada
  for (let i = 0; i < 5; i++) {
    let enemigo = new Enemigo(nivel);
    enemigo.vida = 1;
    enemigo.tipo = "normal";
    enemigo.puntaje = 1;
    enemigos.push(enemigo);
  }
  } else if (nivel === 3) {
  oleadaNivel3 = 1;

  // Primera oleada: enemigos resistentes tipo nivel 1
  for (let i = 0; i < 5; i++) {
    let enemigo = new Enemigo(nivel);
    enemigo.vida = 2;
    enemigo.tipo = "normal";
    enemigo.puntaje = 2;
    enemigos.push(enemigo);
  }
}
}

class JefeFinal {
  constructor() {
    this.x = juegoW / 2;
    this.y = 100;
    this.vida = 30;
    this.ancho = 100;
    this.alto = 120;
    this.dir = 1;
    this.vel = 2;
    this.tipo = "jefe";
    this.puntaje = 100;
    this.ultimoDisparoLateral = 0;
    this.intervaloDisparos = 2000; // 2 segundos entre disparos laterales
  }

  mover() {
    this.x += this.vel * this.dir;
    if (this.x < 100 || this.x > juegoW - 100) this.dir *= -1;
    if (random() < 0.02) this.disparar();
    
    // Disparos laterales cada cierto tiempo
    let ahora = millis();
    if (ahora - this.ultimoDisparoLateral > this.intervaloDisparos) {
      this.dispararLateral();
      this.ultimoDisparoLateral = ahora;
    }
  }

  mostrar() {
    imageMode(CENTER);
    image(imgJefe, this.x, this.y, this.ancho, this.alto);
    
    // Barra de vida
    noStroke();
    fill(255, 0, 0);
    rect(this.x - 50, this.y - 70, 100, 10);
    fill(0, 255, 0);
    rect(this.x - 50, this.y - 70, map(this.vida, 0, 30, 0, 100), 10);
    
    fill(255);
    textAlign(CENTER);
    textSize(14);
    text(`Jefe: ${this.vida}`, this.x, this.y - 80);
  }

  disparar() {
    // Disparo normal (usa el mismo que los enemigos del nivel 2)
    disparosNeg.push(new DisparoEnemigo(this.x, this.y));
  }

  dispararLateral() {
    // Disparos laterales (1 a cada lado)
    let izquierda = this.x - this.ancho/2 - 10;
    let derecha = this.x + this.ancho/2 + 10;
    
    disparosNeg.push(new DisparoEnemigo(izquierda, this.y));
    disparosNeg.push(new DisparoEnemigo(derecha, this.y));
  }
}


function reiniciarJuego() {
  nivel = 1;
  vidas = 3;
  puntaje = 0;
  disparos = [];
  disparosNeg = [];
  enemigos = [];
  estrellas = [];
  jugador = new Nave();
  generarEnemigos();
  tiempoUltimaEstrella = millis();
  estado = "jugando";

  if (musicaFondo.isPlaying()) musicaFondo.stop();
  musicaIniciada = false;
}

function keyTyped() {
  if (estado === "fin" && ingresandoNombre) {
    if (keyCode === ENTER) {
      if (nombreJugador.trim() === "") nombreJugador = "Anónimo";

      // Guarda el puntaje
      guardarPuntaje(nombreJugador.trim(), puntaje);
      cargarTop();
      ingresandoNombre = false;

      // Regresa a la pantalla de inicio en lugar de reiniciar inmediatamente
      estado = "inicio";
      nombreJugador = "";
      puntaje = 0;
      nivel = 1;
      vidas = 3;
      
    } else if (key.length === 1 && nombreJugador.length < 10) {
      nombreJugador += key;
    }
  }
}



function keyPressed() {
  if (estado === "inicio" && key === " ") {
    // Reinicia el juego solo cuando se presiona espacio en la pantalla de inicio
    reiniciarJuego();
    estado = "jugando";
  } else if (estado === "jugando") {
    if (keyCode === LEFT_ARROW) jugador.dir = -1;
    if (keyCode === RIGHT_ARROW) jugador.dir = 1;
    if (key === " ") {
      jugador.direccion = "arriba";
      disparos.push(new Disparo(jugador.x));
      if (sonidoDisparo && sonidoDisparo.isLoaded()) {
        sonidoDisparo.play();
      }
    }
  } else if (estado === "fin" && !ingresandoNombre && (key === "r" || key === "R")) {
    reiniciarJuego();
  } else if (estado === "fin" && ingresandoNombre && keyCode === BACKSPACE) {
    nombreJugador = nombreJugador.slice(0, -1);
  }
  
}


function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) jugador.dir = 0;
}

function mostrarTop() {
  textSize(14);
  textAlign(LEFT, TOP);
  const xTexto = 40;
  const yInicio = juegoH / 2 + 10;
  
  text("TOP 5:", xTexto, yInicio);
  
  for (let i = 0; i < tops.length; i++) {
    let entry = tops[i];
    let nombre = entry?.nombre || "Sin nombre";
    let puntos = entry?.puntaje ?? 0;
    text(`${i + 1}. ${nombre}: ${puntos}`, xTexto, yInicio + 20 + i * 20);
  }
}
