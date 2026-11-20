import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CcchApiService,
  ProyectoInvestigacion,
} from '../../services/ccch-api.service';

@Component({
  selector: 'app-proyectos-admin',
  imports: [CommonModule, FormsModule],
  styleUrl: './proyectos-admin.css',
  templateUrl: './proyectos-admin.html',
})
export class ProyectosAdmin implements OnInit {
  private readonly apiService = inject(CcchApiService);

  readonly areasCientificas = ['IA', 'BIO', 'ENERGIA', 'ASTRO', 'SOCIAL'];
  readonly estadosProyecto = ['EJECUCION', 'REVISION', 'FINALIZADO', 'POSTULACION'];

  proyectos: ProyectoInvestigacion[] = [];
  mostrarFormulario = false;
  editandoId: number | null = null;
  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  formulario: ProyectoInvestigacion = this.crearFormularioVacio();

  ngOnInit(): void {
    this.cargarProyectos();
  }

  crearFormularioVacio(): ProyectoInvestigacion {
    return {
      codigo: '',
      titulo: '',
      area_cientifica: 'IA',
      resumen: '',
      investigador_principal: 1,
      estado: 'POSTULACION',
      presupuesto_clp: 0,
      fecha_inicio: '',
      fecha_termino: null,
    };
  }

  limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }

  cargarProyectos(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.apiService.obtenerProyectos().subscribe({
      next: (data) => {
        this.proyectos = data;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los proyectos.';
        this.cargando = false;
      },
    });
  }

  abrirNuevoProyecto(): void {
    this.limpiarMensajes();
    this.editandoId = null;
    this.formulario = this.crearFormularioVacio();
    this.mostrarFormulario = true;
  }

  editarProyecto(proyecto: ProyectoInvestigacion): void {
    this.limpiarMensajes();
    this.editandoId = proyecto.id ?? null;
    this.formulario = {
      id: proyecto.id,
      codigo: proyecto.codigo,
      titulo: proyecto.titulo,
      area_cientifica: proyecto.area_cientifica,
      resumen: proyecto.resumen,
      investigador_principal: Number(proyecto.investigador_principal),
      estado: proyecto.estado,
      presupuesto_clp: Number(proyecto.presupuesto_clp),
      fecha_inicio: proyecto.fecha_inicio,
      fecha_termino: proyecto.fecha_termino ?? null,
    };
    this.mostrarFormulario = true;
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.formulario = this.crearFormularioVacio();
  }

  guardarProyecto(): void {
    this.limpiarMensajes();
    this.cargando = true;

    const payload: ProyectoInvestigacion = {
      codigo: this.formulario.codigo.trim(),
      titulo: this.formulario.titulo.trim(),
      area_cientifica: this.formulario.area_cientifica,
      resumen: this.formulario.resumen.trim(),
      investigador_principal: Number(this.formulario.investigador_principal),
      estado: this.formulario.estado,
      presupuesto_clp: Number(this.formulario.presupuesto_clp),
      fecha_inicio: this.formulario.fecha_inicio,
      fecha_termino: this.formulario.fecha_termino ? this.formulario.fecha_termino : null,
    };

    if (this.editandoId !== null) {
      this.apiService.actualizarProyecto(this.editandoId, payload).subscribe({
        next: () => {
          this.cargando = false;
          this.mostrarFormulario = false;
          this.editandoId = null;
          this.mensajeExito = 'Proyecto actualizado correctamente.';
          this.cargarProyectos();
        },
        error: () => {
          this.cargando = false;
          this.mensajeError = 'No se pudo actualizar el proyecto.';
        },
      });
    } else {
      this.apiService.crearProyecto(payload).subscribe({
        next: () => {
          this.cargando = false;
          this.mostrarFormulario = false;
          this.mensajeExito = 'Proyecto creado correctamente.';
          this.cargarProyectos();
        },
        error: () => {
          this.cargando = false;
          this.mensajeError = 'No se pudo crear el proyecto.';
        },
      });
    }
  }

  eliminarProyecto(id?: number): void {
    if (!id) {
      return;
    }

    this.limpiarMensajes();
    this.cargando = true;

    this.apiService.eliminarProyecto(id).subscribe({
      next: () => {
        this.cargando = false;
        this.mensajeExito = 'Proyecto eliminado correctamente.';
        this.cargarProyectos();
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudo eliminar el proyecto.';
      },
    });
  }

  exportarXml(): void {
    this.limpiarMensajes();
    this.apiService.exportarProyectosXml().subscribe({
      next: (archivo) => {
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'proyectos.xml';
        enlace.click();
        URL.revokeObjectURL(url);
        this.mensajeExito = 'XML exportado correctamente.';
      },
      error: () => {
        this.mensajeError = 'No se pudo exportar el XML.';
      },
    });
  }
}