'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const [moduloActivo, setModuloActivo] = useState<'integrantes' | 'partituras' | 'pendientes'>('partituras');
  const [procesoActivo, setProcesoActivo] = useState('Banda Filarmónica');
  
  // INTEGRANTES Y PROCESOS ASOCIADOS
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [procesosIntegrantes, setProcesosIntegrantes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalInscripcion, setMostrarModalInscripcion] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [enviandoInscripcion, setEnviandoInscripcion] = useState(false);

  // NUEVO INTEGRANTE / PROCESO (ADMIN)
  const [mostrarModalNuevoIntegranteAdmin, setMostrarModalNuevoIntegranteAdmin] = useState(false);
  const [nombreNewAdmin, setNombreNewAdmin] = useState('');
  const [tipoDocNewAdmin, setTipoDocNewAdmin] = useState('C.C.');
  const [docNewAdmin, setDocNewAdmin] = useState('');
  const [edadNewAdmin, setEdadNewAdmin] = useState('');
  const [celularNewAdmin, setCelularNewAdmin] = useState('');
  const [gradoNewAdmin, setGradoNewAdmin] = useState('');
  const [instrumentoNewAdmin, setInstrumentoNewAdmin] = useState('');
  const [origenNewAdmin, setOrigenNewAdmin] = useState('Prestado (CODART)');
  const [marcaNewAdmin, setMarcaNewAdmin] = useState('');
  const [acudienteNombreNewAdmin, setAcudienteNombreNewAdmin] = useState('');
  const [acudienteDocNewAdmin, setAcudienteDocNewAdmin] = useState('');
  const [acudienteCelNewAdmin, setAcudienteCelNewAdmin] = useState('');

  // EDITAR INTEGRANTE / PROCESO (ADMIN - COMPLETO)
  const [mostrarModalEditarIntegrante, setMostrarModalEditarIntegrante] = useState(false);
  const [integranteEditando, setIntegranteEditando] = useState<any | null>(null);
  const [nombreEdit, setNombreEdit] = useState('');
  const [tipoDocumentoEdit, setTipoDocumentoEdit] = useState('C.C.');
  const [documentoEdit, setDocumentoEdit] = useState('');
  const [edadEdit, setEdadEdit] = useState<string>('');
  const [celularEdit, setCelularEdit] = useState('');
  const [gradoEscolarEdit, setGradoEscolarEdit] = useState('');
  const [procesoEdit, setProcesoEdit] = useState('');
  const [instrumentoEdit, setInstrumentoEdit] = useState('');
  const [origenInstrumentoEdit, setOrigenInstrumentoEdit] = useState('Prestado (CODART)');
  const [marcaSerieEdit, setMarcaSerieEdit] = useState('');
  const [nombreAcudienteEdit, setNombreAcudienteEdit] = useState('');
  const [documentoAcudienteEdit, setDocumentoAcudienteEdit] = useState('');
  const [celularAcudienteEdit, setCelularAcudienteEdit] = useState('');

  // AUTH ADMIN
  const [sesionAdmin, setSesionAdmin] = useState<any>(null);
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState(false);
  const [emailAdmin, setEmailAdmin] = useState('');
  const [passwordAdmin, setPasswordAdmin] = useState('');

  // AUTH INTEGRANTE (Contraseña universal: codart)
  const [sesionIntegrante, setSesionIntegrante] = useState<any>(null);
  const [mostrarModalIntegrante, setMostrarModalIntegrante] = useState(false);
  const [documentoLogin, setDocumentoLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // FORMULARIO INSCRIPCIÓN PÚBLICA
  const [procesoInscripcion, setProcesoInscripcion] = useState('Banda Filarmónica');
  const [nombre, setNombre] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('C.C.');
  const [documento, setDocumento] = useState('');
  const [edad, setEdad] = useState<string>('');
  const [celular, setCelular] = useState('');
  const [gradoEscolar, setGradoEscolar] = useState('');
  const [instrumento, setInstrumento] = useState('');
  const [origenInstrumento, setOrigenInstrumento] = useState('Prestado (CODART)');
  const [marcaSerie, setMarcaSerie] = useState('');
  const [nombreAcudiente, setNombreAcudiente] = useState('');
  const [documentoAcudiente, setDocumentoAcudiente] = useState('');
  const [celularAcudiente, setCelularAcudiente] = useState('');

  // REPOSITORIO TIPO DRIVE
  const [obras, setObras] = useState<any[]>([]);
  const [particelas, setParticelas] = useState<any[]>([]);
  const [busquedaPartitura, setBusquedaPartitura] = useState('');
  const [obraSeleccionadaDrive, setObraSeleccionadaDrive] = useState<any | null>(null);

  // MODALES DRIVE ADMIN
  const [mostrarModalNuevaCarpeta, setMostrarModalNuevaCarpeta] = useState(false);
  const [tituloCarpeta, setTituloCarpeta] = useState('');
  const [compositorCarpeta, setCompositorCarpeta] = useState('');
  const [linkAudioCarpeta, setLinkAudioCarpeta] = useState('');

  const [mostrarModalEditarCarpeta, setMostrarModalEditarCarpeta] = useState(false);
  const [carpetaEditando, setCarpetaEditando] = useState<any | null>(null);
  const [tituloCarpetaEdit, setTituloCarpetaEdit] = useState('');
  const [compositorCarpetaEdit, setCompositorCarpetaEdit] = useState('');
  const [linkAudioCarpetaEdit, setLinkAudioCarpetaEdit] = useState('');

  const [mostrarModalSubirArchivos, setMostrarModalSubirArchivos] = useState(false);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [subiendoArchivos, setSubiendoArchivos] = useState(false);

  useEffect(() => {
    cargarDatos();
    cargarPartituras();
    verificarSesiones();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesionAdmin(session);
    });

    const integranteGuardado = localStorage.getItem('codart_integrante');
    if (integranteGuardado) {
      try {
        setSesionIntegrante(JSON.parse(integranteGuardado));
      } catch (e) {
        localStorage.removeItem('codart_integrante');
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    cargarDatos();
    cargarPartituras();
  }, [sesionAdmin]);

  const verificarSesiones = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSesionAdmin(session);
  };

  const cargarDatos = async () => {
    const { data: dataInt, error: errInt } = await supabase
      .from('integrantes')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: dataProc, error: errProc } = await supabase
      .from('integrante_procesos')
      .select('*')
      .order('created_at', { ascending: false });

    if (errInt) console.error('Error cargando integrantes:', errInt);
    if (errProc) console.error('Error cargando procesos:', errProc);

    if (dataInt) setIntegrantes(dataInt);
    if (dataProc) setProcesosIntegrantes(dataProc);
  };

  const cargarPartituras = async () => {
    const { data: dataObras } = await supabase
      .from('obras')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: dataParticelas } = await supabase
      .from('particelas')
      .select('*')
      .order('created_at', { ascending: true });

    if (dataObras) setObras(dataObras);
    if (dataParticelas) setParticelas(dataParticelas);

    setObraSeleccionadaDrive((prev: any) => {
      if (!prev) return null;
      return dataObras?.find((o) => o.id === prev.id) || null;
    });
  };

  // LOGIN ADMIN
  const handleLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: emailAdmin, password: passwordAdmin });
    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } else {
      setMostrarModalAdmin(false);
      setEmailAdmin('');
      setPasswordAdmin('');
      setModuloActivo('partituras');
    }
  };

  const handleLogoutAdmin = async () => {
    await supabase.auth.signOut();
    setProcesoActivo('Banda Filarmónica');
    setModuloActivo('partituras');
  };

  // LOGIN INTEGRANTE
  const handleLoginIntegrante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentoLogin.trim() || !passwordLogin.trim()) return;

    if (passwordLogin.trim().toLowerCase() !== 'codart') {
      alert('Contraseña incorrecta. La contraseña universal para integrantes es "codart".');
      return;
    }

    const docLimpio = documentoLogin.trim();

    const { data, error } = await supabase
      .from('integrantes')
      .select('*')
      .eq('documento', docLimpio)
      .maybeSingle();

    if (error || !data) {
      alert('No se encontró ningún integrante registrado con el documento ' + docLimpio);
      return;
    }

    const { data: procesosDelEstudiante, error: errProcesos } = await supabase
      .from('integrante_procesos')
      .select('*')
      .eq('documento', docLimpio);

    if (errProcesos) {
      alert('No se pudo verificar tu estado de aprobación: ' + errProcesos.message);
      return;
    }

    const lista = procesosDelEstudiante || [];
    const tieneAprobado = lista.some(
      p => p.estado_registro && p.estado_registro.trim().toLowerCase() === 'aprobado'
    );

    if (lista.length > 0 && !tieneAprobado) {
      alert('Tus registros en CODART aún están pendientes de aprobación por el Administrador.');
      return;
    }

    setSesionIntegrante(data);
    localStorage.setItem('codart_integrante', JSON.stringify(data));
    setMostrarModalIntegrante(false);
    setDocumentoLogin('');
    setPasswordLogin('');
    setModuloActivo('partituras');
    alert(`¡Bienvenido(a) de nuevo, ${data.nombre}!`);
  };

  const handleLogoutIntegrante = () => {
    setSesionIntegrante(null);
    localStorage.removeItem('codart_integrante');
    setProcesoActivo('Banda Filarmónica');
    setModuloActivo('partituras');
  };

  const esMenorDeEdad = (valorEdad: string | number) => {
    const num = Number(valorEdad);
    return !isNaN(num) && num > 0 && num < 18;
  };

  // INSCRIPCIÓN PÚBLICA
  const handleSubmitInscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviandoInscripcion) return;
    if (!nombre.trim() || !documento.trim() || !instrumento.trim()) {
      alert('El nombre, número de documento y el instrumento son obligatorios.');
      return;
    }

    setEnviandoInscripcion(true);

    try {
      const numEdad = edad ? parseInt(edad, 10) : null;
      const docLimpio = documento.trim();

      const { error: errorInt } = await supabase.from('integrantes').upsert([
        {
          nombre: nombre.trim(),
          tipo_documento: tipoDocumento,
          documento: docLimpio,
          edad: numEdad,
          celular: celular.trim(),
          grado_escolar: procesoInscripcion === 'Proyecto de Música Escolar' ? gradoEscolar.trim() : null,
          nombre_acudiente: nombreAcudiente.trim() || null,
          documento_acudiente: documentoAcudiente.trim() || null,
          celular_acudiente: celularAcudiente.trim() || null,
        }
      ], { onConflict: 'documento', ignoreDuplicates: true });

      if (errorInt) {
        console.error('Error guardando integrante:', errorInt);
        alert('Error al guardar tus datos personales: ' + errorInt.message);
        return;
      }

      const { error: errorProc } = await supabase.from('integrante_procesos').upsert([
        {
          documento: docLimpio,
          proceso: procesoInscripcion,
          instrumento: instrumento.trim(),
          origen_instrumento: origenInstrumento,
          marca_serie: marcaSerie.trim() || 'No especificada',
          estado_registro: 'Pendiente'
        }
      ], { onConflict: 'documento,proceso', ignoreDuplicates: true });

      if (errorProc) {
        console.error('Error guardando proceso:', errorProc);
        alert('Error al inscribirse en el proceso: ' + errorProc.message);
        return;
      }

      cargarDatos();
      setNombre('');
      setTipoDocumento('C.C.');
      setDocumento('');
      setEdad('');
      setCelular('');
      setGradoEscolar('');
      setInstrumento('');
      setOrigenInstrumento('Prestado (CODART)');
      setMarcaSerie('');
      setNombreAcudiente('');
      setDocumentoAcudiente('');
      setCelularAcudiente('');
      setMostrarModalInscripcion(false);
      setRegistroExitoso(true);
    } finally {
      setEnviandoInscripcion(false);
    }
  };

  // APROBAR UNA SOLICITUD PENDIENTE INDIVIDUAL (ADMIN)
  const aprobarSolicitud = async (idProceso: string) => {
    if (!sesionAdmin) return;
    const idLimpio = String(idProceso).trim();

    const { error } = await supabase
      .from('integrante_procesos')
      .update({ estado_registro: 'Aprobado' })
      .eq('id', idLimpio);

    if (error) {
      alert('Error al aprobar: ' + error.message);
      return;
    }

    cargarDatos();
    alert('¡Proceso e instrumento aprobado con éxito!');
  };

  // REGISTRO DIRECTO DESDE ADMIN
  const handleRegistroAdminDirecto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesionAdmin) return;
    if (!nombreNewAdmin.trim() || !docNewAdmin.trim() || !instrumentoNewAdmin.trim()) {
      alert('Nombre, documento e instrumento son obligatorios.');
      return;
    }

    const numEdad = edadNewAdmin ? parseInt(edadNewAdmin, 10) : null;
    const docLimpio = docNewAdmin.trim();

    const { error: errInt } = await supabase.from('integrantes').upsert([
      {
        nombre: nombreNewAdmin.trim(),
        tipo_documento: tipoDocNewAdmin,
        documento: docLimpio,
        edad: numEdad,
        celular: celularNewAdmin.trim(),
        grado_escolar: procesoActivo === 'Proyecto de Música Escolar' ? gradoNewAdmin.trim() : null,
        nombre_acudiente: acudienteNombreNewAdmin.trim() || null,
        documento_acudiente: acudienteDocNewAdmin.trim() || null,
        celular_acudiente: acudienteCelNewAdmin.trim() || null,
      }
    ], { onConflict: 'documento' });

    if (errInt) {
      console.error('Error guardando integrante:', errInt);
      alert('Error al guardar los datos del integrante: ' + errInt.message);
      return;
    }

    const { error } = await supabase.from('integrante_procesos').upsert([
      {
        documento: docLimpio,
        proceso: procesoActivo,
        instrumento: instrumentoNewAdmin.trim(),
        origen_instrumento: origenNewAdmin,
        marca_serie: marcaNewAdmin.trim() || 'No especificada',
        estado_registro: 'Aprobado',
      },
    ], { onConflict: 'documento,proceso' });

    if (error) {
      alert('Error al registrar en el proceso: ' + error.message);
      return;
    }

    setNombreNewAdmin('');
    setDocNewAdmin('');
    setEdadNewAdmin('');
    setCelularNewAdmin('');
    setGradoNewAdmin('');
    setInstrumentoNewAdmin('');
    setMarcaNewAdmin('');
    setAcudienteNombreNewAdmin('');
    setAcudienteDocNewAdmin('');
    setAcudienteCelNewAdmin('');
    setMostrarModalNuevoIntegranteAdmin(false);

    cargarDatos();
    alert(`¡Inscrito y aprobado con éxito en ${procesoActivo}!`);
  };

  // ABRIR MODAL EDITAR INTEGRANTE
  const abrirModalEditarIntegrante = (item: any) => {
    const infoPersonal = integrantes.find(i => 
      i.documento && item.documento && 
      i.documento.toString().trim() === item.documento.toString().trim()
    ) || item;

    setIntegranteEditando(item);
    setNombreEdit(infoPersonal.nombre || item.nombre || '');
    setTipoDocumentoEdit(infoPersonal.tipo_documento || item.tipo_documento || 'C.C.');
    setDocumentoEdit(infoPersonal.documento || item.documento || '');
    setEdadEdit(infoPersonal.edad ? String(infoPersonal.edad) : (item.edad ? String(item.edad) : ''));
    setCelularEdit(infoPersonal.celular || item.celular || '');
    setGradoEscolarEdit(infoPersonal.grado_escolar || item.grado_escolar || '');
    setProcesoEdit(item.proceso || 'Banda Filarmónica');
    setInstrumentoEdit(item.instrumento || '');
    setOrigenInstrumentoEdit(item.origen_instrumento || 'Prestado (CODART)');
    setMarcaSerieEdit(item.marca_serie && item.marca_serie !== 'No especificada' ? item.marca_serie : '');
    setNombreAcudienteEdit(infoPersonal.nombre_acudiente || '');
    setDocumentoAcudienteEdit(infoPersonal.documento_acudiente || '');
    setCelularAcudienteEdit(infoPersonal.celular_acudiente || '');
    setMostrarModalEditarIntegrante(true);
  };

  // GUARDAR EDICIÓN INTEGRANTE
  const guardarEdicionIntegrante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesionAdmin || !integranteEditando) return;

    const numEdad = edadEdit ? parseInt(edadEdit, 10) : null;
    const docLimpio = documentoEdit.trim();
    const docOriginal = String(integranteEditando.documento || '').trim();

    if (docOriginal && docLimpio !== docOriginal) {
      const { error: errCambioInt } = await supabase
        .from('integrantes')
        .update({ documento: docLimpio })
        .eq('documento', docOriginal);

      if (errCambioInt) {
        console.error('Error cambiando documento:', errCambioInt);
        alert('Error al cambiar el documento: ' + errCambioInt.message);
        return;
      }

      const { error: errCambioProc } = await supabase
        .from('integrante_procesos')
        .update({ documento: docLimpio })
        .eq('documento', docOriginal);

      if (errCambioProc) {
        console.error('Error cambiando documento en procesos:', errCambioProc);
        alert('Error al actualizar el documento en los procesos: ' + errCambioProc.message);
        return;
      }
    }

    const { error: errInt } = await supabase.from('integrantes').upsert([
      {
        nombre: nombreEdit.trim(),
        tipo_documento: tipoDocumentoEdit,
        documento: docLimpio,
        edad: numEdad,
        celular: celularEdit.trim(),
        grado_escolar: procesoEdit === 'Proyecto de Música Escolar' ? gradoEscolarEdit.trim() : null,
        nombre_acudiente: nombreAcudienteEdit.trim() || null,
        documento_acudiente: documentoAcudienteEdit.trim() || null,
        celular_acudiente: celularAcudienteEdit.trim() || null,
      }
    ], { onConflict: 'documento' });

    if (errInt) {
      console.error('Error guardando integrante:', errInt);
      alert('Error al guardar los datos personales: ' + errInt.message);
      return;
    }

    if (integranteEditando.idProceso) {
      const { error: errProc } = await supabase.from('integrante_procesos').update({
        proceso: procesoEdit,
        instrumento: instrumentoEdit.trim(),
        origen_instrumento: origenInstrumentoEdit,
        marca_serie: marcaSerieEdit.trim() || 'No especificada',
      }).eq('id', integranteEditando.idProceso);

      if (errProc) {
        console.error('Error guardando proceso:', errProc);
        alert('Error al guardar el proceso/instrumento: ' + errProc.message);
        return;
      }
    }

    setMostrarModalEditarIntegrante(false);
    setIntegranteEditando(null);
    cargarDatos();
    alert('¡Información actualizada con éxito!');
  };

  // ELIMINAR PROCESO
  const eliminarProcesoIntegrante = async (idProceso: string) => {
    if (!sesionAdmin) return;

    const confirmar = window.confirm('¿Deseas retirar este registro?');
    if (!confirmar) return;
    
    if (idProceso) {
      const { error } = await supabase.from('integrante_procesos').delete().eq('id', String(idProceso).trim());
      if (error) {
        alert('Error al retirar el registro: ' + error.message);
        return;
      }
    }

    cargarDatos();
  };

  // CREAR CARPETA OBRA
  const crearCarpetaObra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesionAdmin) return;
    if (!tituloCarpeta.trim()) return;

    const { data, error } = await supabase.from('obras').insert([
      {
        titulo: tituloCarpeta.trim(),
        compositor_arreglista: compositorCarpeta.trim() || 'No especificado',
        proceso: procesoActivo,
        link_audio: linkAudioCarpeta.trim() || null,
      },
    ]).select();

    if (error) {
      alert('Error al crear la obra: ' + error.message);
      return;
    }

    setTituloCarpeta('');
    setCompositorCarpeta('');
    setLinkAudioCarpeta('');
    setMostrarModalNuevaCarpeta(false);
    cargarPartituras();
    if (data && data[0]) setObraSeleccionadaDrive(data[0]);
  };

  // EDITAR CARPETA
  const abrirModalEditarCarpeta = (obra: any) => {
    setCarpetaEditando(obra);
    setTituloCarpetaEdit(obra.titulo || '');
    setCompositorCarpetaEdit(obra.compositor_arreglista || '');
    setLinkAudioCarpetaEdit(obra.link_audio || '');
    setMostrarModalEditarCarpeta(true);
  };

  const guardarEdicionCarpeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesionAdmin || !carpetaEditando) return;

    const { error } = await supabase
      .from('obras')
      .update({
        titulo: tituloCarpetaEdit.trim(),
        compositor_arreglista: compositorCarpetaEdit.trim() || 'No especificado',
        link_audio: linkAudioCarpetaEdit.trim() || null,
      })
      .eq('id', carpetaEditando.id);

    if (error) {
      alert('Error al guardar la obra: ' + error.message);
      return;
    }

    setMostrarModalEditarCarpeta(false);
    setCarpetaEditando(null);
    cargarPartituras();
  };

  // SUBIR ARCHIVOS
  const subirArchivosSeleccionados = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesionAdmin || !obraSeleccionadaDrive || archivosSeleccionados.length === 0) return;
    setSubiendoArchivos(true);

    try {
      for (const archivo of archivosSeleccionados) {
        const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}_${nombreLimpio}`;
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from('partituras')
          .upload(fileName, archivo, { cacheControl: '3600', upsert: false });

        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage.from('partituras').getPublicUrl(storageData.path);

        let familiaDetectada = 'General / Score';
        const nombreLower = archivo.name.toLowerCase();
        if (nombreLower.includes('clarinete') || nombreLower.includes('saxo') || nombreLower.includes('flauta')) familiaDetectada = 'Vientos Madera';
        else if (nombreLower.includes('trompeta') || nombreLower.includes('trombón') || nombreLower.includes('trombon') || nombreLower.includes('corno')) familiaDetectada = 'Vientos Metal';
        else if (nombreLower.includes('bateria') || nombreLower.includes('percursion') || nombreLower.includes('percusion')) familiaDetectada = 'Percusión';

        const instrumentoNombre = archivo.name.substring(0, archivo.name.lastIndexOf('.')) || archivo.name;

        const { error: errParticela } = await supabase.from('particelas').insert([
          {
            obra_id: obraSeleccionadaDrive.id,
            instrumento: instrumentoNombre,
            familia: familiaDetectada,
            url_pdf: publicUrlData.publicUrl,
          },
        ]);

        if (errParticela) throw errParticela;
      }
      setArchivosSeleccionados([]);
      setMostrarModalSubirArchivos(false);
      cargarPartituras();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSubiendoArchivos(false);
    }
  };

  const eliminarCarpetaObra = async (id: string) => {
    if (!sesionAdmin) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta carpeta?')) return;
    const { error } = await supabase.from('obras').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar la obra: ' + error.message);
      return;
    }
    if (obraSeleccionadaDrive?.id === id) setObraSeleccionadaDrive(null);
    cargarPartituras();
  };

  const obtenerLinkWhatsApp = (numCelular: string, nombrePersona: string) => {
    if (!numCelular) return null;
    const numLimpio = numCelular.replace(/\D/g, '');
    if (!numLimpio) return null;
    
    const numFinal = numLimpio.length === 10 ? `57${numLimpio}` : numLimpio;
    const mensaje = encodeURIComponent(`Hola ${nombrePersona}, te contactamos desde la gestión de CODART.`);
    return `https://wa.me/${numFinal}?text=${mensaje}`;
  };

  const listaProcesosVisibles = sesionAdmin
    ? ['Banda Filarmónica', 'Banda de Marcha', 'Prebanda', 'Proyecto de Música Escolar']
    : ['Banda Filarmónica', 'Banda de Marcha', 'Prebanda'];

  const pendientesList = procesosIntegrantes.filter(p => {
    if (!p.estado_registro) return false;
    return p.estado_registro.trim().toLowerCase() === 'pendiente';
  });

  const procesosEnProcesoActivo = procesosIntegrantes.filter(p => {
    if (!p.proceso || !p.estado_registro) return false;
    return (
      p.proceso.trim().toLowerCase() === procesoActivo.trim().toLowerCase() &&
      p.estado_registro.trim().toLowerCase() === 'aprobado'
    );
  });

  const listaIntegrantesMostrables = procesosEnProcesoActivo.map(proc => {
    const infoPersonal = integrantes.find(i => i.documento && proc.documento && i.documento.toString().trim() === proc.documento.toString().trim());
    return {
      ...proc,
      nombre: infoPersonal?.nombre ?? proc.nombre,
      tipo_documento: infoPersonal?.tipo_documento ?? proc.tipo_documento,
      edad: infoPersonal?.edad ?? proc.edad,
      celular: infoPersonal?.celular ?? proc.celular,
      grado_escolar: infoPersonal?.grado_escolar ?? proc.grado_escolar,
      nombre_acudiente: infoPersonal?.nombre_acudiente,
      documento_acudiente: infoPersonal?.documento_acudiente,
      celular_acudiente: infoPersonal?.celular_acudiente,
      idProceso: proc.id,
    };
  }).filter(item => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;
    return (
      (item.nombre && item.nombre.toLowerCase().includes(termino)) ||
      (sesionAdmin && item.documento && item.documento.toString().toLowerCase().includes(termino)) ||
      (item.instrumento && item.instrumento.toLowerCase().includes(termino))
    );
  });

  const obrasFiltradas = obras.filter((o) => {
    const coincideProceso = o.proceso && o.proceso.trim().toLowerCase() === procesoActivo.trim().toLowerCase();
    const termino = busquedaPartitura.toLowerCase().trim();
    if (!termino) return coincideProceso;
    return coincideProceso && ((o.titulo && o.titulo.toLowerCase().includes(termino)) || (o.compositor_arreglista && o.compositor_arreglista.toLowerCase().includes(termino)));
  });

  const inputStyle = 'w-full bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition text-sm';
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://codart-gestion.vercel.app';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl)}`;

  const usuarioAutenticado = Boolean(sesionAdmin || sesionIntegrante);

  return (
    <main className="min-h-screen bg-slate-100/70 text-slate-800 p-4 md:p-8">
      {/* CONTENEDOR PRINCIPAL CON ANCHO MÁXIMO CENTRADO */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Logo CODART" className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-2xl border border-slate-100" />
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">CODART</h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Plataforma de Gestión Musical y Documental</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 flex-wrap">
            {sesionAdmin ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-blue-700 bg-blue-50 px-4 py-3 rounded-2xl border border-blue-200 font-bold">Admin</span>
                <button onClick={handleLogoutAdmin} className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl border border-rose-200 transition cursor-pointer">Cerrar Sesión</button>
              </div>
            ) : sesionIntegrante ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-emerald-700 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 font-bold">Músico: {sesionIntegrante.nombre}</span>
                <button onClick={handleLogoutIntegrante} className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl border border-rose-200 transition cursor-pointer">Cerrar Sesión</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setMostrarModalInscripcion(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-4 py-3 rounded-2xl shadow-xs transition cursor-pointer flex items-center gap-2"><span>📝</span> Inscripción</button>
                <button onClick={() => setMostrarQR(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-bold px-4 py-3 rounded-2xl border border-slate-200 transition cursor-pointer flex items-center gap-2"><span>🔗</span> Código QR</button>
                <button onClick={() => setMostrarModalIntegrante(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold px-4 py-3 rounded-2xl shadow-xs transition cursor-pointer flex items-center gap-2"><span>🎵</span> Iniciar sesión estudiantes</button>
                <button onClick={() => setMostrarModalAdmin(true)} className="bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-bold px-4 py-3 rounded-2xl shadow-xs transition cursor-pointer flex items-center gap-2"><span>🔐</span> Acceso admin</button>
              </div>
            )}
          </div>
        </div>

        {/* VISTA PRIVADA (SOLO SI SE INICIÓ SESIÓN) */}
        {usuarioAutenticado ? (
          <div className="space-y-6">
            {/* MENÚ DE NAVEGACIÓN PRINCIPAL */}
            <div className="flex border-b border-slate-200/80 gap-4 bg-white px-6 pt-4 rounded-3xl border shadow-xs">
              <button
                onClick={() => setModuloActivo('partituras')}
                className={`pb-4 px-4 text-sm font-bold transition cursor-pointer border-b-2 ${
                  moduloActivo === 'partituras'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                📚 Repositorio de Partituras
              </button>
              <button
                onClick={() => setModuloActivo('integrantes')}
                className={`pb-4 px-4 text-sm font-bold transition cursor-pointer border-b-2 ${
                  moduloActivo === 'integrantes'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                👥 Gestión de Integrantes
              </button>
              {sesionAdmin && (
                <button
                  onClick={() => setModuloActivo('pendientes')}
                  className={`pb-4 px-4 text-sm font-bold transition cursor-pointer border-b-2 flex items-center gap-2 ${
                    moduloActivo === 'pendientes'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>⏳ Solicitudes Pendientes</span>
                  {pendientesList.length > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {pendientesList.length}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* SELECCIÓN DE PROGRAMA / PROCESO */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {listaProcesosVisibles.map((proc) => (
                <button
                  key={proc}
                  onClick={() => setProcesoActivo(proc)}
                  className={`px-5 py-3 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition cursor-pointer shadow-2xs ${
                    procesoActivo === proc
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                  }`}
                >
                  {proc}
                </button>
              ))}
            </div>

            {/* MODULO 1: REPOSITORIO DE PARTITURAS */}
            {moduloActivo === 'partituras' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                  <input
                    type="text"
                    placeholder={`Buscar obra o compositor en ${procesoActivo}...`}
                    value={busquedaPartitura}
                    onChange={(e) => setBusquedaPartitura(e.target.value)}
                    className={inputStyle}
                  />
                  {sesionAdmin && (
                    <button
                      onClick={() => setMostrarModalNuevaCarpeta(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold px-6 py-3.5 rounded-2xl transition cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      + Nueva Obra
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* LISTA DE OBRAS */}
                  <div className="md:col-span-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Obras Disponibles</h3>
                    {obrasFiltradas.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-sm shadow-xs">
                        No hay obras registradas para este proceso.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {obrasFiltradas.map((obra) => (
                          <div
                            key={obra.id}
                            onClick={() => setObraSeleccionadaDrive(obra)}
                            className={`p-4.5 rounded-3xl border transition cursor-pointer flex justify-between items-center shadow-2xs ${
                              obraSeleccionadaDrive?.id === obra.id
                                ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 shadow-xs'
                                : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
                            }`}
                          >
                            <div className="pr-2">
                              <h4 className="font-bold text-sm leading-snug">{obra.titulo}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{obra.compositor_arreglista}</p>
                            </div>
                            {sesionAdmin && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirModalEditarCarpeta(obra);
                                  }}
                                  className="text-slate-400 hover:text-slate-700 p-1.5 text-xs rounded-xl hover:bg-white"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarCarpetaObra(obra.id);
                                  }}
                                  className="text-rose-400 hover:text-rose-700 p-1.5 text-xs rounded-xl hover:bg-white"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* VISTA DETALLADA DE LA OBRA */}
                  <div className="md:col-span-8">
                    {obraSeleccionadaDrive ? (
                      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">{obraSeleccionadaDrive.titulo}</h2>
                            <p className="text-sm text-slate-500 mt-0.5">{obraSeleccionadaDrive.compositor_arreglista}</p>
                            {obraSeleccionadaDrive.link_audio && (
                              <a
                                href={obraSeleccionadaDrive.link_audio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-indigo-600 font-bold mt-2 hover:underline bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100"
                              >
                                <span>🎧</span> Escuchar Referencia de Audio
                              </a>
                            )}
                          </div>
                          {sesionAdmin && (
                            <button
                              onClick={() => setMostrarModalSubirArchivos(true)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer shadow-xs whitespace-nowrap"
                            >
                              + Subir PDF
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Particelas / PDF Disponibles</h4>
                          {particelas.filter((p) => p.obra_id === obraSeleccionadaDrive.id).length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-4">No hay archivos PDF adjuntos en esta obra.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {particelas
                                .filter((p) => p.obra_id === obraSeleccionadaDrive.id)
                                .map((p) => (
                                  <a
                                    key={p.id}
                                    href={p.url_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3.5 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 hover:text-indigo-900 transition shadow-2xs"
                                  >
                                    <span className="truncate pr-2">📄 {p.instrumento}</span>
                                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">Abrir</span>
                                  </a>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-16 text-center rounded-3xl border border-slate-200/80 text-slate-400 space-y-3 shadow-xs">
                        <span className="text-4xl block">🎼</span>
                        <p className="text-sm font-medium text-slate-600">Selecciona una obra de la izquierda para ver e imprimir sus particelas.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MODULO 2: GESTIÓN DE INTEGRANTES */}
            {moduloActivo === 'integrantes' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                  <input
                    type="text"
                    placeholder={`Buscar integrante en ${procesoActivo}...`}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className={inputStyle}
                  />
                  {sesionAdmin && (
                    <button
                      onClick={() => setMostrarModalNuevoIntegranteAdmin(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold px-6 py-3.5 rounded-2xl transition cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      + Registrar Integrante
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listaIntegrantesMostrables.length === 0 ? (
                    <div className="col-span-full bg-white p-10 text-center text-slate-400 rounded-3xl border border-slate-200/80 text-xs shadow-xs">
                      No hay integrantes activos en {procesoActivo}.
                    </div>
                  ) : (
                    listaIntegrantesMostrables.map((item) => {
                      const wsUrl = obtenerLinkWhatsApp(item.celular || item.celular_acudiente, item.nombre || 'estudiante');
                      return (
                        <div
                          key={item.idProceso}
                          className="bg-white p-4.5 rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-2xs flex justify-between items-start transition space-y-1.5"
                        >
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.nombre || 'Sin nombre'}</h4>
                              <p className="text-xs font-semibold text-indigo-600 mt-0.5">{item.instrumento} • <span className="text-slate-400 font-normal">{item.origen_instrumento}</span></p>
                            </div>

                            {/* PRIVACIDAD AJUSTADA: SOLO ADMIN VE Y HACE CLIC EN EL WHATSAPP / DOCUMENTO */}
                            {sesionAdmin ? (
                              <div className="pt-0.5">
                                {wsUrl ? (
                                  <a
                                    href={wsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Tocar para chatear por WhatsApp"
                                    className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                                  >
                                    <span>💬</span>
                                    <span>{item.tipo_documento} {item.documento}</span>
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono px-3 py-1 rounded-xl">
                                    🆔 {item.tipo_documento} {item.documento}
                                  </span>
                                )}
                              </div>
                            ) : (
                              /* VISTA PARA ESTUDIANTES: Solo una insignia genérica de Integrante Activo */
                              <div className="pt-0.5">
                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-xl">
                                  🎵 Integrante Activo
                                </span>
                              </div>
                            )}

                            {sesionAdmin && item.marca_serie && item.marca_serie !== 'No especificada' && (
                              <p className="text-[11px] text-slate-400">Marca/Serie: {item.marca_serie}</p>
                            )}
                          </div>

                          {sesionAdmin && (
                            <div className="flex items-center gap-1 pl-2">
                              <button
                                onClick={() => abrirModalEditarIntegrante(item)}
                                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl text-xs hover:bg-slate-50 transition cursor-pointer"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => eliminarProcesoIntegrante(item.idProceso)}
                                className="text-rose-400 hover:text-rose-700 p-2 rounded-xl text-xs hover:bg-rose-50 transition cursor-pointer"
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* MODULO 3: SOLICITUDES PENDIENTES (ADMIN) */}
            {moduloActivo === 'pendientes' && sesionAdmin && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Solicitudes de Inscripción Pendientes</h2>
                <div className="divide-y divide-slate-100">
                  {pendientesList.length === 0 ? (
                    <p className="text-sm text-slate-400 py-6">No hay solicitudes pendientes por revisar.</p>
                  ) : (
                    pendientesList.map((p) => {
                      const info = integrantes.find((i) => 
                        i.documento && p.documento && 
                        i.documento.toString().trim() === p.documento.toString().trim()
                      );
                      const nombreMostrado = info?.nombre || p.nombre || `Estudiante (Doc: ${p.documento})`;
                      return (
                        <div key={p.id} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">
                              {nombreMostrado}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Doc: <strong>{p.documento}</strong> | Proceso: <strong className="text-slate-800">{p.proceso}</strong> | Instrumento: <strong className="text-indigo-600">{p.instrumento}</strong>
                            </p>
                          </div>
                          <div className="flex gap-2.5">
                            <button
                              onClick={() => aprobarSolicitud(p.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl transition cursor-pointer shadow-xs"
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              onClick={() => eliminarProcesoIntegrante(p.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-4 py-2.5 rounded-2xl transition cursor-pointer border border-rose-200"
                            >
                              ✕ Rechazar
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VISTA PÚBLICA (SOLO MUESTRA BIENVENIDA) */
          <div className="bg-white p-12 md:p-20 rounded-3xl border border-slate-200/80 shadow-xs text-center max-w-xl mx-auto my-12 space-y-6">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-xs">
              🎼
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Bienvenido a la Plataforma CODART</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Accede a nuestro repositorio de partituras e información institucional. Selecciona una de las opciones superiores para continuar.
              </p>
            </div>
          </div>
        )}

        {/* MODAL QR */}
        {mostrarQR && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm text-center relative shadow-2xl space-y-4">
              <button onClick={() => setMostrarQR(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-xl font-bold text-slate-900">Código QR de la Plataforma</h2>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block">
                <img src={qrApiUrl} alt="QR CODART" className="w-48 h-48 mx-auto rounded-xl shadow-xs" />
              </div>
              <p className="text-[11px] font-mono text-slate-400 break-all">{appUrl}</p>
            </div>
          </div>
        )}

        {/* MODAL LOGIN ESTUDIANTE */}
        {mostrarModalIntegrante && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl space-y-4">
              <button onClick={() => setMostrarModalIntegrante(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-xl font-bold text-slate-900">🎵 Acceso para Estudiantes</h2>
              <p className="text-xs text-slate-500">Ingresa tu número de documento y la contraseña universal <strong>codart</strong>.</p>
              <form onSubmit={handleLoginIntegrante} className="space-y-3">
                <input type="text" placeholder="Número de documento" value={documentoLogin} onChange={(e) => setDocumentoLogin(e.target.value)} className={inputStyle} required />
                <input type="password" placeholder="Contraseña (codart)" value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)} className={inputStyle} required />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-xs">Ingresar al Repositorio</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL LOGIN ADMIN */}
        {mostrarModalAdmin && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl space-y-4">
              <button onClick={() => setMostrarModalAdmin(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Acceso Administrador</h2>
              <form onSubmit={handleLoginAdmin} className="space-y-4">
                <input type="email" placeholder="Correo electrónico" value={emailAdmin} onChange={(e) => setEmailAdmin(e.target.value)} className={inputStyle} required />
                <input type="password" placeholder="Contraseña" value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} className={inputStyle} required />
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-xs">Ingresar</button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL INSCRIPCIÓN PÚBLICA */}
        {mostrarModalInscripcion && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-lg relative shadow-2xl my-8">
              <button onClick={() => setMostrarModalInscripcion(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Formulario de Inscripción</h2>
              <p className="text-xs text-slate-500 mb-6">Inscríbete en un programa o añade un nuevo instrumento a tu registro.</p>

              <form onSubmit={handleSubmitInscripcion} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Proceso o Agrupación Musical</label>
                  <select value={procesoInscripcion} onChange={(e) => setProcesoInscripcion(e.target.value)} className={inputStyle}>
                    <option value="Banda Filarmónica">Banda Filarmónica</option>
                    <option value="Banda de Marcha">Banda de Marcha</option>
                    <option value="Prebanda">Prebanda</option>
                  </select>
                </div>

                <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputStyle} required />
                
                <div className="grid grid-cols-3 gap-2">
                  <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-800 font-semibold text-xs">
                    <option value="C.C.">C.C.</option><option value="T.I.">T.I.</option><option value="R.C.">R.C.</option><option value="C.E.">C.E.</option><option value="P.A.">P.A.</option>
                  </select>
                  <input type="text" placeholder="Número documento" value={documento} onChange={(e) => setDocumento(e.target.value)} className="col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-800 text-sm" required />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Edad" min="1" max="100" value={edad} onChange={(e) => setEdad(e.target.value)} className={inputStyle} />
                  <input type="tel" placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} className={inputStyle} />
                </div>

                {esMenorDeEdad(edad) && (
                  <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-amber-800 block">👨‍👩‍👧 Datos del Acudiente</span>
                    <input type="text" placeholder="Nombre del acudiente" value={nombreAcudiente} onChange={(e) => setNombreAcudiente(e.target.value)} className="w-full bg-white p-3 rounded-xl border border-amber-200 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Documento acudiente" value={documentoAcudiente} onChange={(e) => setDocumentoAcudiente(e.target.value)} className="bg-white p-3 rounded-xl border border-amber-200 text-sm" />
                      <input type="tel" placeholder="Celular acudiente" value={celularAcudiente} onChange={(e) => setCelularAcudiente(e.target.value)} className="bg-white p-3 rounded-xl border border-amber-200 text-sm" />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Instrumento e Información</label>
                  <input type="text" placeholder="Instrumento (ej. Clarinete, Trompeta)" value={instrumento} onChange={(e) => setInstrumento(e.target.value)} className={inputStyle} required />
                  
                  <select value={origenInstrumento} onChange={(e) => setOrigenInstrumento(e.target.value)} className={inputStyle}>
                    <option value="Prestado (CODART)">Prestado (CODART)</option>
                    <option value="Propio">Propio</option>
                  </select>

                  <input type="text" placeholder="Marca / Número de serie" value={marcaSerie} onChange={(e) => setMarcaSerie(e.target.value)} className={inputStyle} />
                </div>

                <button type="submit" disabled={enviandoInscripcion} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-xs disabled:opacity-50">
                  {enviandoInscripcion ? 'Enviando...' : 'Enviar Formulario'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CONFIRMACIÓN REGISTRO EXITOSO */}
        {registroExitoso && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-sm text-center relative shadow-2xl space-y-4">
              <span className="text-4xl block">🎉</span>
              <h2 className="text-xl font-bold text-slate-900">¡Inscripción Recibida!</h2>
              <p className="text-xs text-slate-500">
                Tu solicitud ha sido guardada con éxito y se encuentra pendiente de aprobación por el administrador.
              </p>

              <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <span>🔑</span>
                  <span>Instrucciones de Acceso</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Una vez aceptada tu solicitud, podrás ingresar a la plataforma con tus credenciales:
                </p>
                <ul className="text-[11px] font-mono text-amber-900 space-y-0.5 bg-amber-100/60 p-2 rounded-xl">
                  <li>• <strong>Usuario:</strong> Tu N° de identificación</li>
                  <li>• <strong>Contraseña:</strong> codart</li>
                </ul>
              </div>

              <button onClick={() => setRegistroExitoso(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer shadow-xs">
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* MODAL REGISTRO DIRECTO ADMIN */}
        {mostrarModalNuevoIntegranteAdmin && sesionAdmin && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-lg relative shadow-2xl my-8">
              <button onClick={() => setMostrarModalNuevoIntegranteAdmin(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Inscribir en {procesoActivo}</h2>
              <form onSubmit={handleRegistroAdminDirecto} className="space-y-3 mt-4">
                <input type="text" placeholder="Nombre completo" value={nombreNewAdmin} onChange={(e) => setNombreNewAdmin(e.target.value)} className={inputStyle} required />
                <div className="grid grid-cols-3 gap-2">
                  <select value={tipoDocNewAdmin} onChange={(e) => setTipoDocNewAdmin(e.target.value)} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold">
                    <option value="C.C.">C.C.</option><option value="T.I.">T.I.</option><option value="R.C.">R.C me.</option><option value="C.E.">C.E.</option>
                  </select>
                  <input type="text" placeholder="Documento" value={docNewAdmin} onChange={(e) => setDocNewAdmin(e.target.value)} className="col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Edad" value={edadNewAdmin} onChange={(e) => setEdadNewAdmin(e.target.value)} className={inputStyle} />
                  <input type="tel" placeholder="Celular" value={celularNewAdmin} onChange={(e) => setCelularNewAdmin(e.target.value)} className={inputStyle} />
                </div>
                {procesoActivo === 'Proyecto de Música Escolar' && (
                  <input type="text" placeholder="Grado Escolar (ej. Cuarto A)" value={gradoNewAdmin} onChange={(e) => setGradoNewAdmin(e.target.value)} className={inputStyle} required />
                )}
                <input type="text" placeholder="Instrumento" value={instrumentoNewAdmin} onChange={(e) => setInstrumentoNewAdmin(e.target.value)} className={inputStyle} required />
                <select value={origenNewAdmin} onChange={(e) => setOrigenNewAdmin(e.target.value)} className={inputStyle}>
                  <option value="Prestado (CODART)">Prestado (CODART)</option>
                  <option value="Propio">Propio</option>
                </select>
                <input type="text" placeholder="Marca / Serie" value={marcaNewAdmin} onChange={(e) => setMarcaNewAdmin(e.target.value)} className={inputStyle} />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-xs">
                  Registrar y Aprobar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDITAR INTEGRANTE ADMIN */}
        {mostrarModalEditarIntegrante && sesionAdmin && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-lg relative shadow-2xl my-8">
              <button onClick={() => setMostrarModalEditarIntegrante(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Editar Datos de Integrante</h2>
              <form onSubmit={guardarEdicionIntegrante} className="space-y-3">
                <input type="text" placeholder="Nombre" value={nombreEdit} onChange={(e) => setNombreEdit(e.target.value)} className={inputStyle} required />
                <div className="grid grid-cols-3 gap-2">
                  <select value={tipoDocumentoEdit} onChange={(e) => setTipoDocumentoEdit(e.target.value)} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-bold">
                    <option value="C.C.">C.C.</option><option value="T.I.">T.I.</option><option value="R.C.">R.C.</option><option value="C.E.">C.E.</option>
                  </select>
                  <input type="text" placeholder="Documento" value={documentoEdit} onChange={(e) => setDocumentoEdit(e.target.value)} className="col-span-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Edad" value={edadEdit} onChange={(e) => setEdadEdit(e.target.value)} className={inputStyle} />
                  <input type="tel" placeholder="Celular" value={celularEdit} onChange={(e) => setCelularEdit(e.target.value)} className={inputStyle} />
                </div>
                <input type="text" placeholder="Instrumento" value={instrumentoEdit} onChange={(e) => setInstrumentoEdit(e.target.value)} className={inputStyle} required />
                <select value={origenInstrumentoEdit} onChange={(e) => setOrigenInstrumentoEdit(e.target.value)} className={inputStyle}>
                  <option value="Prestado (CODART)">Prestado (CODART)</option>
                  <option value="Propio">Propio</option>
                </select>
                <input type="text" placeholder="Marca / Serie" value={marcaSerieEdit} onChange={(e) => setMarcaSerieEdit(e.target.value)} className={inputStyle} />
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-xs">
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL CREAR CARPETA OBRA */}
        {mostrarModalNuevaCarpeta && sesionAdmin && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl space-y-4">
              <button onClick={() => setMostrarModalNuevaCarpeta(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-xl font-bold text-slate-900">Nueva Obra para {procesoActivo}</h2>
              <form onSubmit={crearCarpetaObra} className="space-y-3">
                <input type="text" placeholder="Título de la obra" value={tituloCarpeta} onChange={(e) => setTituloCarpeta(e.target.value)} className={inputStyle} required />
                <input type="text" placeholder="Compositor / Arreglista" value={compositorCarpeta} onChange={(e) => setCompositorCarpeta(e.target.value)} className={inputStyle} />
                <input type="url" placeholder="Link de audio de referencia (YouTube/Drive/MP3)" value={linkAudioCarpeta} onChange={(e) => setLinkAudioCarpeta(e.target.value)} className={inputStyle} />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-xs">
                  Crear Obra
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDITAR CARPETA OBRA */}
        {mostrarModalEditarCarpeta && sesionAdmin && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl space-y-4">
              <button onClick={() => setMostrarModalEditarCarpeta(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-xl font-bold text-slate-900">Editar Obra</h2>
              <form onSubmit={guardarEdicionCarpeta} className="space-y-3">
                <input type="text" placeholder="Título de la obra" value={tituloCarpetaEdit} onChange={(e) => setTituloCarpetaEdit(e.target.value)} className={inputStyle} required />
                <input type="text" placeholder="Compositor / Arreglista" value={compositorCarpetaEdit} onChange={(e) => setCompositorCarpetaEdit(e.target.value)} className={inputStyle} />
                <input type="url" placeholder="Link de audio de referencia" value={linkAudioCarpetaEdit} onChange={(e) => setLinkAudioCarpetaEdit(e.target.value)} className={inputStyle} />
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-xs">
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL SUBIR ARCHIVOS DE PARTITURAS */}
        {mostrarModalSubirArchivos && sesionAdmin && obraSeleccionadaDrive && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl space-y-4">
              <button onClick={() => setMostrarModalSubirArchivos(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
              <h2 className="text-xl font-bold text-slate-900">Subir Particelas PDF</h2>
              <p className="text-xs text-slate-500">Obra: <strong>{obraSeleccionadaDrive.titulo}</strong></p>
              <form onSubmit={subirArchivosSeleccionados} className="space-y-4">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => setArchivosSeleccionados(Array.from(e.target.files || []))}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  required
                />
                <button
                  type="submit"
                  disabled={subiendoArchivos}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {subiendoArchivos ? 'Subiendo archivos...' : 'Subir a Supabase'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}