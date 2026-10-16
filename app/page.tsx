¡Tienes toda la razón, Jefersson! Me percaté de que en el bloque de botones de la cabecera del repositorio faltó colocar de forma muy visible el botón de "📁+ Nueva Carpeta" (para cuando el administrador esté explorando las obras o carpetas principales) y el botón flotante o directo para que las carpetas abran el selector de archivos al instante.

Además, recuerda que el botón de "Nueva Carpeta" y la opción de subir archivos PDF solo aparecen visibles cuando has iniciado sesión como Administrador. Si entras como integrante o invitado, por seguridad esas opciones no se muestran para mantener el modo de solo lectura.

Código actualizado para app/page.tsx
He ajustado la barra superior del repositorio para que el botón "📁+ Nueva Carpeta" esté siempre presente y destacado para ti como Administrador, permitiéndote crear carpetas y gestionar la subida múltiple de PDFs de forma súper fluida.

Copia y reemplaza todo tu archivo app/page.tsx:

TypeScript
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const [moduloActivo, setModuloActivo] = useState<'integrantes' | 'partituras'>('partituras');
  const [procesoActivo, setProcesoActivo] = useState('Banda Filarmónica');
  
  // INTEGRANTES Y SOLICITUDES
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalInscripcion, setMostrarModalInscripcion] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

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

  // FORMULARIO INSCRIPCIÓN
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

  // EDICIÓN INTEGRANTE
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTipoDocumento, setEditTipoDocumento] = useState('C.C.');
  const [editDocumento, setEditDocumento] = useState('');
  const [editEdad, setEditEdad] = useState<string>('');
  const [editCelular, setEditCelular] = useState('');
  const [editGradoEscolar, setEditGradoEscolar] = useState('');
  const [editInstrumento, setEditInstrumento] = useState('');
  const [editOrigenInstrumento, setEditOrigenInstrumento] = useState('Prestado (CODART)');
  const [editMarcaSerie, setEditMarcaSerie] = useState('');
  const [editEstadoInstrumento, setEditEstadoInstrumento] = useState('Excelente');
  const [editNombreAcudiente, setEditNombreAcudiente] = useState('');
  const [editDocumentoAcudiente, setEditDocumentoAcudiente] = useState('');
  const [editCelularAcudiente, setEditCelularAcudiente] = useState('');

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

  const [mostrarModalSubirArchivos, setMostrarModalSubirArchivos] = useState(false);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [subiendoArchivos, setSubiendoArchivos] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // CALENDARIO
  const [hoy, setHoy] = useState<Date | null>(null);
  const [fechaCalendario, setFechaCalendario] = useState<Date | null>(null);

  useEffect(() => {
    const ahora = new Date();
    setHoy(ahora);
    setFechaCalendario(ahora);

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
    setCargando(true);
    const { data, error } = await supabase
      .from('integrantes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error cargando integrantes:', error.message);
    if (data) setIntegrantes(data);
    setCargando(false);
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
    }
  };

  const handleLogoutAdmin = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert('Error al cerrar sesión: ' + error.message);
  };

  // LOGIN INTEGRANTE
  const handleLoginIntegrante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentoLogin.trim() || !passwordLogin.trim()) return;

    if (passwordLogin.trim().toLowerCase() !== 'codart') {
      alert('Contraseña incorrecta. La contraseña universal para integrantes es "codart".');
      return;
    }

    const { data, error } = await supabase
      .from('integrantes')
      .select('*')
      .eq('documento', documentoLogin.trim())
      .single();

    if (error || !data) {
      alert('No se encontró ningún integrante registrado con el documento ' + documentoLogin);
      return;
    }

    if (data.estado_registro === 'Pendiente') {
      alert('Tu registro aún está pendiente de aprobación por el Administrador de CODART.');
      return;
    }

    setSesionIntegrante(data);
    localStorage.setItem('codart_integrante', JSON.stringify(data));
    setMostrarModalIntegrante(false);
    setDocumentoLogin('');
    setPasswordLogin('');
    alert(`¡Bienvenido(a) de nuevo, ${data.nombre}!`);
  };

  const handleLogoutIntegrante = () => {
    setSesionIntegrante(null);
    localStorage.removeItem('codart_integrante');
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
    if (!nombre.trim() || !instrumento.trim()) {
      alert('El nombre y el instrumento son obligatorios.');
      return;
    }

    const numEdad = edad ? parseInt(edad, 10) : null;
    const estadoInicial = sesionAdmin ? 'Aprobado' : 'Pendiente';
    const procesoFinal = sesionAdmin ? procesoActivo : procesoInscripcion;

    const { data, error } = await supabase
      .from('integrantes')
      .insert([
        {
          nombre: nombre.trim(),
          tipo_documento: tipoDocumento,
          documento: documento.trim(),
          edad: numEdad,
          celular: celular.trim(),
          grado_escolar: procesoFinal === 'Proyecto de Música Escolar' ? gradoEscolar.trim() : null,
          proceso: procesoFinal,
          instrumento: instrumento.trim(),
          origen_instrumento: origenInstrumento,
          marca_serie: marcaSerie.trim() || 'No especificada',
          estado_instrumento: estadoInstrumento,
          nombre_acudiente: nombreAcudiente.trim() || null,
          documento_acudiente: documentoAcudiente.trim() || null,
          celular_acudiente: celularAcudiente.trim() || null,
          estado_registro: estadoInicial,
        },
      ])
      .select();

    if (error) {
      alert('Error al registrar: ' + error.message);
      return;
    }

    if (data) {
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
      setEstadoInstrumento('Excelente');
      setNombreAcudiente('');
      setDocumentoAcudiente('');
      setCelularAcudiente('');
      setMostrarModalInscripcion(false);

      if (!sesionAdmin) {
        setRegistroExitoso(true);
      } else {
        alert('Integrante registrado y aprobado con éxito.');
      }
    }
  };

  const cambiarEstadoRegistro = async (id: string, nuevoEstado: string) => {
    if (!sesionAdmin) return;
    if (nuevoEstado === 'Eliminar') {
      const confirmar = window.confirm('¿Deseas rechazar y eliminar esta solicitud de registro?');
      if (!confirmar) return;
      await supabase.from('integrantes').delete().eq('id', id);
    } else {
      await supabase.from('integrantes').update({ estado_registro: nuevoEstado }).eq('id', id);
    }
    cargarDatos();
  };

  const eliminarIntegrante = async (id: string) => {
    if (!sesionAdmin) return;
    const confirmar = window.confirm('¿Seguro que deseas eliminar este integrante?');
    if (!confirmar) return;
    const { error } = await supabase.from('integrantes').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }
    setIntegrantes(integrantes.filter((i) => i.id !== id));
  };

  // CREAR CARPETA (SOLO ADMIN)
  const crearCarpetaObra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesionAdmin) return;
    if (!tituloCarpeta.trim()) {
      alert('El nombre de la carpeta / obra es obligatorio.');
      return;
    }

    const { data, error } = await supabase.from('obras').insert([
      {
        titulo: tituloCarpeta.trim(),
        compositor_arreglista: compositorCarpeta.trim() || 'No especificado',
        proceso: procesoActivo,
        link_audio: linkAudioCarpeta.trim() || null,
      },
    ]).select();

    if (error) {
      alert('Error al crear carpeta: ' + error.message);
      return;
    }

    setTituloCarpeta('');
    setCompositorCarpeta('');
    setLinkAudioCarpeta('');
    setMostrarModalNuevaCarpeta(false);
    cargarPartituras();

    if (data && data[0]) {
      setObraSeleccionadaDrive(data[0]);
    }
  };

  // SUBIR ARCHIVOS (SOLO ADMIN)
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
          .upload(fileName, archivo, {
            cacheControl: '3600',
            upsert: false,
          });

        if (storageError) throw storageError;

        const { data: publicUrlData } = supabase.storage
          .from('partituras')
          .getPublicUrl(storageData.path);

        let familiaDetectada = 'General / Score';
        const nombreLower = archivo.name.toLowerCase();
        if (nombreLower.includes('clarinete') || nombreLower.includes('saxo') || nombreLower.includes('flauta') || nombreLower.includes('oboe') || nombreLower.includes('fagot')) {
          familiaDetectada = 'Vientos Madera';
        } else if (nombreLower.includes('trompeta') || nombreLower.includes('trombón') || nombreLower.includes('tuba') || nombreLower.includes('corno') || nombreLower.includes('baritono')) {
          familiaDetectada = 'Vientos Metal';
        } else if (nombreLower.includes('bateria') || nombreLower.includes('percursion') || nombreLower.includes('redoblante') || nombreLower.includes('bombo') || nombreLower.includes('lira')) {
          familiaDetectada = 'Percusión';
        }

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

      alert('¡Archivos subidos con éxito!');
      setArchivosSeleccionados([]);
      setMostrarModalSubirArchivos(false);
      cargarPartituras();
    } catch (err: any) {
      alert('Error al subir archivos: ' + err.message);
    } finally {
      setSubiendoArchivos(false);
    }
  };

  const eliminarCarpetaObra = async (id: string) => {
    if (!sesionAdmin) return;
    const confirmar = window.confirm('¿Seguro que deseas eliminar esta carpeta y todos sus PDFs?');
    if (!confirmar) return;

    await supabase.from('obras').delete().eq('id', id);
    if (obraSeleccionadaDrive?.id === id) setObraSeleccionadaDrive(null);
    cargarPartituras();
  };

  const eliminarParticela = async (id: string) => {
    if (!sesionAdmin) return;
    const confirmar = window.confirm('¿Deseas eliminar este archivo?');
    if (!confirmar) return;

    await supabase.from('particelas').delete().eq('id', id);
    cargarPartituras();
  };

  // FILTRADOS
  const pendientes = integrantes.filter((i) => i.estado_registro === 'Pendiente');
  const filtrados = integrantes.filter((integrante) => {
    const esAprobado = integrante.estado_registro !== 'Pendiente';
    const coincideProceso = integrante.proceso === procesoActivo;
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return esAprobado && coincideProceso;
    return (
      esAprobado &&
      coincideProceso &&
      ((integrante.nombre && integrante.nombre.toLowerCase().includes(termino)) ||
        (integrante.documento && integrante.documento.toLowerCase().includes(termino)) ||
        (integrante.instrumento && integrante.instrumento.toLowerCase().includes(termino)))
    );
  });

  const obrasFiltradas = obras.filter((o) => {
    const coincideProceso = o.proceso === procesoActivo;
    const termino = busquedaPartitura.toLowerCase().trim();
    if (!termino) return coincideProceso;
    return (
      coincideProceso &&
      ((o.titulo && o.titulo.toLowerCase().includes(termino)) ||
        (o.compositor_arreglista && o.compositor_arreglista.toLowerCase().includes(termino)))
    );
  });

  // CALENDARIO HELPER
  const obtenerDiasDelMes = (fecha: Date | null) => {
    if (!fecha) return [];
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(anio, mes, 1).getDay();
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const inicioAjustado = primerDia === 0 ? 6 : primerDia - 1;
    const dias = [];
    for (let i = 0; i < inicioAjustado; i++) dias.push(null);
    for (let d = 1; d <= totalDias; d++) dias.push(d);
    return dias;
  };

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const cambiarMes = (delta: number) => {
    if (!fechaCalendario) return;
    setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + delta, 1));
  };

  const inputStyle =
    'w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition text-sm';

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://codart-gestion.vercel.app';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl)}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      {/* ENCABEZADO PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="Logo CODART" 
            className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-xl"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              CODART
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Plataforma de Gestión Musical y Documental
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMostrarModalInscripcion(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
          >
            <span>📝</span> Inscripción
          </button>

          <button
            onClick={() => setMostrarQR(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
            title="Código QR enlace"
          >
            <span>🔗</span> Código QR
          </button>

          {sesionAdmin ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 font-bold">
                Admin
              </span>
              <button
                onClick={handleLogoutAdmin}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200 transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : sesionIntegrante ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 font-bold">
                Músico: {sesionIntegrante.nombre}
              </span>
              <button
                onClick={handleLogoutIntegrante}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200 transition cursor-pointer"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMostrarModalIntegrante(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1"
              >
                🎵 Iniciar Sesión (Músico)
              </button>
              <button
                onClick={() => setMostrarModalAdmin(true)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
              >
                🔐 Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SELECTOR DE MÓDULO */}
      <div className="flex gap-2 mb-6 bg-slate-200/60 p-1.5 rounded-2xl max-w-md mx-auto md:mx-0">
        <button
          onClick={() => setModuloActivo('partituras')}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer text-center flex items-center justify-center gap-2 ${
            moduloActivo === 'partituras'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>📂</span> Repositorio (Drive)
        </button>
        <button
          onClick={() => setModuloActivo('integrantes')}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer text-center flex items-center justify-center gap-2 ${
            moduloActivo === 'integrantes'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>👥</span> Integrantes e Inscripciones
        </button>
      </div>

      {/* PESTAÑAS DE AGRUPACIONES */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          'Banda Filarmónica',
          'Banda de Marcha',
          'Prebanda',
          'Proyecto de Música Escolar',
        ].map((p) => (
          <button
            key={p}
            onClick={() => {
              setProcesoActivo(p);
              setObraSeleccionadaDrive(null);
            }}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition cursor-pointer shadow-xs ${
              procesoActivo === p
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* MODAL CÓDIGO QR */}
      {mostrarQR && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-sm text-center relative shadow-2xl space-y-4">
            <button type="button" onClick={() => setMostrarQR(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-xl font-bold text-slate-900">Código QR de la Plataforma</h2>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block">
              <img src={qrApiUrl} alt="QR CODART" className="w-48 h-48 mx-auto rounded-xl shadow-xs" />
            </div>
            <p className="text-[11px] font-mono text-slate-400 break-all">{appUrl}</p>
            <button onClick={() => window.print()} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer">
              🖨️ Imprimir Código QR
            </button>
          </div>
        </div>
      )}

      {/* MODAL LOGIN INTEGRANTE */}
      {mostrarModalIntegrante && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl space-y-4">
            <button type="button" onClick={() => setMostrarModalIntegrante(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-xl font-bold text-slate-900">🎵 Acceso para Integrantes</h2>
            <p className="text-xs text-slate-500">Ingresa tu número de documento y la contraseña universal <strong>codart</strong>.</p>

            <form onSubmit={handleLoginIntegrante} className="space-y-3">
              <input type="text" placeholder="Número de documento" value={documentoLogin} onChange={(e) => setDocumentoLogin(e.target.value)} className={inputStyle} required />
              <input type="password" placeholder="Contraseña (codart)" value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)} className={inputStyle} required />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer">
                Ingresar al Repositorio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN ADMIN */}
      {mostrarModalAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md relative shadow-xl">
            <button type="button" onClick={() => setMostrarModalAdmin(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Acceso Administrador</h2>
            <form onSubmit={handleLoginAdmin} className="space-y-4">
              <input type="email" placeholder="Correo electrónico" value={emailAdmin} onChange={(e) => setEmailAdmin(e.target.value)} className={inputStyle} required />
              <input type="password" placeholder="Contraseña" value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} className={inputStyle} required />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl text-sm">Ingresar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPCIÓN */}
      {mostrarModalInscripcion && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-lg relative shadow-2xl my-8">
            <button type="button" onClick={() => setMostrarModalInscripcion(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Formulario de Inscripción</h2>
            <p className="text-xs text-slate-500 mb-6">Diligencia tus datos para inscribirte en las agrupaciones.</p>

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
                <input type="text" placeholder="Número documento" value={documento} onChange={(e) => setDocumento(e.target.value)} className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 text-sm" />
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
                <input type="text" placeholder="Instrumento" value={instrumento} onChange={(e) => setInstrumento(e.target.value)} className={inputStyle} required />
                <select value={origenInstrumento} onChange={(e) => setOrigenInstrumento(e.target.value)} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-semibold">
                  <option value="Prestado (CODART)">🎵 Prestado (CODART)</option>
                  <option value="Propio">⭐ Instrumento Propio</option>
                </select>
              </div>

              <input type="text" placeholder="Marca y Serie (opcional)" value={marcaSerie} onChange={(e) => setMarcaSerie(e.target.value)} className={inputStyle} />
              
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer mt-2">
                Enviar Inscripción
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN REGISTRO */}
      {registroExitoso && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <h2 className="text-2xl font-bold text-slate-900">¡Inscripción Recibida!</h2>
            <p className="text-sm text-slate-600">El administrador revisará y aprobará tu solicitud pronto.</p>
            <button onClick={() => setRegistroExitoso(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm">Entendido</button>
          </div>
        </div>
      )}

      {/* MODAL NUEVA CARPETA (SOLO ADMIN) */}
      {mostrarModalNuevaCarpeta && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl">
            <button type="button" onClick={() => setMostrarModalNuevaCarpeta(false)} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">📁 Nueva Carpeta (Obra Musical)</h2>
            <p className="text-xs text-slate-500 mb-4">Agrupación: <strong className="text-blue-600">{procesoActivo}</strong></p>

            <form onSubmit={crearCarpetaObra} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Título de la Obra *</label>
                <input type="text" placeholder="Ej. Colombia Tierra Querida" value={tituloCarpeta} onChange={(e) => setTituloCarpeta(e.target.value)} className={inputStyle} required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Compositor / Arreglista (Opcional)</label>
                <input type="text" placeholder="Ej. Lucho Bermúdez" value={compositorCarpeta} onChange={(e) => setCompositorCarpeta(e.target.value)} className={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Enlace de Audio / YouTube (Opcional)</label>
                <input type="url" placeholder="https://youtube.com/..." value={linkAudioCarpeta} onChange={(e) => setLinkAudioCarpeta(e.target.value)} className={inputStyle} />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer mt-2">
                Crear Carpeta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUBIR ARCHIVOS (SOLO ADMIN) */}
      {mostrarModalSubirArchivos && obraSeleccionadaDrive && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-lg relative shadow-2xl">
            <button type="button" onClick={() => { setMostrarModalSubirArchivos(false); setArchivosSeleccionados([]); }} className="absolute top-4 right-4 text-slate-400 font-bold">✕</button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">📤 Subir Archivos a "{obraSeleccionadaDrive.titulo}"</h2>
            <p className="text-xs text-slate-500 mb-4">Arrastra varios archivos PDF o selecciónalos de tu dispositivo.</p>

            <form onSubmit={subirArchivosSeleccionados} className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) {
                    const pdfs = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
                    setArchivosSeleccionados(prev => [...prev, ...pdfs]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                  isDragging ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/60'
                }`}
              >
                <span className="text-3xl block mb-2">📁</span>
                <p className="text-xs font-bold text-slate-700 mb-1">Arrastra tus archivos PDF aquí</p>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const pdfs = Array.from(e.target.files);
                      setArchivosSeleccionados(prev => [...prev, ...pdfs]);
                    }
                  }}
                  className="mx-auto text-xs text-slate-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer mt-2"
                />
              </div>

              {archivosSeleccionados.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-700">Archivos seleccionados ({archivosSeleccionados.length}):</p>
                  {archivosSeleccionados.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-xs">
                      <span className="truncate max-w-[280px]">📄 {file.name}</span>
                      <button type="button" onClick={() => setArchivosSeleccionados(archivosSeleccionados.filter((_, i) => i !== idx))} className="text-rose-600 font-bold px-1">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={subiendoArchivos || archivosSeleccionados.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
              >
                {subiendoArchivos ? 'Subiendo archivos...' : `Subir ${archivosSeleccionados.length} Archivo(s)`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VISTA 1: REPOSITORIO TIPO DRIVE */}
      {moduloActivo === 'partituras' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📂</span> Repositorio Google Drive — {procesoActivo}
              </h2>
              <p className="text-xs text-slate-500">
                {obraSeleccionadaDrive ? `Carpeta: "${obraSeleccionadaDrive.titulo}"` : sesionIntegrante ? `Hola ${sesionIntegrante.nombre}, consulta y descarga tus partituras.` : 'Explora las carpetas de obras musicales.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              {!obraSeleccionadaDrive && (
                <div className="relative flex-1 md:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar carpeta..."
                    value={busquedaPartitura}
                    onChange={(e) => setBusquedaPartitura(e.target.value)}
                    className="w-full bg-slate-50 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {/* BOTÓN "NUEVA CARPETA" DESTACADO PARA EL ADMIN */}
              {sesionAdmin && !obraSeleccionadaDrive && (
                <button
                  onClick={() => setMostrarModalNuevaCarpeta(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>📁+</span> Nueva Carpeta
                </button>
              )}

              {obraSeleccionadaDrive && (
                <button
                  onClick={() => setObraSeleccionadaDrive(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  ◀ Volver a Carpetas
                </button>
              )}
            </div>
          </div>

          {!obraSeleccionadaDrive ? (
            obrasFiltradas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
                <p className="text-4xl">📁</p>
                <p className="font-semibold text-slate-700 text-sm">No hay carpetas en {procesoActivo}</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {sesionAdmin ? 'Haz clic en el botón superior "Nueva Carpeta" para empezar a organizar tu repertorio musical.' : 'Aún no se han creado carpetas musicales.'}
                </p>
                {sesionAdmin && (
                  <button
                    onClick={() => setMostrarModalNuevaCarpeta(true)}
                    className="mt-2 bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📁+</span> Crear mi primera carpeta
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {obrasFiltradas.map((obra) => {
                  const archivosEnObra = particelas.filter((p) => p.obra_id === obra.id);

                  return (
                    <div
                      key={obra.id}
                      onClick={() => setObraSeleccionadaDrive(obra)}
                      className="bg-white border border-slate-200 hover:border-blue-400 p-5 rounded-2xl shadow-xs transition cursor-pointer flex flex-col justify-between group relative"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-3xl">📁</span>
                          {sesionAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarCarpetaObra(obra.id);
                              }}
                              className="text-slate-300 hover:text-rose-600 font-bold p-1 transition"
                              title="Eliminar carpeta"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition truncate">
                          {obra.titulo}
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {obra.compositor_arreglista && obra.compositor_arreglista !== 'No especificado' ? obra.compositor_arreglista : 'Sin compositor'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-medium">
                        <span>{archivosEnObra.length} archivo(s)</span>
                        <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition font-bold">Abrir →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>📂</span> {obraSeleccionadaDrive.titulo}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compositor: {obraSeleccionadaDrive.compositor_arreglista || 'No especificado'}
                    {obraSeleccionadaDrive.link_audio && (
                      <a href={obraSeleccionadaDrive.link_audio} target="_blank" rel="noopener noreferrer" className="ml-3 text-blue-600 hover:underline">
                        🎧 Audio Guía
                      </a>
                    )}
                  </p>
                </div>

                {sesionAdmin && (
                  <button
                    onClick={() => setMostrarModalSubirArchivos(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📤</span> Subir Archivos PDF
                  </button>
                )}
              </div>

              {particelas.filter((p) => p.obra_id === obraSeleccionadaDrive.id).length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-3">
                  <p className="text-3xl">📄</p>
                  <p className="font-semibold text-slate-700 text-sm">Esta carpeta está vacía</p>
                  <p className="text-xs text-slate-500">Sube tus partituras en PDF para que los integrantes puedan consultarlas.</p>
                  {sesionAdmin && (
                    <button
                      onClick={() => setMostrarModalSubirArchivos(true)}
                      className="mt-2 bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>📤</span> Subir archivos ahora
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {particelas
                    .filter((p) => p.obra_id === obraSeleccionadaDrive.id)
                    .map((archivo) => (
                      <div key={archivo.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center gap-2 hover:border-blue-300 transition">
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">📄 {archivo.instrumento}</p>
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold inline-block mt-1">
                            {archivo.familia}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={archivo.url_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-white border border-slate-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                          >
                            👁️ Ver PDF
                          </a>
                          {sesionAdmin && (
                            <button
                              onClick={() => eliminarParticela(archivo.id)}
                              className="text-rose-600 font-bold p-1"
                              title="Eliminar archivo"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: INTEGRANTES */}
      {moduloActivo === 'integrantes' && (
        <div className="space-y-8">
          {sesionAdmin && pendientes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span>🔔</span> Solicitudes Pendientes ({pendientes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendientes.map((solicitud) => (
                  <div key={solicitud.id} className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs space-y-2">
                    <h3 className="font-bold text-slate-900">{solicitud.nombre}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{solicitud.proceso} — {solicitud.instrumento}</p>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => cambiarEstadoRegistro(solicitud.id, 'Aprobado')} className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg">✓ Aprobar</button>
                      <button onClick={() => cambiarEstadoRegistro(solicitud.id, 'Eliminar')} className="bg-rose-50 text-rose-600 text-xs font-bold px-3 py-2 rounded-lg">✕ Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">🎵 Agrupaciones Musicales CODART</h2>
                <p className="text-sm text-slate-600 mb-4">Pestaña activa: <strong className="text-blue-600">{procesoActivo}</strong>.</p>
              </div>
              <button onClick={() => setMostrarModalInscripcion(true)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm shadow-xs">
                📝 Realizar Inscripción en {procesoActivo}
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">Integrantes Oficiales ({filtrados.length})</h2>
              </div>

              {sesionAdmin && (
                <div className="relative mb-4">
                  <input type="text" placeholder="Buscar integrante..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-slate-50 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
                </div>
              )}

              {!sesionAdmin ? (
                <div className="text-center py-20 text-slate-400 space-y-2">
                  <p className="text-4xl">🔒</p>
                  <p className="font-semibold text-slate-700">Información Protegida</p>
                  <p className="text-xs text-slate-500">Solo el Administrador puede visualizar la lista completa.</p>
                </div>
              ) : filtrados.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">No hay integrantes registrados.</div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filtrados.map((integrante) => (
                    <div key={integrante.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-900">{integrante.nombre}</h3>
                        <p className="text-xs text-blue-600 font-semibold">🎵 {integrante.instrumento}</p>
                      </div>
                      <button onClick={() => eliminarIntegrante(integrante.id)} className="bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-1.5 rounded-lg">🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALENDARIO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="text-lg font-bold text-slate-900">Calendario de Eventos y Ensayos</h2>
          </div>
          {fechaCalendario && (
            <div className="flex items-center gap-2">
              <button onClick={() => cambiarMes(-1)} className="p-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">◀</button>
              <span className="text-sm font-bold text-blue-600 min-w-[130px] text-center">
                {nombresMeses[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
              </span>
              <button onClick={() => cambiarMes(1)} className="p-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">▶</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
          <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {obtenerDiasDelMes(fechaCalendario).map((dia, index) => {
            if (!dia) return <div key={`empty-${index}`} className="h-10"></div>;
            const esHoy =
              hoy &&
              fechaCalendario &&
              dia === hoy.getDate() &&
              fechaCalendario.getMonth() === hoy.getMonth() &&
              fechaCalendario.getFullYear() === hoy.getFullYear();

            return (
              <div
                key={dia}
                className={`h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition cursor-pointer ${
                  esHoy ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-300' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {dia}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}