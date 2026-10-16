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

  // EDITAR INTEGRANTE (ADMIN)
  const [mostrarModalEditarIntegrante, setMostrarModalEditarIntegrante] = useState(false);
  const [integranteEditando, setIntegranteEditando] = useState<any | null>(null);
  const [nombreEdit, setNombreEdit] = useState('');
  const [tipoDocumentoEdit, setTipoDocumentoEdit] = useState('C.C.');
  const [documentoEdit, setDocumentoEdit] = useState('');
  const [edadEdit, setEdadEdit] = useState<string>('');
  const [celularEdit, setCelularEdit] = useState('');
  const [gradoEscolarEdit, setGradoEscolarEdit] = useState('');
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
  const [estadoInstrumento, setEstadoInstrumento] = useState('Excelente');
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
  const [isDragging, setIsDragging] = useState(false);

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
    const { data: dataInt } = await supabase
      .from('integrantes')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: dataProc } = await supabase
      .from('integrante_procesos')
      .select('*')
      .order('created_at', { ascending: false });

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
    setModuloActivo('integrantes');
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

    // Verificar si tiene al menos un proceso aprobado
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
    setModuloActivo('integrantes');
  };

  const esMenorDeEdad = (valorEdad: string | number) => {
    const num = Number(valorEdad);
    return !isNaN(num) && num > 0 && num < 18;
  };

  const esAcudienteObligatorio = (proceso: string, valorEdad: string | number) => {
    if (proceso === 'Proyecto de Música Escolar') return false;
    return esMenorDeEdad(valorEdad);
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

    // 1. Guardar o actualizar datos personales en la tabla única de integrantes
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

    // 2. Registrar el proceso e instrumento específico en la tabla auxiliar
    const { error: errorProc } = await supabase.from('integrante_procesos').insert([
      {
        documento: docLimpio,
        proceso: procesoInscripcion,
        instrumento: instrumento.trim(),
        origen_instrumento: origenInstrumento,
        marca_serie: marcaSerie.trim() || 'No especificada',
        estado_registro: 'Pendiente'
      }
    ]);

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

  // APROBAR SOLICITUD PENDIENTE (ADMIN)
  const aprobarSolicitud = async (idProceso: string) => {
    if (!sesionAdmin) return;
    const { error } = await supabase
      .from('integrante_procesos')
      .update({ estado_registro: 'Aprobado' })
      .eq('id', idProceso);

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

    const { error } = await supabase.from('integrante_procesos').insert([
      {
        documento: docLimpio,
        proceso: procesoActivo,
        instrumento: instrumentoNewAdmin.trim(),
        origen_instrumento: origenNewAdmin,
        marca_serie: marcaNewAdmin.trim() || 'No especificada',
        estado_registro: 'Aprobado',
      },
    ]);

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

  // ELIMINAR PROCESO O INTEGRANTE COMPLETO
  const eliminarProcesoIntegrante = async (idProceso: string) => {
    if (!sesionAdmin) return;
    const confirmar = window.confirm('¿Deseas retirar a este integrante de este proceso?');
    if (!confirmar) return;
    await supabase.from('integrante_procesos').delete().eq('id', idProceso);
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

  // FILTRAR INTEGRANTES PARA LA VISTA ACTUAL
  const procesosEnProcesoActivo = procesosIntegrantes.filter(p => p.proceso === procesoActivo && p.estado_registro === 'Aprobado');
  const pendientesList = procesosIntegrantes.filter(p => p.estado_registro === 'Pendiente');

  const integrantesFiltrados = procesosEnProcesoActivo.map(proc => {
    const infoPersonal = integrantes.find(i => i.documento === proc.documento);
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
    const coincideProceso = o.proceso === procesoActivo;
    const termino = busquedaPartitura.toLowerCase().trim();
    if (!termino) return coincideProceso;
    return coincideProceso && ((o.titulo && o.titulo.toLowerCase().includes(termino)) || (o.compositor_arreglista && o.compositor_arreglista.toLowerCase().includes(termino)));
  });

  const inputStyle = 'w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition text-sm';
  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://codart-gestion.vercel.app';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl)}`;
  const haySesion = sesionAdmin || sesionIntegrante;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
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
              <button onClick={() => setMostrarModalIntegrante(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-bold px-3 py-2.5 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"><span>🎵</span> Iniciar sesión estudiantes</button>
              <button onClick={() => setMostrarModalAdmin(true)} className="bg-slate-800 hover:bg-slate-900 text-white text-xs md:text-sm font-bold px-3 py-2.5 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"><span>🔐</span> Acceso admin</button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL QR */}
      {mostrarQR && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm text-center relative shadow-2xl space-y-4">
            <button onClick={() => setMostrarQR(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
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
            <button onClick={() => setMostrarModalIntegrante(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
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
            <button onClick={() => setMostrarModalAdmin(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Acceso Administrador</h2>
            <form onSubmit={handleLoginAdmin} className="space-y-4">
              <input type="email" placeholder="Correo electrónico" value={emailAdmin} onChange={(e) => setEmailAdmin(e.target.value)} className={inputStyle} required />
              <input type="password" placeholder="Contraseña" value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} className={inputStyle} required />
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold p-3 rounded-xl text-sm">Ingresar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPCIÓN PÚBLICA */}
      {mostrarModalInscripcion && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-lg relative shadow-2xl my-8">
            <button onClick={() => setMostrarModalInscripcion(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Formulario de Inscripción</h2>
            <p className="text-xs text-slate-500 mb-6">Inscríbete en tus procesos o añade un nuevo instrumento si ya estás registrado.</p>

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
                  <input type="text" placeholder="Nombre completo acudiente" value={nombreAcudiente} onChange={(e) => setNombreAcudiente(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-amber-200 text-xs" required={esAcudienteObligatorio(procesoInscripcion, edad)} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Cédula" value={documentoAcudiente} onChange={(e) => setDocumentoAcudiente(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-amber-200 text-xs" />
                    <input type="tel" placeholder="Celular" value={celularAcudiente} onChange={(e) => setCelularAcudiente(e.target.value)} className="w-full bg-white p-2.5 rounded-lg border border-amber-200 text-xs" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input type="text" placeholder="Instrumento para este proceso" value={instrumento} onChange={(e) => setInstrumento(e.target.value)} className={inputStyle} required />
                <select value={origenInstrumento} onChange={(e) => setOrigenInstrumento(e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-semibold">
                  <option value="Prestado (CODART)">🎵 Prestado (CODART)</option>
                  <option value="Propio">⭐ Instrumento Propio</option>
                </select>
              </div>

              <input type="text" placeholder="Marca y Serie (opcional)" value={marcaSerie} onChange={(e) => setMarcaSerie(e.target.value)} className={inputStyle} />
              
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer mt-2">Enviar Inscripción</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO INTEGRANTE (ADMIN) */}
      {mostrarModalNuevoIntegranteAdmin && sesionAdmin && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-lg relative shadow-2xl my-8">
            <button onClick={() => setMostrarModalNuevoIntegranteAdmin(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">➕ Registrar en {procesoActivo}</h2>
            <form onSubmit={handleRegistroAdminDirecto} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <input type="text" placeholder="Nombre completo *" value={nombreNewAdmin} onChange={(e) => setNombreNewAdmin(e.target.value)} className={inputStyle} required />
              <div className="grid grid-cols-3 gap-2">
                <select value={tipoDocNewAdmin} onChange={(e) => setTipoDocNewAdmin(e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 font-semibold text-xs">
                  <option value="C.C.">C.C.</option><option value="T.I.">T.I.</option><option value="R.C.">R.C.</option>
                </select>
                <input type="text" placeholder="Número documento *" value={docNewAdmin} onChange={(e) => setDocNewAdmin(e.target.value)} className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Edad" min="1" max="100" value={edadNewAdmin} onChange={(e) => setEdadNewAdmin(e.target.value)} className={inputStyle} />
                <input type="tel" placeholder="Celular" value={celularNewAdmin} onChange={(e) => setCelularNewAdmin(e.target.value)} className={inputStyle} />
              </div>
              <input type="text" placeholder="Instrumento *" value={instrumentoNewAdmin} onChange={(e) => setInstrumentoNewAdmin(e.target.value)} className={inputStyle} required />
              <select value={origenNewAdmin} onChange={(e) => setOrigenNewAdmin(e.target.value)} className={inputStyle}>
                <option value="Prestado (CODART)">🎵 Prestado (CODART)</option>
                <option value="Propio">⭐ Instrumento Propio</option>
              </select>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer">Guardar e Inscribir</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO INSCRIPCIÓN */}
      {registroExitoso && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <h2 className="text-2xl font-bold text-slate-900">¡Inscripción Recibida!</h2>
            <p className="text-sm text-slate-600">Tu solicitud ha sido enviada y está pendiente de aprobación.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-left space-y-1.5">
              <p className="text-xs font-bold text-amber-900">⚠️ Credenciales de ingreso:</p>
              <ul className="text-xs text-amber-900 font-semibold list-disc list-inside space-y-0.5">
                <li>Usuario: Tu número de identificación.</li>
                <li>Contraseña: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-mono">codart</code></li>
              </ul>
            </div>
            <button onClick={() => setRegistroExitoso(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer">Entendido</button>
          </div>
        </div>
      )}

      {/* MODAL NUEVA CARPETA DRIVE */}
      {mostrarModalNuevaCarpeta && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl">
            <button onClick={() => setMostrarModalNuevaCarpeta(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">📁 Nueva Carpeta (Obra)</h2>
            <form onSubmit={crearCarpetaObra} className="space-y-3">
              <input type="text" placeholder="Título de la Obra *" value={tituloCarpeta} onChange={(e) => setTituloCarpeta(e.target.value)} className={inputStyle} required />
              <input type="text" placeholder="Compositor" value={compositorCarpeta} onChange={(e) => setCompositorCarpeta(e.target.value)} className={inputStyle} />
              <input type="url" placeholder="Enlace de Audio" value={linkAudioCarpeta} onChange={(e) => setLinkAudioCarpeta(e.target.value)} className={inputStyle} />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer">Crear Carpeta</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUBIR ARCHIVOS */}
      {mostrarModalSubirArchivos && obraSeleccionadaDrive && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-lg relative shadow-2xl">
            <button onClick={() => setMostrarModalSubirArchivos(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">📤 Subir Partituras a "{obraSeleccionadaDrive.titulo}"</h2>
            <form onSubmit={subirArchivosSeleccionados} className="space-y-4">
              <input type="file" accept="application/pdf" multiple onChange={(e) => { if (e.target.files) setArchivosSeleccionados(Array.from(e.target.files)); }} className="w-full text-xs text-slate-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white cursor-pointer" />
              <button type="submit" disabled={subiendoArchivos || archivosSeleccionados.length === 0} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm cursor-pointer">{subiendoArchivos ? 'Subiendo...' : 'Subir Archivos'}</button>
            </form>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {haySesion ? (
        <div className="space-y-6">
          <div className="flex gap-2 mb-6 bg-slate-200/60 p-1.5 rounded-2xl max-w-xl mx-auto md:mx-0 flex-wrap">
            <button onClick={() => setModuloActivo('partituras')} className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer text-center ${moduloActivo === 'partituras' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}><span>📂</span> Repositorio</button>
            <button onClick={() => setModuloActivo('integrantes')} className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer text-center ${moduloActivo === 'integrantes' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}><span>👥</span> Integrantes</button>
            {sesionAdmin && (
              <button onClick={() => setModuloActivo('pendientes')} className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer text-center relative ${moduloActivo === 'pendientes' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}>
                <span>⏳</span> Solicitudes {pendientesList.length > 0 && <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendientesList.length}</span>}
              </button>
            )}
          </div>

          {moduloActivo !== 'pendientes' && (
            <div className="flex gap-3 mb-6 flex-wrap">
              {['Banda Filarmónica', 'Banda de Marcha', 'Prebanda', 'Proyecto de Música Escolar'].map((p) => (
                <button key={p} onClick={() => { setProcesoActivo(p); setObraSeleccionadaDrive(null); }} className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition cursor-pointer ${procesoActivo === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}>{p}</button>
              ))}
            </div>
          )}

          {moduloActivo === 'partituras' ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">📂 Repositorio — {procesoActivo}</h2>
                  <p className="text-xs text-slate-500">{obraSeleccionadaDrive ? `Carpeta: "${obraSeleccionadaDrive.titulo}"` : 'Consulta y gestiona partituras.'}</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                  {!obraSeleccionadaDrive && <input type="text" placeholder="Buscar carpeta..." value={busquedaPartitura} onChange={(e) => setBusquedaPartitura(e.target.value)} className="bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none" />}
                  {sesionAdmin && !obraSeleccionadaDrive && <button onClick={() => setMostrarModalNuevaCarpeta(true)} className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">📁+ Nueva Carpeta</button>}
                  {obraSeleccionadaDrive && <button onClick={() => setObraSeleccionadaDrive(null)} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">◀ Volver</button>}
                </div>
              </div>

              {!obraSeleccionadaDrive ? (
                obrasFiltradas.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">No hay carpetas en {procesoActivo}</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {obrasFiltradas.map((obra) => (
                      <div key={obra.id} onClick={() => setObraSeleccionadaDrive(obra)} className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer flex flex-col justify-between group">
                        <div>
                          <div className="flex justify-between items-start mb-3"><span className="text-3xl">📁</span></div>
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 truncate">{obra.titulo}</h3>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{obra.compositor_arreglista || 'Sin compositor'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">📂 {obraSeleccionadaDrive.titulo}</h3>
                    {sesionAdmin && <button onClick={() => setMostrarModalSubirArchivos(true)} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">📤 Subir PDFs</button>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {particelas.filter((p) => p.obra_id === obraSeleccionadaDrive.id).map((archivo) => (
                      <div key={archivo.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 truncate">📄 {archivo.instrumento}</span>
                        <a href={archivo.url_pdf} target="_blank" rel="noopener noreferrer" className="text-xs bg-white border border-slate-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg">Ver PDF</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : moduloActivo === 'pendientes' && sesionAdmin ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">⏳ Solicitudes Pendientes ({pendientesList.length})</h2>
              {pendientesList.length === 0 ? (
                <div className="text-center py-16 text-slate-400">No hay solicitudes pendientes</div>
              ) : (
                <div className="space-y-3">
                  {pendientesList.map((sol) => {
                    const persona = integrantes.find(i => i.documento === sol.documento);
                    return (
                      <div key={sol.id} className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-slate-900">{persona?.nombre || sol.documento}</h3>
                          <p className="text-xs text-slate-600">Proceso: <strong>{sol.proceso}</strong> | Instrumento: <strong className="text-blue-700">{sol.instrumento}</strong></p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => aprobarSolicitud(sol.id)} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer">✓ Aprobar</button>
                          <button onClick={() => eliminarProcesoIntegrante(sol.id)} className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer">🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Integrantes Oficiales ({integrantesFiltrados.length})</h2>
                {sesionAdmin && <button onClick={() => setMostrarModalNuevoIntegranteAdmin(true)} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">➕ Registrar en este Proceso</button>}
              </div>

              {sesionAdmin && <input type="text" placeholder="Buscar integrante..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-sm outline-none" />}

              <div className="space-y-3">
                {integrantesFiltrados.map((item) => (
                  <div key={item.idProceso} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-900">{item.nombre}</h3>
                      <p className="text-xs text-slate-600">Instrumento: <strong className="text-blue-700">{item.instrumento}</strong> ({item.origen_instrumento})</p>
                    </div>
                    {sesionAdmin && (
                      <button onClick={() => eliminarProcesoIntegrante(item.idProceso)} className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer">🗑️ Retirar del Proceso</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-lg mx-auto shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Bienvenido a CODART</h2>
            <button onClick={() => setMostrarModalInscripcion(true)} className="bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer">📝 Realizar Inscripción</button>
          </div>
        </div>
      )}
    </main>
  );
}