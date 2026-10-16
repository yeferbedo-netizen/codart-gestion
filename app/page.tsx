'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const [procesoActivo, setProcesoActivo] = useState('Banda Filarmónica');
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estado para el Buscador
  const [busqueda, setBusqueda] = useState('');

  // Autenticación de Administrador
  const [sesion, setSesion] = useState<any>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Formulario (Creación)
  const [nombre, setNombre] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('C.C.');
  const [documento, setDocumento] = useState('');
  const [edad, setEdad] = useState<string>('');
  const [celular, setCelular] = useState('');
  const [instrumento, setInstrumento] = useState('');
  const [origenInstrumento, setOrigenInstrumento] = useState('Prestado (CODART)');
  const [marcaSerie, setMarcaSerie] = useState('');
  const [estadoInstrumento, setEstadoInstrumento] = useState('Excelente');

  // Datos Acudiente (Creación)
  const [nombreAcudiente, setNombreAcudiente] = useState('');
  const [documentoAcudiente, setDocumentoAcudiente] = useState('');
  const [celularAcudiente, setCelularAcudiente] = useState('');

  // ESTADOS PARA EDICIÓN
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editTipoDocumento, setEditTipoDocumento] = useState('C.C.');
  const [editDocumento, setEditDocumento] = useState('');
  const [editEdad, setEditEdad] = useState<string>('');
  const [editCelular, setEditCelular] = useState('');
  const [editInstrumento, setEditInstrumento] = useState('');
  const [editOrigenInstrumento, setEditOrigenInstrumento] = useState('Prestado (CODART)');
  const [editMarcaSerie, setEditMarcaSerie] = useState('');
  const [editEstadoInstrumento, setEditEstadoInstrumento] = useState('Excelente');
  const [editNombreAcudiente, setEditNombreAcudiente] = useState('');
  const [editDocumentoAcudiente, setEditDocumentoAcudiente] = useState('');
  const [editCelularAcudiente, setEditCelularAcudiente] = useState('');

  // LÓGICA DEL CALENDARIO
  const hoy = new Date();
  const [fechaCalendario, setFechaCalendario] = useState(new Date());

  useEffect(() => {
    cargarDatos();
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

    if (error) {
      console.error('Error cargando datos:', error.message);
    }
    if (data) {
      setIntegrantes(data);
    }
    setCargando(false);
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
      setMostrarModal(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Error al cerrar sesión: ' + error.message);
    }
  };

  const esMenorDeEdad = (valorEdad: string | number) => {
    const num = Number(valorEdad);
    return !isNaN(num) && num > 0 && num < 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sesion) {
      alert('Debes iniciar sesión como Administrador para registrar información en la nube.');
      return;
    }
    if (!nombre.trim() || !instrumento.trim()) {
      alert('El nombre y el instrumento son obligatorios.');
      return;
    }

    const numEdad = edad ? parseInt(edad, 10) : null;
    const esMenor = numEdad !== null && numEdad < 18;

    const { data, error } = await supabase
      .from('integrantes')
      .insert([
        {
          nombre: nombre.trim(),
          tipo_documento: tipoDocumento,
          documento: documento.trim(),
          edad: numEdad,
          celular: celular.trim(),
          proceso: procesoActivo,
          instrumento: instrumento.trim(),
          origen_instrumento: origenInstrumento,
          marca_serie: marcaSerie.trim() || 'No especificada',
          estado_instrumento: estadoInstrumento,
          nombre_acudiente: esMenor ? nombreAcudiente.trim() : null,
          documento_acudiente: esMenor ? documentoAcudiente.trim() : null,
          celular_acudiente: esMenor ? celularAcudiente.trim() : null,
        },
      ])
      .select();

    if (error) {
      alert('Error al guardar en Supabase: ' + error.message);
      return;
    }

    if (data) {
      cargarDatos();
      setNombre('');
      setTipoDocumento('C.C.');
      setDocumento('');
      setEdad('');
      setCelular('');
      setInstrumento('');
      setOrigenInstrumento('Prestado (CODART)');
      setMarcaSerie('');
      setEstadoInstrumento('Excelente');
      setNombreAcudiente('');
      setDocumentoAcudiente('');
      setCelularAcudiente('');
    }
  };

  const iniciarEdicion = (integrante: any) => {
    setEditandoId(integrante.id);
    setEditNombre(integrante.nombre || '');
    setEditTipoDocumento(integrante.tipo_documento || 'C.C.');
    setEditDocumento(integrante.documento || '');
    setEditEdad(integrante.edad !== null && integrante.edad !== undefined ? String(integrante.edad) : '');
    setEditCelular(integrante.celular || '');
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
    const esMenor = numEdad !== null && numEdad < 18;

    const { error } = await supabase
      .from('integrantes')
      .update({
        nombre: editNombre.trim(),
        tipo_documento: editTipoDocumento,
        documento: editDocumento.trim(),
        edad: numEdad,
        celular: editCelular.trim(),
        instrumento: editInstrumento.trim(),
        origen_instrumento: editOrigenInstrumento,
        marca_serie: editMarcaSerie.trim(),
        estado_instrumento: editEstadoInstrumento,
        nombre_acudiente: esMenor ? editNombreAcudiente.trim() : null,
        documento_acudiente: esMenor ? editDocumentoAcudiente.trim() : null,
        celular_acudiente: esMenor ? editCelularAcudiente.trim() : null,
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
    if (!sesion) {
      alert('Debes ser Administrador para eliminar registros.');
      return;
    }

    const confirmar = window.confirm('¿Seguro que deseas eliminar este integrante?');
    if (!confirmar) return;

    const { error } = await supabase.from('integrantes').delete().eq('id', id);

    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }

    setIntegrantes(integrantes.filter((integrante) => integrante.id !== id));
  };

  const filtrados = integrantes.filter((integrante) => {
    const coincideProceso = integrante.proceso === procesoActivo;
    const termino = busqueda.toLowerCase().trim();

    if (!termino) return coincideProceso;

    const coincideTexto =
      (integrante.nombre && integrante.nombre.toLowerCase().includes(termino)) ||
      (integrante.documento && integrante.documento.toLowerCase().includes(termino)) ||
      (integrante.instrumento && integrante.instrumento.toLowerCase().includes(termino)) ||
      (integrante.celular && integrante.celular.toLowerCase().includes(termino)) ||
      (integrante.marca_serie && integrante.marca_serie.toLowerCase().includes(termino)) ||
      (integrante.nombre_acudiente && integrante.nombre_acudiente.toLowerCase().includes(termino)) ||
      (integrante.documento_acudiente && integrante.documento_acudiente.toLowerCase().includes(termino));

    return coincideProceso && coincideTexto;
  });

  // HELPER PARA CONSTRUIR EL CALENDARIO
  const obtenerDiasDelMes = (fecha: Date) => {
    const anio = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(anio, mes, 1).getDay();
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    const inicioAjustado = primerDia === 0 ? 6 : primerDia - 1;

    const dias = [];
    for (let i = 0; i < inicioAjustado; i++) {
      dias.push(null);
    }
    for (let d = 1; d <= totalDias; d++) {
      dias.push(d);
    }
    return dias;
  };

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const cambiarMes = (delta: number) => {
    const nueva = new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + delta, 1);
    setFechaCalendario(nueva);
  };

  const inputStyle =
    'w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition';

  const editInputStyle =
    'w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 text-xs outline-none focus:border-blue-600 mb-2';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-8">
      {/* ENCABEZADO */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.jpg" 
            alt="Logo CODART" 
            className="w-24 h-24 object-contain rounded-xl"
          />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              CODART
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Gestión de Integrantes e Instrumentos
            </p>
          </div>
        </div>
        <div>
          {sesion ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 font-medium">
                Admin: {sesion.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer flex items-center gap-2"
            >
              🔐 Iniciar Sesión Admin
            </button>
          )}
        </div>
      </div>

      {/* MODAL LOGIN */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md relative shadow-xl">
            <button
              type="button"
              onClick={() => setMostrarModal(false)}
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

      {/* PESTAÑAS */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {[
          'Banda Filarmónica',
          'Banda de Marcha',
          'Prebanda',
          'Proyecto de Música Escolar',
        ].map((p) => (
          <button
            key={p}
            onClick={() => setProcesoActivo(p)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer shadow-xs ${
              procesoActivo === p
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* FORMULARIO */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>📝</span> Registrar en {procesoActivo}
          </h2>

          {!sesion && (
            <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 mb-4 font-medium">
              ⚠️ Inicia sesión como administrador para habilitar el guardado en la nube.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputStyle}
              required
            />
            
            <div className="grid grid-cols-3 gap-2">
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600 font-semibold"
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
                className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600"
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
                placeholder="Celular"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className={inputStyle}
              />
            </div>

            {/* SECCIÓN DESPLEGABLE ACUDIENTE SI ES MENOR DE EDAD */}
            {esMenorDeEdad(edad) && (
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    👨‍👩‍👧 Datos del Acudiente (Menor de edad)
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                    Requerido
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Nombre completo del acudiente"
                  value={nombreAcudiente}
                  onChange={(e) => setNombreAcudiente(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-lg border border-amber-200 text-slate-800 text-xs outline-none focus:border-amber-500"
                  required={esMenorDeEdad(edad)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Cédula / Documento"
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

            {/* CAMPOS DE INSTRUMENTO Y SU TIPO (PRESTADO / PROPIO) */}
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
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-blue-600 font-semibold text-sm"
              >
                <option value="Prestado (CODART)">🎵 Prestado (CODART)</option>
                <option value="Propio">⭐ Instrumento Propio</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Marca y Serie"
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
              disabled={!sesion}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3 rounded-xl transition font-bold shadow-sm cursor-pointer disabled:cursor-not-allowed"
            >
              Registrar Integrante
            </button>
          </form>
        </div>

        {/* LISTA DE INTEGRANTES */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Integrantes</h2>
              <p className="text-xs text-slate-500 font-medium">{procesoActivo}</p>
            </div>
            {sesion && (
              <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-blue-700 text-xs font-bold">
                Total: {filtrados.length}
              </span>
            )}
          </div>

          {/* BUSCADOR */}
          {sesion && (
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, acudiente, documento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-slate-50 pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {!sesion ? (
            <div className="text-center py-20 text-slate-400 space-y-3">
              <p className="text-3xl">🔒</p>
              <p className="font-semibold text-slate-700">Información Protegida</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Inicia sesión como administrador para ver y gestionar la lista de integrantes de este proceso.
              </p>
            </div>
          ) : cargando ? (
            <div className="text-center py-10 text-slate-500">Cargando registros...</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {busqueda
                ? `No se encontraron coincidencias para "${busqueda}".`
                : 'No hay integrantes registrados en este proceso.'}
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filtrados.map((integrante) => (
                <div
                  key={integrante.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition hover:border-blue-300"
                >
                  {editandoId === integrante.id ? (
                    /* MODO EDICIÓN */
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-blue-600 mb-1">
                        Editando información:
                      </p>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className={editInputStyle}
                        placeholder="Nombre completo"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={editTipoDocumento}
                          onChange={(e) => setEditTipoDocumento(e.target.value)}
                          className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 text-xs outline-none focus:border-blue-600 mb-2 font-semibold"
                        >
                          <option value="C.C.">C.C.</option>
                          <option value="T.I.">T.I.</option>
                          <option value="R.C.">R.C.</option>
                          <option value="C.E.">C.E.</option>
                          <option value="P.A.">P.A.</option>
                        </select>
                        <input
                          type="text"
                          value={editDocumento}
                          onChange={(e) => setEditDocumento(e.target.value)}
                          className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 text-xs outline-none focus:border-blue-600 mb-2"
                          placeholder="Número de documento"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={editEdad}
                          onChange={(e) => setEditEdad(e.target.value)}
                          className={editInputStyle}
                          placeholder="Edad"
                        />
                        <input
                          type="tel"
                          value={editCelular}
                          onChange={(e) => setEditCelular(e.target.value)}
                          className={editInputStyle}
                          placeholder="Celular"
                        />
                      </div>

                      {/* EDICIÓN DE ACUDIENTE SI ES MENOR DE EDAD */}
                      {esMenorDeEdad(editEdad) && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2 my-2">
                          <p className="text-xs font-bold text-amber-800">
                            👨‍👩‍👧 Datos del Acudiente:
                          </p>
                          <input
                            type="text"
                            value={editNombreAcudiente}
                            onChange={(e) => setEditNombreAcudiente(e.target.value)}
                            className="w-full bg-white p-2 rounded border border-amber-200 text-xs outline-none"
                            placeholder="Nombre acudiente"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editDocumentoAcudiente}
                              onChange={(e) => setEditDocumentoAcudiente(e.target.value)}
                              className="w-full bg-white p-2 rounded border border-amber-200 text-xs outline-none"
                              placeholder="Cédula acudiente"
                            />
                            <input
                              type="tel"
                              value={editCelularAcudiente}
                              onChange={(e) => setEditCelularAcudiente(e.target.value)}
                              className="w-full bg-white p-2 rounded border border-amber-200 text-xs outline-none"
                              placeholder="Celular acudiente"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editInstrumento}
                          onChange={(e) => setEditInstrumento(e.target.value)}
                          className={editInputStyle}
                          placeholder="Instrumento"
                        />
                        <select
                          value={editOrigenInstrumento}
                          onChange={(e) => setEditOrigenInstrumento(e.target.value)}
                          className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 text-xs outline-none focus:border-blue-600 mb-2 font-semibold"
                        >
                          <option value="Prestado (CODART)">Prestado (CODART)</option>
                          <option value="Propio">Instrumento Propio</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        value={editMarcaSerie}
                        onChange={(e) => setEditMarcaSerie(e.target.value)}
                        className={editInputStyle}
                        placeholder="Marca y Serie"
                      />
                      <select
                        value={editEstadoInstrumento}
                        onChange={(e) => setEditEstadoInstrumento(e.target.value)}
                        className={editInputStyle}
                      >
                        <option value="Excelente">Excelente</option>
                        <option value="Bueno">Bueno</option>
                        <option value="Regular">Regular</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                      </select>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => guardarEdicion(integrante.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          💾 Guardar
                        </button>
                        <button
                          onClick={() => setEditandoId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* MODO VISTA NORMAL */
                    <div className="flex justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900">
                            {integrante.nombre}
                          </h3>
                          {integrante.edad && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {integrante.edad} años
                            </span>
                          )}
                          {integrante.edad && integrante.edad < 18 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              Menor de edad
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-blue-600 font-semibold">
                            🎵 {integrante.instrumento}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              integrante.origen_instrumento === 'Propio'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {integrante.origen_instrumento || 'Prestado (CODART)'}
                          </span>
                        </div>

                        {integrante.documento && (
                          <p className="text-xs text-slate-500">
                            Documento: {integrante.tipo_documento || 'C.C.'}{' '}
                            {integrante.documento}
                          </p>
                        )}

                        {integrante.celular && (
                          <p className="text-xs">
                            <a
                              href={`https://wa.me/57${integrante.celular.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline inline-flex items-center gap-1 font-medium"
                              title="Abrir WhatsApp"
                            >
                              💬 Celular: {integrante.celular}
                            </a>
                          </p>
                        )}

                        {/* TARJETA VISUAL DE ACUDIENTE */}
                        {integrante.edad < 18 && integrante.nombre_acudiente && (
                          <div className="mt-2 bg-amber-50/80 border border-amber-200 p-2.5 rounded-lg text-xs space-y-0.5">
                            <p className="font-bold text-amber-900 flex items-center gap-1">
                              👨‍👩‍👧 Acudiente: {integrante.nombre_acudiente}
                            </p>
                            {integrante.documento_acudiente && (
                              <p className="text-slate-600 text-[11px]">
                                Cédula: {integrante.documento_acudiente}
                              </p>
                            )}
                            {integrante.celular_acudiente && (
                              <p className="text-[11px]">
                                <a
                                  href={`https://wa.me/57${integrante.celular_acudiente.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                  💬 Celular Acudiente: {integrante.celular_acudiente}
                                </a>
                              </p>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-slate-500">
                          Marca / Serie: {integrante.marca_serie || 'No especificada'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Estado: <span className="font-semibold text-slate-700">{integrante.estado_instrumento || 'Excelente'}</span>
                        </p>
                      </div>

                      {sesion && (
                        <div className="flex flex-col gap-2 items-end justify-start">
                          <button
                            onClick={() => iniciarEdicion(integrante)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            title="Editar"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => eliminarIntegrante(integrante.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN DE CALENDARIO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="text-lg font-bold text-slate-900">
              Calendario de Eventos y Ensayos
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Mes anterior"
            >
              ◀
            </button>
            <span className="text-sm font-bold text-blue-600 min-w-[130px] text-center">
              {nombresMeses[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
            </span>
            <button
              onClick={() => cambiarMes(1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              title="Mes siguiente"
            >
              ▶
            </button>
          </div>
        </div>

        {/* ENCABEZADOS DE DÍAS */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-2">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>

        {/* GRILLA DE DÍAS */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {obtenerDiasDelMes(fechaCalendario).map((dia, index) => {
            if (!dia) {
              return <div key={`empty-${index}`} className="h-10"></div>;
            }

            const esHoy =
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
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            Día actual resaltado
          </span>
          <button
            onClick={() => setFechaCalendario(new Date())}
            className="text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            Ir a hoy
          </button>
        </div>
      </div>
    </main>
  );
}