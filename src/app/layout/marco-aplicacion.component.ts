import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationCancel, NavigationEnd, NavigationError, NavigationStart,
  Router, RouterLink, RouterLinkActive, RouterOutlet,
} from '@angular/router';
import { filter, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificacionService } from '../core/services/notificacion.service';
import { SesionService } from '../core/services/sesion.service';
import { SolicitudService } from '../core/services/solicitud.service';
import { CargaComponent } from '../shared/components/carga.component';
import { InicialesPipe } from '../shared/pipes/iniciales.pipe';

interface ElementoMenu {
  ruta: string;
  icono: string;
  etiqueta: string;
}

/**
 * Marco de la aplicación (BarraNavegacion del prototipo): barra superior,
 * navegación lateral en escritorio, navegación inferior en móvil y el
 * router-outlet donde se cargan las pantallas.
 */
@Component({
  selector: 'app-marco-aplicacion',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatMenuModule, MatTooltipModule, CargaComponent, InicialesPipe],
  template: `
    <a class="sr-only" href="#contenido" (click)="$event.preventDefault(); irAContenido()">Saltar al contenido</a>
    <header class="topbar">
      <a class="brand-button" [routerLink]="sesion.inicioDe()">
        <span class="logo-mark"><mat-icon class="icon">school</mat-icon></span>
        <span>Asesora<strong>FCC</strong></span>
      </a>
      <div class="top-actions">
        <a class="icon-button" routerLink="/notificaciones" matTooltip="Notificaciones"
          [attr.aria-label]="'Notificaciones' + (noLeidas() ? ', ' + noLeidas() + ' sin leer' : '')">
          <mat-icon class="icon">notifications</mat-icon>
          @if (noLeidas() > 0) { <span class="notification-dot">{{ noLeidas() }}</span> }
        </a>
        <button type="button" class="profile-button" [matMenuTriggerFor]="menuPerfil" aria-label="Menú de perfil">
          <span class="avatar avatar-small">{{ sesion.nombreUsuario() | iniciales }}</span>
          <span class="profile-copy"><strong>{{ sesion.nombreUsuario() }}</strong><small>{{ sesion.esEstudiante() ? 'Estudiante' : 'Profesora' }}</small></span>
          <mat-icon class="icon icon-sm">expand_more</mat-icon>
        </button>
        <mat-menu #menuPerfil="matMenu" xPosition="before" class="profile-menu-panel">
          <button mat-menu-item routerLink="/perfil">
            <mat-icon>person</mat-icon><span><strong>Mi perfil</strong><small>Datos y preferencias</small></span>
          </button>
          <button mat-menu-item (click)="cambiarRol()">
            <mat-icon>swap_horiz</mat-icon><span><strong>Cambiar de rol</strong><small>Solo para este prototipo</small></span>
          </button>
          <button mat-menu-item routerLink="/acceso">
            <mat-icon>logout</mat-icon><span><strong>Salir</strong><small>Volver a la pantalla de acceso</small></span>
          </button>
        </mat-menu>
      </div>
    </header>

    <aside class="sidebar">
      <nav aria-label="Navegación principal">
        <span class="nav-label">{{ sesion.esEstudiante() ? 'Espacio del estudiante' : 'Espacio docente' }}</span>
        @for (item of menu(); track item.ruta) {
          <a class="nav-item" [routerLink]="item.ruta" routerLinkActive="active" ariaCurrentWhenActive="page">
            <mat-icon class="icon">{{ item.icono }}</mat-icon>
            <span>{{ item.etiqueta }}</span>
            @if (item.ruta === '/profesor/solicitudes' && pendientes() > 0) {
              <b [attr.aria-label]="pendientes() + ' pendientes'">{{ pendientes() }}</b>
            }
          </a>
        }
      </nav>
      <div class="sidebar-help">
        <mat-icon class="icon">help</mat-icon>
        <div><strong>¿Necesitas ayuda?</strong><small>Consulta la guía de uso</small></div>
      </div>
    </aside>

    <nav class="bottom-nav" aria-label="Navegación móvil">
      @for (item of menu(); track item.ruta) {
        <a [routerLink]="item.ruta" routerLinkActive="active" ariaCurrentWhenActive="page">
          <mat-icon class="icon">{{ item.icono }}</mat-icon><span>{{ item.etiqueta }}</span>
        </a>
      }
    </nav>

    <main class="main-content" id="contenido" tabindex="-1">
      @if (conexion() === 'error') {
        <div class="api-error" role="alert">
          <mat-icon class="icon">cloud_off</mat-icon>
          <div><strong>No se pudo conectar con la API</strong>
            <span>Verifica que json-server esté encendido con <code>npm run api</code> en otra terminal.</span></div>
          <button type="button" class="btn btn-secondary" (click)="reintentar()">Reintentar</button>
        </div>
      }
      @if (navegando() || conexion() === 'cargando') { <app-carga /> }
      <div [hidden]="navegando() || conexion() === 'cargando'"><router-outlet /></div>
    </main>
  `,
  styles: `
    .bottom-nav a { border: 0; background: none; color: var(--muted); display: flex; flex-direction: column;
      justify-content: center; align-items: center; gap: 3px; font-size: .66rem; text-decoration: none; }
    .bottom-nav a.active { color: var(--primary); font-weight: 700; }
    .bottom-nav a.active .icon { font-variation-settings: 'FILL' 1; }
    .main-content:focus { outline: none; }
  `,
})
export class MarcoAplicacionComponent {
  protected readonly sesion = inject(SesionService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly solicitudes = inject(SolicitudService);
  private readonly router = inject(Router);

  private readonly menuEstudiante: ElementoMenu[] = [
    { ruta: '/estudiante/inicio', icono: 'home', etiqueta: 'Inicio' },
    { ruta: '/estudiante/materias', icono: 'search', etiqueta: 'Buscar asesoría' },
    { ruta: '/estudiante/solicitudes', icono: 'assignment', etiqueta: 'Mis solicitudes' },
  ];
  private readonly menuProfesor: ElementoMenu[] = [
    { ruta: '/profesor/panel', icono: 'dashboard', etiqueta: 'Panel' },
    { ruta: '/profesor/solicitudes', icono: 'inbox', etiqueta: 'Solicitudes' },
    { ruta: '/profesor/disponibilidad', icono: 'calendar_month', etiqueta: 'Disponibilidad' },
  ];

  protected readonly menu = computed(() => (this.sesion.esEstudiante() ? this.menuEstudiante : this.menuProfesor));
  protected readonly noLeidas = computed(() => this.notificaciones.noLeidas(this.sesion.rol()));
  protected readonly pendientes = this.solicitudes.pendientesProfesor;
  protected readonly conexion = this.solicitudes.conexion;

  /** true mientras el router descarga una pantalla diferida. */
  protected readonly navegando = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationStart || e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError),
      map((e) => e instanceof NavigationStart),
    ),
    { initialValue: false },
  );

  protected cambiarRol(): void {
    const rol = this.sesion.cambiarRol();
    this.router.navigateByUrl(this.sesion.inicioDe(rol));
  }

  protected reintentar(): void {
    this.solicitudes.cargar();
  }
  
  protected irAContenido(): void {
    document.getElementById('contenido')?.focus();
  }
}
