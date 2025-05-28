// VARIABLES 
let nave; // jugador
let nivel = 1; 
let vidas = 3; 
let puntaje = 0; 
let estado = 'inicio'; // Estado del juego 
let topPuntajes = []; // Top 5 
let disparos = []; 
let disparosEnemigos = [];
let enemigos = []; 


// CONFIGURACIÓN INICIAL DEL JUEGO
function setup() {
  createCanvas(800, 800); 
  nave = new Nave(); 
  cargarTop(); 
  generarEnemigos(); 
}

// BUCLE PRINCIPAL DEL JUEGO
function draw() {
  background(0); // Fondo negro

  if (estado === 'inicio') {
    mostrarInicio();
  } else if (estado === 'jugando') {
    mostrarHUD();
    nave.mostrar();
    nave.mover();

    // Actualiza disparos del jugador
    for (let i = disparos.length - 1; i >= 0; i--) {
      disparos[i].mover();
      disparos[i].mostrar();
      if (disparos[i].fueraDePantalla()) disparos.splice(i, 1);
    }

    // Actualiza disparos enemigos
    for (let i = disparosEnemigos.length - 1; i >= 0; i--) {
      disparosEnemigos[i].mover();
      disparosEnemigos[i].mostrar();
      if (disparosEnemigos[i].fueraDePantalla()) {
        disparosEnemigos.splice(i, 1);
        continue;
      }
      if (disparosEnemigos[i].colisionaCon(nave)) {
        perderVida();
        disparosEnemigos.splice(i, 1);
      }
    }

    // Actualiza enemigos
    for (let i = enemigos.length - 1; i >= 0; i--) {
      enemigos[i].mover();
      enemigos[i].mostrar();
      enemigos[i].disparar();

      if (enemigos[i].colisionaCon(nave)) perderVida();
      if (enemigos[i].llegoAbajo()) {
        perderVida();
        enemigos.splice(i, 1);
        continue;
      }

      // Verifica colisiones con disparos del jugador
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

    // Si no hay enemigos, pasa al siguiente nivel
    if (enemigos.length === 0) pasarNivel();
  } else if (estado === 'fin') {
    mostrarFin();
  }
}

// CONTROLES DEL TECLADO
function keyPressed() {
  if (estado === 'inicio' && key === ' ') {
    estado = 'jugando';
  }
  if (estado === 'jugando') {
    if (keyCode === LEFT_ARROW) nave.dir = -1;
    if (keyCode === RIGHT_ARROW) nave.dir = 1;
    if (key === ' ') {
      disparos.push(new Disparo(nave.x));
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) nave.dir = 0;
}

// FUNCIONES DE ESTADO DE JUEGO
function perderVida() {
  vidas--;
  if (vidas <= 0) {
    guardarPuntaje();
    estado = 'fin';
  }
}

function pasarNivel() {
  nivel++;
  if (nivel > 3) {
    guardarPuntaje();
    estado = 'fin';
  } else {
    generarEnemigos();
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
  fill(255);
  textAlign(CENTER);
  textSize(20);
  text('Juego Galaga', width / 2, height / 2 - 20);
  text('Presiona ESPACIO para comenzar', width / 2, height / 2);
  mostrarTop();
}

function mostrarFin() {
  fill(255);
  textAlign(CENTER);
  textSize(20);
  text('¡Juego Terminado!', width / 2, height / 2 - 20);
  text(`Puntaje final: ${puntaje}`, width / 2, height / 2);
  text('Recarga la página para reiniciar', width / 2, height / 2 + 20);
  mostrarTop();
}

// FUNCIONES PARA PUNTAJES
function guardarPuntaje() {
  topPuntajes.push(puntaje);
  topPuntajes.sort((a, b) => b - a);
  topPuntajes = topPuntajes.slice(0, 5);
  localStorage.setItem('topPuntajes', JSON.stringify(topPuntajes));
}

function cargarTop() {
  const data = localStorage.getItem('topPuntajes');
  if (data) topPuntajes = JSON.parse(data);
}

function mostrarTop() {
  textSize(16);
  text('Top 5 Puntajes:', width / 2, height / 2 + 60);
  for (let i = 0; i < topPuntajes.length; i++) {
    text(`${i + 1}. ${topPuntajes[i]}`, width / 2, height / 2 + 80 + i * 20);
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
    fill(255, 0, 0);
    ellipse(this.x, this.y, 30);
  }
  disparar() {
    if (this.nivel >= 2 && random() < 0.01) {
      disparosEnemigos.push(new DisparoEnemigo(this.x, this.y));
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
    fill(0, 200, 255);
    triangle(this.x, this.y, this.x - 30, this.y + 60, this.x + 30, this.y + 60);
  }
}

function mostrarHUD() {
  const hud = document.getElementById('hud');
  if (hud) {
    hud.innerText = `Nivel: ${nivel}   Vidas: ${vidas}   Puntaje: ${puntaje}`;
  }
}


class Disparo {
  constructor(x) {
    this.x = x;
    this.y = height - 80;
  }
  mover() {
    this.y -= 7;
  }
  mostrar() {
    stroke(455);
    strokeWeight(6);
    line(this.x, this.y, this.x, this.y - 15);
    strokeWeight(1);
  }
  fueraDePantalla() {
    return this.y < 0;
  }
}
