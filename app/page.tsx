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

    const procesosDelEstudiante = procesosIntegrantes.filter(p => p.documento === docLimpio);
    const tieneAprobado = procesosDelEstudiante.some(p => p.estado_registro === 'Aprobado');

    if (procesosDelEstudiante.length > 0 && !tieneAprobado) {
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
    setModuloActivo('partituras');
  };

  const esMenorDeEdad = (valorEdad: string | number) => {
    const num = Number(valorEdad);
    return !isNaN(num) && num > 0 && num < 18;
  };

  // INSCRIPCIÓN PÚBLICA
  const handleSubmitInscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !documento.trim() || !instrumento.trim()) {
      alert('El nombre, número de documento y el instrumento son obligatorios.');
      return;
    }

    const numEdad = edad ? parseInt(edad, 10) : null;
    const docLimpio = documento.trim();

    await supabase.from('integrantes').upsert([
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
    ], { onConflict: 'documento' });

    const { error: errorProc } = await supabase.from('integrante_procesos').upsert([
      {
        documento: docLimpio,
        proceso: procesoInscripcion,
        instrumento: instrumento.trim(),
        origen_instrumento: origenInstrumento,
        marca_serie: marcaSerie.trim() || 'No especificada',
        estado_registro: 'Pendiente'
      }
    ], { onConflict: 'documento,proceso' });

    if (errorProc) {
      alert('Error al inscribirse en el proceso: ' + errorProc.message);
      return;
    }

    cargarDatos();
    setNombre('');
    setDocumento('');
    setEdad('');
    setCelular('');
    setGradoEscolar('');
    setInstrumento('');
    setMarcaSerie('');
    setNombreAcudiente('');
    setDocumentoAcudiente('');
    setCelularAcudiente('');
    setMostrarModalInscripcion(false);
    setRegistroExitoso(true);
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

    await supabase.from('integrantes').upsert([
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
    setIntegranteEditando(item);
    setNombreEdit(item.nombre || '');
    setTipoDocumentoEdit(item.tipo_documento || 'C.C.');
    setDocumentoEdit(item.documento || '');
    setEdadEdit(item.edad ? String(item.edad) : '');
    setCelularEdit(item.celular || '');
    setGradoEscolarEdit(item.grado_escolar || '');
    setProcesoEdit(item.proceso || 'Banda Filarmónica');
    setInstrumentoEdit(item.instrumento || '');
    setOrigenInstrumentoEdit(item.origen_instrumento || 'Prestado (CODART)');
    setMarcaSerieEdit(item.marca_serie || '');
    setNombreAcudienteEdit(item.nombre_acudiente || '');
    setDocumentoAcudienteEdit(item.documento_acudiente || '');
    setCelularAcudienteEdit(item.celular_acudiente || '');
    setMostrarModalEditarIntegrante(true);
  };

  // GUARDAR EDICIÓN INTEGRANTE
  const guardarEdicionIntegrante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesionAdmin || !integranteEditando) return;

    const numEdad = edadEdit ? parseInt(edadEdit, 10) : null;
    const docLimpio = documentoEdit.trim();

    await supabase.from('integrantes').update({
      nombre: nombreEdit.trim(),
      tipo_documento: tipoDocumentoEdit,
      documento: docLimpio,
      edad: numEdad,
      celular: celularEdit.trim(),
      grado_escolar: procesoEdit === 'Proyecto de Música Escolar' ? gradoEscolarEdit.trim() : null,
      nombre_acudiente: nombreAcudienteEdit.trim() || null,
      documento_acudiente: documentoAcudienteEdit.trim() || null,
      celular_acudiente: celularAcudienteEdit.trim() || null,
    }).eq('documento', integranteEditando.documento);

    await supabase.from('integrante_procesos').update({
      proceso: procesoEdit,
      instrumento: instrumentoEdit.trim(),
      origen_instrumento: origenInstrumentoEdit,
      marca_serie: marcaSerieEdit.trim() || 'No especificada',
    }).eq('id', integranteEditando.idProceso);

    setMostrarModalEditarIntegrante(false);
    setIntegranteEditando(null);
    cargarDatos();
    alert('¡Información actualizada con éxito!');
  };

  // ELIMINAR O RECHAZAR UNA SOLICITUD/PROCESO DE FORMA INDEPENDIENTE
  const eliminarProcesoIntegrante = async (idProceso: string) => {
    if (!sesionAdmin) return;
    const idLimpio = String(idProceso).trim();

    const confirmar = window.confirm('¿Deseas retirar esta solicitud o instrumento específico?');
    if (!confirmar) return;
    
    const { error } = await supabase
      .from('integrante_procesos')
      .delete()
      .eq('id', idLimpio);

    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }

    cargarDatos();
  };

  // CREAR CARPETA OBRA
  const crearCarpetaObra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesionAdmin) return;
    if (!tituloCarpeta.trim()) return;

    const { data } = await supabase.from('obras').insert([
      {
        titulo: tituloCarpeta.trim(),
        compositor_arreglista: compositorCarpeta.trim() || 'No especificado',
        proceso: procesoActivo,
        link_audio: linkAudioCarpeta.trim() || null,
      },
    ]).select();

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

    await supabase
      .from('obras')
      .update({
        titulo: tituloCarpetaEdit.trim(),
        compositor_arreglista: compositorCarpetaEdit.trim() || 'No especificado',
        link_audio: linkAudioCarpetaEdit.trim() || null,
      })
      .eq('id', carpetaEditando.id);

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
        else if (nombreLower.includes('trompeta') || nombreLower.includes('trombón') || nombreLower.includes('corno')) familiaDetectada = 'Vientos Metal';
        else if (nombreLower.includes('bateria') || nombreLower.includes('percursion')) familiaDetectada = 'Percusión';

        const instrumentoNombre = archivo.name.substring(0, archivo.name.lastIndexOf('.')) || archivo.name;

        await supabase.from('particelas').insert([
          {
            obra_id: obraSeleccionadaDrive.id,
            instrumento: instrumentoNombre,
            familia: familiaDetectada,
            url_pdf: publicUrlData.publicUrl,
          },
        ]);
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
    await supabase.from('obras').delete().eq('id', id);
    if (obraSeleccionadaDrive?.id === id) setObraSeleccionadaDrive(null);
    cargarPartituras();
  };

  // FUNCIÓN AUXILIAR PARA OBTENER LINK DE WHATSAPP
  const obtenerLinkWhatsApp = (numCelular: string, nombrePersona: string) => {
    if (!numCelular) return null;
    const numLimpio = numCelular.replace(/\D/g, '');
    if (!numLimpio) return null;
    
    // Si el número no incluye código de país de Colombia (57), se lo anteponemos
    const numFinal = numLimpio.length === 10 ? `57${numLimpio}` : numLimpio;
    const mensaje = encodeURIComponent(`Hola ${nombrePersona}, te contactamos desde la gestión de CODART.`);
    return `https://wa.me/${numFinal}?text=${mensaje}`;
  };

  // FILTRAR INTEGRANTES CON COINCIDENCIA FLEXIBLE DE PROCESOS
  const procesosEnProcesoActivo = procesosIntegrantes.filter(p => {
    if (!p.proceso) return false;
    return p.proceso.trim().toLowerCase() === procesoActivo.trim().toLowerCase() && p.estado_registro === 'Aprobado';
  });

  const pendientesList = procesosIntegrantes.filter(p => p.estado_registro === 'Pendiente');

  const integrantesFiltrados = procesosEnProcesoActivo.map(proc => {
    const infoPersonal = integrantes.find(i => i.documento && proc.documento && i.documento.toString().trim() === proc.documento.toString().trim());
    return { ...infoPersonal, ...proc, idProceso: proc.id };
  }).filter(item => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;
    return (
      (item.nombre && item.nombre.toLowerCase().includes(termino)) ||
      (item.documento && item.documento.toLowerCase().includes(termino)) ||
      (item.instrumento && item.instrumento.toLowerCase().includes(termino))
    );
  });

  const obrasFiltradas = obras.filter((o) => {
    const coincideProceso = o.proceso && o.proceso.trim().toLowerCase() === procesoActivo.trim().toLowerCase();
    const termino = busquedaPartitura.toLowerCase().trim();
    if (!termino) return coincideProceso;
    return coincideProceso && ((o.titulo && o.titulo.toLowerCase().includes(termino)) || (o.compositor_arreglista && o.compositor_arreglista.toLowerCase().includes(termino)));
  });

  const inputStyle = 'w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition text-sm';
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://codart-gestion.vercel.app';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl)}`;

  const usuarioAutenticado = Boolean(sesionAdmin || sesionIntegrante);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="Logo CODART" className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-xl" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">CODART</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Plataforma de Gestión Musical y Documental</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {sesionAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-700 bg-blue-50 px-3 py-2.5 rounded-xl border border-blue-200 font-bold">Admin</span>
              <button onClick={handleLogoutAdmin} className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-2.5 rounded-xl border border-rose-200 transition cursor-pointer">Cerrar Sesión</button>
            </div>
          ) : sesionIntegrante ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-200 font-bold">Músico: {sesionIntegrante.nombre}</span>
              <button onClick={handleLogoutIntegrante} className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-2.5 rounded-xl border border-rose-200 transition cursor-pointer">Cerrar Sesión</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setMostrarModalInscripcion(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"><span>📝</span> Inscripción</button>
              <button onClick={() => setMostrarQR(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs md:text-sm font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5"><span>🔗</span> Código QR</button>
              <button onClick={() => setMostrarModalIntegrante(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold px-3 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"><span>🎵</span> Iniciar sesión estudiantes</button>
              <button onClick={() => setMostrarModalAdmin(true)} className="bg-slate-800 hover:bg-slate-900 text-white text-xs md:text-sm font-bold px-3 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"><span>🔐</span> Acceso admin</button>
            </div>
          )}
        </div>
      </div>

      {/* VISTA PRIVADA (SOLO SI SE INICIÓ SESIÓN) */}
      {usuarioAutenticado ? (
        <>
          {/* MENÚ DE NAVEGACIÓN PRINCIPAL */}
          <div className="flex border-b border-slate-200 mb-6 gap-2">
            <button
              onClick={() => setModuloActivo('partituras')}
              className={`pb-3 px-4 text-sm font-bold transition cursor-pointer border-b-2 ${
                moduloActivo === 'partituras'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              📚 Repositorio de Partituras
            </button>
            <button
              onClick={() => setModuloActivo('integrantes')}
              className={`pb-3 px-4 text-sm font-bold transition cursor-pointer border-b-2 ${
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
                className={`pb-3 px-4 text-sm font-bold transition cursor-pointer border-b-2 flex items-center gap-2 ${
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
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
            {['Banda Filarmónica', 'Banda de Marcha', 'Prebanda', 'Proyecto de Música Escolar'].map((proc) => (
              <button
                key={proc}
                onClick={() => setProcesoActivo(proc)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                  procesoActivo === proc
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {proc}
              </button>
            ))}
          </div>

          {/* MODULO 1: REPOSITORIO DE PARTITURAS */}
          {moduloActivo === 'partituras' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer whitespace-nowrap"
                  >
                    + Nueva Obra
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LISTA DE OBRAS */}
                <div className="md:col-span-1 space-y-3">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Obras Disponibles</h3>
                  {obrasFiltradas.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                      No hay obras registradas para este proceso.
                    </div>
                  ) : (
                    obrasFiltradas.map((obra) => (
                      <div
                        key={obra.id}
                        onClick={() => setObraSeleccionadaDrive(obra)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex justify-between items-center ${
                          obraSeleccionadaDrive?.id === obra.id
                            ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-sm">{obra.titulo}</h4>
                          <p className="text-xs text-slate-500">{obra.compositor_arreglista}</p>
                        </div>
                        {sesionAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalEditarCarpeta(obra);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-1 text-xs"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarCarpetaObra(obra.id);
                              }}
                              className="text-rose-400 hover:text-rose-700 p-1 text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* VISTA DETALLADA DE LA OBRA Y PARTICELAS */}
                <div className="md:col-span-2">
                  {obraSeleccionadaDrive ? (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">{obraSeleccionadaDrive.titulo}</h2>
                          <p className="text-sm text-slate-500">{obraSeleccionadaDrive.compositor_arreglista}</p>
                          {obraSeleccionadaDrive.link_audio && (
                            <a
                              href={obraSeleccionadaDrive.link_audio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold mt-2 hover:underline"
                            >
                              <span>🎧</span> Escuchar Referencia de Audio
                            </a>
                          )}
                        </div>
                        {sesionAdmin && (
                          <button
                            onClick={() => setMostrarModalSubirArchivos(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                          >
                            + Subir PDF
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Particelas / PDF</h4>
                        {particelas.filter((p) => p.obra_id === obraSeleccionadaDrive.id).length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No hay archivos PDF adjuntos en esta obra.</p>
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
                                  className="p-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700 hover:text-indigo-900 transition"
                                >
                                  <span className="truncate pr-2">📄 {p.instrumento}</span>
                                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">Abrir</span>
                                </a>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                      <span className="text-3xl block">🎼</span>
                      <p className="text-sm font-medium">Selecciona una obra de la izquierda para ver e imprimir sus particelas.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODULO 2: GESTIÓN DE INTEGRANTES (DISEÑO COMPACTO Y NÚMERO CON LINK A WHATSAPP) */}
          {moduloActivo === 'integrantes' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer whitespace-nowrap"
                  >
                    + Registrar Integrante
                  </button>
                )}
              </div>

              {/* VISTA COMPACTA TIPO TARJETAS / FILAS VERSÁTILES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {integrantesFiltrados.length === 0 ? (
                  <div className="col-span-full bg-white p-8 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
                    No hay integrantes activos en {procesoActivo}.
                  </div>
                ) : (
                  integrantesFiltrados.map((item) => {
                    const wsUrl = obtenerLinkWhatsApp(item.celular || item.celular_acudiente, item.nombre || 'estudiante');
                    return (
                      <div
                        key={item.idProceso}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs flex justify-between items-start transition space-y-1"
                      >
                        <div className="space-y-1.5">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.nombre || 'Sin nombre'}</h4>
                            <p className="text-[11px] font-semibold text-indigo-600">{item.instrumento} • <span className="text-slate-400 font-normal">{item.origen_instrumento}</span></p>
                          </div>

                          {/* BOTÓN O NUMERO DE REGISTRO LINK A WHATSAPP */}
                          <div className="pt-0.5">
                            {wsUrl ? (
                              <a
                                href={wsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Tocar para chatear por WhatsApp"
                                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg transition cursor-pointer"
                              >
                                <span>💬</span>
                                <span>{item.tipo_documento} {item.documento}</span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono px-2 py-0.5 rounded-lg">
                                🆔 {item.tipo_documento} {item.documento}
                              </span>
                            )}
                          </div>

                          {item.marca_serie && item.marca_serie !== 'No especificada' && (
                            <p className="text-[10px] text-slate-400">Marca/Serie: {item.marca_serie}</p>
                          )}
                        </div>

                        {sesionAdmin && (
                          <div className="flex items-center gap-1 pl-2">
                            <button
                              onClick={() => abrirModalEditarIntegrante(item)}
                              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg text-xs hover:bg-slate-50 transition cursor-pointer"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => eliminarProcesoIntegrante(item.idProceso)}
                              className="text-rose-400 hover:text-rose-700 p-1.5 rounded-lg text-xs hover:bg-rose-50 transition cursor-pointer"
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
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Solicitudes de Inscripción Pendientes</h2>
              <div className="divide-y divide-slate-100">
                {pendientesList.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4">No hay solicitudes pendientes por revisar.</p>
                ) : (
                  pendientesList.map((p) => {
                    const info = integrantes.find((i) => i.documento === p.documento);
                    return (
                      <div key={p.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{info?.nombre || 'Solicitante'}</h4>
                          <p className="text-xs text-slate-500">
                            Doc: {p.documento} | Proceso: <strong className="text-slate-800">{p.proceso}</strong> | Instrumento: <strong className="text-indigo-600">{p.instrumento}</strong>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => aprobarSolicitud(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                          >
                            ✓ Aprobar
                          </button>
                          <button
                            onClick={() => eliminarProcesoIntegrante(p.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
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
        </>
      ) : (
        /* VISTA PÚBLICA (SOLO MUESTRA BIENVENIDA) */
        <div className="bg-white p-10 md:p-16 rounded-3xl border border-slate-200 shadow-xs text-center max-w-2xl mx-auto my-12 space-y-6">
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
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer">Ingresar al Repositorio</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN ADMIN */}
      {mostrarModalAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md relative shadow-xl">
            <button onClick={() => setMostrarModalAdmin(false)} className="absolute top-4 right-4 text-slate-400 font-bold cursor-pointer">✕</button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Acceso Administrador</h2>
            <form onSubmit={handleLoginAdmin} className="space-y-4">
              <input type="email" placeholder="Correo electrónico" value={emailAdmin} onChange={(e) => setEmailAdmin(e.target.value)} className={inputStyle} required />
              <input type="password" placeholder="Contraseña" value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} className={inputStyle} required />
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold p-3 rounded-xl text-sm transition cursor-pointer">Ingresar</button>
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
                  <option value="Proyecto de Música Escolar">Proyecto de Música Escolar</option>
                </select>
              </div>

              <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputStyle} required />
              
              <div className="grid grid-cols-3 gap-2">
                <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 font-semibold text-xs">
                  <option value="C.C.">C.C.</option><option value="T.I.">T.I.</option><option value="R.C.">R.C.</option><option value="C.E.">C.E.</option><option value="P.A.">P.A.</option>
                </select>
                <input type="text" placeholder="Número documento" value={documento} onChange={(e) => setDocumento(e.target.value)} className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 text-sm" required />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Edad" min="1" max="100" value={edad} onChange={(e) => setEdad(e.target.value)} className={inputStyle} />
                <input type="tel" placeholder="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} className={inputStyle} />
              </div>

              {procesoInscripcion === 'Proyecto de Música Escolar' && (
                <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-indigo-900 block">🎓 Grado Escolar</label>
                  <input type="text" placeholder="Ej. Cuarto A" value={gradoEscolar} onChange={(e) => setGradoEscolar(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-indigo-200 text-sm" required />
                </div>
              )}

              {esMenorDeEdad(edad) && (
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-amber-800 block">👨‍👩‍👧 Datos del Acudiente</span>
                  <input type="text" placeholder="Nombre del acudiente" value={nombreAcudiente} onChange={(e) => setNombreAcudiente(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-amber-200 text-sm" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Documento acudiente" value={documentoAcudiente} onChange={(e) => setDocumentoAcudiente(e.target.value)} className="bg-white p-2.5 rounded-lg border border-amber-200 text-sm" />
                    <input type="tel" placeholder="Celular acudiente" value={celularAcudiente} onChange={(e) => setCelularAcudiente(e.target.value)} className="bg-white p-2.5 rounded-lg border border-amber-200 text-sm" />
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

              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition cursor-pointer shadow-xs">
                Enviar Formulario
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN REGISTRO EXITOSO */}
      {registroExitoso && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm text-center relative shadow-2xl space-y-4">
            <span className="text-4xl block">🎉</span>
            <h2 className="text-xl font-bold text-slate-900">¡Registro Recibido!</h2>
            <p className="text-xs text-slate-500">Tu inscripción fue guardada correctamente y se encuentra pendiente de aprobación por el administrador.</p>
            <button onClick={() => setRegistroExitoso(false)} className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer">
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
                <select value={tipoDocNewAdmin} onChange={(e) => setTipoDocNewAdmin(e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold">
                  <option value="C.C.">C.C.</option><option value="T.I.">T.I.</option><option value="R.C.">R.C.</option><option value="C.E.">C.E.</option>
                </select>
                <input type="text" placeholder="Documento" value={docNewAdmin} onChange={(e) => setDocNewAdmin(e.target.value)} className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Edad" value={edadNewAdmin} onChange={(e) => setEdadNewAdmin(e.target.value)} className={inputStyle} />
                <input type="tel" placeholder="Celular" value={celularNewAdmin} onChange={(e) => setCelularNewAdmin(e.target.value)} className={inputStyle} />
              </div>
              <input type="text" placeholder="Instrumento" value={instrumentoNewAdmin} onChange={(e) => setInstrumentoNewAdmin(e.target.value)} className={inputStyle} required />
              <select value={origenNewAdmin} onChange={(e) => setOrigenNewAdmin(e.target.value)} className={inputStyle}>
                <option value="Prestado (CODART)">Prestado (CODART)</option>
                <option value="Propio">Propio</option>
              </select>
              <input type="text" placeholder="Marca / Serie" value={marcaNewAdmin} onChange={(e) => setMarcaNewAdmin(e.target.value)} className={inputStyle} />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer">
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
                <select value={tipoDocumentoEdit} onChange={(e) => setTipoDocumentoEdit(e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold">
                  <option value="C.C.">C.C.</option><option value="T.I.">T.I.</option><option value="R.C.">R.C me.</option><option value="C.E.">C.E.</option>
                </select>
                <input type="text" placeholder="Documento" value={documentoEdit} onChange={(e) => setDocumentoEdit(e.target.value)} className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm" required />
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
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer">
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
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer">
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
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer">
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
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                required
              />
              <button
                type="submit"
                disabled={subiendoArchivos}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer disabled:opacity-50"
              >
                {subiendoArchivos ? 'Subiendo archivos...' : 'Subir a Supabase'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}