'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  // NAVEGACIÓN DE MÓDULOS (Integrantes vs Partituras)
  const [moduloActivo, setModuloActivo] = useState<'integrantes' | 'partituras'>('partituras');

  // PROCESOS / AGRUPACIONES
  const [procesoActivo, setProcesoActivo] = useState('Banda Filarmónica');
  
  // INTEGRANTES Y SOLICITUDES
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalInscripcion, setMostrarModalInscripcion] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  // AUTH ADMIN
  const [sesion, setSesion] = useState<any>(null);
  const [mostrarModalAdmin, setMostrarModalAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // FORMULARIO INTEGRANTE (INSCRIPCIÓN)
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

  // ESTADOS DEL REPOSITORIO DE PARTITURAS
  const [obras, setObras] = useState<any[]>([]);
  const [particelas, setParticelas] = useState<any[]>([]);
  const [busquedaPartitura, setBusquedaPartitura] = useState('');
  const [obraDesplegada, setObraDesplegada] = useState<string | null>(null);

  // MODALES Y FORMULARIOS DE PARTITURAS (ADMIN)
  const [mostrarModalNuevaObra, setMostrarModalNuevaObra] = useState(false);
  const [tituloObra, setTituloObra] = useState('');
  const [compositorObra, setCompositorObra] = useState('');
  const [linkAudioObra, setLinkAudioObra] = useState('');

  const [mostrarModalSubirParticela, setMostrarModalSubirParticela] = useState(false);
  const [obraIdSeleccionada, setObraIdSeleccionada] = useState<string | null>(null);
  const [instrumentoParticela, setInstrumentoParticela] = useState('');
  const [familiaParticela, setFamiliaParticela] = useState('Vientos Madera');
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);
  const [subiendoPDF, setSubiendoPDF] = useState(false);

  // CALENDARIO
  const [hoy, setHoy] = useState<Date | null>(null);
  const [fechaCalendario, setFechaCalendario] = useState<Date | null>(null);

  useEffect(() => {
    const ahora = new Date();
    setHoy(ahora);
    setFechaCalendario(ahora);

    cargarDatos();
    cargarPartituras();
    verificarSesion();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const verificarSesion = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSesion(session);
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
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Error al iniciar sesión: ' + error.message);
    } else {
      setMostrarModalAdmin(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert('Error al cerrar sesión: ' + error.message);
  };

  const esMenorDeEdad = (valorEdad: string | number) => {
    const num = Number(valorEdad);
    return !isNaN(num) && num > 0 && num < 18;
  };

  const esAcudienteObligatorio = (proceso: string, valorEdad: string | number) => {
    if (proceso === 'Proyecto de Música Escolar') return false;
    return esMenorDeEdad(valorEdad);
  };

  // MANEJO DE INTEGRANTES
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !instrumento.trim()) {
      alert('El nombre y el instrumento son obligatorios.');
      return;
    }

    const numEdad = edad ? parseInt(edad, 10) : null;
    const estadoInicial = sesion ? 'Aprobado' : 'Pendiente';
    const procesoFinal = sesion ? procesoActivo : procesoInscripcion;

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

      if (!sesion) {
        setRegistroExitoso(true);
      } else {
        alert('Integrante registrado y aprobado con éxito.');
      }
    }
  };

  const cambiarEstadoRegistro = async (id: string, nuevoEstado: string) => {
    if (!sesion) return;
    if (nuevoEstado === 'Eliminar') {
      const confirmar = window.confirm('¿Deseas rechazar y eliminar esta solicitud de registro?');
      if (!confirmar) return;
      await supabase.from('integrantes').delete().eq('id', id);
    } else {
      await supabase.from('integrantes').update({ estado_registro: nuevoEstado }).eq('id', id);
    }
    cargarDatos();
  };

  const iniciarEdicion = (integrante: any) => {
    setEditandoId(integrante.id);
    setEditNombre(integrante.nombre || '');
    setEditTipoDocumento(integrante.tipo_documento || 'C.C.');
    setEditDocumento(integrante.documento || '');
    setEditEdad(integrante.edad !== null && integrante.edad !== undefined ? String(integrante.edad) : '');
    setEditCelular(integrante.celular || '');
    setEditGradoEscolar(integrante.grado_escolar || '');
    setEditInstrumento(integrante.instrumento || '');
    setEditOrigenInstrumento(integrante.origen_instrumento || 'Prestado (CODART)');
    setEditMarcaSerie(integrante.marca_serie || '');
    setEditEstadoInstrumento(integrante.estado_instrumento || 'Excelente');
    setEditNombreAcudiente(integrante.nombre_acudiente || '');
    setEditDocumentoAcudiente(integrante.documento_acudiente || '');
    setEditCelularAcudiente(integrante.celular_acudiente || '');
  };

  const guardarEdicion = async (id: string) => {
    const numEdad = editEdad ? parseInt(editEdad, 10) : null;
    const { error } = await supabase
      .from('integrantes')
      .update({
        nombre: editNombre.trim(),
        tipo_documento: editTipoDocumento,
        documento: editDocumento.trim(),
        edad: numEdad,
        celular: editCelular.trim(),
        grado_escolar: procesoActivo === 'Proyecto de Música Escolar' ? editGradoEscolar.trim() : null,
        instrumento: editInstrumento.trim(),
        origen_instrumento: editOrigenInstrumento,
        marca_serie: editMarcaSerie.trim(),
        estado_instrumento: editEstadoInstrumento,
        nombre_acudiente: editNombreAcudiente.trim() || null,
        documento_acudiente: editDocumentoAcudiente.trim() || null,
        celular_acudiente: editCelularAcudiente.trim() || null,
      })
      .eq('id', id);

    if (error) {
      alert('Error al actualizar: ' + error.message);
      return;
    }
    setEditandoId(null);
    cargarDatos();
  };

  const eliminarIntegrante = async (id: string) => {
    if (!sesion) return;
    const confirmar = window.confirm('¿Seguro que deseas eliminar este integrante?');
    if (!confirmar) return;
    const { error } = await supabase.from('integrantes').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }
    setIntegrantes(integrantes.filter((i) => i.id !== id));
  };

  // MANEJO DE PARTITURAS (ADMIN)
  const crearObra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesion) return;
    if (!tituloObra.trim()) {
      alert('El título de la obra es obligatorio.');
      return;
    }

    const { error } = await supabase.from('obras').insert([
      {
        titulo: tituloObra.trim(),
        compositor_arreglista: compositorObra.trim() || null,
        proceso: procesoActivo,
        link_audio: linkAudioObra.trim() || null,
      },
    ]);

    if (error) {
      alert('Error al crear la obra: ' + error.message);
      return;
    }

    setTituloObra('');
    setCompositorObra('');
    setLinkAudioObra('');
    setMostrarModalNuevaObra(false);
    cargarPartituras();
  };

  const subirParticela = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesion) return;
    if (!obraIdSeleccionada || !instrumentoParticela.trim() || !archivoPDF) {
      alert('Por favor selecciona la obra, indica el instrumento y sube un archivo PDF.');
      return;
    }

    setSubiendoPDF(true);

    try {
      const nombreLimpio = archivoPDF.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now()}_${nombreLimpio}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('partituras')
        .upload(fileName, archivoPDF, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage
        .from('partituras')
        .getPublicUrl(storageData.path);

      const urlPDF = publicUrlData.publicUrl;

      const { error: dbError } = await supabase.from('particelas').insert([
        {
          obra_id: obraIdSeleccionada,
          instrumento: instrumentoParticela.trim(),
          familia: familiaParticela,
          url_pdf: urlPDF,
        },
      ]);

      if (dbError) throw dbError;

      alert('¡Particela subida con éxito!');
      setInstrumentoParticela('');
      setArchivoPDF(null);
      setMostrarModalSubirParticela(false);
      cargarPartituras();
    } catch (err: any) {
      alert('Error al subir particela: ' + err.message);
    } finally {
      setSubiendoPDF(false);
    }
  };

  const eliminarObra = async (id: string) => {
    if (!sesion) return;
    const confirmar = window.confirm('¿Seguro que deseas eliminar esta obra y todas sus partituras asociados?');
    if (!confirmar) return;

    await supabase.from('obras').delete().eq('id', id);
    cargarPartituras();
  };

  const eliminarParticela = async (id: string) => {
    if (!sesion) return;
    const confirmar = window.confirm('¿Deseas eliminar esta partitura?');
    if (!confirmar) return;

    await supabase.from('particelas').delete().eq('id', id);
    cargarPartituras();
  };

  // FILTRADOS DE INTEGRANTES
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

  // FILTRADO DE OBRAS
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

  // HELPER CALENDARIO
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
  const editInputStyle =
    'w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 text-xs outline-none focus:border-blue-600 mb-2';

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
              Plataforma de Gestión e Inventario Musical
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMostrarModalInscripcion(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
          >
            <span>📝</span> Inscripción / Registro
          </button>

          <button
            onClick={() => setMostrarQR(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
            title="Código QR enlace"
          >
            <span>🔗</span> Código QR
          </button>

          {sesion ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-700 bg-blue-50 px-3 py-2.5 rounded-xl border border-blue-200 font-medium">
                Admin
              </span>
              <button
                onClick={handleLogout}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-2.5 rounded-xl border border-rose-200 transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMostrarModalAdmin(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              🔐 Acceso Admin
            </button>
          )}
        </div>
      </div>

      {/* SELECCIÓN DE MÓDULO (INTEGRANTES VS REPOSITORIO DE PARTITURAS) */}
      <div className="flex gap-2 mb-6 bg-slate-200/60 p-1.5 rounded-2xl max-w-md mx-auto md:mx-0">
        <button
          onClick={() => setModuloActivo('partituras')}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition cursor-pointer text-center flex items-center justify-center gap-2 ${
            moduloActivo === 'partituras'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🎼</span> Repositorio de Partituras
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

      {/* PESTAÑAS DE AGRUPACIONES / PROCESOS */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          'Banda Filarmónica',
          'Banda de Marcha',
          'Prebanda',
          'Proyecto de Música Escolar',
        ].map((p) => (
          <button
            key={p}
            onClick={() => setProcesoActivo(p)}
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
            <button
              type="button"
              onClick={() => setMostrarQR(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-900">
              Código QR de la Plataforma
            </h2>
            <p className="text-xs text-slate-500">
              Escanea con tu celular para acceder a la plataforma de <strong>CODART</strong>.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block">
              <img src={qrApiUrl} alt="Código QR CODART" className="w-48 h-48 mx-auto rounded-xl shadow-xs" />
            </div>
            <p className="text-[11px] font-mono text-slate-400 break-all">{appUrl}</p>
            <button
              onClick={() => window.print()}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              🖨️ Imprimir Código QR
            </button>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPCIÓN PÚBLICA */}
      {mostrarModalInscripcion && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-lg relative shadow-2xl my-8">
            <button
              type="button"
              onClick={() => setMostrarModalInscripcion(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Formulario de Inscripción
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Diligencia tus datos para inscribirte en las agrupaciones musicales de CODART.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Proceso o Agrupación Musical</label>
                <select
                  value={procesoInscripcion}
                  onChange={(e) => setProcesoInscripcion(e.target.value)}
                  className={inputStyle}
                >
                  <option value="Banda Filarmónica">Banda Filarmónica</option>
                  <option value="Banda de Marcha">Banda de Marcha</option>
                  <option value="Prebanda">Prebanda</option>
                  <option value="Proyecto de Música Escolar">Proyecto de Música Escolar</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Nombre completo del participante"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputStyle}
                required
              />
              
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600 font-semibold text-xs"
                >
                  <option value="C.C.">C.C.</option>
                  <option value="T.I.">T.I.</option>
                  <option value="R.C.">R.C.</option>
                  <option value="C.E.">C.E.</option>
                  <option value="P.A.">P.A.</option>
                </select>
                <input
                  type="text"
                  placeholder="Número documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Edad"
                  min="1"
                  max="100"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  className={inputStyle}
                />
                <input
                  type="tel"
                  placeholder="Celular de contacto"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className={inputStyle}
                />
              </div>

              {procesoInscripcion === 'Proyecto de Música Escolar' && (
                <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                    🎓 Grado Escolar (ej. Cuarto A, Quinto B...)
                  </label>
                  <input
                    type="text"
                    placeholder="Ingrese el grado y grupo"
                    value={gradoEscolar}
                    onChange={(e) => setGradoEscolar(e.target.value)}
                    className="w-full bg-white p-2.5 rounded-lg border border-indigo-200 text-slate-800 text-sm outline-none focus:border-indigo-500"
                    required={procesoInscripcion === 'Proyecto de Música Escolar'}
                  />
                </div>
              )}

              {esMenorDeEdad(edad) && (
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                      👨‍👩‍👧 Datos del Acudiente {procesoInscripcion === 'Proyecto de Música Escolar' ? '(Opcional)' : '(Menor de edad)'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        esAcudienteObligatorio(procesoInscripcion, edad)
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {esAcudienteObligatorio(procesoInscripcion, edad) ? 'Requerido' : 'Opcional'}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Nombre completo del acudiente"
                    value={nombreAcudiente}
                    onChange={(e) => setNombreAcudiente(e.target.value)}
                    className="w-full bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 text-xs outline-none focus:border-amber-500"
                    required={esAcudienteObligatorio(procesoInscripcion, edad)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Cédula acudiente"
                      value={documentoAcudiente}
                      onChange={(e) => setDocumentoAcudiente(e.target.value)}
                      className="w-full bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 text-xs outline-none focus:border-amber-500"
                    />
                    <input
                      type="tel"
                      placeholder="Celular acudiente"
                      value={celularAcudiente}
                      onChange={(e) => setCelularAcudiente(e.target.value)}
                      className="w-full bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Instrumento (ej. Clarinete)"
                  value={instrumento}
                  onChange={(e) => setInstrumento(e.target.value)}
                  className={inputStyle}
                  required
                />
                <select
                  value={origenInstrumento}
                  onChange={(e) => setOrigenInstrumento(e.target.value)}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600 font-semibold text-xs cursor-pointer"
                >
                  <option value="Prestado (CODART)">🎵 Prestado (CODART)</option>
                  <option value="Propio">⭐ Instrumento Propio</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Marca y Serie (opcional)"
                value={marcaSerie}
                onChange={(e) => setMarcaSerie(e.target.value)}
                className={inputStyle}
              />
              <select
                value={estadoInstrumento}
                onChange={(e) => setEstadoInstrumento(e.target.value)}
                className={inputStyle}
              >
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition font-bold shadow-sm cursor-pointer text-sm mt-2"
              >
                Enviar Inscripción
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN DE REGISTRO EXITOSO */}
      {registroExitoso && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              ¡Inscripción Recibida!
            </h2>
            <p className="text-sm text-slate-600">
              Tu solicitud de registro ha sido enviada correctamente. El administrador de <strong>CODART</strong> la revisará y habilitará tu registro oficial.
            </p>
            <button
              onClick={() => setRegistroExitoso(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL LOGIN ADMIN */}
      {mostrarModalAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md relative shadow-xl">
            <button
              type="button"
              onClick={() => setMostrarModalAdmin(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Acceso Administrador
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl text-sm transition cursor-pointer shadow-sm"
              >
                Ingresar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA OBRA (SOLO ADMIN) */}
      {mostrarModalNuevaObra && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl">
            <button
              type="button"
              onClick={() => setMostrarModalNuevaObra(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              ➕ Añadir Obra Musical
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Agrupación: <strong className="text-blue-600">{procesoActivo}</strong>
            </p>

            <form onSubmit={crearObra} className="space-y-3">
              <input
                type="text"
                placeholder="Título de la Obra / Marcha / Pieza"
                value={tituloObra}
                onChange={(e) => setTituloObra(e.target.value)}
                className={inputStyle}
                required
              />
              <input
                type="text"
                placeholder="Compositor / Arreglista"
                value={compositorObra}
                onChange={(e) => setCompositorObra(e.target.value)}
                className={inputStyle}
              />
              <input
                type="url"
                placeholder="Enlace a Audio / YouTube de referencia (opcional)"
                value={linkAudioObra}
                onChange={(e) => setLinkAudioObra(e.target.value)}
                className={inputStyle}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer mt-2"
              >
                Guardar Obra Musical
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUBIR PARTICELA PDF (SOLO ADMIN) */}
      {mostrarModalSubirParticela && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md relative shadow-2xl">
            <button
              type="button"
              onClick={() => setMostrarModalSubirParticela(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              📎 Subir Partitura PDF
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Adjunta el archivo PDF correspondiente a un instrumento.
            </p>

            <form onSubmit={subirParticela} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Familia de Instrumentos</label>
                <select
                  value={familiaParticela}
                  onChange={(e) => setFamiliaParticela(e.target.value)}
                  className={inputStyle}
                >
                  <option value="Vientos Madera">Vientos Madera</option>
                  <option value="Vientos Metal">Vientos Metal</option>
                  <option value="Percusión">Percusión</option>
                  <option value="General / Score">General / Score (Director)</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Nombre del Instrumento (ej. Clarinete 1, Trompeta 2)"
                value={instrumentoParticela}
                onChange={(e) => setInstrumentoParticela(e.target.value)}
                className={inputStyle}
                required
              />

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Archivo Partitura (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setArchivoPDF(e.target.files?.[0] || null)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={subiendoPDF}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer mt-2"
              >
                {subiendoPDF ? 'Subiendo archivo PDF...' : 'Subir y Asociar Partitura'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VISTA 1: MÓDULO DE REPOSITORIO DE PARTITURAS */}
      {moduloActivo === 'partituras' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🎼</span> Biblioteca Digital — {procesoActivo}
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona una obra musical para desplegar las partituras e instrumentos disponibles.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar obra o compositor..."
                  value={busquedaPartitura}
                  onChange={(e) => setBusquedaPartitura(e.target.value)}
                  className="w-full bg-slate-50 pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-600"
                />
              </div>

              {sesion && (
                <button
                  onClick={() => setMostrarModalNuevaObra(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
                >
                  ➕ Nueva Obra
                </button>
              )}
            </div>
          </div>

          {/* LISTADO DE OBRAS Y DESGLOSE POR INSTRUMENTOS */}
          {obrasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <p className="text-3xl">🎺</p>
              <p className="font-semibold text-slate-700 text-sm">No hay obras registradas en {procesoActivo}</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {sesion
                  ? 'Haz clic en "Nueva Obra" para subir piezas musicales y sus partituras.'
                  : 'Próximamente el director subirá el repertorio oficial de esta agrupación.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {obrasFiltradas.map((obra) => {
                const particelasDeObra = particelas.filter((p) => p.obra_id === obra.id);
                const estaDesplegada = obraDesplegada === obra.id;

                const maderas = particelasDeObra.filter((p) => p.familia === 'Vientos Madera');
                const metales = particelasDeObra.filter((p) => p.familia === 'Vientos Metal');
                const percusion = particelasDeObra.filter((p) => p.familia === 'Percusión');
                const general = particelasDeObra.filter((p) => p.familia === 'General / Score');

                return (
                  <div
                    key={obra.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition hover:border-blue-300"
                  >
                    {/* ENCABEZADO DE LA OBRA */}
                    <div
                      onClick={() => setObraDesplegada(estaDesplegada ? null : obra.id)}
                      className="p-5 flex justify-between items-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base">{obra.titulo}</h3>
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200">
                            {particelasDeObra.length} partituras
                          </span>
                        </div>
                        {obra.compositor_arreglista && (
                          <p className="text-xs text-slate-500">
                            Compositor / Arr: <strong>{obra.compositor_arreglista}</strong>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {obra.link_audio && (
                          <a
                            href={obra.link_audio}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-lg border border-rose-200 transition flex items-center gap-1"
                          >
                            🎧 Guía Audio
                          </a>
                        )}

                        {sesion && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setObraIdSeleccionada(obra.id);
                              setMostrarModalSubirParticela(true);
                            }}
                            className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                            title="Subir PDF por instrumento"
                          >
                            📎 Subir PDF
                          </button>
                        )}

                        {sesion && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarObra(obra.id);
                            }}
                            className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-2.5 py-1.5 rounded-lg transition"
                            title="Eliminar obra"
                          >
                            🗑️
                          </button>
                        )}

                        <span className="text-slate-400 font-bold text-sm">
                          {estaDesplegada ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* ACORDEÓN DESPLEGABLE CON INSTRUMENTOS */}
                    {estaDesplegada && (
                      <div className="p-5 border-t border-slate-100 bg-white space-y-4 animate-fade-in">
                        {particelasDeObra.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-4">
                            No se han adjuntado partituras a esta obra aún.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* VIENTOS MADERA */}
                            {maderas.length > 0 && (
                              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                  🎷 Vientos Madera
                                </h4>
                                <div className="space-y-1.5">
                                  {maderas.map((p) => (
                                    <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-xs">
                                      <span className="font-semibold text-slate-800">{p.instrumento}</span>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={p.url_pdf}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md hover:bg-blue-100 transition"
                                        >
                                          👁️ Ver PDF
                                        </a>
                                        {sesion && (
                                          <button
                                            onClick={() => eliminarParticela(p.id)}
                                            className="text-rose-600 text-xs hover:text-rose-800 font-bold"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* VIENTOS METAL */}
                            {metales.length > 0 && (
                              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1">
                                  🎺 Vientos Metal
                                </h4>
                                <div className="space-y-1.5">
                                  {metales.map((p) => (
                                    <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-xs">
                                      <span className="font-semibold text-slate-800">{p.instrumento}</span>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={p.url_pdf}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md hover:bg-blue-100 transition"
                                        >
                                          👁️ Ver PDF
                                        </a>
                                        {sesion && (
                                          <button
                                            onClick={() => eliminarParticela(p.id)}
                                            className="text-rose-600 text-xs hover:text-rose-800 font-bold"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* PERCUSIÓN */}
                            {percusion.length > 0 && (
                              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                                <h4 className="text-xs font-bold text-purple-800 flex items-center gap-1">
                                  🥁 Percusión
                                </h4>
                                <div className="space-y-1.5">
                                  {percusion.map((p) => (
                                    <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-xs">
                                      <span className="font-semibold text-slate-800">{p.instrumento}</span>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={p.url_pdf}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md hover:bg-blue-100 transition"
                                        >
                                          👁️ Ver PDF
                                        </a>
                                        {sesion && (
                                          <button
                                            onClick={() => eliminarParticela(p.id)}
                                            className="text-rose-600 text-xs hover:text-rose-800 font-bold"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* GENERAL / SCORE */}
                            {general.length > 0 && (
                              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                                <h4 className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                                  🎼 General / Score Director
                                </h4>
                                <div className="space-y-1.5">
                                  {general.map((p) => (
                                    <div key={p.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-xs">
                                      <span className="font-semibold text-slate-800">{p.instrumento}</span>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={p.url_pdf}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md hover:bg-blue-100 transition"
                                        >
                                          👁️ Ver PDF
                                        </a>
                                        {sesion && (
                                          <button
                                            onClick={() => eliminarParticela(p.id)}
                                            className="text-rose-600 text-xs hover:text-rose-800 font-bold"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: MÓDULO DE INTEGRANTES Y SOLICITUDES */}
      {moduloActivo === 'integrantes' && (
        <div className="space-y-8">
          {sesion && pendientes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                  <span>🔔</span> Solicitudes Pendientes ({pendientes.length})
                </h2>
                <span className="text-xs text-amber-700 font-medium">Inscripciones para revisar</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendientes.map((solicitud) => (
                  <div key={solicitud.id} className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900">{solicitud.nombre}</h3>
                        <p className="text-xs text-blue-600 font-semibold">{solicitud.proceso}</p>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        Pendiente
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p>🎵 Instrumento: <strong>{solicitud.instrumento}</strong> ({solicitud.origen_instrumento || 'Prestado'})</p>
                      <p>📄 Documento: {solicitud.tipo_documento} {solicitud.documento}</p>
                      {solicitud.edad && <p>🎂 Edad: {solicitud.edad} años</p>}
                      {solicitud.grado_escolar && <p>🎓 Grado: {solicitud.grado_escolar}</p>}
                      {solicitud.celular && <p>💬 Celular: {solicitud.celular}</p>}
                      {solicitud.nombre_acudiente && <p>👨‍👩‍👧 Acudiente: {solicitud.nombre_acudiente} ({solicitud.celular_acudiente})</p>}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => cambiarEstadoRegistro(solicitud.id, 'Aprobado')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition cursor-pointer"
                      >
                        ✓ Aprobar Integrante
                      </button>
                      <button
                        onClick={() => cambiarEstadoRegistro(solicitud.id, 'Eliminar')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-2 rounded-lg transition cursor-pointer"
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span>🎵</span> Agrupaciones Musicales CODART
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Pestaña activa: <strong className="text-blue-600">{procesoActivo}</strong>.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
                  <p className="font-bold text-slate-800">📌 Información para Inscripciones:</p>
                  <p>• Para inscribirte en esta u otra agrupación, haz clic en el botón superior <strong>"📝 Inscripción / Registro"</strong>.</p>
                  <p>• Los registros quedan en revisión y serán verificado por la administración de CODART.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setMostrarModalInscripcion(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition cursor-pointer shadow-xs"
                >
                  📝 Realizar Inscripción en {procesoActivo}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Integrantes Oficiales</h2>
                  <p className="text-xs text-slate-500 font-medium">{procesoActivo}</p>
                </div>
                {sesion && (
                  <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-blue-700 text-xs font-bold">
                    Total: {filtrados.length}
                  </span>
                )}
              </div>

              {sesion && (
                <div className="relative mb-4">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar integrante..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full bg-slate-50 pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                  {busqueda && (
                    <button
                      type="button"
                      onClick={() => setBusqueda('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {!sesion ? (
                <div className="text-center py-20 text-slate-400 space-y-3">
                  <p className="text-4xl">🔒</p>
                  <p className="font-semibold text-slate-700">Información Protegida</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Esta lista solo es accesible para el Administrador para proteger los datos personales.
                  </p>
                </div>
              ) : cargando ? (
                <div className="text-center py-10 text-slate-500">Cargando registros...</div>
              ) : filtrados.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  {busqueda ? `No hay resultados para "${busqueda}".` : 'No hay integrantes en este proceso.'}
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filtrados.map((integrante) => (
                    <div key={integrante.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition hover:border-blue-300">
                      {editandoId === integrante.id ? (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-blue-600 mb-1">Editando información:</p>
                          <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className={editInputStyle} placeholder="Nombre completo" />
                          <div className="grid grid-cols-3 gap-2">
                            <select value={editTipoDocumento} onChange={(e) => setEditTipoDocumento(e.target.value)} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 text-xs outline-none font-semibold">
                              <option value="C.C.">C.C.</option>
                              <option value="T.I.">T.I.</option>
                              <option value="R.C.">R.C.</option>
                              <option value="C.E.">C.E.</option>
                              <option value="P.A.">P.A.</option>
                            </select>
                            <input type="text" value={editDocumento} onChange={(e) => setEditDocumento(e.target.value)} className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 text-xs outline-none" placeholder="Documento" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" value={editEdad} onChange={(e) => setEditEdad(e.target.value)} className={editInputStyle} placeholder="Edad" />
                            <input type="tel" value={editCelular} onChange={(e) => setEditCelular(e.target.value)} className={editInputStyle} placeholder="Celular" />
                          </div>
                          {procesoActivo === 'Proyecto de Música Escolar' && (
                            <input type="text" value={editGradoEscolar} onChange={(e) => setEditGradoEscolar(e.target.value)} className={editInputStyle} placeholder="Grado escolar" />
                          )}
                          {esMenorDeEdad(editEdad) && (
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2 my-2">
                              <p className="text-xs font-bold text-amber-800">👨‍👩‍👧 Datos del Acudiente:</p>
                              <input type="text" value={editNombreAcudiente} onChange={(e) => setEditNombreAcudiente(e.target.value)} className="w-full bg-white p-2 rounded border border-amber-200 text-xs outline-none" placeholder="Nombre acudiente" />
                              <div className="grid grid-cols-2 gap-2">
                                <input type="text" value={editDocumentoAcudiente} onChange={(e) => setEditDocumentoAcudiente(e.target.value)} className="w-full bg-white p-2 rounded border border-amber-200 text-xs outline-none" placeholder="Cédula acudiente" />
                                <input type="tel" value={editCelularAcudiente} onChange={(e) => setEditCelularAcudiente(e.target.value)} className="w-full bg-white p-2 rounded border border-amber-200 text-xs outline-none" placeholder="Celular acudiente" />
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={editInstrumento} onChange={(e) => setEditInstrumento(e.target.value)} className={editInputStyle} placeholder="Instrumento" />
                            <select value={editOrigenInstrumento} onChange={(e) => setEditOrigenInstrumento(e.target.value)} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 text-xs outline-none font-semibold">
                              <option value="Prestado (CODART)">Prestado (CODART)</option>
                              <option value="Propio">Instrumento Propio</option>
                            </select>
                          </div>
                          <input type="text" value={editMarcaSerie} onChange={(e) => setEditMarcaSerie(e.target.value)} className={editInputStyle} placeholder="Marca y Serie" />
                          <select value={editEstadoInstrumento} onChange={(e) => setEditEstadoInstrumento(e.target.value)} className={editInputStyle}>
                            <option value="Excelente">Excelente</option>
                            <option value="Bueno">Bueno</option>
                            <option value="Regular">Regular</option>
                            <option value="Mantenimiento">Mantenimiento</option>
                          </select>
                          <div className="flex gap-2 pt-2">
                            <button onClick={() => guardarEdicion(integrante.id)} className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">💾 Guardar</button>
                            <button onClick={() => setEditandoId(null)} className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900">{integrante.nombre}</h3>
                              {integrante.edad && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">{integrante.edad} años</span>}
                            </div>
                            {integrante.proceso === 'Proyecto de Música Escolar' && integrante.grado_escolar && (
                              <p className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block border border-indigo-200">🎓 Grado: {integrante.grado_escolar}</p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm text-blue-600 font-semibold">🎵 {integrante.instrumento}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${integrante.origen_instrumento === 'Propio' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{integrante.origen_instrumento || 'Prestado (CODART)'}</span>
                            </div>
                            {integrante.documento && <p className="text-xs text-slate-500">Documento: {integrante.tipo_documento || 'C.C.'} {integrante.documento}</p>}
                            {integrante.celular && (
                              <p className="text-xs">
                                <a href={`https://wa.me/57${integrante.celular.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium">💬 Celular: {integrante.celular}</a>
                              </p>
                            )}
                            {integrante.edad < 18 && integrante.nombre_acudiente && (
                              <div className="mt-2 bg-amber-50/80 border border-amber-200 p-2.5 rounded-lg text-xs space-y-0.5">
                                <p className="font-bold text-amber-900">👨‍👩‍👧 Acudiente: {integrante.nombre_acudiente}</p>
                                {integrante.documento_acudiente && <p className="text-slate-600 text-[11px]">Cédula: {integrante.documento_acudiente}</p>}
                                {integrante.celular_acudiente && (
                                  <p className="text-[11px]">
                                    <a href={`https://wa.me/57${integrante.celular_acudiente.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline">💬 Celular Acudiente: {integrante.celular_acudiente}</a>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 items-end justify-start">
                            <button onClick={() => iniciarEdicion(integrante)} className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg">✏️ Editar</button>
                            <button onClick={() => eliminarIntegrante(integrante.id)} className="bg-rose-50 text-rose-600 text-xs font-bold px-2.5 py-1.5 rounded-lg">🗑️</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALENDARIO GENERAL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="text-lg font-bold text-slate-900">Calendario de Eventos y Ensayos</h2>
          </div>
          {fechaCalendario && (
            <div className="flex items-center gap-2">
              <button onClick={() => cambiarMes(-1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">◀</button>
              <span className="text-sm font-bold text-blue-600 min-w-[130px] text-center">
                {nombresMeses[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
              </span>
              <button onClick={() => cambiarMes(1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer">▶</button>
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
                  esHoy
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-300'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {dia}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Día actual
          </span>
          <button onClick={() => setFechaCalendario(new Date())} className="text-blue-600 hover:underline font-semibold cursor-pointer">
            Ir a hoy
          </button>
        </div>
      </div>
    </main>
  );
}