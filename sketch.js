/// VARIABLES
let jugador; // jugador
let imgJugador; //imagen del jugador
let imgProyectil;
let imgEnemigo;
let nivel = 1;
let vidas = 3;
let puntaje = 0;
let estado = "inicio"; // Estado del juego
let tops = []; // Top 5
let disparos = [];
let disparosNeg = [];
let enemigos = [];

// PRECARGA DE IMAGENES Y SONIDOS
let imgArcade; // Variable para la imagen arcade

function preload() {
  imgJugador = loadImage("mono.png");
  imgProyectil = loadImage("banana.png");
  imgEnemigo = loadImage("enemigo_1.png");
  imgArcade = loadImage("arcade_galaga.png"); // Carga la imagen
}

// CONFIGURACIÓN INICIAL DEL JUEGO
function setup() {
  createCanvas(1500, 1000);
  jugador = new Nave();
  cargarTop();
  generarEnemigos();
}

// BUCLE PRINCIPAL DEL JUEGO
function draw() {
  background(0);

  if (estado === "inicio") {
    imageMode(CENTER);
    image(imgArcade, width / 2, height / 2); // Muestra la imagen centrada
    // Puedes agregar texto adicional si lo deseas
  } else if (estado === "jugando") {
    mostrarHUD();
    jugador.mostrar();
    jugador.mover();

    // ACTUALIZA DISPAROS JUGADOR
    for (let i = disparos.length - 1; i >= 0; i--) {
      disparos[i].mover();
      disparos[i].mostrar();
      if (disparos[i].fueraDePantalla()) disparos.splice(i, 1);
    }

    // ACTUALIZA DISPAROS ENEMIGOS
    for (let i = disparosNeg.length - 1; i >= 0; i--) {
      disparosNeg[i].mover();
      disparosNeg[i].mostrar();
      if (disparosNeg[i].fueraDePantalla()) {
        disparosNeg.splice(i, 1);
        continue;
      }
      if (disparosNeg[i].colisionaCon(jugador)) {
        perderVida();
        disparosNeg.splice(i, 1);
      }
    }

    // ACTUALIZA ENEMIGOS
    for (let i = enemigos.length - 1; i >= 0; i--) {
      enemigos[i].mover();
      enemigos[i].mostrar();
      enemigos[i].disparar();

      if (enemigos[i].colisionaCon(jugador)) perderVida();
      if (enemigos[i].llegoAbajo()) {
        perderVida();
        enemigos.splice(i, 1);
        continue;IMG
      }

      // VERIFICA COLISIONES
      for (let j = disparos.length - 1; j >= 0; j--) {
        if (enemigos[i].fueAlcanzado(disparos[j])) {
          puntaje += enemigos[i].puntaje;
          enemigos[i].vida--;
          disparos.splice(j, 1);
          if (enemigos[i].vida <= 0) enemigos.splice(i, 1);
          break;
        }
      }
    }

    // LEVEL UP
    if (enemigos.length === 0) pasarNivel();
  } else if (estado === "fin") {
    mostrarFin();
  }
}

//VERIFICAR SI PASA DE NIVEL
function pasarNivel() {
  nivel++;
  if (nivel > 3) {
    guardarPuntaje();
    estado = "fin";
  } else {
    generarEnemigos();
  }
}

// CONTROLES DEL TECLADO
function keyPressed() {
  if (estado === "inicio" && key === " ") {
    estado = "jugando";
  }
  if (estado === "jugando") {
    if (keyCode === LEFT_ARROW) jugador.dir = -1;
    if (keyCode === RIGHT_ARROW) jugador.dir = 1;
    if (key === " ") {
      disparos.push(new Disparo(jugador.x));
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) jugador.dir = 0;
}

// VIDAS
function perderVida() {
  vidas--;
  if (vidas <= 0) {
    guardarPuntaje();
    estado = "fin";
  }
}

// INTERFAZ DE USUARIO
function mostrarHUD() {
  fill(255);
  textSize(20);
  text(`Puntaje: ${puntaje}`, 10, 20);
  text(`Vidas: ${vidas}`, 10, 40);
  text(`Nivel: ${nivel}`, 10, 60);
}

function mostrarInicio() {
  background(0);

  textAlign(CENTER);
  textFont("Press Start 2P");

  // TITULO
  let titulo = "GALAGA: INVASIÓN";
  for (let i = 0; i < titulo.length; i++) {
    let c = color(map(i, 0, titulo.length, 100, 255), random(100, 255), 255);
    fill(c);
    textSize(28);
    text(titulo[i], width / 2 - 170 + i * 20, height / 2 - 140);
  }

  // INSTRUCCIONES
  fill(255);
  textSize(12);
  text("← → para mover la nave", width / 2, height / 2 - 60);
  text("Espacio para disparar", width / 2, height / 2 - 40);
  text("Destruye a todos los enemigos", width / 2, height / 2 - 20);

  // ESPACIO PARA COMENZAR
  fill(random(150, 255), random(150, 255), 255); // efecto color cambiante
  textSize(12);
  text("Presiona ESPACIO para comenzar", width / 2, height / 2 + 20);

  // TOP
  fill(255);
  mostrarTop();
}

function mostrarFin() {
  fill(255);
  textAlign(CENTER);
  textSize(20);
  text("¡Juego Terminado!", width / 2, height / 2 - 20);
  text(`Puntaje final: ${puntaje}`, width / 2, height / 2);
  text("Recarga la página para reiniciar", width / 2, height / 2 + 20);
  mostrarTop();
}

// FUNCIONES PARA PUNTAJES
function guardarPuntaje() {
  tops.push(puntaje);
  tops.sort((a, b) => b - a);
  tops = tops.slice(0, 5);
  localStorage.setItem("topPuntajes", JSON.stringify(tops));
}

function cargarTop() {
  const data = localStorage.getItem("topPuntajes");
  if (data) tops = JSON.parse(data);
}

function mostrarTop() {
  textSize(16);
  text("Top 5 Puntajes:", width / 2, height / 2 + 60);
  for (let i = 0; i < tops.length; i++) {
    text(`${i + 1}. ${tops[i]}`, width / 2, height / 2 + 80 + i * 20);
  }
}

// CREA ENEMIGOS DEPENDIENDO DEL NIVEL
function generarEnemigos() {
  enemigos = [];
  let cantidad = nivel === 1 ? 5 : nivel === 2 ? 8 : 12;
  for (let i = 0; i < cantidad; i++) {
    enemigos.push(new Enemigo(nivel));
  }
}

// CLASES DEL JUEGO
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
    strokeWeight(4);
    line(this.x, this.y, this.x, this.y + 15);
    strokeWeight(1);
  }
  fueraDePantalla() {
    return this.y > height;
  }
  colisionaCon(nave) {
    return dist(this.x, this.y, nave.x, nave.y) < 20;
  }
}

class Enemigo {
  constructor(nivel) {
    this.x = random(50, width - 50);
    this.y = random(-200, -40);
    this.dir = random([-1, 1]);
    this.vel = 0.5 + nivel * 0.5;
    this.vida = nivel >= 2 && random() < 0.3 ? 3 : 1;
    this.puntaje = this.vida === 3 ? 3 : 1;
    this.nivel = nivel;
  }
  mover() {
    if (this.nivel === 1) this.y += this.vel;
    else if (this.nivel === 2) {
      this.x += this.dir * 1.5;
      this.y += this.vel;
      if (this.x < 0 || this.x > width) this.dir *= -1;
    } else {
      this.x += this.dir * 2;
      this.y += this.vel;
      if (random() < 0.01) this.dir *= -1;
    }
  }
  mostrar() {
    imageMode(CENTER);
    image(imgEnemigo, this.x, this.y, 80, 50); //POR  CADA NIVEL METER UN ENEMIGO DIFERENTE... MEJORAR ESO PLS
  }
  disparar() {
    if (this.nivel >= 2 && random() < 0.01) {
      disparosNeg.push(new DisparoEnemigo(this.x, this.y));
    }
  }
  colisionaCon(nave) {
    return dist(this.x, this.y, nave.x, nave.y) < 25;
  }
  llegoAbajo() {
    return this.y > height;
  }
  fueAlcanzado(disparo) {
    return dist(this.x, this.y, disparo.x, disparo.y) < 15;
  }
}

class Nave {
  constructor() {
    this.x = width / 3;
    this.y = height - 80;
    this.dir = 0;
    this.velocidad = 7;
  }
  mover() {
    this.x += this.dir * this.velocidad;
    this.x = constrain(this.x, 20, width - 20);
  }
  mostrar() {
    imageMode(CENTER);
    image(imgJugador, this.x, this.y - 20, 80, 80);
  }
}

function mostrarHUD() {
  const hud = document.getElementById("hud");
  if (hud) {
    hud.innerText = `Nivel: ${nivel}   Vidas: ${vidas}   Puntaje: ${puntaje}`;
  }
}

class Disparo {
  constructor(x) {
    this.x = x;
    this.y = height - 80;
    this.angulo = random(-TWO_PI);
    this.velocidad = random(0.1, 0.3);
  }
  mover() {
    this.y -= 7;
    this.angulo += this.velocidad; //GIRALAAAAA (HACE QUE EL DISPARO GIRE)
  }
  mostrar() {
    push();
    translate(this.x, this.y);
    rotate(this.angulo);
    imageMode(CENTER);
    image(imgProyectil, 0, 0, 20, 40);
    pop();
    //imageMode(CENTER);
    //image(imgDisparo, this.x, this.y, 20, 40);
  }
  fueraDePantalla() {
    return this.y < 0;
  }
}

