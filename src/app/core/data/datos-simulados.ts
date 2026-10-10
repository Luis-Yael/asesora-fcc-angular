import { Estudiante, Materia, Notificacion, Profesor } from '../models';

/**
 * Datos simulados del prototipo.
 * En un proyecto real estos datos vendrían de una API REST consumida
 * desde los servicios con HttpClient.
 */

/** "Hoy" del prototipo: lunes 12 de octubre de 2026, 09:25 h. */
export const FECHA_REFERENCIA = '2026-10-12T09:25';

/** Horario que simula haber sido ocupado por otra persona (flujo A4). */
export const HORARIO_CONFLICTO_DEMO = { profesorId: 'ana', fechaHora: '2026-10-13T12:00' };

/** Semanas visibles en la disponibilidad (lunes de cada semana). */
export const SEMANAS = ['2026-10-12', '2026-10-19'];

export const MATERIAS: Materia[] = [
  { nombre: 'Programación Básica', area: 'Programación', icono: 'code', semestre: '1er semestre' },
  { nombre: 'Programación Orientada a Objetos II', area: 'Programación', icono: 'deployed_code', semestre: '3er semestre' },
  { nombre: 'Estructuras de Datos', area: 'Programación', icono: 'account_tree', semestre: '3er semestre' },
  { nombre: 'Bases de Datos', area: 'Sistemas de información', icono: 'database', semestre: '4.º semestre' },
  { nombre: 'Ingeniería de Software I', area: 'Ingeniería de software', icono: 'schema', semestre: '5.º semestre' },
  { nombre: 'Aplicaciones Web', area: 'Ingeniería de software', icono: 'language', semestre: '5.º semestre' },
  { nombre: 'Matemáticas Discretas', area: 'Matemáticas', icono: 'function', semestre: '2.º semestre' },
  { nombre: 'Cálculo Diferencial', area: 'Matemáticas', icono: 'show_chart', semestre: '1er semestre' },
];

export const PROFESORES: Profesor[] = [
  {
    id: 'ana', nombre: 'Dra. Ana Torres Ruiz', iniciales: 'AT', grado: 'Doctorado en Ciencias de la Computación',
    materias: ['Estructuras de Datos', 'Programación Básica'],
    temas: ['recursividad', 'punteros en C', 'listas enlazadas', 'árboles'],
    modalidades: ['Presencial', 'En línea'], ubicacion: 'Edificio CCO1, cubículo 214', color: 'avatar-blue',
    patron: [
      { dia: 1, horas: ['09:00', '10:00', '11:30', '16:00'] },
      { dia: 2, horas: ['09:00', '12:00', '15:30', '17:00'] },
      { dia: 3, horas: ['10:00', '11:00', '13:00', '16:30'] },
      { dia: 4, horas: ['09:30', '12:30', '14:00', '17:00'] },
      { dia: 5, horas: ['10:00', '12:00', '15:00'] },
    ],
    ocupados: ['2026-10-12T11:30', '2026-10-13T15:30', '2026-10-14T13:00', '2026-10-15T09:30', '2026-10-15T17:00', '2026-10-16T12:00'],
  },
  {
    id: 'marco', nombre: 'Dr. Marco Salgado Pérez', iniciales: 'MS', grado: 'Doctorado en Ingeniería de Software',
    materias: ['Programación Orientada a Objetos II', 'Estructuras de Datos'],
    temas: ['herencia y polimorfismo', 'árboles', 'recursividad'],
    modalidades: ['En línea'], ubicacion: 'Enlace de videollamada', color: 'avatar-green',
    patron: [
      { dia: 1, horas: ['12:30', '17:00'] },
      { dia: 3, horas: ['12:30', '17:00'] },
      { dia: 5, horas: ['09:00'] },
    ],
    ocupados: ['2026-10-14T17:00'],
  },
  {
    id: 'elena', nombre: 'Mtra. Elena Vargas Luna', iniciales: 'EV', grado: 'Maestría en Ciencias de la Computación',
    materias: ['Bases de Datos', 'Aplicaciones Web'],
    temas: ['normalización', 'SQL', 'consumo de APIs REST'],
    modalidades: ['Presencial'], ubicacion: 'Edificio CCO2, cubículo 108', color: 'avatar-purple',
    patron: [
      { dia: 2, horas: ['09:00', '11:00'] },
      { dia: 4, horas: ['09:00', '11:00', '13:00'] },
    ],
    ocupados: [],
  },
  {
    id: 'raul', nombre: 'Dr. Raúl Ortega Cruz', iniciales: 'RO', grado: 'Doctorado en Sistemas Computacionales',
    materias: ['Ingeniería de Software I', 'Aplicaciones Web'],
    temas: ['diagramas UML', 'arquitectura web', 'pruebas'],
    modalidades: ['Presencial', 'En línea'], ubicacion: 'Edificio CCO1, cubículo 306', color: 'avatar-orange',
    patron: [
      { dia: 2, horas: ['16:00'] },
      { dia: 4, horas: ['16:00', '18:00'] },
      { dia: 5, horas: ['10:00'] },
    ],
    ocupados: [],
  },
  {
    id: 'ivan', nombre: 'Mtro. Iván Rosales Gil', iniciales: 'IR', grado: 'Maestría en Matemáticas Aplicadas',
    materias: ['Matemáticas Discretas', 'Cálculo Diferencial'],
    temas: ['inducción matemática', 'límites', 'lógica'],
    modalidades: ['En línea'], ubicacion: 'Enlace de videollamada', color: 'avatar-teal',
    patron: [
      { dia: 3, horas: ['11:00', '12:00'] },
      { dia: 5, horas: ['11:00', '12:00'] },
    ],
    ocupados: [],
  },
  {
    id: 'sofia', nombre: 'Dra. Sofía Navarro Lara', iniciales: 'SN', grado: 'Doctorado en Ciencias de la Información',
    materias: ['Bases de Datos', 'Ingeniería de Software I'],
    temas: ['modelo entidad-relación', 'normalización', 'diagramas UML'],
    modalidades: ['Presencial'], ubicacion: 'Edificio CCO2, cubículo 220', color: 'avatar-pink',
    patron: [],
    ocupados: [],
  },
];

/** Estudiante con la que se recorre el prototipo. */
export const ESTUDIANTE_ACTUAL: Estudiante = {
  nombre: 'Daniela Hernández', programa: 'Lic. en Ciencias de la Computación', semestre: '3er semestre',
};

/** Profesora con la que se recorre el prototipo. */
export const PROFESOR_ACTUAL_ID = 'ana';

// Las solicitudes ahora viven en db.json y se consultan con la API (json-server).

export const NOTIFICACIONES_INICIALES: Notificacion[] = [
  { id: 1, rol: 'estudiante', tipo: 'estado', titulo: 'Tu asesoría fue confirmada',
    texto: 'La Dra. Ana Torres Ruiz confirmó tu solicitud sobre Árboles binarios.',
    fecha: '2026-10-12T09:10', leida: false, destino: '/estudiante/solicitudes/ASE-2026-0001' },
  { id: 2, rol: 'estudiante', tipo: 'recordatorio', titulo: 'Asesoría hoy a las 10:00 h',
    texto: 'Recuerda tu asesoría presencial de Estructuras de Datos.',
    fecha: '2026-10-11T18:00', leida: false, destino: '/estudiante/solicitudes/ASE-2026-0001' },
  { id: 3, rol: 'profesor', tipo: 'solicitud', titulo: 'Nueva solicitud de asesoría',
    texto: 'Mariana López Cruz solicita apoyo con Listas enlazadas.',
    fecha: '2026-10-12T08:05', leida: false, destino: '/profesor/solicitudes' },
  { id: 4, rol: 'profesor', tipo: 'solicitud', titulo: 'Nueva solicitud de asesoría',
    texto: 'Luis Mendoza Rivera solicita apoyo con Recursividad y casos base.',
    fecha: '2026-10-11T19:40', leida: false, destino: '/profesor/solicitudes' },
  { id: 5, rol: 'profesor', tipo: 'recordatorio', titulo: 'Próxima asesoría en 35 minutos',
    texto: 'Asesoría con Daniela Hernández sobre Árboles binarios.',
    fecha: '2026-10-12T09:25', leida: true, destino: '/profesor/panel' },
];
