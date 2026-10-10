import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { HORARIO_CONFLICTO_DEMO } from '../data/datos-simulados';
import { API_URL } from '../api.config';
import { ESTADOS_ACTIVOS, EstadoSolicitud, NuevaSolicitud, Solicitud } from '../models';
import { formatearFecha } from '../utils/fechas';
import { AvisoService } from './aviso.service';
import { CatalogoService } from './catalogo.service';
import { NotificacionService } from './notificacion.service';
import { RelojService } from './reloj.service';
import { SesionService } from './sesion.service';

export type ResultadoCreacion = { ok: true; folio: string } | { ok: false; motivo: 'conflicto' };
export type EstadoConexion = 'cargando' | 'listo' | 'error';

/**
 * Única fuente de verdad de las solicitudes.
 * Los componentes leen los signals y llaman a estos métodos; ningún
 * componente modifica el estado directamente.
 */
@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly catalogo = inject(CatalogoService);
  private readonly notificaciones = inject(NotificacionService);
  private readonly reloj = inject(RelojService);
  private readonly sesion = inject(SesionService);
  private readonly http = inject(HttpClient);
  private readonly aviso = inject(AvisoService);
  private readonly url = `${inject(API_URL)}/solicitudes`;

   /** Las solicitudes ahora vienen de la API; al inicio la lista está vacía. */
  private readonly lista = signal<Solicitud[]>([]);
  private readonly estadoConexion = signal<EstadoConexion>('cargando');
  readonly conexion = this.estadoConexion.asReadonly();
  /** Se vuelve verdadero cuando ya se mostró el conflicto de horario de demostración. */
  private readonly conflictoDemo = signal(false);

  readonly solicitudes = this.lista.asReadonly();

  constructor() {
    this.cargar();
  }
  /** GET /solicitudes: trae todas las solicitudes desde la API. */
  cargar(): void {
    this.estadoConexion.set('cargando');
    this.http.get<Solicitud[]>(this.url).subscribe({
      next: (datos) => {
        this.lista.set(datos);
        this.estadoConexion.set('listo');
      },
      error: () => this.estadoConexion.set('error'),
    });
  }
  /** Solicitudes de la estudiante que usa el prototipo, más recientes primero. */
  readonly delEstudiante = computed(() =>
    this.lista()
      .filter((s) => s.estudiante.nombre === this.sesion.estudiante.nombre)
      .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)),
  );

  /** Solicitudes dirigidas a la profesora que usa el prototipo. */
  readonly delProfesor = computed(() =>
    this.lista()
      .filter((s) => s.profesorId === this.sesion.profesor.id)
      .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
  );

  readonly pendientesProfesor = computed(() => this.delProfesor().filter((s) => s.estado === 'Pendiente').length);

  porFolio(folio: string): Solicitud | undefined {
    return this.lista().find((s) => s.folio === folio);
  }

  /** Número de solicitudes anteriores del mismo estudiante (sin contar la actual). */
  solicitudesPrevias(solicitud: Solicitud): number {
    return this.lista().filter((s) => s.estudiante.nombre === solicitud.estudiante.nombre && s.folio !== solicitud.folio).length;
  }

  /** Un horario está ocupado si una solicitud activa lo usa o lo tiene propuesto. */
  horarioOcupado(profesorId: string, fechaHora: string, exceptoFolio?: string): boolean {
    return this.lista().some(
      (s) =>
        s.profesorId === profesorId &&
        s.folio !== exceptoFolio &&
        ESTADOS_ACTIVOS.includes(s.estado) &&
        (s.fechaHora === fechaHora || s.horarioPropuesto === fechaHora),
    ) || (this.conflictoDemo() && profesorId === HORARIO_CONFLICTO_DEMO.profesorId && fechaHora === HORARIO_CONFLICTO_DEMO.fechaHora);
  }

  // ---------------------------------------------------------------------
  // Acciones del estudiante
  // ---------------------------------------------------------------------

  crear(datos: NuevaSolicitud): ResultadoCreacion {
    // Flujo A4: simula que otra persona tomó el horario mientras se confirmaba.
    const esConflictoDemo =
      !this.conflictoDemo() &&
      datos.profesorId === HORARIO_CONFLICTO_DEMO.profesorId &&
      datos.fechaHora === HORARIO_CONFLICTO_DEMO.fechaHora;
    if (esConflictoDemo || this.horarioOcupado(datos.profesorId, datos.fechaHora)) {
      this.conflictoDemo.set(true);
      return { ok: false, motivo: 'conflicto' };
    }

    const profesor = this.catalogo.profesorPorId(datos.profesorId)!;
    const folio = this.siguienteFolio();
    const nueva: Solicitud = {
      id: folio,
      folio,
      materia: datos.materia,
      tema: datos.tema,
      profesorId: datos.profesorId,
      estudiante: this.sesion.estudiante,
      fechaHora: datos.fechaHora,
      modalidad: datos.modalidad,
      ubicacion: datos.modalidad === 'Presencial' ? profesor.ubicacion : 'El enlace se enviará al confirmar',
      estado: 'Pendiente',
      descripcion: datos.descripcion,
      adjunto: datos.adjunto,
      historial: [{ estado: 'Pendiente', fecha: this.reloj.ahora(), detalle: 'Solicitud enviada al docente' }],
    };

    // La interfaz se actualiza de inmediato y la API guarda el registro (POST).
    this.lista.update((actual) => [nueva, ...actual]);
    //Registrar nueva solicitud
    this.http.post<Solicitud>(this.url, nueva).subscribe({
      error: () => this.fallo('No se pudo registrar la solicitud en el servidor.'),
    });

    this.notificaciones.agregar({
      rol: 'profesor', tipo: 'solicitud', titulo: 'Nueva solicitud de asesoría',
      texto: `${nueva.estudiante.nombre} solicita apoyo con ${nueva.tema}.`, destino: '/profesor/solicitudes',
    });
    return { ok: true, folio };
  }

  cancelar(folio: string): void {
    this.cambiarEstado(folio, 'Cancelada', 'La estudiante canceló la solicitud');
    const s = this.porFolio(folio)!;
    this.notificaciones.agregar({
      rol: 'profesor', tipo: 'estado', titulo: 'Una solicitud fue cancelada',
      texto: `${s.estudiante.nombre} canceló la solicitud sobre ${s.tema}.`, destino: '/profesor/solicitudes',
    });
  }

  responderPropuesta(folio: string, aceptada: boolean): void {
    const s = this.porFolio(folio)!;
    if (aceptada && s.horarioPropuesto) {
      this.cambiarEstado(folio, 'Confirmada', `La estudiante aceptó el nuevo horario: ${formatearFecha(s.horarioPropuesto)}`, {
        fechaHora: s.horarioPropuesto,
        horarioPropuesto: undefined,
      });
    } else {
      this.cambiarEstado(folio, 'Cancelada', 'La estudiante rechazó el horario propuesto', { horarioPropuesto: undefined });
    }
    this.notificaciones.agregar({
      rol: 'profesor', tipo: 'estado',
      titulo: aceptada ? 'Se aceptó el nuevo horario' : 'Se rechazó la propuesta de horario',
      texto: `${s.estudiante.nombre} respondió a la propuesta para ${s.tema}.`, destino: '/profesor/solicitudes',
    });
  }

  // ---------------------------------------------------------------------
  // Acciones del profesor
  // ---------------------------------------------------------------------

  aceptar(folio: string): void {
    this.cambiarEstado(folio, 'Confirmada', 'La docente confirmó el horario');
    this.avisarEstudiante(folio, 'Tu asesoría fue confirmada');
  }

  rechazar(folio: string, motivo: string): void {
    this.cambiarEstado(folio, 'Rechazada', `Motivo del rechazo: ${motivo}`, { motivoRechazo: motivo });
    this.avisarEstudiante(folio, 'Tu solicitud fue rechazada');
  }

  proponerHorario(folio: string, fechaHora: string): void {
    this.cambiarEstado(folio, 'Reprogramación propuesta', `La docente propuso el ${formatearFecha(fechaHora)}`, {
      horarioPropuesto: fechaHora,
    });
    this.avisarEstudiante(folio, 'Te propusieron otro horario');
  }

  completar(folio: string): void {
    this.cambiarEstado(folio, 'Completada', 'La docente registró la asesoría como completada');
    this.avisarEstudiante(folio, 'Asesoría registrada como completada');
  }

  registrarInasistencia(folio: string): void {
    this.cambiarEstado(folio, 'Inasistencia', 'La docente registró la inasistencia del estudiante');
    this.avisarEstudiante(folio, 'Se registró una inasistencia');
  }

  /**
   * Cambia el estado en la interfaz y lo guarda en la API con PATCH.
   * Solo se envían los campos que cambian; un campo que se borra viaja como null.
   */
  private cambiarEstado(folio: string, estado: EstadoSolicitud, detalle: string, cambios: Partial<Solicitud> = {}): void {
    const actual = this.porFolio(folio);
    if (!actual) return;
    const historial = [...actual.historial, { estado, fecha: this.reloj.ahora(), detalle }];
    this.lista.update((lista) => lista.map((s) => (s.folio === folio ? { ...s, ...cambios, estado, historial } : s)));

    const cuerpo: Record<string, unknown> = { estado, historial };
    for (const [campo, valor] of Object.entries(cambios)) cuerpo[campo] = valor ?? null;
    this.http.patch<Solicitud>(`${this.url}/${folio}`, cuerpo).subscribe({
      error: () => this.fallo('No se pudo guardar el cambio en el servidor.'),
    });
  }

  /** Si la API falla, se avisa y se vuelve a cargar lo que realmente quedó guardado. */
  private fallo(mensaje: string): void {
    this.aviso.error(`${mensaje} Revisa que json-server esté encendido.`);
    this.cargar();
  }

  private avisarEstudiante(folio: string, titulo: string): void {
    const s = this.porFolio(folio)!;
    // Solo se notifica a la estudiante del prototipo; las demás son datos de ejemplo.
    if (s.estudiante.nombre !== this.sesion.estudiante.nombre) return;
    this.notificaciones.agregar({
      rol: 'estudiante', tipo: 'estado', titulo,
      texto: `La solicitud sobre ${s.tema} cambió a "${s.estado}".`, destino: `/estudiante/solicitudes/${folio}`,
    });
  }

  private siguienteFolio(): string {
    const mayor = Math.max(...this.lista().map((s) => Number(s.folio.split('-')[2])));
    return `ASE-2026-${String(mayor + 1).padStart(4, '0')}`;
  }
}
