import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Investigador {
  id: number;
  nombre_completo: string;
  orcid: string | null;
  grado_academico: string;
  institucion: string;
  especialidad: string;
  correo: string;
  biografia: string;
}

export interface ProyectoInvestigacion {
  id?: number;
  codigo: string;
  titulo: string;
  area_cientifica: string;
  area_display?: string;
  resumen: string;
  investigador_principal: number;
  investigador_principal_nombre?: string;
  estado: string;
  estado_display?: string;
  presupuesto_clp: number;
  fecha_inicio: string;
  fecha_termino: string | null;
}

export interface PublicacionCientifica {
  id: number;
  titulo: string;
  autor_principal: string;
  proyecto_codigo: string | null;
  revista_o_congreso: string;
  doi: string;
  anio_publicacion: number;
  resumen_abstract: string;
  url_documento: string;
}

export interface ResumenCcchResponse {
  investigadores: Investigador[];
  proyectos: ProyectoInvestigacion[];
  publicaciones: PublicacionCientifica[];
}

export interface NuevaSolicitudPayload {
  nombre_solicitante: string;
  correo_contacto: string;
  institucion_origen: string;
  tipo_solicitud: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class CcchApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://127.0.0.1:8000/api';

  obtenerResumen(): Observable<ResumenCcchResponse> {
    return this.http.get<ResumenCcchResponse>(`${this.apiBaseUrl}/resumen/`);
  }

  enviarSolicitud(payload: NuevaSolicitudPayload): Observable<{ ok: boolean; id: number; mensaje: string }> {
    return this.http.post<{ ok: boolean; id: number; mensaje: string }>(
      `${this.apiBaseUrl}/solicitudes/`,
      payload
    );
  }

  obtenerProyectos(): Observable<ProyectoInvestigacion[]> {
    return this.http.get<ProyectoInvestigacion[]>(
      `${this.apiBaseUrl}/proyectos/`
    );
  }

  obtenerProyecto(id: number): Observable<ProyectoInvestigacion> {
    return this.http.get<ProyectoInvestigacion>(
      `${this.apiBaseUrl}/proyectos/${id}/`
    );
  }

  crearProyecto(
    proyecto: ProyectoInvestigacion
  ): Observable<ProyectoInvestigacion> {
    return this.http.post<ProyectoInvestigacion>(
      `${this.apiBaseUrl}/proyectos/`,
      proyecto
    );
  }

  actualizarProyecto(
    id: number,
    proyecto: Partial<ProyectoInvestigacion>
  ): Observable<ProyectoInvestigacion> {
    return this.http.patch<ProyectoInvestigacion>(
      `${this.apiBaseUrl}/proyectos/${id}/`,
      proyecto
    );
  }

  eliminarProyecto(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/proyectos/${id}/`
    );
  }

  exportarProyectosXml(): Observable<Blob> {
    return this.http.get(
      `${this.apiBaseUrl}/proyectos/exportar.xml`,
      { responseType: 'blob' }
    );
  }
}
