import { EstadoSolicitud, Modalidad } from './tipos';

export interface EventoHistorial {
  estado: EstadoSolicitud;
  /** Fecha y hora local en formato ISO (sin zona). */
  fecha: string;
  detalle: string;
}

export interface Adjunto {
  nombre: string;
  tamano: string;
}

export interface Estudiante {
  nombre: string;
  programa: string;
  semestre: string;
}

export interface Solicitud {
  /** Identificador que usa la API (json-server lo exige). Es igual al folio. */
  id: string;
  folio: string;
  materia: string;
  tema: string;
  profesorId: string;
  estudiante: Estudiante;
  /** Fecha y hora de la asesoría (ISO local, p. ej. 2026-10-12T10:00). */
  fechaHora: string;
  modalidad: Modalidad;
  ubicacion: string;
  estado: EstadoSolicitud;
  descripcion: string;
  adjunto?: Adjunto;
  /** null cuando la API borra el campo. */
  horarioPropuesto?: string;
  motivoRechazo?: string;
  historial: EventoHistorial[];
}

/** Datos que captura el estudiante para crear una solicitud. */
export interface NuevaSolicitud {
  materia: string;
  tema: string;
  profesorId: string;
  fechaHora: string;
  modalidad: Modalidad;
  descripcion: string;
  adjunto?: Adjunto;
}
